import { Schema, model, Document } from 'mongoose';

export interface IDLCBundle extends Document {
  bundleName: string;
  version: string;
  type: string;
  rootPath: string;
  priority: number;

  getInfo(): Omit<IDLCBundle, '_id' | '__v' | 'getInfo'>;
}

const DLCBundleSchema = new Schema<IDLCBundle>(
  {
    bundleName: { type: String, default: '' },
    version: { type: String, default: '' },
    type: { type: String, default: '' },
    rootPath: { type: String, default: '' },
    priority: { type: Number, default: 0 },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.id;
      },
    },
  }
);

DLCBundleSchema.index({ bundleName: 1 });
DLCBundleSchema.index({ type: 1 });

DLCBundleSchema.methods.getInfo = function () {
  return {
    bundleName: this.bundleName,
    version: this.version,
    type: this.type,
    rootPath: this.rootPath,
    priority: this.priority,
  };
};

const DLCBundle = model<IDLCBundle>(
  'DLCBundle',
  DLCBundleSchema
);
export default DLCBundle;
