import { Logger } from '../logger/winston-logger.config';
import cron from 'node-cron';
import { app_constant, LEADERBOARD_TYPE } from '../config/constant';
import { getTimeAtStartOfDay, getTimeAtStartOfWeek } from '../utils/helper';
import { GetAllUserDataByPattern, SaveLeaderboard } from '../redis/redis.utils';
import { formatDateYYYYMMDD, writeDataToCSV } from '../utils/helper';
import Leaderboard from '../models/Leaderboard';
import { CacheUserData } from '../redis/redis.userData';

async function BackupTotalGoldEarnLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.total_gold_earn == b.user_stats.total_gold_earn) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
    return b.user_stats.total_gold_earn - a.user_stats.total_gold_earn;
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {
      ...userDatas[i].getSimpleInfo(),
      value: userDatas[i].user_stats.total_gold_earn,
      rank: i + 1
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.TOTAL_GOLD_EARN, leaderboards, resetTime);
}

async function BackupDailyGoldEarnLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.daily_reset_time == b.user_stats.daily_reset_time) {
      if(a.user_stats.daily_gold_earn == b.user_stats.daily_gold_earn) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
      return b.user_stats.daily_gold_earn - a.user_stats.daily_gold_earn;
    }
    let aResetTime = new Date(a.user_stats.daily_reset_time);
    let bResetTime = new Date(b.user_stats.daily_reset_time);
    return bResetTime.getTime() - aResetTime.getTime();
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {};
    let aResetTime = new Date(userDatas[i].user_stats.daily_reset_time);
    if(aResetTime < resetTime) {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: 0,
        rank: i + 1
      }
    }
    else {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: userDatas[i].user_stats.daily_gold_earn,
        rank: i + 1
      }
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.DAILY_GOLD_EARN, leaderboards, resetTime);
}

async function BackupWeeklyGoldEarnLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.weekly_reset_time == b.user_stats.weekly_reset_time) {
      if(a.user_stats.weekly_gold_earn == b.user_stats.weekly_gold_earn) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
      return b.user_stats.weekly_gold_earn - a.user_stats.weekly_gold_earn;
    }
    let aResetTime = new Date(a.user_stats.weekly_reset_time);
    let bResetTime = new Date(b.user_stats.weekly_reset_time);
    return bResetTime.getTime() - aResetTime.getTime();
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {};
    let aResetTime = new Date(userDatas[i].user_stats.weekly_reset_time);
    if(aResetTime < resetTime) {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: 0,
        rank: i + 1
      }
    }
    else {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: userDatas[i].user_stats.weekly_gold_earn,
        rank: i + 1
      }
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.WEEKLY_GOLD_EARN, leaderboards, resetTime);
}

async function BackupTotalGoldLoseLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.total_gold_lose == b.user_stats.total_gold_lose) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
    return b.user_stats.total_gold_lose - a.user_stats.total_gold_lose;
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {
      ...userDatas[i].getSimpleInfo(),
      value: userDatas[i].user_stats.total_gold_lose,
      rank: i + 1
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.TOTAL_GOLD_LOSE, leaderboards, resetTime);
}

async function BackupDailyGoldLoseLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.daily_reset_time == b.user_stats.daily_reset_time) {
      if(a.user_stats.daily_gold_lose == b.user_stats.daily_gold_lose) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
      return b.user_stats.daily_gold_lose - a.user_stats.daily_gold_lose;
    }
    let aResetTime = new Date(a.user_stats.daily_reset_time);
    let bResetTime = new Date(b.user_stats.daily_reset_time);
    return bResetTime.getTime() - aResetTime.getTime();
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {};
    let aResetTime = new Date(userDatas[i].user_stats.daily_reset_time);
    if(aResetTime < resetTime) {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: 0,
        rank: i + 1
      }
    }
    else {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: userDatas[i].user_stats.daily_gold_lose,
        rank: i + 1
      }
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.DAILY_GOLD_LOSE, leaderboards, resetTime);
}

async function BackupWeeklyGoldLoseLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.weekly_reset_time == b.user_stats.weekly_reset_time) {
      if(a.user_stats.weekly_gold_lose == b.user_stats.weekly_gold_lose) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
      return b.user_stats.weekly_gold_lose - a.user_stats.weekly_gold_lose;
    }
    let aResetTime = new Date(a.user_stats.weekly_reset_time);
    let bResetTime = new Date(b.user_stats.weekly_reset_time);
    return bResetTime.getTime() - aResetTime.getTime();
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {};
    let aResetTime = new Date(userDatas[i].user_stats.weekly_reset_time);
    if(aResetTime < resetTime) {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: 0,
        rank: i + 1
      }
    }
    else {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: userDatas[i].user_stats.weekly_gold_lose,
        rank: i + 1
      }
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.WEEKLY_GOLD_LOSE, leaderboards, resetTime);
}

