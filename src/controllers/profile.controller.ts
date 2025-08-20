import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as querystring from 'querystring';
import User from '../models/User';
import UserData from '../models/Userdata';
import { GetUserDataIdByMezonId, SaveUserDataIdByMezonId, GetUserData, SaveUserData, 
  GetUserDataIdByFriendCode, SetUserDataIdByFriendCode, GetRandomBotData } from '../redis/redis.utils';
import { isValidEmail, isValidReferralCode, isValidUsername } from '../utils/validator.utils';
import { ACCOUNT_TYPE } from '../config/constant';
import { GenerateHash, CreateShake256Hash } from '../utils/helper';
import { LoginMezonInUserServer } from '../utils/UserServerHelper';
import { UserServerSocket, IOReturn, Status } from '../services/userserverSocket.service';
import { getWalletBalance, getWalletBalanceInContract, getAvailableWalletBalanceInContract } from '../blockchain/service/GameMaster.service';

import * as dotenv from 'dotenv';
dotenv.config();

export const registerEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input;
    const { email, password, username } = req.body;
    Logger.info(`Request registerEmail email: ${email} username: ${username}`);
    // Validate user input
    if (!(email && password && username)) {
      Logger.warn(`Warning Business registerEmail ${ErrorMessage.MISSING_PARAMETER} email: ${email} username: ${username}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let emailLowerCase = email.toLowerCase().trim();
    if (!isValidEmail(emailLowerCase)) {
      Logger.warn(`Warning Business registerEmail ${ErrorMessage.INVALID_EMAIL_ADDRESS} email: ${emailLowerCase} isValidEmail: ${isValidEmail(emailLowerCase)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_EMAIL_ADDRESS, ErrorMessage.INVALID_EMAIL_ADDRESS)
      );
      return;
    }
    // Check if user already exist
    // Validate if user exist in our database
    let oldUser = await User.findOne({ email: emailLowerCase });

    if (oldUser) {
      Logger.warn(`Warning Business registerEmail ${ErrorMessage.EMAIL_ALREADY_EXIST} email: ${emailLowerCase}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.EMAIL_ALREADY_EXIST, ErrorMessage.EMAIL_ALREADY_EXIST)
      );
      return;
    }

    oldUser = await User.findOne({ username });
    if (oldUser) {
      Logger.warn(`Warning Business registerEmail ${ErrorMessage.USERNAME_ALREADY_EXIST} username: ${username}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USERNAME_ALREADY_EXIST, ErrorMessage.USERNAME_ALREADY_EXIST)
      );
      return;
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);
    // Create user in out database
    const user = await User.create({
      email: emailLowerCase, // sanitize: convert email to lowercase
      password: encryptedPassword,
      username,
      account_type: ACCOUNT_TYPE.EMAIL,
    });

    const secretKey = process.env.SV_JWT_TOKEN_KEY || "";
    const accessToken = jwt.sign( { user_id: user.id }, secretKey, {
      expiresIn: "24h",
    });
    await user.setAccessToken(accessToken);

    // Return User
    res.status(HttpStatusCode.CREATED).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        ...user.getInfo(),
        accessToken: user.accessToken,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error registerEmail ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const loginEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { email, password } = req.body;
    Logger.info(`Request loginEmail email: ${email}`);
    // Validate user input
    if (!(email && password)) {
      Logger.warn(`Warning Business loginEmail ${ErrorMessage.MISSING_PARAMETER} email: ${email}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let emailLowerCase = email.toLowerCase().trim();
    // Validate if user exist in our database
    const user = await User.findOne({ email: emailLowerCase });

    if (user && (await bcrypt.compare(password, user.password))) {
      let userData = await UserData.findOne({ userId: user.id.toString() });
      if (!userData) {
        userData = await UserData.create({
          userId: user.id,
          username: user.username,
        });
      }
      const secretKey = process.env.SV_JWT_TOKEN_KEY || "";
      // Create token
      const accessToken = jwt.sign(
        { userId: user.id.toString(), userDataId: userData.id.toString() },
        secretKey,
        {
          expiresIn: "24h",
        }
      );
      // save user token
      await user.setAccessToken(accessToken);

      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          //...user.getInfo(),
          accessToken: user.accessToken,
        },
      });
      return;
    }

    Logger.error(`Error loginEmail ${ErrorMessage.WRONG_USERNAME_OR_PASSWORD} email: ${email}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.WRONG_USERNAME_OR_PASSWORD, ErrorMessage.WRONG_USERNAME_OR_PASSWORD)
    );
    return;
  } catch (err) {
    Logger.error(`Error loginEmail ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const loginMezon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { authData } = req.body;
    Logger.info(`Request loginMezon authData: ${authData}`);
    if (!authData) {
      Logger.warn(`Warning Business loginMezon ${ErrorMessage.MISSING_PARAMETER} authData: ${authData}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }
    const arr = authData.split("&hash=");
    const hash = arr[1];
    const parsedData = querystring.decode(authData);
    if (typeof parsedData.user !== "string") {
      Logger.error("Error loginMezon Invalid user info in parsed data");
      res.status(HttpStatusCode.BAD_REQUEST).json(
        SendErrorMessage(ErrorCode.BAD_REQUEST, ErrorMessage.BAD_REQUEST)
      );
      return;
    }
    const userInfo = JSON.parse(parsedData.user);
    const userid = userInfo?.id;
    const username = userInfo?.username;
    //console.log(parsedData);
    let hashGenerate = GenerateHash(arr[0]);
    Logger.info(`Request loginMezon hash: ${hash} hashGenerate: ${hashGenerate}`);
    let isVerifyAuthorization = Boolean(hashGenerate === hash);
    if (!isVerifyAuthorization) {
      Logger.error(`Error loginMezon Auth Mezon Account Failed ${ErrorMessage.VALIDATE_HASH_FAILED} userid: ${userid} username: ${username} isVerifyAuthorization: ${isVerifyAuthorization} hash: ${hash} hashGenerate: ${hashGenerate}`);
      res.status(HttpStatusCode.BAD_REQUEST).json(
        SendErrorMessage(ErrorCode.VALIDATE_HASH_FAILED, ErrorMessage.VALIDATE_HASH_FAILED)
      );
      return;
    }

    const userServerData = await LoginMezonInUserServer(authData);
    if(userServerData.errorCode != 0) {
      Logger.error(`Error loginMezon Auth Mezon Account Failed ${ErrorMessage.VALIDATE_HASH_FAILED} userid: ${userid} username: ${username} isVerifyAuthorization: ${isVerifyAuthorization} hash: ${hash} hashGenerate: ${hashGenerate}`);
      res.status(HttpStatusCode.BAD_REQUEST).json(
        SendErrorMessage(ErrorCode.VALIDATE_HASH_FAILED, ErrorMessage.VALIDATE_HASH_FAILED)
      );
      return;
    }

    // Validate if user exist in our database
    let user = await User.findOne({ mezonId: userid });
    if(!user) {
      // Create user in our database
      if(username) {
        user = await User.create({
          mezonId: userid,
          username: username,
          account_type: "mezon",
        });
      }
      else {
        user = await User.create({
          mezonId: userid,
          username: userid,
          account_type: "mezon",
        });
      }
    }
    else {
      if(username && user.username != username) {
        await user.setUsername(username);
      }
    }

    let userData = await UserData.findOne({ userId: user.id });
    if (!userData) {
      userData = await UserData.create({
        userId: user.id,
        username: user.username,
        mezonId: userid,
      });

      //generate referral code
      if (userData.user_friend_info.friendCode == "") {
        let validReferralCode = false;
        let length = 2;
        let referralCode = "";
        do {
          length++;
          referralCode = CreateShake256Hash(userData.id, length);
          validReferralCode = await isValidReferralCode(referralCode);
        } while (!validReferralCode);
        await userData.saveReferralCode(referralCode);
      }
    } else {
      if(userData.username != user.username) {
        await userData.updateOne({ $set: { username: user.username } });
      }
    }
    let cacheUserDataId = await GetUserDataIdByMezonId(user.mezonId);
    if(!cacheUserDataId) {
      await SaveUserDataIdByMezonId(user.mezonId, userData.userId.toString());
    }
    let redisUserData = await GetUserData(userData.userId.toString());
    if(redisUserData) {
      await userData.SyncCacheData(redisUserData);
    }
    else {
      await SaveUserData(userData.userId.toString(), userData);
    }
    // Create token
    const accessToken = jwt.sign(
      { userId: user.id.toString(), userDataId: userData.id.toString() },
      process.env.SV_JWT_TOKEN_KEY || "",
      {
        expiresIn: "24h",
      }
    );
    // save user token
    await user.setAccessToken(accessToken);

    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        //...user.getInfo(),
        accessToken: user.accessToken,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error loginMezon ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { password, new_password } = req.body;
    // Validate user input
    if (!(password && new_password)) {
      Logger.warn(`Warning Business changePassword ${ErrorMessage.MISSING_PARAMETER}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    //Encrypt user password
    const encryptedNewPassword = await bcrypt.hash(new_password, 10);

    const user = await User.findById(req.user_jwt.userId);

    if (user && (await bcrypt.compare(password, user.password))) {
      // Validate if user exist in our database
      const updateUser = await User.findByIdAndUpdate(req.user_jwt.userId, {
        password: encryptedNewPassword,
      });

      if (updateUser) {
        res.status(HttpStatusCode.OK).json({
          serverTime: new Date(),
          error_code: ErrorCode.NONE,
          data: {
            id: updateUser._id,
          },
        });
        return;
      }
    }

    Logger.warn(`Warning Business changePassword ${ErrorMessage.COULD_NOT_CHANGE_PASSWORD}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.COULD_NOT_CHANGE_PASSWORD,ErrorMessage.COULD_NOT_CHANGE_PASSWORD)
    );
    return;
  } catch (err) {
    Logger.error(`Error changePassword ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const getProfileData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    Logger.info(`Request getProfileData ${JSON.stringify(req.user_jwt)}`);
    let userData = await UserData.findById(req.user_jwt.userDataId);
    
    if(userData) {
      let redisUserData = await GetUserData(req.user_jwt.userId);
      if(redisUserData) {
        userData.SyncCacheData(redisUserData);
      }

      //generate referral code
      if (userData.user_friend_info.friendCode == "") {
        let validReferralCode = false;
        let length = 2;
        let referralCode = "";
        do {
          length++;
          referralCode = CreateShake256Hash(userData.id, length);
          validReferralCode = await isValidReferralCode(referralCode);
        } while (!validReferralCode);
        await userData.saveReferralCode(referralCode);
      }
      
      await userData.updateData();
      await SaveUserData(userData.userId.toString(), userData);
      let cacheUserDataId = await GetUserDataIdByFriendCode(userData.user_friend_info.friendCode);
      if(!cacheUserDataId) {
        await SetUserDataIdByFriendCode(userData.user_friend_info.friendCode, userData.userId.toString());
      }
      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          ...userData.getInfo(),
        },
      });
      return;
    }
    Logger.error(`Error getProfileData ${ErrorMessage.USER_NOT_FOUND} userId: ${req.user_jwt.userId} userData: ${userData}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error getProfileData ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const AddCurrencyToAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { userDataId, gold, gem } = req.body;
    Logger.info(`Request AddCurrencyToAccount userDataId: ${userDataId} gold: ${gold} gem: ${gem}`);
    // Validate user input
    if (!(userDataId && gold && gem)) {
      Logger.warn(`Warning Business AddCurrencyToAccount ${ErrorMessage.MISSING_PARAMETER} userDataId: ${userDataId} gold: ${gold} gem: ${gem}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }
    // Validate if user exist in our database
    //const userData = await UserData.findById(userDataId);
    const userData = await GetUserData(userDataId);

    if (userData) {
      await userData.AdminAddCurrency(gold, gem);
      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          ...userData.getUserData(),
        }
      });
      return;
    }

    Logger.error(`Error AddCurrencyToAccount ${ErrorMessage.USER_NOT_FOUND} userDataId: ${userDataId} userData: ${userData}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error AddCurrencyToAccount ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const getBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    Logger.info(`Request getBalance ${JSON.stringify(req.user_jwt)}`);
    const userData = await GetUserData(req.user_jwt.userId);

    if(!userData) {
      Logger.error(`Error getBalance ${ErrorMessage.USER_NOT_FOUND} userId: ${req.user_jwt.userId} userData: ${userData}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }

    if(process.env.USE_USER_SERVER == 'true') {
      if(userData.mezonId == null || userData.mezonId == "") {
        Logger.error(`Warning getBalance ${userData.GetUserDataLogPrefix()} mezonId: ${userData.mezonId}`);
        res.status(HttpStatusCode.OK).json({
            status: 0,
            message: "OK",
            data: {
              user: userData.mezonId,
              balance: 0,
              pendingBalance: 0
            }
        });
        return;
      }
      UserServerSocket.instance.getBalance(userData.mezonId as string, (response: IOReturn) => {
        res.status(HttpStatusCode.OK).json({
            ...response,
        });
        return;
      });
    }
    else {
      if(userData.walletAddress == "" || userData.walletAddress == null) {
        Logger.error(`Error getBalance ${ErrorMessage.INVALID_WALLET} ${userData.GetUserDataLogPrefix()} walletAddress: ${userData.walletAddress}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.INVALID_WALLET, ErrorMessage.INVALID_WALLET)
        );
        return;
      }
      let balance = await getWalletBalance(userData.walletAddress);
      let contractBalance = await getWalletBalanceInContract(userData.walletAddress);
      let availableContractBalance = await getAvailableWalletBalanceInContract(userData.walletAddress);
      let pendingBalance = contractBalance - availableContractBalance;
      res.status(HttpStatusCode.OK).json({
        status: 0,
        message: "OK",
        data: {
          user: userData.userId,
          balance,
          contractBalance,
          availableContractBalance,
          pendingBalance,
        }
      });
      return;
    }
  } catch (err) {
    Logger.error(`Error getBalance ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const loginPrivy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { privyUserName } = req.body;
    Logger.info(`Request loginPrivy privyUserName: ${privyUserName}`);
    // Validate if user exist in our database
    let user = await User.findOne({ userPrivyId: req.user_privy });
    if(!user) {
      // Create user in our database
      if(privyUserName) {
        user = await User.create({
          userPrivyId: req.user_privy,
          username: privyUserName,
          account_type: ACCOUNT_TYPE.PRIVY,
        });
      }
      else {
        user = await User.create({
          userPrivyId: req.user_privy,
          username: req.user_privy,
          account_type: ACCOUNT_TYPE.PRIVY,
        });
      }
    }

    let userData = await UserData.findOne({ userId: user.id });
    if (!userData) {
      userData = await UserData.create({
        userId: user.id,
        username: user.username,
      });

      //generate referral code
      if (userData.user_friend_info.friendCode == "") {
        let validReferralCode = false;
        let length = 2;
        let referralCode = "";
        do {
          length++;
          referralCode = CreateShake256Hash(userData.id, length);
          validReferralCode = await isValidReferralCode(referralCode);
        } while (!validReferralCode);
        await userData.saveReferralCode(referralCode);
      }
    }
    else {
      let redisUserData = await GetUserData(userData.userId.toString());
      if(redisUserData && user.walletAddress != "" && redisUserData.walletAddress != user.walletAddress) {
        redisUserData.updateWallet(user.walletAddress);
      }
    }
    // Create token
    const accessToken = jwt.sign(
      { userId: user.id.toString(), userDataId: userData.id.toString() },
      process.env.SV_JWT_TOKEN_KEY || "",
      {
        expiresIn: "24h",
      }
    );
    // save user token
    await user.setAccessToken(accessToken);

    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        //...user.getInfo(),
        accessToken: user.accessToken,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error loginPrivy ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const linkWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { walletAddress } = req.body;
    Logger.info(`Request linkWallet user: ${JSON.stringify(req.user_jwt)} walletAddress: ${walletAddress}`);
    // Validate user input
    if (!walletAddress || walletAddress == "") {
      Logger.warn(`Warning Business linkWallet ${ErrorMessage.MISSING_PARAMETER} walletAddress: ${walletAddress}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    let userData = await GetUserData(req.user_jwt.userId);
    if(!userData) {
      Logger.error(`Error linkWallet ${ErrorMessage.USER_NOT_FOUND} userId: ${req.user_jwt.userId} userDataId: ${req.user_jwt.userDataId}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }

    let newWallet = walletAddress.toLowerCase();
    if(userData.walletAddress != newWallet) {
      userData.updateWallet(newWallet);

      let walletUserList = await User.find({walletAddress: newWallet});
      for(var walletUser of walletUserList) {
        await walletUser.updateOne({ $set: { 'walletAddress': "" } });

        let redisUserData = await GetUserData(walletUser.id.toString());
        if(redisUserData) {
          redisUserData.updateWallet("");
        }
      }
      const user = await User.findById(userData.userId);
      if(user) {
        await user.updateOne({ $set: { 'walletAddress': newWallet } });
      }
    }
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        walletAddress: userData.walletAddress,
      },
    });
    return;
  } catch (err) {
    Logger.error(`Error linkWallet ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const changeUserName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user input
    const { newUsername } = req.body;
    Logger.info(`Request ChangeUserName newUsername: ${newUsername}`);
    // Validate user input
    if (!newUsername) {
      Logger.warn(`Warning Business ChangeUserName ${ErrorMessage.MISSING_PARAMETER} newUsername: ${newUsername}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }

    if (!isValidUsername(newUsername)) {
      Logger.warn(`Warning Business ChangeUserName ${ErrorMessage.INVALID_USERNAME} newUsername: ${newUsername} isValidUsername: ${isValidUsername(newUsername)}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.INVALID_USERNAME, ErrorMessage.INVALID_USERNAME)
      );
      return;
    }
    // Validate if user exist in our database
    const userData = await GetUserData(req.user_jwt.userId);

    if (userData) {
      let oldUser = await UserData.findOne({ username: newUsername });
      if (oldUser && oldUser.userId.toString() != userData.userId.toString()) {
        Logger.warn(`Warning Business ChangeUserName ${ErrorMessage.USERNAME_ALREADY_EXIST} newUsername: ${newUsername}`);
        res.status(HttpStatusCode.OK).json(
          SendErrorMessage(ErrorCode.USERNAME_ALREADY_EXIST, ErrorMessage.USERNAME_ALREADY_EXIST)
        );
        return;
      }

      let dbUserData = await UserData.findById(req.user_jwt.userDataId);
      let dbUser = await User.findById(req.user_jwt.userId);
      if(dbUserData && dbUser) {
        await dbUserData.updateUserName(newUsername);
        await dbUser.setUsername(newUsername);
        await userData.updateUserName(newUsername);
      }
      res.status(HttpStatusCode.OK).json({
        serverTime: new Date(),
        error_code: ErrorCode.NONE,
        data: {
          username: userData.username,
        }
      });
      return;
    }

    Logger.error(`Error ChangeUserName ${ErrorMessage.USER_NOT_FOUND} userDataId: ${req.user_jwt.userDataId} userData: ${userData}`);
    res.status(HttpStatusCode.OK).json(
      SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
    );
    return;
  } catch (err) {
    Logger.error(`Error ChangeUserName ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};

export const getBotProfileData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { candyAmount } = req.query;
    Logger.info(`Request getBotProfileData candyAmount: ${candyAmount}`);
    const amount = Number(candyAmount);
    if(!amount || isNaN(amount) || amount <= 0) {
      Logger.warn(`Warning Business getBotProfileData ${ErrorMessage.MISSING_PARAMETER} candyAmount: ${candyAmount}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.MISSING_PARAMETER, ErrorMessage.MISSING_PARAMETER)
      );
      return;
    }
    let redisUserData = await GetRandomBotData(amount);
    if(!redisUserData) {
      Logger.error(`Error getBotProfileData ${ErrorMessage.USER_NOT_FOUND}`);
      res.status(HttpStatusCode.OK).json(
        SendErrorMessage(ErrorCode.USER_NOT_FOUND, ErrorMessage.USER_NOT_FOUND)
      );
      return;
    }
    res.status(HttpStatusCode.OK).json({
      serverTime: new Date(),
      error_code: ErrorCode.NONE,
      data: {
        ...redisUserData.getInfo(),
      }
    });
    return;
  } catch (err) {
    Logger.error(`Error getBotProfileData ${ErrorMessage.INTERNAL_SERVER_ERROR} err: ${err}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      SendErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, ErrorMessage.INTERNAL_SERVER_ERROR)
    );
    return;
  }
};