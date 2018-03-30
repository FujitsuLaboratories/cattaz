import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import assign from 'lodash/assign';
import clone from 'lodash/clone';
import repeat from 'lodash/repeat';

import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

class KanbanModelItem {
  constructor(name, importance = 0) {
    this.name = name;
    this.importance = importance;
  }
  toMarkdown() {
    const emphasis = repeat('*', this.importance);
    return `${emphasis}${this.name}${emphasis}`;
  }
}

class KanbanModelList {
  constructor(name) {
    this.name = name;
    this.items = [];
  }
  addItem(text, importance = 0) {
    this.items.push(new KanbanModelItem(text, importance));
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
      ...this.items.map(i => `  * ${i.toMarkdown()}`),
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
      const reText = /^([*_]*)(.*?)([*_]*)$/;
      const lines = str.split('\n');
      const model = new KanbanModel();
      lines.forEach((l) => {
        const matchList = l.match(reList);
        if (matchList) {
          model.addList(matchList[1]);
          return;
        }
        const matchItem = l.match(reItem);
        if (matchItem) {
          const listLength = model.getLength();
          if (listLength) {
            const matchText = matchItem[1].match(reText);
            const empLeft = matchText[1] ? matchText[1].length : 0;
            const empRight = matchText[3] ? matchText[3].length : 0;
            const importance = Math.min(3, empLeft, empRight);
            model.getListAt(listLength - 1).addItem(matchText[2], importance);
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
  backgroundColor: 'LightGrey',
  borderRadius: '4px',
  verticalAlign: 'top',
  cursor: 'grab',
};
const listDraggingStyle = assign(clone(listStyle), {
  opacity: 0.5,
});
const listTitleStyle = {
  fontWeight: 'bold',
  margin: '0 0.1em',
  padding: '0 0.1em',
};
const cardStyle0 = {
  backgroundColor: 'LemonChiffon',
  border: '1px solid silver',
  display: 'block',
  margin: '0.1em',
  padding: '0.1em',
  cursor: 'grab',
};
const cardStyle1 = assign(clone(cardStyle0), {
  backgroundColor: 'PeachPuff',
});
const cardStyle2 = assign(clone(cardStyle0), {
  backgroundColor: 'LightCoral',
});
const cardStyle3 = assign(clone(cardStyle0), {
  backgroundColor: 'Crimson',
});
const cardStyles = [
  cardStyle0,
  cardStyle1,
  cardStyle2,
  cardStyle3,
];

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

function renderKanbanCardText(text) {
  const regexLink = /\[([^\]]+)\]\(([^)]+)\)/g;
  const children = [];
  let lastLinkIndex = 0;
  for (let matchLink = regexLink.exec(text); matchLink; matchLink = regexLink.exec(text)) {
    if (lastLinkIndex < matchLink.index) {
      children.push(text.substring(lastLinkIndex, matchLink.index));
    }
    children.push(<a href={matchLink[2]}>{matchLink[1]}</a>);
    lastLinkIndex = regexLink.lastIndex;
  }
  if (lastLinkIndex < text.length) {
    children.push(text.substring(lastLinkIndex, text.length));
  }
  return children;
}

const KanbanCard = (props) => {
  let style = cardStyles[props.model.importance];
  if (props.isDragging) {
    style = assign(clone(style), {
      opacity: 0.5,
    });
  }
  return props.connectDragSource(props.connectDropTarget((
    <span style={style}>
      {renderKanbanCardText(props.model.name)}
    </span>)));
};
KanbanCard.propTypes = {
  model: PropTypes.instanceOf(KanbanModelItem).isRequired,
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
      {props.model.items.map((s, i) => <KanbanCardDraggable model={s} itemId={{ list: props.listIndex, item: i }} app={props.app} />)}
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
  borderRadius: '4px',
  margin: '0 0.2em',
  padding: '0.1em 0.5em',
};
const trashActiveStyle = assign(clone(trashInactiveStyle), {
  backgroundColor: 'OrangeRed',
});
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
  static getDerivedStateFromProps(nextProps) {
    const kanban = KanbanModel.deserialize(nextProps.data);
    return { kanban };
  }
  constructor() {
    super();
    this.refInputList = React.createRef();
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleAddList = this.handleAddList.bind(this);
    this.handleRemoveList = this.handleRemoveList.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleMoveItem = this.handleMoveItem.bind(this);
    this.handleMoveList = this.handleMoveList.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.kanban.equals(nextState.kanban);
  }
  modelUpdated() {
    this.setState({ kanban: clone(this.state.kanban) });
    this.forceUpdate();
    this.props.onEdit(this.state.kanban.serialize(), this.props.appContext);
  }
  handleAddItem(ev) {
    const index = parseInt(ev.target.getAttribute('data-index'), 10);
    const textbox = this[`input${index}`];
    if (textbox) {
      const text = textbox.value;
      if (text) {
        this.state.kanban.getListAt(index).addItem(text);
        this.modelUpdated();
      }
    }
  }
  handleAddList() {
    const text = this.refInputList.current.value;
    if (text) {
      this.state.kanban.addList(text);
      this.modelUpdated();
    }
  }
  handleRemoveList(listIndex) {
    this.state.kanban.removeListAt(listIndex);
    this.modelUpdated();
  }
  handleRemoveItem(itemId) {
    this.state.kanban.getListAt(itemId.list).removeItemAt(itemId.item);
    this.modelUpdated();
  }
  handleMoveItem(sourceId, targetId) {
    let targetItemIndex = targetId.item;
    if (targetItemIndex < 0) {
      targetItemIndex = this.state.kanban.getListAt(targetId.list).getLength();
    }
    this.state.kanban.moveItem(sourceId.list, sourceId.item, targetId.list, targetItemIndex);
    this.modelUpdated();
  }
  handleMoveList(sourceId, targetId) {
    this.state.kanban.moveList(sourceId, targetId);
    this.modelUpdated();
  }
  renderRow2(index) {
    return (
      <td>
        {/* TODO find a better way for a new 'ref' API since React 16.3 */}
        <input ref={(c) => { this[`input${index}`] = c; }} type="text" placeholder="Add item" />
        <input type="button" value="Add" data-index={index} onClick={this.handleAddItem} />
      </td>);
  }
  render() {
    return (
      <div>
        <input ref={this.refInputList} type="text" placeholder="Add list" />
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
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};

export default DragDropContext(HTML5Backend)(KanbanApplication);
