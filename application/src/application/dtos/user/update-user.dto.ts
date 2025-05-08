import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.').optional(),
  email: z.string().email('E-mail inválido.').optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').optional()
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
