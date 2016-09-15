import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Button from './Button.jsx';
import Welcome from './Welcome.jsx';
import Mandara from './Mandara.jsx';
import NormalWikiEditor from '../src/NormalWikiEditor.jsx';
import WikiApp from './WikiApp.jsx';
import KPT from './KPT.jsx';

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

storiesOf('Mandara', module)
  .add('with text', () => (
    <Mandara onClick={action('clicked')}>Hello Button</Mandara>
  ));

storiesOf('Normal Wiki', module)
  .add('with preview', () => (
    <NormalWikiEditor />
  ));

storiesOf('Wiki KPT app', module)
  .add('start code block', () => (
    <WikiApp
      markdown={`# KPT

Here is KPT application:

\`\`\`kpt
\`\`\`
`}
      preview={<div>
        <h1>KPT</h1>
        <p>Here is KPT application:</p>
        <KPT />
      </div>}
    />
  ))
  .add('add keep', () => (
    <WikiApp
      markdown={`# KPT

Here is KPT application:

\`\`\`kpt
* KEEP
  * keep1
* PROBLEM
* TRY
\`\`\`
`}
      preview={<div>
        <h1>KPT</h1>
        <p>Here is KPT application:</p>
        <KPT keeps={['keep1']} />
      </div>}
    />
  ))
;
