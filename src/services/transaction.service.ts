import { Logger } from "../logger/winston-logger.config";
import TransactionHistory, {ITransactionHistory} from "../models/TransactionHistory";

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