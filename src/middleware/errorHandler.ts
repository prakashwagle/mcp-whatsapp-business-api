import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`);
    return res.status(err.statusCode).json({
      error: err.message,
      status: 'error'
    });
  }

  logger.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal Server Error',
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}; 