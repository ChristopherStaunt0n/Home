import { useRef, useEffect, useState } from "react";
import { Customizable_Table, Create_Table, Create_Row, Get_Table, Get_All_Tables, Get_Row, Get_All_Rows, Update_Table, Update_Row, Delete_Table, Delete_Row } from "../../../Backend/DatabaseConnection.js";
import { RC, RS } from "../../../Backend/HandleReact.js";
import { DropMenu, DropSelect } from "../../Misc/TemplateUI.jsx";
import { Exists_String } from "../../../Backend/HandleGeneral.js";
import { GeneralConfirm } from "../../Body/UI/PopUps.jsx";
import Basic_S from "../../../Styles/Basics.module.css";
import DBT_S from "../Styles/Apps/DatabaseTemplate/DataWarehouse.module.css";
import Choice_S from "../Styles/Apps/DatabaseTemplate/Choices.module.css";
import CNDB_S from "../Styles/Apps/DatabaseTemplate/CreateNewDatabase.module.css";
import CIP_S from "../Styles/Apps/DatabaseTemplate/Column_IndexProperty.module.css"
import CD_S from "../Styles/Apps/DatabaseTemplate/Column_Default.module.css";

//A database (table) manager
function DataWarehouse(Q) {

    const Signals = useRef(null);
    const Unsaved = useRef(false);

    const Database_Labels = useRef({
        public: [],
        private: []
    });
    const [Body, setBody] = useState(null);

    //
    useEffect(() => {
        if (RC(Signals) == null) {
            RS(Signals, {
                mode: structuredClone(Q.Mode),
                interval: structuredClone(Q.IntervalWarning)
            });
            (async () => {
                // get available database labels
                // let S = {
                //     title: "TestDB",
                //     mode: 0,
                //     columns: [
                //         // { label: "", type: "", limit: null, unsigned: false, zerofill: false, allownull: false, default: false }
                //         { label: "RowA", type: "", limit: null, unsigned: false, zerofill: false, allownull: false, default: false }
                //     ],
                //     primary: false,
                //     unique: false,
                //     index: false
                // };
                // Create_Table(S);
                await UpdateKnownTableLabel();
            })();
            // UpdateDatabaseSelection();
            DatabaseSelect("Default");
        }
        else if (RC(Signals).mode != Q.Mode) {
            RC(Signals).mode = structuredClone(Q.Mode);
        }
        else if (RC(Signals).interval != Q.IntervalWarning) {
            RC(Signals).interval = structuredClone(Q.IntervalWarning);
            (async () => {
                await SaveChanges();
            })();
        }

        if (RC(Unsaved) == true) {
            Q.Warn_UnsavedElse();
        }
    }, [Q.Mode, Q.IntervalWarning]);

    //Saves changes if present
    // async function SaveChanges() {
    //     if (RC(Unsaved)) {
    //         //
    //         RS(Unsaved, false);
    //         console.log("Database: Autosaved changes");
    //     }
    //     else {
    //         console.log("Database: No changes to save");
    //     }
    // }

    //Updates known tables
    async function UpdateKnownTableLabel() {
        let knownTables = await Get_All_Tables();
        let newDBL = {
            public: [],
            private: []
        };
        for (let i = 0; i < knownTables.length; i++) {
            if (await Customizable_Table(knownTables[i])) {
                if (knownTables[i].includes("public_")) {
                    newDBL.public.push(knownTables[i]);
                }
                else if (knownTables[i].includes("private_")) {
                    newDBL.private.push(knownTables[i]);
                }
                else {
                    console.warn("Warning: Detected unaffiliated table '" + knownTables[i] + "'?");
                }
            }
        }
        RS(Database_Labels, newDBL);
    }

    //Sets up the ui based on the selected database or objective
    //D = Database label to select
    function DatabaseSelect(D) {
        if (D === "Default") {
            setBody(<Choices Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} Database_Labels={RC(Database_Labels)} DatabaseSelect={DatabaseSelect} />);
        }
        else if (D === "CreateNewDB") {
            setBody(<CreateNewDatabaseUI Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} Database_Labels={RC(Database_Labels)} DatabaseSelect={DatabaseSelect} />);
        }
        else if (Exists_String(D)) {
            let mLabels = Q.Mode == 0 ? RC(Database_Labels).public : RC(Database_Labels).private;
            if (mLabels.includes(D)) {
                setBody(<EditDatabaseUI Mode={Q.Mode} Device={Q.Device} Themes={Q.Themes} Database_Labels={RC(Database_Labels)} Database_Label={D} />);
            }
            else {
                throw new Error("Error: Database '" + D + "' does not exist!");
            }
        }
        else {
            throw new Error("Error: Could not determine what to do with databases!");
        }
    }

    return (
        <div className={DBT_S.Frame}>
            {Body}
        </div>
    );
}

