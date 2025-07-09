import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
  photo_id: string;
  name: string;
  description: string;
  category: string;
  filePath: string;
  score: number;
  disable: number;
  getInfo(): Omit<IPhoto, 'getInfo' | '_id' | '__v'>;
}

const PhotosSchema: Schema<IPhoto> = new Schema(
  {
    photo_id: { type: String, default: '' },
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    filePath: { type: String, default: '' },
    score: { type: Number, default: 1000 },
    disable: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Add indexes
PhotosSchema.index({ photo_id: 1 });
PhotosSchema.index({ name: 1 });

// Custom method
PhotosSchema.methods.getInfo = function () {
  return {
    photo_id: this.photo_id,
    name: this.name,
    description: this.description,
    category: this.category,
    filePath: this.filePath,
    score: this.score,
    disable: this.disable,
  };
};

const Photos = mongoose.model<IPhoto>('Photos', PhotosSchema);
export default Photos;
