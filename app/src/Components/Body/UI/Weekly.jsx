import { useRef, useEffect, useState } from "react";
import { ReorderTasks } from "../../../Backend/HandleAgenda.js";
import { CreateNewTask, EditOldTask } from "./PopUps.jsx";
import {
    GetImportantRoutine, CompleteWeekRoutineMinus,
    EqualRoutines, BothRoutineDaysArraysHaveSame, ChoreInArray, RemoveChoreFromArray
} from "../../../Backend/HandleRoutine.js";
import { days } from "../../../Backend/HandleDates.js";
import { TurnIntoArray } from "../../../Backend/HandleGeneral.js";
import Basic_S from "../../../Styles/Basics.module.css";
import Week_S from "../Styles/Weekly/Week.module.css";
import Day_S from "../Styles/Weekly/Day.module.css";
import TaskC_S from "../Styles/Weekly/TaskCompletion.module.css";
import RoutineC_S from "../Styles/Weekly/RoutineCheck.module.css";
import Mission_S from "../Styles/Weekly/Mission.module.css";
import Review_S from "../Styles/Weekly/Review.module.css";
import Memo_S from "../Styles/Weekly/Memo.module.css";
import Progress_S from "../Styles/Weekly/Progress.module.css";

//Weekly agenda
function Week(Q) {

    const Week_Device = [Week_S.Computer, Week_S.Mobile];
    const Week_Mode = [Week_S.Public, Week_S.Private];

    const [NotepadMode, setNotepadMode] = useState(null);
    const [MemoFullMode, setMemoFullMode] = useState(false);

    //Hides review and memo sections when swapping modes or week
    useEffect(() => {
        setNotepadMode(null);
    }, [Q.Agenda.startDate, Q.Mode]);

    //Returns daily information
    //TheDay = The day of the week
    function GetDayInfo(TheDay) {

        let Data = (Q.Mode == 0 ? Q.Agenda.public.daily : Q.Agenda.private.daily);

        switch (TheDay) {
            case "Sunday":
                return Data.sunday;
            case "Monday":
                return Data.monday;
            case "Tuesday":
                return Data.tuesday;
            case "Wednesday":
                return Data.wednesday;
            case "Thursday":
                return Data.thursday;
            case "Friday":
                return Data.friday;
            case "Saturday":
                return Data.saturday;
            default:
                return "Error: Could not determine desired day information";
        }
    }

    //Returns sleep information for that day
    //TheDay = The day of the week
    function GetSleepInfo(TheDay) {
        switch (TheDay) {
            case "Sunday":
                return Q.Agenda.sleep.sunday;
            case "Monday":
                return Q.Agenda.sleep.monday;
            case "Tuesday":
                return Q.Agenda.sleep.tuesday;
            case "Wednesday":
                return Q.Agenda.sleep.wednesday;
            case "Thursday":
                return Q.Agenda.sleep.thursday;
            case "Friday":
                return Q.Agenda.sleep.friday;
            case "Saturday":
                return Q.Agenda.sleep.saturday;
            default:
                return "Error: Could not determine desired day information";
        }
    }

    //Updates sleep info for the week
    //S = New sleep info
    //D = Which day to update
    function AlterSleep(S, D) {

        let NewAgenda = Q.Agenda;

        switch (D) {
            case "Sunday":
                NewAgenda.sleep.sunday = S;
                break;
            case "Monday":
                NewAgenda.sleep.monday = S;
                break;
            case "Tuesday":
                NewAgenda.sleep.tuesday = S;
                break;
            case "Wednesday":
                NewAgenda.sleep.wednesday = S;
                break;
            case "Thursday":
                NewAgenda.sleep.thursday = S;
                break;
            case "Friday":
                NewAgenda.sleep.friday = S;
                break;
            case "Saturday":
                NewAgenda.sleep.saturday = S;
                break;
            default:
                return "Error: Could not determine which day to update sleep info";
        }
        Q.UpdateAgenda(NewAgenda);
    }

    //Updates agenda with day's changes
    //Daily = Daily info with new changes
    //Day = Which day of the week
    //M = Which mode (public or private)
    function AlterDay(Daily, Day, M) {
        let NewAgenda = Q.Agenda;
        if (M == 0) {
            switch (Day) {
                case "Sunday":
                    NewAgenda.public.daily.sunday = Daily;
                    break;
                case "Monday":
                    NewAgenda.public.daily.monday = Daily;
                    break;
                case "Tuesday":
                    NewAgenda.public.daily.tuesday = Daily;
                    break;
                case "Wednesday":
                    NewAgenda.public.daily.wednesday = Daily;
                    break;
                case "Thursday":
                    NewAgenda.public.daily.thursday = Daily;
                    break;
                case "Friday":
                    NewAgenda.public.daily.friday = Daily;
                    break;
                case "Saturday":
                    NewAgenda.public.daily.saturday = Daily;
                    break;
                default:
                    console.log("Error: Could not determine which day to update");
            }
        }
        else if (M == 1) {
            switch (Day) {
                case "Sunday":
                    NewAgenda.private.daily.sunday = Daily;
                    break;
                case "Monday":
                    NewAgenda.private.daily.monday = Daily;
                    break;
                case "Tuesday":
                    NewAgenda.private.daily.tuesday = Daily;
                    break;
                case "Wednesday":
                    NewAgenda.private.daily.wednesday = Daily;
                    break;
                case "Thursday":
                    NewAgenda.private.daily.thursday = Daily;
                    break;
                case "Friday":
                    NewAgenda.private.daily.friday = Daily;
                    break;
                case "Saturday":
                    NewAgenda.private.daily.saturday = Daily;
                    break;
                default:
                    console.log("Error: Could not determine which day to update");
            }
        }
        else {
            console.log("Error: Could not determine which mode to update day to");
        }
        Q.UpdateAgenda(NewAgenda);
    }

    //Updates agenda review notes
    //N = New review notes
    //T = Type of notes
    //M = Which mode (public or private)
    function AlterReview(N, T, M) {
        let NewAgenda = Q.Agenda;
        if (M == 0) {
            if (T == "Review") {
                NewAgenda.public.review.accomplished = N;
            }
            else if (T == "Future") {
                NewAgenda.public.review.plans = N;
            }
            else {
                console.log("Error: Could not determine where to put notes under review section");
            }
        }
        else if (M == 1) {
            if (T == "Review") {
                NewAgenda.private.review.accomplished = N;
            }
            else if (T == "Future") {
                NewAgenda.private.review.plans = N;
            }
            else {
                console.log("Error: Could not determine where to put notes under review section");
            }
        }
        else {
            console.log("Error: Could not determine which mode to update review");
        }
        Q.UpdateAgenda(NewAgenda);
    }

    //Updates agenda with weekly note changes
    //N = New weekly notes
    //M = Which mode (public or private)
    function AlterWeeklyNotes(N, M) {
        let NewAgenda = Q.Agenda;
        if (M == 0) {
            NewAgenda.public.notes = N;
        }
        else if (M == 1) {
            NewAgenda.private.notes = N;
        }
        else {
            console.log("Error: Could not determine which mode to update notes to");
        }
        Q.UpdateAgenda(NewAgenda);
    }

    //Adds task to given day
    //W = Which day
    //T = Task
    function AddTaskToDay(W, T) {
        let NewAgenda = Q.Agenda;
        if (Q.Mode == 0) {
            switch (W) {
                case "Sunday":
                    NewAgenda.public.daily.sunday.tasks.push(T);
                    break;
                case "Monday":
                    NewAgenda.public.daily.monday.tasks.push(T);
                    break;
                case "Tuesday":
                    NewAgenda.public.daily.tuesday.tasks.push(T);
                    break;
                case "Wednesday":
                    NewAgenda.public.daily.wednesday.tasks.push(T);
                    break;
                case "Thursday":
                    NewAgenda.public.daily.thursday.tasks.push(T);
                    break;
                case "Friday":
                    NewAgenda.public.daily.friday.tasks.push(T);
                    break;
                case "Saturday":
                    NewAgenda.public.daily.saturday.tasks.push(T);
                    break;
                default:
                    console.log("Error: Could not determine which day to move/add task");
            }
        }
        else if (Q.Mode == 1) {
            switch (W) {
                case "Sunday":
                    NewAgenda.private.daily.sunday.tasks.push(T);
                    break;
                case "Monday":
                    NewAgenda.private.daily.monday.tasks.push(T);
                    break;
                case "Tuesday":
                    NewAgenda.private.daily.tuesday.tasks.push(T);
                    break;
                case "Wednesday":
                    NewAgenda.private.daily.wednesday.tasks.push(T);
                    break;
                case "Thursday":
                    NewAgenda.private.daily.thursday.tasks.push(T);
                    break;
                case "Friday":
                    NewAgenda.private.daily.friday.tasks.push(T);
                    break;
                case "Saturday":
                    NewAgenda.private.daily.saturday.tasks.push(T);
                    break;
                default:
                    console.log("Error: Could not determine which day to move/add task");
            }
        }
        else {
            console.log("Error: Failed to add/move task to day");
        }
        Q.UpdateAgenda(NewAgenda);
    }

    //Changes mode of notepad section based on provided value
    //M = String value representing new mode
    function ToggleNotepadMode(M) {
        if (M == NotepadMode) {
            setNotepadMode(null);
        }
        else {
            setNotepadMode(M);
        }
    }

    return (
        <div className={`${Week_Device[Q.Device]} ${Week_Mode[Q.Mode]}`}>
            <WeeklyProgressBar Mode={Q.Mode} Device={Q.Device} Agenda={Q.Agenda} Schedule={Q.ThisWeeksSchedule} />
            <div className={Week_S.DayContainer}>
                <Day Mode={Q.Mode} Device={Q.Device}
                    TheDate={Q.Agenda.startDate} Today={"Sunday"} Info={GetDayInfo("Sunday")} AlterDay={AlterDay} AlterSleep={AlterSleep} Sleep={GetSleepInfo("Sunday")}
                    ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={CompleteWeekRoutineMinus(Q.Agenda, Q.Mode, "Sunday")} AddTaskToDay={AddTaskToDay} />
                <Day Mode={Q.Mode} Device={Q.Device}
                    TheDate={Q.Agenda.startDate} Today={"Monday"} Info={GetDayInfo("Monday")} AlterDay={AlterDay} AlterSleep={AlterSleep} Sleep={GetSleepInfo("Monday")}
                    ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={CompleteWeekRoutineMinus(Q.Agenda, Q.Mode, "Monday")} AddTaskToDay={AddTaskToDay} />
                <Day Mode={Q.Mode} Device={Q.Device}
                    TheDate={Q.Agenda.startDate} Today={"Tuesday"} Info={GetDayInfo("Tuesday")} AlterDay={AlterDay} AlterSleep={AlterSleep} Sleep={GetSleepInfo("Tuesday")}
                    ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={CompleteWeekRoutineMinus(Q.Agenda, Q.Mode, "Tuesday")} AddTaskToDay={AddTaskToDay} />
                <Day Mode={Q.Mode} Device={Q.Device}
                    TheDate={Q.Agenda.startDate} Today={"Wednesday"} Info={GetDayInfo("Wednesday")} AlterDay={AlterDay} AlterSleep={AlterSleep} Sleep={GetSleepInfo("Wednesday")}
                    ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={CompleteWeekRoutineMinus(Q.Agenda, Q.Mode, "Wednesday")} AddTaskToDay={AddTaskToDay} />
                <Day Mode={Q.Mode} Device={Q.Device}
                    TheDate={Q.Agenda.startDate} Today={"Thursday"} Info={GetDayInfo("Thursday")} AlterDay={AlterDay} AlterSleep={AlterSleep} Sleep={GetSleepInfo("Thursday")}
                    ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={CompleteWeekRoutineMinus(Q.Agenda, Q.Mode, "Thursday")} AddTaskToDay={AddTaskToDay} />
                <Day Mode={Q.Mode} Device={Q.Device}
                    TheDate={Q.Agenda.startDate} Today={"Friday"} Info={GetDayInfo("Friday")} AlterDay={AlterDay} AlterSleep={AlterSleep} Sleep={GetSleepInfo("Friday")}
                    ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={CompleteWeekRoutineMinus(Q.Agenda, Q.Mode, "Friday")} AddTaskToDay={AddTaskToDay} />
                <Day Mode={Q.Mode} Device={Q.Device}
                    TheDate={Q.Agenda.startDate} Today={"Saturday"} Info={GetDayInfo("Saturday")} AlterDay={AlterDay} AlterSleep={AlterSleep} Sleep={GetSleepInfo("Saturday")}
                    ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={CompleteWeekRoutineMinus(Q.Agenda, Q.Mode, "Saturday")} AddTaskToDay={AddTaskToDay} />
            </div>
            <div className={Week_S.Notepad}>
                <div className={Week_S.Notepad_ButtonVessal}>
                    <button onClick={() => ToggleNotepadMode("Review_P")}
                        className={NotepadMode == "Review_P" ? Week_S.Notepad_Button_Active : Week_S.Notepad_Button_Inactive}>
                        Plans<i>{Q.Mode == 0 ? (Q.Agenda.public.review.plans != "" ? " (+)" : "") : (Q.Agenda.private.review.plans != "" ? " (+)" : "")}</i>
                    </button>
                    <div className={Week_S.Notepad_ButtonBuffer}></div>

                    <button onClick={() => ToggleNotepadMode("Review_R")}
                        className={NotepadMode == "Review_R" ? Week_S.Notepad_Button_Active : Week_S.Notepad_Button_Inactive}>
                        Review<i>{Q.Mode == 0 ? (Q.Agenda.public.review.accomplished != "" ? " (+)" : "") : (Q.Agenda.private.review.accomplished != "" ? " (+)" : "")}</i>
                    </button>
                    <div className={Week_S.Notepad_ButtonBuffer}></div>

                    <button onClick={() => ToggleNotepadMode("Memo")} onDoubleClick={() => setMemoFullMode(MemoFullMode ? false : true)}
                        className={NotepadMode == "Memo" ? Week_S.Notepad_Button_Active : Week_S.Notepad_Button_Inactive}>
                        Notes<i>{Q.Mode == 0 ? (Q.Agenda.public.notes != "" ? " (+)" : "") : (Q.Agenda.private.notes != "" ? " (+)" : "")}</i>
                    </button>
                </div>
                <div className={Week_S.NotepadArea}>
                    {NotepadMode && NotepadMode.includes("Review") ?
                        <Review Mode={Q.Mode} Device={Q.Device} NotepadMode={NotepadMode}
                            Info={Q.Mode == 0 ? Q.Agenda.public.review : Q.Agenda.private.review} AlterReview={AlterReview} />
                        : null}
                    {NotepadMode && NotepadMode == "Memo" ?
                        <Memo Mode={Q.Mode} Device={Q.Device} FullScreen={MemoFullMode} setFullMode={setMemoFullMode}
                            Info={Q.Mode == 0 ? Q.Agenda.public.notes : Q.Agenda.private.notes} AlterWeeklyNotes={AlterWeeklyNotes} />
                        : null}
                </div>
            </div>
        </div>
    );
}

