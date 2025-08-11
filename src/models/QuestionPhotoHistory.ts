import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionPhotoHistory extends Document {
  left_photo_id: string;
  left_score_before: number;
  left_score_after: number;
  left_vote: number;
  right_photo_id: string;
  right_score_before: number;
  right_score_after: number;
  right_vote: number;
  match_result_before: string;
  match_result_after: string;
  changed_at: Date;

  getInfo(): Omit<IQuestionPhotoHistory, '_id' | '__v' | 'getInfo'>;
}

const QuestionPhotoHistorySchema: Schema<IQuestionPhotoHistory> = new Schema(
  {
    left_photo_id: { type: String, default: '' },
    left_score_before: { type: Number, default: 0 },
    left_score_after: { type: Number, default: 0 },
    left_vote: { type: Number, default: 0 },
    right_photo_id: { type: String, default: '' },
    right_score_before: { type: Number, default: 0 },
    right_score_after: { type: Number, default: 0 },
    right_vote: { type: Number, default: 0 },
    match_result_before: { type: String, default: '' }, // 'win' | 'lose'
    match_result_after: { type: String, default: 'unknown' },  // 'win' | 'lose' 
    changed_at: { type: Date, default: Date.now },
  }
);

QuestionPhotoHistorySchema.methods.getInfo = function () {
  return {
    left_photo_id: this.left_photo_id,
    left_score_before: this.left_score_before,
    left_score_after: this.left_score_after,
    left_vote: this.left_vote,
    right_photo_id: this.right_photo_id,
    right_score_before: this.right_score_before,
    right_score_after: this.right_score_after,
    right_vote: this.right_vote,
    match_result_before: this.match_result_before,
    match_result_after: this.match_result_after,
  };
};

const QuestionPhotoHistory = mongoose.model<IQuestionPhotoHistory>('QuestionPhotoHistory', QuestionPhotoHistorySchema);
export default QuestionPhotoHistory;
