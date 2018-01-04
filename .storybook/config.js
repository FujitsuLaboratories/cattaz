// Issue in v3.3.3. https://github.com/storybooks/storybook/pull/2604
import { configure } from '@storybook/react/dist/client';

function loadStories() {
  // eslint-disable-next-line global-require
  require('../stories/index');
}

configure(loadStories, module);
