import { questioning } from "./DatabaseConnection.js";

//Checks if mode swapping is locked (requires passkey)
async function GetFooterHistory() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['Footer_History']))[0].Data;
}

//Updates lock on mode swapping
//K = Key required or not
async function SetFooterHistory(R, B) {

    let H = await GetFooterHistory();

    if (R != null) {
        H.R = R;
    }

    if (B != null) {
        H.B = B;
    }
    
    await questioning(
        "UPDATE ref SET Data = ? WHERE Basis = ?",
        [JSON.stringify(H), 'Footer_History']
    );
}

export { GetFooterHistory, SetFooterHistory };