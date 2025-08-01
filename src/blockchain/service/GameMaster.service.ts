import { Logger } from '../../logger/winston-logger.config';
import GameMaster from '../abi/GameMaster.json';
import { CONTRACT_EVENT, RESPONSE_STATUS, RESPONSE_MESSAGE } from '../../config/constant';
import { ErrorMessage } from '../../config/error_message';
import { OnEventReceived } from '../../services/transaction.service';
import { gameMasterContract } from '../contract/GameMaster.contract';
import TransactionHistory, { ITransactionHistory } from '../../models/TransactionHistory';
import { generateTxId } from '../../services/signature.service';
import { OnEndGameUserStat } from '../../services/userStats.service';
import { ethers } from 'ethers';

export async function isTransactionMined(tx_hash: string) {
  const txReceipt = await gameMasterContract.provider.getTransactionReceipt(tx_hash);
  if (txReceipt) {
    if(txReceipt.blockNumber) {
      return txReceipt;
    }
  }
}

export async function isTxUsed(itx: string): Promise<boolean> {
  return await gameMasterContract.isTxUsed(itx);
}

export async function getWalletBalance(address: string): Promise<number> {
  let balance = await gameMasterContract.provider.getBalance(address);
  return parseFloat(ethers.utils.formatEther(balance));
}

export async function getWalletBalanceInContract(address: string): Promise<number> {
  let balance = await gameMasterContract.getBalance(address);
  return parseFloat(ethers.utils.formatEther(balance));
}

export async function getAvailableWalletBalanceInContract(address: string): Promise<number> {
  let balance = await gameMasterContract.getAvailableToWithdraw(address);
  return parseFloat(ethers.utils.formatEther(balance));
}

export async function getPastEventsFromBlockWithEventName(eventName: string, fromBlock: number, toBlock: number) {
  const iface = new ethers.utils.Interface(GameMaster.abi);
  const eventTopic = iface.getEventTopic(eventName);
  const filter = {
    address: process.env.MASTER_CONTRACT_ADDRESS,
    fromBlock: fromBlock,
    //toBlock: "latest",
    toBlock: toBlock,
    topics: [eventTopic]
  };
  let data: any;
  const logs = await gameMasterContract.provider.getLogs(filter);
  for (const log of logs) {
    const parsed = iface.parseLog(log);
    const transactionHash = log.transactionHash;
    switch(eventName) {
      case CONTRACT_EVENT.DEPOSITED:
        data = {
          contract: log.address,
          event: eventName,
          tx_hash: transactionHash,
          chain_id: process.env.CHAIN_ID,
          user_address: parsed.args.user.toLowerCase(),
          amount: parseFloat(ethers.utils.formatEther(parsed.args.amount)),
          timestamp: parseInt(parsed.args.timestamp)
        };
        break;
      case CONTRACT_EVENT.WITHDRAWN:
        data = {
          contract: log.address,
          event: eventName,
          tx_hash: transactionHash,
          chain_id: process.env.CHAIN_ID,
          user_address: parsed.args.user.toLowerCase(),
          amount: parseFloat(ethers.utils.formatEther(parsed.args.amount)),
          timestamp: parseInt(parsed.args.timestamp)
        };
        break;
      case CONTRACT_EVENT.WITHDRAWN_WITH_SIGNATURE:
        data = {
          contract: log.address,
          event: eventName,
          tx_hash: transactionHash,
          chain_id: process.env.CHAIN_ID,
          user_address: parsed.args.user.toLowerCase(),
          itx: parsed.args.itx,
          amount: parseFloat(ethers.utils.formatEther(parsed.args.amount)),
          timestamp: parseInt(parsed.args.timestamp)
        };
        break;
      case CONTRACT_EVENT.BET_GAME:
        data = {
          contract: log.address,
          event: eventName,
          tx_hash: transactionHash,
          chain_id: process.env.CHAIN_ID,
          user_address: parsed.args.user.toLowerCase(),
          itx: parsed.args.itx,
          user_id: parsed.args.userId,
          amount: parseFloat(ethers.utils.formatEther(parsed.args.amount)),
          timestamp: parseInt(parsed.args.timestamp)
        };
        break;
      case CONTRACT_EVENT.GAME_ENDED:
        data = {
          contract: log.address,
          event: eventName,
          tx_hash: transactionHash,
          chain_id: process.env.CHAIN_ID,
          user_address: parsed.args.winner.toLowerCase(),
          amount: parseFloat(ethers.utils.formatEther(parsed.args.totalReward)),
          itx: parsed.args.itx,
          losers: parsed.args.losers.map((element: any) => element.toLowerCase()),
          lost_amounts: parsed.args.lostAmounts.map((element: any) => parseFloat(ethers.utils.formatEther(element))),
          timestamp: parseInt(parsed.args.timestamp)
        };
        break;
      case CONTRACT_EVENT.BET_CLEARED:
        data = {
          contract: log.address,
          event: eventName,
          tx_hash: transactionHash,
          chain_id: process.env.CHAIN_ID,
          user_address: parsed.args.user.toLowerCase(),
          amount: parseFloat(ethers.utils.formatEther(parsed.args.amount)),
          timestamp: parseInt(parsed.args.timestamp)
        };
        break;
      default:
        break;
    }
    Logger.info(`${eventName} data: ${JSON.stringify(data)}`);
    OnEventReceived(data);
  }
  return logs;
}

