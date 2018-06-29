import test from 'ava';

import fill from 'lodash/fill';
import range from 'lodash/range';

import { mountApp } from '../helper';

import MandalaApplication from '../../src/apps/MandalaApplication';

function getTexts(wrapper) {
  // TODO how to get textarea's value?
  // return wrapper.find('textarea').map(t => t.text());
  return wrapper.state('mandala').block;
}
function setText(wrapper, index, text) {
  const t = wrapper.find('textarea').at(index);
  t.instance().value = text;
  t.simulate('change');
}

/** @test {MandalaApplication} */
test('MandalaApplication should render initial state if no data is given', t => {
  const wrapper = mountApp(MandalaApplication);
  t.deepEqual(fill(new Array(9), ''), getTexts(wrapper));
});

/** @test {MandalaApplication#handleCellChange} */
test('MandalaApplication should accept changes in textarea', t => {
  const wrapper = mountApp(MandalaApplication);
  t.deepEqual(fill(new Array(9), ''), getTexts(wrapper));
  setText(wrapper, 0, 's0');
  setText(wrapper, 4, 's4');
  setText(wrapper, 8, 's8');
  t.deepEqual(['s0', '', '', '', 's4', '', '', '', 's8'], getTexts(wrapper));
});

/** @test {MandalaApplication.getDerivedStateFromProps} */
test('MandalaApplication should be updated by props', t => {
  const wrapper = mountApp(MandalaApplication);
  t.deepEqual(fill(new Array(9), ''), getTexts(wrapper));
  const model = new MandalaApplication.Model();
  for (let i = 0; i < 9; i += 1) {
    model.changeCell(i, `s${i}`);
  }
  wrapper.setProps({ data: model.serialize() });
  t.deepEqual(range(9).map(n => `s${n}`), getTexts(wrapper));
});
