import { Logger } from '../logger/winston-logger.config';
import UserStats from '../models/UserStats';
import { GetUserData } from '../redis/redis.utils';

export async function OnEndGame(data: any): Promise<any> {
  let result = [];
  for(let element of data) {
    let userId = element.userId;
    let amount = element.amount;
    let isWin = element.isWin;
    let userStatsData = await UserStats.findOne({ userId: userId });
    if(!userStatsData) {
      userStatsData = await UserStats.create({ userId: userId });
    }
    let amountChange = 0;
    if(isWin) {
      userStatsData.total_gold_earn += amount;
      userStatsData.daily_gold_earn += amount;
      userStatsData.weekly_gold_earn += amount;
      userStatsData.total_game_win += 1;
      userStatsData.daily_game_win += 1;
      userStatsData.weekly_game_win += 1;
      userStatsData.total_gold_change += amount;
      userStatsData.daily_gold_change += amount;
      userStatsData.weekly_gold_change += amount;
      amountChange = amount;
    }
    else {
      userStatsData.total_gold_lose += amount;
      userStatsData.daily_gold_lose += amount;
      userStatsData.weekly_gold_lose += amount;
      userStatsData.total_game_lose += 1;
      userStatsData.daily_game_lose += 1;
      userStatsData.weekly_game_lose += 1;
      userStatsData.total_gold_change -= amount;
      userStatsData.daily_gold_change -= amount;
      userStatsData.weekly_gold_change -= amount;
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