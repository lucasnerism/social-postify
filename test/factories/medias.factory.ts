import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/database/prisma.service';

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

export function createMedia(prisma: PrismaService, data: createMediaParam) {
  return prisma.media.create({
    data,
    select: { id: true, title: true, username: true },
  });
}
