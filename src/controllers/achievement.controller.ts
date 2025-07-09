import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';

export const claimAchievement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { achievement_id } = req.body;
    Logger.info(`Request claimAchievement achievement_id: ${achievement_id}`);
    if (!achievement_id) {
      Logger.warn(`Warning Business claimAchievement ${ErrorMessage.MISSING_PARAMETER} achievement_id: ${achievement_id}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }
    // Validate if user exist in our database
    const userData = await GetUserData(req.user_jwt.userId);

    if (userData) {
      let canCollectReward = await userData.CanCollectUserAchievementReward(achievement_id); 
      if(!canCollectReward) {
        Logger.warn(`Warning Business claimAchievement ${ErrorMessage.ACHIEVEMENT_NOT_COMPLETE} ${userData.GetUserDataLogPrefix()} canCollectReward: ${canCollectReward}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.ACHIEVEMENT_NOT_COMPLETE, ErrorMessage.ACHIEVEMENT_NOT_COMPLETE)
        );
        return;
      }
      let userAchievement = userData.GetAchievement(achievement_id);
      if (userAchievement.claimed) {
        Logger.warn(`Warning Business claimAchievement ${ErrorMessage.ACHIEVEMENT_ALREADY_CLAIMED} ${userData.GetUserDataLogPrefix()} userAchievement: ${JSON.stringify(userAchievement)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.ACHIEVEMENT_ALREADY_CLAIMED, ErrorMessage.ACHIEVEMENT_ALREADY_CLAIMED)
        );
        return;
      }
      let result = await userData.CollectUserAchievementReward(achievement_id);
      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          currencyType: result.currencyType,
          currencyAmount: userData.GetCurrencyAmount(result.currencyType),
          achievement: result.achievement,
          maxRewardClaimsPerDay: result.max_reward_claims_per_day,
        }
      });
      return;
    }

    Logger.error(`Error claimAchievement ${ErrorMessage.USER_NOT_FOUND} userDataId: ${req.user_jwt.userDataId} userData: ${userData}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error claimAchievement ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};