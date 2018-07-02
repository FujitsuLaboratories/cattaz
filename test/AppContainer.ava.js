import test from 'ava';
import React from 'react';

import { mount } from 'enzyme';

import AppContainer from '../src/AppContainer';
import ErrorApplication from '../src/apps/ErrorApplication';

const appContext = {
  language: 'error',
  position: {
    start: { line: 1, column: 1 },
    end: { line: 3, column: 1 },
  },
};

/** @test {AppContainer} */
test('AppContainer should render its child if there is no error', t => {
  t.notThrows(() => {
    const wrapper = mount((
      <AppContainer>
        <ErrorApplication data="odd" />
      </AppContainer>));
    t.true(wrapper.find('ErrorApplication').exists());
  });
});

/** @test {AppContainer} */
test('AppContainer should render error message if there is an error', t => {
  t.notThrows(() => {
    const wrapper = mount((
      <AppContainer>
        <ErrorApplication data="even" appContext={appContext} />
      </AppContainer>));
    const text = wrapper.text();
    t.true(text.indexOf('Failed to run an application \'error\'') >= 0, 'contain app name');
    t.true(text.indexOf('at line 1-3') >= 0, 'contain line numbers');
    t.true(text.indexOf('is even') >= 0, 'contain error message');
    t.false(wrapper.find('ErrorApplication').exists());
  });
});

/** @test {AppContainer.getDerivedStateFromProps} */
test('AppContainer should recover from error after valid data is given', t => {
  t.notThrows(() => {
    const wrapper = mount((
      <AppContainer>
        <ErrorApplication data="even" appContext={appContext} />
      </AppContainer>));
    t.false(wrapper.find('ErrorApplication').exists());
    wrapper.setProps({ children: <ErrorApplication data="odd" appContext={appContext} /> });
    t.true(wrapper.find('ErrorApplication').exists());
    wrapper.setProps({ children: <ErrorApplication data="new even" appContext={appContext} /> });
    t.false(wrapper.find('ErrorApplication').exists());
  });
});
