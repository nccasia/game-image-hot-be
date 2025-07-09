import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';

export const updateTutorial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { tutorial_id, action_type } = req.body;
    Logger.info(`Request updateTutorial tutorial_id: ${tutorial_id} action_type: ${action_type}`);
    if (!(tutorial_id && action_type)) {
      Logger.warn(`Warning Business updateTutorial ${ErrorMessage.MISSING_PARAMETER} tutorial_id: ${tutorial_id} action_type: ${action_type}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    // Validate if user exist in our database
    const userData = await GetUserData(req.user_jwt.userId);

    if (userData) {
      let userTutorial = userData.GetTutorial(tutorial_id);
      if(userTutorial) {
        // let requireUserTutorial = userData.GetTutorialByName(userTutorial.require_tutorial_name);
        // if(requireUserTutorial != null && requireUserTutorial.recorded == 0) {
        //   logger.error(ERROR_MESSAGE.REQUIRE_TUTORIAL_NOT_FINISHED);
        //   return res.status(HTTP_STATUS_CODE.OK).json(
        //     ErrorMessage(ERROR_CODE.REQUIRE_TUTORIAL_NOT_FINISHED, ERROR_MESSAGE.REQUIRE_TUTORIAL_NOT_FINISHED)
        //   );
        // }
        // if(action_type == TUTORIAL_ACTION.FINISHED && userTutorial.action_type != TUTORIAL_ACTION.STARTED) {
        //   logger.error(ERROR_MESSAGE.TUTORIAL_NOT_STARTED);
        //   return res.status(HTTP_STATUS_CODE.OK).json(
        //     ErrorMessage(ERROR_CODE.TUTORIAL_NOT_STARTED, ERROR_MESSAGE.TUTORIAL_NOT_STARTED)
        //   );
        // }
        let tutorial = await userData.updateTutorial(tutorial_id, action_type);
        res.status(HttpStatusCode.OK).json({
          serverTime: new Date(),
          error_code: ErrorCode.NONE,
          data: {
            tutorial,
          }
        });
        return;
      }
      Logger.warn(`Warning Business updateTutorial ${ErrorMessage.INVALID_TUTORIAL} ${userData.GetUserDataLogPrefix()} tutorial_id: ${tutorial_id} userTutorial: ${JSON.stringify(userTutorial)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_TUTORIAL, ErrorMessage.INVALID_TUTORIAL)
      );
      return;
    }

    Logger.error(`Error updateTutorial ${ErrorMessage.USER_NOT_FOUND} userDataId: ${req.user_jwt.userDataId} userData: ${userData}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error updateTutorial ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};