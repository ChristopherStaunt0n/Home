import { questioning } from "./DatabaseConnection.js";

//Checks if mode swapping is locked (requires passkey)
async function GetModeToggleKeyStatus() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['ModeLock_Toggle']))[0].Data.active;
}

//Updates lock on mode swapping
//K = Key required or not
async function ChangeModeToggleKeyStatus(K) {
    let J = {
        active: K
    }
    await questioning(
        "UPDATE ref SET Data = ? WHERE Basis = ?",
        [JSON.stringify(J), 'ModeLock_Toggle']
    );
}

export { ChangeModeToggleKeyStatus, GetModeToggleKeyStatus };