//Displays total progress for the week
function WeeklyProgressBar(Q) {

    //Returns a JSON value holding number of complete and incomplete tasks based on provided day data
    //D = Day data
    function GetTaskCompletionFromDay(D) {
        let tasks = D.tasks;
        let results = {
            C: 0.0,
            I: 0.0
        };
        for (let j = 0; j < tasks.length; j++) {
            if (tasks[j].complete) {
                results.C = results.C + 1.0;
            }
            else {
                results.I = results.I + 1.0;
            }
        }
        return results;
    }

    //Returns a JSON value holding number of complete and incomplete routines based on provided data
    //D = JSON of daily info
    //R = Array of chores
    function GetRoutineCompletionFormDay(D, R) {
        let theDays = days.concat(["Week"]);
        let results = {
            C: 0.0,
            I: 0.0
        };
        let completedWeek = [];
        for (let k = 0; k < theDays.length; k++) {

            if (theDays[k] == "Week") {
                let weeklyRoutines = TurnIntoArray(R.filter(c => c.days.includes("Week")));
                for (let t = 0; t < weeklyRoutines.length; t++) {
                    if (ChoreInArray(completedWeek, weeklyRoutines[t])) {
                        results.C = results.C + 1.0;
                    }
                    else {
                        results.I = results.I + 1.0;
                    }
                }
                break;
            }
            else {
                let dailyInfo = D[theDays[k].toLowerCase()].routinesDone;
                let dailyRoutines = TurnIntoArray(R.filter(c => c.days.includes(theDays[k])));
                completedWeek = completedWeek.concat(TurnIntoArray(dailyInfo.filter(c => c.days.includes("Week"))));

                for (let t = 0; t < dailyRoutines.length; t++) {

                    if (ChoreInArray(dailyInfo, dailyRoutines[t])) {
                        results.C = results.C + 1.0;
                    }
                    else {
                        results.I = results.I + 1.0;
                    }
                }
            }

        }
        return results;
    }

    //Gets the percent of progress based on tasks and routines
    //S = Status (complete vs incomplete)
    function GetPercentage(S) {

        let A = Q.Mode == 0 ? Q.Agenda.public : Q.Agenda.private;
        let R = Q.Mode == 0 ? GetImportantRoutine(Q.Schedule).public : GetImportantRoutine(Q.Schedule).private;

        let C = 0.0;
        let IC = 0.0;

        let theDays = [A.daily.sunday, A.daily.monday, A.daily.tuesday, A.daily.wednesday, A.daily.thursday, A.daily.friday, A.daily.saturday];
        for (let i = 0; i < theDays.length; i++) {
            let J = GetTaskCompletionFromDay(theDays[i]);
            C = C + J.C;
            IC = IC + J.I;
        }

        let J = GetRoutineCompletionFormDay(A.daily, R);
        C = C + J.C;
        IC = IC + J.I;

        if (C + IC == 0) {
            return 0.0;
        }
        else if (S == "Complete") {
            return C / (C + IC) * 100.0;
        }
        else if (S == "Incomplete") {
            return IC / (C + IC) * 100.0;
        }
        else {
            return 0.0;
        }
    }

    return (
        <div className={Progress_S.Bar}>
            <div className={Progress_S.PCB_G} style={{ width: GetPercentage("Complete") + "%" }} />
            <div className={Progress_S.PCB_R} style={{ width: GetPercentage("Incomplete") + "%" }} />
            <span className={Progress_S.PCB_T}>{Math.trunc(GetPercentage("Complete"))}%</span>
        </div>
    );
}

