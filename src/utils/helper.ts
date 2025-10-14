import { Logger } from '../logger/winston-logger.config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import path from 'path';

import * as dotenv from 'dotenv';
dotenv.config();

export function SendErrorMessage(error_code: number, message: string) {
  return {
    serverTime: new Date(),
    error_code,
    error_message: message,
  };
}

export function ResponseMessage(status: number, message: string, data: any) {
  return {
    status,
    message,
    data,
  };
}

export function HMAC_SHA256(key: string | Buffer, value: string | Buffer): Buffer {
  return crypto.createHmac('sha256', key).update(value).digest();
}

export function hex(bytes: Buffer): string {
  return bytes.toString('hex');
}

export function createMD5Hash(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

export function GenerateHash(data: string) {
  const hashToken = createMD5Hash(process.env.BOT_TOKEN || "");
  const secret_key = HMAC_SHA256(hashToken, 'WebAppData');
  //console.log(secret_key);
  //console.log(`BOT_TOKEN: ${process.env.BOT_TOKEN}`);
	// const data_keys = Object.keys(data).filter(v => v !== 'hash').sort();
  // const items = data_keys.map(key => key + '=' + data[key]);
  // const data_check_string = items.join('\n');
  // console.log(data_check_string);
  //logger.info(`GenerateHash data: ${data}`);
	return hex(HMAC_SHA256(secret_key, data));
}

/**
 * Creates a SHAKE256 hash of the given data.
 * @param data The input data to hash (string or Buffer).
 * @param len The desired output length in bytes.
 * @returns The hash as a hexadecimal string.
 */
export function CreateShake256Hash(data: string | Buffer, len: number): string {
  if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
    throw new TypeError('Data must be a string or Buffer');
  }
  if (typeof len !== 'number' || len <= 0) {
    throw new RangeError('Output length must be a positive number');
  }

  return crypto
    .createHash('shake256', { outputLength: len })
    .update(data)
    .digest('hex');
}

export function getTimeAtStartOfDay(timezone: number) {
  let startOfDayDateTime = new Date();
  if (timezone > startOfDayDateTime.getHours())
    startOfDayDateTime.setDate(startOfDayDateTime.getDate() - 1);
  startOfDayDateTime.setHours(timezone, 0, 0, 0);
  return startOfDayDateTime;
}

export function getTimeAtStartOfWeek(timezone: number) {
  let startOfDayDateTime = new Date();
  if (timezone > startOfDayDateTime.getHours())
    startOfDayDateTime.setDate(startOfDayDateTime.getDate() - 1);
  startOfDayDateTime.setDate(
    startOfDayDateTime.getDate() - startOfDayDateTime.getDay()
  );
  startOfDayDateTime.setHours(timezone, 0, 0, 0);
  return startOfDayDateTime;
}

export function isSameDay(date1: Date, date2: Date){
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export function getElapsedTimeSeconds(startTime: string | Date, endTime: string | Date): number {
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const end = endTime instanceof Date ? endTime : new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date provided');
  }

  return Math.floor((end.getTime() - start.getTime()) / 1000);
}

export function CalcOffset(req: any){
  let size =  parseInt(req.query?.size) || 10;
  let page =  parseInt(req.query?.page) || 1;
  if (page < 1){
      page = 1
  }
  if (size <= 0){
      size = 9
  }
  if (size > 1000) {
      size = 1000;
  }
  let offset = (page -1) * size;
  if (offset < 0) offset = 0;
  return [size, offset, page]
}

export function GetNextFullHour(timezone: number) {
  let nextFullHour = new Date();
  if (timezone > nextFullHour.getHours())
    nextFullHour.setDate(nextFullHour.getDate() - 1);
  nextFullHour.setHours(nextFullHour.getHours() + 1, 0, 0, 0);
  return nextFullHour;
}

export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months: 0–11
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function writeDataToCSV(headers: { key: string, label: string }[], data: any, filename: string) {
  const backupFolder = "backup";
  if (!fsExtra.existsSync(backupFolder)) {
    Logger.info("create backup folder");
    fsExtra.mkdirSync(backupFolder, {recursive:true});
  }
  const filePath = `${backupFolder}/${filename}`;
  const writeStream = fs.createWriteStream(filePath);

  writeStream.write(headers.map(h => h.label).join(',') + '\n');
  data.forEach((item: any) => {
    const row = headers.map(h => item[h.key] ?? '');
    writeStream.write(row.join(',') + '\n');
  });

  writeStream.end(async () => {
    Logger.info(`Data saved in CSV file ${filename}`);
    const prefix = filename.split('_')[0];
    const maxFile = parseInt(process.env.MAX_LOG_FILES ?? '15');
    await cleanOldFiles(backupFolder, prefix, maxFile);
  });
}

export async function cleanOldFiles(folder: string, prefix: string, maxFiles: number) {
  const files = fs.readdirSync(folder)
    .filter(file => file.startsWith(prefix) && file.endsWith('.csv'))
    .map(file => ({
      name: file,
      fullPath: path.join(folder, file),
      mtime: fs.statSync(path.join(folder, file)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime); // newest first

  if (files.length > maxFiles) {
    const filesToDelete = files.slice(maxFiles);
    for (const file of filesToDelete) {
      fs.unlinkSync(file.fullPath);
      Logger.info(`Deleted old file: ${file.name}`);
    }
  }
}