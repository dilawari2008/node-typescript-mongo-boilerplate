import { forwardRequest } from '@/common';
import AuthController from '@/controllers/auth';
import { Router } from 'express';

const AuthRouter = Router({ mergeParams: true });

// add more routes
AuthRouter.get('/signup', forwardRequest(AuthController.signup));
AuthRouter.get('/login', forwardRequest(AuthController.login));

export default AuthRouter;