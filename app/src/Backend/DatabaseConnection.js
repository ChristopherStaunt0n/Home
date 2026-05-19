'use server';
import Login from "./Access.js";
const mysql = require('mysql2/promise');
import { redirect } from 'next/navigation'
import { parse } from 'path';
import {
    ConvertWeekSimple, GetSundayOfWeek, GetReadableDate, GetWeekDay,
    IsSameWeekOrLater, AdjustForDST_SE
} from "./HandleDates.js";

//Creates a connection to the database
const pool = mysql.createPool({
    host: Login.host,
    user: Login.user,
    password: Login.pass,
    database: Login.data
});

//Communicates with the database
async function questioning(line, params = []) {
    try {
        const [rows] = await pool.query(line, params);
        return JSON.stringify(rows);
    } catch (err) {
        console.error("Query error:", err);
        throw err;
    }
}

//Gets agenda of specific week
///D = Date within the week of intended agenda
async function GetAgenda(D) {
    if (D) {

        let Week = ConvertWeekSimple(GetSundayOfWeek(new Date(D)));

        if (JSON.parse(await questioning("SELECT EXISTS(SELECT 1 FROM agenda WHERE Week = ?) AS result", [Week]))[0].result == 1) {

            let agenda = JSON.parse(await questioning("SELECT Week, Public, Private, Sleep, Schedule FROM agenda WHERE Week = ?", [Week]));

            agenda = {
                startDate: Week,
                public: agenda[0].Public,
                private: agenda[0].Private,
                sleep: agenda[0].Sleep,
                routineID: agenda[0].Schedule
            };

            return agenda;
        }
        else {
            console.log("Agenda Not Found: Creating new agenda");
            let NewAgenda = await CreateNewAgenda(Week);
            await AddAgenda(NewAgenda);
            return NewAgenda;
        }
    }
}

//Gets schedule by its id
//I = Schedule's id
async function GetSchedule(I) {
    if (I) {
        let schedule = JSON.parse(await questioning("SELECT Schedule FROM routine WHERE ID = ?", [I]));
        return schedule[0].Schedule;
    }
}

//Applies changes to agenda based on its date
//A = Provided agenda
async function ApplyAgendaUpdate(A) {
    if (A && A.startDate) {
        let D = A.startDate;
        await questioning(
            "UPDATE agenda SET Public = ?, Private = ?, Sleep = ?, Schedule = ? WHERE Week = ?",
            [JSON.stringify(A.public), JSON.stringify(A.private), JSON.stringify(A.sleep), A.routineID, D]
        );
    }
}

//Applies changes to schedule based on its id
//A = Provided schedule
async function ApplyScheduleUpdate(S) {
    if (S && S.trueID) {
        await questioning(
            "UPDATE routine SET Schedule = ? WHERE ID = ?",
            [JSON.stringify(S), S.trueID]
        );
    }
}

//Adds provided agenda to database
//A = Agenda
async function AddAgenda(A) {
    await questioning(
        "INSERT INTO agenda (Week, Public, Private, Sleep) VALUES (?, ?, ?, ?)",
        [A.startDate, JSON.stringify(A.public), JSON.stringify(A.private), JSON.stringify(A.sleep)]
    );
}

//Adds provided schedule to database
//S = Provided schedule
async function AddSchedule(S) {
    await questioning(
        "INSERT INTO routine (ID, Schedule) VALUES (?, ?)",
        [S.trueID, JSON.stringify(S)]
    );
}

//Creates new blank routine and adds it to database before returning it
async function CreateNewRoutine() {

    let NewID = 0;
    let ExistingIDs = JSON.parse(await questioning("SELECT ID FROM routine", []));
    let IDReady = false;

    while (!IDReady) {
        IDReady = true;

        for (let i = 0; i < ExistingIDs.length; i++) {
            if (ExistingIDs[i].ID == NewID) {
                IDReady = false;
                NewID++;
                break;
            }
        }
    }

    let NewS = {
        title: "New Routine",
        trueID: NewID,
        public: [],
        private: []
    }

    await AddSchedule(NewS);

    return NewS;
}

