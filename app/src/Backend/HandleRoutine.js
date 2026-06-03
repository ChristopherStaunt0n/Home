import {
    ConvertWeekSimple, GetSundayOfWeek, GetReadableDate, GetWeekDay,
    IsSameWeekOrLater, AdjustForDST_SE, ConvertTimeToANumber
} from "./HandleDates.js";
import { TurnIntoArray } from "./HandleGeneral.js";
import { questioning } from "./DatabaseConnection.js";

//Creates a new unused ID based on provided chore array
//S = Routine chores
function CreateNewChoreID(S) {
    if (S && Array.isArray(S)) {

        let NewID = Number(1);
        let ex_IDs = [];

        for (let i = 0; i < S.length; i++) {
            ex_IDs.push(Number(S[i].id));
        }

        while (true) {
            if (ex_IDs.includes(NewID)) {
                NewID = NewID + 1;
            }
            else {
                break;
            }
        }

        return NewID;
    }
    else {
        console.log("Error: No routine found");
    }
}

//Checks if chore already exist in provided routine portion
//S = Routine chores
//C = Chore goal
//T = Time
//W = Which days
function CheckIfChoreExist(S, C, T, W) {
    if (S && Array.isArray(S)) {
        for (let i = 0; i < S.length; i++) {
            let aChore = S[i];
            if (aChore.chore == C && aChore.time == T && aChore.days == W) {
                return true;
            }
        }
        return false;
    }
    else {
        console.log("Error: Could not read chores array");
    }
}

//Orders chores based on time
//C = Array of chores
function ReorderChores(C) {

    let filteredTimed = C.filter(objective => objective.time != null);

    let sortedTime = [];

    while (filteredTimed.length > 0) {

        if (filteredTimed.length == 1) {
            sortedTime.push(filteredTimed[0]);
            filteredTimed = filteredTimed.toSpliced(0, 1);
            break;
        }
        else {

            let earlyIndex = 0;
            let earlyValue = ConvertTimeToANumber(filteredTimed[0].time);
            let earlyName = filteredTimed[0].chore;

            for (let i = 0; i < filteredTimed.length - 1; i++) {

                let M_earlyValue = ConvertTimeToANumber(filteredTimed[i + 1].time);
                let M_earlyName = filteredTimed[i + 1].chore;

                if (earlyValue > M_earlyValue) {
                    earlyIndex = i + 1;
                    earlyValue = M_earlyValue;
                    earlyName = M_earlyName;
                }
                else if (earlyValue == M_earlyValue && earlyName.localeCompare(M_earlyName) > 0) {
                    earlyIndex = i + 1;
                    earlyValue = M_earlyValue;
                    earlyName = M_earlyName;
                }
            }

            sortedTime.push(filteredTimed[earlyIndex]);
            filteredTimed = filteredTimed.toSpliced(earlyIndex, 1);

        }
    }

    let untimed = C.filter(objective => objective.time == null);
    untimed = untimed.sort((a, b) => a.chore.localeCompare(b.chore));

    return sortedTime.concat(untimed);
}

//Gets data of chosen day
//M = Mode (public vs private)
//W = Which day
//S = Routine to get data from
function GetDaysRoutineData(M, W, S) {
    if (W && S) {
        let theS = M == 0 ? S.public : S.private;
        let results = theS.filter(r => r.days.includes(W));
        if (!Array.isArray(results) && results) {
            results = [results];
        }
        return results;
    }
    else {
        return null;
    }
}

//Filters out unimportant routines from provided schedule
//S = Schedule
function GetImportantRoutine(S) {
    let newS = JSON.parse(JSON.stringify(S));
    newS.public = TurnIntoArray(newS.public.filter(c => c.important));
    newS.private = TurnIntoArray(newS.private.filter(c => c.important));
    return newS;
}

