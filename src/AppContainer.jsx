import React from 'react';
import PropTypes from 'prop-types';

export default class AppContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState && prevState.error && prevState.data !== nextProps.children.props.data) {
      // data from textarea has changed. It may resolve an issue in the application.
      return { error: null, info: null };
    }
    return null;
  }

  componentDidCatch(error, info) {
    const { children } = this.props;
    this.setState({
      error,
      info,
      data: children.props.data,
    });
  }

  render() {
    const { error, info } = this.state;
    const { active, children } = this.props;
    if (error) {
      const className = active ? 'appContainer error activeApp' : 'appContainer error';
      return (
        <div className={className}>
          <p>
            {`Failed to run an application '${children.props.appContext.language}' at line ${children.props.appContext.position.start.line}-${children.props.appContext.position.end.line}.`}
            Fixing text content in the fenced code block may resolve the issue.
          </p>
          <div>
            {error.toString()}
          </div>
          <pre>
            {info.componentStack}
          </pre>
        </div>
      );
    }
    const className = active ? 'appContainer activeApp' : 'appContainer';
    return (
      <div className={className}>
        {children}
      </div>);
  }
}
AppContainer.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool,
};
AppContainer.defaultProps = {
  active: false,
};
