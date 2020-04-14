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
    folder_id: note.folder_id
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
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');

        const { name, content, folder_id } = req.body
        const newNote = { name, content, folder_id }
        console.log('NEW NOTE', newNote)

        for(const [key, value] of Object.entries(newNote))
            if (value == null)
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })

        NotesService.insertNote(knexInstance, newNote)
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })

notesRouter
    .route('/:noteId')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')

        NotesService.getById(knexInstance, req.params.noteId)
            .then(note => {
                if(!note) {
                    return res.status(404).json({
                        error: {message: `Note doesn't exist`}
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    }) 
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')

        const { name, content } = req.body
        const noteToUpdate = { name, content }
        const noteId = res.note.id

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
            if(numberOfValues === 0) {
                return res.status(400).json({
                    error: {
                        message: `Request body must include either name or content.`
                    }
                })
            }

        noteToUpdate.modified = new Date()

        NotesService.updateNote(knexInstance, noteId, noteToUpdate)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')

        const noteId = res.note.id

        NotesService.deleteNote(knexInstance, noteId)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
module.exports = notesRouter;