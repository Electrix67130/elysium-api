import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import UserService from '@/modules/user/user.service';
import env from '@/config/env';
import { Register } from './auth.schema';

const SALT_ROUNDS = 12;

class AuthService {
  private userService: UserService;
  private app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.userService = new UserService(app.db);
    this.app = app;
  }

  async register(data: Register) {
    const existingEmail = await this.userService.findByEmail(data.email);
    if (existingEmail) {
      throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
    }

    const existingUsername = await this.userService.findByUsername(data.username);
    if (existingUsername) {
      throw Object.assign(new Error('Username already taken'), { statusCode: 409 });
    }

    const { password, ...rest } = data;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.userService.create({ ...rest, password_hash } as Record<string, unknown>);

    const tokens = this.generateTokens(user.id, user.email);

    await this.storeRefreshToken(user.id, tokens.refresh_token);

    const { password_hash: _, ...safeUser } = user as Record<string, unknown>;
    return { user: safeUser, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    const valid = await bcrypt.compare(password, (user as Record<string, unknown>).password_hash as string);
    if (!valid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    const tokens = this.generateTokens(user.id, user.email);

    await this.storeRefreshToken(user.id, tokens.refresh_token);

    const { password_hash: _, ...safeUser } = user as Record<string, unknown>;
    return { user: safeUser, ...tokens };
  }

  async refresh(refreshToken: string) {
    // Verify JWT signature (no expiry check since refresh tokens don't expire)
    let payload: { sub: string; email: string };
    try {
      payload = this.app.jwt.verify<{ sub: string; email: string }>(refreshToken);
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    // Check token exists in DB (revocation check)
    const stored = await this.app.db('refresh_token')
      .where({ user_id: payload.sub, token: refreshToken })
      .first();

    if (!stored) {
      throw Object.assign(new Error('Refresh token revoked'), { statusCode: 401 });
    }

    // Rotate: delete old, create new
    await this.app.db('refresh_token').where({ id: stored.id }).del();

    const tokens = this.generateTokens(payload.sub, payload.email);
    await this.storeRefreshToken(payload.sub, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string) {
    await this.app.db('refresh_token').where({ user_id: userId }).del();
  }

  private generateTokens(userId: string, email: string) {
    const access_token = this.app.jwt.sign(
      { sub: userId, email, jti: crypto.randomUUID() },
      { expiresIn: env.JWT_ACCESS_EXPIRES },
    );

    // Refresh token: no expiration — valid until revoked or rotated
    const refresh_token = this.app.jwt.sign(
      { sub: userId, email, jti: crypto.randomUUID() },
    );

    return { access_token, refresh_token };
  }

  private async storeRefreshToken(userId: string, token: string) {
    await this.app.db('refresh_token').insert({
      user_id: userId,
      token,
    });
  }
}

export default AuthService;
