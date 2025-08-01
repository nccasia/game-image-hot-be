import { Logger } from '../logger/winston-logger.config';
import mongoose, { Schema, Document, Types } from 'mongoose';
import UserAchievementDataSchema, { IUserAchievementData } from './embedded/UserAchievementData';
import UserBaseDataSchema, { IUserBaseData } from './embedded/UserBaseData';
import UserStatsDataSchema, { IUserStatsData } from './embedded/UserStatsData';
import UserTutorialDataSchema, { IUserTutorialData } from './embedded/UserTutorialData';
import UserQuestDataSchema, { IUserQuestData } from './embedded/UserQuestData';
import UserCouponDataSchema, { IUserCouponData } from './embedded/UserCouponData';
import { app_constant, CURRENCY_TYPE, ACHIEVEMENT_TYPE, TUTORIAL_ACTION, BASIC_QUEST_TYPE, DAILY_QUEST_TYPE } from '../config/constant';
import { isSameDay, getTimeAtStartOfDay, getTimeAtStartOfWeek } from '../utils/helper';
import UserStats from '../models/UserStats';

// ---- Main Schema ---- //

export interface IUserData extends Document {
  userId: Types.ObjectId;
  username: string;
  mezonId: String;
  walletAddress: String;
  level: number;
  lastLoginTime: Date;
  isFirstTimeLogin: boolean;
  user_friend_info: {
    friendCode: string;
    friends: string[];
    invited: string[];
    referrer: string;
    regularFriend: number;
    premiumFriend: number;
  };
  user_achievement: IUserAchievementData[];
  user_data: IUserBaseData;
  user_stats: IUserStatsData;
  user_tutorial: IUserTutorialData[];
  user_daily_quest: IUserQuestData[];
  user_basic_quest: IUserQuestData[];
  user_coupon: IUserCouponData;
  user_pending_itx: string[];

  getInfo(): any;
  saveReferralCode(friendCode: string): Promise<void>;
  updateUserName(username: string): Promise<void>;
  updateData(): Promise<void>;
  SyncCacheData(cacheData: any): Promise<void>;
}

const UserDataSchema = new Schema<IUserData>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, default: '' },
    mezonId: { type: String, default: '' },
    walletAddress: { type: String, default: '' },
    level: { type: Number, default: 1 },
    lastLoginTime: { type: Date, default: Date.now },
    isFirstTimeLogin: { type: Boolean, default: true },
    user_friend_info: {
      friendCode: { type: String, default: '' },
      friends: { type: [String], default: [] },
      invited: { type: [String], default: [] },
      referrer: { type: String, default: '' },
      regularFriend: { type: Number, default: 0 },
      premiumFriend: { type: Number, default: 0 },
    },
    user_achievement: { type: [UserAchievementDataSchema], default: [] },
    user_data: { type: UserBaseDataSchema, default: () => ({ user_gold: 0, user_gem: 0 }) },
    user_stats: {
      type: UserStatsDataSchema,
      default: () => ({
        total_gold_earn: 0,
        daily_gold_earn: 0,
        weekly_gold_earn: 0,
        daily_reset_time: new Date(),
        weekly_reset_time: new Date(),
      }),
    },
    user_tutorial: { type: [UserTutorialDataSchema], default: [] },
    user_daily_quest: { type: [UserQuestDataSchema], default: [] },
    user_basic_quest: { type: [UserQuestDataSchema], default: [] },
    user_coupon: {
      type: UserCouponDataSchema,
      default: () => ({
        coupons: [],
        coupon_types: [],
        number_of_attempts: 5,
      }),
    },
    user_pending_itx: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ---- Indexes ----
UserDataSchema.index({ userId: 1 });
UserDataSchema.index({ mezonId: 1 });
UserDataSchema.index({ walletAddress: 1 });
UserDataSchema.index({ 'user_friend_info.friendCode': 1 });

