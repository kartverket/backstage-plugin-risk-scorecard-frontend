import { isDeeplyEqual } from './utilityfunctions';

describe('isDeeplyEqual', () => {
  const testCases: [unknown, unknown, boolean][] = [
    [0, 0, true],
    [0, 1, false],
    ['', '', true],
    ['', 'a', false],
    ['b', 'a', false],
    [null, null, true],
    [undefined, undefined, true],
    [[], [], true],
    [[], [1], false],
    [{}, {}, true],
    [{}, { 0: 1 }, false],
    [0, '', false],
    [0, 'a', false],
    [0, null, false],
    [0, undefined, false],
    [0, [], false],
    [0, {}, false],
    ['', null, false],
    ['', undefined, false],
    ['', [], false],
    ['', {}, false],
    [[0], { '0': 0 }, false],
    [[0], { 0: 0 }, false],
    [[0, 3, 4], [0, 3, 4], true],
    [{ 0: 1 }, { 0: 1 }, true],
    [{ 0: [0, 1], 1: [2, 3] }, { 0: [0, 1], 1: [2, 3] }, true],
    [{ 0: [0, 1], 1: [2, 3] }, { 0: [0, 1] }, false],
    [{ 0: { a: 'b' } }, { 0: [0, 1] }, false],
    [{ 0: { a: 'b' } }, { 0: { a: 'b' } }, true],
    [{ 0: { a: { b: 1 } } }, { 0: { a: 'b' } }, false],
    [{ 0: { a: { b: 1 } } }, { 0: { a: { b: 1 } } }, true],
    [{ 0: { a: { b: 1 } } }, { 0: { a: { b: 1, c: 1 } } }, false],
    [{ 0: { a: { b: 1, c: 1 }, b: 1 } }, { 0: { a: { b: 1, c: 1 } } }, false],
    [{ 0: 1 }, { '0': 1 }, true],
  ];

  testCases.forEach(([a, b, result]) =>
    test(`isDeeplyEqual(${JSON.stringify(a)}, ${JSON.stringify(b)})`, () => {
      expect(isDeeplyEqual(a, b)).toBe(result);
    }),
  );
});
