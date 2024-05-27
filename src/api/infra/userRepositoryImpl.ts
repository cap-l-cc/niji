import {
  DatabaseError,
  User,
  UserNotFound,
  type UserRepository,
} from '@/domain/user';
import { assertOneOrMore } from '@/libs/fn';
import { Cat, Option, Promise as PromiseFn, Result } from '@mikuroxina/mini-fn';
import { type DrizzleError, eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { usersTableSchema } from './dbSchema';

const assertUserIdExists =
  (id: User.Id) =>
  <T>(values: T[]) =>
    Option.okOr(new UserNotFound(id))(assertOneOrMore(values));

export const userRepositoryImpl = (db: DrizzleD1Database): UserRepository => ({
  get: async ({ id }) => {
    const fetcher = (userId: User.Id) =>
      db
        .select()
        .from(usersTableSchema)
        .where(eq(usersTableSchema.userId, userId))
        .then(Result.ok)
        .catch((err: DrizzleError) => Result.err(new DatabaseError(err)));

    return Cat.cat(id)
      .feed(fetcher)
      .feed(PromiseFn.map(Result.andThen(assertUserIdExists(id))))
      .feed(
        PromiseFn.map(
          Result.map(
            ({ userId, userName, googleAccountId, userProfileIconKey }) =>
              User.as({
                id: User.Id.as(userId),
                name: userName,
                googleAccountId,
                profileIconUrl: userProfileIconKey ?? undefined,
              }),
          ),
        ),
      ).value;
  },
  add: ({ newUser }) => {
    const fetcher = ({
      id: userId,
      name: userName,
      googleAccountId,
      profileIconUrl: userProfileIconKey,
    }: User) =>
      db
        .insert(usersTableSchema)
        .values({ userId, userName, googleAccountId, userProfileIconKey })
        .returning()
        // biome-ignore lint/style/noNonNullAssertion: users must have one element at least
        .then((users) => Result.ok(users[0]!))
        .catch((err: DrizzleError) => Result.err(new DatabaseError(err)));

    return Cat.cat(newUser)
      .feed(fetcher)
      .feed(
        PromiseFn.map(
          Result.map(
            ({ userId, userName, googleAccountId, userProfileIconKey }) =>
              User.as({
                id: User.Id.as(userId),
                name: userName,
                googleAccountId,
                profileIconUrl: userProfileIconKey ?? undefined,
              }),
          ),
        ),
      ).value;
  },
});
