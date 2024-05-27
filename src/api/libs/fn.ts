import { Option, Result } from '@mikuroxina/mini-fn';

import { Promise as PromiseFn } from '@mikuroxina/mini-fn';

export const resPromiseToPromiseRes = <E, T>(
  resPromise: Result.Result<E, Promise<Result.Result<E, T>>>,
): Promise<Result.Result<E, T>> =>
  Result.isOk(resPromise)
    ? Result.unwrap(resPromise)
    : PromiseFn.pure(resPromise);

export const assertOneOrMore = <T>(values: T[]) =>
  values[0] ? Option.some(values[0]) : Option.none();
