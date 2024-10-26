import { HttpStatusCodes } from "@/common/constants";
import Context from "@/common/context";
import LOGGER from "@/common/logger";
import { User } from "@/db/models/user";
import { ProfileObj } from "@/interfaces/dto";
import { IUser } from "@/interfaces/model";
import { IJwtPayload, signJwt } from "@/middlewares";
import createError from "http-errors";

const updateProfile = async (context: Context, profile: ProfileObj) => {
  if (!context?.user?.userId)
    throw createError(HttpStatusCodes.BAD_REQUEST, `UserId not found`);

  const { userId } = context?.user;

  LOGGER.debug(`name: ${JSON.stringify(profile)}`);

  const user = (await User.findOneAndUpdate(
    { _id: userId, deleted: false },
    { $set: { name: profile?.name } },
    { upsert: true, new: true }
  )) as IUser;

  const payload: IJwtPayload = {
    user: {
      userId: user?._id,
      email: user?.email || "",
      name: user?.name || "",
    },
  };
  const token = signJwt(payload);
  const userObj = {
    token,
    user,
  };
  return userObj;
};

const UserService = {
  updateProfile,
};

export default UserService;
