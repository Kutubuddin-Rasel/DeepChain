import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters/all-exceptions.filter';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.includes('/menu-items')) {
      logger.log(`[REQ] ${req.method} ${req.url}`);
      logger.log('HEADERS:', req.headers);
      logger.log('BODY:', req.body);
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter());

  const frontendOrigins = configService
    .getOrThrow<string>('FRONTEND_URL')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: frontendOrigins.length === 1 ? frontendOrigins[0] : frontendOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Foodio API running on port ${port}`);
}

bootstrap();
