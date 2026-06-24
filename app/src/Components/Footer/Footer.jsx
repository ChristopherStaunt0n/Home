import { useState, useEffect, useRef } from 'react';
import { GetFooterHistory, SetFooterHistory } from "../../Backend/DatabaseConnection.js";
import { TurnIntoArray } from "../../Backend/HandleGeneral.js";
import { JPGICOAPP } from "./Apps/JPGtoICO.jsx";
import UI_S from "./Styles/UI.module.css";
import Basic_S from "../../Styles/Basics.module.css";

export default function Foot(Q) {

    const [Recent, setRecent] = useState(["A", "B", "C"]);
    const [Bookmark, setBookmark] = useState(["A", "B", "C"]);

    const [ActiveApp, setActiveApp] = useState(null);
    const [ActiveApp_Title, setActiveApp_Title] = useState("");

    const Recent_Limit = 5;

    const AvailableApplications = ["JPGtoICO", "Close"];

    //Sets up Recent and Bookmark
    useEffect(() => {
        let fetchData = async () => {
            let data = await GetFooterHistory();
            setRecent(data.R);
            setBookmark(data.B);
        };
        fetchData();
    }, []);

    //Starts up app
    //A = App name
    function StartUpApp(A) {
        switch (A) {
            case "JPGtoICO":
                AddToRecent(A);
                setActiveApp_Title(A)
                setActiveApp(<JPGICOAPP Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} />);
                break;
            case "Close":
                setActiveApp_Title("");
                setActiveApp(null);
                break;
            default:
                console.log("Error: Failed to open footer app!");
        }
    }

    //Adds app to top of recent
    //T = Title of app
    async function AddToRecent(T) {

        let R = TurnIntoArray(structuredClone(Recent).filter(Rs => Rs != T));
        R = TurnIntoArray([T].concat(R));

        if (R.length > Recent_Limit) {
            R = [R[0], R[1], R[2], R[3], R[4]];
        }

        setRecent(R);
        await SetFooterHistory(R, null);
    }

    //Bookmarks app
    //T = Title of app
    async function AddToBookmark(T) {

        if (Bookmark.includes(T)) {
            console.log("Error: App already bookmarked!");
        }
        else {
            let B = structuredClone(Bookmark);
            B.push(T);
            B.sort();
            setBookmark(B);
            await SetFooterHistory(null, B);
        }
    }

    //Removes app from bookmarks
    //T = Title of app
    async function RemoveFromBookmark(T) {
        let B = TurnIntoArray(structuredClone(Bookmark).filter(Bs => Bs != T));
        setBookmark(B);
        await SetFooterHistory(null, B);
    }

    //Creates a dropdown menu that goes upwards
    //L = Label
    //A = Array
    function CreateDropUp(L, A) {

        let DU_Os = null;

        if (L === "Apps") {
            DU_Os = (
                <div className={UI_S.DropUp}>

                    <div className={UI_S.DropUp_Label}>{L}</div>

                    {A.map((App_Title, index) => (
                        <div className={`${UI_S.DropUp_Option_Vessal} ${Q.Themes.NB_O}`} key={index}>
                            <div className={UI_S.DropUp_Option_A} onClick={() => StartUpApp(App_Title)}>{App_Title}</div>
                        </div>
                    ))}

                </div>
            );
        }
        else if (L === "Recent") {
            DU_Os = (
                <div className={UI_S.DropUp}>

                    <div className={UI_S.DropUp_Label}>{L}</div>

                    {A.map((App_Title, index) => (
                        <div className={UI_S.DropUp_Option_Vessal} key={index}>
                            <div className={`${UI_S.DropUp_Option_B} ${Q.Themes.NB_O}`} onClick={() => StartUpApp(App_Title)}>{App_Title}</div>
                            <div className={`${UI_S.DropUp_Option_Button} ${Q.Themes.NB_O}`} onClick={() => AddToBookmark(App_Title)}>B</div>
                        </div>
                    ))}

                </div>
            );
        }
        else if (L === "Bookmarks") {
            DU_Os = (
                <div className={UI_S.DropUp}>

                    <div className={UI_S.DropUp_Label}>{L}</div>

                    {A.map((App_Title, index) => (
                        <div className={UI_S.DropUp_Option_Vessal} key={index}>
                            <div className={`${UI_S.DropUp_Option_B} ${Q.Themes.NB_O}`} onClick={() => StartUpApp(App_Title)}>{App_Title}</div>
                            <div className={`${UI_S.DropUp_Option_Button} ${Q.Themes.NB_O}`} onClick={() => RemoveFromBookmark(App_Title)}>X</div>
                        </div>
                    ))}

                </div>
            );
        }

        return DU_Os;
    }

    return (
        <div className={Q.CN}>

            <div className={UI_S.Workshop}>
                {ActiveApp}
            </div>

            <div className={`${UI_S.Navigation} ${Q.Themes.NB}`}>

                <div className={UI_S.All_Choices}>
                    {CreateDropUp("Apps", AvailableApplications)}
                </div>

                <div className={UI_S.Title}>
                    {ActiveApp_Title}
                </div>

                <div className={UI_S.Recent_Choices}>
                    {CreateDropUp("Recent", Recent)}
                </div>

                <div className={UI_S.Bookmark_Choices}>
                    {CreateDropUp("Bookmarks", Bookmark)}
                </div>

            </div>

        </div>
    );
}