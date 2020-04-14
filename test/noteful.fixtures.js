function makeFoldersArray() {
    return [
        {
            id: 1,
            name: "Test Folder 1"
        },
        {
            id: 2,
            name: "Test Folder 2"    
        },
        {
            id: 3,
            name: "Test Folder 3"
        }
    ]
};

function makeNotesArray() {
    return [
        {
            id: 1,
            name: "Test Note 1",
            modified: "1919-12-22T16:28:32.615Z",
            content: "this is the first test note",
            folder_id: 1
        },
        {
            id: 2,
            name: "Test Note 2",
            modified: "2029-01-22T16:28:32.615Z",
            content: "this is the second test note",
            folder_id: 2
        },
        {
            id: 3,
            name: "Test Note 3",
            modified: "2029-01-22T16:28:32.615Z",
            content: "this is the third test note",
            folder_id: 3
        },
    ]
}

module.exports = {
    makeFoldersArray,
    makeNotesArray
}