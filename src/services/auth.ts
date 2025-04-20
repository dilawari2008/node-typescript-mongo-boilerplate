import { User } from "@/db/models/user";
import createError from "http-errors";
import crypto from "crypto";
import { IJwtPayload, signJwt } from "@/middlewares";
import { IUser } from "@/interfaces/model";
import LOGGER from "@/common/logger";
import Context from "@/common/context";
import { HttpStatusCodes } from "@/common/constants";

const signup = async (context: Context, email: string, password: string) => {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString("hex");

  // Concatenate the salt and the password, then hash it using MD5
  const saltedPassword = salt + password;
  const hash = crypto.createHash("md5").update(saltedPassword).digest("hex");

  LOGGER.debug(`(signup) salt: ${salt} hash: ${salt}`);
  // save in DB
  const user: IUser = {
    email,
    hash,
    salt,
  };

  await User.findOneAndUpdate(
    { email },
    { $set: { ...user } },
    { upsert: true }
  );
};

const login = async (context: Context, email: string, password: string) => {
  const user: IUser = (await User.findOne({ email })) as unknown as IUser;
  LOGGER.debug(`(login) user: ${JSON.stringify(user)}`);
  const { salt, hash } = user;
  const saltedPassword = salt + password;
  const newHash = crypto.createHash("md5").update(saltedPassword).digest("hex");
  LOGGER.debug(`(login) salt: ${salt} hash: ${hash} newHash: ${newHash}`);
  if (newHash !== hash)
    throw createError(HttpStatusCodes.UNAUTHORIZED, "Invalid Credentials");
  const payload: IJwtPayload = {
    user: {
      userId: user?._id?.toString(),
      email,
    },
  };
  const token = signJwt(payload);
  return token;
};

const AuthService = {
  signup,
  login,
};

export default AuthService;
