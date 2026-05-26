import { questioning } from "./DatabaseConnection.js";

//Returns a new unused id for notes based on provided array
//A = Array of note JSON's
function GetNewNoteID(A) {

    if (A.length == 0) {
        console.log("Warning: Empty array supplied for creating new note id");
        return 0;
    }

    let usedIDs = [];
    let newID = 0;

    for (let i = 0; i < A.length; i++) {
        usedIDs.push(A[i].id);
    }

    while (true) {
        if (usedIDs.includes(newID)) {
            newID++;
        }
        else {
            break;
        }
    }

    return newID;
}

//Returns note matching id from provided AvailableNotes varaible
//J = Available notes JSON
//I = Note id
function GetNoteInformation(J, I) {

    let noteArray = J.public.concat(J.private);

    for (let k = 0; k < noteArray.length; k++) {
        if (noteArray[k].id == I) {
            return noteArray[k];
        }
    }

    console.log("Error: Failed to find intended note");
    return null;
}

//Gets notes from database and returns them in a JSON format
async function GetNotes() {

    let notes_raw = JSON.parse(await questioning("SELECT ID, Mode, `Group`, Title, Message FROM notes", []));
    let notes_json = {
        public: [],
        private: []
    };

    for (let i = 0; i < notes_raw.length; i++) {

        let notes_temp = {
            id: notes_raw[i].ID,
            mode: notes_raw[i].Mode,
            title: notes_raw[i].Title,
            group: notes_raw[i].Group,
            message: notes_raw[i].Message
        };

        if (notes_raw[i].Mode == "Public") {
            notes_json.public.push(notes_temp);
        }
        else if (notes_raw[i].Mode == "Private") {
            notes_json.private.push(notes_temp);
        }
    }

    return notes_json;
}

//Adds new note to database
//N = Note information
async function AddNote(N) {
    await questioning(
        "INSERT INTO notes (ID, Mode, `Group`, Title, Message) VALUES (?, ?, ?, ?, ?)",
        [N.id, N.mode, N.group, N.title, N.message]
    );
}

//Updates a note's information
//N = Note information
async function UpdateNote(N) {
    await questioning(
        "UPDATE notes SET Mode = ?, `Group` = ?, Title = ?, Message = ? WHERE ID = ?",
        [N.mode, N.group, N.title, N.message, N.id]
    );
}

//Deletes a note from the database
//I = ID of note to delete
async function DeleteNote(I) {
    await questioning("DELETE FROM notes WHERE ID = ?", [Number(I)]);
}

//Gets the ids of recent general notes from database
async function GetRecentGeneralNotes() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['Recent_General_Notes']))[0].Data.ids;
}

//Updates backend copy of recent general note ids
//A = Array of ids
async function UpdateRecentGeneralNotes(A) {
    if (A) {
        let J = {
            ids: A
        }
        await questioning(
            "UPDATE ref SET Data = ? WHERE Basis = ?",
            [JSON.stringify(J), 'Recent_General_Notes']
        );
    }
}

//Gets the ids of bookmarked general notes from database
async function GetBookmarkGeneralNotes() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['Bookmark_General_Notes']))[0].Data.ids;
}

//Updates backend copy of bookmarked general note ids
//A = Array of ids
async function UpdateBookmarkGeneralNotes(A) {
    if (A) {
        let J = {
            ids: A
        }
        await questioning(
            "UPDATE ref SET Data = ? WHERE Basis = ?",
            [JSON.stringify(J), 'Bookmark_General_Notes']
        );
    }
}

export {
    GetNewNoteID, GetNoteInformation, GetNotes, AddNote, UpdateNote, DeleteNote,
    GetRecentGeneralNotes, UpdateRecentGeneralNotes, GetBookmarkGeneralNotes, UpdateBookmarkGeneralNotes
};