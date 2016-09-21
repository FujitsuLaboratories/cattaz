import React from 'react';
import MonacoEditor from 'react-monaco-editor/lib';

export default class Mandala extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { mandala: '', blocks: Array(9) };
    this.mandalaFront = `# Mandala

Here is Mandala application:

\`\`\`mandala
`;
    this.mandalaBehind = `\`\`\`
`;
    let mandalaCode = '';
    for (let i = 0; i < this.state.blocks.length; i++) {
      this.state.blocks[i] = (['1', '2', '3', '4', '5', '6', '7', '8', '9']);
      mandalaCode += '* ';
      for (let j = 0; j < (this.state.blocks[i].length - 1); j++) {
        mandalaCode += `${this.state.blocks[i][j]}, `;
      }
      mandalaCode += `${this.state.blocks[i][this.state.blocks.length - 1]}\n`;
    }
    this.state.mandala = this.mandalaFront + mandalaCode + this.mandalaBehind;
  }
  handleChange(event) {
    const blockNum = parseInt(event.changeEvent.target.id.slice(5, 6), 10);
    const cellNum = parseInt(event.changeEvent.target.id.slice(10, 11), 10);
    this.state.blocks[blockNum][cellNum] = event.changeEvent.target.value;
    let mandalaCode = '';
    for (let i = 0; i < this.state.blocks.length; i++) {
      mandalaCode += '* ';
      for (let j = 0; j < (this.state.blocks[i].length - 1); j++) {
        mandalaCode += `${this.state.blocks[i][j]}, `;
      }
      mandalaCode += `${this.state.blocks[i][this.state.blocks.length - 1]}\n`;
    }

    this.setState({ mandala: this.mandalaFront + mandalaCode + this.mandalaBehind });
  }
  render() {
    const board = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      width: '850px',
      padding: 5,
      backgroundColor: 'white',
      borderRadius: 10,
    };
    const style = {
      width: '50%',
      margin: '0.5em',
    };
    const dispBlocks = this.state.blocks.map((block, key) =>
      <Block key={`block${key}`} id={`block${key}`} textList={block} handleChange={this.handleChange} />
    );
    return (<div style={{ display: 'flex' }}>
      <MonacoEditor language="markdown" value={this.state.mandala} style={style} />
      <div style={style}>
        <div style={board}>
          {dispBlocks}
        </div>
      </div>
    </div>);
  }
}

Mandala.propTypes = {
  handleChange: React.PropTypes.function,
};

class Block extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    this.props.handleChange({ changeEvent: event.changeEvent });
  }
  render() {
    const blockStyle = {
      // display: 'flex',
      // justifyContent: 'center',
      margin: 2,
      backgroundColor: 'gray',
      borderRadius: 5,
    };
    const row1 = this.props.textList.slice(0, 3).map((text, key) =>
      <Cell key={`row${key}`} id={`${this.props.id}_row${key}`} text={text} handleChange={this.handleChange} />
    );
    const row2 = this.props.textList.slice(3, 6).map((text, key) =>
      <Cell key={`row${key + 3}`} id={`${this.props.id}_row${key + 3}`} text={text} handleChange={this.handleChange} />
    );
    const row3 = this.props.textList.slice(6, 9).map((text, key) =>
      <Cell key={`row${key + 6}`} id={`${this.props.id}_row${key + 6}`} text={text} handleChange={this.handleChange} />
    );
    return (<div style={blockStyle}>
        {row1}<br />
        {row2}<br />
        {row3}
    </div>);
  }
}

Block.propTypes = {
  id: React.PropTypes.string,
  textList: React.PropTypes.string,
  handleChange: React.PropTypes.function,
};

class Cell extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: props.text };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    this.setState({ text: event.target.value });
    this.props.handleChange({ changeEvent: event });
  }
  render() {
    const cellStyle = {
      // display: 'flex',
      // justifyContent: 'center',
      width: 80,
      height: 80,
      margin: 3,
      borderRadius: 5,
    };
    return (
      <textarea id={this.props.id} style={cellStyle} value={this.state.text} onChange={this.handleChange} />
    );
  }
}

Cell.propTypes = {
  id: React.PropTypes.string,
  text: React.PropTypes.string,
  handleChange: React.PropTypes.function,
};
