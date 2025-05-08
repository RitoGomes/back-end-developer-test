import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.')
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;