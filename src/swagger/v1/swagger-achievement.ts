const swaggerAchievement = {
  "/api/v1/achievement/claim": {
    post: {
      tags: ["Achievement"],
      summary: "Achievement claim",
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
        description: "achievement_id",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                achievement_id: {
                  type: "integer",
                  example: 1
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
                          currencyType: {
                            type: "string",
                            example: "Coin",
                          },
                          currencyAmount: {
                            type: "integer",
                            example: 1,
                          },
                          achievement: {
                            $ref: "#/components/schemas/UserAchievementData",
                          },
                          maxRewardClaimsPerDay: {
                            type: "integer",
                            example: 1,
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
                  summary: "MISSING_PARAMETER",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 1,
                    error_message: "MISSING_PARAMETER",
                  },
                },
                error2: {
                  summary: "ACHIEVEMENT_NOT_COMPLETE",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 24,
                    error_message: "ACHIEVEMENT_NOT_COMPLETE",
                  },
                },
                error3: {
                  summary: "ACHIEVEMENT_ALREADY_CLAIMED",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 25,
                    error_message: "ACHIEVEMENT_ALREADY_CLAIMED",
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

export default swaggerAchievement;