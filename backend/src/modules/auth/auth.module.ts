import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CookieService } from './services/cookie.service';
import { PasswordService } from './services/password.service';
import { JwtStrategy } from './strategies/jwt-access-strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, CookieService, PasswordService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule { }
