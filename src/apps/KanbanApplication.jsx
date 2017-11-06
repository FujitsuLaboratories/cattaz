import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import assign from 'lodash/assign';
import clone from 'lodash/clone';

import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

class KanbanModelList {
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
    this.lists.push(new KanbanModelList(str));
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
  insertList(index, list) {
    this.lists.splice(index, 0, list);
  }
  moveItem(fromListIndex, fromItemIndex, toListIndex, toItemIndex) {
    const fromList = this.getListAt(fromListIndex);
    const item = fromList.getItemAt(fromItemIndex);
    fromList.removeItemAt(fromItemIndex);
    this.getListAt(toListIndex).insertItem(toItemIndex, item);
  }
  moveList(fromListIndex, toListIndex) {
    const fromList = this.getListAt(fromListIndex);
    this.removeListAt(fromListIndex);
    this.insertList(toListIndex, fromList);
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

const listStyle = {
  border: '1px solid grey',
  verticalAlign: 'top',
  cursor: 'grab',
};
const listDraggingStyle = assign(clone(listStyle), {
  opacity: 0.5,
});
const listTitleStyle = {
  fontWeight: 'bold',
};
const cardStyle = {
  backgroundColor: 'LemonChiffon',
  border: '1px solid silver',
  display: 'block',
  margin: '0.1em',
  padding: '0.1em',
  cursor: 'grab',
};
const cardDraggingStyle = assign(clone(cardStyle), {
  backgroundColor: 'transparent',
});

const dndTypes = {
  kanbanCard: 'kanban-card',
  kanbanList: 'kanban-list',
};

const cardSource = {
  beginDrag(props) {
    return {
      itemId: props.itemId,
      app: props.app,
    };
  },
};
const cardTarget = {
  canDrop(props, monitor) {
    const sourceApp = monitor.getItem().app;
    const targetApp = props.app;
    return sourceApp === targetApp;
  },
  drop(props, monitor /* , component */) {
    const dragItemId = monitor.getItem().itemId;
    const hoverItemId = props.itemId;
    if (isEqual(dragItemId, hoverItemId)) {
      return;
    }
    props.app.handleMoveItem(dragItemId, hoverItemId);
  },
};

const KanbanCard = props => (
  props.connectDragSource(props.connectDropTarget((
    <span style={props.isDragging ? cardDraggingStyle : cardStyle}>
      {props.title}
    </span>))));
KanbanCard.propTypes = {
  title: PropTypes.string.isRequired,
  itemId: PropTypes.shape({
    list: PropTypes.number,
    item: PropTypes.number,
  }).isRequired,
  // eslint-disable-next-line no-use-before-define
  app: PropTypes.instanceOf(KanbanApplication).isRequired,
  // DND
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
};

const KanbanCardDraggable = DropTarget(dndTypes.kanbanCard, cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(DragSource(dndTypes.kanbanCard, cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(KanbanCard));

const listCardTarget = {
  canDrop(props, monitor) {
    const sourceApp = monitor.getItem().app;
    const targetApp = props.app;
    return sourceApp === targetApp;
  },
  drop(props, monitor /* , component */) {
    const hasDroppedOnChild = monitor.didDrop();
    if (hasDroppedOnChild) {
      return;
    }
    const dragItemId = monitor.getItem().itemId;
    const hoverListIndex = props.listIndex;
    props.app.handleMoveItem(dragItemId, { list: hoverListIndex, item: -1 });
  },
};

const listSource = {
  beginDrag(props) {
    return {
      listIndex: props.listIndex,
      app: props.app,
    };
  },
};
const listTarget = {
  canDrop(props, monitor) {
    const sourceApp = monitor.getItem().app;
    const targetApp = props.app;
    return sourceApp === targetApp;
  },
  drop(props, monitor /* , component */) {
    const dragListIndex = monitor.getItem().listIndex;
    const hoverListIndex = props.listIndex;
    if (isEqual(dragListIndex, hoverListIndex)) {
      return;
    }
    props.app.handleMoveList(dragListIndex, hoverListIndex);
  },
};

const KanbanList = props => (
  props.connectDropTarget(props.connectDropTarget2(props.connectDragSource((
    <td style={props.isDragging ? listDraggingStyle : listStyle}>
      <div style={listTitleStyle}>{props.model.name}</div>
      {props.model.items.map((s, i) => <KanbanCardDraggable title={s} itemId={{ list: props.listIndex, item: i }} app={props.app} />)}
    </td>)))));
KanbanList.propTypes = {
  model: PropTypes.instanceOf(KanbanModelList).isRequired,
  listIndex: PropTypes.number.isRequired,
  // eslint-disable-next-line no-use-before-define
  app: PropTypes.instanceOf(KanbanApplication).isRequired,
  // DND
  connectDropTarget: PropTypes.func.isRequired,
  connectDropTarget2: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
};

const KanbanListDraggable = DropTarget(dndTypes.kanbanCard, listCardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(DropTarget(dndTypes.kanbanList, listTarget, connect => ({
  connectDropTarget2: connect.dropTarget(),
}))(DragSource(dndTypes.kanbanList, listSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(KanbanList)));

const trashInactiveStyle = {
  backgroundColor: 'LightGrey',
};
const trashActiveStyle = {
  backgroundColor: 'OrangeRed',
};
const trashCardTarget = {
  canDrop(props, monitor) {
    const sourceApp = monitor.getItem().app;
    const targetApp = props.app;
    return sourceApp === targetApp;
  },
  drop(props, monitor /* , component */) {
    const dragItemId = monitor.getItem().itemId;
    props.app.handleRemoveItem(dragItemId);
  },
};
const trashListTarget = {
  canDrop(props, monitor) {
    const sourceApp = monitor.getItem().app;
    const targetApp = props.app;
    return sourceApp === targetApp;
  },
  drop(props, monitor /* , component */) {
    const dragListIndex = monitor.getItem().listIndex;
    props.app.handleRemoveList(dragListIndex);
  },
};
const KanbanTrash = props => props.connectDropTargetC(props.connectDropTargetL((
  <span style={props.isOverC || props.isOverL ? trashActiveStyle : trashInactiveStyle}>Drop here to remove</span>
)));
KanbanTrash.propTypes = {
  // eslint-disable-next-line no-use-before-define
  app: PropTypes.instanceOf(KanbanApplication).isRequired,
  // DND
  connectDropTargetC: PropTypes.func.isRequired,
  connectDropTargetL: PropTypes.func.isRequired,
  isOverC: PropTypes.bool.isRequired,
  isOverL: PropTypes.bool.isRequired,
};
const KanbanTrashDraggable = DropTarget(dndTypes.kanbanCard, trashCardTarget, (connect, monitor) => ({
  connectDropTargetC: connect.dropTarget(),
  isOverC: monitor.isOver(),
}))(DropTarget(dndTypes.kanbanList, trashListTarget, (connect, monitor) => ({
  connectDropTargetL: connect.dropTarget(),
  isOverL: monitor.isOver(),
}))(KanbanTrash));

class KanbanApplication extends React.Component {
  constructor(props) {
    super();
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleAddList = this.handleAddList.bind(this);
    this.handleRemoveList = this.handleRemoveList.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleMoveItem = this.handleMoveItem.bind(this);
    this.handleMoveList = this.handleMoveList.bind(this);
    this.state = { kanban: KanbanModel.deserialize(props.data) };
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
  handleRemoveList(listIndex) {
    this.state.kanban.removeListAt(listIndex);
    this.forceUpdate();
    this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
  }
  handleRemoveItem(itemId) {
    this.state.kanban.getListAt(itemId.list).removeItemAt(itemId.item);
    this.forceUpdate();
    this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
  }
  handleMoveItem(sourceId, targetId) {
    let targetItemIndex = targetId.item;
    if (targetItemIndex < 0) {
      targetItemIndex = this.state.kanban.getListAt(targetId.list).getLength();
    }
    this.state.kanban.moveItem(sourceId.list, sourceId.item, targetId.list, targetItemIndex);
    this.forceUpdate();
    this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
  }
  handleMoveList(sourceId, targetId) {
    this.state.kanban.moveList(sourceId, targetId);
    this.forceUpdate();
    this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
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
        <KanbanTrashDraggable app={this} />
        <table>
          <tbody>
            <tr>
              {this.state.kanban.lists.map((l, i) => <KanbanListDraggable model={l} listIndex={i} app={this} />)}
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

export default DragDropContext(HTML5Backend)(KanbanApplication);
