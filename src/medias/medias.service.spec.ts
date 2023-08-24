import { Test, TestingModule } from '@nestjs/testing';
import { MediasService } from './medias.service';
import { MediasRepository } from './medias.repository';
import { Media } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PublicationsService } from '../publications/publications.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('MediasService', () => {
  let service: MediasService;
  let repository: MediasRepository;
  let publications: PublicationsService;
  let prismaMock = {
    createMedia: jest.fn(),
    findMedias: jest.fn(),
    findMediaById: jest.fn(),
    updateMediaById: jest.fn(),
    deleteMediaById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediasService,
        { provide: MediasRepository, useValue: prismaMock },
        {
          provide: PublicationsService,
          useValue: { findOneByMediaId: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MediasService>(MediasService);
    repository = module.get<MediasRepository>(MediasRepository);
    publications = module.get<PublicationsService>(PublicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create(media) should return created media', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'createMedia').mockResolvedValueOnce(media);
    jest.spyOn(service, 'findMediaWithData').mockResolvedValueOnce();

    const result = await service.create({
      title: media.title,
      username: media.username,
    });
    expect(result).toEqual(media);
  });

  it('create(media) should return ConflictException when using duplicate media', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMedias').mockResolvedValueOnce([media]);

    const promise = service.create({
      title: media.title,
      username: media.username,
    });
    expect(promise).rejects.toEqual(new ConflictException());
  });

  it('findAll() should return all medias', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMedias').mockResolvedValueOnce([media]);

    const result = await service.findAll();
    expect(result).toEqual([media]);
  });

  it('findOne(id) should return said media', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMediaById').mockResolvedValueOnce(media);

    const result = await service.findOne(1);
    expect(result).toEqual(media);
  });

  it('findOne(id) should return Not Found when media doesnt exists', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMediaById').mockResolvedValueOnce(undefined);

    const promise = service.findOne(1);
    expect(promise).rejects.toEqual(new NotFoundException());
  });

  it('update(id,body) should return Not Found when media doesnt exists', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMediaById').mockResolvedValueOnce(undefined);

    const promise = service.update(1, {
      title: media.title,
      username: media.username,
    });
    expect(promise).rejects.toEqual(new NotFoundException());
  });

  it('update(id,body) should return ConflictException when using duplicated body', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMediaById').mockResolvedValueOnce(media);
    jest.spyOn(repository, 'findMedias').mockResolvedValueOnce([media]);

    const promise = service.update(1, {
      title: media.title,
      username: media.username,
    });
    expect(promise).rejects.toEqual(new ConflictException());
  });

  it('update(id,body) should return updated media', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMediaById').mockResolvedValueOnce(media);
    jest.spyOn(repository, 'findMedias').mockResolvedValueOnce([]);
    jest.spyOn(repository, 'updateMediaById').mockResolvedValueOnce(media);

    const result = await service.update(1, {
      title: media.title,
      username: media.username,
    });
    expect(result).toEqual(media);
  });

  it('remove(id) should delete said media', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMediaById').mockResolvedValueOnce(media);
    jest
      .spyOn(publications, 'findOneByMediaId')
      .mockResolvedValueOnce(undefined);
    jest.spyOn(repository, 'deleteMediaById').mockResolvedValueOnce(undefined);

    const result = await service.remove(1);
    expect(result).toEqual(undefined);
  });

  it('remove(id) should return NotFoundException when media doesnt exist', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMediaById').mockResolvedValueOnce(undefined);

    const promise = service.remove(1);
    expect(promise).rejects.toEqual(new NotFoundException());
  });

  it('remove(id) should return ForbiddenException when publication exist', async () => {
    const media: Omit<Media, 'createdAt' | 'updatedAt'> = {
      id: 1,
      title: faker.animal.bird(),
      username: faker.internet.url(),
    };
    jest.spyOn(repository, 'findMediaById').mockResolvedValueOnce(media);
    jest.spyOn(publications, 'findOneByMediaId').mockResolvedValueOnce({
      id: 1,
      mediaId: 1,
      postId: 1,
      date: new Date(),
    });

    const promise = service.remove(1);
    expect(promise).rejects.toEqual(new ForbiddenException());
  });
});
