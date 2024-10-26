import UserService from "@/services/user";
import { Request, Response } from "express";

const updateProfile = async (req: Request, res: Response) => {
  const { context, body } = req;
  const user = await UserService.updateProfile(context, body);

  res.sendFormatted(user);
};

const UserController = {
  updateProfile,
};

export default UserController;
