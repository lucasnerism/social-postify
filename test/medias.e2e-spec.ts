import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { cleanDb } from './helpers';
import { createMedia, generateMedia } from './factories/medias.factory';
import { createPost, generatePost } from './factories/posts.factory';
import { createPublication } from './factories/publications.factory';

describe('MediasController (e2e)', () => {
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

  it('POST /medias should return status 201 with a valid body', () => {
    const media = generateMedia();
    return request(app.getHttpServer())
      .post('/medias')
      .send(media)
      .expect(HttpStatus.CREATED);
  });

  it('POST /medias should return status 400 with an invalid body', () => {
    const media = generateMedia();
    return request(app.getHttpServer())
      .post('/medias')
      .send({ username: media.username })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('POST /medias should return status 409 with a duplicated media', async () => {
    const media = generateMedia();
    await createMedia(media);
    return request(app.getHttpServer())
      .post('/medias')
      .send(media)
      .expect(HttpStatus.CONFLICT);
  });

  it('GET /medias should return an empty array if theres no media', () => {
    return request(app.getHttpServer())
      .get('/medias')
      .expect(HttpStatus.OK)
      .expect([]);
  });

  it('GET /medias should return all medias', async () => {
    const media = await createMedia(generateMedia());
    const media2 = await createMedia(generateMedia());
    const response = await request(app.getHttpServer()).get('/medias');
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual([media, media2]);
  });

  it('GET /medias/:id should return media with that id', async () => {
    const media = await createMedia(generateMedia());
    const response = await request(app.getHttpServer()).get(
      `/medias/${media.id}`,
    );
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual(media);
  });

  it('GET /medias/:id should return status 404 with id that doesnt exist', async () => {
    const response = await request(app.getHttpServer()).get(`/medias/100`);
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('PUT /medias/:id should update said media', async () => {
    const media = await createMedia(generateMedia());
    const newMedia = generateMedia();
    const response = await request(app.getHttpServer())
      .patch(`/medias/${media.id}`)
      .send(newMedia);
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual({ id: media.id, ...newMedia });
  });

  it('PUT /medias/:id should return status 404 with id that doesnt exist', async () => {
    const media = generateMedia();
    const response = await request(app.getHttpServer())
      .patch(`/medias/100`)
      .send(media);
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('PUT /medias/:id should return status 409 when duplicating another media', async () => {
    const media = await createMedia(generateMedia());
    const newMedia = await createMedia(generateMedia());
    const response = await request(app.getHttpServer())
      .patch(`/medias/${media.id}`)
      .send(newMedia);
    expect(response.status).toEqual(HttpStatus.CONFLICT);
  });

  it('DELETE /medias/:id should delete said media', async () => {
    const media = await createMedia(generateMedia());
    const response = await request(app.getHttpServer()).delete(
      `/medias/${media.id}`,
    );
    expect(response.status).toEqual(HttpStatus.OK);
  });

  it('DELETE /medias/:id should return status 404 with id that doesnt exist', async () => {
    const response = await request(app.getHttpServer()).delete(`/medias/1`);
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('DELETE /medias/:id should return status 403 when media is used in a publication', async () => {
    const media = await createMedia(generateMedia());
    const post = await createPost(generatePost());
    await createPublication({
      mediaId: media.id,
      postId: post.id,
      date: new Date(),
    });
    const response = await request(app.getHttpServer()).delete(
      `/medias/${media.id}`,
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
  });
});
