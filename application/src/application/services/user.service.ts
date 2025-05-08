import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUserDto, CreateUserSchema, UpdateUserDto, UpdateUserSchema } from '@application/dtos/export-all.dtos';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository';
import { MailService } from '@infrastructure/mail/nodemailer.service';
import { Config } from '@infrastructure/configuration/env/dotenv.config';

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly config: Config,
    private readonly mailService: MailService
  ) {}

  async register(data: unknown): Promise<User> {
    const parsed = CreateUserSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error('Dados inválidos');
    }


    const { name, email, password } = parsed.data;
    await this.mailService.sendWelcomeEmail(email, name);


    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({ name, email, password: hashedPassword });


    return user;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('E-mail ou senha inválidos');
    }
    
    const token = jwt.sign(
        { userId: user._id },
        this.config.jwtSecret,
        { expiresIn: this.config.jwtExpirationMs }
      );

    return token;
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('E-mail ou senha inválidos');
    }
    return user;
  }

  async update(id: string, data: unknown): Promise<User> {
    const parsed = UpdateUserSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error('Dados inválidos para atualização');
    }
  
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
  
    const updatedData = { ...parsed.data };
    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }
  
    const updatedUser = await this.userRepository.update(id, updatedData);
    if (!updatedUser) {
      throw new Error('Erro ao atualizar usuário');
    }
  
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
