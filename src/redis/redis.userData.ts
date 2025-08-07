import { Logger } from '../logger/winston-logger.config';
import { SaveUserData } from './redis.utils';
import { app_constant, CURRENCY_TYPE, ACHIEVEMENT_TYPE, TUTORIAL_ACTION, BASIC_QUEST_TYPE, DAILY_QUEST_TYPE, CONTRACT_EVENT , LEADERBOARD_TYPE } from '../config/constant';
import { isSameDay, getTimeAtStartOfDay, getTimeAtStartOfWeek } from '../utils/helper';
import TransactionHistory from '../models/TransactionHistory';
import { createGameSignature, generateTxId } from '../services/signature.service';
import { ethers } from 'ethers';
import { SaveLeaderboard2 } from './redis.utils';

interface CacheData {
  _id: string;
  userId: string;
  username: string;
  mezonId?: string;
  walletAddress?: string;
  level?: number;
  isFirstTimeLogin?: boolean;
  user_friend_info?: any;
  user_data?: any;
  user_stats?: any;
  user_achievement?: any;
  user_tutorial?: any;
  user_daily_quest?: any;
  user_basic_quest?: any;
  user_coupon?: any;
  updatedAt: string;
}

export class CacheUserData {
  _id: string = '';
  userId: string = '';
  username?: string;
  mezonId?: string;
  walletAddress?: string;
  level?: number;
  isFirstTimeLogin?: boolean;
  user_friend_info?: any;
  user_data?: any;
  user_stats?: any;
  user_achievement?: any;
  user_tutorial?: any;
  user_daily_quest?: any;
  user_basic_quest?: any;
  user_coupon?: any;
  updatedAt: string = '';

  constructor(cacheData: Partial<CacheData>) {
    if (cacheData) {
      this.userId = cacheData.userId || '';
      this._id = cacheData._id || '';
      this.username = cacheData.username;
      this.mezonId = cacheData.mezonId;
      this.walletAddress = cacheData.walletAddress;
      this.level = cacheData.level;
      this.isFirstTimeLogin = cacheData.isFirstTimeLogin;
      this.user_friend_info = cacheData.user_friend_info;
      this.user_data = cacheData.user_data;
      this.user_stats = cacheData.user_stats;
      this.user_achievement = cacheData.user_achievement;
      this.user_tutorial = cacheData.user_tutorial;
      this.user_daily_quest = cacheData.user_daily_quest;
      this.user_basic_quest = cacheData.user_basic_quest;
      this.user_coupon = cacheData.user_coupon;
      this.updatedAt = cacheData.updatedAt || '';
    }
  }

