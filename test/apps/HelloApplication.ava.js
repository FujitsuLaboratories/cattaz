import React from 'react';
import test from 'ava';

import { shallow, mount } from 'enzyme';

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
  const wrapper = shallow(<HelloApplication data="" onEdit={() => {}} appContext={{}} />);
  t.is('Input your name', getMessage(wrapper));
});

/** @test {HelloApplication} */
test('HelloApplication should render name if data is given', t => {
  const wrapper = mount(<HelloApplication data="name1" onEdit={() => {}} appContext={{}} />);
  t.is('Hello, name1', getMessage(wrapper));
});

/** @test {HelloApplication} */
test('HelloApplication should render input name', t => {
  const wrapper = mount(<HelloApplication data="" onEdit={() => {}} appContext={{}} />);
  t.is('Input your name', getMessage(wrapper));
  setInputText(wrapper, 'name1');
  t.is('Hello, name1', getMessage(wrapper));
  setInputText(wrapper, '');
  t.is('Input your name', getMessage(wrapper));
});

/** @test {HelloApplication.getDerivedStateFromProps} */
test('HelloApplication should rerender if props change', t => {
  const wrapper = mount(<HelloApplication data="name1" onEdit={() => {}} appContext={{}} />);
  t.is('Hello, name1', getMessage(wrapper));
  wrapper.setProps({ data: 'name2' });
  t.is('Hello, name2', getMessage(wrapper));
});
