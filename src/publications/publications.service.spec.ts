import { Test, TestingModule } from '@nestjs/testing';
import { PublicationsService } from './publications.service';
import { MediasService } from '../medias/medias.service';
import { PostsService } from '../posts/posts.service';
import { PublicationsRepository } from './publications.repository';
import { Publication } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('PublicationsService', () => {
  let service: PublicationsService;
  let repository: PublicationsRepository;
  let media: MediasService;
  let post: PostsService;
  let prismaMock = {
    createPublication: jest.fn(),
    findPublications: jest.fn(),
    findPublicationById: jest.fn(),
    findPublicationByMediaId: jest.fn(),
    findPublicationByPostId: jest.fn(),
    updatePublicationById: jest.fn(),
    deletePublicationById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicationsService,
        { provide: PublicationsRepository, useValue: prismaMock },
        {
          provide: PostsService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: MediasService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PublicationsService>(PublicationsService);
    repository = module.get<PublicationsRepository>(PublicationsRepository);
    media = module.get<MediasService>(MediasService);
    post = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create(publication) => should return created publication', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest.spyOn(media, 'findOne').mockResolvedValueOnce(undefined);
    jest.spyOn(post, 'findOne').mockResolvedValueOnce(undefined);
    jest
      .spyOn(repository, 'createPublication')
      .mockResolvedValueOnce(publication);

    const result = await service.create({
      postId: publication.postId,
      mediaId: publication.mediaId,
      date: publication.date,
    });
    expect(result).toEqual(publication);
  });

  it('findAll() => should return all publications', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest
      .spyOn(repository, 'findPublications')
      .mockResolvedValueOnce([publication]);

    const result = await service.findAll();
    expect(result).toEqual([publication]);
  });

  it('findOne(id) => should return said publication', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest
      .spyOn(repository, 'findPublicationById')
      .mockResolvedValueOnce(publication);

    const result = await service.findOne(1);
    expect(result).toEqual(publication);
  });

  it('findOne(id) => should return Not Found when post doesnt exists', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest
      .spyOn(repository, 'findPublicationById')
      .mockResolvedValueOnce(undefined);

    const promise = service.findOne(1);
    expect(promise).rejects.toEqual(new NotFoundException());
  });

  it('findOneByMediaId(id) => should return said publication', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest
      .spyOn(repository, 'findPublicationByMediaId')
      .mockResolvedValueOnce(publication);

    const result = await service.findOneByMediaId(1);
    expect(result).toEqual(publication);
  });

  it('findOneByMediaId(id) => should return said publication', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest
      .spyOn(repository, 'findPublicationByPostId')
      .mockResolvedValueOnce(publication);

    const result = await service.findOneByPostId(1);
    expect(result).toEqual(publication);
  });

  it('update(id,body) => should return Not Found when publication doesnt exists', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest
      .spyOn(repository, 'findPublicationById')
      .mockResolvedValueOnce(undefined);

    const promise = service.update(1, {
      postId: publication.postId,
      mediaId: publication.mediaId,
      date: publication.date,
    });
    expect(promise).rejects.toEqual(new NotFoundException());
  });

  it('update(id,body) => should return updated publication', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date('2024-08-08'),
    };
    jest
      .spyOn(repository, 'findPublicationById')
      .mockResolvedValueOnce(publication);
    jest.spyOn(media, 'findOne').mockResolvedValueOnce(undefined);
    jest.spyOn(post, 'findOne').mockResolvedValueOnce(undefined);
    jest
      .spyOn(repository, 'updatePublicationById')
      .mockResolvedValueOnce(publication);

    const result = await service.update(1, {
      postId: publication.postId,
      mediaId: publication.mediaId,
      date: publication.date,
    });
    expect(result).toEqual(publication);
  });

  it('update(id,body) => should return ForbiddenException if publication was already published', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date('2022-08-08'),
    };
    jest
      .spyOn(repository, 'findPublicationById')
      .mockResolvedValueOnce(publication);

    const promise = service.update(1, {
      postId: publication.postId,
      mediaId: publication.mediaId,
      date: publication.date,
    });
    expect(promise).rejects.toEqual(new ForbiddenException());
  });

  it('remove(id) => should delete said publication', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest
      .spyOn(repository, 'findPublicationById')
      .mockResolvedValueOnce(publication);
    jest
      .spyOn(repository, 'deletePublicationById')
      .mockResolvedValueOnce(undefined);

    const result = await service.remove(1);
    expect(result).toEqual(undefined);
  });

  it('remove(id) => should return NotFoundException when publication doesnt exist', async () => {
    const publication: Omit<Publication, 'createdAt' | 'updatedAt'> = {
      id: 1,
      postId: 1,
      mediaId: 1,
      date: new Date(),
    };
    jest
      .spyOn(repository, 'findPublicationById')
      .mockResolvedValueOnce(undefined);

    const promise = service.remove(1);
    expect(promise).rejects.toEqual(new NotFoundException());
  });
});
