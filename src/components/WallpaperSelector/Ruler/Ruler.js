import React from 'react';
import './Ruler.css';

const STEPS_RESOLUTION = 10;


function roundNumber(no) {
  const number = no * STEPS_RESOLUTION;

  if (number.toString().includes('.')) {
    return Math.round(number * 10) / 10
  }

  return number;
}

export default function Ruler(props) {

  const {selectedWidth, selectedHeight, imgHeight, imgWidth, orientation} = props;

  let stepsNo = (orientation === 'horizontal' ? selectedWidth : selectedHeight) / STEPS_RESOLUTION;

  let stepsThreshold = Math.ceil(stepsNo / 10);
  let stepInPercent = 100 / stepsNo;
  let arr = [];

  for (let i = 0; i < stepsNo; ++i) {
    arr.push(i);
  }

  arr.push(stepsNo);

  let rulerStyles;

  if (orientation === 'horizontal') {
    rulerStyles = {
      width: imgWidth,
      left: `calc(50% - ${imgWidth / 2}px + 15px)`,
      top: `calc(50% + ${imgHeight / 2}px)`,
    };

  } else {
    rulerStyles = {
      height: imgHeight,
      top: `calc(50% - ${imgHeight / 2}px - 27px)`,
      right: `calc(50% + ${imgWidth / 2}px)`
    };


  }

  return (
    <div
      className={`Ruler Ruler--${orientation}`}
      style={rulerStyles}>
      <div>
        {orientation === 'horizontal' && (
          <div className="Ruler__cm">[cm]</div>
        )}
        {arr.map((i) => {

          const last = arr[arr.length - 1];
          const mod = last * STEPS_RESOLUTION % STEPS_RESOLUTION;
          const offset = i * stepInPercent;

          let showNumber = last === i
            ? true
            : i % stepsThreshold === 0;

          if (arr[arr.length - 2] === i && mod < 6 && mod > 0) {
            showNumber = false;
          }

          let unitStyles;

          if (orientation === 'horizontal') {
            unitStyles = {
              left: `${offset > 100 ? 100 : offset}%`,
              height: showNumber ? STEPS_RESOLUTION : 5,
              opacity: showNumber ? 1 : .5,
            };

          } else {
            unitStyles = {
              bottom: `${offset > 100 ? 100 : offset}%`,
              width: showNumber ? STEPS_RESOLUTION : 5,
              opacity: showNumber ? 1 : .5,
            };
          }


          return (
            <div
              key={i}
              className="Ruler__unit"
              style={unitStyles}>
              {showNumber && (
                <span>
                  {roundNumber(i)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}