import { z } from 'zod';

export const VerifyMfaSchema = z.object({
  email: z.string().email('E-mail inválido'),
  code: z.string().length(6, 'O código deve ter 6 dígitos')
});

export type VerifyMfaDto = z.infer<typeof VerifyMfaSchema>;