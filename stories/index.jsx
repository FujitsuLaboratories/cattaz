import React from 'react';
import PropTypes from 'prop-types';
// Issue in v3.3.3. https://github.com/storybooks/storybook/pull/2604
import { storiesOf, linkTo } from '@storybook/react/dist/client';

// To be converted by postcss via webpack
import 'github-markdown-css/github-markdown.css';

import AppEnabledWikiEditorCodeMirror from '../src/AppEnabledWikiEditorCodeMirror';

import logo from '../docs/assets/cattaz.svg';

storiesOf('CodeMirror', module)
  .add('no sync', () => <AppEnabledWikiEditorCodeMirror defaultValue={['kpt', 'mandala', 'votecrypto'].map(s => `\`\`\`${s}\n\`\`\``).join('\n\n')} />)
  .add('sync in room1', () => <AppEnabledWikiEditorCodeMirror defaultValue="syncing with room1" roomName="room1" />)
  .add('sync in room2', () => <AppEnabledWikiEditorCodeMirror defaultValue="syncing with room2" roomName="room2" />);

function WikiNavigationPage(props) {
  return (
    <div>
      <div>
        <a href="#dummy" onClick={linkTo('Wiki navigation', 'index')}><img src={logo} alt="cattaz" width="100" height="33" /></a>
        <span style={{ margin: '0em 1em', verticalAlign: 'top', fontSize: '24px' }}>{props.name}</span>
      </div>
      <AppEnabledWikiEditorCodeMirror defaultValue="syncing..." roomName={props.name} heightMargin={33 + 4} />
    </div>);
}
WikiNavigationPage.propTypes = {
  name: PropTypes.string.isRequired,
};

storiesOf('Wiki navigation', module)
  .add('index', () => (
    <div>
      <h1><img src={logo} alt="cattaz" width="640" /></h1>
      <h2>List of pages</h2>
      <ul>
        <li><a href="#dummy" onClick={linkTo('Wiki navigation', 'page1')}>page1</a></li>
        <li><a href="#dummy" onClick={linkTo('Wiki navigation', 'page2')}>page2</a></li>
      </ul>
      <div>
        Create a new page: <input type="text" placeholder="new page name" /><input type="button" value="Create" onClick={linkTo('Wiki navigation', 'page3')} />
      </div>
    </div>))
  .add('page1', () => <WikiNavigationPage name="page1" />)
  .add('page2', () => <WikiNavigationPage name="page2" />)
  .add('page3', () => <WikiNavigationPage name="page3" />);

storiesOf('Kanban usecase', module)
  .add('markdown', () => (
    <AppEnabledWikiEditorCodeMirror
      defaultValue={[
        '# Meeting minute',
        '',
        '* TODO',
        '  * task 1',
        '  * *task 2*',
        '* DOING',
        '  * **task 3**',
        '* DONE',
      ].join('\n')}
    />))
  .add('app', () => (
    <AppEnabledWikiEditorCodeMirror
      defaultValue={[
        '# Meeting minute',
        '',
        '```kanban',
        '* TODO',
        '  * task 1',
        '  * *task 2*',
        '* DOING',
        '  * **task 3**',
        '* DONE',
        '```',
      ].join('\n')}
    />))
  .add('add from app', () => (
    <AppEnabledWikiEditorCodeMirror
      defaultValue={[
        '# Meeting minute',
        '',
        '```kanban',
        '* TODO',
        '  * task 1',
        '  * *task 2*',
        '* DOING',
        '  * **task 3**',
        '* DONE',
        '  * task 4',
        '```',
      ].join('\n')}
    />))
  .add('dnd', () => (
    <AppEnabledWikiEditorCodeMirror
      defaultValue={[
        '# Meeting minute',
        '',
        '```kanban',
        '* TODO',
        '  * *task 2*',
        '* DOING',
        '  * task 1',
        '  * **task 3**',
        '* DONE',
        '  * task 4',
        '```',
      ].join('\n')}
    />));
