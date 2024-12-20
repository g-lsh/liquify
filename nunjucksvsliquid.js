(function () {
  'use strict';

  /*
   * liquidjs@10.19.0, https://github.com/harttle/liquidjs
   * (c) 2016-2024 harttle
   * Released under the MIT License.
   */
  class Token {
      constructor(kind, input, begin, end, file) {
          this.kind = kind;
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.file = file;
      }
      getText() {
          return this.input.slice(this.begin, this.end);
      }
      getPosition() {
          let [row, col] = [1, 1];
          for (let i = 0; i < this.begin; i++) {
              if (this.input[i] === '\n') {
                  row++;
                  col = 1;
              }
              else
                  col++;
          }
          return [row, col];
      }
      size() {
          return this.end - this.begin;
      }
  }

  class Drop {
      liquidMethodMissing(key) {
          return undefined;
      }
  }

  const toString$1 = Object.prototype.toString;
  const toLowerCase = String.prototype.toLowerCase;
  const hasOwnProperty = Object.hasOwnProperty;
  function isString(value) {
      return typeof value === 'string';
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  function isFunction(value) {
      return typeof value === 'function';
  }
  function isPromise(val) {
      return val && isFunction(val.then);
  }
  function isIterator(val) {
      return val && isFunction(val.next) && isFunction(val.throw) && isFunction(val.return);
  }
  function escapeRegex(str) {
      return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  function stringify(value) {
      value = toValue(value);
      if (isString(value))
          return value;
      if (isNil(value))
          return '';
      if (isArray(value))
          return value.map(x => stringify(x)).join('');
      return String(value);
  }
  function toEnumerable(val) {
      val = toValue(val);
      if (isArray(val))
          return val;
      if (isString(val) && val.length > 0)
          return [val];
      if (isIterable(val))
          return Array.from(val);
      if (isObject(val))
          return Object.keys(val).map((key) => [key, val[key]]);
      return [];
  }
  function toArray(val) {
      val = toValue(val);
      if (isNil(val))
          return [];
      if (isArray(val))
          return val;
      return [val];
  }
  function toValue(value) {
      return (value instanceof Drop && isFunction(value.valueOf)) ? value.valueOf() : value;
  }
  function toNumber(value) {
      value = Number(value);
      return isNaN(value) ? 0 : value;
  }
  function isNumber(value) {
      return typeof value === 'number';
  }
  function toLiquid(value) {
      if (value && isFunction(value.toLiquid))
          return toLiquid(value.toLiquid());
      return value;
  }
  function isNil(value) {
      return value == null;
  }
  function isUndefined(value) {
      return value === undefined;
  }
  function isArray(value) {
      // be compatible with IE 8
      return toString$1.call(value) === '[object Array]';
  }
  function isIterable(value) {
      return isObject(value) && Symbol.iterator in value;
  }
  /*
   * Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property.
   * The iteratee is invoked with three arguments: (value, key, object).
   * Iteratee functions may exit iteration early by explicitly returning false.
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @return {Object} Returns object.
   */
  function forOwn(obj, iteratee) {
      obj = obj || {};
      for (const k in obj) {
          if (hasOwnProperty.call(obj, k)) {
              if (iteratee(obj[k], k, obj) === false)
                  break;
          }
      }
      return obj;
  }
  function last(arr) {
      return arr[arr.length - 1];
  }
  /*
   * Checks if value is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, new Number(0), and new String(''))
   * @param {any} value The value to check.
   * @return {Boolean} Returns true if value is an object, else false.
   */
  function isObject(value) {
      const type = typeof value;
      return value !== null && (type === 'object' || type === 'function');
  }
  function range(start, stop, step = 1) {
      const arr = [];
      for (let i = start; i < stop; i += step) {
          arr.push(i);
      }
      return arr;
  }
  function padStart(str, length, ch = ' ') {
      return pad(str, length, ch, (str, ch) => ch + str);
  }
  function padEnd(str, length, ch = ' ') {
      return pad(str, length, ch, (str, ch) => str + ch);
  }
  function pad(str, length, ch, add) {
      str = String(str);
      let n = length - str.length;
      while (n-- > 0)
          str = add(str, ch);
      return str;
  }
  function identify(val) {
      return val;
  }
  function changeCase(str) {
      const hasLowerCase = [...str].some(ch => ch >= 'a' && ch <= 'z');
      return hasLowerCase ? str.toUpperCase() : str.toLowerCase();
  }
  function ellipsis(str, N) {
      return str.length > N ? str.slice(0, N - 3) + '...' : str;
  }
  // compare string in case-insensitive way, undefined values to the tail
  function caseInsensitiveCompare(a, b) {
      if (a == null && b == null)
          return 0;
      if (a == null)
          return 1;
      if (b == null)
          return -1;
      a = toLowerCase.call(a);
      b = toLowerCase.call(b);
      if (a < b)
          return -1;
      if (a > b)
          return 1;
      return 0;
  }
  function argumentsToValue(fn) {
      return function (...args) { return fn.call(this, ...args.map(toValue)); };
  }
  function escapeRegExp(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  /**
   * targeting ES5, extends Error won't create a proper prototype chain, need a trait to keep track of classes
   */
  const TRAIT = '__liquidClass__';
  class LiquidError extends Error {
      constructor(err, token) {
          /**
           * note: for ES5 targeting, `this` will be replaced by return value of Error(),
           * thus everything on `this` will be lost, avoid calling `LiquidError` methods here
           */
          super(typeof err === 'string' ? err : err.message);
          this.context = '';
          if (typeof err !== 'string')
              Object.defineProperty(this, 'originalError', { value: err, enumerable: false });
          Object.defineProperty(this, 'token', { value: token, enumerable: false });
          Object.defineProperty(this, TRAIT, { value: 'LiquidError', enumerable: false });
      }
      update() {
          Object.defineProperty(this, 'context', { value: mkContext(this.token), enumerable: false });
          this.message = mkMessage(this.message, this.token);
          this.stack = this.message + '\n' + this.context +
              '\n' + this.stack;
          if (this.originalError)
              this.stack += '\nFrom ' + this.originalError.stack;
      }
      static is(obj) {
          return (obj === null || obj === void 0 ? void 0 : obj[TRAIT]) === 'LiquidError';
      }
  }
  class TokenizationError extends LiquidError {
      constructor(message, token) {
          super(message, token);
          this.name = 'TokenizationError';
          super.update();
      }
  }
  class ParseError extends LiquidError {
      constructor(err, token) {
          super(err, token);
          this.name = 'ParseError';
          this.message = err.message;
          super.update();
      }
  }
  class RenderError extends LiquidError {
      constructor(err, tpl) {
          super(err, tpl.token);
          this.name = 'RenderError';
          this.message = err.message;
          super.update();
      }
      static is(obj) {
          return obj.name === 'RenderError';
      }
  }
  class LiquidErrors extends LiquidError {
      constructor(errors) {
          super(errors[0], errors[0].token);
          this.errors = errors;
          this.name = 'LiquidErrors';
          const s = errors.length > 1 ? 's' : '';
          this.message = `${errors.length} error${s} found`;
          super.update();
      }
      static is(obj) {
          return obj.name === 'LiquidErrors';
      }
  }
  class UndefinedVariableError extends LiquidError {
      constructor(err, token) {
          super(err, token);
          this.name = 'UndefinedVariableError';
          this.message = err.message;
          super.update();
      }
  }
  // only used internally; raised where we don't have token information,
  // so it can't be an UndefinedVariableError.
  class InternalUndefinedVariableError extends Error {
      constructor(variableName) {
          super(`undefined variable: ${variableName}`);
          this.name = 'InternalUndefinedVariableError';
          this.variableName = variableName;
      }
  }
  class AssertionError extends Error {
      constructor(message) {
          super(message);
          this.name = 'AssertionError';
          this.message = message + '';
      }
  }
  function mkContext(token) {
      const [line, col] = token.getPosition();
      const lines = token.input.split('\n');
      const begin = Math.max(line - 2, 1);
      const end = Math.min(line + 3, lines.length);
      const context = range(begin, end + 1)
          .map(lineNumber => {
          const rowIndicator = (lineNumber === line) ? '>> ' : '   ';
          const num = padStart(String(lineNumber), String(end).length);
          let text = `${rowIndicator}${num}| `;
          const colIndicator = lineNumber === line
              ? '\n' + padStart('^', col + text.length)
              : '';
          text += lines[lineNumber - 1];
          text += colIndicator;
          return text;
      })
          .join('\n');
      return context;
  }
  function mkMessage(msg, token) {
      if (token.file)
          msg += `, file:${token.file}`;
      const [line, col] = token.getPosition();
      msg += `, line:${line}, col:${col}`;
      return msg;
  }

  // **DO NOT CHANGE THIS FILE**
  //
  // This file is generated by bin/character-gen.js
  // bitmask character types to boost performance
  const TYPES = [0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 4, 4, 4, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 8, 0, 0, 0, 0, 8, 0, 0, 0, 64, 0, 65, 0, 0, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 0, 0, 2, 2, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
  const WORD = 1;
  const BLANK = 4;
  const QUOTE = 8;
  const INLINE_BLANK = 16;
  const NUMBER = 32;
  const SIGN = 64;
  const PUNCTUATION = 128;
  function isWord(char) {
      const code = char.charCodeAt(0);
      return code >= 128 ? !TYPES[code] : !!(TYPES[code] & WORD);
  }
  TYPES[160] = TYPES[5760] = TYPES[6158] = TYPES[8192] = TYPES[8193] = TYPES[8194] = TYPES[8195] = TYPES[8196] = TYPES[8197] = TYPES[8198] = TYPES[8199] = TYPES[8200] = TYPES[8201] = TYPES[8202] = TYPES[8232] = TYPES[8233] = TYPES[8239] = TYPES[8287] = TYPES[12288] = BLANK;
  TYPES[8220] = TYPES[8221] = PUNCTUATION;

  function assert(predicate, message) {
      if (!predicate) {
          const msg = typeof message === 'function'
              ? message()
              : (message || `expect ${predicate} to be true`);
          throw new AssertionError(msg);
      }
  }
  function assertEmpty(predicate, message = `unexpected ${JSON.stringify(predicate)}`) {
      assert(!predicate, message);
  }

  class NullDrop extends Drop {
      equals(value) {
          return isNil(toValue(value));
      }
      gt() {
          return false;
      }
      geq() {
          return false;
      }
      lt() {
          return false;
      }
      leq() {
          return false;
      }
      valueOf() {
          return null;
      }
  }

  class EmptyDrop extends Drop {
      equals(value) {
          if (value instanceof EmptyDrop)
              return false;
          value = toValue(value);
          if (isString(value) || isArray(value))
              return value.length === 0;
          if (isObject(value))
              return Object.keys(value).length === 0;
          return false;
      }
      gt() {
          return false;
      }
      geq() {
          return false;
      }
      lt() {
          return false;
      }
      leq() {
          return false;
      }
      valueOf() {
          return '';
      }
      static is(value) {
          return value instanceof EmptyDrop;
      }
  }

  class BlankDrop extends EmptyDrop {
      equals(value) {
          if (value === false)
              return true;
          if (isNil(toValue(value)))
              return true;
          if (isString(value))
              return /^\s*$/.test(value);
          return super.equals(value);
      }
      static is(value) {
          return value instanceof BlankDrop;
      }
  }

  class ForloopDrop extends Drop {
      constructor(length, collection, variable) {
          super();
          this.i = 0;
          this.length = length;
          this.name = `${variable}-${collection}`;
      }
      next() {
          this.i++;
      }
      index0() {
          return this.i;
      }
      index() {
          return this.i + 1;
      }
      first() {
          return this.i === 0;
      }
      last() {
          return this.i === this.length - 1;
      }
      rindex() {
          return this.length - this.i;
      }
      rindex0() {
          return this.length - this.i - 1;
      }
      valueOf() {
          return JSON.stringify(this);
      }
  }

  class BlockDrop extends Drop {
      constructor(
      // the block render from layout template
      superBlockRender = () => '') {
          super();
          this.superBlockRender = superBlockRender;
      }
      /**
       * Provide parent access in child block by
       * {{ block.super }}
       */
      super() {
          return this.superBlockRender();
      }
  }

  function isComparable(arg) {
      return (arg &&
          isFunction(arg.equals) &&
          isFunction(arg.gt) &&
          isFunction(arg.geq) &&
          isFunction(arg.lt) &&
          isFunction(arg.leq));
  }

  const nil = new NullDrop();
  const literalValues = {
      'true': true,
      'false': false,
      'nil': nil,
      'null': nil,
      'empty': new EmptyDrop(),
      'blank': new BlankDrop()
  };

  function createTrie(input) {
      const trie = {};
      for (const [name, data] of Object.entries(input)) {
          let node = trie;
          for (let i = 0; i < name.length; i++) {
              const c = name[i];
              node[c] = node[c] || {};
              if (i === name.length - 1 && isWord(name[i])) {
                  node[c].needBoundary = true;
              }
              node = node[c];
          }
          node.data = data;
          node.end = true;
      }
      return trie;
  }

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  // convert an async iterator to a Promise
  function toPromise(val) {
      return __awaiter(this, void 0, void 0, function* () {
          if (!isIterator(val))
              return val;
          let value;
          let done = false;
          let next = 'next';
          do {
              const state = val[next](value);
              done = state.done;
              value = state.value;
              next = 'next';
              try {
                  if (isIterator(value))
                      value = toPromise(value);
                  if (isPromise(value))
                      value = yield value;
              }
              catch (err) {
                  next = 'throw';
                  value = err;
              }
          } while (!done);
          return value;
      });
  }
  // convert an async iterator to a value in a synchronous manner
  function toValueSync(val) {
      if (!isIterator(val))
          return val;
      let value;
      let done = false;
      let next = 'next';
      do {
          const state = val[next](value);
          done = state.done;
          value = state.value;
          next = 'next';
          if (isIterator(value)) {
              try {
                  value = toValueSync(value);
              }
              catch (err) {
                  next = 'throw';
                  value = err;
              }
          }
      } while (!done);
      return value;
  }

  const rFormat = /%([-_0^#:]+)?(\d+)?([EO])?(.)/;
  // prototype extensions
  function daysInMonth(d) {
      const feb = isLeapYear(d) ? 29 : 28;
      return [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }
  function getDayOfYear(d) {
      let num = 0;
      for (let i = 0; i < d.getMonth(); ++i) {
          num += daysInMonth(d)[i];
      }
      return num + d.getDate();
  }
  function getWeekOfYear(d, startDay) {
      // Skip to startDay of this week
      const now = getDayOfYear(d) + (startDay - d.getDay());
      // Find the first startDay of the year
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const then = (7 - jan1.getDay() + startDay);
      return String(Math.floor((now - then) / 7) + 1);
  }
  function isLeapYear(d) {
      const year = d.getFullYear();
      return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
  }
  function ordinal(d) {
      const date = d.getDate();
      if ([11, 12, 13].includes(date))
          return 'th';
      switch (date % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
      }
  }
  function century(d) {
      return parseInt(d.getFullYear().toString().substring(0, 2), 10);
  }
  // default to 0
  const padWidths = {
      d: 2,
      e: 2,
      H: 2,
      I: 2,
      j: 3,
      k: 2,
      l: 2,
      L: 3,
      m: 2,
      M: 2,
      S: 2,
      U: 2,
      W: 2
  };
  const padSpaceChars = new Set('aAbBceklpP');
  function getTimezoneOffset(d, opts) {
      const nOffset = Math.abs(d.getTimezoneOffset());
      const h = Math.floor(nOffset / 60);
      const m = nOffset % 60;
      return (d.getTimezoneOffset() > 0 ? '-' : '+') +
          padStart(h, 2, '0') +
          (opts.flags[':'] ? ':' : '') +
          padStart(m, 2, '0');
  }
  const formatCodes = {
      a: (d) => d.getShortWeekdayName(),
      A: (d) => d.getLongWeekdayName(),
      b: (d) => d.getShortMonthName(),
      B: (d) => d.getLongMonthName(),
      c: (d) => d.toLocaleString(),
      C: (d) => century(d),
      d: (d) => d.getDate(),
      e: (d) => d.getDate(),
      H: (d) => d.getHours(),
      I: (d) => String(d.getHours() % 12 || 12),
      j: (d) => getDayOfYear(d),
      k: (d) => d.getHours(),
      l: (d) => String(d.getHours() % 12 || 12),
      L: (d) => d.getMilliseconds(),
      m: (d) => d.getMonth() + 1,
      M: (d) => d.getMinutes(),
      N: (d, opts) => {
          const width = Number(opts.width) || 9;
          const str = String(d.getMilliseconds()).slice(0, width);
          return padEnd(str, width, '0');
      },
      p: (d) => (d.getHours() < 12 ? 'AM' : 'PM'),
      P: (d) => (d.getHours() < 12 ? 'am' : 'pm'),
      q: (d) => ordinal(d),
      s: (d) => Math.round(d.getTime() / 1000),
      S: (d) => d.getSeconds(),
      u: (d) => d.getDay() || 7,
      U: (d) => getWeekOfYear(d, 0),
      w: (d) => d.getDay(),
      W: (d) => getWeekOfYear(d, 1),
      x: (d) => d.toLocaleDateString(),
      X: (d) => d.toLocaleTimeString(),
      y: (d) => d.getFullYear().toString().slice(2, 4),
      Y: (d) => d.getFullYear(),
      z: getTimezoneOffset,
      Z: (d, opts) => d.getTimeZoneName() || getTimezoneOffset(d, opts),
      't': () => '\t',
      'n': () => '\n',
      '%': () => '%'
  };
  formatCodes.h = formatCodes.b;
  function strftime(d, formatStr) {
      let output = '';
      let remaining = formatStr;
      let match;
      while ((match = rFormat.exec(remaining))) {
          output += remaining.slice(0, match.index);
          remaining = remaining.slice(match.index + match[0].length);
          output += format(d, match);
      }
      return output + remaining;
  }
  function format(d, match) {
      const [input, flagStr = '', width, modifier, conversion] = match;
      const convert = formatCodes[conversion];
      if (!convert)
          return input;
      const flags = {};
      for (const flag of flagStr)
          flags[flag] = true;
      let ret = String(convert(d, { flags, width, modifier }));
      let padChar = padSpaceChars.has(conversion) ? ' ' : '0';
      let padWidth = width || padWidths[conversion] || 0;
      if (flags['^'])
          ret = ret.toUpperCase();
      else if (flags['#'])
          ret = changeCase(ret);
      if (flags['_'])
          padChar = ' ';
      else if (flags['0'])
          padChar = '0';
      if (flags['-'])
          padWidth = 0;
      return padStart(ret, padWidth, padChar);
  }

  function getDateTimeFormat() {
      return (typeof Intl !== 'undefined' ? Intl.DateTimeFormat : undefined);
  }

  // one minute in milliseconds
  const OneMinute = 60000;
  const ISO8601_TIMEZONE_PATTERN = /([zZ]|([+-])(\d{2}):(\d{2}))$/;
  const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
  ];
  const monthNamesShort = monthNames.map(name => name.slice(0, 3));
  const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const dayNamesShort = dayNames.map(name => name.slice(0, 3));
  /**
   * A date implementation with timezone info, just like Ruby date
   *
   * Implementation:
   * - create a Date offset by it's timezone difference, avoiding overriding a bunch of methods
   * - rewrite getTimezoneOffset() to trick strftime
   */
  class LiquidDate {
      constructor(init, locale, timezone) {
          this.locale = locale;
          this.DateTimeFormat = getDateTimeFormat();
          this.date = new Date(init);
          this.timezoneFixed = timezone !== undefined;
          if (timezone === undefined) {
              timezone = this.date.getTimezoneOffset();
          }
          this.timezoneOffset = isString(timezone) ? LiquidDate.getTimezoneOffset(timezone, this.date) : timezone;
          this.timezoneName = isString(timezone) ? timezone : '';
          const diff = (this.date.getTimezoneOffset() - this.timezoneOffset) * OneMinute;
          const time = this.date.getTime() + diff;
          this.displayDate = new Date(time);
      }
      getTime() {
          return this.displayDate.getTime();
      }
      getMilliseconds() {
          return this.displayDate.getMilliseconds();
      }
      getSeconds() {
          return this.displayDate.getSeconds();
      }
      getMinutes() {
          return this.displayDate.getMinutes();
      }
      getHours() {
          return this.displayDate.getHours();
      }
      getDay() {
          return this.displayDate.getDay();
      }
      getDate() {
          return this.displayDate.getDate();
      }
      getMonth() {
          return this.displayDate.getMonth();
      }
      getFullYear() {
          return this.displayDate.getFullYear();
      }
      toLocaleString(locale, init) {
          if (init === null || init === void 0 ? void 0 : init.timeZone) {
              return this.date.toLocaleString(locale, init);
          }
          return this.displayDate.toLocaleString(locale, init);
      }
      toLocaleTimeString(locale) {
          return this.displayDate.toLocaleTimeString(locale);
      }
      toLocaleDateString(locale) {
          return this.displayDate.toLocaleDateString(locale);
      }
      getTimezoneOffset() {
          return this.timezoneOffset;
      }
      getTimeZoneName() {
          if (this.timezoneFixed)
              return this.timezoneName;
          if (!this.DateTimeFormat)
              return;
          return this.DateTimeFormat().resolvedOptions().timeZone;
      }
      getLongMonthName() {
          var _a;
          return (_a = this.format({ month: 'long' })) !== null && _a !== void 0 ? _a : monthNames[this.getMonth()];
      }
      getShortMonthName() {
          var _a;
          return (_a = this.format({ month: 'short' })) !== null && _a !== void 0 ? _a : monthNamesShort[this.getMonth()];
      }
      getLongWeekdayName() {
          var _a;
          return (_a = this.format({ weekday: 'long' })) !== null && _a !== void 0 ? _a : dayNames[this.displayDate.getDay()];
      }
      getShortWeekdayName() {
          var _a;
          return (_a = this.format({ weekday: 'short' })) !== null && _a !== void 0 ? _a : dayNamesShort[this.displayDate.getDay()];
      }
      valid() {
          return !isNaN(this.getTime());
      }
      format(options) {
          return this.DateTimeFormat && this.DateTimeFormat(this.locale, options).format(this.displayDate);
      }
      /**
       * Create a Date object fixed to it's declared Timezone. Both
       * - 2021-08-06T02:29:00.000Z and
       * - 2021-08-06T02:29:00.000+08:00
       * will always be displayed as
       * - 2021-08-06 02:29:00
       * regardless timezoneOffset in JavaScript realm
       *
       * The implementation hack:
       * Instead of calling `.getMonth()`/`.getUTCMonth()` respect to `preserveTimezones`,
       * we create a different Date to trick strftime, it's both simpler and more performant.
       * Given that a template is expected to be parsed fewer times than rendered.
       */
      static createDateFixedToTimezone(dateString, locale) {
          const m = dateString.match(ISO8601_TIMEZONE_PATTERN);
          // representing a UTC timestamp
          if (m && m[1] === 'Z') {
              return new LiquidDate(+new Date(dateString), locale, 0);
          }
          // has a timezone specified
          if (m && m[2] && m[3] && m[4]) {
              const [, , sign, hours, minutes] = m;
              const offset = (sign === '+' ? -1 : 1) * (parseInt(hours, 10) * 60 + parseInt(minutes, 10));
              return new LiquidDate(+new Date(dateString), locale, offset);
          }
          return new LiquidDate(dateString, locale);
      }
      static getTimezoneOffset(timezoneName, date) {
          const localDateString = date.toLocaleString('en-US', { timeZone: timezoneName });
          const utcDateString = date.toLocaleString('en-US', { timeZone: 'UTC' });
          const localDate = new Date(localDateString);
          const utcDate = new Date(utcDateString);
          return (+utcDate - +localDate) / (60 * 1000);
      }
  }

  class Limiter {
      constructor(resource, limit) {
          this.base = 0;
          this.message = `${resource} limit exceeded`;
          this.limit = limit;
      }
      use(count) {
          count = toNumber(count);
          assert(this.base + count <= this.limit, this.message);
          this.base += count;
      }
      check(count) {
          count = toNumber(count);
          assert(count <= this.limit, this.message);
      }
  }

  class DelimitedToken extends Token {
      constructor(kind, [contentBegin, contentEnd], input, begin, end, trimLeft, trimRight, file) {
          super(kind, input, begin, end, file);
          this.trimLeft = false;
          this.trimRight = false;
          const tl = input[contentBegin] === '-';
          const tr = input[contentEnd - 1] === '-';
          let l = tl ? contentBegin + 1 : contentBegin;
          let r = tr ? contentEnd - 1 : contentEnd;
          while (l < r && (TYPES[input.charCodeAt(l)] & BLANK))
              l++;
          while (r > l && (TYPES[input.charCodeAt(r - 1)] & BLANK))
              r--;
          this.contentRange = [l, r];
          this.trimLeft = tl || trimLeft;
          this.trimRight = tr || trimRight;
      }
      get content() {
          return this.input.slice(this.contentRange[0], this.contentRange[1]);
      }
  }

  class TagToken extends DelimitedToken {
      constructor(input, begin, end, options, file) {
          const { trimTagLeft, trimTagRight, tagDelimiterLeft, tagDelimiterRight } = options;
          const [valueBegin, valueEnd] = [begin + tagDelimiterLeft.length, end - tagDelimiterRight.length];
          super(TokenKind.Tag, [valueBegin, valueEnd], input, begin, end, trimTagLeft, trimTagRight, file);
          this.tokenizer = new Tokenizer(input, options.operators, file, this.contentRange);
          this.name = this.tokenizer.readTagName();
          this.tokenizer.assert(this.name, `illegal tag syntax, tag name expected`);
          this.tokenizer.skipBlank();
      }
      get args() {
          return this.tokenizer.input.slice(this.tokenizer.p, this.contentRange[1]);
      }
  }

  class OutputToken extends DelimitedToken {
      constructor(input, begin, end, options, file) {
          const { trimOutputLeft, trimOutputRight, outputDelimiterLeft, outputDelimiterRight } = options;
          const valueRange = [begin + outputDelimiterLeft.length, end - outputDelimiterRight.length];
          super(TokenKind.Output, valueRange, input, begin, end, trimOutputLeft, trimOutputRight, file);
      }
  }

  class HTMLToken extends Token {
      constructor(input, begin, end, file) {
          super(TokenKind.HTML, input, begin, end, file);
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.file = file;
          this.trimLeft = 0;
          this.trimRight = 0;
      }
      getContent() {
          return this.input.slice(this.begin + this.trimLeft, this.end - this.trimRight);
      }
  }

  class NumberToken extends Token {
      constructor(input, begin, end, file) {
          super(TokenKind.Number, input, begin, end, file);
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.file = file;
          this.content = Number(this.getText());
      }
  }

  class IdentifierToken extends Token {
      constructor(input, begin, end, file) {
          super(TokenKind.Word, input, begin, end, file);
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.file = file;
          this.content = this.getText();
      }
  }

  class LiteralToken extends Token {
      constructor(input, begin, end, file) {
          super(TokenKind.Literal, input, begin, end, file);
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.file = file;
          this.literal = this.getText();
          this.content = literalValues[this.literal];
      }
  }

  const operatorPrecedences = {
      '==': 2,
      '!=': 2,
      '>': 2,
      '<': 2,
      '>=': 2,
      '<=': 2,
      'contains': 2,
      'not': 1,
      'and': 0,
      'or': 0
  };
  const operatorTypes = {
      '==': 0 /* OperatorType.Binary */,
      '!=': 0 /* OperatorType.Binary */,
      '>': 0 /* OperatorType.Binary */,
      '<': 0 /* OperatorType.Binary */,
      '>=': 0 /* OperatorType.Binary */,
      '<=': 0 /* OperatorType.Binary */,
      'contains': 0 /* OperatorType.Binary */,
      'not': 1 /* OperatorType.Unary */,
      'and': 0 /* OperatorType.Binary */,
      'or': 0 /* OperatorType.Binary */
  };
  class OperatorToken extends Token {
      constructor(input, begin, end, file) {
          super(TokenKind.Operator, input, begin, end, file);
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.file = file;
          this.operator = this.getText();
      }
      getPrecedence() {
          const key = this.getText();
          return key in operatorPrecedences ? operatorPrecedences[key] : 1;
      }
  }

  class PropertyAccessToken extends Token {
      constructor(variable, props, input, begin, end, file) {
          super(TokenKind.PropertyAccess, input, begin, end, file);
          this.variable = variable;
          this.props = props;
      }
  }

  class FilterToken extends Token {
      constructor(name, args, input, begin, end, file) {
          super(TokenKind.Filter, input, begin, end, file);
          this.name = name;
          this.args = args;
      }
  }

  class HashToken extends Token {
      constructor(input, begin, end, name, value, file) {
          super(TokenKind.Hash, input, begin, end, file);
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.name = name;
          this.value = value;
          this.file = file;
      }
  }

  const rHex = /[\da-fA-F]/;
  const rOct = /[0-7]/;
  const escapeChar = {
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
      v: '\x0B'
  };
  function hexVal(c) {
      const code = c.charCodeAt(0);
      if (code >= 97)
          return code - 87;
      if (code >= 65)
          return code - 55;
      return code - 48;
  }
  function parseStringLiteral(str) {
      let ret = '';
      for (let i = 1; i < str.length - 1; i++) {
          if (str[i] !== '\\') {
              ret += str[i];
              continue;
          }
          if (escapeChar[str[i + 1]] !== undefined) {
              ret += escapeChar[str[++i]];
          }
          else if (str[i + 1] === 'u') {
              let val = 0;
              let j = i + 2;
              while (j <= i + 5 && rHex.test(str[j])) {
                  val = val * 16 + hexVal(str[j++]);
              }
              i = j - 1;
              ret += String.fromCharCode(val);
          }
          else if (!rOct.test(str[i + 1])) {
              ret += str[++i];
          }
          else {
              let j = i + 1;
              let val = 0;
              while (j <= i + 3 && rOct.test(str[j])) {
                  val = val * 8 + hexVal(str[j++]);
              }
              i = j - 1;
              ret += String.fromCharCode(val);
          }
      }
      return ret;
  }

  class QuotedToken extends Token {
      constructor(input, begin, end, file) {
          super(TokenKind.Quoted, input, begin, end, file);
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.file = file;
          this.content = parseStringLiteral(this.getText());
      }
  }

  class RangeToken extends Token {
      constructor(input, begin, end, lhs, rhs, file) {
          super(TokenKind.Range, input, begin, end, file);
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.lhs = lhs;
          this.rhs = rhs;
          this.file = file;
      }
  }

  /**
   * LiquidTagToken is different from TagToken by not having delimiters `{%` or `%}`
   */
  class LiquidTagToken extends DelimitedToken {
      constructor(input, begin, end, options, file) {
          super(TokenKind.Tag, [begin, end], input, begin, end, false, false, file);
          this.tokenizer = new Tokenizer(input, options.operators, file, this.contentRange);
          this.name = this.tokenizer.readTagName();
          this.tokenizer.assert(this.name, 'illegal liquid tag syntax');
          this.tokenizer.skipBlank();
          this.args = this.tokenizer.remaining();
      }
  }

  /**
   * value expression with optional filters
   * e.g.
   * {% assign foo="bar" | append: "coo" %}
   */
  class FilteredValueToken extends Token {
      constructor(initial, filters, input, begin, end, file) {
          super(TokenKind.FilteredValue, input, begin, end, file);
          this.initial = initial;
          this.filters = filters;
          this.input = input;
          this.begin = begin;
          this.end = end;
          this.file = file;
      }
  }

  const polyfill = {
      now: () => Date.now()
  };
  function getPerformance() {
      return (typeof global === 'object' && global.performance) ||
          (typeof window === 'object' && window.performance) ||
          polyfill;
  }

  class SimpleEmitter {
      constructor() {
          this.buffer = '';
      }
      write(html) {
          this.buffer += stringify(html);
      }
  }

  class StreamedEmitter {
      constructor() {
          this.buffer = '';
          this.stream = null;
          throw new Error('streaming not supported in browser');
      }
  }

  class KeepingTypeEmitter {
      constructor() {
          this.buffer = '';
      }
      write(html) {
          html = toValue(html);
          // This will only preserve the type if the value is isolated.
          // I.E:
          // {{ my-port }} -> 42
          // {{ my-host }}:{{ my-port }} -> 'host:42'
          if (typeof html !== 'string' && this.buffer === '') {
              this.buffer = html;
          }
          else {
              this.buffer = stringify(this.buffer) + stringify(html);
          }
      }
  }

  class Render {
      renderTemplatesToNodeStream(templates, ctx) {
          const emitter = new StreamedEmitter();
          Promise.resolve().then(() => toPromise(this.renderTemplates(templates, ctx, emitter)))
              .then(() => emitter.end(), err => emitter.error(err));
          return emitter.stream;
      }
      *renderTemplates(templates, ctx, emitter) {
          if (!emitter) {
              emitter = ctx.opts.keepOutputType ? new KeepingTypeEmitter() : new SimpleEmitter();
          }
          const errors = [];
          for (const tpl of templates) {
              ctx.renderLimit.check(getPerformance().now());
              try {
                  // if tpl.render supports emitter, it'll return empty `html`
                  const html = yield tpl.render(ctx, emitter);
                  // if not, it'll return an `html`, write to the emitter for it
                  html && emitter.write(html);
                  if (emitter['break'] || emitter['continue'])
                      break;
              }
              catch (e) {
                  const err = LiquidError.is(e) ? e : new RenderError(e, tpl);
                  if (ctx.opts.catchAllErrors)
                      errors.push(err);
                  else
                      throw err;
              }
          }
          if (errors.length) {
              throw new LiquidErrors(errors);
          }
          return emitter.buffer;
      }
  }

  class Expression {
      constructor(tokens) {
          this.postfix = [...toPostfix(tokens)];
      }
      *evaluate(ctx, lenient) {
          assert(ctx, 'unable to evaluate: context not defined');
          const operands = [];
          for (const token of this.postfix) {
              if (isOperatorToken(token)) {
                  const r = operands.pop();
                  let result;
                  if (operatorTypes[token.operator] === 1 /* OperatorType.Unary */) {
                      result = yield ctx.opts.operators[token.operator](r, ctx);
                  }
                  else {
                      const l = operands.pop();
                      result = yield ctx.opts.operators[token.operator](l, r, ctx);
                  }
                  operands.push(result);
              }
              else {
                  operands.push(yield evalToken(token, ctx, lenient));
              }
          }
          return operands[0];
      }
      valid() {
          return !!this.postfix.length;
      }
  }
  function* evalToken(token, ctx, lenient = false) {
      if (!token)
          return;
      if ('content' in token)
          return token.content;
      if (isPropertyAccessToken(token))
          return yield evalPropertyAccessToken(token, ctx, lenient);
      if (isRangeToken(token))
          return yield evalRangeToken(token, ctx);
  }
  function* evalPropertyAccessToken(token, ctx, lenient) {
      const props = [];
      for (const prop of token.props) {
          props.push((yield evalToken(prop, ctx, false)));
      }
      try {
          if (token.variable) {
              const variable = yield evalToken(token.variable, ctx, lenient);
              return yield ctx._getFromScope(variable, props);
          }
          else {
              return yield ctx._get(props);
          }
      }
      catch (e) {
          if (lenient && e.name === 'InternalUndefinedVariableError')
              return null;
          throw (new UndefinedVariableError(e, token));
      }
  }
  function evalQuotedToken(token) {
      return token.content;
  }
  function* evalRangeToken(token, ctx) {
      const low = yield evalToken(token.lhs, ctx);
      const high = yield evalToken(token.rhs, ctx);
      return range(+low, +high + 1);
  }
  function* toPostfix(tokens) {
      const ops = [];
      for (const token of tokens) {
          if (isOperatorToken(token)) {
              while (ops.length && ops[ops.length - 1].getPrecedence() > token.getPrecedence()) {
                  yield ops.pop();
              }
              ops.push(token);
          }
          else
              yield token;
      }
      while (ops.length) {
          yield ops.pop();
      }
  }

  function isTruthy(val, ctx) {
      return !isFalsy(val, ctx);
  }
  function isFalsy(val, ctx) {
      val = toValue(val);
      if (ctx.opts.jsTruthy) {
          return !val;
      }
      else {
          return val === false || undefined === val || val === null;
      }
  }

  const defaultOperators = {
      '==': equals,
      '!=': (l, r) => !equals(l, r),
      '>': (l, r) => {
          if (isComparable(l))
              return l.gt(r);
          if (isComparable(r))
              return r.lt(l);
          return toValue(l) > toValue(r);
      },
      '<': (l, r) => {
          if (isComparable(l))
              return l.lt(r);
          if (isComparable(r))
              return r.gt(l);
          return toValue(l) < toValue(r);
      },
      '>=': (l, r) => {
          if (isComparable(l))
              return l.geq(r);
          if (isComparable(r))
              return r.leq(l);
          return toValue(l) >= toValue(r);
      },
      '<=': (l, r) => {
          if (isComparable(l))
              return l.leq(r);
          if (isComparable(r))
              return r.geq(l);
          return toValue(l) <= toValue(r);
      },
      'contains': (l, r) => {
          l = toValue(l);
          if (isArray(l))
              return l.some((i) => equals(i, r));
          if (isFunction(l === null || l === void 0 ? void 0 : l.indexOf))
              return l.indexOf(toValue(r)) > -1;
          return false;
      },
      'not': (v, ctx) => isFalsy(toValue(v), ctx),
      'and': (l, r, ctx) => isTruthy(toValue(l), ctx) && isTruthy(toValue(r), ctx),
      'or': (l, r, ctx) => isTruthy(toValue(l), ctx) || isTruthy(toValue(r), ctx)
  };
  function equals(lhs, rhs) {
      if (isComparable(lhs))
          return lhs.equals(rhs);
      if (isComparable(rhs))
          return rhs.equals(lhs);
      lhs = toValue(lhs);
      rhs = toValue(rhs);
      if (isArray(lhs)) {
          return isArray(rhs) && arrayEquals(lhs, rhs);
      }
      return lhs === rhs;
  }
  function arrayEquals(lhs, rhs) {
      if (lhs.length !== rhs.length)
          return false;
      return !lhs.some((value, i) => !equals(value, rhs[i]));
  }
  function arrayIncludes(arr, item) {
      return arr.some(value => equals(value, item));
  }

  class Node {
      constructor(key, value, next, prev) {
          this.key = key;
          this.value = value;
          this.next = next;
          this.prev = prev;
      }
  }
  class LRU {
      constructor(limit, size = 0) {
          this.limit = limit;
          this.size = size;
          this.cache = {};
          this.head = new Node('HEAD', null, null, null);
          this.tail = new Node('TAIL', null, null, null);
          this.head.next = this.tail;
          this.tail.prev = this.head;
      }
      write(key, value) {
          if (this.cache[key]) {
              this.cache[key].value = value;
          }
          else {
              const node = new Node(key, value, this.head.next, this.head);
              this.head.next.prev = node;
              this.head.next = node;
              this.cache[key] = node;
              this.size++;
              this.ensureLimit();
          }
      }
      read(key) {
          if (!this.cache[key])
              return;
          const { value } = this.cache[key];
          this.remove(key);
          this.write(key, value);
          return value;
      }
      remove(key) {
          const node = this.cache[key];
          node.prev.next = node.next;
          node.next.prev = node.prev;
          delete this.cache[key];
          this.size--;
      }
      clear() {
          this.head.next = this.tail;
          this.tail.prev = this.head;
          this.size = 0;
          this.cache = {};
      }
      ensureLimit() {
          if (this.size > this.limit)
              this.remove(this.tail.prev.key);
      }
  }

  function domResolve(root, path) {
      const base = document.createElement('base');
      base.href = root;
      const head = document.getElementsByTagName('head')[0];
      head.insertBefore(base, head.firstChild);
      const a = document.createElement('a');
      a.href = path;
      const resolved = a.href;
      head.removeChild(base);
      return resolved;
  }
  function resolve(root, filepath, ext) {
      if (root.length && last(root) !== '/')
          root += '/';
      const url = domResolve(root, filepath);
      return url.replace(/^(\w+:\/\/[^/]+)(\/[^?]+)/, (str, origin, path) => {
          const last = path.split('/').pop();
          if (/\.\w+$/.test(last))
              return str;
          return origin + path + ext;
      });
  }
  function readFile(url) {
      return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                      resolve(xhr.responseText);
                  }
                  else {
                      reject(new Error(xhr.statusText));
                  }
              };
              xhr.onerror = () => {
                  reject(new Error('An error occurred whilst receiving the response.'));
              };
              xhr.open('GET', url);
              xhr.send();
          });
      });
  }
  function readFileSync(url) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send();
      if (xhr.status < 200 || xhr.status >= 300) {
          throw new Error(xhr.statusText);
      }
      return xhr.responseText;
  }
  function exists(filepath) {
      return __awaiter(this, void 0, void 0, function* () {
          return true;
      });
  }
  function existsSync(filepath) {
      return true;
  }
  function dirname(filepath) {
      return domResolve(filepath, '.');
  }
  const sep = '/';

  var fs = /*#__PURE__*/Object.freeze({
    __proto__: null,
    resolve: resolve,
    readFile: readFile,
    readFileSync: readFileSync,
    exists: exists,
    existsSync: existsSync,
    dirname: dirname,
    sep: sep
  });

  function defaultFilter(value, defaultValue, ...args) {
      value = toValue(value);
      if (isArray(value) || isString(value))
          return value.length ? value : defaultValue;
      if (value === false && (new Map(args)).get('allow_false'))
          return false;
      return isFalsy(value, this.context) ? defaultValue : value;
  }
  function json(value, space = 0) {
      return JSON.stringify(value, null, space);
  }
  function inspect(value, space = 0) {
      const ancestors = [];
      return JSON.stringify(value, function (_key, value) {
          if (typeof value !== 'object' || value === null)
              return value;
          // `this` is the object that value is contained in, i.e., its direct parent.
          while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this)
              ancestors.pop();
          if (ancestors.includes(value))
              return '[Circular]';
          ancestors.push(value);
          return value;
      }, space);
  }
  function to_integer(value) {
      return Number(value);
  }
  const raw = {
      raw: true,
      handler: identify
  };
  var misc = {
      default: defaultFilter,
      raw,
      jsonify: json,
      to_integer,
      json,
      inspect
  };

  const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&#34;',
      "'": '&#39;'
  };
  const unescapeMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&#34;': '"',
      '&#39;': "'"
  };
  function escape(str) {
      str = stringify(str);
      this.context.memoryLimit.use(str.length);
      return str.replace(/&|<|>|"|'/g, m => escapeMap[m]);
  }
  function xml_escape(str) {
      return escape.call(this, str);
  }
  function unescape(str) {
      str = stringify(str);
      this.context.memoryLimit.use(str.length);
      return str.replace(/&(amp|lt|gt|#34|#39);/g, m => unescapeMap[m]);
  }
  function escape_once(str) {
      return escape.call(this, unescape.call(this, str));
  }
  function newline_to_br(v) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.replace(/\r?\n/gm, '<br />\n');
  }
  function strip_html(v) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<.*?>|<!--[\s\S]*?-->/g, '');
  }

  var htmlFilters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    escape: escape,
    xml_escape: xml_escape,
    escape_once: escape_once,
    newline_to_br: newline_to_br,
    strip_html: strip_html
  });

  class MapFS {
      constructor(mapping) {
          this.mapping = mapping;
          this.sep = '/';
      }
      exists(filepath) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.existsSync(filepath);
          });
      }
      existsSync(filepath) {
          return !isNil(this.mapping[filepath]);
      }
      readFile(filepath) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.readFileSync(filepath);
          });
      }
      readFileSync(filepath) {
          const content = this.mapping[filepath];
          if (isNil(content))
              throw new Error(`ENOENT: ${filepath}`);
          return content;
      }
      dirname(filepath) {
          const segments = filepath.split(this.sep);
          segments.pop();
          return segments.join(this.sep);
      }
      resolve(dir, file, ext) {
          file += ext;
          if (dir === '.')
              return file;
          const segments = dir.split(/\/+/);
          for (const segment of file.split(this.sep)) {
              if (segment === '.' || segment === '')
                  continue;
              else if (segment === '..') {
                  if (segments.length > 1 || segments[0] !== '')
                      segments.pop();
              }
              else
                  segments.push(segment);
          }
          return segments.join(this.sep);
      }
  }

  const defaultOptions = {
      root: ['.'],
      layouts: ['.'],
      partials: ['.'],
      relativeReference: true,
      jekyllInclude: false,
      keyValueSeparator: ':',
      cache: undefined,
      extname: '',
      fs: fs,
      dynamicPartials: true,
      jsTruthy: false,
      dateFormat: '%A, %B %-e, %Y at %-l:%M %P %z',
      locale: '',
      trimTagRight: false,
      trimTagLeft: false,
      trimOutputRight: false,
      trimOutputLeft: false,
      greedy: true,
      tagDelimiterLeft: '{%',
      tagDelimiterRight: '%}',
      outputDelimiterLeft: '{{',
      outputDelimiterRight: '}}',
      preserveTimezones: false,
      strictFilters: false,
      strictVariables: false,
      ownPropertyOnly: true,
      lenientIf: false,
      globals: {},
      keepOutputType: false,
      operators: defaultOperators,
      memoryLimit: Infinity,
      parseLimit: Infinity,
      renderLimit: Infinity
  };
  function normalize(options) {
      var _a, _b;
      if (options.hasOwnProperty('root')) {
          if (!options.hasOwnProperty('partials'))
              options.partials = options.root;
          if (!options.hasOwnProperty('layouts'))
              options.layouts = options.root;
      }
      if (options.hasOwnProperty('cache')) {
          let cache;
          if (typeof options.cache === 'number')
              cache = options.cache > 0 ? new LRU(options.cache) : undefined;
          else if (typeof options.cache === 'object')
              cache = options.cache;
          else
              cache = options.cache ? new LRU(1024) : undefined;
          options.cache = cache;
      }
      options = Object.assign(Object.assign(Object.assign({}, defaultOptions), (options.jekyllInclude ? { dynamicPartials: false } : {})), options);
      if ((!options.fs.dirname || !options.fs.sep) && options.relativeReference) {
          console.warn('[LiquidJS] `fs.dirname` and `fs.sep` are required for relativeReference, set relativeReference to `false` to suppress this warning');
          options.relativeReference = false;
      }
      options.root = normalizeDirectoryList(options.root);
      options.partials = normalizeDirectoryList(options.partials);
      options.layouts = normalizeDirectoryList(options.layouts);
      options.outputEscape = options.outputEscape && getOutputEscapeFunction(options.outputEscape);
      if (!options.locale) {
          options.locale = (_b = (_a = getDateTimeFormat()) === null || _a === void 0 ? void 0 : _a().resolvedOptions().locale) !== null && _b !== void 0 ? _b : 'en-US';
      }
      if (options.templates) {
          options.fs = new MapFS(options.templates);
          options.relativeReference = true;
          options.root = options.partials = options.layouts = '.';
      }
      return options;
  }
  function getOutputEscapeFunction(nameOrFunction) {
      if (nameOrFunction === 'escape')
          return escape;
      if (nameOrFunction === 'json')
          return misc.json;
      assert(isFunction(nameOrFunction), '`outputEscape` need to be of type string or function');
      return nameOrFunction;
  }
  function normalizeDirectoryList(value) {
      let list = [];
      if (isArray(value))
          list = value;
      if (isString(value))
          list = [value];
      return list;
  }

  function whiteSpaceCtrl(tokens, options) {
      let inRaw = false;
      for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          if (!isDelimitedToken(token))
              continue;
          if (!inRaw && token.trimLeft) {
              trimLeft(tokens[i - 1], options.greedy);
          }
          if (isTagToken(token)) {
              if (token.name === 'raw')
                  inRaw = true;
              else if (token.name === 'endraw')
                  inRaw = false;
          }
          if (!inRaw && token.trimRight) {
              trimRight(tokens[i + 1], options.greedy);
          }
      }
  }
  function trimLeft(token, greedy) {
      if (!token || !isHTMLToken(token))
          return;
      const mask = greedy ? BLANK : INLINE_BLANK;
      while (TYPES[token.input.charCodeAt(token.end - 1 - token.trimRight)] & mask)
          token.trimRight++;
  }
  function trimRight(token, greedy) {
      if (!token || !isHTMLToken(token))
          return;
      const mask = greedy ? BLANK : INLINE_BLANK;
      while (TYPES[token.input.charCodeAt(token.begin + token.trimLeft)] & mask)
          token.trimLeft++;
      if (token.input.charAt(token.begin + token.trimLeft) === '\n')
          token.trimLeft++;
  }

  class Tokenizer {
      constructor(input, operators = defaultOptions.operators, file, range) {
          this.input = input;
          this.file = file;
          this.rawBeginAt = -1;
          this.p = range ? range[0] : 0;
          this.N = range ? range[1] : input.length;
          this.opTrie = createTrie(operators);
          this.literalTrie = createTrie(literalValues);
      }
      readExpression() {
          return new Expression(this.readExpressionTokens());
      }
      *readExpressionTokens() {
          while (this.p < this.N) {
              const operator = this.readOperator();
              if (operator) {
                  yield operator;
                  continue;
              }
              const operand = this.readValue();
              if (operand) {
                  yield operand;
                  continue;
              }
              return;
          }
      }
      readOperator() {
          this.skipBlank();
          const end = this.matchTrie(this.opTrie);
          if (end === -1)
              return;
          return new OperatorToken(this.input, this.p, (this.p = end), this.file);
      }
      matchTrie(trie) {
          let node = trie;
          let i = this.p;
          let info;
          while (node[this.input[i]] && i < this.N) {
              node = node[this.input[i++]];
              if (node['end'])
                  info = node;
          }
          if (!info)
              return -1;
          if (info['needBoundary'] && isWord(this.peek(i - this.p)))
              return -1;
          return i;
      }
      readFilteredValue() {
          const begin = this.p;
          const initial = this.readExpression();
          this.assert(initial.valid(), `invalid value expression: ${this.snapshot()}`);
          const filters = this.readFilters();
          return new FilteredValueToken(initial, filters, this.input, begin, this.p, this.file);
      }
      readFilters() {
          const filters = [];
          while (true) {
              const filter = this.readFilter();
              if (!filter)
                  return filters;
              filters.push(filter);
          }
      }
      readFilter() {
          this.skipBlank();
          if (this.end())
              return null;
          this.assert(this.read() === '|', `expected "|" before filter`);
          const name = this.readIdentifier();
          if (!name.size()) {
              this.assert(this.end(), `expected filter name`);
              return null;
          }
          const args = [];
          this.skipBlank();
          if (this.peek() === ':') {
              do {
                  ++this.p;
                  const arg = this.readFilterArg();
                  arg && args.push(arg);
                  this.skipBlank();
                  this.assert(this.end() || this.peek() === ',' || this.peek() === '|', () => `unexpected character ${this.snapshot()}`);
              } while (this.peek() === ',');
          }
          else if (this.peek() === '|' || this.end()) ;
          else {
              throw this.error('expected ":" after filter name');
          }
          return new FilterToken(name.getText(), args, this.input, name.begin, this.p, this.file);
      }
      readFilterArg() {
          const key = this.readValue();
          if (!key)
              return;
          this.skipBlank();
          if (this.peek() !== ':')
              return key;
          ++this.p;
          const value = this.readValue();
          return [key.getText(), value];
      }
      readTopLevelTokens(options = defaultOptions) {
          const tokens = [];
          while (this.p < this.N) {
              const token = this.readTopLevelToken(options);
              tokens.push(token);
          }
          whiteSpaceCtrl(tokens, options);
          return tokens;
      }
      readTopLevelToken(options) {
          const { tagDelimiterLeft, outputDelimiterLeft } = options;
          if (this.rawBeginAt > -1)
              return this.readEndrawOrRawContent(options);
          if (this.match(tagDelimiterLeft))
              return this.readTagToken(options);
          if (this.match(outputDelimiterLeft))
              return this.readOutputToken(options);
          return this.readHTMLToken([tagDelimiterLeft, outputDelimiterLeft]);
      }
      readHTMLToken(stopStrings) {
          const begin = this.p;
          while (this.p < this.N) {
              if (stopStrings.some(str => this.match(str)))
                  break;
              ++this.p;
          }
          return new HTMLToken(this.input, begin, this.p, this.file);
      }
      readTagToken(options) {
          const { file, input } = this;
          const begin = this.p;
          if (this.readToDelimiter(options.tagDelimiterRight) === -1) {
              throw this.error(`tag ${this.snapshot(begin)} not closed`, begin);
          }
          const token = new TagToken(input, begin, this.p, options, file);
          if (token.name === 'raw')
              this.rawBeginAt = begin;
          return token;
      }
      readToDelimiter(delimiter, respectQuoted = false) {
          this.skipBlank();
          while (this.p < this.N) {
              if (respectQuoted && (this.peekType() & QUOTE)) {
                  this.readQuoted();
                  continue;
              }
              ++this.p;
              if (this.rmatch(delimiter))
                  return this.p;
          }
          return -1;
      }
      readOutputToken(options = defaultOptions) {
          const { file, input } = this;
          const { outputDelimiterRight } = options;
          const begin = this.p;
          if (this.readToDelimiter(outputDelimiterRight, true) === -1) {
              throw this.error(`output ${this.snapshot(begin)} not closed`, begin);
          }
          return new OutputToken(input, begin, this.p, options, file);
      }
      readEndrawOrRawContent(options) {
          const { tagDelimiterLeft, tagDelimiterRight } = options;
          const begin = this.p;
          let leftPos = this.readTo(tagDelimiterLeft) - tagDelimiterLeft.length;
          while (this.p < this.N) {
              if (this.readIdentifier().getText() !== 'endraw') {
                  leftPos = this.readTo(tagDelimiterLeft) - tagDelimiterLeft.length;
                  continue;
              }
              while (this.p <= this.N) {
                  if (this.rmatch(tagDelimiterRight)) {
                      const end = this.p;
                      if (begin === leftPos) {
                          this.rawBeginAt = -1;
                          return new TagToken(this.input, begin, end, options, this.file);
                      }
                      else {
                          this.p = leftPos;
                          return new HTMLToken(this.input, begin, leftPos, this.file);
                      }
                  }
                  if (this.rmatch(tagDelimiterLeft))
                      break;
                  this.p++;
              }
          }
          throw this.error(`raw ${this.snapshot(this.rawBeginAt)} not closed`, begin);
      }
      readLiquidTagTokens(options = defaultOptions) {
          const tokens = [];
          while (this.p < this.N) {
              const token = this.readLiquidTagToken(options);
              token && tokens.push(token);
          }
          return tokens;
      }
      readLiquidTagToken(options) {
          this.skipBlank();
          if (this.end())
              return;
          const begin = this.p;
          this.readToDelimiter('\n');
          const end = this.p;
          return new LiquidTagToken(this.input, begin, end, options, this.file);
      }
      error(msg, pos = this.p) {
          return new TokenizationError(msg, new IdentifierToken(this.input, pos, this.N, this.file));
      }
      assert(pred, msg, pos) {
          if (!pred)
              throw this.error(typeof msg === 'function' ? msg() : msg, pos);
      }
      snapshot(begin = this.p) {
          return JSON.stringify(ellipsis(this.input.slice(begin, this.N), 32));
      }
      /**
       * @deprecated use #readIdentifier instead
       */
      readWord() {
          return this.readIdentifier();
      }
      readIdentifier() {
          this.skipBlank();
          const begin = this.p;
          while (!this.end() && isWord(this.peek()))
              ++this.p;
          return new IdentifierToken(this.input, begin, this.p, this.file);
      }
      readNonEmptyIdentifier() {
          const id = this.readIdentifier();
          return id.size() ? id : undefined;
      }
      readTagName() {
          this.skipBlank();
          // Handle inline comment tags
          if (this.input[this.p] === '#')
              return this.input.slice(this.p, ++this.p);
          return this.readIdentifier().getText();
      }
      readHashes(jekyllStyle) {
          const hashes = [];
          while (true) {
              const hash = this.readHash(jekyllStyle);
              if (!hash)
                  return hashes;
              hashes.push(hash);
          }
      }
      readHash(jekyllStyle) {
          this.skipBlank();
          if (this.peek() === ',')
              ++this.p;
          const begin = this.p;
          const name = this.readNonEmptyIdentifier();
          if (!name)
              return;
          let value;
          this.skipBlank();
          const sep = isString(jekyllStyle) ? jekyllStyle : (jekyllStyle ? '=' : ':');
          if (this.peek() === sep) {
              ++this.p;
              value = this.readValue();
          }
          return new HashToken(this.input, begin, this.p, name, value, this.file);
      }
      remaining() {
          return this.input.slice(this.p, this.N);
      }
      advance(step = 1) {
          this.p += step;
      }
      end() {
          return this.p >= this.N;
      }
      read() {
          return this.input[this.p++];
      }
      readTo(end) {
          while (this.p < this.N) {
              ++this.p;
              if (this.rmatch(end))
                  return this.p;
          }
          return -1;
      }
      readValue() {
          this.skipBlank();
          const begin = this.p;
          const variable = this.readLiteral() || this.readQuoted() || this.readRange() || this.readNumber();
          const props = this.readProperties(!variable);
          if (!props.length)
              return variable;
          return new PropertyAccessToken(variable, props, this.input, begin, this.p);
      }
      readScopeValue() {
          this.skipBlank();
          const begin = this.p;
          const props = this.readProperties();
          if (!props.length)
              return undefined;
          return new PropertyAccessToken(undefined, props, this.input, begin, this.p);
      }
      readProperties(isBegin = true) {
          const props = [];
          while (true) {
              if (this.peek() === '[') {
                  this.p++;
                  const prop = this.readValue() || new IdentifierToken(this.input, this.p, this.p, this.file);
                  this.assert(this.readTo(']') !== -1, '[ not closed');
                  props.push(prop);
                  continue;
              }
              if (isBegin && !props.length) {
                  const prop = this.readNonEmptyIdentifier();
                  if (prop) {
                      props.push(prop);
                      continue;
                  }
              }
              if (this.peek() === '.' && this.peek(1) !== '.') { // skip range syntax
                  this.p++;
                  const prop = this.readNonEmptyIdentifier();
                  if (!prop)
                      break;
                  props.push(prop);
                  continue;
              }
              break;
          }
          return props;
      }
      readNumber() {
          this.skipBlank();
          let decimalFound = false;
          let digitFound = false;
          let n = 0;
          if (this.peekType() & SIGN)
              n++;
          while (this.p + n <= this.N) {
              if (this.peekType(n) & NUMBER) {
                  digitFound = true;
                  n++;
              }
              else if (this.peek(n) === '.' && this.peek(n + 1) !== '.') {
                  if (decimalFound || !digitFound)
                      return;
                  decimalFound = true;
                  n++;
              }
              else
                  break;
          }
          if (digitFound && !isWord(this.peek(n))) {
              const num = new NumberToken(this.input, this.p, this.p + n, this.file);
              this.advance(n);
              return num;
          }
      }
      readLiteral() {
          this.skipBlank();
          const end = this.matchTrie(this.literalTrie);
          if (end === -1)
              return;
          const literal = new LiteralToken(this.input, this.p, end, this.file);
          this.p = end;
          return literal;
      }
      readRange() {
          this.skipBlank();
          const begin = this.p;
          if (this.peek() !== '(')
              return;
          ++this.p;
          const lhs = this.readValueOrThrow();
          this.p += 2;
          const rhs = this.readValueOrThrow();
          ++this.p;
          return new RangeToken(this.input, begin, this.p, lhs, rhs, this.file);
      }
      readValueOrThrow() {
          const value = this.readValue();
          this.assert(value, () => `unexpected token ${this.snapshot()}, value expected`);
          return value;
      }
      readQuoted() {
          this.skipBlank();
          const begin = this.p;
          if (!(this.peekType() & QUOTE))
              return;
          ++this.p;
          let escaped = false;
          while (this.p < this.N) {
              ++this.p;
              if (this.input[this.p - 1] === this.input[begin] && !escaped)
                  break;
              if (escaped)
                  escaped = false;
              else if (this.input[this.p - 1] === '\\')
                  escaped = true;
          }
          return new QuotedToken(this.input, begin, this.p, this.file);
      }
      *readFileNameTemplate(options) {
          const { outputDelimiterLeft } = options;
          const htmlStopStrings = [',', ' ', outputDelimiterLeft];
          const htmlStopStringSet = new Set(htmlStopStrings);
          // break on ',' and ' ', outputDelimiterLeft only stops HTML token
          while (this.p < this.N && !htmlStopStringSet.has(this.peek())) {
              yield this.match(outputDelimiterLeft)
                  ? this.readOutputToken(options)
                  : this.readHTMLToken(htmlStopStrings);
          }
      }
      match(word) {
          for (let i = 0; i < word.length; i++) {
              if (word[i] !== this.input[this.p + i])
                  return false;
          }
          return true;
      }
      rmatch(pattern) {
          for (let i = 0; i < pattern.length; i++) {
              if (pattern[pattern.length - 1 - i] !== this.input[this.p - 1 - i])
                  return false;
          }
          return true;
      }
      peekType(n = 0) {
          return this.p + n >= this.N ? 0 : TYPES[this.input.charCodeAt(this.p + n)];
      }
      peek(n = 0) {
          return this.p + n >= this.N ? '' : this.input[this.p + n];
      }
      skipBlank() {
          while (this.peekType() & BLANK)
              ++this.p;
      }
  }

  class ParseStream {
      constructor(tokens, parseToken) {
          this.handlers = {};
          this.stopRequested = false;
          this.tokens = tokens;
          this.parseToken = parseToken;
      }
      on(name, cb) {
          this.handlers[name] = cb;
          return this;
      }
      trigger(event, arg) {
          const h = this.handlers[event];
          return h ? (h.call(this, arg), true) : false;
      }
      start() {
          this.trigger('start');
          let token;
          while (!this.stopRequested && (token = this.tokens.shift())) {
              if (this.trigger('token', token))
                  continue;
              if (isTagToken(token) && this.trigger(`tag:${token.name}`, token)) {
                  continue;
              }
              const template = this.parseToken(token, this.tokens);
              this.trigger('template', template);
          }
          if (!this.stopRequested)
              this.trigger('end');
          return this;
      }
      stop() {
          this.stopRequested = true;
          return this;
      }
  }

  class TemplateImpl {
      constructor(token) {
          this.token = token;
      }
  }

  class Tag extends TemplateImpl {
      constructor(token, remainTokens, liquid) {
          super(token);
          this.name = token.name;
          this.liquid = liquid;
          this.tokenizer = token.tokenizer;
      }
  }

  /**
   * Key-Value Pairs Representing Tag Arguments
   * Example:
   *    For the markup `, foo:'bar', coo:2 reversed %}`,
   *    hash['foo'] === 'bar'
   *    hash['coo'] === 2
   *    hash['reversed'] === undefined
   */
  class Hash {
      constructor(markup, jekyllStyle) {
          this.hash = {};
          const tokenizer = new Tokenizer(markup, {});
          for (const hash of tokenizer.readHashes(jekyllStyle)) {
              this.hash[hash.name.content] = hash.value;
          }
      }
      *render(ctx) {
          const hash = {};
          for (const key of Object.keys(this.hash)) {
              hash[key] = this.hash[key] === undefined ? true : yield evalToken(this.hash[key], ctx);
          }
          return hash;
      }
  }

  function createTagClass(options) {
      return class extends Tag {
          constructor(token, tokens, liquid) {
              super(token, tokens, liquid);
              if (isFunction(options.parse)) {
                  options.parse.call(this, token, tokens);
              }
          }
          *render(ctx, emitter) {
              const hash = (yield new Hash(this.token.args, ctx.opts.keyValueSeparator).render(ctx));
              return yield options.render.call(this, ctx, emitter, hash);
          }
      };
  }

  function isKeyValuePair(arr) {
      return isArray(arr);
  }

  class Filter {
      constructor(token, options, liquid) {
          this.token = token;
          this.name = token.name;
          this.handler = isFunction(options)
              ? options
              : (isFunction(options === null || options === void 0 ? void 0 : options.handler) ? options.handler : identify);
          this.raw = !isFunction(options) && !!(options === null || options === void 0 ? void 0 : options.raw);
          this.args = token.args;
          this.liquid = liquid;
      }
      *render(value, context) {
          const argv = [];
          for (const arg of this.args) {
              if (isKeyValuePair(arg))
                  argv.push([arg[0], yield evalToken(arg[1], context)]);
              else
                  argv.push(yield evalToken(arg, context));
          }
          return yield this.handler.apply({ context, token: this.token, liquid: this.liquid }, [value, ...argv]);
      }
  }

  class Value {
      /**
       * @param str the value to be valuated, eg.: "foobar" | truncate: 3
       */
      constructor(input, liquid) {
          this.filters = [];
          const token = typeof input === 'string'
              ? new Tokenizer(input, liquid.options.operators).readFilteredValue()
              : input;
          this.initial = token.initial;
          this.filters = token.filters.map(token => new Filter(token, this.getFilter(liquid, token.name), liquid));
      }
      *value(ctx, lenient) {
          lenient = lenient || (ctx.opts.lenientIf && this.filters.length > 0 && this.filters[0].name === 'default');
          let val = yield this.initial.evaluate(ctx, lenient);
          for (const filter of this.filters) {
              val = yield filter.render(val, ctx);
          }
          return val;
      }
      getFilter(liquid, name) {
          const impl = liquid.filters[name];
          assert(impl || !liquid.options.strictFilters, () => `undefined filter: ${name}`);
          return impl;
      }
  }

  class Output extends TemplateImpl {
      constructor(token, liquid) {
          var _a;
          super(token);
          const tokenizer = new Tokenizer(token.input, liquid.options.operators, token.file, token.contentRange);
          this.value = new Value(tokenizer.readFilteredValue(), liquid);
          const filters = this.value.filters;
          const outputEscape = liquid.options.outputEscape;
          if (!((_a = filters[filters.length - 1]) === null || _a === void 0 ? void 0 : _a.raw) && outputEscape) {
              const token = new FilterToken(toString.call(outputEscape), [], '', 0, 0);
              filters.push(new Filter(token, outputEscape, liquid));
          }
      }
      *render(ctx, emitter) {
          const val = yield this.value.value(ctx, false);
          emitter.write(val);
      }
  }

  class HTML extends TemplateImpl {
      constructor(token) {
          super(token);
          this.str = token.getContent();
      }
      *render(ctx, emitter) {
          emitter.write(this.str);
      }
  }

  var LookupType;
  (function (LookupType) {
      LookupType["Partials"] = "partials";
      LookupType["Layouts"] = "layouts";
      LookupType["Root"] = "root";
  })(LookupType || (LookupType = {}));
  class Loader {
      constructor(options) {
          this.options = options;
          if (options.relativeReference) {
              const sep = options.fs.sep;
              assert(sep, '`fs.sep` is required for relative reference');
              const rRelativePath = new RegExp(['.' + sep, '..' + sep, './', '../'].map(prefix => escapeRegex(prefix)).join('|'));
              this.shouldLoadRelative = (referencedFile) => rRelativePath.test(referencedFile);
          }
          else {
              this.shouldLoadRelative = (_referencedFile) => false;
          }
          this.contains = this.options.fs.contains || (() => true);
      }
      *lookup(file, type, sync, currentFile) {
          const { fs } = this.options;
          const dirs = this.options[type];
          for (const filepath of this.candidates(file, dirs, currentFile, type !== LookupType.Root)) {
              if (sync ? fs.existsSync(filepath) : yield fs.exists(filepath))
                  return filepath;
          }
          throw this.lookupError(file, dirs);
      }
      *candidates(file, dirs, currentFile, enforceRoot) {
          const { fs, extname } = this.options;
          if (this.shouldLoadRelative(file) && currentFile) {
              const referenced = fs.resolve(this.dirname(currentFile), file, extname);
              for (const dir of dirs) {
                  if (!enforceRoot || this.contains(dir, referenced)) {
                      // the relatively referenced file is within one of root dirs
                      yield referenced;
                      break;
                  }
              }
          }
          for (const dir of dirs) {
              const referenced = fs.resolve(dir, file, extname);
              if (!enforceRoot || this.contains(dir, referenced)) {
                  yield referenced;
              }
          }
          if (fs.fallback !== undefined) {
              const filepath = fs.fallback(file);
              if (filepath !== undefined)
                  yield filepath;
          }
      }
      dirname(path) {
          const fs = this.options.fs;
          assert(fs.dirname, '`fs.dirname` is required for relative reference');
          return fs.dirname(path);
      }
      lookupError(file, roots) {
          const err = new Error('ENOENT');
          err.message = `ENOENT: Failed to lookup "${file}" in "${roots}"`;
          err.code = 'ENOENT';
          return err;
      }
  }

  class Parser {
      constructor(liquid) {
          this.liquid = liquid;
          this.cache = this.liquid.options.cache;
          this.fs = this.liquid.options.fs;
          this.parseFile = this.cache ? this._parseFileCached : this._parseFile;
          this.loader = new Loader(this.liquid.options);
          this.parseLimit = new Limiter('parse length', liquid.options.parseLimit);
      }
      parse(html, filepath) {
          html = String(html);
          this.parseLimit.use(html.length);
          const tokenizer = new Tokenizer(html, this.liquid.options.operators, filepath);
          const tokens = tokenizer.readTopLevelTokens(this.liquid.options);
          return this.parseTokens(tokens);
      }
      parseTokens(tokens) {
          let token;
          const templates = [];
          const errors = [];
          while ((token = tokens.shift())) {
              try {
                  templates.push(this.parseToken(token, tokens));
              }
              catch (err) {
                  if (this.liquid.options.catchAllErrors)
                      errors.push(err);
                  else
                      throw err;
              }
          }
          if (errors.length)
              throw new LiquidErrors(errors);
          return templates;
      }
      parseToken(token, remainTokens) {
          try {
              if (isTagToken(token)) {
                  const TagClass = this.liquid.tags[token.name];
                  assert(TagClass, `tag "${token.name}" not found`);
                  return new TagClass(token, remainTokens, this.liquid, this);
              }
              if (isOutputToken(token)) {
                  return new Output(token, this.liquid);
              }
              return new HTML(token);
          }
          catch (e) {
              if (LiquidError.is(e))
                  throw e;
              throw new ParseError(e, token);
          }
      }
      parseStream(tokens) {
          return new ParseStream(tokens, (token, tokens) => this.parseToken(token, tokens));
      }
      *_parseFileCached(file, sync, type = LookupType.Root, currentFile) {
          const cache = this.cache;
          const key = this.loader.shouldLoadRelative(file) ? currentFile + ',' + file : type + ':' + file;
          const tpls = yield cache.read(key);
          if (tpls)
              return tpls;
          const task = this._parseFile(file, sync, type, currentFile);
          // sync mode: exec the task and cache the result
          // async mode: cache the task before exec
          const taskOrTpl = sync ? yield task : toPromise(task);
          cache.write(key, taskOrTpl);
          // note: concurrent tasks will be reused, cache for failed task is removed until its end
          try {
              return yield taskOrTpl;
          }
          catch (err) {
              cache.remove(key);
              throw err;
          }
      }
      *_parseFile(file, sync, type = LookupType.Root, currentFile) {
          const filepath = yield this.loader.lookup(file, type, sync, currentFile);
          return this.parse(sync ? this.fs.readFileSync(filepath) : yield this.fs.readFile(filepath), filepath);
      }
  }

  var TokenKind;
  (function (TokenKind) {
      TokenKind[TokenKind["Number"] = 1] = "Number";
      TokenKind[TokenKind["Literal"] = 2] = "Literal";
      TokenKind[TokenKind["Tag"] = 4] = "Tag";
      TokenKind[TokenKind["Output"] = 8] = "Output";
      TokenKind[TokenKind["HTML"] = 16] = "HTML";
      TokenKind[TokenKind["Filter"] = 32] = "Filter";
      TokenKind[TokenKind["Hash"] = 64] = "Hash";
      TokenKind[TokenKind["PropertyAccess"] = 128] = "PropertyAccess";
      TokenKind[TokenKind["Word"] = 256] = "Word";
      TokenKind[TokenKind["Range"] = 512] = "Range";
      TokenKind[TokenKind["Quoted"] = 1024] = "Quoted";
      TokenKind[TokenKind["Operator"] = 2048] = "Operator";
      TokenKind[TokenKind["FilteredValue"] = 4096] = "FilteredValue";
      TokenKind[TokenKind["Delimited"] = 12] = "Delimited";
  })(TokenKind || (TokenKind = {}));

  function isDelimitedToken(val) {
      return !!(getKind(val) & TokenKind.Delimited);
  }
  function isOperatorToken(val) {
      return getKind(val) === TokenKind.Operator;
  }
  function isHTMLToken(val) {
      return getKind(val) === TokenKind.HTML;
  }
  function isOutputToken(val) {
      return getKind(val) === TokenKind.Output;
  }
  function isTagToken(val) {
      return getKind(val) === TokenKind.Tag;
  }
  function isQuotedToken(val) {
      return getKind(val) === TokenKind.Quoted;
  }
  function isPropertyAccessToken(val) {
      return getKind(val) === TokenKind.PropertyAccess;
  }
  function isRangeToken(val) {
      return getKind(val) === TokenKind.Range;
  }
  function getKind(val) {
      return val ? val.kind : -1;
  }

  class Context {
      constructor(env = {}, opts = defaultOptions, renderOptions = {}, { memoryLimit, renderLimit } = {}) {
          var _a, _b, _c, _d, _e;
          /**
           * insert a Context-level empty scope,
           * for tags like `{% capture %}` `{% assign %}` to operate
           */
          this.scopes = [{}];
          this.registers = {};
          this.sync = !!renderOptions.sync;
          this.opts = opts;
          this.globals = (_a = renderOptions.globals) !== null && _a !== void 0 ? _a : opts.globals;
          this.environments = isObject(env) ? env : Object(env);
          this.strictVariables = (_b = renderOptions.strictVariables) !== null && _b !== void 0 ? _b : this.opts.strictVariables;
          this.ownPropertyOnly = (_c = renderOptions.ownPropertyOnly) !== null && _c !== void 0 ? _c : opts.ownPropertyOnly;
          this.memoryLimit = memoryLimit !== null && memoryLimit !== void 0 ? memoryLimit : new Limiter('memory alloc', (_d = renderOptions.memoryLimit) !== null && _d !== void 0 ? _d : opts.memoryLimit);
          this.renderLimit = renderLimit !== null && renderLimit !== void 0 ? renderLimit : new Limiter('template render', getPerformance().now() + ((_e = renderOptions.renderLimit) !== null && _e !== void 0 ? _e : opts.renderLimit));
      }
      getRegister(key) {
          return (this.registers[key] = this.registers[key] || {});
      }
      setRegister(key, value) {
          return (this.registers[key] = value);
      }
      saveRegister(...keys) {
          return keys.map(key => [key, this.getRegister(key)]);
      }
      restoreRegister(keyValues) {
          return keyValues.forEach(([key, value]) => this.setRegister(key, value));
      }
      getAll() {
          return [this.globals, this.environments, ...this.scopes]
              .reduce((ctx, val) => __assign(ctx, val), {});
      }
      /**
       * @deprecated use `_get()` or `getSync()` instead
       */
      get(paths) {
          return this.getSync(paths);
      }
      getSync(paths) {
          return toValueSync(this._get(paths));
      }
      *_get(paths) {
          const scope = this.findScope(paths[0]); // first prop should always be a string
          return yield this._getFromScope(scope, paths);
      }
      /**
       * @deprecated use `_get()` instead
       */
      getFromScope(scope, paths) {
          return toValueSync(this._getFromScope(scope, paths));
      }
      *_getFromScope(scope, paths, strictVariables = this.strictVariables) {
          if (isString(paths))
              paths = paths.split('.');
          for (let i = 0; i < paths.length; i++) {
              scope = yield readProperty(scope, paths[i], this.ownPropertyOnly);
              if (strictVariables && isUndefined(scope)) {
                  throw new InternalUndefinedVariableError(paths.slice(0, i + 1).join('.'));
              }
          }
          return scope;
      }
      push(ctx) {
          return this.scopes.push(ctx);
      }
      pop() {
          return this.scopes.pop();
      }
      bottom() {
          return this.scopes[0];
      }
      spawn(scope = {}) {
          return new Context(scope, this.opts, {
              sync: this.sync,
              globals: this.globals,
              strictVariables: this.strictVariables
          }, {
              renderLimit: this.renderLimit,
              memoryLimit: this.memoryLimit
          });
      }
      findScope(key) {
          for (let i = this.scopes.length - 1; i >= 0; i--) {
              const candidate = this.scopes[i];
              if (key in candidate)
                  return candidate;
          }
          if (key in this.environments)
              return this.environments;
          return this.globals;
      }
  }
  function readProperty(obj, key, ownPropertyOnly) {
      obj = toLiquid(obj);
      key = toValue(key);
      if (isNil(obj))
          return obj;
      if (isArray(obj) && key < 0)
          return obj[obj.length + +key];
      const value = readJSProperty(obj, key, ownPropertyOnly);
      if (value === undefined && obj instanceof Drop)
          return obj.liquidMethodMissing(key);
      if (isFunction(value))
          return value.call(obj);
      if (key === 'size')
          return readSize(obj);
      else if (key === 'first')
          return readFirst(obj);
      else if (key === 'last')
          return readLast(obj);
      return value;
  }
  function readJSProperty(obj, key, ownPropertyOnly) {
      if (ownPropertyOnly && !hasOwnProperty.call(obj, key) && !(obj instanceof Drop))
          return undefined;
      return obj[key];
  }
  function readFirst(obj) {
      if (isArray(obj))
          return obj[0];
      return obj['first'];
  }
  function readLast(obj) {
      if (isArray(obj))
          return obj[obj.length - 1];
      return obj['last'];
  }
  function readSize(obj) {
      if (hasOwnProperty.call(obj, 'size') || obj['size'] !== undefined)
          return obj['size'];
      if (isArray(obj) || isString(obj))
          return obj.length;
      if (typeof obj === 'object')
          return Object.keys(obj).length;
  }

  var BlockMode;
  (function (BlockMode) {
      /* store rendered html into blocks */
      BlockMode[BlockMode["OUTPUT"] = 0] = "OUTPUT";
      /* output rendered html directly */
      BlockMode[BlockMode["STORE"] = 1] = "STORE";
  })(BlockMode || (BlockMode = {}));

  const abs = argumentsToValue(Math.abs);
  const at_least = argumentsToValue(Math.max);
  const at_most = argumentsToValue(Math.min);
  const ceil = argumentsToValue(Math.ceil);
  const divided_by = argumentsToValue((dividend, divisor, integerArithmetic = false) => integerArithmetic ? Math.floor(dividend / divisor) : dividend / divisor);
  const floor = argumentsToValue(Math.floor);
  const minus = argumentsToValue((v, arg) => v - arg);
  const modulo = argumentsToValue((v, arg) => v % arg);
  const times = argumentsToValue((v, arg) => v * arg);
  function round(v, arg = 0) {
      v = toValue(v);
      arg = toValue(arg);
      const amp = Math.pow(10, arg);
      return Math.round(v * amp) / amp;
  }
  function plus(v, arg) {
      v = toValue(v);
      arg = toValue(arg);
      return Number(v) + Number(arg);
  }

  var mathFilters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    abs: abs,
    at_least: at_least,
    at_most: at_most,
    ceil: ceil,
    divided_by: divided_by,
    floor: floor,
    minus: minus,
    modulo: modulo,
    times: times,
    round: round,
    plus: plus
  });

  const url_decode = (x) => decodeURIComponent(stringify(x)).replace(/\+/g, ' ');
  const url_encode = (x) => encodeURIComponent(stringify(x)).replace(/%20/g, '+');
  const cgi_escape = (x) => encodeURIComponent(stringify(x))
      .replace(/%20/g, '+')
      .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  const uri_escape = (x) => encodeURI(stringify(x))
      .replace(/%5B/g, '[')
      .replace(/%5D/g, ']');
  const rSlugifyDefault = /[^\p{M}\p{L}\p{Nd}]+/ug;
  const rSlugifyReplacers = {
      'raw': /\s+/g,
      'default': rSlugifyDefault,
      'pretty': /[^\p{M}\p{L}\p{Nd}._~!$&'()+,;=@]+/ug,
      'ascii': /[^A-Za-z0-9]+/g,
      'latin': rSlugifyDefault,
      'none': null
  };
  function slugify(str, mode = 'default', cased = false) {
      str = stringify(str);
      const replacer = rSlugifyReplacers[mode];
      if (replacer) {
          if (mode === 'latin')
              str = removeAccents(str);
          str = str.replace(replacer, '-').replace(/^-|-$/g, '');
      }
      return cased ? str : str.toLowerCase();
  }
  function removeAccents(str) {
      return str.replace(/[àáâãäå]/g, 'a')
          .replace(/[æ]/g, 'ae')
          .replace(/[ç]/g, 'c')
          .replace(/[èéêë]/g, 'e')
          .replace(/[ìíîï]/g, 'i')
          .replace(/[ð]/g, 'd')
          .replace(/[ñ]/g, 'n')
          .replace(/[òóôõöø]/g, 'o')
          .replace(/[ùúûü]/g, 'u')
          .replace(/[ýÿ]/g, 'y')
          .replace(/[ß]/g, 'ss')
          .replace(/[œ]/g, 'oe')
          .replace(/[þ]/g, 'th')
          .replace(/[ẞ]/g, 'SS')
          .replace(/[Œ]/g, 'OE')
          .replace(/[Þ]/g, 'TH');
  }

  var urlFilters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    url_decode: url_decode,
    url_encode: url_encode,
    cgi_escape: cgi_escape,
    uri_escape: uri_escape,
    slugify: slugify
  });

  const join = argumentsToValue(function (v, arg) {
      const array = toArray(v);
      const sep = isNil(arg) ? ' ' : stringify(arg);
      const complexity = array.length * (1 + sep.length);
      this.context.memoryLimit.use(complexity);
      return array.join(sep);
  });
  const last$1 = argumentsToValue((v) => isArray(v) ? last(v) : '');
  const first = argumentsToValue((v) => isArray(v) ? v[0] : '');
  const reverse = argumentsToValue(function (v) {
      const array = toArray(v);
      this.context.memoryLimit.use(array.length);
      return [...array].reverse();
  });
  function* sort(arr, property) {
      const values = [];
      const array = toArray(arr);
      this.context.memoryLimit.use(array.length);
      for (const item of array) {
          values.push([
              item,
              property ? yield this.context._getFromScope(item, stringify(property).split('.'), false) : item
          ]);
      }
      return values.sort((lhs, rhs) => {
          const lvalue = lhs[1];
          const rvalue = rhs[1];
          return lvalue < rvalue ? -1 : (lvalue > rvalue ? 1 : 0);
      }).map(tuple => tuple[0]);
  }
  function sort_natural(input, property) {
      const propertyString = stringify(property);
      const compare = property === undefined
          ? caseInsensitiveCompare
          : (lhs, rhs) => caseInsensitiveCompare(lhs[propertyString], rhs[propertyString]);
      const array = toArray(input);
      this.context.memoryLimit.use(array.length);
      return [...array].sort(compare);
  }
  const size = (v) => (v && v.length) || 0;
  function* map(arr, property) {
      const results = [];
      const array = toArray(arr);
      this.context.memoryLimit.use(array.length);
      for (const item of array) {
          results.push(yield this.context._getFromScope(item, stringify(property), false));
      }
      return results;
  }
  function* sum(arr, property) {
      let sum = 0;
      const array = toArray(arr);
      for (const item of array) {
          const data = Number(property ? yield this.context._getFromScope(item, stringify(property), false) : item);
          sum += Number.isNaN(data) ? 0 : data;
      }
      return sum;
  }
  function compact(arr) {
      const array = toArray(arr);
      this.context.memoryLimit.use(array.length);
      return array.filter(x => !isNil(toValue(x)));
  }
  function concat(v, arg = []) {
      const lhs = toArray(v);
      const rhs = toArray(arg);
      this.context.memoryLimit.use(lhs.length + rhs.length);
      return lhs.concat(rhs);
  }
  function push(v, arg) {
      return concat.call(this, v, [arg]);
  }
  function unshift(v, arg) {
      const array = toArray(v);
      this.context.memoryLimit.use(array.length);
      const clone = [...array];
      clone.unshift(arg);
      return clone;
  }
  function pop(v) {
      const clone = [...toArray(v)];
      clone.pop();
      return clone;
  }
  function shift(v) {
      const array = toArray(v);
      this.context.memoryLimit.use(array.length);
      const clone = [...array];
      clone.shift();
      return clone;
  }
  function slice(v, begin, length = 1) {
      v = toValue(v);
      if (isNil(v))
          return [];
      if (!isArray(v))
          v = stringify(v);
      begin = begin < 0 ? v.length + begin : begin;
      this.context.memoryLimit.use(length);
      return v.slice(begin, begin + length);
  }
  function* where(arr, property, expected) {
      const values = [];
      arr = toArray(arr);
      this.context.memoryLimit.use(arr.length);
      const token = new Tokenizer(stringify(property)).readScopeValue();
      for (const item of arr) {
          values.push(yield evalToken(token, this.context.spawn(item)));
      }
      const matcher = this.context.opts.jekyllWhere
          ? (v) => EmptyDrop.is(expected) ? equals(v, expected) : (isArray(v) ? arrayIncludes(v, expected) : equals(v, expected))
          : (v) => equals(v, expected);
      return arr.filter((_, i) => {
          if (expected === undefined)
              return isTruthy(values[i], this.context);
          return matcher(values[i]);
      });
  }
  function* where_exp(arr, itemName, exp) {
      const filtered = [];
      const keyTemplate = new Value(stringify(exp), this.liquid);
      const array = toArray(arr);
      this.context.memoryLimit.use(array.length);
      for (const item of array) {
          const value = yield keyTemplate.value(this.context.spawn({ [itemName]: item }));
          if (value)
              filtered.push(item);
      }
      return filtered;
  }
  function* group_by(arr, property) {
      const map = new Map();
      arr = toArray(arr);
      const token = new Tokenizer(stringify(property)).readScopeValue();
      this.context.memoryLimit.use(arr.length);
      for (const item of arr) {
          const key = yield evalToken(token, this.context.spawn(item));
          if (!map.has(key))
              map.set(key, []);
          map.get(key).push(item);
      }
      return [...map.entries()].map(([name, items]) => ({ name, items }));
  }
  function* group_by_exp(arr, itemName, exp) {
      const map = new Map();
      const keyTemplate = new Value(stringify(exp), this.liquid);
      arr = toArray(arr);
      this.context.memoryLimit.use(arr.length);
      for (const item of arr) {
          const key = yield keyTemplate.value(this.context.spawn({ [itemName]: item }));
          if (!map.has(key))
              map.set(key, []);
          map.get(key).push(item);
      }
      return [...map.entries()].map(([name, items]) => ({ name, items }));
  }
  function* find(arr, property, expected) {
      const token = new Tokenizer(stringify(property)).readScopeValue();
      const array = toArray(arr);
      for (const item of array) {
          const value = yield evalToken(token, this.context.spawn(item));
          if (equals(value, expected))
              return item;
      }
  }
  function* find_exp(arr, itemName, exp) {
      const predicate = new Value(stringify(exp), this.liquid);
      const array = toArray(arr);
      for (const item of array) {
          const value = yield predicate.value(this.context.spawn({ [itemName]: item }));
          if (value)
              return item;
      }
  }
  function uniq(arr) {
      arr = toArray(arr);
      this.context.memoryLimit.use(arr.length);
      return [...new Set(arr)];
  }
  function sample(v, count = 1) {
      v = toValue(v);
      if (isNil(v))
          return [];
      if (!isArray(v))
          v = stringify(v);
      this.context.memoryLimit.use(count);
      const shuffled = [...v].sort(() => Math.random() - 0.5);
      if (count === 1)
          return shuffled[0];
      return shuffled.slice(0, count);
  }

  var arrayFilters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    join: join,
    last: last$1,
    first: first,
    reverse: reverse,
    sort: sort,
    sort_natural: sort_natural,
    size: size,
    map: map,
    sum: sum,
    compact: compact,
    concat: concat,
    push: push,
    unshift: unshift,
    pop: pop,
    shift: shift,
    slice: slice,
    where: where,
    where_exp: where_exp,
    group_by: group_by,
    group_by_exp: group_by_exp,
    find: find,
    find_exp: find_exp,
    uniq: uniq,
    sample: sample
  });

  function date(v, format, timezoneOffset) {
      var _a, _b, _c;
      const size = ((_a = v === null || v === void 0 ? void 0 : v.length) !== null && _a !== void 0 ? _a : 0) + ((_b = format === null || format === void 0 ? void 0 : format.length) !== null && _b !== void 0 ? _b : 0) + ((_c = timezoneOffset === null || timezoneOffset === void 0 ? void 0 : timezoneOffset.length) !== null && _c !== void 0 ? _c : 0);
      this.context.memoryLimit.use(size);
      const date = parseDate(v, this.context.opts, timezoneOffset);
      if (!date)
          return v;
      format = toValue(format);
      format = isNil(format) ? this.context.opts.dateFormat : stringify(format);
      return strftime(date, format);
  }
  function date_to_xmlschema(v) {
      return date.call(this, v, '%Y-%m-%dT%H:%M:%S%:z');
  }
  function date_to_rfc822(v) {
      return date.call(this, v, '%a, %d %b %Y %H:%M:%S %z');
  }
  function date_to_string(v, type, style) {
      return stringify_date.call(this, v, '%b', type, style);
  }
  function date_to_long_string(v, type, style) {
      return stringify_date.call(this, v, '%B', type, style);
  }
  function stringify_date(v, month_type, type, style) {
      const date = parseDate(v, this.context.opts);
      if (!date)
          return v;
      if (type === 'ordinal') {
          const d = date.getDate();
          return style === 'US'
              ? strftime(date, `${month_type} ${d}%q, %Y`)
              : strftime(date, `${d}%q ${month_type} %Y`);
      }
      return strftime(date, `%d ${month_type} %Y`);
  }
  function parseDate(v, opts, timezoneOffset) {
      let date;
      const defaultTimezoneOffset = timezoneOffset !== null && timezoneOffset !== void 0 ? timezoneOffset : opts.timezoneOffset;
      const locale = opts.locale;
      v = toValue(v);
      if (v === 'now' || v === 'today') {
          date = new LiquidDate(Date.now(), locale, defaultTimezoneOffset);
      }
      else if (isNumber(v)) {
          date = new LiquidDate(v * 1000, locale, defaultTimezoneOffset);
      }
      else if (isString(v)) {
          if (/^\d+$/.test(v)) {
              date = new LiquidDate(+v * 1000, locale, defaultTimezoneOffset);
          }
          else if (opts.preserveTimezones && timezoneOffset === undefined) {
              date = LiquidDate.createDateFixedToTimezone(v, locale);
          }
          else {
              date = new LiquidDate(v, locale, defaultTimezoneOffset);
          }
      }
      else {
          date = new LiquidDate(v, locale, defaultTimezoneOffset);
      }
      return date.valid() ? date : undefined;
  }

  var dateFilters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    date: date,
    date_to_xmlschema: date_to_xmlschema,
    date_to_rfc822: date_to_rfc822,
    date_to_string: date_to_string,
    date_to_long_string: date_to_long_string
  });

  /**
   * String related filters
   *
   * * prefer stringify() to String() since `undefined`, `null` should eval ''
   */
  const rCJKWord = /[\u4E00-\u9FFF\uF900-\uFAFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/gu;
  // Word boundary followed by word characters (for detecting words)
  const rNonCJKWord = /[^\u4E00-\u9FFF\uF900-\uFAFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\s]+/gu;
  function append(v, arg) {
      assert(arguments.length === 2, 'append expect 2 arguments');
      const lhs = stringify(v);
      const rhs = stringify(arg);
      this.context.memoryLimit.use(lhs.length + rhs.length);
      return lhs + rhs;
  }
  function prepend(v, arg) {
      assert(arguments.length === 2, 'prepend expect 2 arguments');
      const lhs = stringify(v);
      const rhs = stringify(arg);
      this.context.memoryLimit.use(lhs.length + rhs.length);
      return rhs + lhs;
  }
  function lstrip(v, chars) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      if (chars) {
          chars = escapeRegExp(stringify(chars));
          return str.replace(new RegExp(`^[${chars}]+`, 'g'), '');
      }
      return str.replace(/^\s+/, '');
  }
  function downcase(v) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.toLowerCase();
  }
  function upcase(v) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return stringify(str).toUpperCase();
  }
  function remove(v, arg) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.split(stringify(arg)).join('');
  }
  function remove_first(v, l) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.replace(stringify(l), '');
  }
  function remove_last(v, l) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      const pattern = stringify(l);
      const index = str.lastIndexOf(pattern);
      if (index === -1)
          return str;
      return str.substring(0, index) + str.substring(index + pattern.length);
  }
  function rstrip(str, chars) {
      str = stringify(str);
      this.context.memoryLimit.use(str.length);
      if (chars) {
          chars = escapeRegExp(stringify(chars));
          return str.replace(new RegExp(`[${chars}]+$`, 'g'), '');
      }
      return str.replace(/\s+$/, '');
  }
  function split(v, arg) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      const arr = str.split(stringify(arg));
      // align to ruby split, which is the behavior of shopify/liquid
      // see: https://ruby-doc.org/core-2.4.0/String.html#method-i-split
      while (arr.length && arr[arr.length - 1] === '')
          arr.pop();
      return arr;
  }
  function strip(v, chars) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      if (chars) {
          chars = escapeRegExp(stringify(chars));
          return str
              .replace(new RegExp(`^[${chars}]+`, 'g'), '')
              .replace(new RegExp(`[${chars}]+$`, 'g'), '');
      }
      return str.trim();
  }
  function strip_newlines(v) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.replace(/\r?\n/gm, '');
  }
  function capitalize(str) {
      str = stringify(str);
      this.context.memoryLimit.use(str.length);
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  function replace(v, pattern, replacement) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.split(stringify(pattern)).join(replacement);
  }
  function replace_first(v, arg1, arg2) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.replace(stringify(arg1), arg2);
  }
  function replace_last(v, arg1, arg2) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      const pattern = stringify(arg1);
      const index = str.lastIndexOf(pattern);
      if (index === -1)
          return str;
      const replacement = stringify(arg2);
      return str.substring(0, index) + replacement + str.substring(index + pattern.length);
  }
  function truncate(v, l = 50, o = '...') {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      if (str.length <= l)
          return v;
      return str.substring(0, l - o.length) + o;
  }
  function truncatewords(v, words = 15, o = '...') {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      const arr = str.split(/\s+/);
      if (words <= 0)
          words = 1;
      let ret = arr.slice(0, words).join(' ');
      if (arr.length >= words)
          ret += o;
      return ret;
  }
  function normalize_whitespace(v) {
      const str = stringify(v);
      this.context.memoryLimit.use(str.length);
      return str.replace(/\s+/g, ' ');
  }
  function number_of_words(input, mode) {
      const str = stringify(input);
      this.context.memoryLimit.use(str.length);
      input = str.trim();
      if (!input)
          return 0;
      switch (mode) {
          case 'cjk':
              // Count CJK characters and words
              return (input.match(rCJKWord) || []).length + (input.match(rNonCJKWord) || []).length;
          case 'auto':
              // Count CJK characters, if none, count words
              return rCJKWord.test(input)
                  ? input.match(rCJKWord).length + (input.match(rNonCJKWord) || []).length
                  : input.split(/\s+/).length;
          default:
              // Count words only
              return input.split(/\s+/).length;
      }
  }
  function array_to_sentence_string(array, connector = 'and') {
      this.context.memoryLimit.use(array.length);
      switch (array.length) {
          case 0:
              return '';
          case 1:
              return array[0];
          case 2:
              return `${array[0]} ${connector} ${array[1]}`;
          default:
              return `${array.slice(0, -1).join(', ')}, ${connector} ${array[array.length - 1]}`;
      }
  }

  var stringFilters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    append: append,
    prepend: prepend,
    lstrip: lstrip,
    downcase: downcase,
    upcase: upcase,
    remove: remove,
    remove_first: remove_first,
    remove_last: remove_last,
    rstrip: rstrip,
    split: split,
    strip: strip,
    strip_newlines: strip_newlines,
    capitalize: capitalize,
    replace: replace,
    replace_first: replace_first,
    replace_last: replace_last,
    truncate: truncate,
    truncatewords: truncatewords,
    normalize_whitespace: normalize_whitespace,
    number_of_words: number_of_words,
    array_to_sentence_string: array_to_sentence_string
  });

  const filters = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, htmlFilters), mathFilters), urlFilters), arrayFilters), dateFilters), stringFilters), misc);

  class AssignTag extends Tag {
      constructor(token, remainTokens, liquid) {
          super(token, remainTokens, liquid);
          this.key = this.tokenizer.readIdentifier().content;
          this.tokenizer.assert(this.key, 'expected variable name');
          this.tokenizer.skipBlank();
          this.tokenizer.assert(this.tokenizer.peek() === '=', 'expected "="');
          this.tokenizer.advance();
          this.value = new Value(this.tokenizer.readFilteredValue(), this.liquid);
      }
      *render(ctx) {
          ctx.bottom()[this.key] = yield this.value.value(ctx, this.liquid.options.lenientIf);
      }
  }

  const MODIFIERS = ['offset', 'limit', 'reversed'];
  class ForTag extends Tag {
      constructor(token, remainTokens, liquid, parser) {
          super(token, remainTokens, liquid);
          const variable = this.tokenizer.readIdentifier();
          const inStr = this.tokenizer.readIdentifier();
          const collection = this.tokenizer.readValue();
          if (!variable.size() || inStr.content !== 'in' || !collection) {
              throw new Error(`illegal tag: ${token.getText()}`);
          }
          this.variable = variable.content;
          this.collection = collection;
          this.hash = new Hash(this.tokenizer.remaining(), liquid.options.keyValueSeparator);
          this.templates = [];
          this.elseTemplates = [];
          let p;
          const stream = parser.parseStream(remainTokens)
              .on('start', () => (p = this.templates))
              .on('tag:else', tag => { assertEmpty(tag.args); p = this.elseTemplates; })
              .on('tag:endfor', tag => { assertEmpty(tag.args); stream.stop(); })
              .on('template', (tpl) => p.push(tpl))
              .on('end', () => { throw new Error(`tag ${token.getText()} not closed`); });
          stream.start();
      }
      *render(ctx, emitter) {
          const r = this.liquid.renderer;
          let collection = toEnumerable(yield evalToken(this.collection, ctx));
          if (!collection.length) {
              yield r.renderTemplates(this.elseTemplates, ctx, emitter);
              return;
          }
          const continueKey = 'continue-' + this.variable + '-' + this.collection.getText();
          ctx.push({ continue: ctx.getRegister(continueKey) });
          const hash = yield this.hash.render(ctx);
          ctx.pop();
          const modifiers = this.liquid.options.orderedFilterParameters
              ? Object.keys(hash).filter(x => MODIFIERS.includes(x))
              : MODIFIERS.filter(x => hash[x] !== undefined);
          collection = modifiers.reduce((collection, modifier) => {
              if (modifier === 'offset')
                  return offset(collection, hash['offset']);
              if (modifier === 'limit')
                  return limit(collection, hash['limit']);
              return reversed(collection);
          }, collection);
          ctx.setRegister(continueKey, (hash['offset'] || 0) + collection.length);
          const scope = { forloop: new ForloopDrop(collection.length, this.collection.getText(), this.variable) };
          ctx.push(scope);
          for (const item of collection) {
              scope[this.variable] = item;
              yield r.renderTemplates(this.templates, ctx, emitter);
              if (emitter['break']) {
                  emitter['break'] = false;
                  break;
              }
              emitter['continue'] = false;
              scope.forloop.next();
          }
          ctx.pop();
      }
  }
  function reversed(arr) {
      return [...arr].reverse();
  }
  function offset(arr, count) {
      return arr.slice(count);
  }
  function limit(arr, count) {
      return arr.slice(0, count);
  }

  class CaptureTag extends Tag {
      constructor(tagToken, remainTokens, liquid, parser) {
          super(tagToken, remainTokens, liquid);
          this.templates = [];
          this.variable = this.readVariableName();
          while (remainTokens.length) {
              const token = remainTokens.shift();
              if (isTagToken(token) && token.name === 'endcapture')
                  return;
              this.templates.push(parser.parseToken(token, remainTokens));
          }
          throw new Error(`tag ${tagToken.getText()} not closed`);
      }
      *render(ctx) {
          const r = this.liquid.renderer;
          const html = yield r.renderTemplates(this.templates, ctx);
          ctx.bottom()[this.variable] = html;
      }
      readVariableName() {
          const word = this.tokenizer.readIdentifier().content;
          if (word)
              return word;
          const quoted = this.tokenizer.readQuoted();
          if (quoted)
              return evalQuotedToken(quoted);
          throw this.tokenizer.error('invalid capture name');
      }
  }

  class CaseTag extends Tag {
      constructor(tagToken, remainTokens, liquid, parser) {
          super(tagToken, remainTokens, liquid);
          this.branches = [];
          this.elseTemplates = [];
          this.value = new Value(this.tokenizer.readFilteredValue(), this.liquid);
          this.elseTemplates = [];
          let p = [];
          let elseCount = 0;
          const stream = parser.parseStream(remainTokens)
              .on('tag:when', (token) => {
              if (elseCount > 0) {
                  return;
              }
              p = [];
              const values = [];
              while (!token.tokenizer.end()) {
                  values.push(token.tokenizer.readValueOrThrow());
                  token.tokenizer.skipBlank();
                  if (token.tokenizer.peek() === ',') {
                      token.tokenizer.readTo(',');
                  }
                  else {
                      token.tokenizer.readTo('or');
                  }
              }
              this.branches.push({
                  values,
                  templates: p
              });
          })
              .on('tag:else', () => {
              elseCount++;
              p = this.elseTemplates;
          })
              .on('tag:endcase', () => stream.stop())
              .on('template', (tpl) => {
              if (p !== this.elseTemplates || elseCount === 1) {
                  p.push(tpl);
              }
          })
              .on('end', () => {
              throw new Error(`tag ${tagToken.getText()} not closed`);
          });
          stream.start();
      }
      *render(ctx, emitter) {
          const r = this.liquid.renderer;
          const target = toValue(yield this.value.value(ctx, ctx.opts.lenientIf));
          let branchHit = false;
          for (const branch of this.branches) {
              for (const valueToken of branch.values) {
                  const value = yield evalToken(valueToken, ctx, ctx.opts.lenientIf);
                  if (equals(target, value)) {
                      yield r.renderTemplates(branch.templates, ctx, emitter);
                      branchHit = true;
                      break;
                  }
              }
          }
          if (!branchHit) {
              yield r.renderTemplates(this.elseTemplates, ctx, emitter);
          }
      }
  }

  class CommentTag extends Tag {
      constructor(tagToken, remainTokens, liquid) {
          super(tagToken, remainTokens, liquid);
          while (remainTokens.length) {
              const token = remainTokens.shift();
              if (isTagToken(token) && token.name === 'endcomment')
                  return;
          }
          throw new Error(`tag ${tagToken.getText()} not closed`);
      }
      render() { }
  }

  class RenderTag extends Tag {
      constructor(token, remainTokens, liquid, parser) {
          super(token, remainTokens, liquid);
          const tokenizer = this.tokenizer;
          this.file = parseFilePath(tokenizer, this.liquid, parser);
          this.currentFile = token.file;
          while (!tokenizer.end()) {
              tokenizer.skipBlank();
              const begin = tokenizer.p;
              const keyword = tokenizer.readIdentifier();
              if (keyword.content === 'with' || keyword.content === 'for') {
                  tokenizer.skipBlank();
                  // can be normal key/value pair, like "with: true"
                  if (tokenizer.peek() !== ':') {
                      const value = tokenizer.readValue();
                      // can be normal key, like "with,"
                      if (value) {
                          const beforeAs = tokenizer.p;
                          const asStr = tokenizer.readIdentifier();
                          let alias;
                          if (asStr.content === 'as')
                              alias = tokenizer.readIdentifier();
                          else
                              tokenizer.p = beforeAs;
                          this[keyword.content] = { value, alias: alias && alias.content };
                          tokenizer.skipBlank();
                          if (tokenizer.peek() === ',')
                              tokenizer.advance();
                          continue; // matched!
                      }
                  }
              }
              /**
               * restore cursor if with/for not matched
               */
              tokenizer.p = begin;
              break;
          }
          this.hash = new Hash(tokenizer.remaining(), liquid.options.keyValueSeparator);
      }
      *render(ctx, emitter) {
          const { liquid, hash } = this;
          const filepath = (yield renderFilePath(this['file'], ctx, liquid));
          assert(filepath, () => `illegal file path "${filepath}"`);
          const childCtx = ctx.spawn();
          const scope = childCtx.bottom();
          __assign(scope, yield hash.render(ctx));
          if (this['with']) {
              const { value, alias } = this['with'];
              scope[alias || filepath] = yield evalToken(value, ctx);
          }
          if (this['for']) {
              const { value, alias } = this['for'];
              const collection = toEnumerable(yield evalToken(value, ctx));
              scope['forloop'] = new ForloopDrop(collection.length, value.getText(), alias);
              for (const item of collection) {
                  scope[alias] = item;
                  const templates = (yield liquid._parsePartialFile(filepath, childCtx.sync, this['currentFile']));
                  yield liquid.renderer.renderTemplates(templates, childCtx, emitter);
                  scope['forloop'].next();
              }
          }
          else {
              const templates = (yield liquid._parsePartialFile(filepath, childCtx.sync, this['currentFile']));
              yield liquid.renderer.renderTemplates(templates, childCtx, emitter);
          }
      }
  }
  /**
   * @return null for "none",
   * @return Template[] for quoted with tags and/or filters
   * @return Token for expression (not quoted)
   * @throws TypeError if cannot read next token
   */
  function parseFilePath(tokenizer, liquid, parser) {
      if (liquid.options.dynamicPartials) {
          const file = tokenizer.readValue();
          tokenizer.assert(file, 'illegal file path');
          if (file.getText() === 'none')
              return;
          if (isQuotedToken(file)) {
              // for filenames like "files/{{file}}", eval as liquid template
              const templates = parser.parse(evalQuotedToken(file));
              return optimize(templates);
          }
          return file;
      }
      const tokens = [...tokenizer.readFileNameTemplate(liquid.options)];
      const templates = optimize(parser.parseTokens(tokens));
      return templates === 'none' ? undefined : templates;
  }
  function optimize(templates) {
      // for filenames like "files/file.liquid", extract the string directly
      if (templates.length === 1 && isHTMLToken(templates[0].token))
          return templates[0].token.getContent();
      return templates;
  }
  function* renderFilePath(file, ctx, liquid) {
      if (typeof file === 'string')
          return file;
      if (Array.isArray(file))
          return liquid.renderer.renderTemplates(file, ctx);
      return yield evalToken(file, ctx);
  }

  class IncludeTag extends Tag {
      constructor(token, remainTokens, liquid, parser) {
          super(token, remainTokens, liquid);
          const { tokenizer } = token;
          this['file'] = parseFilePath(tokenizer, this.liquid, parser);
          this['currentFile'] = token.file;
          const begin = tokenizer.p;
          const withStr = tokenizer.readIdentifier();
          if (withStr.content === 'with') {
              tokenizer.skipBlank();
              if (tokenizer.peek() !== ':') {
                  this.withVar = tokenizer.readValue();
              }
              else
                  tokenizer.p = begin;
          }
          else
              tokenizer.p = begin;
          this.hash = new Hash(tokenizer.remaining(), liquid.options.jekyllInclude || liquid.options.keyValueSeparator);
      }
      *render(ctx, emitter) {
          const { liquid, hash, withVar } = this;
          const { renderer } = liquid;
          const filepath = (yield renderFilePath(this['file'], ctx, liquid));
          assert(filepath, () => `illegal file path "${filepath}"`);
          const saved = ctx.saveRegister('blocks', 'blockMode');
          ctx.setRegister('blocks', {});
          ctx.setRegister('blockMode', BlockMode.OUTPUT);
          const scope = (yield hash.render(ctx));
          if (withVar)
              scope[filepath] = yield evalToken(withVar, ctx);
          const templates = (yield liquid._parsePartialFile(filepath, ctx.sync, this['currentFile']));
          ctx.push(ctx.opts.jekyllInclude ? { include: scope } : scope);
          yield renderer.renderTemplates(templates, ctx, emitter);
          ctx.pop();
          ctx.restoreRegister(saved);
      }
  }

  class DecrementTag extends Tag {
      constructor(token, remainTokens, liquid) {
          super(token, remainTokens, liquid);
          this.variable = this.tokenizer.readIdentifier().content;
      }
      render(context, emitter) {
          const scope = context.environments;
          if (!isNumber(scope[this.variable])) {
              scope[this.variable] = 0;
          }
          emitter.write(stringify(--scope[this.variable]));
      }
  }

  class CycleTag extends Tag {
      constructor(token, remainTokens, liquid) {
          super(token, remainTokens, liquid);
          this.candidates = [];
          const group = this.tokenizer.readValue();
          this.tokenizer.skipBlank();
          if (group) {
              if (this.tokenizer.peek() === ':') {
                  this.group = group;
                  this.tokenizer.advance();
              }
              else
                  this.candidates.push(group);
          }
          while (!this.tokenizer.end()) {
              const value = this.tokenizer.readValue();
              if (value)
                  this.candidates.push(value);
              this.tokenizer.readTo(',');
          }
          this.tokenizer.assert(this.candidates.length, () => `empty candidates: "${token.getText()}"`);
      }
      *render(ctx, emitter) {
          const group = (yield evalToken(this.group, ctx));
          const fingerprint = `cycle:${group}:` + this.candidates.join(',');
          const groups = ctx.getRegister('cycle');
          let idx = groups[fingerprint];
          if (idx === undefined) {
              idx = groups[fingerprint] = 0;
          }
          const candidate = this.candidates[idx];
          idx = (idx + 1) % this.candidates.length;
          groups[fingerprint] = idx;
          return yield evalToken(candidate, ctx);
      }
  }

  class IfTag extends Tag {
      constructor(tagToken, remainTokens, liquid, parser) {
          super(tagToken, remainTokens, liquid);
          this.branches = [];
          let p = [];
          parser.parseStream(remainTokens)
              .on('start', () => this.branches.push({
              value: new Value(tagToken.args, this.liquid),
              templates: (p = [])
          }))
              .on('tag:elsif', (token) => {
              assert(!this.elseTemplates, 'unexpected elsif after else');
              this.branches.push({
                  value: new Value(token.args, this.liquid),
                  templates: (p = [])
              });
          })
              .on('tag:else', tag => {
              assertEmpty(tag.args);
              assert(!this.elseTemplates, 'duplicated else');
              p = this.elseTemplates = [];
          })
              .on('tag:endif', function (tag) { assertEmpty(tag.args); this.stop(); })
              .on('template', (tpl) => p.push(tpl))
              .on('end', () => { throw new Error(`tag ${tagToken.getText()} not closed`); })
              .start();
      }
      *render(ctx, emitter) {
          const r = this.liquid.renderer;
          for (const { value, templates } of this.branches) {
              const v = yield value.value(ctx, ctx.opts.lenientIf);
              if (isTruthy(v, ctx)) {
                  yield r.renderTemplates(templates, ctx, emitter);
                  return;
              }
          }
          yield r.renderTemplates(this.elseTemplates || [], ctx, emitter);
      }
  }

  class IncrementTag extends Tag {
      constructor(token, remainTokens, liquid) {
          super(token, remainTokens, liquid);
          this.variable = this.tokenizer.readIdentifier().content;
      }
      render(context, emitter) {
          const scope = context.environments;
          if (!isNumber(scope[this.variable])) {
              scope[this.variable] = 0;
          }
          const val = scope[this.variable];
          scope[this.variable]++;
          emitter.write(stringify(val));
      }
  }

  class LayoutTag extends Tag {
      constructor(token, remainTokens, liquid, parser) {
          super(token, remainTokens, liquid);
          this.file = parseFilePath(this.tokenizer, this.liquid, parser);
          this['currentFile'] = token.file;
          this.args = new Hash(this.tokenizer.remaining(), liquid.options.keyValueSeparator);
          this.templates = parser.parseTokens(remainTokens);
      }
      *render(ctx, emitter) {
          const { liquid, args, file } = this;
          const { renderer } = liquid;
          if (file === undefined) {
              ctx.setRegister('blockMode', BlockMode.OUTPUT);
              yield renderer.renderTemplates(this.templates, ctx, emitter);
              return;
          }
          const filepath = (yield renderFilePath(this.file, ctx, liquid));
          assert(filepath, () => `illegal file path "${filepath}"`);
          const templates = (yield liquid._parseLayoutFile(filepath, ctx.sync, this['currentFile']));
          // render remaining contents and store rendered results
          ctx.setRegister('blockMode', BlockMode.STORE);
          const html = yield renderer.renderTemplates(this.templates, ctx);
          const blocks = ctx.getRegister('blocks');
          // set whole content to anonymous block if anonymous doesn't specified
          if (blocks[''] === undefined)
              blocks[''] = (parent, emitter) => emitter.write(html);
          ctx.setRegister('blockMode', BlockMode.OUTPUT);
          // render the layout file use stored blocks
          ctx.push((yield args.render(ctx)));
          yield renderer.renderTemplates(templates, ctx, emitter);
          ctx.pop();
      }
  }

  class BlockTag extends Tag {
      constructor(token, remainTokens, liquid, parser) {
          super(token, remainTokens, liquid);
          this.templates = [];
          const match = /\w+/.exec(token.args);
          this.block = match ? match[0] : '';
          while (remainTokens.length) {
              const token = remainTokens.shift();
              if (isTagToken(token) && token.name === 'endblock')
                  return;
              const template = parser.parseToken(token, remainTokens);
              this.templates.push(template);
          }
          throw new Error(`tag ${token.getText()} not closed`);
      }
      *render(ctx, emitter) {
          const blockRender = this.getBlockRender(ctx);
          if (ctx.getRegister('blockMode') === BlockMode.STORE) {
              ctx.getRegister('blocks')[this.block] = blockRender;
          }
          else {
              yield blockRender(new BlockDrop(), emitter);
          }
      }
      getBlockRender(ctx) {
          const { liquid, templates } = this;
          const renderChild = ctx.getRegister('blocks')[this.block];
          const renderCurrent = function* (superBlock, emitter) {
              // add {{ block.super }} support when rendering
              ctx.push({ block: superBlock });
              yield liquid.renderer.renderTemplates(templates, ctx, emitter);
              ctx.pop();
          };
          return renderChild
              ? (superBlock, emitter) => renderChild(new BlockDrop(() => renderCurrent(superBlock, emitter)), emitter)
              : renderCurrent;
      }
  }

  class RawTag extends Tag {
      constructor(tagToken, remainTokens, liquid) {
          super(tagToken, remainTokens, liquid);
          this.tokens = [];
          while (remainTokens.length) {
              const token = remainTokens.shift();
              if (isTagToken(token) && token.name === 'endraw')
                  return;
              this.tokens.push(token);
          }
          throw new Error(`tag ${tagToken.getText()} not closed`);
      }
      render() {
          return this.tokens.map((token) => token.getText()).join('');
      }
  }

  class TablerowloopDrop extends ForloopDrop {
      constructor(length, cols, collection, variable) {
          super(length, collection, variable);
          this.length = length;
          this.cols = cols;
      }
      row() {
          return Math.floor(this.i / this.cols) + 1;
      }
      col0() {
          return (this.i % this.cols);
      }
      col() {
          return this.col0() + 1;
      }
      col_first() {
          return this.col0() === 0;
      }
      col_last() {
          return this.col() === this.cols;
      }
  }

  class TablerowTag extends Tag {
      constructor(tagToken, remainTokens, liquid, parser) {
          super(tagToken, remainTokens, liquid);
          const variable = this.tokenizer.readIdentifier();
          this.tokenizer.skipBlank();
          const predicate = this.tokenizer.readIdentifier();
          const collectionToken = this.tokenizer.readValue();
          if (predicate.content !== 'in' || !collectionToken) {
              throw new Error(`illegal tag: ${tagToken.getText()}`);
          }
          this.variable = variable.content;
          this.collection = collectionToken;
          this.args = new Hash(this.tokenizer.remaining(), liquid.options.keyValueSeparator);
          this.templates = [];
          let p;
          const stream = parser.parseStream(remainTokens)
              .on('start', () => (p = this.templates))
              .on('tag:endtablerow', () => stream.stop())
              .on('template', (tpl) => p.push(tpl))
              .on('end', () => {
              throw new Error(`tag ${tagToken.getText()} not closed`);
          });
          stream.start();
      }
      *render(ctx, emitter) {
          let collection = toEnumerable(yield evalToken(this.collection, ctx));
          const args = (yield this.args.render(ctx));
          const offset = args.offset || 0;
          const limit = (args.limit === undefined) ? collection.length : args.limit;
          collection = collection.slice(offset, offset + limit);
          const cols = args.cols || collection.length;
          const r = this.liquid.renderer;
          const tablerowloop = new TablerowloopDrop(collection.length, cols, this.collection.getText(), this.variable);
          const scope = { tablerowloop };
          ctx.push(scope);
          for (let idx = 0; idx < collection.length; idx++, tablerowloop.next()) {
              scope[this.variable] = collection[idx];
              if (tablerowloop.col0() === 0) {
                  if (tablerowloop.row() !== 1)
                      emitter.write('</tr>');
                  emitter.write(`<tr class="row${tablerowloop.row()}">`);
              }
              emitter.write(`<td class="col${tablerowloop.col()}">`);
              yield r.renderTemplates(this.templates, ctx, emitter);
              emitter.write('</td>');
          }
          if (collection.length)
              emitter.write('</tr>');
          ctx.pop();
      }
  }

  class UnlessTag extends Tag {
      constructor(tagToken, remainTokens, liquid, parser) {
          super(tagToken, remainTokens, liquid);
          this.branches = [];
          this.elseTemplates = [];
          let p = [];
          let elseCount = 0;
          parser.parseStream(remainTokens)
              .on('start', () => this.branches.push({
              value: new Value(tagToken.args, this.liquid),
              test: isFalsy,
              templates: (p = [])
          }))
              .on('tag:elsif', (token) => {
              if (elseCount > 0) {
                  p = [];
                  return;
              }
              this.branches.push({
                  value: new Value(token.args, this.liquid),
                  test: isTruthy,
                  templates: (p = [])
              });
          })
              .on('tag:else', () => {
              elseCount++;
              p = this.elseTemplates;
          })
              .on('tag:endunless', function () { this.stop(); })
              .on('template', (tpl) => {
              if (p !== this.elseTemplates || elseCount === 1) {
                  p.push(tpl);
              }
          })
              .on('end', () => { throw new Error(`tag ${tagToken.getText()} not closed`); })
              .start();
      }
      *render(ctx, emitter) {
          const r = this.liquid.renderer;
          for (const { value, test, templates } of this.branches) {
              const v = yield value.value(ctx, ctx.opts.lenientIf);
              if (test(v, ctx)) {
                  yield r.renderTemplates(templates, ctx, emitter);
                  return;
              }
          }
          yield r.renderTemplates(this.elseTemplates, ctx, emitter);
      }
  }

  class BreakTag extends Tag {
      render(ctx, emitter) {
          emitter['break'] = true;
      }
  }

  class ContinueTag extends Tag {
      render(ctx, emitter) {
          emitter['continue'] = true;
      }
  }

  class EchoTag extends Tag {
      constructor(token, remainTokens, liquid) {
          super(token, remainTokens, liquid);
          this.tokenizer.skipBlank();
          if (!this.tokenizer.end()) {
              this.value = new Value(this.tokenizer.readFilteredValue(), this.liquid);
          }
      }
      *render(ctx, emitter) {
          if (!this.value)
              return;
          const val = yield this.value.value(ctx, false);
          emitter.write(val);
      }
  }

  class LiquidTag extends Tag {
      constructor(token, remainTokens, liquid, parser) {
          super(token, remainTokens, liquid);
          const tokens = this.tokenizer.readLiquidTagTokens(this.liquid.options);
          this.templates = parser.parseTokens(tokens);
      }
      *render(ctx, emitter) {
          yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      }
  }

  class InlineCommentTag extends Tag {
      constructor(tagToken, remainTokens, liquid) {
          super(tagToken, remainTokens, liquid);
          if (tagToken.args.search(/\n\s*[^#\s]/g) !== -1) {
              throw new Error('every line of an inline comment must start with a \'#\' character');
          }
      }
      render() { }
  }

  const tags = {
      assign: AssignTag,
      'for': ForTag,
      capture: CaptureTag,
      'case': CaseTag,
      comment: CommentTag,
      include: IncludeTag,
      render: RenderTag,
      decrement: DecrementTag,
      increment: IncrementTag,
      cycle: CycleTag,
      'if': IfTag,
      layout: LayoutTag,
      block: BlockTag,
      raw: RawTag,
      tablerow: TablerowTag,
      unless: UnlessTag,
      'break': BreakTag,
      'continue': ContinueTag,
      echo: EchoTag,
      liquid: LiquidTag,
      '#': InlineCommentTag
  };

  class Liquid {
      constructor(opts = {}) {
          this.renderer = new Render();
          this.filters = {};
          this.tags = {};
          this.options = normalize(opts);
          // eslint-disable-next-line deprecation/deprecation
          this.parser = new Parser(this);
          forOwn(tags, (conf, name) => this.registerTag(name, conf));
          forOwn(filters, (handler, name) => this.registerFilter(name, handler));
      }
      parse(html, filepath) {
          const parser = new Parser(this);
          return parser.parse(html, filepath);
      }
      _render(tpl, scope, renderOptions) {
          const ctx = scope instanceof Context ? scope : new Context(scope, this.options, renderOptions);
          return this.renderer.renderTemplates(tpl, ctx);
      }
      render(tpl, scope, renderOptions) {
          return __awaiter(this, void 0, void 0, function* () {
              return toPromise(this._render(tpl, scope, Object.assign(Object.assign({}, renderOptions), { sync: false })));
          });
      }
      renderSync(tpl, scope, renderOptions) {
          return toValueSync(this._render(tpl, scope, Object.assign(Object.assign({}, renderOptions), { sync: true })));
      }
      renderToNodeStream(tpl, scope, renderOptions = {}) {
          const ctx = new Context(scope, this.options, renderOptions);
          return this.renderer.renderTemplatesToNodeStream(tpl, ctx);
      }
      _parseAndRender(html, scope, renderOptions) {
          const tpl = this.parse(html);
          return this._render(tpl, scope, renderOptions);
      }
      parseAndRender(html, scope, renderOptions) {
          return __awaiter(this, void 0, void 0, function* () {
              return toPromise(this._parseAndRender(html, scope, Object.assign(Object.assign({}, renderOptions), { sync: false })));
          });
      }
      parseAndRenderSync(html, scope, renderOptions) {
          return toValueSync(this._parseAndRender(html, scope, Object.assign(Object.assign({}, renderOptions), { sync: true })));
      }
      _parsePartialFile(file, sync, currentFile) {
          return new Parser(this).parseFile(file, sync, LookupType.Partials, currentFile);
      }
      _parseLayoutFile(file, sync, currentFile) {
          return new Parser(this).parseFile(file, sync, LookupType.Layouts, currentFile);
      }
      _parseFile(file, sync, lookupType, currentFile) {
          return new Parser(this).parseFile(file, sync, lookupType, currentFile);
      }
      parseFile(file, lookupType) {
          return __awaiter(this, void 0, void 0, function* () {
              return toPromise(new Parser(this).parseFile(file, false, lookupType));
          });
      }
      parseFileSync(file, lookupType) {
          return toValueSync(new Parser(this).parseFile(file, true, lookupType));
      }
      *_renderFile(file, ctx, renderFileOptions) {
          const templates = (yield this._parseFile(file, renderFileOptions.sync, renderFileOptions.lookupType));
          return yield this._render(templates, ctx, renderFileOptions);
      }
      renderFile(file, ctx, renderFileOptions) {
          return __awaiter(this, void 0, void 0, function* () {
              return toPromise(this._renderFile(file, ctx, Object.assign(Object.assign({}, renderFileOptions), { sync: false })));
          });
      }
      renderFileSync(file, ctx, renderFileOptions) {
          return toValueSync(this._renderFile(file, ctx, Object.assign(Object.assign({}, renderFileOptions), { sync: true })));
      }
      renderFileToNodeStream(file, scope, renderOptions) {
          return __awaiter(this, void 0, void 0, function* () {
              const templates = yield this.parseFile(file);
              return this.renderToNodeStream(templates, scope, renderOptions);
          });
      }
      _evalValue(str, scope) {
          const value = new Value(str, this);
          const ctx = scope instanceof Context ? scope : new Context(scope, this.options);
          return value.value(ctx);
      }
      evalValue(str, scope) {
          return __awaiter(this, void 0, void 0, function* () {
              return toPromise(this._evalValue(str, scope));
          });
      }
      evalValueSync(str, scope) {
          return toValueSync(this._evalValue(str, scope));
      }
      registerFilter(name, filter) {
          this.filters[name] = filter;
      }
      registerTag(name, tag) {
          this.tags[name] = isFunction(tag) ? tag : createTagClass(tag);
      }
      plugin(plugin) {
          return plugin.call(this, Liquid);
      }
      express() {
          const self = this; // eslint-disable-line
          let firstCall = true;
          return function (filePath, ctx, callback) {
              if (firstCall) {
                  firstCall = false;
                  const dirs = normalizeDirectoryList(this.root);
                  self.options.root.unshift(...dirs);
                  self.options.layouts.unshift(...dirs);
                  self.options.partials.unshift(...dirs);
              }
              self.renderFile(filePath, ctx).then(html => callback(null, html), callback);
          };
      }
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var nunjucks = {exports: {}};

  /*! Browser bundle of nunjucks 3.2.3  */
  (function (module, exports) {
      (function webpackUniversalModuleDefinition(root, factory) {
          module.exports = factory();
      })(typeof self !== "undefined" ? self : commonjsGlobal, function () {
          return /******/ (function (modules) {
              // webpackBootstrap
              /******/ // The module cache
              /******/ var installedModules = {};
              /******/
              /******/ // The require function
              /******/ function __webpack_require__(moduleId) {
                  /******/
                  /******/ // Check if module is in cache
                  /******/ if (installedModules[moduleId]) {
                      /******/ return installedModules[moduleId].exports;
                      /******/
                  }
                  /******/ // Create a new module (and put it into the cache)
                  /******/ var module = (installedModules[moduleId] = {
                      /******/ i: moduleId,
                      /******/ l: false,
                      /******/ exports: {},
                      /******/
                  });
                  /******/
                  /******/ // Execute the module function
                  /******/ modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
                  /******/
                  /******/ // Flag the module as loaded
                  /******/ module.l = true;
                  /******/
                  /******/ // Return the exports of the module
                  /******/ return module.exports;
                  /******/
              }
              /******/
              /******/
              /******/ // expose the modules object (__webpack_modules__)
              /******/ __webpack_require__.m = modules;
              /******/
              /******/ // expose the module cache
              /******/ __webpack_require__.c = installedModules;
              /******/
              /******/ // define getter function for harmony exports
              /******/ __webpack_require__.d = function (exports, name, getter) {
                  /******/ if (!__webpack_require__.o(exports, name)) {
                      /******/ Object.defineProperty(exports, name, {
                          /******/ configurable: false,
                          /******/ enumerable: true,
                          /******/ get: getter,
                          /******/
                      });
                      /******/
                  }
                  /******/
              };
              /******/
              /******/ // getDefaultExport function for compatibility with non-harmony modules
              /******/ __webpack_require__.n = function (module) {
                  /******/ var getter = module && module.__esModule
                      ? /******/ function getDefault() {
                          return module["default"];
                      }
                      : /******/ function getModuleExports() {
                          return module;
                      };
                  /******/ __webpack_require__.d(getter, "a", getter);
                  /******/ return getter;
                  /******/
              };
              /******/
              /******/ // Object.prototype.hasOwnProperty.call
              /******/ __webpack_require__.o = function (object, property) {
                  return Object.prototype.hasOwnProperty.call(object, property);
              };
              /******/
              /******/ // __webpack_public_path__
              /******/ __webpack_require__.p = "";
              /******/
              /******/ // Load entry module and return exports
              /******/ return __webpack_require__((__webpack_require__.s = 11));
              /******/
          })(
          /************************************************************************/
          /******/ [
              /* 0 */
              /***/ function (module, exports, __webpack_require__) {
                  var ArrayProto = Array.prototype;
                  var ObjProto = Object.prototype;
                  var escapeMap = {
                      "&": "&amp;",
                      '"': "&quot;",
                      "'": "&#39;",
                      "<": "&lt;",
                      ">": "&gt;",
                  };
                  var escapeRegex = /[&"'<>]/g;
                  var exports = (module.exports = {});
                  function hasOwnProp(obj, k) {
                      return ObjProto.hasOwnProperty.call(obj, k);
                  }
                  exports.hasOwnProp = hasOwnProp;
                  function lookupEscape(ch) {
                      return escapeMap[ch];
                  }
                  function _prettifyError(path, withInternals, err) {
                      if (!err.Update) {
                          // not one of ours, cast it
                          err = new exports.TemplateError(err);
                      }
                      err.Update(path); // Unless they marked the dev flag, show them a trace from here
                      if (!withInternals) {
                          var old = err;
                          err = new Error(old.message);
                          err.name = old.name;
                      }
                      return err;
                  }
                  exports._prettifyError = _prettifyError;
                  function TemplateError(message, lineno, colno) {
                      var err;
                      var cause;
                      if (message instanceof Error) {
                          cause = message;
                          message = cause.name + ": " + cause.message;
                      }
                      if (Object.setPrototypeOf) {
                          err = new Error(message);
                          Object.setPrototypeOf(err, TemplateError.prototype);
                      }
                      else {
                          err = this;
                          Object.defineProperty(err, "message", {
                              enumerable: false,
                              writable: true,
                              value: message,
                          });
                      }
                      Object.defineProperty(err, "name", {
                          value: "Template render error",
                      });
                      if (Error.captureStackTrace) {
                          Error.captureStackTrace(err, this.constructor);
                      }
                      var getStack;
                      if (cause) {
                          var stackDescriptor = Object.getOwnPropertyDescriptor(cause, "stack");
                          getStack =
                              stackDescriptor &&
                                  (stackDescriptor.get ||
                                      function () {
                                          return stackDescriptor.value;
                                      });
                          if (!getStack) {
                              getStack = function getStack() {
                                  return cause.stack;
                              };
                          }
                      }
                      else {
                          var stack = new Error(message).stack;
                          getStack = function getStack() {
                              return stack;
                          };
                      }
                      Object.defineProperty(err, "stack", {
                          get: function get() {
                              return getStack.call(err);
                          },
                      });
                      Object.defineProperty(err, "cause", {
                          value: cause,
                      });
                      err.lineno = lineno;
                      err.colno = colno;
                      err.firstUpdate = true;
                      err.Update = function Update(path) {
                          var msg = "(" + (path || "unknown path") + ")"; // only show lineno + colno next to path of template
                          // where error occurred
                          if (this.firstUpdate) {
                              if (this.lineno && this.colno) {
                                  msg += " [Line " + this.lineno + ", Column " + this.colno + "]";
                              }
                              else if (this.lineno) {
                                  msg += " [Line " + this.lineno + "]";
                              }
                          }
                          msg += "\n ";
                          if (this.firstUpdate) {
                              msg += " ";
                          }
                          this.message = msg + (this.message || "");
                          this.firstUpdate = false;
                          return this;
                      };
                      return err;
                  }
                  if (Object.setPrototypeOf) {
                      Object.setPrototypeOf(TemplateError.prototype, Error.prototype);
                  }
                  else {
                      TemplateError.prototype = Object.create(Error.prototype, {
                          constructor: {
                              value: TemplateError,
                          },
                      });
                  }
                  exports.TemplateError = TemplateError;
                  function escape(val) {
                      return val.replace(escapeRegex, lookupEscape);
                  }
                  exports.escape = escape;
                  function isFunction(obj) {
                      return ObjProto.toString.call(obj) === "[object Function]";
                  }
                  exports.isFunction = isFunction;
                  function isArray(obj) {
                      return ObjProto.toString.call(obj) === "[object Array]";
                  }
                  exports.isArray = isArray;
                  function isString(obj) {
                      return ObjProto.toString.call(obj) === "[object String]";
                  }
                  exports.isString = isString;
                  function isObject(obj) {
                      return ObjProto.toString.call(obj) === "[object Object]";
                  }
                  exports.isObject = isObject;
                  /**
                   * @param {string|number} attr
                   * @returns {(string|number)[]}
                   * @private
                   */
                  function _prepareAttributeParts(attr) {
                      if (!attr) {
                          return [];
                      }
                      if (typeof attr === "string") {
                          return attr.split(".");
                      }
                      return [attr];
                  }
                  /**
                   * @param {string}   attribute      Attribute value. Dots allowed.
                   * @returns {function(Object): *}
                   */
                  function getAttrGetter(attribute) {
                      var parts = _prepareAttributeParts(attribute);
                      return function attrGetter(item) {
                          var _item = item;
                          for (var i = 0; i < parts.length; i++) {
                              var part = parts[i]; // If item is not an object, and we still got parts to handle, it means
                              // that something goes wrong. Just roll out to undefined in that case.
                              if (hasOwnProp(_item, part)) {
                                  _item = _item[part];
                              }
                              else {
                                  return undefined;
                              }
                          }
                          return _item;
                      };
                  }
                  exports.getAttrGetter = getAttrGetter;
                  function groupBy(obj, val, throwOnUndefined) {
                      var result = {};
                      var iterator = isFunction(val) ? val : getAttrGetter(val);
                      for (var i = 0; i < obj.length; i++) {
                          var value = obj[i];
                          var key = iterator(value, i);
                          if (key === undefined && throwOnUndefined === true) {
                              throw new TypeError('groupby: attribute "' + val + '" resolved to undefined');
                          }
                          (result[key] || (result[key] = [])).push(value);
                      }
                      return result;
                  }
                  exports.groupBy = groupBy;
                  function toArray(obj) {
                      return Array.prototype.slice.call(obj);
                  }
                  exports.toArray = toArray;
                  function without(array) {
                      var result = [];
                      if (!array) {
                          return result;
                      }
                      var length = array.length;
                      var contains = toArray(arguments).slice(1);
                      var index = -1;
                      while (++index < length) {
                          if (indexOf(contains, array[index]) === -1) {
                              result.push(array[index]);
                          }
                      }
                      return result;
                  }
                  exports.without = without;
                  function repeat(char_, n) {
                      var str = "";
                      for (var i = 0; i < n; i++) {
                          str += char_;
                      }
                      return str;
                  }
                  exports.repeat = repeat;
                  function each(obj, func, context) {
                      if (obj == null) {
                          return;
                      }
                      if (ArrayProto.forEach && obj.forEach === ArrayProto.forEach) {
                          obj.forEach(func, context);
                      }
                      else if (obj.length === +obj.length) {
                          for (var i = 0, l = obj.length; i < l; i++) {
                              func.call(context, obj[i], i, obj);
                          }
                      }
                  }
                  exports.each = each;
                  function map(obj, func) {
                      var results = [];
                      if (obj == null) {
                          return results;
                      }
                      if (ArrayProto.map && obj.map === ArrayProto.map) {
                          return obj.map(func);
                      }
                      for (var i = 0; i < obj.length; i++) {
                          results[results.length] = func(obj[i], i);
                      }
                      if (obj.length === +obj.length) {
                          results.length = obj.length;
                      }
                      return results;
                  }
                  exports.map = map;
                  function asyncIter(arr, iter, cb) {
                      var i = -1;
                      function next() {
                          i++;
                          if (i < arr.length) {
                              iter(arr[i], i, next, cb);
                          }
                          else {
                              cb();
                          }
                      }
                      next();
                  }
                  exports.asyncIter = asyncIter;
                  function asyncFor(obj, iter, cb) {
                      var keys = keys_(obj || {});
                      var len = keys.length;
                      var i = -1;
                      function next() {
                          i++;
                          var k = keys[i];
                          if (i < len) {
                              iter(k, obj[k], i, len, next);
                          }
                          else {
                              cb();
                          }
                      }
                      next();
                  }
                  exports.asyncFor = asyncFor;
                  function indexOf(arr, searchElement, fromIndex) {
                      return Array.prototype.indexOf.call(arr || [], searchElement, fromIndex);
                  }
                  exports.indexOf = indexOf;
                  function keys_(obj) {
                      /* eslint-disable no-restricted-syntax */
                      var arr = [];
                      for (var k in obj) {
                          if (hasOwnProp(obj, k)) {
                              arr.push(k);
                          }
                      }
                      return arr;
                  }
                  exports.keys = keys_;
                  function _entries(obj) {
                      return keys_(obj).map(function (k) {
                          return [k, obj[k]];
                      });
                  }
                  exports._entries = _entries;
                  function _values(obj) {
                      return keys_(obj).map(function (k) {
                          return obj[k];
                      });
                  }
                  exports._values = _values;
                  function extend(obj1, obj2) {
                      obj1 = obj1 || {};
                      keys_(obj2).forEach(function (k) {
                          obj1[k] = obj2[k];
                      });
                      return obj1;
                  }
                  exports._assign = exports.extend = extend;
                  function inOperator(key, val) {
                      if (isArray(val) || isString(val)) {
                          return val.indexOf(key) !== -1;
                      }
                      else if (isObject(val)) {
                          return key in val;
                      }
                      throw new Error('Cannot use "in" operator to search for "' +
                          key +
                          '" in unexpected types.');
                  }
                  exports.inOperator = inOperator;
                  /***/
              },
              /* 1 */
              /***/ function (module, exports, __webpack_require__) {
                  // A simple class system, more documentation to come
                  function _defineProperties(target, props) {
                      for (var i = 0; i < props.length; i++) {
                          var descriptor = props[i];
                          descriptor.enumerable = descriptor.enumerable || false;
                          descriptor.configurable = true;
                          if ("value" in descriptor)
                              descriptor.writable = true;
                          Object.defineProperty(target, descriptor.key, descriptor);
                      }
                  }
                  function _createClass(Constructor, protoProps, staticProps) {
                      if (protoProps)
                          _defineProperties(Constructor.prototype, protoProps);
                      if (staticProps)
                          _defineProperties(Constructor, staticProps);
                      return Constructor;
                  }
                  function _inheritsLoose(subClass, superClass) {
                      subClass.prototype = Object.create(superClass.prototype);
                      subClass.prototype.constructor = subClass;
                      _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                      _setPrototypeOf =
                          Object.setPrototypeOf ||
                              function _setPrototypeOf(o, p) {
                                  o.__proto__ = p;
                                  return o;
                              };
                      return _setPrototypeOf(o, p);
                  }
                  var EventEmitter = __webpack_require__(16);
                  var lib = __webpack_require__(0);
                  function parentWrap(parent, prop) {
                      if (typeof parent !== "function" || typeof prop !== "function") {
                          return prop;
                      }
                      return function wrap() {
                          // Save the current parent method
                          var tmp = this.parent; // Set parent to the previous method, call, and restore
                          this.parent = parent;
                          var res = prop.apply(this, arguments);
                          this.parent = tmp;
                          return res;
                      };
                  }
                  function extendClass(cls, name, props) {
                      props = props || {};
                      lib.keys(props).forEach(function (k) {
                          props[k] = parentWrap(cls.prototype[k], props[k]);
                      });
                      var subclass = /*#__PURE__*/ (function (_cls) {
                          _inheritsLoose(subclass, _cls);
                          function subclass() {
                              return _cls.apply(this, arguments) || this;
                          }
                          _createClass(subclass, [
                              {
                                  key: "typename",
                                  get: function get() {
                                      return name;
                                  },
                              },
                          ]);
                          return subclass;
                      })(cls);
                      lib._assign(subclass.prototype, props);
                      return subclass;
                  }
                  var Obj = /*#__PURE__*/ (function () {
                      function Obj() {
                          // Unfortunately necessary for backwards compatibility
                          this.init.apply(this, arguments);
                      }
                      var _proto = Obj.prototype;
                      _proto.init = function init() { };
                      Obj.extend = function extend(name, props) {
                          if (typeof name === "object") {
                              props = name;
                              name = "anonymous";
                          }
                          return extendClass(this, name, props);
                      };
                      _createClass(Obj, [
                          {
                              key: "typename",
                              get: function get() {
                                  return this.constructor.name;
                              },
                          },
                      ]);
                      return Obj;
                  })();
                  var EmitterObj = /*#__PURE__*/ (function (_EventEmitter) {
                      _inheritsLoose(EmitterObj, _EventEmitter);
                      function EmitterObj() {
                          var _this2;
                          var _this;
                          _this = _EventEmitter.call(this) || this; // Unfortunately necessary for backwards compatibility
                          (_this2 = _this).init.apply(_this2, arguments);
                          return _this;
                      }
                      var _proto2 = EmitterObj.prototype;
                      _proto2.init = function init() { };
                      EmitterObj.extend = function extend(name, props) {
                          if (typeof name === "object") {
                              props = name;
                              name = "anonymous";
                          }
                          return extendClass(this, name, props);
                      };
                      _createClass(EmitterObj, [
                          {
                              key: "typename",
                              get: function get() {
                                  return this.constructor.name;
                              },
                          },
                      ]);
                      return EmitterObj;
                  })(EventEmitter);
                  module.exports = {
                      Obj: Obj,
                      EmitterObj: EmitterObj,
                  };
                  /***/
              },
              /* 2 */
              /***/ function (module, exports, __webpack_require__) {
                  var lib = __webpack_require__(0);
                  var arrayFrom = Array.from;
                  var supportsIterators = typeof Symbol === "function" &&
                      Symbol.iterator &&
                      typeof arrayFrom === "function"; // Frames keep track of scoping both at compile-time and run-time so
                  // we know how to access variables. Block tags can introduce special
                  // variables, for example.
                  var Frame = /*#__PURE__*/ (function () {
                      function Frame(parent, isolateWrites) {
                          this.variables = Object.create(null);
                          this.parent = parent;
                          this.topLevel = false; // if this is true, writes (set) should never propagate upwards past
                          // this frame to its parent (though reads may).
                          this.isolateWrites = isolateWrites;
                      }
                      var _proto = Frame.prototype;
                      _proto.set = function set(name, val, resolveUp) {
                          // Allow variables with dots by automatically creating the
                          // nested structure
                          var parts = name.split(".");
                          var obj = this.variables;
                          var frame = this;
                          if (resolveUp) {
                              if ((frame = this.resolve(parts[0], true))) {
                                  frame.set(name, val);
                                  return;
                              }
                          }
                          for (var i = 0; i < parts.length - 1; i++) {
                              var id = parts[i];
                              if (!obj[id]) {
                                  obj[id] = {};
                              }
                              obj = obj[id];
                          }
                          obj[parts[parts.length - 1]] = val;
                      };
                      _proto.get = function get(name) {
                          var val = this.variables[name];
                          if (val !== undefined) {
                              return val;
                          }
                          return null;
                      };
                      _proto.lookup = function lookup(name) {
                          var p = this.parent;
                          var val = this.variables[name];
                          if (val !== undefined) {
                              return val;
                          }
                          return p && p.lookup(name);
                      };
                      _proto.resolve = function resolve(name, forWrite) {
                          var p = forWrite && this.isolateWrites ? undefined : this.parent;
                          var val = this.variables[name];
                          if (val !== undefined) {
                              return this;
                          }
                          return p && p.resolve(name);
                      };
                      _proto.push = function push(isolateWrites) {
                          return new Frame(this, isolateWrites);
                      };
                      _proto.pop = function pop() {
                          return this.parent;
                      };
                      return Frame;
                  })();
                  function makeMacro(argNames, kwargNames, func) {
                      return function macro() {
                          for (var _len = arguments.length, macroArgs = new Array(_len), _key = 0; _key < _len; _key++) {
                              macroArgs[_key] = arguments[_key];
                          }
                          var argCount = numArgs(macroArgs);
                          var args;
                          var kwargs = getKeywordArgs(macroArgs);
                          if (argCount > argNames.length) {
                              args = macroArgs.slice(0, argNames.length); // Positional arguments that should be passed in as
                              // keyword arguments (essentially default values)
                              macroArgs.slice(args.length, argCount).forEach(function (val, i) {
                                  if (i < kwargNames.length) {
                                      kwargs[kwargNames[i]] = val;
                                  }
                              });
                              args.push(kwargs);
                          }
                          else if (argCount < argNames.length) {
                              args = macroArgs.slice(0, argCount);
                              for (var i = argCount; i < argNames.length; i++) {
                                  var arg = argNames[i]; // Keyword arguments that should be passed as
                                  // positional arguments, i.e. the caller explicitly
                                  // used the name of a positional arg
                                  args.push(kwargs[arg]);
                                  delete kwargs[arg];
                              }
                              args.push(kwargs);
                          }
                          else {
                              args = macroArgs;
                          }
                          return func.apply(this, args);
                      };
                  }
                  function makeKeywordArgs(obj) {
                      obj.__keywords = true;
                      return obj;
                  }
                  function isKeywordArgs(obj) {
                      return obj && Object.prototype.hasOwnProperty.call(obj, "__keywords");
                  }
                  function getKeywordArgs(args) {
                      var len = args.length;
                      if (len) {
                          var lastArg = args[len - 1];
                          if (isKeywordArgs(lastArg)) {
                              return lastArg;
                          }
                      }
                      return {};
                  }
                  function numArgs(args) {
                      var len = args.length;
                      if (len === 0) {
                          return 0;
                      }
                      var lastArg = args[len - 1];
                      if (isKeywordArgs(lastArg)) {
                          return len - 1;
                      }
                      else {
                          return len;
                      }
                  } // A SafeString object indicates that the string should not be
                  // autoescaped. This happens magically because autoescaping only
                  // occurs on primitive string objects.
                  function SafeString(val) {
                      if (typeof val !== "string") {
                          return val;
                      }
                      this.val = val;
                      this.length = val.length;
                  }
                  SafeString.prototype = Object.create(String.prototype, {
                      length: {
                          writable: true,
                          configurable: true,
                          value: 0,
                      },
                  });
                  SafeString.prototype.valueOf = function valueOf() {
                      return this.val;
                  };
                  SafeString.prototype.toString = function toString() {
                      return this.val;
                  };
                  function copySafeness(dest, target) {
                      if (dest instanceof SafeString) {
                          return new SafeString(target);
                      }
                      return target.toString();
                  }
                  function markSafe(val) {
                      var type = typeof val;
                      if (type === "string") {
                          return new SafeString(val);
                      }
                      else if (type !== "function") {
                          return val;
                      }
                      else {
                          return function wrapSafe(args) {
                              var ret = val.apply(this, arguments);
                              if (typeof ret === "string") {
                                  return new SafeString(ret);
                              }
                              return ret;
                          };
                      }
                  }
                  function suppressValue(val, autoescape) {
                      val = val !== undefined && val !== null ? val : "";
                      if (autoescape && !(val instanceof SafeString)) {
                          val = lib.escape(val.toString());
                      }
                      return val;
                  }
                  function ensureDefined(val, lineno, colno) {
                      if (val === null || val === undefined) {
                          throw new lib.TemplateError("attempted to output null or undefined value", lineno + 1, colno + 1);
                      }
                      return val;
                  }
                  function memberLookup(obj, val) {
                      if (obj === undefined || obj === null) {
                          return undefined;
                      }
                      if (typeof obj[val] === "function") {
                          return function () {
                              for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                                  args[_key2] = arguments[_key2];
                              }
                              return obj[val].apply(obj, args);
                          };
                      }
                      return obj[val];
                  }
                  function callWrap(obj, name, context, args) {
                      if (!obj) {
                          throw new Error("Unable to call `" + name + "`, which is undefined or falsey");
                      }
                      else if (typeof obj !== "function") {
                          throw new Error("Unable to call `" + name + "`, which is not a function");
                      }
                      return obj.apply(context, args);
                  }
                  function contextOrFrameLookup(context, frame, name) {
                      var val = frame.lookup(name);
                      return val !== undefined ? val : context.lookup(name);
                  }
                  function handleError(error, lineno, colno) {
                      if (error.lineno) {
                          return error;
                      }
                      else {
                          return new lib.TemplateError(error, lineno, colno);
                      }
                  }
                  function asyncEach(arr, dimen, iter, cb) {
                      if (lib.isArray(arr)) {
                          var len = arr.length;
                          lib.asyncIter(arr, function iterCallback(item, i, next) {
                              switch (dimen) {
                                  case 1:
                                      iter(item, i, len, next);
                                      break;
                                  case 2:
                                      iter(item[0], item[1], i, len, next);
                                      break;
                                  case 3:
                                      iter(item[0], item[1], item[2], i, len, next);
                                      break;
                                  default:
                                      item.push(i, len, next);
                                      iter.apply(this, item);
                              }
                          }, cb);
                      }
                      else {
                          lib.asyncFor(arr, function iterCallback(key, val, i, len, next) {
                              iter(key, val, i, len, next);
                          }, cb);
                      }
                  }
                  function asyncAll(arr, dimen, func, cb) {
                      var finished = 0;
                      var len;
                      var outputArr;
                      function done(i, output) {
                          finished++;
                          outputArr[i] = output;
                          if (finished === len) {
                              cb(null, outputArr.join(""));
                          }
                      }
                      if (lib.isArray(arr)) {
                          len = arr.length;
                          outputArr = new Array(len);
                          if (len === 0) {
                              cb(null, "");
                          }
                          else {
                              for (var i = 0; i < arr.length; i++) {
                                  var item = arr[i];
                                  switch (dimen) {
                                      case 1:
                                          func(item, i, len, done);
                                          break;
                                      case 2:
                                          func(item[0], item[1], i, len, done);
                                          break;
                                      case 3:
                                          func(item[0], item[1], item[2], i, len, done);
                                          break;
                                      default:
                                          item.push(i, len, done);
                                          func.apply(this, item);
                                  }
                              }
                          }
                      }
                      else {
                          var keys = lib.keys(arr || {});
                          len = keys.length;
                          outputArr = new Array(len);
                          if (len === 0) {
                              cb(null, "");
                          }
                          else {
                              for (var _i = 0; _i < keys.length; _i++) {
                                  var k = keys[_i];
                                  func(k, arr[k], _i, len, done);
                              }
                          }
                      }
                  }
                  function fromIterator(arr) {
                      if (typeof arr !== "object" || arr === null || lib.isArray(arr)) {
                          return arr;
                      }
                      else if (supportsIterators && Symbol.iterator in arr) {
                          return arrayFrom(arr);
                      }
                      else {
                          return arr;
                      }
                  }
                  module.exports = {
                      Frame: Frame,
                      makeMacro: makeMacro,
                      makeKeywordArgs: makeKeywordArgs,
                      numArgs: numArgs,
                      suppressValue: suppressValue,
                      ensureDefined: ensureDefined,
                      memberLookup: memberLookup,
                      contextOrFrameLookup: contextOrFrameLookup,
                      callWrap: callWrap,
                      handleError: handleError,
                      isArray: lib.isArray,
                      keys: lib.keys,
                      SafeString: SafeString,
                      copySafeness: copySafeness,
                      markSafe: markSafe,
                      asyncEach: asyncEach,
                      asyncAll: asyncAll,
                      inOperator: lib.inOperator,
                      fromIterator: fromIterator,
                  };
                  /***/
              },
              /* 3 */
              /***/ function (module, exports, __webpack_require__) {
                  function _defineProperties(target, props) {
                      for (var i = 0; i < props.length; i++) {
                          var descriptor = props[i];
                          descriptor.enumerable = descriptor.enumerable || false;
                          descriptor.configurable = true;
                          if ("value" in descriptor)
                              descriptor.writable = true;
                          Object.defineProperty(target, descriptor.key, descriptor);
                      }
                  }
                  function _createClass(Constructor, protoProps, staticProps) {
                      if (protoProps)
                          _defineProperties(Constructor.prototype, protoProps);
                      if (staticProps)
                          _defineProperties(Constructor, staticProps);
                      return Constructor;
                  }
                  function _inheritsLoose(subClass, superClass) {
                      subClass.prototype = Object.create(superClass.prototype);
                      subClass.prototype.constructor = subClass;
                      _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                      _setPrototypeOf =
                          Object.setPrototypeOf ||
                              function _setPrototypeOf(o, p) {
                                  o.__proto__ = p;
                                  return o;
                              };
                      return _setPrototypeOf(o, p);
                  }
                  var _require = __webpack_require__(1), Obj = _require.Obj;
                  function traverseAndCheck(obj, type, results) {
                      if (obj instanceof type) {
                          results.push(obj);
                      }
                      if (obj instanceof Node) {
                          obj.findAll(type, results);
                      }
                  }
                  var Node = /*#__PURE__*/ (function (_Obj) {
                      _inheritsLoose(Node, _Obj);
                      function Node() {
                          return _Obj.apply(this, arguments) || this;
                      }
                      var _proto = Node.prototype;
                      _proto.init = function init(lineno, colno) {
                          var _arguments = arguments, _this = this;
                          for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                              args[_key - 2] = arguments[_key];
                          }
                          this.lineno = lineno;
                          this.colno = colno;
                          this.fields.forEach(function (field, i) {
                              // The first two args are line/col numbers, so offset by 2
                              var val = _arguments[i + 2]; // Fields should never be undefined, but null. It makes
                              // testing easier to normalize values.
                              if (val === undefined) {
                                  val = null;
                              }
                              _this[field] = val;
                          });
                      };
                      _proto.findAll = function findAll(type, results) {
                          var _this2 = this;
                          results = results || [];
                          if (this instanceof NodeList) {
                              this.children.forEach(function (child) {
                                  return traverseAndCheck(child, type, results);
                              });
                          }
                          else {
                              this.fields.forEach(function (field) {
                                  return traverseAndCheck(_this2[field], type, results);
                              });
                          }
                          return results;
                      };
                      _proto.iterFields = function iterFields(func) {
                          var _this3 = this;
                          this.fields.forEach(function (field) {
                              func(_this3[field], field);
                          });
                      };
                      return Node;
                  })(Obj); // Abstract nodes
                  var Value = /*#__PURE__*/ (function (_Node) {
                      _inheritsLoose(Value, _Node);
                      function Value() {
                          return _Node.apply(this, arguments) || this;
                      }
                      _createClass(Value, [
                          {
                              key: "typename",
                              get: function get() {
                                  return "Value";
                              },
                          },
                          {
                              key: "fields",
                              get: function get() {
                                  return ["value"];
                              },
                          },
                      ]);
                      return Value;
                  })(Node); // Concrete nodes
                  var NodeList = /*#__PURE__*/ (function (_Node2) {
                      _inheritsLoose(NodeList, _Node2);
                      function NodeList() {
                          return _Node2.apply(this, arguments) || this;
                      }
                      var _proto2 = NodeList.prototype;
                      _proto2.init = function init(lineno, colno, nodes) {
                          _Node2.prototype.init.call(this, lineno, colno, nodes || []);
                      };
                      _proto2.addChild = function addChild(node) {
                          this.children.push(node);
                      };
                      _createClass(NodeList, [
                          {
                              key: "typename",
                              get: function get() {
                                  return "NodeList";
                              },
                          },
                          {
                              key: "fields",
                              get: function get() {
                                  return ["children"];
                              },
                          },
                      ]);
                      return NodeList;
                  })(Node);
                  var Root = NodeList.extend("Root");
                  var Literal = Value.extend("Literal");
                  var Symbol = Value.extend("Symbol");
                  var Group = NodeList.extend("Group");
                  var ArrayNode = NodeList.extend("Array");
                  var Pair = Node.extend("Pair", {
                      fields: ["key", "value"],
                  });
                  var Dict = NodeList.extend("Dict");
                  var LookupVal = Node.extend("LookupVal", {
                      fields: ["target", "val"],
                  });
                  var If = Node.extend("If", {
                      fields: ["cond", "body", "else_"],
                  });
                  var IfAsync = If.extend("IfAsync");
                  var InlineIf = Node.extend("InlineIf", {
                      fields: ["cond", "body", "else_"],
                  });
                  var For = Node.extend("For", {
                      fields: ["arr", "name", "body", "else_"],
                  });
                  var AsyncEach = For.extend("AsyncEach");
                  var AsyncAll = For.extend("AsyncAll");
                  var Macro = Node.extend("Macro", {
                      fields: ["name", "args", "body"],
                  });
                  var Caller = Macro.extend("Caller");
                  var Import = Node.extend("Import", {
                      fields: ["template", "target", "withContext"],
                  });
                  var FromImport = /*#__PURE__*/ (function (_Node3) {
                      _inheritsLoose(FromImport, _Node3);
                      function FromImport() {
                          return _Node3.apply(this, arguments) || this;
                      }
                      var _proto3 = FromImport.prototype;
                      _proto3.init = function init(lineno, colno, template, names, withContext) {
                          _Node3.prototype.init.call(this, lineno, colno, template, names || new NodeList(), withContext);
                      };
                      _createClass(FromImport, [
                          {
                              key: "typename",
                              get: function get() {
                                  return "FromImport";
                              },
                          },
                          {
                              key: "fields",
                              get: function get() {
                                  return ["template", "names", "withContext"];
                              },
                          },
                      ]);
                      return FromImport;
                  })(Node);
                  var FunCall = Node.extend("FunCall", {
                      fields: ["name", "args"],
                  });
                  var Filter = FunCall.extend("Filter");
                  var FilterAsync = Filter.extend("FilterAsync", {
                      fields: ["name", "args", "symbol"],
                  });
                  var KeywordArgs = Dict.extend("KeywordArgs");
                  var Block = Node.extend("Block", {
                      fields: ["name", "body"],
                  });
                  var Super = Node.extend("Super", {
                      fields: ["blockName", "symbol"],
                  });
                  var TemplateRef = Node.extend("TemplateRef", {
                      fields: ["template"],
                  });
                  var Extends = TemplateRef.extend("Extends");
                  var Include = Node.extend("Include", {
                      fields: ["template", "ignoreMissing"],
                  });
                  var Set = Node.extend("Set", {
                      fields: ["targets", "value"],
                  });
                  var Switch = Node.extend("Switch", {
                      fields: ["expr", "cases", "default"],
                  });
                  var Case = Node.extend("Case", {
                      fields: ["cond", "body"],
                  });
                  var Output = NodeList.extend("Output");
                  var Capture = Node.extend("Capture", {
                      fields: ["body"],
                  });
                  var TemplateData = Literal.extend("TemplateData");
                  var UnaryOp = Node.extend("UnaryOp", {
                      fields: ["target"],
                  });
                  var BinOp = Node.extend("BinOp", {
                      fields: ["left", "right"],
                  });
                  var In = BinOp.extend("In");
                  var Is = BinOp.extend("Is");
                  var Or = BinOp.extend("Or");
                  var And = BinOp.extend("And");
                  var Not = UnaryOp.extend("Not");
                  var Add = BinOp.extend("Add");
                  var Concat = BinOp.extend("Concat");
                  var Sub = BinOp.extend("Sub");
                  var Mul = BinOp.extend("Mul");
                  var Div = BinOp.extend("Div");
                  var FloorDiv = BinOp.extend("FloorDiv");
                  var Mod = BinOp.extend("Mod");
                  var Pow = BinOp.extend("Pow");
                  var Neg = UnaryOp.extend("Neg");
                  var Pos = UnaryOp.extend("Pos");
                  var Compare = Node.extend("Compare", {
                      fields: ["expr", "ops"],
                  });
                  var CompareOperand = Node.extend("CompareOperand", {
                      fields: ["expr", "type"],
                  });
                  var CallExtension = Node.extend("CallExtension", {
                      init: function init(ext, prop, args, contentArgs) {
                          this.parent();
                          this.extName = ext.__name || ext;
                          this.prop = prop;
                          this.args = args || new NodeList();
                          this.contentArgs = contentArgs || [];
                          this.autoescape = ext.autoescape;
                      },
                      fields: ["extName", "prop", "args", "contentArgs"],
                  });
                  var CallExtensionAsync = CallExtension.extend("CallExtensionAsync"); // This is hacky, but this is just a debugging function anyway
                  function print(str, indent, inline) {
                      var lines = str.split("\n");
                      lines.forEach(function (line, i) {
                          if (line && ((inline && i > 0) || !inline)) {
                              process.stdout.write(" ".repeat(indent));
                          }
                          var nl = i === lines.length - 1 ? "" : "\n";
                          process.stdout.write("" + line + nl);
                      });
                  } // Print the AST in a nicely formatted tree format for debuggin
                  function printNodes(node, indent) {
                      indent = indent || 0;
                      print(node.typename + ": ", indent);
                      if (node instanceof NodeList) {
                          print("\n");
                          node.children.forEach(function (n) {
                              printNodes(n, indent + 2);
                          });
                      }
                      else if (node instanceof CallExtension) {
                          print(node.extName + "." + node.prop + "\n");
                          if (node.args) {
                              printNodes(node.args, indent + 2);
                          }
                          if (node.contentArgs) {
                              node.contentArgs.forEach(function (n) {
                                  printNodes(n, indent + 2);
                              });
                          }
                      }
                      else {
                          var nodes = [];
                          var props = null;
                          node.iterFields(function (val, fieldName) {
                              if (val instanceof Node) {
                                  nodes.push([fieldName, val]);
                              }
                              else {
                                  props = props || {};
                                  props[fieldName] = val;
                              }
                          });
                          if (props) {
                              print(JSON.stringify(props, null, 2) + "\n", null, true);
                          }
                          else {
                              print("\n");
                          }
                          nodes.forEach(function (_ref) {
                              var fieldName = _ref[0], n = _ref[1];
                              print("[" + fieldName + "] =>", indent + 2);
                              printNodes(n, indent + 4);
                          });
                      }
                  }
                  module.exports = {
                      Node: Node,
                      Root: Root,
                      NodeList: NodeList,
                      Value: Value,
                      Literal: Literal,
                      Symbol: Symbol,
                      Group: Group,
                      Array: ArrayNode,
                      Pair: Pair,
                      Dict: Dict,
                      Output: Output,
                      Capture: Capture,
                      TemplateData: TemplateData,
                      If: If,
                      IfAsync: IfAsync,
                      InlineIf: InlineIf,
                      For: For,
                      AsyncEach: AsyncEach,
                      AsyncAll: AsyncAll,
                      Macro: Macro,
                      Caller: Caller,
                      Import: Import,
                      FromImport: FromImport,
                      FunCall: FunCall,
                      Filter: Filter,
                      FilterAsync: FilterAsync,
                      KeywordArgs: KeywordArgs,
                      Block: Block,
                      Super: Super,
                      Extends: Extends,
                      Include: Include,
                      Set: Set,
                      Switch: Switch,
                      Case: Case,
                      LookupVal: LookupVal,
                      BinOp: BinOp,
                      In: In,
                      Is: Is,
                      Or: Or,
                      And: And,
                      Not: Not,
                      Add: Add,
                      Concat: Concat,
                      Sub: Sub,
                      Mul: Mul,
                      Div: Div,
                      FloorDiv: FloorDiv,
                      Mod: Mod,
                      Pow: Pow,
                      Neg: Neg,
                      Pos: Pos,
                      Compare: Compare,
                      CompareOperand: CompareOperand,
                      CallExtension: CallExtension,
                      CallExtensionAsync: CallExtensionAsync,
                      printNodes: printNodes,
                  };
                  /***/
              },
              /* 4 */
              /***/ function (module, exports) {
                  /***/
              },
              /* 5 */
              /***/ function (module, exports, __webpack_require__) {
                  function _inheritsLoose(subClass, superClass) {
                      subClass.prototype = Object.create(superClass.prototype);
                      subClass.prototype.constructor = subClass;
                      _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                      _setPrototypeOf =
                          Object.setPrototypeOf ||
                              function _setPrototypeOf(o, p) {
                                  o.__proto__ = p;
                                  return o;
                              };
                      return _setPrototypeOf(o, p);
                  }
                  var parser = __webpack_require__(8);
                  var transformer = __webpack_require__(17);
                  var nodes = __webpack_require__(3);
                  var _require = __webpack_require__(0), TemplateError = _require.TemplateError;
                  var _require2 = __webpack_require__(2), Frame = _require2.Frame;
                  var _require3 = __webpack_require__(1), Obj = _require3.Obj; // These are all the same for now, but shouldn't be passed straight
                  // through
                  var compareOps = {
                      "==": "==",
                      "===": "===",
                      "!=": "!=",
                      "!==": "!==",
                      "<": "<",
                      ">": ">",
                      "<=": "<=",
                      ">=": ">=",
                  };
                  var Compiler = /*#__PURE__*/ (function (_Obj) {
                      _inheritsLoose(Compiler, _Obj);
                      function Compiler() {
                          return _Obj.apply(this, arguments) || this;
                      }
                      var _proto = Compiler.prototype;
                      _proto.init = function init(templateName, throwOnUndefined) {
                          this.templateName = templateName;
                          this.codebuf = [];
                          this.lastId = 0;
                          this.buffer = null;
                          this.bufferStack = [];
                          this._scopeClosers = "";
                          this.inBlock = false;
                          this.throwOnUndefined = throwOnUndefined;
                      };
                      _proto.fail = function fail(msg, lineno, colno) {
                          if (lineno !== undefined) {
                              lineno += 1;
                          }
                          if (colno !== undefined) {
                              colno += 1;
                          }
                          throw new TemplateError(msg, lineno, colno);
                      };
                      _proto._pushBuffer = function _pushBuffer() {
                          var id = this._tmpid();
                          this.bufferStack.push(this.buffer);
                          this.buffer = id;
                          this._emit("var " + this.buffer + ' = "";');
                          return id;
                      };
                      _proto._popBuffer = function _popBuffer() {
                          this.buffer = this.bufferStack.pop();
                      };
                      _proto._emit = function _emit(code) {
                          this.codebuf.push(code);
                      };
                      _proto._emitLine = function _emitLine(code) {
                          this._emit(code + "\n");
                      };
                      _proto._emitLines = function _emitLines() {
                          var _this = this;
                          for (var _len = arguments.length, lines = new Array(_len), _key = 0; _key < _len; _key++) {
                              lines[_key] = arguments[_key];
                          }
                          lines.forEach(function (line) {
                              return _this._emitLine(line);
                          });
                      };
                      _proto._emitFuncBegin = function _emitFuncBegin(node, name) {
                          this.buffer = "output";
                          this._scopeClosers = "";
                          this._emitLine("function " + name + "(env, context, frame, runtime, cb) {");
                          this._emitLine("var lineno = " + node.lineno + ";");
                          this._emitLine("var colno = " + node.colno + ";");
                          this._emitLine("var " + this.buffer + ' = "";');
                          this._emitLine("try {");
                      };
                      _proto._emitFuncEnd = function _emitFuncEnd(noReturn) {
                          if (!noReturn) {
                              this._emitLine("cb(null, " + this.buffer + ");");
                          }
                          this._closeScopeLevels();
                          this._emitLine("} catch (e) {");
                          this._emitLine("  cb(runtime.handleError(e, lineno, colno));");
                          this._emitLine("}");
                          this._emitLine("}");
                          this.buffer = null;
                      };
                      _proto._addScopeLevel = function _addScopeLevel() {
                          this._scopeClosers += "})";
                      };
                      _proto._closeScopeLevels = function _closeScopeLevels() {
                          this._emitLine(this._scopeClosers + ";");
                          this._scopeClosers = "";
                      };
                      _proto._withScopedSyntax = function _withScopedSyntax(func) {
                          var _scopeClosers = this._scopeClosers;
                          this._scopeClosers = "";
                          func.call(this);
                          this._closeScopeLevels();
                          this._scopeClosers = _scopeClosers;
                      };
                      _proto._makeCallback = function _makeCallback(res) {
                          var err = this._tmpid();
                          return ("function(" +
                              err +
                              (res ? "," + res : "") +
                              ") {\n" +
                              "if(" +
                              err +
                              ") { cb(" +
                              err +
                              "); return; }");
                      };
                      _proto._tmpid = function _tmpid() {
                          this.lastId++;
                          return "t_" + this.lastId;
                      };
                      _proto._templateName = function _templateName() {
                          return this.templateName == null
                              ? "undefined"
                              : JSON.stringify(this.templateName);
                      };
                      _proto._compileChildren = function _compileChildren(node, frame) {
                          var _this2 = this;
                          node.children.forEach(function (child) {
                              _this2.compile(child, frame);
                          });
                      };
                      _proto._compileAggregate = function _compileAggregate(node, frame, startChar, endChar) {
                          var _this3 = this;
                          if (startChar) {
                              this._emit(startChar);
                          }
                          node.children.forEach(function (child, i) {
                              if (i > 0) {
                                  _this3._emit(",");
                              }
                              _this3.compile(child, frame);
                          });
                          if (endChar) {
                              this._emit(endChar);
                          }
                      };
                      _proto._compileExpression = function _compileExpression(node, frame) {
                          // TODO: I'm not really sure if this type check is worth it or
                          // not.
                          this.assertType(node, nodes.Literal, nodes.Symbol, nodes.Group, nodes.Array, nodes.Dict, nodes.FunCall, nodes.Caller, nodes.Filter, nodes.LookupVal, nodes.Compare, nodes.InlineIf, nodes.In, nodes.Is, nodes.And, nodes.Or, nodes.Not, nodes.Add, nodes.Concat, nodes.Sub, nodes.Mul, nodes.Div, nodes.FloorDiv, nodes.Mod, nodes.Pow, nodes.Neg, nodes.Pos, nodes.Compare, nodes.NodeList);
                          this.compile(node, frame);
                      };
                      _proto.assertType = function assertType(node) {
                          for (var _len2 = arguments.length, types = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                              types[_key2 - 1] = arguments[_key2];
                          }
                          if (!types.some(function (t) {
                              return node instanceof t;
                          })) {
                              this.fail("assertType: invalid type: " + node.typename, node.lineno, node.colno);
                          }
                      };
                      _proto.compileCallExtension = function compileCallExtension(node, frame, async) {
                          var _this4 = this;
                          var args = node.args;
                          var contentArgs = node.contentArgs;
                          var autoescape = typeof node.autoescape === "boolean" ? node.autoescape : true;
                          if (!async) {
                              this._emit(this.buffer + " += runtime.suppressValue(");
                          }
                          this._emit('env.getExtension("' + node.extName + '")["' + node.prop + '"](');
                          this._emit("context");
                          if (args || contentArgs) {
                              this._emit(",");
                          }
                          if (args) {
                              if (!(args instanceof nodes.NodeList)) {
                                  this.fail("compileCallExtension: arguments must be a NodeList, " +
                                      "use `parser.parseSignature`");
                              }
                              args.children.forEach(function (arg, i) {
                                  // Tag arguments are passed normally to the call. Note
                                  // that keyword arguments are turned into a single js
                                  // object as the last argument, if they exist.
                                  _this4._compileExpression(arg, frame);
                                  if (i !== args.children.length - 1 || contentArgs.length) {
                                      _this4._emit(",");
                                  }
                              });
                          }
                          if (contentArgs.length) {
                              contentArgs.forEach(function (arg, i) {
                                  if (i > 0) {
                                      _this4._emit(",");
                                  }
                                  if (arg) {
                                      _this4._emitLine("function(cb) {");
                                      _this4._emitLine("if(!cb) { cb = function(err) { if(err) { throw err; }}}");
                                      var id = _this4._pushBuffer();
                                      _this4._withScopedSyntax(function () {
                                          _this4.compile(arg, frame);
                                          _this4._emitLine("cb(null, " + id + ");");
                                      });
                                      _this4._popBuffer();
                                      _this4._emitLine("return " + id + ";");
                                      _this4._emitLine("}");
                                  }
                                  else {
                                      _this4._emit("null");
                                  }
                              });
                          }
                          if (async) {
                              var res = this._tmpid();
                              this._emitLine(", " + this._makeCallback(res));
                              this._emitLine(this.buffer +
                                  " += runtime.suppressValue(" +
                                  res +
                                  ", " +
                                  autoescape +
                                  " && env.opts.autoescape);");
                              this._addScopeLevel();
                          }
                          else {
                              this._emit(")");
                              this._emit(", " + autoescape + " && env.opts.autoescape);\n");
                          }
                      };
                      _proto.compileCallExtensionAsync = function compileCallExtensionAsync(node, frame) {
                          this.compileCallExtension(node, frame, true);
                      };
                      _proto.compileNodeList = function compileNodeList(node, frame) {
                          this._compileChildren(node, frame);
                      };
                      _proto.compileLiteral = function compileLiteral(node) {
                          if (typeof node.value === "string") {
                              var val = node.value.replace(/\\/g, "\\\\");
                              val = val.replace(/"/g, '\\"');
                              val = val.replace(/\n/g, "\\n");
                              val = val.replace(/\r/g, "\\r");
                              val = val.replace(/\t/g, "\\t");
                              val = val.replace(/\u2028/g, "\\u2028");
                              this._emit('"' + val + '"');
                          }
                          else if (node.value === null) {
                              this._emit("null");
                          }
                          else {
                              this._emit(node.value.toString());
                          }
                      };
                      _proto.compileSymbol = function compileSymbol(node, frame) {
                          var name = node.value;
                          var v = frame.lookup(name);
                          if (v) {
                              this._emit(v);
                          }
                          else {
                              this._emit("runtime.contextOrFrameLookup(" +
                                  'context, frame, "' +
                                  name +
                                  '")');
                          }
                      };
                      _proto.compileGroup = function compileGroup(node, frame) {
                          this._compileAggregate(node, frame, "(", ")");
                      };
                      _proto.compileArray = function compileArray(node, frame) {
                          this._compileAggregate(node, frame, "[", "]");
                      };
                      _proto.compileDict = function compileDict(node, frame) {
                          this._compileAggregate(node, frame, "{", "}");
                      };
                      _proto.compilePair = function compilePair(node, frame) {
                          var key = node.key;
                          var val = node.value;
                          if (key instanceof nodes.Symbol) {
                              key = new nodes.Literal(key.lineno, key.colno, key.value);
                          }
                          else if (!(key instanceof nodes.Literal && typeof key.value === "string")) {
                              this.fail("compilePair: Dict keys must be strings or names", key.lineno, key.colno);
                          }
                          this.compile(key, frame);
                          this._emit(": ");
                          this._compileExpression(val, frame);
                      };
                      _proto.compileInlineIf = function compileInlineIf(node, frame) {
                          this._emit("(");
                          this.compile(node.cond, frame);
                          this._emit("?");
                          this.compile(node.body, frame);
                          this._emit(":");
                          if (node.else_ !== null) {
                              this.compile(node.else_, frame);
                          }
                          else {
                              this._emit('""');
                          }
                          this._emit(")");
                      };
                      _proto.compileIn = function compileIn(node, frame) {
                          this._emit("runtime.inOperator(");
                          this.compile(node.left, frame);
                          this._emit(",");
                          this.compile(node.right, frame);
                          this._emit(")");
                      };
                      _proto.compileIs = function compileIs(node, frame) {
                          // first, we need to try to get the name of the test function, if it's a
                          // callable (i.e., has args) and not a symbol.
                          var right = node.right.name
                              ? node.right.name.value // otherwise go with the symbol value
                              : node.right.value;
                          this._emit('env.getTest("' + right + '").call(context, ');
                          this.compile(node.left, frame); // compile the arguments for the callable if they exist
                          if (node.right.args) {
                              this._emit(",");
                              this.compile(node.right.args, frame);
                          }
                          this._emit(") === true");
                      };
                      _proto._binOpEmitter = function _binOpEmitter(node, frame, str) {
                          this.compile(node.left, frame);
                          this._emit(str);
                          this.compile(node.right, frame);
                      }; // ensure concatenation instead of addition
                      // by adding empty string in between
                      _proto.compileOr = function compileOr(node, frame) {
                          return this._binOpEmitter(node, frame, " || ");
                      };
                      _proto.compileAnd = function compileAnd(node, frame) {
                          return this._binOpEmitter(node, frame, " && ");
                      };
                      _proto.compileAdd = function compileAdd(node, frame) {
                          return this._binOpEmitter(node, frame, " + ");
                      };
                      _proto.compileConcat = function compileConcat(node, frame) {
                          return this._binOpEmitter(node, frame, ' + "" + ');
                      };
                      _proto.compileSub = function compileSub(node, frame) {
                          return this._binOpEmitter(node, frame, " - ");
                      };
                      _proto.compileMul = function compileMul(node, frame) {
                          return this._binOpEmitter(node, frame, " * ");
                      };
                      _proto.compileDiv = function compileDiv(node, frame) {
                          return this._binOpEmitter(node, frame, " / ");
                      };
                      _proto.compileMod = function compileMod(node, frame) {
                          return this._binOpEmitter(node, frame, " % ");
                      };
                      _proto.compileNot = function compileNot(node, frame) {
                          this._emit("!");
                          this.compile(node.target, frame);
                      };
                      _proto.compileFloorDiv = function compileFloorDiv(node, frame) {
                          this._emit("Math.floor(");
                          this.compile(node.left, frame);
                          this._emit(" / ");
                          this.compile(node.right, frame);
                          this._emit(")");
                      };
                      _proto.compilePow = function compilePow(node, frame) {
                          this._emit("Math.pow(");
                          this.compile(node.left, frame);
                          this._emit(", ");
                          this.compile(node.right, frame);
                          this._emit(")");
                      };
                      _proto.compileNeg = function compileNeg(node, frame) {
                          this._emit("-");
                          this.compile(node.target, frame);
                      };
                      _proto.compilePos = function compilePos(node, frame) {
                          this._emit("+");
                          this.compile(node.target, frame);
                      };
                      _proto.compileCompare = function compileCompare(node, frame) {
                          var _this5 = this;
                          this.compile(node.expr, frame);
                          node.ops.forEach(function (op) {
                              _this5._emit(" " + compareOps[op.type] + " ");
                              _this5.compile(op.expr, frame);
                          });
                      };
                      _proto.compileLookupVal = function compileLookupVal(node, frame) {
                          this._emit("runtime.memberLookup((");
                          this._compileExpression(node.target, frame);
                          this._emit("),");
                          this._compileExpression(node.val, frame);
                          this._emit(")");
                      };
                      _proto._getNodeName = function _getNodeName(node) {
                          switch (node.typename) {
                              case "Symbol":
                                  return node.value;
                              case "FunCall":
                                  return ("the return value of (" + this._getNodeName(node.name) + ")");
                              case "LookupVal":
                                  return (this._getNodeName(node.target) +
                                      '["' +
                                      this._getNodeName(node.val) +
                                      '"]');
                              case "Literal":
                                  return node.value.toString();
                              default:
                                  return "--expression--";
                          }
                      };
                      _proto.compileFunCall = function compileFunCall(node, frame) {
                          // Keep track of line/col info at runtime by settings
                          // variables within an expression. An expression in javascript
                          // like (x, y, z) returns the last value, and x and y can be
                          // anything
                          this._emit("(lineno = " + node.lineno + ", colno = " + node.colno + ", ");
                          this._emit("runtime.callWrap("); // Compile it as normal.
                          this._compileExpression(node.name, frame); // Output the name of what we're calling so we can get friendly errors
                          // if the lookup fails.
                          this._emit(', "' +
                              this._getNodeName(node.name).replace(/"/g, '\\"') +
                              '", context, ');
                          this._compileAggregate(node.args, frame, "[", "])");
                          this._emit(")");
                      };
                      _proto.compileFilter = function compileFilter(node, frame) {
                          var name = node.name;
                          this.assertType(name, nodes.Symbol);
                          this._emit('env.getFilter("' + name.value + '").call(context, ');
                          this._compileAggregate(node.args, frame);
                          this._emit(")");
                      };
                      _proto.compileFilterAsync = function compileFilterAsync(node, frame) {
                          var name = node.name;
                          var symbol = node.symbol.value;
                          this.assertType(name, nodes.Symbol);
                          frame.set(symbol, symbol);
                          this._emit('env.getFilter("' + name.value + '").call(context, ');
                          this._compileAggregate(node.args, frame);
                          this._emitLine(", " + this._makeCallback(symbol));
                          this._addScopeLevel();
                      };
                      _proto.compileKeywordArgs = function compileKeywordArgs(node, frame) {
                          this._emit("runtime.makeKeywordArgs(");
                          this.compileDict(node, frame);
                          this._emit(")");
                      };
                      _proto.compileSet = function compileSet(node, frame) {
                          var _this6 = this;
                          var ids = []; // Lookup the variable names for each identifier and create
                          // new ones if necessary
                          node.targets.forEach(function (target) {
                              var name = target.value;
                              var id = frame.lookup(name);
                              if (id === null || id === undefined) {
                                  id = _this6._tmpid(); // Note: This relies on js allowing scope across
                                  // blocks, in case this is created inside an `if`
                                  _this6._emitLine("var " + id + ";");
                              }
                              ids.push(id);
                          });
                          if (node.value) {
                              this._emit(ids.join(" = ") + " = ");
                              this._compileExpression(node.value, frame);
                              this._emitLine(";");
                          }
                          else {
                              this._emit(ids.join(" = ") + " = ");
                              this.compile(node.body, frame);
                              this._emitLine(";");
                          }
                          node.targets.forEach(function (target, i) {
                              var id = ids[i];
                              var name = target.value; // We are running this for every var, but it's very
                              // uncommon to assign to multiple vars anyway
                              _this6._emitLine('frame.set("' + name + '", ' + id + ", true);");
                              _this6._emitLine("if(frame.topLevel) {");
                              _this6._emitLine('context.setVariable("' + name + '", ' + id + ");");
                              _this6._emitLine("}");
                              if (name.charAt(0) !== "_") {
                                  _this6._emitLine("if(frame.topLevel) {");
                                  _this6._emitLine('context.addExport("' + name + '", ' + id + ");");
                                  _this6._emitLine("}");
                              }
                          });
                      };
                      _proto.compileSwitch = function compileSwitch(node, frame) {
                          var _this7 = this;
                          this._emit("switch (");
                          this.compile(node.expr, frame);
                          this._emit(") {");
                          node.cases.forEach(function (c, i) {
                              _this7._emit("case ");
                              _this7.compile(c.cond, frame);
                              _this7._emit(": ");
                              _this7.compile(c.body, frame); // preserve fall-throughs
                              if (c.body.children.length) {
                                  _this7._emitLine("break;");
                              }
                          });
                          if (node.default) {
                              this._emit("default:");
                              this.compile(node.default, frame);
                          }
                          this._emit("}");
                      };
                      _proto.compileIf = function compileIf(node, frame, async) {
                          var _this8 = this;
                          this._emit("if(");
                          this._compileExpression(node.cond, frame);
                          this._emitLine(") {");
                          this._withScopedSyntax(function () {
                              _this8.compile(node.body, frame);
                              if (async) {
                                  _this8._emit("cb()");
                              }
                          });
                          if (node.else_) {
                              this._emitLine("}\nelse {");
                              this._withScopedSyntax(function () {
                                  _this8.compile(node.else_, frame);
                                  if (async) {
                                      _this8._emit("cb()");
                                  }
                              });
                          }
                          else if (async) {
                              this._emitLine("}\nelse {");
                              this._emit("cb()");
                          }
                          this._emitLine("}");
                      };
                      _proto.compileIfAsync = function compileIfAsync(node, frame) {
                          this._emit("(function(cb) {");
                          this.compileIf(node, frame, true);
                          this._emit("})(" + this._makeCallback());
                          this._addScopeLevel();
                      };
                      _proto._emitLoopBindings = function _emitLoopBindings(node, arr, i, len) {
                          var _this9 = this;
                          var bindings = [
                              {
                                  name: "index",
                                  val: i + " + 1",
                              },
                              {
                                  name: "index0",
                                  val: i,
                              },
                              {
                                  name: "revindex",
                                  val: len + " - " + i,
                              },
                              {
                                  name: "revindex0",
                                  val: len + " - " + i + " - 1",
                              },
                              {
                                  name: "first",
                                  val: i + " === 0",
                              },
                              {
                                  name: "last",
                                  val: i + " === " + len + " - 1",
                              },
                              {
                                  name: "length",
                                  val: len,
                              },
                          ];
                          bindings.forEach(function (b) {
                              _this9._emitLine('frame.set("loop.' + b.name + '", ' + b.val + ");");
                          });
                      };
                      _proto.compileFor = function compileFor(node, frame) {
                          var _this10 = this;
                          // Some of this code is ugly, but it keeps the generated code
                          // as fast as possible. ForAsync also shares some of this, but
                          // not much.
                          var i = this._tmpid();
                          var len = this._tmpid();
                          var arr = this._tmpid();
                          frame = frame.push();
                          this._emitLine("frame = frame.push();");
                          this._emit("var " + arr + " = ");
                          this._compileExpression(node.arr, frame);
                          this._emitLine(";");
                          this._emit("if(" + arr + ") {");
                          this._emitLine(arr + " = runtime.fromIterator(" + arr + ");"); // If multiple names are passed, we need to bind them
                          // appropriately
                          if (node.name instanceof nodes.Array) {
                              this._emitLine("var " + i + ";"); // The object could be an arroy or object. Note that the
                              // body of the loop is duplicated for each condition, but
                              // we are optimizing for speed over size.
                              this._emitLine("if(runtime.isArray(" + arr + ")) {");
                              this._emitLine("var " + len + " = " + arr + ".length;");
                              this._emitLine("for(" +
                                  i +
                                  "=0; " +
                                  i +
                                  " < " +
                                  arr +
                                  ".length; " +
                                  i +
                                  "++) {"); // Bind each declared var
                              node.name.children.forEach(function (child, u) {
                                  var tid = _this10._tmpid();
                                  _this10._emitLine("var " + tid + " = " + arr + "[" + i + "][" + u + "];");
                                  _this10._emitLine('frame.set("' +
                                      child +
                                      '", ' +
                                      arr +
                                      "[" +
                                      i +
                                      "][" +
                                      u +
                                      "]);");
                                  frame.set(node.name.children[u].value, tid);
                              });
                              this._emitLoopBindings(node, arr, i, len);
                              this._withScopedSyntax(function () {
                                  _this10.compile(node.body, frame);
                              });
                              this._emitLine("}");
                              this._emitLine("} else {"); // Iterate over the key/values of an object
                              var _node$name$children = node.name.children, key = _node$name$children[0], val = _node$name$children[1];
                              var k = this._tmpid();
                              var v = this._tmpid();
                              frame.set(key.value, k);
                              frame.set(val.value, v);
                              this._emitLine(i + " = -1;");
                              this._emitLine("var " + len + " = runtime.keys(" + arr + ").length;");
                              this._emitLine("for(var " + k + " in " + arr + ") {");
                              this._emitLine(i + "++;");
                              this._emitLine("var " + v + " = " + arr + "[" + k + "];");
                              this._emitLine('frame.set("' + key.value + '", ' + k + ");");
                              this._emitLine('frame.set("' + val.value + '", ' + v + ");");
                              this._emitLoopBindings(node, arr, i, len);
                              this._withScopedSyntax(function () {
                                  _this10.compile(node.body, frame);
                              });
                              this._emitLine("}");
                              this._emitLine("}");
                          }
                          else {
                              // Generate a typical array iteration
                              var _v = this._tmpid();
                              frame.set(node.name.value, _v);
                              this._emitLine("var " + len + " = " + arr + ".length;");
                              this._emitLine("for(var " +
                                  i +
                                  "=0; " +
                                  i +
                                  " < " +
                                  arr +
                                  ".length; " +
                                  i +
                                  "++) {");
                              this._emitLine("var " + _v + " = " + arr + "[" + i + "];");
                              this._emitLine('frame.set("' + node.name.value + '", ' + _v + ");");
                              this._emitLoopBindings(node, arr, i, len);
                              this._withScopedSyntax(function () {
                                  _this10.compile(node.body, frame);
                              });
                              this._emitLine("}");
                          }
                          this._emitLine("}");
                          if (node.else_) {
                              this._emitLine("if (!" + len + ") {");
                              this.compile(node.else_, frame);
                              this._emitLine("}");
                          }
                          this._emitLine("frame = frame.pop();");
                      };
                      _proto._compileAsyncLoop = function _compileAsyncLoop(node, frame, parallel) {
                          var _this11 = this;
                          // This shares some code with the For tag, but not enough to
                          // worry about. This iterates across an object asynchronously,
                          // but not in parallel.
                          var i = this._tmpid();
                          var len = this._tmpid();
                          var arr = this._tmpid();
                          var asyncMethod = parallel ? "asyncAll" : "asyncEach";
                          frame = frame.push();
                          this._emitLine("frame = frame.push();");
                          this._emit("var " + arr + " = runtime.fromIterator(");
                          this._compileExpression(node.arr, frame);
                          this._emitLine(");");
                          if (node.name instanceof nodes.Array) {
                              var arrayLen = node.name.children.length;
                              this._emit("runtime." +
                                  asyncMethod +
                                  "(" +
                                  arr +
                                  ", " +
                                  arrayLen +
                                  ", function(");
                              node.name.children.forEach(function (name) {
                                  _this11._emit(name.value + ",");
                              });
                              this._emit(i + "," + len + ",next) {");
                              node.name.children.forEach(function (name) {
                                  var id = name.value;
                                  frame.set(id, id);
                                  _this11._emitLine('frame.set("' + id + '", ' + id + ");");
                              });
                          }
                          else {
                              var id = node.name.value;
                              this._emitLine("runtime." +
                                  asyncMethod +
                                  "(" +
                                  arr +
                                  ", 1, function(" +
                                  id +
                                  ", " +
                                  i +
                                  ", " +
                                  len +
                                  ",next) {");
                              this._emitLine('frame.set("' + id + '", ' + id + ");");
                              frame.set(id, id);
                          }
                          this._emitLoopBindings(node, arr, i, len);
                          this._withScopedSyntax(function () {
                              var buf;
                              if (parallel) {
                                  buf = _this11._pushBuffer();
                              }
                              _this11.compile(node.body, frame);
                              _this11._emitLine("next(" + i + (buf ? "," + buf : "") + ");");
                              if (parallel) {
                                  _this11._popBuffer();
                              }
                          });
                          var output = this._tmpid();
                          this._emitLine("}, " + this._makeCallback(output));
                          this._addScopeLevel();
                          if (parallel) {
                              this._emitLine(this.buffer + " += " + output + ";");
                          }
                          if (node.else_) {
                              this._emitLine("if (!" + arr + ".length) {");
                              this.compile(node.else_, frame);
                              this._emitLine("}");
                          }
                          this._emitLine("frame = frame.pop();");
                      };
                      _proto.compileAsyncEach = function compileAsyncEach(node, frame) {
                          this._compileAsyncLoop(node, frame);
                      };
                      _proto.compileAsyncAll = function compileAsyncAll(node, frame) {
                          this._compileAsyncLoop(node, frame, true);
                      };
                      _proto._compileMacro = function _compileMacro(node, frame) {
                          var _this12 = this;
                          var args = [];
                          var kwargs = null;
                          var funcId = "macro_" + this._tmpid();
                          var keepFrame = frame !== undefined; // Type check the definition of the args
                          node.args.children.forEach(function (arg, i) {
                              if (i === node.args.children.length - 1 &&
                                  arg instanceof nodes.Dict) {
                                  kwargs = arg;
                              }
                              else {
                                  _this12.assertType(arg, nodes.Symbol);
                                  args.push(arg);
                              }
                          });
                          var realNames = [].concat(args.map(function (n) {
                              return "l_" + n.value;
                          }), ["kwargs"]); // Quoted argument names
                          var argNames = args.map(function (n) {
                              return '"' + n.value + '"';
                          });
                          var kwargNames = ((kwargs && kwargs.children) || []).map(function (n) {
                              return '"' + n.key.value + '"';
                          }); // We pass a function to makeMacro which destructures the
                          // arguments so support setting positional args with keywords
                          // args and passing keyword args as positional args
                          // (essentially default values). See runtime.js.
                          var currFrame;
                          if (keepFrame) {
                              currFrame = frame.push(true);
                          }
                          else {
                              currFrame = new Frame();
                          }
                          this._emitLines("var " + funcId + " = runtime.makeMacro(", "[" + argNames.join(", ") + "], ", "[" + kwargNames.join(", ") + "], ", "function (" + realNames.join(", ") + ") {", "var callerFrame = frame;", "frame = " +
                              (keepFrame ? "frame.push(true);" : "new runtime.Frame();"), "kwargs = kwargs || {};", 'if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {', 'frame.set("caller", kwargs.caller); }'); // Expose the arguments to the template. Don't need to use
                          // random names because the function
                          // will create a new run-time scope for us
                          args.forEach(function (arg) {
                              _this12._emitLine('frame.set("' + arg.value + '", l_' + arg.value + ");");
                              currFrame.set(arg.value, "l_" + arg.value);
                          }); // Expose the keyword arguments
                          if (kwargs) {
                              kwargs.children.forEach(function (pair) {
                                  var name = pair.key.value;
                                  _this12._emit('frame.set("' + name + '", ');
                                  _this12._emit('Object.prototype.hasOwnProperty.call(kwargs, "' + name + '")');
                                  _this12._emit(' ? kwargs["' + name + '"] : ');
                                  _this12._compileExpression(pair.value, currFrame);
                                  _this12._emit(");");
                              });
                          }
                          var bufferId = this._pushBuffer();
                          this._withScopedSyntax(function () {
                              _this12.compile(node.body, currFrame);
                          });
                          this._emitLine("frame = " + (keepFrame ? "frame.pop();" : "callerFrame;"));
                          this._emitLine("return new runtime.SafeString(" + bufferId + ");");
                          this._emitLine("});");
                          this._popBuffer();
                          return funcId;
                      };
                      _proto.compileMacro = function compileMacro(node, frame) {
                          var funcId = this._compileMacro(node); // Expose the macro to the templates
                          var name = node.name.value;
                          frame.set(name, funcId);
                          if (frame.parent) {
                              this._emitLine('frame.set("' + name + '", ' + funcId + ");");
                          }
                          else {
                              if (node.name.value.charAt(0) !== "_") {
                                  this._emitLine('context.addExport("' + name + '");');
                              }
                              this._emitLine('context.setVariable("' + name + '", ' + funcId + ");");
                          }
                      };
                      _proto.compileCaller = function compileCaller(node, frame) {
                          // basically an anonymous "macro expression"
                          this._emit("(function (){");
                          var funcId = this._compileMacro(node, frame);
                          this._emit("return " + funcId + ";})()");
                      };
                      _proto._compileGetTemplate = function _compileGetTemplate(node, frame, eagerCompile, ignoreMissing) {
                          var parentTemplateId = this._tmpid();
                          var parentName = this._templateName();
                          var cb = this._makeCallback(parentTemplateId);
                          var eagerCompileArg = eagerCompile ? "true" : "false";
                          var ignoreMissingArg = ignoreMissing ? "true" : "false";
                          this._emit("env.getTemplate(");
                          this._compileExpression(node.template, frame);
                          this._emitLine(", " +
                              eagerCompileArg +
                              ", " +
                              parentName +
                              ", " +
                              ignoreMissingArg +
                              ", " +
                              cb);
                          return parentTemplateId;
                      };
                      _proto.compileImport = function compileImport(node, frame) {
                          var target = node.target.value;
                          var id = this._compileGetTemplate(node, frame, false, false);
                          this._addScopeLevel();
                          this._emitLine(id +
                              ".getExported(" +
                              (node.withContext ? "context.getVariables(), frame, " : "") +
                              this._makeCallback(id));
                          this._addScopeLevel();
                          frame.set(target, id);
                          if (frame.parent) {
                              this._emitLine('frame.set("' + target + '", ' + id + ");");
                          }
                          else {
                              this._emitLine('context.setVariable("' + target + '", ' + id + ");");
                          }
                      };
                      _proto.compileFromImport = function compileFromImport(node, frame) {
                          var _this13 = this;
                          var importedId = this._compileGetTemplate(node, frame, false, false);
                          this._addScopeLevel();
                          this._emitLine(importedId +
                              ".getExported(" +
                              (node.withContext ? "context.getVariables(), frame, " : "") +
                              this._makeCallback(importedId));
                          this._addScopeLevel();
                          node.names.children.forEach(function (nameNode) {
                              var name;
                              var alias;
                              var id = _this13._tmpid();
                              if (nameNode instanceof nodes.Pair) {
                                  name = nameNode.key.value;
                                  alias = nameNode.value.value;
                              }
                              else {
                                  name = nameNode.value;
                                  alias = name;
                              }
                              _this13._emitLine("if(Object.prototype.hasOwnProperty.call(" +
                                  importedId +
                                  ', "' +
                                  name +
                                  '")) {');
                              _this13._emitLine("var " + id + " = " + importedId + "." + name + ";");
                              _this13._emitLine("} else {");
                              _this13._emitLine("cb(new Error(\"cannot import '" + name + "'\")); return;");
                              _this13._emitLine("}");
                              frame.set(alias, id);
                              if (frame.parent) {
                                  _this13._emitLine('frame.set("' + alias + '", ' + id + ");");
                              }
                              else {
                                  _this13._emitLine('context.setVariable("' + alias + '", ' + id + ");");
                              }
                          });
                      };
                      _proto.compileBlock = function compileBlock(node) {
                          var id = this._tmpid(); // If we are executing outside a block (creating a top-level
                          // block), we really don't want to execute its code because it
                          // will execute twice: once when the child template runs and
                          // again when the parent template runs. Note that blocks
                          // within blocks will *always* execute immediately *and*
                          // wherever else they are invoked (like used in a parent
                          // template). This may have behavioral differences from jinja
                          // because blocks can have side effects, but it seems like a
                          // waste of performance to always execute huge top-level
                          // blocks twice
                          if (!this.inBlock) {
                              this._emit('(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : ');
                          }
                          this._emit('context.getBlock("' + node.name.value + '")');
                          if (!this.inBlock) {
                              this._emit(")");
                          }
                          this._emitLine("(env, context, frame, runtime, " + this._makeCallback(id));
                          this._emitLine(this.buffer + " += " + id + ";");
                          this._addScopeLevel();
                      };
                      _proto.compileSuper = function compileSuper(node, frame) {
                          var name = node.blockName.value;
                          var id = node.symbol.value;
                          var cb = this._makeCallback(id);
                          this._emitLine('context.getSuper(env, "' +
                              name +
                              '", b_' +
                              name +
                              ", frame, runtime, " +
                              cb);
                          this._emitLine(id + " = runtime.markSafe(" + id + ");");
                          this._addScopeLevel();
                          frame.set(id, id);
                      };
                      _proto.compileExtends = function compileExtends(node, frame) {
                          var k = this._tmpid();
                          var parentTemplateId = this._compileGetTemplate(node, frame, true, false); // extends is a dynamic tag and can occur within a block like
                          // `if`, so if this happens we need to capture the parent
                          // template in the top-level scope
                          this._emitLine("parentTemplate = " + parentTemplateId);
                          this._emitLine("for(var " + k + " in parentTemplate.blocks) {");
                          this._emitLine("context.addBlock(" + k + ", parentTemplate.blocks[" + k + "]);");
                          this._emitLine("}");
                          this._addScopeLevel();
                      };
                      _proto.compileInclude = function compileInclude(node, frame) {
                          this._emitLine("var tasks = [];");
                          this._emitLine("tasks.push(");
                          this._emitLine("function(callback) {");
                          var id = this._compileGetTemplate(node, frame, false, node.ignoreMissing);
                          this._emitLine("callback(null," + id + ");});");
                          this._emitLine("});");
                          var id2 = this._tmpid();
                          this._emitLine("tasks.push(");
                          this._emitLine("function(template, callback){");
                          this._emitLine("template.render(context.getVariables(), frame, " +
                              this._makeCallback(id2));
                          this._emitLine("callback(null," + id2 + ");});");
                          this._emitLine("});");
                          this._emitLine("tasks.push(");
                          this._emitLine("function(result, callback){");
                          this._emitLine(this.buffer + " += result;");
                          this._emitLine("callback(null);");
                          this._emitLine("});");
                          this._emitLine("env.waterfall(tasks, function(){");
                          this._addScopeLevel();
                      };
                      _proto.compileTemplateData = function compileTemplateData(node, frame) {
                          this.compileLiteral(node, frame);
                      };
                      _proto.compileCapture = function compileCapture(node, frame) {
                          var _this14 = this;
                          // we need to temporarily override the current buffer id as 'output'
                          // so the set block writes to the capture output instead of the buffer
                          var buffer = this.buffer;
                          this.buffer = "output";
                          this._emitLine("(function() {");
                          this._emitLine('var output = "";');
                          this._withScopedSyntax(function () {
                              _this14.compile(node.body, frame);
                          });
                          this._emitLine("return output;");
                          this._emitLine("})()"); // and of course, revert back to the old buffer id
                          this.buffer = buffer;
                      };
                      _proto.compileOutput = function compileOutput(node, frame) {
                          var _this15 = this;
                          var children = node.children;
                          children.forEach(function (child) {
                              // TemplateData is a special case because it is never
                              // autoescaped, so simply output it for optimization
                              if (child instanceof nodes.TemplateData) {
                                  if (child.value) {
                                      _this15._emit(_this15.buffer + " += ");
                                      _this15.compileLiteral(child, frame);
                                      _this15._emitLine(";");
                                  }
                              }
                              else {
                                  _this15._emit(_this15.buffer + " += runtime.suppressValue(");
                                  if (_this15.throwOnUndefined) {
                                      _this15._emit("runtime.ensureDefined(");
                                  }
                                  _this15.compile(child, frame);
                                  if (_this15.throwOnUndefined) {
                                      _this15._emit("," + node.lineno + "," + node.colno + ")");
                                  }
                                  _this15._emit(", env.opts.autoescape);\n");
                              }
                          });
                      };
                      _proto.compileRoot = function compileRoot(node, frame) {
                          var _this16 = this;
                          if (frame) {
                              this.fail("compileRoot: root node can't have frame");
                          }
                          frame = new Frame();
                          this._emitFuncBegin(node, "root");
                          this._emitLine("var parentTemplate = null;");
                          this._compileChildren(node, frame);
                          this._emitLine("if(parentTemplate) {");
                          this._emitLine("parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);");
                          this._emitLine("} else {");
                          this._emitLine("cb(null, " + this.buffer + ");");
                          this._emitLine("}");
                          this._emitFuncEnd(true);
                          this.inBlock = true;
                          var blockNames = [];
                          var blocks = node.findAll(nodes.Block);
                          blocks.forEach(function (block, i) {
                              var name = block.name.value;
                              if (blockNames.indexOf(name) !== -1) {
                                  throw new Error('Block "' + name + '" defined more than once.');
                              }
                              blockNames.push(name);
                              _this16._emitFuncBegin(block, "b_" + name);
                              var tmpFrame = new Frame();
                              _this16._emitLine("var frame = frame.push(true);");
                              _this16.compile(block.body, tmpFrame);
                              _this16._emitFuncEnd();
                          });
                          this._emitLine("return {");
                          blocks.forEach(function (block, i) {
                              var blockName = "b_" + block.name.value;
                              _this16._emitLine(blockName + ": " + blockName + ",");
                          });
                          this._emitLine("root: root\n};");
                      };
                      _proto.compile = function compile(node, frame) {
                          var _compile = this["compile" + node.typename];
                          if (_compile) {
                              _compile.call(this, node, frame);
                          }
                          else {
                              this.fail("compile: Cannot compile node: " + node.typename, node.lineno, node.colno);
                          }
                      };
                      _proto.getCode = function getCode() {
                          return this.codebuf.join("");
                      };
                      return Compiler;
                  })(Obj);
                  module.exports = {
                      compile: function compile(src, asyncFilters, extensions, name, opts) {
                          if (opts === void 0) {
                              opts = {};
                          }
                          var c = new Compiler(name, opts.throwOnUndefined); // Run the extension preprocessors against the source.
                          var preprocessors = (extensions || [])
                              .map(function (ext) {
                              return ext.preprocess;
                          })
                              .filter(function (f) {
                              return !!f;
                          });
                          var processedSrc = preprocessors.reduce(function (s, processor) {
                              return processor(s);
                          }, src);
                          c.compile(transformer.transform(parser.parse(processedSrc, extensions, opts), asyncFilters, name));
                          return c.getCode();
                      },
                      Compiler: Compiler,
                  };
                  /***/
              },
              /* 6 */
              /***/ function (module, exports, __webpack_require__) {
                  function _inheritsLoose(subClass, superClass) {
                      subClass.prototype = Object.create(superClass.prototype);
                      subClass.prototype.constructor = subClass;
                      _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                      _setPrototypeOf =
                          Object.setPrototypeOf ||
                              function _setPrototypeOf(o, p) {
                                  o.__proto__ = p;
                                  return o;
                              };
                      return _setPrototypeOf(o, p);
                  }
                  var path = __webpack_require__(4);
                  var _require = __webpack_require__(1), EmitterObj = _require.EmitterObj;
                  module.exports = /*#__PURE__*/ (function (_EmitterObj) {
                      _inheritsLoose(Loader, _EmitterObj);
                      function Loader() {
                          return _EmitterObj.apply(this, arguments) || this;
                      }
                      var _proto = Loader.prototype;
                      _proto.resolve = function resolve(from, to) {
                          return path.resolve(path.dirname(from), to);
                      };
                      _proto.isRelative = function isRelative(filename) {
                          return (filename.indexOf("./") === 0 || filename.indexOf("../") === 0);
                      };
                      return Loader;
                  })(EmitterObj);
                  /***/
              },
              /* 7 */
              /***/ function (module, exports, __webpack_require__) {
                  function _inheritsLoose(subClass, superClass) {
                      subClass.prototype = Object.create(superClass.prototype);
                      subClass.prototype.constructor = subClass;
                      _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                      _setPrototypeOf =
                          Object.setPrototypeOf ||
                              function _setPrototypeOf(o, p) {
                                  o.__proto__ = p;
                                  return o;
                              };
                      return _setPrototypeOf(o, p);
                  }
                  var asap = __webpack_require__(12);
                  var _waterfall = __webpack_require__(15);
                  var lib = __webpack_require__(0);
                  var compiler = __webpack_require__(5);
                  var filters = __webpack_require__(18);
                  var _require = __webpack_require__(10), FileSystemLoader = _require.FileSystemLoader, WebLoader = _require.WebLoader, PrecompiledLoader = _require.PrecompiledLoader;
                  var tests = __webpack_require__(20);
                  var globals = __webpack_require__(21);
                  var _require2 = __webpack_require__(1), Obj = _require2.Obj, EmitterObj = _require2.EmitterObj;
                  var globalRuntime = __webpack_require__(2);
                  var handleError = globalRuntime.handleError, Frame = globalRuntime.Frame;
                  var expressApp = __webpack_require__(22); // If the user is using the async API, *always* call it
                  // asynchronously even if the template was synchronous.
                  function callbackAsap(cb, err, res) {
                      asap(function () {
                          cb(err, res);
                      });
                  }
                  /**
                   * A no-op template, for use with {% include ignore missing %}
                   */
                  var noopTmplSrc = {
                      type: "code",
                      obj: {
                          root: function root(env, context, frame, runtime, cb) {
                              try {
                                  cb(null, "");
                              }
                              catch (e) {
                                  cb(handleError(e, null, null));
                              }
                          },
                      },
                  };
                  var Environment = /*#__PURE__*/ (function (_EmitterObj) {
                      _inheritsLoose(Environment, _EmitterObj);
                      function Environment() {
                          return _EmitterObj.apply(this, arguments) || this;
                      }
                      var _proto = Environment.prototype;
                      _proto.init = function init(loaders, opts) {
                          var _this = this;
                          // The dev flag determines the trace that'll be shown on errors.
                          // If set to true, returns the full trace from the error point,
                          // otherwise will return trace starting from Template.render
                          // (the full trace from within nunjucks may confuse developers using
                          //  the library)
                          // defaults to false
                          opts = this.opts = opts || {};
                          this.opts.dev = !!opts.dev; // The autoescape flag sets global autoescaping. If true,
                          // every string variable will be escaped by default.
                          // If false, strings can be manually escaped using the `escape` filter.
                          // defaults to true
                          this.opts.autoescape =
                              opts.autoescape != null ? opts.autoescape : true; // If true, this will make the system throw errors if trying
                          // to output a null or undefined value
                          this.opts.throwOnUndefined = !!opts.throwOnUndefined;
                          this.opts.trimBlocks = !!opts.trimBlocks;
                          this.opts.lstripBlocks = !!opts.lstripBlocks;
                          this.loaders = [];
                          if (!loaders) {
                              // The filesystem loader is only available server-side
                              if (FileSystemLoader) {
                                  this.loaders = [new FileSystemLoader("views")];
                              }
                              else if (WebLoader) {
                                  this.loaders = [new WebLoader("/views")];
                              }
                          }
                          else {
                              this.loaders = lib.isArray(loaders) ? loaders : [loaders];
                          } // It's easy to use precompiled templates: just include them
                          // before you configure nunjucks and this will automatically
                          // pick it up and use it
                          if (typeof window !== "undefined" && window.nunjucksPrecompiled) {
                              this.loaders.unshift(new PrecompiledLoader(window.nunjucksPrecompiled));
                          }
                          this._initLoaders();
                          this.globals = globals();
                          this.filters = {};
                          this.tests = {};
                          this.asyncFilters = [];
                          this.extensions = {};
                          this.extensionsList = [];
                          lib._entries(filters).forEach(function (_ref) {
                              var name = _ref[0], filter = _ref[1];
                              return _this.addFilter(name, filter);
                          });
                          lib._entries(tests).forEach(function (_ref2) {
                              var name = _ref2[0], test = _ref2[1];
                              return _this.addTest(name, test);
                          });
                      };
                      _proto._initLoaders = function _initLoaders() {
                          var _this2 = this;
                          this.loaders.forEach(function (loader) {
                              // Caching and cache busting
                              loader.cache = {};
                              if (typeof loader.on === "function") {
                                  loader.on("update", function (name, fullname) {
                                      loader.cache[name] = null;
                                      _this2.emit("update", name, fullname, loader);
                                  });
                                  loader.on("load", function (name, source) {
                                      _this2.emit("load", name, source, loader);
                                  });
                              }
                          });
                      };
                      _proto.invalidateCache = function invalidateCache() {
                          this.loaders.forEach(function (loader) {
                              loader.cache = {};
                          });
                      };
                      _proto.addExtension = function addExtension(name, extension) {
                          extension.__name = name;
                          this.extensions[name] = extension;
                          this.extensionsList.push(extension);
                          return this;
                      };
                      _proto.removeExtension = function removeExtension(name) {
                          var extension = this.getExtension(name);
                          if (!extension) {
                              return;
                          }
                          this.extensionsList = lib.without(this.extensionsList, extension);
                          delete this.extensions[name];
                      };
                      _proto.getExtension = function getExtension(name) {
                          return this.extensions[name];
                      };
                      _proto.hasExtension = function hasExtension(name) {
                          return !!this.extensions[name];
                      };
                      _proto.addGlobal = function addGlobal(name, value) {
                          this.globals[name] = value;
                          return this;
                      };
                      _proto.getGlobal = function getGlobal(name) {
                          if (typeof this.globals[name] === "undefined") {
                              throw new Error("global not found: " + name);
                          }
                          return this.globals[name];
                      };
                      _proto.addFilter = function addFilter(name, func, async) {
                          var wrapped = func;
                          if (async) {
                              this.asyncFilters.push(name);
                          }
                          this.filters[name] = wrapped;
                          return this;
                      };
                      _proto.getFilter = function getFilter(name) {
                          if (!this.filters[name]) {
                              throw new Error("filter not found: " + name);
                          }
                          return this.filters[name];
                      };
                      _proto.addTest = function addTest(name, func) {
                          this.tests[name] = func;
                          return this;
                      };
                      _proto.getTest = function getTest(name) {
                          if (!this.tests[name]) {
                              throw new Error("test not found: " + name);
                          }
                          return this.tests[name];
                      };
                      _proto.resolveTemplate = function resolveTemplate(loader, parentName, filename) {
                          var isRelative = loader.isRelative && parentName
                              ? loader.isRelative(filename)
                              : false;
                          return isRelative && loader.resolve
                              ? loader.resolve(parentName, filename)
                              : filename;
                      };
                      _proto.getTemplate = function getTemplate(name, eagerCompile, parentName, ignoreMissing, cb) {
                          var _this3 = this;
                          var that = this;
                          var tmpl = null;
                          if (name && name.raw) {
                              // this fixes autoescape for templates referenced in symbols
                              name = name.raw;
                          }
                          if (lib.isFunction(parentName)) {
                              cb = parentName;
                              parentName = null;
                              eagerCompile = eagerCompile || false;
                          }
                          if (lib.isFunction(eagerCompile)) {
                              cb = eagerCompile;
                              eagerCompile = false;
                          }
                          if (name instanceof Template) {
                              tmpl = name;
                          }
                          else if (typeof name !== "string") {
                              throw new Error("template names must be a string: " + name);
                          }
                          else {
                              for (var i = 0; i < this.loaders.length; i++) {
                                  var loader = this.loaders[i];
                                  tmpl =
                                      loader.cache[this.resolveTemplate(loader, parentName, name)];
                                  if (tmpl) {
                                      break;
                                  }
                              }
                          }
                          if (tmpl) {
                              if (eagerCompile) {
                                  tmpl.compile();
                              }
                              if (cb) {
                                  cb(null, tmpl);
                                  return undefined;
                              }
                              else {
                                  return tmpl;
                              }
                          }
                          var syncResult;
                          var createTemplate = function createTemplate(err, info) {
                              if (!info && !err && !ignoreMissing) {
                                  err = new Error("template not found: " + name);
                              }
                              if (err) {
                                  if (cb) {
                                      cb(err);
                                      return;
                                  }
                                  else {
                                      throw err;
                                  }
                              }
                              var newTmpl;
                              if (!info) {
                                  newTmpl = new Template(noopTmplSrc, _this3, "", eagerCompile);
                              }
                              else {
                                  newTmpl = new Template(info.src, _this3, info.path, eagerCompile);
                                  if (!info.noCache) {
                                      info.loader.cache[name] = newTmpl;
                                  }
                              }
                              if (cb) {
                                  cb(null, newTmpl);
                              }
                              else {
                                  syncResult = newTmpl;
                              }
                          };
                          lib.asyncIter(this.loaders, function (loader, i, next, done) {
                              function handle(err, src) {
                                  if (err) {
                                      done(err);
                                  }
                                  else if (src) {
                                      src.loader = loader;
                                      done(null, src);
                                  }
                                  else {
                                      next();
                                  }
                              } // Resolve name relative to parentName
                              name = that.resolveTemplate(loader, parentName, name);
                              if (loader.async) {
                                  loader.getSource(name, handle);
                              }
                              else {
                                  handle(null, loader.getSource(name));
                              }
                          }, createTemplate);
                          return syncResult;
                      };
                      _proto.express = function express(app) {
                          return expressApp(this, app);
                      };
                      _proto.render = function render(name, ctx, cb) {
                          if (lib.isFunction(ctx)) {
                              cb = ctx;
                              ctx = null;
                          } // We support a synchronous API to make it easier to migrate
                          // existing code to async. This works because if you don't do
                          // anything async work, the whole thing is actually run
                          // synchronously.
                          var syncResult = null;
                          this.getTemplate(name, function (err, tmpl) {
                              if (err && cb) {
                                  callbackAsap(cb, err);
                              }
                              else if (err) {
                                  throw err;
                              }
                              else {
                                  syncResult = tmpl.render(ctx, cb);
                              }
                          });
                          return syncResult;
                      };
                      _proto.renderString = function renderString(src, ctx, opts, cb) {
                          if (lib.isFunction(opts)) {
                              cb = opts;
                              opts = {};
                          }
                          opts = opts || {};
                          var tmpl = new Template(src, this, opts.path);
                          return tmpl.render(ctx, cb);
                      };
                      _proto.waterfall = function waterfall(tasks, callback, forceAsync) {
                          return _waterfall(tasks, callback, forceAsync);
                      };
                      return Environment;
                  })(EmitterObj);
                  var Context = /*#__PURE__*/ (function (_Obj) {
                      _inheritsLoose(Context, _Obj);
                      function Context() {
                          return _Obj.apply(this, arguments) || this;
                      }
                      var _proto2 = Context.prototype;
                      _proto2.init = function init(ctx, blocks, env) {
                          var _this4 = this;
                          // Has to be tied to an environment so we can tap into its globals.
                          this.env = env || new Environment(); // Make a duplicate of ctx
                          this.ctx = lib.extend({}, ctx);
                          this.blocks = {};
                          this.exported = [];
                          lib.keys(blocks).forEach(function (name) {
                              _this4.addBlock(name, blocks[name]);
                          });
                      };
                      _proto2.lookup = function lookup(name) {
                          // This is one of the most called functions, so optimize for
                          // the typical case where the name isn't in the globals
                          if (name in this.env.globals && !(name in this.ctx)) {
                              return this.env.globals[name];
                          }
                          else {
                              return this.ctx[name];
                          }
                      };
                      _proto2.setVariable = function setVariable(name, val) {
                          this.ctx[name] = val;
                      };
                      _proto2.getVariables = function getVariables() {
                          return this.ctx;
                      };
                      _proto2.addBlock = function addBlock(name, block) {
                          this.blocks[name] = this.blocks[name] || [];
                          this.blocks[name].push(block);
                          return this;
                      };
                      _proto2.getBlock = function getBlock(name) {
                          if (!this.blocks[name]) {
                              throw new Error('unknown block "' + name + '"');
                          }
                          return this.blocks[name][0];
                      };
                      _proto2.getSuper = function getSuper(env, name, block, frame, runtime, cb) {
                          var idx = lib.indexOf(this.blocks[name] || [], block);
                          var blk = this.blocks[name][idx + 1];
                          var context = this;
                          if (idx === -1 || !blk) {
                              throw new Error('no super block available for "' + name + '"');
                          }
                          blk(env, context, frame, runtime, cb);
                      };
                      _proto2.addExport = function addExport(name) {
                          this.exported.push(name);
                      };
                      _proto2.getExported = function getExported() {
                          var _this5 = this;
                          var exported = {};
                          this.exported.forEach(function (name) {
                              exported[name] = _this5.ctx[name];
                          });
                          return exported;
                      };
                      return Context;
                  })(Obj);
                  var Template = /*#__PURE__*/ (function (_Obj2) {
                      _inheritsLoose(Template, _Obj2);
                      function Template() {
                          return _Obj2.apply(this, arguments) || this;
                      }
                      var _proto3 = Template.prototype;
                      _proto3.init = function init(src, env, path, eagerCompile) {
                          this.env = env || new Environment();
                          if (lib.isObject(src)) {
                              switch (src.type) {
                                  case "code":
                                      this.tmplProps = src.obj;
                                      break;
                                  case "string":
                                      this.tmplStr = src.obj;
                                      break;
                                  default:
                                      throw new Error("Unexpected template object type " +
                                          src.type +
                                          "; expected 'code', or 'string'");
                              }
                          }
                          else if (lib.isString(src)) {
                              this.tmplStr = src;
                          }
                          else {
                              throw new Error("src must be a string or an object describing the source");
                          }
                          this.path = path;
                          if (eagerCompile) {
                              try {
                                  this._compile();
                              }
                              catch (err) {
                                  throw lib._prettifyError(this.path, this.env.opts.dev, err);
                              }
                          }
                          else {
                              this.compiled = false;
                          }
                      };
                      _proto3.render = function render(ctx, parentFrame, cb) {
                          var _this6 = this;
                          if (typeof ctx === "function") {
                              cb = ctx;
                              ctx = {};
                          }
                          else if (typeof parentFrame === "function") {
                              cb = parentFrame;
                              parentFrame = null;
                          } // If there is a parent frame, we are being called from internal
                          // code of another template, and the internal system
                          // depends on the sync/async nature of the parent template
                          // to be inherited, so force an async callback
                          var forceAsync = !parentFrame; // Catch compile errors for async rendering
                          try {
                              this.compile();
                          }
                          catch (e) {
                              var err = lib._prettifyError(this.path, this.env.opts.dev, e);
                              if (cb) {
                                  return callbackAsap(cb, err);
                              }
                              else {
                                  throw err;
                              }
                          }
                          var context = new Context(ctx || {}, this.blocks, this.env);
                          var frame = parentFrame ? parentFrame.push(true) : new Frame();
                          frame.topLevel = true;
                          var syncResult = null;
                          var didError = false;
                          this.rootRenderFunc(this.env, context, frame, globalRuntime, function (err, res) {
                              // TODO: this is actually a bug in the compiled template (because waterfall
                              // tasks are both not passing errors up the chain of callbacks AND are not
                              // causing a return from the top-most render function). But fixing that
                              // will require a more substantial change to the compiler.
                              if (didError && cb && typeof res !== "undefined") {
                                  // prevent multiple calls to cb
                                  return;
                              }
                              if (err) {
                                  err = lib._prettifyError(_this6.path, _this6.env.opts.dev, err);
                                  didError = true;
                              }
                              if (cb) {
                                  if (forceAsync) {
                                      callbackAsap(cb, err, res);
                                  }
                                  else {
                                      cb(err, res);
                                  }
                              }
                              else {
                                  if (err) {
                                      throw err;
                                  }
                                  syncResult = res;
                              }
                          });
                          return syncResult;
                      };
                      _proto3.getExported = function getExported(ctx, parentFrame, cb) {
                          // eslint-disable-line consistent-return
                          if (typeof ctx === "function") {
                              cb = ctx;
                              ctx = {};
                          }
                          if (typeof parentFrame === "function") {
                              cb = parentFrame;
                              parentFrame = null;
                          } // Catch compile errors for async rendering
                          try {
                              this.compile();
                          }
                          catch (e) {
                              if (cb) {
                                  return cb(e);
                              }
                              else {
                                  throw e;
                              }
                          }
                          var frame = parentFrame ? parentFrame.push() : new Frame();
                          frame.topLevel = true; // Run the rootRenderFunc to populate the context with exported vars
                          var context = new Context(ctx || {}, this.blocks, this.env);
                          this.rootRenderFunc(this.env, context, frame, globalRuntime, function (err) {
                              if (err) {
                                  cb(err, null);
                              }
                              else {
                                  cb(null, context.getExported());
                              }
                          });
                      };
                      _proto3.compile = function compile() {
                          if (!this.compiled) {
                              this._compile();
                          }
                      };
                      _proto3._compile = function _compile() {
                          var props;
                          if (this.tmplProps) {
                              props = this.tmplProps;
                          }
                          else {
                              var source = compiler.compile(this.tmplStr, this.env.asyncFilters, this.env.extensionsList, this.path, this.env.opts);
                              var func = new Function(source); // eslint-disable-line no-new-func
                              props = func();
                          }
                          this.blocks = this._getBlocks(props);
                          this.rootRenderFunc = props.root;
                          this.compiled = true;
                      };
                      _proto3._getBlocks = function _getBlocks(props) {
                          var blocks = {};
                          lib.keys(props).forEach(function (k) {
                              if (k.slice(0, 2) === "b_") {
                                  blocks[k.slice(2)] = props[k];
                              }
                          });
                          return blocks;
                      };
                      return Template;
                  })(Obj);
                  module.exports = {
                      Environment: Environment,
                      Template: Template,
                  };
                  /***/
              },
              /* 8 */
              /***/ function (module, exports, __webpack_require__) {
                  function _inheritsLoose(subClass, superClass) {
                      subClass.prototype = Object.create(superClass.prototype);
                      subClass.prototype.constructor = subClass;
                      _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                      _setPrototypeOf =
                          Object.setPrototypeOf ||
                              function _setPrototypeOf(o, p) {
                                  o.__proto__ = p;
                                  return o;
                              };
                      return _setPrototypeOf(o, p);
                  }
                  var lexer = __webpack_require__(9);
                  var nodes = __webpack_require__(3);
                  var Obj = __webpack_require__(1).Obj;
                  var lib = __webpack_require__(0);
                  var Parser = /*#__PURE__*/ (function (_Obj) {
                      _inheritsLoose(Parser, _Obj);
                      function Parser() {
                          return _Obj.apply(this, arguments) || this;
                      }
                      var _proto = Parser.prototype;
                      _proto.init = function init(tokens) {
                          this.tokens = tokens;
                          this.peeked = null;
                          this.breakOnBlocks = null;
                          this.dropLeadingWhitespace = false;
                          this.extensions = [];
                      };
                      _proto.nextToken = function nextToken(withWhitespace) {
                          var tok;
                          if (this.peeked) {
                              if (!withWhitespace &&
                                  this.peeked.type === lexer.TOKEN_WHITESPACE) {
                                  this.peeked = null;
                              }
                              else {
                                  tok = this.peeked;
                                  this.peeked = null;
                                  return tok;
                              }
                          }
                          tok = this.tokens.nextToken();
                          if (!withWhitespace) {
                              while (tok && tok.type === lexer.TOKEN_WHITESPACE) {
                                  tok = this.tokens.nextToken();
                              }
                          }
                          return tok;
                      };
                      _proto.peekToken = function peekToken() {
                          this.peeked = this.peeked || this.nextToken();
                          return this.peeked;
                      };
                      _proto.pushToken = function pushToken(tok) {
                          if (this.peeked) {
                              throw new Error("pushToken: can only push one token on between reads");
                          }
                          this.peeked = tok;
                      };
                      _proto.error = function error(msg, lineno, colno) {
                          if (lineno === undefined || colno === undefined) {
                              var tok = this.peekToken() || {};
                              lineno = tok.lineno;
                              colno = tok.colno;
                          }
                          if (lineno !== undefined) {
                              lineno += 1;
                          }
                          if (colno !== undefined) {
                              colno += 1;
                          }
                          return new lib.TemplateError(msg, lineno, colno);
                      };
                      _proto.fail = function fail(msg, lineno, colno) {
                          throw this.error(msg, lineno, colno);
                      };
                      _proto.skip = function skip(type) {
                          var tok = this.nextToken();
                          if (!tok || tok.type !== type) {
                              this.pushToken(tok);
                              return false;
                          }
                          return true;
                      };
                      _proto.expect = function expect(type) {
                          var tok = this.nextToken();
                          if (tok.type !== type) {
                              this.fail("expected " + type + ", got " + tok.type, tok.lineno, tok.colno);
                          }
                          return tok;
                      };
                      _proto.skipValue = function skipValue(type, val) {
                          var tok = this.nextToken();
                          if (!tok || tok.type !== type || tok.value !== val) {
                              this.pushToken(tok);
                              return false;
                          }
                          return true;
                      };
                      _proto.skipSymbol = function skipSymbol(val) {
                          return this.skipValue(lexer.TOKEN_SYMBOL, val);
                      };
                      _proto.advanceAfterBlockEnd = function advanceAfterBlockEnd(name) {
                          var tok;
                          if (!name) {
                              tok = this.peekToken();
                              if (!tok) {
                                  this.fail("unexpected end of file");
                              }
                              if (tok.type !== lexer.TOKEN_SYMBOL) {
                                  this.fail("advanceAfterBlockEnd: expected symbol token or " +
                                      "explicit name to be passed");
                              }
                              name = this.nextToken().value;
                          }
                          tok = this.nextToken();
                          if (tok && tok.type === lexer.TOKEN_BLOCK_END) {
                              if (tok.value.charAt(0) === "-") {
                                  this.dropLeadingWhitespace = true;
                              }
                          }
                          else {
                              this.fail("expected block end in " + name + " statement");
                          }
                          return tok;
                      };
                      _proto.advanceAfterVariableEnd = function advanceAfterVariableEnd() {
                          var tok = this.nextToken();
                          if (tok && tok.type === lexer.TOKEN_VARIABLE_END) {
                              this.dropLeadingWhitespace =
                                  tok.value.charAt(tok.value.length - this.tokens.tags.VARIABLE_END.length - 1) === "-";
                          }
                          else {
                              this.pushToken(tok);
                              this.fail("expected variable end");
                          }
                      };
                      _proto.parseFor = function parseFor() {
                          var forTok = this.peekToken();
                          var node;
                          var endBlock;
                          if (this.skipSymbol("for")) {
                              node = new nodes.For(forTok.lineno, forTok.colno);
                              endBlock = "endfor";
                          }
                          else if (this.skipSymbol("asyncEach")) {
                              node = new nodes.AsyncEach(forTok.lineno, forTok.colno);
                              endBlock = "endeach";
                          }
                          else if (this.skipSymbol("asyncAll")) {
                              node = new nodes.AsyncAll(forTok.lineno, forTok.colno);
                              endBlock = "endall";
                          }
                          else {
                              this.fail("parseFor: expected for{Async}", forTok.lineno, forTok.colno);
                          }
                          node.name = this.parsePrimary();
                          if (!(node.name instanceof nodes.Symbol)) {
                              this.fail("parseFor: variable name expected for loop");
                          }
                          var type = this.peekToken().type;
                          if (type === lexer.TOKEN_COMMA) {
                              // key/value iteration
                              var key = node.name;
                              node.name = new nodes.Array(key.lineno, key.colno);
                              node.name.addChild(key);
                              while (this.skip(lexer.TOKEN_COMMA)) {
                                  var prim = this.parsePrimary();
                                  node.name.addChild(prim);
                              }
                          }
                          if (!this.skipSymbol("in")) {
                              this.fail('parseFor: expected "in" keyword for loop', forTok.lineno, forTok.colno);
                          }
                          node.arr = this.parseExpression();
                          this.advanceAfterBlockEnd(forTok.value);
                          node.body = this.parseUntilBlocks(endBlock, "else");
                          if (this.skipSymbol("else")) {
                              this.advanceAfterBlockEnd("else");
                              node.else_ = this.parseUntilBlocks(endBlock);
                          }
                          this.advanceAfterBlockEnd();
                          return node;
                      };
                      _proto.parseMacro = function parseMacro() {
                          var macroTok = this.peekToken();
                          if (!this.skipSymbol("macro")) {
                              this.fail("expected macro");
                          }
                          var name = this.parsePrimary(true);
                          var args = this.parseSignature();
                          var node = new nodes.Macro(macroTok.lineno, macroTok.colno, name, args);
                          this.advanceAfterBlockEnd(macroTok.value);
                          node.body = this.parseUntilBlocks("endmacro");
                          this.advanceAfterBlockEnd();
                          return node;
                      };
                      _proto.parseCall = function parseCall() {
                          // a call block is parsed as a normal FunCall, but with an added
                          // 'caller' kwarg which is a Caller node.
                          var callTok = this.peekToken();
                          if (!this.skipSymbol("call")) {
                              this.fail("expected call");
                          }
                          var callerArgs = this.parseSignature(true) || new nodes.NodeList();
                          var macroCall = this.parsePrimary();
                          this.advanceAfterBlockEnd(callTok.value);
                          var body = this.parseUntilBlocks("endcall");
                          this.advanceAfterBlockEnd();
                          var callerName = new nodes.Symbol(callTok.lineno, callTok.colno, "caller");
                          var callerNode = new nodes.Caller(callTok.lineno, callTok.colno, callerName, callerArgs, body); // add the additional caller kwarg, adding kwargs if necessary
                          var args = macroCall.args.children;
                          if (!(args[args.length - 1] instanceof nodes.KeywordArgs)) {
                              args.push(new nodes.KeywordArgs());
                          }
                          var kwargs = args[args.length - 1];
                          kwargs.addChild(new nodes.Pair(callTok.lineno, callTok.colno, callerName, callerNode));
                          return new nodes.Output(callTok.lineno, callTok.colno, [macroCall]);
                      };
                      _proto.parseWithContext = function parseWithContext() {
                          var tok = this.peekToken();
                          var withContext = null;
                          if (this.skipSymbol("with")) {
                              withContext = true;
                          }
                          else if (this.skipSymbol("without")) {
                              withContext = false;
                          }
                          if (withContext !== null) {
                              if (!this.skipSymbol("context")) {
                                  this.fail("parseFrom: expected context after with/without", tok.lineno, tok.colno);
                              }
                          }
                          return withContext;
                      };
                      _proto.parseImport = function parseImport() {
                          var importTok = this.peekToken();
                          if (!this.skipSymbol("import")) {
                              this.fail("parseImport: expected import", importTok.lineno, importTok.colno);
                          }
                          var template = this.parseExpression();
                          if (!this.skipSymbol("as")) {
                              this.fail('parseImport: expected "as" keyword', importTok.lineno, importTok.colno);
                          }
                          var target = this.parseExpression();
                          var withContext = this.parseWithContext();
                          var node = new nodes.Import(importTok.lineno, importTok.colno, template, target, withContext);
                          this.advanceAfterBlockEnd(importTok.value);
                          return node;
                      };
                      _proto.parseFrom = function parseFrom() {
                          var fromTok = this.peekToken();
                          if (!this.skipSymbol("from")) {
                              this.fail("parseFrom: expected from");
                          }
                          var template = this.parseExpression();
                          if (!this.skipSymbol("import")) {
                              this.fail("parseFrom: expected import", fromTok.lineno, fromTok.colno);
                          }
                          var names = new nodes.NodeList();
                          var withContext;
                          while (1) {
                              // eslint-disable-line no-constant-condition
                              var nextTok = this.peekToken();
                              if (nextTok.type === lexer.TOKEN_BLOCK_END) {
                                  if (!names.children.length) {
                                      this.fail("parseFrom: Expected at least one import name", fromTok.lineno, fromTok.colno);
                                  } // Since we are manually advancing past the block end,
                                  // need to keep track of whitespace control (normally
                                  // this is done in `advanceAfterBlockEnd`
                                  if (nextTok.value.charAt(0) === "-") {
                                      this.dropLeadingWhitespace = true;
                                  }
                                  this.nextToken();
                                  break;
                              }
                              if (names.children.length > 0 && !this.skip(lexer.TOKEN_COMMA)) {
                                  this.fail("parseFrom: expected comma", fromTok.lineno, fromTok.colno);
                              }
                              var name = this.parsePrimary();
                              if (name.value.charAt(0) === "_") {
                                  this.fail("parseFrom: names starting with an underscore cannot be imported", name.lineno, name.colno);
                              }
                              if (this.skipSymbol("as")) {
                                  var alias = this.parsePrimary();
                                  names.addChild(new nodes.Pair(name.lineno, name.colno, name, alias));
                              }
                              else {
                                  names.addChild(name);
                              }
                              withContext = this.parseWithContext();
                          }
                          return new nodes.FromImport(fromTok.lineno, fromTok.colno, template, names, withContext);
                      };
                      _proto.parseBlock = function parseBlock() {
                          var tag = this.peekToken();
                          if (!this.skipSymbol("block")) {
                              this.fail("parseBlock: expected block", tag.lineno, tag.colno);
                          }
                          var node = new nodes.Block(tag.lineno, tag.colno);
                          node.name = this.parsePrimary();
                          if (!(node.name instanceof nodes.Symbol)) {
                              this.fail("parseBlock: variable name expected", tag.lineno, tag.colno);
                          }
                          this.advanceAfterBlockEnd(tag.value);
                          node.body = this.parseUntilBlocks("endblock");
                          this.skipSymbol("endblock");
                          this.skipSymbol(node.name.value);
                          var tok = this.peekToken();
                          if (!tok) {
                              this.fail("parseBlock: expected endblock, got end of file");
                          }
                          this.advanceAfterBlockEnd(tok.value);
                          return node;
                      };
                      _proto.parseExtends = function parseExtends() {
                          var tagName = "extends";
                          var tag = this.peekToken();
                          if (!this.skipSymbol(tagName)) {
                              this.fail("parseTemplateRef: expected " + tagName);
                          }
                          var node = new nodes.Extends(tag.lineno, tag.colno);
                          node.template = this.parseExpression();
                          this.advanceAfterBlockEnd(tag.value);
                          return node;
                      };
                      _proto.parseInclude = function parseInclude() {
                          var tagName = "include";
                          var tag = this.peekToken();
                          if (!this.skipSymbol(tagName)) {
                              this.fail("parseInclude: expected " + tagName);
                          }
                          var node = new nodes.Include(tag.lineno, tag.colno);
                          node.template = this.parseExpression();
                          if (this.skipSymbol("ignore") && this.skipSymbol("missing")) {
                              node.ignoreMissing = true;
                          }
                          this.advanceAfterBlockEnd(tag.value);
                          return node;
                      };
                      _proto.parseIf = function parseIf() {
                          var tag = this.peekToken();
                          var node;
                          if (this.skipSymbol("if") ||
                              this.skipSymbol("elif") ||
                              this.skipSymbol("elseif")) {
                              node = new nodes.If(tag.lineno, tag.colno);
                          }
                          else if (this.skipSymbol("ifAsync")) {
                              node = new nodes.IfAsync(tag.lineno, tag.colno);
                          }
                          else {
                              this.fail("parseIf: expected if, elif, or elseif", tag.lineno, tag.colno);
                          }
                          node.cond = this.parseExpression();
                          this.advanceAfterBlockEnd(tag.value);
                          node.body = this.parseUntilBlocks("elif", "elseif", "else", "endif");
                          var tok = this.peekToken();
                          switch (tok && tok.value) {
                              case "elseif":
                              case "elif":
                                  node.else_ = this.parseIf();
                                  break;
                              case "else":
                                  this.advanceAfterBlockEnd();
                                  node.else_ = this.parseUntilBlocks("endif");
                                  this.advanceAfterBlockEnd();
                                  break;
                              case "endif":
                                  node.else_ = null;
                                  this.advanceAfterBlockEnd();
                                  break;
                              default:
                                  this.fail("parseIf: expected elif, else, or endif, got end of file");
                          }
                          return node;
                      };
                      _proto.parseSet = function parseSet() {
                          var tag = this.peekToken();
                          if (!this.skipSymbol("set")) {
                              this.fail("parseSet: expected set", tag.lineno, tag.colno);
                          }
                          var node = new nodes.Set(tag.lineno, tag.colno, []);
                          var target;
                          while ((target = this.parsePrimary())) {
                              node.targets.push(target);
                              if (!this.skip(lexer.TOKEN_COMMA)) {
                                  break;
                              }
                          }
                          if (!this.skipValue(lexer.TOKEN_OPERATOR, "=")) {
                              if (!this.skip(lexer.TOKEN_BLOCK_END)) {
                                  this.fail("parseSet: expected = or block end in set tag", tag.lineno, tag.colno);
                              }
                              else {
                                  node.body = new nodes.Capture(tag.lineno, tag.colno, this.parseUntilBlocks("endset"));
                                  node.value = null;
                                  this.advanceAfterBlockEnd();
                              }
                          }
                          else {
                              node.value = this.parseExpression();
                              this.advanceAfterBlockEnd(tag.value);
                          }
                          return node;
                      };
                      _proto.parseSwitch = function parseSwitch() {
                          /*
                           * Store the tag names in variables in case someone ever wants to
                           * customize this.
                           */
                          var switchStart = "switch";
                          var switchEnd = "endswitch";
                          var caseStart = "case";
                          var caseDefault = "default"; // Get the switch tag.
                          var tag = this.peekToken(); // fail early if we get some unexpected tag.
                          if (!this.skipSymbol(switchStart) &&
                              !this.skipSymbol(caseStart) &&
                              !this.skipSymbol(caseDefault)) {
                              this.fail('parseSwitch: expected "switch," "case" or "default"', tag.lineno, tag.colno);
                          } // parse the switch expression
                          var expr = this.parseExpression(); // advance until a start of a case, a default case or an endswitch.
                          this.advanceAfterBlockEnd(switchStart);
                          this.parseUntilBlocks(caseStart, caseDefault, switchEnd); // this is the first case. it could also be an endswitch, we'll check.
                          var tok = this.peekToken(); // create new variables for our cases and default case.
                          var cases = [];
                          var defaultCase; // while we're dealing with new cases nodes...
                          do {
                              // skip the start symbol and get the case expression
                              this.skipSymbol(caseStart);
                              var cond = this.parseExpression();
                              this.advanceAfterBlockEnd(switchStart); // get the body of the case node and add it to the array of cases.
                              var body = this.parseUntilBlocks(caseStart, caseDefault, switchEnd);
                              cases.push(new nodes.Case(tok.line, tok.col, cond, body)); // get our next case
                              tok = this.peekToken();
                          } while (tok && tok.value === caseStart); // we either have a default case or a switch end.
                          switch (tok.value) {
                              case caseDefault:
                                  this.advanceAfterBlockEnd();
                                  defaultCase = this.parseUntilBlocks(switchEnd);
                                  this.advanceAfterBlockEnd();
                                  break;
                              case switchEnd:
                                  this.advanceAfterBlockEnd();
                                  break;
                              default:
                                  // otherwise bail because EOF
                                  this.fail('parseSwitch: expected "case," "default" or "endswitch," got EOF.');
                          } // and return the switch node.
                          return new nodes.Switch(tag.lineno, tag.colno, expr, cases, defaultCase);
                      };
                      _proto.parseStatement = function parseStatement() {
                          var tok = this.peekToken();
                          var node;
                          if (tok.type !== lexer.TOKEN_SYMBOL) {
                              this.fail("tag name expected", tok.lineno, tok.colno);
                          }
                          if (this.breakOnBlocks &&
                              lib.indexOf(this.breakOnBlocks, tok.value) !== -1) {
                              return null;
                          }
                          switch (tok.value) {
                              case "raw":
                                  return this.parseRaw();
                              case "verbatim":
                                  return this.parseRaw("verbatim");
                              case "if":
                              case "ifAsync":
                                  return this.parseIf();
                              case "for":
                              case "asyncEach":
                              case "asyncAll":
                                  return this.parseFor();
                              case "block":
                                  return this.parseBlock();
                              case "extends":
                                  return this.parseExtends();
                              case "include":
                                  return this.parseInclude();
                              case "set":
                                  return this.parseSet();
                              case "macro":
                                  return this.parseMacro();
                              case "call":
                                  return this.parseCall();
                              case "import":
                                  return this.parseImport();
                              case "from":
                                  return this.parseFrom();
                              case "filter":
                                  return this.parseFilterStatement();
                              case "switch":
                                  return this.parseSwitch();
                              default:
                                  if (this.extensions.length) {
                                      for (var i = 0; i < this.extensions.length; i++) {
                                          var ext = this.extensions[i];
                                          if (lib.indexOf(ext.tags || [], tok.value) !== -1) {
                                              return ext.parse(this, nodes, lexer);
                                          }
                                      }
                                  }
                                  this.fail("unknown block tag: " + tok.value, tok.lineno, tok.colno);
                          }
                          return node;
                      };
                      _proto.parseRaw = function parseRaw(tagName) {
                          tagName = tagName || "raw";
                          var endTagName = "end" + tagName; // Look for upcoming raw blocks (ignore all other kinds of blocks)
                          var rawBlockRegex = new RegExp("([\\s\\S]*?){%\\s*(" +
                              tagName +
                              "|" +
                              endTagName +
                              ")\\s*(?=%})%}");
                          var rawLevel = 1;
                          var str = "";
                          var matches = null; // Skip opening raw token
                          // Keep this token to track line and column numbers
                          var begun = this.advanceAfterBlockEnd(); // Exit when there's nothing to match
                          // or when we've found the matching "endraw" block
                          while ((matches = this.tokens._extractRegex(rawBlockRegex)) &&
                              rawLevel > 0) {
                              var all = matches[0];
                              var pre = matches[1];
                              var blockName = matches[2]; // Adjust rawlevel
                              if (blockName === tagName) {
                                  rawLevel += 1;
                              }
                              else if (blockName === endTagName) {
                                  rawLevel -= 1;
                              } // Add to str
                              if (rawLevel === 0) {
                                  // We want to exclude the last "endraw"
                                  str += pre; // Move tokenizer to beginning of endraw block
                                  this.tokens.backN(all.length - pre.length);
                              }
                              else {
                                  str += all;
                              }
                          }
                          return new nodes.Output(begun.lineno, begun.colno, [
                              new nodes.TemplateData(begun.lineno, begun.colno, str),
                          ]);
                      };
                      _proto.parsePostfix = function parsePostfix(node) {
                          var lookup;
                          var tok = this.peekToken();
                          while (tok) {
                              if (tok.type === lexer.TOKEN_LEFT_PAREN) {
                                  // Function call
                                  node = new nodes.FunCall(tok.lineno, tok.colno, node, this.parseSignature());
                              }
                              else if (tok.type === lexer.TOKEN_LEFT_BRACKET) {
                                  // Reference
                                  lookup = this.parseAggregate();
                                  if (lookup.children.length > 1) {
                                      this.fail("invalid index");
                                  }
                                  node = new nodes.LookupVal(tok.lineno, tok.colno, node, lookup.children[0]);
                              }
                              else if (tok.type === lexer.TOKEN_OPERATOR &&
                                  tok.value === ".") {
                                  // Reference
                                  this.nextToken();
                                  var val = this.nextToken();
                                  if (val.type !== lexer.TOKEN_SYMBOL) {
                                      this.fail("expected name as lookup value, got " + val.value, val.lineno, val.colno);
                                  } // Make a literal string because it's not a variable
                                  // reference
                                  lookup = new nodes.Literal(val.lineno, val.colno, val.value);
                                  node = new nodes.LookupVal(tok.lineno, tok.colno, node, lookup);
                              }
                              else {
                                  break;
                              }
                              tok = this.peekToken();
                          }
                          return node;
                      };
                      _proto.parseExpression = function parseExpression() {
                          var node = this.parseInlineIf();
                          return node;
                      };
                      _proto.parseInlineIf = function parseInlineIf() {
                          var node = this.parseOr();
                          if (this.skipSymbol("if")) {
                              var condNode = this.parseOr();
                              var bodyNode = node;
                              node = new nodes.InlineIf(node.lineno, node.colno);
                              node.body = bodyNode;
                              node.cond = condNode;
                              if (this.skipSymbol("else")) {
                                  node.else_ = this.parseOr();
                              }
                              else {
                                  node.else_ = null;
                              }
                          }
                          return node;
                      };
                      _proto.parseOr = function parseOr() {
                          var node = this.parseAnd();
                          while (this.skipSymbol("or")) {
                              var node2 = this.parseAnd();
                              node = new nodes.Or(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseAnd = function parseAnd() {
                          var node = this.parseNot();
                          while (this.skipSymbol("and")) {
                              var node2 = this.parseNot();
                              node = new nodes.And(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseNot = function parseNot() {
                          var tok = this.peekToken();
                          if (this.skipSymbol("not")) {
                              return new nodes.Not(tok.lineno, tok.colno, this.parseNot());
                          }
                          return this.parseIn();
                      };
                      _proto.parseIn = function parseIn() {
                          var node = this.parseIs();
                          while (1) {
                              // eslint-disable-line no-constant-condition
                              // check if the next token is 'not'
                              var tok = this.nextToken();
                              if (!tok) {
                                  break;
                              }
                              var invert = tok.type === lexer.TOKEN_SYMBOL && tok.value === "not"; // if it wasn't 'not', put it back
                              if (!invert) {
                                  this.pushToken(tok);
                              }
                              if (this.skipSymbol("in")) {
                                  var node2 = this.parseIs();
                                  node = new nodes.In(node.lineno, node.colno, node, node2);
                                  if (invert) {
                                      node = new nodes.Not(node.lineno, node.colno, node);
                                  }
                              }
                              else {
                                  // if we'd found a 'not' but this wasn't an 'in', put back the 'not'
                                  if (invert) {
                                      this.pushToken(tok);
                                  }
                                  break;
                              }
                          }
                          return node;
                      }; // I put this right after "in" in the operator precedence stack. That can
                      // obviously be changed to be closer to Jinja.
                      _proto.parseIs = function parseIs() {
                          var node = this.parseCompare(); // look for an is
                          if (this.skipSymbol("is")) {
                              // look for a not
                              var not = this.skipSymbol("not"); // get the next node
                              var node2 = this.parseCompare(); // create an Is node using the next node and the info from our Is node.
                              node = new nodes.Is(node.lineno, node.colno, node, node2); // if we have a Not, create a Not node from our Is node.
                              if (not) {
                                  node = new nodes.Not(node.lineno, node.colno, node);
                              }
                          } // return the node.
                          return node;
                      };
                      _proto.parseCompare = function parseCompare() {
                          var compareOps = ["==", "===", "!=", "!==", "<", ">", "<=", ">="];
                          var expr = this.parseConcat();
                          var ops = [];
                          while (1) {
                              // eslint-disable-line no-constant-condition
                              var tok = this.nextToken();
                              if (!tok) {
                                  break;
                              }
                              else if (compareOps.indexOf(tok.value) !== -1) {
                                  ops.push(new nodes.CompareOperand(tok.lineno, tok.colno, this.parseConcat(), tok.value));
                              }
                              else {
                                  this.pushToken(tok);
                                  break;
                              }
                          }
                          if (ops.length) {
                              return new nodes.Compare(ops[0].lineno, ops[0].colno, expr, ops);
                          }
                          else {
                              return expr;
                          }
                      }; // finds the '~' for string concatenation
                      _proto.parseConcat = function parseConcat() {
                          var node = this.parseAdd();
                          while (this.skipValue(lexer.TOKEN_TILDE, "~")) {
                              var node2 = this.parseAdd();
                              node = new nodes.Concat(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseAdd = function parseAdd() {
                          var node = this.parseSub();
                          while (this.skipValue(lexer.TOKEN_OPERATOR, "+")) {
                              var node2 = this.parseSub();
                              node = new nodes.Add(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseSub = function parseSub() {
                          var node = this.parseMul();
                          while (this.skipValue(lexer.TOKEN_OPERATOR, "-")) {
                              var node2 = this.parseMul();
                              node = new nodes.Sub(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseMul = function parseMul() {
                          var node = this.parseDiv();
                          while (this.skipValue(lexer.TOKEN_OPERATOR, "*")) {
                              var node2 = this.parseDiv();
                              node = new nodes.Mul(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseDiv = function parseDiv() {
                          var node = this.parseFloorDiv();
                          while (this.skipValue(lexer.TOKEN_OPERATOR, "/")) {
                              var node2 = this.parseFloorDiv();
                              node = new nodes.Div(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseFloorDiv = function parseFloorDiv() {
                          var node = this.parseMod();
                          while (this.skipValue(lexer.TOKEN_OPERATOR, "//")) {
                              var node2 = this.parseMod();
                              node = new nodes.FloorDiv(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseMod = function parseMod() {
                          var node = this.parsePow();
                          while (this.skipValue(lexer.TOKEN_OPERATOR, "%")) {
                              var node2 = this.parsePow();
                              node = new nodes.Mod(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parsePow = function parsePow() {
                          var node = this.parseUnary();
                          while (this.skipValue(lexer.TOKEN_OPERATOR, "**")) {
                              var node2 = this.parseUnary();
                              node = new nodes.Pow(node.lineno, node.colno, node, node2);
                          }
                          return node;
                      };
                      _proto.parseUnary = function parseUnary(noFilters) {
                          var tok = this.peekToken();
                          var node;
                          if (this.skipValue(lexer.TOKEN_OPERATOR, "-")) {
                              node = new nodes.Neg(tok.lineno, tok.colno, this.parseUnary(true));
                          }
                          else if (this.skipValue(lexer.TOKEN_OPERATOR, "+")) {
                              node = new nodes.Pos(tok.lineno, tok.colno, this.parseUnary(true));
                          }
                          else {
                              node = this.parsePrimary();
                          }
                          if (!noFilters) {
                              node = this.parseFilter(node);
                          }
                          return node;
                      };
                      _proto.parsePrimary = function parsePrimary(noPostfix) {
                          var tok = this.nextToken();
                          var val;
                          var node = null;
                          if (!tok) {
                              this.fail("expected expression, got end of file");
                          }
                          else if (tok.type === lexer.TOKEN_STRING) {
                              val = tok.value;
                          }
                          else if (tok.type === lexer.TOKEN_INT) {
                              val = parseInt(tok.value, 10);
                          }
                          else if (tok.type === lexer.TOKEN_FLOAT) {
                              val = parseFloat(tok.value);
                          }
                          else if (tok.type === lexer.TOKEN_BOOLEAN) {
                              if (tok.value === "true") {
                                  val = true;
                              }
                              else if (tok.value === "false") {
                                  val = false;
                              }
                              else {
                                  this.fail("invalid boolean: " + tok.value, tok.lineno, tok.colno);
                              }
                          }
                          else if (tok.type === lexer.TOKEN_NONE) {
                              val = null;
                          }
                          else if (tok.type === lexer.TOKEN_REGEX) {
                              val = new RegExp(tok.value.body, tok.value.flags);
                          }
                          if (val !== undefined) {
                              node = new nodes.Literal(tok.lineno, tok.colno, val);
                          }
                          else if (tok.type === lexer.TOKEN_SYMBOL) {
                              node = new nodes.Symbol(tok.lineno, tok.colno, tok.value);
                          }
                          else {
                              // See if it's an aggregate type, we need to push the
                              // current delimiter token back on
                              this.pushToken(tok);
                              node = this.parseAggregate();
                          }
                          if (!noPostfix) {
                              node = this.parsePostfix(node);
                          }
                          if (node) {
                              return node;
                          }
                          else {
                              throw this.error("unexpected token: " + tok.value, tok.lineno, tok.colno);
                          }
                      };
                      _proto.parseFilterName = function parseFilterName() {
                          var tok = this.expect(lexer.TOKEN_SYMBOL);
                          var name = tok.value;
                          while (this.skipValue(lexer.TOKEN_OPERATOR, ".")) {
                              name += "." + this.expect(lexer.TOKEN_SYMBOL).value;
                          }
                          return new nodes.Symbol(tok.lineno, tok.colno, name);
                      };
                      _proto.parseFilterArgs = function parseFilterArgs(node) {
                          if (this.peekToken().type === lexer.TOKEN_LEFT_PAREN) {
                              // Get a FunCall node and add the parameters to the
                              // filter
                              var call = this.parsePostfix(node);
                              return call.args.children;
                          }
                          return [];
                      };
                      _proto.parseFilter = function parseFilter(node) {
                          while (this.skip(lexer.TOKEN_PIPE)) {
                              var name = this.parseFilterName();
                              node = new nodes.Filter(name.lineno, name.colno, name, new nodes.NodeList(name.lineno, name.colno, [node].concat(this.parseFilterArgs(node))));
                          }
                          return node;
                      };
                      _proto.parseFilterStatement = function parseFilterStatement() {
                          var filterTok = this.peekToken();
                          if (!this.skipSymbol("filter")) {
                              this.fail("parseFilterStatement: expected filter");
                          }
                          var name = this.parseFilterName();
                          var args = this.parseFilterArgs(name);
                          this.advanceAfterBlockEnd(filterTok.value);
                          var body = new nodes.Capture(name.lineno, name.colno, this.parseUntilBlocks("endfilter"));
                          this.advanceAfterBlockEnd();
                          var node = new nodes.Filter(name.lineno, name.colno, name, new nodes.NodeList(name.lineno, name.colno, [body].concat(args)));
                          return new nodes.Output(name.lineno, name.colno, [node]);
                      };
                      _proto.parseAggregate = function parseAggregate() {
                          var tok = this.nextToken();
                          var node;
                          switch (tok.type) {
                              case lexer.TOKEN_LEFT_PAREN:
                                  node = new nodes.Group(tok.lineno, tok.colno);
                                  break;
                              case lexer.TOKEN_LEFT_BRACKET:
                                  node = new nodes.Array(tok.lineno, tok.colno);
                                  break;
                              case lexer.TOKEN_LEFT_CURLY:
                                  node = new nodes.Dict(tok.lineno, tok.colno);
                                  break;
                              default:
                                  return null;
                          }
                          while (1) {
                              // eslint-disable-line no-constant-condition
                              var type = this.peekToken().type;
                              if (type === lexer.TOKEN_RIGHT_PAREN ||
                                  type === lexer.TOKEN_RIGHT_BRACKET ||
                                  type === lexer.TOKEN_RIGHT_CURLY) {
                                  this.nextToken();
                                  break;
                              }
                              if (node.children.length > 0) {
                                  if (!this.skip(lexer.TOKEN_COMMA)) {
                                      this.fail("parseAggregate: expected comma after expression", tok.lineno, tok.colno);
                                  }
                              }
                              if (node instanceof nodes.Dict) {
                                  // TODO: check for errors
                                  var key = this.parsePrimary(); // We expect a key/value pair for dicts, separated by a
                                  // colon
                                  if (!this.skip(lexer.TOKEN_COLON)) {
                                      this.fail("parseAggregate: expected colon after dict key", tok.lineno, tok.colno);
                                  } // TODO: check for errors
                                  var value = this.parseExpression();
                                  node.addChild(new nodes.Pair(key.lineno, key.colno, key, value));
                              }
                              else {
                                  // TODO: check for errors
                                  var expr = this.parseExpression();
                                  node.addChild(expr);
                              }
                          }
                          return node;
                      };
                      _proto.parseSignature = function parseSignature(tolerant, noParens) {
                          var tok = this.peekToken();
                          if (!noParens && tok.type !== lexer.TOKEN_LEFT_PAREN) {
                              if (tolerant) {
                                  return null;
                              }
                              else {
                                  this.fail("expected arguments", tok.lineno, tok.colno);
                              }
                          }
                          if (tok.type === lexer.TOKEN_LEFT_PAREN) {
                              tok = this.nextToken();
                          }
                          var args = new nodes.NodeList(tok.lineno, tok.colno);
                          var kwargs = new nodes.KeywordArgs(tok.lineno, tok.colno);
                          var checkComma = false;
                          while (1) {
                              // eslint-disable-line no-constant-condition
                              tok = this.peekToken();
                              if (!noParens && tok.type === lexer.TOKEN_RIGHT_PAREN) {
                                  this.nextToken();
                                  break;
                              }
                              else if (noParens && tok.type === lexer.TOKEN_BLOCK_END) {
                                  break;
                              }
                              if (checkComma && !this.skip(lexer.TOKEN_COMMA)) {
                                  this.fail("parseSignature: expected comma after expression", tok.lineno, tok.colno);
                              }
                              else {
                                  var arg = this.parseExpression();
                                  if (this.skipValue(lexer.TOKEN_OPERATOR, "=")) {
                                      kwargs.addChild(new nodes.Pair(arg.lineno, arg.colno, arg, this.parseExpression()));
                                  }
                                  else {
                                      args.addChild(arg);
                                  }
                              }
                              checkComma = true;
                          }
                          if (kwargs.children.length) {
                              args.addChild(kwargs);
                          }
                          return args;
                      };
                      _proto.parseUntilBlocks = function parseUntilBlocks() {
                          var prev = this.breakOnBlocks;
                          for (var _len = arguments.length, blockNames = new Array(_len), _key = 0; _key < _len; _key++) {
                              blockNames[_key] = arguments[_key];
                          }
                          this.breakOnBlocks = blockNames;
                          var ret = this.parse();
                          this.breakOnBlocks = prev;
                          return ret;
                      };
                      _proto.parseNodes = function parseNodes() {
                          var tok;
                          var buf = [];
                          while ((tok = this.nextToken())) {
                              if (tok.type === lexer.TOKEN_DATA) {
                                  var data = tok.value;
                                  var nextToken = this.peekToken();
                                  var nextVal = nextToken && nextToken.value; // If the last token has "-" we need to trim the
                                  // leading whitespace of the data. This is marked with
                                  // the `dropLeadingWhitespace` variable.
                                  if (this.dropLeadingWhitespace) {
                                      // TODO: this could be optimized (don't use regex)
                                      data = data.replace(/^\s*/, "");
                                      this.dropLeadingWhitespace = false;
                                  } // Same for the succeeding block start token
                                  if (nextToken &&
                                      ((nextToken.type === lexer.TOKEN_BLOCK_START &&
                                          nextVal.charAt(nextVal.length - 1) === "-") ||
                                          (nextToken.type === lexer.TOKEN_VARIABLE_START &&
                                              nextVal.charAt(this.tokens.tags.VARIABLE_START.length) ===
                                                  "-") ||
                                          (nextToken.type === lexer.TOKEN_COMMENT &&
                                              nextVal.charAt(this.tokens.tags.COMMENT_START.length) ===
                                                  "-"))) {
                                      // TODO: this could be optimized (don't use regex)
                                      data = data.replace(/\s*$/, "");
                                  }
                                  buf.push(new nodes.Output(tok.lineno, tok.colno, [
                                      new nodes.TemplateData(tok.lineno, tok.colno, data),
                                  ]));
                              }
                              else if (tok.type === lexer.TOKEN_BLOCK_START) {
                                  this.dropLeadingWhitespace = false;
                                  var n = this.parseStatement();
                                  if (!n) {
                                      break;
                                  }
                                  buf.push(n);
                              }
                              else if (tok.type === lexer.TOKEN_VARIABLE_START) {
                                  var e = this.parseExpression();
                                  this.dropLeadingWhitespace = false;
                                  this.advanceAfterVariableEnd();
                                  buf.push(new nodes.Output(tok.lineno, tok.colno, [e]));
                              }
                              else if (tok.type === lexer.TOKEN_COMMENT) {
                                  this.dropLeadingWhitespace =
                                      tok.value.charAt(tok.value.length - this.tokens.tags.COMMENT_END.length - 1) === "-";
                              }
                              else {
                                  // Ignore comments, otherwise this should be an error
                                  this.fail("Unexpected token at top-level: " + tok.type, tok.lineno, tok.colno);
                              }
                          }
                          return buf;
                      };
                      _proto.parse = function parse() {
                          return new nodes.NodeList(0, 0, this.parseNodes());
                      };
                      _proto.parseAsRoot = function parseAsRoot() {
                          return new nodes.Root(0, 0, this.parseNodes());
                      };
                      return Parser;
                  })(Obj); // var util = require('util');
                  // var l = lexer.lex('{%- if x -%}\n hello {% endif %}');
                  // var t;
                  // while((t = l.nextToken())) {
                  //     console.log(util.inspect(t));
                  // }
                  // var p = new Parser(lexer.lex('hello {% filter title %}' +
                  //                              'Hello madam how are you' +
                  //                              '{% endfilter %}'));
                  // var n = p.parseAsRoot();
                  // nodes.printNodes(n);
                  module.exports = {
                      parse: function parse(src, extensions, opts) {
                          var p = new Parser(lexer.lex(src, opts));
                          if (extensions !== undefined) {
                              p.extensions = extensions;
                          }
                          return p.parseAsRoot();
                      },
                      Parser: Parser,
                  };
                  /***/
              },
              /* 9 */
              /***/ function (module, exports, __webpack_require__) {
                  var lib = __webpack_require__(0);
                  var whitespaceChars = " \n\t\r\xA0";
                  var delimChars = "()[]{}%*-+~/#,:|.<>=!";
                  var intChars = "0123456789";
                  var BLOCK_START = "{%";
                  var BLOCK_END = "%}";
                  var VARIABLE_START = "{{";
                  var VARIABLE_END = "}}";
                  var COMMENT_START = "{#";
                  var COMMENT_END = "#}";
                  var TOKEN_STRING = "string";
                  var TOKEN_WHITESPACE = "whitespace";
                  var TOKEN_DATA = "data";
                  var TOKEN_BLOCK_START = "block-start";
                  var TOKEN_BLOCK_END = "block-end";
                  var TOKEN_VARIABLE_START = "variable-start";
                  var TOKEN_VARIABLE_END = "variable-end";
                  var TOKEN_COMMENT = "comment";
                  var TOKEN_LEFT_PAREN = "left-paren";
                  var TOKEN_RIGHT_PAREN = "right-paren";
                  var TOKEN_LEFT_BRACKET = "left-bracket";
                  var TOKEN_RIGHT_BRACKET = "right-bracket";
                  var TOKEN_LEFT_CURLY = "left-curly";
                  var TOKEN_RIGHT_CURLY = "right-curly";
                  var TOKEN_OPERATOR = "operator";
                  var TOKEN_COMMA = "comma";
                  var TOKEN_COLON = "colon";
                  var TOKEN_TILDE = "tilde";
                  var TOKEN_PIPE = "pipe";
                  var TOKEN_INT = "int";
                  var TOKEN_FLOAT = "float";
                  var TOKEN_BOOLEAN = "boolean";
                  var TOKEN_NONE = "none";
                  var TOKEN_SYMBOL = "symbol";
                  var TOKEN_SPECIAL = "special";
                  var TOKEN_REGEX = "regex";
                  function token(type, value, lineno, colno) {
                      return {
                          type: type,
                          value: value,
                          lineno: lineno,
                          colno: colno,
                      };
                  }
                  var Tokenizer = /*#__PURE__*/ (function () {
                      function Tokenizer(str, opts) {
                          this.str = str;
                          this.index = 0;
                          this.len = str.length;
                          this.lineno = 0;
                          this.colno = 0;
                          this.in_code = false;
                          opts = opts || {};
                          var tags = opts.tags || {};
                          this.tags = {
                              BLOCK_START: tags.blockStart || BLOCK_START,
                              BLOCK_END: tags.blockEnd || BLOCK_END,
                              VARIABLE_START: tags.variableStart || VARIABLE_START,
                              VARIABLE_END: tags.variableEnd || VARIABLE_END,
                              COMMENT_START: tags.commentStart || COMMENT_START,
                              COMMENT_END: tags.commentEnd || COMMENT_END,
                          };
                          this.trimBlocks = !!opts.trimBlocks;
                          this.lstripBlocks = !!opts.lstripBlocks;
                      }
                      var _proto = Tokenizer.prototype;
                      _proto.nextToken = function nextToken() {
                          var lineno = this.lineno;
                          var colno = this.colno;
                          var tok;
                          if (this.in_code) {
                              // Otherwise, if we are in a block parse it as code
                              var cur = this.current();
                              if (this.isFinished()) {
                                  // We have nothing else to parse
                                  return null;
                              }
                              else if (cur === '"' || cur === "'") {
                                  // We've hit a string
                                  return token(TOKEN_STRING, this._parseString(cur), lineno, colno);
                              }
                              else if ((tok = this._extract(whitespaceChars))) {
                                  // We hit some whitespace
                                  return token(TOKEN_WHITESPACE, tok, lineno, colno);
                              }
                              else if ((tok = this._extractString(this.tags.BLOCK_END)) ||
                                  (tok = this._extractString("-" + this.tags.BLOCK_END))) {
                                  // Special check for the block end tag
                                  //
                                  // It is a requirement that start and end tags are composed of
                                  // delimiter characters (%{}[] etc), and our code always
                                  // breaks on delimiters so we can assume the token parsing
                                  // doesn't consume these elsewhere
                                  this.in_code = false;
                                  if (this.trimBlocks) {
                                      cur = this.current();
                                      if (cur === "\n") {
                                          // Skip newline
                                          this.forward();
                                      }
                                      else if (cur === "\r") {
                                          // Skip CRLF newline
                                          this.forward();
                                          cur = this.current();
                                          if (cur === "\n") {
                                              this.forward();
                                          }
                                          else {
                                              // Was not a CRLF, so go back
                                              this.back();
                                          }
                                      }
                                  }
                                  return token(TOKEN_BLOCK_END, tok, lineno, colno);
                              }
                              else if ((tok = this._extractString(this.tags.VARIABLE_END)) ||
                                  (tok = this._extractString("-" + this.tags.VARIABLE_END))) {
                                  // Special check for variable end tag (see above)
                                  this.in_code = false;
                                  return token(TOKEN_VARIABLE_END, tok, lineno, colno);
                              }
                              else if (cur === "r" &&
                                  this.str.charAt(this.index + 1) === "/") {
                                  // Skip past 'r/'.
                                  this.forwardN(2); // Extract until the end of the regex -- / ends it, \/ does not.
                                  var regexBody = "";
                                  while (!this.isFinished()) {
                                      if (this.current() === "/" && this.previous() !== "\\") {
                                          this.forward();
                                          break;
                                      }
                                      else {
                                          regexBody += this.current();
                                          this.forward();
                                      }
                                  } // Check for flags.
                                  // The possible flags are according to https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
                                  var POSSIBLE_FLAGS = ["g", "i", "m", "y"];
                                  var regexFlags = "";
                                  while (!this.isFinished()) {
                                      var isCurrentAFlag = POSSIBLE_FLAGS.indexOf(this.current()) !== -1;
                                      if (isCurrentAFlag) {
                                          regexFlags += this.current();
                                          this.forward();
                                      }
                                      else {
                                          break;
                                      }
                                  }
                                  return token(TOKEN_REGEX, {
                                      body: regexBody,
                                      flags: regexFlags,
                                  }, lineno, colno);
                              }
                              else if (delimChars.indexOf(cur) !== -1) {
                                  // We've hit a delimiter (a special char like a bracket)
                                  this.forward();
                                  var complexOps = [
                                      "==",
                                      "===",
                                      "!=",
                                      "!==",
                                      "<=",
                                      ">=",
                                      "//",
                                      "**",
                                  ];
                                  var curComplex = cur + this.current();
                                  var type;
                                  if (lib.indexOf(complexOps, curComplex) !== -1) {
                                      this.forward();
                                      cur = curComplex; // See if this is a strict equality/inequality comparator
                                      if (lib.indexOf(complexOps, curComplex + this.current()) !== -1) {
                                          cur = curComplex + this.current();
                                          this.forward();
                                      }
                                  }
                                  switch (cur) {
                                      case "(":
                                          type = TOKEN_LEFT_PAREN;
                                          break;
                                      case ")":
                                          type = TOKEN_RIGHT_PAREN;
                                          break;
                                      case "[":
                                          type = TOKEN_LEFT_BRACKET;
                                          break;
                                      case "]":
                                          type = TOKEN_RIGHT_BRACKET;
                                          break;
                                      case "{":
                                          type = TOKEN_LEFT_CURLY;
                                          break;
                                      case "}":
                                          type = TOKEN_RIGHT_CURLY;
                                          break;
                                      case ",":
                                          type = TOKEN_COMMA;
                                          break;
                                      case ":":
                                          type = TOKEN_COLON;
                                          break;
                                      case "~":
                                          type = TOKEN_TILDE;
                                          break;
                                      case "|":
                                          type = TOKEN_PIPE;
                                          break;
                                      default:
                                          type = TOKEN_OPERATOR;
                                  }
                                  return token(type, cur, lineno, colno);
                              }
                              else {
                                  // We are not at whitespace or a delimiter, so extract the
                                  // text and parse it
                                  tok = this._extractUntil(whitespaceChars + delimChars);
                                  if (tok.match(/^[-+]?[0-9]+$/)) {
                                      if (this.current() === ".") {
                                          this.forward();
                                          var dec = this._extract(intChars);
                                          return token(TOKEN_FLOAT, tok + "." + dec, lineno, colno);
                                      }
                                      else {
                                          return token(TOKEN_INT, tok, lineno, colno);
                                      }
                                  }
                                  else if (tok.match(/^(true|false)$/)) {
                                      return token(TOKEN_BOOLEAN, tok, lineno, colno);
                                  }
                                  else if (tok === "none") {
                                      return token(TOKEN_NONE, tok, lineno, colno);
                                      /*
                                       * Added to make the test `null is null` evaluate truthily.
                                       * Otherwise, Nunjucks will look up null in the context and
                                       * return `undefined`, which is not what we want. This *may* have
                                       * consequences is someone is using null in their templates as a
                                       * variable.
                                       */
                                  }
                                  else if (tok === "null") {
                                      return token(TOKEN_NONE, tok, lineno, colno);
                                  }
                                  else if (tok) {
                                      return token(TOKEN_SYMBOL, tok, lineno, colno);
                                  }
                                  else {
                                      throw new Error("Unexpected value while parsing: " + tok);
                                  }
                              }
                          }
                          else {
                              // Parse out the template text, breaking on tag
                              // delimiters because we need to look for block/variable start
                              // tags (don't use the full delimChars for optimization)
                              var beginChars = this.tags.BLOCK_START.charAt(0) +
                                  this.tags.VARIABLE_START.charAt(0) +
                                  this.tags.COMMENT_START.charAt(0) +
                                  this.tags.COMMENT_END.charAt(0);
                              if (this.isFinished()) {
                                  return null;
                              }
                              else if ((tok = this._extractString(this.tags.BLOCK_START + "-")) ||
                                  (tok = this._extractString(this.tags.BLOCK_START))) {
                                  this.in_code = true;
                                  return token(TOKEN_BLOCK_START, tok, lineno, colno);
                              }
                              else if ((tok = this._extractString(this.tags.VARIABLE_START + "-")) ||
                                  (tok = this._extractString(this.tags.VARIABLE_START))) {
                                  this.in_code = true;
                                  return token(TOKEN_VARIABLE_START, tok, lineno, colno);
                              }
                              else {
                                  tok = "";
                                  var data;
                                  var inComment = false;
                                  if (this._matches(this.tags.COMMENT_START)) {
                                      inComment = true;
                                      tok = this._extractString(this.tags.COMMENT_START);
                                  } // Continually consume text, breaking on the tag delimiter
                                  // characters and checking to see if it's a start tag.
                                  //
                                  // We could hit the end of the template in the middle of
                                  // our looping, so check for the null return value from
                                  // _extractUntil
                                  while ((data = this._extractUntil(beginChars)) !== null) {
                                      tok += data;
                                      if ((this._matches(this.tags.BLOCK_START) ||
                                          this._matches(this.tags.VARIABLE_START) ||
                                          this._matches(this.tags.COMMENT_START)) &&
                                          !inComment) {
                                          if (this.lstripBlocks &&
                                              this._matches(this.tags.BLOCK_START) &&
                                              this.colno > 0 &&
                                              this.colno <= tok.length) {
                                              var lastLine = tok.slice(-this.colno);
                                              if (/^\s+$/.test(lastLine)) {
                                                  // Remove block leading whitespace from beginning of the string
                                                  tok = tok.slice(0, -this.colno);
                                                  if (!tok.length) {
                                                      // All data removed, collapse to avoid unnecessary nodes
                                                      // by returning next token (block start)
                                                      return this.nextToken();
                                                  }
                                              }
                                          } // If it is a start tag, stop looping
                                          break;
                                      }
                                      else if (this._matches(this.tags.COMMENT_END)) {
                                          if (!inComment) {
                                              throw new Error("unexpected end of comment");
                                          }
                                          tok += this._extractString(this.tags.COMMENT_END);
                                          break;
                                      }
                                      else {
                                          // It does not match any tag, so add the character and
                                          // carry on
                                          tok += this.current();
                                          this.forward();
                                      }
                                  }
                                  if (data === null && inComment) {
                                      throw new Error("expected end of comment, got end of file");
                                  }
                                  return token(inComment ? TOKEN_COMMENT : TOKEN_DATA, tok, lineno, colno);
                              }
                          }
                      };
                      _proto._parseString = function _parseString(delimiter) {
                          this.forward();
                          var str = "";
                          while (!this.isFinished() && this.current() !== delimiter) {
                              var cur = this.current();
                              if (cur === "\\") {
                                  this.forward();
                                  switch (this.current()) {
                                      case "n":
                                          str += "\n";
                                          break;
                                      case "t":
                                          str += "\t";
                                          break;
                                      case "r":
                                          str += "\r";
                                          break;
                                      default:
                                          str += this.current();
                                  }
                                  this.forward();
                              }
                              else {
                                  str += cur;
                                  this.forward();
                              }
                          }
                          this.forward();
                          return str;
                      };
                      _proto._matches = function _matches(str) {
                          if (this.index + str.length > this.len) {
                              return null;
                          }
                          var m = this.str.slice(this.index, this.index + str.length);
                          return m === str;
                      };
                      _proto._extractString = function _extractString(str) {
                          if (this._matches(str)) {
                              this.forwardN(str.length);
                              return str;
                          }
                          return null;
                      };
                      _proto._extractUntil = function _extractUntil(charString) {
                          // Extract all non-matching chars, with the default matching set
                          // to everything
                          return this._extractMatching(true, charString || "");
                      };
                      _proto._extract = function _extract(charString) {
                          // Extract all matching chars (no default, so charString must be
                          // explicit)
                          return this._extractMatching(false, charString);
                      };
                      _proto._extractMatching = function _extractMatching(breakOnMatch, charString) {
                          // Pull out characters until a breaking char is hit.
                          // If breakOnMatch is false, a non-matching char stops it.
                          // If breakOnMatch is true, a matching char stops it.
                          if (this.isFinished()) {
                              return null;
                          }
                          var first = charString.indexOf(this.current()); // Only proceed if the first character doesn't meet our condition
                          if ((breakOnMatch && first === -1) ||
                              (!breakOnMatch && first !== -1)) {
                              var t = this.current();
                              this.forward(); // And pull out all the chars one at a time until we hit a
                              // breaking char
                              var idx = charString.indexOf(this.current());
                              while (((breakOnMatch && idx === -1) ||
                                  (!breakOnMatch && idx !== -1)) &&
                                  !this.isFinished()) {
                                  t += this.current();
                                  this.forward();
                                  idx = charString.indexOf(this.current());
                              }
                              return t;
                          }
                          return "";
                      };
                      _proto._extractRegex = function _extractRegex(regex) {
                          var matches = this.currentStr().match(regex);
                          if (!matches) {
                              return null;
                          } // Move forward whatever was matched
                          this.forwardN(matches[0].length);
                          return matches;
                      };
                      _proto.isFinished = function isFinished() {
                          return this.index >= this.len;
                      };
                      _proto.forwardN = function forwardN(n) {
                          for (var i = 0; i < n; i++) {
                              this.forward();
                          }
                      };
                      _proto.forward = function forward() {
                          this.index++;
                          if (this.previous() === "\n") {
                              this.lineno++;
                              this.colno = 0;
                          }
                          else {
                              this.colno++;
                          }
                      };
                      _proto.backN = function backN(n) {
                          for (var i = 0; i < n; i++) {
                              this.back();
                          }
                      };
                      _proto.back = function back() {
                          this.index--;
                          if (this.current() === "\n") {
                              this.lineno--;
                              var idx = this.src.lastIndexOf("\n", this.index - 1);
                              if (idx === -1) {
                                  this.colno = this.index;
                              }
                              else {
                                  this.colno = this.index - idx;
                              }
                          }
                          else {
                              this.colno--;
                          }
                      }; // current returns current character
                      _proto.current = function current() {
                          if (!this.isFinished()) {
                              return this.str.charAt(this.index);
                          }
                          return "";
                      }; // currentStr returns what's left of the unparsed string
                      _proto.currentStr = function currentStr() {
                          if (!this.isFinished()) {
                              return this.str.substr(this.index);
                          }
                          return "";
                      };
                      _proto.previous = function previous() {
                          return this.str.charAt(this.index - 1);
                      };
                      return Tokenizer;
                  })();
                  module.exports = {
                      lex: function lex(src, opts) {
                          return new Tokenizer(src, opts);
                      },
                      TOKEN_STRING: TOKEN_STRING,
                      TOKEN_WHITESPACE: TOKEN_WHITESPACE,
                      TOKEN_DATA: TOKEN_DATA,
                      TOKEN_BLOCK_START: TOKEN_BLOCK_START,
                      TOKEN_BLOCK_END: TOKEN_BLOCK_END,
                      TOKEN_VARIABLE_START: TOKEN_VARIABLE_START,
                      TOKEN_VARIABLE_END: TOKEN_VARIABLE_END,
                      TOKEN_COMMENT: TOKEN_COMMENT,
                      TOKEN_LEFT_PAREN: TOKEN_LEFT_PAREN,
                      TOKEN_RIGHT_PAREN: TOKEN_RIGHT_PAREN,
                      TOKEN_LEFT_BRACKET: TOKEN_LEFT_BRACKET,
                      TOKEN_RIGHT_BRACKET: TOKEN_RIGHT_BRACKET,
                      TOKEN_LEFT_CURLY: TOKEN_LEFT_CURLY,
                      TOKEN_RIGHT_CURLY: TOKEN_RIGHT_CURLY,
                      TOKEN_OPERATOR: TOKEN_OPERATOR,
                      TOKEN_COMMA: TOKEN_COMMA,
                      TOKEN_COLON: TOKEN_COLON,
                      TOKEN_TILDE: TOKEN_TILDE,
                      TOKEN_PIPE: TOKEN_PIPE,
                      TOKEN_INT: TOKEN_INT,
                      TOKEN_FLOAT: TOKEN_FLOAT,
                      TOKEN_BOOLEAN: TOKEN_BOOLEAN,
                      TOKEN_NONE: TOKEN_NONE,
                      TOKEN_SYMBOL: TOKEN_SYMBOL,
                      TOKEN_SPECIAL: TOKEN_SPECIAL,
                      TOKEN_REGEX: TOKEN_REGEX,
                  };
                  /***/
              },
              /* 10 */
              /***/ function (module, exports, __webpack_require__) {
                  function _inheritsLoose(subClass, superClass) {
                      subClass.prototype = Object.create(superClass.prototype);
                      subClass.prototype.constructor = subClass;
                      _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                      _setPrototypeOf =
                          Object.setPrototypeOf ||
                              function _setPrototypeOf(o, p) {
                                  o.__proto__ = p;
                                  return o;
                              };
                      return _setPrototypeOf(o, p);
                  }
                  var Loader = __webpack_require__(6);
                  var _require = __webpack_require__(19), PrecompiledLoader = _require.PrecompiledLoader;
                  var WebLoader = /*#__PURE__*/ (function (_Loader) {
                      _inheritsLoose(WebLoader, _Loader);
                      function WebLoader(baseURL, opts) {
                          var _this;
                          _this = _Loader.call(this) || this;
                          _this.baseURL = baseURL || ".";
                          opts = opts || {}; // By default, the cache is turned off because there's no way
                          // to "watch" templates over HTTP, so they are re-downloaded
                          // and compiled each time. (Remember, PRECOMPILE YOUR
                          // TEMPLATES in production!)
                          _this.useCache = !!opts.useCache; // We default `async` to false so that the simple synchronous
                          // API can be used when you aren't doing anything async in
                          // your templates (which is most of the time). This performs a
                          // sync ajax request, but that's ok because it should *only*
                          // happen in development. PRECOMPILE YOUR TEMPLATES.
                          _this.async = !!opts.async;
                          return _this;
                      }
                      var _proto = WebLoader.prototype;
                      _proto.resolve = function resolve(from, to) {
                          throw new Error("relative templates not support in the browser yet");
                      };
                      _proto.getSource = function getSource(name, cb) {
                          var _this2 = this;
                          var useCache = this.useCache;
                          var result;
                          this.fetch(this.baseURL + "/" + name, function (err, src) {
                              if (err) {
                                  if (cb) {
                                      cb(err.content);
                                  }
                                  else if (err.status === 404) {
                                      result = null;
                                  }
                                  else {
                                      throw err.content;
                                  }
                              }
                              else {
                                  result = {
                                      src: src,
                                      path: name,
                                      noCache: !useCache,
                                  };
                                  _this2.emit("load", name, result);
                                  if (cb) {
                                      cb(null, result);
                                  }
                              }
                          }); // if this WebLoader isn't running asynchronously, the
                          // fetch above would actually run sync and we'll have a
                          // result here
                          return result;
                      };
                      _proto.fetch = function fetch(url, cb) {
                          // Only in the browser please
                          if (typeof window === "undefined") {
                              throw new Error("WebLoader can only by used in a browser");
                          }
                          var ajax = new XMLHttpRequest();
                          var loading = true;
                          ajax.onreadystatechange = function () {
                              if (ajax.readyState === 4 && loading) {
                                  loading = false;
                                  if (ajax.status === 0 || ajax.status === 200) {
                                      cb(null, ajax.responseText);
                                  }
                                  else {
                                      cb({
                                          status: ajax.status,
                                          content: ajax.responseText,
                                      });
                                  }
                              }
                          };
                          url +=
                              (url.indexOf("?") === -1 ? "?" : "&") +
                                  "s=" +
                                  new Date().getTime();
                          ajax.open("GET", url, this.async);
                          ajax.send();
                      };
                      return WebLoader;
                  })(Loader);
                  module.exports = {
                      WebLoader: WebLoader,
                      PrecompiledLoader: PrecompiledLoader,
                  };
                  /***/
              },
              /* 11 */
              /***/ function (module, exports, __webpack_require__) {
                  var lib = __webpack_require__(0);
                  var _require = __webpack_require__(7), Environment = _require.Environment, Template = _require.Template;
                  var Loader = __webpack_require__(6);
                  var loaders = __webpack_require__(10);
                  var precompile = __webpack_require__(23);
                  var compiler = __webpack_require__(5);
                  var parser = __webpack_require__(8);
                  var lexer = __webpack_require__(9);
                  var runtime = __webpack_require__(2);
                  var nodes = __webpack_require__(3);
                  var installJinjaCompat = __webpack_require__(25); // A single instance of an environment, since this is so commonly used
                  var e;
                  function configure(templatesPath, opts) {
                      opts = opts || {};
                      if (lib.isObject(templatesPath)) {
                          opts = templatesPath;
                          templatesPath = null;
                      }
                      var TemplateLoader;
                      if (loaders.FileSystemLoader) {
                          TemplateLoader = new loaders.FileSystemLoader(templatesPath, {
                              watch: opts.watch,
                              noCache: opts.noCache,
                          });
                      }
                      else if (loaders.WebLoader) {
                          TemplateLoader = new loaders.WebLoader(templatesPath, {
                              useCache: opts.web && opts.web.useCache,
                              async: opts.web && opts.web.async,
                          });
                      }
                      e = new Environment(TemplateLoader, opts);
                      if (opts && opts.express) {
                          e.express(opts.express);
                      }
                      return e;
                  }
                  module.exports = {
                      Environment: Environment,
                      Template: Template,
                      Loader: Loader,
                      FileSystemLoader: loaders.FileSystemLoader,
                      NodeResolveLoader: loaders.NodeResolveLoader,
                      PrecompiledLoader: loaders.PrecompiledLoader,
                      WebLoader: loaders.WebLoader,
                      compiler: compiler,
                      parser: parser,
                      lexer: lexer,
                      runtime: runtime,
                      lib: lib,
                      nodes: nodes,
                      installJinjaCompat: installJinjaCompat,
                      configure: configure,
                      reset: function reset() {
                          e = undefined;
                      },
                      compile: function compile(src, env, path, eagerCompile) {
                          if (!e) {
                              configure();
                          }
                          return new Template(src, env, path, eagerCompile);
                      },
                      render: function render(name, ctx, cb) {
                          if (!e) {
                              configure();
                          }
                          return e.render(name, ctx, cb);
                      },
                      renderString: function renderString(src, ctx, cb) {
                          if (!e) {
                              configure();
                          }
                          return e.renderString(src, ctx, cb);
                      },
                      precompile: precompile ? precompile.precompile : undefined,
                      precompileString: precompile
                          ? precompile.precompileString
                          : undefined,
                  };
                  /***/
              },
              /* 12 */
              /***/ function (module, exports, __webpack_require__) {
                  // rawAsap provides everything we need except exception management.
                  var rawAsap = __webpack_require__(13);
                  // RawTasks are recycled to reduce GC churn.
                  var freeTasks = [];
                  // We queue errors to ensure they are thrown in right order (FIFO).
                  // Array-as-queue is good enough here, since we are just dealing with exceptions.
                  var pendingErrors = [];
                  var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);
                  function throwFirstError() {
                      if (pendingErrors.length) {
                          throw pendingErrors.shift();
                      }
                  }
                  /**
                   * Calls a task as soon as possible after returning, in its own event, with priority
                   * over other events like animation, reflow, and repaint. An error thrown from an
                   * event will not interrupt, nor even substantially slow down the processing of
                   * other events, but will be rather postponed to a lower priority event.
                   * @param {{call}} task A callable object, typically a function that takes no
                   * arguments.
                   */
                  module.exports = asap;
                  function asap(task) {
                      var rawTask;
                      if (freeTasks.length) {
                          rawTask = freeTasks.pop();
                      }
                      else {
                          rawTask = new RawTask();
                      }
                      rawTask.task = task;
                      rawAsap(rawTask);
                  }
                  // We wrap tasks with recyclable task objects.  A task object implements
                  // `call`, just like a function.
                  function RawTask() {
                      this.task = null;
                  }
                  // The sole purpose of wrapping the task is to catch the exception and recycle
                  // the task object after its single use.
                  RawTask.prototype.call = function () {
                      try {
                          this.task.call();
                      }
                      catch (error) {
                          if (asap.onerror) {
                              // This hook exists purely for testing purposes.
                              // Its name will be periodically randomized to break any code that
                              // depends on its existence.
                              asap.onerror(error);
                          }
                          else {
                              // In a web browser, exceptions are not fatal. However, to avoid
                              // slowing down the queue of pending tasks, we rethrow the error in a
                              // lower priority turn.
                              pendingErrors.push(error);
                              requestErrorThrow();
                          }
                      }
                      finally {
                          this.task = null;
                          freeTasks[freeTasks.length] = this;
                      }
                  };
                  /***/
              },
              /* 13 */
              /***/ function (module, exports, __webpack_require__) {
                  /* WEBPACK VAR INJECTION */ (function (global) {
                      // Use the fastest means possible to execute a task in its own turn, with
                      // priority over other events including IO, animation, reflow, and redraw
                      // events in browsers.
                      //
                      // An exception thrown by a task will permanently interrupt the processing of
                      // subsequent tasks. The higher level `asap` function ensures that if an
                      // exception is thrown by a task, that the task queue will continue flushing as
                      // soon as possible, but if you use `rawAsap` directly, you are responsible to
                      // either ensure that no exceptions are thrown from your task, or to manually
                      // call `rawAsap.requestFlush` if an exception is thrown.
                      module.exports = rawAsap;
                      function rawAsap(task) {
                          if (!queue.length) {
                              requestFlush();
                          }
                          // Equivalent to push, but avoids a function call.
                          queue[queue.length] = task;
                      }
                      var queue = [];
                      // `requestFlush` is an implementation-specific method that attempts to kick
                      // off a `flush` event as quickly as possible. `flush` will attempt to exhaust
                      // the event queue before yielding to the browser's own event loop.
                      var requestFlush;
                      // The position of the next task to execute in the task queue. This is
                      // preserved between calls to `flush` so that it can be resumed if
                      // a task throws an exception.
                      var index = 0;
                      // If a task schedules additional tasks recursively, the task queue can grow
                      // unbounded. To prevent memory exhaustion, the task queue will periodically
                      // truncate already-completed tasks.
                      var capacity = 1024;
                      // The flush function processes all tasks that have been scheduled with
                      // `rawAsap` unless and until one of those tasks throws an exception.
                      // If a task throws an exception, `flush` ensures that its state will remain
                      // consistent and will resume where it left off when called again.
                      // However, `flush` does not make any arrangements to be called again if an
                      // exception is thrown.
                      function flush() {
                          while (index < queue.length) {
                              var currentIndex = index;
                              // Advance the index before calling the task. This ensures that we will
                              // begin flushing on the next task the task throws an error.
                              index = index + 1;
                              queue[currentIndex].call();
                              // Prevent leaking memory for long chains of recursive calls to `asap`.
                              // If we call `asap` within tasks scheduled by `asap`, the queue will
                              // grow, but to avoid an O(n) walk for every task we execute, we don't
                              // shift tasks off the queue after they have been executed.
                              // Instead, we periodically shift 1024 tasks off the queue.
                              if (index > capacity) {
                                  // Manually shift all values starting at the index back to the
                                  // beginning of the queue.
                                  for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                                      queue[scan] = queue[scan + index];
                                  }
                                  queue.length -= index;
                                  index = 0;
                              }
                          }
                          queue.length = 0;
                          index = 0;
                      }
                      // `requestFlush` is implemented using a strategy based on data collected from
                      // every available SauceLabs Selenium web driver worker at time of writing.
                      // https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593
                      // Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
                      // have WebKitMutationObserver but not un-prefixed MutationObserver.
                      // Must use `global` or `self` instead of `window` to work in both frames and web
                      // workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
                      /* globals self */
                      var scope = typeof global !== "undefined" ? global : self;
                      var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;
                      // MutationObservers are desirable because they have high priority and work
                      // reliably everywhere they are implemented.
                      // They are implemented in all modern browsers.
                      //
                      // - Android 4-4.3
                      // - Chrome 26-34
                      // - Firefox 14-29
                      // - Internet Explorer 11
                      // - iPad Safari 6-7.1
                      // - iPhone Safari 7-7.1
                      // - Safari 6-7
                      if (typeof BrowserMutationObserver === "function") {
                          requestFlush = makeRequestCallFromMutationObserver(flush);
                          // MessageChannels are desirable because they give direct access to the HTML
                          // task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
                          // 11-12, and in web workers in many engines.
                          // Although message channels yield to any queued rendering and IO tasks, they
                          // would be better than imposing the 4ms delay of timers.
                          // However, they do not work reliably in Internet Explorer or Safari.
                          // Internet Explorer 10 is the only browser that has setImmediate but does
                          // not have MutationObservers.
                          // Although setImmediate yields to the browser's renderer, it would be
                          // preferrable to falling back to setTimeout since it does not have
                          // the minimum 4ms penalty.
                          // Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
                          // Desktop to a lesser extent) that renders both setImmediate and
                          // MessageChannel useless for the purposes of ASAP.
                          // https://github.com/kriskowal/q/issues/396
                          // Timers are implemented universally.
                          // We fall back to timers in workers in most engines, and in foreground
                          // contexts in the following browsers.
                          // However, note that even this simple case requires nuances to operate in a
                          // broad spectrum of browsers.
                          //
                          // - Firefox 3-13
                          // - Internet Explorer 6-9
                          // - iPad Safari 4.3
                          // - Lynx 2.8.7
                      }
                      else {
                          requestFlush = makeRequestCallFromTimer(flush);
                      }
                      // `requestFlush` requests that the high priority event queue be flushed as
                      // soon as possible.
                      // This is useful to prevent an error thrown in a task from stalling the event
                      // queue if the exception handled by Node.js's
                      // `process.on("uncaughtException")` or by a domain.
                      rawAsap.requestFlush = requestFlush;
                      // To request a high priority event, we induce a mutation observer by toggling
                      // the text of a text node between "1" and "-1".
                      function makeRequestCallFromMutationObserver(callback) {
                          var toggle = 1;
                          var observer = new BrowserMutationObserver(callback);
                          var node = document.createTextNode("");
                          observer.observe(node, { characterData: true });
                          return function requestCall() {
                              toggle = -toggle;
                              node.data = toggle;
                          };
                      }
                      // The message channel technique was discovered by Malte Ubl and was the
                      // original foundation for this library.
                      // http://www.nonblocking.io/2011/06/windownexttick.html
                      // Safari 6.0.5 (at least) intermittently fails to create message ports on a
                      // page's first load. Thankfully, this version of Safari supports
                      // MutationObservers, so we don't need to fall back in that case.
                      // function makeRequestCallFromMessageChannel(callback) {
                      //     var channel = new MessageChannel();
                      //     channel.port1.onmessage = callback;
                      //     return function requestCall() {
                      //         channel.port2.postMessage(0);
                      //     };
                      // }
                      // For reasons explained above, we are also unable to use `setImmediate`
                      // under any circumstances.
                      // Even if we were, there is another bug in Internet Explorer 10.
                      // It is not sufficient to assign `setImmediate` to `requestFlush` because
                      // `setImmediate` must be called *by name* and therefore must be wrapped in a
                      // closure.
                      // Never forget.
                      // function makeRequestCallFromSetImmediate(callback) {
                      //     return function requestCall() {
                      //         setImmediate(callback);
                      //     };
                      // }
                      // Safari 6.0 has a problem where timers will get lost while the user is
                      // scrolling. This problem does not impact ASAP because Safari 6.0 supports
                      // mutation observers, so that implementation is used instead.
                      // However, if we ever elect to use timers in Safari, the prevalent work-around
                      // is to add a scroll event listener that calls for a flush.
                      // `setTimeout` does not call the passed callback if the delay is less than
                      // approximately 7 in web workers in Firefox 8 through 18, and sometimes not
                      // even then.
                      function makeRequestCallFromTimer(callback) {
                          return function requestCall() {
                              // We dispatch a timeout with a specified delay of 0 for engines that
                              // can reliably accommodate that request. This will usually be snapped
                              // to a 4 milisecond delay, but once we're flushing, there's no delay
                              // between events.
                              var timeoutHandle = setTimeout(handleTimer, 0);
                              // However, since this timer gets frequently dropped in Firefox
                              // workers, we enlist an interval handle that will try to fire
                              // an event 20 times per second until it succeeds.
                              var intervalHandle = setInterval(handleTimer, 50);
                              function handleTimer() {
                                  // Whichever timer succeeds will cancel both timers and
                                  // execute the callback.
                                  clearTimeout(timeoutHandle);
                                  clearInterval(intervalHandle);
                                  callback();
                              }
                          };
                      }
                      // This is for `asap.js` only.
                      // Its name will be periodically randomized to break any code that depends on
                      // its existence.
                      rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;
                      // ASAP was originally a nextTick shim included in Q. This was factored out
                      // into this ASAP package. It was later adapted to RSVP which made further
                      // amendments. These decisions, particularly to marginalize MessageChannel and
                      // to capture the MutationObserver implementation in a closure, were integrated
                      // back into ASAP proper.
                      // https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js
                      /* WEBPACK VAR INJECTION */
                  }.call(exports, __webpack_require__(14)));
                  /***/
              },
              /* 14 */
              /***/ function (module, exports) {
                  var g;
                  // This works in non-strict mode
                  g = (function () {
                      return this;
                  })();
                  try {
                      // This works if eval is allowed (see CSP)
                      g = g || Function("return this")() || (1, eval)("this");
                  }
                  catch (e) {
                      // This works if the window reference is available
                      if (typeof window === "object")
                          g = window;
                  }
                  // g can still be undefined, but nothing to do about it...
                  // We return undefined, instead of nothing here, so it's
                  // easier to handle this case. if(!global) { ...}
                  module.exports = g;
                  /***/
              },
              /* 15 */
              /***/ function (module, exports, __webpack_require__) {
                  var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__; // MIT license (by Elan Shanker).
                  (function (globals) {
                      var executeSync = function () {
                          var args = Array.prototype.slice.call(arguments);
                          if (typeof args[0] === "function") {
                              args[0].apply(null, args.splice(1));
                          }
                      };
                      var executeAsync = function (fn) {
                          if (typeof setImmediate === "function") {
                              setImmediate(fn);
                          }
                          else if (typeof process !== "undefined" && process.nextTick) {
                              process.nextTick(fn);
                          }
                          else {
                              setTimeout(fn, 0);
                          }
                      };
                      var makeIterator = function (tasks) {
                          var makeCallback = function (index) {
                              var fn = function () {
                                  if (tasks.length) {
                                      tasks[index].apply(null, arguments);
                                  }
                                  return fn.next();
                              };
                              fn.next = function () {
                                  return index < tasks.length - 1
                                      ? makeCallback(index + 1)
                                      : null;
                              };
                              return fn;
                          };
                          return makeCallback(0);
                      };
                      var _isArray = Array.isArray ||
                          function (maybeArray) {
                              return (Object.prototype.toString.call(maybeArray) === "[object Array]");
                          };
                      var waterfall = function (tasks, callback, forceAsync) {
                          var nextTick = forceAsync ? executeAsync : executeSync;
                          callback = callback || function () { };
                          if (!_isArray(tasks)) {
                              var err = new Error("First argument to waterfall must be an array of functions");
                              return callback(err);
                          }
                          if (!tasks.length) {
                              return callback();
                          }
                          var wrapIterator = function (iterator) {
                              return function (err) {
                                  if (err) {
                                      callback.apply(null, arguments);
                                      callback = function () { };
                                  }
                                  else {
                                      var args = Array.prototype.slice.call(arguments, 1);
                                      var next = iterator.next();
                                      if (next) {
                                          args.push(wrapIterator(next));
                                      }
                                      else {
                                          args.push(callback);
                                      }
                                      nextTick(function () {
                                          iterator.apply(null, args);
                                      });
                                  }
                              };
                          };
                          wrapIterator(makeIterator(tasks))();
                      };
                      {
                          !((__WEBPACK_AMD_DEFINE_ARRAY__ = []),
                              (__WEBPACK_AMD_DEFINE_RESULT__ = function () {
                                  return waterfall;
                              }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)),
                              __WEBPACK_AMD_DEFINE_RESULT__ !== undefined &&
                                  (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // RequireJS
                      }
                  })();
                  /***/
              },
              /* 16 */
              /***/ function (module, exports, __webpack_require__) {
                  // Copyright Joyent, Inc. and other Node contributors.
                  //
                  // Permission is hereby granted, free of charge, to any person obtaining a
                  // copy of this software and associated documentation files (the
                  // "Software"), to deal in the Software without restriction, including
                  // without limitation the rights to use, copy, modify, merge, publish,
                  // distribute, sublicense, and/or sell copies of the Software, and to permit
                  // persons to whom the Software is furnished to do so, subject to the
                  // following conditions:
                  //
                  // The above copyright notice and this permission notice shall be included
                  // in all copies or substantial portions of the Software.
                  //
                  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                  // USE OR OTHER DEALINGS IN THE SOFTWARE.
                  var R = typeof Reflect === "object" ? Reflect : null;
                  var ReflectApply = R && typeof R.apply === "function"
                      ? R.apply
                      : function ReflectApply(target, receiver, args) {
                          return Function.prototype.apply.call(target, receiver, args);
                      };
                  var ReflectOwnKeys;
                  if (R && typeof R.ownKeys === "function") {
                      ReflectOwnKeys = R.ownKeys;
                  }
                  else if (Object.getOwnPropertySymbols) {
                      ReflectOwnKeys = function ReflectOwnKeys(target) {
                          return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
                      };
                  }
                  else {
                      ReflectOwnKeys = function ReflectOwnKeys(target) {
                          return Object.getOwnPropertyNames(target);
                      };
                  }
                  function ProcessEmitWarning(warning) {
                      if (console && console.warn)
                          console.warn(warning);
                  }
                  var NumberIsNaN = Number.isNaN ||
                      function NumberIsNaN(value) {
                          return value !== value;
                      };
                  function EventEmitter() {
                      EventEmitter.init.call(this);
                  }
                  module.exports = EventEmitter;
                  module.exports.once = once;
                  // Backwards-compat with node 0.10.x
                  EventEmitter.EventEmitter = EventEmitter;
                  EventEmitter.prototype._events = undefined;
                  EventEmitter.prototype._eventsCount = 0;
                  EventEmitter.prototype._maxListeners = undefined;
                  // By default EventEmitters will print a warning if more than 10 listeners are
                  // added to it. This is a useful default which helps finding memory leaks.
                  var defaultMaxListeners = 10;
                  function checkListener(listener) {
                      if (typeof listener !== "function") {
                          throw new TypeError('The "listener" argument must be of type Function. Received type ' +
                              typeof listener);
                      }
                  }
                  Object.defineProperty(EventEmitter, "defaultMaxListeners", {
                      enumerable: true,
                      get: function () {
                          return defaultMaxListeners;
                      },
                      set: function (arg) {
                          if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
                              throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
                                  arg +
                                  ".");
                          }
                          defaultMaxListeners = arg;
                      },
                  });
                  EventEmitter.init = function () {
                      if (this._events === undefined ||
                          this._events === Object.getPrototypeOf(this)._events) {
                          this._events = Object.create(null);
                          this._eventsCount = 0;
                      }
                      this._maxListeners = this._maxListeners || undefined;
                  };
                  // Obviously not all Emitters should be limited to 10. This function allows
                  // that to be increased. Set to zero for unlimited.
                  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
                      if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
                          throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' +
                              n +
                              ".");
                      }
                      this._maxListeners = n;
                      return this;
                  };
                  function _getMaxListeners(that) {
                      if (that._maxListeners === undefined)
                          return EventEmitter.defaultMaxListeners;
                      return that._maxListeners;
                  }
                  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
                      return _getMaxListeners(this);
                  };
                  EventEmitter.prototype.emit = function emit(type) {
                      var args = [];
                      for (var i = 1; i < arguments.length; i++)
                          args.push(arguments[i]);
                      var doError = type === "error";
                      var events = this._events;
                      if (events !== undefined)
                          doError = doError && events.error === undefined;
                      else if (!doError)
                          return false;
                      // If there is no 'error' event listener then throw.
                      if (doError) {
                          var er;
                          if (args.length > 0)
                              er = args[0];
                          if (er instanceof Error) {
                              // Note: The comments on the `throw` lines are intentional, they show
                              // up in Node's output if this results in an unhandled exception.
                              throw er; // Unhandled 'error' event
                          }
                          // At least give some kind of context to the user
                          var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
                          err.context = er;
                          throw err; // Unhandled 'error' event
                      }
                      var handler = events[type];
                      if (handler === undefined)
                          return false;
                      if (typeof handler === "function") {
                          ReflectApply(handler, this, args);
                      }
                      else {
                          var len = handler.length;
                          var listeners = arrayClone(handler, len);
                          for (var i = 0; i < len; ++i)
                              ReflectApply(listeners[i], this, args);
                      }
                      return true;
                  };
                  function _addListener(target, type, listener, prepend) {
                      var m;
                      var events;
                      var existing;
                      checkListener(listener);
                      events = target._events;
                      if (events === undefined) {
                          events = target._events = Object.create(null);
                          target._eventsCount = 0;
                      }
                      else {
                          // To avoid recursion in the case that type === "newListener"! Before
                          // adding it to the listeners, first emit "newListener".
                          if (events.newListener !== undefined) {
                              target.emit("newListener", type, listener.listener ? listener.listener : listener);
                              // Re-assign `events` because a newListener handler could have caused the
                              // this._events to be assigned to a new object
                              events = target._events;
                          }
                          existing = events[type];
                      }
                      if (existing === undefined) {
                          // Optimize the case of one listener. Don't need the extra array object.
                          existing = events[type] = listener;
                          ++target._eventsCount;
                      }
                      else {
                          if (typeof existing === "function") {
                              // Adding the second element, need to change to array.
                              existing = events[type] = prepend
                                  ? [listener, existing]
                                  : [existing, listener];
                              // If we've already got an array, just append.
                          }
                          else if (prepend) {
                              existing.unshift(listener);
                          }
                          else {
                              existing.push(listener);
                          }
                          // Check for listener leak
                          m = _getMaxListeners(target);
                          if (m > 0 && existing.length > m && !existing.warned) {
                              existing.warned = true;
                              // No error code for this since it is a Warning
                              // eslint-disable-next-line no-restricted-syntax
                              var w = new Error("Possible EventEmitter memory leak detected. " +
                                  existing.length +
                                  " " +
                                  String(type) +
                                  " listeners " +
                                  "added. Use emitter.setMaxListeners() to " +
                                  "increase limit");
                              w.name = "MaxListenersExceededWarning";
                              w.emitter = target;
                              w.type = type;
                              w.count = existing.length;
                              ProcessEmitWarning(w);
                          }
                      }
                      return target;
                  }
                  EventEmitter.prototype.addListener = function addListener(type, listener) {
                      return _addListener(this, type, listener, false);
                  };
                  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
                  EventEmitter.prototype.prependListener = function prependListener(type, listener) {
                      return _addListener(this, type, listener, true);
                  };
                  function onceWrapper() {
                      if (!this.fired) {
                          this.target.removeListener(this.type, this.wrapFn);
                          this.fired = true;
                          if (arguments.length === 0)
                              return this.listener.call(this.target);
                          return this.listener.apply(this.target, arguments);
                      }
                  }
                  function _onceWrap(target, type, listener) {
                      var state = {
                          fired: false,
                          wrapFn: undefined,
                          target: target,
                          type: type,
                          listener: listener,
                      };
                      var wrapped = onceWrapper.bind(state);
                      wrapped.listener = listener;
                      state.wrapFn = wrapped;
                      return wrapped;
                  }
                  EventEmitter.prototype.once = function once(type, listener) {
                      checkListener(listener);
                      this.on(type, _onceWrap(this, type, listener));
                      return this;
                  };
                  EventEmitter.prototype.prependOnceListener =
                      function prependOnceListener(type, listener) {
                          checkListener(listener);
                          this.prependListener(type, _onceWrap(this, type, listener));
                          return this;
                      };
                  // Emits a 'removeListener' event if and only if the listener was removed.
                  EventEmitter.prototype.removeListener = function removeListener(type, listener) {
                      var list, events, position, i, originalListener;
                      checkListener(listener);
                      events = this._events;
                      if (events === undefined)
                          return this;
                      list = events[type];
                      if (list === undefined)
                          return this;
                      if (list === listener || list.listener === listener) {
                          if (--this._eventsCount === 0)
                              this._events = Object.create(null);
                          else {
                              delete events[type];
                              if (events.removeListener)
                                  this.emit("removeListener", type, list.listener || listener);
                          }
                      }
                      else if (typeof list !== "function") {
                          position = -1;
                          for (i = list.length - 1; i >= 0; i--) {
                              if (list[i] === listener || list[i].listener === listener) {
                                  originalListener = list[i].listener;
                                  position = i;
                                  break;
                              }
                          }
                          if (position < 0)
                              return this;
                          if (position === 0)
                              list.shift();
                          else {
                              spliceOne(list, position);
                          }
                          if (list.length === 1)
                              events[type] = list[0];
                          if (events.removeListener !== undefined)
                              this.emit("removeListener", type, originalListener || listener);
                      }
                      return this;
                  };
                  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
                  EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
                      var listeners, events, i;
                      events = this._events;
                      if (events === undefined)
                          return this;
                      // not listening for removeListener, no need to emit
                      if (events.removeListener === undefined) {
                          if (arguments.length === 0) {
                              this._events = Object.create(null);
                              this._eventsCount = 0;
                          }
                          else if (events[type] !== undefined) {
                              if (--this._eventsCount === 0)
                                  this._events = Object.create(null);
                              else
                                  delete events[type];
                          }
                          return this;
                      }
                      // emit removeListener for all listeners on all events
                      if (arguments.length === 0) {
                          var keys = Object.keys(events);
                          var key;
                          for (i = 0; i < keys.length; ++i) {
                              key = keys[i];
                              if (key === "removeListener")
                                  continue;
                              this.removeAllListeners(key);
                          }
                          this.removeAllListeners("removeListener");
                          this._events = Object.create(null);
                          this._eventsCount = 0;
                          return this;
                      }
                      listeners = events[type];
                      if (typeof listeners === "function") {
                          this.removeListener(type, listeners);
                      }
                      else if (listeners !== undefined) {
                          // LIFO order
                          for (i = listeners.length - 1; i >= 0; i--) {
                              this.removeListener(type, listeners[i]);
                          }
                      }
                      return this;
                  };
                  function _listeners(target, type, unwrap) {
                      var events = target._events;
                      if (events === undefined)
                          return [];
                      var evlistener = events[type];
                      if (evlistener === undefined)
                          return [];
                      if (typeof evlistener === "function")
                          return unwrap ? [evlistener.listener || evlistener] : [evlistener];
                      return unwrap
                          ? unwrapListeners(evlistener)
                          : arrayClone(evlistener, evlistener.length);
                  }
                  EventEmitter.prototype.listeners = function listeners(type) {
                      return _listeners(this, type, true);
                  };
                  EventEmitter.prototype.rawListeners = function rawListeners(type) {
                      return _listeners(this, type, false);
                  };
                  EventEmitter.listenerCount = function (emitter, type) {
                      if (typeof emitter.listenerCount === "function") {
                          return emitter.listenerCount(type);
                      }
                      else {
                          return listenerCount.call(emitter, type);
                      }
                  };
                  EventEmitter.prototype.listenerCount = listenerCount;
                  function listenerCount(type) {
                      var events = this._events;
                      if (events !== undefined) {
                          var evlistener = events[type];
                          if (typeof evlistener === "function") {
                              return 1;
                          }
                          else if (evlistener !== undefined) {
                              return evlistener.length;
                          }
                      }
                      return 0;
                  }
                  EventEmitter.prototype.eventNames = function eventNames() {
                      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
                  };
                  function arrayClone(arr, n) {
                      var copy = new Array(n);
                      for (var i = 0; i < n; ++i)
                          copy[i] = arr[i];
                      return copy;
                  }
                  function spliceOne(list, index) {
                      for (; index + 1 < list.length; index++)
                          list[index] = list[index + 1];
                      list.pop();
                  }
                  function unwrapListeners(arr) {
                      var ret = new Array(arr.length);
                      for (var i = 0; i < ret.length; ++i) {
                          ret[i] = arr[i].listener || arr[i];
                      }
                      return ret;
                  }
                  function once(emitter, name) {
                      return new Promise(function (resolve, reject) {
                          function eventListener() {
                              if (errorListener !== undefined) {
                                  emitter.removeListener("error", errorListener);
                              }
                              resolve([].slice.call(arguments));
                          }
                          var errorListener;
                          // Adding an error listener is not optional because
                          // if an error is thrown on an event emitter we cannot
                          // guarantee that the actual event we are waiting will
                          // be fired. The result could be a silent way to create
                          // memory or file descriptor leaks, which is something
                          // we should avoid.
                          if (name !== "error") {
                              errorListener = function errorListener(err) {
                                  emitter.removeListener(name, eventListener);
                                  reject(err);
                              };
                              emitter.once("error", errorListener);
                          }
                          emitter.once(name, eventListener);
                      });
                  }
                  /***/
              },
              /* 17 */
              /***/ function (module, exports, __webpack_require__) {
                  var nodes = __webpack_require__(3);
                  var lib = __webpack_require__(0);
                  var sym = 0;
                  function gensym() {
                      return "hole_" + sym++;
                  } // copy-on-write version of map
                  function mapCOW(arr, func) {
                      var res = null;
                      for (var i = 0; i < arr.length; i++) {
                          var item = func(arr[i]);
                          if (item !== arr[i]) {
                              if (!res) {
                                  res = arr.slice();
                              }
                              res[i] = item;
                          }
                      }
                      return res || arr;
                  }
                  function walk(ast, func, depthFirst) {
                      if (!(ast instanceof nodes.Node)) {
                          return ast;
                      }
                      if (!depthFirst) {
                          var astT = func(ast);
                          if (astT && astT !== ast) {
                              return astT;
                          }
                      }
                      if (ast instanceof nodes.NodeList) {
                          var children = mapCOW(ast.children, function (node) {
                              return walk(node, func, depthFirst);
                          });
                          if (children !== ast.children) {
                              ast = new nodes[ast.typename](ast.lineno, ast.colno, children);
                          }
                      }
                      else if (ast instanceof nodes.CallExtension) {
                          var args = walk(ast.args, func, depthFirst);
                          var contentArgs = mapCOW(ast.contentArgs, function (node) {
                              return walk(node, func, depthFirst);
                          });
                          if (args !== ast.args || contentArgs !== ast.contentArgs) {
                              ast = new nodes[ast.typename](ast.extName, ast.prop, args, contentArgs);
                          }
                      }
                      else {
                          var props = ast.fields.map(function (field) {
                              return ast[field];
                          });
                          var propsT = mapCOW(props, function (prop) {
                              return walk(prop, func, depthFirst);
                          });
                          if (propsT !== props) {
                              ast = new nodes[ast.typename](ast.lineno, ast.colno);
                              propsT.forEach(function (prop, i) {
                                  ast[ast.fields[i]] = prop;
                              });
                          }
                      }
                      return depthFirst ? func(ast) || ast : ast;
                  }
                  function depthWalk(ast, func) {
                      return walk(ast, func, true);
                  }
                  function _liftFilters(node, asyncFilters, prop) {
                      var children = [];
                      var walked = depthWalk(prop ? node[prop] : node, function (descNode) {
                          var symbol;
                          if (descNode instanceof nodes.Block) {
                              return descNode;
                          }
                          else if ((descNode instanceof nodes.Filter &&
                              lib.indexOf(asyncFilters, descNode.name.value) !== -1) ||
                              descNode instanceof nodes.CallExtensionAsync) {
                              symbol = new nodes.Symbol(descNode.lineno, descNode.colno, gensym());
                              children.push(new nodes.FilterAsync(descNode.lineno, descNode.colno, descNode.name, descNode.args, symbol));
                          }
                          return symbol;
                      });
                      if (prop) {
                          node[prop] = walked;
                      }
                      else {
                          node = walked;
                      }
                      if (children.length) {
                          children.push(node);
                          return new nodes.NodeList(node.lineno, node.colno, children);
                      }
                      else {
                          return node;
                      }
                  }
                  function liftFilters(ast, asyncFilters) {
                      return depthWalk(ast, function (node) {
                          if (node instanceof nodes.Output) {
                              return _liftFilters(node, asyncFilters);
                          }
                          else if (node instanceof nodes.Set) {
                              return _liftFilters(node, asyncFilters, "value");
                          }
                          else if (node instanceof nodes.For) {
                              return _liftFilters(node, asyncFilters, "arr");
                          }
                          else if (node instanceof nodes.If) {
                              return _liftFilters(node, asyncFilters, "cond");
                          }
                          else if (node instanceof nodes.CallExtension) {
                              return _liftFilters(node, asyncFilters, "args");
                          }
                          else {
                              return undefined;
                          }
                      });
                  }
                  function liftSuper(ast) {
                      return walk(ast, function (blockNode) {
                          if (!(blockNode instanceof nodes.Block)) {
                              return;
                          }
                          var hasSuper = false;
                          var symbol = gensym();
                          blockNode.body = walk(blockNode.body, function (node) {
                              // eslint-disable-line consistent-return
                              if (node instanceof nodes.FunCall &&
                                  node.name.value === "super") {
                                  hasSuper = true;
                                  return new nodes.Symbol(node.lineno, node.colno, symbol);
                              }
                          });
                          if (hasSuper) {
                              blockNode.body.children.unshift(new nodes.Super(0, 0, blockNode.name, new nodes.Symbol(0, 0, symbol)));
                          }
                      });
                  }
                  function convertStatements(ast) {
                      return depthWalk(ast, function (node) {
                          if (!(node instanceof nodes.If) && !(node instanceof nodes.For)) {
                              return undefined;
                          }
                          var async = false;
                          walk(node, function (child) {
                              if (child instanceof nodes.FilterAsync ||
                                  child instanceof nodes.IfAsync ||
                                  child instanceof nodes.AsyncEach ||
                                  child instanceof nodes.AsyncAll ||
                                  child instanceof nodes.CallExtensionAsync) {
                                  async = true; // Stop iterating by returning the node
                                  return child;
                              }
                              return undefined;
                          });
                          if (async) {
                              if (node instanceof nodes.If) {
                                  return new nodes.IfAsync(node.lineno, node.colno, node.cond, node.body, node.else_);
                              }
                              else if (node instanceof nodes.For &&
                                  !(node instanceof nodes.AsyncAll)) {
                                  return new nodes.AsyncEach(node.lineno, node.colno, node.arr, node.name, node.body, node.else_);
                              }
                          }
                          return undefined;
                      });
                  }
                  function cps(ast, asyncFilters) {
                      return convertStatements(liftSuper(liftFilters(ast, asyncFilters)));
                  }
                  function transform(ast, asyncFilters) {
                      return cps(ast, asyncFilters || []);
                  } // var parser = require('./parser');
                  // var src = 'hello {% foo %}{% endfoo %} end';
                  // var ast = transform(parser.parse(src, [new FooExtension()]), ['bar']);
                  // nodes.printNodes(ast);
                  module.exports = {
                      transform: transform,
                  };
                  /***/
              },
              /* 18 */
              /***/ function (module, exports, __webpack_require__) {
                  var lib = __webpack_require__(0);
                  var r = __webpack_require__(2);
                  var exports = (module.exports = {});
                  function normalize(value, defaultValue) {
                      if (value === null || value === undefined || value === false) {
                          return defaultValue;
                      }
                      return value;
                  }
                  exports.abs = Math.abs;
                  function isNaN(num) {
                      return num !== num; // eslint-disable-line no-self-compare
                  }
                  function batch(arr, linecount, fillWith) {
                      var i;
                      var res = [];
                      var tmp = [];
                      for (i = 0; i < arr.length; i++) {
                          if (i % linecount === 0 && tmp.length) {
                              res.push(tmp);
                              tmp = [];
                          }
                          tmp.push(arr[i]);
                      }
                      if (tmp.length) {
                          if (fillWith) {
                              for (i = tmp.length; i < linecount; i++) {
                                  tmp.push(fillWith);
                              }
                          }
                          res.push(tmp);
                      }
                      return res;
                  }
                  exports.batch = batch;
                  function capitalize(str) {
                      str = normalize(str, "");
                      var ret = str.toLowerCase();
                      return r.copySafeness(str, ret.charAt(0).toUpperCase() + ret.slice(1));
                  }
                  exports.capitalize = capitalize;
                  function center(str, width) {
                      str = normalize(str, "");
                      width = width || 80;
                      if (str.length >= width) {
                          return str;
                      }
                      var spaces = width - str.length;
                      var pre = lib.repeat(" ", spaces / 2 - (spaces % 2));
                      var post = lib.repeat(" ", spaces / 2);
                      return r.copySafeness(str, pre + str + post);
                  }
                  exports.center = center;
                  function default_(val, def, bool) {
                      if (bool) {
                          return val || def;
                      }
                      else {
                          return val !== undefined ? val : def;
                      }
                  } // TODO: it is confusing to export something called 'default'
                  exports["default"] = default_; // eslint-disable-line dot-notation
                  function dictsort(val, caseSensitive, by) {
                      if (!lib.isObject(val)) {
                          throw new lib.TemplateError("dictsort filter: val must be an object");
                      }
                      var array = []; // deliberately include properties from the object's prototype
                      for (var k in val) {
                          // eslint-disable-line guard-for-in, no-restricted-syntax
                          array.push([k, val[k]]);
                      }
                      var si;
                      if (by === undefined || by === "key") {
                          si = 0;
                      }
                      else if (by === "value") {
                          si = 1;
                      }
                      else {
                          throw new lib.TemplateError("dictsort filter: You can only sort by either key or value");
                      }
                      array.sort(function (t1, t2) {
                          var a = t1[si];
                          var b = t2[si];
                          if (!caseSensitive) {
                              if (lib.isString(a)) {
                                  a = a.toUpperCase();
                              }
                              if (lib.isString(b)) {
                                  b = b.toUpperCase();
                              }
                          }
                          return a > b ? 1 : a === b ? 0 : -1; // eslint-disable-line no-nested-ternary
                      });
                      return array;
                  }
                  exports.dictsort = dictsort;
                  function dump(obj, spaces) {
                      return JSON.stringify(obj, null, spaces);
                  }
                  exports.dump = dump;
                  function escape(str) {
                      if (str instanceof r.SafeString) {
                          return str;
                      }
                      str = str === null || str === undefined ? "" : str;
                      return r.markSafe(lib.escape(str.toString()));
                  }
                  exports.escape = escape;
                  function safe(str) {
                      if (str instanceof r.SafeString) {
                          return str;
                      }
                      str = str === null || str === undefined ? "" : str;
                      return r.markSafe(str.toString());
                  }
                  exports.safe = safe;
                  function first(arr) {
                      return arr[0];
                  }
                  exports.first = first;
                  function forceescape(str) {
                      str = str === null || str === undefined ? "" : str;
                      return r.markSafe(lib.escape(str.toString()));
                  }
                  exports.forceescape = forceescape;
                  function groupby(arr, attr) {
                      return lib.groupBy(arr, attr, this.env.opts.throwOnUndefined);
                  }
                  exports.groupby = groupby;
                  function indent(str, width, indentfirst) {
                      str = normalize(str, "");
                      if (str === "") {
                          return "";
                      }
                      width = width || 4; // let res = '';
                      var lines = str.split("\n");
                      var sp = lib.repeat(" ", width);
                      var res = lines
                          .map(function (l, i) {
                          return i === 0 && !indentfirst ? l : "" + sp + l;
                      })
                          .join("\n");
                      return r.copySafeness(str, res);
                  }
                  exports.indent = indent;
                  function join(arr, del, attr) {
                      del = del || "";
                      if (attr) {
                          arr = lib.map(arr, function (v) {
                              return v[attr];
                          });
                      }
                      return arr.join(del);
                  }
                  exports.join = join;
                  function last(arr) {
                      return arr[arr.length - 1];
                  }
                  exports.last = last;
                  function lengthFilter(val) {
                      var value = normalize(val, "");
                      if (value !== undefined) {
                          if ((typeof Map === "function" && value instanceof Map) ||
                              (typeof Set === "function" && value instanceof Set)) {
                              // ECMAScript 2015 Maps and Sets
                              return value.size;
                          }
                          if (lib.isObject(value) && !(value instanceof r.SafeString)) {
                              // Objects (besides SafeStrings), non-primative Arrays
                              return lib.keys(value).length;
                          }
                          return value.length;
                      }
                      return 0;
                  }
                  exports.length = lengthFilter;
                  function list(val) {
                      if (lib.isString(val)) {
                          return val.split("");
                      }
                      else if (lib.isObject(val)) {
                          return lib._entries(val || {}).map(function (_ref) {
                              var key = _ref[0], value = _ref[1];
                              return {
                                  key: key,
                                  value: value,
                              };
                          });
                      }
                      else if (lib.isArray(val)) {
                          return val;
                      }
                      else {
                          throw new lib.TemplateError("list filter: type not iterable");
                      }
                  }
                  exports.list = list;
                  function lower(str) {
                      str = normalize(str, "");
                      return str.toLowerCase();
                  }
                  exports.lower = lower;
                  function nl2br(str) {
                      if (str === null || str === undefined) {
                          return "";
                      }
                      return r.copySafeness(str, str.replace(/\r\n|\n/g, "<br />\n"));
                  }
                  exports.nl2br = nl2br;
                  function random(arr) {
                      return arr[Math.floor(Math.random() * arr.length)];
                  }
                  exports.random = random;
                  /**
                   * Construct select or reject filter
                   *
                   * @param {boolean} expectedTestResult
                   * @returns {function(array, string, *): array}
                   */
                  function getSelectOrReject(expectedTestResult) {
                      function filter(arr, testName, secondArg) {
                          if (testName === void 0) {
                              testName = "truthy";
                          }
                          var context = this;
                          var test = context.env.getTest(testName);
                          return lib.toArray(arr).filter(function examineTestResult(item) {
                              return test.call(context, item, secondArg) === expectedTestResult;
                          });
                      }
                      return filter;
                  }
                  exports.reject = getSelectOrReject(false);
                  function rejectattr(arr, attr) {
                      return arr.filter(function (item) {
                          return !item[attr];
                      });
                  }
                  exports.rejectattr = rejectattr;
                  exports.select = getSelectOrReject(true);
                  function selectattr(arr, attr) {
                      return arr.filter(function (item) {
                          return !!item[attr];
                      });
                  }
                  exports.selectattr = selectattr;
                  function replace(str, old, new_, maxCount) {
                      var originalStr = str;
                      if (old instanceof RegExp) {
                          return str.replace(old, new_);
                      }
                      if (typeof maxCount === "undefined") {
                          maxCount = -1;
                      }
                      var res = ""; // Output
                      // Cast Numbers in the search term to string
                      if (typeof old === "number") {
                          old = "" + old;
                      }
                      else if (typeof old !== "string") {
                          // If it is something other than number or string,
                          // return the original string
                          return str;
                      } // Cast numbers in the replacement to string
                      if (typeof str === "number") {
                          str = "" + str;
                      } // If by now, we don't have a string, throw it back
                      if (typeof str !== "string" && !(str instanceof r.SafeString)) {
                          return str;
                      } // ShortCircuits
                      if (old === "") {
                          // Mimic the python behaviour: empty string is replaced
                          // by replacement e.g. "abc"|replace("", ".") -> .a.b.c.
                          res = new_ + str.split("").join(new_) + new_;
                          return r.copySafeness(str, res);
                      }
                      var nextIndex = str.indexOf(old); // if # of replacements to perform is 0, or the string to does
                      // not contain the old value, return the string
                      if (maxCount === 0 || nextIndex === -1) {
                          return str;
                      }
                      var pos = 0;
                      var count = 0; // # of replacements made
                      while (nextIndex > -1 && (maxCount === -1 || count < maxCount)) {
                          // Grab the next chunk of src string and add it with the
                          // replacement, to the result
                          res += str.substring(pos, nextIndex) + new_; // Increment our pointer in the src string
                          pos = nextIndex + old.length;
                          count++; // See if there are any more replacements to be made
                          nextIndex = str.indexOf(old, pos);
                      } // We've either reached the end, or done the max # of
                      // replacements, tack on any remaining string
                      if (pos < str.length) {
                          res += str.substring(pos);
                      }
                      return r.copySafeness(originalStr, res);
                  }
                  exports.replace = replace;
                  function reverse(val) {
                      var arr;
                      if (lib.isString(val)) {
                          arr = list(val);
                      }
                      else {
                          // Copy it
                          arr = lib.map(val, function (v) {
                              return v;
                          });
                      }
                      arr.reverse();
                      if (lib.isString(val)) {
                          return r.copySafeness(val, arr.join(""));
                      }
                      return arr;
                  }
                  exports.reverse = reverse;
                  function round(val, precision, method) {
                      precision = precision || 0;
                      var factor = Math.pow(10, precision);
                      var rounder;
                      if (method === "ceil") {
                          rounder = Math.ceil;
                      }
                      else if (method === "floor") {
                          rounder = Math.floor;
                      }
                      else {
                          rounder = Math.round;
                      }
                      return rounder(val * factor) / factor;
                  }
                  exports.round = round;
                  function slice(arr, slices, fillWith) {
                      var sliceLength = Math.floor(arr.length / slices);
                      var extra = arr.length % slices;
                      var res = [];
                      var offset = 0;
                      for (var i = 0; i < slices; i++) {
                          var start = offset + i * sliceLength;
                          if (i < extra) {
                              offset++;
                          }
                          var end = offset + (i + 1) * sliceLength;
                          var currSlice = arr.slice(start, end);
                          if (fillWith && i >= extra) {
                              currSlice.push(fillWith);
                          }
                          res.push(currSlice);
                      }
                      return res;
                  }
                  exports.slice = slice;
                  function sum(arr, attr, start) {
                      if (start === void 0) {
                          start = 0;
                      }
                      if (attr) {
                          arr = lib.map(arr, function (v) {
                              return v[attr];
                          });
                      }
                      return (start +
                          arr.reduce(function (a, b) {
                              return a + b;
                          }, 0));
                  }
                  exports.sum = sum;
                  exports.sort = r.makeMacro(["value", "reverse", "case_sensitive", "attribute"], [], function sortFilter(arr, reversed, caseSens, attr) {
                      var _this = this;
                      // Copy it
                      var array = lib.map(arr, function (v) {
                          return v;
                      });
                      var getAttribute = lib.getAttrGetter(attr);
                      array.sort(function (a, b) {
                          var x = attr ? getAttribute(a) : a;
                          var y = attr ? getAttribute(b) : b;
                          if (_this.env.opts.throwOnUndefined &&
                              attr &&
                              (x === undefined || y === undefined)) {
                              throw new TypeError('sort: attribute "' + attr + '" resolved to undefined');
                          }
                          if (!caseSens && lib.isString(x) && lib.isString(y)) {
                              x = x.toLowerCase();
                              y = y.toLowerCase();
                          }
                          if (x < y) {
                              return reversed ? 1 : -1;
                          }
                          else if (x > y) {
                              return reversed ? -1 : 1;
                          }
                          else {
                              return 0;
                          }
                      });
                      return array;
                  });
                  function string(obj) {
                      return r.copySafeness(obj, obj);
                  }
                  exports.string = string;
                  function striptags(input, preserveLinebreaks) {
                      input = normalize(input, "");
                      var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi;
                      var trimmedInput = trim(input.replace(tags, ""));
                      var res = "";
                      if (preserveLinebreaks) {
                          res = trimmedInput
                              .replace(/^ +| +$/gm, "") // remove leading and trailing spaces
                              .replace(/ +/g, " ") // squash adjacent spaces
                              .replace(/(\r\n)/g, "\n") // normalize linebreaks (CRLF -> LF)
                              .replace(/\n\n\n+/g, "\n\n"); // squash abnormal adjacent linebreaks
                      }
                      else {
                          res = trimmedInput.replace(/\s+/gi, " ");
                      }
                      return r.copySafeness(input, res);
                  }
                  exports.striptags = striptags;
                  function title(str) {
                      str = normalize(str, "");
                      var words = str.split(" ").map(function (word) {
                          return capitalize(word);
                      });
                      return r.copySafeness(str, words.join(" "));
                  }
                  exports.title = title;
                  function trim(str) {
                      return r.copySafeness(str, str.replace(/^\s*|\s*$/g, ""));
                  }
                  exports.trim = trim;
                  function truncate(input, length, killwords, end) {
                      var orig = input;
                      input = normalize(input, "");
                      length = length || 255;
                      if (input.length <= length) {
                          return input;
                      }
                      if (killwords) {
                          input = input.substring(0, length);
                      }
                      else {
                          var idx = input.lastIndexOf(" ", length);
                          if (idx === -1) {
                              idx = length;
                          }
                          input = input.substring(0, idx);
                      }
                      input += end !== undefined && end !== null ? end : "...";
                      return r.copySafeness(orig, input);
                  }
                  exports.truncate = truncate;
                  function upper(str) {
                      str = normalize(str, "");
                      return str.toUpperCase();
                  }
                  exports.upper = upper;
                  function urlencode(obj) {
                      var enc = encodeURIComponent;
                      if (lib.isString(obj)) {
                          return enc(obj);
                      }
                      else {
                          var keyvals = lib.isArray(obj) ? obj : lib._entries(obj);
                          return keyvals
                              .map(function (_ref2) {
                              var k = _ref2[0], v = _ref2[1];
                              return enc(k) + "=" + enc(v);
                          })
                              .join("&");
                      }
                  }
                  exports.urlencode = urlencode; // For the jinja regexp, see
                  // https://github.com/mitsuhiko/jinja2/blob/f15b814dcba6aa12bc74d1f7d0c881d55f7126be/jinja2/utils.py#L20-L23
                  var puncRe = /^(?:\(|<|&lt;)?(.*?)(?:\.|,|\)|\n|&gt;)?$/; // from http://blog.gerv.net/2011/05/html5_email_address_regexp/
                  var emailRe = /^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d\-]+(\.[a-z\d\-]+)+$/i;
                  var httpHttpsRe = /^https?:\/\/.*$/;
                  var wwwRe = /^www\./;
                  var tldRe = /\.(?:org|net|com)(?:\:|\/|$)/;
                  function urlize(str, length, nofollow) {
                      if (isNaN(length)) {
                          length = Infinity;
                      }
                      var noFollowAttr = nofollow === true ? ' rel="nofollow"' : "";
                      var words = str
                          .split(/(\s+)/)
                          .filter(function (word) {
                          // If the word has no length, bail. This can happen for str with
                          // trailing whitespace.
                          return word && word.length;
                      })
                          .map(function (word) {
                          var matches = word.match(puncRe);
                          var possibleUrl = matches ? matches[1] : word;
                          var shortUrl = possibleUrl.substr(0, length); // url that starts with http or https
                          if (httpHttpsRe.test(possibleUrl)) {
                              return ('<a href="' +
                                  possibleUrl +
                                  '"' +
                                  noFollowAttr +
                                  ">" +
                                  shortUrl +
                                  "</a>");
                          } // url that starts with www.
                          if (wwwRe.test(possibleUrl)) {
                              return ('<a href="http://' +
                                  possibleUrl +
                                  '"' +
                                  noFollowAttr +
                                  ">" +
                                  shortUrl +
                                  "</a>");
                          } // an email address of the form username@domain.tld
                          if (emailRe.test(possibleUrl)) {
                              return ('<a href="mailto:' + possibleUrl + '">' + possibleUrl + "</a>");
                          } // url that ends in .com, .org or .net that is not an email address
                          if (tldRe.test(possibleUrl)) {
                              return ('<a href="http://' +
                                  possibleUrl +
                                  '"' +
                                  noFollowAttr +
                                  ">" +
                                  shortUrl +
                                  "</a>");
                          }
                          return word;
                      });
                      return words.join("");
                  }
                  exports.urlize = urlize;
                  function wordcount(str) {
                      str = normalize(str, "");
                      var words = str ? str.match(/\w+/g) : null;
                      return words ? words.length : null;
                  }
                  exports.wordcount = wordcount;
                  function float(val, def) {
                      var res = parseFloat(val);
                      return isNaN(res) ? def : res;
                  }
                  exports.float = float;
                  var intFilter = r.makeMacro(["value", "default", "base"], [], function doInt(value, defaultValue, base) {
                      if (base === void 0) {
                          base = 10;
                      }
                      var res = parseInt(value, base);
                      return isNaN(res) ? defaultValue : res;
                  });
                  exports.int = intFilter; // Aliases
                  exports.d = exports.default;
                  exports.e = exports.escape;
                  /***/
              },
              /* 19 */
              /***/ function (module, exports, __webpack_require__) {
                  function _inheritsLoose(subClass, superClass) {
                      subClass.prototype = Object.create(superClass.prototype);
                      subClass.prototype.constructor = subClass;
                      _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                      _setPrototypeOf =
                          Object.setPrototypeOf ||
                              function _setPrototypeOf(o, p) {
                                  o.__proto__ = p;
                                  return o;
                              };
                      return _setPrototypeOf(o, p);
                  }
                  var Loader = __webpack_require__(6);
                  var PrecompiledLoader = /*#__PURE__*/ (function (_Loader) {
                      _inheritsLoose(PrecompiledLoader, _Loader);
                      function PrecompiledLoader(compiledTemplates) {
                          var _this;
                          _this = _Loader.call(this) || this;
                          _this.precompiled = compiledTemplates || {};
                          return _this;
                      }
                      var _proto = PrecompiledLoader.prototype;
                      _proto.getSource = function getSource(name) {
                          if (this.precompiled[name]) {
                              return {
                                  src: {
                                      type: "code",
                                      obj: this.precompiled[name],
                                  },
                                  path: name,
                              };
                          }
                          return null;
                      };
                      return PrecompiledLoader;
                  })(Loader);
                  module.exports = {
                      PrecompiledLoader: PrecompiledLoader,
                  };
                  /***/
              },
              /* 20 */
              /***/ function (module, exports, __webpack_require__) {
                  var SafeString = __webpack_require__(2).SafeString;
                  /**
                   * Returns `true` if the object is a function, otherwise `false`.
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function callable(value) {
                      return typeof value === "function";
                  }
                  exports.callable = callable;
                  /**
                   * Returns `true` if the object is strictly not `undefined`.
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function defined(value) {
                      return value !== undefined;
                  }
                  exports.defined = defined;
                  /**
                   * Returns `true` if the operand (one) is divisble by the test's argument
                   * (two).
                   * @param { number } one
                   * @param { number } two
                   * @returns { boolean }
                   */
                  function divisibleby(one, two) {
                      return one % two === 0;
                  }
                  exports.divisibleby = divisibleby;
                  /**
                   * Returns true if the string has been escaped (i.e., is a SafeString).
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function escaped(value) {
                      return value instanceof SafeString;
                  }
                  exports.escaped = escaped;
                  /**
                   * Returns `true` if the arguments are strictly equal.
                   * @param { any } one
                   * @param { any } two
                   */
                  function equalto(one, two) {
                      return one === two;
                  }
                  exports.equalto = equalto; // Aliases
                  exports.eq = exports.equalto;
                  exports.sameas = exports.equalto;
                  /**
                   * Returns `true` if the value is evenly divisible by 2.
                   * @param { number } value
                   * @returns { boolean }
                   */
                  function even(value) {
                      return value % 2 === 0;
                  }
                  exports.even = even;
                  /**
                   * Returns `true` if the value is falsy - if I recall correctly, '', 0, false,
                   * undefined, NaN or null. I don't know if we should stick to the default JS
                   * behavior or attempt to replicate what Python believes should be falsy (i.e.,
                   * empty arrays, empty dicts, not 0...).
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function falsy(value) {
                      return !value;
                  }
                  exports.falsy = falsy;
                  /**
                   * Returns `true` if the operand (one) is greater or equal to the test's
                   * argument (two).
                   * @param { number } one
                   * @param { number } two
                   * @returns { boolean }
                   */
                  function ge(one, two) {
                      return one >= two;
                  }
                  exports.ge = ge;
                  /**
                   * Returns `true` if the operand (one) is greater than the test's argument
                   * (two).
                   * @param { number } one
                   * @param { number } two
                   * @returns { boolean }
                   */
                  function greaterthan(one, two) {
                      return one > two;
                  }
                  exports.greaterthan = greaterthan; // alias
                  exports.gt = exports.greaterthan;
                  /**
                   * Returns `true` if the operand (one) is less than or equal to the test's
                   * argument (two).
                   * @param { number } one
                   * @param { number } two
                   * @returns { boolean }
                   */
                  function le(one, two) {
                      return one <= two;
                  }
                  exports.le = le;
                  /**
                   * Returns `true` if the operand (one) is less than the test's passed argument
                   * (two).
                   * @param { number } one
                   * @param { number } two
                   * @returns { boolean }
                   */
                  function lessthan(one, two) {
                      return one < two;
                  }
                  exports.lessthan = lessthan; // alias
                  exports.lt = exports.lessthan;
                  /**
                   * Returns `true` if the string is lowercased.
                   * @param { string } value
                   * @returns { boolean }
                   */
                  function lower(value) {
                      return value.toLowerCase() === value;
                  }
                  exports.lower = lower;
                  /**
                   * Returns `true` if the operand (one) is less than or equal to the test's
                   * argument (two).
                   * @param { number } one
                   * @param { number } two
                   * @returns { boolean }
                   */
                  function ne(one, two) {
                      return one !== two;
                  }
                  exports.ne = ne;
                  /**
                   * Returns true if the value is strictly equal to `null`.
                   * @param { any }
                   * @returns { boolean }
                   */
                  function nullTest(value) {
                      return value === null;
                  }
                  exports.null = nullTest;
                  /**
                   * Returns true if value is a number.
                   * @param { any }
                   * @returns { boolean }
                   */
                  function number(value) {
                      return typeof value === "number";
                  }
                  exports.number = number;
                  /**
                   * Returns `true` if the value is *not* evenly divisible by 2.
                   * @param { number } value
                   * @returns { boolean }
                   */
                  function odd(value) {
                      return value % 2 === 1;
                  }
                  exports.odd = odd;
                  /**
                   * Returns `true` if the value is a string, `false` if not.
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function string(value) {
                      return typeof value === "string";
                  }
                  exports.string = string;
                  /**
                   * Returns `true` if the value is not in the list of things considered falsy:
                   * '', null, undefined, 0, NaN and false.
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function truthy(value) {
                      return !!value;
                  }
                  exports.truthy = truthy;
                  /**
                   * Returns `true` if the value is undefined.
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function undefinedTest(value) {
                      return value === undefined;
                  }
                  exports.undefined = undefinedTest;
                  /**
                   * Returns `true` if the string is uppercased.
                   * @param { string } value
                   * @returns { boolean }
                   */
                  function upper(value) {
                      return value.toUpperCase() === value;
                  }
                  exports.upper = upper;
                  /**
                   * If ES6 features are available, returns `true` if the value implements the
                   * `Symbol.iterator` method. If not, it's a string or Array.
                   *
                   * Could potentially cause issues if a browser exists that has Set and Map but
                   * not Symbol.
                   *
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function iterable(value) {
                      if (typeof Symbol !== "undefined") {
                          return !!value[Symbol.iterator];
                      }
                      else {
                          return Array.isArray(value) || typeof value === "string";
                      }
                  }
                  exports.iterable = iterable;
                  /**
                   * If ES6 features are available, returns `true` if the value is an object hash
                   * or an ES6 Map. Otherwise just return if it's an object hash.
                   * @param { any } value
                   * @returns { boolean }
                   */
                  function mapping(value) {
                      // only maps and object hashes
                      var bool = value !== null &&
                          value !== undefined &&
                          typeof value === "object" &&
                          !Array.isArray(value);
                      if (Set) {
                          return bool && !(value instanceof Set);
                      }
                      else {
                          return bool;
                      }
                  }
                  exports.mapping = mapping;
                  /***/
              },
              /* 21 */
              /***/ function (module, exports, __webpack_require__) {
                  function _cycler(items) {
                      var index = -1;
                      return {
                          current: null,
                          reset: function reset() {
                              index = -1;
                              this.current = null;
                          },
                          next: function next() {
                              index++;
                              if (index >= items.length) {
                                  index = 0;
                              }
                              this.current = items[index];
                              return this.current;
                          },
                      };
                  }
                  function _joiner(sep) {
                      sep = sep || ",";
                      var first = true;
                      return function () {
                          var val = first ? "" : sep;
                          first = false;
                          return val;
                      };
                  } // Making this a function instead so it returns a new object
                  // each time it's called. That way, if something like an environment
                  // uses it, they will each have their own copy.
                  function globals() {
                      return {
                          range: function range(start, stop, step) {
                              if (typeof stop === "undefined") {
                                  stop = start;
                                  start = 0;
                                  step = 1;
                              }
                              else if (!step) {
                                  step = 1;
                              }
                              var arr = [];
                              if (step > 0) {
                                  for (var i = start; i < stop; i += step) {
                                      arr.push(i);
                                  }
                              }
                              else {
                                  for (var _i = start; _i > stop; _i += step) {
                                      // eslint-disable-line for-direction
                                      arr.push(_i);
                                  }
                              }
                              return arr;
                          },
                          cycler: function cycler() {
                              return _cycler(Array.prototype.slice.call(arguments));
                          },
                          joiner: function joiner(sep) {
                              return _joiner(sep);
                          },
                      };
                  }
                  module.exports = globals;
                  /***/
              },
              /* 22 */
              /***/ function (module, exports, __webpack_require__) {
                  var path = __webpack_require__(4);
                  module.exports = function express(env, app) {
                      function NunjucksView(name, opts) {
                          this.name = name;
                          this.path = name;
                          this.defaultEngine = opts.defaultEngine;
                          this.ext = path.extname(name);
                          if (!this.ext && !this.defaultEngine) {
                              throw new Error("No default engine was specified and no extension was provided.");
                          }
                          if (!this.ext) {
                              this.name += this.ext =
                                  (this.defaultEngine[0] !== "." ? "." : "") + this.defaultEngine;
                          }
                      }
                      NunjucksView.prototype.render = function render(opts, cb) {
                          env.render(this.name, opts, cb);
                      };
                      app.set("view", NunjucksView);
                      app.set("nunjucksEnv", env);
                      return env;
                  };
                  /***/
              },
              /* 23 */
              /***/ function (module, exports, __webpack_require__) {
                  var fs = __webpack_require__(4);
                  var path = __webpack_require__(4);
                  var _require = __webpack_require__(0), _prettifyError = _require._prettifyError;
                  var compiler = __webpack_require__(5);
                  var _require2 = __webpack_require__(7), Environment = _require2.Environment;
                  var precompileGlobal = __webpack_require__(24);
                  function match(filename, patterns) {
                      if (!Array.isArray(patterns)) {
                          return false;
                      }
                      return patterns.some(function (pattern) {
                          return filename.match(pattern);
                      });
                  }
                  function precompileString(str, opts) {
                      opts = opts || {};
                      opts.isString = true;
                      var env = opts.env || new Environment([]);
                      var wrapper = opts.wrapper || precompileGlobal;
                      if (!opts.name) {
                          throw new Error('the "name" option is required when compiling a string');
                      }
                      return wrapper([_precompile(str, opts.name, env)], opts);
                  }
                  function precompile(input, opts) {
                      // The following options are available:
                      //
                      // * name: name of the template (auto-generated when compiling a directory)
                      // * isString: input is a string, not a file path
                      // * asFunction: generate a callable function
                      // * force: keep compiling on error
                      // * env: the Environment to use (gets extensions and async filters from it)
                      // * include: which file/folders to include (folders are auto-included, files are auto-excluded)
                      // * exclude: which file/folders to exclude (folders are auto-included, files are auto-excluded)
                      // * wrapper: function(templates, opts) {...}
                      //       Customize the output format to store the compiled template.
                      //       By default, templates are stored in a global variable used by the runtime.
                      //       A custom loader will be necessary to load your custom wrapper.
                      opts = opts || {};
                      var env = opts.env || new Environment([]);
                      var wrapper = opts.wrapper || precompileGlobal;
                      if (opts.isString) {
                          return precompileString(input, opts);
                      }
                      var pathStats = fs.existsSync(input) && fs.statSync(input);
                      var precompiled = [];
                      var templates = [];
                      function addTemplates(dir) {
                          fs.readdirSync(dir).forEach(function (file) {
                              var filepath = path.join(dir, file);
                              var subpath = filepath.substr(path.join(input, "/").length);
                              var stat = fs.statSync(filepath);
                              if (stat && stat.isDirectory()) {
                                  subpath += "/";
                                  if (!match(subpath, opts.exclude)) {
                                      addTemplates(filepath);
                                  }
                              }
                              else if (match(subpath, opts.include)) {
                                  templates.push(filepath);
                              }
                          });
                      }
                      if (pathStats.isFile()) {
                          precompiled.push(_precompile(fs.readFileSync(input, "utf-8"), opts.name || input, env));
                      }
                      else if (pathStats.isDirectory()) {
                          addTemplates(input);
                          for (var i = 0; i < templates.length; i++) {
                              var name = templates[i].replace(path.join(input, "/"), "");
                              try {
                                  precompiled.push(_precompile(fs.readFileSync(templates[i], "utf-8"), name, env));
                              }
                              catch (e) {
                                  if (opts.force) {
                                      // Don't stop generating the output if we're
                                      // forcing compilation.
                                      console.error(e); // eslint-disable-line no-console
                                  }
                                  else {
                                      throw e;
                                  }
                              }
                          }
                      }
                      return wrapper(precompiled, opts);
                  }
                  function _precompile(str, name, env) {
                      env = env || new Environment([]);
                      var asyncFilters = env.asyncFilters;
                      var extensions = env.extensionsList;
                      var template;
                      name = name.replace(/\\/g, "/");
                      try {
                          template = compiler.compile(str, asyncFilters, extensions, name, env.opts);
                      }
                      catch (err) {
                          throw _prettifyError(name, false, err);
                      }
                      return {
                          name: name,
                          template: template,
                      };
                  }
                  module.exports = {
                      precompile: precompile,
                      precompileString: precompileString,
                  };
                  /***/
              },
              /* 24 */
              /***/ function (module, exports, __webpack_require__) {
                  function precompileGlobal(templates, opts) {
                      var out = "";
                      opts = opts || {};
                      for (var i = 0; i < templates.length; i++) {
                          var name = JSON.stringify(templates[i].name);
                          var template = templates[i].template;
                          out +=
                              "(function() {" +
                                  "(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})" +
                                  "[" +
                                  name +
                                  "] = (function() {\n" +
                                  template +
                                  "\n})();\n";
                          if (opts.asFunction) {
                              out +=
                                  "return function(ctx, cb) { return nunjucks.render(" +
                                      name +
                                      ", ctx, cb); }\n";
                          }
                          out += "})();\n";
                      }
                      return out;
                  }
                  module.exports = precompileGlobal;
                  /***/
              },
              /* 25 */
              /***/ function (module, exports, __webpack_require__) {
                  function installCompat() {
                      /* eslint-disable camelcase */
                      // This must be called like `nunjucks.installCompat` so that `this`
                      // references the nunjucks instance
                      var runtime = this.runtime;
                      var lib = this.lib; // Handle slim case where these 'modules' are excluded from the built source
                      var Compiler = this.compiler.Compiler;
                      var Parser = this.parser.Parser;
                      var nodes = this.nodes;
                      var lexer = this.lexer;
                      var orig_contextOrFrameLookup = runtime.contextOrFrameLookup;
                      var orig_memberLookup = runtime.memberLookup;
                      var orig_Compiler_assertType;
                      var orig_Parser_parseAggregate;
                      if (Compiler) {
                          orig_Compiler_assertType = Compiler.prototype.assertType;
                      }
                      if (Parser) {
                          orig_Parser_parseAggregate = Parser.prototype.parseAggregate;
                      }
                      function uninstall() {
                          runtime.contextOrFrameLookup = orig_contextOrFrameLookup;
                          runtime.memberLookup = orig_memberLookup;
                          if (Compiler) {
                              Compiler.prototype.assertType = orig_Compiler_assertType;
                          }
                          if (Parser) {
                              Parser.prototype.parseAggregate = orig_Parser_parseAggregate;
                          }
                      }
                      runtime.contextOrFrameLookup = function contextOrFrameLookup(context, frame, key) {
                          var val = orig_contextOrFrameLookup.apply(this, arguments);
                          if (val !== undefined) {
                              return val;
                          }
                          switch (key) {
                              case "True":
                                  return true;
                              case "False":
                                  return false;
                              case "None":
                                  return null;
                              default:
                                  return undefined;
                          }
                      };
                      function getTokensState(tokens) {
                          return {
                              index: tokens.index,
                              lineno: tokens.lineno,
                              colno: tokens.colno,
                          };
                      }
                      if (nodes && Compiler && Parser) {
                          // i.e., not slim mode
                          var Slice = nodes.Node.extend("Slice", {
                              fields: ["start", "stop", "step"],
                              init: function init(lineno, colno, start, stop, step) {
                                  start = start || new nodes.Literal(lineno, colno, null);
                                  stop = stop || new nodes.Literal(lineno, colno, null);
                                  step = step || new nodes.Literal(lineno, colno, 1);
                                  this.parent(lineno, colno, start, stop, step);
                              },
                          });
                          Compiler.prototype.assertType = function assertType(node) {
                              if (node instanceof Slice) {
                                  return;
                              }
                              orig_Compiler_assertType.apply(this, arguments);
                          };
                          Compiler.prototype.compileSlice = function compileSlice(node, frame) {
                              this._emit("(");
                              this._compileExpression(node.start, frame);
                              this._emit("),(");
                              this._compileExpression(node.stop, frame);
                              this._emit("),(");
                              this._compileExpression(node.step, frame);
                              this._emit(")");
                          };
                          Parser.prototype.parseAggregate = function parseAggregate() {
                              var _this = this;
                              var origState = getTokensState(this.tokens); // Set back one accounting for opening bracket/parens
                              origState.colno--;
                              origState.index--;
                              try {
                                  return orig_Parser_parseAggregate.apply(this);
                              }
                              catch (e) {
                                  var errState = getTokensState(this.tokens);
                                  var rethrow = function rethrow() {
                                      lib._assign(_this.tokens, errState);
                                      return e;
                                  }; // Reset to state before original parseAggregate called
                                  lib._assign(this.tokens, origState);
                                  this.peeked = false;
                                  var tok = this.peekToken();
                                  if (tok.type !== lexer.TOKEN_LEFT_BRACKET) {
                                      throw rethrow();
                                  }
                                  else {
                                      this.nextToken();
                                  }
                                  var node = new Slice(tok.lineno, tok.colno); // If we don't encounter a colon while parsing, this is not a slice,
                                  // so re-raise the original exception.
                                  var isSlice = false;
                                  for (var i = 0; i <= node.fields.length; i++) {
                                      if (this.skip(lexer.TOKEN_RIGHT_BRACKET)) {
                                          break;
                                      }
                                      if (i === node.fields.length) {
                                          if (isSlice) {
                                              this.fail("parseSlice: too many slice components", tok.lineno, tok.colno);
                                          }
                                          else {
                                              break;
                                          }
                                      }
                                      if (this.skip(lexer.TOKEN_COLON)) {
                                          isSlice = true;
                                      }
                                      else {
                                          var field = node.fields[i];
                                          node[field] = this.parseExpression();
                                          isSlice = this.skip(lexer.TOKEN_COLON) || isSlice;
                                      }
                                  }
                                  if (!isSlice) {
                                      throw rethrow();
                                  }
                                  return new nodes.Array(tok.lineno, tok.colno, [node]);
                              }
                          };
                      }
                      function sliceLookup(obj, start, stop, step) {
                          obj = obj || [];
                          if (start === null) {
                              start = step < 0 ? obj.length - 1 : 0;
                          }
                          if (stop === null) {
                              stop = step < 0 ? -1 : obj.length;
                          }
                          else if (stop < 0) {
                              stop += obj.length;
                          }
                          if (start < 0) {
                              start += obj.length;
                          }
                          var results = [];
                          for (var i = start;; i += step) {
                              if (i < 0 || i > obj.length) {
                                  break;
                              }
                              if (step > 0 && i >= stop) {
                                  break;
                              }
                              if (step < 0 && i <= stop) {
                                  break;
                              }
                              results.push(runtime.memberLookup(obj, i));
                          }
                          return results;
                      }
                      function hasOwnProp(obj, key) {
                          return Object.prototype.hasOwnProperty.call(obj, key);
                      }
                      var ARRAY_MEMBERS = {
                          pop: function pop(index) {
                              if (index === undefined) {
                                  return this.pop();
                              }
                              if (index >= this.length || index < 0) {
                                  throw new Error("KeyError");
                              }
                              return this.splice(index, 1);
                          },
                          append: function append(element) {
                              return this.push(element);
                          },
                          remove: function remove(element) {
                              for (var i = 0; i < this.length; i++) {
                                  if (this[i] === element) {
                                      return this.splice(i, 1);
                                  }
                              }
                              throw new Error("ValueError");
                          },
                          count: function count(element) {
                              var count = 0;
                              for (var i = 0; i < this.length; i++) {
                                  if (this[i] === element) {
                                      count++;
                                  }
                              }
                              return count;
                          },
                          index: function index(element) {
                              var i;
                              if ((i = this.indexOf(element)) === -1) {
                                  throw new Error("ValueError");
                              }
                              return i;
                          },
                          find: function find(element) {
                              return this.indexOf(element);
                          },
                          insert: function insert(index, elem) {
                              return this.splice(index, 0, elem);
                          },
                      };
                      var OBJECT_MEMBERS = {
                          items: function items() {
                              return lib._entries(this);
                          },
                          values: function values() {
                              return lib._values(this);
                          },
                          keys: function keys() {
                              return lib.keys(this);
                          },
                          get: function get(key, def) {
                              var output = this[key];
                              if (output === undefined) {
                                  output = def;
                              }
                              return output;
                          },
                          has_key: function has_key(key) {
                              return hasOwnProp(this, key);
                          },
                          pop: function pop(key, def) {
                              var output = this[key];
                              if (output === undefined && def !== undefined) {
                                  output = def;
                              }
                              else if (output === undefined) {
                                  throw new Error("KeyError");
                              }
                              else {
                                  delete this[key];
                              }
                              return output;
                          },
                          popitem: function popitem() {
                              var keys = lib.keys(this);
                              if (!keys.length) {
                                  throw new Error("KeyError");
                              }
                              var k = keys[0];
                              var val = this[k];
                              delete this[k];
                              return [k, val];
                          },
                          setdefault: function setdefault(key, def) {
                              if (def === void 0) {
                                  def = null;
                              }
                              if (!(key in this)) {
                                  this[key] = def;
                              }
                              return this[key];
                          },
                          update: function update(kwargs) {
                              lib._assign(this, kwargs);
                              return null; // Always returns None
                          },
                      };
                      OBJECT_MEMBERS.iteritems = OBJECT_MEMBERS.items;
                      OBJECT_MEMBERS.itervalues = OBJECT_MEMBERS.values;
                      OBJECT_MEMBERS.iterkeys = OBJECT_MEMBERS.keys;
                      runtime.memberLookup = function memberLookup(obj, val, autoescape) {
                          if (arguments.length === 4) {
                              return sliceLookup.apply(this, arguments);
                          }
                          obj = obj || {}; // If the object is an object, return any of the methods that Python would
                          // otherwise provide.
                          if (lib.isArray(obj) && hasOwnProp(ARRAY_MEMBERS, val)) {
                              return ARRAY_MEMBERS[val].bind(obj);
                          }
                          if (lib.isObject(obj) && hasOwnProp(OBJECT_MEMBERS, val)) {
                              return OBJECT_MEMBERS[val].bind(obj);
                          }
                          return orig_memberLookup.apply(this, arguments);
                      };
                      return uninstall;
                  }
                  module.exports = installCompat;
                  /***/
              },
              /******/
          ]);
      });
      
  }(nunjucks));

  nunjucks.exports.configure({ autoescape: true });
  function checkLiquid(moduleId, websiteId, template, data) {
      try {
          var engine = new Liquid();
          return engine.parseAndRenderSync(template, data);
      }
      catch (error) {
          throw error;
          // eslint-disable-next-line no-console
         // console.log("Failed rendering template with LIQUID: " + error + " on template " + template + ", moduleId=" + moduleId + ", websiteId=" + websiteId);
      }
  }
  function checkNunjucks(template, data) {
      try {
          return nunjucks.exports.renderString(template, data);
      }
      catch (error) {
          throw error;
          // eslint-disable-next-line no-console
          console.log("Failed rendering template with NUNjucks: " + error);
      }
  }
  window.checkLiquid = checkLiquid;
  window.checkNunjucks = checkNunjucks;
})();