//UI for deciding what to do about databases (tables)
function Choices(Q) {

    const [Choice, setChoice] = useState(null);

    //Sets up default ui
    useEffect(() => {
        MakeChoice("Default");
    }, []);

    //Changes ui based on choice
    //C = Choice
    function MakeChoice(C) {
        if (C === "Default") {
            setChoice(
                <div className={Choice_S.UI_Vessal}>
                    <button onClick={() => MakeChoice("Create")}>Create</button>
                    <button onClick={() => MakeChoice("Edit")}>Edit</button>
                    <button onClick={() => MakeChoice("Manage")}>Manage</button>
                </div>
            );
        }
        else if (C === "Manage") {
            let currentLabels = Q.Mode == 0 ? Q.Database_Labels.public : Database_Labels.private;
            setChoice(
                <div className={`${Choice_S.UI_Vessal} ${Basic_S.Chill_Scroll_Y}`}>
                    {currentLabels.map((L, index) => (
                        <button key={index} onClick={() => Q.DatabaseSelect(L)}>
                            {L}
                        </button>
                    ))}
                    <button onClick={() => MakeChoice("Default")}>Return</button>
                </div>
            );
        }
        else if (C === "Create") {
            Q.DatabaseSelect("CreateNewDB");
        }
        else {
            Q.DatabaseSelect(C);
        }
    }

    return (
        <div className={Choice_S.Frame}>
            {Choice}
        </div>
    );
}

