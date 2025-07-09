import { Logger } from '../logger/winston-logger.config';
import Achievement from "../models/Achievement";
import BasicQuest from "../models/BasicQuest";
import DailyQuest from "../models/DailyQuest";
import DLCBundle from "../models/DLCBundle";
import GameParameter from "../models/GameParameter";
import Photos from "../models/Photos";
import Tutorial from "../models/Tutorial";

import { GetGameDataConfigUpdateTime } from "../redis/redis.utils";

import dotenv from 'dotenv';
dotenv.config();

interface AppConstant {
  version: number;
  MIN_SEC: number;
  HOUR_SEC: number;
  DAY_TIME_SEC: number;
  gameParameter: any;
  achievement: any;
  basicQuest: any;
  dailyQuest: any;
  dlcBundle: any;
  photos: any;
  tutorial: any;
  gameDataConfigUpdateTime: string;
}

export const app_constant: AppConstant = {
  version: parseInt(process.env.GAME_PARAMETER_VERSION || "1"),
  MIN_SEC: 60,
  HOUR_SEC: 60 * 60,
  DAY_TIME_SEC: 24 * 60 * 60,
  gameParameter: 0,
  achievement: 0,
  basicQuest: 0,
  dailyQuest: 0,
  dlcBundle: 0,
  photos: 0,
  tutorial: 0,
  gameDataConfigUpdateTime: "",
};

export async function LoadDataConfig() {
  Logger.info(`LoadDataConfig version: ${app_constant.version}`);
  let currentTime = new Date();
  let gameParameter = await GameParameter.findOne({ version: app_constant.version });
  let achievement = await Achievement.find({});
  let basicQuest = await BasicQuest.find({ disable: 0});
  let dailyQuest = await DailyQuest.find({ disable: 0});
  let dlcBundle = await DLCBundle.find({});
  let photos = await Photos.find({ disable: 0});
  let tutorial = await Tutorial.find({});

  app_constant.gameParameter = gameParameter;
  app_constant.achievement = achievement.map((element) => element.getInfo());
  app_constant.basicQuest = basicQuest.map((element) => element.getInfo());
  app_constant.dailyQuest = dailyQuest.map((element) => element.getInfo());
  app_constant.dlcBundle = dlcBundle.map((element) => element.getInfo());
  app_constant.photos = photos.map((element) => element.getInfo());
  app_constant.tutorial = tutorial.map((element) => element.getInfo());

  app_constant.gameDataConfigUpdateTime = await GetGameDataConfigUpdateTime();
}

export enum REDIS_KEY {
  GAME = "{bestguess}",
  USER_DATA = "{userdata}",
  MEZON = "{mezon}",
  FRIEND_CODE = "{friendcode}",
  LEADERBOARD = "{leaderboard}",
  TRANSACTION = "{transaction}",
}

export enum DATA_FILE {
  ACHIEVEMENT = "achievement",
  BASIC_QUEST = "basic_quest",
  DAILY_QUEST = "daily_quest",
  DLC_BUNDLE = "dlc_bundle",
  GAME_PARAMETER = "game_parameters",
  PHOTOS = "photos",
  TUTORIAL = "tutorial",
}

export enum CURRENCY_TYPE {
  GOLD = "Gold",
  GEM = "Gem",
}

export enum BASIC_QUEST_TYPE {
  BOT_USER = "BotUser",
  JOIN_TELEGRAM = "JoinTelegram",
  FOLLOW_X = "FollowX",
  TELEGRAM_PREMIUM = "TelegramPremium",
  YOUTUBE = "Youtube",
  TWITTER_X = "TwitterX",
}

export enum DAILY_QUEST_TYPE {
  CHECK_IN = "CheckIn",
  LOGIN = "Login",
  DAILY_PURCHASE = "DailyPurchase",
  VISIT_CHANNEL = "VisitChannel",
  DAILY_INVITE = "DailyInvite",
  VISIT_WEBSITE = "VisitWebsite",
}

export enum ACHIEVEMENT_TYPE {
  COMPLETE_WAVE = "CompleteWave",
  SUMMON_COUNT = "SummonCount",
  KILL_ENEMY = "KillEnemy",
  WATCH_VIDEO = "WatchVideo",
  CHECK_IN = "CheckIn",
  PURCHASE = "Purchase",
  PURCHASE_FIRST_TIME = "PurchaseFirstTime",
  INVITE_REGULAR_FRIEND = "InviteRegularFriend",
  GEM_CONSUMPTION = "GemConsumption",
}

export enum GIFT_TYPE {
  SIGN_UP = "SIGN UP",
  LEVEL_UP = "LEVEL UP",
}

export enum LEADERBOARD_TYPE {
  TOTAL_GOLD_EARN = "total-gold-earn",
  TOTAL_GOLD_LOSE = "total-gold-lose",
  TOTAL_GAME_WIN = "total-game-win",
  TOTAL_GAME_LOSE = "total-game-lose",
  DAILY_GOLD_EARN = "daily-gold-earn",
  DAILY_GOLD_LOSE = "daily-gold-lose",
  DAILY_GAME_WIN = "daily-game-win",
  DAILY_GAME_LOSE = "daily-game-lose",
  WEEKLY_GOLD_EARN = "weekly-gold-earn",
  WEEKLY_GOLD_LOSE = "weekly-gold-lose",
  WEEKLY_GAME_WIN = "weekly-game-win",
  WEEKLY_GAME_LOSE = "weekly-game-lose",
}

export const COUNT_ACHIEVEMENT = 48;
export const COUPON_CHARACTER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export enum ACCOUNT_TYPE {
  EMAIL = "email",
  TELEGRAM = "telegram",
  PRIVY = "privy",
  ZKCANDY = "zkcandy",
  REOWN = "reown",
  MEZON = "mezon",
}

export enum TUTORIAL_ACTION {
  NONE = "None",
  STARTED = "Started",
  FINISHED = "Finished"
}

export enum PHOTO_CATEGORY {
  FOOD = "Food",
  DRINK = "Drink",
  STUFF = "Stuff",
  ANIMAL = "Animal",
  GIRL = "Girl",
  CELEBRITY = "Celebrity",
  CHARACTER = "Character",
  ANIME_MANGA = "AnimeManga",
  SEXY = "Sexy",
  MEN = "Men",
}

export enum RESPONSE_STATUS {
  SUCCESS = 0,
  ERROR = 1,
  WARNING = 2,
}

export enum RESPONSE_MESSAGE {
  SUCCESS = "OK",
  WARNING_PROFILE_NOT_FOUND = "Cannot get user data",
  WARNING_VALIDATE_HASH_FAILED = "Verify hash value mismatch",
  INTERNAL_SERVER_ERROR = "Internal server error",
  NOT_ENOUGH_BALANCE = "Not enough balance",
  NOT_ENOUGH_AVAILABLE_BALANCE = "You don't have enough available balance because it's already being used in another game.",
  NOT_ENOUGH_BETTING_BALANCE = "Not enough betting balance",
}