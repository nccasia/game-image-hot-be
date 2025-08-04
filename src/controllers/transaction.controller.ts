import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { getPastEventsFromBlock } from '../blockchain/service/GameMaster.service';

export const GetPastEventFromBlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from_block, to_block } = req.body;
    Logger.info(`Request GetPastEventFromBlock from_block: ${from_block} to_block: ${to_block}`);
    if (!from_block || !to_block) {
      Logger.warn(`Warning Business GetPastEventFromBlock ${ErrorMessage.MISSING_PARAMETER} from_block: ${from_block} to_block: ${to_block}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    const eventLog = await getPastEventsFromBlock(from_block, to_block);
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: eventLog,
    });
    return;
  } catch (err) {
    Logger.error(`Error GetPastEventFromBlock ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};