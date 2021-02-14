import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Loader from './../Loader/Loader';
import './WallpaperImage.css';
import searchIco from './../../../img/search.png';
import debounce from 'lodash/debounce';
import OverlayContent from "./OverlayContent";
import CroppedImage from "./CroppedImage";
import {formatPrice} from "../../../functions/Localization";
import {BASE_API_URL} from "../../../functions/Api";


function coordinatesFromEvent(e) {
  const event = e.nativeEvent || e;
  let obj;

  if (event.touches) {
    obj = event.touches[0];

  } else if (event.changedTouches) {
    obj = event.changedTouches[0];

  } else {
    obj = event;
  }

  const {clientX, clientY} = obj;

  return {clientX, clientY};
}


export default class WallpaperImage extends Component {

  static propTypes = {
    selectedWidth: PropTypes.number,
    selectedHeight: PropTypes.number,
  };

  state = {
    imgWidth: 0,
    imgHeight: 0,
    cropParams: {
      maxCropWidth: 0,
      maxCropHeight: 0,
      focalCenter: {
        x: 0,
        y: 0,
      },
    },
    overlayStyles: {},
    backdropOneStyles: {},
    backdropTwoStyles: {},
    croppedImage: null,
    showLoader: false,
  };

  isDragging = false;
  startX = 0;
  startY = 0;
  startLeft = 0;
  startTop = 0;

  imgRef = null;

  constructor(props) {
    super(props);

    this.imgRef = React.createRef();
  }


  componentDidMount() {
    this.imgRef.current.addEventListener('load', () => {
      this.reloadImage();
    });

    window.addEventListener('resize', debounce(() => {
      this.reloadImage();
    }, 1000 / 60));

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    document.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    document.addEventListener('mousemove', async (e) => {
      if (!this.isDragging) {
        return;
      }

      e.preventDefault();

      await this.handleDrag(e);
      await this.calcCropParams();
    });

    document.addEventListener('touchmove', async (e) => {
      if (!this.isDragging) {
        return;
      }

      await this.handleDrag(e);
      await this.calcCropParams();
    });
  }


  async componentDidUpdate(prevProps) {
    const calcStylesAndCropParams = ['selectedWidth', 'selectedHeight', 'rotate', 'allowSelector']
      .filter(prop => this.props[prop] !== prevProps[prop])
      .length;

    const calcCropParams = ['flipImage', 'imageFilter', 'squareMeterPrice', 'basePrice']
      .filter(prop => this.props[prop] !== prevProps[prop])
      .length;

    if (calcCropParams) {
      await this.calcCropParams();
    }

    if (calcStylesAndCropParams) {
      await this.recalculateStyles();
      await this.calcCropParams();
    }

    if (this.props.customProductFile !== prevProps.customProductFile) {
      await this.reloadImage();
    }

    if (this.props.isCropped !== prevProps.isCropped) {

      if (this.props.isCropped) {
        this.setState({showLoader: true});
        const croppedImage = this.cropLink(this.state.cropParams);

        let croppedImgObj = new Image();

        croppedImgObj.onload = () => this.setState({
          croppedImage,
          showLoader: false,
        });

        croppedImgObj.onerror = () => this.setState({
          showLoader: false
        });

        croppedImgObj.src = croppedImage;

      } else {
        this.setState({croppedImage: false});
      }

    }
  }


  reloadImage() {
    if (!this.imgRef.current) {
      return;
    }

    const {width, height} = this.imgRef.current;
    const {imgWidth, imgHeight} = this.state;

    if (width === imgWidth && height === imgHeight) {
      return;
    }

    this.setState({
      imgWidth: width,
      imgHeight: height,
    }, async () => {
      await this.recalculateStyles();
      await this.calcCropParams();
    });
  }


  initDrag(e) {
    if (!this.props.allowSelector || this.props.isCropped) {
      return;
    }

    this.isDragging = true;

    const {clientX, clientY} = coordinatesFromEvent(e);

    this.startX = clientX;
    this.startY = clientY;

    this.startLeft = this.state.overlayStyles.left;
    this.startTop = this.state.overlayStyles.top;
  }


