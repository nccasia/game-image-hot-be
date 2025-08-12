import { Logger } from '../logger/winston-logger.config';
import cron from 'node-cron';
import { OnEndGameRecheck } from '../blockchain/service/GameMaster.service';

export async function ScheduleEndGame() {
  // Run every minute
  cron.schedule('*/30 * * * *', async () => {
    console.log('⏰ Running task every 30 minutes: ', new Date().toISOString());
    try {
      await OnEndGameRecheck();
    } catch (err) {
      Logger.error(`Error cron job err: ${err}`);
    }
  });
}