import { LEADERBOARD_TYPE } from "../../config/constant";

const swaggerLeaderboard = {
  "/api/v1/leaderboard/{name}": {
    get: {
      tags: ["Leaderboard"],
      summary: "Get leaderboard by name",
      parameters: [
        {
          name: "x-access-token",
          in: "header",
          schema: {
            $ref: "#/components/schemas/access_token",
          },
          required: true, // Mandatory param
        },
        {
          name: "name",
          in: "path",
          schema: {
            type: "string",
            enum: Object.values(LEADERBOARD_TYPE),
            example: "total-gold-earn",
          },
          required: true,
        },
        {
          name: "page",
          in: "query",
          schema: {
            type: "integer",
            example: 1,
          },
          required: true,
        },
        {
          name: "size",
          in: "query",
          schema: {
            type: "integer",
            example: 10,
          },
          required: true,
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
                          leaderboards: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/leaderboardItem",
                            },
                          },
                          total: {
                            type: "integer",
                            example: 1,
                          },
                          currentPage: {
                            type: "integer",
                            example: 1,
                          },
                          nextRefreshTime: {
                            $ref: "#/components/schemas/dateTimeStr",
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
                  summary: "INVALID_RANK",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 25,
                    error_message: "INVALID_RANK",
                  },
                },
                error3: {
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

export default swaggerLeaderboard;