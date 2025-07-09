const swaggerQuest = {
    "/api/v1/quest/claim-daily": {
        post: {
            tags: [
                "Quest"
            ],
            summary: "Claim daily quest",
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
                description: "quest_id",
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            properties: {
                                quest_id: {
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
                                                    userCurrency: {
                                                        $ref: "#/components/schemas/UserCurrency",
                                                    },
                                                    dailyQuest: {
                                                        $ref: "#/components/schemas/UserDailyQuestData",
                                                    },
                                                    increaseGem: {
                                                        type: "integer",
                                                        example: 1,
                                                    },
                                                    increaseGold: {
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
                                    summary: "INVALID_QUEST",
                                    value: {
                                        serverTime: "2024-04-15T07:32:01.190Z",
                                        error_code: 18,
                                        error_message: "INVALID_QUEST",
                                    },
                                },
                                error3: {
                                    summary: "QUEST_NOT_COMPLETE",
                                    value: {
                                        serverTime: "2024-04-15T07:32:01.190Z",
                                        error_code: 18,
                                        error_message: "QUEST_NOT_COMPLETE",
                                    },
                                },
                                error4: {
                                    summary: "QUEST_ALREADY_CLAIMED",
                                    value: {
                                        serverTime: "2024-04-15T07:32:01.190Z",
                                        error_code: 20,
                                        error_message: "QUEST_ALREADY_CLAIMED",
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
    "/api/v1/quest/claim-basic": {
        post: {
            tags: [
                "Quest"
            ],
            summary: "Claim basic quest",
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
                description: "quest_id",
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            properties: {
                                quest_id: {
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
                                                    userCurrency: {
                                                        $ref: "#/components/schemas/UserCurrency",
                                                    },
                                                    basicQuest: {
                                                        $ref: "#/components/schemas/UserBasicQuestData",
                                                    },
                                                    increaseGem: {
                                                        type: "integer",
                                                        example: 1,
                                                    },
                                                      increaseGold: {
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
                                    summary: "INVALID_QUEST",
                                    value: {
                                        serverTime: "2024-04-15T07:32:01.190Z",
                                        error_code: 18,
                                        error_message: "INVALID_QUEST",
                                    },
                                },
                                error3: {
                                    summary: "QUEST_ALREADY_CLAIMED",
                                    value: {
                                        serverTime: "2024-04-15T07:32:01.190Z",
                                        error_code: 20,
                                        error_message: "QUEST_ALREADY_CLAIMED",
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

export default swaggerQuest;