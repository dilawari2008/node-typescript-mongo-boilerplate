import WalletService from '@/services/wallet';
import { NextFunction, Request, Response } from 'express';

const get = (req: Request, res: Response) => {
  const val = WalletService.get();
  res.status(200).send(val);
};

const WalletController = {
  get,
};

export default WalletController;