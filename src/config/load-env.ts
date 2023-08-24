export async function loadEnv() {
  const dotenv = await import('dotenv');
  const dotenvExpand = await import('dotenv-expand');

  const path = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

  const currentEnvs = dotenv.config({ path });
  dotenvExpand.expand(currentEnvs);
}
