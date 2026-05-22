import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required', 401);
  }
  const token = header.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return errorResponse(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) return errorResponse(res, 'Insufficient permissions', 403);
    next();
  };
}
