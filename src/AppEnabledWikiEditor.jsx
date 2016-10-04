import React from 'react';
import remark from 'remark';
import remarkReact from 'remark-react';
import MonacoEditor from 'react-monaco-editor/lib';
import defaultSanitizationConfig from 'hast-util-sanitize/lib/github.json';
import cloneDeep from 'lodash/cloneDeep';

import Apps from './apps';
import MyPre from './MyPre';
import monacoRequireConfig from './monacoRequireConfig';

const sanitizationConfig = cloneDeep(defaultSanitizationConfig);
sanitizationConfig.attributes.code = ['className'];

const defaultValue = `\`\`\`kpt
\`\`\`
`;

const remarkReactComponents = {
  pre: MyPre,
};

export default class AppEnabledWikiEditor extends React.Component {
  constructor() {
    super();
    this.state = { text: defaultValue };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleAppEdit = this.handleAppEdit.bind(this);
  }
  getAppText() {
    return this.state.text.replace('```kpt', '').replace('```', '');
  }
  handleEdit(text) {
    this.setState({ text });
  }
  handleAppEdit(text) {
    this.setState({ text: `\`\`\`kpt
${text}
\`\`\`
` });
  }
  render() {
    const preview = remark().use(remarkReact, { sanitize: sanitizationConfig, remarkReactComponents }).process(this.state.text).contents;
    return (<div>
      <div>
        In the real use case, wiki text should be written in Markdown syntax and application data is stored in fenced code block.
        To make things easier, this component does not parse markdown.
        You should write only one fenced code block in the editor.
      </div>
      <div style={{ display: 'flex' }}>
        <MonacoEditor onChange={this.handleEdit} language="markdown" value={this.state.text} width="33%" height={500} requireConfig={monacoRequireConfig} />
        {preview}
      </div>
      <div>
        {React.createElement(Apps.kpt, { data: this.getAppText(), onEdit: this.handleAppEdit })}
      </div>
    </div>);
  }
}
