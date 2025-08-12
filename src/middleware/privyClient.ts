import { PrivyClient } from '@privy-io/server-auth';
import * as dotenv from 'dotenv';
dotenv.config();

export const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,         // from Privy dashboard
  process.env.PRIVY_APP_SECRET!      // keep secret! do NOT expose to frontend
);

export const getPrivyUserInfoById = async (privyUserId: string) => {
  const privyUser = await privy.getUser(privyUserId);
  return privyUser;
}
