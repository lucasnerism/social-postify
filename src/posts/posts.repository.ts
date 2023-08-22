import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(data: CreatePostDto) {
    return this.prisma.post.create({
      data,
      select: { id: true, title: true, text: true, image: true },
    });
  }

  async findPosts() {
    return this.prisma.post.findMany({
      select: { id: true, title: true, text: true, image: true },
      orderBy: { id: 'asc' },
    });
  }

  async findPostById(id: number) {
    return this.prisma.post.findFirst({
      where: { id },
      select: { id: true, title: true, text: true, image: true },
    });
  }

  async updatePostById(id: number, data: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data,
      select: { id: true, title: true, text: true, image: true },
    });
  }

  async deletePostById(id: number) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
