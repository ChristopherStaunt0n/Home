import Theme_S from "../Styles/Themes.module.css";
import { questioning } from "./DatabaseConnection.js";
import { TurnIntoArray } from "./HandleGeneral.js";

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

//Gets all themes related to provided mode
//M = Mode (Public vs Private)
async function GetThemes(M) {

    let theMode = M;
    if (M == 0 || M == 1) {
        theMode = M == 0 ? "Public" : "Private";
    }

    let theThemes = JSON.parse(await questioning("SELECT ID, Title, CSS FROM themes WHERE Mode = ?", [theMode]));

    return theThemes;
}

//Gets theme based on id
//I = ID
async function GetTheme(I) {

    ////////////////////////////////////////////////////////////////
    let defaultPublicSample = {
        ID: 1,
        Title: "Default",
        CSS: {
            CentralBackground: "sampleTest",
            HeaderBackground: "HeaderBackground_Public_Default",
            CommonBackground: "CommonBackground_Public_Default",
            FooterBackground: "FooterBackground_Public_Default"
        }
    };
    if (Number(I) == 1) {
        return defaultPublicSample;
    }
    ///////////////////////////////////////////////////////////////////

    return JSON.parse(await questioning("SELECT ID, Title, CSS FROM themes WHERE ID = ?", [Number(I)]))[0];
}

//Adds theme to database
//T = Title
//M = Mode (Public vs Private)
//C = CSS
async function AddTheme(T, M, C) {

    let AllThemes = TurnIntoArray(await GetThemes(0)).concat(TurnIntoArray(await GetThemes(1)));

    let oldIDS = [];
    for (let i = 0; i < AllThemes.length; i++) {
        oldIDS.push(AllThemes[i].ID);
    }

    let newID = 0;
    while (true) {
        if (oldIDS.includes(newID)) {
            break;
        }
        else if (oldIDS.length == 0) {
            break;
        }
        else {
            newID++;
        }
    }

    let theMode = M;
    if (M == 0 || M == 1) {
        theMode = M == 0 ? "Public" : "Private";
    }

    await questioning(
        "INSERT INTO themes (ID, Title, Mode, CSS) VALUES (?, ?, ?, ?)",
        [newID, T, theMode, C]
    );
}

//Returns css for the main page background
//T = Current theme package
//M = Current mode
function GetMainBackground_CSS(T, M) {

    let Theme = M == 0 ? T.public : T.private;

    if (Theme.ID == 0 && M == 0) {
        return "MainBackground_Public_Default";
    }
    else if (Theme.ID == 0 && M == 1) {
        return "MainBackground_Private_Default";
    }
    else {
        return Theme.CSS.CentralBackground;
    }
}

//Returns css for the header background
//T = Current theme package
//M = Current mode
function GetHeaderBackground_CSS(T, M) {

    let Theme = M == 0 ? T.public : T.private;

    if (Theme.ID == 0 && M == 0) {
        return "HeaderBackground_Public_Default";
    }
    else if (Theme.ID == 0 && M == 1) {
        return "HeaderBackground_Private_Default";
    }
    else {
        return Theme.CSS.HeaderBackground;
    }
}

//Returns css for the common area background
//T = Current theme package
//M = Current mode
function GetCommonBackground_CSS(T, M) {

    let Theme = M == 0 ? T.public : T.private;

    if (Theme.ID == 0 && M == 0) {
        return "CommonBackground_Public_Default";
    }
    else if (Theme.ID == 0 && M == 1) {
        return "CommonBackground_Private_Default";
    }
    else {
        return Theme.CSS.CommonBackground;
    }
}

//Returns css for the footer background
//T = Current theme package
//M = Current mode
function GetFooterBackground_CSS(T, M) {

    let Theme = M == 0 ? T.public : T.private;

    if (Theme.ID == 0 && M == 0) {
        return "FooterBackground_Public_Default";
    }
    else if (Theme.ID == 0 && M == 1) {
        return "FooterBackground_Private_Default";
    }
    else {
        return Theme.CSS.FooterBackground;
    }
}

export {
    GetCurrentThemes, ChangeCurrentThemes, GetThemes, AddTheme, GetTheme,
    GetMainBackground_CSS, GetHeaderBackground_CSS, GetCommonBackground_CSS, GetFooterBackground_CSS
};