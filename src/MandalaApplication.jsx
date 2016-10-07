import React from 'react';

class MandalaModel {
  constructor(name) {
    // this.block = [];
    this[name] = new Array(9);
  }
  addCell(str) {
    this.block.push(str);
  }
  changeCell(target) {
    console.log(target.id);
    this.block[target.id] = target.value;
  }
  serialize() {
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str, name) {
    try {
      const obj = JSON.parse(str, name);
      const model = new MandalaModel(name);
      model.block = obj.block;
      return model;
    } catch (ex) {
      return new MandalaModel(name);
    }
  }
}

const cellStyle3 = {
  border: '1px solid silver',
  verticalAlign: 'top',
};
const cellStyle2 = {
  // display: 'flex',
  // justifyContent: 'center',
  width: 80,
  height: 80,
  margin: 3,
  borderRadius: 5,
  resize: 'none',
};

export default class MandalaApplication extends React.Component {
  constructor(props) {
    const name = 'block';
    super();
    this.handleAddCell = this.handleAddCell.bind(this);
    this.handleCellChange = this.handleCellChange.bind(this);
    this.state = { mandala: MandalaModel.deserialize(props.data, name) };
  }
  componentWillReceiveProps(newProps) {
    //const mandala = MandalaModel.deserialize(newProps.data);
    //this.setState({ mandala });
  }
  handleAddCell() {
    const value = this.inputCell.value;
    if (!value) return;
    this.state.mandala.addCell(value);
    this.props.onEdit(this.state.mandala.serialize());
  }
  handleCellChange(event) {
    // const value = this.inputCell1.value;
    // const value = event.changeEvent.target.value;
    this.state.mandala.changeCell(event.changeEvent.target);
    this.props.onEdit(this.state.mandala.serialize());
  }
  renderCell(title, items, handlerAdd, rowSpan = 1) {
    /*
    console.log(items);
    console.log("b");

    Object.keys(items).map(function(value, index) {
      console.log("ta" + items[value]);
      items[value].map(s => (console.log(s)));
    });
    */

    return (<td rowSpan={rowSpan} style={cellStyle3}>
      <h3>{title}</h3>
      <ul>
        {items.map(s => (<li>{s}</li>))}
      </ul>
      <Cell key={0} id={0} text={'1'} handleCellChange={this.handleCellChange} />
      <Cell key={1} id={1} text={'2'} handleCellChange={this.handleCellChange} />

      <input ref={(c) => { this[`input${title}`] = c; }} type="text" placeholder={`Add ${title}`} />
      <input type="button" value="Add" onClick={handlerAdd} />
    </td>);
  }
  render() {
    return (<div>
      <table>
        <tbody>
          <tr>
            {this.renderCell('Cell', this.state.mandala.block, this.handleAddCell)}
          </tr>
        </tbody>
      </table>
    </div>);
  }
}

MandalaApplication.propTypes = {
  data: React.PropTypes.string,
  onEdit: React.PropTypes.func,
};

class Cell extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: props.text };
    this.handleCellChange = this.handleCellChange.bind(this);
  }
  handleCellChange(event) {
    this.setState({ text: event.target.value });
    this.props.handleCellChange({ changeEvent: event });
  }
  render() {
    const cellStyle = {
      width: 80,
      height: 80,
      margin: 3,
      borderRadius: 5,
      resize: 'none',
    };
    return (
      <textarea id={this.props.id} style={cellStyle} value={this.state.text} onChange={this.handleCellChange} />
    );
  }
}

Cell.propTypes = {
  id: React.PropTypes.string,
  text: React.PropTypes.string,
  handleCellChange: React.PropTypes.func,
};
