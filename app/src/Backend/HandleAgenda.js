import {
    ConvertWeekSimple, GetSundayOfWeek, GetReadableDate, GetWeekDay,
    IsSameWeekOrLater, AdjustForDST_SE
} from "./HandleDates.js";
import { GetRoutineMainID } from "./HandleRoutine.js";
import { questioning } from "./DatabaseConnection.js";

//Determines if TA is earlier than TB (or alphabetically if equal)
//TA = First task
//TB = Second task
function FirstTaskTimeEarly(TA, TB) {
    if (TA.time == TB.time) {//Alphabet
        if (TA.goal <= TB.goal) {
            return true;
        }
        else {
            return false;
        }
    }
    else {//Time
        let TA_Time = [parseInt(TA.time.split(":")[0]), parseInt(TA.time.split(":")[1].slice(0, 2)), TA.time.split(" ")[1]];
        let TB_Time = [parseInt(TB.time.split(":")[0]), parseInt(TB.time.split(":")[1].slice(0, 2)), TB.time.split(" ")[1]];
        if (TA_Time[2] == "AM" && TB_Time[2] == "PM") {
            return true;
        }
        else if (TA_Time[2] == "PM" && TB_Time[2] == "AM") {
            return false;
        }
        else {
            if (TA_Time[0] < TB_Time[0]) {
                return true;
            }
            else if (TA_Time[0] > TB_Time[0]) {
                return false;
            }
            else {
                if (TA_Time[1] < TB_Time[1]) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }
}

//Sort array based on time (ex: 10:00 AM)
//T = Tasks array
function SortTasksByBaiscTime(T) {

    let OldTasks = T;
    let NewTasks = [];
    let isNextEarly = true;

    while (OldTasks.length > 0) {

        if (OldTasks.length == 1) {
            NewTasks.push(OldTasks[0]);
            break;
        }

        isNextEarly = true;

        for (let i = 0; i < OldTasks.length - 1; i++) {
            if (!FirstTaskTimeEarly(OldTasks[0], OldTasks[i + 1])) {//OldTasks[i], OldTasks[i + 1
                isNextEarly = false;
                break;
            }
        }

        if (isNextEarly) {
            NewTasks.push(OldTasks[0]);
            OldTasks = OldTasks.toSpliced(0, 1);
        }
        else {
            let movedTask = OldTasks[0];
            OldTasks = OldTasks.toSpliced(0, 1);
            OldTasks.push(movedTask);
        }
    }

    return NewTasks;
}

//Reorders tasks based time (if available), importance, then alphabet
//T = Tasks array
function ReorderTasks(T) {
    if (T && Array.isArray(T) && T.length > 0) {

        let NewTaskOrder = T;
        let TimedTasks_U = NewTaskOrder.filter(task => task.time != null);
        let UnTimedTasks_U = NewTaskOrder.filter(task => task.time == null);

        let TimedTasks_I = TimedTasks_U.filter(task => task.important);
        TimedTasks_U = TimedTasks_U.filter(task => !task.important);

        let UnTimedTasks_I = UnTimedTasks_U.filter(task => task.important);
        UnTimedTasks_U = UnTimedTasks_U.filter(task => !task.important);

        TimedTasks_I = SortTasksByBaiscTime(TimedTasks_I);
        TimedTasks_U = SortTasksByBaiscTime(TimedTasks_U);
        UnTimedTasks_I = UnTimedTasks_I.sort((a, b) => a.goal.localeCompare(b.goal));
        UnTimedTasks_U = UnTimedTasks_U.sort((a, b) => a.goal.localeCompare(b.goal));

        return [...TimedTasks_I, ...TimedTasks_U, ...UnTimedTasks_I, ...UnTimedTasks_U];
    }
    else {
        return [];
    }
}

//Reorders the daily tasks in provided agenda using ReorderTasks() function
//A = Agenda
function ReorderAgendaTasks(A) {
    let NewAgenda = A;

    NewAgenda.public.daily.sunday.tasks = ReorderTasks(NewAgenda.public.daily.sunday.tasks);
    NewAgenda.public.daily.monday.tasks = ReorderTasks(NewAgenda.public.daily.monday.tasks);
    NewAgenda.public.daily.tuesday.tasks = ReorderTasks(NewAgenda.public.daily.tuesday.tasks);
    NewAgenda.public.daily.wednesday.tasks = ReorderTasks(NewAgenda.public.daily.wednesday.tasks);
    NewAgenda.public.daily.thursday.tasks = ReorderTasks(NewAgenda.public.daily.thursday.tasks);
    NewAgenda.public.daily.friday.tasks = ReorderTasks(NewAgenda.public.daily.friday.tasks);
    NewAgenda.public.daily.saturday.tasks = ReorderTasks(NewAgenda.public.daily.saturday.tasks);

    NewAgenda.private.daily.sunday.tasks = ReorderTasks(NewAgenda.private.daily.sunday.tasks);
    NewAgenda.private.daily.monday.tasks = ReorderTasks(NewAgenda.private.daily.monday.tasks);
    NewAgenda.private.daily.tuesday.tasks = ReorderTasks(NewAgenda.private.daily.tuesday.tasks);
    NewAgenda.private.daily.wednesday.tasks = ReorderTasks(NewAgenda.private.daily.wednesday.tasks);
    NewAgenda.private.daily.thursday.tasks = ReorderTasks(NewAgenda.private.daily.thursday.tasks);
    NewAgenda.private.daily.friday.tasks = ReorderTasks(NewAgenda.private.daily.friday.tasks);
    NewAgenda.private.daily.saturday.tasks = ReorderTasks(NewAgenda.private.daily.saturday.tasks);

    return NewAgenda;
}

//Gets data of chosen day
//M = Mode (public vs private)
//W = Which day
//A = Agenda to get data from
function GetDaysAgendaData(M, W, A) {
    if (W && A) {
        let theA = M == 0 ? A.public : A.private;
        switch (W) {
            case "Sunday":
                return theA.sunday;
            case "Monday":
                return theA.monday;
            case "Tuesday":
                return theA.tuesday;
            case "Wednesday":
                return theA.wednesday;
            case "Thursday":
                return theA.thursday;
            case "Friday":
                return theA.friday;
            case "Saturday":
                return theA.saturday;
            default:
                console.log("Error: Could not determine desired day information");
                return null;
        }
    }
    else {
        return null;
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

//Adds provided agenda to database
//A = Agenda
async function AddAgenda(A) {
    await questioning(
        "INSERT INTO agenda (Week, Public, Private, Sleep) VALUES (?, ?, ?, ?)",
        [A.startDate, JSON.stringify(A.public), JSON.stringify(A.private), JSON.stringify(A.sleep)]
    );
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

export {
    ReorderAgendaTasks, ReorderTasks, GetDaysAgendaData,
    GetAgenda, AddAgenda, ApplyAgendaUpdate, CreateNewAgenda,
    AgendaCheckup_RoutineID
};