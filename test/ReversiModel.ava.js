import test from 'ava';

import * as RM from '../src/apps/ReversiModel';

const None = RM.StoneNone;
const Black = RM.StoneBlack;
const White = RM.StoneWhite;
const Model = RM.default;

/** @test {ReversiModel#getCells} */
test('initial cells should be filled', t => {
  const model = new Model();
  const cells = model.getCells();
  t.deepEqual(
    cells,
    [
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, Black, White, None, None, None],
      [None, None, None, White, Black, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
    ],
  );
});

/**
 * @test {ReversiModel#getCells}
 * @test {ReversiModel#addStep}
 */
test('placing several stones should reflect cells status', t => {
  const model = new Model();
  model.addStep(Black, 3, 5);
  t.deepEqual(
    model.getCells(),
    [
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, Black, Black, Black, None, None],
      [None, None, None, White, Black, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
    ],
  );
  model.addStep(White, 2, 5);
  t.deepEqual(
    model.getCells(),
    [
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, White, None, None],
      [None, None, None, Black, White, Black, None, None],
      [None, None, None, White, Black, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
    ],
  );
});

/** @test {ReversiModel#addStep} */
test('addStep should reject invalid step', t => {
  const model = new Model();
  t.throws(() => {
    model.addStep(Black, 0, 0);
  });
});
