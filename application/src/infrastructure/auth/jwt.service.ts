import jwt from 'jsonwebtoken';
import { Config } from '@infrastructure/configuration/env/dotenv.config';

export class JwtService {
  constructor(private readonly config: Config) {}

  generateToken(payload: object): string {
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpirationMs
    })
  }

  verifyToken<T = any>(token: string): T {
    return jwt.verify(token, this.config.jwtSecret) as T;
  }
}