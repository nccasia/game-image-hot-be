const components = {
  components: {
    schemas: {
      access_token: {
        type: "string",
        description: "Access to authorize user",
        example:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjYxNjBhNDc0YWEwZWZlMjc5ODkxOTUwIiwidXNlckRhdGFJZCI6IjY2MWRlM2Q1MjFlMTk2ODE0NjQ1YWQ0NyIsImlhdCI6MTcxMzMyNTU0NywiZXhwIjoxNzEzNDExOTQ3fQ.qixrFcAfYUoZmLccglBTUmIMkn9Ll6sf2sFkVbf1ZsY",
      },
      address: {
        type: "string", // data type
        description: "An ethereum address", // desc
        example: "0xfffff90a30f83c5ca60b3c088213ad6a9b0bc4ec", // example of an id
      },
      dateTime: {
        type: "integer", // data-type
        format: "date-time",
        description: "time created", // desc
        example: 1687862867783, // example of a title
      },
      dateTimeStr: {
        type: "string", // data-type
        format: "date-time",
        description: "time created", // desc
        example: "2024-04-17T09:14:53.746Z", // example of a title
      },
      signature: {
        type: "string", // data type
        description: "An ethereum address", // desc
        example:
          "0x3509260860b64b5f5d38f9ab4c2a25bb8d16eb13092823698400df15901d6c0946f4e238eba0feda213c7e58c4b4ac3048974ab5338f8e3c7bf7e0f2ae27e25c1c", // example of an id
      },
      message: {
        type: "string", // data type
        description: "An ethereum address", // desc
        example:
          "0xc6d3e99aa8850836f35100e2035688fd2e75622905567fdf6c21ff47ace05a1f", // example of an id
      },
      txhash: {
        type: "string", // data type
        description: "transaction hash", // desc
        example:
          "be92efcd3412fa9d94c687435ed72cd767eff883bca91bcd7868e83d0357e770", // example of an txhash
      },
      GameParameter: {
        type: "object",
        properties: {
          version: {
            type: "integer",
            example: 1,
          },
          timeZone: {
            type: "integer",
            example: 0,
          },
          limit_coupon_failed_per_day: {
            type: "integer",
            example: 3,
          },
          rating_factor: {
            type: "integer",
            example: 32,
          },
        },
      },
      GameAchievementData: {
        type: "object",
        properties: {
          achievement_id: {
            type: "integer",
            example: 1,
          },
          achievement_type: {
            type: "string",
          },
          amount: {
            type: "integer",
            example: 1,
          },
          reward_currency_type: {
            type: "string",
          },
          reward_currency_amount: {
            type: "integer",
            example: 1,
          },
          icon: {
            type: "string",
          },
          max_reward_claims_per_day: {
            type: "integer",
            example: 1,
          },
        },
      },
      GameDCLBundleData: {
        type: "object",
        properties: {
          bundleName: {
            type: "string",
          },
          version: {
            type: "string",
            example: "",
          },
          type: {
            type: "string",
          },
          rootPath: {
            type: "string",
          },
          priority: {
            type: "integer",
            example: 1,
          },
        },
      },
      GameInitialConfigData: {
        type: "object",
        properties: {
          initial_config_id: {
            type: "integer",
            example: 1,
          },
          initial_coin: {
            type: "integer",
            example: 1,
          },
          initial_gem: {
            type: "integer",
            example: 1,
          },
          initial_orb: {
            type: "integer",
            example: 1,
          },
        }
      },
      GameBasicQuestData: {
        type: "object",
        properties: {
          quest_id: {
            type: "integer",
            example: 1,
          },
          quest_type: {
            type: "string",
          },
          quest_category: {
            type: "string",
          },
          quest_name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          quest_quantity: {
            type: "integer",
            example: 1,
          },
          reward_currency_type: {
            type: "string",
          },
          reward_currency_amount: {
            type: "integer",
            example: 1,
          },
          external_link: {
            type: "string",
          },
          disable: {
            type: "integer",
            example: 1,
          },
        },
      },
      GameDailyQuestData: {
        type: "object",
        properties: {
          quest_id: {
            type: "integer",
            example: 1,
          },
          quest_type: {
            type: "string",
          },
          quest_category: {
            type: "string",
          },
          quest_name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          quest_quantity: {
            type: "integer",
            example: 1,
          },
          reward_currency_type: {
            type: "string",
          },
          reward_currency_amount: {
            type: "integer",
            example: 1,
          },
          external_link: {
            type: "string",
          },
          disable: {
            type: "integer",
            example: 1,
          },
        },
      },
      GameCouponData: {
        type: "object",
        properties: {
          code: {
            type: "string",
          },
          type: {
            type: "string",
          },
          reward: {
            type: "object",
            properties: {
              Gold: {
                type: "number",
                example: 1,
              },
              Gem: {
                type: "number",
                example: 1,
              },
            },
          },
          max_use: {
            type: "integer",
            example: 1,
          },
          remain_use: {
            type: "integer",
            example: 1,
          },
          start_time: {
            $ref: "#/components/schemas/dateTimeStr",
          },
          end_time: {
            $ref: "#/components/schemas/dateTimeStr",
          },
          claimable: {
            type: "boolean",
            example: true,
          },
        },
      },
      GamePhotoData: {
        type: "object",
        properties: {
          photo_id: {
            type: "string",
          },
          name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          category: {
            type: "string",
          },
          filePath: {
            type: "string",
          },
          score: {
            type: "integer",
            example: 1,
          },
          disable: {
            type: "integer",
            example: 1,
          },
        },
      },
      userAccountData: {
        type: "object",
        properties: {
          userId: {
            type: "string",
          },
          email: {
            type: "string",
          },
          username: {
            type: "string",
          },
          account_type: {
            type: "string",
          },
          created_date: {
            $ref: "#/components/schemas/dateTimeStr",
          },
        },
      },
      userSimpleData: {
        type: "object",
        properties: {
          userId: {
            type: "string",
          },
          username: {
            type: "string",
          },
          mezonId: {
            type: "string",
          },
          level: {
            type: "integer",
            example: 1,
          },
        },
      },
      userFriendSimpleData: {
        type: "object",
        properties: {
          userId: {
            type: "string",
          },
          username: {
            type: "string",
          },
          level: {
            type: "integer",
          },
          friendCode: {
            type: "string",
          },
        },
      },
      userFriendData: {
        type: "object",
        properties: {
          friendCode: {
            type: "string",
            example: "d01676",
          },
          friends: {
            type: "array",
            items: {
              type: "string",
            },
          },
          invited: {
            type: "array",
            items: {
              type: "string",
            },
          },
          referrer: {
            type: "string",
            example: "a01cfg",
          },
          regularFriend: {
            type: "integer",
            example: 1,
          },
          premiumFriend: {
            type: "integer",
            example: 1,
          }
        },
      },
      UserAchievementData: {
        type: "object",
        properties: {
          user_achievement_id: {
            type: "integer",
            example: 1,
          },
          achievement_id: {
            type: "integer",
            example: 1,
          },
          amount: {
            type: "number",
            example: 1.1,
          },
          claimable: {
            type: "boolean",
            example: false,
          },
          claimed: {
            type: "boolean",
            example: false,
          },
          claimed_today: {
            type: "integer",
            example: 1,
          },
        },
      },
      UserBaseData: {
        type: "object",
        properties: {
          user_gold: {
            type: "integer",
            example: 1,
          },
          user_gem: {
            type: "integer",
            example: 1,
          },
        },
      },
      UserStatsData: {
        type: "object",
        properties: {
          total_gold_earn: {
            type: "integer",
            example: 1,
          },
          daily_gold_earn: {
            type: "integer",
            example: 1,
          },
          weekly_gold_earn: {
            type: "integer",
            example: 1,
          },
          daily_reset_time: {
            $ref: "#/components/schemas/dateTimeStr",
          },
          weekly_reset_time: {
            $ref: "#/components/schemas/dateTimeStr",
          },
        },
      },
      UserTutorialData: {
        type: "object",
        properties: {
          tutorial_id: {
            type: "integer",
            example: 1,
          },
          tutorial_name: {
            type: "string",
          },
          require_tutorial_name: {
            type: "string",
          },
          action_type: {
            type: "string",
          },
          recorded: {
            type: "integer",
            example: 1,
          },
        },
      },
      UserDailyQuestData: {
        type: "object",
        properties: {
          quest_id: {
            type: "integer",
            example: 1,
          },
          quest_type: {
            type: "string",
          },
          amount: {
            type: "integer",
            example: 1,
          },
          claimable: {
            type: "boolean",
            example: false,
          },
          claimed: {
            type: "boolean",
            example: false,
          },
        },
      },
      UserBasicQuestData: {
        type: "object",
        properties: {
          quest_id: {
            type: "integer",
            example: 1,
          },
          quest_type: {
            type: "string",
          },
          claimable: {
            type: "boolean",
            example: false,
          },
          claimed: {
            type: "boolean",
            example: false,
          },
        },
      },
      userData: {
        type: "object",
        properties: {
          userId: {
            type: "string",
          },
          userDataId: {
            type: "string",
          },
          username: {
            type: "string",
          },
          mezonId: {
            type: "string",
          },
          walletAddress: {
            type: "string",
          },
          level: {
            type: "integer",
            example: 1,
          },
          friendInfo: {
            $ref: "#/components/schemas/userFriendData",
          },
          user_achievement: {
            type: "array",
            items: {
              $ref: "#/components/schemas/UserAchievementData",
            },
          },
          user_data: {
            $ref: "#/components/schemas/UserBaseData",
          },
          user_stats: {
            $ref: "#/components/schemas/UserStatsData",
          },
          user_tutorial: {
            type: "array",
            items: {
              $ref: "#/components/schemas/UserTutorialData",
            },
          },
          user_daily_quest: {
            type: "array",
            items: {
              $ref: "#/components/schemas/UserDailyQuestData",
            },
          },
          user_basic_quest: {
            type: "array",
            items: {
              $ref: "#/components/schemas/UserBasicQuestData",
            },
          },
        },
      },
      userfriendInfo: {
        allOf: [
          {
            $ref: "#/components/schemas/userFriendSimpleData",
          },
          {
            type: "object",
            properties: {
              userCurrency: {
                $ref: "#/components/schemas/UserCurrency",
              },
            }
          }
        ],
      },
      UserCurrency: {
        type: "object",
        properties: {
          user_gold: {
            type: "integer",
            example: 1,
          },
          user_gem: {
            type: "integer",
            example: 1,
          },
        },
      },
      UserBalance: {
        type: "object",
        properties: {
          user: {
            type: "string",
            example: "1831536726649081856",
          },
          balance: {
            type: "integer",
            example: 1,
          },
          pendingBalance: {
            type: "integer",
            example: 1,
          },
        },
      },
      leaderboardItem: {
        type: "object",
        properties: {
          userId: {
            type: "string",
          },
          username: {
            type: "string",
          },
          value: {
            type: "number",
            example: 1.1,
          },
          rank: {
            type: "integer",
            example: 1,
          },
        }
      },
    },
  },
};

export default components;