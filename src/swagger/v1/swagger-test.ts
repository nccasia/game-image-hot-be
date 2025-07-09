const swaggerTest = {
  "/api/v1/test/ping": {
    get: {
      tags: ["Test"],
      summary: "ping",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              example: {
                error_code: 0,
                data: {
                  message: "pong",
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerTest;