UserDataSchema.methods.getInfo = function getInfo() {
  return {
    userId: this.userId,
    userDataId: this._id,
    username: this.username,
    mezonId: this.mezonId,
    walletAddress: this.walletAddress,
    level: this.level,
    user_friend_info: this.user_friend_info,
    user_achievement: this.user_achievement,
    user_data: this.user_data,
    user_basic_quest: this.user_basic_quest,
    user_daily_quest: this.user_daily_quest,
    user_coupon: this.user_coupon,
    user_pending_itx: this.user_pending_itx,
  };
};

UserDataSchema.methods.getSimpleInfo = function getSimpleInfo() {
  return {
    userDataId: this._id,
    username: this.username,
    level: this.level,
  };
};

UserDataSchema.methods.getFriendSimpleInfo = function getFriendSimpleInfo() {
  return {
    userDataId: this._id,
    username: this.username,
    level: this.level,
    friendCode: this.user_friend_info.friendCode,
  };
};

UserDataSchema.methods.getLevelInfo = function getLevelInfo() {
  return {
    level: this.level,
  };
};

UserDataSchema.methods.getFriendInfo = function getFriendInfo() {
  return {
    friendInfo: this.friendInfo,
  };
};

UserDataSchema.methods.getUserAchievement = function getUserAchievement() {
  return {
    user_achievement: this.user_achievement,
  };
};

UserDataSchema.methods.getUserData = function getUserData() {
  return {
    user_data: this.user_data,
  };
};

UserDataSchema.methods.getUserCurrency = function getUserCurrency() {
  return {
    user_gold: this.user_data.user_gold,
    user_gem: this.user_data.user_gem,
  }
}

UserDataSchema.methods.getDailyGoldEarn = function getDailyGoldEarn() {
  return {
    value: this.user_stats.daily_gold_earn,
  }
}

UserDataSchema.methods.getGold = function getGold() {
  return {
    value: this.user_data.user_gold,
  };
};

UserDataSchema.methods.GetUserDataLogPrefix = function GetUserDataLogPrefix(){
  return `User ${this.username} friendcode ${this.user_friend_info.friendCode} userId ${this.userId} userDataId ${this.id}`;
}

UserDataSchema.methods.saveReferralCode = async function (friendCode: string): Promise<void> {
  if (!this.user_friend_info.friendCode) {
    this.user_friend_info.friendCode = friendCode;
    Logger.info(`userDataId: ${this._id}, user: ${this.username}, generated friendCode: ${friendCode}`);
    
    await this.updateOne({
      $set: { "user_friend_info.friendCode": friendCode },
    });
  }
};

/**
 * Save new user name
 * @param {*} username
 */
UserDataSchema.methods.updateUserName = async function updateUserName(username: string): Promise<void> {
  if (this.username != username) {
    this.username = username;
    await this.updateOne({ $set: { username: this.username } });
  }
};

/**
 * Get currency
 * @param {*} currencyType 
 * @returns 
 */
UserDataSchema.methods.GetCurrency = function GetCurrency(currencyType: CURRENCY_TYPE) {
  let result: any = {};
  switch(currencyType) {
    case CURRENCY_TYPE.GOLD:
      result.user_gold = this.user_data.user_gold;
      break;
    case CURRENCY_TYPE.GEM:
      result.user_gem = this.user_data.user_gem;
      break;
  }
  return result;
}

/**
 * Get currency amount
 * @param {*} currencyType 
 * @returns 
 */
UserDataSchema.methods.GetCurrencyAmount = function GetCurrencyAmount(currencyType: CURRENCY_TYPE) {
  let result = 0;
  switch(currencyType) {
    case CURRENCY_TYPE.GOLD:
      result = this.user_data.user_gold;
      break;
    case CURRENCY_TYPE.GEM:
      result = this.user_data.user_gem;
      break;
  }
  return result;
}

/**
 * Can spend currency
 * @param {*} currencyType 
 * @param {*} amount 
 * @returns 
 */
UserDataSchema.methods.CanSpendCurrency = function CanSpendCurrency(currencyType: CURRENCY_TYPE, amount: number) {
  let result = false;
  switch(currencyType) {
    case CURRENCY_TYPE.GOLD:
      result = this.user_data.user_gold >= amount;
      break;
    case CURRENCY_TYPE.GEM:
      result = this.user_data.user_gem >= amount;
      break;
    default:
      break;
  }
  Logger.info(`${this.GetUserDataLogPrefix()} CanSpendCurrency currencyType: ${currencyType} amount: ${amount} result: ${result}`);
  return result;
};

