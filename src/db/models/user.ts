import DB from "@/db/db";
import { IUser } from "@/interfaces/model";
import { Schema, Types } from "mongoose";

const userSchema: Schema = new Schema<IUser>(
  {
    _id: Types.ObjectId,
    name: { type: String, required: false },
    email: { type: String, required: true },
    hash: { type: String, required: true },
    salt: { type: String, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

export const User = DB.model<IUser>("User", userSchema);
