import { Schema, Document } from 'mongoose';

export interface IUserBaseData extends Document {
  user_gold: number;
  user_gem: number;
  getInfo(): {
    user_gold: number;
    user_gem: number;
  };
}

const UserBaseDataSchema = new Schema<IUserBaseData>(
  {
    user_gold: { type: Number, default: 0 },
    user_gem: { type: Number, default: 0 },
  },
  {
    minimize: true,
    _id: false, // subdocument, no _id
  }
);

UserBaseDataSchema.methods.getInfo = function () {
  return {
    user_gold: this.user_gold,
    user_gem: this.user_gem,
  };
};

UserBaseDataSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

export default UserBaseDataSchema;
