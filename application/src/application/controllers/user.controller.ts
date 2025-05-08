import express, { Router } from 'express';
import type { Request, Response } from 'express';

import { UserService } from '@application/services/user.service';
import { UserPersistence } from '@infrastructure/database/persistances/user.persistance';
import { Config } from '@infrastructure/configuration/env/dotenv.config';
import { MailService } from '@infrastructure/mail/nodemailer.service';
import { VerifyMfaSchema } from '@application/dtos/mfa/verify-mfa.dto';
import { UpdateUserSchema } from '@application/dtos/user/update-user.dto';
import { JwtService } from '@infrastructure/auth/jwt.service';
import { MfaService } from '@application/services/mfa.service';
import { MfaRepository } from '@infrastructure/database/persistances/mfa.persistance';
import { authMiddleware, AuthRequest } from '@infrastructure/web/middleware/auth.middleware';

const config = Config.getInstance();
const jwtService = new JwtService(config);
const userController = Router();

const userRepository = new UserPersistence();
const mailService = new MailService(config);
const mfaRepository = new MfaRepository();
const mfaService = new MfaService(mfaRepository, config, mailService);
const userService = new UserService(userRepository, config, mailService);

userController.post('/register', async (req: Request, res: Response) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({ message: 'Usuário criado com sucesso', user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

userController.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userService.validateCredentials(email, password);
    await mfaService.generateAndSend(email);

    res.status(200).json({
      message: 'Código MFA enviado para o e-mail.',
      email,
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

userController.put('/me', authMiddleware, async (req: AuthRequest, res) => {
  const userId = (req.user as any).userId;

  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  try {
    const updatedUser = await userService.update(userId, parsed.data);
    res.status(200).json({ message: 'Usuário atualizado com sucesso', updatedUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

userController.delete("/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  
    const userId = (req.user as any).userId;
    try {
      const deleted = await userService.deleteUser(userId);

      if (!deleted) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }
      res.status(204).send();
      return;
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      res.status(500).json({ error: "Erro interno ao deletar usuário." });
      return;
    }
  }
);

userController.post('/mfa', async (req: Request, res: Response) => {
  try {
    const parsed = VerifyMfaSchema.safeParse(req.body); // Fazerigual nos outros.
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    const { email, code } = parsed.data;

    const isValid = await mfaService.validate(email, code);
    if (!isValid) {
      res.status(401).json({ error: 'Código MFA inválido ou expirado' });
      return;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'Código MFA inválido ou expirado' });
      return;
    }

    const token = jwtService.generateToken({ userId: user._id });
    res.status(200).json({ token });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro interno ao validar MFA' });
    return;
  }
});

export { userController };