async function BackupTotalGameWinLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.total_game_win == b.user_stats.total_game_win) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
    return b.user_stats.total_game_win - a.user_stats.total_game_win;
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {
      ...userDatas[i].getSimpleInfo(),
      value: userDatas[i].user_stats.total_game_win,
      rank: i + 1
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.TOTAL_GAME_WIN, leaderboards, resetTime);
}

async function BackupDailyGameWinLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.daily_reset_time == b.user_stats.daily_reset_time) {
      if(a.user_stats.daily_game_win == b.user_stats.daily_game_win) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
      return b.user_stats.daily_game_win - a.user_stats.daily_game_win;
    }
    let aResetTime = new Date(a.user_stats.daily_reset_time);
    let bResetTime = new Date(b.user_stats.daily_reset_time);
    return bResetTime.getTime() - aResetTime.getTime();
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {};
    let aResetTime = new Date(userDatas[i].user_stats.daily_reset_time);
    if(aResetTime < resetTime) {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: 0,
        rank: i + 1
      }
    }
    else {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: userDatas[i].user_stats.daily_game_win,
        rank: i + 1
      }
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.DAILY_GAME_WIN, leaderboards, resetTime);
}

async function BackupWeeklyGameWinLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.weekly_reset_time == b.user_stats.weekly_reset_time) {
      if(a.user_stats.weekly_game_win == b.user_stats.weekly_game_win) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
      return b.user_stats.weekly_game_win - a.user_stats.weekly_game_win;
    }
    let aResetTime = new Date(a.user_stats.weekly_reset_time);
    let bResetTime = new Date(b.user_stats.weekly_reset_time);
    return bResetTime.getTime() - aResetTime.getTime();
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {};
    let aResetTime = new Date(userDatas[i].user_stats.weekly_reset_time);
    if(aResetTime < resetTime) {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: 0,
        rank: i + 1
      }
    }
    else {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: userDatas[i].user_stats.weekly_game_win,
        rank: i + 1
      }
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.WEEKLY_GAME_WIN, leaderboards, resetTime);
}

async function BackupTotalGameLoseLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.total_game_lose == b.user_stats.total_game_lose) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
    return b.user_stats.total_game_lose - a.user_stats.total_game_lose;
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {
      ...userDatas[i].getSimpleInfo(),
      value: userDatas[i].user_stats.total_game_lose,
      rank: i + 1
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.TOTAL_GAME_LOSE, leaderboards, resetTime);
}

async function BackupDailyGameLoseLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.daily_reset_time == b.user_stats.daily_reset_time) {
      if(a.user_stats.daily_game_lose == b.user_stats.daily_game_lose) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
      return b.user_stats.daily_game_lose - a.user_stats.daily_game_lose;
    }
    let aResetTime = new Date(a.user_stats.daily_reset_time);
    let bResetTime = new Date(b.user_stats.daily_reset_time);
    return bResetTime.getTime() - aResetTime.getTime();
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {};
    let aResetTime = new Date(userDatas[i].user_stats.daily_reset_time);
    if(aResetTime < resetTime) {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: 0,
        rank: i + 1
      }
    }
    else {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: userDatas[i].user_stats.daily_game_lose,
        rank: i + 1
      }
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.DAILY_GAME_LOSE, leaderboards, resetTime);
}

