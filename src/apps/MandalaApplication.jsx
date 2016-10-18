import React from 'react';

class MandalaModel {
  constructor() {
    this.block = ['', '', '', '', '', '', '', '', ''];
  }
  changeCell(target) {
    this.block[target.id] = target.value;
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
    this.state.mandala.changeCell(event.target);
    this.props.onEdit(this.state.mandala.serialize(), this.props.appContext);
  }
  renderCell(items, handleCellChange) {
    this.blockStyle = {
      margin: 2,
      backgroundColor: '#777777',
      borderRadius: 5,
    };
    this.cellStyle = {
      width: 80,
      height: 80,
      margin: 3,
      borderRadius: 5,
      resize: 'none',
    };
    this.row1 = items.slice(0, 3).map((text, key) =>
      <textarea id={`${key}`} style={this.cellStyle} value={text} onChange={handleCellChange} />
    );
    this.row2 = items.slice(3, 6).map((text, key) =>
      <textarea id={`${key + 3}`} style={this.cellStyle} value={text} onChange={handleCellChange} />
    );
    this.row3 = items.slice(6, 9).map((text, key) =>
      <textarea id={`${key + 6}`} style={this.cellStyle} value={text} onChange={handleCellChange} />
    );
    return (<div style={this.blockStyle}>
      {this.row1}<br />
      {this.row2}<br />
      {this.row3}
    </div>
    );
  }
  render() {
    return (<div>
      <table>
        <tbody>
          <tr>
            {this.renderCell(this.state.mandala.block, this.handleCellChange)}
          </tr>
        </tbody>
      </table>
    </div>);
  }
}

MandalaApplication.propTypes = {
  data: React.PropTypes.string,
  onEdit: React.PropTypes.func,
  appContext: React.PropTypes.shape({}),
};
