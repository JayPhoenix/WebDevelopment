/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
 */
(function () {
  Number.isNaN = Number.isNaN || function (value) {
    return value !== value;
  };
})();