async function BackupWeeklyGameLoseLeaderboard(userDataList: CacheUserData[], resetTime: Date) {
  let userDatas = userDataList.sort(function(a, b){
    if(a.user_stats.weekly_reset_time == b.user_stats.weekly_reset_time) {
      if(a.user_stats.weekly_game_lose == b.user_stats.weekly_game_lose) {
        let aUpdateAt = new Date(a.updatedAt);
        let bUpdateAt = new Date(b.updatedAt);
        return aUpdateAt.getTime() - bUpdateAt.getTime();
      }
      return b.user_stats.weekly_game_lose - a.user_stats.weekly_game_lose;
    }
    let aResetTime = new Date(a.user_stats.weekly_reset_time);
    let bResetTime = new Date(b.user_stats.weekly_reset_time);
    return bResetTime.getTime() - aResetTime.getTime();
  });

  let leaderboards = [];
  for(var i = 0; i < userDatas.length; i++) {
    let leaderboardItem = {};
    let aResetTime = new Date(userDatas[i].user_stats.weekly_reset_time);
    if(aResetTime < resetTime) {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: 0,
        rank: i + 1
      }
    }
    else {
      leaderboardItem = {
        ...userDatas[i].getSimpleInfo(),
        value: userDatas[i].user_stats.weekly_game_lose,
        rank: i + 1
      }
    }
    leaderboards.push(leaderboardItem);
  }
  SaveLeaderboardAndExportToCSV(LEADERBOARD_TYPE.WEEKLY_GAME_LOSE, leaderboards, resetTime);
}

async function SaveLeaderboardAndExportToCSV(leaderboardName: string, data: any[], resetTime: Date) {
  Logger.info(`Backup leaderboard leaderboardName: ${leaderboardName} length: ${data.length}`);
  SaveLeaderboard(leaderboardName, data);
  await Leaderboard.findOneAndUpdate(
    { name: leaderboardName },
    { leaderboards: data },
    {
      new: true,
      upsert: true, // Make this update into an upsert
    }
  );
  const filename = `${leaderboardName}_${formatDateYYYYMMDD(resetTime)}.csv`;
  let headers: any = [];
  switch(leaderboardName) {
    case LEADERBOARD_TYPE.TOTAL_GOLD_EARN:
    case LEADERBOARD_TYPE.TOTAL_GOLD_LOSE:
    case LEADERBOARD_TYPE.DAILY_GOLD_EARN:
    case LEADERBOARD_TYPE.DAILY_GOLD_LOSE:
    case LEADERBOARD_TYPE.WEEKLY_GOLD_EARN:
    case LEADERBOARD_TYPE.WEEKLY_GOLD_LOSE:
      headers = ['Name', 'MezonId', 'Ranking', 'Gold'];
      break;
    case LEADERBOARD_TYPE.TOTAL_GAME_WIN:
    case LEADERBOARD_TYPE.TOTAL_GAME_LOSE:
    case LEADERBOARD_TYPE.DAILY_GAME_WIN:
    case LEADERBOARD_TYPE.DAILY_GAME_LOSE:
    case LEADERBOARD_TYPE.WEEKLY_GAME_WIN:
    case LEADERBOARD_TYPE.WEEKLY_GAME_LOSE:
      headers = ['Name', 'MezonId', 'Ranking', 'Game'];
      break;
  }
  await writeDataToCSV(headers, data, filename);
}

export async function startCronJobs() {
  // Run every minute
  cron.schedule('55 * * * *', async () => {
    let resetDaily = getTimeAtStartOfDay(app_constant.gameParameter.timeZone);
    let resetWeekly = getTimeAtStartOfWeek(app_constant.gameParameter.timeZone);

    console.log('⏰ Running task every hour at minute 55: ', new Date().toISOString());
    try {
      const userDataList = await GetAllUserDataByPattern();
      await BackupTotalGoldEarnLeaderboard(userDataList, resetWeekly);
      await BackupDailyGoldEarnLeaderboard(userDataList, resetDaily);
      await BackupWeeklyGoldEarnLeaderboard(userDataList, resetWeekly);

      await BackupTotalGoldLoseLeaderboard(userDataList, resetWeekly);
      await BackupDailyGoldLoseLeaderboard(userDataList, resetDaily);
      await BackupWeeklyGoldLoseLeaderboard(userDataList, resetWeekly);

      await BackupTotalGameWinLeaderboard(userDataList, resetWeekly);
      await BackupDailyGameWinLeaderboard(userDataList, resetDaily);
      await BackupWeeklyGameWinLeaderboard(userDataList, resetWeekly);

      await BackupTotalGameLoseLeaderboard(userDataList, resetWeekly);
      await BackupDailyGameLoseLeaderboard(userDataList, resetDaily);
      await BackupWeeklyGameLoseLeaderboard(userDataList, resetWeekly);
    } catch (err) {
      Logger.error(`Error cron job err: ${err}`);
    }
  });

  // Run every day at midnight
  // cron.schedule('0 0 * * *', async () => {
  //   console.log('🌙 Running daily midnight task', new Date().toISOString());
  // });
}