const express = require('express');
const FoldersService = require('./folders-service');
const xss = require('xss');
const path = require('path');
const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');

        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');

        const { name } = req.body
        const newFolder = { name }

        if(!name) {
            return res.status(400).json({
                error: { message: `Folder name is missing`}
            })
        }
        
        FoldersService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folderId')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');

        FoldersService.getById(knexInstance, req.params.folderId)
            .then(folder => {
                if(!folder) {
                    return res.status(404).json({
                        error: {message: `Folder doesn't exist`}
                    })
                }
            res.folder = folder
            next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeFolder(res.folder))
    })

module.exports = foldersRouter;