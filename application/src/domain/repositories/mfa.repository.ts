import { Mfa } from '@domain/entities/mfa.entity';

export interface IMfaRepository {
  create(code: Mfa): Promise<Mfa>;
  findByEmailAndCode(email: string, code: string): Promise<Mfa | null>;
}