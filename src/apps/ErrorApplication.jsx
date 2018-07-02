import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorApplication extends React.Component {
  constructor() {
    super();
    this.handleStartRaisingError = this.handleStartRaisingError.bind(this);
  }
  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }
  handleStartRaisingError() {
    this.props.onEdit('even', this.props.appContext);
  }
  render() {
    const text = (this.props.data && this.props.data.trim()) || '';
    if (text.length % 2 === 1) {
      return (
        <div>
          <p>No error because length of &apos;{text}&apos; is odd.</p>
          <button onClick={this.handleStartRaisingError}>Start raising an error</button>
        </div>);
    }
    throw new Error(`error because length of '${text}' is even.`);
  }
}

ErrorApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
