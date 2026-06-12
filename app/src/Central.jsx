'use client';
import { useRef, useEffect, useState } from "react";
import {
    GetAgenda, ApplyAgendaUpdate, ApplyScheduleUpdate, GetCurrentRoutine,
    AssignThisRoutine, CreateNewRoutine, GetSchedule, CheckForEmptyRoutineDatabase, AgendaCheckup_RoutineID,
    GetScreenSaverStatus, ChangeScreenSaverStatus,
    GetCurrentThemes, ChangeCurrentThemes, GetTheme
}
    from "./Backend/DatabaseConnection.js";
import { GetSundayOfWeek, IsDaylightSavingsTimeStart, IsDaylightSavingsTimeEnd, AdjustForDST_SE } from "./Backend/HandleDates.js";
import { ReorderAgendaTasks } from "./Backend/HandleAgenda.js";
import { GetMain_CSS, GetHeader_CSS, GetBody_CSS, GetFooter_CSS, Get_Empty_Themes, FaviconExist } from "./Backend/HandleTheme.js";
import Head from "./Components/Header/Header.jsx";
import Bod from "./Components/Body/Body.jsx";
import Foot from "./Components/Footer/Footer.jsx";
import useInactivity from "./Components/Misc/CheckInactivity.jsx";
import Saver from "./Components/Misc/ScreenSaver.jsx";
import Background_S from "./Styles/Background.module.css";
import Margin_S from "./Styles/Margin.module.css";
import Header_S from "./Styles/Header.module.css";
import Body_S from "./Styles/Body.module.css";
import Footer_S from "./Styles/Footer.module.css";

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
    const [Main_Theme, setMain_Theme] = useState(Get_Empty_Themes().Main);
    const [Header_Theme, setHeader_Theme] = useState(Get_Empty_Themes().Header);
    const [Body_Theme, setBody_Theme] = useState(Get_Empty_Themes().Body);
    const [Footer_Theme, setFooter_Theme] = useState(Get_Empty_Themes().Footer);

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

    const [AgendaPreview, setAgendaPreview] = useState(null);
    const [SchedulePreview, setSchedulePreview] = useState(null);
    const [ThisWeeksSchedule, setThisWeeksSchedule] = useState(null);

    const [Subpage, setSubpage] = useState("Agenda");

    const [Agenda, setAgenda] = useState(null);
    const [Schedule, setSchedule] = useState(null);

    const [UnsavedAgenda, setUnsavedAgenda] = useState(false);
    const [UnsavedSchedule, setUnsavedSchedule] = useState(false);

    const [MemoFullMode, setMemoFullMode] = useState(false);
    const [NotesFullMode, setNotesFullMode] = useState(false);

    //Loads startup data
    useEffect(() => {
        let fetchData = async () => {

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

            let currentThemes = await GetCurrentThemes();
            setTheme(currentThemes);
            await SetupTheme(currentThemes, Mode);
        };
        fetchData();
        // SetFavicon(Theme, Mode);
    }, []);

    //Swaps favicon & theme based on Mode
    useEffect(() => {

        let fetchTheme = async () => {
            await SetupTheme(Theme, Mode);
        };
        fetchTheme();

        SetFavicon(Theme, Mode);
    }, [Mode]);

    const MillisecondsPerCycle = 5000;//milliseconds|1000ms=1s

    //Autosaves current agenda & schedule
    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (UnsavedAgenda && Subpage == "Agenda") {
                SaveCurrentAgenda();
                console.log("Autosaved agenda");
            }
            else if (UnsavedSchedule && Subpage == "Routine") {
                SaveCurrentSchedule();
                console.log("Autosaved routine");
            }
            else {
                console.log("No autosave necessary");
            }
        }, MillisecondsPerCycle);
        return () => clearInterval(intervalId);
    }, [UnsavedAgenda, Agenda, UnsavedSchedule, Schedule, Subpage, MillisecondsPerCycle]);//AI says this fixes (it does, but based on research might be risky)

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

    // Runs when site has been inactive for awhile
    const handleInactivity = () => {
        console.log("User has been inactive for another " + (InactivityTimer / 1000) + " seconds.");
        if (!InactiveScreen && UsingScreenSaver) {
            setInactiveScreen(<Saver Mode={Mode} Device={Device} setInactiveScreen={setInactiveScreen} />);
        }
    };

    //Run handleInactivity after a set amount of inactivity
    useInactivity(handleInactivity, InactivityTimer);

    //Setups a new blank routine
    async function SetupNewRoutine() {
        if (Schedule && UnsavedSchedule) {
            SaveCurrentSchedule(Schedule);
        }
        setSchedule(await CreateNewRoutine());
    }

    //Swaps schedule to one with matching id in database
    //I = Routine's id
    async function SwapToRoutine(I) {
        if (Schedule && UnsavedSchedule) {
            SaveCurrentSchedule(Schedule);
        }
        setSchedule(await GetSchedule(I));
    }

    //Updates routine with changes
    //S = New routine with changes
    function UpdateSchedule(S) {
        if (S && Schedule) {
            setSchedule(S);
            setUnsavedSchedule(true);
            console.log("Updated routine");
        }
        else {
            console.log("Failed to update routine");
        }
    }

    //Updates agenda with changes
    //A = New agenda with changes
    function UpdateAgenda(A) {
        if (A && Agenda) {
            setAgenda(A);
            setUnsavedAgenda(true);
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
        if (Subpage == "Agenda" && Sub != "Agenda" && UnsavedAgenda) {
            UpdateAgenda(Agenda);
            SaveCurrentAgenda();
        }
        else if (Subpage == "Routine" && Sub != "Routine" && UnsavedSchedule) {
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
        SaveCurrentAgenda();
        let NextAgendaDate = new Date(Agenda.startDate);
        NextAgendaDate = AdjustForDST_SE(NextAgendaDate);
        switch (W) {
            case "Previous":
                NextAgendaDate.setDate(NextAgendaDate.getDate() - 7);
                let newA_P = await AgendaCheckup_RoutineID(await GetAgenda(NextAgendaDate), new Date())
                setAgenda(newA_P);
                await RefreshThisWeekSchedule(newA_P.routineID);
                break;
            case "Next":
                NextAgendaDate.setDate(NextAgendaDate.getDate() + 7);
                let newA_N = await AgendaCheckup_RoutineID(await GetAgenda(NextAgendaDate), new Date())
                setAgenda(newA_N);
                await RefreshThisWeekSchedule(newA_N.routineID);
                break;
            default:
                console.log("Error: Could tell which week to switch to");
        }
    }

    //Assigns provided schedule as current routine
    //S = Schedule to set as current routine
    async function SetAsCurrentRoutine(S) {
        if (S) {
            if (UnsavedSchedule) {
                SaveCurrentSchedule();
            }
            await AssignThisRoutine(S);
        }
        else {
            console.log("Error: No routine found to assign");
        }
    }

    //Saves current routine
    async function SaveCurrentSchedule() {
        if (!UnsavedSchedule) {
            console.log("Error: No routine changes to save");
        }
        else if (Schedule && Schedule != null && Schedule != "") {
            await ApplyScheduleUpdate(Schedule);
            setUnsavedSchedule(false);
            await RefreshThisWeekSchedule(null);
            await UpdateSchedulePreviews(null);
        }
        else {
            console.log("Error: No routine to save");
        }
    }

    //Saves current agenda
    async function SaveCurrentAgenda() {
        if (!UnsavedAgenda) {
            console.log("Error: No agenda changes to save");
        }
        else if (Agenda && Agenda != null && Agenda != "") {
            await ApplyAgendaUpdate(Agenda);
            setUnsavedAgenda(false);
            await UpdateAgendaPreviews(NumberOfWeeksPreview);
        }
        else {
            console.log("Error: No agenda to save");
        }
    }

    //Changes site mode (public or private)
    //M = Mode to set site to (toggles if anything else)
    function ToggleMode(M) {
        if (M == "Public") {
            setMode(0);
        }
        else if (M == "Private") {
            setMode(1);
        }
        else {
            if (Mode == 0) {
                setMode(1);
            }
            else {
                setMode(0);
            }
        }
    }

    //Refreshes this weeks schedule
    //I = Id of schedule to use if provided
    async function RefreshThisWeekSchedule(I) {
        if (Agenda && I) {
            let s = await GetSchedule(I);
            setThisWeeksSchedule(s);

        }
        else {
            setThisWeeksSchedule(await GetCurrentRoutine());
        }
    }

    //Checks if anything is currently in fullscreen mode
    function AnyCurrentFullScreens() {
        if (MemoFullMode || NotesFullMode) {
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

            let newCurrentTheme = Theme;
            newCurrentTheme.private = T;
            setTheme(newCurrentTheme);
            await ChangeCurrentThemes(null, T);
            await SetupTheme(newCurrentTheme, M);
        }
        else if (M == 0) {

            let newCurrentTheme = Theme;
            newCurrentTheme.public = T;
            setTheme(newCurrentTheme);
            await ChangeCurrentThemes(T, null);
            await SetupTheme(newCurrentTheme, M);
        }
        else {
            console.log("Error: Failed to change theme!");
        }
    }

    //Applies correct theme based on current mode
    //T = Theme titles
    //M = Mode (Public vs Private)
    async function SetupTheme(T, M) {

        setMain_Theme(await GetMain_CSS(T, M));
        setHeader_Theme(await GetHeader_CSS(T, M));
        setBody_Theme(await GetBody_CSS(T, M));
        setFooter_Theme(await GetFooter_CSS(T, M));

        setMain_Theme(prev => ({ ...prev }));
        setHeader_Theme(prev => ({ ...prev }));
        setBody_Theme(prev => ({ ...prev }));
        setFooter_Theme(prev => ({ ...prev }));
    }

    //Set the current favicon
    //T = Theme titles
    //M = Mode (Public vs Private)
    async function SetFavicon(T, M) {

        let Theme_Title = null;

        if (M == 0 && T.public === "Default") {
            Theme_Title = "/favicon_Private.gif";
        }
        else if (M == 1 && T.private === "Default") {
            Theme_Title = "/favicon_Public.ico";
        }
        else {
            Theme_Title = M == 1 ? T.private : T.public;
            Theme_Title = FaviconExist(Theme_Title) ? Theme_Title : null;

        }

        if (Theme_Title && M != 0 && M != 1) {
            Theme_Title = "/Themes" + Theme_Title;
        }
        else {
            Theme_Title = Mode == 1 ? "/Themes/Default/Private.gif" : "/Themes/Default/Public.ico";
        }

        let favicon = document.querySelector("link[rel='icon']");

        if (favicon) {
            favicon.remove();
        }

        favicon = document.createElement("link");
        favicon.rel = "icon";

        if (Theme_Title.includes(".gif")) {
            favicon.type = "image/gif";
            favicon.href = Theme_Title;

        }
        else {
            favicon.type = "image/ico";
            favicon.href = Theme_Title;
        }

        document.head.appendChild(favicon);
    }

    //Checks to make sure initail data is loaded before rendering rest of the page
    //A = Agenda
    //P = AgendaPreview
    //S = Schedule
    //T = ThisWeeksSchedule
    //R = SchedulePreview
    function RenderingWhole(A, P, S, T, R) {
        if (A && A != "" && A != null && P && P != "" && P != null && P != [] && S && S != "" && S != null && T && T != "" && T != null && R && R != "" && R != null) {
            return (
                <div className={`${Margin_Device[Device]} ${Margin_Mode[Mode]}`}>

                    <Head CN={`${Header_Device[Device]} ${Header_Mode[Mode]}`}
                        Themes={Header_Theme} ChangeTheme={ChangeTheme} AnyCurrentFullScreens={AnyCurrentFullScreens}
                        Mode={Mode} Device={Device} ToggleMode={ToggleMode} Theme={Theme}
                        UsingScreenSaver={UsingScreenSaver} ToggleScreenSaver={ToggleScreenSaver}
                        AgendaPreview={AgendaPreview} ThisWeeksSchedule={ThisWeeksSchedule} SchedulePreview={SchedulePreview} />

                    <Bod CN={`${Body_Device[Device]} ${Body_Mode[Mode]}`} Mode={Mode} Device={Device}
                        Themes={Body_Theme} MemoFullMode={MemoFullMode} setMemoFullMode={setMemoFullMode}
                        AnyCurrentFullScreens={AnyCurrentFullScreens} setNotesFullMode={setNotesFullMode}
                        Subpage={Subpage} SwitchSubpage={SwitchSubpage} SetAsCurrentRoutine={SetAsCurrentRoutine}
                        UnsavedAgenda={UnsavedAgenda} Agenda={Agenda} UpdateAgenda={UpdateAgenda}
                        SwitchCurrentAgenda={SwitchCurrentAgenda} SaveCurrentAgenda={SaveCurrentAgenda} SaveCurrentSchedule={SaveCurrentSchedule}
                        UnsavedSchedule={UnsavedSchedule} Schedule={Schedule} UpdateSchedule={UpdateSchedule} SetupNewRoutine={SetupNewRoutine}
                        ThisWeeksSchedule={ThisWeeksSchedule} SwapToRoutine={SwapToRoutine} />

                    <Foot CN={`${Footer_Device[Device]} ${Footer_Mode[Mode]} ${Footer_Theme.B}`} Mode={Mode} Device={Device} />

                </div>
            );
        }
        else {
            return null;
        }
    }

    return (
        <div className={`${Background_Device[Device]} ${Background_Mode[Mode]} ${Main_Theme.B}`}>
            {InactiveScreen}
            {RenderingWhole(Agenda, AgendaPreview, Schedule, ThisWeeksSchedule, SchedulePreview)}
        </div>
    );
}