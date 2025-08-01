import { Logger } from '../logger/winston-logger.config';

import * as fs from 'fs';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import csv from 'csvtojson';

import { DATA_FILE, app_constant } from '../config/constant';
import Achievement from "../models/Achievement";
import BasicQuest from "../models/BasicQuest";
import DailyQuest from "../models/DailyQuest";
import DLCBundle from "../models/DLCBundle";
import GameParameter from "../models/GameParameter";
import Photos from "../models/Photos";
import Tutorial from "../models/Tutorial";

async function readFiles(dir: string, processFile: (filepath: string, name: string, ext: string) => Promise<void>): Promise<void> {
  const fileNames = await fs.promises.readdir(dir); // Use promises version

  await Promise.all(fileNames.map(async (filename) => {
    const { name, ext } = path.parse(filename);
    const filepath = path.resolve(dir, filename);

    try {
      const stat = await fs.promises.stat(filepath);
      if (stat.isFile()) {
        await processFile(filepath, name, ext);
      }
    } catch (err) {
        Logger.error(`Error processing file "${filename}":`, err);
      }
  }));
}

export async function exportData() {
  await readFiles('src/data/csv', async (filepath, name, ext) => {
    csv({ checkType: false })
      .fromFile(filepath)
      .then(jsonObj => {
        fsExtra.writeFileSync(`src/data/json/${name}.json`, JSON.stringify(jsonObj));
      });
  });
}

export async function setupDatabase() {
  await readFiles('src/data/json', async (filepath, name, ext) => {
    const options = { ordered: true };
    const data = await fs.promises.readFile(filepath, 'utf8'); // Use `fs.promises.readFile`
    const jsonData = JSON.parse(data);

    switch (name) {
      case DATA_FILE.ACHIEVEMENT:
        await Achievement.deleteMany({});
        let achievement = (await Achievement.insertMany(jsonData, options)).filter(element => !element.disable);
        app_constant.achievement = achievement.map((element) => element.getInfo());
        break;
      case DATA_FILE.BASIC_QUEST:
        await BasicQuest.deleteMany({});
        let basicQuest = (await BasicQuest.insertMany(jsonData, options)).filter(q => !q.disable);
        app_constant.basicQuest = basicQuest.map((element) => element.getInfo());
        break;
      case DATA_FILE.DAILY_QUEST:
        await DailyQuest.deleteMany({});
        let dailyQuest = (await DailyQuest.insertMany(jsonData, options)).filter(q => !q.disable);
        app_constant.dailyQuest = dailyQuest.map((element) => element.getInfo());
        break;
      case DATA_FILE.DLC_BUNDLE:
        await DLCBundle.deleteMany({});
        let dlcBundle = await DLCBundle.insertMany(jsonData, options);
        app_constant.dlcBundle = dlcBundle.map((element) => element.getInfo());
        break;
      case DATA_FILE.GAME_PARAMETER:
        await GameParameter.deleteMany({});
        const gameParameterList = await GameParameter.insertMany(jsonData, options);
        app_constant.gameParameter = gameParameterList.find(gp => gp.version == app_constant.version);
        break;
      case DATA_FILE.PHOTOS:
        await Photos.deleteMany({});
        let photos = (await Photos.insertMany(jsonData, options)).filter(element => !element.disable);
        app_constant.photos = photos.map((element) => element.getInfo());
        break;
      case DATA_FILE.TUTORIAL:
        await Tutorial.deleteMany({});
        let tutorial = (await Tutorial.insertMany(jsonData, options)).filter(element => !element.disable);
        app_constant.tutorial = tutorial.map((element) => element.getInfo());
        break;
      default:
        break;
    }
  });
}
