import { useRef, useEffect, useState, useReducer } from "react";
import { ReorderTasks } from "../../../Backend/HandleAgenda.js";
import { CreateNewTask, EditOldTask } from "./PopUps.jsx";
import {
    GetImportantRoutine, CompleteWeekRoutineMinus,
    EqualRoutines, BothRoutineDaysArraysHaveSame, ChoreInArray, RemoveChoreFromArray
} from "../../../Backend/HandleRoutine.js";
import { days } from "../../../Backend/HandleDates.js";
import { TurnIntoArray } from "../../../Backend/HandleGeneral.js";
import { RC, RS } from "../../../Backend/HandleReact.js";
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

    const [UpdateWeeklyProgressSignal, setUpdateWeeklyProgressSignal] = useState(true);
    const [Signal_WeeklyRoutine, setSignal_WeeklyRoutine] = useState(false);
    const [Signal_Sunday, setSignal_Sunday] = useState(false);
    const [Signal_Monday, setSignal_Monday] = useState(false);
    const [Signal_Tuesday, setSignal_Tuesday] = useState(false);
    const [Signal_Wednesday, setSignal_Wednesday] = useState(false);
    const [Signal_Thursday, setSignal_Thursday] = useState(false);
    const [Signal_Friday, setSignal_Friday] = useState(false);
    const [Signal_Saturday, setSignal_Saturday] = useState(false);

    const ObjectiveTotal = useRef({
        tasks: 0,
        routines: 0
    });

    //Hides review and memo sections when swapping modes or week
    useEffect(() => {
        UpdateObjectiveCount();
        setNotepadMode(null);
    }, [Q.Mode, Q.Signal_AgendaSwapped]);

    //Updates the count of current tasks/routines
    function UpdateObjectiveCount() {
        if (Q.Mode == 0) {
            RC(ObjectiveTotal).tasks =
                Q.Agenda.public.daily.sunday.tasks.length + Q.Agenda.public.daily.monday.tasks.length +
                Q.Agenda.public.daily.tuesday.tasks.length + Q.Agenda.public.daily.wednesday.tasks.length +
                Q.Agenda.public.daily.thursday.tasks.length + Q.Agenda.public.daily.friday.tasks.length +
                Q.Agenda.public.daily.saturday.tasks.length;
        }
        else if (Q.Mode == 1) {
            RC(ObjectiveTotal).tasks =
                Q.Agenda.private.daily.sunday.tasks.length + Q.Agenda.private.daily.monday.tasks.length +
                Q.Agenda.private.daily.tuesday.tasks.length + Q.Agenda.private.daily.wednesday.tasks.length +
                Q.Agenda.private.daily.thursday.tasks.length + Q.Agenda.private.daily.friday.tasks.length +
                Q.Agenda.private.daily.saturday.tasks.length;
        }
        RC(ObjectiveTotal).routines =
            TurnIntoArray(Q.ThisWeeksSchedule.public.filter(r => r.important == true)).length +
            TurnIntoArray(Q.ThisWeeksSchedule.private.filter(r => r.important == true)).length;
    }

    //Updates agenda with day's changes
    //Daily = Daily info with new changes
    //Day = Which day of the week
    //M = Which mode (public or private)
    function AlterDay(Daily, Day, M) {
        if (Daily == undefined || Daily == null) {
            throw new Error("Error: Unknown 'Daily' info!");
        }
        else if (M == 0 || M == 1) {
            switch (Day) {
                case "Sunday":
                    M == 0 ? Q.Agenda.public.daily.sunday = Daily : Q.Agenda.private.daily.sunday = Daily;
                    break;
                case "Monday":
                    M == 0 ? Q.Agenda.public.daily.monday = Daily : Q.Agenda.private.daily.monday = Daily;;
                    break;
                case "Tuesday":
                    M == 0 ? Q.Agenda.public.daily.tuesday = Daily : Q.Agenda.private.daily.tuesday = Daily;
                    break;
                case "Wednesday":
                    M == 0 ? Q.Agenda.public.daily.wednesday = Daily : Q.Agenda.private.daily.wednesday = Daily;
                    break;
                case "Thursday":
                    M == 0 ? Q.Agenda.public.daily.thursday = Daily : Q.Agenda.private.daily.thursday = Daily;
                    break;
                case "Friday":
                    M == 0 ? Q.Agenda.public.daily.friday = Daily : Q.Agenda.private.daily.friday = Daily;
                    break;
                case "Saturday":
                    M == 0 ? Q.Agenda.public.daily.saturday = Daily : Q.Agenda.private.daily.saturday = Daily;
                    break;
                default:
                    throw new Error("Error: Could not determine which day to update");
            }
        }
        else {
            throw new Error("Error: Could not determine which mode to update day to");
        }
        Q.Mark_Unsaved("Agenda", true);
    }

    //Updates agenda review notes
    //N = New review notes
    //T = Type of notes
    //M = Which mode (public or private)
    function AlterReview(N, T, M) {
        if (M == 0) {
            if (T == "Review") {
                Q.Agenda.public.review.accomplished = N;
            }
            else if (T == "Future") {
                Q.Agenda.public.review.plans = N;
            }
            else {
                throw new Error("Error: Could not determine where to put notes under review section");
            }
        }
        else if (M == 1) {
            if (T == "Review") {
                Q.Agenda.private.review.accomplished = N;
            }
            else if (T == "Future") {
                Q.Agenda.private.review.plans = N;
            }
            else {
                throw new Error("Error: Could not determine where to put notes under review section");
            }
        }
        else {
            throw new Error("Error: Could not determine which mode to update review");
        }
        Q.Mark_Unsaved("Agenda", true);
    }

    //Updates agenda with weekly note changes
    //N = New weekly notes
    //M = Which mode (public or private)
    function AlterWeeklyNotes(N, M) {
        if (M == 0) {
            Q.Agenda.public.notes = N;
        }
        else if (M == 1) {
            Q.Agenda.private.notes = N;
        }
        else {
            throw new Error("Error: Could not determine which mode to update notes to");
        }
        Q.Mark_Unsaved("Agenda", true);
    }

    //Adds task to given day
    //W = Which day
    //T = Task
    function AddTaskToDay(W, T) {
        if (T == undefined || T == null) {
            throw new Error("Error: Unknown task to add");
        }
        else if (Q.Mode == 0 || Q.Mode == 1) {
            switch (W) {
                case "Sunday":
                    Q.Mode == 0 ? Q.Agenda.public.daily.sunday.tasks.push(T) : Q.Agenda.private.daily.sunday.tasks.push(T);
                    setSignal_Sunday(!Signal_Sunday);
                    break;
                case "Monday":
                    Q.Mode == 0 ? Q.Agenda.public.daily.monday.tasks.push(T) : Q.Agenda.private.daily.monday.tasks.push(T);
                    setSignal_Monday(!Signal_Monday);
                    break;
                case "Tuesday":
                    Q.Mode == 0 ? Q.Agenda.public.daily.tuesday.tasks.push(T) : Q.Agenda.private.daily.tuesday.tasks.push(T);
                    setSignal_Tuesday(!Signal_Tuesday);
                    break;
                case "Wednesday":
                    Q.Mode == 0 ? Q.Agenda.public.daily.wednesday.tasks.push(T) : Q.Agenda.private.daily.wednesday.tasks.push(T);
                    setSignal_Wednesday(!Signal_Wednesday);
                    break;
                case "Thursday":
                    Q.Mode == 0 ? Q.Agenda.public.daily.thursday.tasks.push(T) : Q.Agenda.private.daily.thursday.tasks.push(T);
                    setSignal_Thursday(!Signal_Thursday);
                    break;
                case "Friday":
                    Q.Mode == 0 ? Q.Agenda.public.daily.friday.tasks.push(T) : Q.Agenda.private.daily.friday.tasks.push(T);;
                    setSignal_Friday(!Signal_Friday);
                    break;
                case "Saturday":
                    Q.Mode == 0 ? Q.Agenda.public.daily.saturday.tasks.push(T) : Q.Agenda.private.daily.saturday.tasks.push(T);
                    setSignal_Saturday(!Signal_Saturday);
                    break;
                default:
                    throw new Error("Error: Could not determine which day to move/add task");
            }
        }
        else {
            throw new Error("Error: Failed to add/move task to day");
        }
        Q.Mark_Unsaved("Agenda", true);
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

    //Gets completed routines of all days of provided week except choosen day
    //M = Mode (public vs private)
    //D = Day of week to not pull data from
    function ObtainCompleteWeekRoutines_ExceptDay(M, D) {
        return CompleteWeekRoutineMinus(Q.Agenda, M, D);
    }

    return (
        <div className={`${Week_Device[Q.Device]} ${Week_Mode[Q.Mode]} ${Q.Themes.MC_A_B}`}>
            <WeeklyProgressBar Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} Agenda={Q.Agenda} Schedule={Q.ThisWeeksSchedule}
                UpdateWeeklyProgressSignal={UpdateWeeklyProgressSignal} Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                ObjectiveTotal={RC(ObjectiveTotal)} UpdateObjectiveCount={UpdateObjectiveCount} />
            <div className={Week_S.DayContainer}>
                {
                    <Day Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode} Signal_Day={Signal_Sunday}
                        TheDate={Q.Agenda.startDate} Today={"Sunday"} Info_Public={Q.Agenda.public.daily.sunday} Info_Private={Q.Agenda.private.daily.sunday}
                        AlterDay={AlterDay} Sleep={Q.Agenda.sleep.sunday}
                        ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={ObtainCompleteWeekRoutines_ExceptDay} AddTaskToDay={AddTaskToDay}
                        Mark_Unsaved={Q.Mark_Unsaved} UnsavedAgenda={Q.UnsavedAgenda} Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                        UpdateWeeklyProgressSignal={UpdateWeeklyProgressSignal} setUpdateWeeklyProgressSignal={setUpdateWeeklyProgressSignal}
                        Signal_WeeklyRoutine={Signal_WeeklyRoutine} setSignal_WeeklyRoutine={setSignal_WeeklyRoutine} />
                }
                {
                    <Day Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode} Signal_Day={Signal_Monday}
                        TheDate={Q.Agenda.startDate} Today={"Monday"} Info_Public={Q.Agenda.public.daily.monday} Info_Private={Q.Agenda.private.daily.monday}
                        AlterDay={AlterDay} Sleep={Q.Agenda.sleep.monday}
                        ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={ObtainCompleteWeekRoutines_ExceptDay} AddTaskToDay={AddTaskToDay}
                        Mark_Unsaved={Q.Mark_Unsaved} UnsavedAgenda={Q.UnsavedAgenda} Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                        UpdateWeeklyProgressSignal={UpdateWeeklyProgressSignal} setUpdateWeeklyProgressSignal={setUpdateWeeklyProgressSignal}
                        Signal_WeeklyRoutine={Signal_WeeklyRoutine} setSignal_WeeklyRoutine={setSignal_WeeklyRoutine} />
                }
                {
                    <Day Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode} Signal_Day={Signal_Tuesday}
                        TheDate={Q.Agenda.startDate} Today={"Tuesday"} Info_Public={Q.Agenda.public.daily.tuesday} Info_Private={Q.Agenda.private.daily.tuesday}
                        AlterDay={AlterDay} Sleep={Q.Agenda.sleep.tuesday}
                        ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={ObtainCompleteWeekRoutines_ExceptDay} AddTaskToDay={AddTaskToDay}
                        Mark_Unsaved={Q.Mark_Unsaved} UnsavedAgenda={Q.UnsavedAgenda} Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                        UpdateWeeklyProgressSignal={UpdateWeeklyProgressSignal} setUpdateWeeklyProgressSignal={setUpdateWeeklyProgressSignal}
                        Signal_WeeklyRoutine={Signal_WeeklyRoutine} setSignal_WeeklyRoutine={setSignal_WeeklyRoutine} />
                }
                {
                    <Day Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode} Signal_Day={Signal_Wednesday}
                        TheDate={Q.Agenda.startDate} Today={"Wednesday"} Info_Public={Q.Agenda.public.daily.wednesday} Info_Private={Q.Agenda.private.daily.wednesday}
                        AlterDay={AlterDay} Sleep={Q.Agenda.sleep.wednesday}
                        ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={ObtainCompleteWeekRoutines_ExceptDay} AddTaskToDay={AddTaskToDay}
                        Mark_Unsaved={Q.Mark_Unsaved} UnsavedAgenda={Q.UnsavedAgenda} Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                        UpdateWeeklyProgressSignal={UpdateWeeklyProgressSignal} setUpdateWeeklyProgressSignal={setUpdateWeeklyProgressSignal}
                        Signal_WeeklyRoutine={Signal_WeeklyRoutine} setSignal_WeeklyRoutine={setSignal_WeeklyRoutine} />
                }
                {
                    <Day Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode} Signal_Day={Signal_Thursday}
                        TheDate={Q.Agenda.startDate} Today={"Thursday"} Info_Public={Q.Agenda.public.daily.thursday} Info_Private={Q.Agenda.private.daily.thursday}
                        AlterDay={AlterDay} Sleep={Q.Agenda.sleep.thursday}
                        ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={ObtainCompleteWeekRoutines_ExceptDay} AddTaskToDay={AddTaskToDay}
                        Mark_Unsaved={Q.Mark_Unsaved} UnsavedAgenda={Q.UnsavedAgenda} Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                        UpdateWeeklyProgressSignal={UpdateWeeklyProgressSignal} setUpdateWeeklyProgressSignal={setUpdateWeeklyProgressSignal}
                        Signal_WeeklyRoutine={Signal_WeeklyRoutine} setSignal_WeeklyRoutine={setSignal_WeeklyRoutine} />
                }
                {
                    <Day Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode} Signal_Day={Signal_Friday}
                        TheDate={Q.Agenda.startDate} Today={"Friday"} Info_Public={Q.Agenda.public.daily.friday} Info_Private={Q.Agenda.private.daily.friday}
                        AlterDay={AlterDay} Sleep={Q.Agenda.sleep.friday}
                        ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={ObtainCompleteWeekRoutines_ExceptDay} AddTaskToDay={AddTaskToDay}
                        Mark_Unsaved={Q.Mark_Unsaved} UnsavedAgenda={Q.UnsavedAgenda} Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                        UpdateWeeklyProgressSignal={UpdateWeeklyProgressSignal} setUpdateWeeklyProgressSignal={setUpdateWeeklyProgressSignal}
                        Signal_WeeklyRoutine={Signal_WeeklyRoutine} setSignal_WeeklyRoutine={setSignal_WeeklyRoutine} />
                }
                {
                    <Day Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode} Signal_Day={Signal_Saturday}
                        TheDate={Q.Agenda.startDate} Today={"Saturday"} Info_Public={Q.Agenda.public.daily.saturday} Info_Private={Q.Agenda.private.daily.saturday}
                        AlterDay={AlterDay} Sleep={Q.Agenda.sleep.saturday}
                        ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={ObtainCompleteWeekRoutines_ExceptDay} AddTaskToDay={AddTaskToDay}
                        Mark_Unsaved={Q.Mark_Unsaved} UnsavedAgenda={Q.UnsavedAgenda} Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                        UpdateWeeklyProgressSignal={UpdateWeeklyProgressSignal} setUpdateWeeklyProgressSignal={setUpdateWeeklyProgressSignal}
                        Signal_WeeklyRoutine={Signal_WeeklyRoutine} setSignal_WeeklyRoutine={setSignal_WeeklyRoutine} />
                }
            </div>
            <div className={Week_S.Notepad}>
                <div className={`${Week_S.Notepad_ButtonVessal} ${Q.Themes.MC_A_MR_B}`}>
                    <button onClick={() => ToggleNotepadMode("Review_P")} onDoubleClick={() => Q.setReviewFullMode(Q.ReviewFullMode ? false : true)}
                        className={NotepadMode == "Review_P" ? `${Week_S.Notepad_Button_Active} ${Q.Themes.MC_A_MR_B_BA}` : `${Week_S.Notepad_Button_Inactive} ${Q.Themes.MC_A_MR_B_BI}`}>
                        Plans<i>{Q.Mode == 0 ? (Q.Agenda.public.review.plans != "" ? " (+)" : "") : (Q.Agenda.private.review.plans != "" ? " (+)" : "")}</i>
                    </button>
                    <div className={Week_S.Notepad_ButtonBuffer}></div>

                    <button onClick={() => ToggleNotepadMode("Review_R")} onDoubleClick={() => Q.setReviewFullMode(Q.ReviewFullMode ? false : true)}
                        className={NotepadMode == "Review_R" ? `${Week_S.Notepad_Button_Active} ${Q.Themes.MC_A_MR_B_BA}` : `${Week_S.Notepad_Button_Inactive} ${Q.Themes.MC_A_MR_B_BI}`}>
                        Review<i>{Q.Mode == 0 ? (Q.Agenda.public.review.accomplished != "" ? " (+)" : "") : (Q.Agenda.private.review.accomplished != "" ? " (+)" : "")}</i>
                    </button>
                    <div className={Week_S.Notepad_ButtonBuffer}></div>

                    <button onClick={() => ToggleNotepadMode("Memo")} onDoubleClick={() => Q.setMemoFullMode(Q.MemoFullMode ? false : true)}
                        className={NotepadMode == "Memo" ? `${Week_S.Notepad_Button_Active} ${Q.Themes.MC_A_MR_B_BA}` : `${Week_S.Notepad_Button_Inactive} ${Q.Themes.MC_A_MR_B_BI}`}>
                        Notes<i>{Q.Mode == 0 ? (Q.Agenda.public.notes != "" ? " (+)" : "") : (Q.Agenda.private.notes != "" ? " (+)" : "")}</i>
                    </button>
                </div>
                <div className={Week_S.NotepadArea}>
                    {NotepadMode && NotepadMode.includes("Review") ?
                        <Review Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} NotepadMode={NotepadMode} FullScreen={Q.ReviewFullMode} setFullMode={Q.setReviewFullMode}
                            Info={Q.Mode == 0 ? Q.Agenda.public.review : Q.Agenda.private.review} AlterReview={AlterReview} />
                        : null}
                    {NotepadMode && NotepadMode == "Memo" ?
                        <Memo Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} FullScreen={Q.MemoFullMode} setFullMode={Q.setMemoFullMode}
                            Info={Q.Mode == 0 ? Q.Agenda.public.notes : Q.Agenda.private.notes} AlterWeeklyNotes={AlterWeeklyNotes} />
                        : null}
                </div>
            </div>
        </div>
    );
}

