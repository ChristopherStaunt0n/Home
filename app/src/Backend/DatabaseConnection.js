'use server';
const mysql = require('mysql2/promise');
import { redirect } from 'next/navigation';
import { parse } from 'path';
import { GetAgenda, AddAgenda, ApplyAgendaUpdate, CreateNewAgenda, AgendaCheckup_RoutineID } from "./HandleAgenda.js";
import {
    GetSchedule, ApplyScheduleUpdate, AddSchedule,
    CreateNewRoutine, GetRoutineMainID, GetCurrentRoutine,
    CheckForEmptyRoutineDatabase, DeleteRoutine, DuplicateRoutine,
    AssignThisRoutine, GetAvailableRoutines
} from "./HandleRoutine.js";
import {
    GetNotes, AddNote, UpdateNote, DeleteNote,
    GetRecentGeneralNotes, UpdateRecentGeneralNotes,
    GetBookmarkGeneralNotes, UpdateBookmarkGeneralNotes
} from "./HandleNotes.js";
import { GetCurrentThemes, ChangeCurrentThemes } from "./HandleTheme.js";
import { GetScreenSaverStatus, ChangeScreenSaverStatus } from "./HandleScreenSaver.js";
import { ChangeModeToggleKeyStatus, GetModeToggleKeyStatus, GetColLock, ChangeColLock, Change_AOMT, Get_AOMT, Change_APMS, Get_APMS } from "./HandleKey.js";
import { GetBookmarks, AddBookmark, DeleteBookmark } from "./HandleBookmarks.js";
import { GetFooterHistory, SetFooterHistory } from "./HandleFooter.js";
import { File_Exist, GetFileContent } from "./HandleFiles.js";
import { TurnIntoArray, Exists_String, Convert_JSON_LabelLinks_TO_Array } from "./HandleGeneral.js";

const Non_Custom_Tables = ["agenda", "bookmarks", "notes", "ref", "routine"];

