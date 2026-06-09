import { useRef, useEffect, useState } from "react";
import { DropdownLinks } from "./UI.jsx";
import { GetModeToggleKeyStatus, ChangeModeToggleKeyStatus } from "../../Backend/DatabaseConnection.js";
import { GetWeekDay, AdjustForDST_SE, ConvertWeekSimple, GetWeekMonth, GetReadableDate } from "../../Backend/HandleDates.js";
import { GetDaysAgendaData, ReorderTasks } from "../../Backend/HandleAgenda.js";
import { GetDaysRoutineData, CheckIfChoreExist, ReorderChores, GetImportantRoutine } from "../../Backend/HandleRoutine.js";
import { TurnIntoArray } from "../../Backend/HandleGeneral.js";
import Basic_S from "../../Styles/Basics.module.css";
import Notifications_S from "./Styles/Notifications.module.css";
import Space_S from "./Styles/Space.module.css";
import Bookmarks_S from "./Styles/Bookmarks.module.css";

//Header section to Homepage
export default function Head(Q) {
    return (
        <div className={`${Q.CN} ${Q.Themes.Head}`}>
            <Notifications Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} AgendaPreview={Q.AgendaPreview} ThisWeeksSchedule={Q.ThisWeeksSchedule} SchedulePreview={Q.SchedulePreview} />
            <Space Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} ToggleMode={Q.ToggleMode} UsingScreenSaver={Q.UsingScreenSaver} ToggleScreenSaver={Q.ToggleScreenSaver} />
            <Bookmarks Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} />
        </div>
    );
}

