import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorApplication extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    return { data: nextProps.data };
  }
  constructor() {
    super();
    this.state = { data: '' };
    this.handleStartRaisingError = this.handleStartRaisingError.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return this.state.data !== nextState.data;
  }
  handleStartRaisingError() {
    this.props.onEdit('even', this.props.appContext);
    this.setState({ data: 'even' });
  }
  render() {
    const text = (this.state.data && this.state.data.trim()) || '';
    if (text.length % 2 === 1) {
      return (
        <div>
          <p>No error because length of &apos;{this.state.data.trim()}&apos; is odd.</p>
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
