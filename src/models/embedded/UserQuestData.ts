import { Schema, Document } from 'mongoose';

export interface IUserQuestData extends Document {
  quest_id: number;
  quest_type: string;
  claimable: boolean;
  claimed: boolean;

  getInfo(): {
    quest_id: number;
    quest_type: string;
    claimable: boolean;
    claimed: boolean;
  };
}

const UserQuestDataSchema = new Schema<IUserQuestData>(
  {
    quest_id: { type: Number, default: 0 },
    quest_type: { type: String, default: '' },
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
    claimable: this.claimable,
    claimed: this.claimed,
  };
};

UserQuestDataSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

export default UserQuestDataSchema;
