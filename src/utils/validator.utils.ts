import UserData from "../models/Userdata";

export function isValidEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export async function isValidReferralCode(referralCode: string): Promise<boolean> {
  const userData = await UserData.findOne({
    "user_friend_info.friendCode": referralCode,
  });

  // If someone already has this referral code, it's *not* valid to reuse
  return !userData;
}

