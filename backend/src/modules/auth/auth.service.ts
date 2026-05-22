import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';

const prisma = new PrismaClient();

export class AuthService {
  async register(username: string, email: string, password: string, role?: string) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) throw Object.assign(new Error('Username or email already exists'), { statusCode: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, role: (role as 'ADMIN' | 'OPERATOR' | 'VIEWER') || 'OPERATOR' },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
    return { user };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  async refreshToken(oldToken: string) {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(oldToken);
    } catch {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const accessToken = generateAccessToken(user.id, user.role);
    return { accessToken };
  }
}

export default new AuthService();
