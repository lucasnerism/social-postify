import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async create(createPostDto: CreatePostDto) {
    return await this.postsRepository.createPost(createPostDto);
  }

  async findAll() {
    return await this.postsRepository.findPosts();
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findPostById(id);
    if (!post) throw new NotFoundException();
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.findOne(id);
    return await this.postsRepository.updatePostById(id, updatePostDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.postsRepository.deletePostById(id);
    return;
  }
}
