const { expect } = require('chai');
const knex = require('knex')
const app = require('../src/app');
const {makeFoldersArray, makeNotesArray} = require('./noteful.fixtures')

describe('Noteful Note Endpoints', () => {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db);
    });

    after('disconnect from the db', () => db.destroy());

    before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

    afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

    describe('GET /api/notes', () => {
        context('given there are no notes', () => {
            it('responds with a 200 with an empty list of notes', () => {
                return supertest(app)
                        .get('/api/notes')
                        .expect(200, [])
            })
        })
        context('given there are notes', () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach('insert folders', () => {
                return db
                        .into('folders')
                        .insert(testFolders)
            })

            beforeEach('insert notes', () => {
                return db
                        .into('notes')
                        .insert(testNotes)
            })

            it('GET /api/notes responds with 200 and all of the notes', () => {
                return supertest(app)
                        .get('/api/notes')
                        .expect(200, testNotes)
            })
        })
    })

    describe('POST /api/notes', () => {
        this.retries

        const testFolders = makeFoldersArray()

        beforeEach('insert folders', () => {
            return db
                    .into('folders')
                    .insert(testFolders)
        })


        it(`creates a note, responding with 201 and new note`, () => {
            const newNote = {
                name: 'Test New Note',
                content: 'I am a new note!',
                folderid: testFolders[0].id
            }
            return supertest(app)
                    .post(`/api/notes`)
                    .send(newNote)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.name).to.eql(newNote.name)
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('modified')
                        expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                    })
                    .then(postRes => {
                        supertest(app)
                            .get(`/api/notes/${postRes.body.id}`)
                            .expect(postRes.body)
                    })
        })

        const requiredFields = ['name', 'content', 'folderid']

        requiredFields.forEach(field => {
            const newNote = {
                name: 'Note Name',
                content: 'I am a note',
                folderid: testFolders[0].id
            }
        

        it(`responds with 400 error when ${field} is missing`, () => {
            delete newNote[field]
            return supertest(app)
                    .post(`/api/notes`)
                    .send(newNote)
                    .expect(400, {error: {message: `Missing '${field}' in request body`}})
        })

        })
    })

    describe(`GET /api/notes/:noteId`, () => {
        context('given there are no notes', () => {
            it('responds with 404', () => {
                const noteId = 123456;
                return supertest(app)
                        .get(`/api/notes/${noteId}`)
                        .expect(404, {error: {message: `Note doesn't exist`}})
            })
        })
        context('given there are notes', () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray();

            beforeEach('insert folders', () => {
                return db
                        .into('folders')
                        .insert(testFolders)
            })

            beforeEach('insert notes', () => {
                return db   
                        .into('notes')
                        .insert(testNotes)
            })

            it(`GET /api/notes/:noteId returns 200 response with expected note`, () => {
                const noteId = 2;
                expectedNote = testNotes[noteId - 1];
                return supertest(app)
                        .get(`/api/notes/${noteId}`)
                        .expect(200, expectedNote)
            })
        })
    })
    describe.only(`PATCH /api/notes/:noteId`, () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray()

        beforeEach('insert folders', () => {
            return db
                    .into('folders')
                    .insert(testFolders)
        })

        beforeEach('insert notes', () => {
            return db
                    .into('notes')
                    .insert(testNotes)
        })

        it('responds with 204 and updates note', () => {
            const noteId = 2
            const updatedNote = {
                name: 'I am anew',
                content: 'My content has been remodeled',
            }
            const expectedNote = {
                ...testNotes[noteId - 1],
                ...updatedNote
            }
            return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .send(updatedNote)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/notes/${noteId}`)
                            .expect(expectedNote)
            })
        })

        it('responds with 400 when no request body is empty', () => {
            const noteId = 2
            return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .send({notARealField : 'hello'})
                    .expect(400, {error: {message: `Request body must include either name or content.`}})
        })
    })
})