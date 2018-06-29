import React from 'react';
import PropTypes from 'prop-types';

export default class HelloApplication extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    return { name: nextProps.data };
  }
  constructor() {
    super();
    this.state = { name: '' };
    this.refInput = React.createRef();
    this.handleEdit = this.handleEdit.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return this.state.name !== nextState.name;
  }
  handleEdit() {
    const name = this.refInput.current.value;
    this.setState({ name });
    this.props.onEdit(name, this.props.appContext);
  }
  render() {
    return (
      <div>
        <div key="input"><input type="text" ref={this.refInput} placeholder="name" value={this.state.name} onChange={this.handleEdit} /></div>
        <div key="message">{this.state.name ? `Hello, ${this.state.name}` : 'Input your name'}</div>
      </div>);
  }
}

HelloApplication.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
