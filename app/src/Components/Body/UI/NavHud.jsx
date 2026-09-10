import { useRef, useEffect, useState } from "react";
import { GetAvailableRoutines, CreateNewRoutine, DeleteRoutine, GetCurrentRoutine, DuplicateRoutine } from "../../../Backend/DatabaseConnection.js";
import { RC, RS } from "../../../Backend/HandleReact.js";
import Agenda_S from "../Styles/Navigation/Agenda.module.css";
import Routine_S from "../Styles/Navigation/Routine.module.css";
import Simple_S from "../Styles/Navigation/Simple.module.css";

//UI for agenda subpage
function AgendaInterface(Q) {

    const [SaveStatus, setSaveStatus] = useState({
        css: Q.UnsavedAgenda ? `${Agenda_S.NotSaved} ${Q.Themes.C_S_N}` : `${Agenda_S.IsSaved} ${Q.Themes.C_S_Y}`,
        message: Q.UnsavedAgenda ? "Unsaved Changes" : "Changes Saved"
    });
    const Signals = useRef(null);

    //Update save status ui when needed
    useEffect(() => {
        if (RC(Signals) == null) {
            RS(Signals, {
                save: structuredClone(Q.Signal_Saved)
            });
        }
        else if (RC(Signals).save != Q.Signal_Saved) {
            RC(Signals).save = Q.Signal_Saved;
            setSaveStatus({
                css: Q.UnsavedAgenda == true ? `${Agenda_S.NotSaved} ${Q.Themes.C_S_N}` : `${Agenda_S.IsSaved} ${Q.Themes.C_S_Y}`,
                message: Q.UnsavedAgenda == true ? "Unsaved Changes" : "Changes Saved"
            });
        }
    }, [Q.UnsavedAgenda, Q.Signal_Saved]);

    return (
        <div className={`
        ${Q.Subpage == "Agenda" ? Agenda_S.IsOpen : Agenda_S.IsClosed} ${Q.Subpage == "Agenda" ? Q.Themes.LC_N_B : null} ${Q.Themes.LC_N_F}`}>

            {Q.Subpage != "Agenda" ?
                <button className={`${Agenda_S.Open} ${Q.Themes.LC_N_OB}`} onClick={() => Q.SwitchSubpage("Agenda")}>Open Agenda</button>
                :
                <div className={Agenda_S.Vessal}>

                    <div className={Agenda_S.Header}>
                        <div className={SaveStatus.css}>
                            {SaveStatus.message}
                        </div>
                    </div>

                    <div className={`${Agenda_S.ControlPanel} ${Q.Themes.LC_N_UIB}`}>

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

                        <button className={Agenda_S.Select} onClick={() => Q.OpenPopUp("Select Agenda Week")}>Select</button>

                        <button className={Agenda_S.Close} onClick={() => Q.SwitchSubpage("")}>Close</button>

                    </div>
                </div>
            }
        </div>
    );
}

