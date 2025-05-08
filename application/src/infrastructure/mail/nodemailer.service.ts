import nodemailer from 'nodemailer';
import { Config } from '@infrastructure/configuration/env/dotenv.config';

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: Config) {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass
      }
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = `
      <h1>Bem-vindo(a), ${name}!</h1>
      <p>Obrigado por se registrar. Estamos felizes em tê-lo(a) conosco.</p>
    `;

    await this.transporter.sendMail({
      from: `"Teste" <${this.config.mail.user}>`,
      to,
      subject: 'Boas-vindas à plataforma!',
      html
    });
  }
  async sendMfaCodeEmail(to: string, code: string): Promise<void> {
    const html = `
      <h2>Seu código MFA</h2>
      <p>Use este código para finalizar seu login: <strong>${code}</strong></p>
      <p>Este código expira em 5 minutos.</p>
    `;
  
    await this.transporter.sendMail({
      from: `"Teste MFA" <${this.config.mail.user}>`,
      to,
      subject: 'Código de autenticação MFA',
      html
    });
  }
}


