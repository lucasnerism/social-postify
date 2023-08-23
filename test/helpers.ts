import { db } from './db.connect';

export async function cleanDb() {
  await db.publication.deleteMany({});
  await db.media.deleteMany({});
  await db.post.deleteMany({});
}
