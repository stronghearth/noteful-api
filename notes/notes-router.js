const express = require('express');
const NotesService = require('./notes-service');
const xss = require('xss');
const path = require('path');
const jsonParser = express.json();
const notesRouter = express.Router();

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    content: xss(note.content),
    folderid: note.folderid
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');

        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
module.exports = notesRouter;