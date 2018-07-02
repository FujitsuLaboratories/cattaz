import React from 'react';
import PropTypes from 'prop-types';

export default class HelloApplication extends React.Component {
  constructor() {
    super();
    this.refInput = React.createRef();
    this.handleEdit = this.handleEdit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    return data !== nextProps.data;
  }

  handleEdit() {
    const name = this.refInput.current.value;
    const { onEdit, appContext } = this.props;
    onEdit(name, appContext);
  }

  render() {
    const { data } = this.props;
    const name = data;
    return (
      <div>
        <div key="input">
          <input type="text" ref={this.refInput} placeholder="name" value={name} onChange={this.handleEdit} />
        </div>
        <div key="message">
          {name ? `Hello, ${name}` : 'Input your name'}
        </div>
      </div>);
  }
}

HelloApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
