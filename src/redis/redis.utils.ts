import { Logger } from "../logger/winston-logger.config";
import redisClient from "./redis.config";
import redlock from "./redlock.config";
import { Cluster } from "ioredis";
import { GetGameDataConfigKey, GetUserMezonIdKey, GetUserDataKey, GetUserFriendCodeKey, GetAllUserDataPatternByHashTag, GetLeaderboardKey } from "./redis.contant";
import { CacheUserData } from "./redis.userData";

export async function GetRedisKeyData(key: string, retryCount: number = 5): Promise<any> {
  try {
    //Logger.info(`GetRedisKeyData key: ${key}`);
    let lock = await redlock.acquire([`locks:${key}`], 1000); // 1 sec lock
    try {
      const data = await redisClient.get(`${key}`);
      return data;
    } finally {
      await lock.release(); // Always release the lock
    }
  } catch (err) {
    Logger.info(`Failed to acquire lock for key: ${key}. Retrying... (${retryCount} attempts left`);
    if (retryCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
      return await GetRedisKeyData(key, retryCount - 1); // Retry with a decrementing counter
    } else {
      Logger.info(`Failed to acquire lock for key: ${key} after multiple attempts: ${err}`);
    }
  }
}

export async function SetRedisKeyData(key: string, data: any, retryCount: number = 5): Promise<void> {
  try {
    //Logger.info(`SetRedisKeyData key: ${key}`);
    let lock = await redlock.acquire([`locks:${key}`], 1000); // 1 sec lock
    try {
      await redisClient.set(`${key}`, data);
    } finally {
      await lock.release(); // Always release the lock
    }
  } catch (err) {
    Logger.info(`Failed to acquire lock for key: ${key}. Retrying... (${retryCount} attempts left`);
    if (retryCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
      return await SetRedisKeyData(key, data, retryCount - 1); // Retry with a decrementing counter
    } else {
      Logger.info(`Failed to acquire lock for key: ${key} after multiple attempts: ${err}`);
    }
  }
}

export async function GetGameDataConfigUpdateTime() {
  return await GetRedisKeyData(GetGameDataConfigKey());
}

export async function SaveGameDataConfigUpdateTime() {
  let currentTime = new Date();
  return await SetRedisKeyData(GetGameDataConfigKey(), currentTime.toISOString());
}

export async function GetUserDataIdByMezonId(mezonId: string) {
  return await GetRedisKeyData(GetUserMezonIdKey(mezonId));
}

export async function SaveUserDataIdByMezonId(mezonId: string, userId: string) {
  return await SetRedisKeyData(GetUserMezonIdKey(mezonId), userId);
}

export async function GetUserData(userId: string): Promise<CacheUserData> {
  let cacheUserData = await GetRedisKeyData(GetUserDataKey(userId));
  if(cacheUserData) {
    return new CacheUserData(JSON.parse(cacheUserData));
  }
  return cacheUserData;
}

export async function SaveUserData(userId: string, userData: any) {
  return await SetRedisKeyData(GetUserDataKey(userId), JSON.stringify(userData));
}

export async function GetUserDataIdByFriendCode(friendCode: string) {
  return GetRedisKeyData(GetUserFriendCodeKey(friendCode));
}

export async function SetUserDataIdByFriendCode(friendCode: string, userId: string) {
  return await SetRedisKeyData(GetUserFriendCodeKey(friendCode), userId);
}

export async function GetUserDataByFriendCode(friendCode: string): Promise<CacheUserData> {
  let cacheUserDataId = await GetUserDataIdByFriendCode(friendCode);
  if(cacheUserDataId) {
    let cacheUserData = await GetUserData(cacheUserDataId);
    if(cacheUserData) {
      return cacheUserData;
    }
  }
  return cacheUserDataId;
}

export async function GetAllUserDataByPattern(): Promise<CacheUserData[]> {
  let values: any = [];
  const pattern = GetAllUserDataPatternByHashTag();
  if (redisClient instanceof Cluster) {
    const nodes = redisClient.nodes('all');

    const scanNode = async (node: any) => {
      let cursor = '0';
      do {
        const [nextCursor, foundKeys] = await node.scan(cursor, 'MATCH', pattern, 'COUNT', 1000);
        cursor = nextCursor;
        if (foundKeys.length > 0) {
          const chunkValues = await Promise.all(foundKeys.map((key: string) => redisClient.get(key)));
          values.push(...chunkValues.filter(Boolean));
        }
      } while (cursor !== '0');
    };

    await Promise.all(nodes.map((node: any) => scanNode(node)));
  }
  else {
    let cursor = '0';
    const keys: string[] = [];

    do {
      const [nextCursor, foundKeys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 1000);
      cursor = nextCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    if (keys.length > 0) {
      const fetchedValues = await redisClient.mget(...keys);
      values = fetchedValues.filter((v: string | null): v is string => v !== null);
    }
  }

  let result = values.map((element: any) => new CacheUserData(JSON.parse(element)));
  return result;
}

export async function SaveLeaderboard(rankname: string, data: any) {
  return await SetRedisKeyData(GetLeaderboardKey(rankname), JSON.stringify(data));
}

export async function GetLeaderboard(rankname: string): Promise<any> {
  try {
    let cacheLeaderboard = await GetRedisKeyData(GetLeaderboardKey(rankname));
    if(cacheLeaderboard) {
      return JSON.parse(cacheLeaderboard);
    }
    return [];
  }
  catch( err) {
    Logger.error(`Error GetLeaderboard rankname: ${rankname} err: ${err}`);
  }
}