//Returns array of completed routines except for provided day based off provided agenda
//A = Agenda
//M = Which mode (public or private)
//D = Which day to not provied routine info of
function CompleteWeekRoutineMinus(A, M, D) {
    let WeekData = (M == 0 ? A.public.daily : A.private.daily);
    let CR = [];

    if (D != "Sunday") {
        CR = CR.concat(WeekData.sunday.routinesDone);
    }
    if (D != "Monday") {
        CR = CR.concat(WeekData.monday.routinesDone);
    }
    if (D != "Tuesday") {
        CR = CR.concat(WeekData.tuesday.routinesDone);
    }
    if (D != "Wednesday") {
        CR = CR.concat(WeekData.wednesday.routinesDone);
    }
    if (D != "Thursday") {
        CR = CR.concat(WeekData.thursday.routinesDone);
    }
    if (D != "Friday") {
        CR = CR.concat(WeekData.friday.routinesDone);
    }
    if (D != "Saturday") {
        CR = CR.concat(WeekData.saturday.routinesDone);
    }

    for (let i = 0; i < CR.length; i++) {
        if (i == CR.length) {
            break;
        }
        for (let j = i; j < CR.length; j++) {
            if (j == CR.length) {
                break;
            }
            else if (i != j && EqualRoutines(CR[i], CR[j])) {
                CR == CR.toSpliced(j, 1);
                break;
            }
        }
    }
    return CR;
}

//Determines if both routine are equal to each other
//A = Routine JSON A
//B = Routine JSON B
function EqualRoutines(A, B) {
    if (A.chore == B.chore && A.time == B.time && BothRoutineDaysArraysHaveSame(A.days, B.days)) {
        return true;
    }
    else {
        return false;
    }
}

//Checks if both arrays contain same content
//A = Array A
//B = Array B
function BothRoutineDaysArraysHaveSame(A, B) {
    for (let i = 0; i < A.length; i++) {
        if (!B.includes(A[i])) {
            return false;
        }
    }
    for (let i = 0; i < B.length; i++) {
        if (!A.includes(B[i])) {
            return false;
        }
    }
    return true;
}

//Checks if chore is present in array
//A = Array
//C = Chore JSON
function ChoreInArray(A, C) {
    for (let i = 0; i < A.length; i++) {
        if (EqualRoutines(C, A[i])) {
            return true;
        }
    }
    return false;
}

//Returns a new array without the provided chore
//C = Chore to remove
//A = Array to remove chore from
function RemoveChoreFromArray(C, A) {
    for (let i = 0; i < A.length; i++) {
        if (EqualRoutines(C, A[i])) {
            return A.toSpliced(i, 1);
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
        private: [],
        notes: {
            private: "",
            public: ""
        }
    }

    await AddSchedule(NewS);

    return NewS;
}

//Gets the current default routine id
async function GetRoutineMainID() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['Routine_Current']))[0].Data.currentId;
}

//Gets current routine moving forward
async function GetCurrentRoutine() {
    await CheckForEmptyRoutineDatabase();
    let CR_ID = await GetRoutineMainID();
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
        if ((await GetRoutineMainID()) == R.trueID) {
            await questioning(
                "UPDATE ref SET Data = ? WHERE Basis = ?",
                [JSON.stringify({ currentId: 1 }), 'Routine_Current']
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
                "UPDATE ref SET Data = ? WHERE Basis = ?",
                [JSON.stringify(IdLink), 'Routine_Current']
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

export {
    GetDaysRoutineData, CreateNewChoreID, CheckIfChoreExist, ReorderChores, GetImportantRoutine, CompleteWeekRoutineMinus,
    EqualRoutines, BothRoutineDaysArraysHaveSame, ChoreInArray, RemoveChoreFromArray, GetSchedule, ApplyScheduleUpdate,
    AddSchedule, CreateNewRoutine, GetRoutineMainID, GetCurrentRoutine, CheckForEmptyRoutineDatabase, DeleteRoutine,
    DuplicateRoutine, AssignThisRoutine, GetAvailableRoutines
};