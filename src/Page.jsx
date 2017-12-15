import React from 'react';
import PropTypes from 'prop-types';
import RouterLink from 'react-router-dom/Link';

import AppEnabledWikiEditor from './AppEnabledWikiEditorCodeMirror';
import docs from './docs';
import logo from '../docs/assets/cattaz.svg';

export default class Page extends React.Component {
  constructor() {
    super();
    this.state = { activeUser: 0 };
    this.handleActiveUserDisp = this.handleActiveUserDisp.bind(this);
  }
  componentDidMount() {
    if (this.props.doc) {
      this.loadDoc(this.props.match.params.page);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.doc && nextProps.match.params.page !== this.props.match.params.page) {
      this.loadDoc(nextProps.match.params.page);
    }
  }
  loadDoc(pageName) {
    const mdFileName = docs[pageName];
    if (!mdFileName) {
      this.setState({ docText: `There is no document named '${pageName}'` });
      return;
    }
    this.setState({ docText: null });
    window.fetch(mdFileName)
      .then(res => res.text())
      .then((text) => {
        this.setState({ docText: text });
      });
  }
  handleActiveUserDisp(userNum) {
    this.setState({ activeUser: userNum });
  }
  render() {
    const pageName = this.props.match.params.page;
    const roomName = this.props.doc ? null : pageName;
    const defaultValue = this.props.doc ? `loading ${pageName}...` : `syncing with ${pageName}...`;
    const { docText } = this.state;
    return (
      <React.Fragment>
        <div style={{ height: 33 + 4 }}>
          <RouterLink to="/"><img src={logo} alt="cattaz" width="118" height="33" /></RouterLink>
          <span style={{ margin: '0 0.5em', verticalAlign: 'top', fontSize: '24px' }}>{pageName}</span>
          {this.state.activeUser > 0 ? <span style={{ margin: '0 0.5em', verticalAlign: 'top', fontSize: '24px' }}>(active: {this.state.activeUser})</span> : null}
        </div>
        <AppEnabledWikiEditor key={this.props.doc ? `doc/${pageName}` : `page/${pageName}`} roomName={roomName} defaultValue={defaultValue} value={docText} heightMargin={33 + 4} onActiveUser={this.handleActiveUserDisp} />
      </React.Fragment>);
  }
}

Page.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      page: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  doc: PropTypes.bool,
};
Page.defaultProps = {
  doc: false,
};
