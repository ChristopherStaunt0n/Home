import { useRef, useEffect, useState } from "react";
import {
    GetNotes, AddNote, UpdateNote, DeleteNote,
    GetRecentGeneralNotes, UpdateRecentGeneralNotes, GetBookmarkGeneralNotes, UpdateBookmarkGeneralNotes
} from "../../Backend/DatabaseConnection.js";
import { TurnIntoArray } from "../../Backend/HandleGeneral.js";
import { GetNewNoteID } from "../../Backend/HandleNotes.js";
import { Week } from "./UI/Weekly.jsx";
import { Routine } from "./UI/Tradition.jsx";
import Navigation_S from "./Styles/Navigation/Navigation.module.css";
import { AgendaInterface, RoutineInterface } from "./UI/NavHud.jsx";
import { Choose, Adjustments, Recent, Writing } from "./UI/Notes.jsx";
import { TweakNote, ConfirmNoteDelete } from "./UI/PopUps.jsx";
import Common_S from "./Styles/Common.module.css";
import Notes_S from "./Styles/Notes/Notes.module.css";

//Body section to Homepage
export default function Bod(Q) {

    return (
        <div className={Q.CN}>
            <Navigation Mode={Q.Mode} Device={Q.Device}
                UnsavedAgenda={Q.UnsavedAgenda} SwitchCurrentAgenda={Q.SwitchCurrentAgenda} SaveCurrentAgenda={Q.SaveCurrentAgenda} SaveCurrentSchedule={Q.SaveCurrentSchedule}
                UnsavedSchedule={Q.UnsavedSchedule} Schedule={Q.Schedule} UpdateSchedule={Q.UpdateSchedule} SetupNewRoutine={Q.SetupNewRoutine}
                Subpage={Q.Subpage} SwitchSubpage={Q.SwitchSubpage} SetAsCurrentRoutine={Q.SetAsCurrentRoutine}
                SwapToRoutine={Q.SwapToRoutine} />
            <Common Mode={Q.Mode} Device={Q.Device}
                Agenda={Q.Agenda} UpdateAgenda={Q.UpdateAgenda}
                Schedule={Q.Schedule} UpdateSchedule={Q.UpdateSchedule}
                ThisWeeksSchedule={Q.ThisWeeksSchedule}
                Subpage={Q.Subpage} />
            <Notes Mode={Q.Mode} Device={Q.Device} />
            {/* <div style={{ width: "15%", height: "100%" }}></div> */}
        </div>
    );
}

//Manages agenda notes and additonal component navigation in the Common section
function Navigation(Q) {

    const Navigation_Device = [Navigation_S.Computer, Navigation_S.Mobile];
    const Navigation_Mode = [Navigation_S.Public, Navigation_S.Private];

    const AgendaHud = (
        <AgendaInterface Mode={Q.Mode} Device={Q.Device} Subpage={Q.Subpage} SwitchSubpage={Q.SwitchSubpage} key={0}
            UnsavedAgenda={Q.UnsavedAgenda} SaveCurrentAgenda={Q.SaveCurrentAgenda} SwitchCurrentAgenda={Q.SwitchCurrentAgenda} />
    );

    const RoutineHud = (
        <RoutineInterface Mode={Q.Mode} Device={Q.Device} Subpage={Q.Subpage} SwitchSubpage={Q.SwitchSubpage} key={1}
            UnsavedSchedule={Q.UnsavedSchedule} SaveCurrentSchedule={Q.SaveCurrentSchedule}
            Schedule={Q.Schedule} UpdateSchedule={Q.UpdateSchedule} SetAsCurrentRoutine={Q.SetAsCurrentRoutine}
            SetupNewRoutine={Q.SetupNewRoutine} SwapToRoutine={Q.SwapToRoutine} />
    );

    const Huds = [
        {
            label: "Agenda",
            element: AgendaHud
        },
        {
            label: "Routine",
            element: RoutineHud
        }
    ];

    //Rearranges hud based on current subpage
    //Sub = Current subpage
    function AdaptNavigationOptions(Sub) {

        let NewHuds = [];
        let MainElment = "";

        for (let i = 0; i < Huds.length; i++) {
            if (Huds[i].label == Sub) {
                MainElment = Huds[i].element;
            }
            else {
                NewHuds.push(Huds[i].element);
            }
        }

        if (MainElment != "") {
            NewHuds = [MainElment].concat(NewHuds);
        }

        return (
            <div className={Navigation_S.Vessal}>
                {NewHuds}
            </div>
        );
    }

    return (
        <div className={`${Navigation_Device[Q.Device]} ${Navigation_Mode[Q.Mode]}`}>
            {/* <span className={Navigation_S.Buffer} /> */}
            {AdaptNavigationOptions(Q.Subpage)}
        </div>
    );
}

