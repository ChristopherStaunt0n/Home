'use client';
import { useRef, useEffect, useState } from "react";
import {
    GetAgenda, ApplyAgendaUpdate, ApplyScheduleUpdate, GetCurrentRoutine,
    AssignThisRoutine, CreateNewRoutine, GetSchedule, CheckForEmptyRoutineDatabase, AgendaCheckup_RoutineID,
    GetScreenSaverStatus, ChangeScreenSaverStatus,
    GetCurrentThemes, ChangeCurrentThemes,
    File_Exist, UpdateNote, GetNotes
}
    from "./Backend/DatabaseConnection.js";
import { GetSundayOfWeek, IsDaylightSavingsTimeStart, IsDaylightSavingsTimeEnd, AdjustForDST_SE } from "./Backend/HandleDates.js";
import { ReorderAgendaTasks } from "./Backend/HandleAgenda.js";
import { GetMain_CSS, GetHeader_CSS, GetBody_CSS, GetFooter_CSS, Get_Empty_Themes, GetTheme } from "./Backend/HandleTheme.js";
import Head from "./Components/Header/Header.jsx";
import Bod from "./Components/Body/Body.jsx";
import Foot from "./Components/Footer/Footer.jsx";
import useInactivity from "./Components/Misc/CheckInactivity.jsx";
import Saver from "./Components/Misc/ScreenSaver.jsx";
import { RC, RS } from "./Backend/HandleReact.js";
import Background_S from "./Styles/Background.module.css";
import Margin_S from "./Styles/Margin.module.css";
import Header_S from "./Styles/Header.module.css";
import Body_S from "./Styles/Body.module.css";
import Footer_S from "./Styles/Footer.module.css";

import { PickADay } from "./Components/Body/UI/PopUps.jsx";

