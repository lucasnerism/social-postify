import { PrismaService } from '../src/database/prisma.service';

export async function cleanDb(prisma: PrismaService) {
  await prisma.publication.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.post.deleteMany({});
}
