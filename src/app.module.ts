import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    ProfilesModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), './uploads/profile'),
      serveRoot: '/profile',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