/**
 * Spend currency
 * @param {*} currencyType 
 * @param {*} amount 
 * @returns 
 */
UserDataSchema.methods.SpendCurrency = async function SpendCurrency(currencyType: CURRENCY_TYPE, amount: number, saveProfile: boolean) {
  let result = [];
  if(amount > 0) {
    Logger.info(`${this.GetUserDataLogPrefix()} SpendCurrency currencyType: ${currencyType} amount: ${amount}`);
    switch(currencyType) {
      case CURRENCY_TYPE.GOLD:
        this.user_data.user_gold -= amount;
        break;
      case CURRENCY_TYPE.GEM:
        this.user_data.user_gem -= amount;
        result = await this.UpdateAchievementAmount(ACHIEVEMENT_TYPE.GEM_CONSUMPTION, amount);
        break;
      default:
        break;
    }
    if(saveProfile) {
      await this.updateOne({ 
        $set: { 
          'user_data': this.user_data,
          'user_achievement': this.user_achievement,
        } 
      });
    }
  }
  return result;
};

/**
 * Earn currency
 * @param {*} currencyType 
 * @param {*} amount 
 */
UserDataSchema.methods.EarnCurrency = async function EarnCurrency(currencyType: CURRENCY_TYPE, amount: number, saveProfile: boolean) {
  if(amount > 0) {
    Logger.info(`${this.GetUserDataLogPrefix()} EarnCurrency currencyType: ${currencyType} amount: ${amount}`);
    switch(currencyType) {
      case CURRENCY_TYPE.GOLD:
        this.user_data.user_gold += amount;
        this.user_stats.total_gold_earn += amount;
        this.user_stats.daily_gold_earn += amount;
        this.user_stats.weekly_gold_earn += amount;
        break;
      case CURRENCY_TYPE.GEM:
        this.user_data.user_gem += amount;
        break;
      default:
        break;
    }
    if (saveProfile) {
      await this.updateOne({ $set: { 'user_data': this.user_data, 'user_stats': this.user_stats } });
    }
  }
};

UserDataSchema.methods.AdminAddCurrency = async function AdminAddCurrency(gold: number, gem: number) {
  Logger.info(`${this.GetUserDataLogPrefix()} AdminAddCurrency gold: ${gold} gem: ${gem}`);
  this.user_data.user_gold += gold;
  this.user_data.user_gem += gem;
  await this.updateOne({ $set: { 'user_data': this.user_data } });
}

/**
 * Initialize achievement for new account
 */
UserDataSchema.methods.InitUserAchievement = async function InitUserAchievement(isReset: boolean) {
  if(isReset) {
    Logger.info(`${this.GetUserDataLogPrefix()} InitUserAchievement isReset: ${isReset}`);
    this.user_achievement = [];
  }
  let listAchievementId = app_constant.achievement.map((element: any) => element.achievement_id);
  this.user_achievement = this.user_achievement.filter((element: any) => listAchievementId.includes(element.achievement_id));

  const userAchievementIds = this.user_achievement.map((item: any) => item.achievement_id);
  const newAchievements = app_constant.achievement.filter((item: any) => !userAchievementIds.includes(item.achievement_id));
  if(this.user_achievement.length == 0 || (!!newAchievements && newAchievements.length > 0)) {
    for(let i = 0; i < newAchievements.length; i++) {
      let element = {
          achievement_id: newAchievements[i].achievement_id,
          amount: 0,
          claimable: false,
          claimed: false,
        }
      this.user_achievement.push(element);
    }
  }
}

/**
 * Initialize base data for new account
 */