//Individual day of weekly agenda
function Day(Q) {

    const Day_Device = [Day_S.Computer, Day_S.Mobile];
    const Day_Mode = [Day_S.Public, Day_S.Private];

    const [PopUp, setPopUp] = useState(null);

    const [CurrentTask, setCurrentTask] = useState(-1);

    const [Full, setFull] = useState(false);

    //Hides day notes when swapping modes
    useEffect(() => {
        ShowInfo(-1, "")
    }, [Q.Mode, Q.TheDate]);

    //Setups corresponding task notes in text section
    //I = Index of task
    //N = Task notes
    function ShowInfo(I, N) {
        if (I == CurrentTask || I < 0) {
            setCurrentTask(-1);
            document.getElementById("DisplayedTaskInfo" + Q.Mode + Q.Today + "_ID").value = "";
        }
        else {
            setCurrentTask(I);
            document.getElementById("DisplayedTaskInfo" + Q.Mode + Q.Today + "_ID").value = N;
        }
    }

    //Toggles the slept in status for this day
    function ToggleSleptIn() {
        let NewSleep = Q.Sleep;
        if (NewSleep.sleptIn) {
            NewSleep.sleptIn = false;
        }
        else {
            NewSleep.sleptIn = true;
        }
        Q.AlterSleep(NewSleep, Q.Today);
    }

    //Toggles the napped status for this day
    function ToggleNapped() {
        let NewSleep = Q.Sleep;
        if (NewSleep.napped) {
            NewSleep.napped = false;
        }
        else {
            NewSleep.napped = true;
        }
        Q.AlterSleep(NewSleep, Q.Today);
    }

    //Toggles completion of current task
    function ToggleComplete() {
        let NewDay = Q.Info;
        NewDay.tasks = ReorderTasks(NewDay.tasks);
        if (NewDay.tasks[CurrentTask].complete) {
            NewDay.tasks[CurrentTask].complete = false;
        }
        else {
            NewDay.tasks[CurrentTask].complete = true;
        }
        Q.AlterDay(NewDay, Q.Today, Q.Mode);
    }

    //Updates note to agenda
    function TypingTaskNotes() {
        if (CurrentTask >= 0) {
            let NewDay = Q.Info;
            if (CurrentTask != Q.Info.tasks.length) {
                NewDay.tasks = ReorderTasks(NewDay.tasks);
                NewDay.tasks[CurrentTask].notes = document.getElementById("DisplayedTaskInfo" + Q.Mode + Q.Today + "_ID").value;
            }
            else {
                NewDay.extra = document.getElementById("DisplayedTaskInfo" + Q.Mode + Q.Today + "_ID").value;
            }
            Q.AlterDay(NewDay, Q.Today, Q.Mode);
        }
    }

    //Setups a popup
    //P = Type of popup component
    function SetupPopup(P) {
        if (!PopUp) {
            switch (P) {
                case "Create":
                    setPopUp(
                        <CreateNewTask Mode={Q.Mode} Device={Q.Device} Today={Q.Today} AddTask={AddTask} SetupPopup={SetupPopup} />
                    );
                    break;
                case "Edit":
                    setPopUp(
                        <EditOldTask Mode={Q.Mode} Device={Q.Device} Today={Q.Today}
                            SetupPopup={SetupPopup} EditTask={EditTask} DeleteTask={DeleteTask}
                            TaskInfo={ReorderTasks(Q.Info.tasks)[CurrentTask]} CurrentTask={CurrentTask}
                            SwapTask={SwapTask} />
                    );
                    break;
                default:
                    setPopUp(null);
            }
        }
    }

    //Moves task to a different day
    //A = Which assigned day
    //C = Current task index
    //N = New copy of task
    function SwapTask(A, C, N) {
        Q.AddTaskToDay(A, N);
        let NewDay = Q.Info;
        NewDay.tasks = ReorderTasks(NewDay.tasks);
        NewDay.tasks.splice(C, 1);
        SetupPopup("");
        Q.AlterDay(NewDay, Q.Today, Q.Mode);
        ShowInfo(-1, "");
    }

    //Applys new task to agenda
    //T = New task
    function AddTask(T) {
        let NewDay = Q.Info;
        NewDay.tasks.push(T);
        SetupPopup("");
        Q.AlterDay(NewDay, Q.Today, Q.Mode);
        ShowInfo(-1, "");
    }

    //Applys edit to task
    //I = Index of task
    //T = New task info
    function EditTask(I, T) {
        let NewDay = Q.Info;
        NewDay.tasks = ReorderTasks(NewDay.tasks);
        NewDay.tasks[I] = T;
        SetupPopup("");
        Q.AlterDay(NewDay, Q.Today, Q.Mode);
        ShowInfo(-1, "");

    }

    //Deletes task
    //I = Index of task
    function DeleteTask(I) {
        let NewDay = Q.Info;
        NewDay.tasks = ReorderTasks(NewDay.tasks);
        NewDay.tasks = NewDay.tasks.toSpliced(I, 1);
        SetupPopup("");
        Q.AlterDay(NewDay, Q.Today, Q.Mode);
        ShowInfo(-1, "");
    }

    //Adjusts day background color based on sleep
    function GetSleepStyles(S) {

        if (S.napped && S.sleptIn) {
            return Day_S.SleptInNapped;
        }
        else if (!S.napped && S.sleptIn) {
            return Day_S.SleptIn;
        }
        else if (S.napped && !S.sleptIn) {
            return Day_S.Napped;
        }
        else {
            return Day_S.RegularWake;
        }
    }

    //Generates textarea based on the current task and full screen status
    //CT = CurrentTask
    //F = Full
    function SetupTextArea(CT, F) {

        let taClass = `${Day_S.Task_Notes} ${Basic_S.Chill_Scroll_Y}`;
        let MinButton = null;
        let rClass = Day_S.TC_Show;

        if (CT >= 0 && F) {
            taClass = `${Day_S.Task_Notes_Full} ${Basic_S.Chill_Scroll_Y}`;
            MinButton = <div className={Day_S.Task_Notes_MinButton} onClick={() => setFull(false)}>Minimize</div>;
            rClass = Day_S.Tasks_Container_Inner_Full;
        }
        else if (!(CT >= 0)) {
            taClass = Day_S.Task_Notes_Empty;
            rClass = Day_S.TC_Hide;
        }

        return (
            <div className={`${Day_S.Tasks_Container_Inner} ${rClass}`}>
                <textarea className={taClass} rows={5}
                    id={"DisplayedTaskInfo" + Q.Mode + Q.Today + "_ID"} onChange={() => TypingTaskNotes()} />
                {MinButton}
            </div>
        );
    }

    return (
        <div className={`${Day_Device[Q.Device]} ${Day_Mode[Q.Mode]} ${GetSleepStyles(Q.Sleep)}`}>

            {PopUp}

            <div className={Day_S.MenuBar}>
                <span className={Day_S.MinorBuffer} />
                <span className={Day_S.Date}>{Q.Today + ", " + Q.Info.day}</span>
                <CompleteTaskPercentage Mode={Q.Mode} Device={Q.Device} Tasks={Q.Info.tasks} />
                <span className={Day_S.LoaderBuffer} />
                <RoutineCheckup Mode={Q.Mode} Device={Q.Device} DayInfo={Q.Info} Today={Q.Today} AlterDay={Q.AlterDay}
                    ThisWeeksSchedule={GetImportantRoutine(Q.ThisWeeksSchedule)} RestOfCompletedRoutines={Q.RestOfCompletedRoutines} />
                <span className={Day_S.LoaderBuffer} /><span className={Day_S.LoaderBuffer} />
                <button className={Day_S.OverSlept} onClick={() => ToggleSleptIn()} />
                <span className={Day_S.MinorBuffer} />
                <button className={Day_S.Napping} onClick={() => ToggleNapped()} />
                <span className={Day_S.MinorBuffer} />
                <button className={Day_S.CreateTask} onClick={() => SetupPopup("Create")} />
                <span className={Day_S.MinorBuffer} />
                {CurrentTask >= 0 ? <button className={Day_S.FullScreenTask} onClick={() => setFull(true)} /> : null}
                <span className={Day_S.MinorBuffer} />
                {CurrentTask >= 0 && CurrentTask != Q.Info.tasks.length ? <button className={Day_S.EditTask} onClick={() => SetupPopup("Edit")} /> : null}
                <span className={Day_S.MinorBuffer} />
                {CurrentTask >= 0 && CurrentTask != Q.Info.tasks.length ? <button className={Day_S.CompeteTask} onClick={() => ToggleComplete()} /> : null}
            </div>

            <div className={Day_S.Tasks_Container}>

                <div className={`${Day_S.Tasks} ${Basic_S.Chill_Scroll_Y}`}>
                    {ReorderTasks(Q.Info.tasks).map((task, index) => (
                        <Mission key={index} index={index} Mode={Q.Mode} Device={Q.Device} Info={task} ShowInfo={ShowInfo} />
                    ))}
                    <div className={Day_S.Extra}
                        onClick={() => ShowInfo(Q.Info.tasks.length, Q.Info.extra)}>
                        <span className={Q.Info.extra && Q.Info.extra != "" ? Day_S.Misc_Filled : Day_S.Misc_Empty}>
                            Misc{Q.Info.extra != "" ? " (+)" : ""}
                        </span>
                    </div>
                </div>

                {SetupTextArea(CurrentTask, Full)}

            </div>

        </div>
    );
}

