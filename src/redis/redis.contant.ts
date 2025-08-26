import { REDIS_KEY } from "../config/constant";

export function GetUserDataKey(userDataId: string) {
  return `${REDIS_KEY.GAME}.${REDIS_KEY.USER_DATA}:userdata:${userDataId}`;
}

export function GetUserFriendCodeKey(friendcode: string) {
  return `${REDIS_KEY.GAME}.${REDIS_KEY.FRIEND_CODE}:friendcode:${friendcode}`;
}

export function GetUserMezonIdKey(mezonId: string) {
  return `${REDIS_KEY.GAME}.${REDIS_KEY.MEZON}:mezonId:${mezonId}`;
}

export function GetAllUserDataPattern() {
  return `${REDIS_KEY.USER_DATA}:userdata:*`;
}

export function GetAllUserDataPatternByHashTag() {
  return `${REDIS_KEY.GAME}.${REDIS_KEY.USER_DATA}:userdata:*`;
}

export function GetLeaderboardKey(rankname: string) {
  return `${REDIS_KEY.GAME}.${REDIS_KEY.LEADERBOARD2}:${rankname}`;
}

export function GetGameDataConfigKey() {
  return `${REDIS_KEY.GAME}:gamedataconfig:lastupdate`;
}

export function GetCheckInKey(userDataId: string, questId: number) {
  return `${REDIS_KEY.GAME}.${REDIS_KEY.TRANSACTION}:checkin:${userDataId}:quest:${questId}`;
}

export function GetPurchaseKey(userDataId: string, storeProductId: number) {
  return `${REDIS_KEY.GAME}.${REDIS_KEY.TRANSACTION}:purchase:${userDataId}:storeproductid:${storeProductId}`;
}

export function GetPurchaseBonusKey() {
  return `${REDIS_KEY.GAME}:purchasebonus`;
}