import React from 'react';
import PropTypes from 'prop-types';

const reYouTubeVideoID = /(youtu\.be\/|[?&]v=)([-_A-Za-z0-9]+)/;

export function extractYouTubeVideoID(url) {
  const match = reYouTubeVideoID.exec(url);
  if (match) return match[2];
  return '';
}

export default class YoutubeApplication extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    return { url: nextProps.data };
  }
  constructor() {
    super();
    this.refInput = React.createRef();
    this.handleEdit = this.handleEdit.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return this.state.url !== nextState.url;
  }
  handleEdit() {
    const url = this.refInput.current.value;
    this.setState({ url });
    this.props.onEdit(url, this.props.appContext);
  }
  render() {
    const id = extractYouTubeVideoID(this.state.url);
    const insertUrl = `https://www.youtube.com/embed/${id}?rel=0`;
    return (
      <div>
        <iframe width="560" height="315" src={insertUrl} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title={id} />
        <div key="input"><input type="text" style={{ width: '300px' }} ref={this.refInput} placeholder="YouTube URL" value={this.state.url} onChange={this.handleEdit} /></div>
      </div>);
  }
}

YoutubeApplication.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
