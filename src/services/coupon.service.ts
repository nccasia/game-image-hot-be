import Coupon from "../models/Coupon";
import { COUPON_CHARACTER } from "../config/constant";

function generateCoupon(length: number) {
  let coupon = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * COUPON_CHARACTER.length);
    coupon += COUPON_CHARACTER[randomIndex];
  }
  return coupon;
}

export async function GenerateAndSaveUniqueCoupon(inputData: any) {
  const number_coupon = inputData.number_coupon;
  const type = inputData.type; 
  const length = inputData.length; 
  const reward = inputData.reward; 
  const max_use = inputData.max_use; 
  const start_time = inputData.start_time; 
  const end_time = inputData.end_time;
  const canUseSameType = inputData.canUseSameType;
  const canUseSameCode = inputData.canUseSameCode;

  let result = [];
  let coupon;
  for(let i = 0; i < number_coupon; i++) {
    let exists: boolean | null = true;
    while (exists) {
      coupon = generateCoupon(length);
      const found = await Coupon.exists({ code: coupon });
      exists = !!found;
    }
  
    const newCoupon = new Coupon({ code: coupon, type, reward, max_use, remain_use: max_use, start_time, end_time, canUseSameType, canUseSameCode });
    await newCoupon.save();
    result.push(coupon);
  }

  return result;
}

export async function GetCouponInfo(coupon_code: string) {
  return await Coupon.findOne({ code: coupon_code });
}