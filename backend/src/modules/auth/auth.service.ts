import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PasswordService } from './services/password.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthUser,
  SafeUser,
  TokensResponse,
} from '../interfaces/auth.interface';
import { JwtPayload } from '../interfaces/jwt.interface';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { CacheOptions } from 'src/infrastructure/interfaces/redis.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) { }

  async register(registerDto: RegisterDto): Promise<SafeUser> {
    try {
      const { name, email, address, password } = registerDto;

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email is already registered');
      }

      const hashedPassword = await this.passwordService.hash(password);

      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          address,
          password: hashedPassword,
        },
      });

      const { accessToken, refreshToken } = await this.getTokens({
        sub: user.id,
        role: user.role,
      });

      await this.updateRefreshToken(user.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Error in register for email ${registerDto.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'An error occurred during registration',
      );
    }
  }

  async login(loginDto: LoginDto): Promise<SafeUser> {
    try {
      const { email, password } = loginDto;

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await this.passwordService.verify(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const { accessToken, refreshToken } = await this.getTokens({
        sub: user.id,
        role: user.role,
      });

      await this.updateRefreshToken(user.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Error in login for email ${loginDto.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshHashToken: null },
      });
    } catch (error) {
      this.logger.error(
        `Error in logout for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('An error occurred during logout');
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const hashRefreshToken = await this.passwordService.hash(refreshToken);
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshHashToken: hashRefreshToken },
      });
    } catch (error) {
      this.logger.error(
        `Error updating refresh token for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Internal server error while updating refresh token',
      );
    }
  }

  async refreshTokens(payload: JwtPayload): Promise<SafeUser> {
    try {
      const { sub: userId, role } = payload;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.refreshHashToken) {
        throw new UnauthorizedException(
          'Access denied, user not found or logged out',
        );
      }

      const { accessToken, refreshToken } = await this.getTokens({
        sub: userId,
        role,
      });
      await this.updateRefreshToken(userId, refreshToken);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Error in refreshTokens for user ${payload.sub}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'An error occurred during token refresh',
      );
    }
  }

  async getProfile(userId: string): Promise<AuthUser> {
    try {
      const data = await this.redisService.get<AuthUser>(`userId:${userId}`);
      if (data) {
        return data;
      }
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const key = `userId:${userId}`;
      const options: CacheOptions = {
        ttl: 36000,
      };
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      };
      const setUser = await this.redisService.set<AuthUser>(
        key,
        userData,
        options,
      );
      if (!setUser) {
        console.warn('Error while setting user profile data');
      }
      return userData;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error in getProfile for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'An error occurred while fetching user profile',
      );
    }
  }

  async getTokens(payload: JwtPayload): Promise<TokensResponse> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          { sub: payload.sub, role: payload.role },
          {
            secret: this.configService.getOrThrow<string>(
              'ACCESS_TOKEN_SECRET',
            ),
            expiresIn: this.configService.getOrThrow<StringValue>(
              'ACCESS_TOKEN_EXPIRY',
            ),
          },
        ),
        this.jwtService.signAsync(
          { sub: payload.sub, role: payload.role },
          {
            secret: this.configService.getOrThrow<string>(
              'REFRESH_TOKEN_SECRET',
            ),
            expiresIn: this.configService.getOrThrow<StringValue>(
              'REFRESH_TOKEN_EXPIRY',
            ),
          },
        ),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(
        `Error generating tokens for user ${payload.sub}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to generate authentication tokens',
      );
    }
  }
}
