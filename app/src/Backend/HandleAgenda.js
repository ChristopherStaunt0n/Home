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

export { ReorderAgendaTasks, ReorderTasks, GetDaysAgendaData };