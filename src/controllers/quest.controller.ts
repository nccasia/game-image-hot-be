import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';

export const claimDailyQuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quest_id } = req.body;
    Logger.info(`Request claimDailyQuest quest_id: ${quest_id}`);
    if (!quest_id) {
      Logger.warn(`Warning Business claimDailyQuest ${ErrorMessage.MISSING_PARAMETER} quest_id: ${quest_id}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    // Check if user already exist
    // Validate if user exist in our database
    let userData = await GetUserData(req.user_jwt.userId);
    if(userData) {
      let dailyQuestInfo = userData.GetDailyQuest(quest_id);
      if(!dailyQuestInfo) {
        Logger.warn(`Warning Business claimDailyQuest ${ErrorMessage.INVALID_QUEST} ${userData.GetUserDataLogPrefix()} dailyQuestInfo: ${JSON.stringify(dailyQuestInfo)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.INVALID_QUEST, ErrorMessage.INVALID_QUEST)
        );
        return;
      }

      let userDailyQuest = userData.GetUserDailyQuest(quest_id);
      if(!userDailyQuest) {
        Logger.warn(`Warning Business claimDailyQuest ${ErrorMessage.INVALID_QUEST} ${userData.GetUserDataLogPrefix()} userDailyQuest: ${JSON.stringify(userDailyQuest)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.INVALID_QUEST, ErrorMessage.INVALID_QUEST)
        );
        return;
      }
      if(userDailyQuest.claimed) {
        Logger.warn(`Warning Business claimDailyQuest ${ErrorMessage.QUEST_ALREADY_CLAIMED} ${userData.GetUserDataLogPrefix()} userDailyQuest: ${JSON.stringify(userDailyQuest)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.QUEST_ALREADY_CLAIMED, ErrorMessage.QUEST_ALREADY_CLAIMED)
        );
        return;
      }
      let result;
      const isExistExternalLink = !!dailyQuestInfo?.external_link;
      if(userDailyQuest.claimable) {
        result = await userData.ClaimDailyQuest(quest_id, true);
      }
      else {
        if(isExistExternalLink) {
          result = await userData.UpdateClaimableUserDailyQuest(quest_id);
        }
        else {
          Logger.warn(`Warning Business claimDailyQuest ${ErrorMessage.QUEST_NOT_COMPLETE} ${userData.GetUserDataLogPrefix()} userDailyQuest: ${JSON.stringify(userDailyQuest)}`);
          res.status(HttpStatusCode.OK).json(
            SendErrorMessage(ErrorCode.QUEST_NOT_COMPLETE, ErrorMessage.QUEST_NOT_COMPLETE)
          );
          return;
        }
      }

      // Return User
      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          ...result,
        },
      });
      return;
    }
    Logger.error(`Error claimDailyQuest ${ErrorMessage.USER_NOT_FOUND} userDataId: ${req.user_jwt.userDataId} userData: ${userData}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error claimDailyQuest ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const claimBasicQuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quest_id } = req.body;
    Logger.info(`Request claimBasicQuest quest_id: ${quest_id}`);
    if (!quest_id) {
      Logger.warn(`Warning Business claimBasicQuest ${ErrorMessage.MISSING_PARAMETER} quest_id: ${quest_id}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    // Check if user already exist
    // Validate if user exist in our database
    let userData = await GetUserData(req.user_jwt.userId);
    if(userData) {
      let basicQuestInfo = userData.GetBasicQuest(quest_id);
      if(!basicQuestInfo) {
        Logger.warn(`Warning Business claimBasicQuest ${ErrorMessage.INVALID_QUEST} ${userData.GetUserDataLogPrefix()} basicQuestInfo: ${JSON.stringify(basicQuestInfo)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.INVALID_QUEST, ErrorMessage.INVALID_QUEST)
        );
        return;
      }

      let userBasicQuest = userData.GetUserBasicQuest(quest_id);
      if(!userBasicQuest) {
        Logger.warn(`Warning Business claimBasicQuest ${ErrorMessage.INVALID_QUEST} ${userData.GetUserDataLogPrefix()} userBasicQuest: ${JSON.stringify(userBasicQuest)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.INVALID_QUEST, ErrorMessage.INVALID_QUEST)
        );
        return;
      }
      if(userBasicQuest.claimed) {
        Logger.warn(`Warning Business claimBasicQuest ${ErrorMessage.QUEST_ALREADY_CLAIMED} ${userData.GetUserDataLogPrefix()} userBasicQuest: ${JSON.stringify(userBasicQuest)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.QUEST_ALREADY_CLAIMED, ErrorMessage.QUEST_ALREADY_CLAIMED)
        );
        return;
      }

      let result;
      const isExistExternalLink = !!basicQuestInfo?.external_link;
      if(userBasicQuest.claimable) {
        result = await userData.ClaimBasicQuest(quest_id, true);
      }
      else {
        if(isExistExternalLink) {
          result = await userData.UpdateClaimableUserBasicQuest(quest_id);
        }
        else {
          Logger.warn(`Warning Business claimBasicQuest ${ErrorMessage.QUEST_NOT_COMPLETE} ${userData.GetUserDataLogPrefix()} userBasicQuest: ${JSON.stringify(userBasicQuest)}`);
          res.status(HttpStatusCode.OK).json(
            SendErrorMessage(ErrorCode.QUEST_NOT_COMPLETE, ErrorMessage.QUEST_NOT_COMPLETE)
          );
          return;
        }
      }
      // Return User
      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          ...result,
        },
      });
      return;
    }
    Logger.error(`Error claimBasicQuest ${ErrorMessage.USER_NOT_FOUND} userDataId: ${req.user_jwt.userDataId} userData: ${userData}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error claimBasicQuest ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};