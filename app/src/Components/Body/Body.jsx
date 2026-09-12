import { useRef, useEffect, useState } from "react";
import {
    GetNotes, AddNote, UpdateNote, DeleteNote,
    GetRecentGeneralNotes, UpdateRecentGeneralNotes, GetBookmarkGeneralNotes, UpdateBookmarkGeneralNotes,
    GetColLock, ChangeColLock
} from "../../Backend/DatabaseConnection.js";
import { TurnIntoArray, ArraysEqual, Wait } from "../../Backend/HandleGeneral.js";
import { GetNewNoteID } from "../../Backend/HandleNotes.js";
import { Week } from "./UI/Weekly.jsx";
import { Routine } from "./UI/Tradition.jsx";
import Navigation_S from "./Styles/Navigation/Navigation.module.css";
import { AgendaInterface, RoutineInterface, ReadMeInterface } from "./UI/NavHud.jsx";
import { Choose, Adjustments, Recent, Writing } from "./UI/Notes.jsx";
import { TweakNote, ConfirmNoteDelete } from "./UI/PopUps.jsx";
import { ReadTextFile } from "./UI/ReadingText.jsx";
import { RC, RS } from "../../Backend/HandleReact.js";
import Common_S from "./Styles/Common.module.css";
import Notes_S from "./Styles/Notes/Notes.module.css";

//Body section to Homepage
export default function Bod(Q) {

    const [NavStatus, setNavStatus] = useState({
        visible: false,
        lock: true,
        expandCenter: true
    });
    const [NoteStatus, setNoteStatus] = useState({
        visible: false,
        lock: true,
        expandCenter: true
    });

    //Loads pre-existings lock status on start up
    useEffect(() => {
        let fetchLocks = async () => {
            let theLocks = await GetColLock();
            setNavStatus(theLocks.nav);
            setNoteStatus(theLocks.note);
        };
        fetchLocks();
    }, []);

    //Updates NavStatus
    //V = Visibility
    //L = Lock
    //E = Expand
    async function EditNav(V, L, E) {
        let NewS = NavStatus;
        if (V != null) {
            NewS.visible = V;
        }
        if (L != null) {
            NewS.lock = L;
        }
        if (E != null) {
            NewS.expandCenter = E;
        }
        setNavStatus(NewS);
        setNavStatus(prev => ({ ...prev }));
        await ChangeColLock({
            nav: NavStatus,
            note: NoteStatus
        });
    }

    //Updates NoteStatus
    //V = Visibility
    //L = Lock
    //E = Expand
    async function EditNote(V, L, E) {
        let NewS = NoteStatus;
        if (V != null) {
            NewS.visible = V;
        }
        if (L != null) {
            NewS.lock = L;
        }
        if (E != null) {
            NewS.expandCenter = E;
        }
        setNoteStatus(NewS);
        setNoteStatus(prev => ({ ...prev }));
        await ChangeColLock({
            nav: NavStatus,
            note: NoteStatus
        });
    }

    return (
        <div className={Q.CN}>
            <Navigation Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                NavStatus={NavStatus} EditNav={EditNav}
                AnyCurrentFullScreens={Q.AnyCurrentFullScreens}
                UnsavedAgenda={Q.UnsavedAgenda} SwitchCurrentAgenda={Q.SwitchCurrentAgenda} SaveCurrentAgenda={Q.SaveCurrentAgenda} SaveCurrentSchedule={Q.SaveCurrentSchedule}
                UnsavedSchedule={Q.UnsavedSchedule} Schedule={Q.Schedule} UpdateSchedule={Q.UpdateSchedule} SetupNewRoutine={Q.SetupNewRoutine}
                Subpage={Q.Subpage} SwitchSubpage={Q.SwitchSubpage} SetAsCurrentRoutine={Q.SetAsCurrentRoutine} Mark_Unsaved={Q.Mark_Unsaved}
                SwapToRoutine={Q.SwapToRoutine} Signal_Saved={Q.Signal_Saved} Signal_ScheduleSwapped={Q.Signal_ScheduleSwapped} OpenPopUp={Q.OpenPopUp} />
            <Common Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                NavStatus={NavStatus} NoteStatus={NoteStatus}
                MemoFullMode={Q.MemoFullMode} setMemoFullMode={Q.setMemoFullMode} ReviewFullMode={Q.ReviewFullMode} setReviewFullMode={Q.setReviewFullMode}
                setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode}
                Agenda={Q.Agenda} UpdateAgenda={Q.UpdateAgenda} UnsavedAgenda={Q.UnsavedAgenda}
                Schedule={Q.Schedule} UpdateSchedule={Q.UpdateSchedule}
                ThisWeeksSchedule={Q.ThisWeeksSchedule}
                Subpage={Q.Subpage} Mark_Unsaved={Q.Mark_Unsaved}
                Signal_AgendaSwapped={Q.Signal_AgendaSwapped} Signal_ScheduleSwapped={Q.Signal_ScheduleSwapped} />
            <Notes Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                NoteStatus={NoteStatus} EditNote={EditNote} Mark_Unsaved={Q.Mark_Unsaved}
                AnyCurrentFullScreens={Q.AnyCurrentFullScreens} setNotesFullMode={Q.setNotesFullMode} setPopUpFullMode={Q.setPopUpFullMode}
                AvailableNotes={Q.AvailableNotes} setAvailableNotes={Q.setAvailableNotes}
                CurrentNote={Q.CurrentNote} AdjustCurrentNote_Ref={Q.AdjustCurrentNote_Ref}
                Unsaved={Q.UnsavedNotes} setUnsaved={Q.setUnsavedNotes} Signal_Saved={Q.Signal_Saved_Notes}
                SaveCN_Refresh={Q.SaveCN_Refresh}
            />
            {/* <div style={{ width: "15%", height: "100%" }}></div> */}
        </div>
    );
}

