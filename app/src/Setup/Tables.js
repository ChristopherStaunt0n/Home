import { readFile } from "fs/promises";
import path from "path";
import mysql from 'mysql2/promise';

const Tables_Create = path.join(process.cwd(), "app", "src", "Setup", "Database", "Tables.txt");
const Tables_Fill_Default = path.join(process.cwd(), "app", "src", "Setup", "Database", "Fill.txt");

//Database information from Setup.bat file prompts
const B_Host = process.argv[2];
const B_Port = process.argv[3];
const B_Data = process.argv[4];
const B_User = process.argv[5];
const B_Pass = process.argv[6];

//Connection to the database
const pool = mysql.createPool({
    host: B_Host,
    port: Number(B_Port),
    database: B_Data,
    user: B_User,
    password: B_Pass
});

//Database communication 
async function questioning(line, params = []) {
    try {
        const [rows] = await pool.query(line, params);
        return JSON.stringify(rows);
    } catch (err) {
        console.error("Query error:", err);
        throw err;
    }
}

//Runs commands for the database tables
//C = List of MYSQL commands
async function SetupTables(C) {

    const tablesSQL = await readFile(C, "utf8");

    const statements = tablesSQL
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);

    for (let statement of statements) {
        await questioning(`${statement};`);
    }
}

await SetupTables(Tables_Create);
await SetupTables(Tables_Fill_Default);