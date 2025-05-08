import { Schema, model, Document } from 'mongoose';
import { Mfa } from '@domain/entities/mfa.entity';
import { IMfaRepository } from '@domain/repositories/mfa.repository';


const MfaCodeSchema = new Schema<Mfa>({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

export const MfaCodeModel = model<Mfa>('Mfa', MfaCodeSchema);

export class MfaRepository implements IMfaRepository {
  async create(code: Mfa): Promise<Mfa> {
    const created = await MfaCodeModel.create(code);
    return created.toObject();
  }

  async findByEmailAndCode(email: string, code: string): Promise<Mfa | null> {
    const record = await MfaCodeModel.findOne({ email, code });
    return record?.toObject() || null;
  }
}