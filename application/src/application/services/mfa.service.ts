import { IMfaRepository } from '@domain/repositories/mfa.repository';
import { Mfa } from '@domain/entities/mfa.entity';
import { Config } from '@infrastructure/configuration/env/dotenv.config';
import { MailService } from '@infrastructure/mail/nodemailer.service';

export class MfaService {
  constructor(
    private readonly repository: IMfaRepository,
    private readonly config: Config,
    private readonly mailService: MailService
  ) {}

  async generateAndSend(email: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await this.repository.create({ email, code, expiresAt });
    await this.mailService.sendMfaCodeEmail(email, code);
  }

  async validate(email: string, code: string): Promise<boolean> {
    const record = await this.repository.findByEmailAndCode(email, code);
    return !!record;
  }
}
