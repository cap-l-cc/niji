import { Cat, Result } from '@mikuroxina/mini-fn';
import { User, type UserRepository } from '@/domain/user';
import { resPromiseToPromiseRes } from '@/libs/fn';

const convertToRepoParam = Result.map((id: User.Id) => ({ id }));

export namespace GetUserUsecase {
  export type Param = { id: string };

  export type Dto = Param & {
    name: string;
    googleAccountId: string;
    profileIconUrl?: string;
  };
}

export type GetUserUsecase = (
  params: GetUserUsecase.Param,
) => Promise<Result.Result<Error, GetUserUsecase.Dto>>;

export const getUserUsecase =
  (repo: UserRepository): GetUserUsecase =>
  async ({ id }) =>
    Cat.cat(id)
      .feed(User.Id.of)
      .feed(convertToRepoParam)
      .feed(Result.map(repo.get))
      .feed(resPromiseToPromiseRes).value;
