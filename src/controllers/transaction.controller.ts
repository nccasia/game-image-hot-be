import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';
import { GetPreEndGame, GetEndGamePendingList, GetTransactionInfoByItx } from '../services/transaction.service';
import { getAvailableWalletBalanceInContract, isTxUsed, getPastEventsFromBlock } from '../blockchain/service/GameMaster.service';

export const PreBetGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount } = req.body;
    Logger.info(`Request PreBetGame user: ${JSON.stringify(req.user_jwt)} amount: ${amount}`);
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      Logger.warn(`Warning Business PreBetGame ${ErrorMessage.MISSING_PARAMETER} amount: ${amount}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let userData = await GetUserData(req.user_jwt.userId);
    if(!userData) {
      Logger.error(`Error PreBetGame ${ErrorMessage.USER_NOT_FOUND} user: ${JSON.stringify(req.user_jwt)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }
    if(userData.walletAddress == "" || userData.walletAddress == null) {
      Logger.error(`Error PreBetGame ${ErrorMessage.INVALID_WALLET} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_WALLET, ErrorMessage.INVALID_WALLET)
      );
      return;
    }
    let availableBalance = await getAvailableWalletBalanceInContract(userData.walletAddress);
    if(availableBalance < amount) {
      Logger.error(`Error PreBetGame ${ErrorMessage.INSUFFICIENT_RESOURCE} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress} availableBalance: ${availableBalance} amount: ${amount}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INSUFFICIENT_RESOURCE, ErrorMessage.INSUFFICIENT_RESOURCE)
      );
      return;
    }
    let transactionData = await userData.SignBetGame(amount);
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        ...transactionData,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error PreBetGame ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const PreEndGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itx } = req.body;
    Logger.info(`Request PreEndGame user: ${JSON.stringify(req.user_jwt)} itx: ${itx}`);
    if (!itx) {
      Logger.warn(`Warning Business PreEndGame ${ErrorMessage.MISSING_PARAMETER} itx: ${itx}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let userData = await GetUserData(req.user_jwt.userId);
    if(!userData) {
      Logger.error(`Error PreEndGame ${ErrorMessage.USER_NOT_FOUND} user: ${JSON.stringify(req.user_jwt)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }
    if(userData.walletAddress == "" || userData.walletAddress == null) {
      Logger.error(`Error PreBetGame ${ErrorMessage.INVALID_WALLET} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_WALLET, ErrorMessage.INVALID_WALLET)
      );
      return;
    }
    let transactionData = await GetPreEndGame(itx);
    if(transactionData.error_code) {
      Logger.error(`Error PreBetGame ${transactionData.error_message} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(transactionData.error_code, transactionData.error_message)
      );
      return;
    }
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        ...transactionData,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error PreBetGame ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const EndGamePendingList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    Logger.info(`Request EndGamePendingList user: ${JSON.stringify(req.user_jwt)}`);

    let userData = await GetUserData(req.user_jwt.userId);
    if(!userData) {
      Logger.error(`Error EndGamePendingList ${ErrorMessage.USER_NOT_FOUND} user: ${JSON.stringify(req.user_jwt)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }
    //let transactionData = await GetEndGamePendingList(userData.userId);
    let transactionData = userData.user_pending_itx;
    let removeItx = [];
    for(let itx of transactionData) {
      let isUsed = await isTxUsed(itx);
      if(isUsed) {
        removeItx.push(itx);
        let transaction = await GetTransactionInfoByItx(itx);
        if(transaction) {
          transaction.status = true;
          await transaction?.save();
          await userData.handlePendingItx(itx);
        }
      }
    }
    transactionData = transactionData.filter((element: string) => !removeItx.includes(element));
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        pendingItx: transactionData,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error EndGamePendingList ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

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