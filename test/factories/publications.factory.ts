import { PrismaService } from '../../src/database/prisma.service';

type createPublicationParam = {
  mediaId: number;
  postId: number;
  date: Date;
};

export function createPublication(
  prisma: PrismaService,
  data: createPublicationParam,
) {
  return prisma.publication.create({
    data,
    select: { id: true, mediaId: true, postId: true, date: true },
  });
}
