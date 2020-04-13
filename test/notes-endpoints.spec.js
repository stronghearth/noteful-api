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

    describe.only('GET /api/notes', () => {
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
})