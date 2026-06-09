import { questioning } from "./DatabaseConnection.js";
import { TurnIntoArray } from "./HandleGeneral.js";

const All_Themes = [];

const Empty_Background = {
    B: null
};
const Empty_Header = {
    Head: null,
    NB: null,
    NB_B: null,
    NB_BB: null,
    SP: null,
    BM: null,
    BM_T: null,
    BM_L: null
};
const Empty_Body = {
    C: null,

    LC: null,
    LC_N_F: null,
    LC_N_B: null,
    LC_N_OB: null,
    LC_N_UIB: null,
    LC_N_L: null,
    LC_N_DL: null,
    LC_N_DO: null,

    MC_A_B: null,
    MC_A_F: null,
    MC_A_TF: null,
    MC_A_TB: null,
    MC_A_DB: null,
    MC_A_TBA: null,
    MC_A_TAB: null,
    MC_A_M_F: null,
    MC_A_M_E: null,
    MC_A_MR_B: null,
    MC_A_MR_B_BA: null,
    MC_A_MR_B_BI: null,
    MC_A_FN: null,
    MC_R_T_M: null,
    MC_R_T_A: null,
    MC_R_T_E: null,
    MC_R_T_N: null,
    MC_R_T_U: null,
    MC_R_D_B: null,
    MC_R_D_T: null,
    MC_R_C_F: null,
    MC_R_C_I: null,
    MC_R_N_TI: null,
    MC_R_N_TE: null,
    MC_R_W: null,

    RC_N_B: null,
    RC_N_F_SP: null,
    RC_N_C_F: null,
    RC_N_C_SB: null,
    RC_N_C_CN: null,
    RC_N_C_DGT: null,
    RC_N_C_DGO: null,
    RC_N_C_DCB: null,
    RC_N_C_DCH: null,
    RC_N_W_T: null,
    RC_N_W_B: null,
    RC_N_A_UI: null,
    RC_N_R_M: null,
    RC_N_R_SB: null
};
const Empty_Footer = {
    B: null
};

//Returns empty themes for initializing data
function Get_Empty_Themes() {
    return {
        Main: Empty_Background,
        Header: Empty_Header,
        Body: Empty_Body,
        Footer: Empty_Footer
    };
}

//Gets current theme references
async function GetCurrentThemes() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['Themes_Current']))[0].Data;
}

//Updates current themes
//Pub = Current public mode theme (null = unchanged)
//Pri = Current private mode theme (null = unchanged)
async function ChangeCurrentThemes(Pub, Pri) {
    let T = await GetCurrentThemes();
    if (Pub) {
        T.public = Pub;
    }
    if (Pri) {
        T.private = Pri;
    }
    await questioning(
        "UPDATE ref SET Data = ? WHERE Basis = ?",
        [JSON.stringify(T), 'Themes_Current']
    );
}

//Gets theme based on title
//T = Current theme package
//M = Mode (Public vs Private)
async function GetTheme(T, M) {

    let Title = M == 1 ? T.private : T.public;
    let ThemePackge = structuredClone(T);

    if (!(Title === "Default" || Title === "Template" || All_Themes.includes(Title))) {
        ThemePackge.private = "Default";
        ThemePackge.public = "Default";
    }

    return {
        Main: await GetMain_CSS(ThemePackge, M),
        Header: await GetHeader_CSS(ThemePackge, M),
        Body: await GetBody_CSS(ThemePackge, M),
        Footer: await GetFooter_CSS(ThemePackge, M)
    };
}

//Loads CSS content for the theme section
//T = Theme folder name
//M = Current mode
//F = Which file
async function GetCSSModule(T, M, F) {

    let ThePath = "";

    if (T == "Default") {
        ThePath = '../Styles/Themes/Default/' + (M == 1 ? 'Private' : 'Public') + F;
    }
    else if (T == "Template") {
        ThePath = '../Styles/Themes/Default/Template' + F;
    }
    else {
        ThePath = '../Styles/Themes/Presets/' + Theme + F;
    }

    let cssModule = await import(ThePath, {
        with: { type: 'css' }
    });

    return cssModule.default;
}

//Returns css for the main page background
//T = Current theme package
//M = Current mode
async function GetMain_CSS(T, M) {

    let Theme = M == 0 ? T.public : T.private;
    let TheCSS = await GetCSSModule(Theme, M, '/Background.module.css');

    let Result = Empty_Background;
    Result.B = TheCSS.Background

    return Result;
}

//Returns css for the header background
//T = Current theme package
//M = Current mode
async function GetHeader_CSS(T, M) {

    let Theme = M == 0 ? T.public : T.private;
    let TheCSS = await GetCSSModule(Theme, M, '/Header.module.css');

    let Result = Empty_Header;
    Result.Head = TheCSS.Background;
    Result.NB = TheCSS.NotificationBar;
    Result.NB_B = TheCSS.NotificationBar_Drop;
    Result.NB_BB = TheCSS.NotificationBar_DropButton;
    Result.SP = TheCSS.Space;
    Result.BM = TheCSS.Bookmarks;
    Result.BM_T = TheCSS.Title;
    Result.BM_L = TheCSS.Link;

    return Result;
}