//Displays percent of complete task via a loading bar
function CompleteTaskPercentage(Q) {

    //Gets completeion percentage for adjusting style widths in TaskCompletionBar
    //T = Array of tasks
    //C = Status of tasks to get percentage of
    function GetPercent(T, C) {

        if (T && T.length != 0 && C) {

            let totalT = T.length;
            let totalC = 0;

            for (let i = 0; i < T.length; i++) {
                if (T[i].complete) {
                    totalC++;
                }
            }

            let completion = (totalC / totalT) * 100.0;

            if (C == "Complete") {
                return completion;
            }
            else {
                return 100.0 - completion;
            }
        }
        else if (T && T.length == 0) {
            return 0;
        }
        else {
            console.log("Error: Could not determine list of tasks to check for completion percentage");
            return "0.0%";
        }
    }

    return (
        <div className={TaskC_S.TaskCompletionBar}>
            <div className={TaskC_S.TCB_G} style={{ width: GetPercent(Q.Tasks, "Complete") + "%" }} />
            <div className={TaskC_S.TCB_R} style={{ width: GetPercent(Q.Tasks, "Incomplete") + "%" }} />
            <span className={TaskC_S.TCB_T}>Tasks</span>
        </div>
    );
}

//Dropdown menu od routines along with daily progress meter for them
function RoutineCheckup(Q) {

    //Converts provided time to seconds
    //T = Time (ex: 12:30 PM)
    function ConvertTimeToSeconds(T) {
        let theHours = T.split(":")[0];
        let theMinutes = T.split(":")[1][0] + T.split(":")[1][1];
        let theAPM = T.split(" ")[1];

        let theSeconds = (Number(theHours) != 12 ? (Number(theHours) * 60 * 60) : 0);
        theSeconds += (theAPM == "AM" ? 0 : (12 * 60 * 60));
        theSeconds += (theMinutes * 60);

        return theSeconds;
    }

    //Reorders provided array of routines by time
    //R = Array of JSON routines
    function OrderRout_Time(R) {

        let oldR = R;
        let newR = [];

        while (oldR.length > 0) {

            if (oldR.length == 1) {
                newR.push(oldR[0]);
                break;
            }

            let nextIndex = 0;
            let nextR = oldR[0];

            for (let i = 0; i < oldR.length; i++) {
                if (ConvertTimeToSeconds(nextR.time) > ConvertTimeToSeconds(oldR[i].time)) {
                    nextIndex = i;
                    nextR = oldR[i];
                }
                else if (ConvertTimeToSeconds(nextR.time) == ConvertTimeToSeconds(oldR[i].time)) {
                    if (nextR.chore > oldR[i].chore) {
                        nextIndex = i;
                        nextR = oldR[i];
                    }
                }
            }

            newR.push(nextR);
            oldR = oldR.toSpliced(nextIndex, 1);
        }

        return newR;
    }

    //Reorders provided array of routines by alphabet
    //R = Array of JSON routines
    function OrderRout_Alpha(R) {
        let oldR = R;
        let newR = [];

        while (oldR.length > 0) {

            if (oldR.length == 1) {
                newR.push(oldR[0]);
                break;
            }

            let nextIndex = 0;
            let nextR = oldR[0];

            for (let i = 0; i < oldR.length; i++) {
                if (nextR.chore > oldR[i].chore) {
                    nextIndex = i;
                    nextR = oldR[i];
                }
            }

            newR.push(nextR);
            oldR = oldR.toSpliced(nextIndex, 1);
        }

        return newR;
    }

    //Prepares to reorders provided array of routines by categorizing
    //R = Array of JSON routines
    function ReorderRoutines(R) {

        let T_D = R.filter(c => !c.days.includes("Week"));
        if (!Array.isArray(T_D)) {
            T_D = [T_D];
        }
        let U_D = T_D.filter(c => c.time == null);
        if (!Array.isArray(U_D)) {
            U_D = [U_D];
        }
        T_D = T_D.filter(c => c.time != null);
        if (!Array.isArray(T_D)) {
            T_D = [T_D];
        }

        let T_W = R.filter(c => c.days.includes("Week"));
        if (!Array.isArray(T_W)) {
            T_W = [T_W];
        }
        let U_W = T_W.filter(c => c.time == null);
        if (!Array.isArray(U_W)) {
            U_W = [U_W];
        }
        T_W = T_W.filter(c => c.time != null);
        if (!Array.isArray(T_W)) {
            T_W = [T_W];
        }

        T_D = OrderRout_Time(T_D);
        U_D = OrderRout_Alpha(U_D);
        T_W = OrderRout_Time(T_W);
        U_W = OrderRout_Alpha(U_W);

        return [...T_D, ...U_D, ...T_W, ...U_W];
    }

    //Get completion or incompletion percentage
    //A = Array of day's routines
    //C = Which status to get percent of
    function GetPercent(A, C) {
        if (A && C) {

            let ICR = 0;
            let CR = 0;

            for (let i = 0; i < A.length; i++) {
                if (A[i].complete && !A[i].choreInfo.days.includes("Week")) {
                    CR++;
                }
                else if (!A[i].complete && !A[i].choreInfo.days.includes("Week")) {
                    ICR++;
                }
            }

            if (CR + ICR == 0) {
                return 0.0;
            }
            else if (C == "Complete") {
                return (CR + 0.0) / (ICR + CR + 0.0) * 100.0;
            }
            else {
                return (ICR + 0.0) / (ICR + CR + 0.0) * 100.0;
            }
        }
        else {
            return 0.0
        }
    }

    //Creates an array provided day's routines with additonal info for dropdown menu
    //C = Array of already completed routines corresponding day
    //W = Array of already completed routines for rest of the week
    //S = Routines for the week
    function GenerateRoutineArray(C, W, S) {

        if (C && W && S) {

            let allChores = Q.Mode == 0 ? S.public : S.private;
            let Todays_R = allChores.filter(r => r.days.includes(Q.Today));
            Todays_R = ReorderRoutines(Todays_R);
            let Week_R = allChores.filter(r => r.days.includes("Week"));
            Week_R = ReorderRoutines(Week_R);
            let RA = [];

            for (let i = 0; i < Todays_R.length; i++) {
                let someChore = {
                    choreInfo: Todays_R[i],
                    complete: false
                }
                if (ChoreInArray(C, Todays_R[i])) {
                    someChore.complete = true;

                }
                RA.push(someChore);
            }

            for (let i = 0; i < Week_R.length; i++) {

                let someChore = {
                    choreInfo: Week_R[i],
                    complete: false
                }

                if (!ChoreInArray(W, Week_R[i])) {

                    if (ChoreInArray(C, Week_R[i])) {
                        someChore.complete = true;
                    }

                    RA.push(someChore);
                }
            }
            return RA;
        }
        else {
            return [];
        }

    }

    //Changes completion status of provided routine
    //D = Which day of week
    //R = Routine to changes status of
    //S = New status
    function ChangeCompletionStatus(D, R, S) {

        let NewDay = Q.DayInfo;

        if (S == "Complete") {
            NewDay.routinesDone.push(R);
        }
        else if (S == "Incomplete") {
            NewDay.routinesDone = RemoveChoreFromArray(R, NewDay.routinesDone);
        }
        else {
            console.log("Error: Could not determine new status of routine");
        }

        Q.AlterDay(NewDay, D, Q.Mode);
    }

    return (
        <div className={RoutineC_S.Vessal}>

            <div className={RoutineC_S.Vessal_Percentage}>

                <div className={RoutineC_S.TCB_G}
                    style={{ width: GetPercent(GenerateRoutineArray(Q.DayInfo.routinesDone, Q.RestOfCompletedRoutines, Q.ThisWeeksSchedule), "Complete") + "%" }} />

                <div className={RoutineC_S.TCB_R}
                    style={{ width: GetPercent(GenerateRoutineArray(Q.DayInfo.routinesDone, Q.RestOfCompletedRoutines, Q.ThisWeeksSchedule), "Incomplete") + "%" }} />

                <span className={RoutineC_S.TCB_T}>Routines</span>

            </div>

            {Q.Today && Q.DayInfo && Q.DayInfo.routinesDone && Q.ThisWeeksSchedule ?
                GenerateRoutineArray(Q.DayInfo.routinesDone, Q.RestOfCompletedRoutines, Q.ThisWeeksSchedule).map((R, index) => (
                    <Errand Mode={Q.Mode} Device={Q.Device} key={index} Today={Q.Today} Chore={R.choreInfo} Status={R.complete} ChangeCompletionStatus={ChangeCompletionStatus} />
                ))
                : null}

        </div>
    );
}

