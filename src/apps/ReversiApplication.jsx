import React from 'react';
import PropTypes from 'prop-types';

import clone from 'lodash/clone';

import * as RM from './ReversiModel';

const ReversiModel = RM.default;

const tableStyle = {
  borderCollapse: 'collapse',
  backgroundColor: 'MediumSeaGreen',
  border: '4px ridge DarkRed',
};
const cellStyle = {
  border: '1px solid Black',
  width: '2em',
  height: '2em',
  textAlign: 'center',
};
const lastCellStyle = clone(cellStyle);
lastCellStyle.backgroundColor = 'MediumSlateBlue';

export default class ReversiApplication extends React.Component {
  static toStoneText(stoneValue) {
    switch (stoneValue) {
      case RM.StoneBlack:
        return '\u26AB';
      case RM.StoneWhite:
        return '\u26AA';
      default:
        return '';
    }
  }
  constructor(props) {
    super();
    this.state = { model: ReversiModel.deserialize(props.data) };
    this.handlePlaceStone = this.handlePlaceStone.bind(this);
    this.handlePass = this.handlePass.bind(this);
  }
  componentWillReceiveProps(newProps) {
    const model = ReversiModel.deserialize(newProps.data);
    this.setState({ model });
  }
  handlePlaceStone(ev) {
    const button = ev.target;
    const x = parseInt(button.getAttribute('data-x'), 10);
    const y = parseInt(button.getAttribute('data-y'), 10);
    this.state.model.addStep(this.state.model.nextTurn, x, y);
    this.props.onEdit(this.state.model.serialize(), this.props.appContext);
  }
  handlePass() {
    this.state.model.skipTurn();
    this.props.onEdit(this.state.model.serialize(), this.props.appContext);
  }
  toCell(stoneValue, x, y) {
    if (stoneValue === RM.StoneNone) {
      const label = `${String.fromCharCode(0x61 + x)}${y + 1}`;
      return <td style={cellStyle}><button onClick={this.handlePlaceStone} data-x={x} data-y={y}>{label}</button></td>;
    }
    const lastStep = this.state.model.steps[this.state.model.steps.length - 1];
    const isLastPos = lastStep.x === x && lastStep.y === y && this.state.model.steps.length > 4;
    const style = isLastPos ? lastCellStyle : cellStyle;
    return <td style={style}>{ReversiApplication.toStoneText(stoneValue)}</td>;
  }
  render() {
    const cells = this.state.model.getCells();
    const counts = this.state.model.getStoneCounts();
    const rows = cells.map((r, x) => (<tr>
      {r.map((c, y) => this.toCell(c, x, y))}
    </tr>));
    return (<div>
      <p>
        {[RM.StoneBlack, RM.StoneWhite].map((c) => {
          const style = {
            padding: '0 0.4em',
          };
          if (c === this.state.model.nextTurn) {
            style.borderBottom = '4px solid MediumSlateBlue';
          }
          return <span style={style}>{ReversiApplication.toStoneText(c)}{counts[c]}</span>;
        })}
        <button onClick={this.handlePass}>Pass</button>
      </p>
      <table style={tableStyle}><tbody>{rows}</tbody></table>
    </div>);
  }
}

ReversiApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