//Displays total progress for the week
function WeeklyProgressBar(Q) {

    const [P_Status, setP_Status] = useState({
        public: {
            percentage: 0.0,
            percentageT: 0.0,
            color: Q.Themes.MC_A_PM_PU_C
        },
        private: {
            percentage: 0.0,
            percentageT: 0.0,
            color: Q.Themes.MC_A_PM_PR_C
        },
        average: 0.0,
        currentMode_P: 0.0,
        otherMode_P: 0.0,
        red_P: 100.0,
        W_P: 100.0,
        priv_Z: 3,
        pub_Z: 3
    });
    const Update_Refs = useRef(null);

    //Determines when to update percentage data
    useEffect(() => {
        if (RC(Update_Refs) == null || Q.Signal_AgendaSwapped != RC(Update_Refs).Agenda_Signal) {
            RS(Update_Refs, {
                Agenda_Signal: structuredClone(Q.Signal_AgendaSwapped),
                Week_Signal: structuredClone(Q.UpdateWeeklyProgressSignal),
                Mode_Signal: structuredClone(Q.Mode)
            });
            Update_PS("Both");
        }
        else if (Q.Mode != RC(Update_Refs).Mode_Signal) {
            RC(Update_Refs).Mode_Signal = structuredClone(Q.Mode);
            let old = structuredClone(P_Status);
            old.currentMode_P = Q.Mode == 0 ? old.public.percentageT : old.private.percentageT;
            old.otherMode_P = Q.Mode == 0 ? old.private.percentageT : old.public.percentageT;
            setP_Status(old);
        }
        else if (Q.UpdateWeeklyProgressSignal != RC(Update_Refs).Week_Signal) {
            RC(Update_Refs).Week_Signal = structuredClone(Q.UpdateWeeklyProgressSignal);
            Update_PS(Q.Mode == 1 ? "Private" : "Public");
        }
    }, [Q.Signal_AgendaSwapped, Q.UpdateWeeklyProgressSignal, Q.Mode]);

    //Updates calculations for P_Status
    //M = Mode(s)
    function Update_PS(M) {
        let old = structuredClone(P_Status);

        if (M === "Private") {
            old.private.percentage = GetPercentage("Complete", 1);
            old.private.percentageT = Math.trunc(old.private.percentage);
        }
        else if (M === "Public") {
            old.public.percentage = GetPercentage("Complete", 0);
            old.public.percentageT = Math.trunc(old.public.percentage);
        }
        else {
            old.public.percentage = GetPercentage("Complete", 0);
            old.private.percentage = GetPercentage("Complete", 1);
            old.public.percentageT = Math.trunc(old.public.percentage);
            old.private.percentageT = Math.trunc(old.private.percentage);
        }
        old.average = Math.trunc((old.public.percentage + old.private.percentage) / 2.0);

        if (old.public.percentage == old.private.percentage) {
            old.public.color = Q.Themes.MC_A_TC_B;
            old.private.color = Q.Themes.MC_A_TC_B;
        }
        else if (old.public.percentage > old.private.percentage) {
            old.public.color = Q.Themes.MC_A_PM_PU_C;
            old.private.color = Q.Themes.MC_A_TC_B;
        }
        else if (old.public.percentage < old.private.percentage) {
            old.public.color = Q.Themes.MC_A_TC_B;
            old.private.color = Q.Themes.MC_A_PM_PR_C;
        }
        else {
            old.public.color = Q.Themes.MC_A_PM_PU_C;
            old.private.color = Q.Themes.MC_A_PM_PR_C;
            throw new Error("Error: Could not determine mode for progress bar color!");
        }

        old.currentMode_P = Q.Mode == 0 ? old.public.percentageT : old.private.percentageT;
        old.otherMode_P = Q.Mode == 0 ? old.private.percentageT : old.public.percentageT;

        Q.UpdateObjectiveCount();
        if (Q.ObjectiveTotal.tasks + Q.ObjectiveTotal.routines > 0) {
            old.red_P = 100.0 - (old.public.percentage >= old.private.percentage ? old.private.percentage : old.public.percentage);
            old.W_P = P_Status.public.percentage >= P_Status.private.percentage ? P_Status.public.percentage : P_Status.private.percentage;
        }
        else {
            old.red_P = 0.0;
            old.W_P = 100.0;
        }

        old.priv_Z = old.public.percentage >= old.private.percentage ? 4 : 3;
        old.pub_Z = old.public.percentage <= old.private.percentage ? 4 : 3;

        setP_Status(old);
    }

    //Returns a JSON value holding number of complete and incomplete tasks based on provided day data
    //D = Day data
    function GetTaskCompletionFromDay(D) {
        // let tasks = structuredClone(D.tasks);
        let tasks = TurnIntoArray(structuredClone(D.tasks).filter(c => c.important));
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
    //M = Mode (Public vs Private)
    function GetPercentage(S, M) {

        let A = M == 0 ? Q.Agenda.public : Q.Agenda.private;
        let R = M == 0 ? GetImportantRoutine(Q.Schedule).public : GetImportantRoutine(Q.Schedule).private;

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
        <div className={`${Progress_S.Bar} ${Q.Themes.MC_A_SP_B}`}>

            <div className={`${Progress_S.PCB_Public} ${P_Status.public.color}`} style={{
                width: P_Status.public.percentage + "%",
                zIndex: P_Status.pub_Z
            }}
            />
            <div className={`${Progress_S.PCB_Private} ${P_Status.private.color}`} style={{
                width: P_Status.private.percentage + "%",
                zIndex: P_Status.priv_Z
            }} />

            <div className={`${Progress_S.PCB_R} ${Q.Themes.MC_A_TI_B}`}
                style={{ width: P_Status.red_P + "%" }} />

            <div className={`${Progress_S.PCB_W} ${Q.Themes.MC_A_SP_B}`}
                style={{ width: P_Status.W_P + "%" }} />

            <span className={Progress_S.PCB_T}>
                {P_Status.average}%
                {" ("}
                {P_Status.currentMode_P}%/
                {P_Status.otherMode_P}%
                {")"}
            </span>
        </div>
    );
}

//Individual day of weekly agenda
function Day(Q) {

    const Day_Device = [Day_S.Computer, Day_S.Mobile];
    const Day_Mode = [Day_S.Public, Day_S.Private];

    const [Signal_Progress_Tasks, setSignal_Progress_Tasks] = useState(false);

    const [Days_Sleep, setDays_Sleep] = useState(structuredClone(Q.Sleep));

    const [PopUp, setPopUp] = useState(null);

    const [CurrentTask, setCurrentTask] = useState(-1);

    const [Full, setFull] = useState(false);

    const [UI_Day_Info, setUI_Day_Info] = useState(Q.Mode == 0 ? Q.Info_Public : Q.Info_Private);

    const Update_Ref = useRef(null);

    const TaskNotesLengths = useRef({
        past: 0,
        now: 0
    });

    //Update data when needed
    useEffect(() => {
        if (RC(Update_Ref) == null) {
            RS(Update_Ref, {
                mode_signal: structuredClone(Q.Mode),
                agenda_signal: structuredClone(Q.Signal_AgendaSwapped),
                taskFull_signal: structuredClone(Full),
                popFull_signal: PopUp == null ? false : true,
                day_signal: structuredClone(Q.Signal_Day)

            });
            ReOrder_Tasks("Both");
            UpdateStateCopy_Info();
        }
        else if (Q.Mode != RC(Update_Ref).mode_signal || Q.Signal_AgendaSwapped != RC(Update_Ref).agenda_signal) {
            RC(Update_Ref).mode_signal = structuredClone(Q.Mode);
            RC(Update_Ref).agenda_signal = structuredClone(Q.Signal_AgendaSwapped);
            setDays_Sleep(structuredClone(Q.Sleep));
            ShowInfo(-1, "");
            UpdateStateCopy_Info();
        }
        else if (RC(Update_Ref).taskFull_signal != Full) {
            RC(Update_Ref).taskFull_signal = structuredClone(Full);
            Q.setTaskFullMode(Full);
        }
        else if (RC(Update_Ref).popup_signal != (PopUp == null ? false : true)) {
            RC(Update_Ref).popup_signal = PopUp == null ? false : true;
            Q.setPopUpFullMode(PopUp != null ? true : false);
        }
        else if (RC(Update_Ref).day_signal != Q.Signal_Day) {
            RC(Update_Ref).day_signal = structuredClone(Q.Signal_Day);
            UpdateStateCopy_Info();
        }
    }, [Full, PopUp, Q.Mode, Q.Signal_AgendaSwapped, Q.Signal_Day]);

    //Updates front end copy of day data when the current task note switches between empty or filled
    //A = Current task note
    function Apply_TaskNotesLengths(A) {
        let pastV = structuredClone(TaskNotesLengths.current.now);
        let nowV = (A != undefined && A != null && A != "" && A.length > 0) ? structuredClone(A.length) : 0;
        TaskNotesLengths.current.past = pastV;
        TaskNotesLengths.current.now = nowV;
        if ((pastV > 0 && nowV == 0) || (nowV > 0 && pastV == 0)) {
            UpdateStateCopy_Info();
        }
    }

    //Reorders tasks
    //M = Mode (public vs private)
    function ReOrder_Tasks(M) {
        if (M == undefined || M == null) {
            Q.Mode == 0 ? Q.Info_Public.tasks = ReorderTasks(Q.Info_Public.tasks) : Q.Info_Private.tasks = ReorderTasks(Q.Info_Private.tasks);
        }
        else if (M == 0 || M == "Public") {
            Q.Info_Public.tasks = ReorderTasks(Q.Info_Public.tasks);
        }
        else if (M == 1 || M == "Private") {
            Q.Info_Private.tasks = ReorderTasks(Q.Info_Private.tasks);
        }
        else if (M == "Both") {
            Q.Info_Public.tasks = ReorderTasks(Q.Info_Public.tasks);
            Q.Info_Private.tasks = ReorderTasks(Q.Info_Private.tasks);
        }
        else {
            throw new Error("Error: Could not determine which tasks to reorder based on mode");
        }
    }

    //Updates front end copy of data for the day
    function UpdateStateCopy_Info() {
        setUI_Day_Info(Q.Mode == 0 ? structuredClone(Q.Info_Public) : structuredClone(Q.Info_Private));
        Q.setUpdateWeeklyProgressSignal(!Q.UpdateWeeklyProgressSignal);
    }

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
            Apply_TaskNotesLengths(N);
        }
    }

    //Toggles the slept in status for this day
    function ToggleSleptIn() {
        let qs = structuredClone(Q.Sleep);
        qs.sleptIn = !qs.sleptIn;
        setDays_Sleep(qs);
        Q.Sleep.sleptIn = !Q.Sleep.sleptIn;
        Q.Mark_Unsaved("Agenda", true);
    }

    //Toggles the napped status for this day
    function ToggleNapped() {
        let qs = structuredClone(Q.Sleep);
        qs.napped = !qs.napped;
        setDays_Sleep(qs);
        Q.Sleep.napped = !Q.Sleep.napped;
        Q.Mark_Unsaved("Agenda", true);
    }

    //Toggles completion of current task
    function ToggleComplete() {
        if (Q.Mode == 0 && Q.Info_Public.tasks[CurrentTask].complete) {
            Q.Info_Public.tasks[CurrentTask].complete = false;
        }
        else if (Q.Mode == 1 && Q.Info_Private.tasks[CurrentTask].complete) {
            Q.Info_Private.tasks[CurrentTask].complete = false;
        }
        else if (Q.Mode == 0) {
            Q.Info_Public.tasks[CurrentTask].complete = true;
        }
        else if (Q.Mode == 1) {
            Q.Info_Private.tasks[CurrentTask].complete = true;
        }
        else {
            throw new Error("Error: Failed to toggle task completion");
        }
        UpdateStateCopy_Info();
        setSignal_Progress_Tasks(!Signal_Progress_Tasks);
        Q.Mark_Unsaved("Agenda", true);
    }

    //Updates note to agenda
    function TypingTaskNotes() {
        if (CurrentTask >= 0) {
            let T_Notes = document.getElementById("DisplayedTaskInfo" + Q.Mode + Q.Today + "_ID").value;
            if (Q.Mode == 0) {
                if (CurrentTask != Q.Info_Public.tasks.length) {
                    Q.Info_Public.tasks[CurrentTask].notes = T_Notes;
                    UI_Day_Info.tasks[CurrentTask].notes = T_Notes;
                }
                else {
                    Q.Info_Public.extra = T_Notes;
                    UI_Day_Info.extra = T_Notes;
                }
            }
            else if (Q.Mode == 1) {
                if (CurrentTask != Q.Info_Private.tasks.length) {
                    Q.Info_Private.tasks[CurrentTask].notes = T_Notes;
                    UI_Day_Info.tasks[CurrentTask].notes = T_Notes;
                }
                else {
                    Q.Info_Private.extra = T_Notes;
                    UI_Day_Info.extra = T_Notes;
                }
            }
            Apply_TaskNotesLengths(T_Notes);
            Q.Mark_Unsaved("Agenda", true);
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
                            TaskInfo={UI_Day_Info.tasks[CurrentTask]} CurrentTask={CurrentTask}
                            SwapTask={SwapTask} AddTaskToDay={Q.AddTaskToDay} />
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
    //X = Boolean to determine if task is copied
    function SwapTask(A, C, N) {
        Q.AddTaskToDay(A, N);
        Q.Mode == 0 ? Q.Info_Public.tasks.splice(C, 1) : Q.Info_Private.tasks.splice(C, 1);
        SetupPopup("");
        ShowInfo(-1, "");
        UpdateStateCopy_Info();
        setSignal_Progress_Tasks(!Signal_Progress_Tasks);
        Q.Mark_Unsaved("Agenda", true);
    }

    //Applys new task to agenda
    //T = New task
    function AddTask(T) {
        Q.Mode == 0 ? Q.Info_Public.tasks.push(T) : Q.Info_Private.tasks.push(T);
        ReOrder_Tasks(Q.Mode);
        SetupPopup("");
        ShowInfo(-1, "");
        UpdateStateCopy_Info();
        setSignal_Progress_Tasks(!Signal_Progress_Tasks);
        Q.Mark_Unsaved("Agenda", true);
    }

    //Applys edit to task
    //I = Index of task
    //T = New task info
    function EditTask(I, T) {
        Q.Mode == 0 ? Q.Info_Public.tasks[I] = T : Q.Info_Private.tasks[I] = T;
        ReOrder_Tasks(Q.Mode);
        SetupPopup("");
        ShowInfo(-1, "");
        UpdateStateCopy_Info();
        setSignal_Progress_Tasks(!Signal_Progress_Tasks);
        Q.Mark_Unsaved("Agenda", true);

    }

    //Deletes task
    //I = Index of task
    function DeleteTask(I) {
        Q.Mode == 0 ? Q.Info_Public.tasks = Q.Info_Public.tasks.toSpliced(I, 1) : Q.Info_Private.tasks = Q.Info_Private.tasks.toSpliced(I, 1);
        SetupPopup("");
        ShowInfo(-1, "");
        UpdateStateCopy_Info();
        setSignal_Progress_Tasks(!Signal_Progress_Tasks);
        Q.Mark_Unsaved("Agenda", true);
    }

    //Adjusts day background color based on sleep
    function GetSleepStyles(S) {

        if (S.napped && S.sleptIn) {
            return Q.Themes.MC_A_S_SIN;
        }
        else if (!S.napped && S.sleptIn) {
            return Q.Themes.MC_A_S_SI;
        }
        else if (S.napped && !S.sleptIn) {
            return Q.Themes.MC_A_S_N;
        }
        else {
            return Q.Themes.MC_A_S_RW;
        }
    }

    //Generates textarea based on the current task and full screen status
    //CT = CurrentTask
    //F = Full
    function SetupTextArea(CT, F) {

        let taClass = `${Day_S.Task_Notes} ${Q.Themes.MC_A_TF} ${Basic_S.Chill_Scroll_Y}`;
        let MinButton = null;
        let rClass = `${Day_S.TC_Show} ${Q.Themes.MC_A_TB}`;

        if (CT >= 0 && F) {
            taClass = `${Day_S.Task_Notes_Full} ${Basic_S.Chill_Scroll_Y}`;
            MinButton = <div className={Day_S.Task_Notes_MinButton} onClick={() => setFull(false)}>Minimize</div>;
            rClass = `${Day_S.Tasks_Container_Inner_Full} ${Q.Themes.MC_A_TF} ${Q.Themes.MC_A_TB}`;
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
        <div className={`${Day_Device[Q.Device]} ${Day_Mode[Q.Mode]} ${GetSleepStyles(Days_Sleep)}`}>

            {PopUp}

            <div className={`${Day_S.MenuBar} ${Q.Themes.MC_A_DB}`}>
                <span className={Day_S.MinorBuffer} />
                <span className={`${Day_S.Date} ${Q.Themes.MC_A_F}`}>{Q.Today + ", " + UI_Day_Info.day}</span>
                <CompleteTaskPercentage Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} Tasks={UI_Day_Info.tasks}
                    Signal_AgendaSwapped={Q.Signal_AgendaSwapped} Signal_Progress_Tasks={Signal_Progress_Tasks} />
                <span className={Day_S.LoaderBuffer} />
                <RoutineCheckup Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    DayInfo_Public={Q.Info_Public} DayInfo_Private={Q.Info_Private} Today={Q.Today} AlterDay={Q.AlterDay}
                    ThisWeeksSchedule={Q.ThisWeeksSchedule} RestOfCompletedRoutines={Q.RestOfCompletedRoutines}
                    Signal_AgendaSwapped={Q.Signal_AgendaSwapped}
                    Signal_WeeklyRoutine={Q.Signal_WeeklyRoutine} setSignal_WeeklyRoutine={Q.setSignal_WeeklyRoutine} />
                <span className={Day_S.LoaderBuffer} /><span className={Day_S.LoaderBuffer} />
                <button className={Day_S.OverSlept} onClick={() => ToggleSleptIn()} />
                <span className={Day_S.MinorBuffer} />
                <button className={Day_S.Napping} onClick={() => ToggleNapped()} />
                <span className={Day_S.MinorBuffer} />
                <button className={Day_S.CreateTask} onClick={() => SetupPopup("Create")} />
                <span className={Day_S.MinorBuffer} />
                {CurrentTask >= 0 ? <button className={Day_S.FullScreenTask} onClick={() => setFull(true)} /> : null}
                <span className={Day_S.MinorBuffer} />
                {CurrentTask >= 0 && CurrentTask != UI_Day_Info.tasks.length ? <button className={Day_S.EditTask} onClick={() => SetupPopup("Edit")} /> : null}
                <span className={Day_S.MinorBuffer} />
                {CurrentTask >= 0 && CurrentTask != UI_Day_Info.tasks.length && UI_Day_Info.tasks[CurrentTask]?.important ? <button className={Day_S.CompeteTask} onClick={() => ToggleComplete()} /> : null}
            </div>

            <div className={Day_S.Tasks_Container}>

                <div className={`${Day_S.Tasks} ${Basic_S.Chill_Scroll_Y} ${Q.Themes.MC_A_TBA}`}>
                    {UI_Day_Info.tasks.map((task, index) => (
                        <Mission key={index} index={index} Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} Info={task} ShowInfo={ShowInfo} />
                    ))}
                    <div className={`${Day_S.Extra} ${Q.Themes.MC_A_TAB}`}
                        onClick={() => ShowInfo(UI_Day_Info.tasks.length, UI_Day_Info.extra)}>
                        <span className={UI_Day_Info.extra && UI_Day_Info.extra != "" ? Q.Themes.MC_A_M_F : Q.Themes.MC_A_M_E}>
                            Misc{UI_Day_Info.extra != "" ? " (+)" : ""}
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

    const [Percents, setPercents] = useState({
        complete: 0.0,
        incomplete: 0.0
    });
    const Signals = useRef(null);

    //Updates task progress bars when needed
    useEffect(() => {
        if (RC(Signals) == null || Q.Signal_Progress_Tasks != RC(Signals).progress || Q.Mode != RC(Signals).mode || Q.Signal_AgendaSwapped != RC(Signals).agenda) {
            RS(Signals, {
                mode: structuredClone(Q.Mode),
                agenda: structuredClone(Q.Signal_AgendaSwapped),
                progress: structuredClone(Q.Signal_Progress_Tasks)
            });
            UpdatePercentData();
        }
    }, [Q.Mode, Q.Signal_Progress_Tasks, Q.Signal_AgendaSwapped]);

    //Updates available completion percentage data
    function UpdatePercentData() {
        let data = {
            complete: 0.0,
            incomplete: 0.0
        }
        data.complete = GetPercent(Q.Tasks, "Complete");
        data.incomplete = 100.0 - data.complete;
        setPercents(data);
    }

    //Gets completeion percentage for adjusting style widths in TaskCompletionBar
    //T = Array of tasks
    //C = Status of tasks to get percentage of
    function GetPercent(T, C) {

        if (T && T.length != 0 && C) {

            let theTasks = TurnIntoArray(structuredClone(T).filter(c => c.important));
            let totalT = /* T */theTasks.length;
            let totalC = 0;

            for (let i = 0; i < /* T */theTasks.length; i++) {
                if (/* T */theTasks[i].complete) {
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
            throw new Error("Error: Could not determine list of tasks to check for completion percentage");
        }
    }

    return (
        <div className={`${TaskC_S.TaskCompletionBar} ${Q.Themes.MC_A_SP_B}`}>
            <div className={`${TaskC_S.TCB} ${Q.Themes.MC_A_TC_B}`} style={{ width: Percents.complete + "%" }} />
            <div className={`${TaskC_S.TCB} ${Q.Themes.MC_A_TI_B}`} style={{ width: Percents.incomplete + "%" }} />
            <span className={TaskC_S.TCB_T}>Tasks</span>
        </div>
    );
}

//Dropdown menu of routines along with daily progress meter for them
function RoutineCheckup(Q) {

    const [UI_Data, setUI_Data] = useState({
        routines: [],
        complete: 0.0,
        incomplete: 0.0
    });
    const Signals = useRef(null);

    //Update data when needed
    useEffect(() => {
        if (RC(Signals) == null) {
            RS(Signals, {
                mode: structuredClone(Q.Mode),
                agenda: structuredClone(Q.Signal_AgendaSwapped),
                week: structuredClone(Q.Signal_WeeklyRoutine)
            });
            UpdateFontendRoutines();
        }
        else if (RC(Signals).mode != Q.Mode || RC(Signals).week != structuredClone(Q.Signal_WeeklyRoutine) || RC(Signals).agenda != Q.Signal_AgendaSwapped) {
            RC(Signals).mode = structuredClone(Q.Mode);
            RC(Signals).agenda = structuredClone(Q.Signal_AgendaSwapped);
            RC(Signals).week = structuredClone(Q.Signal_WeeklyRoutine);
            UpdateFontendRoutines();
        }
    }, [Q.Mode, Q.Signal_AgendaSwapped, Q.Signal_WeeklyRoutine]);

    //Updates front end copy of routine data
    function UpdateFontendRoutines() {
        let completedRoutines = structuredClone(Q.RestOfCompletedRoutines(Q.Mode, Q.Today));
        let newData = {
            routines: structuredClone(GenerateRoutineArray(Q.Mode == 0 ? Q.DayInfo_Public.routinesDone : Q.DayInfo_Private.routinesDone, completedRoutines, GetImportantRoutine(Q.ThisWeeksSchedule))),
            complete: 0.0,
            incomplete: 0.0
        }
        newData.complete = GetPercent(newData.routines, "Complete");
        newData.incomplete = 100.0 - newData.complete;
        setUI_Data(newData);
    }

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
    function ChangeCompletionStatus(R, S) {

        let NewDay = Q.Mode == 0 ? Q.DayInfo_Public : Q.DayInfo_Private;

        if (S == "Complete") {
            NewDay.routinesDone.push(R);
        }
        else if (S == "Incomplete") {
            NewDay.routinesDone = RemoveChoreFromArray(R, NewDay.routinesDone);
        }
        else {
            throw new Error("Error: Could not determine new status of routine");
        }

        Q.AlterDay(NewDay, Q.Today, Q.Mode);
        if (R.days.includes("Week")) {
            Q.setSignal_WeeklyRoutine(!Q.Signal_WeeklyRoutine);
        }
        else {
            UpdateFontendRoutines();
        }
    }

    return (
        <div className={RoutineC_S.Vessal}>

            <div className={`${RoutineC_S.Vessal_Percentage} ${Q.Themes.MC_A_SP_B}`}>

                <div className={`${RoutineC_S.TCB} ${Q.Themes.MC_A_TC_B}`}
                    style={{ width: UI_Data.complete + "%" }} />

                <div className={`${RoutineC_S.TCB} ${Q.Themes.MC_A_TI_B}`}
                    style={{ width: UI_Data.incomplete + "%" }} />

                <span className={RoutineC_S.TCB_T}>Routines</span>

            </div>

            {Q.Today && Q.DayInfo_Public && Q.DayInfo_Public.routinesDone && Q.DayInfo_Private && Q.DayInfo_Private.routinesDone && Q.ThisWeeksSchedule ?
                UI_Data.routines.map((R, index) => (
                    <Errand Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} key={index} Today={Q.Today} Chore={R.choreInfo} Status={R.complete} ChangeCompletionStatus={ChangeCompletionStatus} />
                ))
                : null}

        </div>
    );
}

//Dropdown menu entries for routines
function Errand(Q) {
    return (
        <div className={`${RoutineC_S.Errand} ${Q.Status ? Q.Themes.MC_A_TC : Q.Themes.MC_A_TI} ${Q.Themes.MC_A_SP_E_B}`} onClick={() => Q.ChangeCompletionStatus(Q.Chore, Q.Status ? "Incomplete" : "Complete")}>
            {Q.Chore.chore}
        </div>
    );
}

//Displays info for a daily task
function Mission(Q) {

    const Mission_Device = [Mission_S.Computer, Mission_S.Mobile];
    const Mission_Mode = [Mission_S.Public, Mission_S.Private];

    return (
        <button className={`${Mission_Device[Q.Device]} ${Mission_Mode[Q.Mode]} ${Q.Themes.MC_A_TAB} ${Q.Info.important ? (Q.Info.complete ? Q.Themes.MC_A_TC : Q.Themes.MC_A_TI) : null}`}
            onClick={() => Q.ShowInfo(Q.index, Q.Info.notes)}>
            {Q.Info.goal}<i>{Q.Info.notes != "" ? " (+)" : ""}</i>
        </button>
    );
}

//Progress review for weekly agenda
function Review(Q) {

    const Review_Device = [Review_S.Computer, Review_S.Mobile];
    const Review_Mode = [Review_S.Public, Review_S.Private];
    const Review_Screen = [Memo_S.Min, Memo_S.Full];

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
        <div className={`${Review_Device[Q.Device]} ${Review_Mode[Q.Mode]} ${Review_Screen[Q.FullScreen ? 1 : 0]} ${Q.FullScreen ? Q.Themes.MC_A_FN : null}`}>
            {Q.FullScreen ?
                <button className={Review_S.Reduce} onClick={() => Q.setFullMode(false)}>Minimize</button>
                : null}
            <div className={`${Review_S.Inner_Vessal} ${Q.Themes.MC_A_TB}`}>
                <textarea rows={5} className={`${Review_S.ReviewField} ${Basic_S.Chill_Scroll_Y} ${Q.Themes.MC_A_TF}`} id={NoteID} onChange={() => TypingReview()} />
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
        <div className={`${Memo_Device[Q.Device]} ${Memo_Mode[Q.Mode]} ${Memo_Screen[Q.FullScreen ? 1 : 0]} ${Q.FullScreen ? Q.Themes.MC_A_FN : null}`}>
            {Q.FullScreen ?
                <button className={Memo_S.Reduce} onClick={() => Q.setFullMode(false)}>Minimize</button>
                : null}
            <div className={`${Memo_S.Inner_Vessal} ${Q.Themes.MC_A_TB}`}>
                <textarea defaultValue={Q.Info} className={`${Memo_S.Notes} ${Basic_S.Chill_Scroll_Y} ${Q.Themes.MC_A_TF}`} id={NoteID} onChange={() => TypingGeneralAgendaNotes()} rows={5} />
            </div>
        </div>
    );
}

export { Week };