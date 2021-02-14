import React from 'react';
import Tiles, {MIN_TILE_WIDTH_PX} from "../Tiles/Tiles";
import {validateSizes} from "../../../functions/Validators";

export default function OverlayContent(props) {
  const {showTiles, showArrow, overlayWidthPx, selectedWidth, selectedHeight, locale} = props;

  if (selectedWidth && selectedHeight) {
    const errors = validateSizes(selectedWidth, selectedHeight, locale);

    if (errors.length) {

      const className = overlayWidthPx < MIN_TILE_WIDTH_PX * 2
        ? 'WallpaperImage__error WallpaperImage__error--vertical'
        : 'WallpaperImage__error';

      return (
        <div className={className}>
          <span>{errors.join(', ')}</span>
        </div>
      );
    }
  }

  if (showTiles) {
    return (
      <Tiles
        locale={locale}
        overlayWidthPx={overlayWidthPx}
        selectedWidth={selectedWidth}
        selectedHeight={selectedHeight}
      />
    );
  }

  if (showArrow) {
    return (
      <div className="WallpaperImage__overlay__content">
        <svg viewBox="0 0 512 512">
          <path
            d="M480 256l-96-96v76H276V128h76l-96-96-96 96h76v108H128v-76l-96 96 96 96v-76h108v108h-76l96 96 96-96h-76.2l-.4-108.5 108.6.3V352z"/>
        </svg>
      </div>
    );
  }

  return <React.Fragment/>
}