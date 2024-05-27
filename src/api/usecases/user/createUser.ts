import { resPromiseToPromiseRes } from '@/libs/fn';
import { User, type UserRepository } from '@/domain/user';
import { Cat, Result } from '@mikuroxina/mini-fn';

const convertToRepoParam = Result.map((newUser: User) => ({ newUser }));

export namespace CreateUserUsecase {
  export type Param = {
    id: string;
    name: string;
    googleAccountId: string;
    profileIconUrl?: string;
  };

  export type Dto = Pick<Param, 'id'>;
}

export type CreateUserUsecase = (
  params: CreateUserUsecase.Param,
) => Promise<Result.Result<Error, CreateUserUsecase.Dto>>;

export const createUserUsecase =
  (repo: UserRepository): CreateUserUsecase =>
  async ({ id, name, googleAccountId, profileIconUrl }) =>
    Cat.cat(id)
      .feed(User.Id.of)
      .feed(
        Result.andThen((id) =>
          User.of({
            id,
            name,
            googleAccountId,
            profileIconUrl,
          }),
        ),
      )
      .feed(convertToRepoParam)
      .feed(Result.map(repo.add))
      .feed(resPromiseToPromiseRes).value;