//Holds agenda and possibly additonal subpage components
function Common(Q) {

    const Common_Device = [Common_S.Computer, Common_S.Mobile];
    const Common_Mode = [Common_S.Public, Common_S.Private];

    //Renders the currently selected subpage
    //Sub = Selected subpage title
    function GenerateSubpage(Sub) {
        switch (Sub) {
            case "Agenda":
                return <Week Mode={Q.Mode} Device={Q.Device} Agenda={Q.Agenda} UpdateAgenda={Q.UpdateAgenda} UnsavedAgenda={Q.UnsavedAgenda} ThisWeeksSchedule={Q.ThisWeeksSchedule} />;
            case "Routine":
                return <Routine Mode={Q.Mode} Device={Q.Device} Schedule={Q.Schedule} UpdateSchedule={Q.UpdateSchedule} />;
            default:
                return null;
        }
    }

    return (
        <div className={`${Common_Device[Q.Device]} ${Common_Mode[Q.Mode]}`}>
            {GenerateSubpage(Q.Subpage)}
        </div>
    );
}

//General notes
function Notes(Q) {

    const Notes_Device = [Notes_S.Computer, Notes_S.Mobile];
    const Notes_Mode = [Notes_S.Public, Notes_S.Private];
    const [ViewMode, setViewMode] = useState("Normal");

    const [AvailableNotes, setAvailableNotes] = useState(null);
    const [CurrentNote, setCurrentNote] = useState(null);
    const [Unsaved, setUnsaved] = useState(false);

    const [RecentNoteIDs, setRecentNoteIDs] = useState([]);
    const [RecentReady, setRecentReady] = useState(false);
    const RecentLimit = 10;

    const [BookmarkNoteIDs, setBookmarkNoteIDs] = useState([]);
    const [BookmarkReady, setBookmarkReady] = useState(false);

    const [PopUp, setPopUp] = useState(null);

    //Loads pre-existings note data on start up
    useEffect(() => {
        let fetchNotes = async () => {
            let theNotes = await GetNotes();
            setAvailableNotes(theNotes);
            setRecentNoteIDs(await GetRecentGeneralNotes());
            setRecentReady(true);
            setBookmarkNoteIDs(await GetBookmarkGeneralNotes());
            setBookmarkReady(true);
        };
        fetchNotes();
    }, []);

    //Updates recent note ids to backend
    useEffect(() => {
        let backupRecent = async () => {
            if (RecentReady) {
                await UpdateRecentGeneralNotes(RecentNoteIDs);
            }
        };
        backupRecent();
    }, [RecentNoteIDs, RecentReady]);

    //Updates bookmarked note ids to backend
    useEffect(() => {
        let backupBookmarks = async () => {
            if (BookmarkReady) {
                await UpdateBookmarkGeneralNotes(BookmarkNoteIDs);
            }
        };
        backupBookmarks();
    }, [BookmarkNoteIDs, BookmarkReady]);

    //Saves current note before resting upon switching modes
    useEffect(() => {
        let RestNote = async () => {
            await SaveCN_Refresh();
            setCurrentNote(null);
        };
        RestNote();
    }, [Q.Mode]);

    const MillisecondsPerCycle = 5000;//milliseconds|1000ms=1s

    //Autosaves current note
    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (Unsaved) {
                await SaveCN_Refresh();
                console.log("Autosaved note");
            }
            else {
                console.log("No autosave necessary");
            }
        }, MillisecondsPerCycle);
        return () => clearInterval(intervalId);
    }, [Unsaved, CurrentNote, MillisecondsPerCycle]);

    //Changes current note match note with provided id
    //M = Mode (public vs private)
    //I = ID of note
    async function ChangeCurrentNote(M, I) {

        let theNotes = M == 0 ? AvailableNotes.public : AvailableNotes.private;

        await SaveCN_Refresh();

        setCurrentNote(null);

        for (let i = 0; i < theNotes.length; i++) {
            if (theNotes[i].id == I) {
                setCurrentNote(theNotes[i]);
                AddRecentID(I);
                break;
            }
        }
    }

    //Saves changes to current note if needed then refreshes available notes
    async function SaveCN_Refresh() {
        if (Unsaved) {
            await UpdateNote(CurrentNote);
            setUnsaved(false);
        }
        setAvailableNotes(await GetNotes());
    }

    //Sets up popup or hides current
    //P = What pop up
    function ShowPopUp(P) {
        if (P == "Create") {
            setPopUp(<TweakNote Mode={Q.Mode} Device={Q.Device} Notes={AvailableNotes} ShowPopUp={ShowPopUp} CreateNote={CreateNote} />);
        }
        else if (P == "Delete") {
            setPopUp(<ConfirmNoteDelete Mode={Q.Mode} Device={Q.Device} CurrentNote={CurrentNote} ShowPopUp={ShowPopUp} RemoveNote={RemoveNote} />);
        }
        else {
            setPopUp(null);
        }
    }

    //Creates a new unused ID based on AvailableNotes
    function GenerateNewID() {
        return GetNewNoteID(AvailableNotes.public.concat(AvailableNotes.private));
    }

    //Adds recently used note id or moves it to the back if already present
    //I = Note id
    function AddRecentID(I) {
        let newRecent = RecentNoteIDs;
        newRecent = TurnIntoArray(newRecent.filter(j => Number(j) != Number(I)));
        if (newRecent.length > RecentLimit) {
            while (newRecent.length > RecentLimit) {
                newRecent.pop();
            }
        }
        setRecentNoteIDs([Number(I)].concat(newRecent));
    }

    //Removes provided id from recent ids
    //I = Note id
    function RemoveRecentID(I) {
        setRecentNoteIDs(TurnIntoArray(RecentNoteIDs.filter(j => Number(j) != Number(I))));
    }

    //Adds bookmarked note id
    //I = Note id
    function AddBookmarkID(I) {
        let newBookmarks = BookmarkNoteIDs;
        newBookmarks = TurnIntoArray(newBookmarks.filter(j => Number(j) != Number(I)));
        setBookmarkNoteIDs([Number(I)].concat(newBookmarks));
    }

    //Removes provided id from bookmarked ids
    function RemoveBookmarkID(I) {
        setBookmarkNoteIDs(TurnIntoArray(BookmarkNoteIDs.filter(j => Number(j) != Number(I))));
    }

    //Creates a new note using provided info
    //M = Mode (public vs private)
    //G = Group
    //T = Title
    //N = Note
    async function CreateNote(M, G, T, N) {
        let newNote = {
            id: GenerateNewID(),
            mode: M == 0 ? "Public" : "Private",
            group: G,
            title: T,
            message: N
        };
        await AddNote(newNote);
        await SaveCN_Refresh();
        ShowPopUp("");
        setCurrentNote(null);
    }

    //Updates provided note through the backend
    async function ReplaceNote(N) {
        await UpdateNote(N);
        AddRecentID(N.id);
        await SaveCN_Refresh();
    }

    //Deletes note from database based on provided id
    //I = Note id
    async function RemoveNote(I) {
        await DeleteNote(I);
        RemoveRecentID(I);
        RemoveBookmarkID(I);
        setCurrentNote(null);
        await SaveCN_Refresh();
    }

    //Updates title for current note
    //T = New title
    function UpdateCurrentNoteTitle(T) {
        if (CurrentNote) {
            let newNote = CurrentNote;
            newNote.title = T;
            setCurrentNote(JSON.parse(JSON.stringify(newNote)));
            setUnsaved(true);
        }
    }

    //Updates text for current note
    //T = New text
    function UpdateCurrentNoteText(T) {
        if (CurrentNote) {
            let newNote = CurrentNote;
            newNote.message = T;
            setCurrentNote(JSON.parse(JSON.stringify(newNote)));//setCurrentNote({...CurrentNote, title: T});
            setUnsaved(true);
        }
    }

    //Renders the content based on view mode
    //V = View mode
    function RenderMode(V) {

        let Choose_Component = <Choose Mode={Q.Mode} Device={Q.Device} ViewMode={ViewMode} Unsaved={Unsaved}
            Notes={AvailableNotes} CurrentNote={CurrentNote} ChangeCurrentNote={ChangeCurrentNote} ShowPopUp={ShowPopUp} />;

        let Writing_Component = <Writing Mode={Q.Mode} Device={Q.Device} ViewMode={ViewMode}
            Notes={AvailableNotes} CurrentNote={CurrentNote} ChangeCurrentNote={ChangeCurrentNote}
            UpdateCurrentNoteTitle={UpdateCurrentNoteTitle} UpdateCurrentNoteText={UpdateCurrentNoteText} />;

        let Adjustments_Component = <Adjustments Mode={Q.Mode} Device={Q.Device} ViewMode={ViewMode} SaveCN_Refresh={SaveCN_Refresh}
            Notes={AvailableNotes} CurrentNote={CurrentNote} ChangeCurrentNote={ChangeCurrentNote} ShowPopUp={ShowPopUp}
            CreateNote={CreateNote} ReplaceNote={ReplaceNote} RemoveNote={RemoveNote} setViewMode={setViewMode} />;

        let Recent_Component = <Recent Mode={Q.Mode} Device={Q.Device} ViewMode={ViewMode}
            Notes={AvailableNotes} CurrentNote={CurrentNote} ChangeCurrentNote={ChangeCurrentNote}
            RecentNoteIDs={RecentNoteIDs}
            RemoveNote={RemoveNote} RemoveRecentID={RemoveRecentID}
            BookmarkNoteIDs={BookmarkNoteIDs}
            AddBookmarkID={AddBookmarkID} RemoveBookmarkID={RemoveBookmarkID} />;

        if (V == "Normal") {
            return (
                <div className={Notes_S.Normal}>
                    {Choose_Component}
                    {Writing_Component}
                    {Adjustments_Component}
                    {Recent_Component}
                </div>
            );
        }
        else if (V == "Full") {
            return (
                <div className={Notes_S.Full}>

                    <div className={Notes_S.Full_Upper}>
                        {Writing_Component}
                    </div>

                    <div className={Notes_S.Reveal}>
                        /\
                    </div>

                    <div className={Notes_S.Full_Lower}>

                        <div className={Notes_S.Full_Lower_Segment}>
                            {Choose_Component}
                        </div>

                        <div className={Notes_S.Full_Lower_Segment}>
                            {Adjustments_Component}
                        </div>

                        <div className={Notes_S.Full_Lower_Segment}>
                            {Recent_Component}
                        </div>

                    </div>
                </div>
            );
        }
        else {
            console.log("Error: Could not determine what viewmode to render general notes under");
            return null;
        }
    }

    return (
        <div className={`${Notes_Device[Q.Device]} ${Notes_Mode[Q.Mode]}`}>
            {PopUp}
            {RenderMode(ViewMode)}
        </div>
    )
}