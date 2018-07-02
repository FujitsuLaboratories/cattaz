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
    const { data } = this.props;
    return data !== nextProps.data;
  }

  handleEdit() {
    const { onEdit, appContext } = this.props;
    const url = this.refInput.current.value;
    onEdit(url, appContext);
  }

  render() {
    const { data } = this.props;
    const id = extractYouTubeVideoID(data);
    const insertUrl = `https://www.youtube.com/embed/${id}?rel=0`;
    return (
      <div>
        <iframe width="560" height="315" src={insertUrl} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title={id} />
        <div key="input">
          <input type="text" style={{ width: '300px' }} ref={this.refInput} placeholder="YouTube URL" value={data} onChange={this.handleEdit} />
        </div>
      </div>);
  }
}

YoutubeApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
