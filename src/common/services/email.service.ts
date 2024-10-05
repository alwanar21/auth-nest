import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Sends an email verification to the user with a link to verify their email.
   *
   * @param to - The recipient's email address.
   * @param username - The username of the recipient, used for personalization in the email.
   * @param verificationLink - The verification URL that the recipient will click to verify their email.
   *
   * The function uses the MailerService to send an email with the specified template (`email-verification.hbs`).
   * It injects the `username` and `verificationLink` into the email context.
   */
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

  /**
   * Sends an email to the user with a link to reset their password.
   *
   * @param to - The recipient's email address.
   * @param username - The username of the recipient, used for personalization in the email.
   * @param verificationLink - The URL that the recipient will click to reset their password.
   *
   * The function uses the MailerService to send an email with the `reset-password` template.
   * It injects the `username` and `verificationLink` into the email context to customize the message.
   */

  emailResetPassword(to: string, username: string, verificationLink: string) {
    this.mailerService.sendMail({
      to: to,
      subject: `Reset Password`,
      template: 'reset-password',
      context: {
        username,
        verificationLink,
      },
    });
  }
}
