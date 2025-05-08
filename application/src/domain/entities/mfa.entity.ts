export interface Mfa {
    _id?: string;
    email: string;
    code: string;
    expiresAt: Date;
  }