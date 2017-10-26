import test from 'ava';

import * as RM from '../../src/apps/ReversiModel';

const None = RM.StoneNone;
const Black = RM.StoneBlack;
const White = RM.StoneWhite;
const Model = RM.default;

/** @test {ReversiModel#getCells} */
/** @test {ReversiModel#getStoneCounts} */
test('initial cells should be filled', t => {
  const model = new Model();
  const cells = model.getCells();
  t.deepEqual(
    cells,
    [
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, White, Black, None, None, None],
      [None, None, None, Black, White, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
    ],
  );
  t.deepEqual(
    model.getStoneCounts(),
    { [None]: 64 - 4, [Black]: 2, [White]: 2 },
  );
});

/**
 * @test {ReversiModel#getCells}
 * @test {ReversiModel#getStoneCounts}
 * @test {ReversiModel#addStep}
 */
test('placing several stones should reflect cells status', t => {
  const model = new Model();
  model.addStep(Black, 3, 2);
  t.deepEqual(
    model.getCells(),
    [
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, Black, Black, Black, None, None, None],
      [None, None, None, Black, White, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
    ],
  );
  t.deepEqual(
    model.getStoneCounts(),
    { [None]: 64 - 5, [Black]: 4, [White]: 1 },
  );
  model.addStep(White, 2, 2);
  t.deepEqual(
    model.getCells(),
    [
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, White, None, None, None, None, None],
      [None, None, Black, White, Black, None, None, None],
      [None, None, None, Black, White, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
      [None, None, None, None, None, None, None, None],
    ],
  );
  t.deepEqual(
    model.getStoneCounts(),
    { [None]: 64 - 6, [Black]: 3, [White]: 3 },
  );
});

/** @test {ReversiModel#addStep} */
test('addStep should reject invalid step', t => {
  const model = new Model();
  t.throws(() => {
    model.addStep(Black, 0, 0);
  });
});

/** @test {ReversiModel#serialize} */
/** @test {ReversiModel.deserialize} */
test('ReversiModel should correctly serialize and deserialize', t => {
  const model = new Model();
  model.addStep(Black, 3, 2);
  t.deepEqual(
    model.getStoneCounts(),
    { [None]: 64 - 5, [Black]: 4, [White]: 1 },
  );
  const serialized = model.serialize();
  t.is(typeof serialized, 'string');
  const model2 = Model.deserialize(serialized);
  t.true(model.equals(model2));
  const serialized2 = model2.serialize();
  t.is(serialized, serialized2);
});

/** @test {ReversiModel.deserialize} */
test('deserilize should create a new instance when invalid serialized content is given', t => {
  const model = Model.deserialize('INVALID');
  t.deepEqual(
    model.getStoneCounts(),
    { [None]: 64 - 4, [Black]: 2, [White]: 2 },
  );
});
