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

export { GetNewNoteID, GetNoteInformation };