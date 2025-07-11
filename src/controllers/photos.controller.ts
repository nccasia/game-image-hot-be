import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { GetUserData } from '../redis/redis.utils';
import { GetRandomQuestion, OnFinishQuestion } from '../services/photos.service';
import QuestionPhotoHistory from '../models/QuestionPhotoHistory';
import { OnEndGame } from '../services/userStats.service';

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

export const endGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { gameData } = req.body;
    Logger.info(`Request endGame data: ${JSON.stringify(gameData)}`);
    if (!gameData || !Array.isArray(gameData) || gameData.length === 0) {
      Logger.warn(`Warning Business endGame ${ErrorMessage.MISSING_PARAMETER} gameData: ${JSON.stringify(gameData)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    for(let info of gameData) {
      if(!info.userId || info.amount == null || info.isWin == null) {
        Logger.warn(`Warning Business endGame ${ErrorMessage.MISSING_PARAMETER} gameData: ${JSON.stringify(gameData)}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
        );
        return;
      }
    }

    let result = await OnEndGame(gameData);
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