import mongoose, { Schema, Document } from 'mongoose';

export interface IPhotoEloHistory extends Document {
  photo_id: string;
  score_before: number;
  score_after: number;
  changed_at: Date;
  match_result: string;

  getInfo(): Omit<IPhotoEloHistory, '_id' | '__v' | 'getInfo'>;
}

const PhotoEloHistorySchema: Schema<IPhotoEloHistory> = new Schema(
  {
    photo_id: String,
    score_before: Number,
    score_after: Number,
    changed_at: { type: Date, default: Date.now },
    match_result: String, // 'win' | 'lose'
  }
);

PhotoEloHistorySchema.methods.getInfo = function () {
  return {
    photo_id: this.photo_id,
    score_before: this.score_before,
    score_after: this.score_after,
    changed_at: this.changed_at,
    match_result: this.match_result,
  };
};

const PhotoEloHistory = mongoose.model<IPhotoEloHistory>('PhotoEloHistory', PhotoEloHistorySchema);
export default PhotoEloHistory;
