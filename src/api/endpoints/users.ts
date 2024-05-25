import { getUserUsecase } from '@/usecases/user';
import { userRepositoryImpl } from '@/infra/userRepositoryImpl';
import { Result } from '@mikuroxina/mini-fn';
import { createAppWithDb } from '@/libs/factory';
import { UserNotFound, type UserRepository } from '@/domain/user';

const app = createAppWithDb<{ repo: UserRepository }>();

export const usersEndpoint = app
  .use(async (c, next) => {
    c.set('repo', userRepositoryImpl(c.var.db));

    await next();
  })
  .get('/:id', async (c) => {
    const { id } = c.req.param();

    const result = await getUserUsecase(c.var.repo)({ id });
    if (Result.isOk(result)) {
      return c.json({ ok: true, data: Result.unwrap(result) } as const);
    }

    const err = Result.unwrapErr(result);
    if (err instanceof UserNotFound) {
      return c.json(
        {
          ok: false,
          data: { id },
          error: err.message,
        } as const,
        404,
      );
    }

    return c.json(
      {
        ok: false,
        data: { id },
        error: err.message,
      } as const,
      500,
    );
  })
  .post((c) => c.json({}));
// TODO: impl