UserDataSchema.methods.InitUserBaseData = async function InitUserBaseData(isReset: boolean) {
  if(this.isFirstTimeLogin || isReset) {
    Logger.info(`${this.GetUserDataLogPrefix()} InitUserBaseData isReset: ${isReset} isFirstTimeLogin: ${this.isFirstTimeLogin}`);
    this.user_data.user_gold = 0;
    this.user_data.user_gem = 0;
    this.user_coupon.number_of_attempts = app_constant.gameParameter.limit_coupon_failed_per_day;
    this.isFirstTimeLogin = false;
  }
}

UserDataSchema.methods.InitUserTutorialData = async function InitUserTutorialData(isReset: boolean) {
  if(isReset) {
    Logger.info(`${this.GetUserDataLogPrefix()} InitUserTutorialData isReset: ${isReset}`);
    this.user_tutorial = [];
  }
  let listTutorialId = app_constant.tutorial.map((element: any) => element.tutorial_id);
  this.user_tutorial = this.user_tutorial.filter((element: any) => listTutorialId.includes(element.tutorial_id));

  const userTutorialIds = this.user_tutorial.map((item: any) => item.tutorial_id);
  const newTutorials = app_constant.tutorial.filter((item: any) => !userTutorialIds.includes(item.tutorial_id));

  if(this.user_tutorial.length == 0 || (!!newTutorials && newTutorials.length > 0)) {
    for(let i = 0; i < newTutorials.length; i++) {
      let element = {
        tutorial_id: newTutorials[i].tutorial_id,
        tutorial_name: newTutorials[i].tutorial_name,
        require_tutorial_name: newTutorials[i].require_tutorial_name,
        action_type: TUTORIAL_ACTION.NONE,
        recorded: 0,
      }
      this.user_tutorial.push(element);
    }
  }
}

/**
 * Ininialize data for new account
 */
UserDataSchema.methods.InitData = async function InitData(isReset: boolean = false) {
  await this.InitUserAchievement(isReset);
  await this.InitUserBaseData(isReset);
  await this.InitUserTutorialData(isReset);
  await this.InitUserDailyQuest(isReset);
  await this.InitUserBasicQuest(isReset);
}

/**
 * Reset user data
 */
UserDataSchema.methods.ResetData = async function ResetData() {
  Logger.info(`${this.GetUserDataLogPrefix()} ResetData`);
  await this.InitData(true);
  this.user_stats.ResetData();
}

/**
 * Check and update user data when login
 */
UserDataSchema.methods.updateData = async function updateData() {
  let currentTime = new Date();
  await this.InitData();
  this.lastLoginTime = currentTime;

  await this.resetDailyData();
  
  await this.save();
}

UserDataSchema.methods.GetAchievement = function GetAchievement(achievementId: number) {
  return this.user_achievement.find((element: any) => element.achievement_id == achievementId);
}

UserDataSchema.methods.UpdateAchievementAmount = async function UpdateAchievementAmount(achievementType: ACHIEVEMENT_TYPE, amount: number) {
  let result = [];
  const achievementInfo = app_constant.achievement.filter((element: any) => element.achievement_type == achievementType);
  for(var achievementItem of achievementInfo) {
    let userAchievement = this.GetAchievement(achievementItem.achievement_id);
    if(userAchievement) {
      if(userAchievement.amount < achievementItem.amount) {
        userAchievement.amount += amount;
        if (userAchievement.amount >= achievementItem.amount) {
          userAchievement.amount = achievementItem.amount;
          userAchievement.claimable = true;
        }
        result.push(userAchievement);
      }
    }
  }
  Logger.info(`${this.GetUserDataLogPrefix()} UpdateAchievementAmount achievementType: ${achievementType} amount: ${amount} result: ${JSON.stringify(result)}`);
  return result;
}

/**
 * Get tutorial by id
 * @param {*} tutorial_id 
 * @returns 
 */
UserDataSchema.methods.GetTutorial = function GetTutorial(tutorial_id: number) {
  return this.user_tutorial.find((element: any) => element.user_tutorial_id === tutorial_id);
}

/**
 * Get tutorial by name
 * @param {*} tutorial_name 
 * @returns 
 */
UserDataSchema.methods.GetTutorialByName = function GetTutorialByName(tutorial_name: string) {
  return this.user_tutorial.find((element: any) => element.tutorial_name === tutorial_name);
}

