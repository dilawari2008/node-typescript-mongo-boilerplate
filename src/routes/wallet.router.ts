import WalletController from '@/controllers/wallet';
import { Router } from 'express';

const WalletRouter = Router({ mergeParams: true });

// add more routes
WalletRouter.get('/', WalletController.get);

export default WalletRouter;