  handleDrag(e) {
    const {clientX, clientY} = coordinatesFromEvent(e);
    const {overlayStyles, imgWidth, imgHeight} = this.state;
    let newState;

    if (this.isVertical()) {

      const maxTop = imgHeight - overlayStyles.height - 1;
      const delta = this.startY - clientY;
      let top = this.startTop - delta;

      if (top < 1) {
        top = 1;
      }

      if (top > maxTop) {
        top = maxTop;
      }

      newState = {
        backdropOneStyles: {
          top: 0,
          left: 0,
          width: '100%',
          height: top,
        },
        backdropTwoStyles: {
          top: top + overlayStyles.height,
          left: 0,
          height: imgHeight - (top + overlayStyles.height),
          width: '100%',
        },
        overlayStyles: {
          ...overlayStyles,
          top,
        }
      };


    } else {

      const maxLeft = imgWidth - overlayStyles.width - 1;
      const delta = this.startX - clientX;
      let left = this.startLeft - delta;

      if (left < 1) {
        left = 1;
      }

      if (left > maxLeft) {
        left = maxLeft;
      }

      newState = {
        backdropOneStyles: {
          top: 0,
          left: 0,
          width: left,
          height: '100%',
        },
        backdropTwoStyles: {
          top: 0,
          left: left + overlayStyles.width,
          height: '100%',
          width: imgWidth - (left + overlayStyles.width),
        },
        overlayStyles: {
          ...overlayStyles,
          left,
        }
      };

    }

    return new Promise((resolve, reject) => {
      this.setState(newState, resolve);
    });
  }


  isVertical() {
    return this.props.selectedWidth / this.props.selectedHeight >= this.state.imgWidth / this.state.imgHeight;
  }


  calcCropParams() {
    const {overlayStyles, imgWidth, imgHeight} = this.state;
    let cropParams;

    if (this.isVertical()) {

      cropParams = {
        maxCropWidth: 1,
        maxCropHeight: overlayStyles.height / imgHeight,
        focalCenter: {
          x: .5,
          y: (overlayStyles.top + overlayStyles.height / 2) / imgHeight
        }
      };

    } else {

      cropParams = {
        maxCropWidth: overlayStyles.width / imgWidth,
        maxCropHeight: 1,
        focalCenter: {
          x: (overlayStyles.left + overlayStyles.width / 2) / imgWidth,
          y: .5
        }
      };

    }

    let price = (this.props.selectedWidth * this.props.selectedHeight) / 10000 * (this.props.basePrice + this.props.squareMeterPrice);
    let formattedPrice;

    if (!price) {
      price = this.props.basePrice;
      formattedPrice = formatPrice(price, this.props.locale, this.props.currency) + ' /㎡';

    } else {
      formattedPrice = formatPrice(price, this.props.locale, this.props.currency);
    }

    const detail = {
      cropParams,
      price,
      formattedPrice,
      cropLink: this.cropLink(cropParams),
    };

    let event = new CustomEvent('wallpaper-selector:onCropParamsChange', {detail});
    document.dispatchEvent(event);

    return new Promise((resolve, reject) => {
      this.setState({cropParams}, resolve);
    });
  }


  recalculateStyles() {
    if (!this.props.allowSelector) {

      return new Promise((resolve, reject) => {
        this.setState({
          backdropOneStyles: {display: 'none'},
          backdropTwoStyles: {display: 'none'},
          overlayStyles: {display: 'none'},
        }, resolve);
      });
    }

    let newState;

    if (this.isVertical()) {

      const scale = this.props.selectedWidth / this.props.selectedHeight;
      let height = this.state.imgHeight;
      let width = this.state.imgHeight * scale;

      if (width > this.state.imgWidth) {
        height *= this.state.imgWidth / width;
        width = this.state.imgWidth;
      }

      const top = (this.state.imgHeight - height) / 2;

      newState = {
        backdropOneStyles: {
          top: 0,
          left: 0,
          height: top,
          width: '100%',
        },
        backdropTwoStyles: {
          top: top + height,
          left: 0,
          height: this.state.imgHeight - (top + height),
          width: '100%',
        },
        overlayStyles: {
          left: 1,
          height,
          width: width - 2,
          top,
        }
      }

    } else {

      const scale = this.props.selectedHeight / this.props.selectedWidth;
      let height = this.state.imgWidth * scale;
      let width = this.state.imgWidth;

      if (height > this.state.imgHeight) {
        width *= this.state.imgHeight / height;
        height = this.state.imgHeight;
      }

      const left = (this.state.imgWidth - width) / 2;

      newState = {
        backdropOneStyles: {
          top: 0,
          left: 0,
          height: '100%',
          width: left,
        },
        backdropTwoStyles: {
          top: 0,
          left: left + width,
          height: '100%',
          width: this.state.imgWidth - (left + width),
        },
        overlayStyles: {
          top: 1,
          width,
          height: height - 2,
          left,
        }
      }

    }

    return new Promise((resolve, reject) => {
      this.setState(newState, resolve);
    });

  }


