import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';
import Coupon from '../models/Coupon';
import { GenerateAndSaveUniqueCoupon, GetCouponInfo } from '../services/coupon.service';

export const GenerateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { number_coupon, type, length, reward, max_use, start_time, end_time, canUseSameType, canUseSameCode } = req.body;
    Logger.info(`Request generateCoupon userId: ${req.user_jwt.user_id} userDataId: ${req.user_jwt.userDataId} number_coupon: ${number_coupon} type: ${type} length: ${length} reward: ${JSON.stringify(reward)} max_use: ${max_use} start_time: ${start_time} end_time: ${end_time} canUseSameType: ${canUseSameType} canUseSameCode: ${canUseSameCode}`);
    if (!number_coupon || !type || !length || !reward || !max_use || !start_time || !end_time) {
      Logger.warn(`Warning Business generateCoupon ${ErrorMessage.MISSING_PARAMETER} number_coupon: ${number_coupon} type: ${type} length: ${length} reward: ${JSON.stringify(reward)} max_use: ${max_use} start_time: ${start_time} end_time: ${end_time}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let result = await GenerateAndSaveUniqueCoupon(req.body);
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        coupon: result,
      }
    });
    return;
  } catch (err) {
    Logger.error(`Error generateCoupon ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const CouponInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { coupon_code } = req.query;
    Logger.info(`Request GetCouponInfo userId: ${req.user_jwt.user_id} userDataId: ${req.user_jwt.userDataId} coupon_code: ${coupon_code}`);
    if (!coupon_code) {
      Logger.warn(`Warning Business GetCouponInfo ${ErrorMessage.MISSING_PARAMETER} coupon_code: ${coupon_code}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let result = await GetCouponInfo(coupon_code as string);
    if(!result) {
      Logger.warn(`Warning Business GetCouponInfo ${ErrorMessage.INVALID_COUPON} coupon_code: ${coupon_code}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_COUPON, ErrorMessage.INVALID_COUPON)
      );
      return;
    }
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        coupon: result,
      }
    });
    return;
  } catch (err) {
    Logger.error(`Error GetCouponInfo ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const UseCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { coupon_code } = req.body;
    Logger.info(`Request UseCoupon userId: ${req.user_jwt.user_id} userDataId: ${req.user_jwt.userDataId} coupon_code: ${coupon_code}`);
    if (!coupon_code) {
      Logger.warn(`Warning Business UseCoupon ${ErrorMessage.MISSING_PARAMETER} coupon_code: ${coupon_code}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    const userData = await GetUserData(req.user_jwt.userId);
    if(!userData) {
      Logger.error(`Error UseCoupon ${ErrorMessage.USER_NOT_FOUND} userDataId: ${req.user_jwt.userDataId} userData: ${userData}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }

    if(userData.IsLimitInputCouponToday()) {
      Logger.warn(`Warning Business UseCoupon ${ErrorMessage.COUPON_FAILED_LIMIT} ${userData.GetUserDataLogPrefix()} coupon_code: ${coupon_code}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.COUPON_FAILED_LIMIT, ErrorMessage.COUPON_FAILED_LIMIT)
      );
      return;
    }

    let coupon = await GetCouponInfo(coupon_code);
    if(!coupon) {
      await userData.IncreaseInputCouponFailed();
      const finalMessage = ErrorMessage.INVALID_COUPON.replace("[remainingAttempts]", userData.user_coupon.number_of_attempts);
      Logger.warn(`Warning Business UseCoupon ${finalMessage} ${userData.GetUserDataLogPrefix()} coupon_code: ${coupon_code}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_COUPON, finalMessage)
      );
      return;
    }

    let currentTime = new Date();
    if(currentTime < coupon.start_time || currentTime > coupon.end_time) {
      Logger.warn(`Warning Business UseCoupon ${ErrorMessage.COUPON_EXPIRED_OR_NOT_STARTED} ${userData.GetUserDataLogPrefix()} coupon: ${JSON.stringify(coupon)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.COUPON_EXPIRED_OR_NOT_STARTED, ErrorMessage.COUPON_EXPIRED_OR_NOT_STARTED)
      );
      return;
    }
    if(coupon.remain_use == 0 || !coupon.claimable) {
      Logger.warn(`Warning Business UseCoupon ${ErrorMessage.COUPON_USAGE_LIMIT} ${userData.GetUserDataLogPrefix()} coupon: ${JSON.stringify(coupon)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.COUPON_USAGE_LIMIT, ErrorMessage.COUPON_USAGE_LIMIT)
      );
      return;
    }
    if(!coupon.canUseSameCode) {
      if(!userData.CanUseCouponCode(coupon.code)) {
        Logger.warn(`Warning Business UseCoupon ${ErrorMessage.COUPON_CODE_ALREADY_USE} ${userData.GetUserDataLogPrefix()} coupon: ${JSON.stringify(coupon)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.COUPON_CODE_ALREADY_USE, ErrorMessage.COUPON_CODE_ALREADY_USE)
        );
        return;
      }
    }
    
    if(!coupon.canUseSameType) {
      if(!userData.CanUseCouponType(coupon.type)) {
        Logger.warn(`Warning Business UseCoupon ${ErrorMessage.COUPON_TYPE_ALREADY_USE} ${userData.GetUserDataLogPrefix()} coupon: ${JSON.stringify(coupon)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.COUPON_TYPE_ALREADY_USE, ErrorMessage.COUPON_TYPE_ALREADY_USE)
        );
        return;
      }
    }
    
    // Attempt to atomically decrement remain_use only if it's still claimable and has uses left
    const updatedCoupon = await Coupon.findOneAndUpdate(
      { 
        code: coupon.code,
        claimable: true,
        remain_use: { $gt: 0 }
      },
      [
        {
          $set: {
            remain_use: { $subtract: ["$remain_use", 1] },
            claimable: {
              $cond: [{ $eq: [{ $subtract: ["$remain_use", 1] }, 0] }, false, "$claimable"]
            }
          }
        }
      ],
      { new: true }
    );

    if (!updatedCoupon) {
      Logger.warn(`Warning Business UseCoupon ${ErrorMessage.COUPON_USAGE_LIMIT} - 2 ${userData.GetUserDataLogPrefix()} coupon: ${JSON.stringify(coupon)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.COUPON_USAGE_LIMIT, ErrorMessage.COUPON_USAGE_LIMIT)
      );
      return;
    }
    let result = await userData.UseCoupon(updatedCoupon);

    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        ...result,
      }
    });
    return;
  } catch (err) {
    Logger.error(`Error UseCoupon ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};