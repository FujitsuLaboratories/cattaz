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
  async loadDoc(pageName) {
    const mdFileName = docs[pageName];
    if (!mdFileName) {
      this.setState({ docText: `There is no document named '${pageName}'` });
      return;
    }
    this.setState({ docText: null });
    const res = await window.fetch(mdFileName);
    const text = await res.text();
    this.setState({ docText: text });
  }
  handleActiveUserDisp(userNum) {
    this.setState({ activeUser: userNum });
  }
  render() {
    const pageName = this.props.match.params.page;
    const roomName = this.props.doc ? null : pageName;
    const defaultValue = this.props.doc ? `loading ${pageName}...` : `syncing with ${pageName}...`;
    const { docText } = this.state;
    const style = {
      header: {
        height: 33 + 4, display: 'flex', flexFlow: 'row', alignItems: 'center', margin: 0, padding: 7, backgroundColor: '#F1F1F1',
      },
      headerLeft: {
        display: 'flex', flexFlow: 'row', alignItems: 'center', marginLeft: '5px', marginRight: 'auto',
      },
      img: {
        display: 'block', margin: '0 auto', padding: 0,
      },
      pageName: {
        paddingLeft: '8px', fontSize: '24px',
      },
      active: {
        marginRight: '25px', fontSize: '18px',
      },
    };
    return (
      <React.Fragment>
        <div style={style.header}>
          <div style={style.headerLeft}>
            <RouterLink to="/"><img src={logo} alt="cattaz" width="118" height="33" style={style.img} /></RouterLink>
            <div style={style.pageName}>{pageName}</div>
          </div>
          {this.state.activeUser > 0 ? <div style={style.active}>(active: {this.state.activeUser})</div> : null}
        </div>
        <AppEnabledWikiEditor key={this.props.doc ? `doc/${pageName}` : `page/${pageName}`} roomName={roomName} defaultValue={defaultValue} value={docText} heightMargin={style.header.height + (style.header.padding * 2)} onActiveUser={this.handleActiveUserDisp} />
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