/**
 * Update tutorial
 * @param {*} tutorial_id 
 * @param {*} action_type 
 * @returns 
 */
UserDataSchema.methods.updateTutorial = async function updateTutorial(tutorial_id: string, action_type: TUTORIAL_ACTION) {
  Logger.info(`${this.GetUserDataLogPrefix()} updateTutorial tutorial_id: ${tutorial_id} action_type: ${action_type}`);
  let result = [];
  let userTutorial = this.GetTutorial(tutorial_id);
  userTutorial.action_type = action_type;
  if(action_type == TUTORIAL_ACTION.FINISHED) {
    userTutorial.recorded = 1;
    result = this.user_tutorial.filter((element: any) => element.user_tutorial_id < tutorial_id && element.action_type != TUTORIAL_ACTION.FINISHED);
    for(let tutorial of result) {
      tutorial.action_type = action_type;
      tutorial.recorded = 1;
    }
  }
  result.push(userTutorial);
  await this.updateOne({ $set: { 'user_tutorial': this.user_tutorial } });
  return result;
}


/**
 * Check tutorial finish
 * @param {*} tutorial_name 
 * @returns 
 */
UserDataSchema.methods.IsTutorialFinished = function IsTutorialFinished(tutorial_name = "Wave3LikeBubble") {
  let tutorial = this.GetTutorialByName(tutorial_name);
  if(tutorial != null) {
    return tutorial.action_type == TUTORIAL_ACTION.FINISHED;
  }
  return false;
}

UserDataSchema.methods.CanCollectUserAchievementReward = async function CanCollectUserAchievementReward(achievementId: number) {
  const achievementInfo = app_constant.achievement.find((element: any) => element.achievement_id == achievementId);
  let userAchievement = this.GetAchievement(achievementId);
  Logger.info(`${this.GetUserDataLogPrefix()} CanCollectUserAchievementReward achievementId: ${achievementId} amount: ${userAchievement.amount} require amount: ${achievementInfo.amount}`);

  const now = new Date();
  if (userAchievement.last_claimed_time && isSameDay(userAchievement.last_claimed_time, now)) {
    if (userAchievement.claimed_today >= achievementInfo.max_reward_claims_per_day) {
      Logger.info(`${this.GetUserDataLogPrefix()} CanCollectUserAchievementReward: Reached daily claim limit for today.`);
      return false;
    }
  } else {
    userAchievement.claimed_today = 0;
  }

  return userAchievement.amount >= achievementInfo.amount;
}

UserDataSchema.methods.CollectUserAchievementReward = async function CollectUserAchievementReward(achievementId: number) {
  Logger.info(`${this.GetUserDataLogPrefix()} CollectUserAchievementReward achievementId: ${achievementId}`);
  let result: any = {};
  const achievementInfo = app_constant.achievement.find((element: any) => element.achievement_id == achievementId);
  let userAchievement = this.GetAchievement(achievementId);

  await this.EarnCurrency(achievementInfo.reward_currency_type, achievementInfo.reward_currency_amount, false);
  userAchievement.claimed = true;
  userAchievement.claimable = false;
  userAchievement.amount = 0;
  userAchievement.claimed_today++;
  userAchievement.last_claimed_time = new Date();
  await this.updateOne({
    $set: {
      'user_data': this.user_data,
      'user_achievement': this.user_achievement,
    }
  });
  result.currencyType = achievementInfo.reward_currency_type;
  result.achievement = userAchievement;
  result.max_reward_claims_per_day = achievementInfo.max_reward_claims_per_day;
  Logger.info(`${this.GetUserDataLogPrefix()} CollectUserAchievementReward result: ${JSON.stringify(result)}`);
  return result;
}

UserDataSchema.methods.getUserDailyQuestData = function getUserDailyQuestData() {
  return {
    user_daily_quest: this.user_daily_quest,
  };
};

UserDataSchema.methods.getUserBasicQuestData = function getUserBasicQuestData() {
  return {
    user_basic_quest: this.user_basic_quest,
  };
};

