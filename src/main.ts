import {
  BadRequestException,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message:
            error.constraints[Object.keys(error.constraints).slice(-1)[0]],
        }));
        return new BadRequestException(result);
      },
    }),
  );
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.enableCors();
  app.setGlobalPrefix('/api/', {
    exclude: [
      { path: 'verify-email/:token', method: RequestMethod.GET },
      { path: 'profile/profile-picture/:filename', method: RequestMethod.GET },
      { path: 'auth/reset-password/:token', method: RequestMethod.GET },
      { path: 'auth/reset-password/:token', method: RequestMethod.GET },
    ],
  });
  await app.listen(3000);
}
bootstrap();
