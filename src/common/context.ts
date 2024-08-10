import { Types } from "mongoose";

export interface IContextBrand {
  brandId?: Types.ObjectId;
  name?: string;
}


export interface IContextUser {
  userId?: Types.ObjectId;
  name?: string;
  email?: string;
}


interface Context {
  reqId: string;
  user?: IContextUser;
  brand?: IContextBrand;
  authToken?: string;
}

export default Context;