import { useRef, useEffect, useState } from "react";
import { GetFileContent } from "../../../Backend/DatabaseConnection";
import RT_S from "../Styles/ReadingText.module.css";
import Basic_S from "../../../Styles/Basics.module.css";

//Displays referenced text/md file
function ReadTextFile(Q) {

    const [Content, setContent] = useState("");

    useEffect(() => {
        if (Q.TextPathToRead != undefined && Q.TextPathToRead != null && Q.TextPathToRead != "") {
            (async () => {
                let C = await GetFileContent('', Q.TextPathToRead);
                setContent(C);
            })();
        }
        else {
            console.log("Error: Unsure what to read...");
        }
    }, []);

    return (
        <div className={`${RT_S.Vessal} ${Basic_S.Chill_Scroll_Y} ${Q.Themes.C_RTF}`}>
            <div className={RT_S.InnerVessal}>
                {Content}
            </div>
        </div>
    );
}

export { ReadTextFile };