import { Logger } from '../logger/winston-logger.config';
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage, ResponseMessage } from '../utils/helper';
import { RESPONSE_STATUS, RESPONSE_MESSAGE } from '../config/constant';
import { GetRandomQuestion, OnFinishQuestion } from './photos.service';
import QuestionPhotoHistory from '../models/QuestionPhotoHistory';
import { OnEndGame } from './userStats.service';

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

      socket.on('endGame', async (msg, callback) => {
        let result: any = {};
        let data: any = {};
        try {
          Logger.info(`📨 Event 'endGame' socketId: ${socket.id} received: ${JSON.stringify(msg)}`);
          const { gameData, hash } = msg;
          if (!gameData || !hash || !Array.isArray(gameData) || gameData.length === 0) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.MISSING_PARAMETER, data);
            Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.MISSING_PARAMETER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }
          for(let info of gameData) {
            if(!info.userId || info.amount == null || info.isWin == null) {
              result = ResponseMessage(RESPONSE_STATUS.WARNING, ErrorMessage.MISSING_PARAMETER, data);
              Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${ErrorMessage.MISSING_PARAMETER} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
              if (typeof callback === 'function') {
                callback(result);
              }
              return;
            }
          }
          if(hash != process.env.USER_SERVER_VERIFY_HASH) {
            result = ResponseMessage(RESPONSE_STATUS.WARNING, RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED, data);
            Logger.info(`❌ Warning Event 'endGame' socketId: ${socket.id} ${RESPONSE_MESSAGE.WARNING_VALIDATE_HASH_FAILED} msg: ${JSON.stringify(msg)} result: ${JSON.stringify(result)}`);
            if (typeof callback === 'function') {
              callback(result);
            }
            return;
          }

          data = await OnEndGame(gameData);
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