import { Schema, model, Document, Types } from 'mongoose';
import { LeaderboardItemSchema, ILeaderboardItem } from './embedded/LeaderboardItem';

export interface ILeaderboard extends Document {
  name: string;
  leaderboards: ILeaderboardItem[];

  getInfo(): Omit<ILeaderboard, '_id' | '__v' | 'getInfo'>;
}

const LeaderboardSchema = new Schema<ILeaderboard>(
  {
    name: { type: String, default: '' },
    leaderboards: { type: [LeaderboardItemSchema], default: [] },
  },
  { timestamps: true }
);

LeaderboardSchema.index({ name: 1 });

LeaderboardSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

LeaderboardSchema.methods.getInfo = function () {
  return {
    name: this.name,
    leaderboards: this.leaderboards,
  };
};

const Leaderboard = model<ILeaderboard>('Leaderboard', LeaderboardSchema);
export default Leaderboard;
