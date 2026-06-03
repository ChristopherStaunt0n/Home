'use server';
import { questioning } from "./DatabaseConnection.js";

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function resolveImagePath(input) {
    if (!input) return null;
    if (typeof input === "string") return input;
    return input.src || null;
}

async function fetchImageBuffer(input) {
    const imagePath = resolveImagePath(input);
    if (!imagePath) throw new Error("No image path provided");

    const imageUrl = imagePath.startsWith("http")
        ? imagePath
        : new URL(imagePath, DEFAULT_BASE_URL).toString();

    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Failed to fetch image from ${imageUrl}: ${res.status}`);

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// I = image id
async function GetImage(I) {
    const rowsJson = await questioning("SELECT Image FROM images WHERE ID = ?", [I]);
    const rows = JSON.parse(rowsJson);
    if (!rows || !rows.length) return null;
    const row = rows[0];
    if (!row.Image) return null;
    return Buffer.from(row.Image.data);
}

// T = Target (All, Public, Private)
async function GetImages() {
    const rowsJson = await questioning("SELECT ID, Mode, Image FROM images");
    const rows = JSON.parse(rowsJson);
    if (!Array.isArray(rows)) return [];
    return rows.map(row => ({
        id: row.ID,
        mode: row.Mode,
        imageBase64: row.Image ? Buffer.from(row.Image.data).toString("base64") : null
    }));
}

// I = Image asset or URL
async function AddImage(I) {
    const buffer = await fetchImageBuffer(I);
    await questioning(
        "INSERT INTO images (ID, Mode, Image) VALUES (?, ?, ?)",
        [0, "Private", buffer]
    );
}

async function DI() {
    //await questioning("DELETE FROM notes WHERE ID = ?", [Number(I)]);
    await questioning("DELETE FROM images WHERE ID = ?", [Number(0)]);
}

export { GetImage, GetImages, AddImage };