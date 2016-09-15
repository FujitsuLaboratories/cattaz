import { configure } from '@kadira/storybook';

function loadStories() {
  // eslint-disable-next-line global-require, react/require-extension
  require('../stories/index.jsx');
}

configure(loadStories, module);
