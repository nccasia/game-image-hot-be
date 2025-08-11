import { Schema, Document } from 'mongoose';

export interface IUserStatsData extends Document {
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
  total_gold_change: number;
  daily_gold_change: number;
  weekly_gold_change: number;
  daily_game: number;
  daily_reset_time: Date;
  weekly_reset_time: Date;

  getInfo(): Omit<IUserStatsData, '_id' | '__v' | 'getInfo'>;

  ResetData(): void;
}

const UserStatsDataSchema = new Schema<IUserStatsData>(
  {
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
    total_gold_change: { type: Number, default: 0 },
    daily_gold_change: { type: Number, default: 0 },
    weekly_gold_change: { type: Number, default: 0 },
    daily_game: { type: Number, default: 0 },
    daily_reset_time: { type: Date, default: Date.now },
    weekly_reset_time: { type: Date, default: Date.now },
  },
  {
    minimize: true,
    _id: false,
  }
);

UserStatsDataSchema.methods.getInfo = function () {
  return {
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
    total_gold_change: this.total_gold_change,
    daily_gold_change: this.daily_gold_change,
    weekly_gold_change: this.weekly_gold_change,
    daily_game: this.daily_game,
    daily_reset_time: this.daily_reset_time,
    weekly_reset_time: this.weekly_reset_time,
  };
};

UserStatsDataSchema.methods.ResetData = function () {
  this.total_gold_earn = 0;
  this.daily_gold_earn = 0;
  this.weekly_gold_earn = 0;
  this.total_gold_lose = 0;
  this.daily_gold_lose = 0;
  this.weekly_gold_lose = 0;
  this.total_game_win = 0;
  this.daily_game_win = 0;
  this.weekly_game_win = 0;
  this.total_game_lose = 0;
  this.daily_game_lose = 0;
  this.weekly_game_lose = 0;
  this.total_gold_change = 0;
  this.daily_gold_change = 0;
  this.weekly_gold_change = 0;
  this.daily_game = 0;
};

UserStatsDataSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

export default UserStatsDataSchema;
