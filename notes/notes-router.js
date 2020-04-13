const express = require('express');
const NotesService = require('./notes-service');
const xss = require('xss');
const path = require('path');
const jsonParser = express.json();
const notesRouter = express.Router();

module.exports = notesRouter;