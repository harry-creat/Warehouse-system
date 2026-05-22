import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';
import { successResponse } from '../../utils/response';

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password, role } = req.body;
      const result = await authService.register(username, email, password, role);
      return successResponse(res, result, '注册成功', 201);
    } catch (err) { next(err); }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return successResponse(res, result, '登录成功');
    } catch (err) { next(err); }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return successResponse(res, null, '已退出登录');
    } catch (err) { next(err); }
  };
}

export default new AuthController();
