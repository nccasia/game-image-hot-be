const swaggerTransaction = {
  "/api/v1/transaction/pre-bet-game": {
    post: {
      tags: ["Transaction"],
      summary: "Pre bet game",
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
        description: "amount",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                amount: {
                  type: "number",
                  example: 0.001
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
                          itx: {
                            type: "string",
                            example: "0x5d2f7546a2cc28590df106ad2b5ecd82c196b8a03074ced46ab2795027410cc4",
                          },
                          userId: {
                            type: "string",
                            example: "683802de998fc7191e45a49a",
                          },
                          amount: {
                            type: "string",
                            example: "100000000000000",
                          },
                          signature: {
                            type: "string",
                            example: "0xfefbf27717d5ff3411d4cfc940894fe75e18748499ea91738de0547a593c36491dbd8e6a1b02b404bf5531fd7aee71de8488e8f7e401f91acf84916c1354aa131b",
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
                  summary: "USER_NOT_FOUND",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 7,
                    error_message: "USER_NOT_FOUND",
                  },
                },
                error3: {
                  summary: "INSUFFICIENT_RESOURCE",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 17,
                    error_message: "INSUFFICIENT_RESOURCE",
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

  "/api/v1/transaction/pre-end-game": {
    post: {
      tags: ["Transaction"],
      summary: "Pre end game",
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
        description: "itx",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                itx: {
                  type: "string",
                  example: "0x5d2f7546a2cc28590df106ad2b5ecd82c196b8a03074ced46ab2795027410cc4"
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
                          itx: {
                            type: "string",
                            example: "0x0d7ea1a09d716ff402d3d38b037387f06c36be67e857e6790b0549984377dd18",
                          },
                          userId: {
                            type: "string",
                            example: "683ea0075dc76811b77f173d",
                          },
                          players: {
                            type: "array",
                            items: {
                              type: "string",
                              example: "0xac4b64733fdff153664d40f76d44b561d37d875b"
                            },
                          },
                          amounts: {
                            type: "array",
                            items: {
                              type: "string",
                              example: "100000000000000"
                            },
                          },
                          winnerBet: {
                            type: "string",
                            example: "100000000000000",
                          },
                          signature: {
                            type: "string",
                            example: "0xf3fe35122296be311606a13c57e1a4b38af21145c1e63ae2b600ee46ffd6cde6294cdcc16e64d14604a4416deab9d838350d165083389b7c679a101276e7c04f1b",
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

  "/api/v1/transaction/pending-reward": {
    get: {
      tags: ["Transaction"],
      summary: "Get pending reward",
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
                          pendingItx: {
                            type: "array",
                            items: {
                              type: "string",
                              example: "0x0d7ea1a09d716ff402d3d38b037387f06c36be67e857e6790b0549984377dd18"
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
                  summary: "MISSING_PARAMETER",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 1,
                    error_message: "MISSING_PARAMETER",
                  },
                },
                error2: {
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

export default swaggerTransaction;