//Returns css for the Body area background
//T = Current theme package
//M = Current mode
async function GetBody_CSS(T, M) {

    let Theme = M == 0 ? T.public : T.private;
    let TheCSS_Nav = await GetCSSModule(Theme, M, '/NavMenu.module.css');
    let TheCSS_C = await GetCSSModule(Theme, M, '/Common.module.css');
    let TheCSS_Agenda = await GetCSSModule(Theme, M, '/Agenda.module.css');
    let TheCSS_Routine = await GetCSSModule(Theme, M, '/Routine.module.css');
    let TheCSS_Note = await GetCSSModule(Theme, M, '/Notes.module.css');

    let Result = Empty_Body;

    Result.C = TheCSS_C.Background;

    Result.LC = TheCSS_Nav.Background;
    Result.LC_N_F = TheCSS_Nav.Font;
    Result.LC_N_B = TheCSS_Nav.Nav_Background;
    Result.LC_N_OB = TheCSS_Nav.Nav_Open_Button;
    Result.LC_N_UIB = TheCSS_Nav.UIButtons;
    Result.LC_N_L = TheCSS_Nav.Labels;
    Result.LC_N_DL = TheCSS_Nav.Dropdown_Label;
    Result.LC_N_DO = TheCSS_Nav.Dropdown_Option;

    Result.MC_A_B = TheCSS_Agenda.Background;
    Result.MC_A_F = TheCSS_Agenda.Font;
    Result.MC_A_TF = TheCSS_Agenda.Text_Font;
    Result.MC_A_TB = TheCSS_Agenda.Text_Background;
    Result.MC_A_DB = TheCSS_Agenda.Day_Bar;
    Result.MC_A_TBA = TheCSS_Agenda.Task_Background;
    Result.MC_A_TAB = TheCSS_Agenda.Task_Box;
    Result.MC_A_M_F = TheCSS_Agenda.Day_Misc_Full;
    Result.MC_A_M_E = TheCSS_Agenda.Day_Misc_Empty;
    Result.MC_A_MR_B = TheCSS_Agenda.MemoReview_Bar;
    Result.MC_A_MR_B_BA = TheCSS_Agenda.MemoReview_Bar_Button_Active;
    Result.MC_A_MR_B_BI = TheCSS_Agenda.MemoReview_Bar_Button_Inactive;
    Result.MC_A_FN = TheCSS_Agenda.FullNotes;
    Result.MC_R_T_M = TheCSS_Routine.Time_Morning;
    Result.MC_R_T_A = TheCSS_Routine.Time_Afternoon;
    Result.MC_R_T_E = TheCSS_Routine.Time_Evening;
    Result.MC_R_T_N = TheCSS_Routine.Time_Night;
    Result.MC_R_T_U = TheCSS_Routine.Time_Untimed;
    Result.MC_R_D_B = TheCSS_Routine.Days_Background;
    Result.MC_R_D_T = TheCSS_Routine.Day_Title;
    Result.MC_R_C_F = TheCSS_Routine.Chore_Font;
    Result.MC_R_C_I = TheCSS_Routine.Chore_Important;
    Result.MC_R_N_TI = TheCSS_Routine.Notes_Title;
    Result.MC_R_N_TE = TheCSS_Routine.Notes_Text;
    Result.MC_R_W = TheCSS_Routine.Weekly;

    Result.RC_N_B = TheCSS_Note.Background;
    Result.RC_N_F_SP = TheCSS_Note.ShowPanels_Buttons;
    Result.RC_N_C_F = TheCSS_Note.Choose_Font;
    Result.RC_N_C_SB = TheCSS_Note.Choose_Save_Blank;
    Result.RC_N_C_CN = TheCSS_Note.Choose_CreateNote;
    Result.RC_N_C_DGT = TheCSS_Note.Choose_Dropdown_Groups_Title;
    Result.RC_N_C_DGO = TheCSS_Note.Choose_Dropdown_Groups_Options;
    Result.RC_N_C_DCB = TheCSS_Note.Choose_Dropdown_Choices_Background;
    Result.RC_N_C_DCH = TheCSS_Note.Choose_Dropdown_Choices_Highlight;
    Result.RC_N_W_T = TheCSS_Note.Writing_Title;
    Result.RC_N_W_B = TheCSS_Note.Writing_Body;
    Result.RC_N_A_UI = TheCSS_Note.Adjustments_UI;
    Result.RC_N_R_M = TheCSS_Note.Recent_Main;
    Result.RC_N_R_SB = TheCSS_Note.Recent_Switch_Bar;

    return Result;
}

//Returns css for the footer background
//T = Current theme package
//M = Current mode
async function GetFooter_CSS(T, M) {

    let Theme = M == 0 ? T.public : T.private;
    let TheCSS = await GetCSSModule(Theme, M, '/Footer.module.css');

    let Result = Empty_Footer;
    Result.B = TheCSS.Background;

    return Result;
}

export {
    GetCurrentThemes, ChangeCurrentThemes, GetTheme, Get_Empty_Themes,
    GetMain_CSS, GetHeader_CSS, GetBody_CSS, GetFooter_CSS
};