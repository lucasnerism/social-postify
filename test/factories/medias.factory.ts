import { faker } from '@faker-js/faker';
import { db as prisma } from '../db.connect';

type createMediaParam = {
  title: string;
  username: string;
};

export function generateMedia() {
  return {
    title: faker.internet.domainName(),
    username: faker.internet.url(),
  };
}

export function createMedia(data: createMediaParam) {
  return prisma.media.create({
    data,
    select: { id: true, title: true, username: true },
  });
}
