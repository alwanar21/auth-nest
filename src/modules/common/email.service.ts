import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  emailVerification(to: string, username: string, verificationLink: string) {
    this.mailerService.sendMail({
      to: to,
      subject: `Email Verification`,
      template: 'email-verification',
      context: {
        username,
        verificationLink,
      },
    });
  }
}
