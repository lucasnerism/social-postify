import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { cleanDb } from '../helpers';
import { createPost, generatePost } from '../factories/posts.factory';
import { createMedia, generateMedia } from '../factories/medias.factory';
import { createPublication } from '../factories/publications.factory';
import { PrismaService } from '../../src/database/prisma.service';

describe('PublicationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService = new PrismaService();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await cleanDb(prisma);
  });

  it('POST /publications => should return status 201 with a valid body', async () => {
    const media = await createMedia(prisma, generateMedia());
    const post = await createPost(prisma, generatePost());
    return request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id, mediaId: media.id, date: new Date() })
      .expect(HttpStatus.CREATED);
  });

  it('POST /publications => should return status 400 with an invalid body', async () => {
    const post = await createPost(prisma, generatePost());
    return request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id, date: new Date() })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('POST /publications => should return status 404 with an inexistent media or post', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());

    const promise = await request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id, mediaId: media.id + 1, date: new Date() });
    expect(promise.status).toEqual(HttpStatus.NOT_FOUND);

    const promise2 = await request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id + 1, mediaId: media.id, date: new Date() });
    expect(promise2.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('GET /publications => should return an empty array if theres no publication', () => {
    return request(app.getHttpServer())
      .get('/publications')
      .expect(HttpStatus.OK)
      .expect([]);
  });

  it('GET /publications => should return all publications', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    const publication1 = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date(),
    });
    const publication2 = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date(),
    });
    const response = await request(app.getHttpServer()).get('/publications');
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual([
      { ...publication1, date: publication1.date.toISOString() },
      { ...publication2, date: publication2.date.toISOString() },
    ]);
  });

  it('GET /publications?published=false => should return only unpublished publications', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-01-01'),
    });
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-09-09'),
    });
    const response = await request(app.getHttpServer()).get(
      '/publications?published=false',
    );
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual([
      { ...publication, date: publication.date.toISOString() },
    ]);
  });

  it('GET /publications?published=true => should return only published publications', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-09-09'),
    });
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-01-01'),
    });
    const response = await request(app.getHttpServer()).get(
      '/publications?published=true',
    );
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual([
      { ...publication, date: publication.date.toISOString() },
    ]);
  });

  it('GET /publications?after=date => should return only publications after said date', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-07-07'),
    });
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-01-01'),
    });
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-09-09'),
    });
    const response = await request(app.getHttpServer()).get(
      '/publications?after=2023-08-08',
    );
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual([
      { ...publication, date: publication.date.toISOString() },
    ]);
  });

  it('GET /publications?published=true&after=date => should return only published publications after said date', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-09-09'),
    });
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-01-01'),
    });
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-07-07'),
    });
    const response = await request(app.getHttpServer()).get(
      '/publications?published=true&after=2023-06-06',
    );
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual([
      { ...publication, date: publication.date.toISOString() },
    ]);
  });

  it('GET /publications?published=false&after=date => should return only unpublished publications after said date', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-07-07'),
    });
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-01-01'),
    });
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2023-09-09'),
    });
    const response = await request(app.getHttpServer()).get(
      '/publications?published=false&after=2022-06-06',
    );
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual([
      { ...publication, date: publication.date.toISOString() },
    ]);
  });

  it('GET /publications/:id => should return said publication', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date(),
    });
    const response = await request(app.getHttpServer()).get(
      `/publications/${publication.id}`,
    );
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual({
      ...publication,
      date: publication.date.toISOString(),
    });
  });

  it('GET /publications/:id => should return status 404 with id that doesnt exist', async () => {
    const response = await request(app.getHttpServer()).get(`/publications/1`);
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('PUT /publications/:id => should update said publication', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2024-09-09'),
    });
    const response = await request(app.getHttpServer())
      .put(`/publications/${publication.id}`)
      .send({ mediaId: media.id, postId: post.id, date: new Date() });
    expect(response.status).toEqual(HttpStatus.OK);
  });

  it('PUT /publications/:id => should return status 403 if publication was already published', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2022-08-08'),
    });
    const response = await request(app.getHttpServer())
      .put(`/publications/${publication.id}`)
      .send({ mediaId: media.id, postId: post.id, date: new Date() });
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('PUT /publications/:id => should return status 404 with id that doesnt exist', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    const response = await request(app.getHttpServer())
      .put(`/publications/1`)
      .send({ mediaId: media.id, postId: post.id, date: new Date() });
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('put /publications/:id => should return status 404 with an inexistent media or post', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date('2024-09-09'),
    });

    const promise = await request(app.getHttpServer())
      .post(`/publications/${publication.id}`)
      .send({ postId: post.id, mediaId: media.id + 1, date: new Date() });
    expect(promise.status).toEqual(HttpStatus.NOT_FOUND);

    const promise2 = await request(app.getHttpServer())
      .post(`/publications/${publication.id}`)
      .send({ postId: post.id + 1, mediaId: media.id, date: new Date() });
    expect(promise2.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('DELETE /publications/:id => should delete said publication', async () => {
    const post = await createPost(prisma, generatePost());
    const media = await createMedia(prisma, generateMedia());
    const publication = await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date(),
    });
    const response = await request(app.getHttpServer()).delete(
      `/publications/${publication.id}`,
    );
    expect(response.status).toEqual(HttpStatus.OK);
  });

  it('DELETE /publications/:id => should return status 404 with id that doesnt exist', async () => {
    const response = await request(app.getHttpServer()).delete(
      `/publications/1`,
    );
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });
});
