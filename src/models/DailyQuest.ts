import { Schema, model, Document } from 'mongoose';

export interface IDailyQuest extends Document {
  quest_id: number;
  quest_type: string;
  quest_category: string;
  quest_name: string;
  description: string;
  quest_quantity: number;
  reward_currency_type: string;
  reward_currency_amount: number;
  external_link: string;
  disable: number;

  getInfo(): Omit<IDailyQuest, '_id' | '__v' | 'getInfo'>;
}

const DailyQuestSchema = new Schema<IDailyQuest>(
  {
    quest_id: { type: Number, default: 0 },
    quest_type: { type: String, default: '' },
    quest_category: { type: String, default: '' },
    quest_name: { type: String, default: '' },
    description: { type: String, default: '' },
    quest_quantity: { type: Number, default: 0 },
    reward_currency_type: { type: String, default: '' },
    reward_currency_amount: { type: Number, default: 0 },
    external_link: { type: String, default: '' },
    disable: { type: Number, default: 0 },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.id;
      },
    },
  }
);

DailyQuestSchema.methods.getInfo = function () {
  return {
    quest_id: this.quest_id,
    quest_type: this.quest_type,
    quest_category: this.quest_category,
    quest_name: this.quest_name,
    description: this.description,
    quest_quantity: this.quest_quantity,
    reward_currency_type: this.reward_currency_type,
    reward_currency_amount: this.reward_currency_amount,
    external_link: this.external_link,
    disable: this.disable,
  };
};

const DailyQuest = model<IDailyQuest>('DailyQuest', DailyQuestSchema);
export default DailyQuest;
