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
    if(isWin) {
      userStatsData.total_gold_earn += amount;
      userStatsData.daily_gold_earn += amount;
      userStatsData.weekly_gold_earn += amount;
      userStatsData.total_game_win += 1;
      userStatsData.daily_game_win += 1;
      userStatsData.weekly_game_win += 1;
    }
    else {
      userStatsData.total_gold_lose += amount;
      userStatsData.daily_gold_lose += amount;
      userStatsData.weekly_gold_lose += amount;
      userStatsData.total_game_lose += 1;
      userStatsData.daily_game_lose += 1;
      userStatsData.weekly_game_lose += 1;
    }
    await userStatsData.save();
    result.push(userStatsData);
    let userData = await GetUserData(userId);
    if(userData) {
      await userData.OnEndGame(element);
    }
  }
  return result.map(element => element.getInfo());
}

export async function GetAllUserStats() {
  return await UserStats.find({});
}