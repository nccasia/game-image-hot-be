import { Logger } from "../logger/winston-logger.config";
import TransactionHistory, {ITransactionHistory} from "../models/TransactionHistory";
import { GetUserData } from '../redis/redis.utils';
import { ErrorCode } from "../config/error_code";
import { ErrorMessage } from "../config/error_message";
import { CONTRACT_EVENT } from "../config/constant";
import { ethers } from "ethers";

export async function OnEventReceived(data: any): Promise<ITransactionHistory | null> {
  try {
    return await SaveTransaction(data, true);
  } catch (error) {
    Logger.error(error);
    return null;
  }
}

export async function GetTransactionInfo(tx_hash: string): Promise<ITransactionHistory | null> {
  try {
    const transaction = await TransactionHistory.findOne({ tx_hash });
    return transaction;
  } catch (error) {
    Logger.error(error);
    return null;
  }
}

export async function GetTransactionInfoByItx(itx: string): Promise<ITransactionHistory | null> {
  try {
    const transaction = await TransactionHistory.findOne({ itx });
    return transaction;
  } catch (error) {
    Logger.error(error);
    return null;
  }
}

export async function SaveTransaction(data: any, status: boolean): Promise<ITransactionHistory | null> {
  try {
    let transactionInfo: any;
    if(data.itx != null) {
      transactionInfo = await TransactionHistory.findOneAndUpdate({ itx: data.itx, status: false }, { ...data, status });
    }
    else {
      transactionInfo = await GetTransactionInfo(data.tx_hash);
      if(!transactionInfo) {
        transactionInfo = await TransactionHistory.create({ ...data, status });
      }
    }
    return transactionInfo;
  } catch (error) {
    Logger.error(error);
    return null;
  }
}

export async function GetPreEndGame(itx: string): Promise<any> {
  try {
    const transaction = await GetTransactionInfoByItx(itx);
    if(transaction) {
      if(transaction.status) {
        return {
          error_code: ErrorCode.TRANSACTION_ALREADY_ENDED,
          error_message: ErrorMessage.TRANSACTION_ALREADY_ENDED
        };
      }
      let result: any = {
        itx: transaction.itx,
        userId: transaction.user_id,
        players: transaction.players,
        //player_bets: transaction.player_bets.map((element: any) => ethers.utils.parseEther(element.toString()).toString()),
        //winnerBet: ethers.utils.parseEther(transaction.winner_bet.toString()).toString(),
        signature: transaction.signature,
      }
      return result;
    }
    else {
      return {
        error_code: ErrorCode.TRANSACTION_NOT_FOUND,
        error_message: ErrorMessage.TRANSACTION_NOT_FOUND
      };
    }
  } catch (error) {
    Logger.error(error);
    return {
      error_code: ErrorCode.INTERNAL_SERVER_ERROR,
      error_message: ErrorMessage.INTERNAL_SERVER_ERROR
    };
  }
}

export async function GetEndGamePendingList(userId: string): Promise<any> {
  try {
    const transactions = await TransactionHistory.find({ event: CONTRACT_EVENT.GAME_ENDED, user_id: userId, status: false });
    return transactions.map((element: any) => element.itx);
  } catch(error) {
    Logger.error(error);
    return [];
  }
}