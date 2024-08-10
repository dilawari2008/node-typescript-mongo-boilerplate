import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  hash: string;
  salt: string;
  deleted: boolean;
}