import test from 'ava';

import sinon from 'sinon';

import { mountApp } from '../helper';

import DrawApplication from '../../src/apps/DrawApplication';

function getCandidates(wrapper) {
  return wrapper.find('div').filterWhere(d => d.key() === 'candidates').text();
}
function getElected(wrapper) {
  return wrapper.find('div').filterWhere(d => d.key() === 'elected').text();
}
function getDisplayed(wrapper) {
  return wrapper.find('div').filterWhere(d => d.key() === 'display').text();
}
function addCandidate(wrapper, candidate) {
  const text = wrapper.find('input').at(0);
  const button = wrapper.find('input').at(1);
  text.instance().value = candidate;
  button.simulate('click');
}
function pressStartStop(wrapper) {
  wrapper.find('input').at(2).simulate('click');
}

/** @test {DrawApplication} */
test('DrawApplication should render initial state if no data is given', t => {
  const wrapper = mountApp(DrawApplication);
  t.true(getCandidates(wrapper).indexOf('[]') >= 0);
  t.true(getElected(wrapper).indexOf('[]') >= 0);
  t.is('', getDisplayed(wrapper));
});

/** @test {DrawApplication#handleAddCandidates} */
test('DrawApplication should render candidates', t => {
  const wrapper = mountApp(DrawApplication);
  t.true(getCandidates(wrapper).indexOf('[]') >= 0);
  addCandidate(wrapper, 'c1');
  addCandidate(wrapper, 'c2');
  addCandidate(wrapper, ''); // ignored
  t.true(getCandidates(wrapper).indexOf('["c1","c2"]') >= 0);
  t.true(getElected(wrapper).indexOf('[]') >= 0);
  t.is('', getDisplayed(wrapper));
});

/** @test {DrawApplication#handleStartStop} */
test('DrawApplication should display candidates in randomly when it is in draw status', t => {
  const clock = sinon.useFakeTimers(new Date(2017, 1, 2, 3, 4, 5).valueOf());
  try {
    const wrapper = mountApp(DrawApplication);
    addCandidate(wrapper, 'c1');
    addCandidate(wrapper, 'c2');
    addCandidate(wrapper, 'c3');
    addCandidate(wrapper, 'c4');
    t.true(getElected(wrapper).indexOf('[]') >= 0);
    t.is('', getDisplayed(wrapper));
    pressStartStop(wrapper);
    const firstSeen = getDisplayed(wrapper);
    let changed = false;
    t.truthy(firstSeen);
    for (let i = 0; i < 100; i += 1) { // false negative in possibility of (1/4)^100
      clock.tick(100);
      const displayed = getDisplayed(wrapper);
      t.truthy(displayed);
      if (firstSeen !== displayed) {
        changed = true;
        break;
      }
    }
    t.true(changed);
    pressStartStop(wrapper);
    t.false(getElected(wrapper).indexOf('[]') >= 0);
    t.truthy(getDisplayed(wrapper));
  } finally {
    clock.restore();
  }
});

/** @test {DrawApplication.getDerivedStateFromProps} */
test('DrawApplication should be updated by props', t => {
  const wrapper = mountApp(DrawApplication);
  t.true(getCandidates(wrapper).indexOf('[]') >= 0);
  t.true(getElected(wrapper).indexOf('[]') >= 0);
  t.is('', getDisplayed(wrapper));
  const model = new DrawApplication.Model();
  model.addCandidate('c1');
  model.addCandidate('c2');
  model.setElected('c1');
  wrapper.setProps({ data: model.serialize() });
  t.true(getCandidates(wrapper).indexOf('["c1","c2"]') >= 0);
  t.true(getElected(wrapper).indexOf('[c1]') >= 0);
  t.is('c1', getDisplayed(wrapper));
});
