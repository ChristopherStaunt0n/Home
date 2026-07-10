import { useState, useEffect, useRef } from 'react';
import { GetBookmarks, AddBookmark } from "../../../Backend/HandleBookmarks.js";
import { TurnIntoArray } from "../../../Backend/HandleGeneral.js";
import Basic_S from "../../../Styles/Basics.module.css";
import CreateBM_S from "../Styles/Apps/CreateBookmarks.module.css";

export default function Bookmark_Generator(Q) {

    const [New_Bookmark, setNew_Bookmark] = useState({
        Mode: Q.Mode == 1 ? "Private" : "Public",
        Title: "",
        Shortcut: "Shortcut",
        Marks: []
    });

    //Updates title
    //t = Title
    function UpdateTitle(t) {
        let old_BM = structuredClone(New_Bookmark);
        old_BM.Title = t;
        setNew_Bookmark(old_BM);
        setNew_Bookmark(prev => ({ ...prev }));
    }

    //Updates shorcut
    //s = Shorcut
    function UpdateShortcut(s) {
        let old_BM = structuredClone(New_Bookmark);
        old_BM.Shortcut = s;
        setNew_Bookmark(old_BM);
        setNew_Bookmark(prev => ({ ...prev }));
    }

    //Adds sub bookmark if it is valid
    function AddMark() {

        let label = document.getElementById("AM_LA_ID").value;
        let link = document.getElementById("AM_LI_ID").value;

        if (label == undefined || label == null || label === "Label" || label === "") {
            alert("Invalid Label!");
        }
        else if (TurnIntoArray(structuredClone(New_Bookmark.Marks).filter(m => m.Label === label)).length > 0) {
            alert("Label Already Used!");
        }
        else if (link == undefined || link == null || link === "Link" || link === "") {
            alert("Invalid Link!");
        }
        else {

            let old_BM = structuredClone(New_Bookmark);
            old_BM.Marks.push({
                Link: link,
                Label: label
            })
            setNew_Bookmark(old_BM);
        }
    }

    //Removes sub bookmark
    //i = Label of sub bookmark
    function RemoveMark(i) {

        let old_BM = structuredClone(New_Bookmark);
        old_BM.Marks = TurnIntoArray(old_BM.Marks).filter(m => !(m.Label === i));

        setNew_Bookmark(old_BM);
        setNew_Bookmark(prev => ({ ...prev }));
    }

    //Attempts to add bookmark to database
    async function Submit_Bookmark() {

        let Active_BMs = await GetBookmarks();
        Active_BMs = Q.Mode == 1 ? Active_BMs.private : Active_BMs.public;
        let new_BM = null;

        if (New_Bookmark.Title == undefined || New_Bookmark.Title == null || New_Bookmark.Title === "Title" || New_Bookmark.Title === "") {
            alert("Invalid Title!");
        }
        else if (TurnIntoArray(Active_BMs.filter(m => m.Title === New_Bookmark.Title)).length > 0) {
            alert("Title Already Used!");
        }
        else if (New_Bookmark.Shortcut == undefined || New_Bookmark.Shortcut == null || New_Bookmark.Shortcut === "Shortcut") {
            alert("Invalid Shortcut!");
        }
        else {
            new_BM = {
                Title: New_Bookmark.Title,
                Shortcut: New_Bookmark.Shortcut === "" ? false : New_Bookmark.Shortcut,
                Marks: New_Bookmark.Marks
            };
        }

        if (new_BM != null) {
            AddBookmark(new_BM, New_Bookmark.Mode);
            alert("Bookmark " + New_Bookmark.Title + " Made! \n (Refresh Page For Changes)");
            Q.StartUpApp("Close");
        }
    }


    return (
        <div className={`${CreateBM_S.Frame} ${Q.Themes.A_F}`}>

            <div className={`${CreateBM_S.Title_Vessal} ${Q.Themes.A_D_A}`}>
                <textarea className={`${CreateBM_S.MainMark_Label} ${Q.Themes.A_T}`} id={"BM_LA_ID"} defaultValue={"Title"} onChange={(e) => UpdateTitle(e.target.value)} />
                <textarea className={`${CreateBM_S.MainMark_Link} ${Q.Themes.A_T}`} id={"BM_LI_ID"} defaultValue={"Shortcut"} onChange={(e) => UpdateShortcut(e.target.value)} />
            </div>

            <div className={`${CreateBM_S.CurrentMarks_Vessal} ${Basic_S.Chill_Scroll_Y} ${Q.Themes.A_D_B}`}>
                {New_Bookmark.Marks.map((M, index) => (
                    <div className={CreateBM_S.AddMark_Vessal} key={index}>
                        <div className={`${CreateBM_S.AddMark_Label} ${Q.Themes.A_D_A}`} >{M.Label}</div>
                        <div className={`${CreateBM_S.AddMark_Link} ${Q.Themes.A_D_C}`}>{M.Link}</div>
                        <button className={`${CreateBM_S.AddMark_Button} ${Q.Themes.A_B}`} onClick={() => RemoveMark(structuredClone(M.Label))}>X</button>
                    </div>
                ))}
            </div>

            <div className={`${CreateBM_S.AddMark_Vessal} ${Q.Themes.A_D_A}`}>
                <textarea className={`${CreateBM_S.AddMark_Label} ${CreateBM_S.AddMark_Text} ${Q.Themes.A_T}`} id={"AM_LA_ID"} defaultValue={"Label"} />
                <textarea className={`${CreateBM_S.AddMark_Link} ${CreateBM_S.AddMark_Text} ${Q.Themes.A_T}`} id={"AM_LI_ID"} defaultValue={"Link"} />
                <button className={`${CreateBM_S.AddMark_Button} ${Q.Themes.A_B}`} onClick={() => AddMark()}>+</button>
            </div>

            <div className={CreateBM_S.Submit}>
                <button className={Q.Themes.A_B} onClick={() => Submit_Bookmark()}>Create</button>
            </div>

        </div>
    );
}