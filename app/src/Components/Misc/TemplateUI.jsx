import { useRef, useEffect, useState } from "react";
import DM_S from "./Styles/TemplateUI/Dropdown.module.css";
import DS_S from "./Styles/TemplateUI/DropSelect.module.css";
import FT_S from "./Styles/TemplateUI/FadingText.module.css";

//Dropdown menu template component
function DropMenu(Q) {
    return (
        <div className={`${DM_S.Frame} ${Q.CSS_Frame} ${Q.CSS_Theme_Frame}`}>
            {Q.Options.map((Option, index) => (
                <div key={index} className={`${DM_S.Option} ${Q.CSS_Option} ${Q.CSS_Theme_Option}`} onClick={() => Q.Function(Option.Value)}>
                    {Option.Label}
                </div>
            ))}
        </div>
    );
}

//Select dropdown menu template component
function DropSelect(Q) {

    const [Selected, setSelected] = useState(Q.DefaultValue);
    const [Visible, setVisible] = useState("none");
    const zBuff = Q.Z == undefined || Q.Z == null ? 0 : Q.Z;

    //Sends selected option via callback function
    //O = Option
    function Sending(O) {
        if (Q.ID == undefined) {
            Q.Sender(O);
        }
        else {
            Q.Sender(O, Q.ID);
        }
    }

    return (
        <div className={`${DS_S.Frame} ${Q.CSS_Frame} ${Q.CSS_Theme_Frame}`} style={{ zIndex: Visible === "block" ? zBuff + 100 : zBuff + 1 }}
            onMouseLeave={() => setVisible("none")}>
            <button className={DS_S.Title} style={{ zIndex: zBuff + 2 }} onClick={() => (Visible === "none" ? setVisible("block") : setVisible("none"))}>
                {Selected}
            </button>
            <div
                className={`${DS_S.Options} ${Visible === "block" ? DS_S.OptionsVisible : ""}`}
                style={{ zIndex: zBuff + 3 }}
            >
                {Q.Options.map((Option, index) => (
                    <button key={index} style={{ display: Visible }} className={`${DS_S.Option} ${Q.CSS_Option} ${Q.CSS_Theme_Option}`}
                        onClick={() => { setSelected(Option); setVisible("none"); Sending(Option); }}>
                        {Option}
                    </button>
                ))}
            </div>
        </div>
    );
}

//Creates a text that can fade to another value
function FadingText(Q) {
    return (
        <span className={FT_S.Container}>

            {Q.Active != undefined && Q.Active != null ?
                <div className={FT_S.TimeFadeBox}>
                    <span className={FT_S.TimeFadeBox_Title} style={{transition: "opacity " + Q.FadeTime + "ms ease-in-out"}}>
                        {Q.LabelA}
                    </span>
                    <span className={FT_S.TimeFadeBox_Time} style={{transition: "opacity " + Q.FadeTime + "ms ease-in-out"}}>
                        {Q.LabelB}
                    </span>
                </div>
                :
                <span className={FT_S.TimeLess}>
                    {Q.LabelA}
                </span>
            }

        </span>
    );
}

export { DropMenu, DropSelect, FadingText };