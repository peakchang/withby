// lib/processImageFile.js

import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 비동기 이미지 복사 함수
 * @param {string} inputUrl - 예: '/subimg/img250523/1748406660514ha98lr863.webp'
 * @returns {Promise<string|false>} - 새 URL 문자열 또는 false
 */
export async function processImageFile(inputUrl) {
    const relativePath = inputUrl.replace('/subimg/', '');
    const originalPath = join(__dirname, '..', 'subuploads', 'img', relativePath);

    if (!existsSync(originalPath)) {
        return false;
    }

    const now = new Date();
    const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const folderName = `img${yymmdd}`;
    const folderPath = join(__dirname, '..', 'subuploads', 'img', folderName);

    const timestamp = Date.now();
    const randStr = Math.random().toString(36).substring(2, 11);
    const ext = extname(originalPath);
    const newFileName = `${timestamp}${randStr}${ext}`;
    const newFilePath = join(folderPath, newFileName);

    await fs.mkdir(folderPath, { recursive: true });
    await fs.copyFile(originalPath, newFilePath);

    return `/subimg/${folderName}/${newFileName}`;
}