  cropLink(cropParams, action = 'cropResizeThumb') {

    let params = {
      maxWidthConstraint: 650,
      maxHeightConstraint: 650,
      sku: this.props.sku,
      width: this.props.selectedWidth * 10,
      height: this.props.selectedHeight * 10,
      direction: this.props.flipImage ? 'R' : 'F',
      filter: this.props.imageFilter,
      rotate: this.props.rotate,
      focal_center_x: cropParams.focalCenter.x,
      focal_center_y: cropParams.focalCenter.y,
      max_crop_width: cropParams.maxCropWidth,
      max_crop_height: cropParams.maxCropHeight,
    };

    if (this.props.flipImage) {
      params.focal_center_x = 1 - params.focal_center_x;
    }

    if (this.props.customProductFile) {
      params.customProductFile = this.props.customProductFile;
    }

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    return `${BASE_API_URL}/images/${action}?${queryString}`;
  }


  getImageStyles() {
    let imgStyles = {};

    if (this.props.allowSelector && !this.state.croppedImage) {
      imgStyles = {
        transform: this.props.flipImage ? 'scaleX(-1)' : 'scaleX(1)',
      };

      if (this.props.imageFilter === 'b&w') {
        imgStyles.filter = 'grayscale(100%)';

      } else if (this.props.imageFilter === 'sepia') {
        imgStyles.filter = 'grayscale(100%) sepia(80%)';
      }
    }

    return imgStyles;
  }


  getOverlayStyles() {
    const {overlayStyles} = this.state;

    if (this.props.showTiles) {
      return overlayStyles;
    }

    return {
      ...overlayStyles,
      outline: '1px dashed yellow'
    };
  }


  render() {
    const imgStyles = this.getImageStyles();
    const overlayStyles = this.getOverlayStyles();
    let {backdropOneStyles, backdropTwoStyles} = this.state;

    if (this.state.croppedImage) {

      return (
        <CroppedImage
          locale={this.props.locale}
          showTiles={this.props.showTiles}
          overlayWidthPx={overlayStyles.width}
          selectedWidth={this.props.selectedWidth}
          selectedHeight={this.props.selectedHeight}
          croppedImage={this.state.croppedImage}
          imgStyles={imgStyles}
        />
      );
    }

    return (
      <div className="WallpaperImage">

        <Loader show={this.state.showLoader}/>

        {!this.props.allowSelector && (
          <a className="WallpaperImage__search"
             onClick={() => this.props.onMagnifierClick && this.props.onMagnifierClick(this.props.currentImage)}>
            <img src={searchIco} alt=""/>
          </a>
        )}

        {this.props.selectedWidth && this.props.selectedHeight
          ? (
            <React.Fragment>
              <div className="WallpaperImage__backdrop" style={backdropOneStyles}/>
              <div className="WallpaperImage__backdrop" style={backdropTwoStyles}/>
              <div
                className="WallpaperImage__overlay"
                style={overlayStyles}
                onTouchStart={(e) => this.initDrag(e)}
                onMouseDown={(e) => this.initDrag(e)}>

                <OverlayContent
                  locale={this.props.locale}
                  overlayWidthPx={this.state.overlayStyles.width}
                  showTiles={this.props.showTiles}
                  showArrow={true}
                  selectedWidth={this.props.selectedWidth}
                  selectedHeight={this.props.selectedHeight}
                />

              </div>
            </React.Fragment>
          )
          : <React.Fragment/>}

        <img
          alt=""
          ref={this.imgRef}
          src={this.props.currentImage}
          style={imgStyles}
          className="WallpaperImage__img"/>

      </div>
    )
  }

}