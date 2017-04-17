import React from 'react';
import PropTypes from 'prop-types';

class KPTModel {
  constructor() {
    this.keeps = [];
    this.problems = [];
    this.tries = [];
  }
  addKeep(str) {
    this.keeps.push(str);
  }
  addProblem(str) {
    this.problems.push(str);
  }
  addTry(str) {
    this.tries.push(str);
  }
  serialize() {
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new KPTModel();
      model.keeps = obj.keeps;
      model.problems = obj.problems;
      model.tries = obj.tries;
      return model;
    } catch (ex) {
      return new KPTModel();
    }
  }
}

const cellStyle = {
  border: '1px solid silver',
  verticalAlign: 'top',
};

export default class KPTApplication extends React.Component {
  constructor(props) {
    super();
    this.handleAddKeep = this.handleAddKeep.bind(this);
    this.handleAddProblem = this.handleAddProblem.bind(this);
    this.handleAddTry = this.handleAddTry.bind(this);
    this.state = { kpt: KPTModel.deserialize(props.data) };
  }
  componentWillReceiveProps(newProps) {
    const kpt = KPTModel.deserialize(newProps.data);
    this.setState({ kpt });
  }
  shouldComponentUpdate(/* newProps, nextState */) {
    // TODO
    return true;
  }
  handleAddKeep() {
    const value = this.inputKeep.value;
    if (!value) return;
    this.state.kpt.addKeep(value);
    this.props.onEdit(this.state.kpt.serialize(), this.props.appContext);
  }
  handleAddProblem() {
    const value = this.inputProblem.value;
    if (!value) return;
    this.state.kpt.addProblem(value);
    this.props.onEdit(this.state.kpt.serialize(), this.props.appContext);
  }
  handleAddTry() {
    const value = this.inputTry.value;
    if (!value) return;
    this.state.kpt.addTry(value);
    this.props.onEdit(this.state.kpt.serialize(), this.props.appContext);
  }
  renderCell(title, items, handlerAdd, rowSpan = 1) {
    return (<td rowSpan={rowSpan} style={cellStyle}>
      <h2>{title}</h2>
      <ul>
        {items.map(s => (<li>{s}</li>))}
      </ul>
      <input ref={(c) => { this[`input${title}`] = c; }} type="text" placeholder={`Add ${title}`} />
      <input type="button" value="Add" onClick={handlerAdd} />
    </td>);
  }
  render() {
    return (<div>
      <table>
        <tbody>
          <tr>
            {this.renderCell('Keep', this.state.kpt.keeps, this.handleAddKeep)}
            {this.renderCell('Try', this.state.kpt.tries, this.handleAddTry, 2)}
          </tr>
          <tr>
            {this.renderCell('Problem', this.state.kpt.problems, this.handleAddProblem)}
          </tr>
        </tbody>
      </table>
    </div>);
  }
}

KPTApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
