import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  seq_id: number;
  email: string;
  password: string;
  mezonId: string,
  role: string;
  username: string | null;
  account_type: string;
  accessToken: string;
  createdAt: Date;

  getInfo(): {
    userId: string;
    email: string;
    mezonId: string;
    username: string | null;
    account_type: string;
    createdAt: Date;
  };

  setAccessToken(accessToken: string): Promise<void>;
  setUsername(username: string): Promise<void>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String },
    password: { type: String },
    role: { type: String, default: '' },

    mezonId: { type: String, default: '' },
    username: { type: String, default: null },
    account_type: { type: String, default: 'email' },
    accessToken: { type: String },
  },
  { timestamps: true }
);

// Indexes (safe to include even if fields aren't always present)
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ mezonId: 1 });

// Instance Methods
UserSchema.methods.getInfo = function () {
  return {
    userId: this._id.toString(),
    email: this.email,
    mezonId: this.mezonId,
    username: this.username,
    account_type: this.account_type,
    createdAt: this.createdAt,
  };
};

UserSchema.methods.setAccessToken = async function (accessToken: string) {
  this.accessToken = accessToken;
  await this.updateOne({ $set: { accessToken } });
};

UserSchema.methods.setUsername = async function (username: string) {
  this.username = username;
  await this.updateOne({ $set: { username } });
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