UserDataSchema.methods.InitUserBasicQuest = async function InitUserBasicQuest(isReset: boolean) {
  if (isReset) {
    Logger.info(`${this.GetUserDataLogPrefix()} InitUserBasicQuest isReset: ${isReset}`);
    this.user_basic_quest = [];
  }
  if (this.user_basic_quest.length == 0) {
    const basicQuest = app_constant.basicQuest;
    for (let i = 0; i < basicQuest.length; i++) {
      let element = {
        quest_id: basicQuest[i].quest_id,
        quest_type: basicQuest[i].quest_type,
        claimable: false,
        claimed: false,
      }
      if (basicQuest[i].quest_type == BASIC_QUEST_TYPE.BOT_USER) {
        element.claimable = true;
      }
      this.user_basic_quest.push(element);
    }
  }
  else {
    const basicQuest = app_constant.basicQuest;
    let listQuestId = basicQuest.map((element: any) => element.quest_id);
    this.user_basic_quest = this.user_basic_quest.filter((element: any) => listQuestId.includes(element.quest_id));
    if(this.user_basic_quest.length != basicQuest.length) {
      for(let i = 0; i < basicQuest.length; i++) {
        let userBasicQuest = this.user_basic_quest.find((element: any) => element.quest_id == basicQuest[i].quest_id);
        if(!userBasicQuest) {
          let element = {
            quest_id: basicQuest[i].quest_id,
            quest_type: basicQuest[i].quest_type,
            claimable: false,
            claimed: false,
          }
          if(basicQuest[i].quest_type == BASIC_QUEST_TYPE.BOT_USER) {
            element.claimable = true;
          }
          this.user_basic_quest.push(element);
        }
      }
    }
  }
}

/**
 * Init daily quest for new account
 */
UserDataSchema.methods.InitUserDailyQuest = async function InitUserDailyQuest(isReset: boolean) {
  if(isReset) {
    Logger.info(`${this.GetUserDataLogPrefix()} InitUserDailyQuest isReset: ${isReset}`);
    this.user_daily_quest = [];
  }
  if(this.user_daily_quest.length == 0) {
    const dailyQuest = app_constant.dailyQuest;
    for(let i = 0; i < dailyQuest.length; i++) {
      let element = {
        quest_id: dailyQuest[i].quest_id,
        quest_type: dailyQuest[i].quest_type,
        amount: 0,
        claimable: false,
        claimed: false,
      }
      if(dailyQuest[i].quest_type == DAILY_QUEST_TYPE.LOGIN) {
        element.amount = 1;
        element.claimable = true;
      }
      this.user_daily_quest.push(element);
    }
  }
  else {
    const dailyQuest = app_constant.dailyQuest;
    let listQuestId = dailyQuest.map((element: any) => element.quest_id);
    this.user_daily_quest = this.user_daily_quest.filter((element: any) => listQuestId.includes(element.quest_id));
    if(this.user_daily_quest.length != dailyQuest.length) {
      for(let i = 0; i < dailyQuest.length; i++) {
        let userDailyQuest = this.user_daily_quest.find((element: any) => element.quest_id == dailyQuest[i].quest_id);
        if(!userDailyQuest) {
          let element = {
            quest_id: dailyQuest[i].quest_id,
            quest_type: dailyQuest[i].quest_type,
            amount: 0,
            claimable: false,
            claimed: false,
          }
          if(dailyQuest[i].quest_type == DAILY_QUEST_TYPE.LOGIN) {
            element.amount = 1;
            element.claimable = true;
          }
          this.user_daily_quest.push(element);
        }
        else {
          if(userDailyQuest.quest_type != dailyQuest[i].quest_type) {
            userDailyQuest.quest_type = dailyQuest[i].quest_type;
          }
        }
      }
    }
  }
}

UserDataSchema.methods.GetUserDailyQuest = function GetUserDailyQuest(questId: number) {
  return this.user_daily_quest.find((element: any) => element.quest_id == questId);
}

UserDataSchema.methods.GetDailyQuest = function GetDailyQuest(questId: number) {
  return app_constant.dailyQuest.find((element: any) => element.quest_id == questId);
}

