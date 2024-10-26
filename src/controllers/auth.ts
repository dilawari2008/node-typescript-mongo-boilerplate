import AuthService from "@/services/auth";
import { Request, Response } from "express";

const signup = async (req: Request, res: Response) => {
  const { context, body } = req;
  const email = body?.email;
  const password = body?.password;
  await AuthService.signup(context, email, password);
  res.sendOk();
};

const login = async (req: Request, res: Response) => {
  const { context, body } = req;
  const email = body?.email;
  const password = body?.password;
  const token = await AuthService.login(context, email, password);
  res.sendFormatted(token);
};

const AuthController = {
  signup,
  login,
};

export default AuthController;
