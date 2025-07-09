import { Schema, model, Document } from 'mongoose';

export interface IGameParameter extends Document {
  version: number;
  timeZone: number;
  limit_coupon_failed_per_day: number;
  rating_factor: number;
  random_question_amount: number;

  getInfo(): {
    version: number;
    timeZone: number;
    limit_coupon_failed_per_day: number;
    rating_factor: number;
    random_question_amount: number;
  };
}

const GameParameterSchema = new Schema<IGameParameter>(
  {
    version: { type: Number, default: 0 },
    timeZone: { type: Number, default: 7 },
    limit_coupon_failed_per_day: { type: Number, default: 3 },
    rating_factor: { type: Number, default: 32 },
    random_question_amount: { type: Number, default: 5 },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.id;
      },
    },
  }
);

GameParameterSchema.methods.getInfo = function () {
  return {
    version: this.version,
    timeZone: this.timeZone,
    limit_coupon_failed_per_day: this.limit_coupon_failed_per_day,
    rating_factor: this.rating_factor,
    random_question_amount: this.random_question_amount,
  };
};

const GameParameter = model<IGameParameter>('GameParameter', GameParameterSchema);
export default GameParameter;
