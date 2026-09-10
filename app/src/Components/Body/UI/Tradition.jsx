import { useRef, useEffect, useState } from "react";
import { days, ConvertTimeToANumber } from "../../../Backend/HandleDates.js";
import { CreateNewChoreID, CheckIfChoreExist, ReorderChores } from "../../../Backend/HandleRoutine.js";
import { TweakChore } from "./PopUps.jsx";
import { RC, RS } from "../../../Backend/HandleReact.js";
import { TurnIntoArray } from "../../../Backend/HandleGeneral.js";
import Basic_S from "../../../Styles/Basics.module.css";
import Routine_S from "../Styles/Tradition/Routine.module.css";
import Day_S from "../Styles/Tradition/Days.module.css";
import Chore_S from "../Styles/Tradition/Chore.module.css";

//Interface for managing routines
function Routine(Q) {

    const Routine_Device = [Routine_S.Computer, Routine_S.Mobile];
    const Routine_Mode = [Routine_S.Public, Routine_S.Private];

    const [PopUp, setPopUp] = useState(null);

    const [Signal_Sunday, setSignal_Sunday] = useState(false);
    const [Signal_Monday, setSignal_Monday] = useState(false);
    const [Signal_Tuesday, setSignal_Tuesday] = useState(false);
    const [Signal_Wednesday, setSignal_Wednesday] = useState(false);
    const [Signal_Thursday, setSignal_Thursday] = useState(false);
    const [Signal_Friday, setSignal_Friday] = useState(false);
    const [Signal_Saturday, setSignal_Saturday] = useState(false);
    const [Signal_Week, setSignal_Week] = useState(false);

    const Signals = useRef(null);

    //Updates data when needed
    useEffect(() => {
        if (RC(Signals) == null) {
            RS(Signals, {
                mode: structuredClone(Q.Mode),
                schedule: structuredClone(Q.Signal_ScheduleSwapped)
            });
        }
        else if (Q.Schedule && RC(Signals).schedule != Q.Signal_ScheduleSwapped) {
            RC(Signals).schedule = structuredClone(Q.Signal_ScheduleSwapped);
            Updates_Days_UI(days.concat(["Week"]));
            document.getElementById("routineNotes_ID").value = GetRoutineNotes(Q.Mode);
        }
        else if (Q.Schedule && RC(Signals).mode != Q.Mode) {
            document.getElementById("routineNotes_ID").value = GetRoutineNotes(Q.Mode);
            RC(Signals).mode = structuredClone(Q.Mode);
        }
        else {
            Q.setPopUpFullMode(PopUp != null ? true : false);
        }
    }, [Q.Mode, PopUp, Q.Signal_ScheduleSwapped]);

    //Signals which days to have their ui rerendered
    //D = Array of days to update UI for
    function Updates_Days_UI(D) {
        let affectedDays = TurnIntoArray(D);
        if (affectedDays && affectedDays.length > 0) {
            if (affectedDays.includes("Sunday")) {
                setSignal_Sunday(!Signal_Sunday);
            }
            if (affectedDays.includes("Monday")) {
                setSignal_Monday(!Signal_Monday);
            }
            if (affectedDays.includes("Tuesday")) {
                setSignal_Tuesday(!Signal_Tuesday);
            }
            if (affectedDays.includes("Wednesday")) {
                setSignal_Wednesday(!Signal_Wednesday);
            }
            if (affectedDays.includes("Thursday")) {
                setSignal_Thursday(!Signal_Thursday);
            }
            if (affectedDays.includes("Friday")) {
                setSignal_Friday(!Signal_Friday);
            }
            if (affectedDays.includes("Saturday")) {
                setSignal_Saturday(!Signal_Saturday);
            }
            if (affectedDays.includes("Week")) {
                setSignal_Week(!Signal_Week);
            }
        }
        else {
            throw new Error("Error: Could figure out which day(s) to update");
        }
    }

    //Creates a new chore and applies it to current routine
    //M = Mode (public vs private)
    //D = What day(s)
    //T = What time (null if anytime)
    //C = Chore goal
    //P = Importance
    function CreateNewChore(M, D, T, C, P) {

        if (Q.Schedule) {

            let ApplyDates = TurnIntoArray(D);

            if (!CheckIfChoreExist(M == 0 ? Q.Schedule.public : Q.Schedule.private, C, T, ApplyDates)) {

                let NewChore = {
                    chore: C,
                    time: T,
                    days: ApplyDates,
                    id: CreateNewChoreID(Q.Mode == 0 ? Q.Schedule.public : Q.Schedule.private),
                    important: P
                };

                if (M == 0) {
                    Q.Schedule.public.push(NewChore);
                }
                else if (M == 1) {
                    Q.Schedule.private.push(NewChore);
                }
                else {
                    throw new Error("Error: Could not figure out which mode to add chore under");
                }
                Updates_Days_UI(D);
                Q.Mark_Unsaved("Schedule", true);
            }
            else {
                throw new Error("Error: Chore already exists on given day(s)");
            }
        }
        else {
            throw new Error("Error: No routine available to add chore to");
        }
    }

    //Replaced old chore with new edits
    //I = ID of chore
    //M = Mode (public vs private)
    //D = What day(s)
    //T = What time (null if anytime)
    //C = Chore goal
    //P = Importance
    function EditOldChore(I, M, D, T, C, P) {
        if (Q.Schedule) {

            let NewC = {
                chore: C,
                time: T,
                days: D,
                id: I,
                important: P
            };

            if (M == 0) {
                for (let i = 0; i < Q.Schedule.public.length; i++) {
                    if (Q.Schedule.public[i].id == I) {
                        Q.Schedule.public[i] = NewC;
                        break;
                    }
                }
                Updates_Days_UI(D);
                Q.Mark_Unsaved("Schedule", true);
            }
            else if (M == 1) {
                for (let i = 0; i < Q.Schedule.private.length; i++) {
                    if (Q.Schedule.private[i].id == I) {
                        Q.Schedule.private[i] = NewC;
                        break;
                    }
                }
                Updates_Days_UI(D);
                Q.Mark_Unsaved("Schedule", true);
            }
            else {
                throw new Error("Error: Could figure out which mode to apply chore edits under");
            }
        }
        else {
            throw new Error("Error: Could not find routine to apply chore edits to");
        }
    }

    //Deletes old chore
    //I = ID of old chore
    //M = Mode (public vs private)
    function DeleteChore(I, M) {
        if (Q.Schedule) {

            if (M == 0) {
                for (let i = 0; i < Q.Schedule.public.length; i++) {
                    if (Q.Schedule.public[i].id == I) {
                        let affectedDays = Q.Schedule.public[i].days;
                        Q.Schedule.public.splice(i, 1);
                        Updates_Days_UI(affectedDays);
                        break;
                    }
                }
                Q.Mark_Unsaved("Schedule", true);
            }
            else if (M == 1) {
                for (let i = 0; i < Q.Schedule.private.length; i++) {
                    if (Q.Schedule.private[i].id == I) {
                        let affectedDays = Q.Schedule.private[i].days;
                        Q.Schedule.private.splice(i, 1);
                        Updates_Days_UI(affectedDays);
                        break;
                    }
                }
                Q.Mark_Unsaved("Schedule", true);
            }
            else {
                throw new Error("Error: Could figure out which mode to delete chore under");
            }
        }
        else {
            throw new Error("Error: Could not find routine to delete chore under");
        }
    }

    //Updates routine notes
    //M = Mode (public vs private)
    //N = New note version
    function TypingRoutineNotes(M, N) {
        if (Q.Schedule) {
            if (M == 0) {
                Q.Schedule.notes.public = N;
            }
            else if (M == 1) {
                Q.Schedule.notes.private = N;
            }
            Q.Mark_Unsaved("Schedule", true);
        }
    }

    //Gets notes of selected routine based on current mode
    //M = Mode (public vs private)
    function GetRoutineNotes(M) {
        if (Q.Schedule && M == 0) {
            return Q.Schedule.notes.public;
        }
        else if (Q.Schedule && M == 1) {
            return Q.Schedule.notes.private;
        }
        else {
            throw new Error("Error: Could not find schedule for reading notes");
        }
    }

    //Setups a popup
    //P = Type of popup component
    //X = Which days to start with when creating chore (if applicable) or old chore to edit
    function SetupPopup(P, X) {
        if (!PopUp) {
            switch (P) {
                case "Create":
                    setPopUp(<TweakChore Mode={Q.Mode} Device={Q.Device}
                        Task={P} OldObjective={null} StarterDays={(X && X != "" ? [X] : [])}
                        CreateNewChore={CreateNewChore} SetupPopup={SetupPopup} />);
                    break;
                case "Edit":
                    setPopUp(<TweakChore Mode={Q.Mode} Device={Q.Device}
                        Task={P} OldObjective={X} StarterDays={null}
                        CreateNewChore={CreateNewChore} SetupPopup={SetupPopup}
                        EditOldChore={EditOldChore} DeleteChore={DeleteChore} />);
                    break;
                default:
                    setPopUp(null);
            }
        }
    }

    //Gets the daily schedule of current routine
    //D = Day of week
    //M = Mode (public vs private)
    function GetDailySchedule(D, M) {
        if (Q.Schedule && Q.Schedule != "" && Q.Schedule != null) {
            return (M == 0 ? Q.Schedule.public : Q.Schedule.private).filter(d => d.days.includes(D));
        }
        else {
            throw new Error("Error: Schedule not found!");
        }
    }

    //Checks if time T is between times A and B
    //A = First time value (ex: "10:00 AM")
    //B = Second time value
    //T = Time to check if bewtween A and B
    function IsStringTimeBetween(A, B, T) {
        let first = ConvertTimeToANumber(A);
        let second = ConvertTimeToANumber(B);
        let current = ConvertTimeToANumber(T);

        if (first < second && current >= first && current <= second) {
            return true;
        }
        else if (first > second) {
            if ((first <= current && current <= ConvertTimeToANumber("11:59 PM")) || (ConvertTimeToANumber("12:00 AM") <= current && current <= second)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    return (
        <div className={`${Routine_Device[Q.Device]} ${Routine_Mode[Q.Mode]}`}>

            {PopUp}

            <div className={`${Routine_S.Vessal_Days} ${Basic_S.Chill_Scroll_X} ${Q.Themes.MC_R_D_B}`}>
                <Days Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    GetDailySchedule={GetDailySchedule} Today={"Sunday"} Day_Signal={Signal_Sunday}
                    IsStringTimeBetween={IsStringTimeBetween} Vertical={true} SetupPopup={SetupPopup} Updates_Days_UI={Updates_Days_UI} />
                <Days Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    GetDailySchedule={GetDailySchedule} Today={"Monday"} Day_Signal={Signal_Monday}
                    IsStringTimeBetween={IsStringTimeBetween} Vertical={true} SetupPopup={SetupPopup} Updates_Days_UI={Updates_Days_UI} />
                <Days Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    GetDailySchedule={GetDailySchedule} Today={"Tuesday"} Day_Signal={Signal_Tuesday}
                    IsStringTimeBetween={IsStringTimeBetween} Vertical={true} SetupPopup={SetupPopup} Updates_Days_UI={Updates_Days_UI} />
                <Days Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    GetDailySchedule={GetDailySchedule} Today={"Wednesday"} Day_Signal={Signal_Wednesday}
                    IsStringTimeBetween={IsStringTimeBetween} Vertical={true} SetupPopup={SetupPopup} Updates_Days_UI={Updates_Days_UI} />
                <Days Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    GetDailySchedule={GetDailySchedule} Today={"Thursday"} Day_Signal={Signal_Thursday}
                    IsStringTimeBetween={IsStringTimeBetween} Vertical={true} SetupPopup={SetupPopup} Updates_Days_UI={Updates_Days_UI} />
                <Days Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    GetDailySchedule={GetDailySchedule} Today={"Friday"} Day_Signal={Signal_Friday}
                    IsStringTimeBetween={IsStringTimeBetween} Vertical={true} SetupPopup={SetupPopup} Updates_Days_UI={Updates_Days_UI} />
                <Days Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    GetDailySchedule={GetDailySchedule} Today={"Saturday"} Day_Signal={Signal_Saturday}
                    IsStringTimeBetween={IsStringTimeBetween} Vertical={true} SetupPopup={SetupPopup} Updates_Days_UI={Updates_Days_UI} />
            </div>

            <div className={Routine_S.BottomHalf}>
                <div className={`${Routine_S.R_Notes} ${Q.Themes.MC_R_N_TE}`}>
                    <div className={`${Routine_S.R_Notes_Title} ${Q.Themes.MC_R_N_TI}`}>Notes</div>
                    <textarea id={"routineNotes_ID"} className={Basic_S.Chill_Scroll_Y} onChange={(e) => TypingRoutineNotes(Q.Mode, e.target.value)} defaultValue={GetRoutineNotes(Q.Mode)} />
                </div>
                <div className={`${Routine_S.Vessal_Week} ${Basic_S.Chill_Scroll_X} ${Q.Themes.MC_R_W}`}>
                    <Days Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                        GetDailySchedule={GetDailySchedule} Today={"Week"} Day_Signal={Signal_Week}
                        IsStringTimeBetween={IsStringTimeBetween} Vertical={true} SetupPopup={SetupPopup} Updates_Days_UI={Updates_Days_UI} />
                </div>
            </div>

        </div>
    );
}

//Days of routine week
function Days(Q) {

    const Day_Device = [`${Day_S.Computer} ${Q.Today === "Week" ? Day_S.Week : Day_S.Day}`, Day_S.Mobile];
    const Day_Mode = [Day_S.Public, Day_S.Private];

    const [TimePortions, setTimePortions] = useState({
        morning: null,
        afternoon: null,
        evening: null,
        night: null,
        untimed: null
    });
    const Signals = useRef(null);

    //Changes data when needed
    useEffect(() => {
        if (RC(Signals) == null) {
            SetupTimePortions();
            RS(Signals, {
                mode: structuredClone(Q.Mode),
                day: structuredClone(Q.Day_Signal)
            });
        }
        else if (Q.Mode != RC(Signals).mode || Q.Day_Signal != RC(Signals).day) {
            RC(Signals).mode = structuredClone(Q.Mode);
            RC(Signals).day = structuredClone(Q.Day_Signal);
            SetupTimePortions();
        }
    }, [Q.Mode, Q.Day_Signal]);

    //Sets up the time portions of the day
    function SetupTimePortions() {
        setTimePortions({
            morning: TimePortion("Morning"),
            afternoon: TimePortion("Afternoon"),
            evening: TimePortion("Evening"),
            night: TimePortion("Night"),
            untimed: TimePortion("Untimed")
        });
    }

    //Gets chores taking place during specified portion of day
    //When = What portion of the day
    function GetChoresBasedOnTiming(When) {
        let someChores = [];
        let theData = Q.GetDailySchedule(Q.Today, Q.Mode);
        switch (When) {
            case "Morning":
                for (let i = 0; i < theData.length; i++) {
                    if (theData[i].time && Q.IsStringTimeBetween("4:00 AM", "11:59 AM", theData[i].time)) {
                        someChores.push(theData[i]);
                    }
                }
                break;
            case "Afternoon":
                for (let i = 0; i < theData.length; i++) {
                    if (theData[i].time && Q.IsStringTimeBetween("12:00 PM", "4:59 PM", theData[i].time)) {
                        someChores.push(theData[i]);
                    }
                }
                break;
            case "Evening":
                for (let i = 0; i < theData.length; i++) {
                    if (theData[i].time && Q.IsStringTimeBetween("5:00 PM", "7:59 PM", theData[i].time)) {
                        someChores.push(theData[i]);
                    }
                }
                break;
            case "Night":
                for (let i = 0; i < theData.length; i++) {
                    if (theData[i].time && Q.IsStringTimeBetween("8:00 PM", "3:59 AM", theData[i].time)) {
                        someChores.push(theData[i]);
                    }
                }
                break;
            case "Untimed":
                someChores = theData.filter(chore => chore.time == null);
                break;
            default:
                throw new Error("Error: Could not determine what time of day to pull chores from");
        }
        return ReorderChores(someChores);
    }

    //Generates list of chore for a portion of a day
    //T = What time portion
    function TimePortion(T) {

        let theClass = null;
        let theChores = null;

        switch (T) {
            case "Morning":
                theClass = `${Day_S.TimeHusk} ${Q.Themes.MC_R_T_M}`;
                theChores = GetChoresBasedOnTiming("Morning");
                break;
            case "Afternoon":
                theClass = `${Day_S.TimeHusk} ${Q.Themes.MC_R_T_A}`;
                theChores = GetChoresBasedOnTiming("Afternoon");
                break;
            case "Evening":
                theClass = `${Day_S.TimeHusk} ${Q.Themes.MC_R_T_E}`;
                theChores = GetChoresBasedOnTiming("Evening");
                break;
            case "Night":
                theClass = `${Day_S.TimeHusk} ${Q.Themes.MC_R_T_N}`;
                theChores = GetChoresBasedOnTiming("Night");
                break;
            case "Untimed":
                theClass = `${Day_S.TimeHusk} ${Q.Themes.MC_R_T_U}`;
                theChores = GetChoresBasedOnTiming("Untimed");
                break;
        }

        let theData = Q.GetDailySchedule(Q.Today, Q.Mode);

        if (theChores && theClass) {
            let h = theData.length == 0 ? 0.0 : (theChores.length / theData.length * 100.0);
            return (
                <div className={theClass} style={{ height: h + "%" }}>
                    {theChores.map((chore, index) => (
                        <Chore Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} key={index} index={index} Data={chore} SetupPopup={Q.SetupPopup} />
                    ))}
                </div>
            );
        }
        else {
            throw new Error("Error: Failed to create chore section based on time portion");
        }
    }

    return (
        <div className={`${Day_Device[Q.Device]} ${Day_Mode[Q.Mode]}`}>

            <button className={Q.Themes.MC_R_D_T} onClick={() => Q.SetupPopup("Create", Q.Today)} style={{ cursor: "pointer" }}>
                {Q.Today}
            </button>

            {TimePortions.morning}
            {TimePortions.afternoon}
            {TimePortions.evening}
            {TimePortions.night}
            {TimePortions.untimed}

        </div>
    );
}

//Chore info
function Chore(Q) {

    const Chore_Device = [Chore_S.Computer, Chore_S.Mobile];
    const Chore_Mode = [Chore_S.Public, Chore_S.Private];

    const C_Importance = [Chore_S.Important, Chore_S.NotImportant];

    return (
        <div className={`${Chore_Device[Q.Device]} ${Chore_Mode[Q.Mode]} ${C_Importance[Q.Data.important ? 0 : 1]} ${Q.Data.important ? Q.Themes.MC_R_C_I : null} ${Q.Themes.MC_R_C_F}`} onClick={() => Q.SetupPopup("Edit", Q.Data)}>
            {Q.Data.time ? Q.Data.time + " " : null}{<i>{Q.Data.chore}</i>}
        </div>
    );
}

export { Routine };