import { Schema, Document } from 'mongoose';

export interface IUserTutorialData extends Document {
  user_tutorial_id: number;
  tutorial_name: string;
  require_tutorial_name: string;
  action_type: string;
  recorded: number;

  getInfo(): {
    user_tutorial_id: number;
    tutorial_name: string;
    require_tutorial_name: string;
    action_type: string;
    recorded: number;
  };
}

const UserTutorialDataSchema = new Schema<IUserTutorialData>(
  {
    user_tutorial_id: { type: Number, default: 0 },
    tutorial_name: { type: String, default: '' },
    require_tutorial_name: { type: String, default: '' },
    action_type: { type: String, default: '' },
    recorded: { type: Number, default: 0 },
  },
  {
    minimize: true,
    _id: false,
  }
);

UserTutorialDataSchema.methods.getInfo = function () {
  return {
    user_tutorial_id: this.user_tutorial_id,
    tutorial_name: this.tutorial_name,
    require_tutorial_name: this.require_tutorial_name,
    action_type: this.action_type,
    recorded: this.recorded,
  };
};

UserTutorialDataSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.id;
  },
});

export default UserTutorialDataSchema;
