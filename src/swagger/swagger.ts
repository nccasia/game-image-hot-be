import components from "./components";
import swaggerAchievement from "./v1/swagger-achievement";
import swaggerGameConfig from "./v1/swagger-config";
import swaggerCoupon from "./v1/swagger-coupon";
import swaggerFriend from "./v1/swagger-friend";
import swaggerLeaderboard from "./v1/swagger-leaderboard";
import swaggerQuest from "./v1/swagger-quest";
import swaggerTest from "./v1/swagger-test";
import swaggerTutorial from "./v1/swagger-tutorial";
import swaggerUser from "./v1/swagger-user";

const path = {
  ...swaggerAchievement,
  ...swaggerGameConfig,
  ...swaggerCoupon,
  ...swaggerFriend,
  ...swaggerLeaderboard,
  ...swaggerQuest,
  ...swaggerTest,
  ...swaggerTutorial,
  ...swaggerUser,
}

const swaggerDocument = {
  ...components,
  openapi: "3.0.0",
  info: {
    title: "Game Server API",
    version: "0.0.1",
  },
  servers: [
    {
      url: "http://10.10.41.224:5014/",
      description: "[Dev Domain]",
    },
  ],
  tags: [
    {
      name: "User",
      description: "Operations about user",
    },
    {
      name: "Game Config",
      description: "Operations about game config",
    },
    {
      name: "Test",
      description: "Operations about test",
    },
  ],
  paths: path,
};

export default swaggerDocument;
