import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PublicationsService } from '../publications/publications.service';
import { faker } from '@faker-js/faker';
import { Post } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let repository: PostsRepository;
  let publications: PublicationsService;
  let prismaMock = {
    createPost: jest.fn(),
    findPosts: jest.fn(),
    findPostById: jest.fn(),
    updatePostById: jest.fn(),
    deletePostById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostsRepository, useValue: prismaMock },
        {
          provide: PublicationsService,
          useValue: { findOneByPostId: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<PostsRepository>(PostsRepository);
    publications = module.get<PublicationsService>(PublicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create(post) => should return created post', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'createPost').mockResolvedValueOnce(post);

    const result = await service.create({
      title: post.title,
      text: post.text,
      image: post.image,
    });
    expect(result).toEqual(post);
  });

  it('findAll() => should return all posts', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'findPosts').mockResolvedValueOnce([post]);

    const result = await service.findAll();
    expect(result).toEqual([post]);
  });

  it('findOne(id) => should return said post', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'findPostById').mockResolvedValueOnce(post);

    const result = await service.findOne(1);
    expect(result).toEqual(post);
  });

  it('findOne(id) => should return Not Found when post doesnt exists', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'findPostById').mockResolvedValueOnce(undefined);

    const promise = service.findOne(1);
    expect(promise).rejects.toEqual(new NotFoundException());
  });

  it('update(id,body) => should return Not Found when post doesnt exists', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'findPostById').mockResolvedValueOnce(undefined);

    const promise = service.update(1, {
      title: post.title,
      text: post.text,
      image: post.image,
    });
    expect(promise).rejects.toEqual(new NotFoundException());
  });

  it('update(id,body) => should return updated post', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'findPostById').mockResolvedValueOnce(post);
    jest.spyOn(repository, 'updatePostById').mockResolvedValueOnce(post);

    const result = await service.update(1, {
      title: post.title,
      text: post.text,
      image: post.image,
    });
    expect(result).toEqual(post);
  });

  it('remove(id) => should delete said post', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'findPostById').mockResolvedValueOnce(post);
    jest
      .spyOn(publications, 'findOneByPostId')
      .mockResolvedValueOnce(undefined);
    jest.spyOn(repository, 'deletePostById').mockResolvedValueOnce(undefined);

    const result = await service.remove(1);
    expect(result).toEqual(undefined);
  });

  it('remove(id) => should return NotFoundException when post doesnt exist', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'findPostById').mockResolvedValueOnce(undefined);

    const promise = service.remove(1);
    expect(promise).rejects.toEqual(new NotFoundException());
  });

  it('remove(id) => should return ForbiddenException when publication exist', async () => {
    const post: Omit<Post, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      text: faker.lorem.sentence(),
      image: faker.internet.url(),
    };
    jest.spyOn(repository, 'findPostById').mockResolvedValueOnce(post);
    jest.spyOn(publications, 'findOneByPostId').mockResolvedValueOnce({
      id: 1,
      mediaId: 1,
      postId: 1,
      date: new Date(),
    });

    const promise = service.remove(1);
    expect(promise).rejects.toEqual(new ForbiddenException());
  });
});
