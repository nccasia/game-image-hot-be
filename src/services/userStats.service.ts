import { Logger } from '../logger/winston-logger.config';
import UserStats from '../models/UserStats';
import { ITransactionHistory } from '../models/TransactionHistory';
import { GetUserData } from '../redis/redis.utils';
import { CURRENCY_TYPE } from '../config/constant';

export async function OnEndGameUserStat(transactionEndGame: ITransactionHistory): Promise<any> {
  let result = [];
  for(let i = 0; i < transactionEndGame.players.length; i++) {
    let userId = transactionEndGame.players[i];
    let amount = transactionEndGame.player_bets[i];
    let isWin = userId == transactionEndGame.user_id ? true: false;
    if(!userId.startsWith("bot_")) {
      let userStatsData = await UserStats.findOne({ userId: userId });
      if(!userStatsData) {
        userStatsData = await UserStats.create({ userId: userId });
      }
      let amountChange = 0;
      if(isWin) {
        userStatsData.total_game_win += 1;
        userStatsData.daily_game_win += 1;
        userStatsData.weekly_game_win += 1;

        if(transactionEndGame.currency_type == CURRENCY_TYPE.TOKEN) {
          userStatsData.total_gold_earn += transactionEndGame.winner_amount;
          userStatsData.daily_gold_earn += transactionEndGame.winner_amount;
          userStatsData.weekly_gold_earn += transactionEndGame.winner_amount;
          userStatsData.total_gold_change += transactionEndGame.winner_amount;
          userStatsData.daily_gold_change += transactionEndGame.winner_amount;
          userStatsData.weekly_gold_change += transactionEndGame.winner_amount;
        }
        else {
          userStatsData.total_candy_change += transactionEndGame.winner_amount;
          userStatsData.daily_candy_change += transactionEndGame.winner_amount;
          userStatsData.weekly_candy_change += transactionEndGame.winner_amount;
        }

        amountChange = transactionEndGame.winner_amount;
      }
      else {
        userStatsData.total_game_lose += 1;
        userStatsData.daily_game_lose += 1;
        userStatsData.weekly_game_lose += 1;

        if(transactionEndGame.currency_type == CURRENCY_TYPE.TOKEN) {
          userStatsData.total_gold_lose += amount;
          userStatsData.daily_gold_lose += amount;
          userStatsData.weekly_gold_lose += amount;
          userStatsData.total_gold_change -= amount;
          userStatsData.daily_gold_change -= amount;
          userStatsData.weekly_gold_change -= amount;
        }
        else {
          userStatsData.total_candy_change -= amount;
          userStatsData.daily_candy_change -= amount;
          userStatsData.weekly_candy_change -= amount;
        }

        amountChange = amount
      }
      await userStatsData.save();
      let userData = await GetUserData(userId);
      if(userData) {
        let endGameData = await userData.OnEndGame(isWin, transactionEndGame.currency_type as CURRENCY_TYPE, amountChange);
        let newData = {
          userId,
          ...endGameData,
        }
        result.push(newData);
      }
    }
  }
  if(transactionEndGame.currency_type != CURRENCY_TYPE.TOKEN) {
    await transactionEndGame.updateOne({ $set: { status: true } });
  }
  return result;
}

export async function GetAllUserStats() {
  return await UserStats.find({});
}