//Manages agenda notes and additonal component navigation in the Common section
function Navigation(Q) {

    const Navigation_Device = [Navigation_S.Computer, Navigation_S.Mobile];
    const Navigation_Mode = [Navigation_S.Public, Navigation_S.Private];

    const AgendaHud = (
        <AgendaInterface Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
            Subpage={Q.Subpage} SwitchSubpage={Q.SwitchSubpage} key={0}
            UnsavedAgenda={Q.UnsavedAgenda} SaveCurrentAgenda={Q.SaveCurrentAgenda} SwitchCurrentAgenda={Q.SwitchCurrentAgenda}
            Signal_Saved={Q.Signal_Saved} OpenPopUp={Q.OpenPopUp} />
    );

    const RoutineHud = (
        <RoutineInterface Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
            Subpage={Q.Subpage} SwitchSubpage={Q.SwitchSubpage} key={1}
            UnsavedSchedule={Q.UnsavedSchedule} SaveCurrentSchedule={Q.SaveCurrentSchedule}
            Schedule={Q.Schedule} UpdateSchedule={Q.UpdateSchedule} SetAsCurrentRoutine={Q.SetAsCurrentRoutine}
            SetupNewRoutine={Q.SetupNewRoutine} SwapToRoutine={Q.SwapToRoutine} Mark_Unsaved={Q.Mark_Unsaved}
            Signal_Saved={Q.Signal_Saved} Signal_ScheduleSwapped={Q.Signal_ScheduleSwapped} />
    );

    const ReadMeHud = (
        <ReadMeInterface Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
            Subpage={Q.Subpage} SwitchSubpage={Q.SwitchSubpage} key={2} />
    );

    const Huds = [
        {
            label: "Agenda",
            element: AgendaHud
        },
        {
            label: "Routine",
            element: RoutineHud
        },
        {
            label: "ReadMe",
            element: ReadMeHud
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

    return (Q.NavStatus.visible ?

        <div className={`${Navigation_Device[Q.Device]} ${Navigation_Mode[Q.Mode]} ${Q.Themes.LC}`}
            style={{ zIndex: Q.AnyCurrentFullScreens() ? 1 : 2 }}
            onMouseLeave={() => (!Q.NavStatus.lock ? Q.EditNav(false, null, null) : null)}>
            {/* <span className={Navigation_S.Buffer} /> */}
            {AdaptNavigationOptions(Q.Subpage)}
            <button className={`${Navigation_S.Lock} ${Q.Themes.C_RSC}`}
                onClick={() => Q.EditNav(null, !Q.NavStatus.lock, null)}>
                {Q.NavStatus.lock ? "X" : "^"}
            </button>
        </div>
        :
        <div className={`${Navigation_S.Reveal} ${Q.Themes.C_RSC}`}
            style={{
                width: Q.NavStatus.expandCenter ? "2.5%" : "15.0%",
                height: Q.NavStatus.expandCenter ? "8.0%" : "4.0%",
                zIndex: Q.AnyCurrentFullScreens() ? 1 : 2,
                flexDirection: Q.NavStatus.expandCenter ? "column" : "row"
            }}>

            <div onMouseEnter={() => Q.EditNav(true, null, null)}>
                \/
            </div>

            <button style={{ width: Q.NavStatus.expandCenter ? "100.0%" : "50.0%" }} onClick={() => Q.EditNav(false, null, !Q.NavStatus.expandCenter)}>
                {Q.NavStatus.expandCenter ? ">" : "<"}
            </button>

        </div>
    );
}

//Holds agenda and possibly additonal subpage components
function Common(Q) {

    const Common_Device = [Common_S.Computer, Common_S.Mobile];
    const Common_Mode = [Common_S.Public, Common_S.Private];

    return (
        <div className={`${Common_Device[Q.Device]} ${Common_Mode[Q.Mode]} ${Q.Themes.C}`}
            style={{
                left: Q.NavStatus.expandCenter ? "2.5%" : "15.0%",
                width: (Q.NavStatus.expandCenter ? 12.5 : 0.0) + (Q.NoteStatus.expandCenter ? 12.5 : 0.0) + 70.0 + "%"
            }}>
            {Q.Subpage === "Agenda" ?
                <Week Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    ReviewFullMode={Q.ReviewFullMode} setReviewFullMode={Q.setReviewFullMode}
                    MemoFullMode={Q.MemoFullMode} setMemoFullMode={Q.setMemoFullMode}
                    setTaskFullMode={Q.setTaskFullMode} setPopUpFullMode={Q.setPopUpFullMode}
                    Agenda={Q.Agenda} UpdateAgenda={Q.UpdateAgenda} UnsavedAgenda={Q.UnsavedAgenda}
                    Mark_Unsaved={Q.Mark_Unsaved} ThisWeeksSchedule={Q.ThisWeeksSchedule}
                    Signal_AgendaSwapped={Q.Signal_AgendaSwapped} />
                : null}
            {Q.Subpage === "Routine" ?
                <Routine Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} Schedule={Q.Schedule}
                    UpdateSchedule={Q.UpdateSchedule} setPopUpFullMode={Q.setPopUpFullMode}
                    Mark_Unsaved={Q.Mark_Unsaved} Signal_ScheduleSwapped={Q.Signal_ScheduleSwapped} />
                : null}
            {Q.Subpage === "ReadMe" ?
                <ReadTextFile Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                    TextPathToRead={"README.md"} />
                : null}
        </div>
    );
}

//General notes
function Notes(Q) {

    const Notes_Device = [Notes_S.Computer, Notes_S.Mobile];
    const Notes_Mode = [Notes_S.Public, Notes_S.Private];
    const [ViewMode, setViewMode] = useState("Normal");

    const RecentNoteIDs = useRef({
        public: [],
        private: []
    });
    const RecentLimit = 10;

    const BookmarkNoteIDs = useRef([]);

    const [CurrentFullTool, setCurrentFullTool] = useState(null);

    const [PopUp, setPopUp] = useState(null);

    const Signals = useRef(null);

    const [CurrentNote_UI, setCurrentNote_UI] = useState(null);

    const [Signal_NoteCreateDelete, setSignal_NoteCreateDelete] = useState(false);
    const [Signal_RB_IDS, setSignal_RB_IDS] = useState(false);
    const [Signal_Setup_RB_IDS, setSignal_Setup_RB_IDS] = useState(false);

    //Updates data when needed
    useEffect(() => {
        //Loads pre-existings note data on start up []
        if (RC(Signals) == null) {
            (async () => {
                let theNotes = await GetNotes();
                Q.setAvailableNotes(theNotes);
                RS(RecentNoteIDs, await GetRecentGeneralNotes());
                RS(BookmarkNoteIDs, await GetBookmarkGeneralNotes());
                setSignal_Setup_RB_IDS(!Signal_Setup_RB_IDS);
                RS(Signals, {
                    mode: structuredClone(Q.Mode),
                    view: structuredClone(ViewMode)
                });
            })();
        }//Saves current note before resting upon switching modes [Q.Mode]
        else if (RC(Signals).mode != Q.Mode) {
            RC(Signals).mode = structuredClone(Q.Mode);
            (async () => {
                await Q.SaveCN_Refresh();
                Q.AdjustCurrentNote_Ref(null);
                setCurrentNote_UI(null);
            })();
        }//Adjusts Central.jsx's version of the full screen reference, Resets visible tool bar for full screen when swapping to or from full screen [ViewMode]
        else if (RC(Signals).view != ViewMode) {
            RC(Signals).view = structuredClone(ViewMode);
            setCurrentFullTool(null);
            if (ViewMode === "Full") {
                Q.setNotesFullMode(true);
            }
            else {
                Q.setNotesFullMode(false);
            }
        }
        else {//Updates Central.jsx's reference to in use fullscreens [PopUp]
            Q.setPopUpFullMode(PopUp != null ? true : false);
        }
    }, [PopUp, ViewMode, Q.Mode]);

    //Determine if provided recent id json's are equal
    //A = RecentIds json A
    //B = RecentIds json B
    function RecentIds_Equal(A, B) {
        let A_Pub = structuredClone(A).public.join('');
        let A_Pri = structuredClone(A).private.join('');
        let B_Pub = structuredClone(B).public.join('');
        let B_Pri = structuredClone(B).private.join('');
        if ((A_Pub + "S" + A_Pri) === (B_Pub + "S" + B_Pri)) {
            return true;
        }
        else {
            return false;
        }
    }

    //Updates frontend copy of recent & bookmarked note ids to backend
    //X = Which to update
    async function UpdateRecentBook(X) {
        switch (X) {
            case "Recent":
                await UpdateRecentGeneralNotes(RC(RecentNoteIDs));
                break;
            case "Bookmark":
                await UpdateBookmarkGeneralNotes(RC(BookmarkNoteIDs));
                break;
            case "Both":
                await UpdateRecentGeneralNotes(RC(RecentNoteIDs));
                await UpdateBookmarkGeneralNotes(RC(BookmarkNoteIDs));
                break;
            default:
                throw new Error("Error: Could determine which id set to update to backend!");
        }
    }

    //Changes current note match note with provided id
    //M = Mode (public vs private)
    //I = ID of note
    async function ChangeCurrentNote(M, I) {

        if (Q.CurrentNote != null && Q.CurrentNote.id == I) {
            return;
        }

        let theNotes = M == 0 ? Q.AvailableNotes.public : Q.AvailableNotes.private;
        await Q.SaveCN_Refresh();
        Q.AdjustCurrentNote_Ref(null);
        for (let i = 0; i < theNotes.length; i++) {
            if (theNotes[i].id == I) {
                let noteCopy = structuredClone(theNotes[i]);
                Q.AdjustCurrentNote_Ref(noteCopy);
                setCurrentNote_UI(noteCopy);
                AddRecentID(structuredClone(I));
                break;
            }
        }
    }

    //Sets up popup or hides current
    //P = What pop up
    function ShowPopUp(P) {
        if (P == "Create") {
            setPopUp(<TweakNote Mode={Q.Mode} Device={Q.Device} Notes={Q.AvailableNotes} ShowPopUp={ShowPopUp} CreateNote={CreateNote} />);
        }
        else if (P == "Delete") {
            setPopUp(<ConfirmNoteDelete Mode={Q.Mode} Device={Q.Device} CurrentNote={Q.CurrentNote} ShowPopUp={ShowPopUp} RemoveNote={RemoveNote} />);
        }
        else {
            setPopUp(null);
        }
    }

    //Creates a new unused ID based on AvailableNotes
    function GenerateNewID() {
        return GetNewNoteID(Q.AvailableNotes.public.concat(Q.AvailableNotes.private));
    }

    //Adds recently used note id or moves it to the back if already present
    //I = Note id
    function AddRecentID(I) {

        let newRecent = Q.Mode == 0 ? RC(RecentNoteIDs).public : RC(RecentNoteIDs).private;
        newRecent = TurnIntoArray(newRecent.filter(j => Number(j) != Number(I)));

        if (newRecent.length >= RecentLimit) {
            while (newRecent.length >= RecentLimit) {
                newRecent.pop();
            }
        }
        newRecent = [Number(I)].concat(newRecent);

        let finalRecent = structuredClone(RC(RecentNoteIDs));
        if (Q.Mode == 1) {
            finalRecent.private = newRecent;
        }
        else {
            finalRecent.public = newRecent;
        }

        RS(RecentNoteIDs, finalRecent);
        setSignal_RB_IDS(!Signal_RB_IDS);
        UpdateRecentBook("Recent");
    }

    //Removes provided id from recent ids
    //I = Note id
    function RemoveRecentID(I) {

        let newRecent = structuredClone(RC(RecentNoteIDs));

        if (Q.Mode == 1) {
            newRecent.private = TurnIntoArray(newRecent.private.filter(j => Number(j) != Number(I)));
        }
        else {
            newRecent.public = TurnIntoArray(newRecent.public.filter(j => Number(j) != Number(I)));
        }
        RS(RecentNoteIDs, newRecent);
        setSignal_RB_IDS(!Signal_RB_IDS);
        UpdateRecentBook("Recent");
    }

    //Adds bookmarked note id
    //I = Note id
    function AddBookmarkID(I) {
        let newBookmarks = RC(BookmarkNoteIDs);
        newBookmarks = TurnIntoArray(newBookmarks.filter(j => Number(j) != Number(I)));
        RS(BookmarkNoteIDs, [Number(I)].concat(newBookmarks));
        setSignal_RB_IDS(!Signal_RB_IDS);
        UpdateRecentBook("Bookmark");
    }

    //Removes provided id from bookmarked ids
    function RemoveBookmarkID(I) {
        RS(BookmarkNoteIDs, TurnIntoArray(RC(BookmarkNoteIDs).filter(j => Number(j) != Number(I))));
        setSignal_RB_IDS(!Signal_RB_IDS);
        UpdateRecentBook("Bookmark");
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
        await Q.SaveCN_Refresh();
        ShowPopUp("");
        Q.AdjustCurrentNote_Ref(null);
        setCurrentNote_UI(null);
        setSignal_NoteCreateDelete(!Signal_NoteCreateDelete);
    }

    //Updates provided note through the backend
    async function ReplaceNote(N) {
        await UpdateNote(N);
        AddRecentID(N.id);
        await Q.SaveCN_Refresh();
    }

    //Deletes note from database based on provided id
    //I = Note id
    async function RemoveNote(I) {
        await DeleteNote(I);
        RemoveRecentID(I);
        RemoveBookmarkID(I);
        Q.AdjustCurrentNote_Ref(null);
        setCurrentNote_UI(null);
        await Q.SaveCN_Refresh();
        setSignal_NoteCreateDelete(!Signal_NoteCreateDelete);
    }

    //Updates title for current note
    //T = New title
    function UpdateCurrentNoteTitle(T) {
        if (Q.CurrentNote) {
            let newNote = structuredClone(Q.CurrentNote);
            newNote.title = T;
            Q.AdjustCurrentNote_Ref(JSON.parse(JSON.stringify(newNote)));
            CurrentNote_UI.title = T;
            Q.Mark_Unsaved("Notes", true);
        }
    }

    //Updates text for current note
    //T = New text
    function UpdateCurrentNoteText(T) {
        if (Q.CurrentNote) {
            let newNote = structuredClone(Q.CurrentNote);
            newNote.message = T;
            Q.AdjustCurrentNote_Ref(JSON.parse(JSON.stringify(newNote)));
            CurrentNote_UI.message = T;
            Q.Mark_Unsaved("Notes", true);
        }
    }

    //Renders the content based on view mode
    //V = View mode
    function RenderMode(V) {

        let Choose_Component = <Choose Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} ViewMode={ViewMode} Unsaved={Q.Unsaved}
            Notes={Q.AvailableNotes} CurrentNote={CurrentNote_UI} ChangeCurrentNote={ChangeCurrentNote} ShowPopUp={ShowPopUp}
            Signal_NoteCreateDelete={Signal_NoteCreateDelete} Signal_Saved={Q.Signal_Saved} />;

        let Writing_Component = <Writing Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} ViewMode={ViewMode}
            Notes={Q.AvailableNotes} CurrentNote={CurrentNote_UI} ChangeCurrentNote={ChangeCurrentNote}
            UpdateCurrentNoteTitle={UpdateCurrentNoteTitle} UpdateCurrentNoteText={UpdateCurrentNoteText} />;

        let Adjustments_Component = <Adjustments Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} ViewMode={ViewMode} SaveCN_Refresh={Q.SaveCN_Refresh}
            Notes={Q.AvailableNotes} CurrentNote={CurrentNote_UI} ChangeCurrentNote={ChangeCurrentNote} ShowPopUp={ShowPopUp}
            CreateNote={CreateNote} ReplaceNote={ReplaceNote} RemoveNote={RemoveNote} setViewMode={setViewMode} />;

        let Recent_Component = <Recent Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} ViewMode={ViewMode} Signal_Setup_RB_IDS={Signal_Setup_RB_IDS}
            Notes={Q.AvailableNotes} CurrentNote={CurrentNote_UI} ChangeCurrentNote={ChangeCurrentNote}
            RecentNoteIDs={RC(RecentNoteIDs)}
            RemoveNote={RemoveNote} RemoveRecentID={RemoveRecentID} RecentIds_Equal={RecentIds_Equal}
            BookmarkNoteIDs={RC(BookmarkNoteIDs)}
            AddBookmarkID={AddBookmarkID} RemoveBookmarkID={RemoveBookmarkID}
            Signal_RB_IDS={Signal_RB_IDS} />;

        if (V == "Normal") {
            return (
                <div className={Notes_S.Normal}>
                    {Choose_Component}
                    {Writing_Component}
                    {Adjustments_Component}
                    {Recent_Component}
                    <button className={`${Notes_S.N_Lock} ${Q.Themes.C_RSC}`}
                        onClick={() => Q.EditNote(null, !Q.NoteStatus.lock)}>
                        {Q.NoteStatus.lock ? "X" : "^"}
                    </button>
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

                        <div className={Notes_S.Reveal_Vessal}>
                            <div className={`${Notes_S.Reveal_Choices} ${Q.Themes.RC_N_F_SP}`}
                                onMouseEnter={() => setCurrentFullTool("Choices")}
                                onMouseLeave={() => setCurrentFullTool(null)}>
                                / Notes \
                            </div>
                        </div>

                        <div className={Notes_S.Reveal_Vessal}>
                            <div className={`${Notes_S.Reveal_Font} ${Q.Themes.RC_N_F_SP}`}
                                onMouseEnter={() => setCurrentFullTool("Fonts")}
                                onMouseLeave={() => setCurrentFullTool(null)}>
                                / Tools \
                            </div>
                        </div>

                        <div className={Notes_S.Reveal_Vessal}>
                            <div className={`${Notes_S.Reveal_Recent} ${Q.Themes.RC_N_F_SP}`}
                                onMouseEnter={() => setCurrentFullTool("Recents")}
                                onMouseLeave={() => setCurrentFullTool(null)}>
                                / References \
                            </div>
                        </div>

                    </div>

                    <div className={Notes_S.Full_Lower} style={{ display: CurrentFullTool ? "flex" : "none" }}>

                        <div className={`${Notes_S.Full_Lower_Segment} ${Notes_S.Show_Choices}`}
                            onMouseEnter={() => setCurrentFullTool("Choices")} onMouseLeave={() => setCurrentFullTool(null)}
                            style={{ display: CurrentFullTool == "Choices" ? "flex" : "none" }}>
                            {Choose_Component}
                        </div>

                        <div className={Notes_S.Full_Lower_Segment} style={{ display: CurrentFullTool ? "flex" : "none" }} />

                        <div className={`${Notes_S.Full_Lower_Segment} ${Notes_S.Show_Font}`}
                            onMouseEnter={() => setCurrentFullTool("Fonts")} onMouseLeave={() => setCurrentFullTool(null)}
                            style={{ display: CurrentFullTool == "Fonts" ? "flex" : "none" }}>
                            {Adjustments_Component}
                        </div>

                        <div className={Notes_S.Full_Lower_Segment} style={{ display: CurrentFullTool ? "flex" : "none" }} />

                        <div className={`${Notes_S.Full_Lower_Segment} ${Notes_S.Show_Recent}`}
                            onMouseEnter={() => setCurrentFullTool("Recents")} onMouseLeave={() => setCurrentFullTool(null)}
                            style={{ display: CurrentFullTool == "Recents" ? "flex" : "none" }}>
                            {Recent_Component}
                        </div>

                    </div>

                </div>
            );
        }
        else {
            throw new Error("Error: Could not determine what viewmode to render general notes under");
        }
    }

    //Adjusts z-index based on conditions
    //F = True if other components in full screen mode, otherwise false
    //V = ViewMode
    //P = PopUp
    function GetRightZ(F, V, P) {
        if (P != null) {
            return 10;
        }
        else if (F && V != "Full") {
            return 0;
        }
        else {
            return 10;
        }
    }

    return (Q.NoteStatus.visible ?
        <div className={`${Notes_Device[Q.Device]} ${Notes_Mode[Q.Mode]} ${Q.Themes.RC_N_B} ${Q.NoteStatus.lock && !Q.AnyCurrentFullScreens() ? Notes_S.Resize : null}`}
            style={{ zIndex: GetRightZ(Q.AnyCurrentFullScreens(), ViewMode, PopUp) }}
            onMouseLeave={() => (!Q.NoteStatus.lock ? Q.EditNote(false, null) : null)}>
            {PopUp}
            {Q.AvailableNotes && Q.AvailableNotes != null ? RenderMode(ViewMode) : null}
        </div>
        :
        <div className={`${Notes_S.N_Reveal} ${Q.Themes.C_RSC}`}
            style={{
                width: Q.NoteStatus.expandCenter ? "2.5%" : "15.0%",
                height: Q.NoteStatus.expandCenter ? "8.0%" : "4.0%",
                zIndex: Q.AnyCurrentFullScreens() && ViewMode != "Full" ? 0 : 2,
                flexDirection: Q.NoteStatus.expandCenter ? "column" : "row"
            }}>

            {Q.NoteStatus.expandCenter ?
                <div onMouseEnter={() => Q.EditNote(true, null, null)}>
                    \/
                </div>
                : null
            }

            <button style={{ width: Q.NoteStatus.expandCenter ? "100.0%" : "50.0%" }} onClick={() => Q.EditNote(false, null, !Q.NoteStatus.expandCenter)}>
                {Q.NoteStatus.expandCenter ? "<" : ">"}
            </button>

            {!Q.NoteStatus.expandCenter ?
                <div onMouseEnter={() => Q.EditNote(true, null, null)}>
                    \/
                </div>
                : null
            }

        </div>
    )
}