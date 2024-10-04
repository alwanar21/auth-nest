import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  app.setGlobalPrefix('/api/');
  await app.listen(3000);
}
bootstrap();
