'use server';
import { promises as fs } from 'fs';
import path from 'path';

//Checks if file exists
//P = Path to folder destination
//F = File to check for
async function File_Exist(P, F) {

    let filePath = path.join(process.cwd(), P, F);

    try {
        await fs.access(filePath);
        return true;
    }
    catch (error) {
        return false;
    }
}

//Returns file's content
//P = Path to folder destination
//F = File to read from
async function GetFileContent(P, F) {
    let filePath = path.join(process.cwd(), P, F);
    let content = await fs.readFile(filePath, 'utf8');
    return content;
}

export { File_Exist, GetFileContent };