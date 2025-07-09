import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData, GetUserDataByFriendCode } from '../redis/redis.utils';

export const getAllFriendInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate if user exist in our database
    const userData = await GetUserData(req.user_jwt.userId);

    if (userData) {
      let userArray = [];
      for(var i = 0; i < userData.user_friend_info.friends.length; i++) {
        let friendProfile = await GetUserDataByFriendCode(userData.user_friend_info.friends[i]);
        if(friendProfile) {
          let userItem = {
            ...friendProfile.getFriendSimpleInfo(),
            userCurrency: friendProfile.getUserCurrency(),
          }
          userArray.push(userItem);
        }
      }

      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          friends: userArray,
        }
      });
      return;
    }

    Logger.error(`Error getAllFriendInfo ${ErrorMessage.USER_NOT_FOUND} userDataId: ${req.user_jwt.userDataId} userData: ${userData}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error getAllFriendInfo ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};