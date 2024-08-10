import DB from "@/db/db";
import { IUser } from "@/interfaces/model";
import { Schema, Types } from "mongoose";

const userSchema: Schema = new Schema<IUser>({
  _id: Types.ObjectId,
  name: String,
  email: String,
  hash: String,
  salt: String,
  deleted: { type: Boolean, required: true , default: false },
});


export const User = DB.model<IUser>('User', userSchema);