//UI for creating a new database (table)
function CreateNewDatabaseUI(Q) {

    const Title = useRef("Database Title");
    const [Cols, setCols] = useState([]);
    const Columns = useRef([]);
    const DataTypes = ["INT", "Double", "VARCHAR"];
    const [PopUp, setPopUp] = useState(null);

    //Adds a new table column
    function CreateNewCol() {
        let defaultIndex = "Normal";
        let defaultName = "Name";
        let defaultType = DataTypes[0];
        let defaultLengthSet = 5;
        let defaultUnsigned = false;
        let defaultAllowNull = true;
        let defaultZerofill = false;
        let newCol_ID = 0;
        while (true) {
            if (!RC(Columns).some(c => c.id == newCol_ID)) {
                let newCol = {
                    id: newCol_ID,
                    index: defaultIndex,
                    name: defaultName,
                    type: defaultType,
                    lengthSet: defaultLengthSet,
                    unsigned: defaultUnsigned,
                    allowNull: defaultAllowNull,
                    zerofill: defaultZerofill,
                    default: null
                };
                RS(Columns, RC(Columns).concat([newCol]));
                break;
            }
            else {
                newCol_ID++;
            }
        }
        let odd = (Cols.length + 1) % 2 !== 0;
        setCols(prev => [
            ...prev,
            <div className={`${CNDB_S.Row_B} ${odd ? CNDB_S.OffColorRow : null}`} key={"Col_" + newCol_ID} id={"ColumnID_" + newCol_ID}>
                <div className={CNDB_S.Columns_Property}>
                    <Column_IndexProperty ID={newCol_ID} CheckPrimaryIndexActive={CheckPrimaryIndexActive} DefaultValue={null} UpdateColumn={UpdateColumn} />
                </div>
                <div className={CNDB_S.Columns_Name}>
                    <textarea className={`${CNDB_S.Columns_TextAreas} ${Basic_S.Chill_Scroll_Y}`}
                        onChange={(e) => UpdateColumn(newCol_ID, "Name", e.target.value)} defaultValue={defaultName} />
                </div>
                <div className={CNDB_S.Columns_Datatype}>
                    <DropSelect CSS_Frame={CNDB_S.DropSelectFrame} CSS_Option={CNDB_S.DropSelectOption} CSS_Theme_Frame={null} CSS_Theme_Option={null} Z={3}
                        Options={DataTypes} DefaultValue={defaultType} Sender={UpdateColumn_Datatype} ID={newCol_ID} />
                </div>
                <div className={CNDB_S.Columns_LengthSet}>
                    <textarea className={`${CNDB_S.Columns_TextAreas} ${Basic_S.Chill_Scroll_Y}`}
                        onChange={(e) => UpdateColumn(newCol_ID, "LengthSet", e.target.value)} defaultValue={defaultLengthSet} />
                </div>
                <div className={`${CNDB_S.Columns_Unsigned} ${Basic_S.Center}`}>
                    <input
                        type="checkbox"
                        id={"unsigned_" + newCol_ID}
                        defaultChecked={defaultUnsigned}
                        onChange={(e) => UpdateColumn(newCol_ID, "Unsigned", e.target.value)}
                        className={CNDB_S.Columns_Checkbox}
                    />
                </div>
                <div className={`${CNDB_S.Columns_AllowNull} ${Basic_S.Center}`}>
                    <input
                        type="checkbox"
                        id={"allowNull_" + newCol_ID}
                        defaultChecked={defaultAllowNull}
                        onChange={(e) => UpdateColumn(newCol_ID, "AllowNull", e.target.value)}
                        className={CNDB_S.Columns_Checkbox}
                    />
                </div>
                <div className={`${CNDB_S.Columns_Zerofill} ${Basic_S.Center}`}>
                    <input
                        type="checkbox"
                        id={"zerofill_" + newCol_ID}
                        defaultChecked={defaultZerofill}
                        onChange={(e) => UpdateColumn(newCol_ID, "Zerofill", e.target.value)}
                        className={CNDB_S.Columns_Checkbox}
                    />
                </div>
                <div className={CNDB_S.Columns_Default}>
                    <Column_Default ID={newCol_ID} UpdateColumn={UpdateColumn} Default={null} />
                </div>
                <div className={`${CNDB_S.Columns_Delete} ${Basic_S.Center}`}>
                    <button onClick={() => DeleteCol(newCol_ID)}>Delete</button>
                </div>
            </div>
        ]);
    }

    //Updates alternating row color (for readability)
    function UpdateRowColor() {
        let refreshedCols = [];
        for (let i = 0; i < RC(Columns).length; i++) {
            let defaultIndex = RC(Columns)[i].index;
            let defaultName = RC(Columns)[i].name;
            let defaultType = RC(Columns)[i].type;
            let defaultLengthSet = RC(Columns)[i].lengthSet;
            let defaultUnsigned = RC(Columns)[i].unsigned;
            let defaultAllowNull = RC(Columns)[i].allowNull;
            let defaultZerofill = RC(Columns)[i].zerofill;
            let defaultDefault = RC(Columns)[i].default;
            let newCol_ID = RC(Columns)[i].id;
            let odd = (refreshedCols.length + 1) % 2 !== 0;
            refreshedCols.push(
                <div className={`${CNDB_S.Row_B} ${odd ? CNDB_S.OffColorRow : null}`} key={"Col_" + newCol_ID} id={"ColumnID_" + newCol_ID}>
                    <div className={CNDB_S.Columns_Property}>
                        <Column_IndexProperty ID={newCol_ID} CheckPrimaryIndexActive={CheckPrimaryIndexActive} DefaultValue={defaultIndex} UpdateColumn={UpdateColumn} />
                    </div>
                    <div className={CNDB_S.Columns_Name}>
                        <textarea className={`${CNDB_S.Columns_TextAreas} ${Basic_S.Chill_Scroll_Y}`}
                            onChange={(e) => UpdateColumn(newCol_ID, "Name", e.target.value)} defaultValue={defaultName} />
                    </div>
                    <div className={CNDB_S.Columns_Datatype}>
                        <DropSelect CSS_Frame={CNDB_S.DropSelectFrame} CSS_Option={CNDB_S.DropSelectOption} CSS_Theme_Frame={null} CSS_Theme_Option={null} Z={3}
                            Options={DataTypes} DefaultValue={defaultType} Sender={UpdateColumn_Datatype} ID={newCol_ID} />
                    </div>
                    <div className={CNDB_S.Columns_LengthSet}>
                        <textarea className={`${CNDB_S.Columns_TextAreas} ${Basic_S.Chill_Scroll_Y}`}
                            onChange={(e) => UpdateColumn(newCol_ID, "LengthSet", e.target.value)} defaultValue={defaultLengthSet} />
                    </div>
                    <div className={`${CNDB_S.Columns_Unsigned} ${Basic_S.Center}`}>
                        <input
                            type="checkbox"
                            id={"unsigned_" + newCol_ID}
                            defaultChecked={defaultUnsigned}
                            onChange={(e) => UpdateColumn(newCol_ID, "Unsigned", e.target.value)}
                            className={CNDB_S.Columns_Checkbox}
                        />
                    </div>
                    <div className={`${CNDB_S.Columns_AllowNull} ${Basic_S.Center}`}>
                        <input
                            type="checkbox"
                            id={"allowNull_" + newCol_ID}
                            defaultChecked={defaultAllowNull}
                            onChange={(e) => UpdateColumn(newCol_ID, "AllowNull", e.target.value)}
                            className={CNDB_S.Columns_Checkbox}
                        />
                    </div>
                    <div className={`${CNDB_S.Columns_Zerofill} ${Basic_S.Center}`}>
                        <input
                            type="checkbox"
                            id={"zerofill_" + newCol_ID}
                            defaultChecked={defaultZerofill}
                            onChange={(e) => UpdateColumn(newCol_ID, "Zerofill", e.target.value)}
                            className={CNDB_S.Columns_Checkbox}
                        />
                    </div>
                    <div className={CNDB_S.Columns_Default}>
                        <Column_Default ID={newCol_ID} UpdateColumn={UpdateColumn} Default={defaultDefault} />
                    </div>
                    <div className={`${CNDB_S.Columns_Delete} ${Basic_S.Center}`}>
                        <button onClick={() => DeleteCol(newCol_ID)}>Delete</button>
                    </div>
                </div>
            );
        }
        setCols(refreshedCols);
    }

    //Checks if any of the current columns have an index set to primary
    function CheckPrimaryIndexActive() {
        let primaryUsed = false;
        for (let i = 0; i < RC(Columns).length; i++) {
            if (RC(Columns)[i].index === "Primary") {
                primaryUsed = true;
                break;
            }
        }
        return primaryUsed;
    }

    //Prep function for updating a column's datatype
    //O = Datatype option
    //I = Column id
    function UpdateColumn_Datatype(O, I) {
        UpdateColumn(I, "DataTypes", O);
    }

    //Updates part of specified column
    //I = Column's id
    //T = Which data value to replace
    //V = Value to replace with
    function UpdateColumn(I, T, V) {
        let index = 0;
        while (true) {
            if (RC(Columns)[index].id == I) {
                break;
            }
            else if (RC(Columns).length <= index) {
                throw new Error("Error: Could not find column matching id '" + I + "'!");
            }
            else {
                index++;
            }
        }
        let old_Columns = structuredClone(RC(Columns));
        if (T === "Index") {
            old_Columns[index].index = V;
        }
        else if (T === "Name") {
            old_Columns[index].name = V;
        }
        else if (T === "DataTypes") {
            old_Columns[index].types = V;
        }
        else if (T === "LengthSet") {
            old_Columns[index].lengthSet = V;
        }
        else if (T === "Unsigned") {
            old_Columns[index].unsigned = V;
        }
        else if (T === "AllowNull") {
            old_Columns[index].allowNull = V;
        }
        else if (T === "Zerofill") {
            old_Columns[index].zerofill = V;
        }
        else if (T === "Default") {
            old_Columns[index].default = V;
        }
        else {
            throw new Error("Error: Failed to properly use parameter T: '" + T + "'!");
        }
        RS(Columns, old_Columns);
    }

    //Deletes column (row?)
    //I = ID of column
    function DeleteCol(I) {
        for (let i = 0; i < RC(Columns).length; i++) {
            if (RC(Columns)[i].id == I) {
                RS(Columns, RC(Columns).toSpliced(i, 1));
                setCols(current => current.toSpliced(i, 1));
                if (i != RC(Columns).length - 1) {
                    UpdateRowColor();
                }
                break;
            }
        }
    }

    //Empties all columns
    function ResetColumns() {
        setCols([]);
        RS(Columns, []);
    }

    //Exits creation menu back to choice menu
    function CancelCreation() {
        Q.DatabaseSelect("Default")
    }

    //Attempts to create new database
    async function AttemptDatabaseCreation() {
        let PrexistingLabels = Q.Mode == 0 ? Q.Database_Labels.public : Q.Database_Labels.private;
        let listOfColNames = [];
        for (let i = 0; i < RC(Columns).length; i++) {
            listOfColNames.push(RC(Columns)[i].name);
        }
        if (RC(Title) === undefined || RC(Title) === "" || RC(Title) === null || RC(Title) === "Database Title" || !Customizable_Table(RC(Title)) || PrexistingLabels.includes(RC(Title))) {
            alert("Invalid Title!");
        }
        else if (new Set(listOfColNames).size !== listOfColNames.length) {
            alert("Duplicate column names detected!");
        }
        else {
            let data = {
                title: RC(Title),
                mode: Q.Mode,
                columns: [],
                PrimaryIndexes: [],
                UniqueIndexes: []
            };
            for (let i = 0; i < RC(Columns).length; i++) {
                let aCol = RC(Columns)[i];
                if (aCol.index === "Primary") {
                    data.PrimaryIndexes.push(aCol.name);
                }
                else if (aCol.index === "Unique") {
                    data.UniqueIndexes.push(aCol.name);
                }
                // ["None", "Custom", "Null"]
                // ["No default, "", NULL]
                let aDefault = "";
                if (aCol.index === "Primary" && aCol.default === "Null") {
                    aDefault = "No default";
                }
                else if (aCol.default === "Null") {
                    aDefault = "NULL";
                }
                else {
                    aDefault = aCol.default;
                }
                let C = {
                    label: aCol.name,
                    type: aCol.type,
                    limit: aCol.lengthSet,
                    unsigned: aCol.type === "VARCHAR" ? false : aCol.unsigned,
                    allownull: aCol.index === "Primary" ? false : aCol.allowNull,
                    zerofill: aCol.type === "VARCHAR" ? false : aCol.zerofill,
                    default: aDefault
                };
                data.columns.push(C);
            }
            Create_Table(data);
        }
    }

    //Closes pop up
    function ClosePopUp() {
        setPopUp(null);
    }


    //Sets up intended pop up
    //P = Which pop up
    function SetUpPopUp(P) {
        switch (P) {
            case "ColReset":
                setPopUp(<GeneralConfirm Message={"Are you sure you want to erase active columns?"} Size={"Fit"}
                    ChoiceA={"Yes"} FunctionA={ResetColumns} ChoiceB={"No"} FunctionB={null}
                    Close={ClosePopUp} />);
                break;
            case "Cancel":
                setPopUp(<GeneralConfirm Message={"Are you sure you want to cancel creating this database?"} Size={"Fit"}
                    ChoiceA={"Yes"} FunctionA={CancelCreation} ChoiceB={"No"} FunctionB={null}
                    Close={ClosePopUp} />);
                break;
            case "Create":
                setPopUp(<GeneralConfirm Message={"Are you sure you want to create this database?"} Size={"Fit"}
                    ChoiceA={"Yes"} FunctionA={AttemptDatabaseCreation} ChoiceB={"No"} FunctionB={null}
                    Close={ClosePopUp} />);
                break;
            default:
                ClosePopUp();
        }
    }

    return (
        <div className={CNDB_S.Frame}>
            {PopUp}
            <div className={CNDB_S.Options}>
                <button onClick={() => SetUpPopUp("ColReset")} className={Basic_S.Red_Hover}>Reset Rows</button>
                <button className={Basic_S.Red_Hover} onClick={() => SetUpPopUp("Cancel")}>Cancel Creation</button>
                <textarea className={CNDB_S.Options_Title} defaultValue={RC(Title)} onChange={(e) => RS(Title, e.target.value)} />
                <button className={Basic_S.Green_Hover} onClick={() => SetUpPopUp("Create")}>Create Database</button>
                <button onClick={() => CreateNewCol()} className={Basic_S.Blue_Hover}>Add Column</button>
            </div>

            <div className={CNDB_S.Row_A}>
                <div className={`${CNDB_S.Columns_Property} ${CNDB_S.Columns_Label_Center}`}>
                    Index
                </div>
                <div className={`${CNDB_S.Columns_Name} ${CNDB_S.Columns_Label_Center}`}>
                    Column Name
                </div>
                <div className={`${CNDB_S.Columns_Datatype} ${CNDB_S.Columns_Label_Center}`}>
                    Datatype
                </div>
                <div className={`${CNDB_S.Columns_LengthSet} ${CNDB_S.Columns_Label_Center}`}>
                    Length/Set
                </div>
                <div className={`${CNDB_S.Columns_Unsigned} ${CNDB_S.Columns_Label_Center}`}>
                    Unsigned
                </div>
                <div className={`${CNDB_S.Columns_AllowNull} ${CNDB_S.Columns_Label_Center}`}>
                    Allow Null
                </div>
                <div className={`${CNDB_S.Columns_Zerofill} ${CNDB_S.Columns_Label_Center}`}>
                    Zerofill
                </div>
                <div className={`${CNDB_S.Columns_Default} ${CNDB_S.Columns_Label_Center}`}>
                    Default
                </div>
                <div className={CNDB_S.Columns_Delete} />
            </div>

            <div className={CNDB_S.Columns}>
                <div className={`${Basic_S.Chill_Scroll_Y} ${CNDB_S.Columns_Inner}`}>
                    {Cols.concat([<div key={-1} style={{ width: "100%", height: "50%" }} />])}
                </div>
            </div>

        </div>
    );
}

