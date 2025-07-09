import { Schema, model, Document } from 'mongoose';

export interface ICouponReward {
  [key: string]: any; // flexible object, adapt if you know the exact shape
}

export interface ICoupon extends Document {
  code: string;
  type: string;
  reward: ICouponReward;
  max_use: number;
  remain_use: number;
  start_time: Date;
  end_time: Date;
  claimable: boolean;
  canUseSameType: boolean;
  canUseSameCode: boolean;

  getInfo(): {
    code: string;
    type: string;
    reward: ICouponReward;
    start_time: Date;
    end_time: Date;
    claimable: boolean;
    max_use: number;
    remain_use: number;
    canUseSameType: boolean;
    canUseSameCode: boolean;
  };
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, default: '' },
    type: { type: String, default: '' },
    reward: { type: Object, required: true },
    max_use: { type: Number, default: 0 },
    remain_use: { type: Number, default: 0 },
    start_time: { type: Date, default: Date.now },
    end_time: { type: Date, default: Date.now },
    claimable: { type: Boolean, default: true },
    canUseSameType: { type: Boolean, default: false },
    canUseSameCode: { type: Boolean, default: false },
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

CouponSchema.index({ code: 1 });
CouponSchema.index({ claimable: 1 });

CouponSchema.methods.getInfo = function () {
  return {
    code: this.code,
    type: this.type,
    reward: this.reward,
    start_time: this.start_time,
    end_time: this.end_time,
    claimable: this.claimable,
    max_use: this.max_use,
    remain_use: this.remain_use,
    canUseSameType: this.canUseSameType,
    canUseSameCode: this.canUseSameCode,
  };
};

const Coupon = model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
