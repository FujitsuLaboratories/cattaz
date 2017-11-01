import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

class KanbanList {
  constructor(name) {
    this.name = name;
    this.items = [];
  }
  addItem(item) {
    this.items.push(item);
  }
  insertItem(index, item) {
    this.items.splice(index, 0, item);
  }
  getLength() {
    return this.items.length;
  }
  getItemAt(index) {
    return this.items[index];
  }
  removeItemAt(index) {
    this.items.splice(index, 1);
  }
  toMarkdown() {
    return [
      `* ${this.name}`,
      ...this.items.map(s => `  * ${s}`),
    ].join('\n');
  }
}

class KanbanModel {
  constructor() {
    this.lists = [];
  }
  addList(str) {
    this.lists.push(new KanbanList(str));
  }
  getLength() {
    return this.lists.length;
  }
  getListAt(index) {
    return this.lists[index];
  }
  removeListAt(index) {
    this.lists.splice(index, 1);
  }
  moveItem(fromListIndex, fromItemIndex, toListIndex, toItemIndex) {
    const fromList = this.getListAt(fromListIndex);
    const item = fromList.getItemAt(fromItemIndex);
    fromList.removeItemAt(fromItemIndex);
    this.getListAt(toListIndex).insertItem(toItemIndex, item);
  }
  equals(other) {
    return isEqual(this, other);
  }
  serialize() {
    return this.lists.map(l => l.toMarkdown()).join('\n');
  }
  static deserialize(str) {
    try {
      const reList = /^[*-]\s*(.*)$/;
      const reItem = /^\s+[*-]\s*(.*)$/;
      const lines = str.split('\n');
      const model = new KanbanModel();
      lines.forEach((l) => {
        const matchList = l.match(reList);
        const matchItem = l.match(reItem);
        if (matchList) {
          model.addList(matchList[1]);
        } else if (matchItem) {
          const listLength = model.getLength();
          if (listLength) {
            model.getListAt(listLength - 1).addItem(matchItem[1]);
          }
        }
      });
      return model;
    } catch (ex) {
      return new KanbanModel();
    }
  }
}

const cellStyle = {
  border: '1px solid grey',
  verticalAlign: 'top',
};
const itemStyle = {
  backgroundColor: 'LemonChiffon',
  border: '1px solid silver',
  display: 'block',
  margin: '0.1em',
  padding: '0.1em',
  cursor: 'grab',
};

class KanbanItem extends React.Component {
  constructor() {
    super();
    this.remove = this.remove.bind(this);
  }
  remove() {
    this.props.callbacks.removeItem(this.props.itemId);
  }
  render() {
    return (
      <span style={itemStyle}>
        {this.props.title}
        <input type="button" style={{ float: 'right' }} value="x" onClick={this.remove} />
      </span>
    );
  }
}
KanbanItem.propTypes = {
  title: PropTypes.string.isRequired,
  itemId: PropTypes.shape({}).isRequired,
  callbacks: PropTypes.shape({
    removeItem: PropTypes.func.isRequired,
  }).isRequired,
};

// eslint-disable-next-line react/no-multi-comp
export default class KanbanApplication extends React.Component {
  constructor(props) {
    super();
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleAddList = this.handleAddList.bind(this);
    this.handleRemoveList = this.handleRemoveList.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.state = { kanban: KanbanModel.deserialize(props.data) };
    this.callbacksFromItems = {
      removeItem: this.handleRemoveItem,
    };
  }
  componentWillReceiveProps(newProps) {
    if (this.props.data !== newProps.data) {
      const kanban = KanbanModel.deserialize(newProps.data);
      this.setState({ kanban });
    }
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.kanban.equals(nextState.kanban);
  }
  handleAddItem(ev) {
    const index = parseInt(ev.target.getAttribute('data-index'), 10);
    const textbox = this[`input${index}`];
    if (textbox) {
      const text = textbox.value;
      if (text) {
        this.state.kanban.getListAt(index).addItem(text);
        this.forceUpdate();
        this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
      }
    }
  }
  handleAddList() {
    const textbox = this.inputList;
    const text = textbox.value;
    if (text) {
      this.state.kanban.addList(text);
      this.forceUpdate();
      this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
    }
  }
  handleRemoveList(ev) {
    const index = parseInt(ev.target.getAttribute('data-index'), 10);
    this.state.kanban.removeListAt(index);
    this.forceUpdate();
    this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
  }
  handleRemoveItem(itemId) {
    this.state.kanban.getListAt(itemId.list).removeItemAt(itemId.item);
    this.forceUpdate();
    this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
  }
  renderRow(index, title, items) {
    return (
      <td style={cellStyle}>
        <h2>{title} <input type="button" style={{ float: 'right' }} data-index={index} value="x" onClick={this.handleRemoveList} /></h2>
        {items.map((s, i) => <KanbanItem title={s} itemId={{ list: index, item: i }} callbacks={this.callbacksFromItems} />)}
      </td>);
  }
  renderRow2(index) {
    return (
      <td>
        <input ref={(c) => { this[`input${index}`] = c; }} type="text" placeholder="Add item" />
        <input type="button" value="Add" data-index={index} onClick={this.handleAddItem} />
      </td>);
  }
  render() {
    return (
      <div>
        <input ref={(c) => { this.inputList = c; }} type="text" placeholder="Add list" />
        <input type="button" value="Add list" onClick={this.handleAddList} />
        <table>
          <tbody>
            <tr>
              {this.state.kanban.lists.map((l, i) => this.renderRow(i, l.name, l.items))}
            </tr>
            <tr>
              {this.state.kanban.lists.map((l, i) => this.renderRow2(i))}
            </tr>
          </tbody>
        </table>
      </div>);
  }
}

KanbanApplication.Model = KanbanModel;

KanbanApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
