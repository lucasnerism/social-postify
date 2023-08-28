import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { cleanDb } from '../helpers';
import { createPost, generatePost } from '../factories/posts.factory';
import { createMedia, generateMedia } from '../factories/medias.factory';
import { createPublication } from '../factories/publications.factory';
import { PrismaService } from '../../src/database/prisma.service';

describe('PostsController (e2e)', () => {
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

  it('POST /posts => should return status 201 with a valid body', () => {
    const post = generatePost();
    return request(app.getHttpServer())
      .post('/posts')
      .send(post)
      .expect(HttpStatus.CREATED);
  });

  it('POST /posts => should return status 400 with an invalid body', () => {
    const post = generatePost();
    return request(app.getHttpServer())
      .post('/posts')
      .send({ title: post.title })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('GET /posts => should return an empty array if theres no post', () => {
    return request(app.getHttpServer())
      .get('/posts')
      .expect(HttpStatus.OK)
      .expect([]);
  });

  it('GET /posts => should return all posts', async () => {
    const post = await createPost(prisma, generatePost());
    const post2 = await createPost(prisma, generatePost());
    const response = await request(app.getHttpServer()).get('/posts');
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual([post, post2]);
  });

  it('GET /posts/:id => should return post with that id', async () => {
    const post = await createPost(prisma, generatePost());
    const response = await request(app.getHttpServer()).get(
      `/posts/${post.id}`,
    );
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual(post);
  });

  it('GET /posts/:id => should return status 404 with id that doesnt exist', async () => {
    const response = await request(app.getHttpServer()).get(`/posts/100`);
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('PUT /posts/:id => should update said post', async () => {
    const post = await createPost(prisma, generatePost());
    const newPost = generatePost();
    const response = await request(app.getHttpServer())
      .put(`/posts/${post.id}`)
      .send(newPost);
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual({ id: post.id, ...newPost });
  });

  it('PUT /posts/:id => should return status 404 with id that doesnt exist', async () => {
    const post = generatePost();
    const response = await request(app.getHttpServer())
      .put(`/posts/100`)
      .send(post);
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('DELETE /posts/:id => should delete said post', async () => {
    const post = await createPost(prisma, generatePost());
    const response = await request(app.getHttpServer()).delete(
      `/posts/${post.id}`,
    );
    expect(response.status).toEqual(HttpStatus.OK);
  });

  it('DELETE /posts/:id => should return status 404 with id that doesnt exist', async () => {
    const response = await request(app.getHttpServer()).delete(`/posts/1`);
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('DELETE /posts/:id => should return status 403 when post is used in a publication', async () => {
    const media = await createMedia(prisma, generateMedia());
    const post = await createPost(prisma, generatePost());
    await createPublication(prisma, {
      mediaId: media.id,
      postId: post.id,
      date: new Date(),
    });
    const response = await request(app.getHttpServer()).delete(
      `/posts/${post.id}`,
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
  });
});
