import React from 'react';
import { storiesOf, linkTo } from '@kadira/storybook';
import AppEnabledWikiEditorAce from '../src/AppEnabledWikiEditorAce';

import logo from '../docs/assets/cattz-10-character.png';

storiesOf('Ace', module)
  .add('no sync', () => <AppEnabledWikiEditorAce defaultValue={'```kpt\n```\n\n```mandala\n```\n\n```reversi\n```\n\n```vote\n```'} />)
  .add('sync in room1', () => <AppEnabledWikiEditorAce defaultValue="syncing with room1" roomName="room1" />)
  .add('sync in room2', () => <AppEnabledWikiEditorAce defaultValue="syncing with room2" roomName="room2" />)
;

function WikiNavigationPage(props) {
  return (<div>
    <div>
      <a href="#dummy" onClick={linkTo('Wiki navigation', 'index')}><img src={logo} alt="cattaz" width="100" height="33" /></a>
      <span style={{ margin: '0em 1em', verticalAlign: 'top', fontSize: '24px' }}>{props.name}</span>
    </div>
    <AppEnabledWikiEditorAce defaultValue="syncing..." roomName={props.name} heightMargin={33 + 4} />
  </div>);
}
WikiNavigationPage.propTypes = {
  name: React.PropTypes.string.isRequired,
};

storiesOf('Wiki navigation', module)
  .add('index', () => (<div>
    <h1><img src={logo} alt="cattaz" /></h1>
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
  .add('page3', () => <WikiNavigationPage name="page3" />)
;