//Button for toggling index property of a column
function Column_IndexProperty(Q) {

    const [Label, setLabel] = useState(Q.DefaultValue == null || Q.DefaultValue == undefined ? "Normal" : Q.DefaultValue);
    const Options = ["Normal", "Primary", "Unique"];

    //Handles click of button for toggling active index trait
    function Press() {
        if (Label === "Normal") {
            if (Q.CheckPrimaryIndexActive()) {
                setLabel("Unique");
                Q.UpdateColumn(Q.ID, "Index", "Unique");
            }
            else {
                setLabel("Primary");
                Q.UpdateColumn(Q.ID, "Index", "Primary");
            }
        }
        else if (Label === "Primary") {
            setLabel("Unique");
            Q.UpdateColumn(Q.ID, "Index", "Unique");
        }
        else if (Label === "Unique") {
            Q.UpdateColumn(Q.ID, "Index", "Normal");
            setLabel("Normal");
        }
        else {
            throw new Error("Error: Failed to toggle column's index property!");
        }
    }

    return (
        <button className={CIP_S.Frame} onClick={() => Press()}>
            {Label}
        </button>
    );
}

//UI for selecting default value for a column
function Column_Default(Q) {

    const [UI, setUI] = useState(null);
    const Options = ["None", "Custom", "Null"];
    const CurrentOption = useRef(Q.Default != undefined && Q.Default != null ? Q.Default : "None");

    //Sets up default ui
    useEffect(() => {
        setUI(OptionType("Default"));
    }, []);

    //Updates current option
    //O = New option
    function SetCurrentOption(O) {
        RS(CurrentOption, O);
        if (O === "Custom") {
            setUI(OptionType(O));
        }
        Q.UpdateColumn(Q.ID, "Default", O);
    }

    //Generates ui based on input
    //T = Input string of what type of default data to use
    function OptionType(T) {
        if (T === "Default") {
            Q.UpdateColumn(Q.ID, "Default", null);
            return (
                <DropSelect CSS_Frame={CD_S.DropSelectFrame} CSS_Option={CD_S.DropSelectOption} CSS_Theme_Frame={null} CSS_Theme_Option={null}
                    Options={Options} DefaultValue={Options[0]} Sender={SetCurrentOption} />
            );
        }
        else if (T === "Custom") {
            Q.UpdateColumn(Q.ID, "Default", "");
            return (
                <div className={CD_S.Frame_Vessal}>
                    <textarea className={CD_S.Text} defaultValue={"Custom"} onChange={(e) => Q.UpdateColumn(Q.ID, "Default", e.target.value)} />
                    <button onClick={() => setUI(OptionType("Default"))}>
                        X
                    </button>
                </div>
            );
        }
        else {
            throw new Error("Error: Could not determine what which default type to setup ui for!");
        }
    }

    return (
        <div className={CD_S.Frame}>
            {UI}
        </div>
    );
}

function EditDatabaseUI(Q) {
    //
}

export { DataWarehouse };