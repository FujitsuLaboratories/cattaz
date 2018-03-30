import React from 'react';
import test from 'ava';

import { shallow, mount } from 'enzyme';

import YoutubeApplication, { extractYouTubeVideoID } from '../../src/apps/YoutubeApplication';

function setInputText(wrapper, text) {
  const textbox = wrapper.find('input');
  textbox.instance().value = text;
  textbox.simulate('change');
}

function getUrl(wrapper) {
  return wrapper.find('iframe').get(0).props.src;
}

/** @test {extractYouTubeVideoID} */
test('extractYouTubeVideoID should extract ID', t => {
  t.is(extractYouTubeVideoID('https://www.youtube.com/watch?v=V7lqCuoK9Lw'), 'V7lqCuoK9Lw');
  t.is(extractYouTubeVideoID('https://www.youtube.com/watch?v=V7lqCuoK9Lw&feature=youtu.be&t=1s'), 'V7lqCuoK9Lw');
  t.is(extractYouTubeVideoID('https://www.youtube.com/watch?feature=youtu.be&t=1s&v=V7lqCuoK9Lw'), 'V7lqCuoK9Lw');
  t.is(extractYouTubeVideoID('http://www.youtube.com/watch?v=V7lqCuoK9Lw'), 'V7lqCuoK9Lw');
  t.is(extractYouTubeVideoID('https://youtube.com/watch?v=V7lqCuoK9Lw'), 'V7lqCuoK9Lw');
  t.is(extractYouTubeVideoID('https://youtu.be/V7lqCuoK9Lw'), 'V7lqCuoK9Lw');
  t.is(extractYouTubeVideoID('https://youtu.be/V7lqCuoK9Lw?t=1s'), 'V7lqCuoK9Lw');
});

/** @test {YoutubeApplication} */
test('YoutubeApplication should render initial state if no data is given', t => {
  const wrapper = shallow(<YoutubeApplication data="" onEdit={() => {}} appContext={{}} />);
  t.is('https://www.youtube.com/embed/?rel=0', getUrl(wrapper));
});

/** @test {YoutubeApplication} */
test('YouTubeApplication should render URL if data is given', t => {
  const wrapper = shallow(<YoutubeApplication data="https://www.youtube.com/watch?v=V7lqCuoK9Lw" onEdit={() => {}} appContext={{}} />);
  t.is('https://www.youtube.com/embed/V7lqCuoK9Lw?rel=0', getUrl(wrapper));
});

/** @test {YoutubeApplication} */
test('YoutubeApplication should render input URL', t => {
  const wrapper = mount(<YoutubeApplication data="" onEdit={() => {}} appContext={{}} />);
  t.is('https://www.youtube.com/embed/?rel=0', getUrl(wrapper));
  setInputText(wrapper, 'https://www.youtube.com/watch?v=V7lqCuoK9Lw');
  t.is('https://www.youtube.com/embed/V7lqCuoK9Lw?rel=0', getUrl(wrapper));
  setInputText(wrapper, 'https://www.youtube.com/watch?v=vmm9y5bRehQ');
  t.is('https://www.youtube.com/embed/vmm9y5bRehQ?rel=0', getUrl(wrapper));
  setInputText(wrapper, '');
  t.is('https://www.youtube.com/embed/?rel=0', getUrl(wrapper));
});

/** @test {YoutubeApplication#componentWillReceiveProps} */
test('YoutubeApplication should rerender if props change', t => {
  const wrapper = shallow(<YoutubeApplication data="https://www.youtube.com/watch?v=V7lqCuoK9Lw" onEdit={() => {}} appContext={{}} />);
  t.is('https://www.youtube.com/embed/V7lqCuoK9Lw?rel=0', getUrl(wrapper));
  wrapper.setProps({ data: 'https://www.youtube.com/watch?v=vmm9y5bRehQ' });
  t.is('https://www.youtube.com/embed/vmm9y5bRehQ?rel=0', getUrl(wrapper));
});
