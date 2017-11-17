import React from 'react';
import test from 'ava';

import { shallow } from 'enzyme';

import ErrorApplication from '../../src/apps/ErrorApplication';

function clickButton(wrapper) {
  const textbox = wrapper.find('button');
  textbox.simulate('click');
}

/** @test {ErrorApplication} */
test('ErrorApplication should render without error if odd is given', t => {
  t.notThrows(() => {
    shallow(<ErrorApplication data="odd" onEdit={() => {}} appContext={{}} />);
  });
});

/** @test {ErrorApplication} */
test('ErrorApplication should render with error if even is given', t => {
  t.throws(() => {
    shallow(<ErrorApplication data="even" onEdit={() => {}} appContext={{}} />);
  });
});

/** @test {ErrorApplication#handleStartRaisingError} */
test('ErrorApplication should start raising an error', t => {
  t.notThrows(() => {
    const wrapper = shallow(<ErrorApplication data="odd" onEdit={() => {}} appContext={{}} />);
    t.throws(() => {
      clickButton(wrapper);
    });
  });
});

/** @test {ErrorApplication#componentWillReceiveProps} */
test('ErrorApplication should raise an error if updated text is oven', t => {
  t.notThrows(() => {
    const wrapper = shallow(<ErrorApplication data="odd" onEdit={() => {}} appContext={{}} />);
    t.throws(() => {
      wrapper.setProp({ data: 'even' });
    });
  });
});
