import { forwardRequest } from '@/common';
import UserController from '@/controllers/user';
import { Router } from 'express';

const UserRouter = Router({ mergeParams: true });

// add more routes
UserRouter.get('/', forwardRequest(UserController.getAllUsers));

export default UserRouter;