const swaggerTutorial = {
  "/api/v1/tutorial/update": {
    post: {
      tags: ["Tutorial"],
      summary: "Update tutorial action",
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
        description: "tutorial_id, action_type",
        required: true,
        content: {
          "application/json": {
            schema: {
              properties: {
                tutorial_id: {
                  type: "integer",
                  example: 1,
                },
                action_type: {
                  type: "string",
                  example: "Started",
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
                          tutorial: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/UserTutorialData",
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
                // error2: {
                //   summary: "REQUIRE_TUTORIAL_NOT_FINISHED",
                //   value: {
                //     serverTime: "2024-04-15T07:32:01.190Z",
                //     error_code: 27,
                //     error_message: "REQUIRE_TUTORIAL_NOT_FINISHED",
                //   },
                // },
                // error3: {
                //   summary: "TUTORIAL_NOT_STARTED",
                //   value: {
                //     serverTime: "2024-04-15T07:32:01.190Z",
                //     error_code: 28,
                //     error_message: "TUTORIAL_NOT_STARTED",
                //   },
                // },
                error4: {
                  summary: "INVALID_TUTORIAL",
                  value: {
                    serverTime: "2024-04-15T07:32:01.190Z",
                    error_code: 26,
                    error_message: "INVALID_TUTORIAL",
                  },
                },
                error5: {
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

export default swaggerTutorial;