//Creates new agenda based on provided date and returns it
//D =  Date of agenda's Sunday
async function CreateNewAgenda(D) {

    let Start = GetSundayOfWeek(new Date(D));
    let WeekDates = [];
    let DefaultSleepSample = {
        sleptIn: false,
        napped: false
    };

    Start = AdjustForDST_SE(Start);
    WeekDates.push(GetReadableDate(Start));

    for (let i = 0; i < 6; i++) {
        Start.setDate(Start.getDate() + 1);
        WeekDates.push(GetReadableDate(Start));
    }

    let rID = await GetRoutineMainID();

    let NewAgenda = {
        startDate: ConvertWeekSimple(GetSundayOfWeek(new Date(D))),
        public: {
            daily: {
                sunday: {
                    day: WeekDates[0],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                monday: {
                    day: WeekDates[1],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                tuesday: {
                    day: WeekDates[2],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                wednesday: {
                    day: WeekDates[3],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                thursday: {
                    day: WeekDates[4],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                friday: {
                    day: WeekDates[5],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                saturday: {
                    day: WeekDates[6],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                }
            },
            review: {
                accomplished: "",
                plans: ""
            },
            notes: ""
        },
        private: {
            daily: {
                sunday: {
                    day: WeekDates[0],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                monday: {
                    day: WeekDates[1],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                tuesday: {
                    day: WeekDates[2],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                wednesday: {
                    day: WeekDates[3],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                thursday: {
                    day: WeekDates[4],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                friday: {
                    day: WeekDates[5],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                },
                saturday: {
                    day: WeekDates[6],
                    tasks: [],
                    routinesDone: [],
                    extra: ""
                }
            },
            review: {
                accomplished: "",
                plans: ""
            },
            notes: ""
        },
        sleep: {
            sunday: DefaultSleepSample,
            monday: DefaultSleepSample,
            tuesday: DefaultSleepSample,
            wednesday: DefaultSleepSample,
            thursday: DefaultSleepSample,
            friday: DefaultSleepSample,
            saturday: DefaultSleepSample
        },
        routineID: rID
    };

    return NewAgenda;
}

//Gets the current default routine id
async function GetRoutineMainID() {
    let schedule = JSON.parse(await questioning("SELECT Schedule FROM routine WHERE ID = ?", [0]));
    schedule = schedule[0].Schedule;
    schedule = schedule.currentId;
    return schedule;
}

//Returns updated agenda's schedule id if it is within the current week
//A = Agenda
//D = Date of current week point of reference
async function AgendaCheckup_RoutineID(A, D) {
    if (A && IsSameWeekOrLater(D, A.startDate)) {
        let currentRoutineID = await GetRoutineMainID();
        let AdjustedA = A;
        AdjustedA.routineID = currentRoutineID;
        await ApplyAgendaUpdate(A);
        return AdjustedA;
    }
    else {
        return A;
    }
}

//Gets current routine moving forward
async function GetCurrentRoutine() {
    await CheckForEmptyRoutineDatabase();
    let CR_ID = JSON.parse(await questioning("SELECT Schedule FROM routine WHERE ID = ?", [0]))[0].Schedule.currentId;
    let CR_A = JSON.parse(await questioning("SELECT Schedule FROM routine WHERE ID = ?", [CR_ID]))[0].Schedule
    return CR_A;
}

//Makes sure there is atleast one available rountine
async function CheckForEmptyRoutineDatabase() {
    let AR = JSON.parse(await questioning("SELECT * FROM routine", []));
    if (AR.length <= 1) {
        await CreateNewRoutine();
    }
}

//Deletes a schedule then makes sure current routine exists
//R = Schedule to delete
async function DeleteRoutine(R) {
    if (R && R.trueID && R.trueID != 0) {
        await questioning("DELETE FROM routine WHERE ID = ?", [R.trueID]);
        CheckForEmptyRoutineDatabase();
        if (JSON.parse(await questioning("SELECT Schedule FROM routine WHERE ID = ?", [0]))[0].Schedule.currentId == R.trueID) {
            await questioning(
                "UPDATE routine SET Schedule = ? WHERE ID = ?",
                [JSON.stringify({ currentId: 1 }), 0]
            );
        }
    }
    else {
        console.log("Error: Failed to delete schedule");
    }
}

//Duplicates provided routine into database with new id
//R = Routine to duplicate
async function DuplicateRoutine(R) {

    let NewID = 0;
    let ExistingIDs = JSON.parse(await questioning("SELECT ID FROM routine", []));
    let IDReady = false;

    while (!IDReady) {
        IDReady = true;

        for (let i = 0; i < ExistingIDs.length; i++) {
            if (ExistingIDs[i].ID == NewID) {
                IDReady = false;
                NewID++;
                break;
            }
        }
    }

    let NewS = {
        title: R.title + "+",
        trueID: NewID,
        public: R.public,
        private: R.private,
        notes: R.notes
    }

    await AddSchedule(NewS);

    return NewS;
}

//Sets provided routine as current default
//S = Provided routine
async function AssignThisRoutine(S) {

    if (S) {
        if (JSON.parse(await questioning("SELECT EXISTS(SELECT 1 FROM routine WHERE ID = ?) AS result", [S.trueID]))[0].result == 1) {

            let IdLink = { currentId: S.trueID };

            await questioning(
                "UPDATE routine SET Schedule = ? WHERE ID = ?",
                [JSON.stringify(IdLink), 0]
            );
        }
        else {
            console.log("Error: Routine does not exist");
        }
    }
    else {
        console.log("Error: Provided routine could not be read");
    }
}

//Returns array of available routines in JSON format {id: X, schedule: Y}
async function GetAvailableRoutines() {

    let AR = JSON.parse(await questioning("SELECT ID, Schedule FROM routine", []));
    let AR_Array = [];

    for (let i = 0; i < AR.length; i++) {
        if (AR[i].ID != 0) {
            AR_Array.push(AR[i].Schedule);
        }
    }

    return AR_Array;
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

//Checks if mode swapping is locked (requires passkey)
async function GetModeToggleKeyStatus() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['ModeLock_Toggle']))[0].Data.active;
}

//Updates lock on mode swapping
//K = Key required or not
async function ChangeModeToggleKeyStatus(K) {
    let J = {
        active: K
    }
    await questioning(
        "UPDATE ref SET Data = ? WHERE Basis = ?",
        [JSON.stringify(J), 'ModeLock_Toggle']
    );
}

//Checks if screen saver is in use
async function GetScreenSaverStatus() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['ScreenSaver_Toggle']))[0].Data.active;
}

//Updates lock on mode swapping
//K = Key required or not
async function ChangeScreenSaverStatus(K) {
    let J = {
        active: K
    }
    await questioning(
        "UPDATE ref SET Data = ? WHERE Basis = ?",
        [JSON.stringify(J), 'ScreenSaver_Toggle']
    );
}

export {
    GetAgenda, ApplyAgendaUpdate, CreateNewAgenda,
    ApplyScheduleUpdate, CreateNewRoutine, GetCurrentRoutine, AssignThisRoutine, GetAvailableRoutines, DuplicateRoutine,
    GetSchedule, DeleteRoutine, CheckForEmptyRoutineDatabase, AgendaCheckup_RoutineID, GetNotes, AddNote, UpdateNote, DeleteNote,
    GetRecentGeneralNotes, UpdateRecentGeneralNotes, GetBookmarkGeneralNotes, UpdateBookmarkGeneralNotes,
    GetModeToggleKeyStatus, ChangeModeToggleKeyStatus, GetScreenSaverStatus, ChangeScreenSaverStatus
};