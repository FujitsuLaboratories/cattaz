import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';
import chunk from 'lodash/chunk';
import fill from 'lodash/fill';
import isEqual from 'lodash/isEqual';

const LENGTH = 3;

class MandalaModel {
  constructor() {
    this.block = fill(new Array(LENGTH * LENGTH), '');
  }

  changeCell(index, value) {
    this.block[index] = value;
  }

  equals(other) {
    return isEqual(this, other);
  }

  serialize() {
    return Yaml.dump(this);
  }

  static deserialize(str) {
    try {
      const obj = Yaml.load(str);
      const model = new MandalaModel();
      if (obj.block) model.block = obj.block;
      return model;
    } catch (ex) {
      return new MandalaModel();
    }
  }
}

export default class MandalaApplication extends React.Component {
  constructor() {
    super();
    this.handleCellChange = this.handleCellChange.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    if (data === nextProps.data) return false;
    const oldModel = MandalaModel.deserialize(data);
    const newModel = MandalaModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }

  handleCellChange(event) {
    const index = parseInt(event.target.getAttribute('data-index'), 10);
    const { value } = event.target;
    const { data, onEdit, appContext } = this.props;
    const mandala = MandalaModel.deserialize(data);
    mandala.changeCell(index, value);
    onEdit(mandala.serialize(), appContext);
  }

  render() {
    const { data } = this.props;
    const mandala = MandalaModel.deserialize(data);
    const blockStyle = {
      display: 'inline-block',
      lineHeight: 0,
      margin: 2,
      // backgroundColor: '#777777',
      // borderRadius: 5,
    };
    const cellStyle = {
      width: 80,
      height: 80,
      // margin: 3,
      // borderRadius: 5,
      resize: 'none',
    };
    const rows = chunk(mandala.block, LENGTH).map((rowData, rowIndex) => rowData.map((text, colIndex) => <textarea data-index={(rowIndex * LENGTH) + colIndex} style={cellStyle} value={text} onChange={this.handleCellChange} />));
    return (
      <div>
        <div style={blockStyle}>
          {rows.map((row) => [row, <br />])}
        </div>
      </div>
    );
  }
}

MandalaApplication.Model = MandalaModel;

MandalaApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
