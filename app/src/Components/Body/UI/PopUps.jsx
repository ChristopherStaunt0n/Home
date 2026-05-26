import { useRef, useEffect, useState } from "react";
import { days } from "../../../Backend/HandleDates.js";
import { TurnIntoArray, Capitalize } from "../../../Backend/HandleGeneral.js";
import CreateTask_S from "../Styles/PopUps/CreateNewTask.module.css";
import EditTask_S from "../Styles/PopUps/EditOldTask.module.css";
import BuildChore_S from "../Styles/PopUps/BuildChores.module.css";
import BuildNote_S from "../Styles/PopUps/BuildNote.module.css";
import NoteDelete_S from "../Styles/PopUps/NoteDelete.module.css";
import GenConfirm_S from "../Styles/PopUps/GeneralConfirm.module.css";
import Basic_S from "../../../Styles/Basics.module.css";

//Generates a pop up interface for creating a new task
function CreateNewTask(Q) {

    const CreateT_Device = [CreateTask_S.Computer, CreateTask_S.Mobile];
    const CreateT_Mode = [CreateTask_S.Public, CreateTask_S.Private];

    const TaskID = "TaskA" + Q.Device + Q.Mode + Q.Today + "_ID";
    const ImportantID = "ImportantA" + Q.Device + Q.Mode + Q.Today + "_ID";
    const WhenID = "WhenA" + Q.Device + Q.Mode + Q.Today + "_ID";
    const AmPmID = "AmPmA" + Q.Device + Q.Mode + Q.Today + "_ID";
    const TimedID = "TimedA" + Q.Device + Q.Mode + Q.Today + "_ID";

    //Toggles importance of new task
    function ToggleImportant() {
        if (document.getElementById(ImportantID).value == "Important") {
            document.getElementById(ImportantID).value = "Normal";
        }
        else {
            document.getElementById(ImportantID).value = "Important";
        }
    }

    //Toggle between AM or PM
    function ToggleAMPM() {
        if (document.getElementById(AmPmID).value == "AM") {
            document.getElementById(AmPmID).value = "PM";
        }
        else {
            document.getElementById(AmPmID).value = "AM";
        }
    }

    //Toggles usage of time
    function ToggleUseTime() {
        if (document.getElementById(TimedID).value == "Use Time") {
            document.getElementById(TimedID).value = "No Time";
        }
        else {
            document.getElementById(TimedID).value = "Use Time";
        }
    }

    //Checks if time is valid
    //T = Time
    function IsTimeValid(T) {
        if (T && T != "" && T.includes(":")) {
            let TempTime = T.split(":");
            if (TempTime.length == 2 &&
                Number(TempTime[0]) <= 12 && Number(TempTime[0]) >= 1 &&
                Number(TempTime[1]) <= 59 && Number(TempTime[1]) >= 0
            ) {
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

    //Prepares and validates new task before adding to agenda
    function SubmitNewTask() {

        let Name = document.getElementById(TaskID).value;
        let Importance = (document.getElementById(ImportantID).value == "Important" ? true : false);
        let Time = document.getElementById(WhenID).value;

        if (document.getElementById(TimedID).value == "Use Time" && !IsTimeValid(Time)) {
            alert("Invalid Time: Must be X:XX format (ex: 12:59)");
        }
        else {
            if (!Name || Name == "") {
                alert("Invalid Name");
            }
            else {
                Time = Time.split(":");
                Time = Number(Time[0]) + ":" + (Number(Time[1]) <= 9 ? "0" + Number(Time[1]) : Number(Time[1]));
                Time = (document.getElementById(TimedID).value == "Use Time" ? Time + " " + document.getElementById(AmPmID).value : null);
                let NewTask = {
                    goal: Name,
                    important: Importance,
                    time: Time,
                    complete: false,
                    notes: ""
                };
                Q.AddTask(NewTask);
            }
        }
    }

    //Exits the current popup
    function ExitThisPopUp() {
        Q.SetupPopup("")
    }

    return (
        <div className={CreateTask_S.Cover}>
            <div className={`${CreateT_Device[Q.Device]} ${CreateT_Mode[Q.Mode]}`}>

                <input type="button" className={CreateTask_S.Exit} value={"X"} onClick={() => ExitThisPopUp()} />

                <div className={CreateTask_S.Title}>Task</div>

                <div className={CreateTask_S.Goal_Outter}>
                    <input type="text" id={TaskID} defaultValue={"Write Objective Here"} className={CreateTask_S.Goal} />
                </div>

                <span className={CreateTask_S.Timing}>
                    <input type="text" className={CreateTask_S.Timing_T} id={WhenID} defaultValue={"12:00"} />
                    <input type="button" className={CreateTask_S.Timing_Button_A} id={AmPmID} value={"AM"} onClick={() => ToggleAMPM()} />
                    <input type="button" className={CreateTask_S.Timing_Button_B} id={TimedID} value={"No Time"} onClick={() => ToggleUseTime()} />
                </span>

                <input type="button" className={CreateTask_S.Importance} id={ImportantID} value={"Normal"} onClick={() => ToggleImportant()} />

                <input type="button" className={CreateTask_S.Submition} value={"Create"} onClick={() => SubmitNewTask()} />

            </div>
        </div>
    );
}

//Generates a pop interface for editing an old task
function EditOldTask(Q) {

    const EditT_Device = [EditTask_S.Computer, EditTask_S.Mobile];
    const EditT_Mode = [EditTask_S.Public, EditTask_S.Private];

    const Whens = days;
    const [AssignedDay, setAssignedDay] = useState("" + Q.Today + "");
    const [Confirm, setConfirm] = useState(null);

    const TaskID = "TaskE" + Q.Device + Q.Mode + Q.Today + "_ID";
    const ImportantID = "ImportantE" + Q.Device + Q.Mode + Q.Today + "_ID";
    const WhenID = "WhenE" + Q.Device + Q.Mode + Q.Today + "_ID";
    const AmPmID = "AmPmE" + Q.Device + Q.Mode + Q.Today + "_ID";
    const TimedID = "TimedE" + Q.Device + Q.Mode + Q.Today + "_ID";

    //Toggles importance of new task
    function ToggleImportant() {
        if (document.getElementById(ImportantID).value == "Important") {
            document.getElementById(ImportantID).value = "Normal";
        }
        else {
            document.getElementById(ImportantID).value = "Important";
        }
    }

    //Toggle between AM or PM
    function ToggleAMPM() {
        if (document.getElementById(AmPmID).value == "AM") {
            document.getElementById(AmPmID).value = "PM";
        }
        else {
            document.getElementById(AmPmID).value = "AM";
        }
    }

    //Toggles usage of time
    function ToggleUseTime() {
        if (document.getElementById(TimedID).value == "Use Time") {
            document.getElementById(TimedID).value = "No Time";
        }
        else {
            document.getElementById(TimedID).value = "Use Time";
        }
    }

    //Checks if time is valid
    //T = Time
    function IsTimeValid(T) {
        if (T && T != "" && T.includes(":")) {
            let TempTime = T.split(":");
            if (TempTime.length == 2 &&
                Number(TempTime[0]) <= 12 && Number(TempTime[0]) >= 1 &&
                Number(TempTime[1]) <= 59 && Number(TempTime[1]) >= 0
            ) {
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

    //Exits the current popup
    function ExitThisPopUp() {
        Q.SetupPopup("")
    }

    //Applys task edits
    function ApplyTaskEdits() {
        let Name = document.getElementById(TaskID).value;
        let Importance = (document.getElementById(ImportantID).value == "Important" ? true : false);
        let Time = document.getElementById(WhenID).value;

        if (document.getElementById(TimedID).value == "Use Time" && !IsTimeValid(Time)) {
            alert("Invalid Time: Must be X:XX format (ex: 12:59)");
        }
        else {
            if (!Name || Name == "") {
                alert("Invalid Name");
            }
            else {
                Time = Time.split(":");
                Time = Number(Time[0]) + ":" + (Number(Time[1]) <= 9 ? "0" + Number(Time[1]) : Number(Time[1]));
                Time = (document.getElementById(TimedID).value == "Use Time" ? Time + " " + document.getElementById(AmPmID).value : null);
                let NewTask = {
                    goal: Name,
                    important: Importance,
                    time: Time,
                    complete: Q.TaskInfo.complete,
                    notes: Q.TaskInfo.notes
                };
                if (AssignedDay != Q.Today) {
                    setConfirm(
                        <GeneralConfirm Mode={Q.Mode} Device={Q.Device} Close={CloseUp}
                            Message={"Copy or Move?"} ChoiceA={"Copy"} ChoiceB={"Move"}
                            FunctionA={() => Q.AddTaskToDay(AssignedDay, NewTask)}
                            FunctionB={() => Q.SwapTask(AssignedDay, Q.CurrentTask, NewTask)} />
                    );
                }
                else {
                    Q.EditTask(Q.CurrentTask, NewTask);
                }
            }
        }
    }

    //Closes confirm pop up along this pop up
    function CloseUp() {
        setConfirm(null);
        Q.SetupPopup(null);
    }

    //Deletes the task
    function DeleteThisTask() {
        Q.DeleteTask(Q.CurrentTask)
    }

    return (
        <div className={EditTask_S.Cover}>
            {Confirm}
            <div className={`${EditT_Device[Q.Device]} ${EditT_Mode[Q.Mode]}`}>

                <input type="button" className={EditTask_S.Exit} value={"X"} onClick={() => ExitThisPopUp()} />

                <div className={EditTask_S.Title}>Edit Task</div>

                <div className={EditTask_S.Goal_Outter}>
                    <input className={EditTask_S.Goal} type="text" id={TaskID} defaultValue={Q.TaskInfo.goal} />
                </div>

                <div className={EditTask_S.WhichDay}>
                    {Whens.map((w, index) => (
                        <div key={index} className={EditTask_S.TheDay}>
                            <button className={AssignedDay == w ? EditTask_S.TheDay_Y : EditTask_S.TheDay_N} onClick={() => setAssignedDay(w)}>
                                {w}
                            </button>
                        </div>
                    ))}
                </div>

                <span className={EditTask_S.Timing}>
                    <input type="text" className={EditTask_S.Timing_T} id={WhenID} defaultValue={Q.TaskInfo.time != null ? Q.TaskInfo.time.split(" ")[0] : "12:00"} />
                    <input type="button" className={EditTask_S.Timing_Button_A} id={AmPmID} defaultValue={Q.TaskInfo.time != null ? Q.TaskInfo.time.split(" ")[1] : "AM"} onClick={() => ToggleAMPM()} />
                    <input type="button" className={EditTask_S.Timing_Button_B} id={TimedID} defaultValue={Q.TaskInfo.time == null ? "No Time" : "Use Time"} onClick={() => ToggleUseTime()} />
                </span>

                <input type="button" className={EditTask_S.Importance} id={ImportantID} defaultValue={Q.TaskInfo.important ? "Important" : "Normal"} onClick={() => ToggleImportant()} />

                <span className={EditTask_S.Submition}>
                    <input type="button" className={EditTask_S.Submition_E} value={"Apply Changes"} onClick={() => ApplyTaskEdits()} />
                    <input type="button" className={EditTask_S.Submition_D} value={"Delete Task"} onClick={() => DeleteThisTask()} />
                </span>

            </div>
        </div>
    );
}

//Generates a pop up interface for creating a new chore, editing an old chore, or deleting one
function TweakChore(Q) {

    const CreateC_Device = [BuildChore_S.Computer, BuildChore_S.Mobile];
    const CreateC_Mode = [BuildChore_S.Public, BuildChore_S.Private];

    const WeekButtons = [BuildChore_S.WB_Active, BuildChore_S.WB_Inactive];

    const Whens = days.concat(["Week"]);

    const [Goal, setGoal] = useState(Q.OldObjective == null ? "Write Objective Here" : Q.OldObjective.chore);
    const [WhichDays, setWhichDays] = useState(Q.OldObjective ? Q.OldObjective.days : Q.StarterDays);
    const [Importance, setImportance] = useState(Q.OldObjective == null ? false : Q.OldObjective.important);

    const [Time, setTime] = useState(Q.OldObjective == null || Q.OldObjective.time == null ? "12:00" : Q.OldObjective.time.split(" ")[0]);
    const [APM, setAPM] = useState(Q.OldObjective == null || Q.OldObjective.time == null ? "AM" : Q.OldObjective.time.split(" ")[1]);
    const [UseTime, setUseTime] = useState(Q.OldObjective == null || Q.OldObjective.time == null ? "Inactive" : "Active");

    //Toggles active days for routine
    //W = Which day of the week to set/add to 'WhichDays'
    function ToggleWhen(W) {
        if (W == "Week" && !WhichDays.includes("Week")) {
            setWhichDays(["Week"]);
        }
        else if (W != "Week" && WhichDays.includes("Week")) {
            setWhichDays([W]);
        }
        else if (WhichDays.includes(W)) {
            setWhichDays(WhichDays.filter(d => d != W));
        }
        else if (!WhichDays.includes(W)) {
            setWhichDays(WhichDays.concat([W]));
        }
        else {
            console.log("Error: Failed to toggle chore's day(s)");
        }
    }

    //Checks if time is valid
    //T = Time
    function IsTimeValid(T) {
        if (T && T != "" && T.includes(":")) {
            let TempTime = T.split(":");
            if (TempTime.length == 2 &&
                Number(TempTime[0]) <= 12 && Number(TempTime[0]) >= 1 &&
                Number(TempTime[1]) <= 59 && Number(TempTime[1]) >= 0
            ) {
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

    //Submits new chore for creation
    function SubmitNewChore() {

        let theGoal = null;
        let theDays = null;
        let theTime = null;

        if (!Goal || Goal == "") {
            alert("Invalid Routine Goal!");
            console.log("Error: Could not find chore goal");
        }
        else if (!WhichDays || WhichDays.length == 0) {
            alert("You forgot to select days!");
            console.log("Error: Unknown day(s) to apply chore");
        }
        else if (UseTime == "Active" && !IsTimeValid(Time)) {
            alert("Invalid Time: Must be X:XX format (ex: 12:59)");
        }
        else {
            theGoal = Goal;
            theDays = WhichDays;
            theTime = UseTime == "Active" ? Time + " " + APM + "" : null;

            if (UseTime == "Active") {
                theTime = Time.split(":");
                theTime = Number(theTime[0]) + ":" + (Number(theTime[1]) <= 9 ? "0" + Number(theTime[1]) : Number(theTime[1])) + " " + APM;
            }
        }

        if (theDays && theGoal) {
            Q.CreateNewChore(Q.Mode, theDays, theTime, theGoal, Importance);
            Q.SetupPopup("");
        }
        else {
            console.log("Error: Failed to create new chore");
        }
    }

    //Attempts to apply edits to chore
    function SubmitChoreEdit() {

        let theGoal = null;
        let theDays = null;
        let theTime = null;

        if (!Goal || Goal == "") {
            alert("Invalid Routine Goal!");
            console.log("Error: Could not find chore goal");
        }
        else if (!WhichDays || WhichDays.length == 0) {
            alert("You forgot to select days!");
            console.log("Error: Unknown day(s) to apply chore");
        }
        else if (UseTime == "Active" && !IsTimeValid(Time)) {
            alert("Invalid Time: Must be X:XX format (ex: 12:59)");
        }
        else {
            theGoal = Goal;
            theDays = WhichDays;
            theTime = UseTime == "Active" ? Time + " " + APM + "" : null;

            if (UseTime == "Active") {
                theTime = Time.split(":");
                theTime = Number(theTime[0]) + ":" + (Number(theTime[1]) <= 9 ? "0" + Number(theTime[1]) : Number(theTime[1])) + " " + APM;
            }
        }

        if (theDays && theGoal && Q.OldObjective.id) {
            Q.EditOldChore(Q.OldObjective.id, Q.Mode, theDays, theTime, theGoal, Importance);
            Q.SetupPopup("");
        }
        else {
            console.log("Error: Failed to edit chore");
        }
    }

    //Sends request to delete chore
    function DeleteChore() {
        Q.DeleteChore(Q.OldObjective.id, Q.Mode);
        Q.SetupPopup("");
    }

    //Exits the current popup
    function ExitThisPopUp() {
        Q.SetupPopup("")
    }

    return (
        <div className={BuildChore_S.Cover}>
            <div className={`${CreateC_Device[Q.Device]} ${CreateC_Mode[Q.Mode]}`}>

                <input type="button" className={BuildChore_S.Exit} value={"X"} onClick={() => ExitThisPopUp()} />

                <div className={BuildChore_S.Title}>
                    {Q.Task == "Create" ? "New Routine Objective" : "Edit Routine"}
                </div>

                <input type="text" className={BuildChore_S.Goal} defaultValue={Goal} onChange={(e) => setGoal(e.target.value)} />{/* 5% */}

                <div className={BuildChore_S.WhenBar}>
                    {Whens.map((w, index) => (
                        <div key={index} className={BuildChore_S.WhenBar_VC}>
                            <button className={WhichDays.includes(w) ? WeekButtons[0] : WeekButtons[1]} onClick={() => ToggleWhen(w)}>
                                {w}
                            </button>
                        </div>
                    ))}
                </div>

                <div className={BuildChore_S.Import}>
                    <button className={Basic_S.Blue_Hover} onClick={() => setImportance(Importance ? false : true)}>{Importance ? "Important" : "Normal"}</button>
                </div>

                <div className={BuildChore_S.Vessal_Time}>
                    <input type="text" defaultValue={Time} onChange={(e) => setTime(e.target.value)} />
                    <button className={Basic_S.Blue_Hover} onClick={() => APM == "AM" ? setAPM("PM") : setAPM("AM")}>{APM}</button>
                    <button className={Basic_S.Blue_Hover} onClick={() => UseTime == "Active" ? setUseTime("Inactive") : setUseTime("Active")}>{UseTime}</button>
                </div>

                {Q.Task == "Edit" ?
                    <div className={BuildChore_S.Submition_Old}>
                        <input type="button" className={Basic_S.Green_Hover} value={Q.Task} onClick={() => SubmitChoreEdit()} />
                        <input type="button" className={Basic_S.Red_Hover} value={"Delete"} onClick={() => DeleteChore()} />
                    </div>
                    :
                    <div className={BuildChore_S.Submition_New}>
                        <input type="button" className={Basic_S.Green_Hover} value={Q.Task} onClick={() => SubmitNewChore()} />
                    </div>
                }
            </div>
        </div>
    );
}

//Generates a pop up interface for creating a new general note
function TweakNote(Q) {

    const NoteBuild_Device = [BuildNote_S.Computer, BuildNote_S.Mobile];
    const NoteBuild_Mode = [BuildNote_S.Public, BuildNote_S.Private];

    const [Note_Title, setNote_Title] = useState("Write Note Title Here");
    const [Note_Group, setNote_Group] = useState("Groups");
    const [NewGroup, setNewGroup] = useState(
        Q.Mode == 0 ? (Q.Notes.public.length > 0 ? false : true) : (Q.Notes.private.length > 0 ? false : true)
    );

    //Checks to see if title is already in use for the group
    //T = Title
    //G = Group
    //N = Avaialble notes
    //M = Mode (public vs private)
    function CheckIfTitleAlreadyUsed(T, G, N, M) {

        let someNotes = M == 0 ? N.public : N.private;
        someNotes = TurnIntoArray(someNotes.filter(s => s.group == G));

        for (let i = 0; i < someNotes.length; i++) {
            if (someNotes[i].title == T) {
                return true;
            }
        }
        return false;
    }

    //Attempts to create new note
    function SubmitNote() {

        let nTitle = null;
        let nGroup = null;
        let nNote = "";

        if (!Note_Group || Note_Group == "" || Note_Group == "New Group" || Note_Group == "Groups") {
            alert("Invalid Group!");
        }
        else if (!Note_Title && Note_Title == "" || Note_Title == "Write Note Title Here" || CheckIfTitleAlreadyUsed(Note_Title, Note_Group, Q.Notes, Q.Mode)) {
            alert("Invalid Title!");
        }
        else {
            nTitle = Note_Title;
            nGroup = Note_Group;
        }

        if (nTitle && nGroup) {
            Q.CreateNote(Q.Mode, nGroup, nTitle, nNote);
        }
        else {
            console.log("Error: Failed to create note");
        }
    }

    //Creates the UI for selecting group to tie note to
    //M = NewGroup
    function SetupGroup(M) {

        let DivContent = null;

        if (M) {
            DivContent =
                <div className={BuildNote_S.NewGroup_UI}>
                    <textarea className={BuildNote_S.NewGroup_Label} defaultValue={Note_Group} onChange={(e) => setNote_Group(e.target.value)} />
                    {Q.Notes.public.concat(Q.Notes.private).length > 0 ?
                        <button className={BuildNote_S.OldGroup_Toggle} onClick={() => FlipGroupMode("Old")}>Use Old</button>
                        :
                        null}
                </div>;
        }
        else {

            let AllNotes = Q.Mode == 0 ? Q.Notes.public : Q.Notes.private;//Q.Notes.public.concat(Q.Notes.private);
            let theGroups = [];

            for (let i = 0; i < AllNotes.length; i++) {
                theGroups.push(AllNotes[i].group);
            }
            theGroups = [...new Set(theGroups)];
            theGroups.sort();

            DivContent = <div className={BuildNote_S.OldGroup_UI}>

                <div className={BuildNote_S.OldGroup_Select}>
                    <div className={BuildNote_S.OldGroup_Label}>{Note_Group}</div>
                    {theGroups.map((g, index) => (
                        <div key={index} className={BuildNote_S.OldGroup_Choice} onClick={() => setNote_Group(g)}>
                            {g}
                        </div>
                    ))}
                </div>

                <button className={BuildNote_S.OldGroup_Toggle} onClick={() => FlipGroupMode("New")}>Create New</button>

            </div>;
        }

        return DivContent;
    }

    //Flips between usage of new or old groups
    //B = Which mode
    function FlipGroupMode(B) {
        if (B == "New") {
            setNewGroup(true);
            setNote_Group("New Group");
        }
        else if (B == "Old") {
            setNewGroup(false);
            setNote_Group("Groups");
        }
    }

    return (
        <div className={BuildNote_S.Cover}>
            <div className={`${NoteBuild_Device[Q.Device]} ${NoteBuild_Mode[Q.Mode]}`}>
                <div className={BuildNote_S.Exit} onClick={() => Q.ShowPopUp("")}>
                    X
                </div>
                <div className={BuildNote_S.Title_Vessal}>
                    <textarea className={BuildNote_S.Title} defaultValue={Note_Title} onChange={(e) => setNote_Title(e.target.value)} />
                </div>
                <div className={BuildNote_S.Group}>
                    {SetupGroup(NewGroup)}
                </div>
                <button className={BuildNote_S.Submit} onClick={() => SubmitNote()}>Create Note</button>
            </div>
        </div>
    );
}

//Confirms with user if they want to delete note
function ConfirmNoteDelete(Q) {

    const NoteDelete_Device = [NoteDelete_S.Computer, NoteDelete_S.Mobile];
    const NoteDelete_Mode = [NoteDelete_S.Public, NoteDelete_S.Private];

    //Deletes note or not based on input
    //A = Input
    function PerformDelete(A) {
        if (A && Q.CurrentNote) {
            Q.RemoveNote(Q.CurrentNote.id);
        }
        Q.ShowPopUp("");
    }

    return (
        <div className={NoteDelete_S.Cover}>
            <div className={`${NoteDelete_Device[Q.Device]} ${NoteDelete_Mode[Q.Mode]}`}>

                <div className={NoteDelete_S.Exit}>
                    <button onClick={() => Q.ShowPopUp("")}>X</button>
                </div>

                <div className={NoteDelete_S.Message}>
                    Are you sure want to delete this note?
                </div>

                <div className={NoteDelete_S.Confirm}>
                    <button className={NoteDelete_S.Yes} onClick={() => PerformDelete(true)}>Yes</button>
                    <button className={NoteDelete_S.No} onClick={() => PerformDelete(false)}>No</button>
                </div>

            </div>
        </div>
    );
}

//Customizable confirm message
function GeneralConfirm(Q) {

    const GC_Device = [GenConfirm_S.Computer, GenConfirm_S.Mobile];
    const GC_Mode = [GenConfirm_S.Public, GenConfirm_S.Private];

    return (
        <div className={GenConfirm_S.Cover}>
            <div className={`${GC_Device[Q.Device]} ${GC_Mode[Q.Mode]}`}>

                <div className={GenConfirm_S.Message}>
                    {Q.Message}
                </div>

                <div className={GenConfirm_S.Choices}>
                    <button onClick={() => { Q.FunctionA(); Q.Close(); }}>
                        {Q.ChoiceA}
                    </button>
                    <button onClick={() => { Q.FunctionB(); Q.Close(); }}>
                        {Q.ChoiceB}
                    </button>
                </div>

            </div>
        </div>
    );
}

export { CreateNewTask, EditOldTask, TweakChore, TweakNote, ConfirmNoteDelete, GeneralConfirm };