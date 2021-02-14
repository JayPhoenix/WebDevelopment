import React from 'react';
import Tiles from "../Tiles/Tiles";

export default function CroppedImage(props) {
  const {overlayWidthPx, showTiles, selectedWidth, selectedHeight, croppedImage, imgStyles, locale} = props;

  return (
    <div className="WallpaperImage">

      {showTiles && (
        <div className="WallpaperImage__overlay">
          <Tiles
            locale={locale}
            overlayWidthPx={overlayWidthPx}
            selectedWidth={selectedWidth}
            selectedHeight={selectedHeight}/>
        </div>
      )}

      <img
        alt=""
        className="WallpaperImage__img"
        src={croppedImage}
        style={{
          ...imgStyles,
          width: overlayWidthPx
        }}/>

    </div>
  )
}