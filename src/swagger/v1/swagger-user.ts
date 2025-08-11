const swaggerUser = {
  "/api/v1/users/register": {
    post: {
      tags: ["User"],
      summary: "register",
      requestBody: {
        description: "email, password",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                email: {
                  type: "string",
                },
                password: {
                  type: "string",
                },
                username: {
                  type: "string",
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
                        $ref: "#/components/schemas/userAccountData",
                      },
                      {
                        type: "object",
                        properties: {
                          accessToken: {
                            type: "string",
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
                  summary: "INVALID_EMAIL_ADDRESS",
                  value: {
                    serverTime: "2023-07-10T06:47:19.683Z",
                    error_code: 2,
                    error_message: "INVALID_EMAIL_ADDRESS",
                  },
                },
                error3: {
                  summary: "EMAIL_ALREADY_EXIST",
                  value: {
                    serverTime: "2023-07-10T06:47:19.683Z",
                    error_code: 3,
                    error_message: "EMAIL_ALREADY_EXIST",
                  },
                },
                error4: {
                  summary: "USERNAME_ALREADY_EXIST",
                  value: {
                    serverTime: "2023-07-10T06:47:19.683Z",
                    error_code: 4,
                    error_message: "USERNAME_ALREADY_EXIST",
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
                    serverTime: "2024-04-15T07:32:01.190Z",
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

  "/api/v1/users/login": {
    post: {
      tags: ["User"],
      summary: "login",
      requestBody: {
        description: "email, password",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                email: {
                  type: "string",
                },
                password: {
                  type: "string",
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
                          accessToken: {
                            type: "string",
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
                  summary: "WRONG_USERNAME_OR_PASSWORD",
                  value: {
                    serverTime: "2023-07-10T06:47:19.683Z",
                    error_code: 5,
                    error_message: "WRONG_USERNAME_OR_PASSWORD",
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
                    serverTime: "2024-04-15T07:32:01.190Z",
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

  "/api/v1/users/login-mezon": {
    post: {
      tags: ["User"],
      summary: "login mezon",
      requestBody: {
        description: "authData",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                authData: {
                  type: "string",
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
                          accessToken: {
                            type: "string",
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
                    serverTime: "2024-04-15T07:32:01.190Z",
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

  "/api/v1/users/login-privy": {
    post: {
      tags: ["User"],
      summary: "login privy",
      requestBody: {
        description: "privyUserName",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                privyUserName: {
                  type: "string",
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
                          accessToken: {
                            type: "string",
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
                    serverTime: "2024-04-15T07:32:01.190Z",
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

  "/api/v1/users/change-password": {
    post: {
      tags: ["User"],
      summary: "change-password",
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
        description: "password, new_password",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                password: {
                  type: "string",
                },
                new_password: {
                  type: "string",
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
                          id: {
                            type: "string",
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
                  summary: "COULD_NOT_CHANGE_PASSWORD",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 6,
                    error_message: "COULD_NOT_CHANGE_PASSWORD",
                  },
                },
              },
            },
          },
        },
        403: {
          description: "Invalid Credentials",
          content: {
            "application/json": {
              example: {
                error_code: 9,
                data: {
                  message: "A jwt token is required for authentication",
                },
              },
            },
          },
        },
        401: {
          description: "Invalid Credentials",
          content: {
            "application/json": {
              example: {
                error_code: 9,
                data: {
                  message: "Invalid JWT Token",
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/users/profile": {
    get: {
      tags: ["User"],
      summary: "Get user profile data",
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
                        $ref: "#/components/schemas/userData",
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
                    serverTime: "2024-04-15T07:32:01.190Z",
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

  "/api/v1/users/balance": {
    get: {
      tags: ["User"],
      summary: "Get user balance data",
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
                  status: {
                    type: "integer",
                  },
                  message: {
                    type: "string",
                  },
                  data: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/UserBalance",
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
                    serverTime: "2024-04-15T07:32:01.190Z",
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

  "/api/v1/users/link-wallet": {
    post: {
      tags: ["User"],
      summary: "link wallet",
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
        description: "walletAddress",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                walletAddress: {
                  type: "string",
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
                          walletAddress: {
                            type: "string",
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
                    serverTime: "2024-04-15T07:32:01.190Z",
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

  "/api/v1/users/change-username": {
    post: {
      tags: ["User"],
      summary: "Change username",
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
        description: "newUsername",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                newUsername: {
                  type: "string",
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
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
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
                  summary: "INVALID_USERNAME",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 37,
                    error_message: "INVALID_USERNAME",
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
                    serverTime: "2024-04-15T07:32:01.190Z",
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

export default swaggerUser;