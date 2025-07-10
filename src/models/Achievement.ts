import { Schema, model, Document } from 'mongoose';

export interface IAchievement extends Document {
  achievement_id: number;
  achievement_type: string;
  name: string;
  description: string;
  amount: number;
  reward_currency_type: string;
  reward_currency_amount: number;
  icon: string;
  max_reward_claims_per_day: number;
  disable: number;

  getInfo(): {
    achievement_id: number;
    achievement_type: string;
    name: string;
    description: string;
    amount: number;
    reward_currency_type: string;
    reward_currency_amount: number;
    icon: string;
    max_reward_claims_per_day: number;
    disable: number;
  };
}

const AchievementSchema = new Schema<IAchievement>(
  {
    achievement_id: { type: Number, default: 0 },
    achievement_type: { type: String, default: '' },
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    reward_currency_type: { type: String, default: '' },
    reward_currency_amount: { type: Number, default: 0 },
    icon: { type: String, default: '' },
    max_reward_claims_per_day: { type: Number, default: 1 },
    disable: { type: Number, default: 0 },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.id;
      },
    },
  }
);

// Indexes
AchievementSchema.index({ achievement_type: 1 });
AchievementSchema.index({ amount: 1 });
AchievementSchema.index({ reward_currency_type: 1 });

// Methods
AchievementSchema.methods.getInfo = function () {
  return {
    achievement_id: this.achievement_id,
    achievement_type: this.achievement_type,
    name: this.name,
    description: this.description,
    amount: this.amount,
    reward_currency_type: this.reward_currency_type,
    reward_currency_amount: this.reward_currency_amount,
    icon: this.icon,
    max_reward_claims_per_day: this.max_reward_claims_per_day,
    disable: this.disable,
  };
};

const Achievement = model<IAchievement>('Achievement', AchievementSchema);
export default Achievement;
