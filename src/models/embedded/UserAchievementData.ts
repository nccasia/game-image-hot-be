import { Schema, Document } from 'mongoose';

// Define interface for embedded document
export interface IUserAchievementData extends Document {
  user_achievement_id: number;
  achievement_id: number;
  amount: number;
  claimable?: boolean;
  claimed?: boolean;
  claimed_today: number;
  last_claimed_time?: Date;

  getInfo(): Omit<IUserAchievementData, '_id' | '__v' | 'getInfo'>;
}

const UserAchievementDataSchema = new Schema<IUserAchievementData>(
  {
    user_achievement_id: { type: Number, default: 0 },
    achievement_id: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    claimable: { type: Boolean, default: undefined },
    claimed: { type: Boolean, default: undefined },
    claimed_today: { type: Number, default: 0 },
    last_claimed_time: { type: Date, default: undefined },
  },
  {
    minimize: true,
    _id: false, // prevents automatic _id for subdocs
  }
);

// Add method
UserAchievementDataSchema.methods.getInfo = function () {
  return {
    user_achievement_id: this.user_achievement_id,
    achievement_id: this.achievement_id,
    amount: this.amount,
    claimed_count: this.claimed_today,
  };
};

UserAchievementDataSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

export default UserAchievementDataSchema;
