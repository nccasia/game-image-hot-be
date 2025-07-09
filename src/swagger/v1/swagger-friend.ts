const swaggerFriend = {
  "/api/v1/friends/all": {
    get: {
      tags: ["Friend"],
      summary: "Get all friend info",
      parameters: [
        {
          name: "x-access-token",
          in: "header",
          schema: {
            $ref: "#/components/schemas/access_token",
          },
          required: true, // Mandatory param
        },
      ],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                properties: {
                  serverTime: {
                    $ref: "#/components/schemas/dateTimeStr",
                  },
                  error_code: {
                    type: "integer",
                  },
                  data: {
                    allOf: [
                      {
                        type: "object",
                        properties: {
                          friends: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/userfriendInfo",
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error",
          content: {
            "application/json": {
              examples: {
                error1: {
                  summary: "INTERNAL_SERVER_ERROR",
                  value: {
                    serverTime: "2023-07-10T06:47:19.683Z",
                    error_code: 500,
                    error_message: "INTERNAL_SERVER_ERROR",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/friends/invite-gift": {
    get: {
      tags: ["Friend"],
      summary: "Get available gift",
      parameters: [
        {
          name: "x-access-token",
          in: "header",
          schema: {
            $ref: "#/components/schemas/access_token",
          },
          required: true, // Mandatory param
        },
      ],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                properties: {
                  serverTime: {
                    $ref: "#/components/schemas/dateTimeStr",
                  },
                  error_code: {
                    type: "integer",
                  },
                  data: {
                    allOf: [
                      {
                        type: "object",
                        properties: {
                          gift: {
                            type: "array",
                            items: {
                              allOf: [
                                {
                                  $ref: "#/components/schemas/GamePlayerGiftData",
                                },
                                {
                                  $ref: "#/components/schemas/userFriendSimpleData",
                                }
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": {
              examples: {
                error1: {
                  summary: "USER_NOT_FOUND",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 7,
                    error_message: "USER_NOT_FOUND",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error",
          content: {
            "application/json": {
              examples: {
                error1: {
                  summary: "INTERNAL_SERVER_ERROR",
                  value: {
                    serverTime: "2023-07-10T06:47:19.683Z",
                    error_code: 500,
                    error_message: "INTERNAL_SERVER_ERROR",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/friends/claim-gift": {
    post: {
      tags: ["Friend"],
      summary: "Claim invite friend gift bonus",
      parameters: [
        {
          name: "x-access-token",
          in: "header",
          schema: {
            $ref: "#/components/schemas/access_token",
          },
          required: true, // Mandatory param
        },
      ],
      requestBody: {
        description: "giftId",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                giftId: {
                  type: "string",
                  example: "66b59d33ce276fddd30033e5"
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                properties: {
                  serverTime: {
                    $ref: "#/components/schemas/dateTimeStr",
                  },
                  error_code: {
                    type: "integer",
                  },
                  data: {
                    allOf: [
                      {
                        type: "object",
                        properties: {
                          achievement: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/UserAchievementData",
                            },
                          },
                          userDailyQuest: {
                            $ref: "#/components/schemas/UserDailyQuestData",
                          },
                          newFriend: {
                            type: "string",
                          },
                          userCurrency: {
                            $ref: "#/components/schemas/UserCurrency",
                          },
                          friendData: {
                            $ref: "#/components/schemas/userfriendInfo",
                          }
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": {
              examples: {
                error1: {
                  summary: "MISSING_PARAMETER",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 1,
                    error_message: "MISSING_PARAMETER",
                  },
                },
                error2: {
                  summary: "INVALID_GIFT",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 22,
                    error_message: "INVALID_GIFT",
                  },
                },
                error3: {
                  summary: "GIFT_ALREADY_CLAIMED",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 23,
                    error_message: "GIFT_ALREADY_CLAIMED",
                  },
                },
                error4: {
                  summary: "USER_NOT_FOUND",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 7,
                    error_message: "USER_NOT_FOUND",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error",
          content: {
            "application/json": {
              examples: {
                error1: {
                  summary: "INTERNAL_SERVER_ERROR",
                  value: {
                    serverTime: "2023-07-10T06:47:19.683Z",
                    error_code: 500,
                    error_message: "INTERNAL_SERVER_ERROR",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

export default swaggerFriend;