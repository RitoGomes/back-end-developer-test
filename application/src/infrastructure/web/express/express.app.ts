import express, { Application } from 'express';
import cors from 'cors';
import { Config } from '@infrastructure/configuration/env/dotenv.config';
import { userController } from '@application/controllers/user.controller';

export const createExpressApp = (app: Application): void => {
  const config = Config.getInstance();
  const allowedOrigins = config.allowedOrigins
    ? config.allowedOrigins.split(',').map(o => o.trim())
    : ['*'];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} não permitida pelo CORS`));
      }
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  }));

  app.use(express.json());
  app.use('/api/users', userController);
};