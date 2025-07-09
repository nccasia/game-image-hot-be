import { Schema, Document } from "mongoose";

export interface ILeaderboardItem extends Document {
  userId: string;
  username: string;
  level: number;
  value: number;
  rank: number;

  getInfo(): {
    userDataId: string;
    username: string;
    level: number;
    value: number;
    rank: number;
  };
}

export const LeaderboardItemSchema = new Schema<ILeaderboardItem>({
  userId: { type: String, default: "" },
  username: { type: String, default: "" },
  level: { type: Number, default: 0 },
  value: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
});

LeaderboardItemSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

LeaderboardItemSchema.methods.getInfo = function () {
  return {
    userId: this.userId,
    username: this.username,
    level: this.level,
    value: this.value,
    rank: this.rank,
  };
};
