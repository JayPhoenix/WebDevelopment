import React, {Component} from "react";
import './VideoBtn.css';
import ModalVideo from 'react-modal-video'
import 'react-modal-video/css/modal-video.min.css';

export default class VideoBtn extends Component {

  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        this.close();
      }
    });
  }


  open() {
    this.setState({opened: true})
  }


  close() {
    this.setState({opened: false});
  }


  render() {
    return (
      <div className="VideoBtn">
        <ModalVideo
          channel="youtube"
          videoId={this.props.videoId}
          isOpen={this.state.opened}
          onClose={() => this.close()}
        /> 
        {this.props.imageUrl //Take large turniary operators out of render
          ? (
            <img
              src={this.props.imageUrl}
              onClick={() => this.open()}
            />
          )
          : (
            <button onClick={() => this.open()}>
              {this.props.label || 'Open'}
            </button>
          )}
      </div>
    );
  }

}