UserDataSchema.methods.GetDailyQuestByType = function GetDailyQuestByType(questType: string) {
  return app_constant.dailyQuest.find((element: any) => element.quest_type == questType);
}

UserDataSchema.methods.ClaimDailyQuest = async function ClaimDailyQuest(questId: number, saveProfile: boolean = true) {
  Logger.info(`${this.GetUserDataLogPrefix()} ClaimDailyQuest questId: ${questId}`);
  let result: any = {};
  let dailyQuestInfo = await this.GetDailyQuest(questId);
  let userDailyQuest = this.GetUserDailyQuest(questId);

  if (!userDailyQuest.claimed) {
    await this.EarnCurrency(dailyQuestInfo.reward_currency_type, dailyQuestInfo.reward_currency_amount, false);
    userDailyQuest.claimable = false;
    userDailyQuest.claimed = true;

    if (dailyQuestInfo.reward_currency_type == CURRENCY_TYPE.GEM) {
      result.increaseGem = dailyQuestInfo.reward_currency_amount;
    }
    else {
      result.increaseGold = dailyQuestInfo.reward_currency_amount;
    }
  }

  result.dailyQuest = userDailyQuest;
  result.userCurrency = this.getUserCurrency();

  if (saveProfile) {
    await this.updateOne({
      $set: {
        'user_data': this.user_data,
        'user_daily_quest': this.user_daily_quest,
      }
    });
  }
  Logger.info(`${this.GetUserDataLogPrefix()} ClaimDailyQuest result: ${JSON.stringify(result)}`);
  return result;
}

UserDataSchema.methods.GetUserBasicQuest = function GetUserBasicQuest(questId: number) {
  return this.user_basic_quest.find((element: any) => element.quest_id == questId);
}

UserDataSchema.methods.GetUserBasicQuestByType = function GetUserBasicQuestByType(questType: string) {
  return this.user_basic_quest.find((element: any) => element.quest_type == questType);
}

UserDataSchema.methods.GetBasicQuest = function GetBasicQuest(questId: number) {
  return app_constant.basicQuest.find((element: any) => element.quest_id == questId);
}

UserDataSchema.methods.GetBasicQuestByType = function GetBasicQuestByType(questType: string) {
  return app_constant.basicQuest.find((element: any) => element.quest_type == questType);
}

UserDataSchema.methods.ClaimBasicQuest = async function ClaimBasicQuest(questId: number, saveProfile: boolean = true) {
  Logger.info(`${this.GetUserDataLogPrefix()} ClaimBasicQuest questId: ${questId}`);
  let result: any = {};
  let basicQuestInfo = await this.GetBasicQuest(questId);
  let userBasicQuest = this.GetUserBasicQuest(questId);

  if (!userBasicQuest.claimed) {
    await this.EarnCurrency(basicQuestInfo.reward_currency_type, basicQuestInfo.reward_currency_amount, false);
    userBasicQuest.claimable = false;
    userBasicQuest.claimed = true;

    if (basicQuestInfo.reward_currency_type == CURRENCY_TYPE.GEM) {
      result.increaseGem = basicQuestInfo.reward_currency_amount;
    }
    else {
      result.increaseGold = basicQuestInfo.reward_currency_amount;
    }
  }

  result.basicQuest = userBasicQuest;
  result.userCurrency = this.getUserCurrency();

  if (saveProfile) {
    await this.updateOne({
      $set: {
        'user_data': this.user_data,
        'user_basic_quest': this.user_basic_quest,
      }
    });
  }
  Logger.info(`${this.GetUserDataLogPrefix()} ClaimBasicQuest result: ${JSON.stringify(result)}`);
  return result;
}

UserDataSchema.methods.UpdateClaimableUserBasicQuest = async function UpdateClaimableUserBasicQuest(questId: number) {
  let result: any = {};
  let userBasicQuest = this.GetUserBasicQuest(questId);
  userBasicQuest.claimable = true;
  await this.updateOne({
    $set: {
      'user_basic_quest': this.user_basic_quest,
    }
  });
  result.basicQuest = userBasicQuest;
  Logger.info(`${this.GetUserDataLogPrefix()} UpdateClaimableUserBasicQuest result: ${JSON.stringify(result)}`);
  return result;
}

