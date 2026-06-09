import { useRef, useEffect, useState } from "react";
import { days, ConvertTimeToANumber } from "../../../Backend/HandleDates.js";
import { CreateNewChoreID, CheckIfChoreExist, ReorderChores } from "../../../Backend/HandleRoutine.js";
import { TweakChore } from "./PopUps.jsx";
import Basic_S from "../../../Styles/Basics.module.css";
import Routine_S from "../Styles/Tradition/Routine.module.css";
import Day_S from "../Styles/Tradition/Days.module.css";
import Chore_S from "../Styles/Tradition/Chore.module.css";

//Interface for managing routines
function Routine(Q) {

    const Routine_Device = [Routine_S.Computer, Routine_S.Mobile];
    const Routine_Mode = [Routine_S.Public, Routine_S.Private];

    const [PopUp, setPopUp] = useState(null);

    //Swaps routine notes based on current mode
    useEffect(() => {
        if (Q.Schedule) {
            document.getElementById("routineNotes_ID").value = GetRoutineNotes(Q.Mode);
        }
    }, [Q.Mode]);

    //Creates a new chore and applies it to current routine
    //M = Mode (public vs private)
    //D = What day(s)
    //T = What time (null if anytime)
    //C = Chore goal
    //P = Importance
    function CreateNewChore(M, D, T, C, P) {

        if (Q.Schedule) {

            let NewSchedule = Q.Schedule;
            let ApplyDates = D;

            if (!Array.isArray(ApplyDates)) {
                ApplyDates = [ApplyDates];
            }

            if (!CheckIfChoreExist(M == 0 ? Q.Schedule.public : Q.Schedule.private, C, T, ApplyDates)) {

                let NewChore = {
                    chore: C,
                    time: T,
                    days: ApplyDates,
                    id: CreateNewChoreID(Q.Mode == 0 ? NewSchedule.public : NewSchedule.private),
                    important: P
                };

                if (M == 0) {
                    NewSchedule.public.push(NewChore);
                }
                else if (M == 1) {
                    NewSchedule.private.push(NewChore);
                }
                else {
                    console.log("Error: Could not figure out which mode to add chore under");
                }

                Q.UpdateSchedule(NewSchedule);
            }
            else {
                console.log("Error: Chore already exists on given day(s)");
            }
        }
        else {
            console.log("Error: No routine available to add chore to");
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

            let NewS = Q.Schedule;
            let NewC = {
                chore: C,
                time: T,
                days: D,
                id: I,
                important: P
            };

            if (M == 0) {
                for (let i = 0; i < NewS.public.length; i++) {
                    if (NewS.public[i].id == I) {
                        NewS.public[i] = NewC;
                        break;
                    }
                }
                Q.UpdateSchedule(NewS);
            }
            else if (M == 1) {
                for (let i = 0; i < NewS.private.length; i++) {
                    if (NewS.private[i].id == I) {
                        NewS.private[i] = NewC;
                        break;
                    }
                }
                Q.UpdateSchedule(NewS);
            }
            else {
                console.log("Error: Could figure out which mode to apply chore edits under");
            }
        }
        else {
            console.log("Error: Could not find routine to apply chore edits to");
        }
    }

    //Deletes old chore
    //I = ID of old chore
    //M = Mode (public vs private)
    function DeleteChore(I, M) {
        if (Q.Schedule) {

            let NewS = Q.Schedule;

            if (M == 0) {
                for (let i = 0; i < NewS.public.length; i++) {
                    if (NewS.public[i].id == I) {
                        NewS.public.splice(i, 1);
                        break;
                    }
                }
                Q.UpdateSchedule(NewS);
            }
            else if (M == 1) {
                for (let i = 0; i < NewS.private.length; i++) {
                    if (NewS.private[i].id == I) {
                        NewS.private.splice(i, 1);
                        break;
                    }
                }
                Q.UpdateSchedule(NewS);
            }
            else {
                console.log("Error: Could figure out which mode to delete chore under");
            }
        }
        else {
            console.log("Error: Could not find routine to delete chore under");
        }
    }

    //Updates routine notes
    //N = New note version
    //M = Mode (public vs private)
    function TypingRoutineNotes(M, N) {
        if (Q.Schedule) {
            let newS = Q.Schedule;
            if (M == 0) {
                newS.notes.public = N;
            }
            else if (M == 1) {
                newS.notes.private = N;
            }
            Q.UpdateSchedule(newS);
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
            console.log("Error: Could not find schedule for reading notes");
            return "";
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
    function GetDailySchedule(D) {
        if (Q.Schedule && Q.Schedule != "" && Q.Schedule != null) {
            let DailyChores = (Q.Mode == 0 ? Q.Schedule.public : Q.Schedule.private);
            return DailyChores.filter(d => d.days.includes(D));
        }
        else {
            console.log("Error: Schedule not found");
            return [];
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
                {days.map((d, index) => (
                    <Days Mode={Q.Mode} Device={Q.Device} key={index} Themes={Q.Themes}
                        Data={GetDailySchedule(d)} Today={d}
                        ReorderChores={ReorderChores} ConvertTimeToANumber={ConvertTimeToANumber} IsStringTimeBetween={IsStringTimeBetween}
                        Vertical={true} SetupPopup={SetupPopup} />
                ))}
            </div>

            <div className={Routine_S.BottomHalf}>

                <div className={`${Routine_S.R_Notes} ${Q.Themes.MC_R_N_TE}`}>
                    <div className={`${Routine_S.R_Notes_Title} ${Q.Themes.MC_R_N_TI}`}>Notes</div>
                    <textarea id={"routineNotes_ID"} className={Basic_S.Chill_Scroll_Y} onChange={(e) => TypingRoutineNotes(Q.Mode, e.target.value)} defaultValue={GetRoutineNotes(Q.Mode)} />
                </div>

                <div className={`${Routine_S.Vessal_Week} ${Basic_S.Chill_Scroll_X} ${Q.Themes.MC_R_W}`}>

                    <button onClick={() => SetupPopup("Create", "Week")} style={{ cursor: "pointer" }}>
                        Weekly
                    </button>

                    {ReorderChores(GetDailySchedule("Week")).map((chore, index) => (
                        <Chore Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} key={index} index={index}
                            Data={chore} ReorderChores={ReorderChores} Vertical={false} SetupPopup={SetupPopup} />
                    ))}
                </div>
            </div>

        </div>
    );
}

//Days of routine week
function Days(Q) {

    const Day_Device = [Day_S.Computer, Day_S.Mobile];
    const Day_Mode = [Day_S.Public, Day_S.Private];

    //Gets chores taking place during specified portion of day
    //When = What portion of the day
    function GetChoresBasedOnTiming(When) {
        let someChores = [];
        switch (When) {
            case "Morning":
                for (let i = 0; i < Q.Data.length; i++) {
                    if (Q.Data[i].time && Q.IsStringTimeBetween("4:00 AM", "11:59 AM", Q.Data[i].time)) {
                        someChores.push(Q.Data[i]);
                    }
                }
                break;
            case "Afternoon":
                for (let i = 0; i < Q.Data.length; i++) {
                    if (Q.Data[i].time && Q.IsStringTimeBetween("12:00 PM", "4:59 PM", Q.Data[i].time)) {
                        someChores.push(Q.Data[i]);
                    }
                }
                break;
            case "Evening":
                for (let i = 0; i < Q.Data.length; i++) {
                    if (Q.Data[i].time && Q.IsStringTimeBetween("5:00 PM", "7:59 PM", Q.Data[i].time)) {
                        someChores.push(Q.Data[i]);
                    }
                }
                break;
            case "Night":
                for (let i = 0; i < Q.Data.length; i++) {
                    if (Q.Data[i].time && Q.IsStringTimeBetween("8:00 PM", "3:59 AM", Q.Data[i].time)) {
                        someChores.push(Q.Data[i]);
                    }
                }
                break;
            case "Untimed":
                someChores = Q.Data.filter(chore => chore.time == null);
                break;
            default:
                console.log("Error: Could not determine what time of day to pull chores from");
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

        if (theChores && theClass) {
            let h = Q.Data.length == 0 ? 0.0 : (theChores.length / Q.Data.length * 100.0);
            return (
                <div className={theClass} style={{ height: h + "%" }}>
                    {theChores.map((chore, index) => (
                        <Chore Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} key={index} index={index} Data={chore} SetupPopup={Q.SetupPopup} />
                    ))}
                </div>
            );
        }
        else {
            console.log("Error: Failed to create chore section based on time portion");
            return null;
        }
    }

    return (
        <div className={`${Day_Device[Q.Device]} ${Day_Mode[Q.Mode]}`}>

            <button className={Q.Themes.MC_R_D_T} onClick={() => Q.SetupPopup("Create", Q.Today)} style={{ cursor: "pointer" }}>
                {Q.Today}
            </button>

            {TimePortion("Morning")}
            {TimePortion("Afternoon")}
            {TimePortion("Evening")}
            {TimePortion("Night")}
            {TimePortion("Untimed")}

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