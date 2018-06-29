import test from 'ava';

import { mountApp } from '../helper';

import ErrorApplication from '../../src/apps/ErrorApplication';

function clickButton(wrapper) {
  const textbox = wrapper.find('button');
  textbox.simulate('click');
}

/** @test {ErrorApplication} */
test('ErrorApplication should render without error if odd is given', t => {
  t.notThrows(() => {
    mountApp(ErrorApplication, 'odd');
  });
});

/** @test {ErrorApplication} */
test('ErrorApplication should render with error if even is given', t => {
  t.throws(() => {
    mountApp(ErrorApplication, 'even');
  });
});

/** @test {ErrorApplication#handleStartRaisingError} */
test('ErrorApplication should start raising an error', t => {
  t.notThrows(() => {
    const wrapper = mountApp(ErrorApplication, 'odd');
    t.throws(() => {
      clickButton(wrapper);
    });
  });
});

/** @test {ErrorApplication.getDerivedStateFromProps} */
test('ErrorApplication should raise an error if updated text is even', t => {
  t.notThrows(() => {
    const wrapper = mountApp(ErrorApplication, 'odd');
    t.throws(() => {
      wrapper.setProp({ data: 'even' });
    });
  });
});
