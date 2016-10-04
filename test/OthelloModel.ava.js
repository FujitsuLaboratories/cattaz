import test from 'ava';

import * as OM from '../src/apps/OthelloModel';

const None = OM.StoneNone;
const Black = OM.StoneBlack;
const White = OM.StoneWhite;
const Model = OM.default;

/** @test {OthelloModel#getCells} */
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
    ]
  );
});

/**
 * @test {OthelloModel#getCells}
 * @test {OthelloModel#addStep}
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
    ]
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
    ]
  );
});

/** @test {OthelloModel#addStep} */
test('addStep should reject invalid step', t => {
  const model = new Model();
  t.throws(() => {
    model.addStep(Black, 0, 0);
  });
});
