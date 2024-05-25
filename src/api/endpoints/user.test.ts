import { usersEndpoint } from './users';
import { env } from 'cloudflare:test';

it('returns 404 when get non-registered user', async () => {
  const res = await usersEndpoint.request('/user-id', {}, env);
  expect(res.status).toBe(404);
});
