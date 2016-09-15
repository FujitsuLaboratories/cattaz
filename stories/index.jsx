import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Button from './Button.jsx';
import Welcome from './Welcome.jsx';
import NormalWikiEditor from '../src/NormalWikiEditor.jsx';

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')} />
  ));

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
  ));

storiesOf('Normal Wiki', module)
  .add('with preview', () => (
    <NormalWikiEditor />
  ));
