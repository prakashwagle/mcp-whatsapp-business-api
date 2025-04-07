import { Request, Response, NextFunction } from 'express';
import config from '../config';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('x-api-key');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No API key provided, access denied',
      });
    }
    
    // In a real application, you would validate the token against a database
    // or other authentication service. For this example, we'll use a simple
    // check against an environment variable.
    // WARNING: This is just a placeholder - do not use this in production!
    if (token !== process.env.WHATSAPP_ACCESS_TOKEN) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key, access denied',
      });
    }
    
    // If token is valid, proceed
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};