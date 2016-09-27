import { configure } from '@kadira/storybook';

function loadStories() {
  // eslint-disable-next-line global-require
  require('../stories/index');
}

configure(loadStories, module);
