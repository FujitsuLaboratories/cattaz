import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';
import isEqual from 'lodash/isEqual';

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

  equals(other) {
    return isEqual(this, other);
  }

  serialize() {
    return Yaml.dump(this);
  }

  static deserialize(str) {
    try {
      const obj = Yaml.load(str);
      const model = new KPTModel();
      if (obj.keeps) model.keeps = obj.keeps;
      if (obj.problems) model.problems = obj.problems;
      if (obj.tries) model.tries = obj.tries;
      return model;
    } catch (ex) {
      return new KPTModel();
    }
  }
}

const cellStyle = {
  border: '1px solid grey',
  verticalAlign: 'top',
};

export default class KPTApplication extends React.Component {
  constructor() {
    super();
    this.refInputKeep = React.createRef();
    this.refInputProblem = React.createRef();
    this.refInputTry = React.createRef();
    this.handleAddKeep = this.handleAddKeep.bind(this);
    this.handleAddProblem = this.handleAddProblem.bind(this);
    this.handleAddTry = this.handleAddTry.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    if (data === nextProps.data) return false;
    const oldModel = KPTModel.deserialize(data);
    const newModel = KPTModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }

  handleAddKeep() {
    const { value } = this.refInputKeep.current;
    if (!value) return;
    const { data, onEdit, appContext } = this.props;
    const kpt = KPTModel.deserialize(data);
    kpt.addKeep(value);
    onEdit(kpt.serialize(), appContext);
  }

  handleAddProblem() {
    const { value } = this.refInputProblem.current;
    if (!value) return;
    const { data, onEdit, appContext } = this.props;
    const kpt = KPTModel.deserialize(data);
    kpt.addProblem(value);
    onEdit(kpt.serialize(), appContext);
  }

  handleAddTry() {
    const { value } = this.refInputTry.current;
    if (!value) return;
    const { data, onEdit, appContext } = this.props;
    const kpt = KPTModel.deserialize(data);
    kpt.addTry(value);
    onEdit(kpt.serialize(), appContext);
  }

  renderCell(title, items, handlerAdd, rowSpan = 1) {
    return (
      <td rowSpan={rowSpan} style={cellStyle}>
        <h2>
          {title}
        </h2>
        <ul>
          {items.map((s) => (
            <li>
              {s}
            </li>
          ))}
          <li key="input">
            <input ref={this[`refInput${title}`]} type="text" placeholder={`Add ${title}`} />
            <input type="button" value="Add" onClick={handlerAdd} />
          </li>
        </ul>
      </td>
    );
  }

  render() {
    const { data } = this.props;
    const kpt = KPTModel.deserialize(data);
    return (
      <div>
        <table>
          <tbody>
            <tr>
              {this.renderCell('Keep', kpt.keeps, this.handleAddKeep)}
              {this.renderCell('Try', kpt.tries, this.handleAddTry, 2)}
            </tr>
            <tr>
              {this.renderCell('Problem', kpt.problems, this.handleAddProblem)}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

KPTApplication.Model = KPTModel;

KPTApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
