import { db as prisma } from '../db.connect';

type createPublicationParam = {
  mediaId: number;
  postId: number;
  date: Date;
};

export function createPublication(data: createPublicationParam) {
  return prisma.publication.create({
    data,
    select: { id: true, mediaId: true, postId: true, date: true },
  });
}
