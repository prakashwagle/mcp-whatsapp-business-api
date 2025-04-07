import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;
  
  // Log the error
  logger.error(err.message, {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    stack: err.stack,
  });
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: isOperational ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as ApiError;
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};