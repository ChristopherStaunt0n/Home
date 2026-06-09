import { useRef, useEffect, useState } from "react";
import { GetNoteInformation, GroupJSONtoARRAY } from "../../../Backend/HandleNotes.js";
import { TurnIntoArray, Wait } from "../../../Backend/HandleGeneral.js";
import Basic_S from "../../../Styles/Basics.module.css";
import Choose_S from "../Styles/Notes/Choose.module.css";
import Writing_S from "../Styles/Notes/Writing.module.css";
import Adjustments_S from "../Styles/Notes/Adjustments.module.css";
import Recent_S from "../Styles/Notes/Recent.module.css";

//UI for chosing note to work on or make
function Choose(Q) {

    const Choose_Device = [Choose_S.Computer, Choose_S.Mobile];
    const Choose_Mode = [Choose_S.Public, Choose_S.Private];
    const Choose_View = [Choose_S.Normal, Choose_S.Full];

    const [CurrentGroup, setCurrentGroup] = useState(null);

    //Creates notification of current save status
    //C = Current note
    //S = If current changes are unsaved
    function GenerateSaveInfo(C, S) {

        let theMode = Q.Themes.RC_N_C_SB;
        let theMessage = "";

        if (C && !S) {
            theMode = Choose_S.Save_True;
            theMessage = "Changes Saved";
        }
        else if (C && S) {
            theMode = Choose_S.Save_False;
            theMessage = "Unsaved Changes";
        }

        return (
            <div className={`${Choose_S.Save_Vessal} ${theMode}`}>
                {theMessage}
            </div>
        );
    }

    //Changes the active group
    //T = Title of group to set active
    async function ChooseGroup(T) {
        setCurrentGroup(T);
        document.getElementById("DDV_ID").style.display = "none";
        await Wait(1);
        document.getElementById("DDV_ID").style.display = "flex";
    }

    //Creates the dropdown menu for picking a group of notes
    //M = Mode (public vs private)
    //N = Available notes
    function GenerateDropdownGroups(M, N) {
        if (N) {

            let theNotes = M == 0 ? N.public : N.private;
            if (theNotes.length <= 0) {
                return null;
            }
            let theGroups = [];

            for (let i = 0; i < theNotes.length; i++) {
                theGroups.push(theNotes[i].group[1]);
            }

            theGroups = [...new Set(theGroups)];
            theGroups.sort();

            return (
                <div className={Choose_S.Dropdown_Vessal} id="DDV_ID">

                    <div className={`${Choose_S.Dropdown_Title} ${Q.Themes.RC_N_C_DGT}`}>
                        Groups
                    </div>

                    <div className={`${Choose_S.GroupOption_Vessal} ${Basic_S.Chill_Scroll_Y}`}>
                        {theGroups.map((g, index) => (
                            <div key={index} className={`${Choose_S.GroupOption} ${Q.Themes.RC_N_C_DGO}`} onClick={() => ChooseGroup(g)}>
                                {g}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        else {
            return null;
        }
    }

    //Checks if note falls under provided group then returns its layer (-1 otherwise)
    //N = Note
    //G = Group
    function NotePartOfGroup(N, G) {
        let num = 1;
        while (true) {
            if (!N.group[num]) {
                return -1;
            }
            if (N.group[num] == G) {
                return num;
            }
            else {
                num++;
            }
        }
    }

    //Returns array of notes/groups based on provided group
    //A = Provided notes
    //G = Current group layer
    function GetNotesBasedOnGroupLayer(A, G) {

        let subGroups = [];
        let someNotes = [];

        for (let i = 0; i < A.length; i++) {

            let noteGroupIndex = NotePartOfGroup(A[i], G);

            if (noteGroupIndex >= 1) {//affliated
                if (A[i].group[noteGroupIndex + 1]) {//more groups
                    subGroups.push({
                        type: "group",
                        title: A[i].group[noteGroupIndex + 1]
                    });
                }
                else {//note
                    someNotes.push({
                        type: "note",
                        title: A[i].title,
                        id: A[i].id
                    });
                }
            }
        }

        let CleanedGroups = subGroups.concat(someNotes);
        let unique = [];

        for (let i = 0; i < CleanedGroups.length; i++) {
            if (!unique.some(e => e.title === CleanedGroups[i].title)) {
                unique.push(CleanedGroups[i]);
            }
        }
        return unique;
    }

    //Creates a sideways bar of availble notes based on current group
    //M = Mode (public vs private)
    //N = Available notes
    //G = Current group
    function GenerateSideBarNotes(M, N, G) {
        if (G && N) {

            let theNotes = M == 0 ? N.public : N.private;
            if (theNotes.length <= 0) {
                return null;
            }
            let pile = GetNotesBasedOnGroupLayer(theNotes, G);//notes & groups>more(notes/groups)
            pile = TurnIntoArray(pile);

            if (!pile || pile.length == 0) {
                return (
                    <div className={`${Choose_S.SideBar_Vessal} ${Q.Themes.RC_N_C_DCB}`}></div>
                );
            }

            return (
                <div className={`${Choose_S.SideBar_Vessal} ${Basic_S.Chill_Scroll_Y} ${Q.Themes.RC_N_C_DCB}`}>
                    {pile.map((n, index) => (
                        <div key={index}
                            className={`${n.type == "group" ? Choose_S.GroupChoice : Choose_S.NoteChoice} ${Q.Themes.RC_N_C_DCH}`}
                            onClick={() => { n.type == "group" ? setCurrentGroup(n.title) : Q.ChangeCurrentNote(M, n.id) }}>
                            {n.title}
                        </div>
                    ))}
                </div>
            );
        }
        else {
            return (
                <div className={`${Choose_S.SideBar_Vessal} ${Q.Themes.RC_N_C_DCB}`}></div>
            );
        }
    }

    return (
        <div className={`${Choose_Device[Q.Device]} ${Choose_Mode[Q.Mode]} ${Choose_View[Q.ViewMode == "Full" ? 1 : 0]} ${Q.Themes.RC_N_C_F}`}>
            {GenerateSaveInfo(Q.CurrentNote, Q.Unsaved)}
            {GenerateDropdownGroups(Q.Mode, Q.Notes)}
            {GenerateSideBarNotes(Q.Mode, Q.Notes, CurrentGroup)}
            <button className={`${Choose_S.CreateNote} ${Q.Themes.RC_N_C_CN}`} onClick={() => Q.ShowPopUp("Create")}>New Note</button>
        </div>
    );
}

//Text area for typing note
function Writing(Q) {

    const Writing_Device = [Writing_S.Computer, Writing_S.Mobile];
    const Writing_Mode = [Writing_S.Public, Writing_S.Private];
    const Writing_View = [Writing_S.Normal, Writing_S.Full];

    //Updates writing for current note
    //T = Content to update with
    //W = What to update (title or text)
    function ApplyWritingChanges(T, W) {
        if (Q.CurrentNote) {
            if (W == "Title") {
                Q.UpdateCurrentNoteTitle(T);
            }
            else if (W == "Text") {
                Q.UpdateCurrentNoteText(T);
            }
            else {
                console.log("Error: Could not figure out what part of note to update");
            }
        }
    }


    //Extracts title from current note
    //C = Current note
    function GetNoteTitle(C) {
        if (C) {
            return C.title;
        }
        else {
            return "";
        }
    }

    //Extracts text from current note
    //C = Current note
    function GetNoteText(C) {
        if (C) {
            return C.message;
        }
        else {
            return "";
        }
    }

    return (
        <div className={`${Writing_Device[Q.Device]} ${Writing_Mode[Q.Mode]} ${Writing_View[Q.ViewMode == "Full" ? 1 : 0]} ${Q.Themes.RC_N_W_B}`}>

            <textarea className={`${Writing_S.Title} ${Basic_S.Chill_Scroll_Y} ${Q.Themes.RC_N_W_T}`} value={GetNoteTitle(Q.CurrentNote)}
                onChange={(e) => ApplyWritingChanges(e.target.value, "Title")} />

            <div className={Writing_S.Essay_Vessal}>
                <textarea className={`${Writing_S.Essay} ${Basic_S.Chill_Scroll_Y}`} value={GetNoteText(Q.CurrentNote)}
                    onChange={(e) => ApplyWritingChanges(e.target.value, "Text")} />
            </div>

        </div>
    );
}

//Applys changes/styles/settings to current note/etc
function Adjustments(Q) {

    const Adjustments_Device = [Adjustments_S.Computer, Adjustments_S.Mobile];
    const Adjustments_Mode = [Adjustments_S.Public, Adjustments_S.Private];
    const Adjustments_View = [Adjustments_S.Normal, Adjustments_S.Full];

    //
    function GetFontColor() {
        return "blue";
    }

    //
    function GetHighlightColor() {
        return "green";
    }

    //Deletes current after confirmation
    function DeleteCurrentNote() {
        if (Q.CurrentNote) {
            Q.ShowPopUp("Delete");
        }
        else {
            console.log("Error: No note to delete");
        }
    }

    return (
        <div className={`${Adjustments_Device[Q.Device]} ${Adjustments_Mode[Q.Mode]} ${Adjustments_View[Q.ViewMode == "Normal" ? 0 : 1]} ${Q.Themes.RC_N_A_UI}`}>
            <div className={Adjustments_S.Styling}>
                <button>
                    <b>B</b>
                </button>
                <button>
                    <i>I</i>
                </button>
                <button className={Basic_S.Underline}>
                    U
                </button>
                <button style={{ color: GetFontColor() }}>
                    <b>F</b>
                </button>
                <button style={{ background: GetHighlightColor() }}>
                    F
                </button>
            </div>
            <div className={Adjustments_S.Fonts}>
                Sample Font
            </div>
            <div className={Adjustments_S.Alignment}>
                <button>
                    Left
                </button>
                <button>
                    Center
                </button>
                <button>
                    Right
                </button>
            </div>
            <div className={Adjustments_S.Options}>
                <button onClick={() => Q.SaveCN_Refresh()}>
                    Save
                </button>
                <button onClick={() => Q.setViewMode(Q.ViewMode == "Full" ? "Normal" : "Full")}>
                    {Q.ViewMode == "Full" ? "Min" : "Full"}
                </button>
                <button onClick={() => DeleteCurrentNote()}>
                    Delete
                </button>
            </div>
        </div>
    );
}

//Shows recently viewed notes
function Recent(Q) {

    const Recent_Device = [Recent_S.Computer, Recent_S.Mobile];
    const Recent_Mode = [Recent_S.Public, Recent_S.Private];
    const Recent_View = [Recent_S.Normal, Recent_S.Full];

    const [theMode, settheMode] = useState("Recent");

    //Returns note ids matching current mode
    //M = Mode (public vs private)
    //R = Array of recent note ids
    function GetRecentNotesBasedOnMode(M, R) {
        if (R && R.length > 0) {

            let theNotes = M == 0 ? Q.Notes.public : Q.Notes.private;
            let theIDS = [];
            let theRecent = [];

            for (let i = 0; i < theNotes.length; i++) {
                theIDS.push(theNotes[i].id);
            }

            for (let i = 0; i < R.length; i++) {
                if (theIDS.includes(R[i])) {
                    theRecent.push(R[i]);
                }
            }

            return theRecent;
        }
        else {
            return [];
        }
    }

    //Returns note bookmarks matching current mode
    //M = Mode (public vs private)
    //B = Array of bookmarked note ids
    function GetBookmarksBasedOnMode(M, B) {
        if (B && B.length > 0) {

            let theNotes = M == 0 ? Q.Notes.public : Q.Notes.private;
            let theIDS = [];
            let theBookmark = [];

            for (let i = 0; i < theNotes.length; i++) {
                theIDS.push(theNotes[i].id);
            }

            for (let i = 0; i < B.length; i++) {
                if (theIDS.includes(B[i])) {
                    theBookmark.push(B[i]);
                }
            }

            return theBookmark;
        }
        else {
            return [];
        }
    }

    //Displays recent or bookmarked notes depending on the mode
    //M = Mode (public vs private)
    //T = theMode
    //R = Array of recent note ids
    //B = Array of bookmarked note ids
    function DisplayNotes(M, T, R, B) {

        let emptyDiv = <div className={Recent_S.DisplayVessal}></div>;

        if (T && R && B) {
            if (T == "Recent") {
                return (
                    <div className={`${Recent_S.DisplayVessal} ${Basic_S.Chill_Scroll_Y}`}>
                        {GetRecentNotesBasedOnMode(M, R).map((i, index) => (
                            <div key={index} className={Recent_S.PastNote}>
                                <div className={Recent_S.Title_Buffer}></div>
                                <div className={Recent_S.Title} onClick={() => Q.ChangeCurrentNote(Q.Mode, i)}>
                                    {GetNoteInformation(Q.Notes, i).title}{" => "}
                                    {GroupJSONtoARRAY(GetNoteInformation(Q.Notes, i).group).map((r) => (
                                        "/" + r[0]
                                    ))}
                                </div>
                                {!GetBookmarksBasedOnMode(M, B).includes(i) ?
                                    <button onClick={() => Q.AddBookmarkID(i)} className={Basic_S.Blue_Hover}>
                                        B
                                    </button>
                                    :
                                    <div className={Recent_S.BlankButton}></div>
                                }
                                <button onClick={() => Q.RemoveRecentID(i)} className={Basic_S.Red_Hover}>
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                );
            }
            else if (T == "Bookmark") {
                return (
                    <div className={`${Recent_S.DisplayVessal} ${Basic_S.Chill_Scroll_Y}`}>
                        {GetBookmarksBasedOnMode(M, B).map((i, index) => (
                            <div key={index} className={Recent_S.aBookmark}>

                                <div className={Recent_S.Title_Buffer}></div>

                                <div className={Recent_S.Title} onClick={() => Q.ChangeCurrentNote(Q.Mode, i)}>
                                    {GetNoteInformation(Q.Notes, i).title}{" => "}
                                    {GroupJSONtoARRAY(GetNoteInformation(Q.Notes, i).group).map((r) => (
                                        "/" + r[0]
                                    ))}
                                </div>

                                <button onClick={() => Q.RemoveBookmarkID(i)} className={Basic_S.Red_Hover}>
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                );
            }
            else {
                return emptyDiv;
            }
        }
        else {
            return emptyDiv;
        }
    }

    return (
        <div className={`${Recent_Device[Q.Device]} ${Recent_Mode[Q.Mode]} ${Recent_View[Q.ViewMode == "Normal" ? 0 : 1]} ${Q.Themes.RC_N_R_M}`}>

            {DisplayNotes(Q.Mode, theMode, Q.RecentNoteIDs, Q.BookmarkNoteIDs)}

            <div className={`${Recent_S.Switch} ${Q.Themes.RC_N_R_SB}`}>
                <button onClick={() => settheMode("Recent")} className={theMode == "Recent" ? Recent_S.ModeActive : Recent_S.ModeInactive}>
                    Recent
                </button>
                <button onClick={() => settheMode("Bookmark")} className={theMode == "Bookmark" ? Recent_S.ModeActive : Recent_S.ModeInactive}>
                    Bookmark
                </button>
            </div>

        </div>
    );
}

export { Choose, Adjustments, Recent, Writing };