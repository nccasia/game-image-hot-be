import { Logger } from '../logger/winston-logger.config';
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage, ResponseMessage } from '../utils/helper';
import { RESPONSE_STATUS, RESPONSE_MESSAGE } from '../config/constant';
import { GetRandomQuestion, OnFinishQuestion } from './photos.service';
import QuestionPhotoHistory from '../models/QuestionPhotoHistory';
import { getAvailableWalletBalanceInContract, OnBetGame, OnEndGame, isTxUsed } from '../blockchain/service/GameMaster.service';
import TransactionHistory from '../models/TransactionHistory';
import { CONTRACT_EVENT, CURRENCY_TYPE } from '../config/constant';
import { GetUserData, GetRandomBotData } from '../redis/redis.utils';
import { UserServerSocket, IOReturn, Status } from '../services/userserverSocket.service';

import * as dotenv from 'dotenv';
dotenv.config();

export class SocketService {
  private static _instance: SocketService = new SocketService();
  public static get instance(): SocketService {
    return this._instance;
  }

  private httpServer?: HTTPServer;
  private io?: SocketIOServer;

  start(): void {
    this.httpServer = createServer();
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
      },
    });

    this.io.on('connection', async (socket: Socket) => {
      Logger.info(`🔌 A user connected socketId: ${socket.id}`);

      socket.on('hello', async (msg: string) => {
        try {
          Logger.info(`📨 Event 'hello' received: ${msg}`);
          socket.emit('hello', msg);
          //this.io?.emit('hello', msg); // broadcast to all clients
        } catch (e) {
          Logger.error(`Error in 'hello' event: ${e}`);
        }
      });

      socket.on('getQuestion', async (msg, callback) => {
        let result: any = {};
        let data: any = {};
        try {
          Logger.info(`📨 Event 'getQuestion' socketId: ${socket.id} received: ${JSON.stringify(msg)}`);
          const { hash } = msg;
          if (!hash) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.MISSING_PARAMETER, data);
            Logger.info(`Warning Event 'getQuestion' socketId: ${socket.id} ${ErrorMessage.MISSING_PARAMETER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          if(hash != process.env.USER_SERVER_VERIFY_HASH) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED, data);
            Logger.info(`Warning Event 'getQuestion' socketId: ${socket.id} ${RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          data = await GetRandomQuestion();
          result = ResponseMessage(RESPONSE_STATUS.SUCCESS, RESPONSE_MESSAGE.SUCCESS, data);
          Logger.info(`✅ Event 'getQuestion' socketId: ${socket.id} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
          if (typeof callback === 'function') {
            callback(result);
          }
        } catch (e) {
          Logger.error(`Error in 'getQuestion' event: ${e}`);
          result = ResponseMessage(RESPONSE_STATUS.ERROR, ErrorMessage.INTERNAL_SERVER_ERROR, data);
          if (typeof callback === 'function') {
            callback(result);
          }
          return;
        }
      });

      socket.on('finishQuestion', async (msg, callback) => {
        let result: any = {};
        let data: any = {};
        try {
          Logger.info(`📨 Event 'finishQuestion' socketId: ${socket.id} received: ${JSON.stringify(msg)}`);
          const { questionId, leftVote, rightVote, hash } = msg;
          if (!questionId || leftVote == null || rightVote == null || !hash) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.MISSING_PARAMETER, data);
            Logger.info(`❌ Warning Event 'finishQuestion' socketId: ${socket.id} ${ErrorMessage.MISSING_PARAMETER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          if(hash != process.env.USER_SERVER_VERIFY_HASH) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED, data);
            Logger.info(`❌ Warning Event 'finishQuestion' socketId: ${socket.id} ${RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }

          const questionHistory = await QuestionPhotoHistory.findById(questionId);
          if(!questionHistory) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INVALID_QUESTION, data);
            Logger.info(`❌ Warning Event 'finishQuestion' socketId: ${socket.id} ${ErrorMessage.INVALID_QUESTION} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          data = await OnFinishQuestion(questionHistory, leftVote, rightVote);
          result = ResponseMessage(RESPONSE_STATUS.SUCCESS, RESPONSE_MESSAGE.SUCCESS, data);
          Logger.info(`✅ Event 'finishQuestion' socketId: ${socket.id} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
          if (typeof callback === 'function') {
            callback(result);
          }
        } catch (e) {
          Logger.error(`❌ Error in 'finishQuestion' event: ${e}`);
          result = ResponseMessage(RESPONSE_STATUS.ERROR, ErrorMessage.INTERNAL_SERVER_ERROR, data);
          if (typeof callback === 'function') {
            callback(result);
          }
          return;
        }
      });

      socket.on('betGame', async (msg, callback) => {
        let result: any = {};
        let data: any = {};
        try {
          Logger.info(`📨 Event 'betGame' socketId: ${socket.id} received: ${JSON.stringify(msg)}`);
          const { gameId, gameData, currencyType, hash } = msg;
          if (!gameId || !gameData || !Array.isArray(gameData) || gameData.length === 0 || !currencyType) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.MISSING_PARAMETER, data);
            Logger.info(`❌ Warning Event 'betGame' socketId: ${socket.id} ${ErrorMessage.MISSING_PARAMETER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          if(hash != process.env.USER_SERVER_VERIFY_HASH) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED, data);
            Logger.info(`❌ Warning Event 'betGame' socketId: ${socket.id} ${RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          if(!Object.values(CURRENCY_TYPE).includes(currencyType as CURRENCY_TYPE)) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INVALID_CURRENCY_TYPE, data);
            Logger.warn(`❌ Warning Event 'betGame' socketId: ${socket.id} ${ErrorMessage.INVALID_CURRENCY_TYPE} currencyType: ${currencyType}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }

          let transactionBetGame = await TransactionHistory.findOne({ game_id: gameId, event: CONTRACT_EVENT.BET_GAME });
          if(transactionBetGame) {
            let isUsed = false;
            if(process.env.USE_USER_SERVER == 'true') {
              isUsed = transactionBetGame.status;
            }
            else {
              isUsed = await isTxUsed(transactionBetGame.itx);
            }
            if(isUsed) {
              result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.TRANSACTION_ALREADY_ENDED, data);
              Logger.info(`❌ Warning Event 'betGame' socketId: ${socket.id} ${ErrorMessage.TRANSACTION_ALREADY_ENDED} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
              if (typeof callback === 'function') {
                callback(result);
              }
              return;
            }
          }
          
          let players = [];
          let playerWallets = [];
          let playerBets = [];
          for(let info of gameData) {
            if(!info.userId || info.amount == null || isNaN(info.amount) || info.amount <= 0) {
              result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.MISSING_PARAMETER, data);
              Logger.info(`❌ Warning Event 'betGame' socketId: ${socket.id} ${ErrorMessage.MISSING_PARAMETER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
              if (typeof callback === 'function') {
                callback(result);
              }
              return;
            }
            let userData = await GetUserData(info.userId);
            if(!userData) {
              result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.USER_NOT_FOUND, data);
              Logger.info(`❌ Warning Event 'betGame' socketId: ${socket.id} ${ErrorMessage.USER_NOT_FOUND} userId: ${info.userId} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
              if (typeof callback === 'function') {
                callback(result);
              }
              return;
            }


            let availableBalance = 0;
            if(currencyType == CURRENCY_TYPE.TOKEN) {
              if(process.env.USE_USER_SERVER == 'true') {
                if(userData.mezonId == "" || userData.mezonId == null) {
                  result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INVALID_MEZON_ID, data);
                  Logger.info(`❌ Warning Event 'betGame' socketId: ${socket.id} ${ErrorMessage.INVALID_MEZON_ID} ${userData.GetUserDataLogPrefix()} mezonId: ${userData.mezonId} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
                  if (typeof callback === 'function') {
                    callback(result);
                  }
                  return;
                }

                const balanceResponse = await UserServerSocket.instance.getBalanceAsync(userData.mezonId as string);
                availableBalance = balanceResponse.data.balance - balanceResponse.data.pendingBalance;
                playerWallets.push(userData.mezonId);
              }
              else {
                if(userData.walletAddress == "" || userData.walletAddress == null) {
                  result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INVALID_WALLET, data);
                  Logger.info(`❌ Warning Event 'betGame' socketId: ${socket.id} ${ErrorMessage.INVALID_WALLET} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
                  if (typeof callback === 'function') {
                    callback(result);
                  }
                  return;
                }

                availableBalance = await getAvailableWalletBalanceInContract(userData.walletAddress);
                playerWallets.push(userData.walletAddress);
              }
            }
            else {
              availableBalance = userData.GetCurrencyAmount(currencyType);
              playerWallets.push(userData.username || '');
            }

            if(availableBalance < info.amount) {
              result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INSUFFICIENT_RESOURCE, data);
              Logger.info(`❌ Warning Event 'betGame' socketId: ${socket.id} ${ErrorMessage.INSUFFICIENT_RESOURCE} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress} mezonId: ${userData.mezonId} availableBalance: ${availableBalance} amount: ${info.amount} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
              if (typeof callback === 'function') {
                callback(result);
              }
              return;
            }
            
            players.push(info.userId);
            playerBets.push(info.amount);
          }

          data = await OnBetGame(gameId, players, playerWallets, playerBets, currencyType);
          result = ResponseMessage(RESPONSE_STATUS.SUCCESS, RESPONSE_MESSAGE.SUCCESS, data);
          Logger.info(`✅ Event 'betGame' socketId: ${socket.id} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
          if (typeof callback === 'function') {
            callback(result);
          }
        } catch (e) {
          Logger.error(`❌ Error in 'betGame' event: ${e}`);
          result = ResponseMessage(RESPONSE_STATUS.ERROR, ErrorMessage.INTERNAL_SERVER_ERROR, data);
          if (typeof callback === 'function') {
            callback(result);
          }
          return;
        }
      });

      socket.on('endGame', async (msg, callback) => {
        let result: any = {};
        let data: any = {};
        try {
          Logger.info(`📨 Event 'endGame' socketId: ${socket.id} received: ${JSON.stringify(msg)}`);
          const { gameId, winner, hash } = msg;
          if (!gameId || !winner) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.MISSING_PARAMETER, data);
            Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.MISSING_PARAMETER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          if(hash != process.env.USER_SERVER_VERIFY_HASH) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED, data);
            Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }

          let userData = await GetUserData(winner);
          if(!userData) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.USER_NOT_FOUND, data);
            Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.USER_NOT_FOUND} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }

          let transactionBetGame = await TransactionHistory.findOne({ game_id: gameId, event: CONTRACT_EVENT.BET_GAME });
          if(!transactionBetGame) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INVALID_GAME_ID, data);
            Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.INVALID_GAME_ID} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }

          let isBetGameTxUsed = false;
          if(process.env.USE_USER_SERVER == 'true') {
            isBetGameTxUsed = transactionBetGame.status;
          }
          else {
            isBetGameTxUsed = await isTxUsed(transactionBetGame.itx);
          }
          if(!isBetGameTxUsed) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.TRANSACTION_NOT_FOUND, data);
            Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.TRANSACTION_NOT_FOUND} betGame itx: ${transactionBetGame.itx} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }

          let transactionEndGame = await TransactionHistory.findOne({ game_id: gameId, event: CONTRACT_EVENT.GAME_ENDED });
          if(transactionEndGame) {
            let isUsed = false;
            if(process.env.USE_USER_SERVER == 'true') {
              isUsed = transactionEndGame.status;
            }
            else {
              isUsed = await isTxUsed(transactionEndGame.itx);
            } 
            if(isUsed) {
              result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.TRANSACTION_ALREADY_ENDED, data);
              Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.TRANSACTION_ALREADY_ENDED} endGame itx: ${transactionEndGame.itx} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
              if (typeof callback === 'function') {
                callback(result);
              }
              return;
            }
          }

          let winnerAddress = "";
          if(transactionBetGame.currency_type == CURRENCY_TYPE.TOKEN) {
            if(process.env.USE_USER_SERVER == 'true') {
              if(userData.mezonId == "" || userData.mezonId == null) {
                result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INVALID_MEZON_ID, data);
                Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.INVALID_MEZON_ID} ${userData.GetUserDataLogPrefix()} mezonId: ${userData.mezonId} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
                if (typeof callback === 'function') {
                  callback(result);
                }
                return;
              }
              winnerAddress = userData.mezonId;
            }
            else {
              if(userData.walletAddress == "" || userData.walletAddress == null) {
                result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INVALID_WALLET, data);
                Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.INVALID_WALLET} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
                if (typeof callback === 'function') {
                  callback(result);
                }
                return;
              }
              winnerAddress = userData.walletAddress;
            }
          }
          else {
            winnerAddress = userData.username || '';
          }

          if(!transactionBetGame.player_wallets.includes(winnerAddress)) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.INVALID_WINNER, data);
            Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.INVALID_WINNER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }

          data = await OnEndGame(transactionBetGame, winner, winnerAddress);
          result = ResponseMessage(RESPONSE_STATUS.SUCCESS, RESPONSE_MESSAGE.SUCCESS, data);
          Logger.info(`✅ Event 'endGame' socketId: ${socket.id} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
          if (typeof callback === 'function') {
            callback(result);
          }
        } catch (e) {
          Logger.error(`❌ Error in 'endGame' event: ${e}`);
          result = ResponseMessage(RESPONSE_STATUS.ERROR, ErrorMessage.INTERNAL_SERVER_ERROR, data);
          if (typeof callback === 'function') {
            callback(result);
          }
          return;
        }
      });

      socket.on('getBotProfile', async (msg, callback) => {
        let result: any = {};
        let data: any = {};
        try {
          Logger.info(`📨 Event 'getBotProfile' socketId: ${socket.id} received: ${JSON.stringify(msg)}`);
          const { hash, candyAmount } = msg;
          if (!hash || !candyAmount || isNaN(candyAmount) || candyAmount <= 0) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.MISSING_PARAMETER, data);
            Logger.info(`Warning Event 'getBotProfile' socketId: ${socket.id} ${ErrorMessage.MISSING_PARAMETER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          if(hash != process.env.USER_SERVER_VERIFY_HASH) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED, data);
            Logger.info(`Warning Event 'getBotProfile' socketId: ${socket.id} ${RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          let botData = await GetRandomBotData(candyAmount);
          data = {
            ...botData.getInfo(),
          };
          result = ResponseMessage(RESPONSE_STATUS.SUCCESS, RESPONSE_MESSAGE.SUCCESS, data);
          Logger.info(`✅ Event 'getBotProfile' socketId: ${socket.id} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
          if (typeof callback === 'function') {
            callback(result);
          }
        } catch (e) {
          Logger.error(`Error in 'getBotProfile' event: ${e}`);
          result = ResponseMessage(RESPONSE_STATUS.ERROR, ErrorMessage.INTERNAL_SERVER_ERROR, data);
          if (typeof callback === 'function') {
            callback(result);
          }
          return;
        }
      });

      socket.on('disconnect', () => {
        Logger.info(`❌ User disconnected: ${socket.id}`);
      });
    });

    const PORT = process.env.SV_SOCKET_PORT || 3000;
    this.httpServer.listen(PORT, () => {
      Logger.info(`🚀 Socket.IO server listening on http://localhost:${PORT}`);
    });
  }
}