import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { FormHttpException } from '../../common/exceptions/form.exception';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { basename, join } from 'path';
import { unlinkSync } from 'fs';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}
  async findOne(userId: string) {
    // TODO: find user with role 'user'
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        roles: true,
        profile: {
          select: {
            birthDate: true,
            picture: true,
            username: true,
          },
        },
      },
    });

    // TODO: throw error when user not found and return data when data exist
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const reformattedUser = {
      id: user.id,
      email: user.email,
      username: user.profile.username,
      birthDate: user.profile.birthDate,
      picture: user.profile.picture,
      roles: user.roles,
      isActive: user.isActive,
    };

    return { data: reformattedUser };
  }

  async changePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    //TODO: check user exist or not
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    //TODO: check current Password valid or not
    const matchPassword = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!matchPassword) {
      throw new FormHttpException([
        {
          property: 'currentPassword',
          message: 'Current password is wrong',
        },
      ]);
    }

    //TODO: check current Password same with new password or not
    const samePassword = await bcrypt.compare(
      updatePasswordDto.newPassword,
      user.password,
    );

    if (samePassword) {
      throw new FormHttpException([
        {
          property: 'newPassword',
          message: 'New Password cannot be the same as the Current Password',
        },
      ]);
    }

    //TODO: update password in database
    const newHashedPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newHashedPassword,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    //TODO: check user exist or not
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        profile: {
          select: { username: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    //TODO: check username is available or not
    const usernameIsAvailable = await this.prisma.profile.findUnique({
      where: {
        username: updateProfileDto.username,
      },
    });

    if (updateProfileDto.username == user.profile.username) {
      throw new FormHttpException([
        {
          property: 'username',
          message: 'Username cannot be the same as the old one',
        },
      ]);
    }
    if (
      usernameIsAvailable &&
      usernameIsAvailable.username !== user.profile.username
    ) {
      throw new FormHttpException([
        {
          property: 'username',
          message: 'Username has already been taken',
        },
      ]);
    }

    // TODO: update data
    await this.prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        username: updateProfileDto.username,
        birthDate: updateProfileDto.birthDate,
      },
    });

    return { message: 'Profile changed successfully' };
  }

  async changeProfilePicture(userId: string, file: Express.Multer.File) {
    //TODO: check user exist or not
    const user = await this.prisma.profile.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    //TODO: Check if the user already has a profile picture
    if (user.picture) {
      const oldPictureName = basename(user.picture);
      const oldPicturePath = join(
        process.cwd(),
        'uploads/profile',
        oldPictureName,
      );
      unlinkSync(oldPicturePath); // Hapus file gambar lama
    }

    const newProfilepicture = `http://localhost:3000/profile/profile-picture/${file.filename}`;

    // Update profile picture with full URL

    await this.prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        picture: newProfilepicture,
      },
    }); // Simpan perubahan ke database
    return {
      message: 'Profile picture updated successfully',
    };
  }

  async findAll() {
    // TODO: find user with role 'user'
    const users = await this.prisma.user.findMany({
      where: {
        roles: 'user',
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        roles: true,
        profile: {
          select: {
            birthDate: true,
            picture: true,
            username: true,
          },
        },
      },
    });

    // TODO: return empty array when user not found and return data when data exist

    if (users.length < 1) {
      return { message: 'data not found', data: [] };
    }

    const reformattedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      username: user.profile.username,
      birthDate: user.profile.birthDate,
      picture: user.profile.picture,
      roles: user.roles,
      isActive: user.isActive,
    }));

    return { message: 'data found', data: reformattedUsers };
  }
}
