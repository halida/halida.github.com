/* eslint-disable no-console */
/**
 * Generates public/favicon.ico from public/favicon.png.
 *
 * The layout advertises a classic .ico fallback next to the SVG icon. Without
 * the file every page would request a missing /favicon.ico.
 *
 * The ICO container is written by hand: it simply wraps a 32x32 PNG, which
 * every browser since Vista understands.
 *
 * Usage: node scripts/generate-favicon.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(projectRoot, "public", "favicon.png");
const target = path.join(projectRoot, "public", "favicon.ico");

const png = await sharp(await readFile(source)).resize(32, 32).png().toBuffer();

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count

const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); // width
entry.writeUInt8(32, 1); // height
entry.writeUInt8(0, 2); // palette size
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // colour planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(png.length, 8); // image size
entry.writeUInt32LE(22, 12); // image offset

await writeFile(target, Buffer.concat([header, entry, png]));
console.log(`favicon.ico written (${22 + png.length} bytes)`);
