import React from 'react';
import PropTypes from 'prop-types';

export default class AppContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillReceiveProps(newProps) {
    if (this.props.children.props.data !== newProps.children.props.data) {
      // data from textarea has changed. It may resolve an issue in the application.
      this.setState({ error: null, info: null });
    }
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  render() {
    if (this.state.error) {
      const className = this.props.active ? 'appContainer error activeApp' : 'appContainer error';
      return (
        <div className={className}>
          <p>
            Failed to run an application &apos;{this.props.children.props.appContext.language}&apos;
            at line {this.props.children.props.appContext.position.start.line}-{this.props.children.props.appContext.position.end.line}.
            Fixing text content in the fenced code block may resolve the issue.
          </p>
          <div>{this.state.error.toString()}</div>
          <pre>{this.state.info.componentStack}</pre>
        </div>
      );
    }
    const className = this.props.active ? 'appContainer activeApp' : 'appContainer';
    return <div className={className}>{this.props.children}</div>;
  }
}
AppContainer.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool.isRequired,
};
