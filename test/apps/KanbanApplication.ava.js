// import React from 'react';
import test from 'ava';

import KanbanApplication from '../../src/apps/KanbanApplication';

const KanbanModel = KanbanApplication.Model;

const mdKpt201 = `* keep
  * keep1
  * keep2
* problem
* try
  * try1`;

/** @test {KanbanModel#serialize} */
test('KanbanModel should serialize it into Markdown', t => {
  const model = new KanbanModel();
  t.is(model.serialize(), '');
  model.addList('keep');
  model.getListAt(model.getLength() - 1).addItem('keep1');
  model.getListAt(model.getLength() - 1).addItem('keep2');
  model.addList('problem');
  model.addList('try');
  model.getListAt(model.getLength() - 1).addItem('try1');
  t.is(model.serialize(), mdKpt201);
});

/** @test {KanbanModel.deserialize} */
test('KanbanModel should deserialize Markdown', t => {
  const model = new KanbanModel();
  t.true(model.equals(KanbanModel.deserialize('')));
  t.true(model.equals(KanbanModel.deserialize('\n\n')));
  model.addList('keep');
  model.getListAt(model.getLength() - 1).addItem('keep1');
  model.getListAt(model.getLength() - 1).addItem('keep2');
  model.addList('problem');
  model.addList('try');
  model.getListAt(model.getLength() - 1).addItem('try1');
  t.true(model.equals(KanbanModel.deserialize(mdKpt201)));
});

/** @test {KanbanModel.deserialize} */
test('KanbanModel should deserialize Markdown importance', t => {
  const model = KanbanModel.deserialize(`* list
  * ****asterisk 4****
  * ***asterisk 3***
  * **asterisk 2**
  * *asterisk 1*
  * normal
  * _underline 1_
  * __underline 2__
  * ___underline 3___
  * ____underline 4____
  * *asterisk 1 2 should be 1**`);
  t.deepEqual(model.getListAt(0).items.map(i => i.importance), [3, 3, 2, 1, 0, 1, 2, 3, 3, 1]);
});

/** @test {KanbanModel#moveItem} */
test('moveItem should move item', t => {
  const model = new KanbanModel();
  model.addList('keep');
  model.getListAt(model.getLength() - 1).addItem('keep1');
  model.getListAt(model.getLength() - 1).addItem('keep2');
  model.addList('problem');
  model.addList('try');
  model.getListAt(model.getLength() - 1).addItem('try1');
  t.true(model.equals(KanbanModel.deserialize(mdKpt201)));
  model.moveItem(0, 1, 2, 1);
  t.true(model.equals(KanbanModel.deserialize(`* keep
  * keep1
* problem
* try
  * try1
  * keep2`)));
});

/** @test {KanbanModel#moveList} */
test('moveList should move list', t => {
  const model = new KanbanModel();
  model.addList('keep');
  model.getListAt(model.getLength() - 1).addItem('keep1');
  model.getListAt(model.getLength() - 1).addItem('keep2');
  model.addList('problem');
  model.addList('try');
  model.getListAt(model.getLength() - 1).addItem('try1');
  t.true(model.equals(KanbanModel.deserialize(mdKpt201)));
  model.moveList(0, 1);
  t.true(model.equals(KanbanModel.deserialize(`* problem
* keep
  * keep1
  * keep2
* try
  * try1`)));
});
