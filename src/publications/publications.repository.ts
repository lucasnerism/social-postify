import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Injectable()
export class PublicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPublication(data: CreatePublicationDto) {
    return this.prisma.publication.create({
      data,
      select: { id: true, mediaId: true, postId: true, date: true },
    });
  }

  async findPublications(published?: boolean, after?: Date) {
    const currentDate = new Date();
    return this.prisma.publication.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, mediaId: true, postId: true, date: true },
      where: {
        date: {
          lt: published ? currentDate : undefined,
          gt: published === false ? currentDate : undefined,
        },
        AND: {
          date: {
            gt: after ? new Date(after) : undefined,
          },
        },
      },
    });
  }

  async findPublicationById(id: number) {
    return this.prisma.publication.findFirst({
      where: { id },
      select: { id: true, mediaId: true, postId: true, date: true },
    });
  }

  async findPublicationByPostId(postId: number) {
    return this.prisma.publication.findFirst({
      where: { postId },
      select: { id: true, mediaId: true, postId: true, date: true },
    });
  }

  async findPublicationByMediaId(mediaId: number) {
    return this.prisma.publication.findFirst({
      where: { mediaId },
      select: { id: true, mediaId: true, postId: true, date: true },
    });
  }

  async updatePublicationById(id: number, data: UpdatePublicationDto) {
    return this.prisma.publication.update({
      where: { id },
      data,
      select: { id: true, mediaId: true, postId: true, date: true },
    });
  }

  async deletePublicationById(id: number) {
    return this.prisma.publication.delete({
      where: { id },
    });
  }
}
