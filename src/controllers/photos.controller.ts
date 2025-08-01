import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';
import { GetRandomQuestion, OnFinishQuestion } from '../services/photos.service';
import QuestionPhotoHistory from '../models/QuestionPhotoHistory';
import { getAvailableWalletBalanceInContract, OnBetGame, OnEndGame, isTxUsed } from '../blockchain/service/GameMaster.service';
import TransactionHistory from '../models/TransactionHistory';
import { CONTRACT_EVENT } from '../config/constant';

export const getRandomQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let result = await GetRandomQuestion();
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        question: result,
      }
    });
    return;
  } catch (err) {
    Logger.error(`Error getRandomQuestion ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const finishQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { questionId, leftVote, rightVote } = req.body;
    Logger.info(`Request finishQuestion questionId: ${questionId} leftVote: ${leftVote} rightVote: ${rightVote}`);
    if (!questionId || !leftVote || !rightVote) {
      Logger.warn(`Warning Business finishQuestion ${ErrorMessage.MISSING_PARAMETER} questionId: ${questionId} leftVote: ${leftVote} rightVote: ${rightVote}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    const questionHistory = await QuestionPhotoHistory.findById(questionId);
    if(!questionHistory) {
      Logger.warn(`Warning Business finishQuestion ${ErrorMessage.INVALID_QUESTION} questionId: ${questionId} leftVote: ${leftVote} rightVote: ${rightVote}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_QUESTION, ErrorMessage.INVALID_QUESTION)
      );
      return;
    }

    let result = await OnFinishQuestion(questionHistory, leftVote, rightVote);
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        ...result,
      }
    });
    return;
  } catch (err) {
    Logger.error(`Error finishQuestion ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const betGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { gameId, gameData } = req.body;
    Logger.info(`Request betGame gameId: ${gameId} gameData: ${JSON.stringify(gameData)}`);
    if (!gameId || !gameData || !Array.isArray(gameData) || gameData.length === 0) {
      Logger.warn(`Warning Business betGame ${ErrorMessage.MISSING_PARAMETER} gameId: ${gameId} gameData: ${JSON.stringify(gameData)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let transactionBetGame = await TransactionHistory.findOne({ game_id: gameId, event: CONTRACT_EVENT.BET_GAME });
    if(transactionBetGame) {
      let isUsed = await isTxUsed(transactionBetGame.itx);
      if(isUsed) {
        Logger.error(`Warning Business betGame ${ErrorMessage.TRANSACTION_ALREADY_ENDED} gameId: ${gameId} gameData: ${JSON.stringify(gameData)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.TRANSACTION_ALREADY_ENDED, ErrorMessage.TRANSACTION_ALREADY_ENDED)
        );
        return;
      }
    }

    let players = [];
    let playerWallets = [];
    let playerBets = [];
    for(let info of gameData) {
      if(!info.userId || info.amount == null || isNaN(info.amount) || info.amount <= 0) {
        Logger.warn(`Warning Business betGame ${ErrorMessage.MISSING_PARAMETER} gameData: ${JSON.stringify(gameData)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
        );
        return;
      }
      let userData = await GetUserData(info.userId);
      if(!userData) {
        Logger.error(`Warning Business betGame ${ErrorMessage.USER_NOT_FOUND} userId: ${info.userId} userData: ${userData}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
        );
        return;
      }

      if(userData.walletAddress == "" || userData.walletAddress == null) {
        Logger.error(`Warning Business betGame ${ErrorMessage.INVALID_WALLET} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.INVALID_WALLET, ErrorMessage.INVALID_WALLET)
        );
        return;
      }

      let availableBalance = await getAvailableWalletBalanceInContract(userData.walletAddress);
      if(availableBalance < info.amount) {
        Logger.error(`Warning Business betGame ${ErrorMessage.INSUFFICIENT_RESOURCE} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress} availableBalance: ${availableBalance} amount: ${info.amount}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.INSUFFICIENT_RESOURCE, ErrorMessage.INSUFFICIENT_RESOURCE)
        );
        return;
      }
      players.push(info.userId);
      playerWallets.push(userData.walletAddress);
      playerBets.push(info.amount);
    }

    let result = await OnBetGame(gameId, players, playerWallets, playerBets);
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: result,
    });
    return;
  } catch (err) {
    Logger.error(`Error betGame ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const endGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { gameId, winner } = req.body;
    Logger.info(`Request endGame gameId: ${gameId} winner: ${winner}`);
    if (!gameId || !winner) {
      Logger.warn(`Warning Business endGame ${ErrorMessage.MISSING_PARAMETER} gameId: ${gameId} winner: ${winner}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let userData = await GetUserData(winner);
    if(!userData) {
      Logger.error(`Warning Business endGame ${ErrorMessage.USER_NOT_FOUND} gameId: ${gameId} winner: ${winner} userData: ${userData}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }

    if(userData.walletAddress == "" || userData.walletAddress == null) {
      Logger.error(`Warning Business endGame ${ErrorMessage.INVALID_WALLET} ${userData.GetUserDataLogPrefix()} gameId: ${gameId} winner: ${winner} walletAddress: ${userData.walletAddress}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_WALLET, ErrorMessage.INVALID_WALLET)
      );
      return;
    }

    let transactionBetGame = await TransactionHistory.findOne({ game_id: gameId, event: CONTRACT_EVENT.BET_GAME });
    if(!transactionBetGame) {
      Logger.error(`Warning Business endGame ${ErrorMessage.INVALID_GAME_ID} ${userData.GetUserDataLogPrefix()} gameId: ${gameId} winner: ${winner} transactionBetGame: ${transactionBetGame}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_GAME_ID, ErrorMessage.INVALID_GAME_ID)
      );
      return;
    }

    if(!transactionBetGame.player_wallets.includes(userData.walletAddress)) {
      Logger.error(`Warning Business endGame ${ErrorMessage.INVALID_WINNER} ${userData.GetUserDataLogPrefix()} gameId: ${gameId} winner: ${winner} transactionBetGame: ${transactionBetGame}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_WINNER, ErrorMessage.INVALID_WINNER)
      );
      return;
    }

    let transactionEndGame = await TransactionHistory.findOne({ game_id: gameId, event: CONTRACT_EVENT.GAME_ENDED });
    if(transactionEndGame) {
      let isUsed = await isTxUsed(transactionEndGame.itx);
      if(isUsed) {
        Logger.error(`Warning Business betGame ${ErrorMessage.TRANSACTION_ALREADY_ENDED} gameId: ${gameId} winner: ${winner} itx: ${transactionEndGame.itx}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.TRANSACTION_ALREADY_ENDED, ErrorMessage.TRANSACTION_ALREADY_ENDED)
        );
        return;
      }
    }

    let result = await OnEndGame(transactionBetGame, winner, userData.walletAddress);
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: result,
    });
    return;
  } catch (err) {
    Logger.error(`Error endGame ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};