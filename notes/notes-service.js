const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('notes')
    },
    
    getById(knex, noteId) {
        return knex
                .from('notes')
                .select('*')
                .where('id', noteId)
                .first()
    },

    getNotesByFolder(knex, folderId) {
        return knex
                .from(notes)
                .select('*')
                .where('folderId', folderId)
    },


    insertNote(knex, newNote) {
        return knex 
                .insert(newNote)
                .into('notes')
                .returning('*')
                .then(rows => {
                    return rows[0];
                });
    },

    updateNote(knex, id, noteToUpdate){
        return knex 
                .from('notes')
                .where({ id })
                .update(noteToUpdate)
    },

    deleteNote(knex, id) {
        return knex('notes')
        .where({ id })
        .delete()
    }
}

module.exports = NotesService;