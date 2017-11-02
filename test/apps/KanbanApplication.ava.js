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
