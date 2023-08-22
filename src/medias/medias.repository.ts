import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMedia(data: CreateMediaDto) {
    return this.prisma.media.create({
      data,
      select: {
        id: true,
        title: true,
        username: true,
      },
    });
  }

  async findMedias(data?: CreateMediaDto) {
    return this.prisma.media.findMany({
      select: { id: true, title: true, username: true },
      where: data ? { title: data.title, username: data.username } : {},
      orderBy: { id: 'asc' },
    });
  }

  async findMediaById(id: number) {
    return this.prisma.media.findFirst({
      where: { id },
      select: { id: true, title: true, username: true },
    });
  }

  async updateMediaById(id: number, data: UpdateMediaDto) {
    return this.prisma.media.update({
      where: { id },
      data,
      select: { id: true, title: true, username: true },
    });
  }

  async deleteMediaById(id: number) {
    return this.prisma.media.delete({
      where: { id },
      select: { id: true, title: true, username: true },
    });
  }
}
