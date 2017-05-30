"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
	'use strict';

	//**************************************************************************************
	/**
  * Get value for input parameters, or set a default value
  * @param {Object} parameters
  * @param {string} name
  * @param defaultValue
  */

	function getParametersValue(parameters, name, defaultValue) {
		if (parameters instanceof Object === false) return defaultValue;

		if (name in parameters) return parameters[name];

		return defaultValue;
	}
	//**************************************************************************************
	/**
  * Converts "ArrayBuffer" into a hexdecimal string
  * @param {ArrayBuffer} inputBuffer
  * @param {number} [inputOffset=0]
  * @param {number} [inputLength=inputBuffer.byteLength]
  * @returns {string}
  */
	function bufferToHexCodes(inputBuffer) {
		var inputOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
		var inputLength = arguments.length <= 2 || arguments[2] === undefined ? inputBuffer.byteLength : arguments[2];

		var result = "";

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = new Uint8Array(inputBuffer, inputOffset, inputLength)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				var str = item.toString(16).toUpperCase();
				result = result + (str.length === 1 ? "0" : "") + str;
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return result;
	}
	//**************************************************************************************
	/**
  * Check input "ArrayBuffer" for common functions
  * @param {LocalBaseBlock} baseBlock
  * @param {ArrayBuffer} inputBuffer
  * @param {number} inputOffset
  * @param {number} inputLength
  * @returns {boolean}
  */
	function checkBufferParams(baseBlock, inputBuffer, inputOffset, inputLength) {
		if (inputBuffer instanceof ArrayBuffer === false) {
			baseBlock.error = "Wrong parameter: inputBuffer must be \"ArrayBuffer\"";
			return false;
		}

		if (inputBuffer.byteLength === 0) {
			baseBlock.error = "Wrong parameter: inputBuffer has zero length";
			return false;
		}

		if (inputOffset < 0) {
			baseBlock.error = "Wrong parameter: inputOffset less than zero";
			return false;
		}

		if (inputLength < 0) {
			baseBlock.error = "Wrong parameter: inputLength less than zero";
			return false;
		}

		if (inputBuffer.byteLength - inputOffset - inputLength < 0) {
			baseBlock.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
			return false;
		}

		return true;
	}
	//**************************************************************************************
	/**
  * Convert number from 2^base to 2^10
  * @param {Uint8Array} inputBuffer
  * @param {number} inputBase
  * @returns {number}
  */
	function utilFromBase(inputBuffer, inputBase) {
		var result = 0;

		for (var i = inputBuffer.length - 1; i >= 0; i--) {
			result += inputBuffer[inputBuffer.length - 1 - i] * Math.pow(2, inputBase * i);
		}return result;
	}
	//**************************************************************************************
	/**
  * Convert number from 2^10 to 2^base
  * @param {!number} value The number to convert
  * @param {!number} base The base for 2^base
  * @param {number} [reserved=0] Pre-defined number of bytes in output array (-1 = limited by function itself)
  * @returns {ArrayBuffer}
  */
	function utilToBase(value, base) {
		var reserved = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

		var internalReserved = reserved || -1;
		var internalValue = value;

		var result = 0;
		var biggest = Math.pow(2, base);

		for (var i = 1; i < 8; i++) {
			if (value < biggest) {
				var retBuf = void 0;

				if (internalReserved < 0) {
					retBuf = new ArrayBuffer(i);
					result = i;
				} else {
					if (internalReserved < i) return new ArrayBuffer(0);

					retBuf = new ArrayBuffer(internalReserved);

					result = internalReserved;
				}

				var retView = new Uint8Array(retBuf);

				for (var j = i - 1; j >= 0; j--) {
					var basis = Math.pow(2, j * base);

					retView[result - j - 1] = Math.floor(internalValue / basis);
					internalValue -= retView[result - j - 1] * basis;
				}

				return retBuf;
			}

			biggest *= Math.pow(2, base);
		}

		return new ArrayBuffer(0);
	}
	//**************************************************************************************
	/**
  * Concatenate two ArrayBuffers
  * @param {...ArrayBuffer} buffers First ArrayBuffer (first part of concatenated array)
  */
	function utilConcatBuf() {
		//region Initial variables
		var outputLength = 0;
		var prevLength = 0;
		//endregion

		//region Calculate output length

		for (var _len = arguments.length, buffers = Array(_len), _key = 0; _key < _len; _key++) {
			buffers[_key] = arguments[_key];
		}

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = buffers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var buffer = _step2.value;

				outputLength += buffer.byteLength;
			} //endregion
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		var retBuf = new ArrayBuffer(outputLength);
		var retView = new Uint8Array(retBuf);

		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = buffers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _buffer = _step3.value;

				retView.set(new Uint8Array(_buffer), prevLength);
				prevLength += _buffer.byteLength;
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		return retBuf;
	}
	//**************************************************************************************
	/**
  * Decoding of "two complement" values
  * The function must be called in scope of instance of "hexBlock" class ("valueHex" and "warnings" properties must be present)
  * @returns {number}
  */
	function utilDecodeTC() {
		var buf = new Uint8Array(this.valueHex);

		if (this.valueHex.byteLength >= 2) {
			//noinspection JSBitwiseOperatorUsage
			var condition1 = buf[0] === 0xFF && buf[1] & 0x80;
			var condition2 = buf[0] === 0x00 && (buf[1] & 0x80) === 0x00;

			if (condition1 || condition2) this.warnings.push("Needlessly long format");
		}

		//region Create big part of the integer
		var bigIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
		var bigIntView = new Uint8Array(bigIntBuffer);
		for (var i = 0; i < this.valueHex.byteLength; i++) {
			bigIntView[i] = 0;
		}bigIntView[0] = buf[0] & 0x80; // mask only the biggest bit

		var bigInt = utilFromBase(bigIntView, 8);
		//endregion

		//region Create small part of the integer
		var smallIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
		var smallIntView = new Uint8Array(smallIntBuffer);
		for (var j = 0; j < this.valueHex.byteLength; j++) {
			smallIntView[j] = buf[j];
		}smallIntView[0] &= 0x7F; // mask biggest bit

		var smallInt = utilFromBase(smallIntView, 8);
		//endregion

		return smallInt - bigInt;
	}
	//**************************************************************************************
	/**
  * Encode integer value to "two complement" format
  * @param {number} value Value to encode
  * @returns {ArrayBuffer}
  */
	function utilEncodeTC(value) {
		var modValue = value < 0 ? value * -1 : value;
		var bigInt = 128;

		for (var i = 1; i < 8; i++) {
			if (modValue <= bigInt) {
				if (value < 0) {
					var smallInt = bigInt - modValue;

					var _retBuf = utilToBase(smallInt, 8, i);
					var _retView = new Uint8Array(_retBuf);

					_retView[0] |= 0x80;

					return _retBuf;
				}

				var retBuf = utilToBase(modValue, 8, i);
				var retView = new Uint8Array(retBuf);

				//noinspection JSBitwiseOperatorUsage
				if (retView[0] & 0x80) {
					//noinspection JSCheckFunctionSignatures
					var tempBuf = retBuf.slice(0);
					var tempView = new Uint8Array(tempBuf);

					retBuf = new ArrayBuffer(retBuf.byteLength + 1);
					retView = new Uint8Array(retBuf);

					for (var k = 0; k < tempBuf.byteLength; k++) {
						retView[k + 1] = tempView[k];
					}retView[0] = 0x00;
				}

				return retBuf;
			}

			bigInt *= Math.pow(2, 8);
		}

		return new ArrayBuffer(0);
	}
	//**************************************************************************************
	/**
  * Compare two array buffers
  * @param {!ArrayBuffer} inputBuffer1
  * @param {!ArrayBuffer} inputBuffer2
  * @returns {boolean}
  */
	function isEqualBuffer(inputBuffer1, inputBuffer2) {
		if (inputBuffer1.byteLength !== inputBuffer2.byteLength) return false;

		var view1 = new Uint8Array(inputBuffer1);
		var view2 = new Uint8Array(inputBuffer2);

		for (var i = 0; i < view1.length; i++) {
			if (view1[i] !== view2[i]) return false;
		}

		return true;
	}
	//**************************************************************************************
	/**
  * Pad input number with leade "0" if needed
  * @returns {string}
  * @param {number} inputNumber
  * @param {number} fullLength
  */
	function padNumber(inputNumber, fullLength) {
		var str = inputNumber.toString(10);
		var dif = fullLength - str.length;

		var padding = new Array(dif);
		for (var i = 0; i < dif; i++) {
			padding[i] = "0";
		}var paddingString = padding.join("");

		return paddingString.concat(str);
	}
	//**************************************************************************************
	var base64Template = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var base64UrlTemplate = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
	//**************************************************************************************
	/**
  * Encode string into BASE64 (or "base64url")
  * @param {string} input
  * @param {boolean} useUrlTemplate If "true" then output would be encoded using "base64url"
  * @param {boolean} skipPadding Skip BASE-64 padding or not
  * @param {boolean} skipLeadingZeros Skip leading zeros in input data or not
  * @returns {string}
  */
	function toBase64(input) {
		var useUrlTemplate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
		var skipPadding = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
		var skipLeadingZeros = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

		var i = 0;

		var flag1 = 0;
		var flag2 = 0;

		var output = "";

		var template = useUrlTemplate ? base64UrlTemplate : base64Template;

		if (skipLeadingZeros) {
			var nonZeroPosition = 0;

			for (var _i = 0; _i < input.length; _i++) {
				if (input.charCodeAt(_i) !== 0) {
					nonZeroPosition = _i;
					break;
				}
			}

			input = input.slice(nonZeroPosition);
		}

		while (i < input.length) {
			var chr1 = input.charCodeAt(i++);
			if (i >= input.length) flag1 = 1;
			var chr2 = input.charCodeAt(i++);
			if (i >= input.length) flag2 = 1;
			var chr3 = input.charCodeAt(i++);

			var enc1 = chr1 >> 2;
			var enc2 = (chr1 & 0x03) << 4 | chr2 >> 4;
			var enc3 = (chr2 & 0x0F) << 2 | chr3 >> 6;
			var enc4 = chr3 & 0x3F;

			if (flag1 === 1) enc3 = enc4 = 64;else {
				if (flag2 === 1) enc4 = 64;
			}

			if (skipPadding) {
				if (enc3 === 64) output += "" + template.charAt(enc1) + template.charAt(enc2);else {
					if (enc4 === 64) output += "" + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3);else output += "" + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3) + template.charAt(enc4);
				}
			} else output += "" + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3) + template.charAt(enc4);
		}

		return output;
	}
	//**************************************************************************************
	/**
  * Decode string from BASE64 (or "base64url")
  * @param {string} input
  * @param {boolean} [useUrlTemplate=false] If "true" then output would be encoded using "base64url"
  * @param {boolean} [cutTailZeros=false] If "true" then cut tailing zeroz from function result
  * @returns {string}
  */
	function fromBase64(input) {
		var useUrlTemplate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
		var cutTailZeros = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

		var template = useUrlTemplate ? base64UrlTemplate : base64Template;

		//region Aux functions
		function indexof(toSearch) {
			for (var _i2 = 0; _i2 < 64; _i2++) {
				if (template.charAt(_i2) === toSearch) return _i2;
			}

			return 64;
		}

		function test(incoming) {
			return incoming === 64 ? 0x00 : incoming;
		}
		//endregion

		var i = 0;

		var output = "";

		while (i < input.length) {
			var enc1 = indexof(input.charAt(i++));
			var enc2 = i >= input.length ? 0x00 : indexof(input.charAt(i++));
			var enc3 = i >= input.length ? 0x00 : indexof(input.charAt(i++));
			var enc4 = i >= input.length ? 0x00 : indexof(input.charAt(i++));

			var chr1 = test(enc1) << 2 | test(enc2) >> 4;
			var chr2 = (test(enc2) & 0x0F) << 4 | test(enc3) >> 2;
			var chr3 = (test(enc3) & 0x03) << 6 | test(enc4);

			output += String.fromCharCode(chr1);

			if (enc3 !== 64) output += String.fromCharCode(chr2);

			if (enc4 !== 64) output += String.fromCharCode(chr3);
		}

		if (cutTailZeros) {
			var outputLength = output.length;
			var nonZeroStart = -1;

			for (var _i3 = outputLength - 1; _i3 >= 0; _i3--) {
				if (output.charCodeAt(_i3) !== 0) {
					nonZeroStart = _i3;
					break;
				}
			}

			if (nonZeroStart !== -1) output = output.slice(0, nonZeroStart + 1);
		}

		return output;
	}
	//**************************************************************************************
	function arrayBufferToString(buffer) {
		var resultString = "";
		var view = new Uint8Array(buffer);

		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = view[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var element = _step4.value;

				resultString = resultString + String.fromCharCode(element);
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}

		return resultString;
	}
	//**************************************************************************************
	function stringToArrayBuffer(str) {
		var stringLength = str.length;

		var resultBuffer = new ArrayBuffer(stringLength);
		var resultView = new Uint8Array(resultBuffer);

		for (var i = 0; i < stringLength; i++) {
			resultView[i] = str.charCodeAt(i);
		}return resultBuffer;
	}
	//**************************************************************************************
	//region GeneratorDriver's related functions
	//**************************************************************************************
	var isGenerator = function isGenerator(generator) {
		if (typeof generator === "undefined") return false;

		return typeof generator.next === "function" && typeof generator.throw === "function";
	};
	//**************************************************************************************
	var isGeneratorFunction = function isGeneratorFunction(generator) {
		if (typeof generator === "undefined") return false;

		var constructor = generator.constructor;

		if (!constructor) return false;

		if (constructor.name === "GeneratorFunction" || constructor.displayName === "GeneratorFunction") return true;

		return isGenerator(generator);
	};
	//**************************************************************************************
	/**
  * Simple "generator's driver" inspired by "https://github.com/tj/co".
  * @param {Generator|GeneratorFunction} generatorInstance
  * @returns {Promise}
  */
	function generatorsDriver(generatorInstance) {
		//region Check that we do have instance of "Generator" as input
		if (!isGenerator(generatorInstance)) {
			if (isGeneratorFunction(generatorInstance)) generatorInstance = generatorInstance();else throw new Error("Only generator instance of generator function is a valid input");
		}
		//endregion

		return new Promise(function (resolve, reject) {
			/**
    * Driver function called on "reject" status in Promises
    * @param {*} error
    * @returns {*}
    */
			var onReject = function onReject(error) {
				var result = void 0;

				try {
					result = generatorInstance.throw(error);
				} catch (ex) {
					return reject(ex);
				}

				return callback(result);
			};

			/**
    * Main driver function
    * @param {*} [result]
    * @returns {*}
    */
			var callback = function callback(result) {
				/**
     * @type Object
     * @property {boolean} done
     * @property {*} value
     */
				var generatorResult = void 0;

				try {
					generatorResult = generatorInstance.next(result);
				} catch (ex) {
					return reject(ex);
				}

				switch (true) {
					case generatorResult.value instanceof Promise:
						return generatorResult.done ? resolve(generatorResult.value) : generatorResult.value.then(callback, onReject);
					case isGeneratorFunction(generatorResult.value):
					case isGenerator(generatorResult.value):
						return generatorResult.done ? generatorsDriver(generatorResult.value).then(function (driverResult) {
							resolve(driverResult);
						}, onReject) : generatorsDriver(generatorResult.value).then(callback, onReject);
					case typeof generatorResult.value === "function":
						generatorResult.value = generatorResult.value();
					default:
						return generatorResult.done ? resolve(generatorResult.value) : callback(generatorResult.value);
				}
			};

			callback();
		});
	}
	//**************************************************************************************
	//endregion
	//**************************************************************************************

	//**************************************************************************************
	//region Declaration for "LocalBaseBlock" class
	//**************************************************************************************
	/**
  * Class used as a base block for all remaining ASN.1 classes
  * @typedef LocalBaseBlock
  * @interface
  * @property {number} blockLength
  * @property {string} error
  * @property {Array.<string>} warnings
  * @property {ArrayBuffer} valueBeforeDecode
  */

	var LocalBaseBlock = function () {
		//**********************************************************************************
		/**
   * Constructor for "LocalBaseBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueBeforeDecode]
   */
		function LocalBaseBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalBaseBlock);

			/**
    * @type {number} blockLength
    */
			this.blockLength = getParametersValue(parameters, "blockLength", 0);
			/**
    * @type {string} error
    */
			this.error = getParametersValue(parameters, "error", "");
			/**
    * @type {Array.<string>} warnings
    */
			this.warnings = getParametersValue(parameters, "warnings", []);
			//noinspection JSCheckFunctionSignatures
			/**
    * @type {ArrayBuffer} valueBeforeDecode
    */
			if ("valueBeforeDecode" in parameters) this.valueBeforeDecode = parameters.valueBeforeDecode.slice(0);else this.valueBeforeDecode = new ArrayBuffer(0);
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalBaseBlock, [{
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				return {
					blockName: this.constructor.blockName(),
					blockLength: this.blockLength,
					error: this.error,
					warnings: this.warnings,
					valueBeforeDecode: bufferToHexCodes(this.valueBeforeDecode, 0, this.valueBeforeDecode.byteLength)
				};
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "baseBlock";
			}
		}]);

		return LocalBaseBlock;
	}();
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Description for "LocalHexBlock" class
	//**************************************************************************************
	/**
  * Class used as a base block for all remaining ASN.1 classes
  * @extends LocalBaseBlock
  * @typedef LocalHexBlock
  * @property {number} blockLength
  * @property {string} error
  * @property {Array.<string>} warnings
  * @property {ArrayBuffer} valueBeforeDecode
  * @property {boolean} isHexOnly
  * @property {ArrayBuffer} valueHex
  */
	//noinspection JSUnusedLocalSymbols


	var LocalHexBlock = function LocalHexBlock(BaseClass) {
		return function (_BaseClass) {
			_inherits(LocalHexBlockMixin, _BaseClass);

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Constructor for "LocalHexBlock" class
    * @param {Object} [parameters={}]
    * @property {ArrayBuffer} [valueHex]
    */
			function LocalHexBlockMixin() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				_classCallCheck(this, LocalHexBlockMixin);

				/**
     * @type {boolean}
     */
				var _this2 = _possibleConstructorReturn(this, (LocalHexBlockMixin.__proto__ || Object.getPrototypeOf(LocalHexBlockMixin)).call(this, parameters));

				_this2.isHexOnly = getParametersValue(parameters, "isHexOnly", false);
				/**
     * @type {ArrayBuffer}
     */
				if ("valueHex" in parameters) _this2.valueHex = parameters.valueHex.slice(0);else _this2.valueHex = new ArrayBuffer(0);
				return _this2;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */


			_createClass(LocalHexBlockMixin, [{
				key: "fromBER",

				//**********************************************************************************
				/**
     * Base function for converting block from BER encoded array of bytes
     * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
     * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
     * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
     * @returns {number} Offset after least decoded byte
     */
				value: function fromBER(inputBuffer, inputOffset, inputLength) {
					//region Basic check for parameters
					//noinspection JSCheckFunctionSignatures
					if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
					//endregion

					//region Getting Uint8Array from ArrayBuffer
					var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
					//endregion

					//region Initial checks
					if (intBuffer.length === 0) {
						this.warnings.push("Zero buffer length");
						return inputOffset;
					}
					//endregion

					//region Copy input buffer to internal buffer
					this.valueHex = inputBuffer.slice(inputOffset, inputOffset + inputLength);
					//endregion

					this.blockLength = inputLength;

					return inputOffset + inputLength;
				}
				//**********************************************************************************
				/**
     * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
     * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
     * @returns {ArrayBuffer}
     */

			}, {
				key: "toBER",
				value: function toBER() {
					var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

					if (this.isHexOnly !== true) {
						this.error = "Flag \"isHexOnly\" is not set, abort";
						return new ArrayBuffer(0);
					}

					if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);

					//noinspection JSCheckFunctionSignatures
					return this.valueHex.slice(0);
				}
				//**********************************************************************************
				/**
     * Convertion for the block to JSON object
     * @returns {Object}
     */

			}, {
				key: "toJSON",
				value: function toJSON() {
					var object = {};

					//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
					try {
						object = _get(LocalHexBlockMixin.prototype.__proto__ || Object.getPrototypeOf(LocalHexBlockMixin.prototype), "toJSON", this).call(this);
					} catch (ex) {}
					//endregion

					object.blockName = this.constructor.blockName();
					object.isHexOnly = this.isHexOnly;
					object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

					return object;
				}
				//**********************************************************************************

			}], [{
				key: "blockName",
				value: function blockName() {
					return "hexBlock";
				}
			}]);

			return LocalHexBlockMixin;
		}(BaseClass);
	};
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of identification block class
	//**************************************************************************************

	var LocalIdentificationBlock = function (_LocalHexBlock) {
		_inherits(LocalIdentificationBlock, _LocalHexBlock);

		//**********************************************************************************
		/**
   * Constructor for "LocalBaseBlock" class
   * @param {Object} [parameters={}]
   * @property {Object} [idBlock]
   */
		function LocalIdentificationBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalIdentificationBlock);

			var _this3 = _possibleConstructorReturn(this, (LocalIdentificationBlock.__proto__ || Object.getPrototypeOf(LocalIdentificationBlock)).call(this));

			if ("idBlock" in parameters) {
				//region Properties from hexBlock class
				_this3.isHexOnly = getParametersValue(parameters.idBlock, "isHexOnly", false);
				_this3.valueHex = getParametersValue(parameters.idBlock, "valueHex", new ArrayBuffer(0));
				//endregion

				_this3.tagClass = getParametersValue(parameters.idBlock, "tagClass", -1);
				_this3.tagNumber = getParametersValue(parameters.idBlock, "tagNumber", -1);
				_this3.isConstructed = getParametersValue(parameters.idBlock, "isConstructed", false);
			} else {
				_this3.tagClass = -1;
				_this3.tagNumber = -1;
				_this3.isConstructed = false;
			}
			return _this3;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalIdentificationBlock, [{
			key: "toBER",

			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Initial variables
				var firstOctet = 0;
				var retBuf = void 0;
				var retView = void 0;
				//endregion

				switch (this.tagClass) {
					case 1:
						firstOctet |= 0x00; // UNIVERSAL
						break;
					case 2:
						firstOctet |= 0x40; // APPLICATION
						break;
					case 3:
						firstOctet |= 0x80; // CONTEXT-SPECIFIC
						break;
					case 4:
						firstOctet |= 0xC0; // PRIVATE
						break;
					default:
						this.error = "Unknown tag class";
						return new ArrayBuffer(0);
				}

				if (this.isConstructed) firstOctet |= 0x20;

				if (this.tagNumber < 31 && !this.isHexOnly) {
					retBuf = new ArrayBuffer(1);
					retView = new Uint8Array(retBuf);

					if (!sizeOnly) {
						var number = this.tagNumber;
						number &= 0x1F;
						firstOctet |= number;

						retView[0] = firstOctet;
					}

					return retBuf;
				}

				if (this.isHexOnly === false) {
					var encodedBuf = utilToBase(this.tagNumber, 7);
					var encodedView = new Uint8Array(encodedBuf);
					var size = encodedBuf.byteLength;

					retBuf = new ArrayBuffer(size + 1);
					retView = new Uint8Array(retBuf);
					retView[0] = firstOctet | 0x1F;

					if (!sizeOnly) {
						for (var i = 0; i < size - 1; i++) {
							retView[i + 1] = encodedView[i] | 0x80;
						}retView[size] = encodedView[size - 1];
					}

					return retBuf;
				}

				retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
				retView = new Uint8Array(retBuf);

				retView[0] = firstOctet | 0x1F;

				if (sizeOnly === false) {
					var curView = new Uint8Array(this.valueHex);

					for (var _i4 = 0; _i4 < curView.length - 1; _i4++) {
						retView[_i4 + 1] = curView[_i4] | 0x80;
					}retView[this.valueHex.byteLength] = curView[curView.length - 1];
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */

		}, {
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				//region Initial checks
				if (intBuffer.length === 0) {
					this.error = "Zero buffer length";
					return -1;
				}
				//endregion

				//region Find tag class
				var tagClassMask = intBuffer[0] & 0xC0;

				switch (tagClassMask) {
					case 0x00:
						this.tagClass = 1; // UNIVERSAL
						break;
					case 0x40:
						this.tagClass = 2; // APPLICATION
						break;
					case 0x80:
						this.tagClass = 3; // CONTEXT-SPECIFIC
						break;
					case 0xC0:
						this.tagClass = 4; // PRIVATE
						break;
					default:
						this.error = "Unknown tag class";
						return -1;
				}
				//endregion

				//region Find it's constructed or not
				this.isConstructed = (intBuffer[0] & 0x20) === 0x20;
				//endregion

				//region Find tag number
				this.isHexOnly = false;

				var tagNumberMask = intBuffer[0] & 0x1F;

				//region Simple case (tag number < 31)
				if (tagNumberMask !== 0x1F) {
					this.tagNumber = tagNumberMask;
					this.blockLength = 1;
				}
				//endregion
				//region Tag number bigger or equal to 31
				else {
						var count = 1;

						this.valueHex = new ArrayBuffer(255);
						var tagNumberBufferMaxLength = 255;
						var intTagNumberBuffer = new Uint8Array(this.valueHex);

						//noinspection JSBitwiseOperatorUsage
						while (intBuffer[count] & 0x80) {
							intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F;
							count++;

							if (count >= intBuffer.length) {
								this.error = "End of input reached before message was fully decoded";
								return -1;
							}

							//region In case if tag number length is greater than 255 bytes (rare but possible case)
							if (count === tagNumberBufferMaxLength) {
								tagNumberBufferMaxLength += 255;

								var _tempBuffer = new ArrayBuffer(tagNumberBufferMaxLength);
								var _tempBufferView = new Uint8Array(_tempBuffer);

								for (var i = 0; i < intTagNumberBuffer.length; i++) {
									_tempBufferView[i] = intTagNumberBuffer[i];
								}this.valueHex = new ArrayBuffer(tagNumberBufferMaxLength);
								intTagNumberBuffer = new Uint8Array(this.valueHex);
							}
							//endregion
						}

						this.blockLength = count + 1;
						intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F; // Write last byte to buffer

						//region Cut buffer
						var tempBuffer = new ArrayBuffer(count);
						var tempBufferView = new Uint8Array(tempBuffer);

						for (var _i5 = 0; _i5 < count; _i5++) {
							tempBufferView[_i5] = intTagNumberBuffer[_i5];
						}this.valueHex = new ArrayBuffer(count);
						intTagNumberBuffer = new Uint8Array(this.valueHex);
						intTagNumberBuffer.set(tempBufferView);
						//endregion

						//region Try to convert long tag number to short form
						if (this.blockLength <= 9) this.tagNumber = utilFromBase(intTagNumberBuffer, 7);else {
							this.isHexOnly = true;
							this.warnings.push("Tag too long, represented as hex-coded");
						}
						//endregion
					}
				//endregion
				//endregion

				//region Check if constructed encoding was using for primitive type
				if (this.tagClass === 1 && this.isConstructed) {
					switch (this.tagNumber) {
						case 1: // Boolean
						case 2: // REAL
						case 5: // Null
						case 6: // OBJECT IDENTIFIER
						case 9: // REAL
						case 14: // Time
						case 23:
						case 24:
						case 31:
						case 32:
						case 33:
						case 34:
							this.error = "Constructed encoding used for primitive type";
							return -1;
						default:
					}
				}
				//endregion

				return inputOffset + this.blockLength; // Return current offset in input buffer
			}
			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName: string,
    *  tagClass: number,
    *  tagNumber: number,
    *  isConstructed: boolean,
    *  isHexOnly: boolean,
    *  valueHex: ArrayBuffer,
    *  blockLength: number,
    *  error: string, warnings: Array.<string>,
    *  valueBeforeDecode: string}}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalIdentificationBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIdentificationBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.blockName = this.constructor.blockName();
				object.tagClass = this.tagClass;
				object.tagNumber = this.tagNumber;
				object.isConstructed = this.isConstructed;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "identificationBlock";
			}
		}]);

		return LocalIdentificationBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of length block class
	//**************************************************************************************


	var LocalLengthBlock = function (_LocalBaseBlock) {
		_inherits(LocalLengthBlock, _LocalBaseBlock);

		//**********************************************************************************
		/**
   * Constructor for "LocalLengthBlock" class
   * @param {Object} [parameters={}]
   * @property {Object} [lenBlock]
   */
		function LocalLengthBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalLengthBlock);

			var _this4 = _possibleConstructorReturn(this, (LocalLengthBlock.__proto__ || Object.getPrototypeOf(LocalLengthBlock)).call(this));

			if ("lenBlock" in parameters) {
				_this4.isIndefiniteForm = getParametersValue(parameters.lenBlock, "isIndefiniteForm", false);
				_this4.longFormUsed = getParametersValue(parameters.lenBlock, "longFormUsed", false);
				_this4.length = getParametersValue(parameters.lenBlock, "length", 0);
			} else {
				_this4.isIndefiniteForm = false;
				_this4.longFormUsed = false;
				_this4.length = 0;
			}
			return _this4;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalLengthBlock, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				//region Initial checks
				if (intBuffer.length === 0) {
					this.error = "Zero buffer length";
					return -1;
				}

				if (intBuffer[0] === 0xFF) {
					this.error = "Length block 0xFF is reserved by standard";
					return -1;
				}
				//endregion

				//region Check for length form type
				this.isIndefiniteForm = intBuffer[0] === 0x80;
				//endregion

				//region Stop working in case of indefinite length form
				if (this.isIndefiniteForm === true) {
					this.blockLength = 1;
					return inputOffset + this.blockLength;
				}
				//endregion

				//region Check is long form of length encoding using
				this.longFormUsed = !!(intBuffer[0] & 0x80);
				//endregion

				//region Stop working in case of short form of length value
				if (this.longFormUsed === false) {
					this.length = intBuffer[0];
					this.blockLength = 1;
					return inputOffset + this.blockLength;
				}
				//endregion

				//region Calculate length value in case of long form
				var count = intBuffer[0] & 0x7F;

				if (count > 8) // Too big length value
					{
						this.error = "Too big integer";
						return -1;
					}

				if (count + 1 > intBuffer.length) {
					this.error = "End of input reached before message was fully decoded";
					return -1;
				}

				var lengthBufferView = new Uint8Array(count);

				for (var i = 0; i < count; i++) {
					lengthBufferView[i] = intBuffer[i + 1];
				}if (lengthBufferView[count - 1] === 0x00) this.warnings.push("Needlessly long encoded length");

				this.length = utilFromBase(lengthBufferView, 8);

				if (this.longFormUsed && this.length <= 127) this.warnings.push("Unneccesary usage of long length form");

				this.blockLength = count + 1;
				//endregion

				return inputOffset + this.blockLength; // Return current offset in input buffer
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Initial variables
				var retBuf = void 0;
				var retView = void 0;
				//endregion

				if (this.length > 127) this.longFormUsed = true;

				if (this.isIndefiniteForm) {
					retBuf = new ArrayBuffer(1);

					if (sizeOnly === false) {
						retView = new Uint8Array(retBuf);
						retView[0] = 0x80;
					}

					return retBuf;
				}

				if (this.longFormUsed === true) {
					var encodedBuf = utilToBase(this.length, 8);

					if (encodedBuf.byteLength > 127) {
						this.error = "Too big length";
						return new ArrayBuffer(0);
					}

					retBuf = new ArrayBuffer(encodedBuf.byteLength + 1);

					if (sizeOnly === true) return retBuf;

					var encodedView = new Uint8Array(encodedBuf);
					retView = new Uint8Array(retBuf);

					retView[0] = encodedBuf.byteLength | 0x80;

					for (var i = 0; i < encodedBuf.byteLength; i++) {
						retView[i + 1] = encodedView[i];
					}return retBuf;
				}

				retBuf = new ArrayBuffer(1);

				if (sizeOnly === false) {
					retView = new Uint8Array(retBuf);

					retView[0] = this.length;
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalLengthBlock.prototype.__proto__ || Object.getPrototypeOf(LocalLengthBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.blockName = this.constructor.blockName();
				object.isIndefiniteForm = this.isIndefiniteForm;
				object.longFormUsed = this.longFormUsed;
				object.length = this.length;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "lengthBlock";
			}
		}]);

		return LocalLengthBlock;
	}(LocalBaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of value block class
	//**************************************************************************************


	var LocalValueBlock = function (_LocalBaseBlock2) {
		_inherits(LocalValueBlock, _LocalBaseBlock2);

		//**********************************************************************************
		/**
   * Constructor for "LocalValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalValueBlock);

			return _possibleConstructorReturn(this, (LocalValueBlock.__proto__ || Object.getPrototypeOf(LocalValueBlock)).call(this, parameters));
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalValueBlock, [{
			key: "fromBER",

			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Throw an exception for a function which needs to be specified in extended classes
				throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
				//endregion
			}
			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Throw an exception for a function which needs to be specified in extended classes
				throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
				//endregion
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "valueBlock";
			}
		}]);

		return LocalValueBlock;
	}(LocalBaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of basic ASN.1 block class
	//**************************************************************************************


	var BaseBlock = function (_LocalBaseBlock3) {
		_inherits(BaseBlock, _LocalBaseBlock3);

		//**********************************************************************************
		/**
   * Constructor for "BaseBlock" class
   * @param {Object} [parameters={}]
   * @property {Object} [primitiveSchema]
   * @property {string} [name]
   * @property {boolean} [optional]
   * @param valueBlockType Type of value block
   */
		function BaseBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var valueBlockType = arguments.length <= 1 || arguments[1] === undefined ? LocalValueBlock : arguments[1];

			_classCallCheck(this, BaseBlock);

			var _this6 = _possibleConstructorReturn(this, (BaseBlock.__proto__ || Object.getPrototypeOf(BaseBlock)).call(this, parameters));

			if ("name" in parameters) _this6.name = parameters.name;
			if ("optional" in parameters) _this6.optional = parameters.optional;
			if ("primitiveSchema" in parameters) _this6.primitiveSchema = parameters.primitiveSchema;

			_this6.idBlock = new LocalIdentificationBlock(parameters);
			_this6.lenBlock = new LocalLengthBlock(parameters);
			_this6.valueBlock = new valueBlockType(parameters);
			return _this6;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(BaseBlock, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var retBuf = void 0;

				var idBlockBuf = this.idBlock.toBER(sizeOnly);
				var valueBlockSizeBuf = this.valueBlock.toBER(true);

				this.lenBlock.length = valueBlockSizeBuf.byteLength;
				var lenBlockBuf = this.lenBlock.toBER(sizeOnly);

				retBuf = utilConcatBuf(idBlockBuf, lenBlockBuf);

				var valueBlockBuf = void 0;

				if (sizeOnly === false) valueBlockBuf = this.valueBlock.toBER(sizeOnly);else valueBlockBuf = new ArrayBuffer(this.lenBlock.length);

				retBuf = utilConcatBuf(retBuf, valueBlockBuf);

				if (this.lenBlock.isIndefiniteForm === true) {
					var indefBuf = new ArrayBuffer(2);

					if (sizeOnly === false) {
						var indefView = new Uint8Array(indefBuf);

						indefView[0] = 0x00;
						indefView[1] = 0x00;
					}

					retBuf = utilConcatBuf(retBuf, indefBuf);
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(BaseBlock.prototype.__proto__ || Object.getPrototypeOf(BaseBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.idBlock = this.idBlock.toJSON();
				object.lenBlock = this.lenBlock.toJSON();
				object.valueBlock = this.valueBlock.toJSON();

				if ("name" in this) object.name = this.name;
				if ("optional" in this) object.optional = this.optional;
				if ("primitiveSchema" in this) object.primitiveSchema = this.primitiveSchema.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BaseBlock";
			}
		}]);

		return BaseBlock;
	}(LocalBaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of basic block for all PRIMITIVE types
	//**************************************************************************************


	var LocalPrimitiveValueBlock = function (_LocalValueBlock) {
		_inherits(LocalPrimitiveValueBlock, _LocalValueBlock);

		//**********************************************************************************
		/**
   * Constructor for "LocalPrimitiveValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueBeforeDecode]
   */
		function LocalPrimitiveValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalPrimitiveValueBlock);

			//region Variables from "hexBlock" class
			var _this7 = _possibleConstructorReturn(this, (LocalPrimitiveValueBlock.__proto__ || Object.getPrototypeOf(LocalPrimitiveValueBlock)).call(this, parameters));

			if ("valueHex" in parameters) _this7.valueHex = parameters.valueHex.slice(0);else _this7.valueHex = new ArrayBuffer(0);

			_this7.isHexOnly = getParametersValue(parameters, "isHexOnly", true);
			//endregion
			return _this7;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number}
   */


		_createClass(LocalPrimitiveValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				//region Initial checks
				if (intBuffer.length === 0) {
					this.warnings.push("Zero buffer length");
					return inputOffset;
				}
				//endregion

				//region Copy input buffer into internal buffer
				this.valueHex = new ArrayBuffer(intBuffer.length);
				var valueHexView = new Uint8Array(this.valueHex);

				for (var i = 0; i < intBuffer.length; i++) {
					valueHexView[i] = intBuffer[i];
				} //endregion

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				return this.valueHex.slice(0);
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalPrimitiveValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalPrimitiveValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);
				object.isHexOnly = this.isHexOnly;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "PrimitiveValueBlock";
			}
		}]);

		return LocalPrimitiveValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************


	var Primitive = function (_BaseBlock) {
		_inherits(Primitive, _BaseBlock);

		//**********************************************************************************
		/**
   * Constructor for "Primitive" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function Primitive() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Primitive);

			var _this8 = _possibleConstructorReturn(this, (Primitive.__proto__ || Object.getPrototypeOf(Primitive)).call(this, parameters, LocalPrimitiveValueBlock));

			_this8.idBlock.isConstructed = false;
			return _this8;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Primitive, null, [{
			key: "blockName",
			value: function blockName() {
				return "PRIMITIVE";
			}
			//**********************************************************************************

		}]);

		return Primitive;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of basic block for all CONSTRUCTED types
	//**************************************************************************************


	var LocalConstructedValueBlock = function (_LocalValueBlock2) {
		_inherits(LocalConstructedValueBlock, _LocalValueBlock2);

		//**********************************************************************************
		/**
   * Constructor for "LocalConstructedValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalConstructedValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalConstructedValueBlock);

			var _this9 = _possibleConstructorReturn(this, (LocalConstructedValueBlock.__proto__ || Object.getPrototypeOf(LocalConstructedValueBlock)).call(this, parameters));

			_this9.value = getParametersValue(parameters, "value", []);
			_this9.isIndefiniteForm = getParametersValue(parameters, "isIndefiniteForm", false);
			return _this9;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number}
   */


		_createClass(LocalConstructedValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Store initial offset and length
				var initialOffset = inputOffset;
				var initialLength = inputLength;
				//endregion

				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				//region Initial checks
				if (intBuffer.length === 0) {
					this.warnings.push("Zero buffer length");
					return inputOffset;
				}
				//endregion

				//region Aux function
				function checkLen(indefiniteLength, length) {
					if (indefiniteLength === true) return 1;

					return length;
				}
				//endregion

				var currentOffset = inputOffset;

				while (checkLen(this.isIndefiniteForm, inputLength) > 0) {
					var returnObject = LocalFromBER(inputBuffer, currentOffset, inputLength);
					if (returnObject.offset === -1) {
						this.error = returnObject.result.error;
						this.warnings.concat(returnObject.result.warnings);
						return -1;
					}

					currentOffset = returnObject.offset;

					this.blockLength += returnObject.result.blockLength;
					inputLength -= returnObject.result.blockLength;

					this.value.push(returnObject.result);

					if (this.isIndefiniteForm === true && returnObject.result.constructor.blockName() === EndOfContent.blockName()) break;
				}

				if (this.isIndefiniteForm === true) {
					if (this.value[this.value.length - 1].constructor.blockName() === EndOfContent.blockName()) this.value.pop();else this.warnings.push("No EndOfContent block encoded");
				}

				//region Copy "inputBuffer" to "valueBeforeDecode"
				this.valueBeforeDecode = inputBuffer.slice(initialOffset, initialOffset + initialLength);
				//endregion

				return currentOffset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var retBuf = new ArrayBuffer(0);

				for (var i = 0; i < this.value.length; i++) {
					var valueBuf = this.value[i].toBER(sizeOnly);
					retBuf = utilConcatBuf(retBuf, valueBuf);
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalConstructedValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalConstructedValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.isIndefiniteForm = this.isIndefiniteForm;
				object.value = [];
				for (var i = 0; i < this.value.length; i++) {
					object.value.push(this.value[i].toJSON());
				}return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "ConstructedValueBlock";
			}
		}]);

		return LocalConstructedValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************


	var Constructed = function (_BaseBlock2) {
		_inherits(Constructed, _BaseBlock2);

		//**********************************************************************************
		/**
   * Constructor for "Constructed" class
   * @param {Object} [parameters={}]
   */
		function Constructed() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Constructed);

			var _this10 = _possibleConstructorReturn(this, (Constructed.__proto__ || Object.getPrototypeOf(Constructed)).call(this, parameters, LocalConstructedValueBlock));

			_this10.idBlock.isConstructed = true;
			return _this10;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Constructed, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "CONSTRUCTED";
			}
		}]);

		return Constructed;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 EndOfContent type class
	//**************************************************************************************


	var LocalEndOfContentValueBlock = function (_LocalValueBlock3) {
		_inherits(LocalEndOfContentValueBlock, _LocalValueBlock3);

		//**********************************************************************************
		/**
   * Constructor for "LocalEndOfContentValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalEndOfContentValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalEndOfContentValueBlock);

			return _possibleConstructorReturn(this, (LocalEndOfContentValueBlock.__proto__ || Object.getPrototypeOf(LocalEndOfContentValueBlock)).call(this, parameters));
		}
		//**********************************************************************************
		//noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number}
   */


		_createClass(LocalEndOfContentValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region There is no "value block" for EndOfContent type and we need to return the same offset
				return inputOffset;
				//endregion
			}
			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				return new ArrayBuffer(0);
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}], [{
			key: "blockName",
			value: function blockName() {
				return "EndOfContentValueBlock";
			}
			//**********************************************************************************

		}]);

		return LocalEndOfContentValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************


	var EndOfContent = function (_BaseBlock3) {
		_inherits(EndOfContent, _BaseBlock3);

		//**********************************************************************************
		function EndOfContent() {
			var paramaters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, EndOfContent);

			var _this12 = _possibleConstructorReturn(this, (EndOfContent.__proto__ || Object.getPrototypeOf(EndOfContent)).call(this, paramaters, LocalEndOfContentValueBlock));

			_this12.idBlock.tagClass = 1; // UNIVERSAL
			_this12.idBlock.tagNumber = 0; // EndOfContent
			return _this12;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(EndOfContent, null, [{
			key: "blockName",
			value: function blockName() {
				return "EndOfContent";
			}
			//**********************************************************************************

		}]);

		return EndOfContent;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Boolean type class
	//**************************************************************************************


	var LocalBooleanValueBlock = function (_LocalValueBlock4) {
		_inherits(LocalBooleanValueBlock, _LocalValueBlock4);

		//**********************************************************************************
		/**
   * Constructor for "LocalBooleanValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalBooleanValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalBooleanValueBlock);

			var _this13 = _possibleConstructorReturn(this, (LocalBooleanValueBlock.__proto__ || Object.getPrototypeOf(LocalBooleanValueBlock)).call(this, parameters));

			_this13.value = getParametersValue(parameters, "value", false);
			_this13.isHexOnly = getParametersValue(parameters, "isHexOnly", false);

			if ("valueHex" in parameters) _this13.valueHex = parameters.valueHex.slice(0);else {
				_this13.valueHex = new ArrayBuffer(1);
				if (_this13.value === true) {
					var view = new Uint8Array(_this13.valueHex);
					view[0] = 0xFF;
				}
			}
			return _this13;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(LocalBooleanValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				if (inputLength > 1) this.warnings.push("Boolean value encoded in more then 1 octet");

				this.value = intBuffer[0] !== 0x00;

				this.isHexOnly = true;

				//region Copy input buffer to internal array
				this.valueHex = new ArrayBuffer(intBuffer.length);
				var view = new Uint8Array(this.valueHex);

				for (var i = 0; i < intBuffer.length; i++) {
					view[i] = intBuffer[i];
				} //endregion

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				return this.valueHex;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalBooleanValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBooleanValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BooleanValueBlock";
			}
		}]);

		return LocalBooleanValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************


	var Boolean = function (_BaseBlock4) {
		_inherits(Boolean, _BaseBlock4);

		//**********************************************************************************
		/**
   * Constructor for "Boolean" class
   * @param {Object} [parameters={}]
   */
		function Boolean() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Boolean);

			var _this14 = _possibleConstructorReturn(this, (Boolean.__proto__ || Object.getPrototypeOf(Boolean)).call(this, parameters, LocalBooleanValueBlock));

			_this14.idBlock.tagClass = 1; // UNIVERSAL
			_this14.idBlock.tagNumber = 1; // Boolean
			return _this14;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Boolean, null, [{
			key: "blockName",
			value: function blockName() {
				return "Boolean";
			}
			//**********************************************************************************

		}]);

		return Boolean;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Sequence and Set type classes
	//**************************************************************************************


	var Sequence = function (_Constructed) {
		_inherits(Sequence, _Constructed);

		//**********************************************************************************
		/**
   * Constructor for "Sequence" class
   * @param {Object} [parameters={}]
   */
		function Sequence() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Sequence);

			var _this15 = _possibleConstructorReturn(this, (Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call(this, parameters));

			_this15.idBlock.tagClass = 1; // UNIVERSAL
			_this15.idBlock.tagNumber = 16; // Sequence
			return _this15;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Sequence, null, [{
			key: "blockName",
			value: function blockName() {
				return "Sequence";
			}
			//**********************************************************************************

		}]);

		return Sequence;
	}(Constructed);
	//**************************************************************************************


	var Set = function (_Constructed2) {
		_inherits(Set, _Constructed2);

		//**********************************************************************************
		/**
   * Constructor for "Set" class
   * @param {Object} [parameters={}]
   */
		function Set() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Set);

			var _this16 = _possibleConstructorReturn(this, (Set.__proto__ || Object.getPrototypeOf(Set)).call(this, parameters));

			_this16.idBlock.tagClass = 1; // UNIVERSAL
			_this16.idBlock.tagNumber = 17; // Set
			return _this16;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Set, null, [{
			key: "blockName",
			value: function blockName() {
				return "Set";
			}
			//**********************************************************************************

		}]);

		return Set;
	}(Constructed);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Null type class
	//**************************************************************************************


	var Null = function (_BaseBlock5) {
		_inherits(Null, _BaseBlock5);

		//**********************************************************************************
		/**
   * Constructor for "Null" class
   * @param {Object} [parameters={}]
   */
		function Null() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Null);

			// We will not have a call to "Null value block" because of specified "fromBER" and "toBER" functions

			var _this17 = _possibleConstructorReturn(this, (Null.__proto__ || Object.getPrototypeOf(Null)).call(this, parameters, LocalBaseBlock));

			_this17.idBlock.tagClass = 1; // UNIVERSAL
			_this17.idBlock.tagNumber = 5; // Null
			return _this17;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Null, [{
			key: "fromBER",

			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (this.lenBlock.length > 0) this.warnings.push("Non-zero length of value block for Null type");

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				this.blockLength += inputLength;

				return inputOffset + inputLength;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var retBuf = new ArrayBuffer(2);

				if (sizeOnly === true) return retBuf;

				var retView = new Uint8Array(retBuf);
				retView[0] = 0x05;
				retView[1] = 0x00;

				return retBuf;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "Null";
			}
		}]);

		return Null;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 OctetString type class
	//**************************************************************************************


	var LocalOctetStringValueBlock = function (_LocalHexBlock2) {
		_inherits(LocalOctetStringValueBlock, _LocalHexBlock2);

		//**********************************************************************************
		/**
   * Constructor for "LocalOctetStringValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function LocalOctetStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalOctetStringValueBlock);

			var _this18 = _possibleConstructorReturn(this, (LocalOctetStringValueBlock.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock)).call(this, parameters));

			_this18.isConstructed = getParametersValue(parameters, "isConstructed", false);
			return _this18;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(LocalOctetStringValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = 0;

				if (this.isConstructed === true) {
					this.isHexOnly = false;

					resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
					if (resultOffset === -1) return resultOffset;

					for (var i = 0; i < this.value.length; i++) {
						var currentBlockName = this.value[i].constructor.blockName();

						if (currentBlockName === EndOfContent.blockName()) {
							if (this.isIndefiniteForm === true) break;else {
								this.error = "EndOfContent is unexpected, OCTET STRING may consists of OCTET STRINGs only";
								return -1;
							}
						}

						if (currentBlockName !== OctetString.blockName()) {
							this.error = "OCTET STRING may consists of OCTET STRINGs only";
							return -1;
						}
					}
				} else {
					this.isHexOnly = true;

					resultOffset = _get(LocalOctetStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock.prototype), "fromBER", this).call(this, inputBuffer, inputOffset, inputLength);
					this.blockLength = inputLength;
				}

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				if (this.isConstructed === true) return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);

				var retBuf = new ArrayBuffer(this.valueHex.byteLength);

				if (sizeOnly === true) return retBuf;

				if (this.valueHex.byteLength === 0) return retBuf;

				retBuf = this.valueHex.slice(0);

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalOctetStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.isConstructed = this.isConstructed;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "OctetStringValueBlock";
			}
		}]);

		return LocalOctetStringValueBlock;
	}(LocalHexBlock(LocalConstructedValueBlock));
	//**************************************************************************************


	var OctetString = function (_BaseBlock6) {
		_inherits(OctetString, _BaseBlock6);

		//**********************************************************************************
		/**
   * Constructor for "OctetString" class
   * @param {Object} [parameters={}]
   */
		function OctetString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OctetString);

			var _this19 = _possibleConstructorReturn(this, (OctetString.__proto__ || Object.getPrototypeOf(OctetString)).call(this, parameters, LocalOctetStringValueBlock));

			_this19.idBlock.tagClass = 1; // UNIVERSAL
			_this19.idBlock.tagNumber = 4; // OctetString
			return _this19;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(OctetString, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.valueBlock.isConstructed = this.idBlock.isConstructed;
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				//region Ability to encode empty OCTET STRING
				if (inputLength === 0) {
					if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

					if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

					return inputOffset;
				}
				//endregion

				return _get(OctetString.prototype.__proto__ || Object.getPrototypeOf(OctetString.prototype), "fromBER", this).call(this, inputBuffer, inputOffset, inputLength);
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "isEqual",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Checking that two OCTETSTRINGs are equal
    * @param {OctetString} octetString
    */
			value: function isEqual(octetString) {
				//region Check input type
				if (octetString instanceof OctetString === false) return false;
				//endregion

				//region Compare two JSON strings
				if (JSON.stringify(this) !== JSON.stringify(octetString)) return false;
				//endregion

				return true;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "OctetString";
			}
		}]);

		return OctetString;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 BitString type class
	//**************************************************************************************


	var LocalBitStringValueBlock = function (_LocalHexBlock3) {
		_inherits(LocalBitStringValueBlock, _LocalHexBlock3);

		//**********************************************************************************
		/**
   * Constructor for "LocalBitStringValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function LocalBitStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalBitStringValueBlock);

			var _this20 = _possibleConstructorReturn(this, (LocalBitStringValueBlock.__proto__ || Object.getPrototypeOf(LocalBitStringValueBlock)).call(this, parameters));

			_this20.unusedBits = getParametersValue(parameters, "unusedBits", 0);
			_this20.isConstructed = getParametersValue(parameters, "isConstructed", false);
			_this20.blockLength = _this20.valueHex.byteLength + 1; // "+1" for "unusedBits"
			return _this20;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(LocalBitStringValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Ability to decode zero-length BitString value
				if (inputLength === 0) return inputOffset;
				//endregion

				var resultOffset = -1;

				//region If the BISTRING supposed to be a constructed value
				if (this.isConstructed === true) {
					resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
					if (resultOffset === -1) return resultOffset;

					for (var i = 0; i < this.value.length; i++) {
						var currentBlockName = this.value[i].constructor.blockName();

						if (currentBlockName === EndOfContent.blockName()) {
							if (this.isIndefiniteForm === true) break;else {
								this.error = "EndOfContent is unexpected, BIT STRING may consists of BIT STRINGs only";
								return -1;
							}
						}

						if (currentBlockName !== BitString.blockName()) {
							this.error = "BIT STRING may consists of BIT STRINGs only";
							return -1;
						}

						if (this.unusedBits > 0 && this.value[i].unusedBits > 0) {
							this.error = "Usign of \"unused bits\" inside constructive BIT STRING allowed for least one only";
							return -1;
						}

						this.unusedBits = this.value[i].unusedBits;
						if (this.unusedBits > 7) {
							this.error = "Unused bits for BitString must be in range 0-7";
							return -1;
						}
					}

					return resultOffset;
				}
				//endregion
				//region If the BitString supposed to be a primitive value
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				this.unusedBits = intBuffer[0];
				if (this.unusedBits > 7) {
					this.error = "Unused bits for BitString must be in range 0-7";
					return -1;
				}

				//region Copy input buffer to internal buffer
				this.valueHex = new ArrayBuffer(intBuffer.length - 1);
				var view = new Uint8Array(this.valueHex);
				for (var _i6 = 0; _i6 < inputLength - 1; _i6++) {
					view[_i6] = intBuffer[_i6 + 1];
				} //endregion

				this.blockLength = intBuffer.length;

				return inputOffset + inputLength;
				//endregion
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				if (this.isConstructed === true) return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);

				if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength + 1);

				if (this.valueHex.byteLength === 0) return new ArrayBuffer(0);

				var curView = new Uint8Array(this.valueHex);

				var retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
				var retView = new Uint8Array(retBuf);

				retView[0] = this.unusedBits;

				for (var i = 0; i < this.valueHex.byteLength; i++) {
					retView[i + 1] = curView[i];
				}return retBuf;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalBitStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBitStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.unusedBits = this.unusedBits;
				object.isConstructed = this.isConstructed;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BitStringValueBlock";
			}
		}]);

		return LocalBitStringValueBlock;
	}(LocalHexBlock(LocalConstructedValueBlock));
	//**************************************************************************************


	var BitString = function (_BaseBlock7) {
		_inherits(BitString, _BaseBlock7);

		//**********************************************************************************
		/**
   * Constructor for "BitString" class
   * @param {Object} [parameters={}]
   */
		function BitString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, BitString);

			var _this21 = _possibleConstructorReturn(this, (BitString.__proto__ || Object.getPrototypeOf(BitString)).call(this, parameters, LocalBitStringValueBlock));

			_this21.idBlock.tagClass = 1; // UNIVERSAL
			_this21.idBlock.tagNumber = 3; // BitString
			return _this21;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(BitString, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Ability to encode empty BitString
				if (inputLength === 0) return inputOffset;
				//endregion

				this.valueBlock.isConstructed = this.idBlock.isConstructed;
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				return _get(BitString.prototype.__proto__ || Object.getPrototypeOf(BitString.prototype), "fromBER", this).call(this, inputBuffer, inputOffset, inputLength);
			}
			//**********************************************************************************
			/**
    * Checking that two BITSTRINGs are equal
    * @param {BitString} bitString
    */

		}, {
			key: "isEqual",
			value: function isEqual(bitString) {
				//region Check input type
				if (bitString instanceof BitString === false) return false;
				//endregion

				//region Compare two JSON strings
				if (JSON.stringify(this) !== JSON.stringify(bitString)) return false;
				//endregion

				return true;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BitString";
			}
		}]);

		return BitString;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Integer type class
	//**************************************************************************************
	/**
  * @extends LocalValueBlock
  */


	var LocalIntegerValueBlock = function (_LocalHexBlock4) {
		_inherits(LocalIntegerValueBlock, _LocalHexBlock4);

		//**********************************************************************************
		/**
   * Constructor for "LocalIntegerValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function LocalIntegerValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalIntegerValueBlock);

			var _this22 = _possibleConstructorReturn(this, (LocalIntegerValueBlock.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock)).call(this, parameters));

			if ("value" in parameters) _this22.valueDec = parameters.value;
			return _this22;
		}
		//**********************************************************************************
		/**
   * Setter for "valueHex"
   * @param {ArrayBuffer} _value
   */


		_createClass(LocalIntegerValueBlock, [{
			key: "fromDER",

			//**********************************************************************************
			/**
    * Base function for converting block from DER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 DER encoded array
    * @param {!number} inputOffset Offset in ASN.1 DER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @param {number} [expectedLength=0] Expected length of converted "valueHex" buffer
    * @returns {number} Offset after least decoded byte
    */
			value: function fromDER(inputBuffer, inputOffset, inputLength) {
				var expectedLength = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

				var offset = this.fromBER(inputBuffer, inputOffset, inputLength);
				if (offset === -1) return offset;

				var view = new Uint8Array(this._valueHex);

				if (view[0] === 0x00 && (view[1] & 0x80) !== 0) {
					var updatedValueHex = new ArrayBuffer(this._valueHex.byteLength - 1);
					var updatedView = new Uint8Array(updatedValueHex);

					updatedView.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

					this._valueHex = updatedValueHex.slice(0);
				} else {
					if (expectedLength !== 0) {
						if (this._valueHex.byteLength < expectedLength) {
							if (expectedLength - this._valueHex.byteLength > 1) expectedLength = this._valueHex.byteLength + 1;

							var _updatedValueHex = new ArrayBuffer(expectedLength);
							var _updatedView = new Uint8Array(_updatedValueHex);

							_updatedView.set(view, expectedLength - this._valueHex.byteLength);

							this._valueHex = _updatedValueHex.slice(0);
						}
					}
				}

				return offset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (DER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toDER",
			value: function toDER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var view = new Uint8Array(this._valueHex);

				switch (true) {
					case (view[0] & 0x80) !== 0:
						{
							var updatedValueHex = new ArrayBuffer(this._valueHex.byteLength + 1);
							var updatedView = new Uint8Array(updatedValueHex);

							updatedView[0] = 0x00;
							updatedView.set(view, 1);

							this._valueHex = updatedValueHex.slice(0);
						}
						break;
					case view[0] === 0x00 && (view[1] & 0x80) === 0:
						{
							var _updatedValueHex2 = new ArrayBuffer(this._valueHex.byteLength - 1);
							var _updatedView2 = new Uint8Array(_updatedValueHex2);

							_updatedView2.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

							this._valueHex = _updatedValueHex2.slice(0);
						}
						break;
					default:
				}

				return this.toBER(sizeOnly);
			}
			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */

		}, {
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = _get(LocalIntegerValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock.prototype), "fromBER", this).call(this, inputBuffer, inputOffset, inputLength);
				if (resultOffset === -1) return resultOffset;

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//noinspection JSCheckFunctionSignatures
				return this.valueHex.slice(0);
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalIntegerValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.valueDec = this.valueDec;

				return object;
			}
			//**********************************************************************************

		}, {
			key: "valueHex",
			set: function set(_value) {
				this._valueHex = _value.slice(0);

				if (_value.byteLength >= 4) {
					this.warnings.push("Too big Integer for decoding, hex only");
					this.isHexOnly = true;
					this._valueDec = 0;
				} else {
					this.isHexOnly = false;

					if (_value.byteLength > 0) this._valueDec = utilDecodeTC.call(this);
				}
			}
			//**********************************************************************************
			/**
    * Getter for "valueHex"
    * @returns {ArrayBuffer}
    */
			,
			get: function get() {
				return this._valueHex;
			}
			//**********************************************************************************
			/**
    * Getter for "valueDec"
    * @param {number} _value
    */

		}, {
			key: "valueDec",
			set: function set(_value) {
				this._valueDec = _value;

				this.isHexOnly = false;
				this._valueHex = utilEncodeTC(_value);
			}
			//**********************************************************************************
			/**
    * Getter for "valueDec"
    * @returns {number}
    */
			,
			get: function get() {
				return this._valueDec;
			}
		}], [{
			key: "blockName",
			value: function blockName() {
				return "IntegerValueBlock";
			}
		}]);

		return LocalIntegerValueBlock;
	}(LocalHexBlock(LocalValueBlock));
	//**************************************************************************************


	var Integer = function (_BaseBlock8) {
		_inherits(Integer, _BaseBlock8);

		//**********************************************************************************
		/**
   * Constructor for "Integer" class
   * @param {Object} [parameters={}]
   */
		function Integer() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Integer);

			var _this23 = _possibleConstructorReturn(this, (Integer.__proto__ || Object.getPrototypeOf(Integer)).call(this, parameters, LocalIntegerValueBlock));

			_this23.idBlock.tagClass = 1; // UNIVERSAL
			_this23.idBlock.tagNumber = 2; // Integer
			return _this23;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Integer, [{
			key: "isEqual",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Compare two Integer object, or Integer and ArrayBuffer objects
    * @param {!Integer|ArrayBuffer} otherValue
    * @returns {boolean}
    */
			value: function isEqual(otherValue) {
				if (otherValue instanceof Integer) {
					if (this.valueBlock.isHexOnly && otherValue.valueBlock.isHexOnly) // Compare two ArrayBuffers
						return isEqualBuffer(this.valueBlock.valueHex, otherValue.valueBlock.valueHex);

					if (this.valueBlock.isHexOnly === otherValue.valueBlock.isHexOnly) return this.valueBlock.valueDec === otherValue.valueBlock.valueDec;

					return false;
				}

				if (otherValue instanceof ArrayBuffer) return isEqualBuffer(this.valueBlock.valueHex, otherValue);

				return false;
			}
			//**********************************************************************************
			/**
    * Convert current Integer value from BER into DER format
    * @returns {Integer}
    */

		}, {
			key: "convertToDER",
			value: function convertToDER() {
				var integer = new Integer({ valueHex: this.valueBlock.valueHex });
				integer.valueBlock.toDER();

				return integer;
			}
			//**********************************************************************************
			/**
    * Convert current Integer value from DER to BER format
    * @returns {Integer}
    */

		}, {
			key: "convertFromDER",
			value: function convertFromDER() {
				var expectedLength = this.valueBlock.valueHex.byteLength % 2 ? this.valueBlock.valueHex.byteLength + 1 : this.valueBlock.valueHex.byteLength;
				var integer = new Integer({ valueHex: this.valueBlock.valueHex });
				integer.valueBlock.fromDER(integer.valueBlock.valueHex, 0, integer.valueBlock.valueHex.byteLength, expectedLength);

				return integer;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "Integer";
			}
		}]);

		return Integer;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Enumerated type class
	//**************************************************************************************


	var Enumerated = function (_Integer) {
		_inherits(Enumerated, _Integer);

		//**********************************************************************************
		/**
   * Constructor for "Enumerated" class
   * @param {Object} [parameters={}]
   */
		function Enumerated() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Enumerated);

			var _this24 = _possibleConstructorReturn(this, (Enumerated.__proto__ || Object.getPrototypeOf(Enumerated)).call(this, parameters));

			_this24.idBlock.tagClass = 1; // UNIVERSAL
			_this24.idBlock.tagNumber = 10; // Enumerated
			return _this24;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Enumerated, null, [{
			key: "blockName",
			value: function blockName() {
				return "Enumerated";
			}
			//**********************************************************************************

		}]);

		return Enumerated;
	}(Integer);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 ObjectIdentifier type class
	//**************************************************************************************


	var LocalSidValueBlock = function (_LocalHexBlock5) {
		_inherits(LocalSidValueBlock, _LocalHexBlock5);

		//**********************************************************************************
		/**
   * Constructor for "LocalSidValueBlock" class
   * @param {Object} [parameters={}]
   * @property {number} [valueDec]
   * @property {boolean} [isFirstSid]
   */
		function LocalSidValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalSidValueBlock);

			var _this25 = _possibleConstructorReturn(this, (LocalSidValueBlock.__proto__ || Object.getPrototypeOf(LocalSidValueBlock)).call(this, parameters));

			_this25.valueDec = getParametersValue(parameters, "valueDec", -1);
			_this25.isFirstSid = getParametersValue(parameters, "isFirstSid", false);
			return _this25;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalSidValueBlock, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (inputLength === 0) return inputOffset;

				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				this.valueHex = new ArrayBuffer(inputLength);
				var view = new Uint8Array(this.valueHex);

				for (var i = 0; i < inputLength; i++) {
					view[i] = intBuffer[i] & 0x7F;

					this.blockLength++;

					if ((intBuffer[i] & 0x80) === 0x00) break;
				}

				//region Ajust size of valueHex buffer
				var tempValueHex = new ArrayBuffer(this.blockLength);
				var tempView = new Uint8Array(tempValueHex);

				for (var _i7 = 0; _i7 < this.blockLength; _i7++) {
					tempView[_i7] = view[_i7];
				} //noinspection JSCheckFunctionSignatures
				this.valueHex = tempValueHex.slice(0);
				view = new Uint8Array(this.valueHex);
				//endregion

				if ((intBuffer[this.blockLength - 1] & 0x80) !== 0x00) {
					this.error = "End of input reached before message was fully decoded";
					return -1;
				}

				if (view[0] === 0x00) this.warnings.push("Needlessly long format of SID encoding");

				if (this.blockLength <= 8) this.valueDec = utilFromBase(view, 7);else {
					this.isHexOnly = true;
					this.warnings.push("Too big SID for decoding, hex only");
				}

				return inputOffset + this.blockLength;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Initial variables
				var retBuf = void 0;
				var retView = void 0;
				//endregion

				if (this.isHexOnly) {
					if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);

					var curView = new Uint8Array(this.valueHex);

					retBuf = new ArrayBuffer(this.blockLength);
					retView = new Uint8Array(retBuf);

					for (var i = 0; i < this.blockLength - 1; i++) {
						retView[i] = curView[i] | 0x80;
					}retView[this.blockLength - 1] = curView[this.blockLength - 1];

					return retBuf;
				}

				var encodedBuf = utilToBase(this.valueDec, 7);
				if (encodedBuf.byteLength === 0) {
					this.error = "Error during encoding SID value";
					return new ArrayBuffer(0);
				}

				retBuf = new ArrayBuffer(encodedBuf.byteLength);

				if (sizeOnly === false) {
					var encodedView = new Uint8Array(encodedBuf);
					retView = new Uint8Array(retBuf);

					for (var _i8 = 0; _i8 < encodedBuf.byteLength - 1; _i8++) {
						retView[_i8] = encodedView[_i8] | 0x80;
					}retView[encodedBuf.byteLength - 1] = encodedView[encodedBuf.byteLength - 1];
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Create string representation of current SID block
    * @returns {string}
    */

		}, {
			key: "toString",
			value: function toString() {
				var result = "";

				if (this.isHexOnly === true) result = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);else {
					if (this.isFirstSid) {
						var sidValue = this.valueDec;

						if (this.valueDec <= 39) result = "0.";else {
							if (this.valueDec <= 79) {
								result = "1.";
								sidValue -= 40;
							} else {
								result = "2.";
								sidValue -= 80;
							}
						}

						result = result + sidValue.toString();
					} else result = this.valueDec.toString();
				}

				return result;
			}
			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalSidValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalSidValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.valueDec = this.valueDec;
				object.isFirstSid = this.isFirstSid;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "sidBlock";
			}
		}]);

		return LocalSidValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************


	var LocalObjectIdentifierValueBlock = function (_LocalValueBlock5) {
		_inherits(LocalObjectIdentifierValueBlock, _LocalValueBlock5);

		//**********************************************************************************
		/**
   * Constructor for "LocalObjectIdentifierValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function LocalObjectIdentifierValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalObjectIdentifierValueBlock);

			var _this26 = _possibleConstructorReturn(this, (LocalObjectIdentifierValueBlock.__proto__ || Object.getPrototypeOf(LocalObjectIdentifierValueBlock)).call(this, parameters));

			_this26.fromString(getParametersValue(parameters, "value", ""));
			return _this26;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(LocalObjectIdentifierValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = inputOffset;

				while (inputLength > 0) {
					var sidBlock = new LocalSidValueBlock();
					resultOffset = sidBlock.fromBER(inputBuffer, resultOffset, inputLength);
					if (resultOffset === -1) {
						this.blockLength = 0;
						this.error = sidBlock.error;
						return resultOffset;
					}

					if (this.value.length === 0) sidBlock.isFirstSid = true;

					this.blockLength += sidBlock.blockLength;
					inputLength -= sidBlock.blockLength;

					this.value.push(sidBlock);
				}

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var retBuf = new ArrayBuffer(0);

				for (var i = 0; i < this.value.length; i++) {
					var valueBuf = this.value[i].toBER(sizeOnly);
					if (valueBuf.byteLength === 0) {
						this.error = this.value[i].error;
						return new ArrayBuffer(0);
					}

					retBuf = utilConcatBuf(retBuf, valueBuf);
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Create "LocalObjectIdentifierValueBlock" class from string
    * @param {string} string Input string to convert from
    * @returns {boolean}
    */

		}, {
			key: "fromString",
			value: function fromString(string) {
				this.value = []; // Clear existing SID values

				var pos1 = 0;
				var pos2 = 0;

				var sid = "";

				var flag = false;

				do {
					pos2 = string.indexOf(".", pos1);
					if (pos2 === -1) sid = string.substr(pos1);else sid = string.substr(pos1, pos2 - pos1);

					pos1 = pos2 + 1;

					if (flag) {
						var sidBlock = this.value[0];

						var plus = 0;

						switch (sidBlock.valueDec) {
							case 0:
								break;
							case 1:
								plus = 40;
								break;
							case 2:
								plus = 80;
								break;
							default:
								this.value = []; // clear SID array
								return false; // ???
						}

						var parsedSID = parseInt(sid, 10);
						if (isNaN(parsedSID)) return true;

						sidBlock.valueDec = parsedSID + plus;

						flag = false;
					} else {
						var _sidBlock = new LocalSidValueBlock();
						_sidBlock.valueDec = parseInt(sid, 10);
						if (isNaN(_sidBlock.valueDec)) return true;

						if (this.value.length === 0) {
							_sidBlock.isFirstSid = true;
							flag = true;
						}

						this.value.push(_sidBlock);
					}
				} while (pos2 !== -1);

				return true;
			}
			//**********************************************************************************
			/**
    * Converts "LocalObjectIdentifierValueBlock" class to string
    * @returns {string}
    */

		}, {
			key: "toString",
			value: function toString() {
				var result = "";
				var isHexOnly = false;

				for (var i = 0; i < this.value.length; i++) {
					isHexOnly = this.value[i].isHexOnly;

					var sidStr = this.value[i].toString();

					if (i !== 0) result = result + ".";

					if (isHexOnly) {
						sidStr = "{" + sidStr + "}";

						if (this.value[i].isFirstSid) result = "2.{" + sidStr + " - 80}";else result = result + sidStr;
					} else result = result + sidStr;
				}

				return result;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalObjectIdentifierValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalObjectIdentifierValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.toString();
				object.sidArray = [];
				for (var i = 0; i < this.value.length; i++) {
					object.sidArray.push(this.value[i].toJSON());
				}return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "ObjectIdentifierValueBlock";
			}
		}]);

		return LocalObjectIdentifierValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var ObjectIdentifier = function (_BaseBlock9) {
		_inherits(ObjectIdentifier, _BaseBlock9);

		//**********************************************************************************
		/**
   * Constructor for "ObjectIdentifier" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function ObjectIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ObjectIdentifier);

			var _this27 = _possibleConstructorReturn(this, (ObjectIdentifier.__proto__ || Object.getPrototypeOf(ObjectIdentifier)).call(this, parameters, LocalObjectIdentifierValueBlock));

			_this27.idBlock.tagClass = 1; // UNIVERSAL
			_this27.idBlock.tagNumber = 6; // OBJECT IDENTIFIER
			return _this27;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(ObjectIdentifier, null, [{
			key: "blockName",
			value: function blockName() {
				return "ObjectIdentifier";
			}
			//**********************************************************************************

		}]);

		return ObjectIdentifier;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of all string's classes
	//**************************************************************************************


	var LocalUtf8StringValueBlock = function (_LocalHexBlock6) {
		_inherits(LocalUtf8StringValueBlock, _LocalHexBlock6);

		//**********************************************************************************
		//noinspection JSUnusedGlobalSymbols
		/**
   * Constructor for "LocalUtf8StringValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalUtf8StringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalUtf8StringValueBlock);

			var _this28 = _possibleConstructorReturn(this, (LocalUtf8StringValueBlock.__proto__ || Object.getPrototypeOf(LocalUtf8StringValueBlock)).call(this, parameters));

			_this28.isHexOnly = true;
			_this28.value = ""; // String representation of decoded ArrayBuffer
			return _this28;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalUtf8StringValueBlock, [{
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalUtf8StringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalUtf8StringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "Utf8StringValueBlock";
			}
		}]);

		return LocalUtf8StringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var Utf8String = function (_BaseBlock10) {
		_inherits(Utf8String, _BaseBlock10);

		//**********************************************************************************
		/**
   * Constructor for "Utf8String" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function Utf8String() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Utf8String);

			var _this29 = _possibleConstructorReturn(this, (Utf8String.__proto__ || Object.getPrototypeOf(Utf8String)).call(this, parameters, LocalUtf8StringValueBlock));

			if ("value" in parameters) _this29.fromString(parameters.value);

			_this29.idBlock.tagClass = 1; // UNIVERSAL
			_this29.idBlock.tagNumber = 12; // Utf8String
			return _this29;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Utf8String, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));

				try {
					//noinspection JSDeprecatedSymbols
					this.valueBlock.value = decodeURIComponent(escape(this.valueBlock.value));
				} catch (ex) {
					this.warnings.push("Error during \"decodeURIComponent\": " + ex + ", using raw string");
				}
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				//noinspection JSDeprecatedSymbols
				var str = unescape(encodeURIComponent(inputString));
				var strLen = str.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLen);
				var view = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLen; i++) {
					view[i] = str.charCodeAt(i);
				}this.valueBlock.value = inputString;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "Utf8String";
			}
		}]);

		return Utf8String;
	}(BaseBlock);
	//**************************************************************************************
	/**
  * @extends LocalBaseBlock
  * @extends LocalHexBlock
  */


	var LocalBmpStringValueBlock = function (_LocalHexBlock7) {
		_inherits(LocalBmpStringValueBlock, _LocalHexBlock7);

		//**********************************************************************************
		/**
   * Constructor for "LocalBmpStringValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalBmpStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalBmpStringValueBlock);

			var _this30 = _possibleConstructorReturn(this, (LocalBmpStringValueBlock.__proto__ || Object.getPrototypeOf(LocalBmpStringValueBlock)).call(this, parameters));

			_this30.isHexOnly = true;
			_this30.value = "";
			return _this30;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalBmpStringValueBlock, [{
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalBmpStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBmpStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BmpStringValueBlock";
			}
		}]);

		return LocalBmpStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var BmpString = function (_BaseBlock11) {
		_inherits(BmpString, _BaseBlock11);

		//**********************************************************************************
		/**
   * Constructor for "BmpString" class
   * @param {Object} [parameters={}]
   */
		function BmpString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, BmpString);

			var _this31 = _possibleConstructorReturn(this, (BmpString.__proto__ || Object.getPrototypeOf(BmpString)).call(this, parameters, LocalBmpStringValueBlock));

			if ("value" in parameters) _this31.fromString(parameters.value);

			_this31.idBlock.tagClass = 1; // UNIVERSAL
			_this31.idBlock.tagNumber = 30; // BmpString
			return _this31;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(BmpString, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				//noinspection JSCheckFunctionSignatures
				var copyBuffer = inputBuffer.slice(0);
				var valueView = new Uint8Array(copyBuffer);

				for (var i = 0; i < valueView.length; i = i + 2) {
					var temp = valueView[i];

					valueView[i] = valueView[i + 1];
					valueView[i + 1] = temp;
				}

				this.valueBlock.value = String.fromCharCode.apply(null, new Uint16Array(copyBuffer));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				var strLength = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLength * 2);
				var valueHexView = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLength; i++) {
					var codeBuf = utilToBase(inputString.charCodeAt(i), 8);
					var codeView = new Uint8Array(codeBuf);
					if (codeView.length > 2) continue;

					var dif = 2 - codeView.length;

					for (var j = codeView.length - 1; j >= 0; j--) {
						valueHexView[i * 2 + j + dif] = codeView[j];
					}
				}

				this.valueBlock.value = inputString;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BmpString";
			}
		}]);

		return BmpString;
	}(BaseBlock);
	//**************************************************************************************


	var LocalUniversalStringValueBlock = function (_LocalHexBlock8) {
		_inherits(LocalUniversalStringValueBlock, _LocalHexBlock8);

		//**********************************************************************************
		/**
   * Constructor for "LocalUniversalStringValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalUniversalStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalUniversalStringValueBlock);

			var _this32 = _possibleConstructorReturn(this, (LocalUniversalStringValueBlock.__proto__ || Object.getPrototypeOf(LocalUniversalStringValueBlock)).call(this, parameters));

			_this32.isHexOnly = true;
			_this32.value = "";
			return _this32;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalUniversalStringValueBlock, [{
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalUniversalStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalUniversalStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "UniversalStringValueBlock";
			}
		}]);

		return LocalUniversalStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var UniversalString = function (_BaseBlock12) {
		_inherits(UniversalString, _BaseBlock12);

		//**********************************************************************************
		/**
   * Constructor for "UniversalString" class
   * @param {Object} [parameters={}]
   */
		function UniversalString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, UniversalString);

			var _this33 = _possibleConstructorReturn(this, (UniversalString.__proto__ || Object.getPrototypeOf(UniversalString)).call(this, parameters, LocalUniversalStringValueBlock));

			if ("value" in parameters) _this33.fromString(parameters.value);

			_this33.idBlock.tagClass = 1; // UNIVERSAL
			_this33.idBlock.tagNumber = 28; // UniversalString
			return _this33;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(UniversalString, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				//noinspection JSCheckFunctionSignatures
				var copyBuffer = inputBuffer.slice(0);
				var valueView = new Uint8Array(copyBuffer);

				for (var i = 0; i < valueView.length; i = i + 4) {
					valueView[i] = valueView[i + 3];
					valueView[i + 1] = valueView[i + 2];
					valueView[i + 2] = 0x00;
					valueView[i + 3] = 0x00;
				}

				this.valueBlock.value = String.fromCharCode.apply(null, new Uint32Array(copyBuffer));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				var strLength = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLength * 4);
				var valueHexView = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLength; i++) {
					var codeBuf = utilToBase(inputString.charCodeAt(i), 8);
					var codeView = new Uint8Array(codeBuf);
					if (codeView.length > 4) continue;

					var dif = 4 - codeView.length;

					for (var j = codeView.length - 1; j >= 0; j--) {
						valueHexView[i * 4 + j + dif] = codeView[j];
					}
				}

				this.valueBlock.value = inputString;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "UniversalString";
			}
		}]);

		return UniversalString;
	}(BaseBlock);
	//**************************************************************************************


	var LocalSimpleStringValueBlock = function (_LocalHexBlock9) {
		_inherits(LocalSimpleStringValueBlock, _LocalHexBlock9);

		//**********************************************************************************
		/**
   * Constructor for "LocalSimpleStringValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalSimpleStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalSimpleStringValueBlock);

			var _this34 = _possibleConstructorReturn(this, (LocalSimpleStringValueBlock.__proto__ || Object.getPrototypeOf(LocalSimpleStringValueBlock)).call(this, parameters));

			_this34.value = "";
			_this34.isHexOnly = true;
			return _this34;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalSimpleStringValueBlock, [{
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalSimpleStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalSimpleStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "SimpleStringValueBlock";
			}
		}]);

		return LocalSimpleStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var LocalSimpleStringBlock = function (_BaseBlock13) {
		_inherits(LocalSimpleStringBlock, _BaseBlock13);

		//**********************************************************************************
		/**
   * Constructor for "LocalSimpleStringBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalSimpleStringBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalSimpleStringBlock);

			var _this35 = _possibleConstructorReturn(this, (LocalSimpleStringBlock.__proto__ || Object.getPrototypeOf(LocalSimpleStringBlock)).call(this, parameters, LocalSimpleStringValueBlock));

			if ("value" in parameters) _this35.fromString(parameters.value);
			return _this35;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalSimpleStringBlock, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				var strLen = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLen);
				var view = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLen; i++) {
					view[i] = inputString.charCodeAt(i);
				}this.valueBlock.value = inputString;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "SIMPLESTRING";
			}
		}]);

		return LocalSimpleStringBlock;
	}(BaseBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var NumericString = function (_LocalSimpleStringBlo) {
		_inherits(NumericString, _LocalSimpleStringBlo);

		//**********************************************************************************
		/**
   * Constructor for "NumericString" class
   * @param {Object} [parameters={}]
   */
		function NumericString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, NumericString);

			var _this36 = _possibleConstructorReturn(this, (NumericString.__proto__ || Object.getPrototypeOf(NumericString)).call(this, parameters));

			_this36.idBlock.tagClass = 1; // UNIVERSAL
			_this36.idBlock.tagNumber = 18; // NumericString
			return _this36;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(NumericString, null, [{
			key: "blockName",
			value: function blockName() {
				return "NumericString";
			}
			//**********************************************************************************

		}]);

		return NumericString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var PrintableString = function (_LocalSimpleStringBlo2) {
		_inherits(PrintableString, _LocalSimpleStringBlo2);

		//**********************************************************************************
		/**
   * Constructor for "PrintableString" class
   * @param {Object} [parameters={}]
   */
		function PrintableString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PrintableString);

			var _this37 = _possibleConstructorReturn(this, (PrintableString.__proto__ || Object.getPrototypeOf(PrintableString)).call(this, parameters));

			_this37.idBlock.tagClass = 1; // UNIVERSAL
			_this37.idBlock.tagNumber = 19; // PrintableString
			return _this37;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(PrintableString, null, [{
			key: "blockName",
			value: function blockName() {
				return "PrintableString";
			}
			//**********************************************************************************

		}]);

		return PrintableString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var TeletexString = function (_LocalSimpleStringBlo3) {
		_inherits(TeletexString, _LocalSimpleStringBlo3);

		//**********************************************************************************
		/**
   * Constructor for "TeletexString" class
   * @param {Object} [parameters={}]
   */
		function TeletexString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, TeletexString);

			var _this38 = _possibleConstructorReturn(this, (TeletexString.__proto__ || Object.getPrototypeOf(TeletexString)).call(this, parameters));

			_this38.idBlock.tagClass = 1; // UNIVERSAL
			_this38.idBlock.tagNumber = 20; // TeletexString
			return _this38;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(TeletexString, null, [{
			key: "blockName",
			value: function blockName() {
				return "TeletexString";
			}
			//**********************************************************************************

		}]);

		return TeletexString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var VideotexString = function (_LocalSimpleStringBlo4) {
		_inherits(VideotexString, _LocalSimpleStringBlo4);

		//**********************************************************************************
		/**
   * Constructor for "VideotexString" class
   * @param {Object} [parameters={}]
   */
		function VideotexString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, VideotexString);

			var _this39 = _possibleConstructorReturn(this, (VideotexString.__proto__ || Object.getPrototypeOf(VideotexString)).call(this, parameters));

			_this39.idBlock.tagClass = 1; // UNIVERSAL
			_this39.idBlock.tagNumber = 21; // VideotexString
			return _this39;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(VideotexString, null, [{
			key: "blockName",
			value: function blockName() {
				return "VideotexString";
			}
			//**********************************************************************************

		}]);

		return VideotexString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var IA5String = function (_LocalSimpleStringBlo5) {
		_inherits(IA5String, _LocalSimpleStringBlo5);

		//**********************************************************************************
		/**
   * Constructor for "IA5String" class
   * @param {Object} [parameters={}]
   */
		function IA5String() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, IA5String);

			var _this40 = _possibleConstructorReturn(this, (IA5String.__proto__ || Object.getPrototypeOf(IA5String)).call(this, parameters));

			_this40.idBlock.tagClass = 1; // UNIVERSAL
			_this40.idBlock.tagNumber = 22; // IA5String
			return _this40;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(IA5String, null, [{
			key: "blockName",
			value: function blockName() {
				return "IA5String";
			}
			//**********************************************************************************

		}]);

		return IA5String;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var GraphicString = function (_LocalSimpleStringBlo6) {
		_inherits(GraphicString, _LocalSimpleStringBlo6);

		//**********************************************************************************
		/**
   * Constructor for "GraphicString" class
   * @param {Object} [parameters={}]
   */
		function GraphicString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GraphicString);

			var _this41 = _possibleConstructorReturn(this, (GraphicString.__proto__ || Object.getPrototypeOf(GraphicString)).call(this, parameters));

			_this41.idBlock.tagClass = 1; // UNIVERSAL
			_this41.idBlock.tagNumber = 25; // GraphicString
			return _this41;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(GraphicString, null, [{
			key: "blockName",
			value: function blockName() {
				return "GraphicString";
			}
			//**********************************************************************************

		}]);

		return GraphicString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var VisibleString = function (_LocalSimpleStringBlo7) {
		_inherits(VisibleString, _LocalSimpleStringBlo7);

		//**********************************************************************************
		/**
   * Constructor for "VisibleString" class
   * @param {Object} [parameters={}]
   */
		function VisibleString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, VisibleString);

			var _this42 = _possibleConstructorReturn(this, (VisibleString.__proto__ || Object.getPrototypeOf(VisibleString)).call(this, parameters));

			_this42.idBlock.tagClass = 1; // UNIVERSAL
			_this42.idBlock.tagNumber = 26; // VisibleString
			return _this42;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(VisibleString, null, [{
			key: "blockName",
			value: function blockName() {
				return "VisibleString";
			}
			//**********************************************************************************

		}]);

		return VisibleString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var GeneralString = function (_LocalSimpleStringBlo8) {
		_inherits(GeneralString, _LocalSimpleStringBlo8);

		//**********************************************************************************
		/**
   * Constructor for "GeneralString" class
   * @param {Object} [parameters={}]
   */
		function GeneralString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralString);

			var _this43 = _possibleConstructorReturn(this, (GeneralString.__proto__ || Object.getPrototypeOf(GeneralString)).call(this, parameters));

			_this43.idBlock.tagClass = 1; // UNIVERSAL
			_this43.idBlock.tagNumber = 27; // GeneralString
			return _this43;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(GeneralString, null, [{
			key: "blockName",
			value: function blockName() {
				return "GeneralString";
			}
			//**********************************************************************************

		}]);

		return GeneralString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var CharacterString = function (_LocalSimpleStringBlo9) {
		_inherits(CharacterString, _LocalSimpleStringBlo9);

		//**********************************************************************************
		/**
   * Constructor for "CharacterString" class
   * @param {Object} [parameters={}]
   */
		function CharacterString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CharacterString);

			var _this44 = _possibleConstructorReturn(this, (CharacterString.__proto__ || Object.getPrototypeOf(CharacterString)).call(this, parameters));

			_this44.idBlock.tagClass = 1; // UNIVERSAL
			_this44.idBlock.tagNumber = 29; // CharacterString
			return _this44;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(CharacterString, null, [{
			key: "blockName",
			value: function blockName() {
				return "CharacterString";
			}
			//**********************************************************************************

		}]);

		return CharacterString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of all date and time classes
	//**************************************************************************************
	/**
  * @extends VisibleString
  */


	var UTCTime = function (_VisibleString) {
		_inherits(UTCTime, _VisibleString);

		//**********************************************************************************
		/**
   * Constructor for "UTCTime" class
   * @param {Object} [parameters={}]
   * @property {string} [value] String representatio of the date
   * @property {Date} [valueDate] JavaScript "Date" object
   */
		function UTCTime() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, UTCTime);

			var _this45 = _possibleConstructorReturn(this, (UTCTime.__proto__ || Object.getPrototypeOf(UTCTime)).call(this, parameters));

			_this45.year = 0;
			_this45.month = 0;
			_this45.day = 0;
			_this45.hour = 0;
			_this45.minute = 0;
			_this45.second = 0;

			//region Create UTCTime from ASN.1 UTC string value
			if ("value" in parameters) {
				_this45.fromString(parameters.value);

				_this45.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
				var view = new Uint8Array(_this45.valueBlock.valueHex);

				for (var i = 0; i < parameters.value.length; i++) {
					view[i] = parameters.value.charCodeAt(i);
				}
			}
			//endregion
			//region Create GeneralizedTime from JavaScript Date type
			if ("valueDate" in parameters) {
				_this45.fromDate(parameters.valueDate);
				_this45.valueBlock.valueHex = _this45.toBuffer();
			}
			//endregion

			_this45.idBlock.tagClass = 1; // UNIVERSAL
			_this45.idBlock.tagNumber = 23; // UTCTime
			return _this45;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(UTCTime, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
			}
			//**********************************************************************************
			/**
    * Function converting ASN.1 internal string into ArrayBuffer
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBuffer",
			value: function toBuffer() {
				var str = this.toString();

				var buffer = new ArrayBuffer(str.length);
				var view = new Uint8Array(buffer);

				for (var i = 0; i < str.length; i++) {
					view[i] = str.charCodeAt(i);
				}return buffer;
			}
			//**********************************************************************************
			/**
    * Function converting "Date" object into ASN.1 internal string
    * @param {!Date} inputDate JavaScript "Date" object
    */

		}, {
			key: "fromDate",
			value: function fromDate(inputDate) {
				this.year = inputDate.getUTCFullYear();
				this.month = inputDate.getUTCMonth() + 1;
				this.day = inputDate.getUTCDate();
				this.hour = inputDate.getUTCHours();
				this.minute = inputDate.getUTCMinutes();
				this.second = inputDate.getUTCSeconds();
			}
			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Function converting ASN.1 internal string into "Date" object
    * @returns {Date}
    */

		}, {
			key: "toDate",
			value: function toDate() {
				return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				//region Parse input string
				var parser = /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z/ig;
				var parserArray = parser.exec(inputString);
				if (parserArray === null) {
					this.error = "Wrong input string for convertion";
					return;
				}
				//endregion

				//region Store parsed values
				var year = parseInt(parserArray[1], 10);
				if (year >= 50) this.year = 1900 + year;else this.year = 2000 + year;

				this.month = parseInt(parserArray[2], 10);
				this.day = parseInt(parserArray[3], 10);
				this.hour = parseInt(parserArray[4], 10);
				this.minute = parseInt(parserArray[5], 10);
				this.second = parseInt(parserArray[6], 10);
				//endregion
			}
			//**********************************************************************************
			/**
    * Function converting ASN.1 internal class into JavaScript string
    * @returns {string}
    */

		}, {
			key: "toString",
			value: function toString() {
				var outputArray = new Array(7);

				outputArray[0] = padNumber(this.year < 2000 ? this.year - 1900 : this.year - 2000, 2);
				outputArray[1] = padNumber(this.month, 2);
				outputArray[2] = padNumber(this.day, 2);
				outputArray[3] = padNumber(this.hour, 2);
				outputArray[4] = padNumber(this.minute, 2);
				outputArray[5] = padNumber(this.second, 2);
				outputArray[6] = "Z";

				return outputArray.join("");
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(UTCTime.prototype.__proto__ || Object.getPrototypeOf(UTCTime.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.year = this.year;
				object.month = this.month;
				object.day = this.day;
				object.hour = this.hour;
				object.minute = this.minute;
				object.second = this.second;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "UTCTime";
			}
		}]);

		return UTCTime;
	}(VisibleString);
	//**************************************************************************************
	/**
  * @extends VisibleString
  */


	var GeneralizedTime = function (_VisibleString2) {
		_inherits(GeneralizedTime, _VisibleString2);

		//**********************************************************************************
		/**
   * Constructor for "GeneralizedTime" class
   * @param {Object} [parameters={}]
   * @property {string} [value] String representatio of the date
   * @property {Date} [valueDate] JavaScript "Date" object
   */
		function GeneralizedTime() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralizedTime);

			var _this46 = _possibleConstructorReturn(this, (GeneralizedTime.__proto__ || Object.getPrototypeOf(GeneralizedTime)).call(this, parameters));

			_this46.year = 0;
			_this46.month = 0;
			_this46.day = 0;
			_this46.hour = 0;
			_this46.minute = 0;
			_this46.second = 0;
			_this46.millisecond = 0;

			//region Create UTCTime from ASN.1 UTC string value
			if ("value" in parameters) {
				_this46.fromString(parameters.value);

				_this46.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
				var view = new Uint8Array(_this46.valueBlock.valueHex);

				for (var i = 0; i < parameters.value.length; i++) {
					view[i] = parameters.value.charCodeAt(i);
				}
			}
			//endregion
			//region Create GeneralizedTime from JavaScript Date type
			if ("valueDate" in parameters) {
				_this46.fromDate(parameters.valueDate);
				_this46.valueBlock.valueHex = _this46.toBuffer();
			}
			//endregion

			_this46.idBlock.tagClass = 1; // UNIVERSAL
			_this46.idBlock.tagNumber = 24; // GeneralizedTime
			return _this46;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(GeneralizedTime, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
			}
			//**********************************************************************************
			/**
    * Function converting ASN.1 internal string into ArrayBuffer
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBuffer",
			value: function toBuffer() {
				var str = this.toString();

				var buffer = new ArrayBuffer(str.length);
				var view = new Uint8Array(buffer);

				for (var i = 0; i < str.length; i++) {
					view[i] = str.charCodeAt(i);
				}return buffer;
			}
			//**********************************************************************************
			/**
    * Function converting "Date" object into ASN.1 internal string
    * @param {!Date} inputDate JavaScript "Date" object
    */

		}, {
			key: "fromDate",
			value: function fromDate(inputDate) {
				this.year = inputDate.getUTCFullYear();
				this.month = inputDate.getUTCMonth() + 1;
				this.day = inputDate.getUTCDate();
				this.hour = inputDate.getUTCHours();
				this.minute = inputDate.getUTCMinutes();
				this.second = inputDate.getUTCSeconds();
				this.millisecond = inputDate.getUTCMilliseconds();
			}
			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Function converting ASN.1 internal string into "Date" object
    * @returns {Date}
    */

		}, {
			key: "toDate",
			value: function toDate() {
				return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				//region Initial variables
				var isUTC = false;

				var timeString = "";
				var dateTimeString = "";
				var fractionPart = 0;

				var parser = void 0;

				var hourDifference = 0;
				var minuteDifference = 0;
				//endregion

				//region Convert as UTC time
				if (inputString[inputString.length - 1] === "Z") {
					timeString = inputString.substr(0, inputString.length - 1);

					isUTC = true;
				}
				//endregion
				//region Convert as local time
				else {
						//noinspection JSPrimitiveTypeWrapperUsage
						var number = new Number(inputString[inputString.length - 1]);

						if (isNaN(number.valueOf())) throw new Error("Wrong input string for convertion");

						timeString = inputString;
					}
				//endregion

				//region Check that we do not have a "+" and "-" symbols inside UTC time
				if (isUTC) {
					if (timeString.indexOf("+") !== -1) throw new Error("Wrong input string for convertion");

					if (timeString.indexOf("-") !== -1) throw new Error("Wrong input string for convertion");
				}
				//endregion
				//region Get "UTC time difference" in case of local time
				else {
						var multiplier = 1;
						var differencePosition = timeString.indexOf("+");
						var differenceString = "";

						if (differencePosition === -1) {
							differencePosition = timeString.indexOf("-");
							multiplier = -1;
						}

						if (differencePosition !== -1) {
							differenceString = timeString.substr(differencePosition + 1);
							timeString = timeString.substr(0, differencePosition);

							if (differenceString.length !== 2 && differenceString.length !== 4) throw new Error("Wrong input string for convertion");

							//noinspection JSPrimitiveTypeWrapperUsage
							var _number = new Number(differenceString.substr(0, 2));

							if (isNaN(_number.valueOf())) throw new Error("Wrong input string for convertion");

							hourDifference = multiplier * _number;

							if (differenceString.length === 4) {
								//noinspection JSPrimitiveTypeWrapperUsage
								_number = new Number(differenceString.substr(2, 2));

								if (isNaN(_number.valueOf())) throw new Error("Wrong input string for convertion");

								minuteDifference = multiplier * _number;
							}
						}
					}
				//endregion

				//region Get position of fraction point
				var fractionPointPosition = timeString.indexOf("."); // Check for "full stop" symbol
				if (fractionPointPosition === -1) fractionPointPosition = timeString.indexOf(","); // Check for "comma" symbol
				//endregion

				//region Get fraction part
				if (fractionPointPosition !== -1) {
					//noinspection JSPrimitiveTypeWrapperUsage
					var fractionPartCheck = new Number("0" + timeString.substr(fractionPointPosition));

					if (isNaN(fractionPartCheck.valueOf())) throw new Error("Wrong input string for convertion");

					fractionPart = fractionPartCheck.valueOf();

					dateTimeString = timeString.substr(0, fractionPointPosition);
				} else dateTimeString = timeString;
				//endregion

				//region Parse internal date
				switch (true) {
					case dateTimeString.length === 8:
						// "YYYYMMDD"
						parser = /(\d{4})(\d{2})(\d{2})/ig;
						if (fractionPointPosition !== -1) throw new Error("Wrong input string for convertion"); // Here we should not have a "fraction point"
						break;
					case dateTimeString.length === 10:
						// "YYYYMMDDHH"
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var fractionResult = 60 * fractionPart;
							this.minute = Math.floor(fractionResult);

							fractionResult = 60 * (fractionResult - this.minute);
							this.second = Math.floor(fractionResult);

							fractionResult = 1000 * (fractionResult - this.second);
							this.millisecond = Math.floor(fractionResult);
						}
						break;
					case dateTimeString.length === 12:
						// "YYYYMMDDHHMM"
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var _fractionResult = 60 * fractionPart;
							this.second = Math.floor(_fractionResult);

							_fractionResult = 1000 * (_fractionResult - this.second);
							this.millisecond = Math.floor(_fractionResult);
						}
						break;
					case dateTimeString.length === 14:
						// "YYYYMMDDHHMMSS"
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var _fractionResult2 = 1000 * fractionPart;
							this.millisecond = Math.floor(_fractionResult2);
						}
						break;
					default:
						throw new Error("Wrong input string for convertion");
				}
				//endregion

				//region Put parsed values at right places
				var parserArray = parser.exec(dateTimeString);
				if (parserArray === null) throw new Error("Wrong input string for convertion");

				for (var j = 1; j < parserArray.length; j++) {
					switch (j) {
						case 1:
							this.year = parseInt(parserArray[j], 10);
							break;
						case 2:
							this.month = parseInt(parserArray[j], 10);
							break;
						case 3:
							this.day = parseInt(parserArray[j], 10);
							break;
						case 4:
							this.hour = parseInt(parserArray[j], 10) + hourDifference;
							break;
						case 5:
							this.minute = parseInt(parserArray[j], 10) + minuteDifference;
							break;
						case 6:
							this.second = parseInt(parserArray[j], 10);
							break;
						default:
							throw new Error("Wrong input string for convertion");
					}
				}
				//endregion

				//region Get final date
				if (isUTC === false) {
					var tempDate = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);

					this.year = tempDate.getUTCFullYear();
					this.month = tempDate.getUTCMonth();
					this.day = tempDate.getUTCDay();
					this.hour = tempDate.getUTCHours();
					this.minute = tempDate.getUTCMinutes();
					this.second = tempDate.getUTCSeconds();
					this.millisecond = tempDate.getUTCMilliseconds();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Function converting ASN.1 internal class into JavaScript string
    * @returns {string}
    */

		}, {
			key: "toString",
			value: function toString() {
				var outputArray = [];

				outputArray.push(padNumber(this.year, 4));
				outputArray.push(padNumber(this.month, 2));
				outputArray.push(padNumber(this.day, 2));
				outputArray.push(padNumber(this.hour, 2));
				outputArray.push(padNumber(this.minute, 2));
				outputArray.push(padNumber(this.second, 2));
				if (this.millisecond !== 0) {
					outputArray.push(".");
					outputArray.push(padNumber(this.millisecond, 3));
				}
				outputArray.push("Z");

				return outputArray.join("");
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(GeneralizedTime.prototype.__proto__ || Object.getPrototypeOf(GeneralizedTime.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.year = this.year;
				object.month = this.month;
				object.day = this.day;
				object.hour = this.hour;
				object.minute = this.minute;
				object.second = this.second;
				object.millisecond = this.millisecond;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "GeneralizedTime";
			}
		}]);

		return GeneralizedTime;
	}(VisibleString);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var DATE = function (_Utf8String) {
		_inherits(DATE, _Utf8String);

		//**********************************************************************************
		/**
   * Constructor for "DATE" class
   * @param {Object} [parameters={}]
   */
		function DATE() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, DATE);

			var _this47 = _possibleConstructorReturn(this, (DATE.__proto__ || Object.getPrototypeOf(DATE)).call(this, parameters));

			_this47.idBlock.tagClass = 1; // UNIVERSAL
			_this47.idBlock.tagNumber = 31; // DATE
			return _this47;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(DATE, null, [{
			key: "blockName",
			value: function blockName() {
				return "DATE";
			}
			//**********************************************************************************

		}]);

		return DATE;
	}(Utf8String);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var TimeOfDay = function (_Utf8String2) {
		_inherits(TimeOfDay, _Utf8String2);

		//**********************************************************************************
		/**
   * Constructor for "TimeOfDay" class
   * @param {Object} [parameters={}]
   */
		function TimeOfDay() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, TimeOfDay);

			var _this48 = _possibleConstructorReturn(this, (TimeOfDay.__proto__ || Object.getPrototypeOf(TimeOfDay)).call(this, parameters));

			_this48.idBlock.tagClass = 1; // UNIVERSAL
			_this48.idBlock.tagNumber = 32; // TimeOfDay
			return _this48;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(TimeOfDay, null, [{
			key: "blockName",
			value: function blockName() {
				return "TimeOfDay";
			}
			//**********************************************************************************

		}]);

		return TimeOfDay;
	}(Utf8String);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var DateTime = function (_Utf8String3) {
		_inherits(DateTime, _Utf8String3);

		//**********************************************************************************
		/**
   * Constructor for "DateTime" class
   * @param {Object} [parameters={}]
   */
		function DateTime() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, DateTime);

			var _this49 = _possibleConstructorReturn(this, (DateTime.__proto__ || Object.getPrototypeOf(DateTime)).call(this, parameters));

			_this49.idBlock.tagClass = 1; // UNIVERSAL
			_this49.idBlock.tagNumber = 33; // DateTime
			return _this49;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(DateTime, null, [{
			key: "blockName",
			value: function blockName() {
				return "DateTime";
			}
			//**********************************************************************************

		}]);

		return DateTime;
	}(Utf8String);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var Duration = function (_Utf8String4) {
		_inherits(Duration, _Utf8String4);

		//**********************************************************************************
		/**
   * Constructor for "Duration" class
   * @param {Object} [parameters={}]
   */
		function Duration() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Duration);

			var _this50 = _possibleConstructorReturn(this, (Duration.__proto__ || Object.getPrototypeOf(Duration)).call(this, parameters));

			_this50.idBlock.tagClass = 1; // UNIVERSAL
			_this50.idBlock.tagNumber = 34; // Duration
			return _this50;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Duration, null, [{
			key: "blockName",
			value: function blockName() {
				return "Duration";
			}
			//**********************************************************************************

		}]);

		return Duration;
	}(Utf8String);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var TIME = function (_Utf8String5) {
		_inherits(TIME, _Utf8String5);

		//**********************************************************************************
		/**
   * Constructor for "Time" class
   * @param {Object} [parameters={}]
   */
		function TIME() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, TIME);

			var _this51 = _possibleConstructorReturn(this, (TIME.__proto__ || Object.getPrototypeOf(TIME)).call(this, parameters));

			_this51.idBlock.tagClass = 1; // UNIVERSAL
			_this51.idBlock.tagNumber = 14; // Time
			return _this51;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(TIME, null, [{
			key: "blockName",
			value: function blockName() {
				return "TIME";
			}
			//**********************************************************************************

		}]);

		return TIME;
	}(Utf8String);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of special ASN.1 schema type Choice
	//**************************************************************************************


	var Choice =
	//**********************************************************************************
	/**
  * Constructor for "Choice" class
  * @param {Object} [parameters={}]
  * @property {Array} [value] Array of ASN.1 types for make a choice from
  * @property {boolean} [optional]
  */
	function Choice() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Choice);

		this.value = getParametersValue(parameters, "value", []);
		this.optional = getParametersValue(parameters, "optional", false);
	}
	//**********************************************************************************
	;
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of special ASN.1 schema type Any
	//**************************************************************************************


	var Any =
	//**********************************************************************************
	/**
  * Constructor for "Any" class
  * @param {Object} [parameters={}]
  * @property {string} [name]
  * @property {boolean} [optional]
  */
	function Any() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Any);

		this.name = getParametersValue(parameters, "name", "");
		this.optional = getParametersValue(parameters, "optional", false);
	}
	//**********************************************************************************
	;
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of special ASN.1 schema type Repeated
	//**************************************************************************************


	var Repeated =
	//**********************************************************************************
	/**
  * Constructor for "Repeated" class
  * @param {Object} [parameters={}]
  * @property {string} [name]
  * @property {boolean} [optional]
  */
	function Repeated() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Repeated);

		this.name = getParametersValue(parameters, "name", "");
		this.optional = getParametersValue(parameters, "optional", false);
		this.value = getParametersValue(parameters, "value", new Any());
		this.local = getParametersValue(parameters, "local", false); // Could local or global array to store elements
	}
	//**********************************************************************************
	;
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of special ASN.1 schema type RawData
	//**************************************************************************************
	/**
  * @description Special class providing ability to have "toBER/fromBER" for raw ArrayBuffer
  */


	var RawData = function () {
		//**********************************************************************************
		/**
   * Constructor for "Repeated" class
   * @param {Object} [parameters={}]
   * @property {string} [name]
   * @property {boolean} [optional]
   */
		function RawData() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RawData);

			this.data = getParametersValue(parameters, "data", new ArrayBuffer(0));
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(RawData, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.data = inputBuffer.slice(inputOffset, inputLength);
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				return this.data;
			}
			//**********************************************************************************

		}]);

		return RawData;
	}();
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Major ASN.1 BER decoding function
	//**************************************************************************************
	/**
  * Internal library function for decoding ASN.1 BER
  * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
  * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
  * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
  * @returns {{offset: number, result: Object}}
  */


	function LocalFromBER(inputBuffer, inputOffset, inputLength) {
		var incomingOffset = inputOffset; // Need to store initial offset since "inputOffset" is changing in the function

		//region Local function changing a type for ASN.1 classes
		function localChangeType(inputObject, newType) {
			if (inputObject instanceof newType) return inputObject;

			var newObject = new newType();
			newObject.idBlock = inputObject.idBlock;
			newObject.lenBlock = inputObject.lenBlock;
			newObject.warnings = inputObject.warnings;
			//noinspection JSCheckFunctionSignatures
			newObject.valueBeforeDecode = inputObject.valueBeforeDecode.slice(0);

			return newObject;
		}
		//endregion

		//region Create a basic ASN.1 type since we need to return errors and warnings from the function
		var returnObject = new BaseBlock({}, Object);
		//endregion

		//region Basic check for parameters
		if (checkBufferParams(new LocalBaseBlock(), inputBuffer, inputOffset, inputLength) === false) {
			returnObject.error = "Wrong input parameters";
			return {
				offset: -1,
				result: returnObject
			};
		}
		//endregion

		//region Getting Uint8Array from ArrayBuffer
		var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
		//endregion

		//region Initial checks
		if (intBuffer.length === 0) {
			this.error = "Zero buffer length";
			return {
				offset: -1,
				result: returnObject
			};
		}
		//endregion

		//region Decode indentifcation block of ASN.1 BER structure
		var resultOffset = returnObject.idBlock.fromBER(inputBuffer, inputOffset, inputLength);
		returnObject.warnings.concat(returnObject.idBlock.warnings);
		if (resultOffset === -1) {
			returnObject.error = returnObject.idBlock.error;
			return {
				offset: -1,
				result: returnObject
			};
		}

		inputOffset = resultOffset;
		inputLength -= returnObject.idBlock.blockLength;
		//endregion

		//region Decode length block of ASN.1 BER structure
		resultOffset = returnObject.lenBlock.fromBER(inputBuffer, inputOffset, inputLength);
		returnObject.warnings.concat(returnObject.lenBlock.warnings);
		if (resultOffset === -1) {
			returnObject.error = returnObject.lenBlock.error;
			return {
				offset: -1,
				result: returnObject
			};
		}

		inputOffset = resultOffset;
		inputLength -= returnObject.lenBlock.blockLength;
		//endregion

		//region Check for usign indefinite length form in encoding for primitive types
		if (returnObject.idBlock.isConstructed === false && returnObject.lenBlock.isIndefiniteForm === true) {
			returnObject.error = "Indefinite length form used for primitive encoding form";
			return {
				offset: -1,
				result: returnObject
			};
		}
		//endregion

		//region Switch ASN.1 block type
		var newASN1Type = BaseBlock;

		switch (returnObject.idBlock.tagClass) {
			//region UNIVERSAL
			case 1:
				//region Check for reserved tag numbers
				if (returnObject.idBlock.tagNumber >= 37 && returnObject.idBlock.isHexOnly === false) {
					returnObject.error = "UNIVERSAL 37 and upper tags are reserved by ASN.1 standard";
					return {
						offset: -1,
						result: returnObject
					};
				}
				//endregion

				switch (returnObject.idBlock.tagNumber) {
					//region EndOfContent type
					case 0:
						//region Check for EndOfContent type
						if (returnObject.idBlock.isConstructed === true && returnObject.lenBlock.length > 0) {
							returnObject.error = "Type [UNIVERSAL 0] is reserved";
							return {
								offset: -1,
								result: returnObject
							};
						}
						//endregion

						newASN1Type = EndOfContent;

						break;
					//endregion
					//region Boolean type
					case 1:
						newASN1Type = Boolean;
						break;
					//endregion
					//region Integer type
					case 2:
						newASN1Type = Integer;
						break;
					//endregion
					//region BitString type
					case 3:
						newASN1Type = BitString;
						break;
					//endregion
					//region OctetString type
					case 4:
						newASN1Type = OctetString;
						break;
					//endregion
					//region Null type
					case 5:
						newASN1Type = Null;
						break;
					//endregion
					//region OBJECT IDENTIFIER type
					case 6:
						newASN1Type = ObjectIdentifier;
						break;
					//endregion
					//region Enumerated type
					case 10:
						newASN1Type = Enumerated;
						break;
					//endregion
					//region Utf8String type
					case 12:
						newASN1Type = Utf8String;
						break;
					//endregion
					//region Time type
					case 14:
						newASN1Type = TIME;
						break;
					//endregion
					//region ASN.1 reserved type
					case 15:
						returnObject.error = "[UNIVERSAL 15] is reserved by ASN.1 standard";
						return {
							offset: -1,
							result: returnObject
						};
					//endregion
					//region Sequence type
					case 16:
						newASN1Type = Sequence;
						break;
					//endregion
					//region Set type
					case 17:
						newASN1Type = Set;
						break;
					//endregion
					//region NumericString type
					case 18:
						newASN1Type = NumericString;
						break;
					//endregion
					//region PrintableString type
					case 19:
						newASN1Type = PrintableString;
						break;
					//endregion
					//region TeletexString type
					case 20:
						newASN1Type = TeletexString;
						break;
					//endregion
					//region VideotexString type
					case 21:
						newASN1Type = VideotexString;
						break;
					//endregion
					//region IA5String type
					case 22:
						newASN1Type = IA5String;
						break;
					//endregion
					//region UTCTime type
					case 23:
						newASN1Type = UTCTime;
						break;
					//endregion
					//region GeneralizedTime type
					case 24:
						newASN1Type = GeneralizedTime;
						break;
					//endregion
					//region GraphicString type
					case 25:
						newASN1Type = GraphicString;
						break;
					//endregion
					//region VisibleString type
					case 26:
						newASN1Type = VisibleString;
						break;
					//endregion
					//region GeneralString type
					case 27:
						newASN1Type = GeneralString;
						break;
					//endregion
					//region UniversalString type
					case 28:
						newASN1Type = UniversalString;
						break;
					//endregion
					//region CharacterString type
					case 29:
						newASN1Type = CharacterString;
						break;
					//endregion
					//region BmpString type
					case 30:
						newASN1Type = BmpString;
						break;
					//endregion
					//region DATE type
					case 31:
						newASN1Type = DATE;
						break;
					//endregion
					//region TimeOfDay type
					case 32:
						newASN1Type = TimeOfDay;
						break;
					//endregion
					//region Date-Time type
					case 33:
						newASN1Type = DateTime;
						break;
					//endregion
					//region Duration type
					case 34:
						newASN1Type = Duration;
						break;
					//endregion
					//region default
					default:
						{
							var newObject = void 0;

							if (returnObject.idBlock.isConstructed === true) newObject = new Constructed();else newObject = new Primitive();

							newObject.idBlock = returnObject.idBlock;
							newObject.lenBlock = returnObject.lenBlock;
							newObject.warnings = returnObject.warnings;

							returnObject = newObject;

							resultOffset = returnObject.fromBER(inputBuffer, inputOffset, inputLength);
						}
					//endregion
				}
				break;
			//endregion
			//region All other tag classes
			case 2: // APPLICATION
			case 3: // CONTEXT-SPECIFIC
			case 4: // PRIVATE
			default:
				{
					if (returnObject.idBlock.isConstructed === true) newASN1Type = Constructed;else newASN1Type = Primitive;
				}
			//endregion
		}
		//endregion

		//region Change type and perform BER decoding
		returnObject = localChangeType(returnObject, newASN1Type);
		resultOffset = returnObject.fromBER(inputBuffer, inputOffset, returnObject.lenBlock.isIndefiniteForm === true ? inputLength : returnObject.lenBlock.length);
		//endregion

		//region Coping incoming buffer for entire ASN.1 block
		returnObject.valueBeforeDecode = inputBuffer.slice(incomingOffset, incomingOffset + returnObject.blockLength);
		//endregion

		return {
			offset: resultOffset,
			result: returnObject
		};
	}
	//**************************************************************************************
	/**
  * Major function for decoding ASN.1 BER array into internal library structuries
  * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array of bytes
  */
	function fromBER(inputBuffer) {
		if (inputBuffer.byteLength === 0) {
			var result = new BaseBlock({}, Object);
			result.error = "Input buffer has zero length";

			return {
				offset: -1,
				result: result
			};
		}

		return LocalFromBER(inputBuffer, 0, inputBuffer.byteLength);
	}
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Major scheme verification function
	//**************************************************************************************
	/**
  * Compare of two ASN.1 object trees
  * @param {!Object} root Root of input ASN.1 object tree
  * @param {!Object} inputData Input ASN.1 object tree
  * @param {!Object} inputSchema Input ASN.1 schema to compare with
  * @return {{verified: boolean}|{verified:boolean, result: Object}}
  */
	function compareSchema(root, inputData, inputSchema) {
		//region Special case for Choice schema element type
		if (inputSchema instanceof Choice) {
			var choiceResult = false;

			for (var j = 0; j < inputSchema.value.length; j++) {
				var result = compareSchema(root, inputData, inputSchema.value[j]);
				if (result.verified === true) {
					return {
						verified: true,
						result: root
					};
				}
			}

			if (choiceResult === false) {
				var _result = {
					verified: false,
					result: {
						error: "Wrong values for Choice type"
					}
				};

				if (inputSchema.hasOwnProperty("name")) _result.name = inputSchema.name;

				return _result;
			}
		}
		//endregion

		//region Special case for Any schema element type
		if (inputSchema instanceof Any) {
			//region Add named component of ASN.1 schema
			if (inputSchema.hasOwnProperty("name")) root[inputSchema.name] = inputData;
			//endregion

			return {
				verified: true,
				result: root
			};
		}
		//endregion

		//region Initial check
		if (root instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong root object" }
			};
		}

		if (inputData instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 data" }
			};
		}

		if (inputSchema instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if ("idBlock" in inputSchema === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}
		//endregion

		//region Comparing idBlock properties in ASN.1 data and ASN.1 schema
		//region Encode and decode ASN.1 schema idBlock
		/// <remarks>This encoding/decoding is neccessary because could be an errors in schema definition</remarks>
		if ("fromBER" in inputSchema.idBlock === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if ("toBER" in inputSchema.idBlock === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		var encodedId = inputSchema.idBlock.toBER(false);
		if (encodedId.byteLength === 0) {
			return {
				verified: false,
				result: { error: "Error encoding idBlock for ASN.1 schema" }
			};
		}

		var decodedOffset = inputSchema.idBlock.fromBER(encodedId, 0, encodedId.byteLength);
		if (decodedOffset === -1) {
			return {
				verified: false,
				result: { error: "Error decoding idBlock for ASN.1 schema" }
			};
		}
		//endregion

		//region tagClass
		if (inputSchema.idBlock.hasOwnProperty("tagClass") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.tagClass !== inputData.idBlock.tagClass) {
			return {
				verified: false,
				result: root
			};
		}
		//endregion
		//region tagNumber
		if (inputSchema.idBlock.hasOwnProperty("tagNumber") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.tagNumber !== inputData.idBlock.tagNumber) {
			return {
				verified: false,
				result: root
			};
		}
		//endregion
		//region isConstructed
		if (inputSchema.idBlock.hasOwnProperty("isConstructed") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.isConstructed !== inputData.idBlock.isConstructed) {
			return {
				verified: false,
				result: root
			};
		}
		//endregion
		//region isHexOnly
		if ("isHexOnly" in inputSchema.idBlock === false) // Since 'isHexOnly' is an inhirited property
			{
				return {
					verified: false,
					result: { error: "Wrong ASN.1 schema" }
				};
			}

		if (inputSchema.idBlock.isHexOnly !== inputData.idBlock.isHexOnly) {
			return {
				verified: false,
				result: root
			};
		}
		//endregion
		//region valueHex
		if (inputSchema.idBlock.isHexOnly === true) {
			if ("valueHex" in inputSchema.idBlock === false) // Since 'valueHex' is an inhirited property
				{
					return {
						verified: false,
						result: { error: "Wrong ASN.1 schema" }
					};
				}

			var schemaView = new Uint8Array(inputSchema.idBlock.valueHex);
			var asn1View = new Uint8Array(inputData.idBlock.valueHex);

			if (schemaView.length !== asn1View.length) {
				return {
					verified: false,
					result: root
				};
			}

			for (var i = 0; i < schemaView.length; i++) {
				if (schemaView[i] !== asn1View[1]) {
					return {
						verified: false,
						result: root
					};
				}
			}
		}
		//endregion
		//endregion

		//region Add named component of ASN.1 schema
		if (inputSchema.hasOwnProperty("name")) {
			inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
			if (inputSchema.name !== "") root[inputSchema.name] = inputData;
		}
		//endregion

		//region Getting next ASN.1 block for comparition
		if (inputSchema.idBlock.isConstructed === true) {
			var admission = 0;
			var _result2 = { verified: false };

			var maxLength = inputSchema.valueBlock.value.length;

			if (maxLength > 0) {
				if (inputSchema.valueBlock.value[0] instanceof Repeated) maxLength = inputData.valueBlock.value.length;
			}

			//region Special case when constructive value has no elements
			if (maxLength === 0) {
				return {
					verified: true,
					result: root
				};
			}
			//endregion

			//region Special case when "inputData" has no values and "inputSchema" has all optional values
			if (inputData.valueBlock.value.length === 0 && inputSchema.valueBlock.value.length !== 0) {
				var _optional = true;

				for (var _i9 = 0; _i9 < inputSchema.valueBlock.value.length; _i9++) {
					_optional = _optional && (inputSchema.valueBlock.value[_i9].optional || false);
				}if (_optional === true) {
					return {
						verified: true,
						result: root
					};
				}

				//region Delete early added name of block
				if (inputSchema.hasOwnProperty("name")) {
					inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
					if (inputSchema.name !== "") delete root[inputSchema.name];
				}
				//endregion

				root.error = "Inconsistent object length";

				return {
					verified: false,
					result: root
				};
			}
			//endregion

			for (var _i10 = 0; _i10 < maxLength; _i10++) {
				//region Special case when there is an "optional" element of ASN.1 schema at the end
				if (_i10 - admission >= inputData.valueBlock.value.length) {
					if (inputSchema.valueBlock.value[_i10].optional === false) {
						var _result3 = {
							verified: false,
							result: root
						};

						root.error = "Inconsistent length between ASN.1 data and schema";

						//region Delete early added name of block
						if (inputSchema.hasOwnProperty("name")) {
							inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
							if (inputSchema.name !== "") {
								delete root[inputSchema.name];
								_result3.name = inputSchema.name;
							}
						}
						//endregion

						return _result3;
					}
				}
				//endregion
				else {
						//region Special case for Repeated type of ASN.1 schema element
						if (inputSchema.valueBlock.value[0] instanceof Repeated) {
							_result2 = compareSchema(root, inputData.valueBlock.value[_i10], inputSchema.valueBlock.value[0].value);
							if (_result2.verified === false) {
								if (inputSchema.valueBlock.value[0].optional === true) admission++;else {
									//region Delete early added name of block
									if (inputSchema.hasOwnProperty("name")) {
										inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
										if (inputSchema.name !== "") delete root[inputSchema.name];
									}
									//endregion

									return _result2;
								}
							}

							if ("name" in inputSchema.valueBlock.value[0] && inputSchema.valueBlock.value[0].name.length > 0) {
								var arrayRoot = {};

								if ("local" in inputSchema.valueBlock.value[0] && inputSchema.valueBlock.value[0].local === true) arrayRoot = inputData;else arrayRoot = root;

								if (typeof arrayRoot[inputSchema.valueBlock.value[0].name] === "undefined") arrayRoot[inputSchema.valueBlock.value[0].name] = [];

								arrayRoot[inputSchema.valueBlock.value[0].name].push(inputData.valueBlock.value[_i10]);
							}
						}
						//endregion
						else {
								_result2 = compareSchema(root, inputData.valueBlock.value[_i10 - admission], inputSchema.valueBlock.value[_i10]);
								if (_result2.verified === false) {
									if (inputSchema.valueBlock.value[_i10].optional === true) admission++;else {
										//region Delete early added name of block
										if (inputSchema.hasOwnProperty("name")) {
											inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
											if (inputSchema.name !== "") delete root[inputSchema.name];
										}
										//endregion

										return _result2;
									}
								}
							}
					}
			}

			if (_result2.verified === false) // The situation may take place if last element is "optional" and verification failed
				{
					var _result4 = {
						verified: false,
						result: root
					};

					//region Delete early added name of block
					if (inputSchema.hasOwnProperty("name")) {
						inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
						if (inputSchema.name !== "") {
							delete root[inputSchema.name];
							_result4.name = inputSchema.name;
						}
					}
					//endregion

					return _result4;
				}

			return {
				verified: true,
				result: root
			};
		}
		//endregion
		//region Ability to parse internal value for primitive-encoded value (value of OctetString, for example)
		if ("primitiveSchema" in inputSchema && "valueHex" in inputData.valueBlock) {
			//region Decoding of raw ASN.1 data
			var asn1 = fromBER(inputData.valueBlock.valueHex);
			if (asn1.offset === -1) {
				var _result5 = {
					verified: false,
					result: asn1.result
				};

				//region Delete early added name of block
				if (inputSchema.hasOwnProperty("name")) {
					inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
					if (inputSchema.name !== "") {
						delete root[inputSchema.name];
						_result5.name = inputSchema.name;
					}
				}
				//endregion

				return _result5;
			}
			//endregion

			return compareSchema(root, asn1.result, inputSchema.primitiveSchema);
		}

		return {
			verified: true,
			result: root
		};
		//endregion
	}

	var INDETERMINATE = Symbol("INDETERMINATE");
	var PASSED = Symbol("PASSED");
	var FAILED = Symbol("FAILED");
	var SIG_CRYPTO_FAILURE = Symbol("SIG_CRYPTO_FAILURE");
	var NO_SIGNING_CERTIFICATE_FOUND = Symbol("NO_SIGNING_CERTIFICATE_FOUND");
	var SIGNED_DATA_NOT_FOUND = Symbol("SIGNED_DATA_NOT_FOUND");

	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var AlgorithmIdentifier = function () {
		//**********************************************************************************
		/**
   * Constructor for AlgorithmIdentifier class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {string} [algorithmId] ObjectIdentifier for algorithm (string representation)
   */
		function AlgorithmIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AlgorithmIdentifier);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description ObjectIdentifier for algorithm (string representation)
    */
			this.algorithmId = getParametersValue(parameters, "algorithmId", AlgorithmIdentifier.defaultValues("algorithmId"));

			if ("algorithmParams" in parameters)
				/**
     * @type {Object}
     * @description Any algorithm parameters
     */
				this.algorithmParams = getParametersValue(parameters, "algorithmParams", AlgorithmIdentifier.defaultValues("algorithmParams"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AlgorithmIdentifier, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				/**
     * @type {{verified: boolean}|{verified: boolean, result: {algorithm: Object, params: Object}}}
     */
				var asn1 = compareSchema(schema, schema, AlgorithmIdentifier.schema({
					names: {
						algorithmIdentifier: "algorithm",
						algorithmParams: "params"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AlgorithmIdentifier");
				//endregion

				//region Get internal properties from parsed schema
				this.algorithmId = asn1.result.algorithm.valueBlock.toString();
				if ("params" in asn1.result) this.algorithmParams = asn1.result.params;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.algorithmId }));
				if ("algorithmParams" in this && this.algorithmParams instanceof Any === false) outputArray.push(this.algorithmParams);
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					algorithmId: this.algorithmId
				};

				if ("algorithmParams" in this && this.algorithmParams instanceof Any === false) object.algorithmParams = this.algorithmParams.toJSON();

				return object;
			}
			//**********************************************************************************
			/**
    * Check that two "AlgorithmIdentifiers" are equal
    * @param {AlgorithmIdentifier} algorithmIdentifier
    * @returns {boolean}
    */

		}, {
			key: "isEqual",
			value: function isEqual(algorithmIdentifier) {
				//region Check input type
				if (algorithmIdentifier instanceof AlgorithmIdentifier === false) return false;
				//endregion

				//region Check "algorithm_id"
				if (this.algorithmId !== algorithmIdentifier.algorithmId) return false;
				//endregion

				//region Check "algorithm_params"
				if ("algorithmParams" in this) {
					if ("algorithmParams" in algorithmIdentifier) return JSON.stringify(this.algorithmParams) === JSON.stringify(algorithmIdentifier.algorithmParams);

					return false;
				}

				if ("algorithmParams" in algorithmIdentifier) return false;
				//endregion

				return true;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "algorithmId":
						return "";
					case "algorithmParams":
						return new Any();
					default:
						throw new Error("Invalid member name for AlgorithmIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "algorithmId":
						return memberValue === "";
					case "algorithmParams":
						return memberValue instanceof Any;
					default:
						throw new Error("Invalid member name for AlgorithmIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//AlgorithmIdentifier  ::=  Sequence  {
				//    algorithm               OBJECT IDENTIFIER,
				//    parameters              ANY DEFINED BY algorithm OPTIONAL  }

				/**
     * @type {Object}
     * @property {string} algorithmIdentifier ObjectIdentifier for the algorithm
     * @property {string} algorithmParams Any algorithm parameters
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					optional: names.optional || false,
					value: [new ObjectIdentifier({ name: names.algorithmIdentifier || "" }), new Any({ name: names.algorithmParams || "", optional: true })]
				});
			}
		}]);

		return AlgorithmIdentifier;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC4055
  */


	var RSASSAPSSParams = function () {
		//**********************************************************************************
		/**
   * Constructor for RSASSAPSSParams class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RSASSAPSSParams() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RSASSAPSSParams);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description Algorithms of hashing (DEFAULT sha1)
    */
			this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", RSASSAPSSParams.defaultValues("hashAlgorithm"));
			/**
    * @type {AlgorithmIdentifier}
    * @description Algorithm of "mask generaion function (MGF)" (DEFAULT mgf1SHA1)
    */
			this.maskGenAlgorithm = getParametersValue(parameters, "maskGenAlgorithm", RSASSAPSSParams.defaultValues("maskGenAlgorithm"));
			/**
    * @type {number}
    * @description Salt length (DEFAULT 20)
    */
			this.saltLength = getParametersValue(parameters, "saltLength", RSASSAPSSParams.defaultValues("saltLength"));
			/**
    * @type {number}
    * @description (DEFAULT 1)
    */
			this.trailerField = getParametersValue(parameters, "trailerField", RSASSAPSSParams.defaultValues("trailerField"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RSASSAPSSParams, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RSASSAPSSParams.schema({
					names: {
						hashAlgorithm: {
							names: {
								blockName: "hashAlgorithm"
							}
						},
						maskGenAlgorithm: {
							names: {
								blockName: "maskGenAlgorithm"
							}
						},
						saltLength: "saltLength",
						trailerField: "trailerField"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSASSA_PSS_params");
				//endregion

				//region Get internal properties from parsed schema
				if ("hashAlgorithm" in asn1.result) this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });

				if ("maskGenAlgorithm" in asn1.result) this.maskGenAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.maskGenAlgorithm });

				if ("saltLength" in asn1.result) this.saltLength = asn1.result.saltLength.valueBlock.valueDec;

				if ("trailerField" in asn1.result) this.trailerField = asn1.result.trailerField.valueBlock.valueDec;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if (!this.hashAlgorithm.isEqual(RSASSAPSSParams.defaultValues("hashAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.hashAlgorithm.toSchema()]
					}));
				}

				if (!this.maskGenAlgorithm.isEqual(RSASSAPSSParams.defaultValues("maskGenAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [this.maskGenAlgorithm.toSchema()]
					}));
				}

				if (this.saltLength !== RSASSAPSSParams.defaultValues("saltLength")) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: [new Integer({ value: this.saltLength })]
					}));
				}

				if (this.trailerField !== RSASSAPSSParams.defaultValues("trailerField")) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						value: [new Integer({ value: this.trailerField })]
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if (!this.hashAlgorithm.isEqual(RSASSAPSSParams.defaultValues("hashAlgorithm"))) object.hashAlgorithm = this.hashAlgorithm.toJSON();

				if (!this.maskGenAlgorithm.isEqual(RSASSAPSSParams.defaultValues("maskGenAlgorithm"))) object.maskGenAlgorithm = this.maskGenAlgorithm.toJSON();

				if (this.saltLength !== RSASSAPSSParams.defaultValues("saltLength")) object.saltLength = this.saltLength;

				if (this.trailerField !== RSASSAPSSParams.defaultValues("trailerField")) object.trailerField = this.trailerField;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "hashAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.3.14.3.2.26", // SHA-1
							algorithmParams: new Null()
						});
					case "maskGenAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.8", // MGF1
							algorithmParams: new AlgorithmIdentifier({
								algorithmId: "1.3.14.3.2.26", // SHA-1
								algorithmParams: new Null()
							}).toSchema()
						});
					case "saltLength":
						return 20;
					case "trailerField":
						return 1;
					default:
						throw new Error("Invalid member name for RSASSAPSSParams class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RSASSA-PSS-params  ::=  Sequence  {
				//    hashAlgorithm      [0] HashAlgorithm DEFAULT sha1Identifier,
				//    maskGenAlgorithm   [1] MaskGenAlgorithm DEFAULT mgf1SHA1Identifier,
				//    saltLength         [2] Integer DEFAULT 20,
				//    trailerField       [3] Integer DEFAULT 1  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [hashAlgorithm]
     * @property {string} [maskGenAlgorithm]
     * @property {string} [saltLength]
     * @property {string} [trailerField]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						optional: true,
						value: [AlgorithmIdentifier.schema(names.hashAlgorithm || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						optional: true,
						value: [AlgorithmIdentifier.schema(names.maskGenAlgorithm || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						optional: true,
						value: [new Integer({ name: names.saltLength || "" })]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						optional: true,
						value: [new Integer({ name: names.trailerField || "" })]
					})]
				});
			}
		}]);

		return RSASSAPSSParams;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5480
  */


	var ECPublicKey = function () {
		//**********************************************************************************
		/**
   * Constructor for ECCPublicKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ECPublicKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ECPublicKey);

			//region Internal properties of the object
			/**
    * @type {ArrayBuffer}
    * @description type
    */
			this.x = getParametersValue(parameters, "x", ECPublicKey.defaultValues("x"));
			/**
    * @type {ArrayBuffer}
    * @description values
    */
			this.y = getParametersValue(parameters, "y", ECPublicKey.defaultValues("y"));
			/**
    * @type {string}
    * @description namedCurve
    */
			this.namedCurve = getParametersValue(parameters, "namedCurve", ECPublicKey.defaultValues("namedCurve"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ECPublicKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert ArrayBuffer into current class
    * @param {!ArrayBuffer} schema Special case: schema is an ArrayBuffer
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				if (schema instanceof ArrayBuffer === false) throw new Error("Object's schema was not verified against input data for ECPublicKey");

				var view = new Uint8Array(schema);
				if (view[0] !== 0x04) throw new Error("Object's schema was not verified against input data for ECPublicKey");
				//endregion

				//region Get internal properties from parsed schema
				var coordinateLength = void 0;

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						// P-256
						coordinateLength = 32;
						break;
					case "1.3.132.0.34":
						// P-384
						coordinateLength = 48;
						break;
					case "1.3.132.0.35":
						// P-521
						coordinateLength = 66;
						break;
					default:
						throw new Error("Incorrect curve OID: " + this.namedCurve);
				}

				if (schema.byteLength !== coordinateLength * 2 + 1) throw new Error("Object's schema was not verified against input data for ECPublicKey");

				this.x = schema.slice(1, coordinateLength + 1);
				this.y = schema.slice(1 + coordinateLength, coordinateLength * 2 + 1);
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				return new RawData({ data: utilConcatBuf(new Uint8Array([0x04]).buffer, this.x, this.y)
				});
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var crvName = "";

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						// P-256
						crvName = "P-256";
						break;
					case "1.3.132.0.34":
						// P-384
						crvName = "P-384";
						break;
					case "1.3.132.0.35":
						// P-521
						crvName = "P-521";
						break;
					default:
				}

				return {
					crv: crvName,
					x: toBase64(arrayBufferToString(this.x), true, true, true),
					y: toBase64(arrayBufferToString(this.y), true, true, true)
				};
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				var coodinateLength = 0;

				if ("crv" in json) {
					switch (json.crv.toUpperCase()) {
						case "P-256":
							this.namedCurve = "1.2.840.10045.3.1.7";
							coodinateLength = 32;
							break;
						case "P-384":
							this.namedCurve = "1.3.132.0.34";
							coodinateLength = 48;
							break;
						case "P-521":
							this.namedCurve = "1.3.132.0.35";
							coodinateLength = 66;
							break;
						default:
					}
				} else throw new Error("Absent mandatory parameter \"crv\"");

				if ("x" in json) this.x = stringToArrayBuffer(fromBase64(json.x, true)).slice(0, coodinateLength);else throw new Error("Absent mandatory parameter \"x\"");

				if ("y" in json) this.y = stringToArrayBuffer(fromBase64(json.y, true)).slice(0, coodinateLength);else throw new Error("Absent mandatory parameter \"y\"");
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "x":
					case "y":
						return new ArrayBuffer(0);
					case "namedCurve":
						return "";
					default:
						throw new Error("Invalid member name for ECCPublicKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "x":
					case "y":
						return isEqualBuffer(memberValue, ECPublicKey.defaultValues(memberName));
					case "namedCurve":
						return memberValue === "";
					default:
						throw new Error("Invalid member name for ECCPublicKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				return new RawData();
			}
		}]);

		return ECPublicKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3447
  */


	var RSAPublicKey = function () {
		//**********************************************************************************
		/**
   * Constructor for RSAPublicKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {Integer} [modulus]
   * @property {Integer} [publicExponent]
   */
		function RSAPublicKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RSAPublicKey);

			//region Internal properties of the object
			/**
    * @type {Integer}
    * @description Modulus part of RSA public key
    */
			this.modulus = getParametersValue(parameters, "modulus", RSAPublicKey.defaultValues("modulus"));
			/**
    * @type {Integer}
    * @description Public exponent of RSA public key
    */
			this.publicExponent = getParametersValue(parameters, "publicExponent", RSAPublicKey.defaultValues("publicExponent"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RSAPublicKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RSAPublicKey.schema({
					names: {
						modulus: "modulus",
						publicExponent: "publicExponent"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSAPublicKey");
				//endregion

				//region Get internal properties from parsed schema
				this.modulus = asn1.result.modulus.convertFromDER(256);
				this.publicExponent = asn1.result.publicExponent;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.modulus.convertToDER(), this.publicExponent]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					n: toBase64(arrayBufferToString(this.modulus.valueBlock.valueHex), true, true, true),
					e: toBase64(arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true, true)
				};
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("n" in json) this.modulus = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.n, true)).slice(0, 256) });else throw new Error("Absent mandatory parameter \"n\"");

				if ("e" in json) this.publicExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.e, true)).slice(0, 3) });else throw new Error("Absent mandatory parameter \"e\"");
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "modulus":
						return new Integer();
					case "publicExponent":
						return new Integer();
					default:
						throw new Error("Invalid member name for RSAPublicKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RSAPublicKey ::= Sequence {
				//    modulus           Integer,  -- n
				//    publicExponent    Integer   -- e
				//}

				/**
     * @type {Object}
     * @property {string} utcTimeName Name for "utcTimeName" choice
     * @property {string} generalTimeName Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.modulus || "" }), new Integer({ name: names.publicExponent || "" })]
				});
			}
		}]);

		return RSAPublicKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PublicKeyInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for PublicKeyInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PublicKeyInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PublicKeyInfo);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description Algorithm identifier
    */
			this.algorithm = getParametersValue(parameters, "algorithm", PublicKeyInfo.defaultValues("algorithm"));
			/**
    * @type {BitString}
    * @description Subject public key value
    */
			this.subjectPublicKey = getParametersValue(parameters, "subjectPublicKey", PublicKeyInfo.defaultValues("subjectPublicKey"));

			if ("parsedKey" in parameters)
				/**
     * @type {ECPublicKey|RSAPublicKey}
     * @description Parsed public key value
     */
				this.parsedKey = getParametersValue(parameters, "parsedKey", PublicKeyInfo.defaultValues("parsedKey"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PublicKeyInfo, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PublicKeyInfo.schema({
					names: {
						algorithm: {
							names: {
								blockName: "algorithm"
							}
						},
						subjectPublicKey: "subjectPublicKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PUBLIC_KEY_INFO");
				//endregion

				//region Get internal properties from parsed schema
				this.algorithm = new AlgorithmIdentifier({ schema: asn1.result.algorithm });
				this.subjectPublicKey = asn1.result.subjectPublicKey;

				switch (this.algorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						// ECDSA
						if ("algorithmParams" in this.algorithm) {
							if (this.algorithm.algorithmParams instanceof ObjectIdentifier) {
								this.parsedKey = new ECPublicKey({
									namedCurve: this.algorithm.algorithmParams.valueBlock.toString(),
									schema: this.subjectPublicKey.valueBlock.valueHex
								});
							}
						}
						break;
					case "1.2.840.113549.1.1.1":
						// RSA
						{
							var publicKeyASN1 = fromBER(this.subjectPublicKey.valueBlock.valueHex);
							if (publicKeyASN1.offset !== -1) this.parsedKey = new RSAPublicKey({ schema: publicKeyASN1.result });
						}
						break;
					default:
				}
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.algorithm.toSchema(), this.subjectPublicKey]
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				//region Return common value in case we do not have enough info fo making JWK
				if ("parsedKey" in this === false) {
					return {
						algorithm: this.algorithm.toJSON(),
						subjectPublicKey: this.subjectPublicKey.toJSON()
					};
				}
				//endregion

				//region Making JWK
				var jwk = {};

				switch (this.algorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						// ECDSA
						jwk.kty = "EC";
						break;
					case "1.2.840.113549.1.1.1":
						// RSA
						jwk.kty = "RSA";
						break;
					default:
				}

				var publicKeyJWK = this.parsedKey.toJSON();

				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = Object.keys(publicKeyJWK)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var key = _step5.value;

						jwk[key] = publicKeyJWK[key];
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}

				return jwk;
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("kty" in json) {
					switch (json.kty.toUpperCase()) {
						case "EC":
							this.parsedKey = new ECPublicKey({ json: json });

							this.algorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.10045.2.1",
								algorithmParams: new ObjectIdentifier({ value: this.parsedKey.namedCurve })
							});
							break;
						case "RSA":
							this.parsedKey = new RSAPublicKey({ json: json });

							this.algorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.1",
								algorithmParams: new Null()
							});
							break;
						default:
							throw new Error("Invalid value for \"kty\" parameter: " + json.kty);
					}

					this.subjectPublicKey = new BitString({ valueHex: this.parsedKey.toSchema().toBER(false) });
				}
			}

			//**********************************************************************************

		}, {
			key: "importKey",
			value: function importKey(publicKey) {
				//region Initial variables
				var sequence = Promise.resolve();
				var _this = this;
				//endregion

				//region Initial check
				if (typeof publicKey === "undefined") return Promise.reject("Need to provide publicKey input parameter");
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Export public key
				sequence = sequence.then(function () {
					return crypto.exportKey("spki", publicKey);
				});
				//endregion

				//region Initialize internal variables by parsing exported value
				sequence = sequence.then(function (exportedKey) {
					var asn1 = fromBER(exportedKey);
					try {
						_this.fromSchema(asn1.result);
					} catch (exception) {
						return Promise.reject("Error during initializing object from schema");
					}

					return undefined;
				}, function (error) {
					return Promise.reject("Error during exporting public key: " + error);
				});
				//endregion

				return sequence;
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "algorithm":
						return new AlgorithmIdentifier();
					case "subjectPublicKey":
						return new BitString();
					default:
						throw new Error("Invalid member name for PublicKeyInfo class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//SubjectPublicKeyInfo  ::=  Sequence  {
				//    algorithm            AlgorithmIdentifier,
				//    subjectPublicKey     BIT STRING  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [algorithm]
     * @property {string} [subjectPublicKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [AlgorithmIdentifier.schema(names.algorithm || {}), new BitString({ name: names.subjectPublicKey || "" })]
				});
			}
		}]);

		return PublicKeyInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC2986
  */


	var Attribute = function () {
		//**********************************************************************************
		/**
   * Constructor for Attribute class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Attribute() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Attribute);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description type
    */
			this.type = getParametersValue(parameters, "type", Attribute.defaultValues("type"));
			/**
    * @type {Array}
    * @description values
    */
			this.values = getParametersValue(parameters, "values", Attribute.defaultValues("values"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Attribute, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Attribute.schema({
					names: {
						type: "type",
						values: "values"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ATTRIBUTE");
				//endregion

				//region Get internal properties from parsed schema
				this.type = asn1.result.type.valueBlock.toString();
				this.values = asn1.result.values;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.type }), new Set({
						value: this.values
					})]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					type: this.type,
					values: Array.from(this.values, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************
			//region Basic Building Blocks for Verification Engine
			//**********************************************************************************

		}, {
			key: "formatChecking",
			value: function formatChecking() {
				return {
					indication: PASSED
				};
			}
			//**********************************************************************************
			//endregion
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return "";
					case "values":
						return [];
					default:
						throw new Error("Invalid member name for Attribute class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "type":
						return memberValue === "";
					case "values":
						return memberValue.length === 0;
					default:
						throw new Error("Invalid member name for Attribute class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// Attribute { ATTRIBUTE:IOSet } ::= SEQUENCE {
				//    type   ATTRIBUTE.&id({IOSet}),
				//    values SET SIZE(1..MAX) OF ATTRIBUTE.&Type({IOSet}{@type})
				//}

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [type]
     * @property {string} [setName]
     * @property {string} [values]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.type || "" }), new Set({
						name: names.setName || "",
						value: [new Repeated({
							name: names.values || "",
							value: new Any()
						})]
					})]
				});
			}
		}]);

		return Attribute;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5915
  */


	var ECPrivateKey = function () {
		//**********************************************************************************
		/**
   * Constructor for ECCPrivateKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ECPrivateKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ECPrivateKey);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", ECPrivateKey.defaultValues("version"));
			/**
    * @type {OctetString}
    * @description privateKey
    */
			this.privateKey = getParametersValue(parameters, "privateKey", ECPrivateKey.defaultValues("privateKey"));

			if ("namedCurve" in parameters)
				/**
     * @type {string}
     * @description namedCurve
     */
				this.namedCurve = getParametersValue(parameters, "namedCurve", ECPrivateKey.defaultValues("namedCurve"));

			if ("publicKey" in parameters)
				/**
     * @type {ECPublicKey}
     * @description publicKey
     */
				this.publicKey = getParametersValue(parameters, "publicKey", ECPrivateKey.defaultValues("publicKey"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ECPrivateKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, ECPrivateKey.schema({
					names: {
						version: "version",
						privateKey: "privateKey",
						namedCurve: "namedCurve",
						publicKey: "publicKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ECPrivateKey");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;
				this.privateKey = asn1.result.privateKey;

				if ("namedCurve" in asn1.result) this.namedCurve = asn1.result.namedCurve.valueBlock.toString();

				if ("publicKey" in asn1.result) {
					var publicKeyData = { schema: asn1.result.publicKey.valueBlock.valueHex };
					if ("namedCurve" in this) publicKeyData.namedCurve = this.namedCurve;

					this.publicKey = new ECPublicKey(publicKeyData);
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				var outputArray = [new Integer({ value: this.version }), this.privateKey];

				if ("namedCurve" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new ObjectIdentifier({ value: this.namedCurve })]
					}));
				}

				if ("publicKey" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new BitString({ valueHex: this.publicKey.toSchema().toBER(false) })]
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				if ("namedCurve" in this === false || ECPrivateKey.compareWithDefault("namedCurve", this.namedCurve)) throw new Error("Not enough information for making JSON: absent \"namedCurve\" value");

				var crvName = "";

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						// P-256
						crvName = "P-256";
						break;
					case "1.3.132.0.34":
						// P-384
						crvName = "P-384";
						break;
					case "1.3.132.0.35":
						// P-521
						crvName = "P-521";
						break;
					default:
				}

				var privateKeyJSON = {
					crv: crvName,
					d: toBase64(arrayBufferToString(this.privateKey.valueBlock.valueHex), true, true, true)
				};

				if ("publicKey" in this) {
					var publicKeyJSON = this.publicKey.toJSON();

					privateKeyJSON.x = publicKeyJSON.x;
					privateKeyJSON.y = publicKeyJSON.y;
				}

				return privateKeyJSON;
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				var coodinateLength = 0;

				if ("crv" in json) {
					switch (json.crv.toUpperCase()) {
						case "P-256":
							this.namedCurve = "1.2.840.10045.3.1.7";
							coodinateLength = 32;
							break;
						case "P-384":
							this.namedCurve = "1.3.132.0.34";
							coodinateLength = 48;
							break;
						case "P-521":
							this.namedCurve = "1.3.132.0.35";
							coodinateLength = 66;
							break;
						default:
					}
				} else throw new Error("Absent mandatory parameter \"crv\"");

				if ("d" in json) this.privateKey = new OctetString({ valueHex: stringToArrayBuffer(fromBase64(json.d, true)).slice(0, coodinateLength) });else throw new Error("Absent mandatory parameter \"d\"");

				if ("x" in json && "y" in json) this.publicKey = new ECPublicKey({ json: json });
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 1;
					case "privateKey":
						return new OctetString();
					case "namedCurve":
						return "";
					case "publicKey":
						return new ECPublicKey();
					default:
						throw new Error("Invalid member name for ECCPrivateKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return memberValue === ECPrivateKey.defaultValues(memberName);
					case "privateKey":
						return memberValue.isEqual(ECPrivateKey.defaultValues(memberName));
					case "namedCurve":
						return memberValue === "";
					case "publicKey":
						return ECPublicKey.compareWithDefault("namedCurve", memberValue.namedCurve) && ECPublicKey.compareWithDefault("x", memberValue.x) && ECPublicKey.compareWithDefault("y", memberValue.y);
					default:
						throw new Error("Invalid member name for ECCPrivateKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// ECPrivateKey ::= SEQUENCE {
				// version        INTEGER { ecPrivkeyVer1(1) } (ecPrivkeyVer1),
				// privateKey     OCTET STRING,
				// parameters [0] ECParameters {{ NamedCurve }} OPTIONAL,
				// publicKey  [1] BIT STRING OPTIONAL
				// }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [privateKey]
     * @property {string} [namedCurve]
     * @property {string} [publicKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new OctetString({ name: names.privateKey || "" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new ObjectIdentifier({ name: names.namedCurve || "" })]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new BitString({ name: names.publicKey || "" })]
					})]
				});
			}
		}]);

		return ECPrivateKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3447
  */


	var OtherPrimeInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for OtherPrimeInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OtherPrimeInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OtherPrimeInfo);

			//region Internal properties of the object
			/**
    * @type {Integer}
    * @description prime
    */
			this.prime = getParametersValue(parameters, "prime", OtherPrimeInfo.defaultValues("prime"));
			/**
    * @type {Integer}
    * @description exponent
    */
			this.exponent = getParametersValue(parameters, "exponent", OtherPrimeInfo.defaultValues("exponent"));
			/**
    * @type {Integer}
    * @description coefficient
    */
			this.coefficient = getParametersValue(parameters, "coefficient", OtherPrimeInfo.defaultValues("coefficient"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OtherPrimeInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OtherPrimeInfo.schema({
					names: {
						prime: "prime",
						exponent: "exponent",
						coefficient: "coefficient"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OtherPrimeInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.prime = asn1.result.prime.convertFromDER();
				this.exponent = asn1.result.exponent.convertFromDER();
				this.coefficient = asn1.result.coefficient.convertFromDER();
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.prime.convertToDER(), this.exponent.convertToDER(), this.coefficient.convertToDER()]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					r: toBase64(arrayBufferToString(this.prime.valueBlock.valueHex), true, true),
					d: toBase64(arrayBufferToString(this.exponent.valueBlock.valueHex), true, true),
					t: toBase64(arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true)
				};
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("r" in json) this.prime = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.r, true)) });else throw new Error("Absent mandatory parameter \"r\"");

				if ("d" in json) this.exponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.d, true)) });else throw new Error("Absent mandatory parameter \"d\"");

				if ("t" in json) this.coefficient = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.t, true)) });else throw new Error("Absent mandatory parameter \"t\"");
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "prime":
						return new Integer();
					case "exponent":
						return new Integer();
					case "coefficient":
						return new Integer();
					default:
						throw new Error("Invalid member name for OtherPrimeInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OtherPrimeInfo ::= Sequence {
				//    prime             Integer,  -- ri
				//    exponent          Integer,  -- di
				//    coefficient       Integer   -- ti
				//}

				/**
     * @type {Object}
     * @property {string} prime
     * @property {string} exponent
     * @property {string} coefficient
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.prime || "" }), new Integer({ name: names.exponent || "" }), new Integer({ name: names.coefficient || "" })]
				});
			}
		}]);

		return OtherPrimeInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3447
  */


	var RSAPrivateKey = function () {
		//**********************************************************************************
		/**
   * Constructor for RSAPrivateKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RSAPrivateKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RSAPrivateKey);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", RSAPrivateKey.defaultValues("version"));
			/**
    * @type {Integer}
    * @description modulus
    */
			this.modulus = getParametersValue(parameters, "modulus", RSAPrivateKey.defaultValues("modulus"));
			/**
    * @type {Integer}
    * @description publicExponent
    */
			this.publicExponent = getParametersValue(parameters, "publicExponent", RSAPrivateKey.defaultValues("publicExponent"));
			/**
    * @type {Integer}
    * @description privateExponent
    */
			this.privateExponent = getParametersValue(parameters, "privateExponent", RSAPrivateKey.defaultValues("privateExponent"));
			/**
    * @type {Integer}
    * @description prime1
    */
			this.prime1 = getParametersValue(parameters, "prime1", RSAPrivateKey.defaultValues("prime1"));
			/**
    * @type {Integer}
    * @description prime2
    */
			this.prime2 = getParametersValue(parameters, "prime2", RSAPrivateKey.defaultValues("prime2"));
			/**
    * @type {Integer}
    * @description exponent1
    */
			this.exponent1 = getParametersValue(parameters, "exponent1", RSAPrivateKey.defaultValues("exponent1"));
			/**
    * @type {Integer}
    * @description exponent2
    */
			this.exponent2 = getParametersValue(parameters, "exponent2", RSAPrivateKey.defaultValues("exponent2"));
			/**
    * @type {Integer}
    * @description coefficient
    */
			this.coefficient = getParametersValue(parameters, "coefficient", RSAPrivateKey.defaultValues("coefficient"));

			if ("otherPrimeInfos" in parameters)
				/**
     * @type {Array.<OtherPrimeInfo>}
     * @description otherPrimeInfos
     */
				this.otherPrimeInfos = getParametersValue(parameters, "otherPrimeInfos", RSAPrivateKey.defaultValues("otherPrimeInfos"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RSAPrivateKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RSAPrivateKey.schema({
					names: {
						version: "version",
						modulus: "modulus",
						publicExponent: "publicExponent",
						privateExponent: "privateExponent",
						prime1: "prime1",
						prime2: "prime2",
						exponent1: "exponent1",
						exponent2: "exponent2",
						coefficient: "coefficient",
						otherPrimeInfo: {
							names: {
								blockName: "otherPrimeInfos"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSAPrivateKey");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;
				this.modulus = asn1.result.modulus.convertFromDER(256);
				this.publicExponent = asn1.result.publicExponent;
				this.privateExponent = asn1.result.privateExponent.convertFromDER(256);
				this.prime1 = asn1.result.prime1.convertFromDER(128);
				this.prime2 = asn1.result.prime2.convertFromDER(128);
				this.exponent1 = asn1.result.exponent1.convertFromDER(128);
				this.exponent2 = asn1.result.exponent2.convertFromDER(128);
				this.coefficient = asn1.result.coefficient.convertFromDER(128);

				if ("otherPrimeInfos" in asn1.result) this.otherPrimeInfos = Array.from(asn1.result.otherPrimeInfos, function (element) {
					return new OtherPrimeInfo({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));
				outputArray.push(this.modulus.convertToDER());
				outputArray.push(this.publicExponent);
				outputArray.push(this.privateExponent.convertToDER());
				outputArray.push(this.prime1.convertToDER());
				outputArray.push(this.prime2.convertToDER());
				outputArray.push(this.exponent1.convertToDER());
				outputArray.push(this.exponent2.convertToDER());
				outputArray.push(this.coefficient.convertToDER());

				if ("otherPrimeInfos" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.otherPrimeInfos, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var jwk = {
					n: toBase64(arrayBufferToString(this.modulus.valueBlock.valueHex), true, true, true),
					e: toBase64(arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true, true),
					d: toBase64(arrayBufferToString(this.privateExponent.valueBlock.valueHex), true, true, true),
					p: toBase64(arrayBufferToString(this.prime1.valueBlock.valueHex), true, true, true),
					q: toBase64(arrayBufferToString(this.prime2.valueBlock.valueHex), true, true, true),
					dp: toBase64(arrayBufferToString(this.exponent1.valueBlock.valueHex), true, true, true),
					dq: toBase64(arrayBufferToString(this.exponent2.valueBlock.valueHex), true, true, true),
					qi: toBase64(arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true, true)
				};

				if ("otherPrimeInfos" in this) jwk.oth = Array.from(this.otherPrimeInfos, function (element) {
					return element.toJSON();
				});

				return jwk;
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("n" in json) this.modulus = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.n, true, true)) });else throw new Error("Absent mandatory parameter \"n\"");

				if ("e" in json) this.publicExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.e, true, true)) });else throw new Error("Absent mandatory parameter \"e\"");

				if ("d" in json) this.privateExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.d, true, true)) });else throw new Error("Absent mandatory parameter \"d\"");

				if ("p" in json) this.prime1 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.p, true, true)) });else throw new Error("Absent mandatory parameter \"p\"");

				if ("q" in json) this.prime2 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.q, true, true)) });else throw new Error("Absent mandatory parameter \"q\"");

				if ("dp" in json) this.exponent1 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.dp, true, true)) });else throw new Error("Absent mandatory parameter \"dp\"");

				if ("dq" in json) this.exponent2 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.dq, true, true)) });else throw new Error("Absent mandatory parameter \"dq\"");

				if ("qi" in json) this.coefficient = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.qi, true, true)) });else throw new Error("Absent mandatory parameter \"qi\"");

				if ("oth" in json) this.otherPrimeInfos = Array.from(json.oth, function (element) {
					return new OtherPrimeInfo({ json: element });
				});
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "modulus":
						return new Integer();
					case "publicExponent":
						return new Integer();
					case "privateExponent":
						return new Integer();
					case "prime1":
						return new Integer();
					case "prime2":
						return new Integer();
					case "exponent1":
						return new Integer();
					case "exponent2":
						return new Integer();
					case "coefficient":
						return new Integer();
					case "otherPrimeInfos":
						return [];
					default:
						throw new Error("Invalid member name for RSAPrivateKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RSAPrivateKey ::= Sequence {
				//    version           Version,
				//    modulus           Integer,  -- n
				//    publicExponent    Integer,  -- e
				//    privateExponent   Integer,  -- d
				//    prime1            Integer,  -- p
				//    prime2            Integer,  -- q
				//    exponent1         Integer,  -- d mod (p-1)
				//    exponent2         Integer,  -- d mod (q-1)
				//    coefficient       Integer,  -- (inverse of q) mod p
				//    otherPrimeInfos   OtherPrimeInfos OPTIONAL
				//}
				//
				//OtherPrimeInfos ::= Sequence SIZE(1..MAX) OF OtherPrimeInfo

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [modulus]
     * @property {string} [publicExponent]
     * @property {string} [privateExponent]
     * @property {string} [prime1]
     * @property {string} [prime2]
     * @property {string} [exponent1]
     * @property {string} [exponent2]
     * @property {string} [coefficient]
     * @property {string} [otherPrimeInfosName]
     * @property {Object} [otherPrimeInfo]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new Integer({ name: names.modulus || "" }), new Integer({ name: names.publicExponent || "" }), new Integer({ name: names.privateExponent || "" }), new Integer({ name: names.prime1 || "" }), new Integer({ name: names.prime2 || "" }), new Integer({ name: names.exponent1 || "" }), new Integer({ name: names.exponent2 || "" }), new Integer({ name: names.coefficient || "" }), new Sequence({
						optional: true,
						value: [new Repeated({
							name: names.otherPrimeInfosName || "",
							value: OtherPrimeInfo.schema(names.otherPrimeInfo || {})
						})]
					})]
				});
			}
		}]);

		return RSAPrivateKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5208
  */


	var PrivateKeyInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for PrivateKeyInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PrivateKeyInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PrivateKeyInfo);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", PrivateKeyInfo.defaultValues("version"));
			/**
    * @type {AlgorithmIdentifier}
    * @description privateKeyAlgorithm
    */
			this.privateKeyAlgorithm = getParametersValue(parameters, "privateKeyAlgorithm", PrivateKeyInfo.defaultValues("privateKeyAlgorithm"));
			/**
    * @type {OctetString}
    * @description privateKey
    */
			this.privateKey = getParametersValue(parameters, "privateKey", PrivateKeyInfo.defaultValues("privateKey"));

			if ("attributes" in parameters)
				/**
     * @type {Array.<Attribute>}
     * @description attributes
     */
				this.attributes = getParametersValue(parameters, "attributes", PrivateKeyInfo.defaultValues("attributes"));

			if ("parsedKey" in parameters)
				/**
     * @type {ECPrivateKey|RSAPrivateKey}
     * @description Parsed public key value
     */
				this.parsedKey = getParametersValue(parameters, "parsedKey", PrivateKeyInfo.defaultValues("parsedKey"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PrivateKeyInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PrivateKeyInfo.schema({
					names: {
						version: "version",
						privateKeyAlgorithm: {
							names: {
								blockName: "privateKeyAlgorithm"
							}
						},
						privateKey: "privateKey",
						attributes: "attributes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PKCS8");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;
				this.privateKeyAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.privateKeyAlgorithm });
				this.privateKey = asn1.result.privateKey;

				if ("attributes" in asn1.result) this.attributes = Array.from(asn1.result.attributes, function (element) {
					return new Attribute({ schema: element });
				});

				switch (this.privateKeyAlgorithm.algorithmId) {
					case "1.2.840.113549.1.1.1":
						// RSA
						{
							var privateKeyASN1 = fromBER(this.privateKey.valueBlock.valueHex);
							if (privateKeyASN1.offset !== -1) this.parsedKey = new RSAPrivateKey({ schema: privateKeyASN1.result });
						}
						break;
					case "1.2.840.10045.2.1":
						// ECDSA
						if ("algorithmParams" in this.privateKeyAlgorithm) {
							if (this.privateKeyAlgorithm.algorithmParams instanceof ObjectIdentifier) {
								var _privateKeyASN = fromBER(this.privateKey.valueBlock.valueHex);
								if (_privateKeyASN.offset !== -1) {
									this.parsedKey = new ECPrivateKey({
										namedCurve: this.privateKeyAlgorithm.algorithmParams.valueBlock.toString(),
										schema: _privateKeyASN.result
									});
								}
							}
						}
						break;
					default:
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [new Integer({ value: this.version }), this.privateKeyAlgorithm.toSchema(), this.privateKey];

				if ("attributes" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: Array.from(this.attributes, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				//region Return common value in case we do not have enough info fo making JWK
				if ("parsedKey" in this === false) {
					var object = {
						version: this.version,
						privateKeyAlgorithm: this.privateKeyAlgorithm.toJSON(),
						privateKey: this.privateKey.toJSON()
					};

					if ("attributes" in this) object.attributes = Array.from(this.attributes, function (element) {
						return element.toJSON();
					});

					return object;
				}
				//endregion

				//region Making JWK
				var jwk = {};

				switch (this.privateKeyAlgorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						// ECDSA
						jwk.kty = "EC";
						break;
					case "1.2.840.113549.1.1.1":
						// RSA
						jwk.kty = "RSA";
						break;
					default:
				}

				var publicKeyJWK = this.parsedKey.toJSON();

				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = Object.keys(publicKeyJWK)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var key = _step6.value;

						jwk[key] = publicKeyJWK[key];
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}

				return jwk;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("kty" in json) {
					switch (json.kty.toUpperCase()) {
						case "EC":
							this.parsedKey = new ECPrivateKey({ json: json });

							this.privateKeyAlgorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.10045.2.1",
								algorithmParams: new ObjectIdentifier({ value: this.parsedKey.namedCurve })
							});
							break;
						case "RSA":
							this.parsedKey = new RSAPrivateKey({ json: json });

							this.privateKeyAlgorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.1",
								algorithmParams: new Null()
							});
							break;
						default:
							throw new Error("Invalid value for \"kty\" parameter: " + json.kty);
					}

					this.privateKey = new OctetString({ valueHex: this.parsedKey.toSchema().toBER(false) });
				}
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "privateKeyAlgorithm":
						return new AlgorithmIdentifier();
					case "privateKey":
						return new OctetString();
					case "attributes":
						return [];
					default:
						throw new Error("Invalid member name for PrivateKeyInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PrivateKeyInfo ::= SEQUENCE {
				//    version Version,
				//    privateKeyAlgorithm AlgorithmIdentifier {{PrivateKeyAlgorithms}},
				//    privateKey PrivateKey,
				//    attributes [0] Attributes OPTIONAL }
				//
				//Version ::= INTEGER {v1(0)} (v1,...)
				//
				//PrivateKey ::= OCTET STRING
				//
				//Attributes ::= SET OF Attribute

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [privateKeyAlgorithm]
     * @property {string} [privateKey]
     * @property {string} [attributes]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), AlgorithmIdentifier.schema(names.privateKeyAlgorithm || {}), new OctetString({ name: names.privateKey || "" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Repeated({
							name: names.attributes || "",
							value: Attribute.schema()
						})]
					})]
				});
			}
		}]);

		return PrivateKeyInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************


	var CryptoEngine = function () {
		//**********************************************************************************
		/**
   * Constructor for CryptoEngine class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CryptoEngine() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CryptoEngine);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description Usually here we are expecting "window.crypto.subtle" or an equivalent from custom "crypto engine"
    */
			this.crypto = getParametersValue(parameters, "crypto", {});

			/**
    * @type {string}
    * @description Name of the "crypto engine"
    */
			this.name = getParametersValue(parameters, "name", "");
			//endregion
		}
		//**********************************************************************************
		/**
   * Import WebCrypto keys from different formats
   * @param {string} format
   * @param {ArrayBuffer|Object} keyData
   * @param {Object} algorithm
   * @param {boolean} extractable
   * @param {Array} keyUsages
   * @returns {Promise}
   */


		_createClass(CryptoEngine, [{
			key: "importKey",
			value: function importKey(format, keyData, algorithm, extractable, keyUsages) {
				var _this52 = this;

				//region Initial variables
				var jwk = {};
				//endregion

				//region Change "keyData" type if needed
				if (keyData instanceof Uint8Array) keyData = keyData.buffer;
				//endregion

				switch (format.toLowerCase()) {
					case "raw":
						return this.crypto.importKey("raw", keyData, algorithm, extractable, keyUsages);
					case "spki":
						{
							var asn1 = fromBER(keyData);
							if (asn1.offset === -1) return Promise.reject("Incorrect keyData");

							var publicKeyInfo = new PublicKeyInfo();
							try {
								publicKeyInfo.fromSchema(asn1.result);
							} catch (ex) {
								return Promise.reject("Incorrect keyData");
							}

							switch (algorithm.name.toUpperCase()) {
								case "RSA-PSS":
									{
										//region Get information about used hash function
										switch (algorithm.hash.name.toUpperCase()) {
											case "SHA-1":
												jwk.alg = "PS1";
												break;
											case "SHA-256":
												jwk.alg = "PS256";
												break;
											case "SHA-384":
												jwk.alg = "PS384";
												break;
											case "SHA-512":
												jwk.alg = "PS512";
												break;
											default:
												return Promise.reject("Incorrect hash algorithm: " + algorithm.hash.name.toUpperCase());
										}
										//endregion
									}
								case "RSASSA-PKCS1-V1_5":
									{
										keyUsages = ["verify"]; // Override existing keyUsages value since the key is a public key

										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										if (publicKeyInfo.algorithm.algorithmId !== "1.2.840.113549.1.1.1") return Promise.reject("Incorrect public key algorithm: " + publicKeyInfo.algorithm.algorithmId);

										//region Get information about used hash function
										if ("alg" in jwk === false) {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RS1";
													break;
												case "SHA-256":
													jwk.alg = "RS256";
													break;
												case "SHA-384":
													jwk.alg = "RS384";
													break;
												case "SHA-512":
													jwk.alg = "RS512";
													break;
												default:
													return Promise.reject("Incorrect public key algorithm: " + publicKeyInfo.algorithm.algorithmId);
											}
										}
										//endregion

										//region Create RSA Public Key elements
										var publicKeyJSON = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion7 = true;
										var _didIteratorError7 = false;
										var _iteratorError7 = undefined;

										try {
											for (var _iterator7 = Object.keys(publicKeyJSON)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
												var key = _step7.value;

												jwk[key] = publicKeyJSON[key];
											} //endregion
										} catch (err) {
											_didIteratorError7 = true;
											_iteratorError7 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion7 && _iterator7.return) {
													_iterator7.return();
												}
											} finally {
												if (_didIteratorError7) {
													throw _iteratorError7;
												}
											}
										}
									}
									break;
								case "ECDSA":
									keyUsages = ["verify"]; // Override existing keyUsages value since the key is a public key
								case "ECDH":
									{
										//region Initial variables
										jwk = {
											kty: "EC",
											ext: extractable,
											key_ops: keyUsages
										};
										//endregion

										//region Get information about algorithm
										if (publicKeyInfo.algorithm.algorithmId !== "1.2.840.10045.2.1") return Promise.reject("Incorrect public key algorithm: " + publicKeyInfo.algorithm.algorithmId);
										//endregion

										//region Create ECDSA Public Key elements
										var _publicKeyJSON = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion8 = true;
										var _didIteratorError8 = false;
										var _iteratorError8 = undefined;

										try {
											for (var _iterator8 = Object.keys(_publicKeyJSON)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
												var _key2 = _step8.value;

												jwk[_key2] = _publicKeyJSON[_key2];
											} //endregion
										} catch (err) {
											_didIteratorError8 = true;
											_iteratorError8 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion8 && _iterator8.return) {
													_iterator8.return();
												}
											} finally {
												if (_didIteratorError8) {
													throw _iteratorError8;
												}
											}
										}
									}
									break;
								case "RSA-OAEP":
									{
										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										if (this.name.toLowerCase() === "safari") jwk.alg = "RSA-OAEP";else {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RSA-OAEP-1";
													break;
												case "SHA-256":
													jwk.alg = "RSA-OAEP-256";
													break;
												case "SHA-384":
													jwk.alg = "RSA-OAEP-384";
													break;
												case "SHA-512":
													jwk.alg = "RSA-OAEP-512";
													break;
												default:
													return Promise.reject("Incorrect public key algorithm: " + publicKeyInfo.algorithm.algorithmId);
											}
										}

										//region Create ECDSA Public Key elements
										var _publicKeyJSON2 = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion9 = true;
										var _didIteratorError9 = false;
										var _iteratorError9 = undefined;

										try {
											for (var _iterator9 = Object.keys(_publicKeyJSON2)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
												var _key3 = _step9.value;

												jwk[_key3] = _publicKeyJSON2[_key3];
											} //endregion
										} catch (err) {
											_didIteratorError9 = true;
											_iteratorError9 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion9 && _iterator9.return) {
													_iterator9.return();
												}
											} finally {
												if (_didIteratorError9) {
													throw _iteratorError9;
												}
											}
										}
									}
									break;
								default:
									return Promise.reject("Incorrect algorithm name: " + algorithm.name.toUpperCase());
							}
						}
						break;
					case "pkcs8":
						{
							var privateKeyInfo = new PrivateKeyInfo();

							//region Parse "PrivateKeyInfo" object
							var _asn = fromBER(keyData);
							if (_asn.offset === -1) return Promise.reject("Incorrect keyData");

							try {
								privateKeyInfo.fromSchema(_asn.result);
							} catch (ex) {
								return Promise.reject("Incorrect keyData");
							}
							//endregion

							switch (algorithm.name.toUpperCase()) {
								case "RSA-PSS":
									{
										//region Get information about used hash function
										switch (algorithm.hash.name.toUpperCase()) {
											case "SHA-1":
												jwk.alg = "PS1";
												break;
											case "SHA-256":
												jwk.alg = "PS256";
												break;
											case "SHA-384":
												jwk.alg = "PS384";
												break;
											case "SHA-512":
												jwk.alg = "PS512";
												break;
											default:
												return Promise.reject("Incorrect hash algorithm: " + algorithm.hash.name.toUpperCase());
										}
										//endregion
									}
								case "RSASSA-PKCS1-V1_5":
									{
										keyUsages = ["sign"]; // Override existing keyUsages value since the key is a private key

										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										//region Get information about used hash function
										if (privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.113549.1.1.1") return Promise.reject("Incorrect private key algorithm: " + privateKeyInfo.privateKeyAlgorithm.algorithmId);
										//endregion

										//region Get information about used hash function
										if ("alg" in jwk === false) {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RS1";
													break;
												case "SHA-256":
													jwk.alg = "RS256";
													break;
												case "SHA-384":
													jwk.alg = "RS384";
													break;
												case "SHA-512":
													jwk.alg = "RS512";
													break;
												default:
													return Promise.reject("Incorrect hash algorithm: " + algorithm.hash.name.toUpperCase());
											}
										}
										//endregion

										//region Create RSA Private Key elements
										var privateKeyJSON = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion10 = true;
										var _didIteratorError10 = false;
										var _iteratorError10 = undefined;

										try {
											for (var _iterator10 = Object.keys(privateKeyJSON)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
												var _key4 = _step10.value;

												jwk[_key4] = privateKeyJSON[_key4];
											} //endregion
										} catch (err) {
											_didIteratorError10 = true;
											_iteratorError10 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion10 && _iterator10.return) {
													_iterator10.return();
												}
											} finally {
												if (_didIteratorError10) {
													throw _iteratorError10;
												}
											}
										}
									}
									break;
								case "ECDSA":
									keyUsages = ["sign"]; // Override existing keyUsages value since the key is a private key
								case "ECDH":
									{
										//region Initial variables
										jwk = {
											kty: "EC",
											ext: extractable,
											key_ops: keyUsages
										};
										//endregion

										//region Get information about used hash function
										if (privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.10045.2.1") return Promise.reject("Incorrect algorithm: " + privateKeyInfo.privateKeyAlgorithm.algorithmId);
										//endregion

										//region Create ECDSA Private Key elements
										var _privateKeyJSON = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion11 = true;
										var _didIteratorError11 = false;
										var _iteratorError11 = undefined;

										try {
											for (var _iterator11 = Object.keys(_privateKeyJSON)[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
												var _key5 = _step11.value;

												jwk[_key5] = _privateKeyJSON[_key5];
											} //endregion
										} catch (err) {
											_didIteratorError11 = true;
											_iteratorError11 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion11 && _iterator11.return) {
													_iterator11.return();
												}
											} finally {
												if (_didIteratorError11) {
													throw _iteratorError11;
												}
											}
										}
									}
									break;
								case "RSA-OAEP":
									{
										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										//region Get information about used hash function
										if (this.name.toLowerCase() === "safari") jwk.alg = "RSA-OAEP";else {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RSA-OAEP-1";
													break;
												case "SHA-256":
													jwk.alg = "RSA-OAEP-256";
													break;
												case "SHA-384":
													jwk.alg = "RSA-OAEP-384";
													break;
												case "SHA-512":
													jwk.alg = "RSA-OAEP-512";
													break;
												default:
													return Promise.reject("Incorrect hash algorithm: " + algorithm.hash.name.toUpperCase());
											}
										}
										//endregion

										//region Create RSA Private Key elements
										var _privateKeyJSON2 = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion12 = true;
										var _didIteratorError12 = false;
										var _iteratorError12 = undefined;

										try {
											for (var _iterator12 = Object.keys(_privateKeyJSON2)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
												var _key6 = _step12.value;

												jwk[_key6] = _privateKeyJSON2[_key6];
											} //endregion
										} catch (err) {
											_didIteratorError12 = true;
											_iteratorError12 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion12 && _iterator12.return) {
													_iterator12.return();
												}
											} finally {
												if (_didIteratorError12) {
													throw _iteratorError12;
												}
											}
										}
									}
									break;
								default:
									return Promise.reject("Incorrect algorithm name: " + algorithm.name.toUpperCase());
							}
						}
						break;
					case "jwk":
						jwk = keyData;
						break;
					default:
						return Promise.reject("Incorrect format: " + format);
				}

				//region Special case for Safari browser (since its acting not as WebCrypto standard describes)
				if (this.name.toLowerCase() === "safari") {
					// Try to use both ways - import using ArrayBuffer and pure JWK (for Safari Technology Preview)
					return Promise.resolve().then(function () {
						return _this52.crypto.importKey("jwk", stringToArrayBuffer(JSON.stringify(jwk)), algorithm, extractable, keyUsages);
					}).then(function (result) {
						return result;
					}, function (error) {
						return _this52.crypto.importKey("jwk", jwk, algorithm, extractable, keyUsages);
					});

					return Promise.resolve().then(function () {
						return this.crypto.importKey("jwk", stringToArrayBuffer(JSON.stringify(jwk)), algorithm, extractable, keyUsages);
					}).then(function (result) {
						return result;
					}, function (error) {
						return this.crypto.importKey("jwk", jwk, algorithm, extractable, keyUsages);
					});
				}
				//endregion

				return this.crypto.importKey("jwk", jwk, algorithm, extractable, keyUsages);
			}
			//**********************************************************************************
			/**
    * Export WebCrypto keys to different formats
    * @param {string} format
    * @param {Object} key
    * @returns {Promise}
    */

		}, {
			key: "exportKey",
			value: function exportKey(format, key) {
				var sequence = this.crypto.exportKey("jwk", key);

				//region Currently Safari returns ArrayBuffer as JWK thus we need an additional transformation
				if (this.name.toLowerCase() === "safari") {
					sequence = sequence.then(function (result) {
						// Some additional checks for Safari Technology Preview
						if (result instanceof ArrayBuffer) return JSON.parse(arrayBufferToString(result));

						return result;
					});
				}
				//endregion

				switch (format.toLowerCase()) {
					case "raw":
						return this.crypto.exportKey("raw", key);
					case "spki":
						sequence = sequence.then(function (result) {
							var publicKeyInfo = new PublicKeyInfo();

							try {
								publicKeyInfo.fromJSON(result);
							} catch (ex) {
								return Promise.reject("Incorrect key data");
							}

							return publicKeyInfo.toSchema().toBER(false);
						});
						break;
					case "pkcs8":
						sequence = sequence.then(function (result) {
							var privateKeyInfo = new PrivateKeyInfo();

							try {
								privateKeyInfo.fromJSON(result);
							} catch (ex) {
								return Promise.reject("Incorrect key data");
							}

							return privateKeyInfo.toSchema().toBER(false);
						});
						break;
					case "jwk":
						break;
					default:
						return Promise.reject("Incorrect format: " + format);
				}

				return sequence;
			}
			//**********************************************************************************
			/**
    * Convert WebCrypto keys between different export formats
    * @param {string} inputFormat
    * @param {string} outputFormat
    * @param {ArrayBuffer|Object} keyData
    * @param {Object} algorithm
    * @param {boolean} extractable
    * @param {Array} keyUsages
    * @returns {Promise}
    */

		}, {
			key: "convert",
			value: function convert(inputFormat, outputFormat, keyData, algorithm, extractable, keyUsages) {
				var _this53 = this;

				switch (inputFormat.toLowerCase()) {
					case "raw":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve(keyData);
							case "spki":
								return Promise.resolve().then(function () {
									return _this53.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("spki", result);
								});
							case "pkcs8":
								return Promise.resolve().then(function () {
									return _this53.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("pkcs8", result);
								});
							case "jwk":
								return Promise.resolve().then(function () {
									return _this53.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("jwk", result);
								});
							default:
								return Promise.reject("Incorrect outputFormat: " + outputFormat);
						}
					case "spki":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this53.importKey("spki", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("raw", result);
								});
							case "spki":
								return Promise.resolve(keyData);
							case "pkcs8":
								return Promise.reject("Impossible to convert between SPKI/PKCS8");
							case "jwk":
								return Promise.resolve().then(function () {
									return _this53.importKey("spki", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("jwk", result);
								});
							default:
								return Promise.reject("Incorrect outputFormat: " + outputFormat);
						}
					case "pkcs8":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this53.importKey("pkcs8", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("raw", result);
								});
							case "spki":
								return Promise.reject("Impossible to convert between SPKI/PKCS8");
							case "pkcs8":
								return Promise.resolve(keyData);
							case "jwk":
								return Promise.resolve().then(function () {
									return _this53.importKey("pkcs8", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("jwk", result);
								});
							default:
								return Promise.reject("Incorrect outputFormat: " + outputFormat);
						}
					case "jwk":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this53.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("raw", result);
								});
							case "spki":
								return Promise.resolve().then(function () {
									return _this53.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("spki", result);
								});
							case "pkcs8":
								return Promise.resolve().then(function () {
									return _this53.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("pkcs8", result);
								});
							case "jwk":
								return Promise.resolve(keyData);
							default:
								return Promise.reject("Incorrect outputFormat: " + outputFormat);
						}
					default:
						return Promise.reject("Incorrect inputFormat: " + inputFormat);
				}
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "encrypt"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "encrypt",
			value: function encrypt() {
				var _crypto;

				return (_crypto = this.crypto).encrypt.apply(_crypto, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "decrypt"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "decrypt",
			value: function decrypt() {
				var _crypto2;

				return (_crypto2 = this.crypto).decrypt.apply(_crypto2, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "sign"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "sign",
			value: function sign() {
				var _crypto3;

				return (_crypto3 = this.crypto).sign.apply(_crypto3, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "verify"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "verify",
			value: function verify() {
				var _crypto4;

				return (_crypto4 = this.crypto).verify.apply(_crypto4, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "digest"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "digest",
			value: function digest() {
				var _crypto5;

				return (_crypto5 = this.crypto).digest.apply(_crypto5, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "generateKey"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "generateKey",
			value: function generateKey() {
				var _crypto6;

				return (_crypto6 = this.crypto).generateKey.apply(_crypto6, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "deriveKey"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "deriveKey",
			value: function deriveKey() {
				var _crypto7;

				return (_crypto7 = this.crypto).deriveKey.apply(_crypto7, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "deriveBits"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "deriveBits",
			value: function deriveBits() {
				var _crypto8;

				return (_crypto8 = this.crypto).deriveBits.apply(_crypto8, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "wrapKey"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "wrapKey",
			value: function wrapKey() {
				var _crypto9;

				return (_crypto9 = this.crypto).wrapKey.apply(_crypto9, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "unwrapKey"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "unwrapKey",
			value: function unwrapKey() {
				var _crypto10;

				return (_crypto10 = this.crypto).unwrapKey.apply(_crypto10, arguments);
			}
			//**********************************************************************************

		}]);

		return CryptoEngine;
	}();
	//**************************************************************************************

	//**************************************************************************************
	//region Crypto engine related function
	//**************************************************************************************


	var engine = {
		name: "none",
		crypto: null,
		subtle: null
	};
	//**************************************************************************************
	(function initCryptoEngine() {
		if (typeof self !== "undefined") {
			if ("crypto" in self) {
				var engineName = "webcrypto";

				/**
     * Standard crypto object
     * @type {Object}
     * @property {Object} [webkitSubtle] Subtle object from Apple
     */
				var cryptoObject = self.crypto;
				var subtleObject = null;

				// Apple Safari support
				if ("webkitSubtle" in self.crypto) {
					try {
						subtleObject = self.crypto.webkitSubtle;
					} catch (ex) {
						subtleObject = self.crypto.subtle;
					}

					engineName = "safari";
				}

				if ("subtle" in self.crypto) subtleObject = self.crypto.subtle;

				engine = {
					name: engineName,
					crypto: cryptoObject,
					subtle: new CryptoEngine({ name: engineName, crypto: subtleObject })
				};
			}
		}
	})();
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of common functions
	//**************************************************************************************
	/**
  * Get crypto subtle from current "crypto engine" or "undefined"
  * @returns {({decrypt, deriveKey, digest, encrypt, exportKey, generateKey, importKey, sign, unwrapKey, verify, wrapKey}|null)}
  */
	function getCrypto() {
		if (engine.subtle !== null) return engine.subtle;

		return undefined;
	}
	//**************************************************************************************
	/**
  * Initialize input Uint8Array by random values (with help from current "crypto engine")
  * @param {!Uint8Array} view
  * @returns {*}
  */
	function getRandomValues(view) {
		if (engine.crypto !== null) return engine.crypto.getRandomValues(view);

		throw new Error("No support for Web Cryptography API");
	}
	//**************************************************************************************
	/**
  * Get OID for each specific WebCrypto algorithm
  * @param {Object} algorithm WebCrypto algorithm
  * @returns {string}
  */
	function getOIDByAlgorithm(algorithm) {
		var result = "";

		switch (algorithm.name.toUpperCase()) {
			case "RSASSA-PKCS1-V1_5":
				switch (algorithm.hash.name.toUpperCase()) {
					case "SHA-1":
						result = "1.2.840.113549.1.1.5";
						break;
					case "SHA-256":
						result = "1.2.840.113549.1.1.11";
						break;
					case "SHA-384":
						result = "1.2.840.113549.1.1.12";
						break;
					case "SHA-512":
						result = "1.2.840.113549.1.1.13";
						break;
					default:
				}
				break;
			case "RSA-PSS":
				result = "1.2.840.113549.1.1.10";
				break;
			case "RSA-OAEP":
				result = "1.2.840.113549.1.1.7";
				break;
			case "ECDSA":
				switch (algorithm.hash.name.toUpperCase()) {
					case "SHA-1":
						result = "1.2.840.10045.4.1";
						break;
					case "SHA-256":
						result = "1.2.840.10045.4.3.2";
						break;
					case "SHA-384":
						result = "1.2.840.10045.4.3.3";
						break;
					case "SHA-512":
						result = "1.2.840.10045.4.3.4";
						break;
					default:
				}
				break;
			case "ECDH":
				switch (algorithm.kdf.toUpperCase()) {// Non-standard addition - hash algorithm of KDF function
					case "SHA-1":
						result = "1.3.133.16.840.63.0.2"; // dhSinglePass-stdDH-sha1kdf-scheme
						break;
					case "SHA-256":
						result = "1.3.132.1.11.1"; // dhSinglePass-stdDH-sha256kdf-scheme
						break;
					case "SHA-384":
						result = "1.3.132.1.11.2"; // dhSinglePass-stdDH-sha384kdf-scheme
						break;
					case "SHA-512":
						result = "1.3.132.1.11.3"; // dhSinglePass-stdDH-sha512kdf-scheme
						break;
					default:
				}
				break;
			case "AES-CTR":
				break;
			case "AES-CBC":
				switch (algorithm.length) {
					case 128:
						result = "2.16.840.1.101.3.4.1.2";
						break;
					case 192:
						result = "2.16.840.1.101.3.4.1.22";
						break;
					case 256:
						result = "2.16.840.1.101.3.4.1.42";
						break;
					default:
				}
				break;
			case "AES-CMAC":
				break;
			case "AES-GCM":
				switch (algorithm.length) {
					case 128:
						result = "2.16.840.1.101.3.4.1.6";
						break;
					case 192:
						result = "2.16.840.1.101.3.4.1.26";
						break;
					case 256:
						result = "2.16.840.1.101.3.4.1.46";
						break;
					default:
				}
				break;
			case "AES-CFB":
				switch (algorithm.length) {
					case 128:
						result = "2.16.840.1.101.3.4.1.4";
						break;
					case 192:
						result = "2.16.840.1.101.3.4.1.24";
						break;
					case 256:
						result = "2.16.840.1.101.3.4.1.44";
						break;
					default:
				}
				break;
			case "AES-KW":
				switch (algorithm.length) {
					case 128:
						result = "2.16.840.1.101.3.4.1.5";
						break;
					case 192:
						result = "2.16.840.1.101.3.4.1.25";
						break;
					case 256:
						result = "2.16.840.1.101.3.4.1.45";
						break;
					default:
				}
				break;
			case "HMAC":
				switch (algorithm.hash.name.toUpperCase()) {
					case "SHA-1":
						result = "1.2.840.113549.2.7";
						break;
					case "SHA-256":
						result = "1.2.840.113549.2.9";
						break;
					case "SHA-384":
						result = "1.2.840.113549.2.10";
						break;
					case "SHA-512":
						result = "1.2.840.113549.2.11";
						break;
					default:
				}
				break;
			case "DH":
				result = "1.2.840.113549.1.9.16.3.5";
				break;
			case "SHA-1":
				result = "1.3.14.3.2.26";
				break;
			case "SHA-256":
				result = "2.16.840.1.101.3.4.2.1";
				break;
			case "SHA-384":
				result = "2.16.840.1.101.3.4.2.2";
				break;
			case "SHA-512":
				result = "2.16.840.1.101.3.4.2.3";
				break;
			case "CONCAT":
				break;
			case "HKDF":
				break;
			case "PBKDF2":
				result = "1.2.840.113549.1.5.12";
				break;
			//region Special case - OIDs for ECC curves
			case "P-256":
				result = "1.2.840.10045.3.1.7";
				break;
			case "P-384":
				result = "1.3.132.0.34";
				break;
			case "P-521":
				result = "1.3.132.0.35";
				break;
			//endregion
			default:
		}

		return result;
	}
	//**************************************************************************************
	/**
  * Get default algorithm parameters for each kind of operation
  * @param {string} algorithmName Algorithm name to get common parameters for
  * @param {string} operation Kind of operation: "sign", "encrypt", "generatekey", "importkey", "exportkey", "verify"
  * @returns {*}
  */
	function getAlgorithmParameters(algorithmName, operation) {
		var result = {
			algorithm: {},
			usages: []
		};

		switch (algorithmName.toUpperCase()) {
			case "RSASSA-PKCS1-V1_5":
				switch (operation.toLowerCase()) {
					case "generatekey":
						result = {
							algorithm: {
								name: "RSASSA-PKCS1-v1_5",
								modulusLength: 2048,
								publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["sign", "verify"]
						};
						break;
					case "verify":
					case "sign":
					case "importkey":
						result = {
							algorithm: {
								name: "RSASSA-PKCS1-v1_5",
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["verify"] // For importKey("pkcs8") usage must be "sign" only
						};
						break;
					case "exportkey":
					default:
						return {
							algorithm: {
								name: "RSASSA-PKCS1-v1_5"
							},
							usages: []
						};
				}
				break;
			case "RSA-PSS":
				switch (operation.toLowerCase()) {
					case "sign":
					case "verify":
						result = {
							algorithm: {
								name: "RSA-PSS",
								hash: {
									name: "SHA-1"
								},
								saltLength: 20
							},
							usages: ["sign", "verify"]
						};
						break;
					case "generatekey":
						result = {
							algorithm: {
								name: "RSA-PSS",
								modulusLength: 2048,
								publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
								hash: {
									name: "SHA-1"
								}
							},
							usages: ["sign", "verify"]
						};
						break;
					case "importkey":
						result = {
							algorithm: {
								name: "RSA-PSS",
								hash: {
									name: "SHA-1"
								}
							},
							usages: ["verify"] // For importKey("pkcs8") usage must be "sign" only
						};
						break;
					case "exportkey":
					default:
						return {
							algorithm: {
								name: "RSA-PSS"
							},
							usages: []
						};
				}
				break;
			case "RSA-OAEP":
				switch (operation.toLowerCase()) {
					case "encrypt":
					case "decrypt":
						result = {
							algorithm: {
								name: "RSA-OAEP"
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					case "generatekey":
						result = {
							algorithm: {
								name: "RSA-OAEP",
								modulusLength: 2048,
								publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "importkey":
						result = {
							algorithm: {
								name: "RSA-OAEP",
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["encrypt"] // encrypt for "spki" and decrypt for "pkcs8"
						};
						break;
					case "exportkey":
					default:
						return {
							algorithm: {
								name: "RSA-OAEP"
							},
							usages: []
						};
				}
				break;
			case "ECDSA":
				switch (operation.toLowerCase()) {
					case "generatekey":
						result = {
							algorithm: {
								name: "ECDSA",
								namedCurve: "P-256"
							},
							usages: ["sign", "verify"]
						};
						break;
					case "importkey":
						result = {
							algorithm: {
								name: "ECDSA",
								namedCurve: "P-256"
							},
							usages: ["verify"] // "sign" for "pkcs8"
						};
						break;
					case "verify":
					case "sign":
						result = {
							algorithm: {
								name: "ECDSA",
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["sign"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "ECDSA"
							},
							usages: []
						};
				}
				break;
			case "ECDH":
				switch (operation.toLowerCase()) {
					case "exportkey":
					case "importkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "ECDH",
								namedCurve: "P-256"
							},
							usages: ["deriveKey", "deriveBits"]
						};
						break;
					case "derivekey":
					case "derivebits":
						result = {
							algorithm: {
								name: "ECDH",
								namedCurve: "P-256",
								public: [] // Must be a "publicKey"
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "ECDH"
							},
							usages: []
						};
				}
				break;
			case "AES-CTR":
				switch (operation.toLowerCase()) {
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-CTR",
								length: 256
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-CTR",
								counter: new Uint8Array(16),
								length: 10
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-CTR"
							},
							usages: []
						};
				}
				break;
			case "AES-CBC":
				switch (operation.toLowerCase()) {
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-CBC",
								length: 256
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-CBC",
								iv: getRandomValues(new Uint8Array(16)) // For "decrypt" the value should be replaced with value got on "encrypt" step
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-CBC"
							},
							usages: []
						};
				}
				break;
			case "AES-GCM":
				switch (operation.toLowerCase()) {
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-GCM",
								length: 256
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-GCM",
								iv: getRandomValues(new Uint8Array(16)) // For "decrypt" the value should be replaced with value got on "encrypt" step
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-GCM"
							},
							usages: []
						};
				}
				break;
			case "AES-KW":
				switch (operation.toLowerCase()) {
					case "importkey":
					case "exportkey":
					case "generatekey":
					case "wrapkey":
					case "unwrapkey":
						result = {
							algorithm: {
								name: "AES-KW",
								length: 256
							},
							usages: ["wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-KW"
							},
							usages: []
						};
				}
				break;
			case "HMAC":
				switch (operation.toLowerCase()) {
					case "sign":
					case "verify":
						result = {
							algorithm: {
								name: "HMAC"
							},
							usages: ["sign", "verify"]
						};
						break;
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "HMAC",
								length: 32,
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["sign", "verify"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "HMAC"
							},
							usages: []
						};
				}
				break;
			case "HKDF":
				switch (operation.toLowerCase()) {
					case "derivekey":
						result = {
							algorithm: {
								name: "HKDF",
								hash: "SHA-256",
								salt: new Uint8Array([]),
								info: new Uint8Array([])
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "HKDF"
							},
							usages: []
						};
				}
				break;
			case "PBKDF2":
				switch (operation.toLowerCase()) {
					case "derivekey":
						result = {
							algorithm: {
								name: "PBKDF2",
								hash: { name: "SHA-256" },
								salt: new Uint8Array([]),
								iterations: 1000
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "PBKDF2"
							},
							usages: []
						};
				}
				break;
			default:
		}

		return result;
	}
	//**************************************************************************************
	/**
  * Create CMS ECDSA signature from WebCrypto ECDSA signature
  * @param {ArrayBuffer} signatureBuffer WebCrypto result of "sign" function
  * @returns {ArrayBuffer}
  */
	function createCMSECDSASignature(signatureBuffer) {
		// #region Initial check for correct length
		if (signatureBuffer.byteLength % 2 !== 0) return new ArrayBuffer(0);
		// #endregion

		// #region Initial variables
		var length = signatureBuffer.byteLength / 2; // There are two equal parts inside incoming ArrayBuffer

		var rBuffer = new ArrayBuffer(length);
		var rView = new Uint8Array(rBuffer);
		rView.set(new Uint8Array(signatureBuffer, 0, length));

		var rInteger = new Integer({ valueHex: rBuffer });

		var sBuffer = new ArrayBuffer(length);
		var sView = new Uint8Array(sBuffer);
		sView.set(new Uint8Array(signatureBuffer, length, length));

		var sInteger = new Integer({ valueHex: sBuffer });
		// #endregion

		return new Sequence({
			value: [rInteger.convertToDER(), sInteger.convertToDER()]
		}).toBER(false);
	}
	//**************************************************************************************
	/**
  * String preparation function. In a future here will be realization of algorithm from RFC4518
  * @param {string} inputString JavaScript string. As soon as for each ASN.1 string type we have a specific transformation function here we will work with pure JavaScript string
  * @returns {string} Formated string
  */
	function stringPrep(inputString) {
		var result = inputString.replace(/^\s+|\s+$/g, ""); // Trim input string
		result = result.replace(/\s+/g, " "); // Change all sequence of SPACE down to SPACE char
		result = result.toLowerCase();

		return result;
	}
	//**************************************************************************************
	/**
  * Create a single ArrayBuffer from CMS ECDSA signature
  * @param {Sequence} cmsSignature ASN.1 SEQUENCE contains CMS ECDSA signature
  * @returns {ArrayBuffer}
  */
	function createECDSASignatureFromCMS(cmsSignature) {
		// #region Check input variables
		if (cmsSignature instanceof Sequence === false) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value.length !== 2) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value[0] instanceof Integer === false) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value[1] instanceof Integer === false) return new ArrayBuffer(0);
		// #endregion 

		var rValue = cmsSignature.valueBlock.value[0].convertFromDER();
		var sValue = cmsSignature.valueBlock.value[1].convertFromDER();

		return utilConcatBuf(rValue.valueBlock.valueHex, sValue.valueBlock.valueHex);
	}
	//**************************************************************************************
	/**
  * Get WebCrypto algorithm by wel-known OID
  * @param {string} oid Wel-known OID to search for
  * @returns {Object}
  */
	function getAlgorithmByOID(oid) {
		switch (oid) {
			case "1.2.840.113549.1.1.1":
			case "1.2.840.113549.1.1.5":
				return {
					name: "RSASSA-PKCS1-v1_5",
					hash: {
						name: "SHA-1"
					}
				};
			case "1.2.840.113549.1.1.11":
				return {
					name: "RSASSA-PKCS1-v1_5",
					hash: {
						name: "SHA-256"
					}
				};
			case "1.2.840.113549.1.1.12":
				return {
					name: "RSASSA-PKCS1-v1_5",
					hash: {
						name: "SHA-384"
					}
				};
			case "1.2.840.113549.1.1.13":
				return {
					name: "RSASSA-PKCS1-v1_5",
					hash: {
						name: "SHA-512"
					}
				};
			case "1.2.840.113549.1.1.10":
				return {
					name: "RSA-PSS"
				};
			case "1.2.840.113549.1.1.7":
				return {
					name: "RSA-OAEP"
				};
			case "1.2.840.10045.2.1":
			case "1.2.840.10045.4.1":
				return {
					name: "ECDSA",
					hash: {
						name: "SHA-1"
					}
				};
			case "1.2.840.10045.4.3.2":
				return {
					name: "ECDSA",
					hash: {
						name: "SHA-256"
					}
				};
			case "1.2.840.10045.4.3.3":
				return {
					name: "ECDSA",
					hash: {
						name: "SHA-384"
					}
				};
			case "1.2.840.10045.4.3.4":
				return {
					name: "ECDSA",
					hash: {
						name: "SHA-512"
					}
				};
			case "1.3.133.16.840.63.0.2":
				return {
					name: "ECDH",
					kdf: "SHA-1"
				};
			case "1.3.132.1.11.1":
				return {
					name: "ECDH",
					kdf: "SHA-256"
				};
			case "1.3.132.1.11.2":
				return {
					name: "ECDH",
					kdf: "SHA-384"
				};
			case "1.3.132.1.11.3":
				return {
					name: "ECDH",
					kdf: "SHA-512"
				};
			case "2.16.840.1.101.3.4.1.2":
				return {
					name: "AES-CBC",
					length: 128
				};
			case "2.16.840.1.101.3.4.1.22":
				return {
					name: "AES-CBC",
					length: 192
				};
			case "2.16.840.1.101.3.4.1.42":
				return {
					name: "AES-CBC",
					length: 256
				};
			case "2.16.840.1.101.3.4.1.6":
				return {
					name: "AES-GCM",
					length: 128
				};
			case "2.16.840.1.101.3.4.1.26":
				return {
					name: "AES-GCM",
					length: 192
				};
			case "2.16.840.1.101.3.4.1.46":
				return {
					name: "AES-GCM",
					length: 256
				};
			case "2.16.840.1.101.3.4.1.4":
				return {
					name: "AES-CFB",
					length: 128
				};
			case "2.16.840.1.101.3.4.1.24":
				return {
					name: "AES-CFB",
					length: 192
				};
			case "2.16.840.1.101.3.4.1.44":
				return {
					name: "AES-CFB",
					length: 256
				};
			case "2.16.840.1.101.3.4.1.5":
				return {
					name: "AES-KW",
					length: 128
				};
			case "2.16.840.1.101.3.4.1.25":
				return {
					name: "AES-KW",
					length: 192
				};
			case "2.16.840.1.101.3.4.1.45":
				return {
					name: "AES-KW",
					length: 256
				};
			case "1.2.840.113549.2.7":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-1"
					}
				};
			case "1.2.840.113549.2.9":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-256"
					}
				};
			case "1.2.840.113549.2.10":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-384"
					}
				};
			case "1.2.840.113549.2.11":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-512"
					}
				};
			case "1.2.840.113549.1.9.16.3.5":
				return {
					name: "DH"
				};
			case "1.3.14.3.2.26":
				return {
					name: "SHA-1"
				};
			case "2.16.840.1.101.3.4.2.1":
				return {
					name: "SHA-256"
				};
			case "2.16.840.1.101.3.4.2.2":
				return {
					name: "SHA-384"
				};
			case "2.16.840.1.101.3.4.2.3":
				return {
					name: "SHA-512"
				};
			case "1.2.840.113549.1.5.12":
				return {
					name: "PBKDF2"
				};
			//region Special case - OIDs for ECC curves
			case "1.2.840.10045.3.1.7":
				return {
					name: "P-256"
				};
			case "1.3.132.0.34":
				return {
					name: "P-384"
				};
			case "1.3.132.0.35":
				return {
					name: "P-521"
				};
			//endregion
			default:
		}

		return {};
	}
	//**************************************************************************************
	/**
  * Getting hash algorithm by signature algorithm
  * @param {AlgorithmIdentifier} signatureAlgorithm Signature algorithm
  * @returns {string}
  */
	function getHashAlgorithm(signatureAlgorithm) {
		var result = "";

		switch (signatureAlgorithm.algorithmId) {
			case "1.2.840.10045.4.1": // ecdsa-with-SHA1
			case "1.2.840.113549.1.1.5":
				result = "SHA-1";
				break;
			case "1.2.840.10045.4.3.2": // ecdsa-with-SHA256
			case "1.2.840.113549.1.1.11":
				result = "SHA-256";
				break;
			case "1.2.840.10045.4.3.3": // ecdsa-with-SHA384
			case "1.2.840.113549.1.1.12":
				result = "SHA-384";
				break;
			case "1.2.840.10045.4.3.4": // ecdsa-with-SHA512
			case "1.2.840.113549.1.1.13":
				result = "SHA-512";
				break;
			case "1.2.840.113549.1.1.10":
				// RSA-PSS
				{
					try {
						var params = new RSASSAPSSParams({ schema: signatureAlgorithm.algorithmParams });
						if ("hashAlgorithm" in params) {
							var algorithm = getAlgorithmByOID(params.hashAlgorithm.algorithmId);
							if ("name" in algorithm === false) return "";

							result = algorithm.name;
						} else result = "SHA-1";
					} catch (ex) {}
				}
				break;
			default:
		}

		return result;
	}
	//**************************************************************************************
	/**
  * Check that all OIDs are mapped to existing WebCrypto API algorithms
  * @param {Array.<string>} oids Array with OIDs for checking
  * @returns {{indication}}
  */
	function checkOids$1(oids) {
		var _iteratorNormalCompletion13 = true;
		var _didIteratorError13 = false;
		var _iteratorError13 = undefined;

		try {
			for (var _iterator13 = oids.entries()[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
				var _step13$value = _slicedToArray(_step13.value, 2);

				var index = _step13$value[0];
				var oid = _step13$value[1];

				var algorithm = getAlgorithmByOID(oid);
				if ("name" in algorithm === false) {
					return {
						indication: FAILED,
						message: index
					};
				}
			}
		} catch (err) {
			_didIteratorError13 = true;
			_iteratorError13 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion13 && _iterator13.return) {
					_iterator13.return();
				}
			} finally {
				if (_didIteratorError13) {
					throw _iteratorError13;
				}
			}
		}

		return {
			indication: PASSED
		};
	}
	//**************************************************************************************
	//endregion
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var AttributeTypeAndValue = function () {
		//**********************************************************************************
		/**
   * Constructor for AttributeTypeAndValue class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AttributeTypeAndValue() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AttributeTypeAndValue);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description type
    */
			this.type = getParametersValue(parameters, "type", AttributeTypeAndValue.defaultValues("type"));
			/**
    * @type {Object}
    * @description Value of the AttributeTypeAndValue class
    */
			this.value = getParametersValue(parameters, "value", AttributeTypeAndValue.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AttributeTypeAndValue, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				/**
     * @type {{verified: boolean}|{verified: boolean, result: {type: Object, typeValue: Object}}}
     */
				var asn1 = compareSchema(schema, schema, AttributeTypeAndValue.schema({
					names: {
						type: "type",
						value: "typeValue"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ATTR_TYPE_AND_VALUE");
				//endregion

				//region Get internal properties from parsed schema
				this.type = asn1.result.type.valueBlock.toString();
				this.value = asn1.result.typeValue;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.type }), this.value]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					type: this.type
				};

				if (Object.keys(this.value).length !== 0) _object.value = this.value.toJSON();else _object.value = this.value;

				return _object;
			}
			//**********************************************************************************
			/**
    * Compare two AttributeTypeAndValue values, or AttributeTypeAndValue with ArrayBuffer value
    * @param {(AttributeTypeAndValue|ArrayBuffer)} compareTo The value compare to current
    * @returns {boolean}
    */

		}, {
			key: "isEqual",
			value: function isEqual(compareTo) {
				if (compareTo instanceof AttributeTypeAndValue) {
					if (this.type !== compareTo.type) return false;

					if (this.value instanceof Utf8String && compareTo.value instanceof Utf8String || this.value instanceof BmpString && compareTo.value instanceof BmpString || this.value instanceof UniversalString && compareTo.value instanceof UniversalString || this.value instanceof NumericString && compareTo.value instanceof NumericString || this.value instanceof PrintableString && compareTo.value instanceof PrintableString || this.value instanceof TeletexString && compareTo.value instanceof TeletexString || this.value instanceof VideotexString && compareTo.value instanceof VideotexString || this.value instanceof IA5String && compareTo.value instanceof IA5String || this.value instanceof GraphicString && compareTo.value instanceof GraphicString || this.value instanceof VisibleString && compareTo.value instanceof VisibleString || this.value instanceof GeneralString && compareTo.value instanceof GeneralString || this.value instanceof CharacterString && compareTo.value instanceof CharacterString) {
						var value1 = stringPrep(this.value.valueBlock.value);
						var value2 = stringPrep(compareTo.value.valueBlock.value);

						if (value1.localeCompare(value2) !== 0) return false;
					} else // Comparing as two ArrayBuffers
						{
							if (isEqualBuffer(this.value.valueBeforeDecode, compareTo.value.valueBeforeDecode) === false) return false;
						}

					return true;
				}

				if (compareTo instanceof ArrayBuffer) return isEqualBuffer(this.value.valueBeforeDecode, compareTo);

				return false;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return "";
					case "value":
						return {};
					default:
						throw new Error("Invalid member name for AttributeTypeAndValue class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//AttributeTypeAndValue ::= Sequence {
				//    type     AttributeType,
				//    value    AttributeValue }
				//
				//AttributeType ::= OBJECT IDENTIFIER
				//
				//AttributeValue ::= ANY -- DEFINED BY AttributeType

				/**
     * @type {Object}
     * @property {string} [blockName] Name for entire block
     * @property {string} [type] Name for "type" element
     * @property {string} [value] Name for "value" element
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.type || "" }), new Any({ name: names.value || "" })]
				});
			}
		}]);

		return AttributeTypeAndValue;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var RelativeDistinguishedNames = function () {
		//**********************************************************************************
		/**
   * Constructor for RelativeDistinguishedNames class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {Array.<AttributeTypeAndValue>} [typesAndValues] Array of "type and value" objects
   * @property {ArrayBuffer} [valueBeforeDecode] Value of the RDN before decoding from schema
   */
		function RelativeDistinguishedNames() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RelativeDistinguishedNames);

			//region Internal properties of the object
			/**
    * @type {Array.<AttributeTypeAndValue>}
    * @description Array of "type and value" objects
    */
			this.typesAndValues = getParametersValue(parameters, "typesAndValues", RelativeDistinguishedNames.defaultValues("typesAndValues"));
			/**
    * @type {ArrayBuffer}
    * @description Value of the RDN before decoding from schema
    */
			this.valueBeforeDecode = getParametersValue(parameters, "valueBeforeDecode", RelativeDistinguishedNames.defaultValues("valueBeforeDecode"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RelativeDistinguishedNames, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				/**
     * @type {{verified: boolean}|{verified: boolean, result: {RDN: Object, typesAndValues: Array.<Object>}}}
     */
				var asn1 = compareSchema(schema, schema, RelativeDistinguishedNames.schema({
					names: {
						blockName: "RDN",
						repeatedSet: "typesAndValues"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RDN");
				//endregion

				//region Get internal properties from parsed schema
				if ("typesAndValues" in asn1.result) // Could be a case when there is no "types and values"
					this.typesAndValues = Array.from(asn1.result.typesAndValues, function (element) {
						return new AttributeTypeAndValue({ schema: element });
					});

				this.valueBeforeDecode = asn1.result.RDN.valueBeforeDecode;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Decode stored TBS value
				if (this.valueBeforeDecode.byteLength === 0) // No stored encoded array, create "from scratch"
					{
						return new Sequence({
							value: [new Set({
								value: Array.from(this.typesAndValues, function (element) {
									return element.toSchema();
								})
							})]
						});
					}

				var asn1 = fromBER(this.valueBeforeDecode);
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return asn1.result;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					typesAndValues: Array.from(this.typesAndValues, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************
			/**
    * Compare two RDN values, or RDN with ArrayBuffer value
    * @param {(RelativeDistinguishedNames|ArrayBuffer)} compareTo The value compare to current
    * @returns {boolean}
    */

		}, {
			key: "isEqual",
			value: function isEqual(compareTo) {
				if (compareTo instanceof RelativeDistinguishedNames) {
					if (this.typesAndValues.length !== compareTo.typesAndValues.length) return false;

					var _iteratorNormalCompletion14 = true;
					var _didIteratorError14 = false;
					var _iteratorError14 = undefined;

					try {
						for (var _iterator14 = this.typesAndValues.entries()[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
							var _step14$value = _slicedToArray(_step14.value, 2);

							var index = _step14$value[0];
							var typeAndValue = _step14$value[1];

							if (typeAndValue.isEqual(compareTo.typesAndValues[index]) === false) return false;
						}
					} catch (err) {
						_didIteratorError14 = true;
						_iteratorError14 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion14 && _iterator14.return) {
								_iterator14.return();
							}
						} finally {
							if (_didIteratorError14) {
								throw _iteratorError14;
							}
						}
					}

					return true;
				}

				if (compareTo instanceof ArrayBuffer) return isEqualBuffer(this.valueBeforeDecode, compareTo);

				return false;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "typesAndValues":
						return [];
					case "valueBeforeDecode":
						return new ArrayBuffer(0);
					default:
						throw new Error("Invalid member name for RelativeDistinguishedNames class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "typesAndValues":
						return memberValue.length === 0;
					case "valueBeforeDecode":
						return memberValue.byteLength === 0;
					default:
						throw new Error("Invalid member name for RelativeDistinguishedNames class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RDNSequence ::= Sequence OF RelativeDistinguishedName
				//
				//RelativeDistinguishedName ::=
				//SET SIZE (1..MAX) OF AttributeTypeAndValue

				/**
     * @type {Object}
     * @property {string} [blockName] Name for entire block
     * @property {string} [repeatedSequence] Name for "repeatedSequence" block
     * @property {string} [repeatedSet] Name for "repeatedSet" block
     * @property {string} [typeAndValue] Name for "typeAndValue" block
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.repeatedSequence || "",
						value: new Set({
							value: [new Repeated({
								name: names.repeatedSet || "",
								value: AttributeTypeAndValue.schema(names.typeAndValue || {})
							})]
						})
					})]
				});
			}
		}]);

		return RelativeDistinguishedNames;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var Time = function () {
		//**********************************************************************************
		/**
   * Constructor for Time class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {number} [type] 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
   * @property {Date} [value] Value of the Time class
   */
		function Time() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Time);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
    */
			this.type = getParametersValue(parameters, "type", Time.defaultValues("type"));
			/**
    * @type {Date}
    * @description Value of the Time class
    */
			this.value = getParametersValue(parameters, "value", Time.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Time, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Time.schema({
					names: {
						utcTimeName: "utcTimeName",
						generalTimeName: "generalTimeName"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for Time");
				//endregion

				//region Get internal properties from parsed schema
				if ("utcTimeName" in asn1.result) {
					this.type = 0;
					this.value = asn1.result.utcTimeName.toDate();
				}
				if ("generalTimeName" in asn1.result) {
					this.type = 1;
					this.value = asn1.result.generalTimeName.toDate();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				var result = {};

				if (this.type === 0) result = new UTCTime({ valueDate: this.value });
				if (this.type === 1) result = new GeneralizedTime({ valueDate: this.value });

				return result;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					type: this.type,
					value: this.value
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return 0;
					case "value":
						return new Date(0, 0, 0);
					default:
						throw new Error("Invalid member name for Time class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @param {boolean} optional Flag that current schema should be optional
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
				var optional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [utcTimeName] Name for "utcTimeName" choice
     * @property {string} [generalTimeName] Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					optional: optional,
					value: [new UTCTime({ name: names.utcTimeName || "" }), new GeneralizedTime({ name: names.generalTimeName || "" })]
				});
			}
		}]);

		return Time;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var SubjectDirectoryAttributes = function () {
		//**********************************************************************************
		/**
   * Constructor for SubjectDirectoryAttributes class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function SubjectDirectoryAttributes() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, SubjectDirectoryAttributes);

			//region Internal properties of the object
			/**
    * @type {Array.<Attribute>}
    * @description attributes
    */
			this.attributes = getParametersValue(parameters, "attributes", SubjectDirectoryAttributes.defaultValues("attributes"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(SubjectDirectoryAttributes, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, SubjectDirectoryAttributes.schema({
					names: {
						attributes: "attributes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for SubjectDirectoryAttributes");
				//endregion

				//region Get internal properties from parsed schema
				this.attributes = Array.from(asn1.result.attributes, function (element) {
					return new Attribute({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.attributes, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					attributes: Array.from(this.attributes, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "attributes":
						return [];
					default:
						throw new Error("Invalid member name for SubjectDirectoryAttributes class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// SubjectDirectoryAttributes OID ::= 2.5.29.9
				//
				//SubjectDirectoryAttributes ::= SEQUENCE SIZE (1..MAX) OF Attribute

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [utcTimeName] Name for "utcTimeName" choice
     * @property {string} [generalTimeName] Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.attributes || "",
						value: Attribute.schema()
					})]
				});
			}
		}]);

		return SubjectDirectoryAttributes;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PrivateKeyUsagePeriod = function () {
		//**********************************************************************************
		/**
   * Constructor for PrivateKeyUsagePeriod class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PrivateKeyUsagePeriod() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PrivateKeyUsagePeriod);

			//region Internal properties of the object
			if ("notBefore" in parameters)
				/**
     * @type {Date}
     * @description notBefore
     */
				this.notBefore = getParametersValue(parameters, "notBefore", PrivateKeyUsagePeriod.defaultValues("notBefore"));

			if ("notAfter" in parameters)
				/**
     * @type {Date}
     * @description notAfter
     */
				this.notAfter = getParametersValue(parameters, "notAfter", PrivateKeyUsagePeriod.defaultValues("notAfter"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PrivateKeyUsagePeriod, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PrivateKeyUsagePeriod.schema({
					names: {
						notBefore: "notBefore",
						notAfter: "notAfter"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PrivateKeyUsagePeriod");
				//endregion

				//region Get internal properties from parsed schema
				if ("notBefore" in asn1.result) {
					var localNotBefore = new GeneralizedTime();
					localNotBefore.fromBuffer(asn1.result.notBefore.valueBlock.valueHex);
					this.notBefore = localNotBefore.toDate();
				}

				if ("notAfter" in asn1.result) {
					var localNotAfter = new GeneralizedTime({ valueHex: asn1.result.notAfter.valueBlock.valueHex });
					localNotAfter.fromBuffer(asn1.result.notAfter.valueBlock.valueHex);
					this.notAfter = localNotAfter.toDate();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("notBefore" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						valueHex: new GeneralizedTime({ valueDate: this.notBefore }).valueBlock.valueHex
					}));
				}

				if ("notAfter" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: new GeneralizedTime({ valueDate: this.notAfter }).valueBlock.valueHex
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("notBefore" in this) object.notBefore = this.notBefore;

				if ("notAfter" in this) object.notAfter = this.notAfter;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "notBefore":
						return new Date();
					case "notAfter":
						return new Date();
					default:
						throw new Error("Invalid member name for PrivateKeyUsagePeriod class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// PrivateKeyUsagePeriod OID ::= 2.5.29.16
				//
				//PrivateKeyUsagePeriod ::= SEQUENCE {
				//    notBefore       [0]     GeneralizedTime OPTIONAL,
				//    notAfter        [1]     GeneralizedTime OPTIONAL }
				//-- either notBefore or notAfter MUST be present

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [notBefore]
     * @property {string} [notAfter]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.notBefore || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						}
					}), new Primitive({
						name: names.notAfter || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					})]
				});
			}
		}]);

		return PrivateKeyUsagePeriod;
	}();
	//**************************************************************************************

	//**************************************************************************************
	//region Additional asn1js schema elements existing inside GENERAL_NAME schema
	//**************************************************************************************
	/**
  * Schema for "builtInStandardAttributes" of "ORAddress"
  * @param {Object} parameters
  * @property {Object} [names]
  * @param {boolean} optional
  * @returns {Sequence}
  */


	function builtInStandardAttributes() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var optional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		//builtInStandardAttributes ::= Sequence {
		//    country-name                  CountryName OPTIONAL,
		//    administration-domain-name    AdministrationDomainName OPTIONAL,
		//    network-address           [0] IMPLICIT NetworkAddress OPTIONAL,
		//    terminal-identifier       [1] IMPLICIT TerminalIdentifier OPTIONAL,
		//    private-domain-name       [2] PrivateDomainName OPTIONAL,
		//    organization-name         [3] IMPLICIT OrganizationName OPTIONAL,
		//    numeric-user-identifier   [4] IMPLICIT NumericUserIdentifier OPTIONAL,
		//    personal-name             [5] IMPLICIT PersonalName OPTIONAL,
		//    organizational-unit-names [6] IMPLICIT OrganizationalUnitNames OPTIONAL }

		/**
   * @type {Object}
   * @property {string} [country_name]
   * @property {string} [administration_domain_name]
   * @property {string} [network_address]
   * @property {string} [terminal_identifier]
   * @property {string} [private_domain_name]
   * @property {string} [organization_name]
   * @property {string} [numeric_user_identifier]
   * @property {string} [personal_name]
   * @property {string} [organizational_unit_names]
   */
		var names = getParametersValue(parameters, "names", {});

		return new Sequence({
			optional: optional,
			value: [new Constructed({
				optional: true,
				idBlock: {
					tagClass: 2, // APPLICATION-SPECIFIC
					tagNumber: 1 // [1]
				},
				name: names.country_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 2, // APPLICATION-SPECIFIC
					tagNumber: 2 // [2]
				},
				name: names.administration_domain_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				name: names.network_address || "",
				isHexOnly: true
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				name: names.terminal_identifier || "",
				isHexOnly: true
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				name: names.private_domain_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				name: names.organization_name || "",
				isHexOnly: true
			}), new Primitive({
				optional: true,
				name: names.numeric_user_identifier || "",
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 4 // [4]
				},
				isHexOnly: true
			}), new Constructed({
				optional: true,
				name: names.personal_name || "",
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 5 // [5]
				},
				value: [new Primitive({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					},
					isHexOnly: true
				})]
			}), new Constructed({
				optional: true,
				name: names.organizational_unit_names || "",
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 6 // [6]
				},
				value: [new Repeated({
					value: new PrintableString()
				})]
			})]
		});
	}
	//**************************************************************************************
	/**
  * Schema for "builtInDomainDefinedAttributes" of "ORAddress"
  * @param {boolean} optional
  * @returns {Sequence}
  */
	function builtInDomainDefinedAttributes() {
		var optional = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

		return new Sequence({
			optional: optional,
			value: [new PrintableString(), new PrintableString()]
		});
	}
	//**************************************************************************************
	/**
  * Schema for "builtInDomainDefinedAttributes" of "ORAddress"
  * @param {boolean} optional
  * @returns {Set}
  */
	function extensionAttributes() {
		var optional = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

		return new Set({
			optional: optional,
			value: [new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				isHexOnly: true
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [new Any()]
			})]
		});
	}
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var GeneralName = function () {
		//**********************************************************************************
		/**
   * Constructor for GeneralName class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {number} [type] value type - from a tagged value (0 for "otherName", 1 for "rfc822Name" etc.)
   * @property {Object} [value] asn1js object having GENERAL_NAME value (type depends on "type" value)
   */
		function GeneralName() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralName);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description value type - from a tagged value (0 for "otherName", 1 for "rfc822Name" etc.)
    */
			this.type = getParametersValue(parameters, "type", GeneralName.defaultValues("type"));
			/**
    * @type {Object}
    * @description asn1js object having GENERAL_NAME value (type depends on "type" value)
    */
			this.value = getParametersValue(parameters, "value", GeneralName.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(GeneralName, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, GeneralName.schema({
					names: {
						blockName: "blockName",
						otherName: "otherName",
						rfc822Name: "rfc822Name",
						dNSName: "dNSName",
						x400Address: "x400Address",
						directoryName: {
							names: {
								blockName: "directoryName"
							}
						},
						ediPartyName: "ediPartyName",
						uniformResourceIdentifier: "uniformResourceIdentifier",
						iPAddress: "iPAddress",
						registeredID: "registeredID"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for GENERAL_NAME");
				//endregion

				//region Get internal properties from parsed schema
				this.type = asn1.result.blockName.idBlock.tagNumber;

				switch (this.type) {
					case 0:
						// otherName
						this.value = asn1.result.blockName;
						break;
					case 1: // rfc822Name + dNSName + uniformResourceIdentifier
					case 2:
					case 6:
						{
							var value = asn1.result.blockName;

							value.idBlock.tagClass = 1; // UNIVERSAL
							value.idBlock.tagNumber = 22; // IA5STRING

							var valueBER = value.toBER(false);

							this.value = fromBER(valueBER).result.valueBlock.value;
						}
						break;
					case 3:
						// x400Address
						this.value = asn1.result.blockName;
						break;
					case 4:
						// directoryName
						this.value = new RelativeDistinguishedNames({ schema: asn1.result.directoryName });
						break;
					case 5:
						// ediPartyName
						this.value = asn1.result.ediPartyName;
						break;
					case 7:
						// iPAddress
						this.value = new OctetString({ valueHex: asn1.result.blockName.valueBlock.valueHex });
						break;
					case 8:
						// registeredID
						{
							var _value2 = asn1.result.blockName;

							_value2.idBlock.tagClass = 1; // UNIVERSAL
							_value2.idBlock.tagNumber = 6; // ObjectIdentifier

							var _valueBER = _value2.toBER(false);

							this.value = fromBER(_valueBER).result.valueBlock.toString(); // Getting a string representation of the ObjectIdentifier
						}
						break;
					default:
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				switch (this.type) {
					case 0:
					case 3:
					case 5:
						return new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: this.type
							},
							value: [this.value]
						});
					case 1:
					case 2:
					case 6:
						{
							var value = new IA5String({ value: this.value });

							value.idBlock.tagClass = 3;
							value.idBlock.tagNumber = this.type;

							return value;
						}
					case 4:
						return new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 4
							},
							value: [this.value.toSchema()]
						});
					case 7:
						{
							var _value3 = this.value;

							_value3.idBlock.tagClass = 3;
							_value3.idBlock.tagNumber = this.type;

							return _value3;
						}
					case 8:
						{
							var _value4 = new ObjectIdentifier({ value: this.value });

							_value4.idBlock.tagClass = 3;
							_value4.idBlock.tagNumber = this.type;

							return _value4;
						}
					default:
						return GeneralName.schema();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					type: this.type
				};

				if (typeof this.value === "string") _object.value = this.value;else _object.value = this.value.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return 9;
					case "value":
						return {};
					default:
						throw new Error("Invalid member name for GeneralName class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "type":
						return memberValue === GeneralName.defaultValues(memberName);
					case "value":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error("Invalid member name for GeneralName class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//GeneralName ::= Choice {
				//    otherName                       [0]     OtherName,
				//    rfc822Name                      [1]     IA5String,
				//    dNSName                         [2]     IA5String,
				//    x400Address                     [3]     ORAddress,
				//    directoryName                   [4]     value,
				//    ediPartyName                    [5]     EDIPartyName,
				//    uniformResourceIdentifier       [6]     IA5String,
				//    iPAddress                       [7]     OCTET STRING,
				//    registeredID                    [8]     OBJECT IDENTIFIER }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {Object} [directoryName]
     * @property {Object} [builtInStandardAttributes]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					value: [new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						name: names.blockName || "",
						value: [new ObjectIdentifier(), new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [new Any()]
						})]
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						}
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						name: names.blockName || "",
						value: [builtInStandardAttributes(names.builtInStandardAttributes || {}, false), builtInDomainDefinedAttributes(true), extensionAttributes(true)]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 4 // [4]
						},
						name: names.blockName || "",
						value: [RelativeDistinguishedNames.schema(names.directoryName || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 5 // [5]
						},
						name: names.blockName || "",
						value: [new Constructed({
							optional: true,
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [new Choice({
								value: [new TeletexString(), new PrintableString(), new UniversalString(), new Utf8String(), new BmpString()]
							})]
						}), new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [new Choice({
								value: [new TeletexString(), new PrintableString(), new UniversalString(), new Utf8String(), new BmpString()]
							})]
						})]
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 6 // [6]
						}
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 7 // [7]
						}
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 8 // [8]
						}
					})]
				});
			}
		}]);

		return GeneralName;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var AltName = function () {
		//**********************************************************************************
		/**
   * Constructor for AltName class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AltName() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AltName);

			//region Internal properties of the object
			/**
    * @type {Array.<GeneralName>}
    * @description type
    */
			this.altNames = getParametersValue(parameters, "altNames", AltName.defaultValues("altNames"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AltName, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, AltName.schema({
					names: {
						altNames: "altNames"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AltName");
				//endregion

				//region Get internal properties from parsed schema
				if ("altNames" in asn1.result) this.altNames = Array.from(asn1.result.altNames, function (element) {
					return new GeneralName({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.altNames, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					altNames: Array.from(this.altNames, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "altNames":
						return [];
					default:
						throw new Error("Invalid member name for AltName class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// SubjectAltName OID ::= 2.5.29.17
				// IssuerAltName OID ::= 2.5.29.18
				//
				// AltName ::= GeneralNames

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [altNames]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.altNames || "",
						value: GeneralName.schema()
					})]
				});
			}
		}]);

		return AltName;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var BasicConstraints = function () {
		//**********************************************************************************
		/**
   * Constructor for BasicConstraints class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {Object} [cA]
   * @property {Object} [pathLenConstraint]
   */
		function BasicConstraints() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, BasicConstraints);

			//region Internal properties of the object
			/**
    * @type {boolean}
    * @description cA
    */
			this.cA = getParametersValue(parameters, "cA", false);

			if ("pathLenConstraint" in parameters)
				/**
     * @type {number|Integer}
     * @description pathLenConstraint
     */
				this.pathLenConstraint = getParametersValue(parameters, "pathLenConstraint", 0);
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(BasicConstraints, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, BasicConstraints.schema({
					names: {
						cA: "cA",
						pathLenConstraint: "pathLenConstraint"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for BasicConstraints");
				//endregion

				//region Get internal properties from parsed schema
				if ("cA" in asn1.result) this.cA = asn1.result.cA.valueBlock.value;

				if ("pathLenConstraint" in asn1.result) {
					if (asn1.result.pathLenConstraint.valueBlock.isHexOnly) this.pathLenConstraint = asn1.result.pathLenConstraint;else this.pathLenConstraint = asn1.result.pathLenConstraint.valueBlock.valueDec;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if (this.cA !== BasicConstraints.defaultValues("cA")) outputArray.push(new Boolean({ value: this.cA }));

				if ("pathLenConstraint" in this) {
					if (this.pathLenConstraint instanceof Integer) outputArray.push(this.pathLenConstraint);else outputArray.push(new Integer({ value: this.pathLenConstraint }));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if (this.cA !== BasicConstraints.defaultValues("cA")) object.cA = this.cA;

				if ("pathLenConstraint" in this) {
					if (this.pathLenConstraint instanceof Integer) object.pathLenConstraint = this.pathLenConstraint.toJSON();else object.pathLenConstraint = this.pathLenConstraint;
				}

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "cA":
						return false;
					default:
						throw new Error("Invalid member name for BasicConstraints class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// BasicConstraints OID ::= 2.5.29.19
				//
				//BasicConstraints ::= SEQUENCE {
				//    cA                      BOOLEAN DEFAULT FALSE,
				//    pathLenConstraint       INTEGER (0..MAX) OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [cA]
     * @property {string} [pathLenConstraint]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Boolean({
						optional: true,
						name: names.cA || ""
					}), new Integer({
						optional: true,
						name: names.pathLenConstraint || ""
					})]
				});
			}
		}]);

		return BasicConstraints;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var IssuingDistributionPoint = function () {
		//**********************************************************************************
		/**
   * Constructor for IssuingDistributionPoint class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function IssuingDistributionPoint() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, IssuingDistributionPoint);

			//region Internal properties of the object
			if ("distributionPoint" in parameters)
				/**
     * @type {Array.<GeneralName>|RelativeDistinguishedNames}
     * @description distributionPoint
     */
				this.distributionPoint = getParametersValue(parameters, "distributionPoint", IssuingDistributionPoint.defaultValues("distributionPoint"));

			/**
    * @type {boolean}
    * @description onlyContainsUserCerts
    */
			this.onlyContainsUserCerts = getParametersValue(parameters, "onlyContainsUserCerts", IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"));

			/**
    * @type {boolean}
    * @description onlyContainsCACerts
    */
			this.onlyContainsCACerts = getParametersValue(parameters, "onlyContainsCACerts", IssuingDistributionPoint.defaultValues("onlyContainsCACerts"));

			if ("onlySomeReasons" in parameters)
				/**
     * @type {number}
     * @description onlySomeReasons
     */
				this.onlySomeReasons = getParametersValue(parameters, "onlySomeReasons", IssuingDistributionPoint.defaultValues("onlySomeReasons"));

			/**
    * @type {boolean}
    * @description indirectCRL
    */
			this.indirectCRL = getParametersValue(parameters, "indirectCRL", IssuingDistributionPoint.defaultValues("indirectCRL"));

			/**
    * @type {boolean}
    * @description onlyContainsAttributeCerts
    */
			this.onlyContainsAttributeCerts = getParametersValue(parameters, "onlyContainsAttributeCerts", IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(IssuingDistributionPoint, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, IssuingDistributionPoint.schema({
					names: {
						distributionPoint: "distributionPoint",
						distributionPointNames: "distributionPointNames",
						onlyContainsUserCerts: "onlyContainsUserCerts",
						onlyContainsCACerts: "onlyContainsCACerts",
						onlySomeReasons: "onlySomeReasons",
						indirectCRL: "indirectCRL",
						onlyContainsAttributeCerts: "onlyContainsAttributeCerts"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for IssuingDistributionPoint");
				//endregion

				//region Get internal properties from parsed schema
				if ("distributionPoint" in asn1.result) {
					switch (true) {
						case asn1.result.distributionPoint.idBlock.tagNumber === 0:
							// GENERAL_NAMES variant
							this.distributionPoint = Array.from(asn1.result.distributionPointNames, function (element) {
								return new GeneralName({ schema: element });
							});
							break;
						case asn1.result.distributionPoint.idBlock.tagNumber === 1:
							// RDN variant
							{
								asn1.result.distributionPoint.idBlock.tagClass = 1; // UNIVERSAL
								asn1.result.distributionPoint.idBlock.tagNumber = 16; // SEQUENCE

								this.distributionPoint = new RelativeDistinguishedNames({ schema: asn1.result.distributionPoint });
							}
							break;
						default:
							throw new Error("Unknown tagNumber for distributionPoint: {$asn1.result.distributionPoint.idBlock.tagNumber}");
					}
				}

				if ("onlyContainsUserCerts" in asn1.result) {
					var view = new Uint8Array(asn1.result.onlyContainsUserCerts.valueBlock.valueHex);
					this.onlyContainsUserCerts = view[0] !== 0x00;
				}

				if ("onlyContainsCACerts" in asn1.result) {
					var _view2 = new Uint8Array(asn1.result.onlyContainsCACerts.valueBlock.valueHex);
					this.onlyContainsCACerts = _view2[0] !== 0x00;
				}

				if ("onlySomeReasons" in asn1.result) {
					var _view3 = new Uint8Array(asn1.result.onlySomeReasons.valueBlock.valueHex);
					this.onlySomeReasons = _view3[0];
				}

				if ("indirectCRL" in asn1.result) {
					var _view4 = new Uint8Array(asn1.result.indirectCRL.valueBlock.valueHex);
					this.indirectCRL = _view4[0] !== 0x00;
				}

				if ("onlyContainsAttributeCerts" in asn1.result) {
					var _view5 = new Uint8Array(asn1.result.onlyContainsAttributeCerts.valueBlock.valueHex);
					this.onlyContainsAttributeCerts = _view5[0] !== 0x00;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("distributionPoint" in this) {
					var value = void 0;

					if (this.distributionPoint instanceof Array) {
						value = new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: Array.from(this.distributionPoint, function (element) {
								return element.toSchema();
							})
						});
					} else {
						value = this.distributionPoint.toSchema();

						value.idBlock.tagClass = 3; // CONTEXT - SPECIFIC
						value.idBlock.tagNumber = 1; // [1]
					}

					outputArray.push(value);
				}

				if (this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if (this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if ("onlySomeReasons" in this) {
					var buffer = new ArrayBuffer(1);
					var view = new Uint8Array(buffer);

					view[0] = this.onlySomeReasons;

					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						valueHex: buffer
					}));
				}

				if (this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 4 // [4]
						},
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if (this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 5 // [5]
						},
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("distributionPoint" in this) {
					if (this.distributionPoint instanceof Array) object.distributionPoint = Array.from(this.distributionPoint, function (element) {
						return element.toJSON();
					});else object.distributionPoint = this.distributionPoint.toJSON();
				}

				if (this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts")) object.onlyContainsUserCerts = this.onlyContainsUserCerts;

				if (this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts")) object.onlyContainsCACerts = this.onlyContainsCACerts;

				if ("onlySomeReasons" in this) object.onlySomeReasons = this.onlySomeReasons;

				if (this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL")) object.indirectCRL = this.indirectCRL;

				if (this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts")) object.onlyContainsAttributeCerts = this.onlyContainsAttributeCerts;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoint":
						return [];
					case "onlyContainsUserCerts":
						return false;
					case "onlyContainsCACerts":
						return false;
					case "onlySomeReasons":
						return 0;
					case "indirectCRL":
						return false;
					case "onlyContainsAttributeCerts":
						return false;
					default:
						throw new Error("Invalid member name for IssuingDistributionPoint class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// IssuingDistributionPoint OID ::= 2.5.29.28
				//
				//IssuingDistributionPoint ::= SEQUENCE {
				//    distributionPoint          [0] DistributionPointName OPTIONAL,
				//    onlyContainsUserCerts      [1] BOOLEAN DEFAULT FALSE,
				//    onlyContainsCACerts        [2] BOOLEAN DEFAULT FALSE,
				//    onlySomeReasons            [3] ReasonFlags OPTIONAL,
				//    indirectCRL                [4] BOOLEAN DEFAULT FALSE,
				//    onlyContainsAttributeCerts [5] BOOLEAN DEFAULT FALSE }
				//
				//ReasonFlags ::= BIT STRING {
				//    unused                  (0),
				//    keyCompromise           (1),
				//    cACompromise            (2),
				//    affiliationChanged      (3),
				//    superseded              (4),
				//    cessationOfOperation    (5),
				//    certificateHold         (6),
				//    privilegeWithdrawn      (7),
				//    aACompromise            (8) }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [distributionPoint]
     * @property {string} [distributionPointNames]
     * @property {string} [onlyContainsUserCerts]
     * @property {string} [onlyContainsCACerts]
     * @property {string} [onlySomeReasons]
     * @property {string} [indirectCRL]
     * @property {string} [onlyContainsAttributeCerts]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Choice({
							value: [new Constructed({
								name: names.distributionPoint || "",
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 0 // [0]
								},
								value: [new Repeated({
									name: names.distributionPointNames || "",
									value: GeneralName.schema()
								})]
							}), new Constructed({
								name: names.distributionPoint || "",
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: RelativeDistinguishedNames.schema().valueBlock.value
							})]
						})]
					}), new Primitive({
						name: names.onlyContainsUserCerts || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					}), // IMPLICIT boolean value
					new Primitive({
						name: names.onlyContainsCACerts || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						}
					}), // IMPLICIT boolean value
					new Primitive({
						name: names.onlySomeReasons || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						}
					}), // IMPLICIT bitstring value
					new Primitive({
						name: names.indirectCRL || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 4 // [4]
						}
					}), // IMPLICIT boolean value
					new Primitive({
						name: names.onlyContainsAttributeCerts || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 5 // [5]
						}
					}) // IMPLICIT boolean value
					]
				});
			}
		}]);

		return IssuingDistributionPoint;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var GeneralNames = function () {
		//**********************************************************************************
		/**
   * Constructor for GeneralNames class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function GeneralNames() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralNames);

			//region Internal properties of the object
			/**
    * @type {Array.<GeneralName>}
    * @description Array of "general names"
    */
			this.names = getParametersValue(parameters, "names", GeneralNames.defaultValues("names"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(GeneralNames, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, GeneralNames.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for GeneralNames");
				//endregion

				//region Get internal properties from parsed schema
				this.names = Array.from(asn1.result.names, function (element) {
					return new GeneralName({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.names, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					names: Array.from(this.names, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "names":
						return [];
					default:
						throw new Error("Invalid member name for GeneralNames class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				/**
     * @type {Object}
     * @property {string} utcTimeName Name for "utcTimeName" choice
     * @property {string} generalTimeName Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					value: [new Repeated({
						name: names.blockName || "names",
						value: GeneralName.schema()
					})]
				});
			}
		}]);

		return GeneralNames;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var GeneralSubtree = function () {
		//**********************************************************************************
		/**
   * Constructor for GeneralSubtree class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function GeneralSubtree() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralSubtree);

			//region Internal properties of the object
			/**
    * @type {GeneralName}
    * @description base
    */
			this.base = getParametersValue(parameters, "base", GeneralSubtree.defaultValues("base"));

			/**
    * @type {number|Integer}
    * @description base
    */
			this.minimum = getParametersValue(parameters, "minimum", GeneralSubtree.defaultValues("minimum"));

			if ("maximum" in parameters)
				/**
     * @type {number|Integer}
     * @description minimum
     */
				this.maximum = getParametersValue(parameters, "maximum", GeneralSubtree.defaultValues("maximum"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(GeneralSubtree, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, GeneralSubtree.schema({
					names: {
						base: {
							names: {
								blockName: "base"
							}
						},
						minimum: "minimum",
						maximum: "maximum"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ");
				//endregion

				//region Get internal properties from parsed schema
				this.base = new GeneralName({ schema: asn1.result.base });

				if ("minimum" in asn1.result) {
					if (asn1.result.minimum.valueBlock.isHexOnly) this.minimum = asn1.result.minimum;else this.minimum = asn1.result.minimum.valueBlock.valueDec;
				}

				if ("maximum" in asn1.result) {
					if (asn1.result.maximum.valueBlock.isHexOnly) this.maximum = asn1.result.maximum;else this.maximum = asn1.result.maximum.valueBlock.valueDec;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(this.base.toSchema());

				if (this.minimum !== 0) {
					var valueMinimum = 0;

					if (this.minimum instanceof Integer) valueMinimum = this.minimum;else valueMinimum = new Integer({ value: this.minimum });

					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [valueMinimum]
					}));
				}

				if ("maximum" in this) {
					var valueMaximum = 0;

					if (this.maximum instanceof Integer) valueMaximum = this.maximum;else valueMaximum = new Integer({ value: this.maximum });

					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [valueMaximum]
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					base: this.base.toJSON()
				};

				if (this.minimum !== 0) {
					if (typeof this.minimum === "number") object.minimum = this.minimum;else object.minimum = this.minimum.toJSON();
				}

				if ("maximum" in this) {
					if (typeof this.maximum === "number") object.maximum = this.maximum;else object.maximum = this.maximum.toJSON();
				}

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "base":
						return new GeneralName();
					case "minimum":
						return 0;
					case "maximum":
						return 0;
					default:
						throw new Error("Invalid member name for GeneralSubtree class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//GeneralSubtree ::= SEQUENCE {
				//    base                    GeneralName,
				//    minimum         [0]     BaseDistance DEFAULT 0,
				//    maximum         [1]     BaseDistance OPTIONAL }
				//
				//BaseDistance ::= INTEGER (0..MAX)

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [base]
     * @property {string} [minimum]
     * @property {string} [maximum]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [GeneralName.schema(names.base || {}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Integer({ name: names.minimum || "" })]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Integer({ name: names.maximum || "" })]
					})]
				});
			}
		}]);

		return GeneralSubtree;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var NameConstraints = function () {
		//**********************************************************************************
		/**
   * Constructor for NameConstraints class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function NameConstraints() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, NameConstraints);

			//region Internal properties of the object
			if ("permittedSubtrees" in parameters)
				/**
     * @type {Array.<GeneralSubtree>}
     * @description permittedSubtrees
     */
				this.permittedSubtrees = getParametersValue(parameters, "permittedSubtrees", NameConstraints.defaultValues("permittedSubtrees"));

			if ("excludedSubtrees" in parameters)
				/**
     * @type {Array.<GeneralSubtree>}
     * @description excludedSubtrees
     */
				this.excludedSubtrees = getParametersValue(parameters, "excludedSubtrees", NameConstraints.defaultValues("excludedSubtrees"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(NameConstraints, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, NameConstraints.schema({
					names: {
						permittedSubtrees: "permittedSubtrees",
						excludedSubtrees: "excludedSubtrees"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for NameConstraints");
				//endregion

				//region Get internal properties from parsed schema
				if ("permittedSubtrees" in asn1.result) this.permittedSubtrees = Array.from(asn1.result.permittedSubtrees, function (element) {
					return new GeneralSubtree({ schema: element });
				});

				if ("excludedSubtrees" in asn1.result) this.excludedSubtrees = Array.from(asn1.result.excludedSubtrees, function (element) {
					return new GeneralSubtree({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("permittedSubtrees" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Sequence({
							value: Array.from(this.permittedSubtrees, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}

				if ("excludedSubtrees" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Sequence({
							value: Array.from(this.excludedSubtrees, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("permittedSubtrees" in this) object.permittedSubtrees = Array.from(this.permittedSubtrees, function (element) {
					return element.toJSON();
				});

				if ("excludedSubtrees" in this) object.excludedSubtrees = Array.from(this.excludedSubtrees, function (element) {
					return element.toJSON();
				});

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "permittedSubtrees":
						return [];
					case "excludedSubtrees":
						return [];
					default:
						throw new Error("Invalid member name for NameConstraints class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// NameConstraints OID ::= 2.5.29.30
				//
				//NameConstraints ::= SEQUENCE {
				//    permittedSubtrees       [0]     GeneralSubtrees OPTIONAL,
				//    excludedSubtrees        [1]     GeneralSubtrees OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [permittedSubtrees]
     * @property {string} [excludedSubtrees]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Repeated({
							name: names.permittedSubtrees || "",
							value: GeneralSubtree.schema()
						})]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Repeated({
							name: names.excludedSubtrees || "",
							value: GeneralSubtree.schema()
						})]
					})]
				});
			}
		}]);

		return NameConstraints;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var DistributionPoint = function () {
		//**********************************************************************************
		/**
   * Constructor for DistributionPoint class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {Object} [distributionPoint]
   * @property {Object} [reasons]
   * @property {Object} [cRLIssuer]
   */
		function DistributionPoint() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, DistributionPoint);

			//region Internal properties of the object
			if ("distributionPoint" in parameters)
				/**
     * @type {Array.<GeneralName>}
     * @description distributionPoint
     */
				this.distributionPoint = getParametersValue(parameters, "distributionPoint", DistributionPoint.defaultValues("distributionPoint"));

			if ("reasons" in parameters)
				/**
     * @type {BitString}
     * @description values
     */
				this.reasons = getParametersValue(parameters, "reasons", DistributionPoint.defaultValues("reasons"));

			if ("cRLIssuer" in parameters)
				/**
     * @type {Array.<GeneralName>}
     * @description cRLIssuer
     */
				this.cRLIssuer = getParametersValue(parameters, "cRLIssuer", DistributionPoint.defaultValues("cRLIssuer"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(DistributionPoint, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, DistributionPoint.schema({
					names: {
						distributionPoint: "distributionPoint",
						distributionPointNames: "distributionPointNames",
						reasons: "reasons",
						cRLIssuer: "cRLIssuer",
						cRLIssuerNames: "cRLIssuerNames"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for DistributionPoint");
				//endregion

				//region Get internal properties from parsed schema
				if ("distributionPoint" in asn1.result) {
					if (asn1.result.distributionPoint.idBlock.tagNumber === 0) // GENERAL_NAMES variant
						this.distributionPoint = Array.from(asn1.result.distributionPointNames, function (element) {
							return new GeneralName({ schema: element });
						});

					if (asn1.result.distributionPoint.idBlock.tagNumber === 1) // RDN variant
						{
							asn1.result.distributionPoint.idBlock.tagClass = 1; // UNIVERSAL
							asn1.result.distributionPoint.idBlock.tagNumber = 16; // SEQUENCE

							this.distributionPoint = new RelativeDistinguishedNames({ schema: asn1.result.distributionPoint });
						}
				}

				if ("reasons" in asn1.result) this.reasons = new BitString({ valueHex: asn1.result.reasons.valueBlock.valueHex });

				if ("cRLIssuer" in asn1.result) this.cRLIssuer = Array.from(asn1.result.cRLIssuerNames, function (element) {
					return new GeneralName({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("distributionPoint" in this) {
					var internalValue = void 0;

					if (this.distributionPoint instanceof Array) {
						internalValue = new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: Array.from(this.distributionPoint, function (element) {
								return element.toSchema();
							})
						});
					} else {
						internalValue = new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [this.distributionPoint.toSchema()]
						});
					}

					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [internalValue]
					}));
				}

				if ("reasons" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: this.reasons.valueBlock.valueHex
					}));
				}

				if ("cRLIssuer" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: Array.from(this.cRLIssuer, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("distributionPoint" in this) {
					if (this.distributionPoint instanceof Array) object.distributionPoint = Array.from(this.distributionPoint, function (element) {
						return element.toJSON();
					});else object.distributionPoint = this.distributionPoint.toJSON();
				}

				if ("reasons" in this) object.reasons = this.reasons.toJSON();

				if ("cRLIssuer" in this) object.cRLIssuer = Array.from(this.cRLIssuer, function (element) {
					return element.toJSON();
				});

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoint":
						return [];
					case "reasons":
						return new BitString();
					case "cRLIssuer":
						return [];
					default:
						throw new Error("Invalid member name for DistributionPoint class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//DistributionPoint ::= SEQUENCE {
				//    distributionPoint       [0]     DistributionPointName OPTIONAL,
				//    reasons                 [1]     ReasonFlags OPTIONAL,
				//    cRLIssuer               [2]     GeneralNames OPTIONAL }
				//
				//DistributionPointName ::= CHOICE {
				//    fullName                [0]     GeneralNames,
				//    nameRelativeToCRLIssuer [1]     RelativeDistinguishedName }
				//
				//ReasonFlags ::= BIT STRING {
				//    unused                  (0),
				//    keyCompromise           (1),
				//    cACompromise            (2),
				//    affiliationChanged      (3),
				//    superseded              (4),
				//    cessationOfOperation    (5),
				//    certificateHold         (6),
				//    privilegeWithdrawn      (7),
				//    aACompromise            (8) }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [distributionPoint]
     * @property {string} [distributionPointNames]
     * @property {string} [reasons]
     * @property {string} [cRLIssuer]
     * @property {string} [cRLIssuerNames]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Choice({
							value: [new Constructed({
								name: names.distributionPoint || "",
								optional: true,
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 0 // [0]
								},
								value: [new Repeated({
									name: names.distributionPointNames || "",
									value: GeneralName.schema()
								})]
							}), new Constructed({
								name: names.distributionPoint || "",
								optional: true,
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: RelativeDistinguishedNames.schema().valueBlock.value
							})]
						})]
					}), new Primitive({
						name: names.reasons || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					}), // IMPLICIT bitstring value
					new Constructed({
						name: names.cRLIssuer || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: [new Repeated({
							name: names.cRLIssuerNames || "",
							value: GeneralName.schema()
						})]
					}) // IMPLICIT bitstring value
					]
				});
			}
		}]);

		return DistributionPoint;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var CRLDistributionPoints = function () {
		//**********************************************************************************
		/**
   * Constructor for CRLDistributionPoints class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CRLDistributionPoints() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CRLDistributionPoints);

			//region Internal properties of the object
			/**
    * @type {Array.<DistributionPoint>}
    * @description distributionPoints
    */
			this.distributionPoints = getParametersValue(parameters, "distributionPoints", CRLDistributionPoints.defaultValues("distributionPoints"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CRLDistributionPoints, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CRLDistributionPoints.schema({
					names: {
						distributionPoints: "distributionPoints"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CRLDistributionPoints");
				//endregion

				//region Get internal properties from parsed schema
				this.distributionPoints = Array.from(asn1.result.distributionPoints, function (element) {
					return new DistributionPoint({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.distributionPoints, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					distributionPoints: Array.from(this.distributionPoints, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoints":
						return [];
					default:
						throw new Error("Invalid member name for CRLDistributionPoints class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// CRLDistributionPoints OID ::= 2.5.29.31
				//
				//CRLDistributionPoints ::= SEQUENCE SIZE (1..MAX) OF DistributionPoint

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [distributionPoints]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.distributionPoints || "",
						value: DistributionPoint.schema()
					})]
				});
			}
		}]);

		return CRLDistributionPoints;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyQualifierInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyQualifierInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyQualifierInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyQualifierInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description policyQualifierId
    */
			this.policyQualifierId = getParametersValue(parameters, "policyQualifierId", PolicyQualifierInfo.defaultValues("policyQualifierId"));
			/**
    * @type {Object}
    * @description qualifier
    */
			this.qualifier = getParametersValue(parameters, "qualifier", PolicyQualifierInfo.defaultValues("qualifier"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyQualifierInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyQualifierInfo.schema({
					names: {
						policyQualifierId: "policyQualifierId",
						qualifier: "qualifier"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyQualifierInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.policyQualifierId = asn1.result.policyQualifierId.valueBlock.toString();
				this.qualifier = asn1.result.qualifier;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.policyQualifierId }), this.qualifier]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					policyQualifierId: this.policyQualifierId,
					qualifier: this.qualifier.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "policyQualifierId":
						return "";
					case "qualifier":
						return new Any();
					default:
						throw new Error("Invalid member name for PolicyQualifierInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PolicyQualifierInfo ::= SEQUENCE {
				//    policyQualifierId  PolicyQualifierId,
				//    qualifier          ANY DEFINED BY policyQualifierId }
				//
				//id-qt          OBJECT IDENTIFIER ::=  { id-pkix 2 }
				//id-qt-cps      OBJECT IDENTIFIER ::=  { id-qt 1 }
				//id-qt-unotice  OBJECT IDENTIFIER ::=  { id-qt 2 }
				//
				//PolicyQualifierId ::= OBJECT IDENTIFIER ( id-qt-cps | id-qt-unotice )

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [policyQualifierId]
     * @property {string} [qualifier]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.policyQualifierId || "" }), new Any({ name: names.qualifier || "" })]
				});
			}
		}]);

		return PolicyQualifierInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyInformation = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyInformation class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyInformation() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyInformation);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description policyIdentifier
    */
			this.policyIdentifier = getParametersValue(parameters, "policyIdentifier", PolicyInformation.defaultValues("policyIdentifier"));

			if ("policyQualifiers" in parameters)
				/**
     * @type {Array.<PolicyQualifierInfo>}
     * @description Value of the TIME class
     */
				this.policyQualifiers = getParametersValue(parameters, "policyQualifiers", PolicyInformation.defaultValues("policyQualifiers"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyInformation, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyInformation.schema({
					names: {
						policyIdentifier: "policyIdentifier",
						policyQualifiers: "policyQualifiers"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyInformation");
				//endregion

				//region Get internal properties from parsed schema
				this.policyIdentifier = asn1.result.policyIdentifier.valueBlock.toString();

				if ("policyQualifiers" in asn1.result) this.policyQualifiers = Array.from(asn1.result.policyQualifiers, function (element) {
					return new PolicyQualifierInfo({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.policyIdentifier }));

				if ("policyQualifiers" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.policyQualifiers, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					policyIdentifier: this.policyIdentifier
				};

				if ("policyQualifiers" in this) object.policyQualifiers = Array.from(this.policyQualifiers, function (element) {
					return element.toJSON();
				});

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "policyIdentifier":
						return "";
					case "policyQualifiers":
						return [];
					default:
						throw new Error("Invalid member name for PolicyInformation class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PolicyInformation ::= SEQUENCE {
				//    policyIdentifier   CertPolicyId,
				//    policyQualifiers   SEQUENCE SIZE (1..MAX) OF
				//    PolicyQualifierInfo OPTIONAL }
				//
				//CertPolicyId ::= OBJECT IDENTIFIER

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [policyIdentifier]
     * @property {string} [policyQualifiers]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.policyIdentifier || "" }), new Sequence({
						optional: true,
						value: [new Repeated({
							name: names.policyQualifiers || "",
							value: PolicyQualifierInfo.schema()
						})]
					})]
				});
			}
		}]);

		return PolicyInformation;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var CertificatePolicies = function () {
		//**********************************************************************************
		/**
   * Constructor for CertificatePolicies class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CertificatePolicies() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CertificatePolicies);

			//region Internal properties of the object
			/**
    * @type {Array.<PolicyInformation>}
    * @description certificatePolicies
    */
			this.certificatePolicies = getParametersValue(parameters, "certificatePolicies", CertificatePolicies.defaultValues("certificatePolicies"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CertificatePolicies, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CertificatePolicies.schema({
					names: {
						certificatePolicies: "certificatePolicies"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CertificatePolicies");
				//endregion

				//region Get internal properties from parsed schema
				this.certificatePolicies = Array.from(asn1.result.certificatePolicies, function (element) {
					return new PolicyInformation({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.certificatePolicies, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					certificatePolicies: Array.from(this.certificatePolicies, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "certificatePolicies":
						return [];
					default:
						throw new Error("Invalid member name for CertificatePolicies class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// CertificatePolicies OID ::= 2.5.29.32
				//
				//certificatePolicies ::= SEQUENCE SIZE (1..MAX) OF PolicyInformation

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [certificatePolicies]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.certificatePolicies || "",
						value: PolicyInformation.schema()
					})]
				});
			}
		}]);

		return CertificatePolicies;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyMapping = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyMapping class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyMapping() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyMapping);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description issuerDomainPolicy
    */
			this.issuerDomainPolicy = getParametersValue(parameters, "issuerDomainPolicy", PolicyMapping.defaultValues("issuerDomainPolicy"));
			/**
    * @type {string}
    * @description subjectDomainPolicy
    */
			this.subjectDomainPolicy = getParametersValue(parameters, "subjectDomainPolicy", PolicyMapping.defaultValues("subjectDomainPolicy"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyMapping, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyMapping.schema({
					names: {
						issuerDomainPolicy: "issuerDomainPolicy",
						subjectDomainPolicy: "subjectDomainPolicy"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyMapping");
				//endregion

				//region Get internal properties from parsed schema
				this.issuerDomainPolicy = asn1.result.issuerDomainPolicy.valueBlock.toString();
				this.subjectDomainPolicy = asn1.result.subjectDomainPolicy.valueBlock.toString();
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.issuerDomainPolicy }), new ObjectIdentifier({ value: this.subjectDomainPolicy })]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					issuerDomainPolicy: this.issuerDomainPolicy,
					subjectDomainPolicy: this.subjectDomainPolicy
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "issuerDomainPolicy":
						return "";
					case "subjectDomainPolicy":
						return "";
					default:
						throw new Error("Invalid member name for PolicyMapping class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PolicyMapping ::= SEQUENCE {
				//    issuerDomainPolicy      CertPolicyId,
				//    subjectDomainPolicy     CertPolicyId }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [issuerDomainPolicy]
     * @property {string} [subjectDomainPolicy]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.issuerDomainPolicy || "" }), new ObjectIdentifier({ name: names.subjectDomainPolicy || "" })]
				});
			}
		}]);

		return PolicyMapping;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyMappings = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyMappings class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyMappings() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyMappings);

			//region Internal properties of the object
			/**
    * @type {Array.<PolicyMapping>}
    * @description mappings
    */
			this.mappings = getParametersValue(parameters, "mappings", PolicyMappings.defaultValues("mappings"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyMappings, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyMappings.schema({
					names: {
						mappings: "mappings"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyMappings");
				//endregion

				//region Get internal properties from parsed schema
				this.mappings = Array.from(asn1.result.mappings, function (element) {
					return new PolicyMapping({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.mappings, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					mappings: Array.from(this.mappings, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "mappings":
						return [];
					default:
						throw new Error("Invalid member name for PolicyMappings class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// PolicyMappings OID ::= 2.5.29.33
				//
				//PolicyMappings ::= SEQUENCE SIZE (1..MAX) OF PolicyMapping

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [utcTimeName] Name for "utcTimeName" choice
     * @property {string} [generalTimeName] Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.mappings || "",
						value: PolicyMapping.schema()
					})]
				});
			}
		}]);

		return PolicyMappings;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var AuthorityKeyIdentifier = function () {
		//**********************************************************************************
		/**
   * Constructor for AuthorityKeyIdentifier class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AuthorityKeyIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AuthorityKeyIdentifier);

			//region Internal properties of the object
			if ("keyIdentifier" in parameters)
				/**
     * @type {OctetString}
     * @description keyIdentifier
     */
				this.keyIdentifier = getParametersValue(parameters, "keyIdentifier", AuthorityKeyIdentifier.defaultValues("keyIdentifier"));

			if ("authorityCertIssuer" in parameters)
				/**
     * @type {Array.<GeneralName>}
     * @description authorityCertIssuer
     */
				this.authorityCertIssuer = getParametersValue(parameters, "authorityCertIssuer", AuthorityKeyIdentifier.defaultValues("authorityCertIssuer"));

			if ("authorityCertSerialNumber" in parameters)
				/**
     * @type {Integer}
     * @description authorityCertIssuer
     */
				this.authorityCertSerialNumber = getParametersValue(parameters, "authorityCertSerialNumber", AuthorityKeyIdentifier.defaultValues("authorityCertSerialNumber"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AuthorityKeyIdentifier, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, AuthorityKeyIdentifier.schema({
					names: {
						keyIdentifier: "keyIdentifier",
						authorityCertIssuer: "authorityCertIssuer",
						authorityCertSerialNumber: "authorityCertSerialNumber"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AuthorityKeyIdentifier");
				//endregion

				//region Get internal properties from parsed schema
				if ("keyIdentifier" in asn1.result) {
					asn1.result.keyIdentifier.idBlock.tagClass = 1; // UNIVERSAL
					asn1.result.keyIdentifier.idBlock.tagNumber = 4; // OCTETSTRING

					this.keyIdentifier = asn1.result.keyIdentifier;
				}

				if ("authorityCertIssuer" in asn1.result) this.authorityCertIssuer = Array.from(asn1.result.authorityCertIssuer, function (element) {
					return new GeneralName({ schema: element });
				});

				if ("authorityCertSerialNumber" in asn1.result) {
					asn1.result.authorityCertSerialNumber.idBlock.tagClass = 1; // UNIVERSAL
					asn1.result.authorityCertSerialNumber.idBlock.tagNumber = 2; // INTEGER

					this.authorityCertSerialNumber = asn1.result.authorityCertSerialNumber;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("keyIdentifier" in this) {
					var value = this.keyIdentifier;

					value.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					value.idBlock.tagNumber = 0; // [0]

					outputArray.push(value);
				}

				if ("authorityCertIssuer" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Sequence({
							value: Array.from(this.authorityCertIssuer, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}

				if ("authorityCertSerialNumber" in this) {
					var _value5 = this.authorityCertSerialNumber;

					_value5.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					_value5.idBlock.tagNumber = 2; // [2]

					outputArray.push(_value5);
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("keyIdentifier" in this) object.keyIdentifier = this.keyIdentifier.toJSON();

				if ("authorityCertIssuer" in this) object.authorityCertIssuer = Array.from(this.authorityCertIssuer, function (element) {
					return element.toJSON();
				});

				if ("authorityCertSerialNumber" in this) object.authorityCertSerialNumber = this.authorityCertSerialNumber.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyIdentifier":
						return new OctetString();
					case "authorityCertIssuer":
						return [];
					case "authorityCertSerialNumber":
						return new Integer();
					default:
						throw new Error("Invalid member name for AuthorityKeyIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// AuthorityKeyIdentifier OID ::= 2.5.29.35
				//
				//AuthorityKeyIdentifier ::= SEQUENCE {
				//    keyIdentifier             [0] KeyIdentifier           OPTIONAL,
				//    authorityCertIssuer       [1] GeneralNames            OPTIONAL,
				//    authorityCertSerialNumber [2] CertificateSerialNumber OPTIONAL  }
				//
				//KeyIdentifier ::= OCTET STRING

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyIdentifier]
     * @property {string} [authorityCertIssuer]
     * @property {string} [authorityCertSerialNumber]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.keyIdentifier || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						}
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Repeated({
							name: names.authorityCertIssuer || "",
							value: GeneralName.schema()
						})]
					}), new Primitive({
						name: names.authorityCertSerialNumber || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						}
					})]
				});
			}
		}]);

		return AuthorityKeyIdentifier;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyConstraints = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyConstraints class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyConstraints() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyConstraints);

			//region Internal properties of the object
			if ("requireExplicitPolicy" in parameters)
				/**
     * @type {number}
     * @description requireExplicitPolicy
     */
				this.requireExplicitPolicy = getParametersValue(parameters, "requireExplicitPolicy", PolicyConstraints.defaultValues("requireExplicitPolicy"));

			if ("inhibitPolicyMapping" in parameters)
				/**
     * @type {number}
     * @description Value of the TIME class
     */
				this.inhibitPolicyMapping = getParametersValue(parameters, "inhibitPolicyMapping", PolicyConstraints.defaultValues("inhibitPolicyMapping"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyConstraints, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyConstraints.schema({
					names: {
						requireExplicitPolicy: "requireExplicitPolicy",
						inhibitPolicyMapping: "inhibitPolicyMapping"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyConstraints");
				//endregion

				//region Get internal properties from parsed schema
				if ("requireExplicitPolicy" in asn1.result) {
					var field1 = asn1.result.requireExplicitPolicy;

					field1.idBlock.tagClass = 1; // UNIVERSAL
					field1.idBlock.tagNumber = 2; // INTEGER

					var ber1 = field1.toBER(false);
					var int1 = fromBER(ber1);

					this.requireExplicitPolicy = int1.result.valueBlock.valueDec;
				}

				if ("inhibitPolicyMapping" in asn1.result) {
					var field2 = asn1.result.inhibitPolicyMapping;

					field2.idBlock.tagClass = 1; // UNIVERSAL
					field2.idBlock.tagNumber = 2; // INTEGER

					var ber2 = field2.toBER(false);
					var int2 = fromBER(ber2);

					this.inhibitPolicyMapping = int2.result.valueBlock.valueDec;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create correct values for output sequence
				var outputArray = [];

				if ("requireExplicitPolicy" in this) {
					var int1 = new Integer({ value: this.requireExplicitPolicy });

					int1.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					int1.idBlock.tagNumber = 0; // [0]

					outputArray.push(int1);
				}

				if ("inhibitPolicyMapping" in this) {
					var int2 = new Integer({ value: this.inhibitPolicyMapping });

					int2.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					int2.idBlock.tagNumber = 1; // [1]

					outputArray.push(int2);
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("requireExplicitPolicy" in this) object.requireExplicitPolicy = this.requireExplicitPolicy;

				if ("inhibitPolicyMapping" in this) object.inhibitPolicyMapping = this.inhibitPolicyMapping;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "requireExplicitPolicy":
						return 0;
					case "inhibitPolicyMapping":
						return 0;
					default:
						throw new Error("Invalid member name for PolicyConstraints class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// PolicyMappings OID ::= 2.5.29.36
				//
				//PolicyConstraints ::= SEQUENCE {
				//    requireExplicitPolicy           [0] SkipCerts OPTIONAL,
				//    inhibitPolicyMapping            [1] SkipCerts OPTIONAL }
				//
				//SkipCerts ::= INTEGER (0..MAX)

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [requireExplicitPolicy]
     * @property {string} [inhibitPolicyMapping]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.requireExplicitPolicy || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						}
					}), // IMPLICIT integer value
					new Primitive({
						name: names.inhibitPolicyMapping || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					}) // IMPLICIT integer value
					]
				});
			}
		}]);

		return PolicyConstraints;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var ExtKeyUsage = function () {
		//**********************************************************************************
		/**
   * Constructor for ExtKeyUsage class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ExtKeyUsage() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ExtKeyUsage);

			//region Internal properties of the object
			/**
    * @type {Array.<string>}
    * @description keyPurposes
    */
			this.keyPurposes = getParametersValue(parameters, "keyPurposes", ExtKeyUsage.defaultValues("keyPurposes"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ExtKeyUsage, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, ExtKeyUsage.schema({
					names: {
						keyPurposes: "keyPurposes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ExtKeyUsage");
				//endregion

				//region Get internal properties from parsed schema
				this.keyPurposes = Array.from(asn1.result.keyPurposes, function (element) {
					return element.valueBlock.toString();
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.keyPurposes, function (element) {
						return new ObjectIdentifier({ value: element });
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					keyPurposes: Array.from(this.keyPurposes)
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyPurposes":
						return [];
					default:
						throw new Error("Invalid member name for ExtKeyUsage class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// ExtKeyUsage OID ::= 2.5.29.37
				//
				// ExtKeyUsage ::= SEQUENCE SIZE (1..MAX) OF KeyPurposeId

				// KeyPurposeId ::= OBJECT IDENTIFIER

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyPurposes]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.keyPurposes || "",
						value: new ObjectIdentifier()
					})]
				});
			}
		}]);

		return ExtKeyUsage;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var AccessDescription = function () {
		//**********************************************************************************
		/**
   * Constructor for AccessDescription class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AccessDescription() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AccessDescription);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description accessMethod
    */
			this.accessMethod = getParametersValue(parameters, "accessMethod", AccessDescription.defaultValues("accessMethod"));
			/**
    * @type {GeneralName}
    * @description accessLocation
    */
			this.accessLocation = getParametersValue(parameters, "accessLocation", AccessDescription.defaultValues("accessLocation"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AccessDescription, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, AccessDescription.schema({
					names: {
						accessMethod: "accessMethod",
						accessLocation: {
							names: {
								blockName: "accessLocation"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AccessDescription");
				//endregion

				//region Get internal properties from parsed schema
				this.accessMethod = asn1.result.accessMethod.valueBlock.toString();
				this.accessLocation = new GeneralName({ schema: asn1.result.accessLocation });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.accessMethod }), this.accessLocation.toSchema()]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					accessMethod: this.accessMethod,
					accessLocation: this.accessLocation.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "accessMethod":
						return "";
					case "accessLocation":
						return new GeneralName();
					default:
						throw new Error("Invalid member name for AccessDescription class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//AccessDescription  ::=  SEQUENCE {
				//    accessMethod          OBJECT IDENTIFIER,
				//    accessLocation        GeneralName  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [accessMethod]
     * @property {string} [accessLocation]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.accessMethod || "" }), GeneralName.schema(names.accessLocation || {})]
				});
			}
		}]);

		return AccessDescription;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var InfoAccess = function () {
		//**********************************************************************************
		/**
   * Constructor for InfoAccess class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function InfoAccess() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, InfoAccess);

			//region Internal properties of the object
			/**
    * @type {Array.<AccessDescription>}
    * @description accessDescriptions
    */
			this.accessDescriptions = getParametersValue(parameters, "accessDescriptions", InfoAccess.defaultValues("accessDescriptions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(InfoAccess, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, InfoAccess.schema({
					names: {
						accessDescriptions: "accessDescriptions"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for InfoAccess");
				//endregion

				//region Get internal properties from parsed schema
				this.accessDescriptions = Array.from(asn1.result.accessDescriptions, function (element) {
					return new AccessDescription({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.accessDescriptions, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					accessDescriptions: Array.from(this.accessDescriptions, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "accessDescriptions":
						return [];
					default:
						throw new Error("Invalid member name for InfoAccess class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// AuthorityInfoAccess OID ::= 1.3.6.1.5.5.7.1.1
				// SubjectInfoAccess OID ::= 1.3.6.1.5.5.7.1.11
				//
				//AuthorityInfoAccessSyntax  ::=
				//SEQUENCE SIZE (1..MAX) OF AccessDescription

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [accessDescriptions]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.accessDescriptions || "",
						value: AccessDescription.schema()
					})]
				});
			}
		}]);

		return InfoAccess;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var Extension = function () {
		//**********************************************************************************
		/**
   * Constructor for Extension class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Extension() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Extension);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description extnID
    */
			this.extnID = getParametersValue(parameters, "extnID", Extension.defaultValues("extnID"));
			/**
    * @type {boolean}
    * @description critical
    */
			this.critical = getParametersValue(parameters, "critical", Extension.defaultValues("critical"));
			/**
    * @type {OctetString}
    * @description extnValue
    */
			if ("extnValue" in parameters) this.extnValue = new OctetString({ valueHex: parameters.extnValue });else this.extnValue = Extension.defaultValues("extnValue");

			if ("parsedValue" in parameters)
				/**
     * @type {Object}
     * @description parsedValue
     */
				this.parsedValue = getParametersValue(parameters, "parsedValue", Extension.defaultValues("parsedValue"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Extension, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Extension.schema({
					names: {
						extnID: "extnID",
						critical: "critical",
						extnValue: "extnValue"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for EXTENSION");
				//endregion

				//region Get internal properties from parsed schema
				this.extnID = asn1.result.extnID.valueBlock.toString();
				if ("critical" in asn1.result) this.critical = asn1.result.critical.valueBlock.value;
				this.extnValue = asn1.result.extnValue;

				//region Get "parsedValue" for well-known extensions
				asn1 = fromBER(this.extnValue.valueBlock.valueHex);
				if (asn1.offset === -1) return;

				switch (this.extnID) {
					case "2.5.29.9":
						// SubjectDirectoryAttributes
						this.parsedValue = new SubjectDirectoryAttributes({ schema: asn1.result });
						break;
					case "2.5.29.14":
						// SubjectKeyIdentifier
						this.parsedValue = asn1.result; // Should be just a simple OCTETSTRING
						break;
					case "2.5.29.15":
						// KeyUsage
						this.parsedValue = asn1.result; // Should be just a simple BITSTRING
						break;
					case "2.5.29.16":
						// PrivateKeyUsagePeriod
						this.parsedValue = new PrivateKeyUsagePeriod({ schema: asn1.result });
						break;
					case "2.5.29.17": // SubjectAltName
					case "2.5.29.18":
						// IssuerAltName
						this.parsedValue = new AltName({ schema: asn1.result });
						break;
					case "2.5.29.19":
						// BasicConstraints
						this.parsedValue = new BasicConstraints({ schema: asn1.result });
						break;
					case "2.5.29.20": // CRLNumber
					case "2.5.29.27":
						// BaseCRLNumber (delta CRL indicator)
						this.parsedValue = asn1.result; // Should be just a simple INTEGER
						break;
					case "2.5.29.21":
						// CRLReason
						this.parsedValue = asn1.result; // Should be just a simple ENUMERATED
						break;
					case "2.5.29.24":
						// InvalidityDate
						this.parsedValue = asn1.result; // Should be just a simple GeneralizedTime
						break;
					case "2.5.29.28":
						// IssuingDistributionPoint
						this.parsedValue = new IssuingDistributionPoint({ schema: asn1.result });
						break;
					case "2.5.29.29":
						// CertificateIssuer
						this.parsedValue = new GeneralNames({ schema: asn1.result }); // Should be just a simple
						break;
					case "2.5.29.30":
						// NameConstraints
						this.parsedValue = new NameConstraints({ schema: asn1.result });
						break;
					case "2.5.29.31": // CRLDistributionPoints
					case "2.5.29.46":
						// FreshestCRL
						this.parsedValue = new CRLDistributionPoints({ schema: asn1.result });
						break;
					case "2.5.29.32":
						// CertificatePolicies
						this.parsedValue = new CertificatePolicies({ schema: asn1.result });
						break;
					case "2.5.29.33":
						// PolicyMappings
						this.parsedValue = new PolicyMappings({ schema: asn1.result });
						break;
					case "2.5.29.35":
						// AuthorityKeyIdentifier
						this.parsedValue = new AuthorityKeyIdentifier({ schema: asn1.result });
						break;
					case "2.5.29.36":
						// PolicyConstraints
						this.parsedValue = new PolicyConstraints({ schema: asn1.result });
						break;
					case "2.5.29.37":
						// ExtKeyUsage
						this.parsedValue = new ExtKeyUsage({ schema: asn1.result });
						break;
					case "2.5.29.54":
						// InhibitAnyPolicy
						this.parsedValue = asn1.result; // Should be just a simple INTEGER
						break;
					case "1.3.6.1.5.5.7.1.1": // AuthorityInfoAccess
					case "1.3.6.1.5.5.7.1.11":
						// SubjectInfoAccess
						this.parsedValue = new InfoAccess({ schema: asn1.result });
						break;
					default:
				}
				//endregion
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.extnID }));

				if (this.critical !== Extension.defaultValues("critical")) outputArray.push(new Boolean({ value: this.critical }));

				outputArray.push(this.extnValue);
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					extnID: this.extnID,
					extnValue: this.extnValue.toJSON()
				};

				if (this.critical !== Extension.defaultValues("critical")) object.critical = this.critical;

				if ("parsedValue" in this) object.parsedValue = this.parsedValue.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "extnID":
						return "";
					case "critical":
						return false;
					case "extnValue":
						return new OctetString();
					case "parsedValue":
						return {};
					default:
						throw new Error("Invalid member name for Extension class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//Extension  ::=  SEQUENCE  {
				//    extnID      OBJECT IDENTIFIER,
				//    critical    BOOLEAN DEFAULT FALSE,
				//    extnValue   OCTET STRING
				//}

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [extnID]
     * @property {string} [critical]
     * @property {string} [extnValue]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.extnID || "" }), new Boolean({
						name: names.critical || "",
						optional: true
					}), new OctetString({ name: names.extnValue || "" })]
				});
			}
		}]);

		return Extension;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var Extensions = function () {
		//**********************************************************************************
		/**
   * Constructor for Extensions class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Extensions() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Extensions);

			//region Internal properties of the object
			/**
    * @type {Array.<Extension>}
    * @description type
    */
			this.extensions = getParametersValue(parameters, "extensions", Extensions.defaultValues("extensions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Extensions, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Extensions.schema({
					names: {
						extensions: "extensions"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for EXTENSIONS");
				//endregion

				//region Get internal properties from parsed schema
				this.extensions = Array.from(asn1.result.extensions, function (element) {
					return new Extension({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.extensions, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					extensions: Array.from(this.extensions, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "extensions":
						return [];
					default:
						throw new Error("Invalid member name for Extensions class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @param {boolean} optional Flag that current schema should be optional
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
				var optional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

				//Extensions  ::=  SEQUENCE SIZE (1..MAX) OF Extension

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [extensions]
     * @property {string} [extension]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					optional: optional,
					name: names.blockName || "",
					value: [new Repeated({
						name: names.extensions || "",
						value: Extension.schema(names.extension || {})
					})]
				});
			}
		}]);

		return Extensions;
	}();
	//**************************************************************************************

	//**************************************************************************************


	function tbsCertificate() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		//TBSCertificate  ::=  SEQUENCE  {
		//    version         [0]  EXPLICIT Version DEFAULT v1,
		//    serialNumber         CertificateSerialNumber,
		//    signature            AlgorithmIdentifier,
		//    issuer               Name,
		//    validity             Validity,
		//    subject              Name,
		//    subjectPublicKeyInfo SubjectPublicKeyInfo,
		//    issuerUniqueID  [1]  IMPLICIT UniqueIdentifier OPTIONAL,
		//                         -- If present, version MUST be v2 or v3
		//    subjectUniqueID [2]  IMPLICIT UniqueIdentifier OPTIONAL,
		//                         -- If present, version MUST be v2 or v3
		//    extensions      [3]  EXPLICIT Extensions OPTIONAL
		//    -- If present, version MUST be v3
		//}

		/**
   * @type {Object}
   * @property {string} [blockName]
   * @property {string} [tbsCertificateVersion]
   * @property {string} [tbsCertificateSerialNumber]
   * @property {string} [signature]
   * @property {string} [issuer]
   * @property {string} [tbsCertificateValidity]
   * @property {string} [notBefore]
   * @property {string} [notAfter]
   * @property {string} [subject]
   * @property {string} [subjectPublicKeyInfo]
   * @property {string} [tbsCertificateIssuerUniqueID]
   * @property {string} [tbsCertificateSubjectUniqueID]
   * @property {string} [extensions]
   */
		var names = getParametersValue(parameters, "names", {});

		return new Sequence({
			name: names.blockName || "tbsCertificate",
			value: [new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [new Integer({ name: names.tbsCertificateVersion || "tbsCertificate.version" }) // EXPLICIT integer value
				]
			}), new Integer({ name: names.tbsCertificateSerialNumber || "tbsCertificate.serialNumber" }), AlgorithmIdentifier.schema(names.signature || {
				names: {
					blockName: "tbsCertificate.signature"
				}
			}), RelativeDistinguishedNames.schema(names.issuer || {
				names: {
					blockName: "tbsCertificate.issuer"
				}
			}), new Sequence({
				name: names.tbsCertificateValidity || "tbsCertificate.validity",
				value: [Time.schema(names.notBefore || {
					names: {
						utcTimeName: "tbsCertificate.notBefore",
						generalTimeName: "tbsCertificate.notBefore"
					}
				}), Time.schema(names.notAfter || {
					names: {
						utcTimeName: "tbsCertificate.notAfter",
						generalTimeName: "tbsCertificate.notAfter"
					}
				})]
			}), RelativeDistinguishedNames.schema(names.subject || {
				names: {
					blockName: "tbsCertificate.subject"
				}
			}), PublicKeyInfo.schema(names.subjectPublicKeyInfo || {
				names: {
					blockName: "tbsCertificate.subjectPublicKeyInfo"
				}
			}), new Primitive({
				name: names.tbsCertificateIssuerUniqueID || "tbsCertificate.issuerUniqueID",
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				}
			}), // IMPLICIT bistring value
			new Primitive({
				name: names.tbsCertificateSubjectUniqueID || "tbsCertificate.subjectUniqueID",
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				}
			}), // IMPLICIT bistring value
			new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				value: [Extensions.schema(names.extensions || {
					names: {
						blockName: "tbsCertificate.extensions"
					}
				})]
			}) // EXPLICIT SEQUENCE value
			]
		});
	}
	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var Certificate = function () {
		//**********************************************************************************
		/**
   * Constructor for Certificate class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Certificate() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Certificate);

			//region Internal properties of the object
			/**
    * @type {ArrayBuffer}
    * @description tbs
    */
			this.tbs = getParametersValue(parameters, "tbs", Certificate.defaultValues("tbs"));
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", Certificate.defaultValues("version"));
			/**
    * @type {Integer}
    * @description serialNumber
    */
			this.serialNumber = getParametersValue(parameters, "serialNumber", Certificate.defaultValues("serialNumber"));
			/**
    * @type {AlgorithmIdentifier}
    * @description signature
    */
			this.signature = getParametersValue(parameters, "signature", Certificate.defaultValues("signature"));
			/**
    * @type {RelativeDistinguishedNames}
    * @description issuer
    */
			this.issuer = getParametersValue(parameters, "issuer", Certificate.defaultValues("issuer"));
			/**
    * @type {Time}
    * @description notBefore
    */
			this.notBefore = getParametersValue(parameters, "notBefore", Certificate.defaultValues("notBefore"));
			/**
    * @type {Time}
    * @description notAfter
    */
			this.notAfter = getParametersValue(parameters, "notAfter", Certificate.defaultValues("notAfter"));
			/**
    * @type {RelativeDistinguishedNames}
    * @description subject
    */
			this.subject = getParametersValue(parameters, "subject", Certificate.defaultValues("subject"));
			/**
    * @type {PublicKeyInfo}
    * @description subjectPublicKeyInfo
    */
			this.subjectPublicKeyInfo = getParametersValue(parameters, "subjectPublicKeyInfo", Certificate.defaultValues("subjectPublicKeyInfo"));

			if ("issuerUniqueID" in parameters)
				/**
     * @type {ArrayBuffer}
     * @description issuerUniqueID
     */
				this.issuerUniqueID = getParametersValue(parameters, "issuerUniqueID", Certificate.defaultValues("issuerUniqueID"));

			if ("subjectUniqueID" in parameters)
				/**
     * @type {ArrayBuffer}
     * @description subjectUniqueID
     */
				this.subjectUniqueID = getParametersValue(parameters, "subjectUniqueID", Certificate.defaultValues("subjectUniqueID"));

			if ("extensions" in parameters)
				/**
     * @type {Array}
     * @description extensions
     */
				this.extensions = getParametersValue(parameters, "extensions", Certificate.defaultValues("extensions"));

			/**
    * @type {AlgorithmIdentifier}
    * @description signatureAlgorithm
    */
			this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", Certificate.defaultValues("signatureAlgorithm"));
			/**
    * @type {BitString}
    * @description signatureValue
    */
			this.signatureValue = getParametersValue(parameters, "signatureValue", Certificate.defaultValues("signatureValue"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Certificate, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Certificate.schema({
					names: {
						tbsCertificate: {
							names: {
								extensions: {
									names: {
										extensions: "tbsCertificate.extensions"
									}
								}
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CERT");
				//endregion

				//region Get internal properties from parsed schema
				this.tbs = asn1.result.tbsCertificate.valueBeforeDecode;

				if ("tbsCertificate.version" in asn1.result) this.version = asn1.result["tbsCertificate.version"].valueBlock.valueDec;
				this.serialNumber = asn1.result["tbsCertificate.serialNumber"];
				this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertificate.signature"] });
				this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.issuer"] });
				this.notBefore = new Time({ schema: asn1.result["tbsCertificate.notBefore"] });
				this.notAfter = new Time({ schema: asn1.result["tbsCertificate.notAfter"] });
				this.subject = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.subject"] });
				this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result["tbsCertificate.subjectPublicKeyInfo"] });
				if ("tbsCertificate.issuerUniqueID" in asn1.result) this.issuerUniqueID = asn1.result["tbsCertificate.issuerUniqueID"].valueBlock.valueHex;
				if ("tbsCertificate.subjectUniqueID" in asn1.result) this.issuerUniqueID = asn1.result["tbsCertificate.subjectUniqueID"].valueBlock.valueHex;
				if ("tbsCertificate.extensions" in asn1.result) this.extensions = Array.from(asn1.result["tbsCertificate.extensions"], function (element) {
					return new Extension({ schema: element });
				});

				this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
				this.signatureValue = asn1.result.signatureValue;
				//endregion
			}
			//**********************************************************************************
			/**
    * Create ASN.1 schema for existing values of TBS part for the certificate
    */

		}, {
			key: "encodeTBS",
			value: function encodeTBS() {
				//region Create array for output sequence
				var outputArray = [];

				if ("version" in this && this.version !== Certificate.defaultValues("version")) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Integer({ value: this.version }) // EXPLICIT integer value
						]
					}));
				}

				outputArray.push(this.serialNumber);
				outputArray.push(this.signature.toSchema());
				outputArray.push(this.issuer.toSchema());

				outputArray.push(new Sequence({
					value: [this.notBefore.toSchema(), this.notAfter.toSchema()]
				}));

				outputArray.push(this.subject.toSchema());
				outputArray.push(this.subjectPublicKeyInfo.toSchema());

				if ("issuerUniqueID" in this) {
					outputArray.push(new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: this.issuerUniqueID
					}));
				}
				if ("subjectUniqueID" in this) {
					outputArray.push(new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						valueHex: this.subjectUniqueID
					}));
				}

				if ("subjectUniqueID" in this) {
					outputArray.push(new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						value: [this.extensions.toSchema()]
					}));
				}

				if ("extensions" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						value: [new Sequence({
							value: Array.from(this.extensions, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}
				//endregion

				//region Create and return output sequence
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				var encodeFlag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var tbsSchema = {};

				//region Decode stored TBS value
				if (encodeFlag === false) {
					if (this.tbs.length === 0) // No stored certificate TBS part
						return Certificate.schema().value[0];

					tbsSchema = fromBER(this.tbs).result;
				}
				//endregion
				//region Create TBS schema via assembling from TBS parts
				else tbsSchema = this.encodeTBS();
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [tbsSchema, this.signatureAlgorithm.toSchema(), this.signatureValue]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					tbs: bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
					serialNumber: this.serialNumber.toJSON(),
					signature: this.signature.toJSON(),
					issuer: this.issuer.toJSON(),
					notBefore: this.notBefore.toJSON(),
					notAfter: this.notAfter.toJSON(),
					subject: this.subject.toJSON(),
					subjectPublicKeyInfo: this.subjectPublicKeyInfo.toJSON(),
					signatureAlgorithm: this.signatureAlgorithm.toJSON(),
					signatureValue: this.signatureValue.toJSON()
				};

				if ("version" in this && this.version !== Certificate.defaultValues("version")) object.version = this.version;

				if ("issuerUniqueID" in this) object.issuerUniqueID = bufferToHexCodes(this.issuerUniqueID, 0, this.issuerUniqueID.byteLength);

				if ("subjectUniqueID" in this) object.subjectUniqueID = bufferToHexCodes(this.subjectUniqueID, 0, this.subjectUniqueID.byteLength);

				if ("extensions" in this) object.extensions = Array.from(this.extensions, function (element) {
					return element.toJSON();
				});

				return object;
			}
			//**********************************************************************************
			/**
    * Importing public key for current certificate
    */

		}, {
			key: "getPublicKey",
			value: function getPublicKey() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Find correct algorithm for imported public key
				if (parameters === null) {
					//region Initial variables
					parameters = {};
					//endregion

					//region Find signer's hashing algorithm
					var shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
					if (shaAlgorithm === "") return Promise.reject("Unsupported signature algorithm: " + this.signatureAlgorithm.algorithmId);
					//endregion

					//region Get information about public key algorithm and default parameters for import
					var algorithmObject = getAlgorithmByOID(this.subjectPublicKeyInfo.algorithm.algorithmId);
					if ("name" in algorithmObject === false) return Promise.reject("Unsupported public key algorithm: " + this.subjectPublicKeyInfo.algorithm.algorithmId);

					parameters.algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in parameters.algorithm.algorithm) parameters.algorithm.algorithm.hash.name = shaAlgorithm;

					//region Special case for ECDSA
					if (algorithmObject.name === "ECDSA") {
						//region Get information about named curve
						var algorithmParamsChecked = false;

						if ("algorithmParams" in this.subjectPublicKeyInfo.algorithm === true) {
							if ("idBlock" in this.subjectPublicKeyInfo.algorithm.algorithmParams) {
								if (this.subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1 && this.subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6) algorithmParamsChecked = true;
							}
						}

						if (algorithmParamsChecked === false) return Promise.reject("Incorrect type for ECDSA public key parameters");

						var curveObject = getAlgorithmByOID(this.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						if ("name" in curveObject === false) return Promise.reject("Unsupported named curve algorithm: " + this.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						//endregion

						parameters.algorithm.algorithm.namedCurve = curveObject.name;
					}
					//endregion
					//endregion
				}
				//endregion

				//region Get neccessary values from internal fields for current certificate
				var publicKeyInfoSchema = this.subjectPublicKeyInfo.toSchema();
				var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
				var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);
				//endregion

				return crypto.importKey("spki", publicKeyInfoView, parameters.algorithm.algorithm, true, parameters.algorithm.usages);
			}
			//**********************************************************************************
			/**
    * Get SHA-1 hash value for subject public key
    */

		}, {
			key: "getKeyHash",
			value: function getKeyHash() {
				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				return crypto.digest({ name: "sha-1" }, new Uint8Array(this.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
			}
			//**********************************************************************************
			/**
    * Make a signature for current value from TBS section
    * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
    * @param {string} [hashAlgorithm="SHA-1"] Hashing algorithm
    */

		}, {
			key: "sign",
			value: function sign(privateKey) {
				var _this54 = this;

				var hashAlgorithm = arguments.length <= 1 || arguments[1] === undefined ? "SHA-1" : arguments[1];

				//region Get hashing algorithm
				var oid = getOIDByAlgorithm({ name: hashAlgorithm });
				if (oid === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);
				//endregion

				//region Get a "default parameters" for current algorithm
				var defParams = getAlgorithmParameters(privateKey.algorithm.name, "sign");
				defParams.algorithm.hash.name = hashAlgorithm;
				//endregion

				//region Fill internal structures base on "privateKey" and "hashAlgorithm"
				switch (privateKey.algorithm.name.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
					case "ECDSA":
						this.signature.algorithmId = getOIDByAlgorithm(defParams.algorithm);
						this.signatureAlgorithm.algorithmId = this.signature.algorithmId;
						break;
					case "RSA-PSS":
						{
							//region Set "saltLength" as a length (in octets) of hash function result
							switch (hashAlgorithm.toUpperCase()) {
								case "SHA-256":
									defParams.algorithm.saltLength = 32;
									break;
								case "SHA-384":
									defParams.algorithm.saltLength = 48;
									break;
								case "SHA-512":
									defParams.algorithm.saltLength = 64;
									break;
								default:
							}
							//endregion

							//region Fill "RSASSA_PSS_params" object
							var paramsObject = {};

							if (hashAlgorithm.toUpperCase() !== "SHA-1") {
								var hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
								if (hashAlgorithmOID === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);

								paramsObject.hashAlgorithm = new AlgorithmIdentifier({
									algorithmId: hashAlgorithmOID,
									algorithmParams: new Null()
								});

								paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
									algorithmId: "1.2.840.113549.1.1.8", // MGF1
									algorithmParams: paramsObject.hashAlgorithm.toSchema()
								});
							}

							if (defParams.algorithm.saltLength !== 20) paramsObject.saltLength = defParams.algorithm.saltLength;

							var pssParameters = new RSASSAPSSParams(paramsObject);
							//endregion

							//region Automatically set signature algorithm
							this.signature = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.10",
								algorithmParams: pssParameters.toSchema()
							});
							this.signatureAlgorithm = this.signature; // Must be the same
							//endregion
						}
						break;
					default:
						return Promise.reject("Unsupported signature algorithm: " + privateKey.algorithm.name);
				}
				//endregion

				//region Create TBS data for signing
				this.tbs = this.encodeTBS().toBER(false);
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Signing TBS data on provided private key
				return crypto.sign(defParams.algorithm, privateKey, new Uint8Array(this.tbs)).then(function (result) {
					//region Special case for ECDSA algorithm
					if (defParams.algorithm.name === "ECDSA") result = createCMSECDSASignature(result);
					//endregion

					_this54.signatureValue = new BitString({ valueHex: result });
				}, function (error) {
					return Promise.reject("Signing error: " + error);
				});
				//endregion
			}
			//**********************************************************************************

		}, {
			key: "verify",
			value: function verify() {
				var _this55 = this;

				var issuerCertificate = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

				//region Global variables
				var sequence = Promise.resolve();

				var subjectPublicKeyInfo = {};

				var signature = this.signatureValue;
				var tbs = this.tbs;
				//endregion

				//region Set correct "subjectPublicKeyInfo" value
				if (issuerCertificate !== null) subjectPublicKeyInfo = issuerCertificate.subjectPublicKeyInfo;else {
					if (this.issuer.isEqual(this.subject)) // Self-signed certificate
						subjectPublicKeyInfo = this.subjectPublicKeyInfo;
				}

				if (subjectPublicKeyInfo instanceof PublicKeyInfo === false) return Promise.reject("Please provide issuer certificate as a parameter");
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Find signer's hashing algorithm
				var shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
				if (shaAlgorithm === "") return Promise.reject("Unsupported signature algorithm: " + this.signatureAlgorithm.algorithmId);
				//endregion

				//region Importing public key
				sequence = sequence.then(function () {
					//region Get information about public key algorithm and default parameters for import
					var algorithmId = void 0;
					if (_this55.signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10") algorithmId = _this55.signatureAlgorithm.algorithmId;else algorithmId = subjectPublicKeyInfo.algorithm.algorithmId;

					var algorithmObject = getAlgorithmByOID(algorithmId);
					if ("name" in algorithmObject === false) return Promise.reject("Unsupported public key algorithm: " + algorithmId);

					var algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;

					//region Special case for ECDSA
					if (algorithmObject.name === "ECDSA") {
						// #region Get information about named curve
						var algorithmParamsChecked = false;

						if ("algorithmParams" in subjectPublicKeyInfo.algorithm === true) {
							if ("idBlock" in subjectPublicKeyInfo.algorithm.algorithmParams) {
								if (subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1 && subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6) algorithmParamsChecked = true;
							}
						}

						if (algorithmParamsChecked === false) return Promise.reject("Incorrect type for ECDSA public key parameters");

						var curveObject = getAlgorithmByOID(subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						if ("name" in curveObject === false) return Promise.reject("Unsupported named curve algorithm: " + subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						// #endregion

						algorithm.algorithm.namedCurve = curveObject.name;
					}
					//endregion
					//endregion

					var publicKeyInfoSchema = subjectPublicKeyInfo.toSchema();
					var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
					var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

					return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
				});
				//endregion

				//region Verify signature for the certificate
				sequence = sequence.then(function (publicKey) {
					//region Get default algorithm parameters for verification
					var algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					//region Special case for ECDSA signatures
					var signatureValue = signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);
						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}
					//endregion

					//region Special case for RSA-PSS
					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: _this55.signatureAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashAlgo = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) return Promise.reject("Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId);

							hashAlgo = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashAlgo;
					}
					//endregion

					return crypto.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), new Uint8Array(tbs));
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************
			//region Basic Building Blocks for Verification Engine
			//**********************************************************************************

		}, {
			key: "formatChecking",
			value: function formatChecking(_ref) {
				var _ref$strictChecking = _ref.strictChecking;
				var strictChecking = _ref$strictChecking === undefined ? false : _ref$strictChecking;

				if (strictChecking) {
					//region Check "version"
					if ("extensions" in this) {
						if (this.version !== 2) {
							return {
								indication: FAILED,
								message: "Version value for Certificate must be 2 (V3)"
							};
						}
					} else {
						if ("subjectUniqueID" in this || "issuerUniqueID" in this) {
							if (this.version !== 1 && this.version !== 2) {
								return {
									indication: FAILED,
									message: "Version value for Certificate must be 1 (V2) or 2 (V3)"
								};
							}
						} else {
							if (this.version !== 0) {
								return {
									indication: FAILED,
									message: "Version value for Certificate must be 0 (V1)"
								};
							}
						}
					}
					//endregion

					//region Check serial number
					var serialNumberView = new Uint8Array(this.serialNumber.valueBlock.valueHex);

					if ((serialNumberView[0] & 0x80) === 0x80) {
						return {
							indication: FAILED,
							message: "Serial number for Certificate must be encoded as non-negative integer"
						};
					}
					//endregion
				}

				//region Check all certificate's algorithms
				var algorithms = [this.signature.algorithmId, this.subjectPublicKeyInfo.algorithm.algorithmId, this.signatureAlgorithm.algorithmId];

				var algorithmsChecking = checkOids$1(algorithms);
				if (algorithmsChecking.indication !== PASSED) {
					return {
						indication: FAILED,
						message: "Incorrect OID in Certificate: " + algorithms[algorithmsCheckResult.message]
					};
				}
				//endregion

				//region Check validity period
				if (this.notBefore.value >= this.notAfter.value) {
					return {
						indication: FAILED,
						message: "Invalid validity perion for Certificate"
					};
				}
				//endregion

				return {
					indication: PASSED
				};
			}
			//**********************************************************************************

		}, {
			key: "cryptographicVerification",
			value: function cryptographicVerification(_ref2) {
				var _this56 = this;

				var _ref2$issuerCertifica = _ref2.issuerCertificate;
				var issuerCertificate = _ref2$issuerCertifica === undefined ? null : _ref2$issuerCertifica;

				//region Initial variables
				var sequence = Promise.resolve();

				var subjectPublicKeyInfo = {};

				var signature = this.signatureValue;
				var tbs = this.tbs;
				//endregion

				//region Set correct "subjectPublicKeyInfo" value
				if (issuerCertificate !== null) subjectPublicKeyInfo = issuerCertificate.subjectPublicKeyInfo;else {
					if (this.issuer.isEqual(this.subject)) // Self-signed certificate
						subjectPublicKeyInfo = this.subjectPublicKeyInfo;
				}

				if ("algorithm" in subjectPublicKeyInfo === false) {
					return Promise.resolve({
						indication: FAILED,
						subIndication: SIG_CRYPTO_FAILURE,
						message: "Please provide issuer certificate as a parameter"
					});
				}
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") {
					return Promise.resolve({
						indication: FAILED,
						subIndication: SIG_CRYPTO_FAILURE,
						message: "Unable to create WebCrypto object"
					});
				}
				//endregion

				//region Find signer's hashing algorithm
				var shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
				if (shaAlgorithm === "") {
					return Promise.resolve({
						indication: FAILED,
						subIndication: SIG_CRYPTO_FAILURE,
						message: "Please run FormatChecking block before CryptographicVerification block: Unsupported signature algorithm: " + this.signatureAlgorithm.algorithmId
					});
				}
				//endregion

				//region Importing public key
				sequence = sequence.then(function () {
					//region Get information about public key algorithm and default parameters for import
					var algorithmId = void 0;
					if (_this56.signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10") algorithmId = _this56.signatureAlgorithm.algorithmId;else algorithmId = subjectPublicKeyInfo.algorithm.algorithmId;

					var algorithmObject = getAlgorithmByOID(algorithmId);
					if ("name" in algorithmObject === false) {
						return Promise.resolve({
							indication: FAILED,
							subIndication: SIG_CRYPTO_FAILURE,
							message: "Please run FormatChecking block before CryptographicVerification block: Unsupported public key algorithm: " + algorithmId
						});
					}

					var algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;

					//region Special case for ECDSA
					if (algorithmObject.name === "ECDSA") {
						// #region Get information about named curve
						var algorithmParamsChecked = false;

						if ("algorithmParams" in subjectPublicKeyInfo.algorithm === true) {
							if ("idBlock" in subjectPublicKeyInfo.algorithm.algorithmParams) {
								if (subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1 && subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6) algorithmParamsChecked = true;
							}
						}

						if (algorithmParamsChecked === false) {
							return Promise.resolve({
								indication: FAILED,
								subIndication: SIG_CRYPTO_FAILURE,
								message: "Incorrect type for ECDSA public key parameters"
							});
						}

						var curveObject = getAlgorithmByOID(subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						if ("name" in curveObject === false) {
							return Promise.resolve({
								indication: FAILED,
								subIndication: SIG_CRYPTO_FAILURE,
								message: "Unsupported named curve algorithm: " + subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString()
							});
						}
						// #endregion

						algorithm.algorithm.namedCurve = curveObject.name;
					}
					//endregion
					//endregion

					var publicKeyInfoSchema = subjectPublicKeyInfo.toSchema();
					var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
					var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

					return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
				});
				//endregion

				//region Verify signature for the certificate
				sequence = sequence.then(function (publicKey) {
					//region Get default algorithm parameters for verification
					var algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					//region Special case for ECDSA signatures
					var signatureValue = signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);
						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}
					//endregion

					//region Special case for RSA-PSS
					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: _this56.signatureAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashAlgo = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) {
								return Promise.resolve({
									indication: FAILED,
									subIndication: SIG_CRYPTO_FAILURE,
									message: "Please run FormatChecking block before CryptographicVerification block: Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId
								});
							}

							hashAlgo = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashAlgo;
					}
					//endregion

					return crypto.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), new Uint8Array(tbs));
				});
				//endregion

				//region Error handling stub
				sequence = sequence.then(function (result) {
					if (result) {
						return {
							indication: PASSED
						};
					}

					return {
						indication: FAILED,
						subIndication: SIG_CRYPTO_FAILURE,
						message: "Certificate signature was not verified"
					};
				}, function (error) {
					return Promise.resolve({
						indication: FAILED,
						subIndication: SIG_CRYPTO_FAILURE,
						message: "Error during process \"Certificate.cryptographicVerification\": " + error
					});
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************
			//endregion
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "tbs":
						return new ArrayBuffer(0);
					case "version":
						return 0;
					case "serialNumber":
						return new Integer();
					case "signature":
						return new AlgorithmIdentifier();
					case "issuer":
						return new RelativeDistinguishedNames();
					case "notBefore":
						return new Time();
					case "notAfter":
						return new Time();
					case "subject":
						return new RelativeDistinguishedNames();
					case "subjectPublicKeyInfo":
						return new PublicKeyInfo();
					case "issuerUniqueID":
						return new ArrayBuffer(0);
					case "subjectUniqueID":
						return new ArrayBuffer(0);
					case "extensions":
						return [];
					case "signatureAlgorithm":
						return new AlgorithmIdentifier();
					case "signatureValue":
						return new BitString();
					default:
						throw new Error("Invalid member name for Certificate class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//Certificate  ::=  SEQUENCE  {
				//    tbsCertificate       TBSCertificate,
				//    signatureAlgorithm   AlgorithmIdentifier,
				//    signatureValue       BIT STRING  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [tbsCertificate]
     * @property {string} [signatureAlgorithm]
     * @property {string} [signatureValue]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [tbsCertificate(names.tbsCertificate), AlgorithmIdentifier.schema(names.signatureAlgorithm || {
						names: {
							blockName: "signatureAlgorithm"
						}
					}), new BitString({ name: names.signatureValue || "signatureValue" })]
				});
			}
		}]);

		return Certificate;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var EncapsulatedContentInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for EncapsulatedContentInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function EncapsulatedContentInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, EncapsulatedContentInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description eContentType
    */
			this.eContentType = getParametersValue(parameters, "eContentType", EncapsulatedContentInfo.defaultValues("eContentType"));

			if ("eContent" in parameters) {
				/**
     * @type {OctetString}
     * @description eContent
     */
				this.eContent = getParametersValue(parameters, "eContent", EncapsulatedContentInfo.defaultValues("eContent"));
				if (this.eContent.idBlock.tagClass === 1 && this.eContent.idBlock.tagNumber === 4) {
					// #region Divide OCTETSTRING value down to small pieces
					if (this.eContent.idBlock.isConstructed === false) {
						var constrString = new OctetString({
							idBlock: { isConstructed: true },
							isConstructed: true
						});

						var offset = 0;
						var length = this.eContent.valueBlock.valueHex.byteLength;

						while (length > 0) {
							var pieceView = new Uint8Array(this.eContent.valueBlock.valueHex, offset, offset + 65536 > this.eContent.valueBlock.valueHex.byteLength ? this.eContent.valueBlock.valueHex.byteLength - offset : 65536);
							var _array = new ArrayBuffer(pieceView.length);
							var _view = new Uint8Array(_array);

							for (var i = 0; i < _view.length; i++) {
								_view[i] = pieceView[i];
							}constrString.valueBlock.value.push(new OctetString({ valueHex: _array }));

							length -= pieceView.length;
							offset += pieceView.length;
						}

						this.eContent = constrString;
					}
					// #endregion
				}
			}
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(EncapsulatedContentInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, EncapsulatedContentInfo.schema({
					names: {
						eContentType: "eContentType",
						eContent: "eContent"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for EncapsulatedContentInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.eContentType = asn1.result.eContentType.valueBlock.toString();
				if ("eContent" in asn1.result) this.eContent = asn1.result.eContent;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence 
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.eContentType }));
				if ("eContent" in this) {
					if (EncapsulatedContentInfo.compareWithDefault("eContent", this.eContent) === false) {
						outputArray.push(new Constructed({
							optional: true,
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [this.eContent]
						}));
					}
				}
				//endregion 

				//region Construct and return new ASN.1 schema for this object 
				return new Sequence({
					value: outputArray
				});
				//endregion 
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					eContentType: this.eContentType
				};

				if ("eContent" in this) {
					if (EncapsulatedContentInfo.compareWithDefault("eContent", this.eContent) === false) _object.eContent = this.eContent.toJSON();
				}

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "eContentType":
						return "";
					case "eContent":
						return new OctetString();
					default:
						throw new Error("Invalid member name for EncapsulatedContentInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "eContentType":
						return memberValue === "";
					case "eContent":
						return memberValue.isEqual(EncapsulatedContentInfo.defaultValues("eContent"));
					default:
						throw new Error("Invalid member name for EncapsulatedContentInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//EncapsulatedContentInfo ::= SEQUENCE {
				//    eContentType ContentType,
				//    eContent [0] EXPLICIT OCTET STRING OPTIONAL } // Changed it to ANY, as in PKCS#7

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [type]
     * @property {string} [setName]
     * @property {string} [values]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.eContentType || "" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Any({ name: names.eContent || "" }) // In order to aling this with PKCS#7 and CMS as well
						]
					})]
				});
			}
		}]);

		return EncapsulatedContentInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var OtherCertificateFormat = function () {
		//**********************************************************************************
		/**
   * Constructor for OtherCertificateFormat class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OtherCertificateFormat() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OtherCertificateFormat);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description otherCertFormat
    */
			this.otherCertFormat = getParametersValue(parameters, "otherCertFormat", OtherCertificateFormat.defaultValues("otherCertFormat"));
			/**
    * @type {Any}
    * @description otherCert
    */
			this.otherCert = getParametersValue(parameters, "otherCert", OtherCertificateFormat.defaultValues("otherCert"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OtherCertificateFormat, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OtherCertificateFormat.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OtherCertificateFormat");
				//endregion

				//region Get internal properties from parsed schema
				this.otherCertFormat = asn1.result.otherCertFormat.valueBlock.toString();
				this.otherCert = asn1.result.otherCert;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.otherCertFormat }), this.otherCert]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					otherCertFormat: this.otherCertFormat
				};

				if (!(this.otherCert instanceof Any)) object.otherCert = this.otherCert.toJSON();

				return object;
			}
			//**********************************************************************************
			//region Basic Building Blocks for Verification Engine
			//**********************************************************************************

		}, {
			key: "formatChecking",
			value: function formatChecking() {
				return {
					indication: constants.PASSED
				};
			}
			//**********************************************************************************
			//endregion
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "otherCertFormat":
						return "";
					case "otherCert":
						return new Any();
					default:
						throw new Error("Invalid member name for OtherCertificateFormat class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OtherCertificateFormat ::= SEQUENCE {
				//    otherCertFormat OBJECT IDENTIFIER,
				//    otherCert ANY DEFINED BY otherCertFormat }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [otherCertFormat]
     * @property {string} [otherCert]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.otherCertFormat || "otherCertFormat" }), new Any({ name: names.otherCert || "otherCert" })]
				});
			}
		}]);

		return OtherCertificateFormat;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var RevokedCertificate = function () {
		//**********************************************************************************
		/**
   * Constructor for RevokedCertificate class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RevokedCertificate() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RevokedCertificate);

			//region Internal properties of the object
			/**
    * @type {Integer}
    * @description userCertificate
    */
			this.userCertificate = getParametersValue(parameters, "userCertificate", RevokedCertificate.defaultValues("userCertificate"));
			/**
    * @type {Time}
    * @description revocationDate
    */
			this.revocationDate = getParametersValue(parameters, "revocationDate", RevokedCertificate.defaultValues("revocationDate"));

			if ("crlEntryExtensions" in parameters)
				/**
     * @type {Extensions}
     * @description crlEntryExtensions
     */
				this.crlEntryExtensions = getParametersValue(parameters, "crlEntryExtensions", RevokedCertificate.defaultValues("crlEntryExtensions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RevokedCertificate, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RevokedCertificate.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for REV_CERT");
				//endregion

				//region Get internal properties from parsed schema
				this.userCertificate = asn1.result.userCertificate;
				this.revocationDate = new Time({ schema: asn1.result.revocationDate });

				if ("crlEntryExtensions" in asn1.result) this.crlEntryExtensions = new Extensions({ schema: asn1.result.crlEntryExtensions });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [this.userCertificate, this.revocationDate.toSchema()];

				if ("crlEntryExtensions" in this) outputArray.push(this.crlEntryExtensions.toSchema());
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					userCertificate: this.userCertificate.toJSON(),
					revocationDate: this.revocationDate.toJSON
				};

				if ("crlEntryExtensions" in this) object.crlEntryExtensions = this.crlEntryExtensions.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "userCertificate":
						return new Integer();
					case "revocationDate":
						return new Time();
					case "crlEntryExtensions":
						return new Extensions();
					default:
						throw new Error("Invalid member name for RevokedCertificate class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [userCertificate]
     * @property {string} [revocationDate]
     * @property {string} [crlEntryExtensions]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.userCertificate || "userCertificate" }), Time.schema({
						names: {
							utcTimeName: names.revocationDate || "revocationDate",
							generalTimeName: names.revocationDate || "revocationDate"
						}
					}), Extensions.schema({
						names: {
							blockName: names.crlEntryExtensions || "crlEntryExtensions"
						}
					}, true)]
				});
			}
		}]);

		return RevokedCertificate;
	}();
	//**************************************************************************************

	//**************************************************************************************


	function tbsCertList() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		//TBSCertList  ::=  SEQUENCE  {
		//    version                 Version OPTIONAL,
		//                                 -- if present, MUST be v2
		//    signature               AlgorithmIdentifier,
		//    issuer                  Name,
		//    thisUpdate              Time,
		//    nextUpdate              Time OPTIONAL,
		//    revokedCertificates     SEQUENCE OF SEQUENCE  {
		//        userCertificate         CertificateSerialNumber,
		//        revocationDate          Time,
		//        crlEntryExtensions      Extensions OPTIONAL
		//        -- if present, version MUST be v2
		//    }  OPTIONAL,
		//    crlExtensions           [0]  EXPLICIT Extensions OPTIONAL
		//    -- if present, version MUST be v2
		//}

		/**
   * @type {Object}
   * @property {string} [blockName]
   * @property {string} [tbsCertListVersion]
   * @property {string} [signature]
   * @property {string} [issuer]
   * @property {string} [tbsCertListThisUpdate]
   * @property {string} [tbsCertListNextUpdate]
   * @property {string} [tbsCertListRevokedCertificates]
   * @property {string} [crlExtensions]
   */
		var names = getParametersValue(parameters, "names", {});

		return new Sequence({
			name: names.blockName || "tbsCertList",
			value: [new Integer({
				optional: true,
				name: names.tbsCertListVersion || "tbsCertList.version",
				value: 2
			}), // EXPLICIT integer value (v2)
			AlgorithmIdentifier.schema(names.signature || {
				names: {
					blockName: "tbsCertList.signature"
				}
			}), RelativeDistinguishedNames.schema(names.issuer || {
				names: {
					blockName: "tbsCertList.issuer"
				}
			}), Time.schema(names.tbsCertListThisUpdate || {
				names: {
					utcTimeName: "tbsCertList.thisUpdate",
					generalTimeName: "tbsCertList.thisUpdate"
				}
			}), Time.schema(names.tbsCertListNextUpdate || {
				names: {
					utcTimeName: "tbsCertList.nextUpdate",
					generalTimeName: "tbsCertList.nextUpdate"
				}
			}, true), new Sequence({
				optional: true,
				value: [new Repeated({
					name: names.tbsCertListRevokedCertificates || "tbsCertList.revokedCertificates",
					value: new Sequence({
						value: [new Integer(), Time.schema(), Extensions.schema({}, true)]
					})
				})]
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [Extensions.schema(names.crlExtensions || {
					names: {
						blockName: "tbsCertList.extensions"
					}
				})]
			}) // EXPLICIT SEQUENCE value
			]
		});
	}
	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var CertificateRevocationList = function () {
		//**********************************************************************************
		/**
   * Constructor for Attribute class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CertificateRevocationList() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CertificateRevocationList);

			//region Internal properties of the object
			/**
    * @type {ArrayBuffer}
    * @description tbs
    */
			this.tbs = getParametersValue(parameters, "tbs", CertificateRevocationList.defaultValues("tbs"));
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", CertificateRevocationList.defaultValues("version"));
			/**
    * @type {AlgorithmIdentifier}
    * @description signature
    */
			this.signature = getParametersValue(parameters, "signature", CertificateRevocationList.defaultValues("signature"));
			/**
    * @type {RelativeDistinguishedNames}
    * @description issuer
    */
			this.issuer = getParametersValue(parameters, "issuer", CertificateRevocationList.defaultValues("issuer"));
			/**
    * @type {Time}
    * @description thisUpdate
    */
			this.thisUpdate = getParametersValue(parameters, "thisUpdate", CertificateRevocationList.defaultValues("thisUpdate"));

			if ("nextUpdate" in parameters)
				/**
     * @type {Time}
     * @description nextUpdate
     */
				this.nextUpdate = getParametersValue(parameters, "nextUpdate", CertificateRevocationList.defaultValues("nextUpdate"));

			if ("revokedCertificates" in parameters)
				/**
     * @type {Array.<RevokedCertificate>}
     * @description revokedCertificates
     */
				this.revokedCertificates = getParametersValue(parameters, "revokedCertificates", CertificateRevocationList.defaultValues("revokedCertificates"));

			if ("crlExtensions" in parameters)
				/**
     * @type {Extensions}
     * @description crlExtensions
     */
				this.crlExtensions = getParametersValue(parameters, "crlExtensions", CertificateRevocationList.defaultValues("crlExtensions"));

			/**
    * @type {AlgorithmIdentifier}
    * @description signatureAlgorithm
    */
			this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", CertificateRevocationList.defaultValues("signatureAlgorithm"));
			/**
    * @type {BitString}
    * @description signatureValue
    */
			this.signatureValue = getParametersValue(parameters, "signatureValue", CertificateRevocationList.defaultValues("signatureValue"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CertificateRevocationList, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CertificateRevocationList.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CRL");
				//endregion

				//region Get internal properties from parsed schema
				this.tbs = asn1.result.tbsCertList.valueBeforeDecode;

				if ("tbsCertList.version" in asn1.result) this.version = asn1.result["tbsCertList.version"].valueBlock.valueDec;
				this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertList.signature"] });
				this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertList.issuer"] });
				this.thisUpdate = new Time({ schema: asn1.result["tbsCertList.thisUpdate"] });
				if ("tbsCertList.nextUpdate" in asn1.result) this.nextUpdate = new Time({ schema: asn1.result["tbsCertList.nextUpdate"] });
				if ("tbsCertList.revokedCertificates" in asn1.result) this.revokedCertificates = Array.from(asn1.result["tbsCertList.revokedCertificates"], function (element) {
					return new RevokedCertificate({ schema: element });
				});
				if ("tbsCertList.extensions" in asn1.result) this.crlExtensions = new Extensions({ schema: asn1.result["tbsCertList.extensions"] });

				this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
				this.signatureValue = asn1.result.signatureValue;
				//endregion
			}
			//**********************************************************************************

		}, {
			key: "encodeTBS",
			value: function encodeTBS() {
				//region Create array for output sequence
				var outputArray = [];

				if (this.version !== CertificateRevocationList.defaultValues("version")) outputArray.push(new Integer({ value: this.version }));

				outputArray.push(this.signature.toSchema());
				outputArray.push(this.issuer.toSchema());
				outputArray.push(this.thisUpdate.toSchema());

				if ("nextUpdate" in this) outputArray.push(this.nextUpdate.toSchema());

				if ("revokedCertificates" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.revokedCertificates, function (element) {
							return element.toSchema();
						})
					}));
				}

				if ("crlExtensions" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.crlExtensions.toSchema()]
					}));
				}
				//endregion

				return new Sequence({
					value: outputArray
				});
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				var encodeFlag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Decode stored TBS value
				var tbsSchema = void 0;

				if (encodeFlag === false) {
					if (this.tbs.length === 0) // No stored TBS part
						return CertificateRevocationList.schema();

					tbsSchema = fromBER(this.tbs).result;
				}
				//endregion
				//region Create TBS schema via assembling from TBS parts
				else tbsSchema = this.encodeTBS();
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [tbsSchema, this.signatureAlgorithm.toSchema(), this.signatureValue]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					tbs: bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
					signature: this.signature.toJSON(),
					issuer: this.issuer.toJSON(),
					thisUpdate: this.thisUpdate.toJSON(),
					signatureAlgorithm: this.signatureAlgorithm.toJSON(),
					signatureValue: this.signatureValue.toJSON()
				};

				if (this.version !== CertificateRevocationList.defaultValues("version")) object.version = this.version;

				if ("nextUpdate" in this) object.nextUpdate = this.nextUpdate.toJSON();

				if ("revokedCertificates" in this) object.revokedCertificates = Array.from(this.revokedCertificates, function (element) {
					return element.toJSON();
				});

				if ("crlExtensions" in this) object.crlExtensions = this.crlExtensions.toJSON();

				return object;
			}
			//**********************************************************************************

		}, {
			key: "isCertificateRevoked",
			value: function isCertificateRevoked(certificate) {
				//region Check that issuer of the input certificate is the same with issuer of this CRL
				if (this.issuer.isEqual(certificate.issuer) === false) return false;
				//endregion

				//region Check that there are revoked certificates in this CRL
				if ("revokedCertificates" in this === false) return false;
				//endregion

				//region Search for input certificate in revoked certificates array
				var _iteratorNormalCompletion15 = true;
				var _didIteratorError15 = false;
				var _iteratorError15 = undefined;

				try {
					for (var _iterator15 = this.revokedCertificates[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
						var revokedCertificate = _step15.value;

						if (revokedCertificate.userCertificate.isEqual(certificate.serialNumber)) return true;
					}
					//endregion
				} catch (err) {
					_didIteratorError15 = true;
					_iteratorError15 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion15 && _iterator15.return) {
							_iterator15.return();
						}
					} finally {
						if (_didIteratorError15) {
							throw _iteratorError15;
						}
					}
				}

				return false;
			}
			//**********************************************************************************
			/**
    * Make a signature for existing CRL data
    * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
    * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
    */

		}, {
			key: "sign",
			value: function sign(privateKey) {
				var _this57 = this;

				var hashAlgorithm = arguments.length <= 1 || arguments[1] === undefined ? "SHA-1" : arguments[1];

				//region Get a private key from function parameter
				if (typeof privateKey === "undefined") return Promise.reject("Need to provide a private key for signing");
				//endregion

				//region Get hashing algorithm
				var oid = getOIDByAlgorithm({ name: hashAlgorithm });
				if (oid === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);
				//endregion

				//region Get a "default parameters" for current algorithm
				var defParams = getAlgorithmParameters(privateKey.algorithm.name, "sign");
				defParams.algorithm.hash.name = hashAlgorithm;
				//endregion

				//region Fill internal structures base on "privateKey" and "hashAlgorithm"
				switch (privateKey.algorithm.name.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
					case "ECDSA":
						this.signature.algorithmId = getOIDByAlgorithm(defParams.algorithm);
						this.signatureAlgorithm.algorithmId = this.signature.algorithmId;
						break;
					case "RSA-PSS":
						{
							//region Set "saltLength" as a length (in octets) of hash function result
							switch (hashAlgorithm.toUpperCase()) {
								case "SHA-256":
									defParams.algorithm.saltLength = 32;
									break;
								case "SHA-384":
									defParams.algorithm.saltLength = 48;
									break;
								case "SHA-512":
									defParams.algorithm.saltLength = 64;
									break;
								default:
							}
							//endregion

							//region Fill "RSASSA_PSS_params" object
							var paramsObject = {};

							if (hashAlgorithm.toUpperCase() !== "SHA-1") {
								var hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
								if (hashAlgorithmOID === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);

								paramsObject.hashAlgorithm = new AlgorithmIdentifier({
									algorithmId: hashAlgorithmOID,
									algorithmParams: new Null()
								});

								paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
									algorithmId: "1.2.840.113549.1.1.8", // MGF1
									algorithmParams: paramsObject.hashAlgorithm.toSchema()
								});
							}

							if (defParams.algorithm.saltLength !== 20) paramsObject.saltLength = defParams.algorithm.saltLength;

							var pssParameters = new RSASSAPSSParams(paramsObject);
							//endregion

							//region Automatically set signature algorithm
							this.signature = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.10",
								algorithmParams: pssParameters.toSchema()
							});
							this.signatureAlgorithm = this.signature; // Must be the same
							//endregion
						}
						break;
					default:
						return Promise.reject("Unsupported signature algorithm: " + privateKey.algorithm.name);
				}
				//endregion

				//region Create TBS data for signing
				this.tbs = this.encodeTBS().toBER(false);
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Signing TBS data on provided private key
				return crypto.sign(defParams.algorithm, privateKey, new Uint8Array(this.tbs)).then(function (result) {
					//region Special case for ECDSA algorithm
					if (defParams.algorithm.name === "ECDSA") result = createCMSECDSASignature(result);
					//endregion

					_this57.signatureValue = new BitString({ valueHex: result });
				}, function (error) {
					return Promise.reject("Signing error: " + error);
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Verify existing signature
    * @param {{[issuerCertificate]: Object, [publicKeyInfo]: Object}} parameters
    * @returns {*}
    */

		}, {
			key: "verify",
			value: function verify() {
				var _this58 = this;

				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//region Global variables
				var sequence = Promise.resolve();

				var signature = this.signatureValue;
				var tbs = this.tbs;

				var subjectPublicKeyInfo = -1;
				//endregion

				//region Get information about CRL issuer certificate
				if ("issuerCertificate" in parameters) // "issuerCertificate" must be of type "simpl.CERT"
					{
						subjectPublicKeyInfo = parameters.issuerCertificate.subjectPublicKeyInfo;

						// The CRL issuer name and "issuerCertificate" subject name are not equal
						if (this.issuer.isEqual(parameters.issuerCertificate.subject) === false) return Promise.resolve(false);
					}

				//region In case if there is only public key during verification
				if ("publicKeyInfo" in parameters) subjectPublicKeyInfo = parameters.publicKeyInfo; // Must be of type "PublicKeyInfo"
				//endregion

				if (subjectPublicKeyInfo instanceof PublicKeyInfo === false) return Promise.reject("Issuer's certificate must be provided as an input parameter");
				//endregion

				//region Check the CRL for unknown critical extensions
				if ("crlExtensions" in this) {
					var _iteratorNormalCompletion16 = true;
					var _didIteratorError16 = false;
					var _iteratorError16 = undefined;

					try {
						for (var _iterator16 = this.crlExtensions.extensions[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
							var extension = _step16.value;

							if (extension.critical) {
								// We can not be sure that unknown extension has no value for CRL signature
								if ("parsedValue" in extension === false) return Promise.resolve(false);
							}
						}
					} catch (err) {
						_didIteratorError16 = true;
						_iteratorError16 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion16 && _iterator16.return) {
								_iterator16.return();
							}
						} finally {
							if (_didIteratorError16) {
								throw _iteratorError16;
							}
						}
					}
				}
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Find signer's hashing algorithm
				var shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
				if (shaAlgorithm === "") return Promise.reject("Unsupported signature algorithm: " + this.signatureAlgorithm.algorithmId);
				//endregion

				//region Import public key
				sequence = sequence.then(function () {
					//region Get information about public key algorithm and default parameters for import
					var algorithmObject = getAlgorithmByOID(_this58.signature.algorithmId);
					if ("name" in algorithmObject === "") return Promise.reject("Unsupported public key algorithm: " + _this58.signature.algorithmId);

					var algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;

					//region Special case for ECDSA
					if (algorithmObject.name === "ECDSA") {
						// #region Get information about named curve
						var algorithmParamsChecked = false;

						if ("algorithmParams" in subjectPublicKeyInfo.algorithm === true) {
							if ("idBlock" in subjectPublicKeyInfo.algorithm.algorithmParams) {
								if (subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1 && subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6) algorithmParamsChecked = true;
							}
						}

						if (algorithmParamsChecked === false) return Promise.reject("Incorrect type for ECDSA public key parameters");

						var curveObject = getAlgorithmByOID(subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						if ("name" in curveObject === false) return Promise.reject("Unsupported named curve algorithm: " + subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						// #endregion

						algorithm.algorithm.namedCurve = curveObject.name;
					}
					//endregion
					//endregion

					var publicKeyInfoSchema = subjectPublicKeyInfo.toSchema();
					var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
					var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

					return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
				});
				//endregion

				//region Verify signature for the certificate
				sequence = sequence.then(function (publicKey) {
					//region Get default algorithm parameters for verification
					var algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					//region Special case for ECDSA signatures
					var signatureValue = signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);
						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}
					//endregion

					//region Special case for RSA-PSS
					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: _this58.signatureAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashAlgo = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) return Promise.reject("Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId);

							hashAlgo = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashAlgo;
					}
					//endregion

					return crypto.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), new Uint8Array(tbs));
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "tbs":
						return new ArrayBuffer(0);
					case "version":
						return 1;
					case "signature":
						return new AlgorithmIdentifier();
					case "issuer":
						return new RelativeDistinguishedNames();
					case "thisUpdate":
						return new Time();
					case "nextUpdate":
						return new Time();
					case "revokedCertificates":
						return [];
					case "crlExtensions":
						return new Extensions();
					case "signatureAlgorithm":
						return new AlgorithmIdentifier();
					case "signatureValue":
						return new BitString();
					default:
						throw new Error("Invalid member name for CertificateRevocationList class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//CertificateList  ::=  SEQUENCE  {
				//    tbsCertList          TBSCertList,
				//    signatureAlgorithm   AlgorithmIdentifier,
				//    signatureValue       BIT STRING  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [signatureAlgorithm]
     * @property {string} [signatureValue]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "CertificateList",
					value: [tbsCertList(parameters), AlgorithmIdentifier.schema(names.signatureAlgorithm || {
						names: {
							blockName: "signatureAlgorithm"
						}
					}), new BitString({ name: names.signatureValue || "signatureValue" })]
				});
			}
		}]);

		return CertificateRevocationList;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var OtherRevocationInfoFormat = function () {
		//**********************************************************************************
		/**
   * Constructor for OtherRevocationInfoFormat class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OtherRevocationInfoFormat() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OtherRevocationInfoFormat);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description otherRevInfoFormat
    */
			this.otherRevInfoFormat = getParametersValue(parameters, "otherRevInfoFormat", OtherRevocationInfoFormat.defaultValues("otherRevInfoFormat"));
			/**
    * @type {Any}
    * @description otherRevInfo
    */
			this.otherRevInfo = getParametersValue(parameters, "otherRevInfo", OtherRevocationInfoFormat.defaultValues("otherRevInfo"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OtherRevocationInfoFormat, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OtherRevocationInfoFormat.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OtherRevocationInfoFormat");
				//endregion

				//region Get internal properties from parsed schema
				this.otherRevInfoFormat = asn1.result.otherRevInfoFormat.valueBlock.toString();
				this.otherRevInfo = asn1.result.otherRevInfo;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.otherRevInfoFormat }), this.otherRevInfo]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					otherRevInfoFormat: this.otherRevInfoFormat
				};

				if (!(this.otherRevInfo instanceof Any)) object.otherRevInfo = this.otherRevInfo.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "otherRevInfoFormat":
						return "";
					case "otherRevInfo":
						return new Any();
					default:
						throw new Error("Invalid member name for OtherRevocationInfoFormat class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OtherCertificateFormat ::= SEQUENCE {
				//    otherRevInfoFormat OBJECT IDENTIFIER,
				//    otherRevInfo ANY DEFINED BY otherCertFormat }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [otherRevInfoFormat]
     * @property {string} [otherRevInfo]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.otherRevInfoFormat || "otherRevInfoFormat" }), new Any({ name: names.otherRevInfo || "otherRevInfo" })]
				});
			}
		}]);

		return OtherRevocationInfoFormat;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var SignedAndUnsignedAttributes = function () {
		//**********************************************************************************
		/**
   * Constructor for SignedAndUnsignedAttributes class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function SignedAndUnsignedAttributes() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, SignedAndUnsignedAttributes);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description type Type = 0 for signed attributes, Type = 1 for unsigned attributes
    */
			this.type = getParametersValue(parameters, "type", SignedAndUnsignedAttributes.defaultValues("type"));
			/**
    * @type {Array.<Attribute>}
    * @description attributes
    */
			this.attributes = getParametersValue(parameters, "attributes", SignedAndUnsignedAttributes.defaultValues("attributes"));
			/**
    * @type {ArrayBuffer}
    * @description encodedValue Need to have it in order to successfully process with signature verification
    */
			this.encodedValue = getParametersValue(parameters, "encodedValue", SignedAndUnsignedAttributes.defaultValues("encodedValue"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(SignedAndUnsignedAttributes, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, SignedAndUnsignedAttributes.schema({
					names: {
						tagNumber: this.type,
						attributes: "attributes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for SignedUnsignedAttributes");
				//endregion

				//region Get internal properties from parsed schema
				this.type = asn1.result.idBlock.tagNumber;
				this.encodedValue = asn1.result.valueBeforeDecode;

				//region Change type from "[0]" to "SET" accordingly to standard
				var encodedView = new Uint8Array(this.encodedValue);
				encodedView[0] = 0x31;
				//endregion

				if ("attributes" in asn1.result === false) {
					if (this.type === 0) throw new Error("Wrong structure of SignedUnsignedAttributes");else return; // Not so important in case of "UnsignedAttributes"
				}

				this.attributes = Array.from(asn1.result.attributes, function (element) {
					return new Attribute({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				if (SignedAndUnsignedAttributes.compareWithDefault("type", this.type) || SignedAndUnsignedAttributes.compareWithDefault("attributes", this.attributes)) throw new Error("Incorrectly initialized \"SignedAndUnsignedAttributes\" class");

				//region Construct and return new ASN.1 schema for this object
				return new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: this.type // "SignedAttributes" = 0, "UnsignedAttributes" = 1
					},
					value: Array.from(this.attributes, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				if (SignedAndUnsignedAttributes.compareWithDefault("type", this.type) || SignedAndUnsignedAttributes.compareWithDefault("attributes", this.attributes)) throw new Error("Incorrectly initialized \"SignedAndUnsignedAttributes\" class");

				return {
					type: this.type,
					attributes: Array.from(this.attributes, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************
			/**
    * Search for Attribute with specific OID
    * @param {string} oid String representation of Attribute's OID
    * @return {Array.<Attribute>|Attribute|null} If no Attribute found - null, if one Attribute found - Attribute, if many Attributes found - Array of Attributes
    */

		}, {
			key: "searchForOID",
			value: function searchForOID(oid) {
				var result = null;

				var _iteratorNormalCompletion17 = true;
				var _didIteratorError17 = false;
				var _iteratorError17 = undefined;

				try {
					for (var _iterator17 = this.attributes[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
						var attribute = _step17.value;

						if (attribute.type === oid) {
							if (result === null) result = [];

							result.push(attribute);
						}
					}
				} catch (err) {
					_didIteratorError17 = true;
					_iteratorError17 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion17 && _iterator17.return) {
							_iterator17.return();
						}
					} finally {
						if (_didIteratorError17) {
							throw _iteratorError17;
						}
					}
				}

				return result.length === 1 ? result[0] : result;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return -1;
					case "attributes":
						return [];
					case "encodedValue":
						return new ArrayBuffer(0);
					default:
						throw new Error("Invalid member name for SignedAndUnsignedAttributes class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "type":
						return memberValue === SignedAndUnsignedAttributes.defaultValues("type");
					case "attributes":
						return memberValue.length === 0;
					case "encodedValue":
						return memberValue.byteLength === 0;
					default:
						throw new Error("Invalid member name for SignedAndUnsignedAttributes class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//    signedAttrs [0] IMPLICIT SignedAttributes OPTIONAL,
				//    unsignedAttrs [1] IMPLICIT UnsignedAttributes OPTIONAL }

				//SignedAttributes ::= SET SIZE (1..MAX) OF Attribute

				//UnsignedAttributes ::= SET SIZE (1..MAX) OF Attribute

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {number} [tagNumber]
     * @property {string} [attributes]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Constructed({
					name: names.blockName || "",
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: names.tagNumber // "SignedAttributes" = 0, "UnsignedAttributes" = 1
					},
					value: [new Repeated({
						name: names.attributes || "",
						value: Attribute.schema()
					})]
				});
			}
		}]);

		return SignedAndUnsignedAttributes;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var IssuerAndSerialNumber = function () {
		//**********************************************************************************
		/**
   * Constructor for IssuerAndSerialNumber class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function IssuerAndSerialNumber() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, IssuerAndSerialNumber);

			//region Internal properties of the object
			/**
    * @type {RelativeDistinguishedNames}
    * @description issuer
    */
			this.issuer = getParametersValue(parameters, "issuer", IssuerAndSerialNumber.defaultValues("issuer"));
			/**
    * @type {Integer}
    * @description serialNumber
    */
			this.serialNumber = getParametersValue(parameters, "serialNumber", IssuerAndSerialNumber.defaultValues("serialNumber"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(IssuerAndSerialNumber, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, IssuerAndSerialNumber.schema({
					names: {
						issuer: {
							names: {
								blockName: "issuer"
							}
						},
						serialNumber: "serialNumber"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for IssuerAndSerialNumber");
				//endregion

				//region Get internal properties from parsed schema
				this.issuer = new RelativeDistinguishedNames({ schema: asn1.result.issuer });
				this.serialNumber = asn1.result.serialNumber;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.issuer.toSchema(), this.serialNumber]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					issuer: this.issuer.toJSON(),
					serialNumber: this.serialNumber.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "issuer":
						return new RelativeDistinguishedNames();
					case "serialNumber":
						return new Integer();
					default:
						throw new Error("Invalid member name for IssuerAndSerialNumber class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//IssuerAndSerialNumber ::= SEQUENCE {
				//    issuer Name,
				//    serialNumber CertificateSerialNumber }
				//
				//CertificateSerialNumber ::= INTEGER

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [issuer]
     * @property {string} [serialNumber]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [RelativeDistinguishedNames.schema(names.issuer || {}), new Integer({ name: names.serialNumber || "" })]
				});
			}
		}]);

		return IssuerAndSerialNumber;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var SignerInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for SignerInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function SignerInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, SignerInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", SignerInfo.defaultValues("version"));
			/**
    * @type {Object}
    * @description sid
    */
			this.sid = getParametersValue(parameters, "sid", SignerInfo.defaultValues("sid"));
			/**
    * @type {AlgorithmIdentifier}
    * @description digestAlgorithm
    */
			this.digestAlgorithm = getParametersValue(parameters, "digestAlgorithm", SignerInfo.defaultValues("digestAlgorithm"));

			if ("signedAttrs" in parameters)
				/**
     * @type {SignedAndUnsignedAttributes}
     * @description signedAttrs
     */
				this.signedAttrs = getParametersValue(parameters, "signedAttrs", SignerInfo.defaultValues("signedAttrs"));

			/**
    * @type {AlgorithmIdentifier}
    * @description digestAlgorithm
    */
			this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", SignerInfo.defaultValues("signatureAlgorithm"));
			/**
    * @type {OctetString}
    * @description signature
    */
			this.signature = getParametersValue(parameters, "signature", SignerInfo.defaultValues("signature"));

			if ("unsignedAttrs" in parameters)
				/**
     * @type {SignedAndUnsignedAttributes}
     * @description unsignedAttrs
     */
				this.unsignedAttrs = getParametersValue(parameters, "unsignedAttrs", SignerInfo.defaultValues("unsignedAttrs"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(SignerInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, SignerInfo.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for SignerInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result["SignerInfo.version"].valueBlock.valueDec;

				var currentSid = asn1.result["SignerInfo.sid"];
				if (currentSid.idBlock.tagClass === 1) this.sid = new IssuerAndSerialNumber({ schema: currentSid });else this.sid = currentSid;

				this.digestAlgorithm = new AlgorithmIdentifier({ schema: asn1.result["SignerInfo.digestAlgorithm"] });
				if ("SignerInfo.signedAttrs" in asn1.result) this.signedAttrs = new SignedAndUnsignedAttributes({ type: 0, schema: asn1.result["SignerInfo.signedAttrs"] });

				this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result["SignerInfo.signatureAlgorithm"] });
				this.signature = asn1.result["SignerInfo.signature"];
				if ("SignerInfo.unsignedAttrs" in asn1.result) this.unsignedAttrs = new SignedAndUnsignedAttributes({ type: 1, schema: asn1.result["SignerInfo.unsignedAttrs"] });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				if (SignerInfo.compareWithDefault("sid", this.sid)) throw new Error("Incorrectly initialized \"SignerInfo\" class");

				//region Create array for output sequence 
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));

				if (this.sid instanceof IssuerAndSerialNumber) outputArray.push(this.sid.toSchema());else outputArray.push(this.sid);

				outputArray.push(this.digestAlgorithm.toSchema());

				if ("signedAttrs" in this) {
					if (SignerInfo.compareWithDefault("signedAttrs", this.signedAttrs) === false) outputArray.push(this.signedAttrs.toSchema());
				}

				outputArray.push(this.signatureAlgorithm.toSchema());
				outputArray.push(this.signature);

				if ("unsignedAttrs" in this) {
					if (SignerInfo.compareWithDefault("unsignedAttrs", this.unsignedAttrs) === false) outputArray.push(this.unsignedAttrs.toSchema());
				}
				//endregion 

				//region Construct and return new ASN.1 schema for this object 
				return new Sequence({
					value: outputArray
				});
				//endregion 
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				if (SignerInfo.compareWithDefault("sid", this.sid)) throw new Error("Incorrectly initialized \"SignerInfo\" class");

				var _object = {
					version: this.version
				};

				if (!(this.sid instanceof Any)) _object.sid = this.sid.toJSON();

				_object.digestAlgorithm = this.digestAlgorithm.toJSON();

				if (SignerInfo.compareWithDefault("signedAttrs", this.signedAttrs) === false) _object.signedAttrs = this.signedAttrs.toJSON();

				_object.signatureAlgorithm = this.signatureAlgorithm.toJSON();
				_object.signature = this.signature.toJSON();

				if (SignerInfo.compareWithDefault("unsignedAttrs", this.unsignedAttrs) === false) _object.unsignedAttrs = this.unsignedAttrs.toJSON();

				return _object;
			}
			//**********************************************************************************
			//region Basic Building Blocks for Verification Engine
			//**********************************************************************************

		}, {
			key: "formatChecking",
			value: function formatChecking(_ref3) {
				var _ref3$strictChecking = _ref3.strictChecking;
				var strictChecking = _ref3$strictChecking === undefined ? false : _ref3$strictChecking;

				if (strictChecking) {
					//region Check version
					if ("serialNumber" in this.sid) {
						if (this.version !== 1) {
							return {
								indication: FAILED,
								message: "Version value for SignerInfo must be 1"
							};
						}
					} else {
						if (this.version !== 3) {
							return {
								indication: FAILED,
								message: "Version value for SignerInfo must be 3"
							};
						}
					}
					//endregion
				}

				//region Check mandatory attributes
				if ("signedAttrs" in this) {
					var foundContentType = false;
					var foundMessageDigest = false;

					var _iteratorNormalCompletion18 = true;
					var _didIteratorError18 = false;
					var _iteratorError18 = undefined;

					try {
						for (var _iterator18 = this.signedAttrs.attributes[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
							var attribute = _step18.value;

							//region Check that "content-type" attribute exists
							if (attribute.type === "1.2.840.113549.1.9.3") foundContentType = true;
							//endregion

							//region Check that "message-digest" attribute exists
							if (attribute.type === "1.2.840.113549.1.9.4") foundMessageDigest = true;
							//endregion

							//region Speed-up searching
							if (foundContentType && foundMessageDigest) break;
							//endregion
						}
					} catch (err) {
						_didIteratorError18 = true;
						_iteratorError18 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion18 && _iterator18.return) {
								_iterator18.return();
							}
						} finally {
							if (_didIteratorError18) {
								throw _iteratorError18;
							}
						}
					}

					if (foundContentType === false) {
						return {
							indication: FAILED,
							message: "Attribute 'content-type' is a mandatory attribute for 'signed attributes' for SignerInfo"
						};
					}

					if (foundMessageDigest === false) {
						return {
							indication: FAILED,
							message: "Attribute 'message-digest' is a mandatory attribute for 'signed attributes' for SignerInfo"
						};
					}
				}
				//endregion

				//region Perform format checking for all signed and unsigned attributes
				if ("signedAttrs" in this) {
					var _iteratorNormalCompletion19 = true;
					var _didIteratorError19 = false;
					var _iteratorError19 = undefined;

					try {
						for (var _iterator19 = this.signedAttrs.attributes.entries()[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
							var _step19$value = _slicedToArray(_step19.value, 2);

							var index = _step19$value[0];
							var _attribute = _step19$value[1];

							var formatCheckingResult = _attribute.formatChecking();
							if (formatCheckingResult.indication !== PASSED) {
								return {
									indication: FAILED,
									message: "Signed attribute with index " + index + " did not pass format checking"
								};
							}
						}
					} catch (err) {
						_didIteratorError19 = true;
						_iteratorError19 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion19 && _iterator19.return) {
								_iterator19.return();
							}
						} finally {
							if (_didIteratorError19) {
								throw _iteratorError19;
							}
						}
					}
				}

				if ("unsignedAttrs" in this) {
					var _iteratorNormalCompletion20 = true;
					var _didIteratorError20 = false;
					var _iteratorError20 = undefined;

					try {
						for (var _iterator20 = this.unsignedAttrs.attributes.entries()[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
							var _step20$value = _slicedToArray(_step20.value, 2);

							var index = _step20$value[0];
							var _attribute2 = _step20$value[1];

							var _formatCheckingResult = _attribute2.formatChecking();
							if (_formatCheckingResult.indication !== PASSED) {
								return {
									indication: FAILED,
									message: "Unsigned attribute with index " + index + " did not pass format checking"
								};
							}
						}
					} catch (err) {
						_didIteratorError20 = true;
						_iteratorError20 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion20 && _iterator20.return) {
								_iterator20.return();
							}
						} finally {
							if (_didIteratorError20) {
								throw _iteratorError20;
							}
						}
					}
				}
				//endregion

				//region Check all algoruthms
				var algorithms = [this.digestAlgorithm.algorithmId, this.signatureAlgorithm.algorithmId];

				var algorithmsCheckResult = checkOids(algorithms);
				if (algorithmsCheckResult.indication !== PASSED) {
					return {
						indication: FAILED,
						message: "Incorrect OID for SignerInfo algorithm: " + algorithms[algorithmsCheckResult.message]
					};
				}
				//endregion

				return {
					indication: PASSED
				};
			}
			//**********************************************************************************
			//endregion
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "sid":
						return new Any();
					case "digestAlgorithm":
						return new AlgorithmIdentifier();
					case "signedAttrs":
						return new SignedAndUnsignedAttributes({ type: 0 });
					case "signatureAlgorithm":
						return new AlgorithmIdentifier();
					case "signature":
						return new OctetString();
					case "unsignedAttrs":
						return new SignedAndUnsignedAttributes({ type: 1 });
					default:
						throw new Error("Invalid member name for SignerInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return SignerInfo.defaultValues("version") === memberValue;
					case "sid":
						return memberValue instanceof Any;
					case "digestAlgorithm":
						if (memberValue instanceof AlgorithmIdentifier === false) return false;

						return memberValue.isEqual(SignerInfo.defaultValues("digestAlgorithm"));
					case "signedAttrs":
						return SignedAndUnsignedAttributes.compareWithDefault("type", memberValue.type) && SignedAndUnsignedAttributes.compareWithDefault("attributes", memberValue.attributes) && SignedAndUnsignedAttributes.compareWithDefault("encodedValue", memberValue.encodedValue);
					case "signatureAlgorithm":
						if (memberValue instanceof AlgorithmIdentifier === false) return false;

						return memberValue.isEqual(SignerInfo.defaultValues("signatureAlgorithm"));
					case "signature":
					case "unsignedAttrs":
						return SignedAndUnsignedAttributes.compareWithDefault("type", memberValue.type) && SignedAndUnsignedAttributes.compareWithDefault("attributes", memberValue.attributes) && SignedAndUnsignedAttributes.compareWithDefault("encodedValue", memberValue.encodedValue);
					default:
						throw new Error("Invalid member name for SignerInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//SignerInfo ::= SEQUENCE {
				//    version CMSVersion,
				//    sid SignerIdentifier,
				//    digestAlgorithm DigestAlgorithmIdentifier,
				//    signedAttrs [0] IMPLICIT SignedAttributes OPTIONAL,
				//    signatureAlgorithm SignatureAlgorithmIdentifier,
				//    signature SignatureValue,
				//    unsignedAttrs [1] IMPLICIT UnsignedAttributes OPTIONAL }
				//
				//SignerIdentifier ::= CHOICE {
				//    issuerAndSerialNumber IssuerAndSerialNumber,
				//    subjectKeyIdentifier [0] SubjectKeyIdentifier }
				//
				//SubjectKeyIdentifier ::= OCTET STRING

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [sid]
     * @property {string} [digestAlgorithm]
     * @property {string} [signedAttrs]
     * @property {string} [signatureAlgorithm]
     * @property {string} [signature]
     * @property {string} [unsignedAttrs]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: "SignerInfo",
					value: [new Integer({ name: names.version || "SignerInfo.version" }), new Choice({
						value: [IssuerAndSerialNumber.schema(names.sid || {
							names: {
								blockName: "SignerInfo.sid"
							}
						}), new Constructed({
							optional: true,
							name: names.sid || "SignerInfo.sid",
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [new OctetString()]
						})]
					}), AlgorithmIdentifier.schema(names.digestAlgorithm || {
						names: {
							blockName: "SignerInfo.digestAlgorithm"
						}
					}), SignedAndUnsignedAttributes.schema(names.signedAttrs || {
						names: {
							blockName: "SignerInfo.signedAttrs",
							tagNumber: 0
						}
					}), AlgorithmIdentifier.schema(names.signatureAlgorithm || {
						names: {
							blockName: "SignerInfo.signatureAlgorithm"
						}
					}), new OctetString({ name: names.signature || "SignerInfo.signature" }), SignedAndUnsignedAttributes.schema(names.unsignedAttrs || {
						names: {
							blockName: "SignerInfo.unsignedAttrs",
							tagNumber: 1
						}
					})]
				});
			}
		}]);

		return SignerInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var CertificateSet = function () {
		//**********************************************************************************
		/**
   * Constructor for CertificateSet class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CertificateSet() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CertificateSet);

			//region Internal properties of the object
			/**
    * @type {Array}
    * @description certificates
    */
			this.certificates = getParametersValue(parameters, "certificates", CertificateSet.defaultValues("certificates"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CertificateSet, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CertificateSet.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CMS_CERTIFICATE_SET");
				//endregion

				//region Get internal properties from parsed schema
				this.certificates = Array.from(asn1.result.certificates, function (element) {
					if (element.idBlock.tagClass === 1) return new Certificate({ schema: element });

					return element;
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Set({
					value: Array.from(this.certificates, function (element) {
						if (element instanceof Certificate) return element.toSchema();

						return element;
					})
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					certificates: Array.from(this.certificates, function (element) {
						return element.toJSON();
					})
				};
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "certificates":
						return [];
					default:
						throw new Error("Invalid member name for Attribute class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//CertificateSet ::= SET OF CertificateChoices
				//
				//CertificateChoices ::= CHOICE {
				//    certificate Certificate,
				//    extendedCertificate [0] IMPLICIT ExtendedCertificate,  -- Obsolete
				//    v1AttrCert [1] IMPLICIT AttributeCertificateV1,        -- Obsolete
				//    v2AttrCert [2] IMPLICIT AttributeCertificateV2,
				//    other [3] IMPLICIT OtherCertificateFormat }

				/**
     * @type {Object}
     * @property {string} [blockName]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Set({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.certificates || "",
						value: new Choice({
							value: [Certificate.schema(), new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: [new Any()]
							}), // JUST A STUB
							new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 2 // [2]
								},
								value: [new Any()]
							}), // JUST A STUB
							new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 3 // [3]
								},
								value: [new ObjectIdentifier(), new Any()]
							})]
						})
					})]
				}); // TODO: add definition for "AttributeCertificateV2"
			}
		}]);

		return CertificateSet;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var RevocationInfoChoices = function () {
		//**********************************************************************************
		/**
   * Constructor for RevocationInfoChoices class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RevocationInfoChoices() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RevocationInfoChoices);

			//region Internal properties of the object
			/**
    * @type {Array.<CertificateRevocationList>}
    * @description crls
    */
			this.crls = getParametersValue(parameters, "crls", RevocationInfoChoices.defaultValues("crls"));
			/**
    * @type {Array.<OtherRevocationInfoFormat>}
    * @description otherRevocationInfos
    */
			this.otherRevocationInfos = getParametersValue(parameters, "otherRevocationInfos", RevocationInfoChoices.defaultValues("otherRevocationInfos"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RevocationInfoChoices, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RevocationInfoChoices.schema({
					names: {
						crls: "crls"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CSM_REVOCATION_INFO_CHOICES");
				//endregion

				//region Get internal properties from parsed schema
				var _iteratorNormalCompletion21 = true;
				var _didIteratorError21 = false;
				var _iteratorError21 = undefined;

				try {
					for (var _iterator21 = asn1.result.crls[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
						var element = _step21.value;

						if (element.idBlock.tagClass === 1) this.crls.push(new CertificateRevocationList({ schema: element }));else this.otherRevocationInfos.push(new OtherRevocationInfoFormat({ schema: element }));
					}

					//endregion
				} catch (err) {
					_didIteratorError21 = true;
					_iteratorError21 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion21 && _iterator21.return) {
							_iterator21.return();
						}
					} finally {
						if (_didIteratorError21) {
							throw _iteratorError21;
						}
					}
				}
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output set
				var outputArray = [];

				outputArray.push.apply(outputArray, _toConsumableArray(Array.from(this.crls, function (element) {
					return element.toSchema();
				})));

				outputArray.push.apply(outputArray, _toConsumableArray(Array.from(this.otherRevocationInfos, function (element) {
					var schema = element.toSchema();

					schema.idBlock.tagClass = 3;
					schema.idBlock.tagNumber = 1;

					return schema;
				})));
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Set({
					value: outputArray
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					crls: Array.from(this.crls, function (element) {
						return element.toJSON();
					}),
					otherRevocationInfos: Array.from(this.otherRevocationInfos, function (element) {
						return element.toJSON();
					})
				};
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "crls":
						return [];
					case "otherRevocationInfos":
						return [];
					default:
						throw new Error("Invalid member name for RevocationInfoChoices class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RevocationInfoChoices ::= SET OF RevocationInfoChoice

				//RevocationInfoChoice ::= CHOICE {
				//    crl CertificateList,
				//    other [1] IMPLICIT OtherRevocationInfoFormat }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [crls]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Set({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.crls || "",
						value: new Choice({
							value: [CertificateRevocationList.schema(), new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: [new ObjectIdentifier(), new Any()]
							})]
						})
					})]
				});
			}
		}]);

		return RevocationInfoChoices;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3161
  */


	var MessageImprint = function () {
		//**********************************************************************************
		/**
   * Constructor for MessageImprint class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function MessageImprint() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, MessageImprint);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description hashAlgorithm
    */
			this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", MessageImprint.defaultValues("hashAlgorithm"));
			/**
    * @type {OctetString}
    * @description hashedMessage
    */
			this.hashedMessage = getParametersValue(parameters, "hashedMessage", MessageImprint.defaultValues("hashedMessage"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(MessageImprint, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, MessageImprint.schema({
					names: {
						hashAlgorithm: {
							names: {
								blockName: "hashAlgorithm"
							}
						},
						hashedMessage: "hashedMessage"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for MessageImprint");
				//endregion

				//region Get internal properties from parsed schema
				this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });
				this.hashedMessage = asn1.result.hashedMessage;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.hashAlgorithm.toSchema(), this.hashedMessage]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					hashAlgorithm: this.hashAlgorithm.toJSON(),
					hashedMessage: this.hashedMessage.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "hashAlgorithm":
						return new AlgorithmIdentifier();
					case "hashedMessage":
						return new OctetString();
					default:
						throw new Error("Invalid member name for MessageImprint class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "hashAlgorithm":
						return memberValue.algorithmId === "" && "algorithmParams" in memberValue === false;
					case "hashedMessage":
						return memberValue.isEqual(MessageImprint.defaultValues(memberName)) === 0;
					default:
						throw new Error("Invalid member name for MessageImprint class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//MessageImprint ::= SEQUENCE  {
				//    hashAlgorithm                AlgorithmIdentifier,
				//    hashedMessage                OCTET STRING  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [hashAlgorithm]
     * @property {string} [hashedMessage]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [AlgorithmIdentifier.schema(names.hashAlgorithm || {}), new OctetString({ name: names.hashedMessage || "" })]
				});
			}
		}]);

		return MessageImprint;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3161
  */


	var Accuracy = function () {
		//**********************************************************************************
		/**
   * Constructor for Accuracy class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Accuracy() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Accuracy);

			//region Internal properties of the object
			if ("seconds" in parameters)
				/**
     * @type {number}
     * @description seconds
     */
				this.seconds = getParametersValue(parameters, "seconds", Accuracy.defaultValues("seconds"));

			if ("millis" in parameters)
				/**
     * @type {number}
     * @description millis
     */
				this.millis = getParametersValue(parameters, "millis", Accuracy.defaultValues("millis"));

			if ("micros" in parameters)
				/**
     * @type {number}
     * @description micros
     */
				this.micros = getParametersValue(parameters, "micros", Accuracy.defaultValues("micros"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Accuracy, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Accuracy.schema({
					names: {
						seconds: "seconds",
						millis: "millis",
						micros: "micros"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for tsp.Accuracy");
				//endregion

				//region Get internal properties from parsed schema
				if ("seconds" in asn1.result) this.seconds = asn1.result.seconds.valueBlock.valueDec;

				if ("millis" in asn1.result) {
					var intMillis = new Integer({ valueHex: asn1.result.millis.valueBlock.valueHex });
					this.millis = intMillis.valueBlock.valueDec;
				}

				if ("micros" in asn1.result) {
					var intMicros = new Integer({ valueHex: asn1.result.micros.valueBlock.valueHex });
					this.micros = intMicros.valueBlock.valueDec;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array of output sequence
				var outputArray = [];

				if ("seconds" in this) outputArray.push(new Integer({ value: this.seconds }));

				if ("millis" in this) {
					var intMillis = new Integer({ value: this.millis });

					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						valueHex: intMillis.valueBlock.valueHex
					}));
				}

				if ("micros" in this) {
					var intMicros = new Integer({ value: this.micros });

					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: intMicros.valueBlock.valueHex
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {};

				if ("seconds" in this) _object.seconds = this.seconds;

				if ("millis" in this) _object.millis = this.millis;

				if ("micros" in this) _object.micros = this.micros;

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "seconds":
					case "millis":
					case "micros":
						return 0;
					default:
						throw new Error("Invalid member name for Accuracy class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "seconds":
					case "millis":
					case "micros":
						return memberValue === Accuracy.defaultValues(memberName);
					default:
						throw new Error("Invalid member name for Accuracy class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//Accuracy ::= SEQUENCE {
				//    seconds        INTEGER              OPTIONAL,
				//    millis     [0] INTEGER  (1..999)    OPTIONAL,
				//    micros     [1] INTEGER  (1..999)    OPTIONAL  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [seconds]
     * @property {string} [millis]
     * @property {string} [micros]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					optional: true,
					value: [new Integer({
						optional: true,
						name: names.seconds || ""
					}), new Primitive({
						name: names.millis || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						}
					}), new Primitive({
						name: names.micros || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					})]
				});
			}
		}]);

		return Accuracy;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3161
  */


	var TSTInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for TSTInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function TSTInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, TSTInfo);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", TSTInfo.defaultValues("version"));
			/**
    * @type {string}
    * @description policy
    */
			this.policy = getParametersValue(parameters, "policy", TSTInfo.defaultValues("policy"));
			/**
    * @type {MessageImprint}
    * @description messageImprint
    */
			this.messageImprint = getParametersValue(parameters, "messageImprint", TSTInfo.defaultValues("messageImprint"));
			/**
    * @type {Integer}
    * @description serialNumber
    */
			this.serialNumber = getParametersValue(parameters, "serialNumber", TSTInfo.defaultValues("serialNumber"));
			/**
    * @type {Date}
    * @description genTime
    */
			this.genTime = getParametersValue(parameters, "genTime", TSTInfo.defaultValues("genTime"));

			if ("accuracy" in parameters)
				/**
     * @type {Accuracy}
     * @description accuracy
     */
				this.accuracy = getParametersValue(parameters, "accuracy", TSTInfo.defaultValues("accuracy"));

			if ("ordering" in parameters)
				/**
     * @type {boolean}
     * @description ordering
     */
				this.ordering = getParametersValue(parameters, "ordering", TSTInfo.defaultValues("ordering"));

			if ("nonce" in parameters)
				/**
     * @type {Integer}
     * @description nonce
     */
				this.nonce = getParametersValue(parameters, "nonce", TSTInfo.defaultValues("nonce"));

			if ("tsa" in parameters)
				/**
     * @type {GeneralName}
     * @description tsa
     */
				this.tsa = getParametersValue(parameters, "tsa", TSTInfo.defaultValues("tsa"));

			if ("extensions" in parameters)
				/**
     * @type {Array.<Extension>}
     * @description extensions
     */
				this.extensions = getParametersValue(parameters, "extensions", TSTInfo.defaultValues("extensions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(TSTInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, TSTInfo.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for TST_INFO");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result["TSTInfo.version"].valueBlock.valueDec;
				this.policy = asn1.result["TSTInfo.policy"].valueBlock.toString();
				this.messageImprint = new MessageImprint({ schema: asn1.result["TSTInfo.messageImprint"] });
				this.serialNumber = asn1.result["TSTInfo.serialNumber"];
				this.genTime = asn1.result["TSTInfo.genTime"].toDate();
				if ("TSTInfo.accuracy" in asn1.result) this.accuracy = new Accuracy({ schema: asn1.result["TSTInfo.accuracy"] });
				if ("TSTInfo.ordering" in asn1.result) this.ordering = asn1.result["TSTInfo.ordering"].valueBlock.value;
				if ("TSTInfo.nonce" in asn1.result) this.nonce = asn1.result["TSTInfo.nonce"];
				if ("TSTInfo.tsa" in asn1.result) this.tsa = new GeneralName({ schema: asn1.result["TSTInfo.tsa"] });
				if ("TSTInfo.extensions" in asn1.result) this.extensions = Array.from(asn1.result["TSTInfo.extensions"], function (element) {
					return new Extension({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));
				outputArray.push(new ObjectIdentifier({ value: this.policy }));
				outputArray.push(this.messageImprint.toSchema());
				outputArray.push(this.serialNumber);
				outputArray.push(new GeneralizedTime({ valueDate: this.genTime }));
				if ("accuracy" in this) outputArray.push(this.accuracy.toSchema());
				if ("ordering" in this) outputArray.push(new Boolean({ value: this.ordering }));
				if ("nonce" in this) outputArray.push(this.nonce);
				if ("tsa" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.tsa.toSchema()]
					}));
				}

				//region Create array of extensions
				if ("extensions" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: Array.from(this.extensions, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					version: this.version,
					policy: this.policy,
					messageImprint: this.messageImprint.toJSON(),
					serialNumber: this.serialNumber.toJSON(),
					genTime: this.genTime
				};

				if ("accuracy" in this) _object.accuracy = this.accuracy.toJSON();

				if ("ordering" in this) _object.ordering = this.ordering;

				if ("nonce" in this) _object.nonce = this.nonce.toJSON();

				if ("tsa" in this) _object.tsa = this.tsa.toJSON();

				if ("extensions" in this) _object.extensions = Array.from(this.extensions, function (element) {
					return element.toJSON();
				});

				return _object;
			}
			//**********************************************************************************
			/**
    * Verify current TST Info value
    * @param {{data: ArrayBuffer, [notBefore]: Date, [notAfter]: Date}} parameters Input parameters
    * @returns {Promise}
    */

		}, {
			key: "verify",
			value: function verify() {
				var _this59 = this;

				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//region Initial variables
				var sequence = Promise.resolve();

				var data = void 0;

				var notBefore = null;
				var notAfter = null;
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Get initial parameters
				if ("data" in parameters) data = parameters.data;else return Promise.reject("\"data\" is a mandatory attribute for TST_INFO verification");

				if ("notBefore" in parameters) notBefore = parameters.notBefore;

				if ("notAfter" in parameters) notAfter = parameters.notAfter;
				//endregion

				//region Check date
				if (notBefore !== null) {
					if (this.genTime < notBefore) return Promise.resolve(false);
				}

				if (notAfter !== null) {
					if (this.genTime > notAfter) return Promise.resolve(false);
				}
				//endregion

				//region Find hashing algorithm
				var shaAlgorithm = getAlgorithmByOID(this.messageImprint.hashAlgorithm.algorithmId);
				if ("name" in shaAlgorithm === false) return Promise.reject("Unsupported signature algorithm: " + this.messageImprint.hashAlgorithm.algorithmId);
				//endregion

				//region Calculate message digest for input "data" buffer
				sequence = sequence.then(function () {
					return crypto.digest(shaAlgorithm.name, new Uint8Array(data));
				}).then(function (result) {
					return isEqualBuffer(result, _this59.messageImprint.hashedMessage.valueBlock.valueHex);
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "policy":
						return "";
					case "messageImprint":
						return new MessageImprint();
					case "serialNumber":
						return new Integer();
					case "genTime":
						return new Date(0, 0, 0);
					case "accuracy":
						return new Accuracy();
					case "ordering":
						return false;
					case "nonce":
						return new Integer();
					case "tsa":
						return new GeneralName();
					case "extensions":
						return [];
					default:
						throw new Error("Invalid member name for TSTInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
					case "policy":
					case "genTime":
					case "ordering":
						return memberValue === TSTInfo.defaultValues(memberName);
					case "messageImprint":
						return MessageImprint.compareWithDefault("hashAlgorithm", memberValue.hashAlgorithm) && MessageImprint.compareWithDefault("hashedMessage", memberValue.hashedMessage);
					case "serialNumber":
					case "nonce":
						return memberValue.isEqual(TSTInfo.defaultValues(memberName));
					case "accuracy":
						return Accuracy.compareWithDefault("seconds", memberValue.seconds) && Accuracy.compareWithDefault("millis", memberValue.millis) && Accuracy.compareWithDefault("micros", memberValue.micros);
					case "tsa":
						return GeneralName.compareWithDefault("type", memberValue.type) && GeneralName.compareWithDefault("value", memberValue.value);
					case "extensions":
						return memberValue.length === 0;
					default:
						throw new Error("Invalid member name for TSTInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//TSTInfo ::= SEQUENCE  {
				//   version                      INTEGER  { v1(1) },
				//   policy                       TSAPolicyId,
				//   messageImprint               MessageImprint,
				//   serialNumber                 INTEGER,
				//   genTime                      GeneralizedTime,
				//   accuracy                     Accuracy                 OPTIONAL,
				//   ordering                     BOOLEAN             DEFAULT FALSE,
				//   nonce                        INTEGER                  OPTIONAL,
				//   tsa                          [0] GeneralName          OPTIONAL,
				//   extensions                   [1] IMPLICIT Extensions  OPTIONAL  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [policy]
     * @property {string} [messageImprint]
     * @property {string} [serialNumber]
     * @property {string} [genTime]
     * @property {string} [accuracy]
     * @property {string} [ordering]
     * @property {string} [nonce]
     * @property {string} [tsa]
     * @property {string} [extensions]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "TSTInfo",
					value: [new Integer({ name: names.version || "TSTInfo.version" }), new ObjectIdentifier({ name: names.policy || "TSTInfo.policy" }), MessageImprint.schema(names.messageImprint || {
						names: {
							blockName: "TSTInfo.messageImprint"
						}
					}), new Integer({ name: names.serialNumber || "TSTInfo.serialNumber" }), new GeneralizedTime({ name: names.genTime || "TSTInfo.genTime" }), Accuracy.schema(names.accuracy || {
						names: {
							blockName: "TSTInfo.accuracy"
						}
					}), new Boolean({
						name: names.ordering || "TSTInfo.ordering",
						optional: true
					}), new Integer({
						name: names.nonce || "TSTInfo.nonce",
						optional: true
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [GeneralName.schema(names.tsa || {
							names: {
								blockName: "TSTInfo.tsa"
							}
						})]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Repeated({
							name: names.extensions || "TSTInfo.extensions",
							value: Extension.schema(names.extension || {})
						})]
					}) // IMPLICIT Extensions
					]
				});
			}
		}]);

		return TSTInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************


	var CertificateChainValidationEngine = function () {
		//**********************************************************************************
		/**
   * Constructor for CertificateChainValidationEngine class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CertificateChainValidationEngine() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CertificateChainValidationEngine);

			//region Internal properties of the object
			/**
    * @type {Array.<Certificate>}
    * @description Array of pre-defined trusted (by user) certificates
    */
			this.trustedCerts = getParametersValue(parameters, "trustedCerts", CertificateChainValidationEngine.defaultValues("trustedCerts"));
			/**
    * @type {Array.<Certificate>}
    * @description Array with certificate chain. Could be only one end-user certificate in there!
    */
			this.certs = getParametersValue(parameters, "certs", CertificateChainValidationEngine.defaultValues("certs"));
			/**
    * @type {Array.<CertificateRevocationList>}
    * @description Array of all CRLs for all certificates from certificate chain
    */
			this.crls = getParametersValue(parameters, "crls", CertificateChainValidationEngine.defaultValues("crls"));
			/**
    * @type {Array}
    * @description Array of all OCSP responses
    */
			this.ocsps = getParametersValue(parameters, "ocsps", CertificateChainValidationEngine.defaultValues("ocsps"));
			/**
    * @type {Date}
    * @description The date at which the check would be
    */
			this.checkDate = getParametersValue(parameters, "checkDate", CertificateChainValidationEngine.defaultValues("checkDate"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CertificateChainValidationEngine, [{
			key: "sort",

			//**********************************************************************************
			value: function sort() {
				var _marked = [findIssuer, buildPath, findCRL, findOCSP, checkForCA, basicCheck].map(regeneratorRuntime.mark);

				//region Initial variables
				var localCerts = [];
				var _this = this;
				//endregion

				//region Finding certificate issuer
				function findIssuer(certificate, index) {
					var result, verificationResult, i, _verificationResult;

					return regeneratorRuntime.wrap(function findIssuer$(_context) {
						while (1) {
							switch (_context.prev = _context.next) {
								case 0:
									result = [];

									//region Speed-up searching in case of self-signed certificates

									if (!certificate.subject.isEqual(certificate.issuer)) {
										_context.next = 12;
										break;
									}

									_context.prev = 2;
									_context.next = 5;
									return certificate.verify();

								case 5:
									verificationResult = _context.sent;

									if (!(verificationResult === true)) {
										_context.next = 8;
										break;
									}

									return _context.abrupt("return", [index]);

								case 8:
									_context.next = 12;
									break;

								case 10:
									_context.prev = 10;
									_context.t0 = _context["catch"](2);

								case 12:
									i = 0;

								case 13:
									if (!(i < localCerts.length)) {
										_context.next = 26;
										break;
									}

									_context.prev = 14;
									_context.next = 17;
									return certificate.verify(localCerts[i]);

								case 17:
									_verificationResult = _context.sent;

									if (_verificationResult === true) result.push(i);
									_context.next = 23;
									break;

								case 21:
									_context.prev = 21;
									_context.t1 = _context["catch"](14);

								case 23:
									i++;
									_context.next = 13;
									break;

								case 26:
									return _context.abrupt("return", result.length ? result : [-1]);

								case 27:
								case "end":
									return _context.stop();
							}
						}
					}, _marked[0], this, [[2, 10], [14, 21]]);
				}

				//endregion

				//region Building certificate path
				function buildPath(certificate, index) {
					var result, checkUnique, findIssuerResult, buildPathResult, i, copy, _i11, _buildPathResult, j, _copy;

					return regeneratorRuntime.wrap(function buildPath$(_context2) {
						while (1) {
							switch (_context2.prev = _context2.next) {
								case 0:
									checkUnique = function checkUnique(array) {
										var unique = true;

										for (var i = 0; i < array.length; i++) {
											for (var j = 0; j < array.length; j++) {
												if (j === i) continue;

												if (array[i] === array[j]) {
													unique = false;
													break;
												}
											}

											if (!unique) break;
										}

										return unique;
									};

									result = [];

									//region Aux function checking array for unique elements

									_context2.next = 4;
									return findIssuer(certificate, index);

								case 4:
									findIssuerResult = _context2.sent;

									if (!(findIssuerResult.length === 1 && findIssuerResult[0] === -1)) {
										_context2.next = 7;
										break;
									}

									throw new Error("Incorrect result");

								case 7:
									if (!(findIssuerResult.length === 1)) {
										_context2.next = 17;
										break;
									}

									if (!(findIssuerResult[0] === index)) {
										_context2.next = 11;
										break;
									}

									result.push(findIssuerResult);
									return _context2.abrupt("return", result);

								case 11:
									_context2.next = 13;
									return buildPath(localCerts[findIssuerResult[0]], findIssuerResult[0]);

								case 13:
									buildPathResult = _context2.sent;


									for (i = 0; i < buildPathResult.length; i++) {
										copy = buildPathResult[i].slice();

										copy.splice(0, 0, findIssuerResult[0]);

										if (checkUnique(copy)) result.push(copy);else result.push(buildPathResult[i]);
									}
									_context2.next = 29;
									break;

								case 17:
									_i11 = 0;

								case 18:
									if (!(_i11 < findIssuerResult.length)) {
										_context2.next = 29;
										break;
									}

									if (!(findIssuerResult[_i11] === index)) {
										_context2.next = 22;
										break;
									}

									result.push([findIssuerResult[_i11]]);
									return _context2.abrupt("continue", 26);

								case 22:
									_context2.next = 24;
									return buildPath(localCerts[findIssuerResult[_i11]], findIssuerResult[_i11]);

								case 24:
									_buildPathResult = _context2.sent;


									for (j = 0; j < _buildPathResult.length; j++) {
										_copy = _buildPathResult[j].slice();

										_copy.splice(0, 0, findIssuerResult[_i11]);

										if (checkUnique(_copy)) result.push(_copy);else result.push(_buildPathResult[j]);
									}

								case 26:
									_i11++;
									_context2.next = 18;
									break;

								case 29:
									return _context2.abrupt("return", result);

								case 30:
								case "end":
									return _context2.stop();
							}
						}
					}, _marked[1], this);
				}
				//endregion

				//region Find CRL for specific certificate
				function findCRL(certificate) {
					var issuerCertificates, crls, crlsAndCertificates, i, j, result;
					return regeneratorRuntime.wrap(function findCRL$(_context3) {
						while (1) {
							switch (_context3.prev = _context3.next) {
								case 0:
									//region Initial variables
									issuerCertificates = [];
									crls = [];
									crlsAndCertificates = [];
									//endregion

									//region Find all possible CRL issuers

									issuerCertificates.push.apply(issuerCertificates, _toConsumableArray(localCerts.filter(function (element) {
										return certificate.issuer.isEqual(element.subject);
									})));

									if (!(issuerCertificates.length === 0)) {
										_context3.next = 6;
										break;
									}

									return _context3.abrupt("return", {
										status: 1,
										statusMessage: "No certificate's issuers"
									});

								case 6:
									//endregion

									//region Find all CRLs for crtificate's issuer
									crls.push.apply(crls, _toConsumableArray(_this.crls.filter(function (element) {
										return element.issuer.isEqual(certificate.issuer);
									})));

									if (!(crls.length === 0)) {
										_context3.next = 9;
										break;
									}

									return _context3.abrupt("return", {
										status: 1,
										statusMessage: "No CRLs for specific certificate issuer"
									});

								case 9:
									i = 0;

								case 10:
									if (!(i < crls.length)) {
										_context3.next = 32;
										break;
									}

									if (!(crls[i].nextUpdate.value < _this.checkDate)) {
										_context3.next = 13;
										break;
									}

									return _context3.abrupt("continue", 29);

								case 13:
									j = 0;

								case 14:
									if (!(j < issuerCertificates.length)) {
										_context3.next = 29;
										break;
									}

									_context3.prev = 15;
									_context3.next = 18;
									return crls[i].verify({ issuerCertificate: issuerCertificates[j] });

								case 18:
									result = _context3.sent;

									if (!result) {
										_context3.next = 22;
										break;
									}

									crlsAndCertificates.push({
										crl: crls[i],
										certificate: issuerCertificates[j]
									});

									return _context3.abrupt("break", 29);

								case 22:
									_context3.next = 26;
									break;

								case 24:
									_context3.prev = 24;
									_context3.t0 = _context3["catch"](15);

								case 26:
									j++;
									_context3.next = 14;
									break;

								case 29:
									i++;
									_context3.next = 10;
									break;

								case 32:
									if (!crlsAndCertificates.length) {
										_context3.next = 34;
										break;
									}

									return _context3.abrupt("return", {
										status: 0,
										statusMessage: "",
										result: crlsAndCertificates
									});

								case 34:
									return _context3.abrupt("return", {
										status: 1,
										statusMessage: "No valid CRLs found"
									});

								case 35:
								case "end":
									return _context3.stop();
							}
						}
					}, _marked[2], this, [[15, 24]]);
				}
				//endregion

				//region Find OCSP for specific certificate
				function findOCSP(certificate, issuerCertificate) {
					var hashAlgorithm, i, result;
					return regeneratorRuntime.wrap(function findOCSP$(_context4) {
						while (1) {
							switch (_context4.prev = _context4.next) {
								case 0:
									//region Get hash algorithm from certificate
									hashAlgorithm = getAlgorithmByOID(certificate.signatureAlgorithm.algorithmId);

									if (!("name" in hashAlgorithm === false)) {
										_context4.next = 3;
										break;
									}

									return _context4.abrupt("return", 1);

								case 3:
									if (!("hash" in hashAlgorithm === false)) {
										_context4.next = 5;
										break;
									}

									return _context4.abrupt("return", 1);

								case 5:
									i = 0;

								case 6:
									if (!(i < _this.ocsps.length)) {
										_context4.next = 17;
										break;
									}

									_context4.next = 9;
									return _this.ocsps[i].getCertificateStatus(certificate, issuerCertificate);

								case 9:
									result = _context4.sent;

									if (!result.isForCertificate) {
										_context4.next = 14;
										break;
									}

									if (!(result.status === 0)) {
										_context4.next = 13;
										break;
									}

									return _context4.abrupt("return", 0);

								case 13:
									return _context4.abrupt("return", 1);

								case 14:
									i++;
									_context4.next = 6;
									break;

								case 17:
									return _context4.abrupt("return", 2);

								case 18:
								case "end":
									return _context4.stop();
							}
						}
					}, _marked[3], this);
				}
				//endregion

				//region Check for certificate to be CA
				function checkForCA(certificate) {
					var needToCheckCRL = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
					var isCA, mustBeCA, keyUsagePresent, cRLSign, j, view;
					return regeneratorRuntime.wrap(function checkForCA$(_context5) {
						while (1) {
							switch (_context5.prev = _context5.next) {
								case 0:
									//region Initial variables
									isCA = false;
									mustBeCA = false;
									keyUsagePresent = false;
									cRLSign = false;
									//endregion

									if (!("extensions" in certificate)) {
										_context5.next = 20;
										break;
									}

									j = 0;

								case 6:
									if (!(j < certificate.extensions.length)) {
										_context5.next = 14;
										break;
									}

									if (!(certificate.extensions[j].critical === true && "parsedValue" in certificate.extensions[j] === false)) {
										_context5.next = 9;
										break;
									}

									return _context5.abrupt("return", {
										result: false,
										resultCode: 6,
										resultMessage: "Unable to parse critical certificate extension: " + certificate.extensions[j].extnID
									});

								case 9:

									if (certificate.extensions[j].extnID === "2.5.29.15") // KeyUsage
										{
											keyUsagePresent = true;

											view = new Uint8Array(certificate.extensions[j].parsedValue.valueBlock.valueHex);


											if ((view[0] & 0x04) === 0x04) // Set flag "keyCertSign"
												mustBeCA = true;

											if ((view[0] & 0x02) === 0x02) // Set flag "cRLSign"
												cRLSign = true;
										}

									if (certificate.extensions[j].extnID === "2.5.29.19") // BasicConstraints
										{
											if ("cA" in certificate.extensions[j].parsedValue) {
												if (certificate.extensions[j].parsedValue.cA === true) isCA = true;
											}
										}

								case 11:
									j++;
									_context5.next = 6;
									break;

								case 14:
									if (!(mustBeCA === true && isCA === false)) {
										_context5.next = 16;
										break;
									}

									return _context5.abrupt("return", {
										result: false,
										resultCode: 3,
										resultMessage: "Unable to build certificate chain - using \"keyCertSign\" flag set without BasicConstaints"
									});

								case 16:
									if (!(keyUsagePresent === true && isCA === true && mustBeCA === false)) {
										_context5.next = 18;
										break;
									}

									return _context5.abrupt("return", {
										result: false,
										resultCode: 4,
										resultMessage: "Unable to build certificate chain - \"keyCertSign\" flag was not set"
									});

								case 18:
									if (!(isCA === true && keyUsagePresent === true && needToCheckCRL && cRLSign === false)) {
										_context5.next = 20;
										break;
									}

									return _context5.abrupt("return", {
										result: false,
										resultCode: 5,
										resultMessage: "Unable to build certificate chain - intermediate certificate must have \"cRLSign\" key usage flag"
									});

								case 20:
									if (!(isCA === false)) {
										_context5.next = 22;
										break;
									}

									return _context5.abrupt("return", {
										result: false,
										resultCode: 7,
										resultMessage: "Unable to build certificate chain - more than one possible end-user certificate"
									});

								case 22:
									return _context5.abrupt("return", {
										result: true,
										resultCode: 0,
										resultMessage: ""
									});

								case 23:
								case "end":
									return _context5.stop();
							}
						}
					}, _marked[4], this);
				}
				//endregion

				//region Basic check for certificate path
				function basicCheck(path, checkDate) {
					var i, _i12, _i13, ocspResult, crlResult, j, isCertificateRevoked, isCertificateCA, _i14, result;

					return regeneratorRuntime.wrap(function basicCheck$(_context6) {
						while (1) {
							switch (_context6.prev = _context6.next) {
								case 0:
									i = 0;

								case 1:
									if (!(i < path.length)) {
										_context6.next = 7;
										break;
									}

									if (!(path[i].notBefore.value > checkDate || path[i].notAfter.value < checkDate)) {
										_context6.next = 4;
										break;
									}

									return _context6.abrupt("return", {
										result: false,
										resultCode: 8,
										resultMessage: "Certificate validity period is out of checking date"
									});

								case 4:
									i++;
									_context6.next = 1;
									break;

								case 7:
									if (!(path.length < 2)) {
										_context6.next = 9;
										break;
									}

									return _context6.abrupt("return", {
										result: false,
										resultCode: 9,
										resultMessage: "Too short certificate path"
									});

								case 9:
									_i12 = path.length - 2;

								case 10:
									if (!(_i12 >= 0)) {
										_context6.next = 17;
										break;
									}

									if (!(path[_i12].issuer.isEqual(path[_i12].subject) === false)) {
										_context6.next = 14;
										break;
									}

									if (!(path[_i12].issuer.isEqual(path[_i12 + 1].subject) === false)) {
										_context6.next = 14;
										break;
									}

									return _context6.abrupt("return", {
										result: false,
										resultCode: 10,
										resultMessage: "Incorrect name chaining"
									});

								case 14:
									_i12--;
									_context6.next = 10;
									break;

								case 17:
									if (!(_this.crls.length !== 0 || _this.ocsps.length !== 0)) {
										_context6.next = 58;
										break;
									}

									_i13 = 0;

								case 19:
									if (!(_i13 < path.length - 2)) {
										_context6.next = 58;
										break;
									}

									//region Initial variables
									ocspResult = void 0;
									crlResult = void 0;
									//endregion

									//region Check OCSPs first

									if (!(_this.ocsps.length !== 0)) {
										_context6.next = 32;
										break;
									}

									_context6.next = 25;
									return findOCSP(path[_i13], path[_i13 + 1]);

								case 25:
									ocspResult = _context6.sent;
									_context6.t0 = ocspResult;
									_context6.next = _context6.t0 === 0 ? 29 : _context6.t0 === 1 ? 30 : _context6.t0 === 2 ? 31 : 32;
									break;

								case 29:
									return _context6.abrupt("continue", 55);

								case 30:
									return _context6.abrupt("return", {
										result: false,
										resultCode: 12,
										resultMessage: "One of certificates was revoked via OCSP response"
									});

								case 31:
									return _context6.abrupt("break", 32);

								case 32:
									if (!(_this.crls.length !== 0)) {
										_context6.next = 53;
										break;
									}

									_context6.next = 35;
									return findCRL(path[_i13]);

								case 35:
									crlResult = _context6.sent;

									if (!crlResult.status) {
										_context6.next = 38;
										break;
									}

									return _context6.abrupt("return", {
										result: false,
										resultCode: 11,
										resultMessage: "No revocation values found for one of certificates"
									});

								case 38:
									j = 0;

								case 39:
									if (!(j < crlResult.result.length)) {
										_context6.next = 51;
										break;
									}

									//region Check that the CRL issuer certificate have not been revoked
									isCertificateRevoked = crlResult.result[j].crl.isCertificateRevoked(path[_i13]);

									if (!isCertificateRevoked) {
										_context6.next = 43;
										break;
									}

									return _context6.abrupt("return", {
										result: false,
										resultCode: 12,
										resultMessage: "One of certificates had been revoked"
									});

								case 43:
									_context6.next = 45;
									return checkForCA(crlResult.result[j].certificate, true);

								case 45:
									isCertificateCA = _context6.sent;

									if (!(isCertificateCA.result === false)) {
										_context6.next = 48;
										break;
									}

									return _context6.abrupt("return", {
										result: false,
										resultCode: 13,
										resultMessage: "CRL issuer certificate is not a CA certificate or does not have crlSign flag"
									});

								case 48:
									j++;
									_context6.next = 39;
									break;

								case 51:
									_context6.next = 55;
									break;

								case 53:
									if (!(ocspResult === 2)) {
										_context6.next = 55;
										break;
									}

									return _context6.abrupt("return", {
										result: false,
										resultCode: 11,
										resultMessage: "No revocation values found for one of certificates"
									});

								case 55:
									_i13++;
									_context6.next = 19;
									break;

								case 58:
									_i14 = 1;

								case 59:
									if (!(_i14 < path.length)) {
										_context6.next = 68;
										break;
									}

									_context6.next = 62;
									return checkForCA(path[_i14]);

								case 62:
									result = _context6.sent;

									if (!(result.result === false)) {
										_context6.next = 65;
										break;
									}

									return _context6.abrupt("return", {
										result: false,
										resultCode: 14,
										resultMessage: "One of intermediate certificates is not a CA certificate"
									});

								case 65:
									_i14++;
									_context6.next = 59;
									break;

								case 68:
									return _context6.abrupt("return", {
										result: true
									});

								case 69:
								case "end":
									return _context6.stop();
							}
						}
					}, _marked[5], this);
				}
				//endregion

				return generatorsDriver(regeneratorRuntime.mark(function generatorFunction() {
					var i, j, result, certificatePath, _i15, found, _j, certificate, k, shortestLength, shortestIndex, _i16, _i17;

					return regeneratorRuntime.wrap(function generatorFunction$(_context7) {
						while (1) {
							switch (_context7.prev = _context7.next) {
								case 0:
									//region Initialize "localCerts" by value of "_this.certs" + "_this.trustedCerts" arrays
									localCerts.push.apply(localCerts, _toConsumableArray(_this.trustedCerts));
									localCerts.push.apply(localCerts, _toConsumableArray(_this.certs));
									//endregion

									//region Check all certificates for been unique
									i = 0;

								case 3:
									if (!(i < localCerts.length)) {
										_context7.next = 18;
										break;
									}

									j = 0;

								case 5:
									if (!(j < localCerts.length)) {
										_context7.next = 15;
										break;
									}

									if (!(i === j)) {
										_context7.next = 8;
										break;
									}

									return _context7.abrupt("continue", 12);

								case 8:
									if (!isEqualBuffer(localCerts[i].tbs, localCerts[j].tbs)) {
										_context7.next = 12;
										break;
									}

									localCerts.splice(j, 1);
									i = 0;
									return _context7.abrupt("break", 15);

								case 12:
									j++;
									_context7.next = 5;
									break;

								case 15:
									i++;
									_context7.next = 3;
									break;

								case 18:
									//endregion

									//region Initial variables
									result = void 0;
									certificatePath = [localCerts[localCerts.length - 1]]; // The "end entity" certificate must be the least in "certs" array
									//endregion

									//region Build path for "end entity" certificate

									_context7.next = 22;
									return buildPath(localCerts[localCerts.length - 1], localCerts.length - 1);

								case 22:
									result = _context7.sent;

									if (!(result.length === 0)) {
										_context7.next = 25;
										break;
									}

									return _context7.abrupt("return", {
										result: false,
										resultCode: 60,
										resultMessage: "Unable to find certificate path"
									});

								case 25:
									_i15 = 0;

								case 26:
									if (!(_i15 < result.length)) {
										_context7.next = 48;
										break;
									}

									found = false;
									_j = 0;

								case 29:
									if (!(_j < result[_i15].length)) {
										_context7.next = 44;
										break;
									}

									certificate = localCerts[result[_i15][_j]];
									k = 0;

								case 32:
									if (!(k < _this.trustedCerts.length)) {
										_context7.next = 39;
										break;
									}

									if (!isEqualBuffer(certificate.tbs, _this.trustedCerts[k].tbs)) {
										_context7.next = 36;
										break;
									}

									found = true;
									return _context7.abrupt("break", 39);

								case 36:
									k++;
									_context7.next = 32;
									break;

								case 39:
									if (!found) {
										_context7.next = 41;
										break;
									}

									return _context7.abrupt("break", 44);

								case 41:
									_j++;
									_context7.next = 29;
									break;

								case 44:

									if (!found) {
										result.splice(_i15, 1);
										_i15 = 0;
									}

								case 45:
									_i15++;
									_context7.next = 26;
									break;

								case 48:
									if (!(result.length === 0)) {
										_context7.next = 50;
										break;
									}

									throw {
										result: false,
										resultCode: 97,
										resultMessage: "No valid certificate paths found"
									};

								case 50:
									//endregion

									//region Find shortest certificate path (for the moment it is the only criteria)
									shortestLength = result[0].length;
									shortestIndex = 0;


									for (_i16 = 0; _i16 < result.length; _i16++) {
										if (result[_i16].length < shortestLength) {
											shortestLength = result[_i16].length;
											shortestIndex = _i16;
										}
									}
									//endregion

									//region Create certificate path for basic check
									for (_i17 = 0; _i17 < result[shortestIndex].length; _i17++) {
										certificatePath.push(localCerts[result[shortestIndex][_i17]]);
									} //endregion

									//region Perform basic checking for all certificates in the path
									_context7.next = 56;
									return basicCheck(certificatePath, _this.checkDate);

								case 56:
									result = _context7.sent;

									if (!(result.result === false)) {
										_context7.next = 59;
										break;
									}

									throw result;

								case 59:
									return _context7.abrupt("return", certificatePath);

								case 60:
								case "end":
									return _context7.stop();
							}
						}
					}, generatorFunction, this);
				}));
			}
			//**********************************************************************************
			/**
    * Major verification function for certificate chain.
    * @param {{initialPolicySet, initialExplicitPolicy, initialPolicyMappingInhibit, initialInhibitPolicy, initialPermittedSubtreesSet, initialExcludedSubtreesSet, initialRequiredNameForms}} [parameters]
    * @returns {Promise}
    */

		}, {
			key: "verify",
			value: function verify() {
				var _this60 = this;

				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//region Initial checks
				if (this.certs.length === 0) return Promise.reject("Empty certificate array");
				//endregion

				//region Initial variables
				var sequence = Promise.resolve();
				//endregion

				//region Get input variables
				var initialPolicySet = [];
				initialPolicySet.push("2.5.29.32.0"); // "anyPolicy"

				var initialExplicitPolicy = false;
				var initialPolicyMappingInhibit = false;
				var initialInhibitPolicy = false;

				var initialPermittedSubtreesSet = []; // Array of "simpl.x509.GeneralSubtree"
				var initialExcludedSubtreesSet = []; // Array of "simpl.x509.GeneralSubtree"
				var initialRequiredNameForms = []; // Array of "simpl.x509.GeneralSubtree"

				if ("initialPolicySet" in parameters) initialPolicySet = parameters.initialPolicySet;

				if ("initialExplicitPolicy" in parameters) initialExplicitPolicy = parameters.initialExplicitPolicy;

				if ("initialPolicyMappingInhibit" in parameters) initialPolicyMappingInhibit = parameters.initialPolicyMappingInhibit;

				if ("initialInhibitPolicy" in parameters) initialInhibitPolicy = parameters.initialInhibitPolicy;

				if ("initialPermittedSubtreesSet" in parameters) initialPermittedSubtreesSet = parameters.initialPermittedSubtreesSet;

				if ("initialExcludedSubtreesSet" in parameters) initialExcludedSubtreesSet = parameters.initialExcludedSubtreesSet;

				if ("initialRequiredNameForms" in parameters) initialRequiredNameForms = parameters.initialRequiredNameForms;

				var explicitPolicyIndicator = initialExplicitPolicy;
				var policyMappingInhibitIndicator = initialPolicyMappingInhibit;
				var inhibitAnyPolicyIndicator = initialInhibitPolicy;

				var pendingConstraints = new Array(3);
				pendingConstraints[0] = false; // For "explicitPolicyPending"
				pendingConstraints[1] = false; // For "policyMappingInhibitPending"
				pendingConstraints[2] = false; // For "inhibitAnyPolicyPending"

				var explicitPolicyPending = 0;
				var policyMappingInhibitPending = 0;
				var inhibitAnyPolicyPending = 0;

				var permittedSubtrees = initialPermittedSubtreesSet;
				var excludedSubtrees = initialExcludedSubtreesSet;
				var requiredNameForms = initialRequiredNameForms;

				var pathDepth = 1;
				//endregion

				//region Sorting certificates in the chain array
				sequence = this.sort().then(function (sortedCerts) {
					_this60.certs = sortedCerts;
				});
				//endregion

				//region Work with policies
				sequence = sequence.then(function () {
					//region Support variables
					var allPolicies = []; // Array of all policies (string values)
					allPolicies.push("2.5.29.32.0"); // Put "anyPolicy" at first place

					var policiesAndCerts = []; // In fact "array of array" where rows are for each specific policy, column for each certificate and value is "true/false"

					var anyPolicyArray = new Array(_this60.certs.length - 1); // Minus "trusted anchor"
					for (var ii = 0; ii < _this60.certs.length - 1; ii++) {
						anyPolicyArray[ii] = true;
					}policiesAndCerts.push(anyPolicyArray);

					var policyMappings = new Array(_this60.certs.length - 1); // Array of "PolicyMappings" for each certificate
					var certPolicies = new Array(_this60.certs.length - 1); // Array of "CertificatePolicies" for each certificate

					var explicitPolicyStart = explicitPolicyIndicator ? _this60.certs.length - 1 : -1;
					//endregion

					//region Gather all neccessary information from certificate chain
					for (var i = _this60.certs.length - 2; i >= 0; i--, pathDepth++) {
						if ("extensions" in _this60.certs[i]) {
							//region Get information about certificate extensions
							for (var j = 0; j < _this60.certs[i].extensions.length; j++) {
								//region CertificatePolicies
								if (_this60.certs[i].extensions[j].extnID === "2.5.29.32") {
									certPolicies[i] = _this60.certs[i].extensions[j].parsedValue;

									//region Remove entry from "anyPolicies" for the certificate
									for (var s = 0; s < allPolicies.length; s++) {
										if (allPolicies[s] === "2.5.29.32.0") {
											delete policiesAndCerts[s][i];
											break;
										}
									}
									//endregion

									for (var k = 0; k < _this60.certs[i].extensions[j].parsedValue.certificatePolicies.length; k++) {
										var policyIndex = -1;

										//region Try to find extension in "allPolicies" array
										for (var _s = 0; _s < allPolicies.length; _s++) {
											if (_this60.certs[i].extensions[j].parsedValue.certificatePolicies[k].policyIdentifier === allPolicies[_s]) {
												policyIndex = _s;
												break;
											}
										}
										//endregion

										if (policyIndex === -1) {
											allPolicies.push(_this60.certs[i].extensions[j].parsedValue.certificatePolicies[k].policyIdentifier);

											var certArray = new Array(_this60.certs.length - 1);
											certArray[i] = true;

											policiesAndCerts.push(certArray);
										} else policiesAndCerts[policyIndex][i] = true;
									}
								}
								//endregion

								//region PolicyMappings
								if (_this60.certs[i].extensions[j].extnID === "2.5.29.33") {
									if (policyMappingInhibitIndicator) {
										return {
											result: false,
											resultCode: 98,
											resultMessage: "Policy mapping prohibited"
										};
									}

									policyMappings[i] = _this60.certs[i].extensions[j].parsedValue;
								}
								//endregion

								//region PolicyConstraints
								if (_this60.certs[i].extensions[j].extnID === "2.5.29.36") {
									if (explicitPolicyIndicator === false) {
										//region requireExplicitPolicy
										if (_this60.certs[i].extensions[j].parsedValue.requireExplicitPolicy === 0) {
											explicitPolicyIndicator = true;
											explicitPolicyStart = i;
										} else {
											if (pendingConstraints[0] === false) {
												pendingConstraints[0] = true;
												explicitPolicyPending = _this60.certs[i].extensions[j].parsedValue.requireExplicitPolicy;
											} else explicitPolicyPending = explicitPolicyPending > _this60.certs[i].extensions[j].parsedValue.requireExplicitPolicy ? _this60.certs[i].extensions[j].parsedValue.requireExplicitPolicy : explicitPolicyPending;
										}
										//endregion

										//region inhibitPolicyMapping
										if (_this60.certs[i].extensions[j].parsedValue.inhibitPolicyMapping === 0) policyMappingInhibitIndicator = true;else {
											if (pendingConstraints[1] === false) {
												pendingConstraints[1] = true;
												policyMappingInhibitPending = _this60.certs[i].extensions[j].parsedValue.inhibitPolicyMapping + 1;
											} else policyMappingInhibitPending = policyMappingInhibitPending > _this60.certs[i].extensions[j].parsedValue.inhibitPolicyMapping + 1 ? _this60.certs[i].extensions[j].parsedValue.inhibitPolicyMapping + 1 : policyMappingInhibitPending;
										}
										//endregion
									}
								}
								//endregion

								//region InhibitAnyPolicy
								if (_this60.certs[i].extensions[j].extnID === "2.5.29.54") {
									if (inhibitAnyPolicyIndicator === false) {
										if (_this60.certs[i].extensions[j].parsedValue.valueBlock.valueDec === 0) inhibitAnyPolicyIndicator = true;else {
											if (pendingConstraints[2] === false) {
												pendingConstraints[2] = true;
												inhibitAnyPolicyPending = _this60.certs[i].extensions[j].parsedValue.valueBlock.valueDec;
											} else inhibitAnyPolicyPending = inhibitAnyPolicyPending > _this60.certs[i].extensions[j].parsedValue.valueBlock.valueDec ? _this60.certs[i].extensions[j].parsedValue.valueBlock.valueDec : inhibitAnyPolicyPending;
										}
									}
								}
								//endregion
							}
							//endregion

							//region Check "inhibitAnyPolicyIndicator"
							if (inhibitAnyPolicyIndicator === true) {
								var _policyIndex = -1;

								//region Find "anyPolicy" index
								for (var searchAnyPolicy = 0; searchAnyPolicy < allPolicies.length; searchAnyPolicy++) {
									if (allPolicies[searchAnyPolicy] === "2.5.29.32.0") {
										_policyIndex = searchAnyPolicy;
										break;
									}
								}
								//endregion

								if (_policyIndex !== -1) delete policiesAndCerts[0][i]; // Unset value to "undefined" for "anyPolicies" value for current certificate
							}
							//endregion

							//region Process with "pending constraints"
							if (explicitPolicyIndicator === false) {
								if (pendingConstraints[0] === true) {
									explicitPolicyPending--;
									if (explicitPolicyPending === 0) {
										explicitPolicyIndicator = true;
										explicitPolicyStart = i;

										pendingConstraints[0] = false;
									}
								}
							}

							if (policyMappingInhibitIndicator === false) {
								if (pendingConstraints[1] === true) {
									policyMappingInhibitPending--;
									if (policyMappingInhibitPending === 0) {
										policyMappingInhibitIndicator = true;
										pendingConstraints[1] = false;
									}
								}
							}

							if (inhibitAnyPolicyIndicator === false) {
								if (pendingConstraints[2] === true) {
									inhibitAnyPolicyPending--;
									if (inhibitAnyPolicyPending === 0) {
										inhibitAnyPolicyIndicator = true;
										pendingConstraints[2] = false;
									}
								}
							}
							//endregion
						}
					}
					//endregion

					//region Working with policy mappings
					for (var _i18 = 0; _i18 < _this60.certs.length - 1; _i18++) {
						//region Check that there is "policy mapping" for level "i + 1"
						if (_i18 < _this60.certs.length - 2 && typeof policyMappings[_i18 + 1] !== "undefined") {
							for (var _k = 0; _k < policyMappings[_i18 + 1].mappings.length; _k++) {
								//region Check that we do not have "anyPolicy" in current mapping
								if (policyMappings[_i18 + 1].mappings[_k].issuerDomainPolicy === "2.5.29.32.0" || policyMappings[_i18 + 1].mappings[_k].subjectDomainPolicy === "2.5.29.32.0") {
									return {
										result: false,
										resultCode: 99,
										resultMessage: "The \"anyPolicy\" should not be a part of policy mapping scheme"
									};
								}
								//endregion

								//region Initial variables
								var issuerDomainPolicyIndex = -1;
								var subjectDomainPolicyIndex = -1;
								//endregion

								//region Search for index of policies indedes
								for (var n = 0; n < allPolicies.length; n++) {
									if (allPolicies[n] === policyMappings[_i18 + 1].mappings[_k].issuerDomainPolicy) issuerDomainPolicyIndex = n;

									if (allPolicies[n] === policyMappings[_i18 + 1].mappings[_k].subjectDomainPolicy) subjectDomainPolicyIndex = n;
								}
								//endregion

								//region Delete existing "issuerDomainPolicy" because on the level we mapped the policy to another one
								if (typeof policiesAndCerts[issuerDomainPolicyIndex][_i18] !== "undefined") delete policiesAndCerts[issuerDomainPolicyIndex][_i18];
								//endregion

								//region Check all policies for the certificate
								for (var _j2 = 0; _j2 < certPolicies[_i18].certificatePolicies.length; _j2++) {
									if (policyMappings[_i18 + 1].mappings[_k].subjectDomainPolicy === certPolicies[_i18].certificatePolicies[_j2].policyIdentifier) {
										//region Set mapped policy for current certificate
										if (issuerDomainPolicyIndex !== -1 && subjectDomainPolicyIndex !== -1) {
											for (var m = 0; m <= _i18; m++) {
												if (typeof policiesAndCerts[subjectDomainPolicyIndex][m] !== "undefined") {
													policiesAndCerts[issuerDomainPolicyIndex][m] = true;
													delete policiesAndCerts[subjectDomainPolicyIndex][m];
												}
											}
										}
										//endregion
									}
								}
								//endregion
							}
						}
						//endregion
					}
					//endregion

					//region Working with "explicitPolicyIndicator" and "anyPolicy"
					for (var _i19 = 0; _i19 < allPolicies.length; _i19++) {
						if (allPolicies[_i19] === "2.5.29.32.0") {
							for (var _j3 = 0; _j3 < explicitPolicyStart; _j3++) {
								delete policiesAndCerts[_i19][_j3];
							}
						}
					}
					//endregion

					//region Create "set of authorities-constrained policies"
					var authConstrPolicies = [];

					for (var _i20 = 0; _i20 < policiesAndCerts.length; _i20++) {
						var found = true;

						for (var _j4 = 0; _j4 < _this60.certs.length - 1; _j4++) {
							var anyPolicyFound = false;

							if (_j4 < explicitPolicyStart && allPolicies[_i20] === "2.5.29.32.0" && allPolicies.length > 1) {
								found = false;
								break;
							}

							if (typeof policiesAndCerts[_i20][_j4] === "undefined") {
								if (_j4 >= explicitPolicyStart) {
									//region Search for "anyPolicy" in the policy set
									for (var _k2 = 0; _k2 < allPolicies.length; _k2++) {
										if (allPolicies[_k2] === "2.5.29.32.0") {
											if (policiesAndCerts[_k2][_j4] === true) anyPolicyFound = true;

											break;
										}
									}
									//endregion
								}

								if (!anyPolicyFound) {
									found = false;
									break;
								}
							}
						}

						if (found === true) authConstrPolicies.push(allPolicies[_i20]);
					}
					//endregion

					//region Create "set of user-constrained policies"
					var userConstrPolicies = [];

					if (initialPolicySet.length === 1 && initialPolicySet[0] === "2.5.29.32.0" && explicitPolicyIndicator === false) userConstrPolicies = initialPolicySet;else {
						if (authConstrPolicies.length === 1 && authConstrPolicies[0] === "2.5.29.32.0") userConstrPolicies = initialPolicySet;else {
							for (var _i21 = 0; _i21 < authConstrPolicies.length; _i21++) {
								for (var _j5 = 0; _j5 < initialPolicySet.length; _j5++) {
									if (initialPolicySet[_j5] === authConstrPolicies[_i21] || initialPolicySet[_j5] === "2.5.29.32.0") {
										userConstrPolicies.push(authConstrPolicies[_i21]);
										break;
									}
								}
							}
						}
					}
					//endregion

					//region Combine output object
					return {
						result: userConstrPolicies.length > 0,
						resultCode: 0,
						resultMessage: userConstrPolicies.length > 0 ? "" : "Zero \"userConstrPolicies\" array, no intersections with \"authConstrPolicies\"",
						authConstrPolicies: authConstrPolicies,
						userConstrPolicies: userConstrPolicies,
						explicitPolicyIndicator: explicitPolicyIndicator,
						policyMappings: policyMappings
					};
					//endregion
				});
				//endregion

				//region Work with name constraints
				sequence = sequence.then(function (policyResult) {
					//region Auxiliary functions for name constraints checking
					function compareDNSName(name, constraint) {
						/// <summary>Compare two dNSName values</summary>
						/// <param name="name" type="String">DNS from name</param>
						/// <param name="constraint" type="String">Constraint for DNS from name</param>
						/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>

						//region Make a "string preparation" for both name and constrain
						var namePrepared = stringPrep(name);
						var constraintPrepared = stringPrep(constraint);
						//endregion

						//region Make a "splitted" versions of "constraint" and "name"
						var nameSplitted = namePrepared.split(".");
						var constraintSplitted = constraintPrepared.split(".");
						//endregion

						//region Length calculation and additional check
						var nameLen = nameSplitted.length;
						var constrLen = constraintSplitted.length;

						if (nameLen === 0 || constrLen === 0 || nameLen < constrLen) return false;
						//endregion

						//region Check that no part of "name" has zero length
						for (var i = 0; i < nameLen; i++) {
							if (nameSplitted[i].length === 0) return false;
						}
						//endregion

						//region Check that no part of "constraint" has zero length
						for (var _i22 = 0; _i22 < constrLen; _i22++) {
							if (constraintSplitted[_i22].length === 0) {
								if (_i22 === 0) {
									if (constrLen === 1) return false;

									continue;
								}

								return false;
							}
						}
						//endregion

						//region Check that "name" has a tail as "constraint"

						for (var _i23 = 0; _i23 < constrLen; _i23++) {
							if (constraintSplitted[constrLen - 1 - _i23].length === 0) continue;

							if (nameSplitted[nameLen - 1 - _i23].localeCompare(constraintSplitted[constrLen - 1 - _i23]) !== 0) return false;
						}
						//endregion

						return true;
					}

					function compareRFC822Name(name, constraint) {
						/// <summary>Compare two rfc822Name values</summary>
						/// <param name="name" type="String">E-mail address from name</param>
						/// <param name="constraint" type="String">Constraint for e-mail address from name</param>
						/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>

						//region Make a "string preparation" for both name and constrain
						var namePrepared = stringPrep(name);
						var constraintPrepared = stringPrep(constraint);
						//endregion

						//region Make a "splitted" versions of "constraint" and "name"
						var nameSplitted = namePrepared.split("@");
						var constraintSplitted = constraintPrepared.split("@");
						//endregion

						//region Splitted array length checking
						if (nameSplitted.length === 0 || constraintSplitted.length === 0 || nameSplitted.length < constraintSplitted.length) return false;
						//endregion

						if (constraintSplitted.length === 1) {
							var result = compareDNSName(nameSplitted[1], constraintSplitted[0]);

							if (result) {
								//region Make a "splitted" versions of domain name from "constraint" and "name"
								var ns = nameSplitted[1].split(".");
								var cs = constraintSplitted[0].split(".");
								//endregion

								if (cs[0].length === 0) return true;

								return ns.length === cs.length;
							}

							return false;
						}

						return namePrepared.localeCompare(constraintPrepared) === 0;
					}

					function compareUniformResourceIdentifier(name, constraint) {
						/// <summary>Compare two uniformResourceIdentifier values</summary>
						/// <param name="name" type="String">uniformResourceIdentifier from name</param>
						/// <param name="constraint" type="String">Constraint for uniformResourceIdentifier from name</param>
						/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>

						//region Make a "string preparation" for both name and constrain
						var namePrepared = stringPrep(name);
						var constraintPrepared = stringPrep(constraint);
						//endregion

						//region Find out a major URI part to compare with
						var ns = namePrepared.split("/");
						var cs = constraintPrepared.split("/");

						if (cs.length > 1) // Malformed constraint
							return false;

						if (ns.length > 1) // Full URI string
							{
								for (var i = 0; i < ns.length; i++) {
									if (ns[i].length > 0 && ns[i].charAt(ns[i].length - 1) !== ":") {
										var nsPort = ns[i].split(":");
										namePrepared = nsPort[0];
										break;
									}
								}
							}
						//endregion

						var result = compareDNSName(namePrepared, constraintPrepared);

						if (result) {
							//region Make a "splitted" versions of "constraint" and "name"
							var nameSplitted = namePrepared.split(".");
							var constraintSplitted = constraintPrepared.split(".");
							//endregion

							if (constraintSplitted[0].length === 0) return true;

							return nameSplitted.length === constraintSplitted.length;
						}

						return false;
					}

					function compareIPAddress(name, constraint) {
						/// <summary>Compare two iPAddress values</summary>
						/// <param name="name" type="in_window.org.pkijs.asn1.OCTETSTRING">iPAddress from name</param>
						/// <param name="constraint" type="in_window.org.pkijs.asn1.OCTETSTRING">Constraint for iPAddress from name</param>
						/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>

						//region Common variables
						var nameView = new Uint8Array(name.valueBlock.valueHex);
						var constraintView = new Uint8Array(constraint.valueBlock.valueHex);
						//endregion

						//region Work with IPv4 addresses
						if (nameView.length === 4 && constraintView.length === 8) {
							for (var i = 0; i < 4; i++) {
								if ((nameView[i] ^ constraintView[i]) & constraintView[i + 4]) return false;
							}

							return true;
						}
						//endregion

						//region Work with IPv6 addresses
						if (nameView.length === 16 && constraintView.length === 32) {
							for (var _i24 = 0; _i24 < 16; _i24++) {
								if ((nameView[_i24] ^ constraintView[_i24]) & constraintView[_i24 + 16]) return false;
							}

							return true;
						}
						//endregion

						return false;
					}

					function compareDirectoryName(name, constraint) {
						/// <summary>Compare two directoryName values</summary>
						/// <param name="name" type="in_window.org.pkijs.simpl.RDN">directoryName from name</param>
						/// <param name="constraint" type="in_window.org.pkijs.simpl.RDN">Constraint for directoryName from name</param>
						/// <param name="any" type="Boolean">Boolean flag - should be comparision interrupted after first match or we need to match all "constraints" parts</param>
						/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>

						//region Initial check
						if (name.typesAndValues.length === 0 || constraint.typesAndValues.length === 0) return true;

						if (name.typesAndValues.length < constraint.typesAndValues.length) return false;
						//endregion

						//region Initial variables
						var result = true;
						var nameStart = 0;
						//endregion

						for (var i = 0; i < constraint.typesAndValues.length; i++) {
							var localResult = false;

							for (var j = nameStart; j < name.typesAndValues.length; j++) {
								localResult = name.typesAndValues[j].isEqual(constraint.typesAndValues[i]);

								if (name.typesAndValues[j].type === constraint.typesAndValues[i].type) result = result && localResult;

								if (localResult === true) {
									if (nameStart === 0 || nameStart === j) {
										nameStart = j + 1;
										break;
									} else // Structure of "name" must be the same with "constraint"
										return false;
								}
							}

							if (localResult === false) return false;
						}

						return nameStart === 0 ? false : result;
					}

					//endregion

					//region Check a result from "policy checking" part
					if (policyResult.result === false) return policyResult;
					//endregion

					//region Check all certificates, excluding "trust anchor"
					pathDepth = 1;

					for (var i = _this60.certs.length - 2; i >= 0; i--, pathDepth++) {
						//region Support variables
						var subjectAltNames = [];

						var certPermittedSubtrees = [];
						var certExcludedSubtrees = [];
						//endregion

						if ("extensions" in _this60.certs[i]) {
							for (var j = 0; j < _this60.certs[i].extensions.length; j++) {
								//region NameConstraints
								if (_this60.certs[i].extensions[j].extnID === "2.5.29.30") {
									if ("permittedSubtrees" in _this60.certs[i].extensions[j].parsedValue) certPermittedSubtrees = certPermittedSubtrees.concat(_this60.certs[i].extensions[j].parsedValue.permittedSubtrees);

									if ("excludedSubtrees" in _this60.certs[i].extensions[j].parsedValue) certExcludedSubtrees = certExcludedSubtrees.concat(_this60.certs[i].extensions[j].parsedValue.excludedSubtrees);
								}
								//endregion

								//region SubjectAltName
								if (_this60.certs[i].extensions[j].extnID === "2.5.29.17") subjectAltNames = subjectAltNames.concat(_this60.certs[i].extensions[j].parsedValue.altNames);
								//endregion
							}
						}

						//region Checking for "required name forms"
						var formFound = requiredNameForms.length <= 0;

						for (var _j6 = 0; _j6 < requiredNameForms.length; _j6++) {
							switch (requiredNameForms[_j6].base.type) {
								case 4:
									// directoryName
									{
										if (requiredNameForms[_j6].base.value.typesAndValues.length !== _this60.certs[i].subject.typesAndValues.length) continue;

										formFound = true;

										for (var k = 0; k < _this60.certs[i].subject.typesAndValues.length; k++) {
											if (_this60.certs[i].subject.typesAndValues[k].type !== requiredNameForms[_j6].base.value.typesAndValues[k].type) {
												formFound = false;
												break;
											}
										}

										if (formFound === true) break;
									}
									break;
								default: // ??? Probably here we should reject the certificate ???
							}
						}

						if (formFound === false) {
							policyResult.result = false;
							policyResult.resultCode = 21;
							policyResult.resultMessage = "No neccessary name form found";

							return Promise.reject(policyResult);
						}
						//endregion

						//region Checking for "permited sub-trees"
						//region Make groups for all types of constraints
						var constrGroups = []; // Array of array for groupped constraints
						constrGroups[0] = []; // rfc822Name
						constrGroups[1] = []; // dNSName
						constrGroups[2] = []; // directoryName
						constrGroups[3] = []; // uniformResourceIdentifier
						constrGroups[4] = []; // iPAddress

						for (var _j7 = 0; _j7 < permittedSubtrees.length; _j7++) {
							switch (permittedSubtrees[_j7].base.type) {
								//region rfc822Name
								case 1:
									constrGroups[0].push(permittedSubtrees[_j7]);
									break;
								//endregion
								//region dNSName
								case 2:
									constrGroups[1].push(permittedSubtrees[_j7]);
									break;
								//endregion
								//region directoryName
								case 4:
									constrGroups[2].push(permittedSubtrees[_j7]);
									break;
								//endregion
								//region uniformResourceIdentifier
								case 6:
									constrGroups[3].push(permittedSubtrees[_j7]);
									break;
								//endregion
								//region iPAddress
								case 7:
									constrGroups[4].push(permittedSubtrees[_j7]);
									break;
								//endregion
								//region default
								default:
								//endregion
							}
						}
						//endregion

						//region Check name constraints groupped by type, one-by-one
						for (var p = 0; p < 5; p++) {
							var groupPermitted = false;
							var valueExists = false;
							var group = constrGroups[p];

							for (var _j8 = 0; _j8 < group.length; _j8++) {
								switch (p) {
									//region rfc822Name
									case 0:
										if (subjectAltNames.length > 0) {
											for (var _k3 = 0; _k3 < subjectAltNames.length; _k3++) {
												if (subjectAltNames[_k3].type === 1) // rfc822Name
													{
														valueExists = true;
														groupPermitted = groupPermitted || compareRFC822Name(subjectAltNames[_k3].value, group[_j8].base.value);
													}
											}
										} else // Try to find out "emailAddress" inside "subject"
											{
												for (var _k4 = 0; _k4 < _this60.certs[i].subject.typesAndValues.length; _k4++) {
													if (_this60.certs[i].subject.typesAndValues[_k4].type === "1.2.840.113549.1.9.1" || // PKCS#9 e-mail address
													_this60.certs[i].subject.typesAndValues[_k4].type === "0.9.2342.19200300.100.1.3") // RFC1274 "rfc822Mailbox" e-mail address
														{
															valueExists = true;
															groupPermitted = groupPermitted || compareRFC822Name(_this60.certs[i].subject.typesAndValues[_k4].value.valueBlock.value, group[_j8].base.value);
														}
												}
											}
										break;
									//endregion
									//region dNSName
									case 1:
										if (subjectAltNames.length > 0) {
											for (var _k5 = 0; _k5 < subjectAltNames.length; _k5++) {
												if (subjectAltNames[_k5].type === 2) // dNSName
													{
														valueExists = true;
														groupPermitted = groupPermitted || compareDNSName(subjectAltNames[_k5].value, group[_j8].base.value);
													}
											}
										}
										break;
									//endregion
									//region directoryName
									case 2:
										valueExists = true;
										groupPermitted = compareDirectoryName(_this60.certs[i].subject, group[_j8].base.value);
										break;
									//endregion
									//region uniformResourceIdentifier
									case 3:
										if (subjectAltNames.length > 0) {
											for (var _k6 = 0; _k6 < subjectAltNames.length; _k6++) {
												if (subjectAltNames[_k6].type === 6) // uniformResourceIdentifier
													{
														valueExists = true;
														groupPermitted = groupPermitted || compareUniformResourceIdentifier(subjectAltNames[_k6].value, group[_j8].base.value);
													}
											}
										}
										break;
									//endregion
									//region iPAddress
									case 4:
										if (subjectAltNames.length > 0) {
											for (var _k7 = 0; _k7 < subjectAltNames.length; _k7++) {
												if (subjectAltNames[_k7].type === 7) // iPAddress
													{
														valueExists = true;
														groupPermitted = groupPermitted || compareIPAddress(subjectAltNames[_k7].value, group[_j8].base.value);
													}
											}
										}
										break;
									//endregion
									//region default
									default:
									//endregion
								}

								if (groupPermitted) break;
							}

							if (groupPermitted === false && group.length > 0 && valueExists) {
								policyResult.result = false;
								policyResult.resultCode = 41;
								policyResult.resultMessage = "Failed to meet \"permitted sub-trees\" name constraint";

								return Promise.reject(policyResult);
							}
						}
						//endregion
						//endregion

						//region Checking for "excluded sub-trees"
						var excluded = false;

						for (var _j9 = 0; _j9 < excludedSubtrees.length; _j9++) {
							switch (excludedSubtrees[_j9].base.type) {
								//region rfc822Name
								case 1:
									if (subjectAltNames.length >= 0) {
										for (var _k8 = 0; _k8 < subjectAltNames.length; _k8++) {
											if (subjectAltNames[_k8].type === 1) // rfc822Name
												excluded = excluded || compareRFC822Name(subjectAltNames[_k8].value, excludedSubtrees[_j9].base.value);
										}
									} else // Try to find out "emailAddress" inside "subject"
										{
											for (var _k9 = 0; _k9 < _this60.subject.typesAndValues.length; _k9++) {
												if (_this60.subject.typesAndValues[_k9].type === "1.2.840.113549.1.9.1" || // PKCS#9 e-mail address
												_this60.subject.typesAndValues[_k9].type === "0.9.2342.19200300.100.1.3") // RFC1274 "rfc822Mailbox" e-mail address
													excluded = excluded || compareRFC822Name(_this60.subject.typesAndValues[_k9].value.valueBlock.value, excludedSubtrees[_j9].base.value);
											}
										}
									break;
								//endregion
								//region dNSName
								case 2:
									if (subjectAltNames.length > 0) {
										for (var _k10 = 0; _k10 < subjectAltNames.length; _k10++) {
											if (subjectAltNames[_k10].type === 2) // dNSName
												excluded = excluded || compareDNSName(subjectAltNames[_k10].value, excludedSubtrees[_j9].base.value);
										}
									}
									break;
								//endregion
								//region directoryName
								case 4:
									excluded = excluded || compareDirectoryName(_this60.certs[i].subject, excludedSubtrees[_j9].base.value);
									break;
								//endregion
								//region uniformResourceIdentifier
								case 6:
									if (subjectAltNames.length > 0) {
										for (var _k11 = 0; _k11 < subjectAltNames.length; _k11++) {
											if (subjectAltNames[_k11].type === 6) // uniformResourceIdentifier
												excluded = excluded || compareUniformResourceIdentifier(subjectAltNames[_k11].value, excludedSubtrees[_j9].base.value);
										}
									}
									break;
								//endregion
								//region iPAddress
								case 7:
									if (subjectAltNames.length > 0) {
										for (var _k12 = 0; _k12 < subjectAltNames.length; _k12++) {
											if (subjectAltNames[_k12].type === 7) // iPAddress
												excluded = excluded || compareIPAddress(subjectAltNames[_k12].value, excludedSubtrees[_j9].base.value);
										}
									}
									break;
								//endregion
								//region default
								default: // No action, but probably here we need to create a warning for "malformed constraint"
								//endregion
							}

							if (excluded) break;
						}

						if (excluded === true) {
							policyResult.result = false;
							policyResult.resultCode = 42;
							policyResult.resultMessage = "Failed to meet \"excluded sub-trees\" name constraint";

							return Promise.reject(policyResult);
						}
						//endregion

						//region Append "cert_..._subtrees" to "..._subtrees"
						permittedSubtrees = permittedSubtrees.concat(certPermittedSubtrees);
						excludedSubtrees = excludedSubtrees.concat(certExcludedSubtrees);
						//endregion
					}
					//endregion

					return policyResult;
				});
				//endregion

				//region Error handling stub
				sequence = sequence.then(function (result) {
					return result;
				}, function (error) {
					return {
						result: false,
						resultCode: -1,
						resultMessage: error.message
					};
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "trustedCerts":
						return [];
					case "certs":
						return [];
					case "crls":
						return [];
					case "ocsps":
						return [];
					case "checkDate":
						return new Date();
					default:
						throw new Error("Invalid member name for CertificateChainValidationEngine class: " + memberName);
				}
			}
		}]);

		return CertificateChainValidationEngine;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC6960
  */


	var CertID = function () {
		//**********************************************************************************
		/**
   * Constructor for CertID class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CertID() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CertID);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description hashAlgorithm
    */
			this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", CertID.defaultValues("hashAlgorithm"));
			/**
    * @type {OctetString}
    * @description issuerNameHash
    */
			this.issuerNameHash = getParametersValue(parameters, "issuerNameHash", CertID.defaultValues("issuerNameHash"));
			/**
    * @type {OctetString}
    * @description issuerKeyHash
    */
			this.issuerKeyHash = getParametersValue(parameters, "issuerKeyHash", CertID.defaultValues("issuerKeyHash"));
			/**
    * @type {Integer}
    * @description serialNumber
    */
			this.serialNumber = getParametersValue(parameters, "serialNumber", CertID.defaultValues("serialNumber"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CertID, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CertID.schema({
					names: {
						hashAlgorithm: "hashAlgorithm",
						issuerNameHash: "issuerNameHash",
						issuerKeyHash: "issuerKeyHash",
						serialNumber: "serialNumber"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CertID");
				//endregion

				//region Get internal properties from parsed schema
				this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });
				this.issuerNameHash = asn1.result.issuerNameHash;
				this.issuerKeyHash = asn1.result.issuerKeyHash;
				this.serialNumber = asn1.result.serialNumber;
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.hashAlgorithm.toSchema(), this.issuerNameHash, this.issuerKeyHash, this.serialNumber]
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					hashAlgorithm: this.hashAlgorithm.toJSON(),
					issuerNameHash: this.issuerNameHash.toJSON(),
					issuerKeyHash: this.issuerKeyHash.toJSON(),
					serialNumber: this.serialNumber.toJSON()
				};
			}

			//**********************************************************************************
			/**
    * Check that two "CertIDs" are equal
    * @param {CertID} certificateID Identifier of the certificate to be checked
    * @returns {boolean}
    */

		}, {
			key: "isEqual",
			value: function isEqual(certificateID) {
				//region Check "hashAlgorithm"
				if (!this.hashAlgorithm.algorithmId === certificateID.hashAlgorithm.algorithmId) return false;
				//endregion

				//region Check "issuerNameHash"
				if (isEqualBuffer(this.issuerNameHash.valueBlock.valueHex, certificateID.issuerNameHash.valueBlock.valueHex) === false) return false;
				//endregion

				//region Check "issuerKeyHash"
				if (isEqualBuffer(this.issuerKeyHash.valueBlock.valueHex, certificateID.issuerKeyHash.valueBlock.valueHex) === false) return false;
				//endregion

				//region Check "serialNumber"
				if (!this.serialNumber.isEqual(certificateID.serialNumber)) return false;
				//endregion

				return true;
			}

			//**********************************************************************************
			/**
    * Making OCSP certificate identifier for specific certificate
    * @param {Certificate} certificate Certificate making OCSP Request for
    * @param {Object} parameters Additional parameters
    * @returns {Promise}
    */

		}, {
			key: "createForCertificate",
			value: function createForCertificate(certificate, parameters) {
				var _this61 = this;

				//region Initial variables
				var sequence = Promise.resolve();

				var issuerCertificate = void 0;
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Check input parameters
				if ("hashAlgorithm" in parameters === false) return Promise.reject("Parameter \"hashAlgorithm\" is mandatory for \"OCSP_REQUEST.createForCertificate\"");

				var hashOID = getOIDByAlgorithm({ name: parameters.hashAlgorithm });
				if (hashOID === "") return Promise.reject("Incorrect \"hashAlgorithm\": " + this.hashAlgorithm);

				this.hashAlgorithm = new AlgorithmIdentifier({
					algorithmId: hashOID,
					algorithmParams: new Null()
				});

				if ("issuerCertificate" in parameters) issuerCertificate = parameters.issuerCertificate;else return Promise.reject("Parameter \"issuerCertificate\" is mandatory for \"OCSP_REQUEST.createForCertificate\"");
				//endregion

				//region Initialize "serialNumber" field
				this.serialNumber = certificate.serialNumber;
				//endregion

				//region Create "issuerNameHash"
				sequence = sequence.then(function () {
					return crypto.digest({ name: parameters.hashAlgorithm }, issuerCertificate.subject.toSchema().toBER(false));
				}, function (error) {
					return Promise.reject(error);
				});
				//endregion

				//region Create "issuerKeyHash"
				sequence = sequence.then(function (result) {
					_this61.issuerNameHash = new OctetString({ valueHex: result });

					var issuerKeyBuffer = issuerCertificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex;

					return crypto.digest({ name: parameters.hashAlgorithm }, issuerKeyBuffer);
				}, function (error) {
					return Promise.reject(error);
				}).then(function (result) {
					_this61.issuerKeyHash = new OctetString({ valueHex: result });
				}, function (error) {
					return Promise.reject(error);
				});
				//endregion

				return sequence;
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "hashAlgorithm":
						return new AlgorithmIdentifier();
					case "issuerNameHash":
					case "issuerKeyHash":
						return new OctetString();
					case "serialNumber":
						return new Integer();
					default:
						throw new Error("Invalid member name for CertID class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "hashAlgorithm":
						return memberValue.algorithmId === "" && "algorithmParams" in memberValue === false;
					case "issuerNameHash":
					case "issuerKeyHash":
					case "serialNumber":
						return memberValue.isEqual(CertID.defaultValues(memberName));
					default:
						throw new Error("Invalid member name for CertID class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//CertID          ::=     SEQUENCE {
				//    hashAlgorithm       AlgorithmIdentifier,
				//    issuerNameHash      OCTET STRING, -- Hash of issuer's DN
				//    issuerKeyHash       OCTET STRING, -- Hash of issuer's public key
				//    serialNumber        CertificateSerialNumber }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [hashAlgorithm]
     * @property {string} [hashAlgorithmObject]
     * @property {string} [issuerNameHash]
     * @property {string} [issuerKeyHash]
     * @property {string} [serialNumber]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [AlgorithmIdentifier.schema(names.hashAlgorithmObject || {
						names: {
							blockName: names.hashAlgorithm || ""
						}
					}), new OctetString({ name: names.issuerNameHash || "" }), new OctetString({ name: names.issuerKeyHash || "" }), new Integer({ name: names.serialNumber || "" })]
				});
			}
		}]);

		return CertID;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC6960
  */


	var SingleResponse = function () {
		//**********************************************************************************
		/**
   * Constructor for SingleResponse class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function SingleResponse() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, SingleResponse);

			//region Internal properties of the object
			/**
    * @type {CertID}
    * @description certID
    */
			this.certID = getParametersValue(parameters, "certID", SingleResponse.defaultValues("certID"));
			/**
    * @type {Object}
    * @description certStatus
    */
			this.certStatus = getParametersValue(parameters, "certStatus", SingleResponse.defaultValues("certStatus"));
			/**
    * @type {Date}
    * @description thisUpdate
    */
			this.thisUpdate = getParametersValue(parameters, "thisUpdate", SingleResponse.defaultValues("thisUpdate"));

			if ("nextUpdate" in parameters)
				/**
     * @type {Date}
     * @description nextUpdate
     */
				this.nextUpdate = getParametersValue(parameters, "nextUpdate", SingleResponse.defaultValues("nextUpdate"));

			if ("singleExtensions" in parameters)
				/**
     * @type {Array.<Extension>}
     * @description singleExtensions
     */
				this.singleExtensions = getParametersValue(parameters, "singleExtensions", SingleResponse.defaultValues("singleExtensions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(SingleResponse, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, SingleResponse.schema({
					names: {
						certID: {
							names: {
								blockName: "certID"
							}
						},
						certStatus: "certStatus",
						thisUpdate: "thisUpdate",
						nextUpdate: "nextUpdate",
						singleExtensions: {
							names: {
								blockName: "singleExtensions"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for SingleResponse");
				//endregion

				//region Get internal properties from parsed schema
				this.certID = new CertID({ schema: asn1.result.certID });
				this.certStatus = asn1.result.certStatus;
				this.thisUpdate = asn1.result.thisUpdate.toDate();
				if ("nextUpdate" in asn1.result) this.nextUpdate = asn1.result.nextUpdate.toDate();

				if ("singleExtensions" in asn1.result) this.singleExtensions = Array.from(asn1.result.singleExtensions.valueBlock.value, function (element) {
					return new Extension({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create value array for output sequence
				var outputArray = [];

				outputArray.push(this.certID.toSchema());
				outputArray.push(this.certStatus);
				outputArray.push(new GeneralizedTime({ valueDate: this.thisUpdate }));
				if ("nextUpdate" in this) outputArray.push(new GeneralizedTime({ valueDate: this.nextUpdate }));

				if ("singleExtensions" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.singleExtensions, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					certID: this.certID.toJSON(),
					certStatus: this.certStatus.toJSON(),
					thisUpdate: this.thisUpdate
				};

				if ("nextUpdate" in this) _object.nextUpdate = this.nextUpdate;

				if ("singleExtensions" in this) _object.singleExtensions = Array.from(this.singleExtensions, function (element) {
					return element.toJSON();
				});

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "certID":
						return new CertID();
					case "certStatus":
						return {};
					case "thisUpdate":
					case "nextUpdate":
						return new Date(0, 0, 0);
					case "singleExtensions":
						return [];
					default:
						throw new Error("Invalid member name for SingleResponse class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "certID":
						return CertID.compareWithDefault("hashAlgorithm", memberValue.hashAlgorithm) && CertID.compareWithDefault("issuerNameHash", memberValue.issuerNameHash) && CertID.compareWithDefault("issuerKeyHash", memberValue.issuerKeyHash) && CertID.compareWithDefault("serialNumber", memberValue.serialNumber);
					case "certStatus":
						return Object.keys(memberValue).length === 0;
					case "thisUpdate":
					case "nextUpdate":
						return memberValue === SingleResponse.defaultValues(memberName);
					default:
						throw new Error("Invalid member name for SingleResponse class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//SingleResponse ::= SEQUENCE {
				//    certID                       CertID,
				//    certStatus                   CertStatus,
				//    thisUpdate                   GeneralizedTime,
				//    nextUpdate         [0]       EXPLICIT GeneralizedTime OPTIONAL,
				//    singleExtensions   [1]       EXPLICIT Extensions OPTIONAL }
				//
				//CertStatus ::= CHOICE {
				//    good        [0]     IMPLICIT NULL,
				//    revoked     [1]     IMPLICIT RevokedInfo,
				//    unknown     [2]     IMPLICIT UnknownInfo }
				//
				//RevokedInfo ::= SEQUENCE {
				//    revocationTime              GeneralizedTime,
				//    revocationReason    [0]     EXPLICIT CRLReason OPTIONAL }
				//
				//UnknownInfo ::= NULL

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [certID]
     * @property {string} [certStatus]
     * @property {string} [thisUpdate]
     * @property {string} [nextUpdate]
     * @property {string} [singleExtensions]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [CertID.schema(names.certID || {}), new Choice({
						value: [new Primitive({
							name: names.certStatus || "",
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							lenBlockLength: 1 // The length contains one byte 0x00
						}), // IMPLICIT NULL (no "value_block")
						new Constructed({
							name: names.certStatus || "",
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [new GeneralizedTime(), new Constructed({
								optional: true,
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 0 // [0]
								},
								value: [new Enumerated()]
							})]
						}), new Primitive({
							name: names.certStatus || "",
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 2 // [2]
							},
							lenBlock: { length: 1 }
						}) // IMPLICIT NULL (no "value_block")
						]
					}), new GeneralizedTime({ name: names.thisUpdate || "" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new GeneralizedTime({ name: names.nextUpdate || "" })]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [Extensions.schema(names.singleExtensions || {})]
					}) // EXPLICIT SEQUENCE value
					]
				});
			}
		}]);

		return SingleResponse;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC6960
  */


	var ResponseData = function () {
		//**********************************************************************************
		/**
   * Constructor for ResponseData class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ResponseData() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ResponseData);

			//region Internal properties of the object
			/**
    * @type {ArrayBuffer}
    * @description tbs
    */
			this.tbs = getParametersValue(parameters, "tbs", ResponseData.defaultValues("tbs"));
			/**
    * @type {Object}
    * @description responderID
    */
			this.responderID = getParametersValue(parameters, "responderID", ResponseData.defaultValues("responderID"));
			/**
    * @type {Date}
    * @description producedAt
    */
			this.producedAt = getParametersValue(parameters, "producedAt", ResponseData.defaultValues("producedAt"));
			/**
    * @type {Array.<SingleResponse>}
    * @description responses
    */
			this.responses = getParametersValue(parameters, "responses", ResponseData.defaultValues("responses"));

			if ("responseExtensions" in parameters)
				/**
     * @type {Array.<Extension>}
     * @description responseExtensions
     */
				this.responseExtensions = getParametersValue(parameters, "responseExtensions", ResponseData.defaultValues("responseExtensions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ResponseData, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, ResponseData.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ocsp.ResponseData");
				//endregion

				//region Get internal properties from parsed schema
				this.tbs = asn1.result.ResponseData.valueBeforeDecode;

				if ("ResponseData.version" in asn1.result) this.version = asn1.result["ResponseData.version"].valueBlock.valueDec;

				if (asn1.result["ResponseData.responderID"].idBlock.tagNumber === 1) this.responderID = new RelativeDistinguishedNames({ schema: asn1.result["ResponseData.responderID"].valueBlock.value[0] });else this.responderID = asn1.result["ResponseData.responderID"].valueBlock.value[0]; // OCTETSTRING

				this.producedAt = asn1.result["ResponseData.producedAt"].toDate();
				this.responses = Array.from(asn1.result["ResponseData.responses"], function (element) {
					return new SingleResponse({ schema: element });
				});

				if ("ResponseData.responseExtensions" in asn1.result) this.responseExtensions = Array.from(asn1.result["ResponseData.responseExtensions"].valueBlock.value, function (element) {
					return new Extension({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @param {boolean} encodeFlag If param equal to false then create TBS schema via decoding stored value. In othe case create TBS schema via assembling from TBS parts.
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				var encodeFlag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Decode stored TBS value 
				var tbsSchema = void 0;

				if (encodeFlag === false) {
					if (this.tbs.length === 0) // No stored certificate TBS part
						return ResponseData.schema();

					tbsSchema = fromBER(this.tbs).result;
				}
				//endregion 
				//region Create TBS schema via assembling from TBS parts
				else {
						var outputArray = [];

						if ("version" in this) {
							outputArray.push(new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 0 // [0]
								},
								value: [new Integer({ value: this.version })]
							}));
						}

						if (this.responderID instanceof RelativeDistinguishedNames) {
							outputArray.push(new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: [this.responderID.toSchema()]
							}));
						} else {
							outputArray.push(new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 2 // [2]
								},
								value: [this.responderID]
							}));
						}

						outputArray.push(new GeneralizedTime({ valueDate: this.producedAt }));

						outputArray.push(new Sequence({
							value: Array.from(this.responses, function (element) {
								return element.toSchema();
							})
						}));

						if ("responseExtensions" in this) {
							outputArray.push(new Sequence({
								value: Array.from(this.responseExtensions, function (element) {
									return element.toSchema();
								})
							}));
						}

						tbsSchema = new Sequence({
							value: outputArray
						});
					}
				//endregion 

				//region Construct and return new ASN.1 schema for this object 
				return tbsSchema;
				//endregion 
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {};

				if ("version" in this) _object.version = this.version;

				if ("responderID" in this) _object.responderID = this.responderID;

				if ("producedAt" in this) _object.producedAt = this.producedAt;

				if ("responses" in this) _object.responses = Array.from(this.responses, function (element) {
					return element.toJSON();
				});

				if ("responseExtensions" in this) _object.responseExtensions = Array.from(this.responseExtensions, function (element) {
					return element.toJSON();
				});

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "tbs":
						return new ArrayBuffer(0);
					case "responderID":
						return {};
					case "producedAt":
						return new Date(0, 0, 0);
					case "responses":
					case "responseExtensions":
						return [];
					default:
						throw new Error("Invalid member name for ResponseData class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "tbs":
						return memberValue.byteLength === 0;
					case "responderID":
						return Object.keys(memberValue).length === 0;
					case "producedAt":
						return memberValue === ResponseData.defaultValues(memberName);
					case "responses":
					case "responseExtensions":
						return memberValue.length === 0;
					default:
						throw new Error("Invalid member name for ResponseData class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//ResponseData ::= SEQUENCE {
				//    version              [0] EXPLICIT Version DEFAULT v1,
				//    responderID              ResponderID,
				//    producedAt               GeneralizedTime,
				//    responses                SEQUENCE OF SingleResponse,
				//    responseExtensions   [1] EXPLICIT Extensions OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [ResponseDataByName]
     * @property {string} [ResponseDataByKey]
     * @property {string} [producedAt]
     * @property {string} [response]
     * @property {string} [extensions]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "ResponseData",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Integer({ name: names.version || "ResponseData.version" })]
					}), new Choice({
						value: [new Constructed({
							name: names.responderID || "ResponseData.responderID",
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [RelativeDistinguishedNames.schema(names.ResponseDataByName || {
								names: {
									blockName: "ResponseData.byName"
								}
							})]
						}), new Constructed({
							name: names.responderID || "ResponseData.responderID",
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 2 // [2]
							},
							value: [new OctetString({ name: names.ResponseDataByKey || "ResponseData.byKey" })]
						})]
					}), new GeneralizedTime({ name: names.producedAt || "ResponseData.producedAt" }), new Sequence({
						value: [new Repeated({
							name: "ResponseData.responses",
							value: SingleResponse.schema(names.response || {})
						})]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [Extensions.schema(names.extensions || {
							names: {
								blockName: "ResponseData.responseExtensions"
							}
						})]
					}) // EXPLICIT SEQUENCE value
					]
				});
			}
		}]);

		return ResponseData;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC6960
  */


	var BasicOCSPResponse = function () {
		//**********************************************************************************
		/**
   * Constructor for BasicOCSPResponse class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function BasicOCSPResponse() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, BasicOCSPResponse);

			//region Internal properties of the object
			/**
    * @type {ResponseData}
    * @description tbsResponseData
    */
			this.tbsResponseData = getParametersValue(parameters, "tbsResponseData", BasicOCSPResponse.defaultValues("tbsResponseData"));
			/**
    * @type {AlgorithmIdentifier}
    * @description signatureAlgorithm
    */
			this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", BasicOCSPResponse.defaultValues("signatureAlgorithm"));
			/**
    * @type {BitString}
    * @description signature
    */
			this.signature = getParametersValue(parameters, "signature", BasicOCSPResponse.defaultValues("signature"));

			if ("certs" in parameters)
				/**
     * @type {Array.<Certificate>}
     * @description certs
     */
				this.certs = getParametersValue(parameters, "certs", BasicOCSPResponse.defaultValues("certs"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(BasicOCSPResponse, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, BasicOCSPResponse.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OCSP_BASIC_RESPONSE");
				//endregion

				//region Get internal properties from parsed schema
				this.tbsResponseData = new ResponseData({ schema: asn1.result["BasicOCSPResponse.tbsResponseData"] });
				this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result["BasicOCSPResponse.signatureAlgorithm"] });
				this.signature = asn1.result["BasicOCSPResponse.signature"];

				if ("BasicOCSPResponse.certs" in asn1.result) this.certs = Array.from(asn1.result["BasicOCSPResponse.certs"], function (element) {
					return new Certificate({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(this.tbsResponseData.toSchema());
				outputArray.push(this.signatureAlgorithm.toSchema());
				outputArray.push(this.signature);

				//region Create array of certificates
				if ("certs" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Sequence({
							value: Array.from(this.certs, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}
				//endregion
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					tbsResponseData: this.tbsResponseData.toJSON(),
					signatureAlgorithm: this.signatureAlgorithm.toJSON(),
					signature: this.signature.toJSON()
				};

				if ("certs" in this) _object.certs = Array.from(this.certs, function (element) {
					return element.toJSON();
				});

				return _object;
			}
			//**********************************************************************************
			/**
    * Get OCSP response status for specific certificate
    * @param {Certificate} certificate Certificate to be checked
    * @param {Certificate} issuerCertificate Certificate of issuer for certificate to be checked
    * @returns {Promise}
    */

		}, {
			key: "getCertificateStatus",
			value: function getCertificateStatus(certificate, issuerCertificate) {
				var _this62 = this;

				//region Initial variables
				var sequence = Promise.resolve();

				var result = {
					isForCertificate: false,
					status: 2 // 0 = good, 1 = revoked, 2 = unknown
				};

				var hashesObject = {};

				var certIDs = [];
				var certIDPromises = [];
				//endregion

				//region Create all "certIDs" for input certificates
				var _iteratorNormalCompletion22 = true;
				var _didIteratorError22 = false;
				var _iteratorError22 = undefined;

				try {
					for (var _iterator22 = this.tbsResponseData.responses[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
						var response = _step22.value;

						var hashAlgorithm = getAlgorithmByOID(response.certID.hashAlgorithm.algorithmId);
						if ("name" in hashAlgorithm === false) return Promise.reject("Wrong CertID hashing algorithm: " + response.certID.hashAlgorithm.algorithmId);

						if (hashAlgorithm.name in hashesObject === false) {
							hashesObject[hashAlgorithm.name] = 1;

							var certID = new CertID();

							certIDs.push(certID);
							certIDPromises.push(certID.createForCertificate(certificate, {
								hashAlgorithm: hashAlgorithm.name,
								issuerCertificate: issuerCertificate
							}));
						}
					}
				} catch (err) {
					_didIteratorError22 = true;
					_iteratorError22 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion22 && _iterator22.return) {
							_iterator22.return();
						}
					} finally {
						if (_didIteratorError22) {
							throw _iteratorError22;
						}
					}
				}

				sequence = sequence.then(function () {
					return Promise.all(certIDPromises);
				});
				//endregion

				//region Compare all response's "certIDs" with identifiers for input certificate
				sequence = sequence.then(function () {
					var _iteratorNormalCompletion23 = true;
					var _didIteratorError23 = false;
					var _iteratorError23 = undefined;

					try {
						for (var _iterator23 = _this62.tbsResponseData.responses[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
							var response = _step23.value;
							var _iteratorNormalCompletion24 = true;
							var _didIteratorError24 = false;
							var _iteratorError24 = undefined;

							try {
								for (var _iterator24 = certIDs[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
									var id = _step24.value;

									if (response.certID.isEqual(id)) {
										result.isForCertificate = true;

										try {
											switch (response.certStatus.idBlock.isConstructed) {
												case true:
													if (response.certStatus.idBlock.tagNumber === 1) result.status = 1; // revoked

													break;
												case false:
													switch (response.certStatus.idBlock.tagNumber) {
														case 0:
															// good
															result.status = 0;
															break;
														case 2:
															// unknown
															result.status = 2;
															break;
														default:
													}

													break;
												default:
											}
										} catch (ex) {}

										return result;
									}
								}
							} catch (err) {
								_didIteratorError24 = true;
								_iteratorError24 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion24 && _iterator24.return) {
										_iterator24.return();
									}
								} finally {
									if (_didIteratorError24) {
										throw _iteratorError24;
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError23 = true;
						_iteratorError23 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion23 && _iterator23.return) {
								_iterator23.return();
							}
						} finally {
							if (_didIteratorError23) {
								throw _iteratorError23;
							}
						}
					}

					return result;
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************
			/**
    * Make signature for current OCSP Basic Response
    * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
    * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
    * @returns {Promise}
    */

		}, {
			key: "sign",
			value: function sign(privateKey, hashAlgorithm) {
				var _this63 = this;

				//region Get a private key from function parameter
				if (typeof privateKey === "undefined") return Promise.reject("Need to provide a private key for signing");
				//endregion

				//region Get hashing algorithm
				if (typeof hashAlgorithm === "undefined") hashAlgorithm = "SHA-1";else {
					//region Simple check for supported algorithm
					var oid = getOIDByAlgorithm({ name: hashAlgorithm });
					if (oid === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);
					//endregion
				}
				//endregion

				//region Get a "default parameters" for current algorithm
				var defParams = getAlgorithmParameters(privateKey.algorithm.name, "sign");
				defParams.algorithm.hash.name = hashAlgorithm;
				//endregion

				//region Fill internal structures base on "privateKey" and "hashAlgorithm"
				switch (privateKey.algorithm.name.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
					case "ECDSA":
						this.signatureAlgorithm.algorithmId = getOIDByAlgorithm(defParams.algorithm);
						break;
					case "RSA-PSS":
						{
							//region Set "saltLength" as a length (in octets) of hash function result
							switch (hashAlgorithm.toUpperCase()) {
								case "SHA-256":
									defParams.algorithm.saltLength = 32;
									break;
								case "SHA-384":
									defParams.algorithm.saltLength = 48;
									break;
								case "SHA-512":
									defParams.algorithm.saltLength = 64;
									break;
								default:
							}
							//endregion

							//region Fill "RSASSA_PSS_params" object
							var paramsObject = {};

							if (hashAlgorithm.toUpperCase() !== "SHA-1") {
								var hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
								if (hashAlgorithmOID === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);

								paramsObject.hashAlgorithm = new AlgorithmIdentifier({
									algorithmId: hashAlgorithmOID,
									algorithmParams: new Null()
								});

								paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
									algorithmId: "1.2.840.113549.1.1.8", // MGF1
									algorithmParams: paramsObject.hashAlgorithm.toSchema()
								});
							}

							if (defParams.algorithm.saltLength !== 20) paramsObject.saltLength = defParams.algorithm.saltLength;

							var pssParameters = new RSASSAPSSParams(paramsObject);
							//endregion

							//region Automatically set signature algorithm
							this.signatureAlgorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.10",
								algorithmParams: pssParameters.toSchema()
							});
							//endregion
						}
						break;
					default:
						return Promise.reject("Unsupported signature algorithm: " + privateKey.algorithm.name);
				}
				//endregion

				//region Create TBS data for signing
				this.tbsResponseData.tbs = this.tbsResponseData.toSchema(true).toBER(false);
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Signing TBS data on provided private key
				return crypto.sign(defParams.algorithm, privateKey, new Uint8Array(this.tbsResponseData.tbs)).then(function (result) {
					//region Special case for ECDSA algorithm
					if (defParams.algorithm.name === "ECDSA") result = createCMSECDSASignature(result);
					//endregion

					_this63.signature = new BitString({ valueHex: result });
				}, function (error) {
					return Promise.reject("Signing error: " + error);
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Verify existing OCSP Basic Response
    * @param {Object} parameters Additional parameters
    * @returns {Promise}
    */

		}, {
			key: "verify",
			value: function verify() {
				var _this64 = this;

				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//region Check amount of certificates
				if ("certs" in this === false) return Promise.reject("No certificates attached to the BasicOCSPResponce");
				//endregion

				//region Global variables (used in "promises")
				var signerCert = null;

				var tbsView = new Uint8Array(this.tbsResponseData.tbs);

				var certIndex = -1;

				var sequence = Promise.resolve();

				var shaAlgorithm = "";

				var trustedCerts = [];
				//endregion

				//region Get input values
				if ("trustedCerts" in parameters) trustedCerts = parameters.trustedCerts;
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Find a correct hashing algorithm
				shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
				if (shaAlgorithm === "") return Promise.reject("Unsupported signature algorithm: " + this.signatureAlgorithm.algorithmId);
				//endregion

				//region Find correct value for "responderID"
				var responderType = 0;
				var responderId = {};

				if (this.tbsResponseData.responderID instanceof RelativeDistinguishedNames) // [1] Name
					{
						responderType = 0;
						responderId = this.tbsResponseData.responderID;
					} else {
					if (this.tbsResponseData.responderID instanceof OctetString) // [2] KeyHash
						{
							responderType = 1;
							responderId = this.tbsResponseData.responderID;
						} else return Promise.reject("Wrong value for responderID");
				}
				//endregion

				//region Compare responderID with all certificates one-by-one
				if (responderType === 0) // By Name
					{
						sequence = sequence.then(function () {
							var _iteratorNormalCompletion25 = true;
							var _didIteratorError25 = false;
							var _iteratorError25 = undefined;

							try {
								for (var _iterator25 = _this64.certs.entries()[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
									var _step25$value = _slicedToArray(_step25.value, 2);

									var index = _step25$value[0];
									var certificate = _step25$value[1];

									if (certificate.subject.isEqual(responderId)) {
										certIndex = index;
										break;
									}
								}
							} catch (err) {
								_didIteratorError25 = true;
								_iteratorError25 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion25 && _iterator25.return) {
										_iterator25.return();
									}
								} finally {
									if (_didIteratorError25) {
										throw _iteratorError25;
									}
								}
							}
						});
					} else // By KeyHash
					{
						sequence = sequence.then(function () {
							return Promise.all(Array.from(_this64.certs, function (element) {
								return crypto.digest({ name: "sha-1" }, new Uint8Array(element.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
							})).then(function (results) {
								var _iteratorNormalCompletion26 = true;
								var _didIteratorError26 = false;
								var _iteratorError26 = undefined;

								try {
									for (var _iterator26 = _this64.certs.entries()[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
										var _step26$value = _slicedToArray(_step26.value, 2);

										var index = _step26$value[0];
										var certificate = _step26$value[1];

										if (isEqualBuffer(results[index], responderId.valueBlock.valueHex)) {
											certIndex = index;
											break;
										}
									}
								} catch (err) {
									_didIteratorError26 = true;
									_iteratorError26 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion26 && _iterator26.return) {
											_iterator26.return();
										}
									} finally {
										if (_didIteratorError26) {
											throw _iteratorError26;
										}
									}
								}
							});
						});
					}
				//endregion

				//region Make additional verification for signer's certificate
				/**
     * Check CA flag for the certificate
     * @param {Certificate} cert Certificate to find CA flag for
     * @returns {*}
     */
				function checkCA(cert) {
					//region Do not include signer's certificate
					if (cert.issuer.isEqual(signerCert.issuer) === true && cert.serialNumber.isEqual(signerCert.serialNumber) === true) return null;
					//endregion

					var isCA = false;

					var _iteratorNormalCompletion27 = true;
					var _didIteratorError27 = false;
					var _iteratorError27 = undefined;

					try {
						for (var _iterator27 = cert.extensions[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
							var extension = _step27.value;

							if (extension.extnID === "2.5.29.19") // BasicConstraints
								{
									if ("cA" in extension.parsedValue) {
										if (extension.parsedValue.cA === true) isCA = true;
									}
								}
						}
					} catch (err) {
						_didIteratorError27 = true;
						_iteratorError27 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion27 && _iterator27.return) {
								_iterator27.return();
							}
						} finally {
							if (_didIteratorError27) {
								throw _iteratorError27;
							}
						}
					}

					if (isCA) return cert;

					return null;
				}

				sequence = sequence.then(function () {
					if (certIndex === -1) return Promise.reject("Correct certificate was not found in OCSP response");

					signerCert = _this64.certs[certIndex];

					return Promise.all(Array.from(_this64.certs, function (element) {
						return checkCA(element);
					})).then(function (promiseResults) {
						var additionalCerts = [];
						additionalCerts.push(signerCert);

						var _iteratorNormalCompletion28 = true;
						var _didIteratorError28 = false;
						var _iteratorError28 = undefined;

						try {
							for (var _iterator28 = promiseResults[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
								var promiseResult = _step28.value;

								if (promiseResult !== null) additionalCerts.push(promiseResult);
							}
						} catch (err) {
							_didIteratorError28 = true;
							_iteratorError28 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion28 && _iterator28.return) {
									_iterator28.return();
								}
							} finally {
								if (_didIteratorError28) {
									throw _iteratorError28;
								}
							}
						}

						var certChain = new CertificateChainValidationEngine({
							certs: additionalCerts,
							trustedCerts: trustedCerts
						});

						return certChain.verify().then(function (verificationResult) {
							if (verificationResult.result === true) return Promise.resolve();

							return Promise.reject("Validation of signer's certificate failed");
						}, function (error) {
							return Promise.reject("Validation of signer's certificate failed with error: " + (error instanceof Object ? error.resultMessage : error));
						});
					}, function (promiseError) {
						return Promise.reject("Error during checking certificates for CA flag: " + promiseError);
					});
				});
				//endregion

				//region Import public key from responder certificate
				sequence = sequence.then(function () {
					//region Get information about public key algorithm and default parameters for import
					var algorithmId = void 0;
					if (_this64.certs[certIndex].signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10") algorithmId = _this64.certs[certIndex].signatureAlgorithm.algorithmId;else algorithmId = _this64.certs[certIndex].subjectPublicKeyInfo.algorithm.algorithmId;

					var algorithmObject = getAlgorithmByOID(algorithmId);
					if ("name" in algorithmObject === false) return Promise.reject("Unsupported public key algorithm: " + algorithmId);

					var algorithmName = algorithmObject.name;

					var algorithm = getAlgorithmParameters(algorithmName, "importkey");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;

					//region Special case for ECDSA
					if (algorithmName === "ECDSA") {
						//region Get information about named curve
						if (_this64.certs[certIndex].subjectPublicKeyInfo.algorithm.algorithmParams instanceof ObjectIdentifier === false) return Promise.reject("Incorrect type for ECDSA public key parameters");

						var curveObject = getAlgorithmByOID(_this64.certs[certIndex].subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						if ("name" in curveObject === false) return Promise.reject("Unsupported named curve algorithm: " + _this64.certs[certIndex].subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						//endregion

						algorithm.algorithm.namedCurve = curveObject.name;
					}
					//endregion
					//endregion

					var publicKeyInfoSchema = _this64.certs[certIndex].subjectPublicKeyInfo.toSchema();
					var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
					var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

					return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
				});
				//endregion

				//region Verifying TBS part of BasicOCSPResponce
				sequence = sequence.then(function (publicKey) {
					//region Get default algorithm parameters for verification
					var algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					//region Special case for ECDSA signatures
					var signatureValue = _this64.signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);
						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}
					//endregion

					//region Special case for RSA-PSS
					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: _this64.signatureAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashAlgo = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) return Promise.reject("Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId);

							hashAlgo = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashAlgo;
					}
					//endregion

					return crypto.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), tbsView);
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "tbsResponseData":
						return new ResponseData();
					case "signatureAlgorithm":
						return new AlgorithmIdentifier();
					case "signature":
						return new BitString();
					case "certs":
						return [];
					default:
						throw new Error("Invalid member name for BasicOCSPResponse class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "type":
						{
							var comparisonResult = ResponseData.compareWithDefault("tbs", memberValue.tbs) && ResponseData.compareWithDefault("responderID", memberValue.responderID) && ResponseData.compareWithDefault("producedAt", memberValue.producedAt) && ResponseData.compareWithDefault("responses", memberValue.responses);

							if ("responseExtensions" in memberValue) comparisonResult = comparisonResult && ResponseData.compareWithDefault("responseExtensions", memberValue.responseExtensions);

							return comparisonResult;
						}
					case "signatureAlgorithm":
						return memberValue.algorithmId === "" && "algorithmParams" in memberValue === false;
					case "signature":
						return memberValue.isEqual(BasicOCSPResponse.defaultValues(memberName));
					case "certs":
						return memberValue.length === 0;
					default:
						throw new Error("Invalid member name for BasicOCSPResponse class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//BasicOCSPResponse       ::= SEQUENCE {
				//    tbsResponseData      ResponseData,
				//    signatureAlgorithm   AlgorithmIdentifier,
				//    signature            BIT STRING,
				//    certs            [0] EXPLICIT SEQUENCE OF Certificate OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [tbsResponseData]
     * @property {string} [signatureAlgorithm]
     * @property {string} [signature]
     * @property {string} [certs]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "BasicOCSPResponse",
					value: [ResponseData.schema(names.tbsResponseData || {
						names: {
							blockName: "BasicOCSPResponse.tbsResponseData"
						}
					}), AlgorithmIdentifier.schema(names.signatureAlgorithm || {
						names: {
							blockName: "BasicOCSPResponse.signatureAlgorithm"
						}
					}), new BitString({ name: names.signature || "BasicOCSPResponse.signature" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Sequence({
							value: [new Repeated({
								name: "BasicOCSPResponse.certs",
								value: Certificate.schema(names.certs || {})
							})]
						})]
					})]
				});
			}
		}]);

		return BasicOCSPResponse;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from X.509-1997
  */


	var AttributeCertificateV1 = function () {
		//**********************************************************************************
		/**
   * Constructor for AttributeCertificateV1 class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AttributeCertificateV1() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AttributeCertificateV1);

			// Fake constructor for now
			this.acinfo = {};
			this.signatureAlgorithm = {};
			this.signatureValue = {};
		}
		//**********************************************************************************
		/**
   * Convert parsed asn1js object into current class
   * @param {!Object} schema
   */


		_createClass(AttributeCertificateV1, [{
			key: "fromSchema",
			value: function fromSchema(schema) {}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				return new Any();
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {};
			}
			//**********************************************************************************

		}]);

		return AttributeCertificateV1;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from X.509-2000
  */


	var AttributeCertificateV2 = function () {
		//**********************************************************************************
		/**
   * Constructor for AttributeCertificateV1 class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AttributeCertificateV2() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AttributeCertificateV2);

			// Fake constructor for now;
			this.version = {};
			this.holder = {};
			this.issuer = {};
			this.signature = {};
			this.serialNumber = {};
			this.attrCertValidityPeriod = {};
			this.attributes = {};
			this.issuerUniqueID = {};
			this.extensions = {};
		}
		//**********************************************************************************
		/**
   * Convert parsed asn1js object into current class
   * @param {!Object} schema
   */


		_createClass(AttributeCertificateV2, [{
			key: "fromSchema",
			value: function fromSchema(schema) {}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				return new Any();
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {};
			}
			//**********************************************************************************

		}]);

		return AttributeCertificateV2;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var SignedData = function () {
		//**********************************************************************************
		/**
   * Constructor for SignedData class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function SignedData() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, SignedData);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", SignedData.defaultValues("version"));
			/**
    * @type {Array.<AlgorithmIdentifier>}
    * @description digestAlgorithms
    */
			this.digestAlgorithms = getParametersValue(parameters, "digestAlgorithms", SignedData.defaultValues("digestAlgorithms"));
			/**
    * @type {EncapsulatedContentInfo}
    * @description encapContentInfo
    */
			this.encapContentInfo = getParametersValue(parameters, "encapContentInfo", SignedData.defaultValues("encapContentInfo"));

			if ("certificates" in parameters)
				/**
     * @type {Array.<Certificate|OtherCertificateFormat>}
     * @description certificates
     */
				this.certificates = getParametersValue(parameters, "certificates", SignedData.defaultValues("certificates"));

			if ("crls" in parameters)
				/**
     * @type {Array.<CertificateRevocationList|OtherRevocationInfoFormat>}
     * @description crls
     */
				this.crls = getParametersValue(parameters, "crls", SignedData.defaultValues("crls"));

			/**
    * @type {Array.<SignerInfo>}
    * @description signerInfos
    */
			this.signerInfos = getParametersValue(parameters, "signerInfos", SignedData.defaultValues("signerInfos"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(SignedData, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, SignedData.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for SignedData");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result["SignedData.version"].valueBlock.valueDec;

				if ("SignedData.digestAlgorithms" in asn1.result) // Could be empty SET of digest algorithms
					this.digestAlgorithms = Array.from(asn1.result["SignedData.digestAlgorithms"], function (algorithm) {
						return new AlgorithmIdentifier({ schema: algorithm });
					});

				this.encapContentInfo = new EncapsulatedContentInfo({ schema: asn1.result["SignedData.encapContentInfo"] });

				if ("SignedData.certificates" in asn1.result) {
					this.certificates = Array.from(asn1.result["SignedData.certificates"], function (certificate) {
						switch (certificate.idBlock.tagClass) {
							case 1:
								return new Certificate({ schema: certificate });
							case 3:
								{
									switch (certificate.idBlock.tagNumber) {
										//region ExtendedCertificate
										case 0:
											break;
										//endregion
										//region AttributeCertificateV1
										case 1:
											return new AttributeCertificateV1({ schema: certificate });
										//endregion
										//region AttributeCertificateV2
										case 2:
											return new AttributeCertificateV2({ schema: certificate });
										//endregion
										//region OtherCertificateFormat
										case 3:
											{
												//region Create SEQUENCE from [3]
												certificate.idBlock.tagClass = 1; // UNIVERSAL
												certificate.idBlock.tagNumber = 16; // SEQUENCE
												//endregion

												return new OtherCertificateFormat({ schema: certificate });
											}
										//endregion
										//region default
										default:
											throw new Error("Object's schema was not verified against input data for SignedData");
										//endregion
									}
								}
								break;
							default:
								throw new Error("Object's schema was not verified against input data for SignedData");
						}

						return new Certificate();
					});
				}

				if ("SignedData.crls" in asn1.result) {
					this.crls = Array.from(asn1.result["SignedData.crls"], function (crl) {
						if (crl.idBlock.tagClass === 1) return new CertificateRevocationList({ schema: crl });

						//region Create SEQUENCE from [1]
						crl.idBlock.tagClass = 1; // UNIVERSAL
						crl.idBlock.tagNumber = 16; // SEQUENCE
						//endregion

						return new OtherRevocationInfoFormat({ schema: crl });
					});
				}

				if ("SignedData.signerInfos" in asn1.result) // Could be empty SET SignerInfos
					this.signerInfos = Array.from(asn1.result["SignedData.signerInfos"], function (signerInfoSchema) {
						return new SignerInfo({ schema: signerInfoSchema });
					});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				var encodeFlag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));

				//region Create array of digest algorithms
				outputArray.push(new Set({
					value: Array.from(this.digestAlgorithms, function (algorithm) {
						return algorithm.toSchema(encodeFlag);
					})
				}));
				//endregion

				outputArray.push(this.encapContentInfo.toSchema());

				if ("certificates" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: Array.from(this.certificates, function (certificate) {
							if (certificate instanceof OtherCertificateFormat) {
								var certificateSchema = certificate.toSchema(encodeFlag);

								certificateSchema.idBlock.tagClass = 3;
								certificateSchema.idBlock.tagNumber = 3;

								return certificateSchema;
							}

							return certificate.toSchema(encodeFlag);
						})
					}));
				}

				if ("crls" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: Array.from(this.crls, function (crl) {
							if (crl instanceof OtherRevocationInfoFormat) {
								var crlSchema = crl.toSchema(encodeFlag);

								crlSchema.idBlock.tagClass = 3;
								crlSchema.idBlock.tagNumber = 1;

								return crlSchema;
							}

							return crl.toSchema(encodeFlag);
						})
					}));
				}

				//region Create array of signer infos
				outputArray.push(new Set({
					value: Array.from(this.signerInfos, function (signerInfo) {
						return signerInfo.toSchema(encodeFlag);
					})
				}));
				//endregion
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					version: this.version,
					digestAlgorithms: Array.from(this.digestAlgorithms, function (algorithm) {
						return algorithm.toJSON();
					}),
					encapContentInfo: this.encapContentInfo.toJSON()
				};

				if ("certificates" in this) _object.certificates = Array.from(this.certificates, function (certificate) {
					return certificate.toJSON();
				});

				if ("crls" in this) _object.crls = Array.from(this.crls, function (crl) {
					return crl.toJSON();
				});

				_object.signerInfos = Array.from(this.signerInfos, function (signerInfo) {
					return signerInfo.toJSON();
				});

				return _object;
			}
			//**********************************************************************************
			/**
    * Verify current SignedData value
    * @param signer
    * @param data
    * @param trustedCerts
    * @param checkDate
    * @param checkChain
    * @param includeSignerCertificate
    * @param extendedMode
    * @returns {*}
    */

		}, {
			key: "verify",
			value: function verify() {
				var _this65 = this;

				var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				var _ref4$signer = _ref4.signer;
				var signer = _ref4$signer === undefined ? -1 : _ref4$signer;
				var _ref4$data = _ref4.data;
				var data = _ref4$data === undefined ? new ArrayBuffer(0) : _ref4$data;
				var _ref4$trustedCerts = _ref4.trustedCerts;
				var trustedCerts = _ref4$trustedCerts === undefined ? [] : _ref4$trustedCerts;
				var _ref4$checkDate = _ref4.checkDate;
				var checkDate = _ref4$checkDate === undefined ? new Date() : _ref4$checkDate;
				var _ref4$checkChain = _ref4.checkChain;
				var checkChain = _ref4$checkChain === undefined ? false : _ref4$checkChain;
				var _ref4$includeSignerCe = _ref4.includeSignerCertificate;
				var includeSignerCertificate = _ref4$includeSignerCe === undefined ? false : _ref4$includeSignerCe;
				var _ref4$extendedMode = _ref4.extendedMode;
				var extendedMode = _ref4$extendedMode === undefined ? false : _ref4$extendedMode;

				//region Global variables 
				var sequence = Promise.resolve();

				var messageDigestValue = new ArrayBuffer(0);

				var publicKey = void 0;

				var shaAlgorithm = "";

				var signerCertificate = {};

				var timestampSerial = null;
				//endregion

				//region Get a "crypto" extension 
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion 

				//region Get a signer number
				if (signer === -1) {
					if (extendedMode) {
						return Promise.reject({
							date: checkDate,
							code: 1,
							message: "Unable to get signer index from input parameters",
							signatureVerified: null,
							signerCertificate: null,
							signerCertificateVerified: null
						});
					}

					return Promise.reject("Unable to get signer index from input parameters");
				}
				//endregion 

				//region Check that certificates field was included in signed data 
				if ("certificates" in this === false) {
					if (extendedMode) {
						return Promise.reject({
							date: checkDate,
							code: 2,
							message: "No certificates attached to this signed data",
							signatureVerified: null,
							signerCertificate: null,
							signerCertificateVerified: null
						});
					}

					return Promise.reject("No certificates attached to this signed data");
				}
				//endregion 

				//region Find a certificate for specified signer 
				if (this.signerInfos[signer].sid instanceof IssuerAndSerialNumber) {
					sequence = sequence.then(function () {
						var _iteratorNormalCompletion29 = true;
						var _didIteratorError29 = false;
						var _iteratorError29 = undefined;

						try {
							for (var _iterator29 = _this65.certificates[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
								var certificate = _step29.value;

								if (certificate instanceof Certificate === false) continue;

								if (certificate.issuer.isEqual(_this65.signerInfos[signer].sid.issuer) && certificate.serialNumber.isEqual(_this65.signerInfos[signer].sid.serialNumber)) {
									signerCertificate = certificate;
									return Promise.resolve();
								}
							}
						} catch (err) {
							_didIteratorError29 = true;
							_iteratorError29 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion29 && _iterator29.return) {
									_iterator29.return();
								}
							} finally {
								if (_didIteratorError29) {
									throw _iteratorError29;
								}
							}
						}

						if (extendedMode) {
							return Promise.reject({
								date: checkDate,
								code: 3,
								message: "Unable to find signer certificate",
								signatureVerified: null,
								signerCertificate: null,
								signerCertificateVerified: null
							});
						}

						return Promise.reject("Unable to find signer certificate");
					});
				} else // Find by SubjectKeyIdentifier
					{
						sequence = sequence.then(function () {
							return Promise.all(Array.from(_this65.certificates.filter(function (certificate) {
								return certificate instanceof Certificate;
							}), function (certificate) {
								return crypto.digest({ name: "sha-1" }, new Uint8Array(certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
							})).then(function (results) {
								var _iteratorNormalCompletion30 = true;
								var _didIteratorError30 = false;
								var _iteratorError30 = undefined;

								try {
									for (var _iterator30 = _this65.certificates.entries()[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
										var _step30$value = _slicedToArray(_step30.value, 2);

										var index = _step30$value[0];
										var certificate = _step30$value[1];

										if (certificate instanceof Certificate === false) continue;

										if (isEqualBuffer(results[index], _this65.signerInfos[signer].sid.valueBlock.valueHex)) {
											signerCertificate = certificate;
											return Promise.resolve();
										}
									}
								} catch (err) {
									_didIteratorError30 = true;
									_iteratorError30 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion30 && _iterator30.return) {
											_iterator30.return();
										}
									} finally {
										if (_didIteratorError30) {
											throw _iteratorError30;
										}
									}
								}

								if (extendedMode) {
									return Promise.reject({
										date: checkDate,
										code: 3,
										message: "Unable to find signer certificate",
										signatureVerified: null,
										signerCertificate: null,
										signerCertificateVerified: null
									});
								}

								return Promise.reject("Unable to find signer certificate");
							}, function () {
								if (extendedMode) {
									return Promise.reject({
										date: checkDate,
										code: 3,
										message: "Unable to find signer certificate",
										signatureVerified: null,
										signerCertificate: null,
										signerCertificateVerified: null
									});
								}

								return Promise.reject("Unable to find signer certificate");
							});
						});
					}
				//endregion 

				//region Verify internal digest in case of "tSTInfo" content type 
				sequence = sequence.then(function () {
					if (_this65.encapContentInfo.eContentType === "1.2.840.113549.1.9.16.1.4") {
						//region Check "eContent" precense
						if ("eContent" in _this65.encapContentInfo === false) return false;
						//endregion

						//region Initialize TST_INFO value
						var asn1 = fromBER(_this65.encapContentInfo.eContent.valueBlock.valueHex);
						var tstInfo = void 0;

						try {
							tstInfo = new TSTInfo({ schema: asn1.result });
						} catch (ex) {
							return false;
						}
						//endregion

						//region Change "checkDate" and append "timestampSerial"
						checkDate = tstInfo.genTime;
						timestampSerial = tstInfo.serialNumber.valueBlock.valueHex;
						//endregion

						//region Check that we do have detached data content
						if (data.byteLength === 0) {
							if (extendedMode) {
								return Promise.reject({
									date: checkDate,
									code: 4,
									message: "Missed detached data input array",
									signatureVerified: null,
									signerCertificate: signerCertificate,
									signerCertificateVerified: null
								});
							}

							return Promise.reject("Missed detached data input array");
						}
						//endregion

						return tstInfo.verify({ data: data });
					}

					return true;
				});
				//endregion 

				//region Make additional verification for signer's certificate 
				function checkCA(cert) {
					/// <param name="cert" type="in_window.org.pkijs.simpl.CERT">Certificate to find CA flag for</param>

					//region Do not include signer's certificate 
					if (cert.issuer.isEqual(signerCertificate.issuer) === true && cert.serialNumber.isEqual(signerCertificate.serialNumber) === true) return null;
					//endregion 

					var isCA = false;

					var _iteratorNormalCompletion31 = true;
					var _didIteratorError31 = false;
					var _iteratorError31 = undefined;

					try {
						for (var _iterator31 = cert.extensions[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
							var extension = _step31.value;

							if (extension.extnID === "2.5.29.19") // BasicConstraints
								{
									if ("cA" in extension.parsedValue) {
										if (extension.parsedValue.cA === true) isCA = true;
									}
								}
						}
					} catch (err) {
						_didIteratorError31 = true;
						_iteratorError31 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion31 && _iterator31.return) {
								_iterator31.return();
							}
						} finally {
							if (_didIteratorError31) {
								throw _iteratorError31;
							}
						}
					}

					if (isCA) return cert;

					return null;
				}

				if (checkChain) {
					sequence = sequence.then(function (result) {
						//region Veify result of previous operation
						if (result === false) return false;
						//endregion

						return Promise.all(Array.from(_this65.certificates.filter(function (certificate) {
							return certificate instanceof Certificate;
						}), function (certificate) {
							return checkCA(certificate);
						})).then(function (promiseResults) {
							var _certificateChainEngi;

							var certificateChainEngine = new CertificateChainValidationEngine({
								checkDate: checkDate,
								certs: Array.from(promiseResults.filter(function (_result) {
									return _result !== null;
								})),
								trustedCerts: trustedCerts
							});

							certificateChainEngine.certs.push(signerCertificate);

							if ("crls" in _this65) {
								var _iteratorNormalCompletion32 = true;
								var _didIteratorError32 = false;
								var _iteratorError32 = undefined;

								try {
									for (var _iterator32 = _this65.crls[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
										var crl = _step32.value;

										if (crl instanceof CertificateRevocationList) certificateChainEngine.crls.push(crl);else // Assumed "revocation value" has "OtherRevocationInfoFormat"
											{
												if (crl.otherRevInfoFormat === "1.3.6.1.5.5.7.48.1.1") // Basic OCSP response
													certificateChainEngine.ocsps.push(new BasicOCSPResponse({ schema: crl.otherRevInfo }));
											}
									}
								} catch (err) {
									_didIteratorError32 = true;
									_iteratorError32 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion32 && _iterator32.return) {
											_iterator32.return();
										}
									} finally {
										if (_didIteratorError32) {
											throw _iteratorError32;
										}
									}
								}
							}

							if ("ocsps" in _this65) (_certificateChainEngi = certificateChainEngine.ocsps).push.apply(_certificateChainEngi, _toConsumableArray(_this65.ocsps));

							return certificateChainEngine.verify().then(function (verificationResult) {
								if (verificationResult.result === true) return Promise.resolve(true);

								if (extendedMode) {
									return Promise.reject({
										date: checkDate,
										code: 5,
										message: "Validation of signer's certificate failed",
										signatureVerified: null,
										signerCertificate: signerCertificate,
										signerCertificateVerified: false
									});
								}

								return Promise.reject("Validation of signer's certificate failed");
							}, function (error) {
								if (extendedMode) {
									return Promise.reject({
										date: checkDate,
										code: 5,
										message: "Validation of signer's certificate failed with error: " + (error instanceof Object ? error.resultMessage : error),
										signatureVerified: null,
										signerCertificate: signerCertificate,
										signerCertificateVerified: false
									});
								}

								return Promise.reject("Validation of signer's certificate failed with error: " + (error instanceof Object ? error.resultMessage : error));
							});
						}, function (promiseError) {
							if (extendedMode) {
								return Promise.reject({
									date: checkDate,
									code: 6,
									message: "Error during checking certificates for CA flag: " + promiseError,
									signatureVerified: null,
									signerCertificate: signerCertificate,
									signerCertificateVerified: null
								});
							}

							return Promise.reject("Error during checking certificates for CA flag: " + promiseError);
						});
					});
				}
				//endregion 

				//region Find signer's hashing algorithm 
				sequence = sequence.then(function (result) {
					//region Veify result of previous operation
					if (result === false) return false;
					//endregion

					var signerInfoHashAlgorithm = getAlgorithmByOID(_this65.signerInfos[signer].digestAlgorithm.algorithmId);
					if ("name" in signerInfoHashAlgorithm === false) {
						if (extendedMode) {
							return Promise.reject({
								date: checkDate,
								code: 7,
								message: "Unsupported signature algorithm: " + _this65.signerInfos[signer].digestAlgorithm.algorithmId,
								signatureVerified: null,
								signerCertificate: signerCertificate,
								signerCertificateVerified: true
							});
						}

						return Promise.reject("Unsupported signature algorithm: " + _this65.signerInfos[signer].digestAlgorithm.algorithmId);
					}

					shaAlgorithm = signerInfoHashAlgorithm.name;

					return true;
				});
				//endregion 

				//region Create correct data block for verification 
				sequence = sequence.then(function (result) {
					//region Veify result of previous operation
					if (result === false) return false;
					//endregion

					if ("eContent" in _this65.encapContentInfo) // Attached data
						{
							if (_this65.encapContentInfo.eContent.idBlock.tagClass === 1 && _this65.encapContentInfo.eContent.idBlock.tagNumber === 4) {
								if (_this65.encapContentInfo.eContent.idBlock.isConstructed === false) data = _this65.encapContentInfo.eContent.valueBlock.valueHex;else {
									var _iteratorNormalCompletion33 = true;
									var _didIteratorError33 = false;
									var _iteratorError33 = undefined;

									try {
										for (var _iterator33 = _this65.encapContentInfo.eContent.valueBlock.value[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
											var contentValue = _step33.value;

											data = utilConcatBuf(data, contentValue.valueBlock.valueHex);
										}
									} catch (err) {
										_didIteratorError33 = true;
										_iteratorError33 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion33 && _iterator33.return) {
												_iterator33.return();
											}
										} finally {
											if (_didIteratorError33) {
												throw _iteratorError33;
											}
										}
									}
								}
							} else data = _this65.encapContentInfo.eContent.valueBlock.valueHex;
						} else // Detached data
						{
							if (data.byteLength === 0) // Check that "data" already provided by function parameter
								{
									if (extendedMode) {
										return Promise.reject({
											date: checkDate,
											code: 8,
											message: "Missed detached data input array",
											signatureVerified: null,
											signerCertificate: signerCertificate,
											signerCertificateVerified: true
										});
									}

									return Promise.reject("Missed detached data input array");
								}
						}

					if ("signedAttrs" in _this65.signerInfos[signer]) {
						//region Check mandatory attributes
						var foundContentType = false;
						var foundMessageDigest = false;

						var _iteratorNormalCompletion34 = true;
						var _didIteratorError34 = false;
						var _iteratorError34 = undefined;

						try {
							for (var _iterator34 = _this65.signerInfos[signer].signedAttrs.attributes[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
								var attribute = _step34.value;

								//region Check that "content-type" attribute exists
								if (attribute.type === "1.2.840.113549.1.9.3") foundContentType = true;
								//endregion

								//region Check that "message-digest" attribute exists
								if (attribute.type === "1.2.840.113549.1.9.4") {
									foundMessageDigest = true;
									messageDigestValue = attribute.values[0].valueBlock.valueHex;
								}
								//endregion

								//region Speed-up searching
								if (foundContentType && foundMessageDigest) break;
								//endregion
							}
						} catch (err) {
							_didIteratorError34 = true;
							_iteratorError34 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion34 && _iterator34.return) {
									_iterator34.return();
								}
							} finally {
								if (_didIteratorError34) {
									throw _iteratorError34;
								}
							}
						}

						if (foundContentType === false) {
							if (extendedMode) {
								return Promise.reject({
									date: checkDate,
									code: 9,
									message: "Attribute \"content-type\" is a mandatory attribute for \"signed attributes\"",
									signatureVerified: null,
									signerCertificate: signerCertificate,
									signerCertificateVerified: true
								});
							}

							return Promise.reject("Attribute \"content-type\" is a mandatory attribute for \"signed attributes\"");
						}

						if (foundMessageDigest === false) {
							if (extendedMode) {
								return Promise.reject({
									date: checkDate,
									code: 10,
									message: "Attribute \"message-digest\" is a mandatory attribute for \"signed attributes\"",
									signatureVerified: null,
									signerCertificate: signerCertificate,
									signerCertificateVerified: true
								});
							}

							return Promise.reject("Attribute \"message-digest\" is a mandatory attribute for \"signed attributes\"");
						}
						//endregion
					}

					return true;
				});
				//endregion 

				//region Import public key from signer's certificate 
				sequence = sequence.then(function (result) {
					//region Veify result of previous operation
					if (result === false) return false;
					//endregion

					//region Get information about public key algorithm and default parameters for import
					var algorithmId = void 0;
					if (signerCertificate.signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10") algorithmId = signerCertificate.signatureAlgorithm.algorithmId;else algorithmId = signerCertificate.subjectPublicKeyInfo.algorithm.algorithmId;

					var algorithmObject = getAlgorithmByOID(algorithmId);
					if ("name" in algorithmObject === false) {
						if (extendedMode) {
							return Promise.reject({
								date: checkDate,
								code: 11,
								message: "Unsupported public key algorithm: " + algorithmId,
								signatureVerified: null,
								signerCertificate: signerCertificate,
								signerCertificateVerified: true
							});
						}

						return Promise.reject("Unsupported public key algorithm: " + algorithmId);
					}

					var algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;

					//region Special case for ECDSA
					if (algorithmObject.name === "ECDSA") {
						//region Get information about named curve
						var algorithmParamsChecked = false;

						if ("algorithmParams" in signerCertificate.subjectPublicKeyInfo.algorithm === true) {
							if ("idBlock" in signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams) {
								if (signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1 && signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6) algorithmParamsChecked = true;
							}
						}

						if (algorithmParamsChecked === false) return Promise.reject("Incorrect type for ECDSA public key parameters");

						var curveObject = getAlgorithmByOID(signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						if ("name" in curveObject === false) return Promise.reject("Unsupported named curve algorithm: " + signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						//endregion

						algorithm.algorithm.namedCurve = curveObject.name;
					}
					//endregion
					//endregion

					var publicKeyInfoSchema = signerCertificate.subjectPublicKeyInfo.toSchema();
					var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
					var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

					return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
				});
				//endregion 

				//region Verify signer's signature 
				sequence = sequence.then(function (result) {
					// #region Veify result of previous operation
					if (typeof result === "boolean") return false;
					// #endregion

					publicKey = result;

					// #region Verify "message-digest" attribute in case of "signedAttrs"
					if ("signedAttrs" in _this65.signerInfos[signer]) return crypto.digest(shaAlgorithm, new Uint8Array(data));

					return true;
					// #endregion
				}).then(function (result) {
					// #region Verify result of previous operation
					if (result === false) return false;
					// #endregion

					if ("signedAttrs" in _this65.signerInfos[signer]) {
						if (isEqualBuffer(result, messageDigestValue)) {
							data = _this65.signerInfos[signer].signedAttrs.encodedValue;
							return true;
						}

						return false;
					}

					return true;
				}).then(function (result) {
					//region Check result of previous operation
					if (result === false) return false;
					//endregion

					//region Get default algorithm parameters for verification
					var algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					//region Special case for RSA-PSS
					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: _this65.signerInfos[signer].signatureAlgorithm.algorithmParams });
						} catch (ex) {
							if (extendedMode) {
								return Promise.reject({
									date: checkDate,
									code: 12,
									message: ex,
									signatureVerified: null,
									signerCertificate: signerCertificate,
									signerCertificateVerified: true
								});
							}

							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashName = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) {
								if (extendedMode) {
									return Promise.reject({
										date: checkDate,
										code: 13,
										message: "Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId,
										signatureVerified: null,
										signerCertificate: signerCertificate,
										signerCertificateVerified: true
									});
								}

								return Promise.reject("Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId);
							}

							hashName = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashName;
					}
					//endregion

					//region Special case for ECDSA signatures
					var signatureValue = _this65.signerInfos[signer].signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);
						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}
					//endregion

					return crypto.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), new Uint8Array(data));
				});
				//endregion 

				//region Make a final result 
				sequence = sequence.then(function (result) {
					if (extendedMode) {
						return {
							date: checkDate,
							code: 14,
							message: "",
							signatureVerified: result,
							signerCertificate: signerCertificate,
							timestampSerial: timestampSerial,
							signerCertificateVerified: true
						};
					}

					return result;
				}, function (error) {
					if (extendedMode) {
						if ("code" in error) return Promise.reject(error);

						return Promise.reject({
							date: checkDate,
							code: 15,
							message: "Error during verification: " + error.message,
							signatureVerified: null,
							signerCertificate: signerCertificate,
							signerCertificateVerified: true
						});
					}

					return Promise.reject(error);
				});
				//endregion 

				return sequence;
			}
			//**********************************************************************************
			/**
    * Signing current SignedData
    * @param {key} privateKey Private key for "subjectPublicKeyInfo" structure
    * @param {number} signerIndex Index number (starting from 0) of signer index to make signature for
    * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
    * @param {ArrayBuffer} [data] Detached data
    * @returns {*}
    */

		}, {
			key: "sign",
			value: function sign(privateKey, signerIndex, hashAlgorithm, data) {
				var _this66 = this;

				//region Initial variables
				data = data || new ArrayBuffer(0);
				var hashAlgorithmOID = "";
				//endregion

				//region Get a private key from function parameter
				if (typeof privateKey === "undefined") return Promise.reject("Need to provide a private key for signing");
				//endregion

				//region Get hashing algorithm
				if (typeof hashAlgorithm === "undefined") hashAlgorithm = "SHA-1";

				//region Simple check for supported algorithm
				hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
				if (hashAlgorithmOID === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);
				//endregion
				//endregion

				//region Append information about hash algorithm
				if (this.digestAlgorithms.filter(function (algorithm) {
					return algorithm.algorithmId === hashAlgorithmOID;
				}).length === 0) {
					this.digestAlgorithms.push(new AlgorithmIdentifier({
						algorithmId: hashAlgorithmOID,
						algorithmParams: new Null()
					}));
				}

				this.signerInfos[signerIndex].digestAlgorithm = new AlgorithmIdentifier({
					algorithmId: hashAlgorithmOID,
					algorithmParams: new Null()
				});
				//endregion

				//region Get a "default parameters" for current algorithm
				var defParams = getAlgorithmParameters(privateKey.algorithm.name, "sign");
				defParams.algorithm.hash.name = hashAlgorithm;
				//endregion

				//region Fill internal structures base on "privateKey" and "hashAlgorithm"
				switch (privateKey.algorithm.name.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
					case "ECDSA":
						this.signerInfos[signerIndex].signatureAlgorithm.algorithmId = getOIDByAlgorithm(defParams.algorithm);
						break;
					case "RSA-PSS":
						{
							//region Set "saltLength" as a length (in octets) of hash function result
							switch (hashAlgorithm.toUpperCase()) {
								case "SHA-256":
									defParams.algorithm.saltLength = 32;
									break;
								case "SHA-384":
									defParams.algorithm.saltLength = 48;
									break;
								case "SHA-512":
									defParams.algorithm.saltLength = 64;
									break;
								default:
							}
							//endregion

							//region Fill "RSASSA_PSS_params" object
							var paramsObject = {};

							if (hashAlgorithm.toUpperCase() !== "SHA-1") {
								hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
								if (hashAlgorithmOID === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);

								paramsObject.hashAlgorithm = new AlgorithmIdentifier({
									algorithmId: hashAlgorithmOID,
									algorithmParams: new Null()
								});

								paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
									algorithmId: "1.2.840.113549.1.1.8", // MGF1
									algorithmParams: paramsObject.hashAlgorithm.toSchema()
								});
							}

							if (defParams.algorithm.saltLength !== 20) paramsObject.saltLength = defParams.algorithm.saltLength;

							var pssParameters = new RSASSAPSSParams(paramsObject);
							//endregion

							//region Automatically set signature algorithm
							this.signerInfos[signerIndex].signatureAlgorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.10",
								algorithmParams: pssParameters.toSchema()
							});
							//endregion
						}
						break;
					default:
						return Promise.reject("Unsupported signature algorithm: " + privateKey.algorithm.name);
				}
				//endregion

				//region Create TBS data for signing
				if ("signedAttrs" in this.signerInfos[signerIndex]) {
					if (this.signerInfos[signerIndex].signedAttrs.encodedValue.byteLength !== 0) data = this.signerInfos[signerIndex].signedAttrs.encodedValue;else {
						data = this.signerInfos[signerIndex].signedAttrs.toSchema(true).toBER(false);

						//region Change type from "[0]" to "SET" acordingly to standard
						var view = new Uint8Array(data);
						view[0] = 0x31;
						//endregion
					}
				} else {
					if ("eContent" in this.encapContentInfo) // Attached data
						{
							if (this.encapContentInfo.eContent.idBlock.tagClass === 1 && this.encapContentInfo.eContent.idBlock.tagNumber === 4) {
								if (this.encapContentInfo.eContent.idBlock.isConstructed === false) data = this.encapContentInfo.eContent.valueBlock.valueHex;else {
									var _iteratorNormalCompletion35 = true;
									var _didIteratorError35 = false;
									var _iteratorError35 = undefined;

									try {
										for (var _iterator35 = this.encapContentInfo.eContent.valueBlock.value[Symbol.iterator](), _step35; !(_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done); _iteratorNormalCompletion35 = true) {
											var content = _step35.value;

											data = utilConcatBuf(data, content.valueBlock.valueHex);
										}
									} catch (err) {
										_didIteratorError35 = true;
										_iteratorError35 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion35 && _iterator35.return) {
												_iterator35.return();
											}
										} finally {
											if (_didIteratorError35) {
												throw _iteratorError35;
											}
										}
									}
								}
							} else data = this.encapContentInfo.eContent.valueBlock.valueHex;
						} else // Detached data
						{
							if (data.byteLength === 0) // Check that "data" already provided by function parameter
								return Promise.reject("Missed detached data input array");
						}
				}
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Signing TBS data on provided private key
				return crypto.sign(defParams.algorithm, privateKey, new Uint8Array(data)).then(function (result) {
					//region Special case for ECDSA algorithm
					if (defParams.algorithm.name === "ECDSA") result = createCMSECDSASignature(result);
					//endregion

					_this66.signerInfos[signerIndex].signature = new OctetString({ valueHex: result });

					return result;
				}, function (error) {
					return Promise.reject("Signing error: " + error);
				});
				//endregion
			}
			//**********************************************************************************
			//region Basic Building Blocks for Verification Engine
			//**********************************************************************************

		}, {
			key: "formatChecking",
			value: function formatChecking(_ref5) {
				var _ref5$strictChecking = _ref5.strictChecking;
				var strictChecking = _ref5$strictChecking === undefined ? false : _ref5$strictChecking;

				//region Initial variables
				var hasCertificates = "certificates" in this;
				var hasOtherCertificates = false;
				var hasAttributeCertificateV1 = false;
				var hasAttributeCertificateV2 = false;

				if (hasCertificates) {
					var _iteratorNormalCompletion36 = true;
					var _didIteratorError36 = false;
					var _iteratorError36 = undefined;

					try {
						for (var _iterator36 = this.certificates[Symbol.iterator](), _step36; !(_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done); _iteratorNormalCompletion36 = true) {
							var certificate = _step36.value;

							if ("otherCertFormat" in certificate) hasOtherCertificates = true;

							if ("holder" in certificate) hasAttributeCertificateV2 = true;

							if ("acinfo" in certificate) hasAttributeCertificateV1 = true;
						}
					} catch (err) {
						_didIteratorError36 = true;
						_iteratorError36 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion36 && _iterator36.return) {
								_iterator36.return();
							}
						} finally {
							if (_didIteratorError36) {
								throw _iteratorError36;
							}
						}
					}
				}

				var hasCrls = "crls" in this;
				var hasOtherCrls = false;

				if (hasCrls) {
					var _iteratorNormalCompletion37 = true;
					var _didIteratorError37 = false;
					var _iteratorError37 = undefined;

					try {
						for (var _iterator37 = this.crls[Symbol.iterator](), _step37; !(_iteratorNormalCompletion37 = (_step37 = _iterator37.next()).done); _iteratorNormalCompletion37 = true) {
							var crl = _step37.value;

							if ("otherRevInfoFormat" in crl) {
								hasOtherCrls = true;
								break;
							}
						}
					} catch (err) {
						_didIteratorError37 = true;
						_iteratorError37 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion37 && _iterator37.return) {
								_iterator37.return();
							}
						} finally {
							if (_didIteratorError37) {
								throw _iteratorError37;
							}
						}
					}
				}

				var hasSignerInfoV3 = false;

				var _iteratorNormalCompletion38 = true;
				var _didIteratorError38 = false;
				var _iteratorError38 = undefined;

				try {
					for (var _iterator38 = this.signerInfos[Symbol.iterator](), _step38; !(_iteratorNormalCompletion38 = (_step38 = _iterator38.next()).done); _iteratorNormalCompletion38 = true) {
						var signerInfo = _step38.value;

						if (signerInfo.version === 3) {
							hasSignerInfoV3 = true;
							break;
						}
					}
					//endregion
				} catch (err) {
					_didIteratorError38 = true;
					_iteratorError38 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion38 && _iterator38.return) {
							_iterator38.return();
						}
					} finally {
						if (_didIteratorError38) {
							throw _iteratorError38;
						}
					}
				}

				if (strictChecking) {
					//region Check "version"
					if (hasCertificates && hasOtherCertificates || hasCrls && hasOtherCrls) {
						if (this.version !== 5) {
							return {
								indication: FAILED,
								message: "Version value for SignedData must be 5"
							};
						}
					} else {
						if (hasCertificates && hasAttributeCertificateV2) {
							if (this.version !== 4) {
								return {
									indication: FAILED,
									message: "Version value for SignedData must be 4"
								};
							}
						} else {
							if (hasCertificates && hasAttributeCertificateV1 || hasSignerInfoV3 || this.encapContentInfo.eContentType !== "1.2.840.113549.1.7.1") {
								if (this.version !== 3) {
									return {
										indication: FAILED,
										message: "Version value for SignedData must be 3"
									};
								}
							} else {
								if (this.version !== 1) {
									return {
										indication: FAILED,
										message: "Version value for SignedData must be 1"
									};
								}
							}
						}
					}
					//endregion
				}

				//region Check all SignerInfos
				var _iteratorNormalCompletion39 = true;
				var _didIteratorError39 = false;
				var _iteratorError39 = undefined;

				try {
					for (var _iterator39 = this.signerInfos.entries()[Symbol.iterator](), _step39; !(_iteratorNormalCompletion39 = (_step39 = _iterator39.next()).done); _iteratorNormalCompletion39 = true) {
						var _step39$value = _slicedToArray(_step39.value, 2);

						var index = _step39$value[0];
						var _signerInfo = _step39$value[1];

						var _formatCheckingResult3 = _signerInfo.formatChecking();
						if (_formatCheckingResult3.indication !== PASSED) {
							return {
								indication: FAILED,
								message: "SignerInfo with index " + index + " did not pass format checking: " + _formatCheckingResult3.message
							};
						}
					}
					//endregion

					//region Perform format checking for all certificates
				} catch (err) {
					_didIteratorError39 = true;
					_iteratorError39 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion39 && _iterator39.return) {
							_iterator39.return();
						}
					} finally {
						if (_didIteratorError39) {
							throw _iteratorError39;
						}
					}
				}

				if (hasCertificates) {
					var _iteratorNormalCompletion40 = true;
					var _didIteratorError40 = false;
					var _iteratorError40 = undefined;

					try {
						for (var _iterator40 = this.certificates.entries()[Symbol.iterator](), _step40; !(_iteratorNormalCompletion40 = (_step40 = _iterator40.next()).done); _iteratorNormalCompletion40 = true) {
							var _step40$value = _slicedToArray(_step40.value, 2);

							var index = _step40$value[0];
							var _certificate = _step40$value[1];

							var formatCheckingResult = _certificate.formatChecking();
							if (formatCheckingResult.indication !== PASSED) {
								return {
									indication: FAILED,
									message: "Certificate with index " + index + " did not pass format checking"
								};
							}
						}
					} catch (err) {
						_didIteratorError40 = true;
						_iteratorError40 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion40 && _iterator40.return) {
								_iterator40.return();
							}
						} finally {
							if (_didIteratorError40) {
								throw _iteratorError40;
							}
						}
					}
				}
				//endregion

				//region Perform format checking for all CRLs
				if (hasCrls) {
					var _iteratorNormalCompletion41 = true;
					var _didIteratorError41 = false;
					var _iteratorError41 = undefined;

					try {
						for (var _iterator41 = this.crls.entries()[Symbol.iterator](), _step41; !(_iteratorNormalCompletion41 = (_step41 = _iterator41.next()).done); _iteratorNormalCompletion41 = true) {
							var _step41$value = _slicedToArray(_step41.value, 2);

							var index = _step41$value[0];
							var _crl = _step41$value[1];

							var _formatCheckingResult2 = _crl.formatChecking();
							if (_formatCheckingResult2.indication !== PASSED) {
								return {
									indication: FAILED,
									message: "CRL with index " + index + " did not pass format checking"
								};
							}
						}
					} catch (err) {
						_didIteratorError41 = true;
						_iteratorError41 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion41 && _iterator41.return) {
								_iterator41.return();
							}
						} finally {
							if (_didIteratorError41) {
								throw _iteratorError41;
							}
						}
					}
				}
				//endregion

				//region Check all algoruthms in digestAlgorithms
				var algorithmsCheckResult = checkOids$1(Array.from(this.digestAlgorithms, function (element) {
					return element.algorithmId;
				}));
				if (algorithmsCheckResult.indication !== PASSED) {
					return {
						indication: FAILED,
						message: "Incorrect OID in digestAlgorithms: " + this.digestAlgorithms[algorithmsCheckResult.message].algorithmId
					};
				}
				//endregion

				return {
					indication: PASSED
				};
			}
			//**********************************************************************************

		}, {
			key: "identificationOfSigningCertificate",
			value: function identificationOfSigningCertificate(_ref6) {
				var _this67 = this;

				var _ref6$signer = _ref6.signer;
				var signer = _ref6$signer === undefined ? 0 : _ref6$signer;
				var _ref6$signingCertific = _ref6.signingCertificate;
				var signingCertificate = _ref6$signingCertific === undefined ? null : _ref6$signingCertific;

				//region In case we have existing signing certificate
				if (signingCertificate !== null) {
					return Promise.resolve({
						indication: PASSED,
						message: signingCertificate
					});
				}
				//endregion

				//region Check that we do have where to searcъh for certificate
				if ("certificates" in this === false) return Promise.reject("No certificates attached to this signed data");
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Initial variables
				var sequence = Promise.resolve();
				//endregion

				if (this.signerInfos[signer].sid instanceof IssuerAndSerialNumber) {
					sequence = sequence.then(function () {
						var _iteratorNormalCompletion42 = true;
						var _didIteratorError42 = false;
						var _iteratorError42 = undefined;

						try {
							for (var _iterator42 = _this67.certificates[Symbol.iterator](), _step42; !(_iteratorNormalCompletion42 = (_step42 = _iterator42.next()).done); _iteratorNormalCompletion42 = true) {
								var certificate = _step42.value;

								if (certificate instanceof Certificate === false) continue;

								if (certificate.issuer.isEqual(_this67.signerInfos[signer].sid.issuer) && certificate.serialNumber.isEqual(_this67.signerInfos[signer].sid.serialNumber)) {
									return Promise.resolve({
										indication: PASSED,
										message: certificate
									});
								}
							}
						} catch (err) {
							_didIteratorError42 = true;
							_iteratorError42 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion42 && _iterator42.return) {
									_iterator42.return();
								}
							} finally {
								if (_didIteratorError42) {
									throw _iteratorError42;
								}
							}
						}

						return Promise.reject("Unable to find signer certificate");
					});
				} else // Find by SubjectKeyIdentifier
					{
						sequence = sequence.then(function () {
							return Promise.all(Array.from(_this67.certificates.filter(function (certificate) {
								return certificate instanceof Certificate;
							}), function (certificate) {
								return crypto.digest({ name: "sha-1" }, new Uint8Array(certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
							})).then(function (results) {
								var _iteratorNormalCompletion43 = true;
								var _didIteratorError43 = false;
								var _iteratorError43 = undefined;

								try {
									for (var _iterator43 = _this67.certificates.entries()[Symbol.iterator](), _step43; !(_iteratorNormalCompletion43 = (_step43 = _iterator43.next()).done); _iteratorNormalCompletion43 = true) {
										var _step43$value = _slicedToArray(_step43.value, 2);

										var index = _step43$value[0];
										var certificate = _step43$value[1];

										if (certificate instanceof Certificate === false) continue;

										if (isEqualBuffer(results[index], _this67.signerInfos[signer].sid.valueBlock.valueHex)) {
											return Promise.resolve({
												indication: PASSED,
												message: certificate
											});
										}
									}
								} catch (err) {
									_didIteratorError43 = true;
									_iteratorError43 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion43 && _iterator43.return) {
											_iterator43.return();
										}
									} finally {
										if (_didIteratorError43) {
											throw _iteratorError43;
										}
									}
								}

								return Promise.reject("Unable to find signer certificate");
							});
						});
					}

				//region Error handling stub
				sequence = sequence.then(function (result) {
					return result;
				}, function (error) {
					return Promise.resolve({
						indication: INDETERMINATE,
						subIndication: NO_SIGNING_CERTIFICATE_FOUND,
						message: "Error during process \"SignedData.identificationOfSigningCertificate\": " + error
					});
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************

		}, {
			key: "revocationFreshnessChecker",
			value: function revocationFreshnessChecker() {}
			//**********************************************************************************

		}, {
			key: "cryptographicVerification",
			value: function cryptographicVerification(_ref7) {
				var _this68 = this;

				var _ref7$signer = _ref7.signer;
				var signer = _ref7$signer === undefined ? 0 : _ref7$signer;
				var signingCertificate = _ref7.signingCertificate;
				var _ref7$signedData = _ref7.signedData;
				var signedData = _ref7$signedData === undefined ? null : _ref7$signedData;

				//region Initial variables
				var sequence = Promise.resolve();
				var data = new ArrayBuffer(0);
				var publicKey = void 0;
				var shaAlgorithm = void 0;

				if (signedData !== null) data = signedData;
				//endregion

				//region Create correct data block for verification
				//region Attached data
				if ("eContent" in this.encapContentInfo) {
					if (this.encapContentInfo.eContent.idBlock.tagClass === 1 && this.encapContentInfo.eContent.idBlock.tagNumber === 4) {
						if (this.encapContentInfo.eContent.idBlock.isConstructed === false) data = this.encapContentInfo.eContent.valueBlock.valueHex;else {
							var _iteratorNormalCompletion44 = true;
							var _didIteratorError44 = false;
							var _iteratorError44 = undefined;

							try {
								for (var _iterator44 = this.encapContentInfo.eContent.valueBlock.value[Symbol.iterator](), _step44; !(_iteratorNormalCompletion44 = (_step44 = _iterator44.next()).done); _iteratorNormalCompletion44 = true) {
									var contentValue = _step44.value;

									data = utilConcatBuf(data, contentValue.valueBlock.valueHex);
								}
							} catch (err) {
								_didIteratorError44 = true;
								_iteratorError44 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion44 && _iterator44.return) {
										_iterator44.return();
									}
								} finally {
									if (_didIteratorError44) {
										throw _iteratorError44;
									}
								}
							}
						}
					} else data = this.encapContentInfo.eContent.valueBlock.valueHex;
				}
				//endregion
				//region Detached data
				else {
						if (data.byteLength === 0) {
							return Promise.resolve({
								indication: INDETERMINATE,
								subIndication: SIGNED_DATA_NOT_FOUND,
								message: "Missed detached data input array"
							});
						}
					}
				//endregion
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") {
					return Promise.resolve({
						indication: FAILED,
						subIndication: SIG_CRYPTO_FAILURE,
						message: "Unable to create WebCrypto object"
					});
				}
				//endregion

				//region Find signer's hashing algorithm
				sequence = sequence.then(function () {
					var signerInfoHashAlgorithm = getAlgorithmByOID(_this68.signerInfos[signer].digestAlgorithm.algorithmId);
					if ("name" in signerInfoHashAlgorithm === false) {
						return Promise.resolve({
							indication: FAILED,
							subIndication: SIG_CRYPTO_FAILURE,
							message: "Unsupported signature algorithm: " + _this68.signerInfos[signer].digestAlgorithm.algorithmId
						});
					}

					shaAlgorithm = signerInfoHashAlgorithm.name;

					return true;
				});
				//endregion

				//region Import public key from signer's certificate
				sequence = sequence.then(function () {
					//region Get information about public key algorithm and default parameters for import
					var algorithmId = void 0;
					if (signingCertificate.signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10") algorithmId = signingCertificate.signatureAlgorithm.algorithmId;else algorithmId = signingCertificate.subjectPublicKeyInfo.algorithm.algorithmId;

					var algorithmObject = getAlgorithmByOID(algorithmId);
					if ("name" in algorithmObject === false) {
						return Promise.resolve({
							indication: FAILED,
							subIndication: SIG_CRYPTO_FAILURE,
							message: "Unsupported public key algorithm: " + algorithmId
						});
					}

					var algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;

					//region Special case for ECDSA
					if (algorithmObject.name === "ECDSA") {
						//region Get information about named curve
						if (signingCertificate.subjectPublicKeyInfo.algorithm.algorithmParams instanceof ObjectIdentifier === false) {
							return Promise.resolve({
								indication: FAILED,
								subIndication: SIG_CRYPTO_FAILURE,
								message: "Incorrect type for ECDSA public key parameters"
							});
						}

						var curveObject = getAlgorithmByOID(signingCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						if ("name" in curveObject === false) {
							return Promise.resolve({
								indication: FAILED,
								subIndication: SIG_CRYPTO_FAILURE,
								message: "Unsupported named curve algorithm: " + signingCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString()
							});
						}
						//endregion

						algorithm.algorithm.namedCurve = curveObject.name;
					}
					//endregion
					//endregion

					var publicKeyInfoSchema = signingCertificate.subjectPublicKeyInfo.toSchema();
					var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
					var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

					return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
				});
				//endregion

				//region Verify signer's signature
				sequence = sequence.then(function (result) {
					publicKey = result;

					// #region Verify "message-digest" attribute in case of "signedAttrs"
					if ("signedAttrs" in _this68.signerInfos[signer]) return crypto.digest(shaAlgorithm, new Uint8Array(data));

					return true;
					// #endregion
				}).then(function (result) {
					// #region Verify result of previous operation
					if (result === false) return false;
					// #endregion

					if ("signedAttrs" in _this68.signerInfos[signer]) {
						//region Initial variables
						var messageDigestValue = null;
						//endregion

						//region Find correct message digest value in attributes
						var _iteratorNormalCompletion45 = true;
						var _didIteratorError45 = false;
						var _iteratorError45 = undefined;

						try {
							for (var _iterator45 = _this68.signerInfos[signer].signedAttrs.attributes[Symbol.iterator](), _step45; !(_iteratorNormalCompletion45 = (_step45 = _iterator45.next()).done); _iteratorNormalCompletion45 = true) {
								var attribute = _step45.value;

								//region Check that "message-digest" attribute exists
								if (attribute.type === "1.2.840.113549.1.9.4") // We SHOULD have such attribute becase check for existing was made during "FormatChecking" step
									{
										messageDigestValue = attribute.values[0].valueBlock.valueHex;
										break;
									}
								//endregion
							}
						} catch (err) {
							_didIteratorError45 = true;
							_iteratorError45 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion45 && _iterator45.return) {
									_iterator45.return();
								}
							} finally {
								if (_didIteratorError45) {
									throw _iteratorError45;
								}
							}
						}

						if (messageDigestValue === null) return Promise.reject("Please run 'FormatChecking' step first");
						//endregion

						if (isEqualBuffer(result, messageDigestValue)) {
							data = _this68.signerInfos[signer].signedAttrs.encodedValue;
							return true;
						}

						return false;
					}

					return true;
				}).then(function (result) {
					//region Check result of previous operation
					if (result === false) return false;
					//endregion

					//region Get default algorithm parameters for verification
					var algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					//region Special case for RSA-PSS
					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: _this68.signerInfos[signer].signatureAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashName = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) return Promise.reject("Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId);

							hashName = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashName;
					}
					//endregion

					//region Special case for ECDSA signatures
					var signatureValue = _this68.signerInfos[signer].signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);
						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}
					//endregion

					return crypto.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), new Uint8Array(data));
				});
				//endregion

				//region Error handling stub
				sequence = sequence.then(function (result) {
					if (result) {
						return {
							indication: PASSED
						};
					}

					return {
						indication: FAILED,
						subIndication: SIG_CRYPTO_FAILURE,
						message: "Signature was not verified"
					};
				}, function (error) {
					return Promise.resolve({
						indication: FAILED,
						subIndication: SIG_CRYPTO_FAILURE,
						message: "Error during process \"SignedData.cryptographicVerification\": " + error
					});
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************

		}, {
			key: "signatureAcceptanceValidation",
			value: function signatureAcceptanceValidation() {}
			//**********************************************************************************

		}, {
			key: "getRevocationInformation",
			value: function getRevocationInformation() {
				var _this69 = this;

				//region Initial variables
				var sequence = Promise.resolve();

				var result = {
					crls: [],
					ocsps: []
				};
				//endregion

				//region Get information about all CRLs and OCSPs for particular SignedData
				sequence = sequence.then(function () {
					if ("crls" in _this69) {
						var _iteratorNormalCompletion46 = true;
						var _didIteratorError46 = false;
						var _iteratorError46 = undefined;

						try {
							for (var _iterator46 = _this69.crls[Symbol.iterator](), _step46; !(_iteratorNormalCompletion46 = (_step46 = _iterator46.next()).done); _iteratorNormalCompletion46 = true) {
								var crl = _step46.value;

								if (crl instanceof CertificateRevocationList) result.crls.push(crl);else // Assumed "revocation value" has "OtherRevocationInfoFormat"
									{
										if (crl.otherRevInfoFormat === "1.3.6.1.5.5.7.48.1.1") // Basic OCSP response
											result.ocsps.push(new BasicOCSPResponse({ schema: crl.otherRevInfo }));
									}
							}
						} catch (err) {
							_didIteratorError46 = true;
							_iteratorError46 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion46 && _iterator46.return) {
									_iterator46.return();
								}
							} finally {
								if (_didIteratorError46) {
									throw _iteratorError46;
								}
							}
						}
					}

					return result;
				});
				//endregion

				return sequence;
			}
			//**********************************************************************************
			//endregion
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "digestAlgorithms":
						return [];
					case "encapContentInfo":
						return new EncapsulatedContentInfo();
					case "certificates":
						return [];
					case "crls":
						return [];
					case "signerInfos":
						return [];
					default:
						throw new Error("Invalid member name for SignedData class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return memberValue === SignedData.defaultValues("version");
					case "encapContentInfo":
						return new EncapsulatedContentInfo();
					case "digestAlgorithms":
					case "certificates":
					case "crls":
					case "signerInfos":
						return memberValue.length === 0;
					default:
						throw new Error("Invalid member name for SignedData class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//SignedData ::= SEQUENCE {
				//    version CMSVersion,
				//    digestAlgorithms DigestAlgorithmIdentifiers,
				//    encapContentInfo EncapsulatedContentInfo,
				//    certificates [0] IMPLICIT CertificateSet OPTIONAL,
				//    crls [1] IMPLICIT RevocationInfoChoices OPTIONAL,
				//    signerInfos SignerInfos }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [optional]
     * @property {string} [digestAlgorithms]
     * @property {string} [encapContentInfo]
     * @property {string} [certificates]
     * @property {string} [crls]
     * @property {string} [signerInfos]
     */
				var names = getParametersValue(parameters, "names", {});

				if ("optional" in names === false) names.optional = false;

				return new Sequence({
					name: names.blockName || "SignedData",
					optional: names.optional,
					value: [new Integer({ name: names.version || "SignedData.version" }), new Set({
						value: [new Repeated({
							name: names.digestAlgorithms || "SignedData.digestAlgorithms",
							value: AlgorithmIdentifier.schema()
						})]
					}), EncapsulatedContentInfo.schema(names.encapContentInfo || {
						names: {
							blockName: "SignedData.encapContentInfo"
						}
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: CertificateSet.schema(names.certificates || {
							names: {
								certificates: "SignedData.certificates"
							}
						}).valueBlock.value
					}), // IMPLICIT CertificateSet
					new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: RevocationInfoChoices.schema(names.crls || {
							names: {
								crls: "SignedData.crls"
							}
						}).valueBlock.value
					}), // IMPLICIT RevocationInfoChoices
					new Set({
						value: [new Repeated({
							name: names.signerInfos || "SignedData.signerInfos",
							value: SignerInfo.schema()
						})]
					})]
				});
			}
		}]);

		return SignedData;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var ContentInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for ContentInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ContentInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ContentInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description contentType
    */
			this.contentType = getParametersValue(parameters, "contentType", ContentInfo.defaultValues("contentType"));
			/**
    * @type {Any}
    * @description content
    */
			this.content = getParametersValue(parameters, "content", ContentInfo.defaultValues("content"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ContentInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, ContentInfo.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CMS_CONTENT_INFO");
				//endregion

				//region Get internal properties from parsed schema
				this.contentType = asn1.result.contentType.valueBlock.toString();
				this.content = asn1.result.content;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.contentType }), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.content] // EXPLICIT ANY value
					})]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					contentType: this.contentType
				};

				if (!(this.content instanceof Any)) object.content = this.content.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "contentType":
						return "";
					case "content":
						return new Any();
					default:
						throw new Error("Invalid member name for ContentInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "contentType":
						return memberValue === "";
					case "content":
						return memberValue instanceof Any;
					default:
						throw new Error("Invalid member name for ContentInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//ContentInfo ::= SEQUENCE {
				//    contentType ContentType,
				//    content [0] EXPLICIT ANY DEFINED BY contentType }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [contentType]
     * @property {string} [content]
     */
				var names = getParametersValue(parameters, "names", {});

				if ("optional" in names === false) names.optional = false;

				return new Sequence({
					name: names.blockName || "ContentInfo",
					optional: names.optional,
					value: [new ObjectIdentifier({ name: names.contentType || "contentType" }), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Any({ name: names.content || "content" })] // EXPLICIT ANY value
					})]
				});
			}
		}]);

		return ContentInfo;
	}();
	//**************************************************************************************

	//*********************************************************************************


	var trustedCertificates = []; // Array of root certificates from "CA Bundle"
	//*********************************************************************************
	//region Parse "CA Bundle" file
	//*********************************************************************************
	function parseCAbundle(buffer) {
		// #region Initial variables
		var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

		var startChars = "-----BEGIN CERTIFICATE-----";
		var endChars = "-----END CERTIFICATE-----";
		var endLineChars = "\r\n";

		var view = new Uint8Array(buffer);

		var waitForStart = false;
		var middleStage = true;
		var waitForEnd = false;
		var waitForEndLine = false;
		var started = false;

		var certBodyEncoded = "";
		// #endregion

		for (var i = 0; i < view.length; i++) {
			if (started === true) {
				if (base64Chars.indexOf(String.fromCharCode(view[i])) !== -1) certBodyEncoded = certBodyEncoded + String.fromCharCode(view[i]);else {
					if (String.fromCharCode(view[i]) === "-") {
						// #region Decoded trustedCertificates
						var asn1 = fromBER(stringToArrayBuffer(window.atob(certBodyEncoded)));
						try {
							trustedCertificates.push(new Certificate({ schema: asn1.result }));
						} catch (ex) {
							alert("Wrong certificate format");
							return;
						}
						// #endregion

						// #region Set all "flag variables"
						certBodyEncoded = "";

						started = false;
						waitForEnd = true;
						// #endregion
					}
				}
			} else {
				if (waitForEndLine === true) {
					if (endLineChars.indexOf(String.fromCharCode(view[i])) === -1) {
						waitForEndLine = false;

						if (waitForEnd === true) {
							waitForEnd = false;
							middleStage = true;
						} else {
							if (waitForStart === true) {
								waitForStart = false;
								started = true;

								certBodyEncoded = certBodyEncoded + String.fromCharCode(view[i]);
							} else middleStage = true;
						}
					}
				} else {
					if (middleStage === true) {
						if (String.fromCharCode(view[i]) === "-") {
							if (i === 0 || String.fromCharCode(view[i - 1]) === "\r" || String.fromCharCode(view[i - 1]) === "\n") {
								middleStage = false;
								waitForStart = true;
							}
						}
					} else {
						if (waitForStart === true) {
							if (startChars.indexOf(String.fromCharCode(view[i])) === -1) waitForEndLine = true;
						} else {
							if (waitForEnd === true) {
								if (endChars.indexOf(String.fromCharCode(view[i])) === -1) waitForEndLine = true;
							}
						}
					}
				}
			}
		}
	}
	//*********************************************************************************
	//endregion
	//*********************************************************************************
	//region Verify SMIME signature
	//*********************************************************************************
	function verifySMIME() {
		//region Parse MIME contents to find signature and detached data
		var parser = new MimeParser();
		parser.write(document.getElementById("smime_message").value);
		parser.end();
		//endregion

		if ("_childNodes" in parser.node || parser.node._childNodes.length !== 2) {
			var lastNode = parser.getNode("2");
			if (lastNode.contentType.value === "application/x-pkcs7-signature" || lastNode.contentType.value === "application/pkcs7-signature") {
				var _ret = function () {
					// Get signature buffer
					var signedBuffer = utilConcatBuf(new ArrayBuffer(0), lastNode.content);

					// Parse into pkijs types
					var asn1 = fromBER(signedBuffer);
					if (asn1.offset === -1) {
						alert("Incorrect message format!");
						return {
							v: void 0
						};
					}

					var cmsContentSimpl = void 0;
					var cmsSignedSimpl = void 0;

					try {
						cmsContentSimpl = new ContentInfo({ schema: asn1.result });
						cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
					} catch (ex) {
						alert("Incorrect message format!");
						return {
							v: void 0
						};
					}

					// Get signed data buffer
					var signedDataBuffer = stringToArrayBuffer(parser.nodes.node1.raw.replace(/\n/g, "\r\n"));

					// Verify the signed data
					var sequence = Promise.resolve();
					sequence = sequence.then(function () {
						return cmsSignedSimpl.verify({ signer: 0, data: signedDataBuffer, trustedCerts: trustedCertificates });
					});

					sequence.then(function (result) {
						var failed = false;
						if (typeof result !== "undefined") {
							if (result === false) failed = true;
						}

						alert("S/MIME message " + (failed ? "verification failed" : "successfully verified") + "!");
					}, function (error) {
						return alert("Error during verification: " + error);
					});
				}();

				if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
			}
		} else alert("No child nodes!");
	}
	//*********************************************************************************
	//endregion 
	//*********************************************************************************
	//region Functions handling file selection
	//*********************************************************************************
	function handleMIMEFile(evt) {
		var tempReader = new FileReader();

		var currentFiles = evt.target.files;

		tempReader.onload = function (event) {
			return document.getElementById("smime_message").value = String.fromCharCode.apply(null, new Uint8Array(event.target.result));
		};

		tempReader.readAsArrayBuffer(currentFiles[0]);
	}
	//*********************************************************************************
	function handleCABundle(evt) {
		var tempReader = new FileReader();

		var currentFiles = evt.target.files;

		tempReader.onload = function (event) {
			return parseCAbundle(event.target.result);
		};

		tempReader.readAsArrayBuffer(currentFiles[0]);
	}
	//*********************************************************************************
	//endregion
	//*********************************************************************************
	context("Hack for Rollup.js", function () {
		return;

		verifySMIME();
		handleMIMEFile();
		handleCABundle();
		setEngine();
	});
	//*********************************************************************************

	window.verifySMIME = verifySMIME;
	window.handleMIMEFile = handleMIMEFile;
	window.handleCABundle = handleCABundle;

	function context(name, func) {}
})();
