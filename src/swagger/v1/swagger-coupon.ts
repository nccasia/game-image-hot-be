const swaggerCoupon = {
  "/api/v1/coupon/info": {
    get: {
      tags: ["Coupon"],
      summary: "Coupon info",
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
          name: "coupon_code",
          in: "query",
          schema: {
            type: "string",
            example: "00joBc",
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
                          coupon: {
                            $ref: "#/components/schemas/GameCouponData",
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
                  summary: "INVALID_COUPON",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 29,
                    error_message: "INVALID_COUPON",
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

  "/api/v1/coupon/use": {
    post: {
      tags: ["Coupon"],
      summary: "Coupon use",
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
        description: "coupon_code",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                coupon_code: {
                  type: "string",
                  example: "00joBc",
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
                          coupon: {
                            $ref: "#/components/schemas/GameCouponData",
                          },
                          userCurrency: {
                            $ref: "#/components/schemas/UserCurrency",
                          },
                          number_of_attempts: {
                            type: "number",
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
                  summary: "COUPON_FAILED_LIMIT",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 32,
                    error_message: "COUPON_FAILED_LIMIT",
                  },
                },
                error3: {
                  summary: "INVALID_COUPON",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 29,
                    error_message: "INVALID_COUPON",
                  },
                },
                error4: {
                  summary: "COUPON_EXPIRED_OR_NOT_STARTED",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 30,
                    error_message: "COUPON_EXPIRED_OR_NOT_STARTED",
                  },
                },
                error5: {
                  summary: "COUPON_USAGE_LIMIT",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 31,
                    error_message: "COUPON_USAGE_LIMIT",
                  },
                },
                error6: {
                  summary: "COUPON_CODE_ALREADY_USE",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 34,
                    error_message: "COUPON_CODE_ALREADY_USE",
                  },
                },
                error7: {
                  summary: "COUPON_TYPE_ALREADY_USE",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 33,
                    error_message: "COUPON_TYPE_ALREADY_USE",
                  },
                },
                error8: {
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

export default swaggerCoupon;