//UI for routine subpage
function RoutineInterface(Q) {

    const [AvailableRoutines_Dropdown, setAvailableRoutines_Dropdown] = useState(null);

    const [SaveStatus, setSaveStatus] = useState({
        css: Q.UnsavedSchedule ? `${Routine_S.NotSaved} ${Q.Themes.C_S_N}` : `${Routine_S.IsSaved} ${Q.Themes.C_S_Y}`,
        message: Q.UnsavedSchedule ? "Unsaved Changes" : "Changes Saved"
    });
    const Signals = useRef(null);

    //Update save status ui when needed
    useEffect(() => {
        if (RC(Signals) == null) {
            (async () => {
                UpdateAvailableRoutines();
            })();
            RS(Signals, {
                save: structuredClone(Q.Signal_Saved),
                schedule: structuredClone(Q.Signal_ScheduleSwapped)
            });
        }
        else if (Q.Signal_ScheduleSwapped != RC(Signals).schedule) {
            RC(Signals).schedule = structuredClone(Q.Signal_ScheduleSwapped);
            (async () => {
                UpdateAvailableRoutines();
            })();
            UpdateTitle();
            RC(Signals).save = structuredClone(Q.Signal_Saved);
            setSaveStatus({
                css: Q.UnsavedSchedule == true ? `${Routine_S.NotSaved} ${Q.Themes.C_S_N}` : `${Routine_S.IsSaved} ${Q.Themes.C_S_Y}`,
                message: Q.UnsavedSchedule == true ? "Unsaved Changes" : "Changes Saved"
            });
        }
        else if (RC(Signals).save != Q.Signal_Saved) {
            RC(Signals).save = structuredClone(Q.Signal_Saved);
            setSaveStatus({
                css: Q.UnsavedSchedule == true ? `${Routine_S.NotSaved} ${Q.Themes.C_S_N}` : `${Routine_S.IsSaved} ${Q.Themes.C_S_Y}`,
                message: Q.UnsavedSchedule == true ? "Unsaved Changes" : "Changes Saved"
            });
        }
    }, [Q.UnsavedSchedule, Q.Signal_Saved, Q.Signal_ScheduleSwapped]);

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
            Q.Schedule.title = T;
            Q.Mark_Unsaved("Schedule", true);
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
        setAvailableRoutines_Dropdown(RenderAvailableRoutines(newAR));
    }

    //Creates a new routine
    async function Create_R() {
        await Q.SetupNewRoutine();
        UpdateTitle();
        UpdateAvailableRoutines();
    }

    //Saves changes to current selected routine
    function Save_R() {
        Q.SaveCurrentSchedule();
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
            throw new Error("Error: No schedule to duplicate");
        }
    }

    //Swaps routine based on provided id
    //I = Id of routine
    async function SwappingRoutine(I) {
        await Q.SwapToRoutine(I);
    }

    //Renders list of available routines to choose from
    //R = Available routines
    function RenderAvailableRoutines(R) {
        return (
            <div className={`${Routine_S.DropdownStart} ${Q.Themes.LC_N_DL}`}>
                Switch Routine
                {R ?
                    R.map((ar, index) => (
                        <AvailableRoutine Mode={Q.Mode} Device={Q.Device} key={index} Themes={Q.Themes} Title={ar.title} Id={ar.id} SwappingRoutine={SwappingRoutine} />
                    ))
                    : null}
            </div>
        );
    }

    return (
        <div className={`${Q.Subpage == "Routine" ? Routine_S.IsOpen : Routine_S.IsClosed} ${Q.Subpage == "Routine" ? Q.Themes.LC_N_B : null}`}>
            {Q.Subpage != "Routine" ?
                <button className={`${Routine_S.Open} ${Q.Themes.LC_N_OB}`} onClick={() => Q.SwitchSubpage("Routine")}>Open Routine</button>
                :
                <div className={Routine_S.Vessal}>

                    <div className={Routine_S.Header}>
                        <div className={SaveStatus.css}>
                            {SaveStatus.message}
                        </div>
                    </div>

                    <div className={`${Routine_S.ControlPanel} ${Q.Themes.LC_N_UIB}`}>

                        <input type="text" id={"S_Title_ID"} className={`${Routine_S.Title} ${Q.Themes.LC_N_L}`}
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

                        {AvailableRoutines_Dropdown}

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
        <div className={`${Routine_S.R_Link} ${Q.Themes.LC_N_DO}`} onClick={() => Q.SwappingRoutine(Q.Id)}>
            {Q.Title}
        </div>
    );
}

//UI for showing readme file
function ReadMeInterface(Q) {
    return (
        <div className={Simple_S.Vessal}>
            {Q.Subpage != "ReadMe" ?
                <button className={Q.Themes.LC_N_OB} onClick={() => Q.SwitchSubpage("ReadMe")}>Open ReadMe</button>
                :
                <button className={Q.Themes.LC_N_OB} onClick={() => Q.SwitchSubpage("")}>Close ReadMe</button>
            }
        </div>
    );
}

export { AgendaInterface, RoutineInterface, ReadMeInterface };