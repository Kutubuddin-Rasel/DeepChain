import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CookieService } from '../services/cookie.service';
import { RefreshTokenPayload } from 'src/modules/interfaces/jwt.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PasswordService } from '../services/password.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly cookieService: CookieService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => this.cookieService.extractRefreshCookie(req),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshTokenPayload): Promise<RefreshTokenPayload> {
    const refreshToken = this.cookieService.extractRefreshCookie(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user || !user.refreshHashToken) {
      throw new UnauthorizedException('Access denied');
    }

    const match = await this.passwordService.verify(
      refreshToken,
      user.refreshHashToken,
    );

    if (!match) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    return payload;
  }
}