//Notifications bar containing date, warnings, etc
function Notifications(Q) {

    const Notifications_Device = [Notifications_S.Computer, Notifications_S.Mobile];
    const Notifications_Mode = [Notifications_S.Public, Notifications_S.Private];

    //Returns today's date for the notification bar
    function TodaysDate() {
        let theDate = new Date();
        let wD = GetWeekDay(theDate);
        let wM = GetWeekMonth(theDate);
        let wS = ConvertWeekSimple(theDate).split("-");
        return wD + ": " + wM + ", " + Number(wS[2]) + " " + wS[0];
    }

    //Setups the data for creating the dropdown notifcations
    //M = Which mode (public or private)
    //AP = Agenda previews
    //RP = Schedule previews
    function CreateNotifications(M, AP, RP) {

        let Next_31_Days = [];
        let Preview_Index = 0;
        let Days_Recorded = 0;
        let aNewDate = new Date();
        aNewDate.setHours(0, 0, 0, 0);
        aNewDate = AdjustForDST_SE(aNewDate);
        let Current_Day = GetWeekDay(aNewDate);
        let Current_Date = aNewDate;
        let firstWeek = true;

        while (Days_Recorded < 31) {

            if (Preview_Index >= AP.length) {
                break;
            }

            let TodaysTasks = null;

            switch (Current_Day) {
                case "Sunday":
                    TodaysTasks = M == 0 ? AP[Preview_Index].public.daily.sunday : AP[Preview_Index].private.daily.sunday;
                    break;
                case "Monday":
                    TodaysTasks = M == 0 ? AP[Preview_Index].public.daily.monday : AP[Preview_Index].private.daily.monday;
                    break;
                case "Tuesday":
                    TodaysTasks = M == 0 ? AP[Preview_Index].public.daily.tuesday : AP[Preview_Index].private.daily.tuesday;
                    break;
                case "Wednesday":
                    TodaysTasks = M == 0 ? AP[Preview_Index].public.daily.wednesday : AP[Preview_Index].private.daily.wednesday;
                    break;
                case "Thursday":
                    TodaysTasks = M == 0 ? AP[Preview_Index].public.daily.thursday : AP[Preview_Index].private.daily.thursday;
                    break;
                case "Friday":
                    TodaysTasks = M == 0 ? AP[Preview_Index].public.daily.friday : AP[Preview_Index].private.daily.friday;
                    break;
                case "Saturday":
                    TodaysTasks = M == 0 ? AP[Preview_Index].public.daily.saturday : AP[Preview_Index].private.daily.saturday;
                    break;
            }

            if (Days_Recorded != 0 && Current_Day == "Sunday") {
                firstWeek = false;
            }

            let TodaysRoutines = null;
            if (Days_Recorded < 2) {
                TodaysRoutines = M == 0 ? RP[Preview_Index].public : RP[Preview_Index].private;
                let tempRs = [];

                TodaysRoutines = TodaysRoutines.filter(r => !r.days.includes("Week"));
                TodaysRoutines = TurnIntoArray(TodaysRoutines);
                TodaysRoutines = TodaysRoutines.filter(r => r.days.includes(Current_Day));
                TodaysRoutines = TurnIntoArray(TodaysRoutines);

                for (let i = 0; i < TodaysRoutines.length; i++) {
                    if (!CheckIfChoreExist(TodaysTasks.routinesDone, TodaysRoutines[i].chore, TodaysRoutines[i].time, TodaysRoutines[i].days)) {
                        tempRs.push(TodaysRoutines[i]);
                    }
                }
                TodaysRoutines = tempRs;

                TodaysTasks = TodaysTasks.tasks.filter(t => !t.complete);
                TodaysTasks = TurnIntoArray(TodaysTasks);
            }
            else if (firstWeek) {
                TodaysTasks = TodaysTasks.tasks.filter(t => !t.complete);
                TodaysTasks = TurnIntoArray(TodaysTasks);
            }
            else {
                TodaysTasks = TodaysTasks.tasks.filter(t => t.important && !t.complete);
                TodaysTasks = TurnIntoArray(TodaysTasks);
            }

            let DO_Day = Days_Recorded + 1;
            let DO_Objectives = TodaysTasks && TodaysTasks.length > 0 ? TodaysTasks : null;
            let DO_Errands = TodaysRoutines && TodaysRoutines.length > 0 ? TodaysRoutines : null;
            let DO_When = Current_Day + "";
            let DO_Date = new Date(Current_Date);
            let DailyObjectives = {
                day: DO_Day,
                objectives: DO_Objectives,
                errands: DO_Errands,
                when: DO_When,
                date: DO_Date
            };

            Next_31_Days.push(DailyObjectives);
            Days_Recorded++;

            switch (Current_Day) {
                case "Sunday":
                    Current_Day = "Monday";
                    break;
                case "Monday":
                    Current_Day = "Tuesday";
                    break;
                case "Tuesday":
                    Current_Day = "Wednesday";
                    break;
                case "Wednesday":
                    Current_Day = "Thursday";
                    break;
                case "Thursday":
                    Current_Day = "Friday";
                    break;
                case "Friday":
                    Current_Day = "Saturday";
                    break;
                case "Saturday":
                    Current_Day = "Sunday";
                    Preview_Index++;
                    break;
            }

            Current_Date.setDate(Current_Date.getDate() + 1);
            Current_Date = AdjustForDST_SE(Current_Date);
        }

        let D_Today = [Next_31_Days.shift()];

        let D_Tomorrow = [Next_31_Days.shift()];

        let D_LaterWeek = [];
        while (Next_31_Days[0].when != "Sunday") {
            D_LaterWeek.push(Next_31_Days.shift());
        }

        let D_NextWeek = [];
        D_NextWeek.push(Next_31_Days.shift());
        while (Next_31_Days[0].when != "Sunday") {
            D_NextWeek.push(Next_31_Days.shift());
        }

        let D_LaterMonth = [];
        let oldLength = Next_31_Days.length
        for (let i = 0; i < oldLength; i++) {
            D_LaterMonth.push(Next_31_Days.shift());
        }

        return (
            <div className={Notifications_S.DropdownBar_Notifications}>
                {GenDropdown("Today", D_Today)}
                {GenDropdown("Tomorrow", D_Tomorrow)}
                {GenDropdown("Soon", D_LaterWeek)}
                {GenDropdown("Next Week", D_NextWeek)}
                {GenDropdown("Later", D_LaterMonth)}
            </div>
        );
    }

    //Creates drop down listof notifications
    //T = Dropdown title
    //A = Array of notifications
    function GenDropdown(T, A) {
        if (T && A && A.length > 0) {
            let OT = [];
            let OR = [];
            if (A) {
                for (let i = 0; i < A.length; i++) {
                    if (A[i].objectives && A[i].objectives.length > 0) {
                        OT = OT.concat(A[i].objectives);
                    }
                    if (A[i].errands && A[i].errands.length > 0) {
                        OR = OR.concat(A[i].errands);
                    }
                }
            }
            if (OT.length > 0) {
                OT = ReorderTasks(OT);
            }
            if (OR.length > 0) {
                OR = ReorderChores(OR);
            }
            let Notis = [];
            for (let i = 0; i < OT.length; i++) {
                Notis.push(
                    <div className={Notifications_S.DropBox} key={"OT" + i}>
                        <div className={`${Notifications_S.Drop} ${Q.Themes.NB_B}`}>
                            <i>{OT[i].time ? OT[i].time + " " : null}</i>
                            {OT[i].time ? <span className={Notifications_S.DropBox_Buffer} /> : null}
                            <b>{OT[i].goal}</b>
                        </div>
                    </div>
                );
            }
            for (let i = 0; i < OR.length; i++) {
                Notis.push(
                    <div className={Notifications_S.DropBox} key={"OR" + i}>
                        <div className={`${Notifications_S.Drop} ${Q.Themes.NB_B}`}>
                            <i>{OR[i].time ? OR[i].time + " " : null}</i>
                            {OR[i].time ? <span className={Notifications_S.DropBox_Buffer} /> : null}
                            <b>{OR[i].chore}</b>
                        </div>
                    </div>
                );
            }
            return (
                <div className={`${Notifications_S.DropdownContainer} ${Q.Themes.NB_BB}`}>
                    <div className={Notifications_S.Title}>{T}</div>
                    {Notis}
                </div>
            );
        }
        else {
            console.log("Error: Failed to make notification dropdown menu");
            return null;
        }
    }

    //Filters out non-important chores from schedule preview
    //A = Array of schedules
    function ImportantSchedulePreviews(A) {
        if (A && A.length > 0) {
            let impRS = A;
            for (let i = 0; i < impRS.length; i++) {
                impRS[i] = GetImportantRoutine(impRS[i])
            }
            return impRS;
        }
        else {
            return A;
        }
    }

    return (
        <div className={`${Notifications_Device[Q.Device]} ${Notifications_Mode[Q.Mode]} ${Q.Themes.NB}`}>
            <div className={Notifications_S.Today}>
                {TodaysDate()}
            </div>
            {CreateNotifications(Q.Mode, Q.AgendaPreview, ImportantSchedulePreviews(Q.SchedulePreview))}
        </div>
    );
}

