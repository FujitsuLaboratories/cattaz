import React from 'react';
import PropTypes from 'prop-types';

const reYouTubeVideoID = /(youtu\.be\/|[?&]v=)([-_A-Za-z0-9]+)/;

export function extractYouTubeVideoID(url) {
  const match = reYouTubeVideoID.exec(url);
  if (match) return match[2];
  return '';
}

export default class YoutubeApplication extends React.Component {
  constructor() {
    super();
    this.refInput = React.createRef();
    this.handleEdit = this.handleEdit.bind(this);
  }
  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }
  handleEdit() {
    const url = this.refInput.current.value;
    this.props.onEdit(url, this.props.appContext);
  }
  render() {
    const url = this.props.data;
    const id = extractYouTubeVideoID(url);
    const insertUrl = `https://www.youtube.com/embed/${id}?rel=0`;
    return (
      <div>
        <iframe width="560" height="315" src={insertUrl} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title={id} />
        <div key="input"><input type="text" style={{ width: '300px' }} ref={this.refInput} placeholder="YouTube URL" value={url} onChange={this.handleEdit} /></div>
      </div>);
  }
}

YoutubeApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
