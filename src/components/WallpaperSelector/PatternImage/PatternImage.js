import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './PatternImage.css';
import debounce from 'lodash/debounce';
import {formatPrice} from "../../../functions/Localization";
import {getImageInfo} from "../../../functions/Api";
import OverlayContent from "../WallpaperImage/OverlayContent";

export default class PatternImage extends Component {

  static propTypes = {
    selectedWidth: PropTypes.number,
    selectedHeight: PropTypes.number,
  };

  state = {
    imgWidth: 0,
    imgHeight: 0,
    croppedImage: null,
    showLoader: false,
  };

  imgRef = null;

  constructor(props) {
    super(props);

    this.imgRef = React.createRef();
  }


  async componentDidMount() {
    this.imgRef.current.addEventListener('load', () => {
      this.reloadImage();
    });

    window.addEventListener('resize', debounce(() => {
      this.reloadImage();
    }, 1000 / 60));

    const imageInfo = await getImageInfo(this.props.sku);
    this.setState({imageInfo});
  }


  async componentDidUpdate(prevProps) {
    const calcPrice = ['selectedWidth', 'selectedHeight', 'allowSelector', 'flipImage', 'imageFilter', 'squareMeterPrice']
      .filter(prop => this.props[prop] !== prevProps[prop])
      .length;

    if (calcPrice) {
      await this.calcPrice();
    }

    if (this.props.customProductFile !== prevProps.customProductFile) {
      await this.reloadImage();
    }

  }

  reloadImage() {
    if (!this.imgRef.current) {
      return;
    }

    const {width, height, naturalWidth} = this.imgRef.current;
    this.imgRef.current.style.maxWidth = naturalWidth;

    this.setState({
      imgWidth: width,
      imgHeight: height,
    }, async () => {
      await this.calcPrice();
    });
  }


  calcPrice() {
    let price = (this.props.selectedWidth * this.props.selectedHeight) / 10000 * (this.props.basePrice + this.props.squareMeterPrice);

    const detail = {
      price,
      formattedPrice: price ? formatPrice(price, this.props.locale, this.props.currency) : null,
    };

    let event = new CustomEvent('wallpaper-selector:onCropParamsChange', {detail});
    document.dispatchEvent(event);
  }


  getBgrStyles() {
    let style = {
      backgroundImage: `url('${this.props.mainImage}')`,
      transform: this.props.flipImage ? 'scaleX(-1)' : 'scaleX(1)',
    };

    if (this.props.imageFilter === 'b&w') {
      style.filter = 'grayscale(100%)';

    } else if (this.props.imageFilter === 'sepia') {
      style.filter = 'grayscale(100%) sepia(80%)';
    }

    if (this.props.patternSize) {
      const realImageWidthCm = this.props.patternSize;

      style.backgroundSize = ((realImageWidthCm / 200) * 100) + '%';
    } else {
      style.backgroundSize = '100%';
    }

    return style;
  }


  render() {
    const {locale, selectedWidth, selectedHeight, patternSize, showTiles, currentImage, isMainImage} = this.props;

    let patternImageStyles = {};

    if (!isMainImage) {
      patternImageStyles.backgroundImage = `url('${currentImage}')`;
    }

    return (
      <div className="PatternImage" style={patternImageStyles}>

        {!isMainImage && (
          <div className="PatternImage__foreground" style={{
            backgroundImage: `url('${currentImage}')`
          }}/>
        )}

        <div
          className="PatternImage__bgr"
          style={this.getBgrStyles()}>

          {patternSize && selectedWidth && this.imgRef.current
            ? (
              <OverlayContent
                locale={locale}
                overlayWidthPx={this.imgRef.current.width}
                showTiles={showTiles}
                selectedWidth={selectedWidth}
                selectedHeight={selectedHeight}
              />
            )
            : null}

          <img
            alt=""
            ref={this.imgRef}
            src={this.props.mainImage}
            className="PatternImage__img--hidden"/>
        </div>


      </div>
    )
  }

}