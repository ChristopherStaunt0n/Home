import { ConvertTimeToANumber } from "./HandleDates.js";
import { TurnIntoArray } from "./HandleGeneral.js";

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

export {
    GetDaysRoutineData, CreateNewChoreID, CheckIfChoreExist, ReorderChores, GetImportantRoutine, CompleteWeekRoutineMinus,
    EqualRoutines, BothRoutineDaysArraysHaveSame, ChoreInArray, RemoveChoreFromArray
};