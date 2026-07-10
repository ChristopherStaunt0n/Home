'use server';
import Login from "./Login/Access.js";
const mysql = require('mysql2/promise');
import { redirect } from 'next/navigation'
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
import { GetCurrentThemes, ChangeCurrentThemes, GetTheme } from "./HandleTheme.js";
import { GetScreenSaverStatus, ChangeScreenSaverStatus } from "./HandleScreenSaver.js";
import { ChangeModeToggleKeyStatus, GetModeToggleKeyStatus, GetColLock, ChangeColLock, Change_AOMT, Get_AOMT } from "./HandleKey.js";
import { GetBookmarks, AddBookmark, DeleteBookmark } from "./HandleBookmarks.js";
import { GetFooterHistory, SetFooterHistory } from "./HandleFooter.js";

//Creates a connection to the database
const pool = mysql.createPool({
    host: Login.host,
    user: Login.user,
    password: Login.pass,
    database: Login.data
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

export {
    questioning,
    GetAgenda, ApplyAgendaUpdate, CreateNewAgenda, AddAgenda, AgendaCheckup_RoutineID,
    ApplyScheduleUpdate, CreateNewRoutine, GetCurrentRoutine, AssignThisRoutine, GetAvailableRoutines, DuplicateRoutine,
    GetSchedule, DeleteRoutine, CheckForEmptyRoutineDatabase, AddSchedule, GetRoutineMainID,
    GetNotes, AddNote, UpdateNote, DeleteNote,
    GetRecentGeneralNotes, UpdateRecentGeneralNotes, GetBookmarkGeneralNotes, UpdateBookmarkGeneralNotes,
    GetModeToggleKeyStatus, ChangeModeToggleKeyStatus,
    Change_AOMT, Get_AOMT,
    GetScreenSaverStatus, ChangeScreenSaverStatus,
    GetCurrentThemes, ChangeCurrentThemes, GetTheme,
    GetColLock, ChangeColLock, GetBookmarks, AddBookmark, DeleteBookmark, GetFooterHistory, SetFooterHistory
};