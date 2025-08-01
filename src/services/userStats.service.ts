import { Logger } from '../logger/winston-logger.config';
import UserStats from '../models/UserStats';
import TransactionHistory, { ITransactionHistory } from '../models/TransactionHistory';
import { GetUserData } from '../redis/redis.utils';

export async function OnEndGameUserStat(transactionEndGame: ITransactionHistory): Promise<any> {
  let result = [];
  for(let i = 0; i < transactionEndGame.players.length; i++) {
    let userId = transactionEndGame.players[i];
    let amount = transactionEndGame.player_bets[i];
    let isWin = userId == transactionEndGame.user_id ? true: false;
    let userStatsData = await UserStats.findOne({ userId: userId });
    if(!userStatsData) {
      userStatsData = await UserStats.create({ userId: userId });
    }
    let amountChange = 0;
    if(isWin) {
      userStatsData.total_gold_earn += transactionEndGame.winner_amount;
      userStatsData.daily_gold_earn += transactionEndGame.winner_amount;
      userStatsData.weekly_gold_earn += transactionEndGame.winner_amount;
      userStatsData.total_game_win += 1;
      userStatsData.daily_game_win += 1;
      userStatsData.weekly_game_win += 1;
      amountChange = transactionEndGame.winner_amount;
    }
    else {
      userStatsData.total_gold_lose += amount;
      userStatsData.daily_gold_lose += amount;
      userStatsData.weekly_gold_lose += amount;
      userStatsData.total_game_lose += 1;
      userStatsData.daily_game_lose += 1;
      userStatsData.weekly_game_lose += 1;
      amountChange = amount
    }
    await userStatsData.save();
    let userData = await GetUserData(userId);
    if(userData) {
      let endGameData = await userData.OnEndGame(isWin, amountChange);
      let newData = {
        userId,
        ...endGameData,
      }
      result.push(newData);
    }
  }
  return result;
}

export async function GetAllUserStats() {
  return await UserStats.find({});
}