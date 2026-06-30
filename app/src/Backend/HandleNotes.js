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
        [N.id, N.mode, JSON.stringify(N.group), N.title, N.message]
    );
}

//Updates a note's information
//N = Note information
async function UpdateNote(N) {
    await questioning(
        "UPDATE notes SET Mode = ?, `Group` = ?, Title = ?, Message = ? WHERE ID = ?",
        [N.mode, JSON.stringify(N.group), N.title, N.message, N.id]
    );
}

//Deletes a note from the database
//I = ID of note to delete
async function DeleteNote(I) {
    await questioning("DELETE FROM notes WHERE ID = ?", [Number(I)]);
}

//Gets the ids of recent general notes from database
async function GetRecentGeneralNotes() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['Recent_General_Notes']))[0].Data/* .ids */;
}

//Updates backend copy of recent general note ids
//A = JSON of public & private array recent ids
async function UpdateRecentGeneralNotes(A) {
    if (A) {
        let J = {
            public: A.public,
            private: A.private
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

//Merges & cleans array of sub group choices
//A = Array of sub group choices
function MergeArrayChoices(A) {
    if (Array.isArray(A) && A.length > 0) {

        let OrgArrCpy = structuredClone(A);
        let top = [OrgArrCpy[0][0]];
        let oldArrayMinusTop = [];

        for (let i = 0; i < OrgArrCpy.length; i++) {

            if (OrgArrCpy[i].length > 1) {
                oldArrayMinusTop.push(OrgArrCpy[i].toSpliced(0, 1));
            }
        }

        let rest = OrganizeArrayChoices(oldArrayMinusTop);

        for (let i = 0; i < rest.length; i++) {
            rest[i] = MergeArrayChoices(rest[i]);
        }

        return top.concat(rest);
    }
    else {
        console.log("Error: Could not merge choices");
        return null;
    }
}

//Organizes array of choices
//A = Array of choices
function OrganizeArrayChoices(A) {

    let OriginalArrayCopy = structuredClone(A);
    let FinalArray = [];
    let IgnoreIndexes = [];

    for (let i = 0; i < OriginalArrayCopy.length; i++) {

        if (!IgnoreIndexes.includes(i)) {

            let layerValue = OriginalArrayCopy[i][0];
            let tempArray = [];

            tempArray.push(OriginalArrayCopy[i]);
            IgnoreIndexes.push(i);

            for (let k = i + 1; k < OriginalArrayCopy.length; k++) {

                if (k == OriginalArrayCopy.length - 1) {
                    if (!IgnoreIndexes.includes(k) && OriginalArrayCopy[k][0] == layerValue) {
                        tempArray.push(OriginalArrayCopy[k]);
                        IgnoreIndexes.push(k);
                    }
                    break;
                }
                else if (OriginalArrayCopy[k][0] == layerValue) {
                    tempArray.push(OriginalArrayCopy[k]);
                    IgnoreIndexes.push(k);
                }
            }
            if (tempArray.length > 0) {
                FinalArray.push(tempArray);
            }
        }
    }
    return FinalArray;
}

//Converts group json to array
//J = JSON
function GroupJSONtoARRAY(J) {

    let theJSON = structuredClone(J);
    let nA = [];
    let num = 1;

    while (true) {
        if (theJSON[num] && theJSON[num] != "" && theJSON[num] != -1) {
            nA.push(theJSON[num]);
            num++;
        }
        else {
            break;
        }
    }
    return nA;
}

//Converts group array to json
//A = Array
function GroupARRAYtoJSON(A) {

    let theArray = structuredClone(A);
    const obj = {};

    for (let i = 0; i < theArray.length; i++) {
        obj[String(i + 1)] = theArray[i];

    }
    return obj;
}

export {
    GetNewNoteID, GetNoteInformation, GetNotes, AddNote, UpdateNote, DeleteNote,
    GetRecentGeneralNotes, UpdateRecentGeneralNotes, GetBookmarkGeneralNotes, UpdateBookmarkGeneralNotes,
    GroupARRAYtoJSON, GroupJSONtoARRAY, OrganizeArrayChoices, MergeArrayChoices
};