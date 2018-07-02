import test from 'ava';

import { mountApp } from '../helper';

import KPTApplication from '../../src/apps/KPTApplication';

function getItems(wrapper, cellIndex) {
  return wrapper.find('td').at(cellIndex).find('li')
    .filterWhere(li => li.key() !== 'input')
    .map(li => li.text());
}
function addItem(wrapper, cellIndex, text) {
  const inputs = wrapper.find('table td').at(cellIndex).find('li')
    .filterWhere(li => li.key() === 'input')
    .find('input');
  const textbox = inputs.at(0);
  const button = inputs.at(1);
  textbox.instance().value = text;
  button.simulate('click');
}

function getKeeps(wrapper) {
  return getItems(wrapper, 0);
}
function getProblems(wrapper) {
  return getItems(wrapper, 2);
}
function getTries(wrapper) {
  return getItems(wrapper, 1);
}

function addKeep(wrapper, text) {
  addItem(wrapper, 0, text);
}
function addProblem(wrapper, text) {
  addItem(wrapper, 2, text);
}
function addTry(wrapper, text) {
  addItem(wrapper, 1, text);
}

/** @test {KPTApplication} */
test('KPTApplication should render initial state if no data is given', t => {
  const wrapper = mountApp(KPTApplication);
  t.deepEqual([], getKeeps(wrapper));
  t.deepEqual([], getProblems(wrapper));
  t.deepEqual([], getTries(wrapper));
});

/** @test {KPTApplication} */
test('KPTApplication should render initial state if an empty yaml object is given', t => {
  const wrapper = mountApp(KPTApplication, '{}');
  t.deepEqual([], getKeeps(wrapper));
  t.deepEqual([], getProblems(wrapper));
  t.deepEqual([], getTries(wrapper));
});

/** @test {KPTApplication#handleAddKeep} */
test('KPTApplication should add keep', t => {
  const wrapper = mountApp(KPTApplication);
  addKeep(wrapper, '');
  t.deepEqual([], getKeeps(wrapper));
  addKeep(wrapper, 'keep1');
  t.deepEqual(['keep1'], getKeeps(wrapper));
  addKeep(wrapper, 'keep2');
  t.deepEqual(['keep1', 'keep2'], getKeeps(wrapper));
  addKeep(wrapper, 'keep1');
  t.deepEqual(['keep1', 'keep2', 'keep1'], getKeeps(wrapper));
  t.deepEqual([], getProblems(wrapper));
  t.deepEqual([], getTries(wrapper));
});

/** @test {KPTApplication#handleAddProblem} */
test('KPTApplication should add problem', t => {
  const wrapper = mountApp(KPTApplication);
  addProblem(wrapper, '');
  t.deepEqual([], getProblems(wrapper));
  addProblem(wrapper, 'p1');
  t.deepEqual(['p1'], getProblems(wrapper));
});


/** @test {KPTApplication#handleAddTry} */
test('KPTApplication should add try', t => {
  const wrapper = mountApp(KPTApplication);
  addTry(wrapper, '');
  t.deepEqual([], getTries(wrapper));
  addTry(wrapper, 't1');
  t.deepEqual(['t1'], getTries(wrapper));
});

/** @test {KPTApplication#shouldComponentUpdate} */
test('KPTApplication should be updated by props', t => {
  const wrapper = mountApp(KPTApplication);
  t.deepEqual([], getKeeps(wrapper));
  t.deepEqual([], getProblems(wrapper));
  t.deepEqual([], getTries(wrapper));
  const model = new KPTApplication.Model();
  model.addKeep('k1');
  model.addProblem('p1');
  model.addTry('t1');
  model.addKeep('k2');
  model.addProblem('p2');
  model.addTry('t2');
  wrapper.setProps({ data: model.serialize() });
  t.deepEqual(['k1', 'k2'], getKeeps(wrapper));
  t.deepEqual(['p1', 'p2'], getProblems(wrapper));
  t.deepEqual(['t1', 't2'], getTries(wrapper));
});