//Creates a connection to the database
const pool = mysql.createPool({
    host: process.env.Home_HOST,
    port: Number(process.env.Home_PORT),
    user: process.env.Home_USER,
    password: process.env.Home_PASS,
    database: process.env.Home_DATA,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

//Communicates with the database
async function questioning(line, params = []) {
    try {
        const [rows] = await pool.query(line, params);
        return JSON.stringify(rows);
    } catch (err) {
        console.error("Query error:", err);
        throw err;
    }
}

//Verifies that specified table is Customizable
//t = Table label
async function Customizable_Table(t) {
    if (t == undefined || t == null || t == "" || Non_Custom_Tables.includes(t)) {
        return false;
    }
    else {
        return true;
    }
}

//Creates a new table in database
//j = JSON of table structure
async function Create_Table(j) {
    let S = {
        title: "",
        mode: 0,
        columns: [
            { label: "", type: "", limit: null, unsigned: false, zerofill: false, allownull: false, default: false }
        ],
        primary: false,
        unique: false,
        index: false
    };

    //     CREATE TABLE`agenda`(
    //     `Week` DATE NOT NULL,
    //     `Public` JSON NOT NULL,
    //     `Private` JSON NOT NULL,
    //     `Sleep` JSON NOT NULL,
    //     `Schedule` INT NOT NULL DEFAULT '0',
    //     PRIMARY KEY(`Week`) USING BTREE
    // )
    //     COLLATE = 'utf8mb4_0900_ai_ci'
    //     ENGINE = InnoDB
    //         ;

    // CREATE TABLE`ex`(
    //     `Column 1` INT UNSIGNED ZEROFILL NOT NULL,
    //     `Column 2` TEXT(10) NULL DEFAULT NULL,
    //     `Column 3` TINYTEXT NULL DEFAULT 'abc',
    //     `Column 4` INT UNSIGNED ZEROFILL NULL DEFAULT NULL,
    //     PRIMARY KEY(`Column 1`),
    //     UNIQUE INDEX`Column 2`(`Column 2`),
    //     INDEX`Column 3`(`Column 3`)
    // )
    // COLLATE = 'utf8mb4_0900_ai_ci'
    //     ;

    // CREATE TABLE`test_name`(
    //     `Column 1` INT NOT NULL,
    //     `Column 2` INT NULL DEFAULT NULL,
    //     `Column 3` INT NULL DEFAULT '123',
    //     `Column 4` INT NULL DEFAULT NULL,
    //     `Column 5` DOUBLE NULL DEFAULT NULL,
    //     `Column 6` DOUBLE NULL DEFAULT '12.3',
    //     `Column 7` DOUBLE NULL DEFAULT NULL,
    //     `Column 8` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
    //     `Column 9` VARCHAR(50) NULL DEFAULT 'abc' COLLATE 'utf8mb4_0900_ai_ci',
    //     `Column 10` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
    //     PRIMARY KEY(`Column 1`) USING BTREE,
    //     UNIQUE INDEX`Column 2`(`Column 2`) USING BTREE,
    //     UNIQUE INDEX`Column 3`(`Column 3`) USING BTREE,
    //     UNIQUE INDEX`Column 4`(`Column 4`) USING BTREE,
    //     UNIQUE INDEX`Column 5`(`Column 5`) USING BTREE,
    //     UNIQUE INDEX`Column 6`(`Column 6`) USING BTREE,
    //     UNIQUE INDEX`Column 7`(`Column 7`) USING BTREE,
    //     UNIQUE INDEX`Column 8`(`Column 8`) USING BTREE,
    //     UNIQUE INDEX`Column 9`(`Column 9`) USING BTREE,
    //     UNIQUE INDEX`Column 10`(`Column 10`) USING BTREE
    // )
    // COLLATE = 'utf8mb4_0900_ai_ci'
    // ENGINE = InnoDB
    //     ;

    console.log(j);
    let mysql_code = "CREATE TABLE`" + j.title + (j.mode == 0 ? "_Public" : "_Private") + "`(";
    for (let n = 0; n < j.columns.length; n++) {
        let row = "`" + j.columns[n].label + "`";
        row += " " + j.columns[n].type + (Exists_String(j.columns[n].limit) ? "(" + j.columns[n].limit + ")" : "");
        row += (j.columns[n].unsigned ? " UNSIGNED" : "");
        row += (j.columns[n].zerofill ? " ZEROFILL" : "");
        row += (j.columns[n].allownull ? " Null" : "Not Null");
        row += (j.columns[n].default == false ? "" : "'" + j.columns[n].default) + "'";
        row += (n < (j.columns.length - 1) ? "," : "");
        mysql_code += row;
    }
    if (j.PrimaryIndexes.length > 0) {
        mysql_code += (", PRIMARY KEY(`" + j.PrimaryIndexes[0] + "`)");
    }
    for (let n = 0; n < j.UniqueIndexes.length; n++) {
        mysql_code += (", UNIQUE INDEX`" + j.UniqueIndexes[n] + "`(`" + j.UniqueIndexes[n] + "`)");
        // mysql_code += (n < (j.UniqueIndexes.length - 1) ? "," : "");
    }
    // mysql_code += (j.index != false ? ", INDEX`" + j.index + "`(`" + j.index + "`)" : "");
    mysql_code += ")COLLATE = 'utf8mb4_0900_ai_ci' ENGINE = InnoDB;";
    console.log(mysql_code);
    // let result = JSON.parse(await questioning(mysql_code, []));
}

//Adds row to specified table
//t = Table name
//j = JSON of row data
async function Create_Row(t, j) {
    // INSERT INTO table_name (column1, column2, column3)
    // VALUES ('value1', 125, '2026-10-01');
    let rowData = Convert_JSON_LabelLinks_TO_Array(j);
    let rowLabels = [];
    let rowValues = [];
    for (let i = 0; i < rowData.length; i++) {
        rowLabels.push(rowData[i][0]);
        rowValues.push(rowData[i][1]);
    }
    let mysql_code = "INSERT INTO " + t + " (";
    for (let i = 0; i < rowLabels.length; i++) {
        mysql_code += (rowLabels[i] + (i < rowLabels.length - 1 ? ", " : ") "));
    }
    mysql_code += "VALUES (";
    for (let i = 0; i < rowValues.length; i++) {
        if (typeof rowValues[i] === 'number') {
            mysql_code += (rowValues[i] + (i < rowValues.length - 1 ? ", " : ");"));
        }
        else {
            mysql_code += ("'" + rowValues[i] + "'" + (i < rowValues.length - 1 ? ", " : ");"));
        }
    }
    console.log(mysql_code);
    // let result = JSON.parse(await questioning(mysql_code, []));
}

//Returns specified table data in form of a JSON
//t = Table label
async function Get_Table(t) {
    //SELECT * FROM your_table_name;
    let result = JSON.parse(await questioning("SELECT * FROM " + t + ";", []));
    return result;
}

//Gets all tables
async function Get_All_Tables() {
    let result = await questioning("SHOW TABLES;", []);
    return JSON.parse(result).map(V => (Object.values(V)[0]));
}

//Returns specified row data
//t = Table label
//j = JSON of data to identify row by
async function Get_Row(t, j) {
    // const jsonData = {
    //     "name": "Alex",
    //     "age": 30,
    //     "city": "New York"
    // };
    // // Loop through labels (keys) and values
    // Object.entries(jsonData).forEach(([label, value]) => {
    //     console.log(`Label: ${label} -> Value: ${value}`);
    // });
    let traits = Convert_JSON_LabelLinks_TO_Array(j);

    //SELECT * FROM table_name WHERE id = 5;
    //SELECT * FROM users WHERE status = 'active' AND role = 'admin' AND country = 'US';
    let mysql_code = "SELECT * FROM " + t + " WHERE ";
    if (traits.length == 1) {
        mysql_code += traits[0][0] + " = '" + traits[0][1] + "';";
    }
    else {
        for (let i = 0; i < traits.length; i++) {
            if (i < traits.length - 1) {
                mysql_code += traits[i][0] + " = '" + traits[i][1] + "' AND ";
            }
            else {
                mysql_code += traits[i][0] + " = '" + traits[i][1] + "';";
            }
        }
    }
    console.log(mysql_code);
    // let result = JSON.parse(await questioning(mysql_code, []));
}

//Gets all rows of specified table
//t = Table label
//c = Array of specific columns if desired
async function Get_All_Rows(t, c) {
    //SELECT * FROM your_table_name;
    //SELECT column1, column2 FROM your_table_name;
    let mysql_code = "SELECT ";
    if (c == undefined || c == null || c == []) {
        mysql_code += "* ";
    }
    else {
        for (let i = 0; i < c.length; i++) {
            mysql_code += c[i] + ", ";
            if (i == c.length - 1) {
                mysql_code += ", ";
            }
            else {
                mysql_code += " ";
            }
        }
    }
    mysql_code += "FROM " + t + ";";
    console.log(mysql_code);
    // let result = JSON.parse(await questioning(mysql_code, []));
}

//Updates specified table
//t = Table label
//j = JSON of data to update
async function Update_Table(t, j) {
    //
}

//Updates a row in specified table
//t = Table label
//j = JSON of row changes
async function Update_Row(t, j) {
    //
}

//Delete specified table
//t = Table label
async function Delete_Table(t) {
    //
}

//Deletes specified row in specified table
//t = Table label
//j = JSON of data to identify row by
async function Delete_Row(t, j) {
    //
}

export {
    questioning,
    GetAgenda, ApplyAgendaUpdate, CreateNewAgenda, AddAgenda, AgendaCheckup_RoutineID,
    ApplyScheduleUpdate, CreateNewRoutine, GetCurrentRoutine, AssignThisRoutine, GetAvailableRoutines, DuplicateRoutine,
    GetSchedule, DeleteRoutine, CheckForEmptyRoutineDatabase, AddSchedule, GetRoutineMainID,
    GetNotes, AddNote, UpdateNote, DeleteNote,
    GetRecentGeneralNotes, UpdateRecentGeneralNotes, GetBookmarkGeneralNotes, UpdateBookmarkGeneralNotes,
    GetModeToggleKeyStatus, ChangeModeToggleKeyStatus,
    Change_AOMT, Get_AOMT, Change_APMS, Get_APMS,
    GetScreenSaverStatus, ChangeScreenSaverStatus,
    GetCurrentThemes, ChangeCurrentThemes,
    GetColLock, ChangeColLock, GetBookmarks, AddBookmark, DeleteBookmark, GetFooterHistory, SetFooterHistory,
    File_Exist, GetFileContent,
    Customizable_Table, Create_Table, Create_Row, Get_Table, Get_All_Tables, Get_Row, Get_All_Rows, Update_Table, Update_Row, Delete_Table, Delete_Row
};