const swaggerGameConfig = {
  "/api/v1/config/game-config": {
    get: {
      tags: ["Game Config"],
      summary: "game config",
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
                    type: "object",
                    properties: {
                      gameParameter: {
                        $ref: "#/components/schemas/GameParameter",
                      },
                    },
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
                  summary: "GAME_CONFIG_NOT_FOUND",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 8,
                    error_message: "GAME_CONFIG_NOT_FOUND",
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

  "/api/v1/config/game-data-config": {
    get: {
      tags: ["Game Config"],
      summary: "game data config",
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
                    type: "object",
                    properties: {
                      achievement: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/GameAchievementData",
                        }
                      },
                      dailyQuest: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/GameDailyQuestData",
                        },
                      },
                      basicQuest: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/GameBasicQuestData",
                        },
                      },
                      photos: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/GamePhotoData",
                        },
                      },
                    },
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

  "/api/v1/config/bundle-data-config": {
    get: {
      tags: ["Game Config"],
      summary: "Bundle data config",
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
                    type: "object",
                    properties: {
                      dlcBundle: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/GameDCLBundleData",
                        }
                      },
                    },
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

  "/api/v1/config/setup-game-config": {
    post: {
      tags: ["Game Config"],
      summary: "setup game config - Admin only",
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
                    type: "object",
                    properties: {
                      gameParameter: {
                        $ref: "#/components/schemas/GameParameter",
                      },
                    },
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
                  summary: "GAME_CONFIG_NOT_FOUND",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 8,
                    error_message: "GAME_CONFIG_NOT_FOUND",
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

export default swaggerGameConfig;