UserDataSchema.methods.UpdateClaimableUserDailyQuest = async function UpdateClaimableUserDailyQuest(questId: number) {
  let result: any = {};
  let userDailyQuest = this.GetUserDailyQuest(questId);
  userDailyQuest.claimable = true;
  await this.updateOne({
    $set: {
      'user_daily_quest': this.user_daily_quest,
    }
  });
  result.dailyQuest = userDailyQuest;
  Logger.info(`${this.GetUserDataLogPrefix()} UpdateClaimableUserDailyQuest result: ${JSON.stringify(result)}`);
  return result;
}

/**
 * Reset daily data
 */
UserDataSchema.methods.resetDailyData = async function resetDailyData() {
  let resetDaily = getTimeAtStartOfDay(app_constant.gameParameter.timeZone);
  let resetWeekly = getTimeAtStartOfWeek(app_constant.gameParameter.timeZone);
  let isDaily = false;
  let isWeekly = false
  if(this.user_stats.daily_reset_time < resetDaily || this.user_stats.daily_reset_time > resetDaily) {
    this.user_stats.daily_reset_time = resetDaily;
    this.user_stats.daily_gold_earn = 0;
    this.user_stats.daily_gold_lose = 0;
    this.user_stats.daily_game_win = 0;
    this.user_stats.daily_game_lose = 0;
    this.user_stats.daily_game = 0;
    this.user_coupon.number_of_attempts = app_constant.gameParameter.limit_coupon_failed_per_day;

    isDaily = true;

    await this.InitUserDailyQuest(true);
  }
  if(this.user_stats.weekly_reset_time < resetWeekly || this.user_stats.weekly_reset_time > resetWeekly) {
    this.user_stats.weekly_reset_time = resetWeekly;
    this.user_stats.weekly_gold_earn = 0;
    this.user_stats.weekly_gold_lose = 0;
    this.user_stats.weekly_game_win = 0;
    this.user_stats.weekly_game_lose = 0;

    isWeekly = true;
  }
  if(isDaily || isWeekly) {
    let userStatsData = await UserStats.findOne({ userId: this.userId });
    if(userStatsData) {
      if(isDaily) {
        userStatsData.daily_gold_earn = 0;
        userStatsData.daily_gold_lose = 0;
        userStatsData.daily_game_win = 0;
        userStatsData.daily_game_lose = 0;
      }
      if(isWeekly) {
        userStatsData.weekly_gold_earn = 0;
        userStatsData.weekly_gold_lose = 0;
        userStatsData.weekly_game_win = 0;
        userStatsData.weekly_game_lose = 0;
      }
    }
  }
}

UserDataSchema.methods.SyncCacheData = async function SyncCacheData(cacheData: any) {
  this.level = cacheData.level;
  if(cacheData.walletAddress) {
    this.walletAddress = cacheData.walletAddress;
  }
  if(cacheData.user_friend_info) {
    this.user_friend_info = cacheData.user_friend_info;
  }
  if(cacheData.user_data) {
    this.user_data = cacheData.user_data;
  }
  if(cacheData.user_stats) {
    this.user_stats = cacheData.user_stats;
  }
  if(cacheData.user_achievement) {
    this.user_achievement = cacheData.user_achievement;
  }
  if(cacheData.user_tutorial) {
    this.user_tutorial = cacheData.user_tutorial;
  }
  if(cacheData.user_daily_quest) {
    this.user_daily_quest = cacheData.user_daily_quest;
  }
  if(cacheData.user_basic_quest) {
    this.user_basic_quest = cacheData.user_basic_quest;
  }
  if(cacheData.user_coupon) {
    this.user_coupon = cacheData.user_coupon;
  }
  if(cacheData.user_pending_itx) {
    this.user_pending_itx = cacheData.user_pending_itx;
  }
}

const UserData = mongoose.model<IUserData>('UserData', UserDataSchema);
export default UserData;
