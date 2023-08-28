import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/database/prisma.service';

type createPostParam = {
  title: string;
  text: string;
  image?: string;
};

export function generatePost() {
  return {
    title: faker.lorem.words(),
    text: faker.lorem.sentence(),
    image: faker.internet.url(),
  };
}

export function createPost(prisma: PrismaService, data: createPostParam) {
  return prisma.post.create({
    data,
    select: { id: true, title: true, text: true, image: true },
  });
}
