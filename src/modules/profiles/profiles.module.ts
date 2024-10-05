import { Module } from '@nestjs/common';
import { ProfileService } from './profiles.service';
import { ProfileController } from './profiles.controller';
import { CommonModule } from '../../common/common.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfilesModule {}
