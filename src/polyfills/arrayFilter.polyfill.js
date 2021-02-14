/**
 * @see https://github.com/abdalla/ie-array-filter-polyfill-/blob/master/index.js
 */
(function () {
  if (!Array.prototype.filter) {
    Object.defineProperty(Array.prototype, 'filter', {
      value: function (predicate) {
        if (this == null) {
          throw new TypeError('this is null or not defined');
        }

        const obj = Object(this);
        const len = obj.length >>> 0;

        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }

        const thisArg = arguments[1];

        let res = [];

        let index = 0;
        while (index < len) {
          const iValue = obj[index];
          if (predicate.call(thisArg, iValue, index, obj)) {
            res.push(iValue);
          }
          index++;
        }


        return res;
      }
    });
  }
})();