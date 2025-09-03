import { Logger } from '../logger/winston-logger.config';
import cron from 'node-cron';
import { app_constant, LEADERBOARD_TYPE } from '../config/constant';
import { getTimeAtStartOfDay, getTimeAtStartOfWeek } from '../utils/helper';
import { DeleteLeaderboard, GetLeaderboardTopRange } from '../redis/redis.utils';
import { formatDateYYYYMMDD, writeDataToCSV } from '../utils/helper';
import Leaderboard from '../models/Leaderboard';

async function BackupLeaderboard(leaderboardName: string, resetTime: Date) {
  let leaderboards = await GetLeaderboardTopRange(leaderboardName, 0, 0);
  SaveLeaderboardAndExportToCSV(leaderboardName, leaderboards, resetTime);
}

async function SaveLeaderboardAndExportToCSV(leaderboardName: string, data: any[], resetTime: Date) {
  Logger.info(`Backup leaderboard leaderboardName: ${leaderboardName} length: ${data.length}`);
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
    case LEADERBOARD_TYPE.TOTAL_GOLD_CHANGE:
    case LEADERBOARD_TYPE.TOTAL_CANDY_CHANGE:
    case LEADERBOARD_TYPE.DAILY_GOLD_EARN:
    case LEADERBOARD_TYPE.DAILY_GOLD_LOSE:
    case LEADERBOARD_TYPE.DAILY_GOLD_CHANGE:
    case LEADERBOARD_TYPE.DAILY_CANDY_CHANGE:
    case LEADERBOARD_TYPE.WEEKLY_GOLD_EARN:
    case LEADERBOARD_TYPE.WEEKLY_GOLD_LOSE:
    case LEADERBOARD_TYPE.WEEKLY_GOLD_CHANGE:
    case LEADERBOARD_TYPE.WEEKLY_CANDY_CHANGE:
      headers = [
        { key: 'userId', label: 'UserId' },
        { key: 'username', label: 'Name' },
        { key: 'mezonId', label: 'MezonId' },
        { key: 'rank', label: 'Ranking' },
        { key: 'value', label: 'Gold' },
      ];
      break;
    case LEADERBOARD_TYPE.TOTAL_GAME_WIN:
    case LEADERBOARD_TYPE.TOTAL_GAME_LOSE:
    case LEADERBOARD_TYPE.DAILY_GAME_WIN:
    case LEADERBOARD_TYPE.DAILY_GAME_LOSE:
    case LEADERBOARD_TYPE.WEEKLY_GAME_WIN:
    case LEADERBOARD_TYPE.WEEKLY_GAME_LOSE:
      headers = [
        { key: 'userId', label: 'UserId' },
        { key: 'username', label: 'Name' },
        { key: 'mezonId', label: 'MezonId' },
        { key: 'rank', label: 'Ranking' },
        { key: 'value', label: 'Game' },
      ];
      break;
  }
  await writeDataToCSV(headers, data, filename);
}

export async function startCronJobs() {
  cron.schedule('0 0 * * *', async () => {
    let resetDaily = getTimeAtStartOfDay(app_constant.gameParameter.timeZone);
    Logger.info('🧹 Resetting daily leaderboard', new Date().toISOString());
    try {
      await BackupLeaderboard(LEADERBOARD_TYPE.DAILY_GOLD_CHANGE, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.DAILY_GOLD_EARN, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.DAILY_GOLD_LOSE, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.DAILY_GAME_WIN, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.DAILY_GAME_LOSE, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.DAILY_CANDY_CHANGE, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.TOTAL_GOLD_CHANGE, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.TOTAL_GOLD_EARN, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.TOTAL_GOLD_LOSE, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.TOTAL_GAME_WIN, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.TOTAL_GAME_LOSE, resetDaily);
      await BackupLeaderboard(LEADERBOARD_TYPE.TOTAL_CANDY_CHANGE, resetDaily);
      await DeleteLeaderboard(LEADERBOARD_TYPE.DAILY_GOLD_CHANGE);
      await DeleteLeaderboard(LEADERBOARD_TYPE.DAILY_GOLD_EARN);
      await DeleteLeaderboard(LEADERBOARD_TYPE.DAILY_GOLD_LOSE);
      await DeleteLeaderboard(LEADERBOARD_TYPE.DAILY_GAME_WIN);
      await DeleteLeaderboard(LEADERBOARD_TYPE.DAILY_GAME_LOSE);
      await DeleteLeaderboard(LEADERBOARD_TYPE.DAILY_CANDY_CHANGE);
      Logger.info('✅ Daily leaderboard cleared');
    } catch (err) {
      Logger.error('❌ Failed to clear daily leaderboard:', err);
    }
  });

  cron.schedule('0 0 * * 1', async () => {
    let resetWeekly = getTimeAtStartOfWeek(app_constant.gameParameter.timeZone);
    Logger.info('🧹 Resetting weekly leaderboard', new Date().toISOString());
    try {
      await BackupLeaderboard(LEADERBOARD_TYPE.WEEKLY_GOLD_CHANGE, resetWeekly);
      await BackupLeaderboard(LEADERBOARD_TYPE.WEEKLY_GOLD_EARN, resetWeekly);
      await BackupLeaderboard(LEADERBOARD_TYPE.WEEKLY_GOLD_LOSE, resetWeekly);
      await BackupLeaderboard(LEADERBOARD_TYPE.WEEKLY_GAME_WIN, resetWeekly);
      await BackupLeaderboard(LEADERBOARD_TYPE.WEEKLY_GAME_LOSE, resetWeekly);
      await BackupLeaderboard(LEADERBOARD_TYPE.WEEKLY_CANDY_CHANGE, resetWeekly);
      await DeleteLeaderboard(LEADERBOARD_TYPE.WEEKLY_GOLD_CHANGE);
      await DeleteLeaderboard(LEADERBOARD_TYPE.WEEKLY_GOLD_EARN);
      await DeleteLeaderboard(LEADERBOARD_TYPE.WEEKLY_GOLD_LOSE);
      await DeleteLeaderboard(LEADERBOARD_TYPE.WEEKLY_GAME_WIN);
      await DeleteLeaderboard(LEADERBOARD_TYPE.WEEKLY_GAME_LOSE);
      await DeleteLeaderboard(LEADERBOARD_TYPE.WEEKLY_CANDY_CHANGE);
      
      Logger.info('✅ Weekly leaderboard cleared');
    } catch (err) {
      Logger.error('❌ Failed to clear weekly leaderboard:', err);
    }
  });
}