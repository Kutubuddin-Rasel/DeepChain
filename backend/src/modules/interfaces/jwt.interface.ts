import { Role } from 'generated/prisma/client';

export interface JwtPayload {
  readonly sub: string;
  readonly role: Role;
}

export interface AuthCookie {
  readonly refresh_token: string;
}

export interface RefreshTokenPayload extends JwtPayload {}