//Open space for special or hidden components to swap into
function Space(Q) {

    const Space_Device = [Space_S.Computer, Space_S.Mobile];
    const Space_Mode = [Space_S.Public, Space_S.Private];

    const [Nook, setNook] = useState("Default");
    const [Pass, setPass] = useState("");
    const [KeyActive, setKeyActive] = useState(true);

    //Loads lock status
    useEffect(() => {
        let fetchRef = async () => {
            setKeyActive(await GetModeToggleKeyStatus());
        };
        fetchRef();
    }, []);

    //Toggles lock on mode swaping
    async function ToggleKeyRequirement() {
        let newStatus = KeyActive ? false : true;
        setKeyActive(newStatus)
        await ChangeModeToggleKeyStatus(newStatus);
    }

    //Switches modes if conditions meet
    //P = Key portion
    function AttemptPass(P) {

        let clue = "ABCDE";

        if (!KeyActive) {
            Q.ToggleMode();
        }
        else if (Pass.includes(P) || !clue.includes(P)) {
            setPass("");
        }
        else if (Pass + P == clue) {
            Q.ToggleMode();
            setPass("");
        }
        else {
            setPass(Pass + P);
        }
    }

    //Swaps the compartment in the header
    //M = Which mode (public or private)
    //C = Current compartment
    function HiddenCompartments(M, C) {
        switch (C) {
            case "":
                return null;
            default:
                if (M == 0) {
                    return (
                        <div className={Space_S.Key_0}>
                            <span className={Basic_S.Row}>
                                <span className={Space_S.Press} onClick={() => AttemptPass("AB")}>W</span>
                                <span className={Space_S.Press} onClick={() => AttemptPass("X")}>e</span>
                                <span className={Space_S.Press} onClick={() => AttemptPass("X")}>l</span>
                                <span className={Space_S.Press} onClick={() => AttemptPass("E")}>c</span>
                                <span className={Space_S.Press} onClick={() => AttemptPass("X")}>o</span>
                                <span className={Space_S.Press} onClick={() => AttemptPass("C")}>m</span>
                                <span className={Space_S.Press} onClick={() => AttemptPass("CD")}>e</span>
                            </span>
                        </div>
                    );
                }
                else {
                    return (
                        <div className={Space_S.Key_1}>
                            <span className={Basic_S.Row}>
                                <span className={Space_S.Press} onClick={() => Q.ToggleMode()}>Den</span>
                                <span className={Space_S.Press} onClick={() => ToggleKeyRequirement()} style={{ color: KeyActive ? "green" : "red" }}>!</span>
                                <span className={Space_S.Press} onClick={() => Q.ToggleScreenSaver()} style={{ color: Q.UsingScreenSaver ? "green" : "red" }}>?</span>
                            </span>
                        </div>
                    );
                }
        }
    }

    return (
        <div className={`${Space_Device[Q.Device]} ${Space_Mode[Q.Mode]} ${Q.Themes.SP}`}>
            {HiddenCompartments(Q.Mode, Nook)}
        </div>
    );
}

