import * as crypto from 'crypto';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';

import dotenv from 'dotenv';
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

export function GenerateHash(data: string) {
  const secret_key = HMAC_SHA256(process.env.BOT_TOKEN || "", 'WebAppData');
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

export function writeDataToCSV(headers: any, data: any, filename: string) {
  const backupFolder = "backup";
  if (!fsExtra.existsSync(backupFolder)) {
    console.log("create folder");
    fsExtra.mkdirSync(backupFolder, {recursive:true});
  }
  const writeStream = fs.createWriteStream(`${backupFolder}/${filename}`);
  writeStream.write(headers.join(',') + '\n');
  data.forEach((data: any) => {
    const row = [
      data.username || '',  // username
      data.mezonId || '',   // mezonId
      data.rank || 0,       // rank
      data.value || 0,
    ];
    writeStream.write(row.join(',') + '\n');  // Ghi dữ liệu vào file CSV, mỗi giá trị cách nhau bởi dấu phẩy
  });

  writeStream.end(() => {
    console.log(`Data saved in CSV file ${filename}`);
  });
}