import { User, type UserRepository } from '@/domain/user';
import { Result } from '@mikuroxina/mini-fn';
import { getUserUsecase } from './getUser';

describe('getUserUsecase', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockedUsecase = (getFn: UserRepository.Get) =>
    getUserUsecase({
      add: vi.fn(),
      get: getFn,
    });

  it('should return Result.Ok when received sufficient user params', async () => {
    const expected = User.as({
      id: User.Id.as('some-user-id'),
      name: 'user-name',
      googleAccountId: 'google-account-id',
    });
    const getFn = vi.fn().mockResolvedValue(Result.ok(expected));
    const actual = await mockedUsecase(getFn)({ id: expected.id });

    expect(getFn).toBeCalledTimes(1);
    expect(getFn).toBeCalledWith({ id: expected.id });
    expect(Result.isOk(actual)).toBeTruthy();
  });

  it('should return Result.Err when received insufficient id in params', async () => {
    const getFn = vi.fn();
    const actual = await mockedUsecase(getFn)({ id: '' });

    expect(getFn).not.toBeCalled();
    expect(Result.isErr(actual)).toBeTruthy();
  });
});