//Navigation bar for bookmarks
function Bookmarks(Q) {

    const Bookmarks_Device = [Bookmarks_S.Computer, Bookmarks_S.Mobile];
    const Bookmarks_Mode = [Bookmarks_S.Public, Bookmarks_S.Private];

    const Blank = {
        Title: "",
        Shortcut: false,
        Marks: [
            { Label: "", Link: "" },
            { Label: "", Link: "" }
        ]
    };

    const Anime = {
        Title: "Anime",
        Shortcut: false,
        Marks: [
            { Label: "Crunchyroll", Link: "https://www.crunchyroll.com/" },
            { Label: "Funimation", Link: "https://www.funimation.com/" }
        ]
    };
    const Bethesda = {
        Title: "Bethesda",
        Shortcut: ["https://bethesda.net/dashboard"],
        Marks: [
            { Label: "Fallout 4 Mods", Link: "https://bethesda.net/mods/fallout4" },
            { Label: "Skyrim Mods", Link: "https://bethesda.net/mods/skyrim" },
            { Label: "Starfield Mods", Link: "https://creations.bethesda.net/en/starfield/featured" }
        ]
    };
    const Builds = {
        Title: "Builds",
        Shortcut: false,
        Marks: [
            { Label: "Baldur's Gate 3", Link: "https://eip.gg/bg3/build-planner/" },
            { Label: "Monster Hunter Rise", Link: "https://mhrise.wiki-db.com/sim/?hl=en" },
            { Label: "Monster Hunter Wilds", Link: "https://mhwilds.rayleon.net/" },
            { Label: "Monster Hunter World", Link: "https://honeyhunterworld.com/mhwbi/?1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3:0:0:0:0:0:0" }
        ]
    };
    const Discord = {
        Title: "Discord",
        Shortcut: false,
        Marks: [
            { Label: "Discord", Link: "https://discord.com/login" }
        ]
    };
    const Git = {
        Title: "Git",
        Shortcut: false,
        Marks: [
            { Label: "GitHub", Link: "https://github.com/" }
        ]
    };
    const Google = {
        Title: "Google",
        Shortcut: ["https://www.google.com/"],
        Marks: [
            { Label: "Earth", Link: "https://earth.google.com/web/@0,-4.1783999,0a,22251752.77375655d,35y,0h,0t,0r" },
            { Label: "Images", Link: "https://www.google.com/imghp?hl=en&ogbl" },
            { Label: "Maps", Link: "https://www.google.com/maps" },
            { Label: "News", Link: "https://news.google.com/home?hl=en-US&gl=US&ceid=US:en" },
            { Label: "Translate", Link: "https://translate.google.com/" }
        ]
    };
    const IMDb = {
        Title: "IMDb",
        Shortcut: ["https://www.imdb.com/"],
        Marks: [
            { Label: "Genre Search", Link: "https://www.imdb.com/interest/all/" },
            { Label: "Popular Movies", Link: "https://www.imdb.com/chart/moviemeter/?ref_=nv_mv_mpm" },
            { Label: "Popular Shows", Link: "https://www.imdb.com/chart/tvmeter/?ref_=nv_tvv_mptv" },
            { Label: "Top Movies", Link: "https://www.imdb.com/chart/top/?ref_=nv_mv_250" },
            { Label: "Top Shows", Link: "https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250" }
        ]
    };
    const JobSearch = {
        Title: "Jobs",
        Shortcut: ["https://cnu.joinhandshake.com/login", "https://www.linkedin.com/", "https://www.indeed.com/"],
        Marks: [
            { Label: "Handshake", Link: "https://cnu.joinhandshake.com/login" },
            { Label: "Indeed", Link: "https://www.indeed.com/" },
            { Label: "Linkedin", Link: "https://www.linkedin.com/" },
            { Label: "TechFetch", Link: "https://www.techfetch.com/" },
            { Label: "TechFlow", Link: "https://apply.workable.com/techflow/#jobs" },
            { Label: "Virginia Jobs", Link: "https://www.jobs.virginia.gov/home" }
        ]
    };
    const Meetup = {
        Title: "Meetup",
        Shortcut: false,
        Marks: [
            { Label: "Meetup", Link: "https://www.meetup.com/" }
        ]
    };
    const NexusMods = {
        Title: "Nexus",
        Shortcut: false,
        Marks: [
            { Label: "Fallout 3", Link: "https://www.nexusmods.com/fallout3" },
            { Label: "Fallout 4", Link: "https://www.nexusmods.com/fallout4" },
            { Label: "Fallout New Vegas", Link: "https://www.nexusmods.com/newvegas" },
            { Label: "Kenshi", Link: "https://www.nexusmods.com/kenshi" },
            { Label: "Morrowind", Link: "https://www.nexusmods.com/morrowind" },
            { Label: "Oblivion", Link: "https://www.nexusmods.com/oblivion" },
            { Label: "Skyrim", Link: "https://www.nexusmods.com/skyrim" },
            { Label: "Skyrim SE", Link: "https://www.nexusmods.com/skyrimspecialedition" }
        ]
    };
    const Reddit = {
        Title: "Reddit",
        Shortcut: false,
        Marks: [
            { Label: "Reddit", Link: "https://www.reddit.com/" }
        ]
    };
    const Reddit_1 = {
        Title: "Reddit",
        Shortcut: ["https://www.reddit.com/"],
        Marks: [
            { Label: "Monster Hunter", Link: "https://www.reddit.com/r/MonsterHunter/" },
            { Label: "NMSCE", Link: "https://www.reddit.com/r/NMSCoordinateExchange/" }
        ]
    };
    const Wiki_1 = {
        Title: "Wiki",
        Shortcut: ["https://www.wikipedia.org/"],
        Marks: [
            { Label: "Ark", Link: "https://ark.wiki.gg/wiki/ARK_Wiki" },
            { Label: "Baldur's Gate 3", Link: "https://bg3.wiki/" },
            { Label: "Cyberpunk 2077", Link: "https://cyberpunk.fandom.com/wiki/Cyberpunk_2077" },
            { Label: "Kenshi", Link: "https://kenshi.fandom.com/wiki/Kenshi_Wiki" }
        ]
    };
    const Youtube = {
        Title: "Youtube",
        Shortcut: false,
        Marks: [
            { Label: "Youtube", Link: "https://www.youtube.com/" }
        ]
    };

    const PrivateBookmarks = [Anime, Bethesda, Builds, Discord, Google, IMDb, NexusMods, Reddit_1, Wiki_1, Youtube];

    const PublicBookmarks = [Git, Google, JobSearch, Meetup, Reddit, Youtube];

    return (
        <div className={`${Bookmarks_Device[Q.Device]} ${Bookmarks_Mode[Q.Mode]} ${Q.Themes.BM}`}>
            {Q.Mode == 1 ?
                PrivateBookmarks.map((aBookmark, index) => (
                    <DropdownLinks key={index} Data={aBookmark} Device={Q.Device} Mode={Q.Mode} Themes={Q.Themes} />
                ))
                :
                PublicBookmarks.map((aBookmark, index) => (
                    <DropdownLinks key={index} Data={aBookmark} Device={Q.Device} Mode={Q.Mode} Themes={Q.Themes} />
                ))
            }
        </div>
    );
}