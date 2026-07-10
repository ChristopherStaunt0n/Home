import { useState, useEffect, useRef } from 'react';
import { GetBookmarks, DeleteBookmark } from "../../../Backend/HandleBookmarks.js";
import { GeneralConfirm } from "../../Body/UI/PopUps.jsx";
import Basic_S from "../../../Styles/Basics.module.css";
import DeleteBM_S from "../Styles/Apps/DeleteBookmarks.module.css";

export default function Bookmark_Deletor(Q) {

    const [AV_BM, setAV_BM] = useState([]);
    const [PopUp, setPopUp] = useState([]);

    //Loads available bookmarks
    useEffect(() => {
        let fetchData = async () => {
            let data = await GetBookmarks();
            setAV_BM(Q.Mode == 1 ? data.private : data.public);
        };
        fetchData();
    }, []);

    //Sends delete request to backend for bookmark
    //T = Bookmark title
    //M = Mode (public vs private)
    async function Remove_BM(T, M) {
        await DeleteBookmark(T, M);
        let data = await GetBookmarks();
        setAV_BM(Q.Mode == 1 ? data.private : data.public);
    }

    //Closes popup
    function ClosePopUp() {
        setPopUp(null);
    }

    return (
        <div className={`${DeleteBM_S.Frame} ${Basic_S.Chill_Scroll_Y} ${Q.Themes.A_F}`}>

            {AV_BM.map((M, index) => (
                <div className={DeleteBM_S.BM} key={index}>
                    <div className={`${DeleteBM_S.Title} ${Q.Themes.A_D_C}`} >{M.Title}</div>
                    <button className={`${DeleteBM_S.Delete} ${Q.Themes.A_B}`} onClick={() =>
                        setPopUp(
                            <GeneralConfirm Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes}
                                Message={"Are you sure you want to delete \n" + M.Title + "?"}
                                ChoiceA={"Yes"} FunctionA={() => Remove_BM(M.Title, Q.Mode)}
                                ChoiceB={"No"} FunctionB={() => null}
                                Close={() => ClosePopUp()}
                            />)
                    }>
                        X
                    </button>
                </div>
            ))}

            {PopUp}

        </div>
    );
} 