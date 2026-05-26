import { questioning } from "./DatabaseConnection.js";

//Checks if screen saver is in use
async function GetScreenSaverStatus() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['ScreenSaver_Toggle']))[0].Data.active;
}

//Updates lock on mode swapping
//K = Key required or not
async function ChangeScreenSaverStatus(K) {
    let J = {
        active: K
    }
    await questioning(
        "UPDATE ref SET Data = ? WHERE Basis = ?",
        [JSON.stringify(J), 'ScreenSaver_Toggle']
    );
}

export { GetScreenSaverStatus, ChangeScreenSaverStatus };