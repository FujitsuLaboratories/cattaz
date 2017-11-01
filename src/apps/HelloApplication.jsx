import React from 'react';
import PropTypes from 'prop-types';

export default class HelloApplication extends React.Component {
  constructor(props) {
    super();
    this.handleEdit = this.handleEdit.bind(this);
    this.state = { name: props.data };
  }
  componentWillReceiveProps(newProps) {
    if (this.props.data !== newProps.data) {
      this.setState({ name: newProps.data });
    }
  }
  shouldComponentUpdate(newProps, nextState) {
    return this.state.name !== nextState.name;
  }
  handleEdit() {
    const name = this.input.value;
    this.setState({ name });
    this.props.onEdit(name, this.props.appContext);
  }
  render() {
    return (
      <div>
        <div key="input"><input type="text" ref={(c) => { this.input = c; }} placeholder="name" value={this.state.name} onChange={this.handleEdit} /></div>
        <div key="message">{this.state.name ? `Hello, ${this.state.name}` : 'Input your name'}</div>
      </div>);
  }
}

HelloApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
