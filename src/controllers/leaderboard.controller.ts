import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';
import { GetLeaderboardTopRange, GetUserRank, GetLeaderboardSize } from '../redis/redis.utils';
import { CalcOffset } from '../utils/helper';
import { LEADERBOARD_TYPE } from '../config/constant';

export const GetLeaderboardByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let [size, offset, page] = CalcOffset(req);
    const name = req.params.name;
    Logger.info(`Request GetLeaderboardByName leaderboardName: ${name} size: ${size} offset: ${offset} page: ${page}`);

    if(!Object.values(LEADERBOARD_TYPE).includes(name as LEADERBOARD_TYPE)) {
      Logger.warn(`Warning Business GetLeaderboardByName ${ErrorMessage.INVALID_LEADERBOARD} leaderboardName: ${name} size: ${size} offset: ${offset} page: ${page}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_LEADERBOARD, ErrorMessage.INVALID_LEADERBOARD)
      );
      return;
    }

    let userData = await GetUserData(req.user_jwt.userId);
    if(!userData) {
      Logger.error(`Error GetLeaderboardByName ${ErrorMessage.USER_NOT_FOUND} userId: ${req.user_jwt.userId} userData: ${userData}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }

    let leaderboardsWithRank = await GetLeaderboardTopRange(name, offset, offset + size);
    let myRank: any = await GetUserRank(name, userData.userId, userData.username);
    let total = await GetLeaderboardSize(name);
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        leaderboards: leaderboardsWithRank,
        myRank,
        total,
        currentPage: page,
      },
    });
  } catch (err) {
    Logger.error(`Error GetLeaderboardByName leaderboardName: ${req.query?.name} ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};