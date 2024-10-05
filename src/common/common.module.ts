import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from './services/prisma.service';
import { EmailService } from './services/email.service';
import { TokenJwtService } from './services/jwt.service';

import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      global: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [],
  providers: [
    PrismaService,
    EmailService,
    TokenJwtService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [
    PrismaService,
    EmailService,
    TokenJwtService,
    AuthGuard,
    RolesGuard,
  ],
})
export class CommonModule {}
