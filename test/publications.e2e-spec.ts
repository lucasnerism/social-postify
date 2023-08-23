import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { cleanDb } from './helpers';
import { createPost, generatePost } from './factories/posts.factory';
import { createMedia, generateMedia } from './factories/medias.factory';
import { createPublication } from './factories/publications.factory';

describe('PublicationsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await cleanDb();
  });

  beforeEach(async () => {
    await cleanDb();
  });

  it('POST /publications should return status 201 with a valid body', async () => {
    const media = await createMedia(generateMedia());
    const post = await createPost(generatePost());
    return request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id, mediaId: media.id, date: new Date() })
      .expect(HttpStatus.CREATED);
  });

  it('POST /publications should return status 400 with an invalid body', async () => {
    const post = await createPost(generatePost());
    return request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id, date: new Date() })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('POST /publications should return status 404 with an inexistent media or post', async () => {
    const post = await createPost(generatePost());
    const media = await createMedia(generateMedia());

    const promise = await request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id, mediaId: media.id + 1, date: new Date() });
    expect(promise.status).toEqual(HttpStatus.NOT_FOUND);

    const promise2 = await request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id + 1, mediaId: media.id, date: new Date() });
    expect(promise2.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('GET /publications should return an empty array if theres no publication', () => {
    return request(app.getHttpServer())
      .get('/publications')
      .expect(HttpStatus.OK)
      .expect([]);
  });

  it('GET /publications should return all publications', async () => {
    const post = await createPost(generatePost());
    const media = await createMedia(generateMedia());
    const publication1 = await createPublication({
      mediaId: media.id,
      postId: post.id,
      date: new Date(),
    });
    const publication2 = await createPublication({
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
});
