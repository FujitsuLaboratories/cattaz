import test from 'ava';

import { shallowApp, mountApp } from '../helper';

import HelloApplication from '../../src/apps/HelloApplication';

function setInputText(wrapper, text) {
  const textbox = wrapper.find('input');
  textbox.instance().value = text;
  textbox.simulate('change');
}

function getMessage(wrapper) {
  return wrapper.find('div').filterWhere(e => e.key() === 'message').text();
}

/** @test {HelloApplication} */
test('HelloApplication should render initial state if no data is given', t => {
  const wrapper = shallowApp(HelloApplication);
  t.is('Input your name', getMessage(wrapper));
});

/** @test {HelloApplication} */
test('HelloApplication should render name if data is given', t => {
  const wrapper = mountApp(HelloApplication, 'name1');
  t.is('Hello, name1', getMessage(wrapper));
});

/** @test {HelloApplication} */
test('HelloApplication should render input name', t => {
  const wrapper = mountApp(HelloApplication);
  t.is('Input your name', getMessage(wrapper));
  setInputText(wrapper, 'name1');
  t.is('Hello, name1', getMessage(wrapper));
  setInputText(wrapper, '');
  t.is('Input your name', getMessage(wrapper));
});

/** @test {HelloApplication} */
test('HelloApplication should rerender if props change', t => {
  const wrapper = mountApp(HelloApplication, 'name1');
  t.is('Hello, name1', getMessage(wrapper));
  wrapper.setProps({ data: 'name2' });
  t.is('Hello, name2', getMessage(wrapper));
});