  getInfo() {
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
      user_stats: this.user_stats,
      user_basic_quest: this.user_basic_quest,
      user_daily_quest: this.user_daily_quest,
      //user_coupon: this.user_coupon,
    };
  };
  
  getSimpleInfo() {
    return {
      userId: this.userId,
      //userDataId: this._id,
      username: this.username,
      mezonId: this.mezonId,
      level: this.level,
    };
  };
  
  getFriendSimpleInfo() {
    return {
      userId: this.userId,
      //userDataId: this._id,
      username: this.username,
      level: this.level,
      friendCode: this.user_friend_info.friendCode,
    };
  };
  
  getLevelInfo() {
    return {
      level: this.level,
    };
  };
  
  getFriendInfo() {
    return {
      user_friend_info: this.user_friend_info,
    };
  };
  
  getUserAchievement() {
    return {
      user_achievement: this.user_achievement,
    };
  };
  
  getUserData() {
    return {
      user_data: this.user_data,
    };
  };
  
  getUserCurrency() {
    return {
      user_gold: this.user_data.user_gold,
      user_gem: this.user_data.user_gem,
    }
  }

  getDailyGoldEarn() {
    return {
      value: this.user_stats.daily_gold_earn,
    }
  }

  getGold() {
    return {
      value: this.user_data.user_gold,
    };
  }
  
  GetUserDataLogPrefix(){
    return `User ${this.username} friendcode ${this.user_friend_info.friendCode} userId ${this.userId} userDataId ${this._id}`;
  }

  async SaveData() {
    await SaveUserData(this.userId || "", this);
  }
  
  /**
   * Save Referral Code
   */
  async saveReferralCode(friendCode: string) {
    if (this.user_friend_info.friendCode == "") {
      this.user_friend_info.friendCode = friendCode;
      Logger.info(`userDataId : ${this._id} user ${this.username} Generate friendCode code: ${this.user_friend_info.friendCode}`);
      await this.SaveData();
    }
  };
  
  /**
   * Save new user name
   * @param {*} username
   */
  async updateUserName(username: string) {
    if (this.username != username) {
      Logger.info(`${this.GetUserDataLogPrefix()} updateUserName username: ${this.username} newUserName: ${username}`);
      this.username = username;
      await this.SaveData();
    }
  };

  async updateWallet(walletAddress: string) {
    if(this.walletAddress != walletAddress) {
      Logger.info(`${this.GetUserDataLogPrefix()} updateWallet newWalletAddress: ${walletAddress} oldWalletAddress: ${this.walletAddress}`);
      this.walletAddress = walletAddress;

      await this.SaveData();
    }
  }
  
  /**
   * Get currency
   * @param {*} currencyType 
   * @returns 
   */
  GetCurrency(currencyType: CURRENCY_TYPE) {
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
  GetCurrencyAmount(currencyType: CURRENCY_TYPE) {
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
  CanSpendCurrency(currencyType: CURRENCY_TYPE, amount: number) {
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
  async SpendCurrency(currencyType: CURRENCY_TYPE, amount: number, saveProfile: boolean) {
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
        await this.SaveData();
      }
    }
    return result;
  };
  
  /**
   * Earn currency
   * @param {*} currencyType 
   * @param {*} amount 
   */
  async EarnCurrency(currencyType: CURRENCY_TYPE, amount: number, saveProfile: boolean) {
    if(amount > 0) {
      Logger.info(`${this.GetUserDataLogPrefix()} EarnCurrency currencyType: ${currencyType} amount: ${amount}`);
      switch(currencyType) {
        case CURRENCY_TYPE.GOLD:
          this.user_data.user_gold += amount;
          this.user_stats.daily_gold_earn += amount;
          this.user_stats.weekly_gold_earn += amount;
          this.user_stats.total_gold_earn += amount;
          break;
        case CURRENCY_TYPE.GEM:
          this.user_data.user_gem += amount;
          break;
        default:
          break;
      }
      if (saveProfile) {
        await this.SaveData();
      }
    }
  };
  
  async AdminAddCurrency(gold: number, gem: number) {
    Logger.info(`${this.GetUserDataLogPrefix()} AdminAddCurrency gold: ${gold} gem: ${gem}`);
    this.user_data.user_gold += gold;
    this.user_data.user_gem += gem;
    await this.SaveData();
  }
  
  GetAchievement(achievementId: number) {
    return this.user_achievement.find((element: any) => element.achievement_id == achievementId);
  }
  
  async UpdateAchievementAmount(achievementType: ACHIEVEMENT_TYPE, amount: number) {
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
  GetTutorial(tutorial_id: number) {
    return this.user_tutorial.find((element: any) => element.user_tutorial_id === tutorial_id);
  }
  
  /**
   * Get tutorial by name
   * @param {*} tutorial_name 
   * @returns 
   */
  GetTutorialByName(tutorial_name: string) {
    return this.user_tutorial.find((element: any) => element.tutorial_name === tutorial_name);
  }
  
  /**
   * Update tutorial
   * @param {*} tutorial_id 
   * @param {*} action_type 
   * @returns 
   */
  async updateTutorial(tutorial_id: number, action_type: TUTORIAL_ACTION) {
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
    await this.SaveData();
    return result;
  }
  
  
  /**
   * Check tutorial finish
   * @param {*} tutorial_name 
   * @returns 
   */
  IsTutorialFinished(tutorial_name = "Wave3LikeBubble") {
    let tutorial = this.GetTutorialByName(tutorial_name);
    if(tutorial != null) {
      return tutorial.action_type == TUTORIAL_ACTION.FINISHED;
    }
    return false;
  }
  
  async CanCollectUserAchievementReward(achievementId: number) {
    const achievementInfo = app_constant.achievement.find((element: any) => element.achievement_id == achievementId);
    let userAchievement = this.GetAchievement(achievementId);
    Logger.info(`${this.GetUserDataLogPrefix()} CanCollectUserAchievementReward achievementId: ${achievementId} amount: ${userAchievement.amount} require amount: ${achievementInfo.amount}`);
  
    const now = new Date();
    if (userAchievement.last_claimed_time && isSameDay(new Date(userAchievement.last_claimed_time), now)) {
      if (userAchievement.claimed_today >= achievementInfo.max_reward_claims_per_day) {
        Logger.info(`${this.GetUserDataLogPrefix()} CanCollectUserAchievementReward: Reached daily claim limit for today.`);
        return false;
      }
    } else {
      userAchievement.claimed_today = 0;
    }
  
    return userAchievement.amount >= achievementInfo.amount;
  }
  
  async CollectUserAchievementReward(achievementId: number) {
    Logger.info(`${this.GetUserDataLogPrefix()} CollectUserAchievementReward achievementId: ${achievementId}`);
    let result: any = {};
    const achievementInfo = app_constant.achievement.find((element: any) => element.achievement_id == achievementId);
    let userAchievement = this.GetAchievement(achievementId);
  
    await this.EarnCurrency(achievementInfo.reward_currency_type, achievementInfo.reward_currency_amount, false);
    userAchievement.claimed = true;
    userAchievement.claimable = false;
    let currentTime = new Date();
    userAchievement.amount = 0;
    userAchievement.claimed_today++;
    userAchievement.last_claimed_time = currentTime.toISOString();
    await this.SaveData();
    result.currencyType = achievementInfo.reward_currency_type;
    result.achievement = userAchievement;
    result.max_reward_claims_per_day = achievementInfo.max_reward_claims_per_day;
    Logger.info(`${this.GetUserDataLogPrefix()} CollectUserAchievementReward result: ${JSON.stringify(result)}`);
    return result;
  }
  
  getUserDailyQuestData() {
    return {
      user_daily_quest: this.user_daily_quest,
    };
  };
  
  getUserBasicQuestData() {
    return {
      user_basic_quest: this.user_basic_quest,
    };
  };
  
  GetUserDailyQuest(questId: number) {
    return this.user_daily_quest.find((element: any) => element.quest_id == questId);
  }
  
  GetDailyQuest(questId: number) {
    return app_constant.dailyQuest.find((element: any) => element.quest_id == questId);
  }
  
  GetDailyQuestByType(questType: string) {
    return app_constant.dailyQuest.find((element: any) => element.quest_type == questType);
  }
  
  async ClaimDailyQuest(questId: number, saveProfile: boolean = true) {
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
      await this.SaveData();
    }
    Logger.info(`${this.GetUserDataLogPrefix()} ClaimDailyQuest questId: ${questId} result: ${JSON.stringify(result)}`);
    return result;
  }
  
  GetUserBasicQuest(questId: number) {
    return this.user_basic_quest.find((element: any) => element.quest_id == questId);
  }
  
  GetUserBasicQuestByType(questType: string) {
    return this.user_basic_quest.find((element: any) => element.quest_type == questType);
  }
  
  GetBasicQuest(questId: number) {
    return app_constant.basicQuest.find((element: any) => element.quest_id == questId);
  }
  
  GetBasicQuestByType(questType: string) {
    return app_constant.basicQuest.find((element: any) => element.quest_type == questType);
  }
  
  async ClaimBasicQuest(questId: number, saveProfile: boolean = true) {
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
      await this.SaveData();
    }
    Logger.info(`${this.GetUserDataLogPrefix()} ClaimBasicQuest questId: ${questId} result: ${JSON.stringify(result)}`);
    return result;
  }
  
  async UpdateClaimableUserBasicQuest(questId: number) {
    let result: any = {};
    let userBasicQuest = this.GetUserBasicQuest(questId);
    userBasicQuest.claimable = true;

    await this.SaveData();
    result.basicQuest = userBasicQuest;
    Logger.info(`${this.GetUserDataLogPrefix()} UpdateClaimableUserBasicQuest result: ${JSON.stringify(result)}`);
    return result;
  }
  
  async UpdateClaimableUserDailyQuest(questId: number) {
    let result: any = {};
    let userDailyQuest = this.GetUserDailyQuest(questId);
    userDailyQuest.claimable = true;
    await this.SaveData();
    result.dailyQuest = userDailyQuest;
    Logger.info(`${this.GetUserDataLogPrefix()} UpdateClaimableUserDailyQuest result: ${JSON.stringify(result)}`);
    return result;
  }

  IsLimitInputCouponToday() {
    return this.user_coupon.number_of_attempts <= 0;
  }

  async IncreaseInputCouponFailed() {
    this.user_coupon.number_of_attempts--;
    await this.SaveData();
  }

  CanUseCouponType(type: string) {
    return !this.user_coupon.coupon_types.includes(type);
  }

  CanUseCouponCode(code: string) {
    return !this.user_coupon.coupons.includes(code);
  }

  async UseCoupon(couponInfo: any) {
    if(!this.user_coupon.coupon_types.includes(couponInfo.type)) {
      this.user_coupon.coupon_types.push(couponInfo.type);
    }
    if(!this.user_coupon.coupons.includes(couponInfo.code)) {
      this.user_coupon.coupons.push(couponInfo.code);
    }
    //todo add reward
    let resourcesName = Object.keys(couponInfo.reward);
    for(var resource of resourcesName) {
      if(Object.values(CURRENCY_TYPE).includes(resource as CURRENCY_TYPE)) {
        await this.EarnCurrency(resource as CURRENCY_TYPE, couponInfo.reward[resource], false);
      }
    }
    this.user_coupon.number_of_attempts = app_constant.gameParameter.limit_coupon_failed_per_day;
    await this.SaveData();

    let result: any = {};
    result.coupon = couponInfo;
    result.userCurrency = this.getUserCurrency();
    result.number_of_attempts = this.user_coupon.number_of_attempts;

    Logger.info(`${this.GetUserDataLogPrefix()} UseCoupon result: ${JSON.stringify(result)}`);
    return result;
  }

  async OnEndGame(isWin: boolean, amount: number) {
    let result: any = {};
    result.dailyQuest = [];
    Logger.info(`${this.GetUserDataLogPrefix()} OnEndGame isWin: ${isWin} amount: ${amount}`);
    if(isWin) {
      this.user_stats.total_gold_earn += amount;
      this.user_stats.daily_gold_earn += amount;
      this.user_stats.weekly_gold_earn += amount;
      this.user_stats.total_game_win += 1;
      this.user_stats.daily_game_win += 1;
      this.user_stats.weekly_game_win += 1;
      this.user_stats.total_gold_change += amount;
      this.user_stats.daily_gold_change += amount;
      this.user_stats.weekly_gold_change += amount;

      await SaveLeaderboard2(LEADERBOARD_TYPE.DAILY_GOLD_CHANGE, this.userId, amount);
      await SaveLeaderboard2(LEADERBOARD_TYPE.WEEKLY_GOLD_CHANGE, this.userId, amount);
      await SaveLeaderboard2(LEADERBOARD_TYPE.TOTAL_GOLD_CHANGE, this.userId, amount);

      await SaveLeaderboard2(LEADERBOARD_TYPE.TOTAL_GOLD_EARN, this.userId, amount);
      await SaveLeaderboard2(LEADERBOARD_TYPE.DAILY_GOLD_EARN, this.userId, amount);
      await SaveLeaderboard2(LEADERBOARD_TYPE.WEEKLY_GOLD_EARN, this.userId, amount);

      await SaveLeaderboard2(LEADERBOARD_TYPE.TOTAL_GAME_WIN, this.userId, 1);
      await SaveLeaderboard2(LEADERBOARD_TYPE.DAILY_GAME_WIN, this.userId, 1);
      await SaveLeaderboard2(LEADERBOARD_TYPE.WEEKLY_GAME_WIN, this.userId, 1);

      let dailyWins = await this.UpdateDailyQuestData(DAILY_QUEST_TYPE.DAILY_WIN, this.user_stats.daily_game_win);
      result.dailyQuest = [...result.dailyQuest, ...dailyWins];
      result.dailyGameWin = this.user_stats.daily_game_win;
    }
    else {
      this.user_stats.total_gold_lose += amount;
      this.user_stats.daily_gold_lose += amount;
      this.user_stats.weekly_gold_lose += amount;
      this.user_stats.total_game_lose += 1;
      this.user_stats.daily_game_lose += 1;
      this.user_stats.weekly_game_lose += 1;
      this.user_stats.total_gold_change -= amount;
      this.user_stats.daily_gold_change -= amount;
      this.user_stats.weekly_gold_change -= amount;

      await SaveLeaderboard2(LEADERBOARD_TYPE.DAILY_GOLD_CHANGE, this.userId, -amount);
      await SaveLeaderboard2(LEADERBOARD_TYPE.WEEKLY_GOLD_CHANGE, this.userId, -amount);
      await SaveLeaderboard2(LEADERBOARD_TYPE.TOTAL_GOLD_CHANGE, this.userId, -amount);

      await SaveLeaderboard2(LEADERBOARD_TYPE.TOTAL_GOLD_LOSE, this.userId, -amount);
      await SaveLeaderboard2(LEADERBOARD_TYPE.DAILY_GOLD_LOSE, this.userId, -amount);
      await SaveLeaderboard2(LEADERBOARD_TYPE.WEEKLY_GOLD_LOSE, this.userId, -amount);

      await SaveLeaderboard2(LEADERBOARD_TYPE.TOTAL_GAME_LOSE, this.userId, 1);
      await SaveLeaderboard2(LEADERBOARD_TYPE.DAILY_GOLD_LOSE, this.userId, 1);
      await SaveLeaderboard2(LEADERBOARD_TYPE.WEEKLY_GAME_LOSE, this.userId, 1);
    }
    this.user_stats.daily_game++;
    let dailyGames = await this.UpdateDailyQuestData(DAILY_QUEST_TYPE.DAILY_GAME, this.user_stats.daily_game);
    result.dailyQuest = [...result.dailyQuest, ...dailyGames];
    result.dailyGame = this.user_stats.daily_game;
    await this.SaveData();
    Logger.info(`${this.GetUserDataLogPrefix()} OnEndGame result: ${JSON.stringify(result)}`);
    return result;
  }

  async UpdateDailyQuestData(questType: DAILY_QUEST_TYPE, amount: number) {
    let result = [];
    const questInfo = app_constant.dailyQuest.filter((element: any) => element.quest_type == questType);
    for(var questItem of questInfo) {
      let userQuest = this.GetUserDailyQuest(questItem.quest_id);
      if(userQuest) {
        if(!userQuest.claimable && !userQuest.claimed && questItem.quest_quantity <= amount) {
          userQuest.amount = amount;
          userQuest.claimable = true;
          result.push(userQuest);
        }
        else {
          if(questItem.quest_quantity > amount) {
            userQuest.amount = amount;
            result.push(userQuest);
          }
        }
      }
    }
    if(result.length > 0) {
      Logger.info(`${this.GetUserDataLogPrefix()} UpdateDailyQuestData questType: ${questType} amount: ${amount} result: ${JSON.stringify(result)}`);
    }
    return result;
  }
}
