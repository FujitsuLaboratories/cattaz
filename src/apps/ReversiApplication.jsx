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

  constructor() {
    super();
    this.handlePlaceStone = this.handlePlaceStone.bind(this);
    this.handlePass = this.handlePass.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    if (data === nextProps.data) return false;
    const oldModel = ReversiModel.deserialize(data);
    const newModel = ReversiModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }

  handlePlaceStone(ev) {
    const button = ev.target;
    const x = parseInt(button.getAttribute('data-x'), 10);
    const y = parseInt(button.getAttribute('data-y'), 10);
    const { data, onEdit, appContext } = this.props;
    const model = ReversiModel.deserialize(data);
    model.addStep(model.nextTurn, x, y);
    onEdit(model.serialize(), appContext);
  }

  handlePass() {
    const { data, onEdit, appContext } = this.props;
    const model = ReversiModel.deserialize(data);
    model.skipTurn();
    onEdit(model.serialize(), appContext);
  }

  toCell(model, stoneValue, x, y) {
    if (stoneValue === RM.StoneNone) {
      const label = `${String.fromCharCode(0x61 + x)}${y + 1}`;
      return (
        <td style={cellStyle}>
          <button onClick={this.handlePlaceStone} data-x={x} data-y={y} type="button">
            {label}
          </button>
        </td>
      );
    }
    const lastStep = model.steps[model.steps.length - 1];
    const isLastPos = lastStep.x === x && lastStep.y === y && model.steps.length > 4;
    const style = isLastPos ? lastCellStyle : cellStyle;
    return (
      <td style={style}>
        {ReversiApplication.toStoneText(stoneValue)}
      </td>
    );
  }

  render() {
    const { data } = this.props;
    const model = ReversiModel.deserialize(data);
    const cells = model.getCells();
    const counts = model.getStoneCounts();
    const rows = cells.map((r, x) => (
      <tr>
        {r.map((c, y) => this.toCell(model, c, x, y))}
      </tr>));
    return (
      <div>
        <p>
          {[RM.StoneBlack, RM.StoneWhite].map((c) => {
            const style = {
              padding: '0 0.4em',
            };
            if (c === model.nextTurn) {
              style.borderBottom = '4px solid MediumSlateBlue';
            }
            return (
              <span style={style}>
                {ReversiApplication.toStoneText(c)}
                {counts[c]}
              </span>
            );
          })}
          <button onClick={this.handlePass} type="button">
            Pass
          </button>
        </p>
        <table style={tableStyle}>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>);
  }
}

ReversiApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
