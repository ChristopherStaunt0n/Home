import Theme_S from "../Styles/Themes.module.css";
import { questioning } from "./DatabaseConnection.js";

//Gets current theme references
async function GetThemes() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['Themes_Current']))[0].Data;
}

//Updates current themes
//Pub = Current public mode theme (null = unchanged)
//Pri = Current private mode theme (null = unchanged)
async function ChangeThemes(Pub, Pri) {
    let T = await GetThemes();
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

export { GetThemes, ChangeThemes };