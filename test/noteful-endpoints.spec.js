const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeNotesArray} = require('./noteful.fixtures');

describe.only('Noteful Endpoints', () => {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    after('disconnect from the db', () => db.destroy());

    before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

    afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

    describe('GET /api/folders', () => {
        context('given there are no folders', () => {
            it('responds with a 200 with an empty list', () => {
                return supertest(app)
                        .get('/api/folders')
                        .expect(200, [])
            })
        })
        context('given there are folders', () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders', () => {
                return db
                        .into('folders')
                        .insert(testFolders)
            })

            it('GET /api/folders responds with 200 and all of the folders', () => {
                return supertest(app)
                        .get('/api/folders')
                        .expect(200, testFolders)
            })
        })
    })
    describe(`POST /api/folders`, () => {
        this.retries
        it(`creates a folder, responding with 201 and the new folder`, () => {
           const newFolder = {
               name: 'Test new folder'
           }
           return supertest(app)
                    .post(`/api/folders`)
                    .send(newFolder)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.name).to.eql(newFolder.name)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                    })
                    .then(postRes => {
                        supertest(app)
                            .get(`/api/folders/${postRes.body.id}`)
                            .expect(postRes.body)
                    })
        })
        it(`responds with 400 error when name of folder is missing`, () => {
            return supertest(app)
                    .post(`/api/folders`)
                    .send({ someRadomField: 'Hey hey folder'})
                    .expect(400, {
                        error: { message: `Folder name is missing`}
                    })
        })
    })
    describe('GET /api/folders/:folderId', () => {
        context('given there are no folders', () => {
            it('responds with a 404', () => { 
            const folderId = 123456;
            return supertest(app)
                        .get(`/api/folders/${folderId}`)
                        .expect(404, {error: {message: `Folder doesn't exist`}})
            })
        });
        context('given there are folders', () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders', () => {
                return db
                        .into('folders')
                        .insert(testFolders)
            })
            it('GET /api/folders/:folderId returns a 200 response with expected folder', () => {
                const folderId = 2;
                const expectedFolder = testFolders[folderId - 1];

                return supertest(app)
                        .get(`/api/folders/${folderId}`)
                        .expect(200, expectedFolder)
            })
        })
    });
})
