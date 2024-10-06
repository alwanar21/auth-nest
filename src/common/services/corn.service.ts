import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class CornService {
  constructor(private readonly prisma: PrismaService) {}
  @Cron('0 0 * * *')
  async deleteSessionexpired() {
    const currentDate = new Date();

    await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: currentDate,
        },
      },
    });
  }
}
