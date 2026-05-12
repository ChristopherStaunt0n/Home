import { useRef, useEffect, useState } from "react";
import { GetAvailableRoutines, CreateNewRoutine, DeleteRoutine, GetCurrentRoutine, DuplicateRoutine } from "../../../Backend/DatabaseConnection.js";
import Agenda_S from "../Styles/Navigation/Agenda.module.css";
import Routine_S from "../Styles/Navigation/Routine.module.css";

//UI for agenda subpage
function AgendaInterface(Q) {
    return (
        <div className={Q.Subpage == "Agenda" ? Agenda_S.IsOpen : Agenda_S.IsClosed}>

            {Q.Subpage != "Agenda" ?
                <button className={Agenda_S.Open} onClick={() => Q.SwitchSubpage("Agenda")}>Open Agenda</button>
                :
                <div className={Agenda_S.Vessal}>

                    <div className={Agenda_S.Header}>
                        <div className={Q.UnsavedAgenda ? Agenda_S.NotSaved : Agenda_S.IsSaved}>
                            {Q.UnsavedAgenda ? "Unsaved Changes" : "Changes Saved"}
                        </div>
                    </div>

                    <div className={Agenda_S.ControlPanel}>

                        <div className={Agenda_S.Nav}>
                            <button className={Agenda_S.ChangeWeek_L} onClick={() => Q.SwitchCurrentAgenda("Previous")}>
                                Previous
                            </button>
                            <button className={Agenda_S.Save} onClick={() => Q.SaveCurrentAgenda()}>
                                Save
                            </button>
                            <button className={Agenda_S.ChangeWeek_R} onClick={() => Q.SwitchCurrentAgenda("Next")}>
                                Next
                            </button>
                        </div>

                        <button className={Agenda_S.Close} onClick={() => Q.SwitchSubpage("")}>Close</button>

                    </div>
                </div>
            }
        </div>
    );
}

//UI for routine subpage
function RoutineInterface(Q) {

    const [AvailableRoutines, setAvailableRoutines] = useState(null);

    //Loads Available routines on startup
    useEffect(() => {
        let fetchAgenda = async () => {
            UpdateAvailableRoutines();
        };
        fetchAgenda();
    }, []);

    //Updates title text
    function UpdateTitle() {
        if (Q.Schedule && Q.Schedule.title) {
            document.getElementById("S_Title_ID").value = Q.Schedule.title
        }
    }

    //Updates title of currently viewed
    //T = New title
    function AlterTitle(T) {
        if (Q.Schedule && T && T != "") {
            let NewS = Q.Schedule;
            NewS.title = T;
            Q.UpdateSchedule(NewS);
        }
    }

    //Updates list of available routines
    async function UpdateAvailableRoutines() {

        let data = await GetAvailableRoutines();
        let newAR = [];

        for (let i = 0; i < data.length; i++) {
            if (data[i].trueID != 0 && data[i].trueID != Q.Schedule.trueID) {
                newAR.push({ title: data[i].title, id: data[i].trueID });
            }
        }

        setAvailableRoutines(newAR);
    }

    //Creates a new routine
    function Create_R() {
        Q.SetupNewRoutine();
        UpdateTitle();
        UpdateAvailableRoutines();
    }

    //Saves changes to current selected routine
    function Save_R() {
        Q.SaveCurrentSchedule();
        UpdateAvailableRoutines();
    }

    //Deletes currently selected routine
    async function Delete_R() {
        DeleteRoutine(Q.Schedule);
        let next = await GetCurrentRoutine();
        SwappingRoutine(next.trueID);
    }

    //Duplicates currently selected routine to the database
    async function Duplicate_R() {
        if (Q.Schedule) {
            let dupR = await DuplicateRoutine(Q.Schedule);
            SwappingRoutine(dupR.trueID);
        }
        else {
            console.log("Error: No schedule to duplicate");
        }
    }

    //Swaps routine based on provided id
    //I = Id of routine
    function SwappingRoutine(I) {
        Q.SwapToRoutine(I);
        UpdateTitle();
        UpdateAvailableRoutines();
    }

    //Renders list of available routines to choose from
    //R = Available routines
    function RenderAvailableRoutines(R) {
        return (
            <div className={Routine_S.DropdownStart}>
                Switch Routine
                {R ?
                    R.map((ar, index) => (
                        <AvailableRoutine Mode={Q.Mode} Device={Q.Device} key={index} Title={ar.title} Id={ar.id} SwappingRoutine={SwappingRoutine} />
                    ))
                    : null}
            </div>
        );
    }

    return (
        <div className={Q.Subpage == "Routine" ? Routine_S.IsOpen : Routine_S.IsClosed}>
            {Q.Subpage != "Routine" ?
                <button className={Routine_S.Open} onClick={() => Q.SwitchSubpage("Routine")}>Open Routine</button>
                :
                <div className={Routine_S.Vessal}>

                    <div className={Routine_S.Header}>
                        <div className={Q.UnsavedSchedule ? Routine_S.NotSaved : Routine_S.IsSaved}>
                            {Q.UnsavedSchedule ? "Unsaved Changes" : "Changes Saved"}
                        </div>
                    </div>

                    <div className={Routine_S.ControlPanel}>

                        <input type="text" id={"S_Title_ID"} className={Routine_S.Title}
                            defaultValue={Q.Schedule && Q.Schedule.title ? Q.Schedule.title : ""}
                            onChange={(e) => AlterTitle(e.target.value)} />

                        <div className={Routine_S.Options}>
                            <button className={Routine_S.Duplicate} onClick={() => Duplicate_R()}>Duplicate</button>
                            <div className={Routine_S.Options_Row}>
                                <button className={Routine_S.OptionButtons} onClick={() => Q.SetAsCurrentRoutine(Q.Schedule)}>Assign</button>
                                <button className={Routine_S.OptionButtons} onClick={() => Save_R()}>Save</button>
                            </div>
                            {/* <div className={Routine_S.Options_Row_Buffer}></div> */}{/* ? */}
                            <div className={Routine_S.Options_Row}>
                                <button className={Routine_S.OptionButtons} onClick={() => Create_R()}>Create</button>
                                <button className={Routine_S.OptionButtons} onClick={() => Delete_R()}>Delete</button>
                            </div>
                        </div>

                        {RenderAvailableRoutines(AvailableRoutines)}

                        <button className={Routine_S.Close} onClick={() => Q.SwitchSubpage("")}>Close</button>

                    </div>
                </div>
            }
        </div>
    );
}

//Dropdown options for swapping routines
function AvailableRoutine(Q) {
    return (
        <div className={Routine_S.R_Link} onClick={() => Q.SwappingRoutine(Q.Id)}>
            {Q.Title}
        </div>
    );
}

export { AgendaInterface, RoutineInterface };