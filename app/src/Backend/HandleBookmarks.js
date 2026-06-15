import { questioning } from "./DatabaseConnection.js";

//Gets bookmarks from database
async function GetBookmarks() {

    let BMs = {
        public: [],
        private: []
    };

    let BMs_DB = JSON.parse(await questioning("SELECT Mode, Title, Shortcut, Marks FROM bookmarks", []));

    for (let i = 0; i < BMs_DB.length; i++) {

        let BM1 = {
            Title: BMs_DB[i].Title,
            Shortcut: BMs_DB[i].Shortcut.cut,
            Marks: BMs_DB[i].Marks.marks
        };

        if (BMs_DB[i].Mode === "Public") {
            BMs.public.push(BM1);
        }
        else if (BMs_DB[i].Mode === "Private") {
            BMs.private.push(BM1);
        }
    }

    return BMs;
}

//Adds bookmark to database
//B = JSON of bookmark info
//M = Mode (public vs private)
async function AddBookmark(B, M) {
    let book = {
        marks: B.Marks
    };
    let short = {
        cut: B.Shortcut
    }
    await questioning(
        "INSERT INTO bookmarks (Mode, Title, Shortcut, Marks) VALUES (?, ?, ?, ?)",
        [M == 1 || M == "Private" ? "Private" : "Public", B.Title, JSON.stringify(short), JSON.stringify(book)]
    );
}

export { GetBookmarks, AddBookmark };