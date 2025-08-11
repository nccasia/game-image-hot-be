import { Schema, Document } from 'mongoose';

export interface IUserQuestData extends Document {
  quest_id: number;
  quest_type: string;
  amount: number;
  claimable: boolean;
  claimed: boolean;

  getInfo(): Omit<IUserQuestData, '_id' | '__v' | 'getInfo'>;
}

const UserQuestDataSchema = new Schema<IUserQuestData>(
  {
    quest_id: { type: Number, default: 0 },
    quest_type: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    claimable: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
  },
  {
    minimize: true,
    _id: false,
  }
);

UserQuestDataSchema.methods.getInfo = function () {
  return {
    quest_id: this.quest_id,
    quest_type: this.quest_type,
    amount: this.amount,
    claimable: this.claimable,
    claimed: this.claimed,
  };
};

UserQuestDataSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

export default UserQuestDataSchema;
