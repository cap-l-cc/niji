import { User, type UserRepository } from '@/domain/user';
import { createUserUsecase } from './createUser';
import { Result } from '@mikuroxina/mini-fn';

describe('createUserUsecase', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const expected = User.as({
    id: User.Id.as('some-user-id'),
    name: 'user-name',
    googleAccountId: 'google-account-id',
  });
  const mockedUsecase = (addFn: UserRepository.Add) =>
    createUserUsecase({
      add: addFn,
      get: vi.fn(),
    });

  it('should return Result.Ok when received sufficient user params', async () => {
    const addFn = vi.fn().mockResolvedValue(Result.ok(expected));
    const actual = await mockedUsecase(addFn)({ ...expected });

    expect(addFn).toBeCalledTimes(1);
    expect(Result.isOk(actual)).toBeTruthy();
  });

  it('should return Result.Err when received insufficient id in params', async () => {
    const addFn = vi.fn();
    const actual = await mockedUsecase(addFn)({ ...expected, id: '' });

    expect(addFn).not.toBeCalled();
    expect(Result.isErr(actual)).toBeTruthy();
  });

  it('should return Result.Err when received insufficient user params', async () => {
    const addFn = vi.fn();
    const actual = await mockedUsecase(addFn)({ ...expected, name: '' });

    expect(addFn).not.toBeCalled();
    expect(Result.isErr(actual)).toBeTruthy();
  });
});
