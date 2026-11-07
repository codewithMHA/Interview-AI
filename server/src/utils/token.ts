import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JwtPayload } from '../types/index.js';

export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (env.JWT_EXPIRES_IN as any) || '7d',
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

