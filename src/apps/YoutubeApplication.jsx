import React from 'react';
import PropTypes from 'prop-types';

function getIdfromUrl(url) {
  const urlIndex = url.indexOf('?');
  if (urlIndex < 0) {
    return '';
  }
  const param = url.substring(urlIndex + 1, url.length);
  const kv = param.split('=');
  return kv[1];
}

export default class YoutubeApplication extends React.Component {
  constructor(props) {
    super();
    this.handleEdit = this.handleEdit.bind(this);
    this.state = { url: props.data };
  }
  componentWillReceiveProps(newProps) {
    if (this.props.data !== newProps.data) {
      this.setState({ url: newProps.data });
    }
  }
  shouldComponentUpdate(newProps, nextState) {
    return this.state.url !== nextState.url;
  }
  handleEdit() {
    const url = this.input.value;
    this.setState({ url });
    this.props.onEdit(url, this.props.appContext);
  }
  render() {
    const id = getIdfromUrl(this.state.url);
    const insertUrl = `https://www.youtube.com/embed/${id}?rel=0`;
    return (
      <div>
        <iframe width="560" height="315" src={insertUrl} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title={id} />
        <div key="input"><input type="text" style={{ width: '300px' }} ref={(c) => { this.input = c; }} placeholder="YouTube URL" value={this.state.url} onChange={this.handleEdit} /></div>
      </div>);
  }
}

YoutubeApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};