import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { app_constant, LoadDataConfig } from '../config/constant';
import { exportData, setupDatabase } from '../tools/setup-data';
import { SaveGameDataConfigUpdateTime, GetGameDataConfigUpdateTime } from '../redis/redis.utils';

export const GameConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let lastTimeUpdateGameConfig = await GetGameDataConfigUpdateTime();
    if(app_constant.gameDataConfigUpdateTime != lastTimeUpdateGameConfig) {
      await LoadDataConfig();
    }
    let gameParameter = app_constant.gameParameter;

    if (gameParameter) {
      gameParameter = gameParameter.getInfo();
      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          gameParameter,
        },
      });
      return;
    }

    Logger.error(`Error GetGameConfig ${ErrorMessage.GAME_CONFIG_NOT_FOUND} gameParameter: ${gameParameter}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.GAME_CONFIG_NOT_FOUND, ErrorMessage.GAME_CONFIG_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error GetGameConfig ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const GameDataConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let lastTimeUpdateGameConfig = await GetGameDataConfigUpdateTime();
    if(app_constant.gameDataConfigUpdateTime != lastTimeUpdateGameConfig) {
      await LoadDataConfig();
    }
    let achievement = app_constant.achievement;
    let basicQuest = app_constant.basicQuest;
    let dailyQuest = app_constant.dailyQuest;
    //let photos = app_constant.photos;

    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        achievement,
        basicQuest,
        dailyQuest,
        //photos,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error GetGameDataConfig ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const GetBundleDataConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let lastTimeUpdateGameConfig = await GetGameDataConfigUpdateTime();
    if(app_constant.gameDataConfigUpdateTime != lastTimeUpdateGameConfig) {
      await LoadDataConfig();
    }

    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        dlcBundle: app_constant.dlcBundle,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error GetBundleDataConfig ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const SetupGameConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await setupDatabase();
    await SaveGameDataConfigUpdateTime();
    app_constant.gameDataConfigUpdateTime = await GetGameDataConfigUpdateTime();
    //await LoadDataConfig();
    let currentTime = new Date();
    let gameParameter = app_constant.gameParameter;
    let achievement = app_constant.achievement;
    let basicQuest = app_constant.basicQuest;
    let dailyQuest = app_constant.dailyQuest;
    let dlcBundle = app_constant.dlcBundle;
    let photos = app_constant.photos;

    if(gameParameter) {
      gameParameter = gameParameter.getInfo();
      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          gameParameter,
          achievement,
          basicQuest,
          dailyQuest,
          dlcBundle: dlcBundle,
          photos,
        },
      });
      return;
    }

    Logger.error(`Error SetupGameConfig ${ErrorMessage.GAME_CONFIG_NOT_FOUND}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.GAME_CONFIG_NOT_FOUND, ErrorMessage.GAME_CONFIG_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error SetupGameConfig ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const ExportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await exportData();

    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        message: "Export data from excel to json successfully"
      }
    });
    return;
  } catch (err) {
    Logger.error(`Error ExportData ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};