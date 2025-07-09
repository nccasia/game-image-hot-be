import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';
import { GetLeaderboard } from '../redis/redis.utils';
import { CalcOffset, GetNextFullHour } from '../utils/helper';
import { app_constant, LEADERBOARD_TYPE } from '../config/constant';

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

    let nextRefreshTime = GetNextFullHour(app_constant.gameParameter.timezone);
    const leaderboards: any[] = await GetLeaderboard(name as string);
    let myRank: any = null;
    let leaderboardsWithRank: any[] = [];
    if(leaderboards.length > 0) {
      leaderboardsWithRank = leaderboards.slice(offset, offset + size);
      myRank = leaderboards.find(element => element.userId == userData.userId);
    }
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        leaderboards: leaderboardsWithRank,
        myRank,
        total: leaderboards.length,
        currentPage: page,
        nextRefreshTime,
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