import React from 'react';
import chunk from 'lodash/chunk';
import fill from 'lodash/fill';

const LENGTH = 3;

class MandalaModel {
  constructor() {
    this.block = fill(new Array(LENGTH * LENGTH), '');
  }
  changeCell(index, value) {
    this.block[index] = value;
  }
  serialize() {
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new MandalaModel();
      model.block = obj.block;
      return model;
    } catch (ex) {
      return new MandalaModel();
    }
  }
}

export default class MandalaApplication extends React.Component {
  constructor(props) {
    super();
    this.handleCellChange = this.handleCellChange.bind(this);
    this.state = { mandala: MandalaModel.deserialize(props.data) };
  }
  componentWillReceiveProps(newProps) {
    const mandala = MandalaModel.deserialize(newProps.data);
    this.setState({ mandala });
  }
  shouldComponentUpdate(/* newProps, nextState */) {
    // TODO
    return true;
  }
  handleCellChange(event) {
    const index = parseInt(event.target.getAttribute('data-index'), 10);
    const value = event.target.value;
    this.state.mandala.changeCell(index, value);
    this.props.onEdit(this.state.mandala.serialize(), this.props.appContext);
  }
  render() {
    const blockStyle = {
      margin: 2,
      backgroundColor: '#777777',
      borderRadius: 5,
    };
    const cellStyle = {
      width: 80,
      height: 80,
      margin: 3,
      borderRadius: 5,
      resize: 'none',
    };
    const rows = chunk(this.state.mandala.block, LENGTH).map((rowData, rowIndex) =>
      rowData.map((text, colIndex) =>
        <textarea data-index={(rowIndex * LENGTH) + colIndex} style={cellStyle} value={text} onChange={this.handleCellChange} />,
      ),
    );
    return (<div style={blockStyle}>
      {rows.map(row => [row, <br />])}
    </div>
    );
  }
}

MandalaApplication.propTypes = {
  data: React.PropTypes.string,
  onEdit: React.PropTypes.func,
  appContext: React.PropTypes.shape({}),
};
