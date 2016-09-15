import React from 'react';

export default class Mandara extends React.Component {
  constructor() {
    super();
    class MandalaBlock {
      constructor(msg) {
        const size = 3;
        const grid = Array(size);
        for (let i = 0; i < size; i++) {
          const row = Array(size);
          for (let j = 0; j < size; j++) {
            row[j] = msg;
          }
          grid[i] = row;
        }
        this.grid = grid;
      }
    }
    this.handleEdit = this.handleEdit.bind(this);
    this.block = Array(9);
    for (let i = 0; i < 9; i++) {
      this.block[i] = new MandalaBlock('num' + i);
    }
  }
  handleEdit() {
    const text = this.editor.value;
    this.setState({ text });
  }
  render() {
    const container = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      margin: '0',
      backgroundColor: 'yellow',
    };
    const board = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      width: '1000',
      padding: 5,
      backgroundColor: '#47525d',
      borderRadius: 10,
    };
    const rowa = {
      // flexDirection: 'row',
    };

    const rows = this.block.map((blocks, row) =>
      <div key={row} style={rowa}>
        {blocks.grid.map((player, col) =>
          <Block
            key={col}
            player={player}
          />
        )}
      </div>
    );
    return (<div style={container}>
      <div style={board}>
        {rows}
      </div>
    </div>);
  }
}

class Block extends React.Component {
  constructor(props) {
    super();
    console.log(props.player[0]);
    this.cells = props.player;
  }
  render() {
    const block = {
      display: 'flex',
      justifyContent: 'center',
      margin: 5,
      backgroundColor: 'green',
      borderRadius: 5,
    };
    return (<div style={block}>
        {this.cells.map((player, col) =>
          <Cell
            key={col}
            msg={player}
          />
        )}
    </div>);
  }
}

class Cell extends React.Component {
  constructor(props) {
    super();
    console.log(props.msg);
    this.msg = props.msg;
  }
// const Cell = React.createClass({
  render() {
    const cell = {
      display: 'flex',
      justifyContent: 'center',
      width: 80,
      height: 80,
      margin: 5,
      backgroundColor: '#7b8994',
      borderRadius: 5,
    };
    const style = {
      width: '100%',
      margin: '0',
      borderRadius: 5,
    };
    return (<div style={cell}>
      <textarea style={style} defaultValue={this.msg} />
    </div>);
  }
}