//Dropdown menu entries for routines
function Errand(Q) {
    return (
        <div className={RoutineC_S.Errand} onClick={() => Q.ChangeCompletionStatus(Q.Today, Q.Chore, Q.Status ? "Incomplete" : "Complete")}
            style={{ color: Q.Status ? "rgb(0, 250, 0, 1)" : "rgb(250, 0, 0, 1)" }}>
            {Q.Chore.chore}
        </div>
    );
}

//Displays info for a daily task
function Mission(Q) {

    const Mission_Device = [Mission_S.Computer, Mission_S.Mobile];
    const Mission_Mode = [Mission_S.Public, Mission_S.Private];

    return (
        <button className={`${Mission_Device[Q.Device]} ${Mission_Mode[Q.Mode]}`}
            style={{ color: Q.Info.complete ? "rgb(0, 255, 0, 1)" : "rgb(255, 0, 0, 1)" }}
            onClick={() => Q.ShowInfo(Q.index, Q.Info.notes)}>
            {Q.Info.goal}<i>{Q.Info.notes != "" ? " (+)" : ""}</i>
        </button>
    );
}

//Progress review for weekly agenda
function Review(Q) {

    const Review_Device = [Review_S.Computer, Review_S.Mobile];
    const Review_Mode = [Review_S.Public, Review_S.Private];

    const NoteID = "ReviewNote" + Q.Mode + Q.Today + "_ID";

    //Updates textarea when NotepadMode changes
    useEffect(() => {
        document.getElementById(NoteID).value = GetTextData(Q.NotepadMode);
    }, [Q.NotepadMode]);

    //Updates notes to agenda
    function TypingReview() {
        if (Q.NotepadMode && Q.NotepadMode != "") {
            let RM = Q.NotepadMode == "Review_R" ? "Review" : "Future";
            Q.AlterReview(document.getElementById(NoteID).value, RM, Q.Mode);
        }
    }

    //Gets text data based on current notepad mode
    //R = NotepadMode
    function GetTextData(R) {
        if (R == "Review_R") {
            return Q.Info.accomplished;
        }
        else if (R == "Review_P") {
            return Q.Info.plans;
        }
        else {
            return "";
        }
    }

    return (
        <div className={`${Review_Device[Q.Device]} ${Review_Mode[Q.Mode]}`}>
            <div className={Review_S.Inner_Vessal}>
                <textarea rows={5} className={`${Review_S.ReviewField} ${Basic_S.Chill_Scroll_Y}`} id={NoteID} onChange={() => TypingReview()} />
            </div>
        </div>
    );
}

