import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Global error handler:', err);
  res.status(500).send('Hang on, we are fixing'); // internal server
};
