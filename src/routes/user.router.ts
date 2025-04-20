import { forwardRequest } from "@/common";
import UserController from "@/controllers/user";
import { verifyJwt } from "@/middlewares";

import { Router } from "express";

const UserRouter = Router({ mergeParams: true });

UserRouter.put(
  "/profile",
  verifyJwt,
  forwardRequest(UserController.updateProfile)
);

export default UserRouter;
