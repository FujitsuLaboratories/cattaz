import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorApplication extends React.Component {
  constructor() {
    super();
    this.handleStartRaisingError = this.handleStartRaisingError.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    return data !== nextProps.data;
  }

  handleStartRaisingError() {
    const { onEdit, appContext } = this.props;
    onEdit('even', appContext);
  }

  render() {
    const { data } = this.props;
    const text = (data && data.trim()) || '';
    if (text.length % 2 === 1) {
      return (
        <div>
          <p>
            No error because length of &apos;
            {text}
            &apos; is odd.
          </p>
          <button onClick={this.handleStartRaisingError} type="button">
            Start raising an error
          </button>
        </div>
      );
    }
    throw new Error(`error because length of '${text}' is even.`);
  }
}

ErrorApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
