import { User } from '@/domain/user';
import { usersEndpoint } from './users';
import { env } from 'cloudflare:test';

const expectedUserId = User.Id.as('test-user-id');

const fetchUserEp = async (userId: string, method: 'GET' | 'POST') =>
  usersEndpoint.request(`/${userId}`, { method }, env);

describe('GET /:userId', () => {
  const wrappedGetUser = async (userId: string) => fetchUserEp(userId, 'GET');

  it('returns 404 when get non-registered user', async () => {
    const res = await wrappedGetUser(expectedUserId);

    expect(res.status).toBe(404);
    expect(await res.json()).toStrictEqual({
      ok: false,
      data: { id: expectedUserId },
      error: `指定されたIDのユーザは存在しません: ${expectedUserId}`,
    });
  });

  it('returns 500 when database has a internal problem', async () => {
    await env.DB.exec('DROP TABLE users;');

    const res = await wrappedGetUser(expectedUserId);

    expect(res.status).toBe(500);
    expect(await res.json()).toStrictEqual({
      ok: false,
      data: { id: expectedUserId },
      error: 'DBの処理中にエラーが発生しました',
    });
  });
});
