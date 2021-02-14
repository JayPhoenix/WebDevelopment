import React, {Component} from 'react';
import ReactLoaderSpinner from 'react-loader-spinner'
import './Loader.css';


export default class Loader extends Component {

  render() {

    if (!this.props.show) {
      return <React.Fragment/>;
    }

    return (
      <div className="Loader">
        <ReactLoaderSpinner type="TailSpin" color="white" height={80} width={80}/>
      </div>
    );

  }

}