//Weekly agenda notes
function Memo(Q) {

    const Memo_Device = [Memo_S.Computer, Memo_S.Mobile];
    const Memo_Mode = [Memo_S.Public, Memo_S.Private];
    const Memo_Screen = [Memo_S.Min, Memo_S.Full];

    const NoteID = "AgendaNote" + Q.Mode + Q.Today + "_ID";

    //Swaps visible data based on current mode
    useEffect(() => {
        document.getElementById(NoteID).value = Q.Info;
    }, [Q.Mode]);

    //Updates note changes to agenda
    function TypingGeneralAgendaNotes() {
        let NewNotes = document.getElementById(NoteID).value;
        Q.AlterWeeklyNotes(NewNotes, Q.Mode);
    }

    return (
        <div className={`${Memo_Device[Q.Device]} ${Memo_Mode[Q.Mode]} ${Memo_Screen[Q.FullScreen ? 1 : 0]}`}>
            {Q.FullScreen ?
                <button className={Memo_S.Reduce} onClick={() => Q.setFullMode(false)}>Minimize</button>
                : null}
            <div className={Memo_S.Inner_Vessal}>
                <textarea defaultValue={Q.Info} className={`${Memo_S.Notes} ${Basic_S.Chill_Scroll_Y}`} id={NoteID} onChange={() => TypingGeneralAgendaNotes()} rows={5} />
            </div>
        </div>
    );
}

export { Week };