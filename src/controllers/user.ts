import UserService from "@/services/user";
import { NextFunction, Request, Response } from "express";

const getAllUsers = async (req: Request, res: Response) => {
  const val = UserService.getAllUsers();
  // res.status(200).send(val);
  res.sendFormatted(val);
};

const UserController = {
  getAllUsers,
};

export default UserController;
