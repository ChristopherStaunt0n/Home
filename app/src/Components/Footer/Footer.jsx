import { useState, useEffect, useRef } from 'react';
import { GetFooterHistory, SetFooterHistory } from "../../Backend/DatabaseConnection.js";
import { JPGICOAPP } from "./Apps/JPGtoICO.jsx";
import UI_S from "./Styles/UI.module.css";

export default function Foot(Q) {

    const [Recent, setRecent] = useState([]);
    const [Bookmark, setBookmark] = useState([]);

    const [ActiveApp, setActiveApp] = useState(null);

    const Recent_Limit = 5;

    const AvailableApplications = ["JPGtoICO"];

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
                return <JPGICOAPP Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} />;
            default:
                console.log("Error: Failed to open footer app!");
        }
    }

    //Creates a dropdown menu that goes upwards
    //L = Label
    //A = Array
    function CreateDropUp(L, A) {
        return (
            <div className={UI_S.DropUp}>

                <div className={UI_S.DropUp_Label}>{L}</div>

                {A.map((App_Title, index) => (
                    <div className={`${UI_S.DropUp_Option} ${Q.Themes.NB_O}`} key={index} onClick={() => StartUpApp(App_Title)}>{App_Title}</div>
                ))}
            </div>
        );
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

                <div className={UI_S.Title}>Title</div>

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