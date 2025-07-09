import { Schema, model, Document } from "mongoose";

export interface ITutorial extends Document {
  tutorial_id: number;
  tutorial_name: string;
  require_tutorial_name: string;

  getInfo(): {
    tutorial_id: number;
    tutorial_name: string;
    require_tutorial_name: string;
  };
}

const TutorialSchema = new Schema<ITutorial>(
  {
    tutorial_id: { type: Number, default: 0 },
    tutorial_name: { type: String, default: "" },
    require_tutorial_name: { type: String, default: "" },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.id;
      },
    },
  }
);

TutorialSchema.methods.getInfo = function () {
  return {
    tutorial_id: this.tutorial_id,
    tutorial_name: this.tutorial_name,
    require_tutorial_name: this.require_tutorial_name,
  };
};

const Tutorial = model<ITutorial>("Tutorial", TutorialSchema);
export default Tutorial;
