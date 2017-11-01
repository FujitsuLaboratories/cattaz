import React from 'react';
import PropTypes from 'prop-types';
import NavLink from 'react-router-dom/NavLink';

import AppEnabledWikiEditor from './AppEnabledWikiEditorCodeMirror';
import docs from './docs';
import logo from '../docs/assets/cattaz.svg';

export default class Page extends React.Component {
  constructor() {
    super();
    this.state = {};
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
  render() {
    const pageName = this.props.match.params.page;
    const roomName = this.props.doc ? null : pageName;
    const defaultValue = this.props.doc ? `loading ${pageName}...` : `syncing with ${pageName}...`;
    const { docText } = this.state;
    return (
      <div>
        <div style={{ height: 33 + 4 }}>
          <NavLink to="/"><img src={logo} alt="cattaz" width="118" height="33" /></NavLink>
          <span style={{ margin: '0 0.5em', verticalAlign: 'top', fontSize: '24px' }}>{pageName}</span>
        </div>
        <AppEnabledWikiEditor key={this.props.doc ? `doc/${pageName}` : `page/${pageName}`} roomName={roomName} defaultValue={defaultValue} value={docText} heightMargin={33 + 4} />
      </div>);
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
