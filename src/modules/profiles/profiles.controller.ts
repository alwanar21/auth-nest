import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Put,
  Req,
  Res,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profiles.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Response } from 'express';
import { existsSync } from 'fs';
import { FormHttpException } from 'src/common/exceptions/form.exception';

export interface CustomRequest extends Request {
  user?: { id: string; roles?: 'admin' | 'user' };
}

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard)
  @Get('/profile')
  async findOne(@Req() req: CustomRequest) {
    const result = await this.profileService.findOne(req.user.id);
    return result;
  }

  @UseGuards(AuthGuard)
  @Put('/user/password')
  async changePassword(
    @Req() req: CustomRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const result = await this.profileService.changePassword(
      req.user.id,
      updatePasswordDto,
    );
    return result;
  }

  @UseGuards(AuthGuard)
  @Patch('/profile')
  async updateProfile(
    @Req() req: CustomRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const result = await this.profileService.updateProfile(
      req.user.id,
      updateProfileDto,
    );
    return result;
  }

  @UseGuards(AuthGuard)
  @Put('/profile/profile-picture')
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename(req, file, callback) {
          const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
          callback(
            null,
            uniqueSuffix + '.' + file.originalname.split('.').pop(),
          );
        },
      }),
      fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
          return callback(
            new UnsupportedMediaTypeException('File is not an image'),
            false,
          );
        }

        callback(null, true);
      },
      limits: { fileSize: 2000000 },
    }),
  )
  async changeProfilePicture(
    @Req() req: CustomRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg)$/ }),
        ],
        fileIsRequired: true,
        exceptionFactory: (errors) => {
          throw new FormHttpException([
            {
              property: 'picture',
              message: errors,
            },
          ]);
        },
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.profileService.changeProfilePicture(req.user.id, file);
  }

  @Get('/profile/profile-picture/:filename')
  async readProfilePicture(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(process.cwd(), './uploads/profile', filename);
    if (!existsSync(filePath)) {
      return res.render('error');
    }

    return res.sendFile(filePath);
  }

  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('/profiles')
  async findAllUser() {
    const result = await this.profileService.findAll();
    return result;
  }
}
