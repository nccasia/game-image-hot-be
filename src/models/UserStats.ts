import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserStats extends Document {
  userId: String;
  total_gold_earn: number;
  daily_gold_earn: number;
  weekly_gold_earn: number;
  total_gold_lose: number;
  daily_gold_lose: number;
  weekly_gold_lose: number;
  total_game_win: number;
  daily_game_win: number;
  weekly_game_win: number;
  total_game_lose: number;
  daily_game_lose: number;
  weekly_game_lose: number;

  getInfo(): {
    userId: String;
    total_gold_earn: number;
    daily_gold_earn: number;
    weekly_gold_earn: number;
    total_gold_lose: number;
    daily_gold_lose: number;
    weekly_gold_lose: number;
    total_game_win: number;
    daily_game_win: number;
    weekly_game_win: number;
    total_game_lose: number;
    daily_game_lose: number;
    weekly_game_lose: number;
  };
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    userId: { type: String, default: '' },
    total_gold_earn: { type: Number, default: 0 },
    daily_gold_earn: { type: Number, default: 0 },
    weekly_gold_earn: { type: Number, default: 0 },
    total_gold_lose: { type: Number, default: 0 },
    daily_gold_lose: { type: Number, default: 0 },
    weekly_gold_lose: { type: Number, default: 0 },
    total_game_win: { type: Number, default: 0 },
    daily_game_win: { type: Number, default: 0 },
    weekly_game_win: { type: Number, default: 0 },
    total_game_lose: { type: Number, default: 0 },
    daily_game_lose: { type: Number, default: 0 },
    weekly_game_lose: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserStatsSchema.methods.getInfo = function () {
  return {
    userId: this.userId,
    total_gold_earn: this.total_gold_earn,
    daily_gold_earn: this.daily_gold_earn,
    weekly_gold_earn: this.weekly_gold_earn,
    total_gold_lose: this.total_gold_lose,
    daily_gold_lose: this.daily_gold_lose,
    weekly_gold_lose: this.weekly_gold_lose,
    total_game_win: this.total_game_win,
    daily_game_win: this.daily_game_win,
    weekly_game_win: this.weekly_game_win,
    total_game_lose: this.total_game_lose,
    daily_game_lose: this.daily_game_lose,
    weekly_game_lose: this.weekly_game_lose,
  };
};

const UserStats = mongoose.model<IUserStats>('UserStats', UserStatsSchema);
export default UserStats;