//Homepage
export default function House(Q) {

    const NumberOfWeeksPreview = 4;

    const [Device, setDevice] = useState(0);//0=Computer,1=Mobile
    const [Mode, setMode] = useState(0);//0=Public,1=Private

    const [Theme, setTheme] = useState(
        {
            public: "Default",
            private: "Default"
        }
    );

    const [ThemePackage_Current, setThemePackage_Current] = useState(Get_Empty_Themes());
    const ThemePackage_Private = useRef({
        Main: Get_Empty_Themes().Main,
        Header: Get_Empty_Themes().Header,
        Body: Get_Empty_Themes().Body,
        Footer: Get_Empty_Themes().Footer
    });
    const ThemePackage_Public = useRef({
        Main: Get_Empty_Themes().Main,
        Header: Get_Empty_Themes().Header,
        Body: Get_Empty_Themes().Body,
        Footer: Get_Empty_Themes().Footer
    });

    const Background_Device = [Background_S.Computer, Background_S.Mobile];
    const Background_Mode = [Background_S.Public, Background_S.Private];

    const Margin_Device = [Margin_S.Computer, Margin_S.Mobile];
    const Margin_Mode = [Margin_S.Public, Margin_S.Private];

    const Header_Device = [Header_S.Computer, Header_S.Mobile];
    const Header_Mode = [Header_S.Public, Header_S.Private];

    const Body_Device = [Body_S.Computer, Body_S.Mobile];
    const Body_Mode = [Body_S.Public, Body_S.Private];

    const Footer_Device = [Footer_S.Computer, Footer_S.Mobile];
    const Footer_Mode = [Footer_S.Public, Footer_S.Private];

    const [InactiveScreen, setInactiveScreen] = useState(null);
    const InactivityTimer = 5000;//10000;//300,000ms=5min, 1,000ms = 1s
    const [UsingScreenSaver, setUsingScreenSaver] = useState(false);

    const [PopUp, setPopUp] = useState(null);

    const [AgendaPreview, setAgendaPreview] = useState(null);
    const [SchedulePreview, setSchedulePreview] = useState(null);
    const [ThisWeeksSchedule, setThisWeeksSchedule] = useState(null);

    const [Subpage, setSubpage] = useState("Agenda");

    const [Agenda, setAgenda] = useState(null);
    const [Signal_AgendaSwapped, setSignal_AgendaSwapped] = useState(false);
    const [Schedule, setSchedule] = useState(null);
    const [Signal_ScheduleSwapped, setSignal_ScheduleSwapped] = useState(false);

    const [AvailableNotes, setAvailableNotes] = useState(null);
    const CurrentNote = useRef(null);
    const [Signal_Saved_Notes, setSignal_Saved_Notes] = useState(false);
    const UnsavedNotes = useRef(false);

    const [Signal_Saved, setSignal_Saved] = useState(false);
    const UnsavedAgenda = useRef(false);
    const UnsavedSchedule = useRef(false);

    const [TaskFullMode, setTaskFullMode] = useState(false);
    const [ReviewFullMode, setReviewFullMode] = useState(false);
    const [MemoFullMode, setMemoFullMode] = useState(false);
    const [NotesFullMode, setNotesFullMode] = useState(false);
    const [PopUpFullMode, setPopUpFullMode] = useState(false);

    const Signals = useRef(null);

    //Loads startup data & handles mode swap
    useEffect(() => {
        if (RC(Signals) == null) {
            RS(Signals, {
                mode: structuredClone(Mode)
            });
            (async () => {
                let currentThemes = await GetCurrentThemes();
                let newPublicTheme = await GetTheme(currentThemes, 0);
                let newPrivateTheme = await GetTheme(currentThemes, 1);
                RS(ThemePackage_Public, newPublicTheme);
                RS(ThemePackage_Private, newPrivateTheme);
                setThemePackage_Current(Mode == 0 ? RC(ThemePackage_Public) : RC(ThemePackage_Private));

                let thisWeek = await AgendaCheckup_RoutineID(await GetAgenda(new Date()), new Date());
                let Sch = structuredClone(await GetCurrentRoutine());
                thisWeek.routineID = Sch.trueID;
                if (thisWeek && thisWeek != null && thisWeek != "") {
                    await ApplyAgendaUpdate(thisWeek);
                }
                setAgenda(thisWeek);
                setSchedule(Sch);
                await RefreshThisWeekSchedule(null);
                let P = await UpdateAgendaPreviews(NumberOfWeeksPreview);
                await UpdateSchedulePreviews(P);

                let SS = await GetScreenSaverStatus();
                setUsingScreenSaver(SS);
            })();
        }
        else if (Mode != RC(Signals).mode) {
            RC(Signals).mode = structuredClone(Mode);
            (async () => {
                await SetFavicon(Theme, Mode);
            })();
            setThemePackage_Current(Mode == 0 ? RC(ThemePackage_Public) : RC(ThemePackage_Private));
        }
    }, [Mode]);

    const MillisecondsPerCycle = 5000;//milliseconds|1000ms=1s

    //Autosaves current agenda, schedule, & note
    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (RC(UnsavedAgenda) && Subpage == "Agenda") {
                await SaveCurrentAgenda();
                console.log("Autosaved agenda");
            }
            else if (RC(UnsavedSchedule) && Subpage == "Routine") {
                await SaveCurrentSchedule();
                console.log("Autosaved routine");
            }

            if (RC(UnsavedNotes)) {
                await SaveCN_Refresh();
                console.log("Autosaved note");
            }
        }, MillisecondsPerCycle);
        return () => clearInterval(intervalId);
        //AI says this fixes (it does, but based on research might be risky)
    }, [UnsavedAgenda, Agenda, UnsavedSchedule, Schedule, Subpage, Signal_Saved_Notes, Signal_Saved, MillisecondsPerCycle]);

    //Saves changes to current note if needed then refreshes available notes
    async function SaveCN_Refresh() {
        if (RC(UnsavedNotes)) {
            await UpdateNote(RC(CurrentNote));
            Mark_Unsaved("Notes", false);
            console.log("Saved current note");
        }
        setAvailableNotes(await GetNotes());
    }

    //Changes current note ref value
    //N = New value to replace with
    function AdjustCurrentNote_Ref(N) {
        RS(CurrentNote, N);
    }

    //Enable/disables screen saver
    async function ToggleScreenSaver() {
        if (UsingScreenSaver) {
            setUsingScreenSaver(false);
            await ChangeScreenSaverStatus(false);
        }
        else {
            setUsingScreenSaver(true);
            await ChangeScreenSaverStatus(true);
        }
    }

    //Runs when site has been inactive for awhile
    const handleInactivity = () => {
        console.log("User has been inactive for another " + (InactivityTimer / 1000) + " seconds.");
        if (!InactiveScreen && UsingScreenSaver) {//!AnyCurrentFullScreens()
            setInactiveScreen(<Saver Mode={Mode} Device={Device} setInactiveScreen={setInactiveScreen} />);
        }
    };

    //Run handleInactivity after a set amount of inactivity
    useInactivity(handleInactivity, InactivityTimer);

    //Setups a new blank routine
    async function SetupNewRoutine() {
        if (Schedule && RC(UnsavedSchedule)) {
            await SaveCurrentSchedule(Schedule);
        }
        let newR = await CreateNewRoutine();
        setSchedule(newR);
        setSignal_ScheduleSwapped(!Signal_ScheduleSwapped);
    }

    //Swaps schedule to one with matching id in database
    //I = Routine's id
    async function SwapToRoutine(I) {
        if (Schedule && RC(UnsavedSchedule)) {
            await SaveCurrentSchedule(Schedule);
        }
        setSchedule(await GetSchedule(I));
        setSignal_ScheduleSwapped(!Signal_ScheduleSwapped);
    }

    //Updates routine with changes
    //S = New routine with changes
    function UpdateSchedule(S) {
        if (S && Schedule) {
            setSchedule(S);
            if (!RC(UnsavedSchedule)) {
                Mark_Unsaved("Schedule", true);
            }
            console.log("Updated routine");
        }
        else {
            console.log("Failed to update routine");
        }
    }

    //Updates agenda with changes
    //A = New agenda with changes
    function UpdateAgenda(A) {
        if (A && Agenda.current) {
            setAgenda(A);
            if (!RC(UnsavedAgenda)) {
                Mark_Unsaved("Agenda", true);
            }
            console.log("Updated frontend copy of agenda");
        }
        else {
            console.log("Error: Failed to update agenda");
        }
    }

    //Updates AgendaPreview with current plus a number of upcoming weekly agendas
    //N = Number of weeks
    async function UpdateAgendaPreviews(N) {
        let CurrentDate = GetSundayOfWeek(new Date());
        CurrentDate = AdjustForDST_SE(CurrentDate);
        let preview = [await AgendaCheckup_RoutineID(await GetAgenda(CurrentDate), new Date())];
        for (let i = 0; i < N; i++) {
            CurrentDate.setDate(CurrentDate.getDate() + 7);
            preview.push(await AgendaCheckup_RoutineID(await GetAgenda(CurrentDate), new Date()));
        }
        setAgendaPreview(preview);
        return preview;
    }

    //Updates SchedulePreviews based on current AgendaPreview's
    //P = Optional varaible holding data in AgendaPreview
    async function UpdateSchedulePreviews(P) {

        let A_Previews = P != null ? P : AgendaPreview;

        if (A_Previews) {
            let preview = [];
            for (let i = 0; i < A_Previews.length; i++) {
                preview.push(await GetSchedule(A_Previews[i].routineID));
            }
            setSchedulePreview(preview);
        }
        else {
            setSchedulePreview([]);
        }
    }

    //Switches subpage in common area
    //Sub = Subpage to switch to
    function SwitchSubpage(Sub) {
        if (Subpage == "Agenda" && Sub != "Agenda" && RC(UnsavedAgenda)) {
            UpdateAgenda(Agenda);
            SaveCurrentAgenda();
        }
        else if (Subpage == "Routine" && Sub != "Routine" && RC(UnsavedSchedule)) {
            UpdateSchedule(Schedule);
            SaveCurrentSchedule();
        }
        else if (Sub == Subpage) {
            setSubpage("");
        }
        setSubpage(Sub);
    }

    //Switches current agenda based on provide input
    //W = Which agenda to switch to
    async function SwitchCurrentAgenda(W) {
        await SaveCurrentAgenda();//await?
        let NextAgendaDate = new Date(Agenda.startDate);
        NextAgendaDate = AdjustForDST_SE(NextAgendaDate);
        switch (W) {
            case "Previous":
                NextAgendaDate.setDate(NextAgendaDate.getDate() - 7);
                let newA_P = await AgendaCheckup_RoutineID(await GetAgenda(NextAgendaDate), new Date());
                await RefreshThisWeekSchedule(newA_P.routineID);
                setAgenda(newA_P);
                setSignal_AgendaSwapped(!Signal_AgendaSwapped);
                break;
            case "Next":
                NextAgendaDate.setDate(NextAgendaDate.getDate() + 7);
                let newA_N = await AgendaCheckup_RoutineID(await GetAgenda(NextAgendaDate), new Date());
                await RefreshThisWeekSchedule(newA_N.routineID);
                setAgenda(newA_N);
                setSignal_AgendaSwapped(!Signal_AgendaSwapped);
                break;
            default:
                if (W != null && W != "" && W.length >= 8) {
                    let newA_XA = await GetAgenda(AdjustForDST_SE(new Date(W)));
                    let newA_XB = await AgendaCheckup_RoutineID(newA_XA, new Date());
                    await RefreshThisWeekSchedule(newA_XB.routineID);
                    setAgenda(newA_XB);
                    setSignal_AgendaSwapped(!Signal_AgendaSwapped);
                }
                else {
                    throw new Error("Error: Could tell which week to switch to!");
                }
        }
    }

    //Assigns provided schedule as current routine
    //S = Schedule to set as current routine
    async function SetAsCurrentRoutine(S) {
        if (S) {
            if (RC(UnsavedSchedule)) {
                await SaveCurrentSchedule();
            }
            await AssignThisRoutine(S);
        }
        else {
            console.log("Error: No routine found to assign");
        }
    }

    //Saves current routine
    async function SaveCurrentSchedule() {
        if (!RC(UnsavedSchedule)) {
            console.log("Error: No routine changes to save");
        }
        else if (Schedule && Schedule != null && Schedule != "") {
            await ApplyScheduleUpdate(Schedule);
            Mark_Unsaved("Schedule", false);
            await RefreshThisWeekSchedule(null);
            await UpdateSchedulePreviews(null);
            console.log("Routine saved successfully");
        }
        else {
            throw new Error("Error: No routine to save");
        }
    }

    //Saves current agenda
    async function SaveCurrentAgenda() {
        if (!RC(UnsavedAgenda)) {
            console.log("Error: No agenda changes to save");
        }
        else if (Agenda && Agenda != null && Agenda != "") {
            await ApplyAgendaUpdate(Agenda);
            Mark_Unsaved("Agenda", false);
            await UpdateAgendaPreviews(NumberOfWeeksPreview);
            console.log("Agenda saved successfully");
        }
        else {
            throw new Error("Error: No agenda to save");
        }
    }

    //Marks (un)saved changes
    //W = What to mark unsaved
    //S = Save status
    function Mark_Unsaved(W, S) {
        switch (W) {
            case "Agenda":
                if (S != RC(UnsavedAgenda)) {
                    RS(UnsavedAgenda, S);
                    setSignal_Saved(!Signal_Saved);
                }
                break;
            case "Schedule":
                if (S != RC(UnsavedSchedule)) {
                    RS(UnsavedSchedule, S);
                    setSignal_Saved(!Signal_Saved);
                }
                break;
            case "Notes":
                if (S != RC(UnsavedNotes)) {
                    RS(UnsavedNotes, S);
                    setSignal_Saved_Notes(!Signal_Saved_Notes);
                }
                break;
            default:
                throw new Error("Error: Failed to change saved status!");
        }
    }

    //Changes site mode (public or private)
    //M = Mode to set site to (toggles if anything else)
    function ToggleMode(M) {
        /* if (Subpage == "Agenda" && UnsavedAgenda) {
            SaveCurrentAgenda();
        }
        else if (Subpage == "Routine" && UnsavedSchedule) {
            SaveCurrentSchedule();
        } */
        if (M == undefined) {
            setMode(Mode == 1 ? 0 : 1);
        }
        else {
            setMode(M == "Private" || M == 1 ? 1 : 0);
        }
    }

    //Refreshes this weeks schedule
    //I = Id of schedule to use if provided
    async function RefreshThisWeekSchedule(I) {
        if (Agenda && I != undefined && I != null) {
            let s = await GetSchedule(I);
            setThisWeeksSchedule(s);

        }
        else {
            setThisWeeksSchedule(await GetCurrentRoutine());
        }
    }

    //Checks if anything is currently in fullscreen mode
    function AnyCurrentFullScreens() {
        if (ReviewFullMode || MemoFullMode || NotesFullMode || TaskFullMode || PopUpFullMode) {
            return true;
        }
        else {
            return false;
        }
    }

    //Changes theme for current mode
    //T = Theme title
    //M = Mode (Public vs Private)
    async function ChangeTheme(T, M) {
        if (M == 1) {
            let newCurrentTheme = structuredClone(Theme);
            newCurrentTheme.private = T;
            setTheme(newCurrentTheme);
            await ChangeCurrentThemes(null, T);
            // await SetupTheme(newCurrentTheme, M);
        }
        else if (M == 0) {
            let newCurrentTheme = structuredClone(Theme);
            newCurrentTheme.public = T;
            setTheme(newCurrentTheme);
            await ChangeCurrentThemes(T, null);
            // await SetupTheme(newCurrentTheme, M);
        }
        else {
            throw new Error("Error: Failed to change theme!");
        }
    }

    //Applies correct theme based on current mode
    //T = Theme titles
    //M = Mode (Public vs Private)
    async function SetupTheme(T, M) {
        let newTheme = {
            main: await GetMain_CSS(T, M),
            head: await GetHeader_CSS(T, M),
            body: await GetBody_CSS(T, M),
            foot: await GetFooter_CSS(T, M)
        };
        if (M == 0) {
            setThemePackage_Public(newTheme);
        }
        else if (M == 1) {
            setThemePackage_Private(newTheme);
        }

        // setMain_Theme(await GetMain_CSS(T, M));
        // setHeader_Theme(await GetHeader_CSS(T, M));
        // setBody_Theme(await GetBody_CSS(T, M));
        // setFooter_Theme(await GetFooter_CSS(T, M));

        // setMain_Theme(prev => ({ ...prev }));
        // setHeader_Theme(prev => ({ ...prev }));
        // setBody_Theme(prev => ({ ...prev }));
        // setFooter_Theme(prev => ({ ...prev }));

        // await SetFavicon(Theme, Mode);
    }

    //Set the current favicon
    //T = Theme titles
    //M = Mode (Public vs Private)
    async function SetFavicon(T, M) {

        let Theme_Title_Reference = M == 1 ? T.private : T.public;
        let Favicon_Path = "/Default.ico";

        if (Theme_Title_Reference === "Default") {
            Favicon_Path = M == 1 ? "/Themes/Default/Private.ico" : "/Themes/Default/Public.ico";
        }
        else {

            let ico_Found = await File_Exist('public/Themes/Custom', Theme_Title_Reference + '.ico');
            let gif_Found = await File_Exist('public/Themes/Custom', Theme_Title_Reference + '.gif');

            if (ico_Found) {
                Favicon_Path = '/Themes/Custom/' + Theme_Title_Reference + '.ico';
            }
            else if (gif_Found) {
                Favicon_Path = '/Themes/Custom/' + Theme_Title_Reference + '.gif';
            }
            else {
                Favicon_Path = M == 1 ? "/Themes/Default/Private.ico" : "/Themes/Default/Public.ico";
            }
        }

        let favicon = document.querySelector("link[rel='icon']");

        if (favicon) {
            favicon.remove();
        }

        favicon = document.createElement("link");
        favicon.rel = "icon";

        if (Favicon_Path.includes(".gif")) {
            favicon.type = "image/gif";
            favicon.href = Favicon_Path;

        }
        else {
            favicon.type = "image/ico";
            favicon.href = Favicon_Path;
        }

        document.head.appendChild(favicon);
    }

    //Opens up a popup
    //P = Which popup to open
    function OpenPopUp(P) {
        switch (P) {
            case "Select Agenda Week":
                let sd = structuredClone(Agenda.startDate);
                setPopUp(
                    <PickADay Mode={Mode} Device={Device} StartingDay={sd} SubmitDate={Close_SAW} Close={Close_SAW/* setPopUp(null) */} />
                );
                break;
            default:
                throw new Error("Error: Failed to open invalid popup!");
        }
    }

    //Closes select agenda week popup and submits it result
    //R = Result of agenda week popup
    function Close_SAW(R) {
        if (R != undefined) {
            SwitchCurrentAgenda(R);
        }
        setPopUp(null);
    }

    return (
        Agenda && Agenda != "" && Agenda != null && ThemePackage_Current != undefined && ThemePackage_Current != null &&
            AgendaPreview && AgendaPreview != "" && AgendaPreview != null && AgendaPreview != [] &&
            Schedule && Schedule != "" && Schedule != null &&
            ThisWeeksSchedule && ThisWeeksSchedule != "" && ThisWeeksSchedule != null &&
            SchedulePreview && SchedulePreview != "" && SchedulePreview != null
            ?
            <div className={`${Background_Device[Device]} ${Background_Mode[Mode]} ${ThemePackage_Current.Main.B}`}>
                {InactiveScreen}
                {PopUp}
                <div className={`${Margin_Device[Device]} ${Margin_Mode[Mode]}`}>

                    <Head CN={`${Header_Device[Device]} ${Header_Mode[Mode]}`}
                        Themes={ThemePackage_Current.Header} ChangeTheme={ChangeTheme} AnyCurrentFullScreens={AnyCurrentFullScreens}
                        Mode={Mode} Device={Device} ToggleMode={ToggleMode} Theme={Theme}
                        UsingScreenSaver={UsingScreenSaver} ToggleScreenSaver={ToggleScreenSaver}
                        AgendaPreview={AgendaPreview} ThisWeeksSchedule={ThisWeeksSchedule} SchedulePreview={SchedulePreview} />

                    <Bod CN={`${Body_Device[Device]} ${Body_Mode[Mode]}`} Mode={Mode} Device={Device} Themes={ThemePackage_Current.Body}
                        MemoFullMode={MemoFullMode} setMemoFullMode={setMemoFullMode} ReviewFullMode={ReviewFullMode} setReviewFullMode={setReviewFullMode}
                        setTaskFullMode={setTaskFullMode} setPopUpFullMode={setPopUpFullMode}
                        AnyCurrentFullScreens={AnyCurrentFullScreens} setNotesFullMode={setNotesFullMode}
                        Subpage={Subpage} SwitchSubpage={SwitchSubpage} SetAsCurrentRoutine={SetAsCurrentRoutine}
                        UnsavedAgenda={RC(UnsavedAgenda)} Agenda={Agenda} UpdateAgenda={UpdateAgenda}
                        SwitchCurrentAgenda={SwitchCurrentAgenda} SaveCurrentAgenda={SaveCurrentAgenda} SaveCurrentSchedule={SaveCurrentSchedule}
                        UnsavedSchedule={RC(UnsavedSchedule)} Schedule={Schedule} UpdateSchedule={UpdateSchedule} SetupNewRoutine={SetupNewRoutine}
                        ThisWeeksSchedule={ThisWeeksSchedule} SwapToRoutine={SwapToRoutine}
                        AvailableNotes={AvailableNotes} setAvailableNotes={setAvailableNotes}
                        CurrentNote={CurrentNote.current} AdjustCurrentNote_Ref={AdjustCurrentNote_Ref}
                        UnsavedNotes={RC(UnsavedNotes)} Signal_Saved_Notes={Signal_Saved_Notes}
                        SaveCN_Refresh={SaveCN_Refresh} Mark_Unsaved={Mark_Unsaved} OpenPopUp={OpenPopUp}
                        Signal_AgendaSwapped={Signal_AgendaSwapped} Signal_ScheduleSwapped={Signal_ScheduleSwapped}
                        Signal_Saved={Signal_Saved} />

                    <Foot CN={`${Footer_Device[Device]} ${Footer_Mode[Mode]} ${ThemePackage_Current.Footer.B}`} Mode={Mode} Device={Device} Themes={ThemePackage_Current.Footer} />

                </div>
            </div>
            :
            <div className={`${Background_Device[Device]} ${Background_Mode[Mode]}`}></div>
    );
}