import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type {
  AuthUser,
  TokenResponse,
  RegisterLoginResponse,
} from '../interfaces/auth.interface';
import { AccessTokenGuard } from './guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type {
  JwtPayload,
  RefreshTokenPayload,
} from '../interfaces/jwt.interface';
import type { Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CookieService } from './services/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterLoginResponse> {
    const result = await this.authService.register(registerDto);
    this.cookieService.setRefreshCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterLoginResponse> {
    const result = await this.authService.login(loginDto);
    this.cookieService.setRefreshCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @CurrentUser() user: RefreshTokenPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const { accessToken, refreshToken } =
      await this.authService.refreshTokens(user);
    this.cookieService.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  async getProfile(@CurrentUser() user: JwtPayload): Promise<AuthUser> {
    return this.authService.getProfile(user.sub);
  }
}
