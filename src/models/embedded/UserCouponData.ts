import { Schema, Document } from 'mongoose';

export interface IUserCouponData extends Document {
  coupons: string[];
  coupon_types: string[];
  number_of_attempts: number;

  getInfo(): {
    coupons: string[];
    coupon_types: string[];
    number_of_attempts: number;
  };
}

const UserCouponDataSchema = new Schema<IUserCouponData>(
  {
    coupons: { type: [String], default: [] },
    coupon_types: { type: [String], default: [] },
    number_of_attempts: { type: Number, default: 5 },
  },
  {
    minimize: true,
    _id: false,
  }
);

UserCouponDataSchema.methods.getInfo = function () {
  return {
    coupons: this.coupons,
    coupon_types: this.coupon_types,
    number_of_attempts: this.number_of_attempts,
  };
};

UserCouponDataSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

export default UserCouponDataSchema;