export async function getPastEventsFromBlock(fromBlock: number, toBlock: number) {
  const logDeposited = await getPastEventsFromBlockWithEventName(CONTRACT_EVENT.DEPOSITED, fromBlock, toBlock);
  const logWithdrawn = await getPastEventsFromBlockWithEventName(CONTRACT_EVENT.WITHDRAWN, fromBlock, toBlock);
  const logWithdrawnWithSignature = await getPastEventsFromBlockWithEventName(CONTRACT_EVENT.WITHDRAWN_WITH_SIGNATURE, fromBlock, toBlock);
  const logBetGame = await getPastEventsFromBlockWithEventName(CONTRACT_EVENT.BET_GAME, fromBlock, toBlock);
  const logGameEnded = await getPastEventsFromBlockWithEventName(CONTRACT_EVENT.GAME_ENDED, fromBlock, toBlock);
  const logBetCleared = await getPastEventsFromBlockWithEventName(CONTRACT_EVENT.BET_CLEARED, fromBlock, toBlock);
  const result = [...logDeposited, ...logWithdrawn, ...logWithdrawnWithSignature, ...logBetGame, ...logGameEnded, ...logBetCleared];
  return result;
}

export async function OnBetGame(gameId: string, players: string[], playerWallets: string[], playerBets: number[]): Promise<any> {
  let signData: any = {};
  signData.game_id = gameId;
  signData.players = players;
  signData.player_wallets = playerWallets;
  signData.player_bets = playerBets;
  let transactionHistory = await TransactionHistory.findOne({ game_id: gameId, event: CONTRACT_EVENT.BET_GAME});
  if(!transactionHistory) {
    transactionHistory = await TransactionHistory.create({
      event: CONTRACT_EVENT.BET_GAME,
      ...signData,
    });
    transactionHistory.itx = generateTxId(transactionHistory.id.toString());
    await transactionHistory.updateOne({ $set: { 'itx': transactionHistory.itx } });
  }
  let data: any = {};
  let isUsed = await isTxUsed(transactionHistory.itx);
  if(!isUsed) {
    data = {
      itx: transactionHistory.itx,
      gameId,
      players: transactionHistory.player_wallets,
      playerBets: playerBets.map((element: any) => ethers.utils.parseEther(element.toString()).toString()),
    }
    const betGameTx = await gameMasterContract.betGame(data.itx, data.gameId, data.players, data.playerBets);
    await betGameTx.wait();
    await transactionHistory.updateOne({ $set: { 'tx_hash': betGameTx.hash } });
    Logger.info(`Transaction hash of betGame: ${betGameTx.hash}`);
  }
  return data;
}

export async function OnEndGame(transactionBetGame: ITransactionHistory, winner: string, winerAddress: string): Promise<any> {
  let signData: any = {};
  signData.game_id = transactionBetGame.game_id;
  signData.players = transactionBetGame.players;
  signData.player_wallets = transactionBetGame.player_wallets;
  signData.player_bets = transactionBetGame.player_bets;
  signData.user_id = winner;
  signData.winner = winerAddress;
  let winnerAmount = 0;
  for(let i = 0; i < transactionBetGame.player_wallets.length; i++) {
    if(transactionBetGame.player_wallets[i] != winerAddress) {
      winnerAmount += transactionBetGame.player_bets[i];
    }
  }
  signData.winner_amount = winnerAmount;
  let transactionHistory = await TransactionHistory.findOne({ game_id: transactionBetGame.game_id, event: CONTRACT_EVENT.GAME_ENDED});
  if(!transactionHistory) {
    transactionHistory = await TransactionHistory.create({
      event: CONTRACT_EVENT.GAME_ENDED,
      ...signData,
    });
    transactionHistory.itx = generateTxId(transactionHistory.id.toString());
    await transactionHistory.updateOne({ $set: { 'itx': transactionHistory.itx } });
  }
  let data: any = {};
  let isUsed = await isTxUsed(transactionHistory.itx);
  if(!isUsed) {
    data = {
      itx: transactionHistory.itx,
      gameId: transactionHistory.game_id,
      winner: transactionHistory.winner,
    }
    const endGameTx = await gameMasterContract.endGame(data.itx, data.gameId, data.winner);
    await endGameTx.wait();
    await transactionHistory.updateOne({ $set: { 'tx_hash': endGameTx.hash } });
    Logger.info(`Transaction hash of endGame: ${endGameTx.hash}`);
  }
  
  return await OnEndGameUserStat(transactionHistory);
}
