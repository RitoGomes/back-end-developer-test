import dotenv from 'dotenv';

export class Config {
  private static instance: Config;

  private readonly _port: number;
  private readonly _databaseUrl: string;
  private readonly _jwtSecret: string;
  private readonly _jwtExpirationMs: number;
  private readonly _allowedOrigins: string;
  private readonly _mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  

  private constructor() {
    dotenv.config();

    this._port = parseInt(process.env.PORT || '3000', 10);
    this._databaseUrl = process.env.MONGO_CONNECTION || '';

    this._jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
    this._jwtExpirationMs = parseInt(process.env.JWT_EXPIRATION_MS || '900000', 10);

    this._mail = {
      host: process.env.MAIL_HOST || '',
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASS || ''
    };
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public get port(): number {
    return this._port;
  }

  public get databaseUrl(): string {
    return this._databaseUrl;
  }

  public get jwtSecret(): string {
    return this._jwtSecret;
  }

  public get jwtExpirationMs(): number {
    return this._jwtExpirationMs;
  }

  public get jwtExpirationInSeconds(): number {
    return Math.floor(this._jwtExpirationMs / 1000);
  }

  public get allowedOrigins(): string {
    return this._allowedOrigins
  }

  public get mail(): {
    host: string;
    port: number;
    user: string;
    pass: string;
  } {
    return this._mail;
  }


}
