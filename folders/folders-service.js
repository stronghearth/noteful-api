const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('folders');
    },
    insertFolder(knex, newFolder) {
        return knex 
                .insert(newFolder)
                .into('folders')
                .returning('*')
                .then(rows => {
                    return rows[0];
                })
    },
    getById(knex, id) {
        return knex.from('folders').select('*').where('id', id).first()
    },
    updateFolder(knex, id, folderToUpdate) {
        return knex
                .from('folders')
                .where({ id })
                .update(folderToUpdate)
    },
    deleteFolder(knex, id) {
        return knex
                .from('folders')
                .where({ id })
                .delete()
    }
};

module.exports = FoldersService;