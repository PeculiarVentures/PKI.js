//**************************************************************************************
//**************************************************************************************
// noinspection FunctionWithMultipleReturnPointsJS
/**
 * Get value for input parameters, or set a default value
 * @param {Object} parameters
 * @param {string} name
 * @param defaultValue
 */
function getParametersValue(parameters, name, defaultValue)
{
	// noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS
	if((parameters instanceof Object) === false)
		return defaultValue;
	
	// noinspection NonBlockStatementBodyJS
	if(name in parameters)
		return parameters[name];
	
	return defaultValue;
}
//**************************************************************************************
/**
 * Converts "ArrayBuffer" into a hexdecimal string
 * @param {ArrayBuffer} inputBuffer
 * @param {number} [inputOffset=0]
 * @param {number} [inputLength=inputBuffer.byteLength]
 * @param {boolean} [insertSpace=false]
 * @returns {string}
 */
function bufferToHexCodes(inputBuffer, inputOffset = 0, inputLength = (inputBuffer.byteLength - inputOffset), insertSpace = false)
{
	let result = "";
	
	for(const item of (new Uint8Array(inputBuffer, inputOffset, inputLength)))
	{
		// noinspection ChainedFunctionCallJS
		const str = item.toString(16).toUpperCase();
		
		// noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS
		if(str.length === 1)
			result += "0";
		
		result += str;
		
		// noinspection NonBlockStatementBodyJS
		if(insertSpace)
			result += " ";
	}
	
	return result.trim();
}
//**************************************************************************************
// noinspection JSValidateJSDoc, FunctionWithMultipleReturnPointsJS
/**
 * Check input "ArrayBuffer" for common functions
 * @param {LocalBaseBlock} baseBlock
 * @param {ArrayBuffer} inputBuffer
 * @param {number} inputOffset
 * @param {number} inputLength
 * @returns {boolean}
 */
function checkBufferParams(baseBlock, inputBuffer, inputOffset, inputLength)
{
	// noinspection ConstantOnRightSideOfComparisonJS
	if((inputBuffer instanceof ArrayBuffer) === false)
	{
		// noinspection JSUndefinedPropertyAssignment
		baseBlock.error = "Wrong parameter: inputBuffer must be \"ArrayBuffer\"";
		return false;
	}
	
	// noinspection ConstantOnRightSideOfComparisonJS
	if(inputBuffer.byteLength === 0)
	{
		// noinspection JSUndefinedPropertyAssignment
		baseBlock.error = "Wrong parameter: inputBuffer has zero length";
		return false;
	}
	
	// noinspection ConstantOnRightSideOfComparisonJS
	if(inputOffset < 0)
	{
		// noinspection JSUndefinedPropertyAssignment
		baseBlock.error = "Wrong parameter: inputOffset less than zero";
		return false;
	}
	
	// noinspection ConstantOnRightSideOfComparisonJS
	if(inputLength < 0)
	{
		// noinspection JSUndefinedPropertyAssignment
		baseBlock.error = "Wrong parameter: inputLength less than zero";
		return false;
	}
	
	// noinspection ConstantOnRightSideOfComparisonJS
	if((inputBuffer.byteLength - inputOffset - inputLength) < 0)
	{
		// noinspection JSUndefinedPropertyAssignment
		baseBlock.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
		return false;
	}
	
	return true;
}
//**************************************************************************************
// noinspection FunctionWithMultipleReturnPointsJS
/**
 * Convert number from 2^base to 2^10
 * @param {Uint8Array} inputBuffer
 * @param {number} inputBase
 * @returns {number}
 */
function utilFromBase(inputBuffer, inputBase)
{
	let result = 0;
	
	// noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS
	if(inputBuffer.length === 1)
		return inputBuffer[0];
	
	// noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS
	for(let i = (inputBuffer.length - 1); i >= 0; i--)
		result += inputBuffer[(inputBuffer.length - 1) - i] * Math.pow(2, inputBase * i);
	
	return result;
}
//**************************************************************************************
// noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS
/**
 * Convert number from 2^10 to 2^base
 * @param {!number} value The number to convert
 * @param {!number} base The base for 2^base
 * @param {number} [reserved=0] Pre-defined number of bytes in output array (-1 = limited by function itself)
 * @returns {ArrayBuffer}
 */
function utilToBase(value, base, reserved = (-1))
{
	const internalReserved = reserved;
	let internalValue = value;
	
	let result = 0;
	let biggest = Math.pow(2, base);
	
	// noinspection ConstantOnRightSideOfComparisonJS
	for(let i = 1; i < 8; i++)
	{
		if(value < biggest)
		{
			let retBuf;
			
			// noinspection ConstantOnRightSideOfComparisonJS
			if(internalReserved < 0)
			{
				retBuf = new ArrayBuffer(i);
				result = i;
			}
			else
			{
				// noinspection NonBlockStatementBodyJS
				if(internalReserved < i)
					return (new ArrayBuffer(0));
				
				retBuf = new ArrayBuffer(internalReserved);
				
				result = internalReserved;
			}
			
			const retView = new Uint8Array(retBuf);
			
			// noinspection ConstantOnRightSideOfComparisonJS
			for(let j = (i - 1); j >= 0; j--)
			{
				const basis = Math.pow(2, j * base);
				
				retView[result - j - 1] = Math.floor(internalValue / basis);
				internalValue -= (retView[result - j - 1]) * basis;
			}
			
			return retBuf;
		}
		
		biggest *= Math.pow(2, base);
	}
	
	return new ArrayBuffer(0);
}
//**************************************************************************************
// noinspection FunctionWithMultipleLoopsJS
/**
 * Concatenate two ArrayBuffers
 * @param {...ArrayBuffer} buffers Set of ArrayBuffer
 */
function utilConcatBuf(...buffers)
{
	//region Initial variables
	let outputLength = 0;
	let prevLength = 0;
	//endregion
	
	//region Calculate output length
	
	// noinspection NonBlockStatementBodyJS
	for(const buffer of buffers)
		outputLength += buffer.byteLength;
	//endregion
	
	const retBuf = new ArrayBuffer(outputLength);
	const retView = new Uint8Array(retBuf);
	
	for(const buffer of buffers)
	{
		// noinspection NestedFunctionCallJS
		retView.set(new Uint8Array(buffer), prevLength);
		prevLength += buffer.byteLength;
	}
	
	return retBuf;
}
//**************************************************************************************
// noinspection FunctionWithMultipleLoopsJS
/**
 * Concatenate two Uint8Array
 * @param {...Uint8Array} views Set of Uint8Array
 */
function utilConcatView(...views)
{
	//region Initial variables
	let outputLength = 0;
	let prevLength = 0;
	//endregion
	
	//region Calculate output length
	// noinspection NonBlockStatementBodyJS
	for(const view of views)
		outputLength += view.length;
	//endregion
	
	const retBuf = new ArrayBuffer(outputLength);
	const retView = new Uint8Array(retBuf);
	
	for(const view of views)
	{
		retView.set(view, prevLength);
		prevLength += view.length;
	}
	
	return retView;
}
//**************************************************************************************
// noinspection FunctionWithMultipleLoopsJS
/**
 * Decoding of "two complement" values
 * The function must be called in scope of instance of "hexBlock" class ("valueHex" and "warnings" properties must be present)
 * @returns {number}
 */
function utilDecodeTC()
{
	const buf = new Uint8Array(this.valueHex);
	
	// noinspection ConstantOnRightSideOfComparisonJS
	if(this.valueHex.byteLength >= 2)
	{
		//noinspection JSBitwiseOperatorUsage, ConstantOnRightSideOfComparisonJS, LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS
		const condition1 = (buf[0] === 0xFF) && (buf[1] & 0x80);
		// noinspection ConstantOnRightSideOfComparisonJS, LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS
		const condition2 = (buf[0] === 0x00) && ((buf[1] & 0x80) === 0x00);
		
		// noinspection NonBlockStatementBodyJS
		if(condition1 || condition2)
			this.warnings.push("Needlessly long format");
	}
	
	//region Create big part of the integer
	const bigIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
	const bigIntView = new Uint8Array(bigIntBuffer);
	// noinspection NonBlockStatementBodyJS
	for(let i = 0; i < this.valueHex.byteLength; i++)
		bigIntView[i] = 0;
	
	// noinspection MagicNumberJS, NonShortCircuitBooleanExpressionJS
	bigIntView[0] = (buf[0] & 0x80); // mask only the biggest bit
	
	const bigInt = utilFromBase(bigIntView, 8);
	//endregion
	
	//region Create small part of the integer
	const smallIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
	const smallIntView = new Uint8Array(smallIntBuffer);
	// noinspection NonBlockStatementBodyJS
	for(let j = 0; j < this.valueHex.byteLength; j++)
		smallIntView[j] = buf[j];
	
	// noinspection MagicNumberJS
	smallIntView[0] &= 0x7F; // mask biggest bit
	
	const smallInt = utilFromBase(smallIntView, 8);
	//endregion
	
	return (smallInt - bigInt);
}
//**************************************************************************************
// noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS
/**
 * Encode integer value to "two complement" format
 * @param {number} value Value to encode
 * @returns {ArrayBuffer}
 */
function utilEncodeTC(value)
{
	// noinspection ConstantOnRightSideOfComparisonJS, ConditionalExpressionJS
	const modValue = (value < 0) ? (value * (-1)) : value;
	let bigInt = 128;
	
	// noinspection ConstantOnRightSideOfComparisonJS
	for(let i = 1; i < 8; i++)
	{
		if(modValue <= bigInt)
		{
			// noinspection ConstantOnRightSideOfComparisonJS
			if(value < 0)
			{
				const smallInt = bigInt - modValue;
				
				const retBuf = utilToBase(smallInt, 8, i);
				const retView = new Uint8Array(retBuf);
				
				// noinspection MagicNumberJS
				retView[0] |= 0x80;
				
				return retBuf;
			}
			
			let retBuf = utilToBase(modValue, 8, i);
			let retView = new Uint8Array(retBuf);
			
			//noinspection JSBitwiseOperatorUsage, MagicNumberJS, NonShortCircuitBooleanExpressionJS
			if(retView[0] & 0x80)
			{
				//noinspection JSCheckFunctionSignatures
				const tempBuf = retBuf.slice(0);
				const tempView = new Uint8Array(tempBuf);
				
				retBuf = new ArrayBuffer(retBuf.byteLength + 1);
				// noinspection ReuseOfLocalVariableJS
				retView = new Uint8Array(retBuf);
				
				// noinspection NonBlockStatementBodyJS
				for(let k = 0; k < tempBuf.byteLength; k++)
					retView[k + 1] = tempView[k];
				
				// noinspection MagicNumberJS
				retView[0] = 0x00;
			}
			
			return retBuf;
		}
		
		bigInt *= Math.pow(2, 8);
	}
	
	return (new ArrayBuffer(0));
}
//**************************************************************************************
// noinspection FunctionWithMultipleReturnPointsJS, ParameterNamingConventionJS
/**
 * Compare two array buffers
 * @param {!ArrayBuffer} inputBuffer1
 * @param {!ArrayBuffer} inputBuffer2
 * @returns {boolean}
 */
function isEqualBuffer(inputBuffer1, inputBuffer2)
{
	// noinspection NonBlockStatementBodyJS
	if(inputBuffer1.byteLength !== inputBuffer2.byteLength)
		return false;
	
	// noinspection LocalVariableNamingConventionJS
	const view1 = new Uint8Array(inputBuffer1);
	// noinspection LocalVariableNamingConventionJS
	const view2 = new Uint8Array(inputBuffer2);
	
	for(let i = 0; i < view1.length; i++)
	{
		// noinspection NonBlockStatementBodyJS
		if(view1[i] !== view2[i])
			return false;
	}
	
	return true;
}
//**************************************************************************************
// noinspection FunctionWithMultipleReturnPointsJS
/**
 * Pad input number with leade "0" if needed
 * @returns {string}
 * @param {number} inputNumber
 * @param {number} fullLength
 */
function padNumber(inputNumber, fullLength)
{
	const str = inputNumber.toString(10);
	
	// noinspection NonBlockStatementBodyJS
	if(fullLength < str.length)
		return "";
	
	const dif = fullLength - str.length;
	
	const padding = new Array(dif);
	// noinspection NonBlockStatementBodyJS
	for(let i = 0; i < dif; i++)
		padding[i] = "0";
	
	const paddingString = padding.join("");
	
	return paddingString.concat(str);
}
//**************************************************************************************
const base64Template = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const base64UrlTemplate = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
//**************************************************************************************
// noinspection FunctionWithMultipleLoopsJS, OverlyComplexFunctionJS, FunctionTooLongJS, FunctionNamingConventionJS
/**
 * Encode string into BASE64 (or "base64url")
 * @param {string} input
 * @param {boolean} useUrlTemplate If "true" then output would be encoded using "base64url"
 * @param {boolean} skipPadding Skip BASE-64 padding or not
 * @param {boolean} skipLeadingZeros Skip leading zeros in input data or not
 * @returns {string}
 */
function toBase64(input, useUrlTemplate = false, skipPadding = false, skipLeadingZeros = false)
{
	let i = 0;
	
	// noinspection LocalVariableNamingConventionJS
	let flag1 = 0;
	// noinspection LocalVariableNamingConventionJS
	let flag2 = 0;
	
	let output = "";
	
	// noinspection ConditionalExpressionJS
	const template = (useUrlTemplate) ? base64UrlTemplate : base64Template;
	
	if(skipLeadingZeros)
	{
		let nonZeroPosition = 0;
		
		for(let i = 0; i < input.length; i++)
		{
			// noinspection ConstantOnRightSideOfComparisonJS
			if(input.charCodeAt(i) !== 0)
			{
				nonZeroPosition = i;
				// noinspection BreakStatementJS
				break;
			}
		}
		
		// noinspection AssignmentToFunctionParameterJS
		input = input.slice(nonZeroPosition);
	}
	
	while(i < input.length)
	{
		// noinspection LocalVariableNamingConventionJS, IncrementDecrementResultUsedJS
		const chr1 = input.charCodeAt(i++);
		// noinspection NonBlockStatementBodyJS
		if(i >= input.length)
			flag1 = 1;
		// noinspection LocalVariableNamingConventionJS, IncrementDecrementResultUsedJS
		const chr2 = input.charCodeAt(i++);
		// noinspection NonBlockStatementBodyJS
		if(i >= input.length)
			flag2 = 1;
		// noinspection LocalVariableNamingConventionJS, IncrementDecrementResultUsedJS
		const chr3 = input.charCodeAt(i++);
		
		// noinspection LocalVariableNamingConventionJS
		const enc1 = chr1 >> 2;
		// noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS
		const enc2 = ((chr1 & 0x03) << 4) | (chr2 >> 4);
		// noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS
		let enc3 = ((chr2 & 0x0F) << 2) | (chr3 >> 6);
		// noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS
		let enc4 = chr3 & 0x3F;
		
		// noinspection ConstantOnRightSideOfComparisonJS
		if(flag1 === 1)
		{
			// noinspection NestedAssignmentJS, AssignmentResultUsedJS, MagicNumberJS
			enc3 = enc4 = 64;
		}
		else
		{
			// noinspection ConstantOnRightSideOfComparisonJS
			if(flag2 === 1)
			{
				// noinspection MagicNumberJS
				enc4 = 64;
			}
		}
		
		// noinspection NonBlockStatementBodyJS
		if(skipPadding)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS, MagicNumberJS
			if(enc3 === 64)
				output += `${template.charAt(enc1)}${template.charAt(enc2)}`;
			else
			{
				// noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS, MagicNumberJS
				if(enc4 === 64)
					output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}`;
				else
					output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}${template.charAt(enc4)}`;
			}
		}
		else
			output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}${template.charAt(enc4)}`;
	}
	
	return output;
}
//**************************************************************************************
// noinspection FunctionWithMoreThanThreeNegationsJS, FunctionWithMultipleLoopsJS, OverlyComplexFunctionJS, FunctionNamingConventionJS
/**
 * Decode string from BASE64 (or "base64url")
 * @param {string} input
 * @param {boolean} [useUrlTemplate=false] If "true" then output would be encoded using "base64url"
 * @param {boolean} [cutTailZeros=false] If "true" then cut tailing zeroz from function result
 * @returns {string}
 */
function fromBase64(input, useUrlTemplate = false, cutTailZeros = false)
{
	// noinspection ConditionalExpressionJS
	const template = (useUrlTemplate) ? base64UrlTemplate : base64Template;
	
	//region Aux functions
	// noinspection FunctionWithMultipleReturnPointsJS, NestedFunctionJS
	function indexof(toSearch)
	{
		// noinspection ConstantOnRightSideOfComparisonJS, MagicNumberJS
		for(let i = 0; i < 64; i++)
		{
			// noinspection NonBlockStatementBodyJS
			if(template.charAt(i) === toSearch)
				return i;
		}
		
		// noinspection MagicNumberJS
		return 64;
	}
	
	// noinspection NestedFunctionJS
	function test(incoming)
	{
		// noinspection ConstantOnRightSideOfComparisonJS, ConditionalExpressionJS, MagicNumberJS
		return ((incoming === 64) ? 0x00 : incoming);
	}
	//endregion
	
	let i = 0;
	
	let output = "";
	
	while(i < input.length)
	{
		// noinspection NestedFunctionCallJS, LocalVariableNamingConventionJS, IncrementDecrementResultUsedJS
		const enc1 = indexof(input.charAt(i++));
		// noinspection NestedFunctionCallJS, LocalVariableNamingConventionJS, ConditionalExpressionJS, MagicNumberJS, IncrementDecrementResultUsedJS
		const enc2 = (i >= input.length) ? 0x00 : indexof(input.charAt(i++));
		// noinspection NestedFunctionCallJS, LocalVariableNamingConventionJS, ConditionalExpressionJS, MagicNumberJS, IncrementDecrementResultUsedJS
		const enc3 = (i >= input.length) ? 0x00 : indexof(input.charAt(i++));
		// noinspection NestedFunctionCallJS, LocalVariableNamingConventionJS, ConditionalExpressionJS, MagicNumberJS, IncrementDecrementResultUsedJS
		const enc4 = (i >= input.length) ? 0x00 : indexof(input.charAt(i++));
		
		// noinspection LocalVariableNamingConventionJS, NonShortCircuitBooleanExpressionJS
		const chr1 = (test(enc1) << 2) | (test(enc2) >> 4);
		// noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS
		const chr2 = ((test(enc2) & 0x0F) << 4) | (test(enc3) >> 2);
		// noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS
		const chr3 = ((test(enc3) & 0x03) << 6) | test(enc4);
		
		output += String.fromCharCode(chr1);
		
		// noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS, MagicNumberJS
		if(enc3 !== 64)
			output += String.fromCharCode(chr2);
		
		// noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS, MagicNumberJS
		if(enc4 !== 64)
			output += String.fromCharCode(chr3);
	}
	
	if(cutTailZeros)
	{
		const outputLength = output.length;
		let nonZeroStart = (-1);
		
		// noinspection ConstantOnRightSideOfComparisonJS
		for(let i = (outputLength - 1); i >= 0; i--)
		{
			// noinspection ConstantOnRightSideOfComparisonJS
			if(output.charCodeAt(i) !== 0)
			{
				nonZeroStart = i;
				// noinspection BreakStatementJS
				break;
			}
		}
		
		// noinspection NonBlockStatementBodyJS, NegatedIfStatementJS
		if(nonZeroStart !== (-1))
			output = output.slice(0, nonZeroStart + 1);
		else
			output = "";
	}
	
	return output;
}
//**************************************************************************************
function arrayBufferToString(buffer)
{
	let resultString = "";
	const view = new Uint8Array(buffer);
	
	// noinspection NonBlockStatementBodyJS
	for(const element of view)
		resultString += String.fromCharCode(element);
	
	return resultString;
}
//**************************************************************************************
function stringToArrayBuffer(str)
{
	const stringLength = str.length;
	
	const resultBuffer = new ArrayBuffer(stringLength);
	const resultView = new Uint8Array(resultBuffer);
	
	// noinspection NonBlockStatementBodyJS
	for(let i = 0; i < stringLength; i++)
		resultView[i] = str.charCodeAt(i);
	
	return resultBuffer;
}
//**************************************************************************************
const log2 = Math.log(2);
//**************************************************************************************
// noinspection FunctionNamingConventionJS
/**
 * Get nearest to input length power of 2
 * @param {number} length Current length of existing array
 * @returns {number}
 */
function nearestPowerOf2(length)
{
	const base = (Math.log(length) / log2);
	
	const floor = Math.floor(base);
	const round = Math.round(base);
	
	// noinspection ConditionalExpressionJS
	return ((floor === round) ? floor : round);
}
//**************************************************************************************
/**
 * Delete properties by name from specified object
 * @param {Object} object Object to delete properties from
 * @param {Array.<string>} propsArray Array of properties names
 */
function clearProps(object, propsArray)
{
	for(const prop of propsArray)
		delete object[prop];
}
//**************************************************************************************

/* eslint-disable indent */
//**************************************************************************************
//region Declaration of global variables
//**************************************************************************************
const powers2 = [new Uint8Array([1])];
const digitsString = "0123456789";
//**************************************************************************************
//endregion
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
class LocalBaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalBaseBlock" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueBeforeDecode]
	 */
	constructor(parameters = {})
	{
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
		if("valueBeforeDecode" in parameters)
			this.valueBeforeDecode = parameters.valueBeforeDecode.slice(0);
		else
			this.valueBeforeDecode = new ArrayBuffer(0);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "baseBlock";
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
	 */
	toJSON()
	{
		return {
			blockName: this.constructor.blockName(),
			blockLength: this.blockLength,
			error: this.error,
			warnings: this.warnings,
			valueBeforeDecode: bufferToHexCodes(this.valueBeforeDecode, 0, this.valueBeforeDecode.byteLength)
		};
	}
	//**********************************************************************************
}
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
const LocalHexBlock = BaseClass => class LocalHexBlockMixin extends BaseClass
{
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Constructor for "LocalHexBlock" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueHex]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		/**
		 * @type {boolean}
		 */
		this.isHexOnly = getParametersValue(parameters, "isHexOnly", false);
		/**
		 * @type {ArrayBuffer}
		 */
		if("valueHex" in parameters)
			this.valueHex = parameters.valueHex.slice(0);
		else
			this.valueHex = new ArrayBuffer(0);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "hexBlock";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		//region Basic check for parameters
		//noinspection JSCheckFunctionSignatures
		if(checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false)
			return (-1);
		//endregion

		//region Getting Uint8Array from ArrayBuffer
		const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
		//endregion

		//region Initial checks
		if(intBuffer.length === 0)
		{
			this.warnings.push("Zero buffer length");
			return inputOffset;
		}
		//endregion

		//region Copy input buffer to internal buffer
		this.valueHex = inputBuffer.slice(inputOffset, inputOffset + inputLength);
		//endregion

		this.blockLength = inputLength;

		return (inputOffset + inputLength);
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		if(this.isHexOnly !== true)
		{
			this.error = "Flag \"isHexOnly\" is not set, abort";
			return new ArrayBuffer(0);
		}

		if(sizeOnly === true)
			return new ArrayBuffer(this.valueHex.byteLength);

		//noinspection JSCheckFunctionSignatures
		return this.valueHex.slice(0);
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.blockName = this.constructor.blockName();
		object.isHexOnly = this.isHexOnly;
		object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

		return object;
	}
	//**********************************************************************************
};
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of identification block class
//**************************************************************************************
class LocalIdentificationBlock extends LocalHexBlock(LocalBaseBlock)
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalBaseBlock" class
	 * @param {Object} [parameters={}]
	 * @property {Object} [idBlock]
	 */
	constructor(parameters = {})
	{
		super();

		if("idBlock" in parameters)
		{
			//region Properties from hexBlock class
			this.isHexOnly = getParametersValue(parameters.idBlock, "isHexOnly", false);
			this.valueHex = getParametersValue(parameters.idBlock, "valueHex", new ArrayBuffer(0));
			//endregion

			this.tagClass = getParametersValue(parameters.idBlock, "tagClass", (-1));
			this.tagNumber = getParametersValue(parameters.idBlock, "tagNumber", (-1));
			this.isConstructed = getParametersValue(parameters.idBlock, "isConstructed", false);
		}
		else
		{
			this.tagClass = (-1);
			this.tagNumber = (-1);
			this.isConstructed = false;
		}
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "identificationBlock";
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		//region Initial variables
		let firstOctet = 0;
		let retBuf;
		let retView;
		//endregion

		switch(this.tagClass)
		{
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
				return (new ArrayBuffer(0));
		}

		if(this.isConstructed)
			firstOctet |= 0x20;

		if((this.tagNumber < 31) && (!this.isHexOnly))
		{
			retBuf = new ArrayBuffer(1);
			retView = new Uint8Array(retBuf);

			if(!sizeOnly)
			{
				let number = this.tagNumber;
				number &= 0x1F;
				firstOctet |= number;

				retView[0] = firstOctet;
			}

			return retBuf;
		}

		if(this.isHexOnly === false)
		{
			const encodedBuf = utilToBase(this.tagNumber, 7);
			const encodedView = new Uint8Array(encodedBuf);
			const size = encodedBuf.byteLength;

			retBuf = new ArrayBuffer(size + 1);
			retView = new Uint8Array(retBuf);
			retView[0] = (firstOctet | 0x1F);

			if(!sizeOnly)
			{
				for(let i = 0; i < (size - 1); i++)
					retView[i + 1] = encodedView[i] | 0x80;

				retView[size] = encodedView[size - 1];
			}

			return retBuf;
		}

		retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
		retView = new Uint8Array(retBuf);

		retView[0] = (firstOctet | 0x1F);

		if(sizeOnly === false)
		{
			const curView = new Uint8Array(this.valueHex);

			for(let i = 0; i < (curView.length - 1); i++)
				retView[i + 1] = curView[i] | 0x80;

			retView[this.valueHex.byteLength] = curView[curView.length - 1];
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
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		//region Basic check for parameters
		//noinspection JSCheckFunctionSignatures
		if(checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false)
			return (-1);
		//endregion

		//region Getting Uint8Array from ArrayBuffer
		const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
		//endregion

		//region Initial checks
		if(intBuffer.length === 0)
		{
			this.error = "Zero buffer length";
			return (-1);
		}
		//endregion

		//region Find tag class
		const tagClassMask = intBuffer[0] & 0xC0;

		switch(tagClassMask)
		{
			case 0x00:
				this.tagClass = (1); // UNIVERSAL
				break;
			case 0x40:
				this.tagClass = (2); // APPLICATION
				break;
			case 0x80:
				this.tagClass = (3); // CONTEXT-SPECIFIC
				break;
			case 0xC0:
				this.tagClass = (4); // PRIVATE
				break;
			default:
				this.error = "Unknown tag class";
				return (-1);
		}
		//endregion

		//region Find it's constructed or not
		this.isConstructed = (intBuffer[0] & 0x20) === 0x20;
		//endregion

		//region Find tag number
		this.isHexOnly = false;

		const tagNumberMask = intBuffer[0] & 0x1F;

		//region Simple case (tag number < 31)
		if(tagNumberMask !== 0x1F)
		{
			this.tagNumber = (tagNumberMask);
			this.blockLength = 1;
		}
		//endregion
		//region Tag number bigger or equal to 31
		else
		{
			let count = 1;

			this.valueHex = new ArrayBuffer(255);
			let tagNumberBufferMaxLength = 255;
			let intTagNumberBuffer = new Uint8Array(this.valueHex);

			//noinspection JSBitwiseOperatorUsage
			while(intBuffer[count] & 0x80)
			{
				intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F;
				count++;

				if(count >= intBuffer.length)
				{
					this.error = "End of input reached before message was fully decoded";
					return (-1);
				}

				//region In case if tag number length is greater than 255 bytes (rare but possible case)
				if(count === tagNumberBufferMaxLength)
				{
					tagNumberBufferMaxLength += 255;

					const tempBuffer = new ArrayBuffer(tagNumberBufferMaxLength);
					const tempBufferView = new Uint8Array(tempBuffer);

					for(let i = 0; i < intTagNumberBuffer.length; i++)
						tempBufferView[i] = intTagNumberBuffer[i];

					this.valueHex = new ArrayBuffer(tagNumberBufferMaxLength);
					intTagNumberBuffer = new Uint8Array(this.valueHex);
				}
				//endregion
			}

			this.blockLength = (count + 1);
			intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F; // Write last byte to buffer

			//region Cut buffer
			const tempBuffer = new ArrayBuffer(count);
			const tempBufferView = new Uint8Array(tempBuffer);

			for(let i = 0; i < count; i++)
				tempBufferView[i] = intTagNumberBuffer[i];

			this.valueHex = new ArrayBuffer(count);
			intTagNumberBuffer = new Uint8Array(this.valueHex);
			intTagNumberBuffer.set(tempBufferView);
			//endregion

			//region Try to convert long tag number to short form
			if(this.blockLength <= 9)
				this.tagNumber = utilFromBase(intTagNumberBuffer, 7);
			else
			{
				this.isHexOnly = true;
				this.warnings.push("Tag too long, represented as hex-coded");
			}
			//endregion
		}
		//endregion
		//endregion

		//region Check if constructed encoding was using for primitive type
		if(((this.tagClass === 1)) &&
			(this.isConstructed))
		{
			switch(this.tagNumber)
			{
				case 1:  // Boolean
				case 2:  // REAL
				case 5:  // Null
				case 6:  // OBJECT IDENTIFIER
				case 9:  // REAL
				case 14: // Time
				case 23:
				case 24:
				case 31:
				case 32:
				case 33:
				case 34:
					this.error = "Constructed encoding used for primitive type";
					return (-1);
				default:
			}
		}
		//endregion

		return (inputOffset + this.blockLength); // Return current offset in input buffer
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
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.blockName = this.constructor.blockName();
		object.tagClass = this.tagClass;
		object.tagNumber = this.tagNumber;
		object.isConstructed = this.isConstructed;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of length block class
//**************************************************************************************
class LocalLengthBlock extends LocalBaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalLengthBlock" class
	 * @param {Object} [parameters={}]
	 * @property {Object} [lenBlock]
	 */
	constructor(parameters = {})
	{
		super();

		if("lenBlock" in parameters)
		{
			this.isIndefiniteForm = getParametersValue(parameters.lenBlock, "isIndefiniteForm", false);
			this.longFormUsed = getParametersValue(parameters.lenBlock, "longFormUsed", false);
			this.length = getParametersValue(parameters.lenBlock, "length", 0);
		}
		else
		{
			this.isIndefiniteForm = false;
			this.longFormUsed = false;
			this.length = 0;
		}
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "lengthBlock";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number}
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		//region Basic check for parameters
		//noinspection JSCheckFunctionSignatures
		if(checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false)
			return (-1);
		//endregion

		//region Getting Uint8Array from ArrayBuffer
		const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
		//endregion

		//region Initial checks
		if(intBuffer.length === 0)
		{
			this.error = "Zero buffer length";
			return (-1);
		}

		if(intBuffer[0] === 0xFF)
		{
			this.error = "Length block 0xFF is reserved by standard";
			return (-1);
		}
		//endregion

		//region Check for length form type
		this.isIndefiniteForm = intBuffer[0] === 0x80;
		//endregion

		//region Stop working in case of indefinite length form
		if(this.isIndefiniteForm === true)
		{
			this.blockLength = 1;
			return (inputOffset + this.blockLength);
		}
		//endregion

		//region Check is long form of length encoding using
		this.longFormUsed = !!(intBuffer[0] & 0x80);
		//endregion

		//region Stop working in case of short form of length value
		if(this.longFormUsed === false)
		{
			this.length = (intBuffer[0]);
			this.blockLength = 1;
			return (inputOffset + this.blockLength);
		}
		//endregion

		//region Calculate length value in case of long form
		const count = intBuffer[0] & 0x7F;

		if(count > 8) // Too big length value
		{
			this.error = "Too big integer";
			return (-1);
		}

		if((count + 1) > intBuffer.length)
		{
			this.error = "End of input reached before message was fully decoded";
			return (-1);
		}

		const lengthBufferView = new Uint8Array(count);

		for(let i = 0; i < count; i++)
			lengthBufferView[i] = intBuffer[i + 1];

		if(lengthBufferView[count - 1] === 0x00)
			this.warnings.push("Needlessly long encoded length");

		this.length = utilFromBase(lengthBufferView, 8);

		if(this.longFormUsed && (this.length <= 127))
			this.warnings.push("Unneccesary usage of long length form");

		this.blockLength = count + 1;
		//endregion

		return (inputOffset + this.blockLength); // Return current offset in input buffer
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		//region Initial variables
		let retBuf;
		let retView;
		//endregion

		if(this.length > 127)
			this.longFormUsed = true;

		if(this.isIndefiniteForm)
		{
			retBuf = new ArrayBuffer(1);

			if(sizeOnly === false)
			{
				retView = new Uint8Array(retBuf);
				retView[0] = 0x80;
			}

			return retBuf;
		}

		if(this.longFormUsed === true)
		{
			const encodedBuf = utilToBase(this.length, 8);

			if(encodedBuf.byteLength > 127)
			{
				this.error = "Too big length";
				return (new ArrayBuffer(0));
			}

			retBuf = new ArrayBuffer(encodedBuf.byteLength + 1);

			if(sizeOnly === true)
				return retBuf;

			const encodedView = new Uint8Array(encodedBuf);
			retView = new Uint8Array(retBuf);

			retView[0] = encodedBuf.byteLength | 0x80;

			for(let i = 0; i < encodedBuf.byteLength; i++)
				retView[i + 1] = encodedView[i];

			return retBuf;
		}

		retBuf = new ArrayBuffer(1);

		if(sizeOnly === false)
		{
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
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.blockName = this.constructor.blockName();
		object.isIndefiniteForm = this.isIndefiniteForm;
		object.longFormUsed = this.longFormUsed;
		object.length = this.length;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of value block class
//**************************************************************************************
class LocalValueBlock extends LocalBaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalValueBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "valueBlock";
	}
	//**********************************************************************************
	//noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number}
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
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
	toBER(sizeOnly = false)
	{
		//region Throw an exception for a function which needs to be specified in extended classes
		throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of basic ASN.1 block class
//**************************************************************************************
class BaseBlock extends LocalBaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "BaseBlock" class
	 * @param {Object} [parameters={}]
	 * @property {Object} [primitiveSchema]
	 * @property {string} [name]
	 * @property {boolean} [optional]
	 * @param valueBlockType Type of value block
	 */
	constructor(parameters = {}, valueBlockType = LocalValueBlock)
	{
		super(parameters);

		if("name" in parameters)
			this.name = parameters.name;
		if("optional" in parameters)
			this.optional = parameters.optional;
		if("primitiveSchema" in parameters)
			this.primitiveSchema = parameters.primitiveSchema;

		this.idBlock = new LocalIdentificationBlock(parameters);
		this.lenBlock = new LocalLengthBlock(parameters);
		this.valueBlock = new valueBlockType(parameters);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "BaseBlock";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number}
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm === true) ? inputLength : this.lenBlock.length);
		if(resultOffset === (-1))
		{
			this.error = this.valueBlock.error;
			return resultOffset;
		}

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;

		if(this.valueBlock.error.length === 0)
			this.blockLength += this.valueBlock.blockLength;

		return resultOffset;
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		let retBuf;

		const idBlockBuf = this.idBlock.toBER(sizeOnly);
		const valueBlockSizeBuf = this.valueBlock.toBER(true);

		this.lenBlock.length = valueBlockSizeBuf.byteLength;
		const lenBlockBuf = this.lenBlock.toBER(sizeOnly);

		retBuf = utilConcatBuf(idBlockBuf, lenBlockBuf);

		let valueBlockBuf;

		if(sizeOnly === false)
			valueBlockBuf = this.valueBlock.toBER(sizeOnly);
		else
			valueBlockBuf = new ArrayBuffer(this.lenBlock.length);

		retBuf = utilConcatBuf(retBuf, valueBlockBuf);

		if(this.lenBlock.isIndefiniteForm === true)
		{
			const indefBuf = new ArrayBuffer(2);

			if(sizeOnly === false)
			{
				const indefView = new Uint8Array(indefBuf);

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
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.idBlock = this.idBlock.toJSON();
		object.lenBlock = this.lenBlock.toJSON();
		object.valueBlock = this.valueBlock.toJSON();

		if("name" in this)
			object.name = this.name;
		if("optional" in this)
			object.optional = this.optional;
		if("primitiveSchema" in this)
			object.primitiveSchema = this.primitiveSchema.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of basic block for all PRIMITIVE types
//**************************************************************************************
class LocalPrimitiveValueBlock extends LocalValueBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalPrimitiveValueBlock" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueBeforeDecode]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		//region Variables from "hexBlock" class
		if("valueHex" in parameters)
			this.valueHex = parameters.valueHex.slice(0);
		else
			this.valueHex = new ArrayBuffer(0);

		this.isHexOnly = getParametersValue(parameters, "isHexOnly", true);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number}
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		//region Basic check for parameters
		//noinspection JSCheckFunctionSignatures
		if(checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false)
			return (-1);
		//endregion

		//region Getting Uint8Array from ArrayBuffer
		const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
		//endregion

		//region Initial checks
		if(intBuffer.length === 0)
		{
			this.warnings.push("Zero buffer length");
			return inputOffset;
		}
		//endregion

		//region Copy input buffer into internal buffer
		this.valueHex = new ArrayBuffer(intBuffer.length);
		const valueHexView = new Uint8Array(this.valueHex);

		for(let i = 0; i < intBuffer.length; i++)
			valueHexView[i] = intBuffer[i];
		//endregion

		this.blockLength = inputLength;

		return (inputOffset + inputLength);
	}
	//**********************************************************************************
	//noinspection JSUnusedLocalSymbols
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		return this.valueHex.slice(0);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "PrimitiveValueBlock";
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);
		object.isHexOnly = this.isHexOnly;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
class Primitive extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "Primitive" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueHex]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalPrimitiveValueBlock);

		this.idBlock.isConstructed = false;
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "PRIMITIVE";
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of basic block for all CONSTRUCTED types
//**************************************************************************************
class LocalConstructedValueBlock extends LocalValueBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalConstructedValueBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.value = getParametersValue(parameters, "value", []);
		this.isIndefiniteForm = getParametersValue(parameters, "isIndefiniteForm", false);
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number}
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		//region Store initial offset and length
		const initialOffset = inputOffset;
		const initialLength = inputLength;
		//endregion

		//region Basic check for parameters
		//noinspection JSCheckFunctionSignatures
		if(checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false)
			return (-1);
		//endregion

		//region Getting Uint8Array from ArrayBuffer
		const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
		//endregion

		//region Initial checks
		if(intBuffer.length === 0)
		{
			this.warnings.push("Zero buffer length");
			return inputOffset;
		}
		//endregion

		//region Aux function
		function checkLen(indefiniteLength, length)
		{
			if(indefiniteLength === true)
				return 1;

			return length;
		}
		//endregion

		let currentOffset = inputOffset;

		while(checkLen(this.isIndefiniteForm, inputLength) > 0)
		{
			const returnObject = LocalFromBER(inputBuffer, currentOffset, inputLength);
			if(returnObject.offset === (-1))
			{
				this.error = returnObject.result.error;
				this.warnings.concat(returnObject.result.warnings);
				return (-1);
			}

			currentOffset = returnObject.offset;

			this.blockLength += returnObject.result.blockLength;
			inputLength -= returnObject.result.blockLength;

			this.value.push(returnObject.result);

			if((this.isIndefiniteForm === true) && (returnObject.result.constructor.blockName() === EndOfContent.blockName()))
				break;
		}

		if(this.isIndefiniteForm === true)
		{
			if(this.value[this.value.length - 1].constructor.blockName() === EndOfContent.blockName())
				this.value.pop();
			else
				this.warnings.push("No EndOfContent block encoded");
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
	toBER(sizeOnly = false)
	{
		let retBuf = new ArrayBuffer(0);

		for(let i = 0; i < this.value.length; i++)
		{
			const valueBuf = this.value[i].toBER(sizeOnly);
			retBuf = utilConcatBuf(retBuf, valueBuf);
		}

		return retBuf;
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "ConstructedValueBlock";
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.isIndefiniteForm = this.isIndefiniteForm;
		object.value = [];
		for(let i = 0; i < this.value.length; i++)
			object.value.push(this.value[i].toJSON());

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
class Constructed extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "Constructed" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalConstructedValueBlock);

		this.idBlock.isConstructed = true;
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "CONSTRUCTED";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number}
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

		const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm === true) ? inputLength : this.lenBlock.length);
		if(resultOffset === (-1))
		{
			this.error = this.valueBlock.error;
			return resultOffset;
		}

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;

		if(this.valueBlock.error.length === 0)
			this.blockLength += this.valueBlock.blockLength;

		return resultOffset;
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 EndOfContent type class
//**************************************************************************************
class LocalEndOfContentValueBlock extends LocalValueBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalEndOfContentValueBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);
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
	fromBER(inputBuffer, inputOffset, inputLength)
	{
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
	toBER(sizeOnly = false)
	{
		return new ArrayBuffer(0);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "EndOfContentValueBlock";
	}
	//**********************************************************************************
}
//**************************************************************************************
class EndOfContent extends BaseBlock
{
	//**********************************************************************************
	constructor(paramaters = {})
	{
		super(paramaters, LocalEndOfContentValueBlock);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 0; // EndOfContent
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "EndOfContent";
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 Boolean type class
//**************************************************************************************
class LocalBooleanValueBlock extends LocalValueBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalBooleanValueBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);
		
		this.value = getParametersValue(parameters, "value", false);
		this.isHexOnly = getParametersValue(parameters, "isHexOnly", false);
		
		if("valueHex" in parameters)
			this.valueHex = parameters.valueHex.slice(0);
		else
		{
			this.valueHex = new ArrayBuffer(1);
			if(this.value === true)
			{
				const view = new Uint8Array(this.valueHex);
				view[0] = 0xFF;
			}
		}
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		//region Basic check for parameters
		//noinspection JSCheckFunctionSignatures
		if(checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false)
			return (-1);
		//endregion

		//region Getting Uint8Array from ArrayBuffer
		const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
		//endregion

		if(inputLength > 1)
			this.warnings.push("Boolean value encoded in more then 1 octet");

		this.isHexOnly = true;

		//region Copy input buffer to internal array
		this.valueHex = new ArrayBuffer(intBuffer.length);
		const view = new Uint8Array(this.valueHex);

		for(let i = 0; i < intBuffer.length; i++)
			view[i] = intBuffer[i];
		//endregion
		
		if(utilDecodeTC.call(this) !== 0 )
			this.value = true;
		else
			this.value = false;

		this.blockLength = inputLength;

		return (inputOffset + inputLength);
	}
	//**********************************************************************************
	//noinspection JSUnusedLocalSymbols
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		return this.valueHex;
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "BooleanValueBlock";
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.value = this.value;
		object.isHexOnly = this.isHexOnly;
		object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
class Boolean extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "Boolean" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalBooleanValueBlock);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 1; // Boolean
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Boolean";
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 Sequence and Set type classes
//**************************************************************************************
class Sequence extends Constructed
{
	//**********************************************************************************
	/**
	 * Constructor for "Sequence" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 16; // Sequence
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Sequence";
	}
	//**********************************************************************************
}
//**************************************************************************************
class Set extends Constructed
{
	//**********************************************************************************
	/**
	 * Constructor for "Set" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 17; // Set
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Set";
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 Null type class
//**************************************************************************************
class Null extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "Null" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalBaseBlock); // We will not have a call to "Null value block" because of specified "fromBER" and "toBER" functions

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 5; // Null
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Null";
	}
	//**********************************************************************************
	//noinspection JSUnusedLocalSymbols
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		if(this.lenBlock.length > 0)
			this.warnings.push("Non-zero length of value block for Null type");

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;
		
		this.blockLength += inputLength;
		
		if((inputOffset + inputLength) > inputBuffer.byteLength)
		{
			this.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
			return (-1);
		}
		
		return (inputOffset + inputLength);
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		const retBuf = new ArrayBuffer(2);

		if(sizeOnly === true)
			return retBuf;

		const retView = new Uint8Array(retBuf);
		retView[0] = 0x05;
		retView[1] = 0x00;

		return retBuf;
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 OctetString type class
//**************************************************************************************
class LocalOctetStringValueBlock extends LocalHexBlock(LocalConstructedValueBlock)
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalOctetStringValueBlock" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueHex]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.isConstructed = getParametersValue(parameters, "isConstructed", false);
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		let resultOffset = 0;

		if(this.isConstructed === true)
		{
			this.isHexOnly = false;

			resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
			if(resultOffset === (-1))
				return resultOffset;

			for(let i = 0; i < this.value.length; i++)
			{
				const currentBlockName = this.value[i].constructor.blockName();

				if(currentBlockName === EndOfContent.blockName())
				{
					if(this.isIndefiniteForm === true)
						break;
					else
					{
						this.error = "EndOfContent is unexpected, OCTET STRING may consists of OCTET STRINGs only";
						return (-1);
					}
				}

				if(currentBlockName !== OctetString.blockName())
				{
					this.error = "OCTET STRING may consists of OCTET STRINGs only";
					return (-1);
				}
			}
		}
		else
		{
			this.isHexOnly = true;

			resultOffset = super.fromBER(inputBuffer, inputOffset, inputLength);
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
	toBER(sizeOnly = false)
	{
		if(this.isConstructed === true)
			return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);

		let retBuf = new ArrayBuffer(this.valueHex.byteLength);

		if(sizeOnly === true)
			return retBuf;

		if(this.valueHex.byteLength === 0)
			return retBuf;

		retBuf = this.valueHex.slice(0);

		return retBuf;
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "OctetStringValueBlock";
	}
	//**********************************************************************************
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.isConstructed = this.isConstructed;
		object.isHexOnly = this.isHexOnly;
		object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
class OctetString extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "OctetString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalOctetStringValueBlock);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 4; // OctetString
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		this.valueBlock.isConstructed = this.idBlock.isConstructed;
		this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

		//region Ability to encode empty OCTET STRING
		if(inputLength === 0)
		{
			if(this.idBlock.error.length === 0)
				this.blockLength += this.idBlock.blockLength;

			if(this.lenBlock.error.length === 0)
				this.blockLength += this.lenBlock.blockLength;

			return inputOffset;
		}
		//endregion

		return super.fromBER(inputBuffer, inputOffset, inputLength);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "OctetString";
	}
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Checking that two OCTETSTRINGs are equal
	 * @param {OctetString} octetString
	 */
	isEqual(octetString)
	{
		//region Check input type
		if((octetString instanceof OctetString) === false)
			return false;
		//endregion

		//region Compare two JSON strings
		if(JSON.stringify(this) !== JSON.stringify(octetString))
			return false;
		//endregion

		return true;
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 BitString type class
//**************************************************************************************
class LocalBitStringValueBlock extends LocalHexBlock(LocalConstructedValueBlock)
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalBitStringValueBlock" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueHex]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.unusedBits = getParametersValue(parameters, "unusedBits", 0);
		this.isConstructed = getParametersValue(parameters, "isConstructed", false);
		this.blockLength = this.valueHex.byteLength;
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		//region Ability to decode zero-length BitString value
		if(inputLength === 0)
			return inputOffset;
		//endregion

		let resultOffset = (-1);

		//region If the BISTRING supposed to be a constructed value
		if(this.isConstructed === true)
		{
			resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
			if(resultOffset === (-1))
				return resultOffset;

			for(let i = 0; i < this.value.length; i++)
			{
				const currentBlockName = this.value[i].constructor.blockName();

				if(currentBlockName === EndOfContent.blockName())
				{
					if(this.isIndefiniteForm === true)
						break;
					else
					{
						this.error = "EndOfContent is unexpected, BIT STRING may consists of BIT STRINGs only";
						return (-1);
					}
				}

				if(currentBlockName !== BitString.blockName())
				{
					this.error = "BIT STRING may consists of BIT STRINGs only";
					return (-1);
				}

				if((this.unusedBits > 0) && (this.value[i].valueBlock.unusedBits > 0))
				{
					this.error = "Usign of \"unused bits\" inside constructive BIT STRING allowed for least one only";
					return (-1);
				}

				this.unusedBits = this.value[i].valueBlock.unusedBits;
				if(this.unusedBits > 7)
				{
					this.error = "Unused bits for BitString must be in range 0-7";
					return (-1);
				}
			}

			return resultOffset;
		}
		//endregion
		//region If the BitString supposed to be a primitive value
		//region Basic check for parameters
		//noinspection JSCheckFunctionSignatures
		if(checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false)
			return (-1);
		//endregion

		const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

		this.unusedBits = intBuffer[0];
		
		if(this.unusedBits > 7)
		{
			this.error = "Unused bits for BitString must be in range 0-7";
			return (-1);
		}

		//region Copy input buffer to internal buffer
		this.valueHex = new ArrayBuffer(intBuffer.length - 1);
		const view = new Uint8Array(this.valueHex);
		for(let i = 0; i < (inputLength - 1); i++)
			view[i] = intBuffer[i + 1];
		//endregion

		this.blockLength = intBuffer.length;

		return (inputOffset + inputLength);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		if(this.isConstructed === true)
			return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);

		if(sizeOnly === true)
			return (new ArrayBuffer(this.valueHex.byteLength + 1));

		if(this.valueHex.byteLength === 0)
			return (new ArrayBuffer(0));

		const curView = new Uint8Array(this.valueHex);

		const retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
		const retView = new Uint8Array(retBuf);

		retView[0] = this.unusedBits;

		for(let i = 0; i < this.valueHex.byteLength; i++)
			retView[i + 1] = curView[i];

		return retBuf;
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "BitStringValueBlock";
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.unusedBits = this.unusedBits;
		object.isConstructed = this.isConstructed;
		object.isHexOnly = this.isHexOnly;
		object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
class BitString extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "BitString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalBitStringValueBlock);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 3; // BitString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "BitString";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		//region Ability to encode empty BitString
		if(inputLength === 0)
			return inputOffset;
		//endregion

		this.valueBlock.isConstructed = this.idBlock.isConstructed;
		this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

		return super.fromBER(inputBuffer, inputOffset, inputLength);
	}
	//**********************************************************************************
	/**
	 * Checking that two BITSTRINGs are equal
	 * @param {BitString} bitString
	 */
	isEqual(bitString)
	{
		//region Check input type
		if((bitString instanceof BitString) === false)
			return false;
		//endregion

		//region Compare two JSON strings
		if(JSON.stringify(this) !== JSON.stringify(bitString))
			return false;
		//endregion

		return true;
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 Integer type class
//**************************************************************************************
/**
 * @extends LocalValueBlock
 */
class LocalIntegerValueBlock extends LocalHexBlock(LocalValueBlock)
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalIntegerValueBlock" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueHex]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		if("value" in parameters)
			this.valueDec = parameters.value;
	}
	//**********************************************************************************
	/**
	 * Setter for "valueHex"
	 * @param {ArrayBuffer} _value
	 */
	set valueHex(_value)
	{
		this._valueHex = _value.slice(0);

		if(_value.byteLength >= 4)
		{
			this.warnings.push("Too big Integer for decoding, hex only");
			this.isHexOnly = true;
			this._valueDec = 0;
		}
		else
		{
			this.isHexOnly = false;

			if(_value.byteLength > 0)
				this._valueDec = utilDecodeTC.call(this);
		}
	}
	//**********************************************************************************
	/**
	 * Getter for "valueHex"
	 * @returns {ArrayBuffer}
	 */
	get valueHex()
	{
		return this._valueHex;
	}
	//**********************************************************************************
	/**
	 * Getter for "valueDec"
	 * @param {number} _value
	 */
	set valueDec(_value)
	{
		this._valueDec = _value;

		this.isHexOnly = false;
		this._valueHex = utilEncodeTC(_value);
	}
	//**********************************************************************************
	/**
	 * Getter for "valueDec"
	 * @returns {number}
	 */
	get valueDec()
	{
		return this._valueDec;
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from DER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 DER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 DER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @param {number} [expectedLength=0] Expected length of converted "valueHex" buffer
	 * @returns {number} Offset after least decoded byte
	 */
	fromDER(inputBuffer, inputOffset, inputLength, expectedLength = 0)
	{
		const offset = this.fromBER(inputBuffer, inputOffset, inputLength);
		if(offset === (-1))
			return offset;

		const view = new Uint8Array(this._valueHex);

		if((view[0] === 0x00) && ((view[1] & 0x80) !== 0))
		{
			const updatedValueHex = new ArrayBuffer(this._valueHex.byteLength - 1);
			const updatedView = new Uint8Array(updatedValueHex);

			updatedView.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

			this._valueHex = updatedValueHex.slice(0);
		}
		else
		{
			if(expectedLength !== 0)
			{
				if(this._valueHex.byteLength < expectedLength)
				{
					if((expectedLength - this._valueHex.byteLength) > 1)
						expectedLength = this._valueHex.byteLength + 1;
					
					const updatedValueHex = new ArrayBuffer(expectedLength);
					const updatedView = new Uint8Array(updatedValueHex);

					updatedView.set(view, expectedLength - this._valueHex.byteLength);

					this._valueHex = updatedValueHex.slice(0);
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
	toDER(sizeOnly = false)
	{
		const view = new Uint8Array(this._valueHex);

		switch(true)
		{
			case ((view[0] & 0x80) !== 0):
				{
					const updatedValueHex = new ArrayBuffer(this._valueHex.byteLength + 1);
					const updatedView = new Uint8Array(updatedValueHex);

					updatedView[0] = 0x00;
					updatedView.set(view, 1);

					this._valueHex = updatedValueHex.slice(0);
				}
				break;
			case ((view[0] === 0x00) && ((view[1] & 0x80) === 0)):
				{
					const updatedValueHex = new ArrayBuffer(this._valueHex.byteLength - 1);
					const updatedView = new Uint8Array(updatedValueHex);

					updatedView.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

					this._valueHex = updatedValueHex.slice(0);
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
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		const resultOffset = super.fromBER(inputBuffer, inputOffset, inputLength);
		if(resultOffset === (-1))
			return resultOffset;

		this.blockLength = inputLength;

		return (inputOffset + inputLength);
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		//noinspection JSCheckFunctionSignatures
		return this.valueHex.slice(0);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "IntegerValueBlock";
	}
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.valueDec = this.valueDec;

		return object;
	}
	//**********************************************************************************
	/**
	 * Convert current value to decimal string representation
	 */
	toString()
	{
		//region Aux functions
		function viewAdd(first, second)
		{
			//region Initial variables
			const c = new Uint8Array([0]);
			
			let firstView = new Uint8Array(first);
			let secondView = new Uint8Array(second);
			
			let firstViewCopy = firstView.slice(0);
			const firstViewCopyLength = firstViewCopy.length - 1;
			let secondViewCopy = secondView.slice(0);
			const secondViewCopyLength = secondViewCopy.length - 1;
			
			let value = 0;
			
			const max = (secondViewCopyLength < firstViewCopyLength) ? firstViewCopyLength : secondViewCopyLength;
			
			let counter = 0;
			//endregion
			
			for(let i = max; i >= 0; i--, counter++)
			{
				switch(true)
				{
					case (counter < secondViewCopy.length):
						value = firstViewCopy[firstViewCopyLength - counter] + secondViewCopy[secondViewCopyLength - counter] + c[0];
						break;
					default:
						value = firstViewCopy[firstViewCopyLength - counter] + c[0];
				}
				
				c[0] = value / 10;
				
				switch(true)
				{
					case (counter >= firstViewCopy.length):
						firstViewCopy = utilConcatView(new Uint8Array([value % 10]), firstViewCopy);
						break;
					default:
						firstViewCopy[firstViewCopyLength - counter] = value % 10;
				}
			}
			
			if(c[0] > 0)
				firstViewCopy = utilConcatView(c, firstViewCopy);
			
			return firstViewCopy.slice(0);
		}
		
		function power2(n)
		{
			if(n >= powers2.length)
			{
				for(let p = powers2.length; p <= n; p++)
				{
					const c = new Uint8Array([0]);
					let digits = (powers2[p - 1]).slice(0);
					
					for(let i = (digits.length - 1); i >=0; i--)
					{
						const newValue = new Uint8Array([(digits[i] << 1) + c[0]]);
						c[0] = newValue[0] / 10;
						digits[i] = newValue[0] % 10;
					}
					
					if (c[0] > 0)
						digits = utilConcatView(c, digits);
					
					powers2.push(digits);
				}
			}
			
			return powers2[n];
		}
		
		function viewSub(first, second)
		{
			//region Initial variables
			let b = 0;
			
			let firstView = new Uint8Array(first);
			let secondView = new Uint8Array(second);
			
			let firstViewCopy = firstView.slice(0);
			const firstViewCopyLength = firstViewCopy.length - 1;
			let secondViewCopy = secondView.slice(0);
			const secondViewCopyLength = secondViewCopy.length - 1;
			
			let value;
			
			let counter = 0;
			//endregion
			
			for(let i = secondViewCopyLength; i >= 0; i--, counter++)
			{
				value = firstViewCopy[firstViewCopyLength - counter] - secondViewCopy[secondViewCopyLength - counter] - b;
				
				switch(true)
				{
					case (value < 0):
						b = 1;
						firstViewCopy[firstViewCopyLength - counter] = value + 10;
						break;
					default:
						b = 0;
						firstViewCopy[firstViewCopyLength - counter] = value;
				}
			}
			
			if(b > 0)
			{
				for(let i = (firstViewCopyLength - secondViewCopyLength + 1); i >= 0; i--, counter++)
				{
					value = firstViewCopy[firstViewCopyLength - counter] - b;
					
					if(value < 0)
					{
						b = 1;
						firstViewCopy[firstViewCopyLength - counter] = value + 10;
					}
					else
					{
						b = 0;
						firstViewCopy[firstViewCopyLength - counter] = value;
						break;
					}
				}
			}
			
			return firstViewCopy.slice();
		}
		//endregion
		
		//region Initial variables
		const firstBit = (this._valueHex.byteLength * 8) - 1;
		
		let digits = new Uint8Array((this._valueHex.byteLength * 8) / 3);
		let bitNumber = 0;
		let currentByte;
		
		const asn1View = new Uint8Array(this._valueHex);
		
		let result = "";
		
		let flag = false;
		//endregion
		
		//region Calculate number
		for(let byteNumber = (this._valueHex.byteLength - 1); byteNumber >= 0; byteNumber--)
		{
			currentByte = asn1View[byteNumber];
			
			for(let i = 0; i < 8; i++)
			{
				if((currentByte & 1) === 1)
				{
					switch(bitNumber)
					{
						case firstBit:
							digits = viewSub(power2(bitNumber), digits);
							result = "-";
							break;
						default:
							digits = viewAdd(digits, power2(bitNumber));
					}
				}
				
				bitNumber++;
				currentByte >>= 1;
			}
		}
		//endregion
		
		//region Print number
		for(let i = 0; i < digits.length; i++)
		{
			if(digits[i])
				flag = true;
			
			if(flag)
				result += digitsString.charAt(digits[i]);
		}
		
		if(flag === false)
			result += digitsString.charAt(0);
		//endregion
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
class Integer extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "Integer" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalIntegerValueBlock);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 2; // Integer
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Integer";
	}
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Compare two Integer object, or Integer and ArrayBuffer objects
	 * @param {!Integer|ArrayBuffer} otherValue
	 * @returns {boolean}
	 */
	isEqual(otherValue)
	{
		if(otherValue instanceof Integer)
		{
			if(this.valueBlock.isHexOnly && otherValue.valueBlock.isHexOnly) // Compare two ArrayBuffers
				return isEqualBuffer(this.valueBlock.valueHex, otherValue.valueBlock.valueHex);

			if(this.valueBlock.isHexOnly === otherValue.valueBlock.isHexOnly)
				return (this.valueBlock.valueDec === otherValue.valueBlock.valueDec);

			return false;
		}
		
		if(otherValue instanceof ArrayBuffer)
			return isEqualBuffer(this.valueBlock.valueHex, otherValue);

		return false;
	}
	//**********************************************************************************
	/**
	 * Convert current Integer value from BER into DER format
	 * @returns {Integer}
	 */
	convertToDER()
	{
		const integer = new Integer({ valueHex: this.valueBlock.valueHex });
		integer.valueBlock.toDER();

		return integer;
	}
	//**********************************************************************************
	/**
	 * Convert current Integer value from DER to BER format
	 * @returns {Integer}
	 */
	convertFromDER()
	{
		const expectedLength = (this.valueBlock.valueHex.byteLength % 2) ? (this.valueBlock.valueHex.byteLength + 1) : this.valueBlock.valueHex.byteLength;
		const integer = new Integer({ valueHex: this.valueBlock.valueHex });
		integer.valueBlock.fromDER(integer.valueBlock.valueHex, 0, integer.valueBlock.valueHex.byteLength, expectedLength);
		
		return integer;
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 Enumerated type class
//**************************************************************************************
class Enumerated extends Integer
{
	//**********************************************************************************
	/**
	 * Constructor for "Enumerated" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 10; // Enumerated
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Enumerated";
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of ASN.1 ObjectIdentifier type class
//**************************************************************************************
class LocalSidValueBlock extends LocalHexBlock(LocalBaseBlock)
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalSidValueBlock" class
	 * @param {Object} [parameters={}]
	 * @property {number} [valueDec]
	 * @property {boolean} [isFirstSid]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.valueDec = getParametersValue(parameters, "valueDec", -1);
		this.isFirstSid = getParametersValue(parameters, "isFirstSid", false);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "sidBlock";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		if(inputLength === 0)
			return inputOffset;

		//region Basic check for parameters
		//noinspection JSCheckFunctionSignatures
		if(checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false)
			return (-1);
		//endregion

		const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

		this.valueHex = new ArrayBuffer(inputLength);
		let view = new Uint8Array(this.valueHex);

		for(let i = 0; i < inputLength; i++)
		{
			view[i] = intBuffer[i] & 0x7F;

			this.blockLength++;

			if((intBuffer[i] & 0x80) === 0x00)
				break;
		}

		//region Ajust size of valueHex buffer
		const tempValueHex = new ArrayBuffer(this.blockLength);
		const tempView = new Uint8Array(tempValueHex);

		for(let i = 0; i < this.blockLength; i++)
			tempView[i] = view[i];

		//noinspection JSCheckFunctionSignatures
		this.valueHex = tempValueHex.slice(0);
		view = new Uint8Array(this.valueHex);
		//endregion

		if((intBuffer[this.blockLength - 1] & 0x80) !== 0x00)
		{
			this.error = "End of input reached before message was fully decoded";
			return (-1);
		}

		if(view[0] === 0x00)
			this.warnings.push("Needlessly long format of SID encoding");

		if(this.blockLength <= 8)
			this.valueDec = utilFromBase(view, 7);
		else
		{
			this.isHexOnly = true;
			this.warnings.push("Too big SID for decoding, hex only");
		}

		return (inputOffset + this.blockLength);
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		//region Initial variables
		let retBuf;
		let retView;
		//endregion

		if(this.isHexOnly)
		{
			if(sizeOnly === true)
				return (new ArrayBuffer(this.valueHex.byteLength));

			const curView = new Uint8Array(this.valueHex);

			retBuf = new ArrayBuffer(this.blockLength);
			retView = new Uint8Array(retBuf);

			for(let i = 0; i < (this.blockLength - 1); i++)
				retView[i] = curView[i] | 0x80;

			retView[this.blockLength - 1] = curView[this.blockLength - 1];

			return retBuf;
		}

		const encodedBuf = utilToBase(this.valueDec, 7);
		if(encodedBuf.byteLength === 0)
		{
			this.error = "Error during encoding SID value";
			return (new ArrayBuffer(0));
		}

		retBuf = new ArrayBuffer(encodedBuf.byteLength);

		if(sizeOnly === false)
		{
			const encodedView = new Uint8Array(encodedBuf);
			retView = new Uint8Array(retBuf);

			for(let i = 0; i < (encodedBuf.byteLength - 1); i++)
				retView[i] = encodedView[i] | 0x80;

			retView[encodedBuf.byteLength - 1] = encodedView[encodedBuf.byteLength - 1];
		}

		return retBuf;
	}
	//**********************************************************************************
	/**
	 * Create string representation of current SID block
	 * @returns {string}
	 */
	toString()
	{
		let result = "";

		if(this.isHexOnly === true)
			result = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);
		else
		{
			if(this.isFirstSid)
			{
				let sidValue = this.valueDec;

				if(this.valueDec <= 39)
					result = "0.";
				else
				{
					if(this.valueDec <= 79)
					{
						result = "1.";
						sidValue -= 40;
					}
					else
					{
						result = "2.";
						sidValue -= 80;
					}
				}

				result += sidValue.toString();
			}
			else
				result = this.valueDec.toString();
		}

		return result;
	}
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.valueDec = this.valueDec;
		object.isFirstSid = this.isFirstSid;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
class LocalObjectIdentifierValueBlock extends LocalValueBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalObjectIdentifierValueBlock" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueHex]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.fromString(getParametersValue(parameters, "value", ""));
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		let resultOffset = inputOffset;

		while(inputLength > 0)
		{
			const sidBlock = new LocalSidValueBlock();
			resultOffset = sidBlock.fromBER(inputBuffer, resultOffset, inputLength);
			if(resultOffset === (-1))
			{
				this.blockLength = 0;
				this.error = sidBlock.error;
				return resultOffset;
			}

			if(this.value.length === 0)
				sidBlock.isFirstSid = true;

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
	toBER(sizeOnly = false)
	{
		let retBuf = new ArrayBuffer(0);

		for(let i = 0; i < this.value.length; i++)
		{
			const valueBuf = this.value[i].toBER(sizeOnly);
			if(valueBuf.byteLength === 0)
			{
				this.error = this.value[i].error;
				return (new ArrayBuffer(0));
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
	fromString(string)
	{
		this.value = []; // Clear existing SID values

		let pos1 = 0;
		let pos2 = 0;

		let sid = "";

		let flag = false;

		do
		{
			pos2 = string.indexOf(".", pos1);
			if(pos2 === (-1))
				sid = string.substr(pos1);
			else
				sid = string.substr(pos1, pos2 - pos1);

			pos1 = pos2 + 1;

			if(flag)
			{
				const sidBlock = this.value[0];

				let plus = 0;

				switch(sidBlock.valueDec)
				{
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

				const parsedSID = parseInt(sid, 10);
				if(isNaN(parsedSID))
					return true;

				sidBlock.valueDec = parsedSID + plus;

				flag = false;
			}
			else
			{
				const sidBlock = new LocalSidValueBlock();
				sidBlock.valueDec = parseInt(sid, 10);
				if(isNaN(sidBlock.valueDec))
					return true;

				if(this.value.length === 0)
				{
					sidBlock.isFirstSid = true;
					flag = true;
				}

				this.value.push(sidBlock);
			}
		} while(pos2 !== (-1));

		return true;
	}
	//**********************************************************************************
	/**
	 * Converts "LocalObjectIdentifierValueBlock" class to string
	 * @returns {string}
	 */
	toString()
	{
		let result = "";
		let isHexOnly = false;

		for(let i = 0; i < this.value.length; i++)
		{
			isHexOnly = this.value[i].isHexOnly;

			let sidStr = this.value[i].toString();

			if(i !== 0)
				result = `${result}.`;

			if(isHexOnly)
			{
				sidStr = `{${sidStr}}`;

				if(this.value[i].isFirstSid)
					result = `2.{${sidStr} - 80}`;
				else
					result += sidStr;
			}
			else
				result += sidStr;
		}

		return result;
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "ObjectIdentifierValueBlock";
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.value = this.toString();
		object.sidArray = [];
		for(let i = 0; i < this.value.length; i++)
			object.sidArray.push(this.value[i].toJSON());

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends BaseBlock
 */
class ObjectIdentifier extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "ObjectIdentifier" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueHex]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalObjectIdentifierValueBlock);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 6; // OBJECT IDENTIFIER
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "ObjectIdentifier";
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of all string's classes
//**************************************************************************************
class LocalUtf8StringValueBlock extends LocalHexBlock(LocalBaseBlock)
{
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Constructor for "LocalUtf8StringValueBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.isHexOnly = true;
		this.value = ""; // String representation of decoded ArrayBuffer
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Utf8StringValueBlock";
	}
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.value = this.value;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends BaseBlock
 */
class Utf8String extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "Utf8String" class
	 * @param {Object} [parameters={}]
	 * @property {ArrayBuffer} [valueHex]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalUtf8StringValueBlock);

		if("value" in parameters)
			this.fromString(parameters.value);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 12; // Utf8String
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Utf8String";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm === true) ? inputLength : this.lenBlock.length);
		if(resultOffset === (-1))
		{
			this.error = this.valueBlock.error;
			return resultOffset;
		}

		this.fromBuffer(this.valueBlock.valueHex);

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;

		if(this.valueBlock.error.length === 0)
			this.blockLength += this.valueBlock.blockLength;

		return resultOffset;
	}
	//**********************************************************************************
	/**
	 * Function converting ArrayBuffer into ASN.1 internal string
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 */
	fromBuffer(inputBuffer)
	{
		this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));

		try
		{
			//noinspection JSDeprecatedSymbols
			this.valueBlock.value = decodeURIComponent(escape(this.valueBlock.value));
		}
		catch(ex)
		{
			this.warnings.push(`Error during "decodeURIComponent": ${ex}, using raw string`);
		}
	}
	//**********************************************************************************
	/**
	 * Function converting JavaScript string into ASN.1 internal class
	 * @param {!string} inputString ASN.1 BER encoded array
	 */
	fromString(inputString)
	{
		//noinspection JSDeprecatedSymbols
		const str = unescape(encodeURIComponent(inputString));
		const strLen = str.length;

		this.valueBlock.valueHex = new ArrayBuffer(strLen);
		const view = new Uint8Array(this.valueBlock.valueHex);

		for(let i = 0; i < strLen; i++)
			view[i] = str.charCodeAt(i);

		this.valueBlock.value = inputString;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalBaseBlock
 * @extends LocalHexBlock
 */
class LocalBmpStringValueBlock extends LocalHexBlock(LocalBaseBlock)
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalBmpStringValueBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.isHexOnly = true;
		this.value = "";
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "BmpStringValueBlock";
	}
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.value = this.value;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends BaseBlock
 */
class BmpString extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "BmpString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalBmpStringValueBlock);

		if("value" in parameters)
			this.fromString(parameters.value);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 30; // BmpString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "BmpString";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm === true) ? inputLength : this.lenBlock.length);
		if(resultOffset === (-1))
		{
			this.error = this.valueBlock.error;
			return resultOffset;
		}

		this.fromBuffer(this.valueBlock.valueHex);

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;

		if(this.valueBlock.error.length === 0)
			this.blockLength += this.valueBlock.blockLength;

		return resultOffset;
	}
	//**********************************************************************************
	/**
	 * Function converting ArrayBuffer into ASN.1 internal string
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 */
	fromBuffer(inputBuffer)
	{
		//noinspection JSCheckFunctionSignatures
		const copyBuffer = inputBuffer.slice(0);
		const valueView = new Uint8Array(copyBuffer);

		for(let i = 0; i < valueView.length; i += 2)
		{
			const temp = valueView[i];

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
	fromString(inputString)
	{
		const strLength = inputString.length;

		this.valueBlock.valueHex = new ArrayBuffer(strLength * 2);
		const valueHexView = new Uint8Array(this.valueBlock.valueHex);

		for(let i = 0; i < strLength; i++)
		{
			const codeBuf = utilToBase(inputString.charCodeAt(i), 8);
			const codeView = new Uint8Array(codeBuf);
			if(codeView.length > 2)
				continue;

			const dif = 2 - codeView.length;

			for(let j = (codeView.length - 1); j >= 0; j--)
				valueHexView[i * 2 + j + dif] = codeView[j];
		}

		this.valueBlock.value = inputString;
	}
	//**********************************************************************************
}
//**************************************************************************************
class LocalUniversalStringValueBlock extends LocalHexBlock(LocalBaseBlock)
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalUniversalStringValueBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.isHexOnly = true;
		this.value = "";
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "UniversalStringValueBlock";
	}
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.value = this.value;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends BaseBlock
 */
class UniversalString extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "UniversalString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalUniversalStringValueBlock);

		if("value" in parameters)
			this.fromString(parameters.value);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 28; // UniversalString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "UniversalString";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm === true) ? inputLength : this.lenBlock.length);
		if(resultOffset === (-1))
		{
			this.error = this.valueBlock.error;
			return resultOffset;
		}

		this.fromBuffer(this.valueBlock.valueHex);

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;

		if(this.valueBlock.error.length === 0)
			this.blockLength += this.valueBlock.blockLength;

		return resultOffset;
	}
	//**********************************************************************************
	/**
	 * Function converting ArrayBuffer into ASN.1 internal string
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 */
	fromBuffer(inputBuffer)
	{
		//noinspection JSCheckFunctionSignatures
		const copyBuffer = inputBuffer.slice(0);
		const valueView = new Uint8Array(copyBuffer);

		for(let i = 0; i < valueView.length; i += 4)
		{
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
	fromString(inputString)
	{
		const strLength = inputString.length;

		this.valueBlock.valueHex = new ArrayBuffer(strLength * 4);
		const valueHexView = new Uint8Array(this.valueBlock.valueHex);

		for(let i = 0; i < strLength; i++)
		{
			const codeBuf = utilToBase(inputString.charCodeAt(i), 8);
			const codeView = new Uint8Array(codeBuf);
			if(codeView.length > 4)
				continue;

			const dif = 4 - codeView.length;

			for(let j = (codeView.length - 1); j >= 0; j--)
				valueHexView[i * 4 + j + dif] = codeView[j];
		}

		this.valueBlock.value = inputString;
	}
	//**********************************************************************************
}
//**************************************************************************************
class LocalSimpleStringValueBlock extends LocalHexBlock(LocalBaseBlock)
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalSimpleStringValueBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.value = "";
		this.isHexOnly = true;
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "SimpleStringValueBlock";
	}
	//**********************************************************************************
	//noinspection JSUnusedGlobalSymbols
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
		//endregion

		object.value = this.value;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends BaseBlock
 */
class LocalSimpleStringBlock extends BaseBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "LocalSimpleStringBlock" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters, LocalSimpleStringValueBlock);

		if("value" in parameters)
			this.fromString(parameters.value);
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "SIMPLESTRING";
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm === true) ? inputLength : this.lenBlock.length);
		if(resultOffset === (-1))
		{
			this.error = this.valueBlock.error;
			return resultOffset;
		}

		this.fromBuffer(this.valueBlock.valueHex);

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;

		if(this.valueBlock.error.length === 0)
			this.blockLength += this.valueBlock.blockLength;

		return resultOffset;
	}
	//**********************************************************************************
	/**
	 * Function converting ArrayBuffer into ASN.1 internal string
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 */
	fromBuffer(inputBuffer)
	{
		this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));
	}
	//**********************************************************************************
	/**
	 * Function converting JavaScript string into ASN.1 internal class
	 * @param {!string} inputString ASN.1 BER encoded array
	 */
	fromString(inputString)
	{
		const strLen = inputString.length;

		this.valueBlock.valueHex = new ArrayBuffer(strLen);
		const view = new Uint8Array(this.valueBlock.valueHex);

		for(let i = 0; i < strLen; i++)
			view[i] = inputString.charCodeAt(i);

		this.valueBlock.value = inputString;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class NumericString extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "NumericString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 18; // NumericString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "NumericString";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class PrintableString extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "PrintableString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 19; // PrintableString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "PrintableString";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class TeletexString extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "TeletexString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 20; // TeletexString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "TeletexString";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class VideotexString extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "VideotexString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 21; // VideotexString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "VideotexString";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class IA5String extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "IA5String" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 22; // IA5String
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "IA5String";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class GraphicString extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "GraphicString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 25; // GraphicString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "GraphicString";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class VisibleString extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "VisibleString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 26; // VisibleString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "VisibleString";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class GeneralString extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "GeneralString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 27; // GeneralString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "GeneralString";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends LocalSimpleStringBlock
 */
class CharacterString extends LocalSimpleStringBlock
{
	//**********************************************************************************
	/**
	 * Constructor for "CharacterString" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 29; // CharacterString
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "CharacterString";
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of all date and time classes
//**************************************************************************************
/**
 * @extends VisibleString
 */
class UTCTime extends VisibleString
{
	//**********************************************************************************
	/**
	 * Constructor for "UTCTime" class
	 * @param {Object} [parameters={}]
	 * @property {string} [value] String representatio of the date
	 * @property {Date} [valueDate] JavaScript "Date" object
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.year = 0;
		this.month = 0;
		this.day = 0;
		this.hour = 0;
		this.minute = 0;
		this.second = 0;

		//region Create UTCTime from ASN.1 UTC string value
		if("value" in parameters)
		{
			this.fromString(parameters.value);

			this.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
			const view = new Uint8Array(this.valueBlock.valueHex);

			for(let i = 0; i < parameters.value.length; i++)
				view[i] = parameters.value.charCodeAt(i);
		}
		//endregion
		//region Create GeneralizedTime from JavaScript Date type
		if("valueDate" in parameters)
		{
			this.fromDate(parameters.valueDate);
			this.valueBlock.valueHex = this.toBuffer();
		}
		//endregion

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 23; // UTCTime
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm === true) ? inputLength : this.lenBlock.length);
		if(resultOffset === (-1))
		{
			this.error = this.valueBlock.error;
			return resultOffset;
		}

		this.fromBuffer(this.valueBlock.valueHex);

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;

		if(this.valueBlock.error.length === 0)
			this.blockLength += this.valueBlock.blockLength;

		return resultOffset;
	}
	//**********************************************************************************
	/**
	 * Function converting ArrayBuffer into ASN.1 internal string
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 */
	fromBuffer(inputBuffer)
	{
		this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
	}
	//**********************************************************************************
	/**
	 * Function converting ASN.1 internal string into ArrayBuffer
	 * @returns {ArrayBuffer}
	 */
	toBuffer()
	{
		const str = this.toString();

		const buffer = new ArrayBuffer(str.length);
		const view = new Uint8Array(buffer);

		for(let i = 0; i < str.length; i++)
			view[i] = str.charCodeAt(i);

		return buffer;
	}
	//**********************************************************************************
	/**
	 * Function converting "Date" object into ASN.1 internal string
	 * @param {!Date} inputDate JavaScript "Date" object
	 */
	fromDate(inputDate)
	{
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
	toDate()
	{
		return (new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second)));
	}
	//**********************************************************************************
	/**
	 * Function converting JavaScript string into ASN.1 internal class
	 * @param {!string} inputString ASN.1 BER encoded array
	 */
	fromString(inputString)
	{
		//region Parse input string
		const parser = /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z/ig;
		const parserArray = parser.exec(inputString);
		if(parserArray === null)
		{
			this.error = "Wrong input string for convertion";
			return;
		}
		//endregion

		//region Store parsed values
		const year = parseInt(parserArray[1], 10);
		if(year >= 50)
			this.year = 1900 + year;
		else
			this.year = 2000 + year;

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
	toString()
	{
		const outputArray = new Array(7);

		outputArray[0] = padNumber(((this.year < 2000) ? (this.year - 1900) : (this.year - 2000)), 2);
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
	static blockName()
	{
		return "UTCTime";
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
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
}
//**************************************************************************************
/**
 * @extends VisibleString
 */
class GeneralizedTime extends VisibleString
{
	//**********************************************************************************
	/**
	 * Constructor for "GeneralizedTime" class
	 * @param {Object} [parameters={}]
	 * @property {string} [value] String representatio of the date
	 * @property {Date} [valueDate] JavaScript "Date" object
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.year = 0;
		this.month = 0;
		this.day = 0;
		this.hour = 0;
		this.minute = 0;
		this.second = 0;
		this.millisecond = 0;

		//region Create UTCTime from ASN.1 UTC string value
		if("value" in parameters)
		{
			this.fromString(parameters.value);

			this.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
			const view = new Uint8Array(this.valueBlock.valueHex);

			for(let i = 0; i < parameters.value.length; i++)
				view[i] = parameters.value.charCodeAt(i);
		}
		//endregion
		//region Create GeneralizedTime from JavaScript Date type
		if("valueDate" in parameters)
		{
			this.fromDate(parameters.valueDate);
			this.valueBlock.valueHex = this.toBuffer();
		}
		//endregion

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 24; // GeneralizedTime
	}
	//**********************************************************************************
	/**
	 * Base function for converting block from BER encoded array of bytes
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
	 * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
	 * @returns {number} Offset after least decoded byte
	 */
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm === true) ? inputLength : this.lenBlock.length);
		if(resultOffset === (-1))
		{
			this.error = this.valueBlock.error;
			return resultOffset;
		}

		this.fromBuffer(this.valueBlock.valueHex);

		if(this.idBlock.error.length === 0)
			this.blockLength += this.idBlock.blockLength;

		if(this.lenBlock.error.length === 0)
			this.blockLength += this.lenBlock.blockLength;

		if(this.valueBlock.error.length === 0)
			this.blockLength += this.valueBlock.blockLength;

		return resultOffset;
	}
	//**********************************************************************************
	/**
	 * Function converting ArrayBuffer into ASN.1 internal string
	 * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
	 */
	fromBuffer(inputBuffer)
	{
		this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
	}
	//**********************************************************************************
	/**
	 * Function converting ASN.1 internal string into ArrayBuffer
	 * @returns {ArrayBuffer}
	 */
	toBuffer()
	{
		const str = this.toString();

		const buffer = new ArrayBuffer(str.length);
		const view = new Uint8Array(buffer);

		for(let i = 0; i < str.length; i++)
			view[i] = str.charCodeAt(i);

		return buffer;
	}
	//**********************************************************************************
	/**
	 * Function converting "Date" object into ASN.1 internal string
	 * @param {!Date} inputDate JavaScript "Date" object
	 */
	fromDate(inputDate)
	{
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
	toDate()
	{
		return (new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond)));
	}
	//**********************************************************************************
	/**
	 * Function converting JavaScript string into ASN.1 internal class
	 * @param {!string} inputString ASN.1 BER encoded array
	 */
	fromString(inputString)
	{
		//region Initial variables
		let isUTC = false;

		let timeString = "";
		let dateTimeString = "";
		let fractionPart = 0;

		let parser;

		let hourDifference = 0;
		let minuteDifference = 0;
		//endregion

		//region Convert as UTC time
		if(inputString[inputString.length - 1] === "Z")
		{
			timeString = inputString.substr(0, inputString.length - 1);

			isUTC = true;
		}
		//endregion
		//region Convert as local time
		else
		{
			//noinspection JSPrimitiveTypeWrapperUsage
			const number = new Number(inputString[inputString.length - 1]);

			if(isNaN(number.valueOf()))
				throw new Error("Wrong input string for convertion");

			timeString = inputString;
		}
		//endregion

		//region Check that we do not have a "+" and "-" symbols inside UTC time
		if(isUTC)
		{
			if(timeString.indexOf("+") !== (-1))
				throw new Error("Wrong input string for convertion");

			if(timeString.indexOf("-") !== (-1))
				throw new Error("Wrong input string for convertion");
		}
		//endregion
		//region Get "UTC time difference" in case of local time
		else
		{
			let multiplier = 1;
			let differencePosition = timeString.indexOf("+");
			let differenceString = "";

			if(differencePosition === (-1))
			{
				differencePosition = timeString.indexOf("-");
				multiplier = (-1);
			}

			if(differencePosition !== (-1))
			{
				differenceString = timeString.substr(differencePosition + 1);
				timeString = timeString.substr(0, differencePosition);

				if((differenceString.length !== 2) && (differenceString.length !== 4))
					throw new Error("Wrong input string for convertion");

				//noinspection JSPrimitiveTypeWrapperUsage
				let number = new Number(differenceString.substr(0, 2));

				if(isNaN(number.valueOf()))
					throw new Error("Wrong input string for convertion");

				hourDifference = multiplier * number;

				if(differenceString.length === 4)
				{
					//noinspection JSPrimitiveTypeWrapperUsage
					number = new Number(differenceString.substr(2, 2));

					if(isNaN(number.valueOf()))
						throw new Error("Wrong input string for convertion");

					minuteDifference = multiplier * number;
				}
			}
		}
		//endregion

		//region Get position of fraction point
		let fractionPointPosition = timeString.indexOf("."); // Check for "full stop" symbol
		if(fractionPointPosition === (-1))
			fractionPointPosition = timeString.indexOf(","); // Check for "comma" symbol
		//endregion

		//region Get fraction part
		if(fractionPointPosition !== (-1))
		{
			//noinspection JSPrimitiveTypeWrapperUsage
			const fractionPartCheck = new Number(`0${timeString.substr(fractionPointPosition)}`);

			if(isNaN(fractionPartCheck.valueOf()))
				throw new Error("Wrong input string for convertion");

			fractionPart = fractionPartCheck.valueOf();

			dateTimeString = timeString.substr(0, fractionPointPosition);
		}
		else
			dateTimeString = timeString;
		//endregion

		//region Parse internal date
		switch(true)
		{
			case (dateTimeString.length === 8): // "YYYYMMDD"
				parser = /(\d{4})(\d{2})(\d{2})/ig;
				if(fractionPointPosition !== (-1))
					throw new Error("Wrong input string for convertion"); // Here we should not have a "fraction point"
				break;
			case (dateTimeString.length === 10): // "YYYYMMDDHH"
				parser = /(\d{4})(\d{2})(\d{2})(\d{2})/ig;

				if(fractionPointPosition !== (-1))
				{
					let fractionResult = 60 * fractionPart;
					this.minute = Math.floor(fractionResult);

					fractionResult = 60 * (fractionResult - this.minute);
					this.second = Math.floor(fractionResult);

					fractionResult = 1000 * (fractionResult - this.second);
					this.millisecond = Math.floor(fractionResult);
				}
				break;
			case (dateTimeString.length === 12): // "YYYYMMDDHHMM"
				parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

				if(fractionPointPosition !== (-1))
				{
					let fractionResult = 60 * fractionPart;
					this.second = Math.floor(fractionResult);

					fractionResult = 1000 * (fractionResult - this.second);
					this.millisecond = Math.floor(fractionResult);
				}
				break;
			case (dateTimeString.length === 14): // "YYYYMMDDHHMMSS"
				parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

				if(fractionPointPosition !== (-1))
				{
					const fractionResult = 1000 * fractionPart;
					this.millisecond = Math.floor(fractionResult);
				}
				break;
			default:
				throw new Error("Wrong input string for convertion");
		}
		//endregion

		//region Put parsed values at right places
		const parserArray = parser.exec(dateTimeString);
		if(parserArray === null)
			throw new Error("Wrong input string for convertion");

		for(let j = 1; j < parserArray.length; j++)
		{
			switch(j)
			{
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
		if(isUTC === false)
		{
			const tempDate = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);

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
	toString()
	{
		const outputArray = [];

		outputArray.push(padNumber(this.year, 4));
		outputArray.push(padNumber(this.month, 2));
		outputArray.push(padNumber(this.day, 2));
		outputArray.push(padNumber(this.hour, 2));
		outputArray.push(padNumber(this.minute, 2));
		outputArray.push(padNumber(this.second, 2));
		if(this.millisecond !== 0)
		{
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
	static blockName()
	{
		return "GeneralizedTime";
	}
	//**********************************************************************************
	/**
	 * Convertion for the block to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let object = {};
		
		//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
		try
		{
			object = super.toJSON();
		}
		catch(ex){}
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
}
//**************************************************************************************
/**
 * @extends Utf8String
 */
class DATE extends Utf8String
{
	//**********************************************************************************
	/**
	 * Constructor for "DATE" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 31; // DATE
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "DATE";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends Utf8String
 */
class TimeOfDay extends Utf8String
{
	//**********************************************************************************
	/**
	 * Constructor for "TimeOfDay" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 32; // TimeOfDay
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "TimeOfDay";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends Utf8String
 */
class DateTime extends Utf8String
{
	//**********************************************************************************
	/**
	 * Constructor for "DateTime" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 33; // DateTime
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "DateTime";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends Utf8String
 */
class Duration extends Utf8String
{
	//**********************************************************************************
	/**
	 * Constructor for "Duration" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 34; // Duration
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "Duration";
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * @extends Utf8String
 */
class TIME extends Utf8String
{
	//**********************************************************************************
	/**
	 * Constructor for "Time" class
	 * @param {Object} [parameters={}]
	 */
	constructor(parameters = {})
	{
		super(parameters);

		this.idBlock.tagClass = 1; // UNIVERSAL
		this.idBlock.tagNumber = 14; // Time
	}
	//**********************************************************************************
	/**
	 * Aux function, need to get a block name. Need to have it here for inhiritence
	 * @returns {string}
	 */
	static blockName()
	{
		return "TIME";
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of special ASN.1 schema type Choice
//**************************************************************************************
class Choice
{
	//**********************************************************************************
	/**
	 * Constructor for "Choice" class
	 * @param {Object} [parameters={}]
	 * @property {Array} [value] Array of ASN.1 types for make a choice from
	 * @property {boolean} [optional]
	 */
	constructor(parameters = {})
	{
		this.value = getParametersValue(parameters, "value", []);
		this.optional = getParametersValue(parameters, "optional", false);
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of special ASN.1 schema type Any
//**************************************************************************************
class Any
{
	//**********************************************************************************
	/**
	 * Constructor for "Any" class
	 * @param {Object} [parameters={}]
	 * @property {string} [name]
	 * @property {boolean} [optional]
	 */
	constructor(parameters = {})
	{
		this.name = getParametersValue(parameters, "name", "");
		this.optional = getParametersValue(parameters, "optional", false);
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of special ASN.1 schema type Repeated
//**************************************************************************************
class Repeated
{
	//**********************************************************************************
	/**
	 * Constructor for "Repeated" class
	 * @param {Object} [parameters={}]
	 * @property {string} [name]
	 * @property {boolean} [optional]
	 */
	constructor(parameters = {})
	{
		this.name = getParametersValue(parameters, "name", "");
		this.optional = getParametersValue(parameters, "optional", false);
		this.value = getParametersValue(parameters, "value", new Any());
		this.local = getParametersValue(parameters, "local", false); // Could local or global array to store elements
	}
	//**********************************************************************************
}
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of special ASN.1 schema type RawData
//**************************************************************************************
/**
 * @description Special class providing ability to have "toBER/fromBER" for raw ArrayBuffer
 */
class RawData
{
	//**********************************************************************************
	/**
	 * Constructor for "Repeated" class
	 * @param {Object} [parameters={}]
	 * @property {string} [name]
	 * @property {boolean} [optional]
	 */
	constructor(parameters = {})
	{
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
	fromBER(inputBuffer, inputOffset, inputLength)
	{
		this.data = inputBuffer.slice(inputOffset, inputLength);
		return (inputOffset + inputLength);
	}
	//**********************************************************************************
	/**
	 * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
	 * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
	 * @returns {ArrayBuffer}
	 */
	toBER(sizeOnly = false)
	{
		return this.data;
	}
	//**********************************************************************************
}
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
function LocalFromBER(inputBuffer, inputOffset, inputLength)
{
	const incomingOffset = inputOffset; // Need to store initial offset since "inputOffset" is changing in the function

	//region Local function changing a type for ASN.1 classes
	function localChangeType(inputObject, newType)
	{
		if(inputObject instanceof newType)
			return inputObject;

		const newObject = new newType();
		newObject.idBlock = inputObject.idBlock;
		newObject.lenBlock = inputObject.lenBlock;
		newObject.warnings = inputObject.warnings;
		//noinspection JSCheckFunctionSignatures
		newObject.valueBeforeDecode = inputObject.valueBeforeDecode.slice(0);

		return newObject;
	}
	//endregion

	//region Create a basic ASN.1 type since we need to return errors and warnings from the function
	let returnObject = new BaseBlock({}, Object);
	//endregion

	//region Basic check for parameters
	if(checkBufferParams(new LocalBaseBlock(), inputBuffer, inputOffset, inputLength) === false)
	{
		returnObject.error = "Wrong input parameters";
		return {
			offset: (-1),
			result: returnObject
		};
	}
	//endregion

	//region Getting Uint8Array from ArrayBuffer
	const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
	//endregion

	//region Initial checks
	if(intBuffer.length === 0)
	{
		this.error = "Zero buffer length";
		return {
			offset: (-1),
			result: returnObject
		};
	}
	//endregion

	//region Decode indentifcation block of ASN.1 BER structure
	let resultOffset = returnObject.idBlock.fromBER(inputBuffer, inputOffset, inputLength);
	returnObject.warnings.concat(returnObject.idBlock.warnings);
	if(resultOffset === (-1))
	{
		returnObject.error = returnObject.idBlock.error;
		return {
			offset: (-1),
			result: returnObject
		};
	}

	inputOffset = resultOffset;
	inputLength -= returnObject.idBlock.blockLength;
	//endregion

	//region Decode length block of ASN.1 BER structure
	resultOffset = returnObject.lenBlock.fromBER(inputBuffer, inputOffset, inputLength);
	returnObject.warnings.concat(returnObject.lenBlock.warnings);
	if(resultOffset === (-1))
	{
		returnObject.error = returnObject.lenBlock.error;
		return {
			offset: (-1),
			result: returnObject
		};
	}

	inputOffset = resultOffset;
	inputLength -= returnObject.lenBlock.blockLength;
	//endregion

	//region Check for usign indefinite length form in encoding for primitive types
	if((returnObject.idBlock.isConstructed === false) &&
		(returnObject.lenBlock.isIndefiniteForm === true))
	{
		returnObject.error = "Indefinite length form used for primitive encoding form";
		return {
			offset: (-1),
			result: returnObject
		};
	}
	//endregion

	//region Switch ASN.1 block type
	let newASN1Type = BaseBlock;

	switch(returnObject.idBlock.tagClass)
	{
		//region UNIVERSAL
		case 1:
			//region Check for reserved tag numbers
			if((returnObject.idBlock.tagNumber >= 37) &&
				(returnObject.idBlock.isHexOnly === false))
			{
				returnObject.error = "UNIVERSAL 37 and upper tags are reserved by ASN.1 standard";
				return {
					offset: (-1),
					result: returnObject
				};
			}
			//endregion

			switch(returnObject.idBlock.tagNumber)
			{
				//region EndOfContent type
				case 0:
					//region Check for EndOfContent type
					if((returnObject.idBlock.isConstructed === true) &&
						(returnObject.lenBlock.length > 0))
					{
						returnObject.error = "Type [UNIVERSAL 0] is reserved";
						return {
							offset: (-1),
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
						offset: (-1),
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
						let newObject;

						if(returnObject.idBlock.isConstructed === true)
							newObject = new Constructed();
						else
							newObject = new Primitive();

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
				if(returnObject.idBlock.isConstructed === true)
					newASN1Type = Constructed;
				else
					newASN1Type = Primitive;
			}
		//endregion
	}
	//endregion

	//region Change type and perform BER decoding
	returnObject = localChangeType(returnObject, newASN1Type);
	resultOffset = returnObject.fromBER(inputBuffer, inputOffset, (returnObject.lenBlock.isIndefiniteForm === true) ? inputLength : returnObject.lenBlock.length);
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
function fromBER(inputBuffer)
{
	if(inputBuffer.byteLength === 0)
	{
		const result = new BaseBlock({}, Object);
		result.error = "Input buffer has zero length";

		return {
			offset: (-1),
			result
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
function compareSchema(root, inputData, inputSchema)
{
	//region Special case for Choice schema element type
	if(inputSchema instanceof Choice)
	{

		for(let j = 0; j < inputSchema.value.length; j++)
		{
			const result = compareSchema(root, inputData, inputSchema.value[j]);
			if(result.verified === true)
			{
				return {
					verified: true,
					result: root
				};
			}
		}

		{
			const _result = {
				verified: false,
				result: {
					error: "Wrong values for Choice type"
				}
			};

			if(inputSchema.hasOwnProperty("name"))
				_result.name = inputSchema.name;

			return _result;
		}
	}
	//endregion

	//region Special case for Any schema element type
	if(inputSchema instanceof Any)
	{
		//region Add named component of ASN.1 schema
		if(inputSchema.hasOwnProperty("name"))
			root[inputSchema.name] = inputData;
		//endregion

		return {
			verified: true,
			result: root
		};
	}
	//endregion

	//region Initial check
	if((root instanceof Object) === false)
	{
		return {
			verified: false,
			result: { error: "Wrong root object" }
		};
	}

	if((inputData instanceof Object) === false)
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 data" }
		};
	}

	if((inputSchema instanceof Object) === false)
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 schema" }
		};
	}

	if(("idBlock" in inputSchema) === false)
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 schema" }
		};
	}
	//endregion

	//region Comparing idBlock properties in ASN.1 data and ASN.1 schema
	//region Encode and decode ASN.1 schema idBlock
	/// <remarks>This encoding/decoding is neccessary because could be an errors in schema definition</remarks>
	if(("fromBER" in inputSchema.idBlock) === false)
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 schema" }
		};
	}

	if(("toBER" in inputSchema.idBlock) === false)
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 schema" }
		};
	}

	const encodedId = inputSchema.idBlock.toBER(false);
	if(encodedId.byteLength === 0)
	{
		return {
			verified: false,
			result: { error: "Error encoding idBlock for ASN.1 schema" }
		};
	}

	const decodedOffset = inputSchema.idBlock.fromBER(encodedId, 0, encodedId.byteLength);
	if(decodedOffset === (-1))
	{
		return {
			verified: false,
			result: { error: "Error decoding idBlock for ASN.1 schema" }
		};
	}
	//endregion

	//region tagClass
	if(inputSchema.idBlock.hasOwnProperty("tagClass") === false)
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 schema" }
		};
	}

	if(inputSchema.idBlock.tagClass !== inputData.idBlock.tagClass)
	{
		return {
			verified: false,
			result: root
		};
	}
	//endregion
	//region tagNumber
	if(inputSchema.idBlock.hasOwnProperty("tagNumber") === false)
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 schema" }
		};
	}

	if(inputSchema.idBlock.tagNumber !== inputData.idBlock.tagNumber)
	{
		return {
			verified: false,
			result: root
		};
	}
	//endregion
	//region isConstructed
	if(inputSchema.idBlock.hasOwnProperty("isConstructed") === false)
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 schema" }
		};
	}

	if(inputSchema.idBlock.isConstructed !== inputData.idBlock.isConstructed)
	{
		return {
			verified: false,
			result: root
		};
	}
	//endregion
	//region isHexOnly
	if(("isHexOnly" in inputSchema.idBlock) === false) // Since 'isHexOnly' is an inhirited property
	{
		return {
			verified: false,
			result: { error: "Wrong ASN.1 schema" }
		};
	}

	if(inputSchema.idBlock.isHexOnly !== inputData.idBlock.isHexOnly)
	{
		return {
			verified: false,
			result: root
		};
	}
	//endregion
	//region valueHex
	if(inputSchema.idBlock.isHexOnly === true)
	{
		if(("valueHex" in inputSchema.idBlock) === false) // Since 'valueHex' is an inhirited property
		{
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		const schemaView = new Uint8Array(inputSchema.idBlock.valueHex);
		const asn1View = new Uint8Array(inputData.idBlock.valueHex);

		if(schemaView.length !== asn1View.length)
		{
			return {
				verified: false,
				result: root
			};
		}

		for(let i = 0; i < schemaView.length; i++)
		{
			if(schemaView[i] !== asn1View[1])
			{
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
	if(inputSchema.hasOwnProperty("name"))
	{
		inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
		if(inputSchema.name !== "")
			root[inputSchema.name] = inputData;
	}
	//endregion

	//region Getting next ASN.1 block for comparition
	if(inputSchema.idBlock.isConstructed === true)
	{
		let admission = 0;
		let result = { verified: false };

		let maxLength = inputSchema.valueBlock.value.length;

		if(maxLength > 0)
		{
			if(inputSchema.valueBlock.value[0] instanceof Repeated)
				maxLength = inputData.valueBlock.value.length;
		}

		//region Special case when constructive value has no elements
		if(maxLength === 0)
		{
			return {
				verified: true,
				result: root
			};
		}
		//endregion

		//region Special case when "inputData" has no values and "inputSchema" has all optional values
		if((inputData.valueBlock.value.length === 0) &&
			(inputSchema.valueBlock.value.length !== 0))
		{
			let _optional = true;

			for(let i = 0; i < inputSchema.valueBlock.value.length; i++)
				_optional = _optional && (inputSchema.valueBlock.value[i].optional || false);

			if(_optional === true)
			{
				return {
					verified: true,
					result: root
				};
			}

			//region Delete early added name of block
			if(inputSchema.hasOwnProperty("name"))
			{
				inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
				if(inputSchema.name !== "")
					delete root[inputSchema.name];
			}
			//endregion

			root.error = "Inconsistent object length";

			return {
				verified: false,
				result: root
			};
		}
		//endregion

		for(let i = 0; i < maxLength; i++)
		{
			//region Special case when there is an "optional" element of ASN.1 schema at the end
			if((i - admission) >= inputData.valueBlock.value.length)
			{
				if(inputSchema.valueBlock.value[i].optional === false)
				{
					const _result = {
						verified: false,
						result: root
					};

					root.error = "Inconsistent length between ASN.1 data and schema";

					//region Delete early added name of block
					if(inputSchema.hasOwnProperty("name"))
					{
						inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
						if(inputSchema.name !== "")
						{
							delete root[inputSchema.name];
							_result.name = inputSchema.name;
						}
					}
					//endregion

					return _result;
				}
			}
			//endregion
			else
			{
				//region Special case for Repeated type of ASN.1 schema element
				if(inputSchema.valueBlock.value[0] instanceof Repeated)
				{
					result = compareSchema(root, inputData.valueBlock.value[i], inputSchema.valueBlock.value[0].value);
					if(result.verified === false)
					{
						if(inputSchema.valueBlock.value[0].optional === true)
							admission++;
						else
						{
							//region Delete early added name of block
							if(inputSchema.hasOwnProperty("name"))
							{
								inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
								if(inputSchema.name !== "")
									delete root[inputSchema.name];
							}
							//endregion

							return result;
						}
					}

					if(("name" in inputSchema.valueBlock.value[0]) && (inputSchema.valueBlock.value[0].name.length > 0))
					{
						let arrayRoot = {};

						if(("local" in inputSchema.valueBlock.value[0]) && (inputSchema.valueBlock.value[0].local === true))
							arrayRoot = inputData;
						else
							arrayRoot = root;

						if(typeof arrayRoot[inputSchema.valueBlock.value[0].name] === "undefined")
							arrayRoot[inputSchema.valueBlock.value[0].name] = [];

						arrayRoot[inputSchema.valueBlock.value[0].name].push(inputData.valueBlock.value[i]);
					}
				}
				//endregion
				else
				{
					result = compareSchema(root, inputData.valueBlock.value[i - admission], inputSchema.valueBlock.value[i]);
					if(result.verified === false)
					{
						if(inputSchema.valueBlock.value[i].optional === true)
							admission++;
						else
						{
							//region Delete early added name of block
							if(inputSchema.hasOwnProperty("name"))
							{
								inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
								if(inputSchema.name !== "")
									delete root[inputSchema.name];
							}
							//endregion

							return result;
						}
					}
				}
			}
		}

		if(result.verified === false) // The situation may take place if last element is "optional" and verification failed
		{
			const _result = {
				verified: false,
				result: root
			};

			//region Delete early added name of block
			if(inputSchema.hasOwnProperty("name"))
			{
				inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
				if(inputSchema.name !== "")
				{
					delete root[inputSchema.name];
					_result.name = inputSchema.name;
				}
			}
			//endregion

			return _result;
		}

		return {
			verified: true,
			result: root
		};
	}
	//endregion
	//region Ability to parse internal value for primitive-encoded value (value of OctetString, for example)
	if(("primitiveSchema" in inputSchema) &&
		("valueHex" in inputData.valueBlock))
	{
		//region Decoding of raw ASN.1 data
		const asn1 = fromBER(inputData.valueBlock.valueHex);
		if(asn1.offset === (-1))
		{
			const _result = {
				verified: false,
				result: asn1.result
			};

			//region Delete early added name of block
			if(inputSchema.hasOwnProperty("name"))
			{
				inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
				if(inputSchema.name !== "")
				{
					delete root[inputSchema.name];
					_result.name = inputSchema.name;
				}
			}
			//endregion

			return _result;
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
//**************************************************************************************
//endregion
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class AlgorithmIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for AlgorithmIdentifier class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {string} [algorithmId] ObjectIdentifier for algorithm (string representation)
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc ObjectIdentifier for algorithm (string representation)
		 */
		this.algorithmId = getParametersValue(parameters, "algorithmId", AlgorithmIdentifier.defaultValues("algorithmId"));

		if("algorithmParams" in parameters)
			/**
			 * @type {Object}
			 * @desc Any algorithm parameters
			 */
			this.algorithmParams = getParametersValue(parameters, "algorithmParams", AlgorithmIdentifier.defaultValues("algorithmParams"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "algorithmId":
				return "";
			case "algorithmParams":
				return new Any();
			default:
				throw new Error(`Invalid member name for AlgorithmIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "algorithmId":
				return (memberValue === "");
			case "algorithmParams":
				return (memberValue instanceof Any);
			default:
				throw new Error(`Invalid member name for AlgorithmIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AlgorithmIdentifier  ::=  Sequence  {
	 *    algorithm               OBJECT IDENTIFIER,
	 *    parameters              ANY DEFINED BY algorithm OPTIONAL  }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} algorithmIdentifier ObjectIdentifier for the algorithm
		 * @property {string} algorithmParams Any algorithm parameters
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			optional: (names.optional || false),
			value: [
				new ObjectIdentifier({ name: (names.algorithmIdentifier || "") }),
				new Any({ name: (names.algorithmParams || ""), optional: true })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"algorithm",
			"params"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AlgorithmIdentifier.schema({
				names: {
					algorithmIdentifier: "algorithm",
					algorithmParams: "params"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AlgorithmIdentifier");
		//endregion

		//region Get internal properties from parsed schema
		this.algorithmId = asn1.result.algorithm.valueBlock.toString();
		if("params" in asn1.result)
			this.algorithmParams = asn1.result.params;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		outputArray.push(new ObjectIdentifier({ value: this.algorithmId }));
		if(("algorithmParams" in this) && ((this.algorithmParams instanceof Any) === false))
			outputArray.push(this.algorithmParams);
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			algorithmId: this.algorithmId
		};

		if(("algorithmParams" in this) && ((this.algorithmParams instanceof Any) === false))
			object.algorithmParams = this.algorithmParams.toJSON();

		return object;
	}
	//**********************************************************************************
	/**
	 * Check that two "AlgorithmIdentifiers" are equal
	 * @param {AlgorithmIdentifier} algorithmIdentifier
	 * @returns {boolean}
	 */
	isEqual(algorithmIdentifier)
	{
		//region Check input type
		if((algorithmIdentifier instanceof AlgorithmIdentifier) === false)
			return false;
		//endregion

		//region Check "algorithm_id"
		if(this.algorithmId !== algorithmIdentifier.algorithmId)
			return false;
		//endregion

		//region Check "algorithm_params"
		if("algorithmParams" in this)
		{
			if("algorithmParams" in algorithmIdentifier)
				return JSON.stringify(this.algorithmParams) === JSON.stringify(algorithmIdentifier.algorithmParams);

			return false;
		}

		if("algorithmParams" in algorithmIdentifier)
			return false;
		//endregion

		return true;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5480
 */
class ECPublicKey
{
	//**********************************************************************************
	/**
	 * Constructor for ECCPublicKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {ArrayBuffer}
		 * @desc type
		 */
		this.x = getParametersValue(parameters, "x", ECPublicKey.defaultValues("x"));
		/**
		 * @type {ArrayBuffer}
		 * @desc values
		 */
		this.y = getParametersValue(parameters, "y", ECPublicKey.defaultValues("y"));
		/**
		 * @type {string}
		 * @desc namedCurve
		 */
		this.namedCurve = getParametersValue(parameters, "namedCurve", ECPublicKey.defaultValues("namedCurve"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "x":
			case "y":
				return new ArrayBuffer(0);
			case "namedCurve":
				return "";
			default:
				throw new Error(`Invalid member name for ECCPublicKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "x":
			case "y":
				return (isEqualBuffer(memberValue, ECPublicKey.defaultValues(memberName)));
			case "namedCurve":
				return (memberValue === "");
			default:
				throw new Error(`Invalid member name for ECCPublicKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		return new RawData();
	}
	//**********************************************************************************
	/**
	 * Convert ArrayBuffer into current class
	 * @param {!ArrayBuffer} schema Special case: schema is an ArrayBuffer
	 */
	fromSchema(schema)
	{
		//region Check the schema is valid
		if((schema instanceof ArrayBuffer) === false)
			throw new Error("Object's schema was not verified against input data for ECPublicKey");

		const view = new Uint8Array(schema);
		if(view[0] !== 0x04)
			throw new Error("Object's schema was not verified against input data for ECPublicKey");
		//endregion

		//region Get internal properties from parsed schema
		let coordinateLength;

		switch(this.namedCurve)
		{
			case "1.2.840.10045.3.1.7": // P-256
				coordinateLength = 32;
				break;
			case "1.3.132.0.10": //K-256
				coordinateLength = 32;
				break;
			case "1.3.132.0.34": // P-384
				coordinateLength = 48;
				break;
			case "1.3.132.0.35": // P-521
				coordinateLength = 66;
				break;
			default:
				throw new Error(`Incorrect curve OID: ${this.namedCurve}`);
		}

		if(schema.byteLength !== (coordinateLength * 2 + 1))
			throw new Error("Object's schema was not verified against input data for ECPublicKey");
		
		this.x = schema.slice(1, coordinateLength + 1);
		this.y = schema.slice(1 + coordinateLength, coordinateLength * 2 + 1);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		return new RawData({ data: utilConcatBuf(
			(new Uint8Array([0x04])).buffer,
			this.x,
			this.y
		)
		});
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		let crvName = "";

		switch(this.namedCurve)
		{
			case "1.2.840.10045.3.1.7": // P-256
				crvName = "P-256";
				break;
			case "1.3.132.0.34": // P-384
				crvName = "P-384";
				break;
			case "1.3.132.0.35": // P-521
				crvName = "P-521";
				break;
			case "1.3.132.0.10": //K-256
				crvName = "K-256";
				break;
			default:
		}

		return {
			crv: crvName,
			x: toBase64(arrayBufferToString(this.x), true, true, false),
			y: toBase64(arrayBufferToString(this.y), true, true, false)
		};
	}
	//**********************************************************************************
	/**
	 * Convert JSON value into current object
	 * @param {Object} json
	 */
	fromJSON(json)
	{
		let coodinateLength = 0;

		if("crv" in json)
		{
			switch(json.crv.toUpperCase())
			{
					case "P-256":
					this.namedCurve = "1.2.840.10045.3.1.7";
					coodinateLength = 32;
					break;
				case "K-256":
					this.namedCurve = "1.3.132.0.10";
					coodinateLength = 32;
					break;
				case "P-384":
					this.namedCurve = "1.3.132.0.34";
					coodinateLength = 48;
					break;
				case "P-521":
					this.namedCurve = "1.3.132.0.35";
					coodinateLength = 66;
				default:
			}
		}
		else
			throw new Error("Absent mandatory parameter \"crv\"");

		if("x" in json)
		{
			const convertBuffer = stringToArrayBuffer(fromBase64(json.x, true));
			
			if(convertBuffer.byteLength < coodinateLength)
			{
				this.x = new ArrayBuffer(coodinateLength);
				const view = new Uint8Array(this.x);
				const convertBufferView = new Uint8Array(convertBuffer);
				view.set(convertBufferView, 1);
			}
			else
				this.x = convertBuffer.slice(0, coodinateLength);
		}
		else
			throw new Error("Absent mandatory parameter \"x\"");

		if("y" in json)
		{
			const convertBuffer = stringToArrayBuffer(fromBase64(json.y, true));
			
			if(convertBuffer.byteLength < coodinateLength)
			{
				this.y = new ArrayBuffer(coodinateLength);
				const view = new Uint8Array(this.y);
				const convertBufferView = new Uint8Array(convertBuffer);
				view.set(convertBufferView, 1);
			}
			else
				this.y = convertBuffer.slice(0, coodinateLength);
		}
		else
			throw new Error("Absent mandatory parameter \"y\"");
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC3447
 */
class RSAPublicKey
{
	//**********************************************************************************
	/**
	 * Constructor for RSAPublicKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {Integer} [modulus]
	 * @property {Integer} [publicExponent]
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Integer}
		 * @desc Modulus part of RSA public key
		 */
		this.modulus = getParametersValue(parameters, "modulus", RSAPublicKey.defaultValues("modulus"));
		/**
		 * @type {Integer}
		 * @desc Public exponent of RSA public key
		 */
		this.publicExponent = getParametersValue(parameters, "publicExponent", RSAPublicKey.defaultValues("publicExponent"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "modulus":
				return new Integer();
			case "publicExponent":
				return new Integer();
			default:
				throw new Error(`Invalid member name for RSAPublicKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RSAPublicKey ::= Sequence {
	 *    modulus           Integer,  -- n
	 *    publicExponent    Integer   -- e
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} utcTimeName Name for "utcTimeName" choice
		 * @property {string} generalTimeName Name for "generalTimeName" choice
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.modulus || "") }),
				new Integer({ name: (names.publicExponent || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"modulus",
			"publicExponent"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RSAPublicKey.schema({
				names: {
					modulus: "modulus",
					publicExponent: "publicExponent"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RSAPublicKey");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				this.modulus.convertToDER(),
				this.publicExponent
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
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
	fromJSON(json)
	{
		if("n" in json)
		{
			const array = stringToArrayBuffer(fromBase64(json.n, true));
			this.modulus = new Integer({ valueHex: array.slice(0, Math.pow(2, nearestPowerOf2(array.byteLength))) });
		}
		else
			throw new Error("Absent mandatory parameter \"n\"");

		if("e" in json)
			this.publicExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.e, true)).slice(0, 3) });
		else
			throw new Error("Absent mandatory parameter \"e\"");
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class PublicKeyInfo 
{
	//**********************************************************************************
	/**
	 * Constructor for PublicKeyInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc Algorithm identifier
		 */
		this.algorithm = getParametersValue(parameters, "algorithm", PublicKeyInfo.defaultValues("algorithm"));
		/**
		 * @type {BitString}
		 * @desc Subject public key value
		 */
		this.subjectPublicKey = getParametersValue(parameters, "subjectPublicKey", PublicKeyInfo.defaultValues("subjectPublicKey"));
		
		if("parsedKey" in parameters)
			/**
			 * @type {ECPublicKey|RSAPublicKey}
			 * @desc Parsed public key value
			 */
			this.parsedKey = getParametersValue(parameters, "parsedKey", PublicKeyInfo.defaultValues("parsedKey"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "algorithm":
				return new AlgorithmIdentifier();
			case "subjectPublicKey":
				return new BitString();
			default:
				throw new Error(`Invalid member name for PublicKeyInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * SubjectPublicKeyInfo  ::=  Sequence  {
	 *    algorithm            AlgorithmIdentifier,
	 *    subjectPublicKey     BIT STRING  }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [algorithm]
		 * @property {string} [subjectPublicKey]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				AlgorithmIdentifier.schema(names.algorithm || {}),
				new BitString({ name: (names.subjectPublicKey || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"algorithm",
			"subjectPublicKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PublicKeyInfo.schema({
				names: {
					algorithm: {
						names: {
							blockName: "algorithm"
						}
					},
					subjectPublicKey: "subjectPublicKey"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PublicKeyInfo");
		//endregion
		
		//region Get internal properties from parsed schema
		this.algorithm = new AlgorithmIdentifier({ schema: asn1.result.algorithm });
		this.subjectPublicKey = asn1.result.subjectPublicKey;
		
		switch(this.algorithm.algorithmId)
		{
			case "1.2.840.10045.2.1": // ECDSA
				if("algorithmParams" in this.algorithm)
				{
					if(this.algorithm.algorithmParams instanceof ObjectIdentifier)
					{
						try
						{
							this.parsedKey = new ECPublicKey({
								namedCurve: this.algorithm.algorithmParams.valueBlock.toString(),
								schema: this.subjectPublicKey.valueBlock.valueHex
							});
						}
						catch(ex){} // Could be a problems during recognision of internal public key data here. Let's ignore them.
					}
				}
				break;
			case "1.2.840.113549.1.1.1": // RSA
				{
					const publicKeyASN1 = fromBER(this.subjectPublicKey.valueBlock.valueHex);
					if(publicKeyASN1.offset !== (-1))
					{
						try
						{
							this.parsedKey = new RSAPublicKey({ schema: publicKeyASN1.result });
						}
						catch(ex){} // Could be a problems during recognision of internal public key data here. Let's ignore them.
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				this.algorithm.toSchema(),
				this.subjectPublicKey
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		//region Return common value in case we do not have enough info fo making JWK
		if(("parsedKey" in this) === false)
		{
			return {
				algorithm: this.algorithm.toJSON(),
				subjectPublicKey: this.subjectPublicKey.toJSON()
			};
		}
		//endregion
		
		//region Making JWK
		const jwk = {};
		
		switch(this.algorithm.algorithmId)
		{
			case "1.2.840.10045.2.1": // ECDSA
				jwk.kty = "EC";
				break;
			case "1.2.840.113549.1.1.1": // RSA
				jwk.kty = "RSA";
				break;
			default:
		}
		
		const publicKeyJWK = this.parsedKey.toJSON();
		
		for(const key of Object.keys(publicKeyJWK))
			jwk[key] = publicKeyJWK[key];
		
		return jwk;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert JSON value into current object
	 * @param {Object} json
	 */
	fromJSON(json)
	{
		if("kty" in json)
		{
			switch(json.kty.toUpperCase())
			{
				case "EC":
					this.parsedKey = new ECPublicKey({ json });
					
					this.algorithm = new AlgorithmIdentifier({
						algorithmId: "1.2.840.10045.2.1",
						algorithmParams: new ObjectIdentifier({ value: this.parsedKey.namedCurve })
					});
					break;
				case "RSA":
					this.parsedKey = new RSAPublicKey({ json });
					
					this.algorithm = new AlgorithmIdentifier({
						algorithmId: "1.2.840.113549.1.1.1",
						algorithmParams: new Null()
					});
					break;
				default:
					throw new Error(`Invalid value for "kty" parameter: ${json.kty}`);
			}
			
			this.subjectPublicKey = new BitString({ valueHex: this.parsedKey.toSchema().toBER(false) });
		}
	}
	//**********************************************************************************
	importKey(publicKey)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		const _this = this;
		//endregion
		
		//region Initial check
		if(typeof publicKey === "undefined")
			return Promise.reject("Need to provide publicKey input parameter");
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Export public key
		sequence = sequence.then(() =>
			crypto.exportKey("spki", publicKey));
		//endregion
		
		//region Initialize internal variables by parsing exported value
		sequence = sequence.then(
			/**
			 * @param {ArrayBuffer} exportedKey
			 */
			exportedKey =>
			{
				const asn1 = fromBER(exportedKey);
				try
				{
					_this.fromSchema(asn1.result);
				}
				catch(exception)
				{
					return Promise.reject("Error during initializing object from schema");
				}
				
				return undefined;
			},
			error => Promise.reject(`Error during exporting public key: ${error}`)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC2986
 */
class Attribute {
	//**********************************************************************************
	/**
	 * Constructor for Attribute class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc ObjectIdentifier for attribute (string representation)
		 */
		this.type = getParametersValue(parameters, "type", Attribute.defaultValues("type"));
		/**
		 * @type {Array}
		 * @desc Any attribute values
		 */
		this.values = getParametersValue(parameters, "values", Attribute.defaultValues("values"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "type":
				return "";
			case "values":
				return [];
			default:
				throw new Error(`Invalid member name for Attribute class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "type":
				return (memberValue === "");
			case "values":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for Attribute class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Attribute { ATTRIBUTE:IOSet } ::= SEQUENCE {
	 *    type   ATTRIBUTE.&id({IOSet}),
	 *    values SET SIZE(1..MAX) OF ATTRIBUTE.&Type({IOSet}{@type})
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [type]
		 * @property {string} [setName]
		 * @property {string} [values]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.type || "") }),
				new Set({
					name: (names.setName || ""),
					value: [
						new Repeated({
							name: (names.values || ""),
							value: new Any()
						})
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"type",
			"values"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			Attribute.schema({
				names: {
					type: "type",
					values: "values"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Attribute");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.type }),
				new Set({
					value: this.values
				})
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			type: this.type,
			values: Array.from(this.values, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5915
 */
class ECPrivateKey
{
	//**********************************************************************************
	/**
	 * Constructor for ECPrivateKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", ECPrivateKey.defaultValues("version"));
		/**
		 * @type {OctetString}
		 * @desc privateKey
		 */
		this.privateKey = getParametersValue(parameters, "privateKey", ECPrivateKey.defaultValues("privateKey"));

		if("namedCurve" in parameters)
			/**
			 * @type {string}
			 * @desc namedCurve
			 */
			this.namedCurve = getParametersValue(parameters, "namedCurve", ECPrivateKey.defaultValues("namedCurve"));

		if("publicKey" in parameters)
			/**
			 * @type {ECPublicKey}
			 * @desc publicKey
			 */
			this.publicKey = getParametersValue(parameters, "publicKey", ECPrivateKey.defaultValues("publicKey"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 1;
			case "privateKey":
				return new OctetString();
			case "namedCurve":
				return "";
			case "publicKey":
				return new ECPublicKey();
			default:
				throw new Error(`Invalid member name for ECCPrivateKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "version":
				return (memberValue === ECPrivateKey.defaultValues(memberName));
			case "privateKey":
				return (memberValue.isEqual(ECPrivateKey.defaultValues(memberName)));
			case "namedCurve":
				return (memberValue === "");
			case "publicKey":
				return ((ECPublicKey.compareWithDefault("namedCurve", memberValue.namedCurve)) &&
						(ECPublicKey.compareWithDefault("x", memberValue.x)) &&
						(ECPublicKey.compareWithDefault("y", memberValue.y)));
			default:
				throw new Error(`Invalid member name for ECCPrivateKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * ECPrivateKey ::= SEQUENCE {
	 * version        INTEGER { ecPrivkeyVer1(1) } (ecPrivkeyVer1),
	 * privateKey     OCTET STRING,
	 * parameters [0] ECParameters {{ NamedCurve }} OPTIONAL,
	 * publicKey  [1] BIT STRING OPTIONAL
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [privateKey]
		 * @property {string} [namedCurve]
		 * @property {string} [publicKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				new OctetString({ name: (names.privateKey || "") }),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new ObjectIdentifier({ name: (names.namedCurve || "") })
					]
				}),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new BitString({ name: (names.publicKey || "") })
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"privateKey",
			"namedCurve",
			"publicKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			ECPrivateKey.schema({
				names: {
					version: "version",
					privateKey: "privateKey",
					namedCurve: "namedCurve",
					publicKey: "publicKey"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ECPrivateKey");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.privateKey = asn1.result.privateKey;

		if("namedCurve" in asn1.result)
			this.namedCurve = asn1.result.namedCurve.valueBlock.toString();

		if("publicKey" in asn1.result)
		{
			const publicKeyData = { schema: asn1.result.publicKey.valueBlock.valueHex };
			if("namedCurve" in this)
				publicKeyData.namedCurve = this.namedCurve;

			this.publicKey = new ECPublicKey(publicKeyData);
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const outputArray = [
			new Integer({ value: this.version }),
			this.privateKey
		];

		if("namedCurve" in this)
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new ObjectIdentifier({ value: this.namedCurve })
				]
			}));
		}

		if("publicKey" in this)
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [
					new BitString({ valueHex: this.publicKey.toSchema().toBER(false) })
				]
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
	toJSON()
	{
		if((("namedCurve" in this) === false) || (ECPrivateKey.compareWithDefault("namedCurve", this.namedCurve)))
			throw new Error("Not enough information for making JSON: absent \"namedCurve\" value");

		let crvName = "";

		switch(this.namedCurve)
		{
			case "1.2.840.10045.3.1.7": // P-256
				crvName = "P-256";
				break;
			case "1.3.132.0.34": // P-384
				crvName = "P-384";
				break;
			case "1.3.132.0.35": // P-521
				crvName = "P-521";
				break;
			case "1.3.132.0.10": //K-256
				crvName = "K-256";
			default:
		}

		const privateKeyJSON = {
			crv: crvName,
			d: toBase64(arrayBufferToString(this.privateKey.valueBlock.valueHex), true, true, false)
		};

		if("publicKey" in this)
		{
			const publicKeyJSON = this.publicKey.toJSON();

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
	fromJSON(json)
	{
		let coodinateLength = 0;

		if("crv" in json)
		{
			switch(json.crv.toUpperCase())
			{
				case "P-256":
					this.namedCurve = "1.2.840.10045.3.1.7";
					coodinateLength = 32;
					break;
				case "K-256":
					this.namedCurve = "1.3.132.0.10";
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
		}
		else
			throw new Error("Absent mandatory parameter \"crv\"");

		if("d" in json)
		{
			const convertBuffer = stringToArrayBuffer(fromBase64(json.d, true));
			
			if(convertBuffer.byteLength < coodinateLength)
			{
				const buffer = new ArrayBuffer(coodinateLength);
				const view = new Uint8Array(buffer);
				const convertBufferView = new Uint8Array(convertBuffer);
				view.set(convertBufferView, 1);
				
				this.privateKey = new OctetString({ valueHex: buffer });
			}
			else
				this.privateKey = new OctetString({ valueHex: convertBuffer.slice(0, coodinateLength) });
		}
		else
			throw new Error("Absent mandatory parameter \"d\"");

		if(("x" in json) && ("y" in json))
			this.publicKey = new ECPublicKey({ json });
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC3447
 */
class OtherPrimeInfo
{
	//**********************************************************************************
	/**
	 * Constructor for OtherPrimeInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Integer}
		 * @desc prime
		 */
		this.prime = getParametersValue(parameters, "prime", OtherPrimeInfo.defaultValues("prime"));
		/**
		 * @type {Integer}
		 * @desc exponent
		 */
		this.exponent = getParametersValue(parameters, "exponent", OtherPrimeInfo.defaultValues("exponent"));
		/**
		 * @type {Integer}
		 * @desc coefficient
		 */
		this.coefficient = getParametersValue(parameters, "coefficient", OtherPrimeInfo.defaultValues("coefficient"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "prime":
				return new Integer();
			case "exponent":
				return new Integer();
			case "coefficient":
				return new Integer();
			default:
				throw new Error(`Invalid member name for OtherPrimeInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherPrimeInfo ::= Sequence {
	 *    prime             Integer,  -- ri
	 *    exponent          Integer,  -- di
	 *    coefficient       Integer   -- ti
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{

		/**
		 * @type {Object}
		 * @property {string} prime
		 * @property {string} exponent
		 * @property {string} coefficient
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.prime || "") }),
				new Integer({ name: (names.exponent || "") }),
				new Integer({ name: (names.coefficient || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"prime",
			"exponent",
			"coefficient"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			OtherPrimeInfo.schema({
				names: {
					prime: "prime",
					exponent: "exponent",
					coefficient: "coefficient"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherPrimeInfo");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				this.prime.convertToDER(),
				this.exponent.convertToDER(),
				this.coefficient.convertToDER()
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
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
	fromJSON(json)
	{
		if("r" in json)
			this.prime = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.r, true)) });
		else
			throw new Error("Absent mandatory parameter \"r\"");

		if("d" in json)
			this.exponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.d, true)) });
		else
			throw new Error("Absent mandatory parameter \"d\"");

		if("t" in json)
			this.coefficient = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.t, true)) });
		else
			throw new Error("Absent mandatory parameter \"t\"");
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC3447
 */
class RSAPrivateKey
{
	//**********************************************************************************
	/**
	 * Constructor for RSAPrivateKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", RSAPrivateKey.defaultValues("version"));
		/**
		 * @type {Integer}
		 * @desc modulus
		 */
		this.modulus = getParametersValue(parameters, "modulus", RSAPrivateKey.defaultValues("modulus"));
		/**
		 * @type {Integer}
		 * @desc publicExponent
		 */
		this.publicExponent = getParametersValue(parameters, "publicExponent", RSAPrivateKey.defaultValues("publicExponent"));
		/**
		 * @type {Integer}
		 * @desc privateExponent
		 */
		this.privateExponent = getParametersValue(parameters, "privateExponent", RSAPrivateKey.defaultValues("privateExponent"));
		/**
		 * @type {Integer}
		 * @desc prime1
		 */
		this.prime1 = getParametersValue(parameters, "prime1", RSAPrivateKey.defaultValues("prime1"));
		/**
		 * @type {Integer}
		 * @desc prime2
		 */
		this.prime2 = getParametersValue(parameters, "prime2", RSAPrivateKey.defaultValues("prime2"));
		/**
		 * @type {Integer}
		 * @desc exponent1
		 */
		this.exponent1 = getParametersValue(parameters, "exponent1", RSAPrivateKey.defaultValues("exponent1"));
		/**
		 * @type {Integer}
		 * @desc exponent2
		 */
		this.exponent2 = getParametersValue(parameters, "exponent2", RSAPrivateKey.defaultValues("exponent2"));
		/**
		 * @type {Integer}
		 * @desc coefficient
		 */
		this.coefficient = getParametersValue(parameters, "coefficient", RSAPrivateKey.defaultValues("coefficient"));

		if("otherPrimeInfos" in parameters)
			/**
			 * @type {Array.<OtherPrimeInfo>}
			 * @desc otherPrimeInfos
			 */
			this.otherPrimeInfos = getParametersValue(parameters, "otherPrimeInfos", RSAPrivateKey.defaultValues("otherPrimeInfos"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
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
				throw new Error(`Invalid member name for RSAPrivateKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RSAPrivateKey ::= Sequence {
	 *    version           Version,
	 *    modulus           Integer,  -- n
	 *    publicExponent    Integer,  -- e
	 *    privateExponent   Integer,  -- d
	 *    prime1            Integer,  -- p
	 *    prime2            Integer,  -- q
	 *    exponent1         Integer,  -- d mod (p-1)
	 *    exponent2         Integer,  -- d mod (q-1)
	 *    coefficient       Integer,  -- (inverse of q) mod p
	 *    otherPrimeInfos   OtherPrimeInfos OPTIONAL
	 * }
	 *
	 * OtherPrimeInfos ::= Sequence SIZE(1..MAX) OF OtherPrimeInfo
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
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
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				new Integer({ name: (names.modulus || "") }),
				new Integer({ name: (names.publicExponent || "") }),
				new Integer({ name: (names.privateExponent || "") }),
				new Integer({ name: (names.prime1 || "") }),
				new Integer({ name: (names.prime2 || "") }),
				new Integer({ name: (names.exponent1 || "") }),
				new Integer({ name: (names.exponent2 || "") }),
				new Integer({ name: (names.coefficient || "") }),
				new Sequence({
					optional: true,
					value: [
						new Repeated({
							name: (names.otherPrimeInfosName || ""),
							value: OtherPrimeInfo.schema(names.otherPrimeInfo || {})
						})
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"modulus",
			"publicExponent",
			"privateExponent",
			"prime1",
			"prime2",
			"exponent1",
			"exponent2",
			"coefficient",
			"otherPrimeInfos"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RSAPrivateKey.schema({
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
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RSAPrivateKey");
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

		if("otherPrimeInfos" in asn1.result)
			this.otherPrimeInfos = Array.from(asn1.result.otherPrimeInfos, element => new OtherPrimeInfo({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		outputArray.push(new Integer({ value: this.version }));
		outputArray.push(this.modulus.convertToDER());
		outputArray.push(this.publicExponent);
		outputArray.push(this.privateExponent.convertToDER());
		outputArray.push(this.prime1.convertToDER());
		outputArray.push(this.prime2.convertToDER());
		outputArray.push(this.exponent1.convertToDER());
		outputArray.push(this.exponent2.convertToDER());
		outputArray.push(this.coefficient.convertToDER());
		
		if("otherPrimeInfos" in this)
		{
			outputArray.push(new Sequence({
				value: Array.from(this.otherPrimeInfos, element => element.toSchema())
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const jwk = {
			n: toBase64(arrayBufferToString(this.modulus.valueBlock.valueHex), true, true, true),
			e: toBase64(arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true, true),
			d: toBase64(arrayBufferToString(this.privateExponent.valueBlock.valueHex), true, true, true),
			p: toBase64(arrayBufferToString(this.prime1.valueBlock.valueHex), true, true, true),
			q: toBase64(arrayBufferToString(this.prime2.valueBlock.valueHex), true, true, true),
			dp: toBase64(arrayBufferToString(this.exponent1.valueBlock.valueHex), true, true, true),
			dq: toBase64(arrayBufferToString(this.exponent2.valueBlock.valueHex), true, true, true),
			qi: toBase64(arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true, true)
		};

		if("otherPrimeInfos" in this)
			jwk.oth = Array.from(this.otherPrimeInfos, element => element.toJSON());

		return jwk;
	}
	//**********************************************************************************
	/**
	 * Convert JSON value into current object
	 * @param {Object} json
	 */
	fromJSON(json)
	{
		if("n" in json)
			this.modulus = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.n, true, true)) });
		else
			throw new Error("Absent mandatory parameter \"n\"");

		if("e" in json)
			this.publicExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.e, true, true)) });
		else
			throw new Error("Absent mandatory parameter \"e\"");

		if("d" in json)
			this.privateExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.d, true, true)) });
		else
			throw new Error("Absent mandatory parameter \"d\"");

		if("p" in json)
			this.prime1 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.p, true, true)) });
		else
			throw new Error("Absent mandatory parameter \"p\"");

		if("q" in json)
			this.prime2 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.q, true, true)) });
		else
			throw new Error("Absent mandatory parameter \"q\"");

		if("dp" in json)
			this.exponent1 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.dp, true, true)) });
		else
			throw new Error("Absent mandatory parameter \"dp\"");

		if("dq" in json)
			this.exponent2 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.dq, true, true)) });
		else
			throw new Error("Absent mandatory parameter \"dq\"");

		if("qi" in json)
			this.coefficient = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.qi, true, true)) });
		else
			throw new Error("Absent mandatory parameter \"qi\"");

		if("oth" in json)
			this.otherPrimeInfos = Array.from(json.oth, element => new OtherPrimeInfo({ json: element }));
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5208
 */
class PrivateKeyInfo
{
	//**********************************************************************************
	/**
	 * Constructor for PrivateKeyInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", PrivateKeyInfo.defaultValues("version"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc privateKeyAlgorithm
		 */
		this.privateKeyAlgorithm = getParametersValue(parameters, "privateKeyAlgorithm", PrivateKeyInfo.defaultValues("privateKeyAlgorithm"));
		/**
		 * @type {OctetString}
		 * @desc privateKey
		 */
		this.privateKey = getParametersValue(parameters, "privateKey", PrivateKeyInfo.defaultValues("privateKey"));

		if("attributes" in parameters)
			/**
			 * @type {Array.<Attribute>}
			 * @desc attributes
			 */
			this.attributes = getParametersValue(parameters, "attributes", PrivateKeyInfo.defaultValues("attributes"));

		if("parsedKey" in parameters)
			/**
			 * @type {ECPrivateKey|RSAPrivateKey}
			 * @desc Parsed public key value
			 */
			this.parsedKey = getParametersValue(parameters, "parsedKey", PrivateKeyInfo.defaultValues("parsedKey"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 0;
			case "privateKeyAlgorithm":
				return new AlgorithmIdentifier();
			case "privateKey":
				return new OctetString();
			case "attributes":
				return [];
			case "parsedKey":
				return {};
			default:
				throw new Error(`Invalid member name for PrivateKeyInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PrivateKeyInfo ::= SEQUENCE {
	 *    version Version,
	 *    privateKeyAlgorithm AlgorithmIdentifier {{PrivateKeyAlgorithms}},
	 *    privateKey PrivateKey,
	 *    attributes [0] Attributes OPTIONAL }
	 *
	 * Version ::= INTEGER {v1(0)} (v1,...)
	 *
	 * PrivateKey ::= OCTET STRING
	 *
	 * Attributes ::= SET OF Attribute
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [privateKeyAlgorithm]
		 * @property {string} [privateKey]
		 * @property {string} [attributes]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				AlgorithmIdentifier.schema(names.privateKeyAlgorithm || {}),
				new OctetString({ name: (names.privateKey || "") }),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new Repeated({
							name: (names.attributes || ""),
							value: Attribute.schema()
						})
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"privateKeyAlgorithm",
			"privateKey",
			"attributes"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PrivateKeyInfo.schema({
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
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PrivateKeyInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.privateKeyAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.privateKeyAlgorithm });
		this.privateKey = asn1.result.privateKey;

		if("attributes" in asn1.result)
			this.attributes = Array.from(asn1.result.attributes, element => new Attribute({ schema: element }));

		switch(this.privateKeyAlgorithm.algorithmId)
		{
			case "1.2.840.113549.1.1.1": // RSA
				{
					const privateKeyASN1 = fromBER(this.privateKey.valueBlock.valueHex);
					if(privateKeyASN1.offset !== (-1))
						this.parsedKey = new RSAPrivateKey({ schema: privateKeyASN1.result });
				}
				break;
			case "1.2.840.10045.2.1": // ECDSA
				if("algorithmParams" in this.privateKeyAlgorithm)
				{
					if(this.privateKeyAlgorithm.algorithmParams instanceof ObjectIdentifier)
					{
						const privateKeyASN1 = fromBER(this.privateKey.valueBlock.valueHex);
						if(privateKeyASN1.offset !== (-1))
						{
							this.parsedKey = new ECPrivateKey({
								namedCurve: this.privateKeyAlgorithm.algorithmParams.valueBlock.toString(),
								schema: privateKeyASN1.result
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
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [
			new Integer({ value: this.version }),
			this.privateKeyAlgorithm.toSchema(),
			this.privateKey
		];

		if("attributes" in this)
		{
			outputArray.push(new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: Array.from(this.attributes, element => element.toSchema())
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		//region Return common value in case we do not have enough info fo making JWK
		if(("parsedKey" in this) === false)
		{
			const object = {
				version: this.version,
				privateKeyAlgorithm: this.privateKeyAlgorithm.toJSON(),
				privateKey: this.privateKey.toJSON()
			};

			if("attributes" in this)
				object.attributes = Array.from(this.attributes, element => element.toJSON());

			return object;
		}
		//endregion

		//region Making JWK
		const jwk = {};

		switch(this.privateKeyAlgorithm.algorithmId)
		{
			case "1.2.840.10045.2.1": // ECDSA
				jwk.kty = "EC";
				break;
			case "1.2.840.113549.1.1.1": // RSA
				jwk.kty = "RSA";
				break;
			default:
		}

		const publicKeyJWK = this.parsedKey.toJSON();

		for(const key of Object.keys(publicKeyJWK))
			jwk[key] = publicKeyJWK[key];

		return jwk;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert JSON value into current object
	 * @param {Object} json
	 */
	fromJSON(json)
	{
		if("kty" in json)
		{
			switch(json.kty.toUpperCase())
			{
				case "EC":
					this.parsedKey = new ECPrivateKey({ json });

					this.privateKeyAlgorithm = new AlgorithmIdentifier({
						algorithmId: "1.2.840.10045.2.1",
						algorithmParams: new ObjectIdentifier({ value: this.parsedKey.namedCurve })
					});
					break;
				case "RSA":
					this.parsedKey = new RSAPrivateKey({ json });

					this.privateKeyAlgorithm = new AlgorithmIdentifier({
						algorithmId: "1.2.840.113549.1.1.1",
						algorithmParams: new Null()
					});
					break;
				default:
					throw new Error(`Invalid value for "kty" parameter: ${json.kty}`);
			}

			this.privateKey = new OctetString({ valueHex: this.parsedKey.toSchema().toBER(false) });
		}
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class EncryptedContentInfo
{
	//**********************************************************************************
	/**
	 * Constructor for EncryptedContentInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc contentType
		 */
		this.contentType = getParametersValue(parameters, "contentType", EncryptedContentInfo.defaultValues("contentType"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc contentEncryptionAlgorithm
		 */
		this.contentEncryptionAlgorithm = getParametersValue(parameters, "contentEncryptionAlgorithm", EncryptedContentInfo.defaultValues("contentEncryptionAlgorithm"));

		if("encryptedContent" in parameters)
		{
			/**
			 * @type {OctetString}
			 * @desc encryptedContent (!!!) could be contructive or primitive value (!!!)
			 */
			this.encryptedContent = parameters.encryptedContent;
			
			if((this.encryptedContent.idBlock.tagClass === 1) &&
				(this.encryptedContent.idBlock.tagNumber === 4))
			{
				//region Divide OCTETSTRING value down to small pieces
				if(this.encryptedContent.idBlock.isConstructed === false)
				{
					const constrString = new OctetString({
						idBlock: { isConstructed: true },
						isConstructed: true
					});
					
					let offset = 0;
					let length = this.encryptedContent.valueBlock.valueHex.byteLength;
					
					while(length > 0)
					{
						const pieceView = new Uint8Array(this.encryptedContent.valueBlock.valueHex, offset, ((offset + 1024) > this.encryptedContent.valueBlock.valueHex.byteLength) ? (this.encryptedContent.valueBlock.valueHex.byteLength - offset) : 1024);
						const _array = new ArrayBuffer(pieceView.length);
						const _view = new Uint8Array(_array);
						
						for(let i = 0; i < _view.length; i++)
							_view[i] = pieceView[i];
						
						constrString.valueBlock.value.push(new OctetString({ valueHex: _array }));
						
						length -= pieceView.length;
						offset += pieceView.length;
					}
					
					this.encryptedContent = constrString;
				}
				//endregion
			}
		}
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "contentType":
				return "";
			case "contentEncryptionAlgorithm":
				return new AlgorithmIdentifier();
			case "encryptedContent":
				return new OctetString();
			default:
				throw new Error(`Invalid member name for EncryptedContentInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "contentType":
				return (memberValue === "");
			case "contentEncryptionAlgorithm":
				return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
			case "encryptedContent":
				return (memberValue.isEqual(EncryptedContentInfo.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for EncryptedContentInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * EncryptedContentInfo ::= SEQUENCE {
	 *    contentType ContentType,
	 *    contentEncryptionAlgorithm ContentEncryptionAlgorithmIdentifier,
	 *    encryptedContent [0] IMPLICIT EncryptedContent OPTIONAL }
	 *
	 * Comment: Strange, but modern crypto engines create "encryptedContent" as "[0] EXPLICIT EncryptedContent"
	 *
	 * EncryptedContent ::= OCTET STRING
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [contentType]
		 * @property {string} [contentEncryptionAlgorithm]
		 * @property {string} [encryptedContent]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.contentType || "") }),
				AlgorithmIdentifier.schema(names.contentEncryptionAlgorithm || {}),
				// The CHOICE we need because "EncryptedContent" could have either "constructive"
				// or "primitive" form of encoding and we need to handle both variants
				new Choice({
					value: [
						new Constructed({
							name: (names.encryptedContent || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [
								new Repeated({
									value: new OctetString()
								})
							]
						}),
						new Primitive({
							name: (names.encryptedContent || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							}
						})
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"contentType",
			"contentEncryptionAlgorithm",
			"encryptedContent"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			EncryptedContentInfo.schema({
				names: {
					contentType: "contentType",
					contentEncryptionAlgorithm: {
						names: {
							blockName: "contentEncryptionAlgorithm"
						}
					},
					encryptedContent: "encryptedContent"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for EncryptedContentInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.contentType = asn1.result.contentType.valueBlock.toString();
		this.contentEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.contentEncryptionAlgorithm });

		if("encryptedContent" in asn1.result)
		{
			this.encryptedContent = asn1.result.encryptedContent;

			this.encryptedContent.idBlock.tagClass = 1; // UNIVERSAL
			this.encryptedContent.idBlock.tagNumber = 4; // OCTETSTRING (!!!) The value still has instance of "in_window.org.pkijs.asn1.ASN1_CONSTRUCTED / ASN1_PRIMITIVE"
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const sequenceLengthBlock = {
			isIndefiniteForm: false
		};

		const outputArray = [];

		outputArray.push(new ObjectIdentifier({ value: this.contentType }));
		outputArray.push(this.contentEncryptionAlgorithm.toSchema());

		if("encryptedContent" in this)
		{
			sequenceLengthBlock.isIndefiniteForm = this.encryptedContent.idBlock.isConstructed;

			const encryptedValue = this.encryptedContent;

			encryptedValue.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
			encryptedValue.idBlock.tagNumber = 0; // [0]

			encryptedValue.lenBlock.isIndefiniteForm = this.encryptedContent.idBlock.isConstructed;

			outputArray.push(encryptedValue);
		}
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			lenBlock: sequenceLengthBlock,
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			contentType: this.contentType,
			contentEncryptionAlgorithm: this.contentEncryptionAlgorithm.toJSON()
		};

		if("encryptedContent" in this)
			_object.encryptedContent = this.encryptedContent.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC4055
 */
class RSASSAPSSParams
{
	//**********************************************************************************
	/**
	 * Constructor for RSASSAPSSParams class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc Algorithms of hashing (DEFAULT sha1)
		 */
		this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", RSASSAPSSParams.defaultValues("hashAlgorithm"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc Algorithm of "mask generaion function (MGF)" (DEFAULT mgf1SHA1)
		 */
		this.maskGenAlgorithm = getParametersValue(parameters, "maskGenAlgorithm", RSASSAPSSParams.defaultValues("maskGenAlgorithm"));
		/**
		 * @type {number}
		 * @desc Salt length (DEFAULT 20)
		 */
		this.saltLength = getParametersValue(parameters, "saltLength", RSASSAPSSParams.defaultValues("saltLength"));
		/**
		 * @type {number}
		 * @desc (DEFAULT 1)
		 */
		this.trailerField = getParametersValue(parameters, "trailerField", RSASSAPSSParams.defaultValues("trailerField"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "hashAlgorithm":
				return new AlgorithmIdentifier({
					algorithmId: "1.3.14.3.2.26", // SHA-1
					algorithmParams: new Null()
				});
			case "maskGenAlgorithm":
				return new AlgorithmIdentifier({
					algorithmId: "1.2.840.113549.1.1.8", // MGF1
					algorithmParams: (new AlgorithmIdentifier({
						algorithmId: "1.3.14.3.2.26", // SHA-1
						algorithmParams: new Null()
					})).toSchema()
				});
			case "saltLength":
				return 20;
			case "trailerField":
				return 1;
			default:
				throw new Error(`Invalid member name for RSASSAPSSParams class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RSASSA-PSS-params  ::=  Sequence  {
	 *    hashAlgorithm      [0] HashAlgorithm DEFAULT sha1Identifier,
	 *    maskGenAlgorithm   [1] MaskGenAlgorithm DEFAULT mgf1SHA1Identifier,
	 *    saltLength         [2] Integer DEFAULT 20,
	 *    trailerField       [3] Integer DEFAULT 1  }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [hashAlgorithm]
		 * @property {string} [maskGenAlgorithm]
		 * @property {string} [saltLength]
		 * @property {string} [trailerField]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					optional: true,
					value: [AlgorithmIdentifier.schema(names.hashAlgorithm || {})]
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					optional: true,
					value: [AlgorithmIdentifier.schema(names.maskGenAlgorithm || {})]
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					optional: true,
					value: [new Integer({ name: (names.saltLength || "") })]
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					},
					optional: true,
					value: [new Integer({ name: (names.trailerField || "") })]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"hashAlgorithm",
			"maskGenAlgorithm",
			"saltLength",
			"trailerField"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RSASSAPSSParams.schema({
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
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RSASSAPSSParams");
		//endregion

		//region Get internal properties from parsed schema
		if("hashAlgorithm" in asn1.result)
			this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });

		if("maskGenAlgorithm" in asn1.result)
			this.maskGenAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.maskGenAlgorithm });

		if("saltLength" in asn1.result)
			this.saltLength = asn1.result.saltLength.valueBlock.valueDec;

		if("trailerField" in asn1.result)
			this.trailerField = asn1.result.trailerField.valueBlock.valueDec;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if(!this.hashAlgorithm.isEqual(RSASSAPSSParams.defaultValues("hashAlgorithm")))
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [this.hashAlgorithm.toSchema()]
			}));
		}
		
		if(!this.maskGenAlgorithm.isEqual(RSASSAPSSParams.defaultValues("maskGenAlgorithm")))
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [this.maskGenAlgorithm.toSchema()]
			}));
		}
		
		if(this.saltLength !== RSASSAPSSParams.defaultValues("saltLength"))
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				value: [new Integer({ value: this.saltLength })]
			}));
		}
		
		if(this.trailerField !== RSASSAPSSParams.defaultValues("trailerField"))
		{
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
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};

		if(!this.hashAlgorithm.isEqual(RSASSAPSSParams.defaultValues("hashAlgorithm")))
			object.hashAlgorithm = this.hashAlgorithm.toJSON();

		if(!this.maskGenAlgorithm.isEqual(RSASSAPSSParams.defaultValues("maskGenAlgorithm")))
			object.maskGenAlgorithm = this.maskGenAlgorithm.toJSON();

		if(this.saltLength !== RSASSAPSSParams.defaultValues("saltLength"))
			object.saltLength = this.saltLength;

		if(this.trailerField !== RSASSAPSSParams.defaultValues("trailerField"))
			object.trailerField = this.trailerField;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC2898
 */
class PBKDF2Params
{
	//**********************************************************************************
	/**
	 * Constructor for PBKDF2Params class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Object}
		 * @desc salt
		 */
		this.salt = getParametersValue(parameters, "salt", PBKDF2Params.defaultValues("salt"));
		/**
		 * @type {number}
		 * @desc iterationCount
		 */
		this.iterationCount = getParametersValue(parameters, "iterationCount", PBKDF2Params.defaultValues("iterationCount"));
		
		if("keyLength" in parameters)
			/**
			 * @type {number}
			 * @desc keyLength
			 */
			this.keyLength = getParametersValue(parameters, "keyLength", PBKDF2Params.defaultValues("keyLength"));
		
		if("prf" in parameters)
			/**
			 * @type {AlgorithmIdentifier}
			 * @desc prf
			 */
			this.prf = getParametersValue(parameters, "prf", PBKDF2Params.defaultValues("prf"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "salt":
				return {};
			case "iterationCount":
				return (-1);
			case "keyLength":
				return 0;
			case "prf":
				return new AlgorithmIdentifier({
					algorithmId: "1.3.14.3.2.26", // SHA-1
					algorithmParams: new Null()
				});
			default:
				throw new Error(`Invalid member name for PBKDF2Params class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PBKDF2-params ::= SEQUENCE {
	 *    salt CHOICE {
	 *        specified OCTET STRING,
	 *        otherSource AlgorithmIdentifier },
	 *  iterationCount INTEGER (1..MAX),
	 *  keyLength INTEGER (1..MAX) OPTIONAL,
	 *  prf AlgorithmIdentifier
	 *    DEFAULT { algorithm hMAC-SHA1, parameters NULL } }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [saltPrimitive]
		 * @property {string} [saltConstructed]
		 * @property {string} [iterationCount]
		 * @property {string} [keyLength]
		 * @property {string} [prf]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Choice({
					value: [
						new OctetString({ name: (names.saltPrimitive || "") }),
						AlgorithmIdentifier.schema(names.saltConstructed || {})
					]
				}),
				new Integer({ name: (names.iterationCount || "") }),
				new Integer({
					name: (names.keyLength || ""),
					optional: true
				}),
				AlgorithmIdentifier.schema(names.prf || {
					names: {
						optional: true
					}
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"salt",
			"iterationCount",
			"keyLength",
			"prf"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PBKDF2Params.schema({
				names: {
					saltPrimitive: "salt",
					saltConstructed: {
						names: {
							blockName: "salt"
						}
					},
					iterationCount: "iterationCount",
					keyLength: "keyLength",
					prf: {
						names: {
							blockName: "prf",
							optional: true
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PBKDF2Params");
		//endregion

		//region Get internal properties from parsed schema
		this.salt = asn1.result.salt;
		this.iterationCount = asn1.result.iterationCount.valueBlock.valueDec;

		if("keyLength" in asn1.result)
			this.keyLength = asn1.result.keyLength.valueBlock.valueDec;

		if("prf" in asn1.result)
			this.prf = new AlgorithmIdentifier({ schema: asn1.result.prf });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence 
		const outputArray = [];
		
		outputArray.push(this.salt);
		outputArray.push(new Integer({ value: this.iterationCount }));
		
		if("keyLength" in this)
		{
			if(PBKDF2Params.defaultValues("keyLength") !== this.keyLength)
				outputArray.push(new Integer({ value: this.keyLength }));
		}
		
		if("prf" in this)
		{
			if(PBKDF2Params.defaultValues("prf").isEqual(this.prf) === false)
				outputArray.push(this.prf.toSchema());
		}
		//endregion 
		
		//region Construct and return new ASN.1 schema for this object 
		return (new Sequence({
			value: outputArray
		}));
		//endregion 
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			salt: this.salt.toJSON(),
			iterationCount: this.iterationCount
		};
		
		if("keyLength" in this)
		{
			if(PBKDF2Params.defaultValues("keyLength") !== this.keyLength)
				_object.keyLength = this.keyLength;
		}
		
		if("prf" in this)
		{
			if(PBKDF2Params.defaultValues("prf").isEqual(this.prf) === false)
				_object.prf = this.prf.toJSON();
		}

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC2898
 */
class PBES2Params
{
	//**********************************************************************************
	/**
	 * Constructor for PBES2Params class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc keyDerivationFunc
		 */
		this.keyDerivationFunc = getParametersValue(parameters, "keyDerivationFunc", PBES2Params.defaultValues("keyDerivationFunc"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc encryptionScheme
		 */
		this.encryptionScheme = getParametersValue(parameters, "encryptionScheme", PBES2Params.defaultValues("encryptionScheme"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "keyDerivationFunc":
				return new AlgorithmIdentifier();
			case "encryptionScheme":
				return new AlgorithmIdentifier();
			default:
				throw new Error(`Invalid member name for PBES2Params class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PBES2-params ::= SEQUENCE {
	 *    keyDerivationFunc AlgorithmIdentifier {{PBES2-KDFs}},
	 *    encryptionScheme AlgorithmIdentifier {{PBES2-Encs}} }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [keyDerivationFunc]
		 * @property {string} [encryptionScheme]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				AlgorithmIdentifier.schema(names.keyDerivationFunc || {}),
				AlgorithmIdentifier.schema(names.encryptionScheme || {})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"keyDerivationFunc",
			"encryptionScheme"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PBES2Params.schema({
				names: {
					keyDerivationFunc: {
						names: {
							blockName: "keyDerivationFunc"
						}
					},
					encryptionScheme: {
						names: {
							blockName: "encryptionScheme"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PBES2Params");
		//endregion

		//region Get internal properties from parsed schema
		this.keyDerivationFunc = new AlgorithmIdentifier({ schema: asn1.result.keyDerivationFunc });
		this.encryptionScheme = new AlgorithmIdentifier({ schema: asn1.result.encryptionScheme });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				this.keyDerivationFunc.toSchema(),
				this.encryptionScheme.toSchema()
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			keyDerivationFunc: this.keyDerivationFunc.toJSON(),
			encryptionScheme: this.encryptionScheme.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Making MAC key using algorithm described in B.2 of PKCS#12 standard.
 */
function makePKCS12B2Key(cryptoEngine, hashAlgorithm, keyLength, password, salt, iterationCount)
{
	//region Initial variables
	let u;
	let v;
	
	const result = [];
	//endregion
	
	//region Get "u" and "v" values
	switch(hashAlgorithm.toUpperCase())
	{
		case "SHA-1":
			u = 20; // 160
			v = 64; // 512
			break;
		case "SHA-256":
			u = 32; // 256
			v = 64; // 512
			break;
		case "SHA-384":
			u = 48; // 384
			v = 128; // 1024
			break;
		case "SHA-512":
			u = 64; // 512
			v = 128; // 1024
			break;
		default:
			throw new Error("Unsupported hashing algorithm");
	}
	//endregion
	
	//region Main algorithm making key
	//region Transform password to UTF-8 like string
	const passwordViewInitial = new Uint8Array(password);
	
	const passwordTransformed = new ArrayBuffer((password.byteLength * 2) + 2);
	const passwordTransformedView = new Uint8Array(passwordTransformed);
	
	for(let i = 0; i < passwordViewInitial.length; i++)
	{
		passwordTransformedView[i * 2] = 0x00;
		passwordTransformedView[i * 2 + 1] = passwordViewInitial[i];
	}
	
	passwordTransformedView[passwordTransformedView.length - 2] = 0x00;
	passwordTransformedView[passwordTransformedView.length - 1] = 0x00;
	
	password = passwordTransformed.slice(0);
	//endregion
	
	//region Construct a string D (the "diversifier") by concatenating v/8 copies of ID
	const D = new ArrayBuffer(v);
	const dView = new Uint8Array(D);
	
	for(let i = 0; i < D.byteLength; i++)
		dView[i] = 3; // The ID value equal to "3" for MACing (see B.3 of standard)
	//endregion
	
	//region Concatenate copies of the salt together to create a string S of length v * ceil(s / v) bytes (the final copy of the salt may be trunacted to create S)
	const saltLength = salt.byteLength;
	
	const sLen = v * Math.ceil(saltLength / v);
	const S = new ArrayBuffer(sLen);
	const sView = new Uint8Array(S);
	
	const saltView = new Uint8Array(salt);
	
	for(let i = 0; i < sLen; i++)
		sView[i] = saltView[i % saltLength];
	//endregion
	
	//region Concatenate copies of the password together to create a string P of length v * ceil(p / v) bytes (the final copy of the password may be truncated to create P)
	const passwordLength = password.byteLength;
	
	const pLen = v * Math.ceil(passwordLength / v);
	const P = new ArrayBuffer(pLen);
	const pView = new Uint8Array(P);
	
	const passwordView = new Uint8Array(password);
	
	for(let i = 0; i < pLen; i++)
		pView[i] = passwordView[i % passwordLength];
	//endregion
	
	//region Set I=S||P to be the concatenation of S and P
	const sPlusPLength = S.byteLength + P.byteLength;
	
	let I = new ArrayBuffer(sPlusPLength);
	let iView = new Uint8Array(I);
	
	iView.set(sView);
	iView.set(pView, sView.length);
	//endregion
	
	//region Set c=ceil(n / u)
	const c = Math.ceil((keyLength >> 3) / u);
	//endregion
	
	//region Initial variables
	let internalSequence = Promise.resolve(I);
	//endregion
	
	//region For i=1, 2, ..., c, do the following:
	for(let i = 0; i <= c; i++)
	{
		internalSequence = internalSequence.then(_I =>
		{
			//region Create contecanetion of D and I
			const dAndI = new ArrayBuffer(D.byteLength + _I.byteLength);
			const dAndIView = new Uint8Array(dAndI);
			
			dAndIView.set(dView);
			dAndIView.set(iView, dView.length);
			//endregion
			
			return dAndI;
		});
		
		//region Make "iterationCount" rounds of hashing
		for(let j = 0; j < iterationCount; j++)
			internalSequence = internalSequence.then(roundBuffer => cryptoEngine.digest({ name: hashAlgorithm }, new Uint8Array(roundBuffer)));
		//endregion
		
		internalSequence = internalSequence.then(roundBuffer =>
		{
			//region Concatenate copies of Ai to create a string B of length v bits (the final copy of Ai may be truncated to create B)
			const B = new ArrayBuffer(v);
			const bView = new Uint8Array(B);
			
			for(let j = 0; j < B.byteLength; j++)
				bView[j] = roundBuffer[j % roundBuffer.length];
			//endregion
			
			//region Make new I value
			const k = Math.ceil(saltLength / v) + Math.ceil(passwordLength / v);
			const iRound = [];
			
			let sliceStart = 0;
			let sliceLength = v;
			
			for(let j = 0; j < k; j++)
			{
				const chunk = Array.from(new Uint8Array(I.slice(sliceStart, sliceStart + sliceLength)));
				sliceStart += v;
				if((sliceStart + v) > I.byteLength)
					sliceLength = I.byteLength - sliceStart;
				
				let x = 0x1ff;
				
				for(let l = (B.byteLength - 1); l >= 0; l--)
				{
					x >>= 8;
					x += bView[l] + chunk[l];
					chunk[l] = (x & 0xff);
				}
				
				iRound.push(...chunk);
			}
			
			I = new ArrayBuffer(iRound.length);
			iView = new Uint8Array(I);
			
			iView.set(iRound);
			//endregion
			
			result.push(...(new Uint8Array(roundBuffer)));
			
			return I;
		});
	}
	//endregion
	
	//region Initialize final key
	internalSequence = internalSequence.then(() =>
	{
		const resultBuffer = new ArrayBuffer(keyLength >> 3);
		const resultView = new Uint8Array(resultBuffer);
		
		resultView.set((new Uint8Array(result)).slice(0, keyLength >> 3));
		
		return resultBuffer;
	});
	//endregion
	//endregion
	
	return internalSequence;
}
//**************************************************************************************
/**
 * Default cryptographic engine for Web Cryptography API
 */
class CryptoEngine
{
	//**********************************************************************************
	/**
	 * Constructor for CryptoEngine class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Object}
		 * @desc Usually here we are expecting "window.crypto" or an equivalent from custom "crypto engine"
		 */
		this.crypto = getParametersValue(parameters, "crypto", {});
		/**
		 * @type {Object}
		 * @desc Usually here we are expecting "window.crypto.subtle" or an equivalent from custom "crypto engine"
		 */
		this.subtle = getParametersValue(parameters, "subtle", {});
		/**
		 * @type {string}
		 * @desc Name of the "crypto engine"
		 */
		this.name = getParametersValue(parameters, "name", "");
		//endregion
	}
	//**********************************************************************************
	/**
	 * Import WebCrypto keys from different formats
	 * @param {string} format
	 * @param {ArrayBuffer|Uint8Array} keyData
	 * @param {Object} algorithm
	 * @param {boolean} extractable
	 * @param {Array} keyUsages
	 * @returns {Promise}
	 */
	importKey(format, keyData, algorithm, extractable, keyUsages)
	{
		//region Initial variables
		let jwk = {};
		//endregion
		
		//region Change "keyData" type if needed
		if(keyData instanceof Uint8Array)
			keyData = keyData.buffer;
		//endregion
		
		switch(format.toLowerCase())
		{
			case "raw":
				return this.subtle.importKey("raw", keyData, algorithm, extractable, keyUsages);
			case "spki":
				{
					const asn1 = fromBER(keyData);
					if(asn1.offset === (-1))
						return Promise.reject("Incorrect keyData");

					const publicKeyInfo = new PublicKeyInfo();
					try
					{
						publicKeyInfo.fromSchema(asn1.result);
					}
					catch(ex)
					{
						return Promise.reject("Incorrect keyData");
					}


					// noinspection FallThroughInSwitchStatementJS
					switch(algorithm.name.toUpperCase())
					{
						case "RSA-PSS":
							{
								//region Get information about used hash function
								switch(algorithm.hash.name.toUpperCase())
								{
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
										return Promise.reject(`Incorrect hash algorithm: ${algorithm.hash.name.toUpperCase()}`);
								}
								//endregion
							}
							// break omitted
						case "RSASSA-PKCS1-V1_5":
							{
								keyUsages = ["verify"]; // Override existing keyUsages value since the key is a public key

								jwk.kty = "RSA";
								jwk.ext = extractable;
								jwk.key_ops = keyUsages;

								if(publicKeyInfo.algorithm.algorithmId !== "1.2.840.113549.1.1.1")
									return Promise.reject(`Incorrect public key algorithm: ${publicKeyInfo.algorithm.algorithmId}`);

								//region Get information about used hash function
								if(("alg" in jwk) === false)
								{
									switch(algorithm.hash.name.toUpperCase())
									{
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
											return Promise.reject(`Incorrect public key algorithm: ${publicKeyInfo.algorithm.algorithmId}`);
									}
								}
								//endregion

								//region Create RSA Public Key elements
								const publicKeyJSON = publicKeyInfo.toJSON();

								for(const key of Object.keys(publicKeyJSON))
									jwk[key] = publicKeyJSON[key];
								//endregion
							}
							break;
						case "ECDSA":
							keyUsages = ["verify"]; // Override existing keyUsages value since the key is a public key
							// break omitted
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
								if(publicKeyInfo.algorithm.algorithmId !== "1.2.840.10045.2.1")
									return Promise.reject(`Incorrect public key algorithm: ${publicKeyInfo.algorithm.algorithmId}`);
								//endregion

								//region Create ECDSA Public Key elements
								const publicKeyJSON = publicKeyInfo.toJSON();

								for(const key of Object.keys(publicKeyJSON))
									jwk[key] = publicKeyJSON[key];
								//endregion
							}
							break;
						case "RSA-OAEP":
							{
								jwk.kty = "RSA";
								jwk.ext = extractable;
								jwk.key_ops = keyUsages;
								
								if(this.name.toLowerCase() === "safari")
									jwk.alg = "RSA-OAEP";
								else
								{
									switch(algorithm.hash.name.toUpperCase())
									{
										case "SHA-1":
											jwk.alg = "RSA-OAEP";
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
											return Promise.reject(`Incorrect public key algorithm: ${publicKeyInfo.algorithm.algorithmId}`);
									}
								}
								
								//region Create ECDSA Public Key elements
								const publicKeyJSON = publicKeyInfo.toJSON();
								
								for(const key of Object.keys(publicKeyJSON))
									jwk[key] = publicKeyJSON[key];
								//endregion
							}
							break;
						default:
							return Promise.reject(`Incorrect algorithm name: ${algorithm.name.toUpperCase()}`);
					}
				}
				break;
			case "pkcs8":
				{
					const privateKeyInfo = new PrivateKeyInfo();

					//region Parse "PrivateKeyInfo" object
					const asn1 = fromBER(keyData);
					if(asn1.offset === (-1))
						return Promise.reject("Incorrect keyData");

					try
					{
						privateKeyInfo.fromSchema(asn1.result);
					}
					catch(ex)
					{
						return Promise.reject("Incorrect keyData");
					}
					
					if(("parsedKey" in privateKeyInfo) === false)
						return Promise.reject("Incorrect keyData");
					//endregion

					// noinspection FallThroughInSwitchStatementJS
					// noinspection FallThroughInSwitchStatementJS
					switch(algorithm.name.toUpperCase())
					{
						case "RSA-PSS":
							{
								//region Get information about used hash function
								switch(algorithm.hash.name.toUpperCase())
								{
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
										return Promise.reject(`Incorrect hash algorithm: ${algorithm.hash.name.toUpperCase()}`);
								}
								//endregion
							}
							// break omitted
						case "RSASSA-PKCS1-V1_5":
							{
								keyUsages = ["sign"]; // Override existing keyUsages value since the key is a private key

								jwk.kty = "RSA";
								jwk.ext = extractable;
								jwk.key_ops = keyUsages;

								//region Get information about used hash function
								if(privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.113549.1.1.1")
									return Promise.reject(`Incorrect private key algorithm: ${privateKeyInfo.privateKeyAlgorithm.algorithmId}`);
								//endregion

								//region Get information about used hash function
								if(("alg" in jwk) === false)
								{
									switch(algorithm.hash.name.toUpperCase())
									{
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
											return Promise.reject(`Incorrect hash algorithm: ${algorithm.hash.name.toUpperCase()}`);
									}
								}
								//endregion

								//region Create RSA Private Key elements
								const privateKeyJSON = privateKeyInfo.toJSON();

								for(const key of Object.keys(privateKeyJSON))
									jwk[key] = privateKeyJSON[key];
								//endregion
							}
							break;
						case "ECDSA":
							keyUsages = ["sign"]; // Override existing keyUsages value since the key is a private key
							// break omitted
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
								if(privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.10045.2.1")
									return Promise.reject(`Incorrect algorithm: ${privateKeyInfo.privateKeyAlgorithm.algorithmId}`);
								//endregion

								//region Create ECDSA Private Key elements
								const privateKeyJSON = privateKeyInfo.toJSON();

								for(const key of Object.keys(privateKeyJSON))
									jwk[key] = privateKeyJSON[key];
								//endregion
							}
							break;
						case "RSA-OAEP":
							{
								jwk.kty = "RSA";
								jwk.ext = extractable;
								jwk.key_ops = keyUsages;
								
								//region Get information about used hash function
								if(this.name.toLowerCase() === "safari")
									jwk.alg = "RSA-OAEP";
								else
								{
									switch(algorithm.hash.name.toUpperCase())
									{
										case "SHA-1":
											jwk.alg = "RSA-OAEP";
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
											return Promise.reject(`Incorrect hash algorithm: ${algorithm.hash.name.toUpperCase()}`);
									}
								}
								//endregion
								
								//region Create RSA Private Key elements
								const privateKeyJSON = privateKeyInfo.toJSON();
								
								for(const key of Object.keys(privateKeyJSON))
									jwk[key] = privateKeyJSON[key];
								//endregion
							}
							break;
						default:
							return Promise.reject(`Incorrect algorithm name: ${algorithm.name.toUpperCase()}`);
					}
				}
				break;
			case "jwk":
				jwk = keyData;
				break;
			default:
				return Promise.reject(`Incorrect format: ${format}`);
		}
		
		//region Special case for Safari browser (since its acting not as WebCrypto standard describes)
		if(this.name.toLowerCase() === "safari")
		{
			// Try to use both ways - import using ArrayBuffer and pure JWK (for Safari Technology Preview)
			return Promise.resolve().then(() => this.subtle.importKey("jwk", stringToArrayBuffer(JSON.stringify(jwk)), algorithm, extractable, keyUsages))
				.then(result => result, () => this.subtle.importKey("jwk", jwk, algorithm, extractable, keyUsages));
		}
		//endregion
		
		return this.subtle.importKey("jwk", jwk, algorithm, extractable, keyUsages);
	}
	//**********************************************************************************
	/**
	 * Export WebCrypto keys to different formats
	 * @param {string} format
	 * @param {Object} key
	 * @returns {Promise}
	 */
	exportKey(format, key)
	{
		let sequence = this.subtle.exportKey("jwk", key);
		
		//region Currently Safari returns ArrayBuffer as JWK thus we need an additional transformation
		if(this.name.toLowerCase() === "safari")
		{
			sequence = sequence.then(result =>
			{
				// Some additional checks for Safari Technology Preview
				if(result instanceof ArrayBuffer)
					return JSON.parse(arrayBufferToString(result));
				
				return result;
			});
		}
		//endregion
		
		switch(format.toLowerCase())
		{
			case "raw":
				return this.subtle.exportKey("raw", key);
			case "spki":
				sequence = sequence.then(result =>
				{
					const publicKeyInfo = new PublicKeyInfo();

					try
					{
						publicKeyInfo.fromJSON(result);
					}
					catch(ex)
					{
						return Promise.reject("Incorrect key data");
					}

					return publicKeyInfo.toSchema().toBER(false);
				});
				break;
			case "pkcs8":
				sequence = sequence.then(result =>
				{
					const privateKeyInfo = new PrivateKeyInfo();

					try
					{
						privateKeyInfo.fromJSON(result);
					}
					catch(ex)
					{
						return Promise.reject("Incorrect key data");
					}

					return privateKeyInfo.toSchema().toBER(false);
				});
				break;
			case "jwk":
				break;
			default:
				return Promise.reject(`Incorrect format: ${format}`);
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
	convert(inputFormat, outputFormat, keyData, algorithm, extractable, keyUsages)
	{
		switch(inputFormat.toLowerCase())
		{
			case "raw":
				switch(outputFormat.toLowerCase())
				{
					case "raw":
						return Promise.resolve(keyData);
					case "spki":
						return Promise.resolve()
							.then(() => this.importKey("raw", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("spki", result));
					case "pkcs8":
						return Promise.resolve()
							.then(() => this.importKey("raw", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("pkcs8", result));
					case "jwk":
						return Promise.resolve()
							.then(() => this.importKey("raw", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("jwk", result));
					default:
						return Promise.reject(`Incorrect outputFormat: ${outputFormat}`);
				}
			case "spki":
				switch(outputFormat.toLowerCase())
				{
					case "raw":
						return Promise.resolve()
							.then(() => this.importKey("spki", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("raw", result));
					case "spki":
						return Promise.resolve(keyData);
					case "pkcs8":
						return Promise.reject("Impossible to convert between SPKI/PKCS8");
					case "jwk":
						return Promise.resolve()
							.then(() => this.importKey("spki", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("jwk", result));
					default:
						return Promise.reject(`Incorrect outputFormat: ${outputFormat}`);
				}
			case "pkcs8":
				switch(outputFormat.toLowerCase())
				{
					case "raw":
						return Promise.resolve()
							.then(() => this.importKey("pkcs8", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("raw", result));
					case "spki":
						return Promise.reject("Impossible to convert between SPKI/PKCS8");
					case "pkcs8":
						return Promise.resolve(keyData);
					case "jwk":
						return Promise.resolve()
							.then(() => this.importKey("pkcs8", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("jwk", result));
					default:
						return Promise.reject(`Incorrect outputFormat: ${outputFormat}`);
				}
			case "jwk":
				switch(outputFormat.toLowerCase())
				{
					case "raw":
						return Promise.resolve()
							.then(() => this.importKey("jwk", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("raw", result));
					case "spki":
						return Promise.resolve()
							.then(() => this.importKey("jwk", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("spki", result));
					case "pkcs8":
						return Promise.resolve()
							.then(() => this.importKey("jwk", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("pkcs8", result));
					case "jwk":
						return Promise.resolve(keyData);
					default:
						return Promise.reject(`Incorrect outputFormat: ${outputFormat}`);
				}
			default:
				return Promise.reject(`Incorrect inputFormat: ${inputFormat}`);
		}
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "encrypt"
	 * @param args
	 * @returns {Promise}
	 */
	encrypt(...args)
	{
		return this.subtle.encrypt(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "decrypt"
	 * @param args
	 * @returns {Promise}
	 */
	decrypt(...args)
	{
		return this.subtle.decrypt(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "sign"
	 * @param args
	 * @returns {Promise}
	 */
	sign(...args)
	{
		return this.subtle.sign(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "verify"
	 * @param args
	 * @returns {Promise}
	 */
	verify(...args)
	{
		return this.subtle.verify(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "digest"
	 * @param args
	 * @returns {Promise}
	 */
	digest(...args)
	{
		return this.subtle.digest(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "generateKey"
	 * @param args
	 * @returns {Promise}
	 */
	generateKey(...args)
	{
		return this.subtle.generateKey(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "deriveKey"
	 * @param args
	 * @returns {Promise}
	 */
	deriveKey(...args)
	{
		return this.subtle.deriveKey(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "deriveBits"
	 * @param args
	 * @returns {Promise}
	 */
	deriveBits(...args)
	{
		return this.subtle.deriveBits(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "wrapKey"
	 * @param args
	 * @returns {Promise}
	 */
	wrapKey(...args)
	{
		return this.subtle.wrapKey(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "unwrapKey"
	 * @param args
	 * @returns {Promise}
	 */
	unwrapKey(...args)
	{
		return this.subtle.unwrapKey(...args);
	}
	//**********************************************************************************
	/**
	 * Initialize input Uint8Array by random values (with help from current "crypto engine")
	 * @param {!Uint8Array} view
	 * @returns {*}
	 */
	getRandomValues(view)
	{
		if(("getRandomValues" in this.crypto) === false)
			throw new Error("No support for getRandomValues");
		
		return this.crypto.getRandomValues(view);
	}
	//**********************************************************************************
	/**
	 * Get WebCrypto algorithm by wel-known OID
	 * @param {string} oid well-known OID to search for
	 * @returns {Object}
	 */
	getAlgorithmByOID(oid)
	{
		switch(oid)
		{
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
	//**********************************************************************************
	/**
	 * Get OID for each specific algorithm
	 * @param {Object} algorithm
	 * @returns {string}
	 */
	getOIDByAlgorithm(algorithm)
	{
		let result = "";
		
		switch(algorithm.name.toUpperCase())
		{
			case "RSASSA-PKCS1-V1_5":
				switch(algorithm.hash.name.toUpperCase())
				{
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
				switch(algorithm.hash.name.toUpperCase())
				{
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
				switch(algorithm.kdf.toUpperCase()) // Non-standard addition - hash algorithm of KDF function
				{
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
				switch(algorithm.length)
				{
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
				switch(algorithm.length)
				{
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
				switch(algorithm.length)
				{
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
				switch(algorithm.length)
				{
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
				switch(algorithm.hash.name.toUpperCase())
				{
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
	//**********************************************************************************
	/**
	 * Get default algorithm parameters for each kind of operation
	 * @param {string} algorithmName Algorithm name to get common parameters for
	 * @param {string} operation Kind of operation: "sign", "encrypt", "generatekey", "importkey", "exportkey", "verify"
	 * @returns {*}
	 */
	getAlgorithmParameters(algorithmName, operation)
	{
		let result = {
			algorithm: {},
			usages: []
		};
		
		switch(algorithmName.toUpperCase())
		{
			case "RSASSA-PKCS1-V1_5":
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
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
								iv: this.getRandomValues(new Uint8Array(16)) // For "decrypt" the value should be replaced with value got on "encrypt" step
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
				switch(operation.toLowerCase())
				{
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
								iv: this.getRandomValues(new Uint8Array(16)) // For "decrypt" the value should be replaced with value got on "encrypt" step
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
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
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
				switch(operation.toLowerCase())
				{
					case "derivekey":
						result = {
							algorithm: {
								name: "PBKDF2",
								hash: { name: "SHA-256" },
								salt: new Uint8Array([]),
								iterations: 10000
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
	//**********************************************************************************
	/**
	 * Getting hash algorithm by signature algorithm
	 * @param {AlgorithmIdentifier} signatureAlgorithm Signature algorithm
	 * @returns {string}
	 */
	getHashAlgorithm(signatureAlgorithm)
	{
		let result = "";
		
		switch(signatureAlgorithm.algorithmId)
		{
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
			case "1.2.840.113549.1.1.10": // RSA-PSS
				{
					try
					{
						const params = new RSASSAPSSParams({ schema: signatureAlgorithm.algorithmParams });
						if("hashAlgorithm" in params)
						{
							const algorithm = this.getAlgorithmByOID(params.hashAlgorithm.algorithmId);
							if(("name" in algorithm) === false)
								return "";
							
							result = algorithm.name;
						}
						else
							result = "SHA-1";
					}
					catch(ex)
					{
					}
				}
				break;
			default:
		}
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Specialized function encrypting "EncryptedContentInfo" object using parameters
	 * @param {Object} parameters
	 * @returns {Promise}
	 */
	encryptEncryptedContentInfo(parameters)
	{
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("contentEncryptionAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentEncryptionAlgorithm\"");
		
		if(("hmacHashAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"hmacHashAlgorithm\"");
		
		if(("iterationCount" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("contentToEncrypt" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentToEncrypt\"");
		
		if(("contentType" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentType\"");

		const contentEncryptionOID = this.getOIDByAlgorithm(parameters.contentEncryptionAlgorithm);
		if(contentEncryptionOID === "")
			return Promise.reject("Wrong \"contentEncryptionAlgorithm\" value");
		
		const pbkdf2OID = this.getOIDByAlgorithm({
			name: "PBKDF2"
		});
		if(pbkdf2OID === "")
			return Promise.reject("Can not find OID for PBKDF2");
		
		const hmacOID = this.getOIDByAlgorithm({
			name: "HMAC",
			hash: {
				name: parameters.hmacHashAlgorithm
			}
		});
		if(hmacOID === "")
			return Promise.reject(`Incorrect value for "hmacHashAlgorithm": ${parameters.hmacHashAlgorithm}`);
		//endregion
		
		//region Initial variables
		let sequence = Promise.resolve();
		
		const ivBuffer = new ArrayBuffer(16); // For AES we need IV 16 bytes long
		const ivView = new Uint8Array(ivBuffer);
		this.getRandomValues(ivView);
		
		const saltBuffer = new ArrayBuffer(64);
		const saltView = new Uint8Array(saltBuffer);
		this.getRandomValues(saltView);
		
		const contentView = new Uint8Array(parameters.contentToEncrypt);
		
		const pbkdf2Params = new PBKDF2Params({
			salt: new OctetString({ valueHex: saltBuffer }),
			iterationCount: parameters.iterationCount,
			prf: new AlgorithmIdentifier({
				algorithmId: hmacOID,
				algorithmParams: new Null()
			})
		});
		//endregion
		
		//region Derive PBKDF2 key from "password" buffer
		sequence = sequence.then(() =>
		{
			const passwordView = new Uint8Array(parameters.password);
			
			return this.importKey("raw",
				passwordView,
				"PBKDF2",
				false,
				["deriveKey"]);
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		//region Derive key for "contentEncryptionAlgorithm"
		sequence = sequence.then(result =>
			this.deriveKey({
				name: "PBKDF2",
				hash: {
					name: parameters.hmacHashAlgorithm
				},
				salt: saltView,
				iterations: parameters.iterationCount
			},
			result,
			parameters.contentEncryptionAlgorithm,
			false,
			["encrypt"]),
		error =>
			Promise.reject(error)
		);
		//endregion
		
		//region Encrypt content
		sequence = sequence.then(result =>
			this.encrypt({
				name: parameters.contentEncryptionAlgorithm.name,
				iv: ivView
			},
			result,
			contentView),
		error =>
			Promise.reject(error)
		);
		//endregion
		
		//region Store all parameters in EncryptedData object
		sequence = sequence.then(result =>
		{
			const pbes2Parameters = new PBES2Params({
				keyDerivationFunc: new AlgorithmIdentifier({
					algorithmId: pbkdf2OID,
					algorithmParams: pbkdf2Params.toSchema()
				}),
				encryptionScheme: new AlgorithmIdentifier({
					algorithmId: contentEncryptionOID,
					algorithmParams: new OctetString({ valueHex: ivBuffer })
				})
			});
			
			return new EncryptedContentInfo({
				contentType: parameters.contentType,
				contentEncryptionAlgorithm: new AlgorithmIdentifier({
					algorithmId: "1.2.840.113549.1.5.13", // pkcs5PBES2
					algorithmParams: pbes2Parameters.toSchema()
				}),
				encryptedContent: new OctetString({ valueHex: result })
			});
		}, error =>
			Promise.reject(error)
		);
		//endregion

		return sequence;
	}
	//**********************************************************************************
	/**
	 * Decrypt data stored in "EncryptedContentInfo" object using parameters
	 * @param parameters
	 * @return {Promise}
	 */
	decryptEncryptedContentInfo(parameters)
	{
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("encryptedContentInfo" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"encryptedContentInfo\"");

		if(parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId !== "1.2.840.113549.1.5.13") // pkcs5PBES2
			return Promise.reject(`Unknown "contentEncryptionAlgorithm": ${parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
		//endregion
		
		//region Initial variables
		let sequence = Promise.resolve();
		
		let pbes2Parameters;
		
		try
		{
			pbes2Parameters = new PBES2Params({ schema: parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams });
		}
		catch(ex)
		{
			return Promise.reject("Incorrectly encoded \"pbes2Parameters\"");
		}
		
		let pbkdf2Params;
		
		try
		{
			pbkdf2Params = new PBKDF2Params({ schema: pbes2Parameters.keyDerivationFunc.algorithmParams });
		}
		catch(ex)
		{
			return Promise.reject("Incorrectly encoded \"pbkdf2Params\"");
		}
		
		const contentEncryptionAlgorithm = this.getAlgorithmByOID(pbes2Parameters.encryptionScheme.algorithmId);
		if(("name" in contentEncryptionAlgorithm) === false)
			return Promise.reject(`Incorrect OID for "contentEncryptionAlgorithm": ${pbes2Parameters.encryptionScheme.algorithmId}`);
		
		const ivBuffer = pbes2Parameters.encryptionScheme.algorithmParams.valueBlock.valueHex;
		const ivView = new Uint8Array(ivBuffer);
		
		const saltBuffer = pbkdf2Params.salt.valueBlock.valueHex;
		const saltView = new Uint8Array(saltBuffer);
		
		const iterationCount = pbkdf2Params.iterationCount;
		
		let hmacHashAlgorithm = "SHA-1";
		
		if("prf" in pbkdf2Params)
		{
			const algorithm = this.getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
			if(("name" in algorithm) === false)
				return Promise.reject("Incorrect OID for HMAC hash algorithm");
			
			hmacHashAlgorithm = algorithm.hash.name;
		}
		//endregion
		
		//region Derive PBKDF2 key from "password" buffer
		sequence = sequence.then(() =>
			this.importKey("raw",
				parameters.password,
				"PBKDF2",
				false,
				["deriveKey"]),
		error =>
			Promise.reject(error)
		);
		//endregion
		
		//region Derive key for "contentEncryptionAlgorithm"
		sequence = sequence.then(result =>
			this.deriveKey({
				name: "PBKDF2",
				hash: {
					name: hmacHashAlgorithm
				},
				salt: saltView,
				iterations: iterationCount
			},
			result,
			contentEncryptionAlgorithm,
			false,
			["decrypt"]),
		error =>
			Promise.reject(error)
		);
		//endregion
		
		//region Decrypt internal content using derived key
		sequence = sequence.then(result =>
		{
			//region Create correct data block for decryption
			let dataBuffer = new ArrayBuffer(0);
			
			if(parameters.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false)
				dataBuffer = parameters.encryptedContentInfo.encryptedContent.valueBlock.valueHex;
			else
			{
				for(const content of parameters.encryptedContentInfo.encryptedContent.valueBlock.value)
					dataBuffer = utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
			}
			//endregion
			
			return this.decrypt({
				name: contentEncryptionAlgorithm.name,
				iv: ivView
			},
			result,
			dataBuffer);
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Stamping (signing) data using algorithm simular to HMAC
	 * @param {Object} parameters
	 * @return {Promise.<T>|Promise}
	 */
	stampDataWithPassword(parameters)
	{
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("hashAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"hashAlgorithm\"");
		
		if(("salt" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("iterationCount" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"salt\"");
		
		if(("contentToStamp" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentToStamp\"");
		//endregion
		
		//region Choose correct length for HMAC key
		let length;
		
		switch(parameters.hashAlgorithm.toLowerCase())
		{
			case "sha-1":
				length = 160;
				break;
			case "sha-256":
				length = 256;
				break;
			case "sha-384":
				length = 384;
				break;
			case "sha-512":
				length = 512;
				break;
			default:
				return Promise.reject(`Incorrect "parameters.hashAlgorithm" parameter: ${parameters.hashAlgorithm}`);
		}
		//endregion
		
		//region Initial variables
		let sequence = Promise.resolve();
		
		const hmacAlgorithm = {
			name: "HMAC",
			length,
			hash: {
				name: parameters.hashAlgorithm
			}
		};
		//endregion

		//region Create PKCS#12 key for integrity checking
		sequence = sequence.then(() => makePKCS12B2Key(this, parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount));
		//endregion
		
		//region Import HMAC key
		// noinspection JSCheckFunctionSignatures
		sequence = sequence.then(
			result =>
				this.importKey("raw",
					new Uint8Array(result),
					hmacAlgorithm,
					false,
					["sign"])
		);
		//endregion
		
		//region Make signed HMAC value
		sequence = sequence.then(
			result =>
				this.sign(hmacAlgorithm, result, new Uint8Array(parameters.contentToStamp)),
			error => Promise.reject(error)
		);
		//endregion

		return sequence;
	}
	//**********************************************************************************
	verifyDataStampedWithPassword(parameters)
	{
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("hashAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"hashAlgorithm\"");
		
		if(("salt" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("iterationCount" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"salt\"");
		
		if(("contentToVerify" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentToVerify\"");
		
		if(("signatureToVerify" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"signatureToVerify\"");
		//endregion
		
		//region Choose correct length for HMAC key
		let length;
		
		switch(parameters.hashAlgorithm.toLowerCase())
		{
			case "sha-1":
				length = 160;
				break;
			case "sha-256":
				length = 256;
				break;
			case "sha-384":
				length = 384;
				break;
			case "sha-512":
				length = 512;
				break;
			default:
				return Promise.reject(`Incorrect "parameters.hashAlgorithm" parameter: ${parameters.hashAlgorithm}`);
		}
		//endregion
		
		//region Initial variables
		let sequence = Promise.resolve();
		
		const hmacAlgorithm = {
			name: "HMAC",
			length,
			hash: {
				name: parameters.hashAlgorithm
			}
		};
		//endregion
		
		//region Create PKCS#12 key for integrity checking
		sequence = sequence.then(() => makePKCS12B2Key(this, parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount));
		//endregion
		
		//region Import HMAC key
		// noinspection JSCheckFunctionSignatures
		sequence = sequence.then(result =>
			this.importKey("raw",
				new Uint8Array(result),
				hmacAlgorithm,
				false,
				["verify"])
		);
		//endregion
		
		//region Make signed HMAC value
		sequence = sequence.then(
			result =>
				this.verify(hmacAlgorithm, result, new Uint8Array(parameters.signatureToVerify), new Uint8Array(parameters.contentToVerify)),
			error => Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Get signature parameters by analyzing private key algorithm
	 * @param {Object} privateKey The private key user would like to use
	 * @param {string} [hashAlgorithm="SHA-1"] Hash algorithm user would like to use
	 * @return {Promise.<T>|Promise}
	 */
	getSignatureParameters(privateKey, hashAlgorithm = "SHA-1")
	{
		//region Check hashing algorithm
		const oid = this.getOIDByAlgorithm({ name: hashAlgorithm });
		if(oid === "")
			return Promise.reject(`Unsupported hash algorithm: ${hashAlgorithm}`);
		//endregion
		
		//region Initial variables
		const signatureAlgorithm = new AlgorithmIdentifier();
		//endregion
		
		//region Get a "default parameters" for current algorithm
		const parameters = this.getAlgorithmParameters(privateKey.algorithm.name, "sign");
		parameters.algorithm.hash.name = hashAlgorithm;
		//endregion
		
		//region Fill internal structures base on "privateKey" and "hashAlgorithm"
		switch(privateKey.algorithm.name.toUpperCase())
		{
			case "RSASSA-PKCS1-V1_5":
			case "ECDSA":
				signatureAlgorithm.algorithmId = this.getOIDByAlgorithm(parameters.algorithm);
				break;
			case "RSA-PSS":
				{
					//region Set "saltLength" as a length (in octets) of hash function result
					switch(hashAlgorithm.toUpperCase())
					{
						case "SHA-256":
							parameters.algorithm.saltLength = 32;
							break;
						case "SHA-384":
							parameters.algorithm.saltLength = 48;
							break;
						case "SHA-512":
							parameters.algorithm.saltLength = 64;
							break;
						default:
					}
					//endregion
					
					//region Fill "RSASSA_PSS_params" object
					const paramsObject = {};
					
					if(hashAlgorithm.toUpperCase() !== "SHA-1")
					{
						const hashAlgorithmOID = this.getOIDByAlgorithm({ name: hashAlgorithm });
						if(hashAlgorithmOID === "")
							return Promise.reject(`Unsupported hash algorithm: ${hashAlgorithm}`);
						
						paramsObject.hashAlgorithm = new AlgorithmIdentifier({
							algorithmId: hashAlgorithmOID,
							algorithmParams: new Null()
						});
						
						paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.8", // MGF1
							algorithmParams: paramsObject.hashAlgorithm.toSchema()
						});
					}
					
					if(parameters.algorithm.saltLength !== 20)
						paramsObject.saltLength = parameters.algorithm.saltLength;
					
					const pssParameters = new RSASSAPSSParams(paramsObject);
					//endregion
					
					//region Automatically set signature algorithm
					signatureAlgorithm.algorithmId = "1.2.840.113549.1.1.10";
					signatureAlgorithm.algorithmParams = pssParameters.toSchema();
					//endregion
				}
				break;
			default:
				return Promise.reject(`Unsupported signature algorithm: ${privateKey.algorithm.name}`);
		}
		//endregion

		return Promise.resolve().then(() => ({
			signatureAlgorithm,
			parameters
		}));
	}
	//**********************************************************************************
	/**
	 * Sign data with pre-defined private key
	 * @param {ArrayBuffer} data Data to be signed
	 * @param {Object} privateKey Private key to use
	 * @param {Object} parameters Parameters for used algorithm
	 * @return {Promise.<T>|Promise}
	 */
	signWithPrivateKey(data, privateKey, parameters)
	{
		return this.sign(parameters.algorithm,
			privateKey,
			new Uint8Array(data))
			.then(result =>
			{
				//region Special case for ECDSA algorithm
				if(parameters.algorithm.name === "ECDSA")
					result = createCMSECDSASignature(result);
				//endregion
				
				return result;
			}, error =>
				Promise.reject(`Signing error: ${error}`)
			);
	}
	//**********************************************************************************
	fillPublicKeyParameters(publicKeyInfo, signatureAlgorithm)
	{
		const parameters = {};
		
		//region Find signer's hashing algorithm
		const shaAlgorithm = this.getHashAlgorithm(signatureAlgorithm);
		if(shaAlgorithm === "")
			return Promise.reject(`Unsupported signature algorithm: ${signatureAlgorithm.algorithmId}`);
		//endregion
		
		//region Get information about public key algorithm and default parameters for import
		let algorithmId;
		if(signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10")
			algorithmId = signatureAlgorithm.algorithmId;
		else
			algorithmId = publicKeyInfo.algorithm.algorithmId;
		
		const algorithmObject = this.getAlgorithmByOID(algorithmId);
		if(("name" in algorithmObject) === "")
			return Promise.reject(`Unsupported public key algorithm: ${signatureAlgorithm.algorithmId}`);
		
		parameters.algorithm = this.getAlgorithmParameters(algorithmObject.name, "importkey");
		if("hash" in parameters.algorithm.algorithm)
			parameters.algorithm.algorithm.hash.name = shaAlgorithm;
		
		//region Special case for ECDSA
		if(algorithmObject.name === "ECDSA")
		{
			//region Get information about named curve
			let algorithmParamsChecked = false;
			
			if(("algorithmParams" in publicKeyInfo.algorithm) === true)
			{
				if("idBlock" in publicKeyInfo.algorithm.algorithmParams)
				{
					if((publicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1) && (publicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6))
						algorithmParamsChecked = true;
				}
			}
			
			if(algorithmParamsChecked === false)
				return Promise.reject("Incorrect type for ECDSA public key parameters");
			
			const curveObject = this.getAlgorithmByOID(publicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
			if(("name" in curveObject) === false)
				return Promise.reject(`Unsupported named curve algorithm: ${publicKeyInfo.algorithm.algorithmParams.valueBlock.toString()}`);
			//endregion
			
			parameters.algorithm.algorithm.namedCurve = curveObject.name;
		}
		//endregion
		//endregion
		
		return parameters;
	}
	//**********************************************************************************
	getPublicKey(publicKeyInfo, signatureAlgorithm, parameters = null)
	{
		if(parameters === null)
			parameters = this.fillPublicKeyParameters(publicKeyInfo, signatureAlgorithm);
		
		const publicKeyInfoSchema = publicKeyInfo.toSchema();
		const publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
		const publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);
		
		return this.importKey("spki",
			publicKeyInfoView,
			parameters.algorithm.algorithm,
			true,
			parameters.algorithm.usages
		);
	}
	//**********************************************************************************
	verifyWithPublicKey(data, signature, publicKeyInfo, signatureAlgorithm, shaAlgorithm = null)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		//endregion
		
		//region Find signer's hashing algorithm
		if(shaAlgorithm === null)
		{
			shaAlgorithm = this.getHashAlgorithm(signatureAlgorithm);
			if(shaAlgorithm === "")
				return Promise.reject(`Unsupported signature algorithm: ${signatureAlgorithm.algorithmId}`);
			
			//region Import public key
			sequence = sequence.then(() =>
				this.getPublicKey(publicKeyInfo, signatureAlgorithm));
			//endregion
		}
		else
		{
			const parameters = {};
			
			//region Get information about public key algorithm and default parameters for import
			let algorithmId;
			if(signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10")
				algorithmId = signatureAlgorithm.algorithmId;
			else
				algorithmId = publicKeyInfo.algorithm.algorithmId;
			
			const algorithmObject = this.getAlgorithmByOID(algorithmId);
			if(("name" in algorithmObject) === "")
				return Promise.reject(`Unsupported public key algorithm: ${signatureAlgorithm.algorithmId}`);
			
			parameters.algorithm = this.getAlgorithmParameters(algorithmObject.name, "importkey");
			if("hash" in parameters.algorithm.algorithm)
				parameters.algorithm.algorithm.hash.name = shaAlgorithm;
			
			//region Special case for ECDSA
			if(algorithmObject.name === "ECDSA")
			{
				//region Get information about named curve
				let algorithmParamsChecked = false;
				
				if(("algorithmParams" in publicKeyInfo.algorithm) === true)
				{
					if("idBlock" in publicKeyInfo.algorithm.algorithmParams)
					{
						if((publicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1) && (publicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6))
							algorithmParamsChecked = true;
					}
				}
				
				if(algorithmParamsChecked === false)
					return Promise.reject("Incorrect type for ECDSA public key parameters");
				
				const curveObject = this.getAlgorithmByOID(publicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
				if(("name" in curveObject) === false)
					return Promise.reject(`Unsupported named curve algorithm: ${publicKeyInfo.algorithm.algorithmParams.valueBlock.toString()}`);
				//endregion
				
				parameters.algorithm.algorithm.namedCurve = curveObject.name;
			}
			//endregion
			//endregion

			//region Import public key
			sequence = sequence.then(() =>
				this.getPublicKey(publicKeyInfo, null, parameters));
			//endregion
		}
		//endregion
		
		//region Verify signature
		sequence = sequence.then(publicKey =>
		{
			//region Get default algorithm parameters for verification
			const algorithm = this.getAlgorithmParameters(publicKey.algorithm.name, "verify");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = shaAlgorithm;
			//endregion
			
			//region Special case for ECDSA signatures
			let signatureValue = signature.valueBlock.valueHex;
			
			if(publicKey.algorithm.name === "ECDSA")
			{
				const asn1 = fromBER(signatureValue);
				// noinspection JSCheckFunctionSignatures
				signatureValue = createECDSASignatureFromCMS(asn1.result);
			}
			//endregion
			
			//region Special case for RSA-PSS
			if(publicKey.algorithm.name === "RSA-PSS")
			{
				let pssParameters;
				
				try
				{
					pssParameters = new RSASSAPSSParams({ schema: signatureAlgorithm.algorithmParams });
				}
				catch(ex)
				{
					return Promise.reject(ex);
				}
				
				if("saltLength" in pssParameters)
					algorithm.algorithm.saltLength = pssParameters.saltLength;
				else
					algorithm.algorithm.saltLength = 20;
				
				let hashAlgo = "SHA-1";
				
				if("hashAlgorithm" in pssParameters)
				{
					const hashAlgorithm = this.getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
					if(("name" in hashAlgorithm) === false)
						return Promise.reject(`Unrecognized hash algorithm: ${pssParameters.hashAlgorithm.algorithmId}`);
					
					hashAlgo = hashAlgorithm.name;
				}
				
				algorithm.algorithm.hash.name = hashAlgo;
			}
			//endregion
			
			return this.verify(algorithm.algorithm,
				publicKey,
				new Uint8Array(signatureValue),
				new Uint8Array(data)
			);
		});
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
//region Crypto engine related function
//**************************************************************************************
let engine = {
	name: "none",
	crypto: null,
	subtle: null
};
//**************************************************************************************
function setEngine(name, crypto, subtle)
{
	//region We are in Node
	// noinspection JSUnresolvedVariable
	if((typeof process !== "undefined") && ("pid" in process) && (typeof global !== "undefined") && (typeof window === "undefined"))
	{
		// noinspection ES6ModulesDependencies, JSUnresolvedVariable
		if(typeof global[process.pid] === "undefined")
		{
			// noinspection JSUnresolvedVariable
			global[process.pid] = {};
		}
		else
		{
			// noinspection JSUnresolvedVariable
			if(typeof global[process.pid] !== "object")
			{
				// noinspection JSUnresolvedVariable
				throw new Error(`Name global.${process.pid} already exists and it is not an object`);
			}
		}
		
		// noinspection JSUnresolvedVariable
		if(typeof global[process.pid].pkijs === "undefined")
		{
			// noinspection JSUnresolvedVariable
			global[process.pid].pkijs = {};
		}
		else
		{
			// noinspection JSUnresolvedVariable
			if(typeof global[process.pid].pkijs !== "object")
			{
				// noinspection JSUnresolvedVariable
				throw new Error(`Name global.${process.pid}.pkijs already exists and it is not an object`);
			}
		}
		
		// noinspection JSUnresolvedVariable
		global[process.pid].pkijs.engine = {
			name: name,
			crypto: crypto,
			subtle: subtle
		};
	}
	//endregion
	//region We are in browser
	else
	{
		engine = {
			name: name,
			crypto: crypto,
			subtle: subtle
		};
	}
	//endregion
}
//**************************************************************************************
function getEngine()
{
	//region We are in Node
	// noinspection JSUnresolvedVariable
	if((typeof process !== "undefined") && ("pid" in process) && (typeof global !== "undefined") && (typeof window === "undefined"))
	{
		let _engine;
		
		try
		{
			// noinspection JSUnresolvedVariable
			_engine = global[process.pid].pkijs.engine;
		}
		catch(ex)
		{
			throw new Error("Please call \"setEngine\" before call to \"getEngine\"");
		}
		
		return _engine;
	}
	//endregion
	
	return engine;
}
//**************************************************************************************
(function initCryptoEngine()
{
	if(typeof self !== "undefined")
	{
		if("crypto" in self)
		{
			let engineName = "webcrypto";
			
			/**
			 * Standard crypto object
			 * @type {Object}
			 * @property {Object} [webkitSubtle] Subtle object from Apple
			 */
			const cryptoObject = self.crypto;
			let subtleObject;
			
			// Apple Safari support
			if("webkitSubtle" in self.crypto)
			{
				try
				{
					subtleObject = self.crypto.webkitSubtle;
				}
				catch(ex)
				{
					subtleObject = self.crypto.subtle;
				}
				
				engineName = "safari";
			}
			
			if("subtle" in self.crypto)
				subtleObject = self.crypto.subtle;


			if(typeof subtleObject === "undefined")
			{
				engine = {
					name: engineName,
					crypto: cryptoObject,
					subtle: null
				};
			}
			else
			{
				engine = {
					name: engineName,
					crypto: cryptoObject,
					subtle: new CryptoEngine({name: engineName, crypto: self.crypto, subtle: subtleObject})
				};
			}
		}
	}
	
	setEngine(engine.name, engine.crypto, engine.subtle);
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
function getCrypto()
{
	const _engine = getEngine();
	
	if(_engine.subtle !== null)
		return _engine.subtle;
	
	return undefined;
}
//**************************************************************************************
/**
 * Initialize input Uint8Array by random values (with help from current "crypto engine")
 * @param {!Uint8Array} view
 * @returns {*}
 */
function getRandomValues(view)
{
	return getEngine().subtle.getRandomValues(view);
}
//**************************************************************************************
/**
 * Get OID for each specific algorithm
 * @param {Object} algorithm
 * @returns {string}
 */
function getOIDByAlgorithm(algorithm)
{
	return getEngine().subtle.getOIDByAlgorithm(algorithm);
}
//**************************************************************************************
/**
 * Create CMS ECDSA signature from WebCrypto ECDSA signature
 * @param {ArrayBuffer} signatureBuffer WebCrypto result of "sign" function
 * @returns {ArrayBuffer}
 */
function createCMSECDSASignature(signatureBuffer)
{
	//region Initial check for correct length
	if((signatureBuffer.byteLength % 2) !== 0)
		return new ArrayBuffer(0);
	//endregion
	
	//region Initial variables
	const length = signatureBuffer.byteLength / 2; // There are two equal parts inside incoming ArrayBuffer
	
	const rBuffer = new ArrayBuffer(length);
	const rView = new Uint8Array(rBuffer);
	rView.set(new Uint8Array(signatureBuffer, 0, length));
	
	const rInteger = new Integer({ valueHex: rBuffer });
	
	const sBuffer = new ArrayBuffer(length);
	const sView = new Uint8Array(sBuffer);
	sView.set(new Uint8Array(signatureBuffer, length, length));
	
	const sInteger = new Integer({ valueHex: sBuffer });
	//endregion
	
	return (new Sequence({
		value: [
			rInteger.convertToDER(),
			sInteger.convertToDER()
		]
	})).toBER(false);
}
//**************************************************************************************
/**
 * String preparation function. In a future here will be realization of algorithm from RFC4518
 * @param {string} inputString JavaScript string. As soon as for each ASN.1 string type we have a specific transformation function here we will work with pure JavaScript string
 * @returns {string} Formated string
 */
function stringPrep(inputString)
{
	//region Initial variables
	let isSpace = false;
	let cuttedResult = "";
	//endregion
	
	const result = inputString.trim(); // Trim input string
	
	//region Change all sequence of SPACE down to SPACE char
	for(let i = 0; i < result.length; i++)
	{
		if(result.charCodeAt(i) === 32)
		{
			if(isSpace === false)
				isSpace = true;
		}
		else
		{
			if(isSpace)
			{
				cuttedResult += " ";
				isSpace = false;
			}
			
			cuttedResult += result[i];
		}
	}
	//endregion
	
	return cuttedResult.toLowerCase();
}
//**************************************************************************************
/**
 * Create a single ArrayBuffer from CMS ECDSA signature
 * @param {Sequence} cmsSignature ASN.1 SEQUENCE contains CMS ECDSA signature
 * @returns {ArrayBuffer}
 */
function createECDSASignatureFromCMS(cmsSignature)
{
	//region Check input variables
	if((cmsSignature instanceof Sequence) === false)
		return new ArrayBuffer(0);
	
	if(cmsSignature.valueBlock.value.length !== 2)
		return new ArrayBuffer(0);
	
	if((cmsSignature.valueBlock.value[0] instanceof Integer) === false)
		return new ArrayBuffer(0);
	
	if((cmsSignature.valueBlock.value[1] instanceof Integer) === false)
		return new ArrayBuffer(0);
	//endregion
	
	const rValue = cmsSignature.valueBlock.value[0].convertFromDER();
	const sValue = cmsSignature.valueBlock.value[1].convertFromDER();
	
	//region Check the lengths of two parts are equal
	switch(true)
	{
		case (rValue.valueBlock.valueHex.byteLength < sValue.valueBlock.valueHex.byteLength):
			{
				if((sValue.valueBlock.valueHex.byteLength - rValue.valueBlock.valueHex.byteLength) !== 1)
					throw new Error("Incorrect DER integer decoding");
				
				const correctedLength = sValue.valueBlock.valueHex.byteLength;
				
				const rValueView = new Uint8Array(rValue.valueBlock.valueHex);
				
				const rValueBufferCorrected = new ArrayBuffer(correctedLength);
				const rValueViewCorrected = new Uint8Array(rValueBufferCorrected);
				
				rValueViewCorrected.set(rValueView, 1);
				rValueViewCorrected[0] = 0x00; // In order to be sure we do not have any garbage here
				
				return utilConcatBuf(rValueBufferCorrected, sValue.valueBlock.valueHex);
			}
		case (rValue.valueBlock.valueHex.byteLength > sValue.valueBlock.valueHex.byteLength):
			{
				if((rValue.valueBlock.valueHex.byteLength - sValue.valueBlock.valueHex.byteLength) !== 1)
					throw new Error("Incorrect DER integer decoding");
				
				const correctedLength = rValue.valueBlock.valueHex.byteLength;
				
				const sValueView = new Uint8Array(sValue.valueBlock.valueHex);
				
				const sValueBufferCorrected = new ArrayBuffer(correctedLength);
				const sValueViewCorrected = new Uint8Array(sValueBufferCorrected);
				
				sValueViewCorrected.set(sValueView, 1);
				sValueViewCorrected[0] = 0x00; // In order to be sure we do not have any garbage here
				
				return utilConcatBuf(rValue.valueBlock.valueHex, sValueBufferCorrected);
			}
		default:
			{
				//region In case we have equal length and the length is not even with 2
				if(rValue.valueBlock.valueHex.byteLength % 2)
				{
					const correctedLength = (rValue.valueBlock.valueHex.byteLength + 1);
					
					const rValueView = new Uint8Array(rValue.valueBlock.valueHex);
					
					const rValueBufferCorrected = new ArrayBuffer(correctedLength);
					const rValueViewCorrected = new Uint8Array(rValueBufferCorrected);
					
					rValueViewCorrected.set(rValueView, 1);
					rValueViewCorrected[0] = 0x00; // In order to be sure we do not have any garbage here
					
					const sValueView = new Uint8Array(sValue.valueBlock.valueHex);
					
					const sValueBufferCorrected = new ArrayBuffer(correctedLength);
					const sValueViewCorrected = new Uint8Array(sValueBufferCorrected);
					
					sValueViewCorrected.set(sValueView, 1);
					sValueViewCorrected[0] = 0x00; // In order to be sure we do not have any garbage here
					
					return utilConcatBuf(rValueBufferCorrected, sValueBufferCorrected);
				}
				//endregion
			}
	}
	//endregion
	
	return utilConcatBuf(rValue.valueBlock.valueHex, sValue.valueBlock.valueHex);
}
//**************************************************************************************
/**
 * Get WebCrypto algorithm by wel-known OID
 * @param {string} oid well-known OID to search for
 * @returns {Object}
 */
function getAlgorithmByOID(oid)
{
	return getEngine().subtle.getAlgorithmByOID(oid);
}
//**************************************************************************************
/**
 * ANS X9.63 Key Derivation Function having a "Counter" as a parameter
 * @param {string} hashFunction Used hash function
 * @param {ArrayBuffer} Zbuffer ArrayBuffer containing ECDH shared secret to derive from
 * @param {number} Counter
 * @param {ArrayBuffer} SharedInfo Usually DER encoded "ECC_CMS_SharedInfo" structure
 */
function kdfWithCounter(hashFunction, Zbuffer, Counter, SharedInfo)
{
	//region Check of input parameters
	switch(hashFunction.toUpperCase())
	{
		case "SHA-1":
		case "SHA-256":
		case "SHA-384":
		case "SHA-512":
			break;
		default:
			return Promise.reject(`Unknown hash function: ${hashFunction}`);
	}
	
	if((Zbuffer instanceof ArrayBuffer) === false)
		return Promise.reject("Please set \"Zbuffer\" as \"ArrayBuffer\"");
	
	if(Zbuffer.byteLength === 0)
		return Promise.reject("\"Zbuffer\" has zero length, error");
	
	if((SharedInfo instanceof ArrayBuffer) === false)
		return Promise.reject("Please set \"SharedInfo\" as \"ArrayBuffer\"");
	
	if(Counter > 255)
		return Promise.reject("Please set \"Counter\" variable to value less or equal to 255");
	//endregion
	
	//region Initial variables
	const counterBuffer = new ArrayBuffer(4);
	const counterView = new Uint8Array(counterBuffer);
	counterView[0] = 0x00;
	counterView[1] = 0x00;
	counterView[2] = 0x00;
	counterView[3] = Counter;
	
	let combinedBuffer = new ArrayBuffer(0);
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("Unable to create WebCrypto object");
	//endregion
	
	//region Create a combined ArrayBuffer for digesting
	combinedBuffer = utilConcatBuf(combinedBuffer, Zbuffer);
	combinedBuffer = utilConcatBuf(combinedBuffer, counterBuffer);
	combinedBuffer = utilConcatBuf(combinedBuffer, SharedInfo);
	//endregion
	
	//region Return digest of combined ArrayBuffer and information about current counter
	return crypto.digest({
		name: hashFunction
	},
	combinedBuffer)
		.then(result =>
			({
				counter: Counter,
				result
			}));
	//endregion
}
//**************************************************************************************
/**
 * ANS X9.63 Key Derivation Function
 * @param {string} hashFunction Used hash function
 * @param {ArrayBuffer} Zbuffer ArrayBuffer containing ECDH shared secret to derive from
 * @param {number} keydatalen Length (!!! in BITS !!!) of used kew derivation function
 * @param {ArrayBuffer} SharedInfo Usually DER encoded "ECC_CMS_SharedInfo" structure
 */
function kdf(hashFunction, Zbuffer, keydatalen, SharedInfo)
{
	//region Initial variables
	let hashLength = 0;
	let maxCounter = 1;
	
	const kdfArray = [];
	//endregion
	
	//region Check of input parameters
	switch(hashFunction.toUpperCase())
	{
		case "SHA-1":
			hashLength = 160; // In bits
			break;
		case "SHA-256":
			hashLength = 256; // In bits
			break;
		case "SHA-384":
			hashLength = 384; // In bits
			break;
		case "SHA-512":
			hashLength = 512; // In bits
			break;
		default:
			return Promise.reject(`Unknown hash function: ${hashFunction}`);
	}
	
	if((Zbuffer instanceof ArrayBuffer) === false)
		return Promise.reject("Please set \"Zbuffer\" as \"ArrayBuffer\"");
	
	if(Zbuffer.byteLength === 0)
		return Promise.reject("\"Zbuffer\" has zero length, error");
	
	if((SharedInfo instanceof ArrayBuffer) === false)
		return Promise.reject("Please set \"SharedInfo\" as \"ArrayBuffer\"");
	//endregion
	
	//region Calculated maximum value of "Counter" variable
	const quotient = keydatalen / hashLength;
	
	if(Math.floor(quotient) > 0)
	{
		maxCounter = Math.floor(quotient);
		
		if((quotient - maxCounter) > 0)
			maxCounter++;
	}
	//endregion
	
	//region Create an array of "kdfWithCounter"
	for(let i = 1; i <= maxCounter; i++)
		kdfArray.push(kdfWithCounter(hashFunction, Zbuffer, i, SharedInfo));
	//endregion
	
	//region Return combined digest with specified length
	return Promise.all(kdfArray).then(incomingResult =>
	{
		//region Initial variables
		let combinedBuffer = new ArrayBuffer(0);
		let currentCounter = 1;
		let found = true;
		//endregion
		
		//region Combine all buffer together
		while(found)
		{
			found = false;
			
			for(const result of incomingResult)
			{
				if(result.counter === currentCounter)
				{
					combinedBuffer = utilConcatBuf(combinedBuffer, result.result);
					found = true;
					break;
				}
			}
			
			currentCounter++;
		}
		//endregion
		
		//region Create output buffer with specified length
		keydatalen >>= 3; // Divide by 8 since "keydatalen" is in bits
		
		if(combinedBuffer.byteLength > keydatalen)
		{
			const newBuffer = new ArrayBuffer(keydatalen);
			const newView = new Uint8Array(newBuffer);
			const combinedView = new Uint8Array(combinedBuffer);
			
			for(let i = 0; i < keydatalen; i++)
				newView[i] = combinedView[i];
			
			return newBuffer;
		}
		
		return combinedBuffer; // Since the situation when "combinedBuffer.byteLength < keydatalen" here we have only "combinedBuffer.byteLength === keydatalen"
		//endregion
	});
	//endregion
}
//**************************************************************************************
//endregion
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class AttributeTypeAndValue
{
	//**********************************************************************************
	/**
	 * Constructor for AttributeTypeAndValue class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc type
		 */
		this.type = getParametersValue(parameters, "type", AttributeTypeAndValue.defaultValues("type"));
		/**
		 * @type {Object}
		 * @desc Value of the AttributeTypeAndValue class
		 */
		this.value = getParametersValue(parameters, "value", AttributeTypeAndValue.defaultValues("value"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "type":
				return "";
			case "value":
				return {};
			default:
				throw new Error(`Invalid member name for AttributeTypeAndValue class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AttributeTypeAndValue ::= Sequence {
	 *    type     AttributeType,
	 *    value    AttributeValue }
	 *
	 * AttributeType ::= OBJECT IDENTIFIER
	 *
	 * AttributeValue ::= ANY -- DEFINED BY AttributeType
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName] Name for entire block
		 * @property {string} [type] Name for "type" element
		 * @property {string} [value] Name for "value" element
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.type || "") }),
				new Any({ name: (names.value || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"type",
			"typeValue"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AttributeTypeAndValue.schema({
				names: {
					type: "type",
					value: "typeValue"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttributeTypeAndValue");
		//endregion

		//region Get internal properties from parsed schema
		this.type = asn1.result.type.valueBlock.toString();
		// noinspection JSUnresolvedVariable
		this.value = asn1.result.typeValue;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.type }),
				this.value
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			type: this.type
		};

		if(Object.keys(this.value).length !== 0)
			_object.value = this.value.toJSON();
		else
			_object.value = this.value;

		return _object;
	}
	//**********************************************************************************
	/**
	 * Compare two AttributeTypeAndValue values, or AttributeTypeAndValue with ArrayBuffer value
	 * @param {(AttributeTypeAndValue|ArrayBuffer)} compareTo The value compare to current
	 * @returns {boolean}
	 */
	isEqual(compareTo)
	{
		if(compareTo instanceof AttributeTypeAndValue)
		{
			if(this.type !== compareTo.type)
				return false;
			
			// noinspection OverlyComplexBooleanExpressionJS
			if(((this.value instanceof Utf8String) && (compareTo.value instanceof Utf8String)) ||
				((this.value instanceof BmpString) && (compareTo.value instanceof BmpString)) ||
				((this.value instanceof UniversalString) && (compareTo.value instanceof UniversalString)) ||
				((this.value instanceof NumericString) && (compareTo.value instanceof NumericString)) ||
				((this.value instanceof PrintableString) && (compareTo.value instanceof PrintableString)) ||
				((this.value instanceof TeletexString) && (compareTo.value instanceof TeletexString)) ||
				((this.value instanceof VideotexString) && (compareTo.value instanceof VideotexString)) ||
				((this.value instanceof IA5String) && (compareTo.value instanceof IA5String)) ||
				((this.value instanceof GraphicString) && (compareTo.value instanceof GraphicString)) ||
				((this.value instanceof VisibleString) && (compareTo.value instanceof VisibleString)) ||
				((this.value instanceof GeneralString) && (compareTo.value instanceof GeneralString)) ||
				((this.value instanceof CharacterString) && (compareTo.value instanceof CharacterString)))
			{
				const value1 = stringPrep(this.value.valueBlock.value);
				const value2 = stringPrep(compareTo.value.valueBlock.value);
				
				if(value1.localeCompare(value2) !== 0)
					return false;
			}
			else // Comparing as two ArrayBuffers
			{
				if(isEqualBuffer(this.value.valueBeforeDecode, compareTo.value.valueBeforeDecode) === false)
					return false;
			}
			
			return true;
		}
		
		if(compareTo instanceof ArrayBuffer)
			return isEqualBuffer(this.value.valueBeforeDecode, compareTo);

		return false;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class RelativeDistinguishedNames
{
	//**********************************************************************************
	/**
	 * Constructor for RelativeDistinguishedNames class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {Array.<AttributeTypeAndValue>} [typesAndValues] Array of "type and value" objects
	 * @property {ArrayBuffer} [valueBeforeDecode] Value of the RDN before decoding from schema
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<AttributeTypeAndValue>}
		 * @desc Array of "type and value" objects
		 */
		this.typesAndValues = getParametersValue(parameters, "typesAndValues", RelativeDistinguishedNames.defaultValues("typesAndValues"));
		/**
		 * @type {ArrayBuffer}
		 * @desc Value of the RDN before decoding from schema
		 */
		this.valueBeforeDecode = getParametersValue(parameters, "valueBeforeDecode", RelativeDistinguishedNames.defaultValues("valueBeforeDecode"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "typesAndValues":
				return [];
			case "valueBeforeDecode":
				return new ArrayBuffer(0);
			default:
				throw new Error(`Invalid member name for RelativeDistinguishedNames class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "typesAndValues":
				return (memberValue.length === 0);
			case "valueBeforeDecode":
				return (memberValue.byteLength === 0);
			default:
				throw new Error(`Invalid member name for RelativeDistinguishedNames class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RDNSequence ::= Sequence OF RelativeDistinguishedName
	 *
	 * RelativeDistinguishedName ::=
	 * SET SIZE (1..MAX) OF AttributeTypeAndValue
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName] Name for entire block
		 * @property {string} [repeatedSequence] Name for "repeatedSequence" block
		 * @property {string} [repeatedSet] Name for "repeatedSet" block
		 * @property {string} [typeAndValue] Name for "typeAndValue" block
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.repeatedSequence || ""),
					value: new Set({
						value: [
							new Repeated({
								name: (names.repeatedSet || ""),
								value: AttributeTypeAndValue.schema(names.typeAndValue || {})
							})
						]
					})
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"RDN",
			"typesAndValues"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RelativeDistinguishedNames.schema({
				names: {
					blockName: "RDN",
					repeatedSet: "typesAndValues"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RelativeDistinguishedNames");
		//endregion

		//region Get internal properties from parsed schema
		if("typesAndValues" in asn1.result) // Could be a case when there is no "types and values"
			this.typesAndValues = Array.from(asn1.result.typesAndValues, element => new AttributeTypeAndValue({ schema: element }));

		// noinspection JSUnresolvedVariable
		this.valueBeforeDecode = asn1.result.RDN.valueBeforeDecode;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Decode stored TBS value
		if(this.valueBeforeDecode.byteLength === 0) // No stored encoded array, create "from scratch"
		{
			return (new Sequence({
				value: [new Set({
					value: Array.from(this.typesAndValues, element => element.toSchema())
				})]
			}));
		}

		const asn1 = fromBER(this.valueBeforeDecode);
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
	toJSON()
	{
		return {
			typesAndValues: Array.from(this.typesAndValues, element => element.toJSON())
		};
	}
	//**********************************************************************************
	/**
	 * Compare two RDN values, or RDN with ArrayBuffer value
	 * @param {(RelativeDistinguishedNames|ArrayBuffer)} compareTo The value compare to current
	 * @returns {boolean}
	 */
	isEqual(compareTo)
	{
		if(compareTo instanceof RelativeDistinguishedNames)
		{
			if(this.typesAndValues.length !== compareTo.typesAndValues.length)
				return false;

			for(const [index, typeAndValue] of this.typesAndValues.entries())
			{
				if(typeAndValue.isEqual(compareTo.typesAndValues[index]) === false)
					return false;
			}

			return true;
		}

		if(compareTo instanceof ArrayBuffer)
			return isEqualBuffer(this.valueBeforeDecode, compareTo);

		return false;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class Time
{
	//**********************************************************************************
	/**
	 * Constructor for Time class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {number} [type] 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
	 * @property {Date} [value] Value of the TIME class
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
		 */
		this.type = getParametersValue(parameters, "type", Time.defaultValues("type"));
		/**
		 * @type {Date}
		 * @desc Value of the TIME class
		 */
		this.value = getParametersValue(parameters, "value", Time.defaultValues("value"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "type":
				return 0;
			case "value":
				return new Date(0, 0, 0);
			default:
				throw new Error(`Invalid member name for Time class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Time ::= CHOICE {
     *   utcTime        UTCTime,
     *   generalTime    GeneralizedTime }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @param {boolean} optional Flag that current schema should be optional
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {}, optional = false)
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [utcTimeName] Name for "utcTimeName" choice
		 * @property {string} [generalTimeName] Name for "generalTimeName" choice
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Choice({
			optional,
			value: [
				new UTCTime({ name: (names.utcTimeName || "") }),
				new GeneralizedTime({ name: (names.generalTimeName || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"utcTimeName",
			"generalTimeName"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema, schema, Time.schema({
			names: {
				utcTimeName: "utcTimeName",
				generalTimeName: "generalTimeName"
			}
		}));

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Time");
		//endregion

		//region Get internal properties from parsed schema
		if("utcTimeName" in asn1.result)
		{
			this.type = 0;
			this.value = asn1.result.utcTimeName.toDate();
		}
		if("generalTimeName" in asn1.result)
		{
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		let result = {};

		if(this.type === 0)
			result = new UTCTime({ valueDate: this.value });
		if(this.type === 1)
			result = new GeneralizedTime({ valueDate: this.value });

		return result;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			type: this.type,
			value: this.value
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class SubjectDirectoryAttributes
{
	//**********************************************************************************
	/**
	 * Constructor for SubjectDirectoryAttributes class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<Attribute>}
		 * @desc attributes
		 */
		this.attributes = getParametersValue(parameters, "attributes", SubjectDirectoryAttributes.defaultValues("attributes"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "attributes":
				return [];
			default:
				throw new Error(`Invalid member name for SubjectDirectoryAttributes class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * SubjectDirectoryAttributes ::= SEQUENCE SIZE (1..MAX) OF Attribute
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [utcTimeName] Name for "utcTimeName" choice
		 * @property {string} [generalTimeName] Name for "generalTimeName" choice
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.attributes || ""),
					value: Attribute.schema()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"attributes"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			SubjectDirectoryAttributes.schema({
				names: {
					attributes: "attributes"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SubjectDirectoryAttributes");
		//endregion

		//region Get internal properties from parsed schema
		this.attributes = Array.from(asn1.result.attributes, element => new Attribute({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.attributes, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			attributes: Array.from(this.attributes, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class PrivateKeyUsagePeriod
{
	//**********************************************************************************
	/**
	 * Constructor for PrivateKeyUsagePeriod class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("notBefore" in parameters)
			/**
			 * @type {Date}
			 * @desc notBefore
			 */
			this.notBefore = getParametersValue(parameters, "notBefore", PrivateKeyUsagePeriod.defaultValues("notBefore"));

		if("notAfter" in parameters)
			/**
			 * @type {Date}
			 * @desc notAfter
			 */
			this.notAfter = getParametersValue(parameters, "notAfter", PrivateKeyUsagePeriod.defaultValues("notAfter"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "notBefore":
				return new Date();
			case "notAfter":
				return new Date();
			default:
				throw new Error(`Invalid member name for PrivateKeyUsagePeriod class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PrivateKeyUsagePeriod OID ::= 2.5.29.16
	 *
	 * PrivateKeyUsagePeriod ::= SEQUENCE {
	 *    notBefore       [0]     GeneralizedTime OPTIONAL,
	 *    notAfter        [1]     GeneralizedTime OPTIONAL }
	 * -- either notBefore or notAfter MUST be present
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [notBefore]
		 * @property {string} [notAfter]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Primitive({
					name: (names.notBefore || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					}
				}),
				new Primitive({
					name: (names.notAfter || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"notBefore",
			"notAfter"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PrivateKeyUsagePeriod.schema({
				names: {
					notBefore: "notBefore",
					notAfter: "notAfter"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PrivateKeyUsagePeriod");
		//endregion

		//region Get internal properties from parsed schema
		if("notBefore" in asn1.result)
		{
			const localNotBefore = new GeneralizedTime();
			localNotBefore.fromBuffer(asn1.result.notBefore.valueBlock.valueHex);
			this.notBefore = localNotBefore.toDate();
		}

		if("notAfter" in asn1.result)
		{
			const localNotAfter = new GeneralizedTime({ valueHex: asn1.result.notAfter.valueBlock.valueHex });
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
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if("notBefore" in this)
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				valueHex: (new GeneralizedTime({ valueDate: this.notBefore })).valueBlock.valueHex
			}));
		}
		
		if("notAfter" in this)
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				valueHex: (new GeneralizedTime({ valueDate: this.notAfter })).valueBlock.valueHex
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};

		if("notBefore" in this)
			object.notBefore = this.notBefore;

		if("notAfter" in this)
			object.notAfter = this.notAfter;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
//region Additional asn1js schema elements existing inside GeneralName schema
//**************************************************************************************
/**
 * Schema for "builtInStandardAttributes" of "ORAddress"
 * @param {Object} parameters
 * @property {Object} [names]
 * @param {boolean} optional
 * @returns {Sequence}
 */
function builtInStandardAttributes(parameters = {}, optional = false)
{
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
	const names = getParametersValue(parameters, "names", {});

	return (new Sequence({
		optional,
		value: [
			new Constructed({
				optional: true,
				idBlock: {
					tagClass: 2, // APPLICATION-SPECIFIC
					tagNumber: 1 // [1]
				},
				name: (names.country_name || ""),
				value: [
					new Choice({
						value: [
							new NumericString(),
							new PrintableString()
						]
					})
				]
			}),
			new Constructed({
				optional: true,
				idBlock: {
					tagClass: 2, // APPLICATION-SPECIFIC
					tagNumber: 2 // [2]
				},
				name: (names.administration_domain_name || ""),
				value: [
					new Choice({
						value: [
							new NumericString(),
							new PrintableString()
						]
					})
				]
			}),
			new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				name: (names.network_address || ""),
				isHexOnly: true
			}),
			new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				name: (names.terminal_identifier || ""),
				isHexOnly: true
			}),
			new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				name: (names.private_domain_name || ""),
				value: [
					new Choice({
						value: [
							new NumericString(),
							new PrintableString()
						]
					})
				]
			}),
			new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				name: (names.organization_name || ""),
				isHexOnly: true
			}),
			new Primitive({
				optional: true,
				name: (names.numeric_user_identifier || ""),
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 4 // [4]
				},
				isHexOnly: true
			}),
			new Constructed({
				optional: true,
				name: (names.personal_name || ""),
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 5 // [5]
				},
				value: [
					new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						isHexOnly: true
					}),
					new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						isHexOnly: true
					}),
					new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						isHexOnly: true
					}),
					new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						isHexOnly: true
					})
				]
			}),
			new Constructed({
				optional: true,
				name: (names.organizational_unit_names || ""),
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 6 // [6]
				},
				value: [
					new Repeated({
						value: new PrintableString()
					})
				]
			})
		]
	}));
}
//**************************************************************************************
/**
 * Schema for "builtInDomainDefinedAttributes" of "ORAddress"
 * @param {boolean} optional
 * @returns {Sequence}
 */
function builtInDomainDefinedAttributes(optional = false)
{
	return (new Sequence({
		optional,
		value: [
			new PrintableString(),
			new PrintableString()
		]
	}));
}
//**************************************************************************************
/**
 * Schema for "builtInDomainDefinedAttributes" of "ORAddress"
 * @param {boolean} optional
 * @returns {Set}
 */
function extensionAttributes(optional = false)
{
	return (new Set({
		optional,
		value: [
			new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				isHexOnly: true
			}),
			new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [new Any()]
			})
		]
	}));
}
//**************************************************************************************
//endregion
//**************************************************************************************
/**
 * Class from RFC5280
 */
class GeneralName
{
	//**********************************************************************************
	/**
	 * Constructor for GeneralName class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {number} [type] value type - from a tagged value (0 for "otherName", 1 for "rfc822Name" etc.)
	 * @property {Object} [value] asn1js object having GeneralName value (type depends on "type" value)
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc value type - from a tagged value (0 for "otherName", 1 for "rfc822Name" etc.)
		 */
		this.type = getParametersValue(parameters, "type", GeneralName.defaultValues("type"));
		/**
		 * @type {Object}
		 * @desc asn1js object having GeneralName value (type depends on "type" value)
		 */
		this.value = getParametersValue(parameters, "value", GeneralName.defaultValues("value"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "type":
				return 9;
			case "value":
				return {};
			default:
				throw new Error(`Invalid member name for GeneralName class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "type":
				return (memberValue === GeneralName.defaultValues(memberName));
			case "value":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for GeneralName class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * GeneralName ::= Choice {
	 *    otherName                       [0]     OtherName,
	 *    rfc822Name                      [1]     IA5String,
	 *    dNSName                         [2]     IA5String,
	 *    x400Address                     [3]     ORAddress,
	 *    directoryName                   [4]     value,
	 *    ediPartyName                    [5]     EDIPartyName,
	 *    uniformResourceIdentifier       [6]     IA5String,
	 *    iPAddress                       [7]     OCTET STRING,
	 *    registeredID                    [8]     OBJECT IDENTIFIER }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {Object} [directoryName]
		 * @property {Object} [builtInStandardAttributes]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Choice({
			value: [
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					name: (names.blockName || ""),
					value: [
						new ObjectIdentifier(),
						new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [new Any()]
						})
					]
				}),
				new Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				}),
				new Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					}
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					},
					name: (names.blockName || ""),
					value: [
						builtInStandardAttributes((names.builtInStandardAttributes || {}), false),
						builtInDomainDefinedAttributes(true),
						extensionAttributes(true)
					]
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 4 // [4]
					},
					name: (names.blockName || ""),
					value: [RelativeDistinguishedNames.schema(names.directoryName || {})]
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 5 // [5]
					},
					name: (names.blockName || ""),
					value: [
						new Constructed({
							optional: true,
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [
								new Choice({
									value: [
										new TeletexString(),
										new PrintableString(),
										new UniversalString(),
										new Utf8String(),
										new BmpString()
									]
								})
							]
						}),
						new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [
								new Choice({
									value: [
										new TeletexString(),
										new PrintableString(),
										new UniversalString(),
										new Utf8String(),
										new BmpString()
									]
								})
							]
						})
					]
				}),
				new Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 6 // [6]
					}
				}),
				new Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 7 // [7]
					}
				}),
				new Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 8 // [8]
					}
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"blockName",
			"otherName",
			"rfc822Name",
			"dNSName",
			"x400Address",
			"directoryName",
			"ediPartyName",
			"uniformResourceIdentifier",
			"iPAddress",
			"registeredID"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			GeneralName.schema({
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
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for GeneralName");
		//endregion

		//region Get internal properties from parsed schema
		this.type = asn1.result.blockName.idBlock.tagNumber;

		switch(this.type)
		{
			case 0: // otherName
				this.value = asn1.result.blockName;
				break;
			case 1: // rfc822Name + dNSName + uniformResourceIdentifier
			case 2:
			case 6:
				{
					const value = asn1.result.blockName;

					value.idBlock.tagClass = 1; // UNIVERSAL
					value.idBlock.tagNumber = 22; // IA5STRING

					const valueBER = value.toBER(false);

					this.value = fromBER(valueBER).result.valueBlock.value;
				}
				break;
			case 3: // x400Address
				this.value = asn1.result.blockName;
				break;
			case 4: // directoryName
				this.value = new RelativeDistinguishedNames({ schema: asn1.result.directoryName });
				break;
			case 5: // ediPartyName
				this.value = asn1.result.ediPartyName;
				break;
			case 7: // iPAddress
				this.value = new OctetString({ valueHex: asn1.result.blockName.valueBlock.valueHex });
				break;
			case 8: // registeredID
				{
					const value = asn1.result.blockName;

					value.idBlock.tagClass = 1; // UNIVERSAL
					value.idBlock.tagNumber = 6; // ObjectIdentifier

					const valueBER = value.toBER(false);

					this.value = fromBER(valueBER).result.valueBlock.toString(); // Getting a string representation of the ObjectIdentifier
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		switch(this.type)
		{
			case 0:
			case 3:
			case 5:
				return new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: this.type
					},
					value: [
						this.value
					]
				});
			case 1:
			case 2:
			case 6:
				{
					const value = new IA5String({ value: this.value });

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
					const value = this.value;

					value.idBlock.tagClass = 3;
					value.idBlock.tagNumber = this.type;

					return value;
				}
			case 8:
				{
					const value = new ObjectIdentifier({ value: this.value });

					value.idBlock.tagClass = 3;
					value.idBlock.tagNumber = this.type;

					return value;
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
	toJSON()
	{
		const _object = {
			type: this.type,
			value: ""
		};

		if((typeof this.value) === "string")
			_object.value = this.value;
		else
		{
			try
			{
				_object.value = this.value.toJSON();
			}
			catch(ex){}
		}

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class AltName
{
	//**********************************************************************************
	/**
	 * Constructor for AltName class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<GeneralName>}
		 * @desc Array of alternative names in GeneralName type
		 */
		this.altNames = getParametersValue(parameters, "altNames", AltName.defaultValues("altNames"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "altNames":
				return [];
			default:
				throw new Error(`Invalid member name for AltName class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AltName ::= GeneralNames
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [altNames]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.altNames || ""),
					value: GeneralName.schema()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"altNames"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AltName.schema({
				names: {
					altNames: "altNames"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AltName");
		//endregion

		//region Get internal properties from parsed schema
		if("altNames" in asn1.result)
			this.altNames = Array.from(asn1.result.altNames, element => new GeneralName({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.altNames, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			altNames: Array.from(this.altNames, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class BasicConstraints
{
	//**********************************************************************************
	/**
	 * Constructor for BasicConstraints class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {Object} [cA]
	 * @property {Object} [pathLenConstraint]
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {boolean}
		 * @desc cA
		 */
		this.cA = getParametersValue(parameters, "cA", false);

		if("pathLenConstraint" in parameters)
			/**
			 * @type {number|Integer}
			 * @desc pathLenConstraint
			 */
			this.pathLenConstraint = getParametersValue(parameters, "pathLenConstraint", 0);
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "cA":
				return false;
			default:
				throw new Error(`Invalid member name for BasicConstraints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * BasicConstraints ::= SEQUENCE {
	 *    cA                      BOOLEAN DEFAULT FALSE,
	 *    pathLenConstraint       INTEGER (0..MAX) OPTIONAL }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [cA]
		 * @property {string} [pathLenConstraint]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Boolean({
					optional: true,
					name: (names.cA || "")
				}),
				new Integer({
					optional: true,
					name: (names.pathLenConstraint || "")
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"cA",
			"pathLenConstraint"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			BasicConstraints.schema({
				names: {
					cA: "cA",
					pathLenConstraint: "pathLenConstraint"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for BasicConstraints");
		//endregion

		//region Get internal properties from parsed schema
		if("cA" in asn1.result)
			this.cA = asn1.result.cA.valueBlock.value;

		if("pathLenConstraint" in asn1.result)
		{
			if(asn1.result.pathLenConstraint.valueBlock.isHexOnly)
				this.pathLenConstraint = asn1.result.pathLenConstraint;
			else
				this.pathLenConstraint = asn1.result.pathLenConstraint.valueBlock.valueDec;
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if(this.cA !== BasicConstraints.defaultValues("cA"))
			outputArray.push(new Boolean({ value: this.cA }));
		
		if("pathLenConstraint" in this)
		{
			if(this.pathLenConstraint instanceof Integer)
				outputArray.push(this.pathLenConstraint);
			else
				outputArray.push(new Integer({ value: this.pathLenConstraint }));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};

		if(this.cA !== BasicConstraints.defaultValues("cA"))
			object.cA = this.cA;

		if("pathLenConstraint" in this)
		{
			if(this.pathLenConstraint instanceof Integer)
				object.pathLenConstraint = this.pathLenConstraint.toJSON();
			else
				object.pathLenConstraint = this.pathLenConstraint;
		}

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class IssuingDistributionPoint
{
	//**********************************************************************************
	/**
	 * Constructor for IssuingDistributionPoint class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("distributionPoint" in parameters)
			/**
			 * @type {Array.<GeneralName>|RelativeDistinguishedNames}
			 * @desc distributionPoint
			 */
			this.distributionPoint = getParametersValue(parameters, "distributionPoint", IssuingDistributionPoint.defaultValues("distributionPoint"));

		/**
		 * @type {boolean}
		 * @desc onlyContainsUserCerts
		 */
		this.onlyContainsUserCerts = getParametersValue(parameters, "onlyContainsUserCerts", IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"));

		/**
		 * @type {boolean}
		 * @desc onlyContainsCACerts
		 */
		this.onlyContainsCACerts = getParametersValue(parameters, "onlyContainsCACerts", IssuingDistributionPoint.defaultValues("onlyContainsCACerts"));

		if("onlySomeReasons" in parameters)
			/**
			 * @type {number}
			 * @desc onlySomeReasons
			 */
			this.onlySomeReasons = getParametersValue(parameters, "onlySomeReasons", IssuingDistributionPoint.defaultValues("onlySomeReasons"));

		/**
		 * @type {boolean}
		 * @desc indirectCRL
		 */
		this.indirectCRL = getParametersValue(parameters, "indirectCRL", IssuingDistributionPoint.defaultValues("indirectCRL"));

		/**
		 * @type {boolean}
		 * @desc onlyContainsAttributeCerts
		 */
		this.onlyContainsAttributeCerts = getParametersValue(parameters, "onlyContainsAttributeCerts", IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
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
				throw new Error(`Invalid member name for IssuingDistributionPoint class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * IssuingDistributionPoint ::= SEQUENCE {
	 *    distributionPoint          [0] DistributionPointName OPTIONAL,
	 *    onlyContainsUserCerts      [1] BOOLEAN DEFAULT FALSE,
	 *    onlyContainsCACerts        [2] BOOLEAN DEFAULT FALSE,
	 *    onlySomeReasons            [3] ReasonFlags OPTIONAL,
	 *    indirectCRL                [4] BOOLEAN DEFAULT FALSE,
	 *    onlyContainsAttributeCerts [5] BOOLEAN DEFAULT FALSE }
	 *
	 * ReasonFlags ::= BIT STRING {
	 *    unused                  (0),
	 *    keyCompromise           (1),
	 *    cACompromise            (2),
	 *    affiliationChanged      (3),
	 *    superseded              (4),
	 *    cessationOfOperation    (5),
	 *    certificateHold         (6),
	 *    privilegeWithdrawn      (7),
	 *    aACompromise            (8) }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
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
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new Choice({
							value: [
								new Constructed({
									name: (names.distributionPoint || ""),
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 0 // [0]
									},
									value: [
										new Repeated({
											name: (names.distributionPointNames || ""),
											value: GeneralName.schema()
										})
									]
								}),
								new Constructed({
									name: (names.distributionPoint || ""),
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 1 // [1]
									},
									value: RelativeDistinguishedNames.schema().valueBlock.value
								})
							]
						})
					]
				}),
				new Primitive({
					name: (names.onlyContainsUserCerts || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				}), // IMPLICIT boolean value
				new Primitive({
					name: (names.onlyContainsCACerts || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					}
				}), // IMPLICIT boolean value
				new Primitive({
					name: (names.onlySomeReasons || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					}
				}), // IMPLICIT bitstring value
				new Primitive({
					name: (names.indirectCRL || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 4 // [4]
					}
				}), // IMPLICIT boolean value
				new Primitive({
					name: (names.onlyContainsAttributeCerts || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 5 // [5]
					}
				}) // IMPLICIT boolean value
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"distributionPoint",
			"distributionPointNames",
			"onlyContainsUserCerts",
			"onlyContainsCACerts",
			"onlySomeReasons",
			"indirectCRL",
			"onlyContainsAttributeCerts"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			IssuingDistributionPoint.schema({
				names: {
					distributionPoint: "distributionPoint",
					distributionPointNames: "distributionPointNames",
					onlyContainsUserCerts: "onlyContainsUserCerts",
					onlyContainsCACerts: "onlyContainsCACerts",
					onlySomeReasons: "onlySomeReasons",
					indirectCRL: "indirectCRL",
					onlyContainsAttributeCerts: "onlyContainsAttributeCerts"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for IssuingDistributionPoint");
		//endregion
		
		//region Get internal properties from parsed schema
		if("distributionPoint" in asn1.result)
		{
			switch(true)
			{
				case (asn1.result.distributionPoint.idBlock.tagNumber === 0): // GENERAL_NAMES variant
					this.distributionPoint = Array.from(asn1.result.distributionPointNames, element => new GeneralName({ schema: element }));
					break;
				case (asn1.result.distributionPoint.idBlock.tagNumber === 1): // RDN variant
					{
						this.distributionPoint = new RelativeDistinguishedNames({
							schema: new Sequence({
								value: asn1.result.distributionPoint.valueBlock.value
							})
						});
					}
					break;
				default:
					throw new Error("Unknown tagNumber for distributionPoint: {$asn1.result.distributionPoint.idBlock.tagNumber}");
			}
		}
		
		if("onlyContainsUserCerts" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.onlyContainsUserCerts.valueBlock.valueHex);
			this.onlyContainsUserCerts = (view[0] !== 0x00);
		}
		
		if("onlyContainsCACerts" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.onlyContainsCACerts.valueBlock.valueHex);
			this.onlyContainsCACerts = (view[0] !== 0x00);
		}
		
		if("onlySomeReasons" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.onlySomeReasons.valueBlock.valueHex);
			this.onlySomeReasons = view[0];
		}
		
		if("indirectCRL" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.indirectCRL.valueBlock.valueHex);
			this.indirectCRL = (view[0] !== 0x00);
		}
		
		if("onlyContainsAttributeCerts" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.onlyContainsAttributeCerts.valueBlock.valueHex);
			this.onlyContainsAttributeCerts = (view[0] !== 0x00);
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if("distributionPoint" in this)
		{
			let value;
			
			if(this.distributionPoint instanceof Array)
			{
				value = new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: Array.from(this.distributionPoint, element => element.toSchema())
				});
			}
			else
			{
				value = this.distributionPoint.toSchema();
				
				value.idBlock.tagClass = 3; // CONTEXT - SPECIFIC
				value.idBlock.tagNumber = 1; // [1]
			}
			
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [value]
			}));
		}
		
		if(this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"))
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				valueHex: (new Uint8Array([0xFF])).buffer
			}));
		}
		
		if(this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts"))
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				valueHex: (new Uint8Array([0xFF])).buffer
			}));
		}
		
		if("onlySomeReasons" in this)
		{
			const buffer = new ArrayBuffer(1);
			const view = new Uint8Array(buffer);
			
			view[0] = this.onlySomeReasons;
			
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				valueHex: buffer
			}));
		}
		
		if(this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL"))
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 4 // [4]
				},
				valueHex: (new Uint8Array([0xFF])).buffer
			}));
		}
		
		if(this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"))
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 5 // [5]
				},
				valueHex: (new Uint8Array([0xFF])).buffer
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};
		
		if("distributionPoint" in this)
		{
			if(this.distributionPoint instanceof Array)
				object.distributionPoint = Array.from(this.distributionPoint, element => element.toJSON());
			else
				object.distributionPoint = this.distributionPoint.toJSON();
		}
		
		if(this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"))
			object.onlyContainsUserCerts = this.onlyContainsUserCerts;
		
		if(this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts"))
			object.onlyContainsCACerts = this.onlyContainsCACerts;
		
		if("onlySomeReasons" in this)
			object.onlySomeReasons = this.onlySomeReasons;
		
		if(this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL"))
			object.indirectCRL = this.indirectCRL;
		
		if(this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"))
			object.onlyContainsAttributeCerts = this.onlyContainsAttributeCerts;
		
		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class GeneralNames
{
	//**********************************************************************************
	/**
	 * Constructor for GeneralNames class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<GeneralName>}
		 * @desc Array of "general names"
		 */
		this.names = getParametersValue(parameters, "names", GeneralNames.defaultValues("names"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "names":
				return [];
			default:
				throw new Error(`Invalid member name for GeneralNames class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * GeneralNames ::= SEQUENCE SIZE (1..MAX) OF GeneralName
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @param {boolean} [optional=false] Flag would be element optional or not
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {}, optional = false)
	{
		/**
		 * @type {Object}
		 * @property {string} utcTimeName Name for "utcTimeName" choice
		 * @property {string} generalTimeName Name for "generalTimeName" choice
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			optional,
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.generalNames || ""),
					value: GeneralName.schema()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"names",
			"generalNames"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			GeneralNames.schema({
				names: {
					blockName: "names",
					generalNames: "generalNames"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for GeneralNames");
		//endregion

		//region Get internal properties from parsed schema
		this.names = Array.from(asn1.result.generalNames, element => new GeneralName({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.names, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			names: Array.from(this.names, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class GeneralSubtree
{
	//**********************************************************************************
	/**
	 * Constructor for GeneralSubtree class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {GeneralName}
		 * @desc base
		 */
		this.base = getParametersValue(parameters, "base", GeneralSubtree.defaultValues("base"));

		/**
		 * @type {number|Integer}
		 * @desc base
		 */
		this.minimum = getParametersValue(parameters, "minimum", GeneralSubtree.defaultValues("minimum"));

		if("maximum" in parameters)
			/**
			 * @type {number|Integer}
			 * @desc minimum
			 */
			this.maximum = getParametersValue(parameters, "maximum", GeneralSubtree.defaultValues("maximum"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "base":
				return new GeneralName();
			case "minimum":
				return 0;
			case "maximum":
				return 0;
			default:
				throw new Error(`Invalid member name for GeneralSubtree class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * GeneralSubtree ::= SEQUENCE {
	 *    base                    GeneralName,
	 *    minimum         [0]     BaseDistance DEFAULT 0,
	 *    maximum         [1]     BaseDistance OPTIONAL }
	 *
	 * BaseDistance ::= INTEGER (0..MAX)
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [base]
		 * @property {string} [minimum]
		 * @property {string} [maximum]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				GeneralName.schema(names.base || {}),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new Integer({ name: (names.minimum || "") })]
				}),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [new Integer({ name: (names.maximum || "") })]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"base",
			"minimum",
			"maximum"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			GeneralSubtree.schema({
				names: {
					base: {
						names: {
							blockName: "base"
						}
					},
					minimum: "minimum",
					maximum: "maximum"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for GeneralSubtree");
		//endregion

		//region Get internal properties from parsed schema
		this.base = new GeneralName({ schema: asn1.result.base });

		if("minimum" in asn1.result)
		{
			if(asn1.result.minimum.valueBlock.isHexOnly)
				this.minimum = asn1.result.minimum;
			else
				this.minimum = asn1.result.minimum.valueBlock.valueDec;
		}

		if("maximum" in asn1.result)
		{
			if(asn1.result.maximum.valueBlock.isHexOnly)
				this.maximum = asn1.result.maximum;
			else
				this.maximum = asn1.result.maximum.valueBlock.valueDec;
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		outputArray.push(this.base.toSchema());
		
		if(this.minimum !== 0)
		{
			let valueMinimum = 0;
			
			if(this.minimum instanceof Integer)
				valueMinimum = this.minimum;
			else
				valueMinimum = new Integer({ value: this.minimum });
			
			outputArray.push(new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [valueMinimum]
			}));
		}
		
		if("maximum" in this)
		{
			let valueMaximum = 0;
			
			if(this.maximum instanceof Integer)
				valueMaximum = this.maximum;
			else
				valueMaximum = new Integer({ value: this.maximum });
			
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
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			base: this.base.toJSON()
		};
		
		if(this.minimum !== 0)
		{
			if((typeof this.minimum) === "number")
				object.minimum = this.minimum;
			else
				object.minimum = this.minimum.toJSON();
		}
		
		if("maximum" in this)
		{
			if((typeof this.maximum) === "number")
				object.maximum = this.maximum;
			else
				object.maximum = this.maximum.toJSON();
		}
		
		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class NameConstraints
{
	//**********************************************************************************
	/**
	 * Constructor for NameConstraints class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("permittedSubtrees" in parameters)
			/**
			 * @type {Array.<GeneralSubtree>}
			 * @desc permittedSubtrees
			 */
			this.permittedSubtrees = getParametersValue(parameters, "permittedSubtrees", NameConstraints.defaultValues("permittedSubtrees"));

		if("excludedSubtrees" in parameters)
			/**
			 * @type {Array.<GeneralSubtree>}
			 * @desc excludedSubtrees
			 */
			this.excludedSubtrees = getParametersValue(parameters, "excludedSubtrees", NameConstraints.defaultValues("excludedSubtrees"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "permittedSubtrees":
				return [];
			case "excludedSubtrees":
				return [];
			default:
				throw new Error(`Invalid member name for NameConstraints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * NameConstraints ::= SEQUENCE {
	 *    permittedSubtrees       [0]     GeneralSubtrees OPTIONAL,
	 *    excludedSubtrees        [1]     GeneralSubtrees OPTIONAL }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [permittedSubtrees]
		 * @property {string} [excludedSubtrees]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new Repeated({
							name: (names.permittedSubtrees || ""),
							value: GeneralSubtree.schema()
						})
					]
				}),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new Repeated({
							name: (names.excludedSubtrees || ""),
							value: GeneralSubtree.schema()
						})
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"permittedSubtrees",
			"excludedSubtrees"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			NameConstraints.schema({
				names: {
					permittedSubtrees: "permittedSubtrees",
					excludedSubtrees: "excludedSubtrees"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for NameConstraints");
		//endregion

		//region Get internal properties from parsed schema
		if("permittedSubtrees" in asn1.result)
			this.permittedSubtrees = Array.from(asn1.result.permittedSubtrees, element => new GeneralSubtree({ schema: element }));

		if("excludedSubtrees" in asn1.result)
			this.excludedSubtrees = Array.from(asn1.result.excludedSubtrees, element => new GeneralSubtree({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if("permittedSubtrees" in this)
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: Array.from(this.permittedSubtrees, element => element.toSchema())
			}));
		}
		
		if("excludedSubtrees" in this)
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: Array.from(this.excludedSubtrees, element => element.toSchema())
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};
		
		if("permittedSubtrees" in this)
			object.permittedSubtrees = Array.from(this.permittedSubtrees, element => element.toJSON());

		if("excludedSubtrees" in this)
			object.excludedSubtrees = Array.from(this.excludedSubtrees, element => element.toJSON());

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class DistributionPoint
{
	//**********************************************************************************
	/**
	 * Constructor for DistributionPoint class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {Object} [distributionPoint]
	 * @property {Object} [reasons]
	 * @property {Object} [cRLIssuer]
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("distributionPoint" in parameters)
			/**
			 * @type {Array.<GeneralName>}
			 * @desc distributionPoint
			 */
			this.distributionPoint = getParametersValue(parameters, "distributionPoint", DistributionPoint.defaultValues("distributionPoint"));

		if("reasons" in parameters)
			/**
			 * @type {BitString}
			 * @desc values
			 */
			this.reasons = getParametersValue(parameters, "reasons", DistributionPoint.defaultValues("reasons"));

		if("cRLIssuer" in parameters)
			/**
			 * @type {Array.<GeneralName>}
			 * @desc cRLIssuer
			 */
			this.cRLIssuer = getParametersValue(parameters, "cRLIssuer", DistributionPoint.defaultValues("cRLIssuer"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "distributionPoint":
				return [];
			case "reasons":
				return new BitString();
			case "cRLIssuer":
				return [];
			default:
				throw new Error(`Invalid member name for DistributionPoint class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * DistributionPoint ::= SEQUENCE {
	 *    distributionPoint       [0]     DistributionPointName OPTIONAL,
	 *    reasons                 [1]     ReasonFlags OPTIONAL,
	 *    cRLIssuer               [2]     GeneralNames OPTIONAL }
	 *
	 * DistributionPointName ::= CHOICE {
	 *    fullName                [0]     GeneralNames,
	 *    nameRelativeToCRLIssuer [1]     RelativeDistinguishedName }
	 *
	 * ReasonFlags ::= BIT STRING {
	 *    unused                  (0),
	 *    keyCompromise           (1),
	 *    cACompromise            (2),
	 *    affiliationChanged      (3),
	 *    superseded              (4),
	 *    cessationOfOperation    (5),
	 *    certificateHold         (6),
	 *    privilegeWithdrawn      (7),
	 *    aACompromise            (8) }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [distributionPoint]
		 * @property {string} [distributionPointNames]
		 * @property {string} [reasons]
		 * @property {string} [cRLIssuer]
		 * @property {string} [cRLIssuerNames]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new Choice({
							value: [
								new Constructed({
									name: (names.distributionPoint || ""),
									optional: true,
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 0 // [0]
									},
									value: [
										new Repeated({
											name: (names.distributionPointNames || ""),
											value: GeneralName.schema()
										})
									]
								}),
								new Constructed({
									name: (names.distributionPoint || ""),
									optional: true,
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 1 // [1]
									},
									value: RelativeDistinguishedNames.schema().valueBlock.value
								})
							]
						})
					]
				}),
				new Primitive({
					name: (names.reasons || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				}), // IMPLICIT bitstring value
				new Constructed({
					name: (names.cRLIssuer || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [
						new Repeated({
							name: (names.cRLIssuerNames || ""),
							value: GeneralName.schema()
						})
					]
				}) // IMPLICIT bitstring value
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"distributionPoint",
			"distributionPointNames",
			"reasons",
			"cRLIssuer",
			"cRLIssuerNames"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			DistributionPoint.schema({
				names: {
					distributionPoint: "distributionPoint",
					distributionPointNames: "distributionPointNames",
					reasons: "reasons",
					cRLIssuer: "cRLIssuer",
					cRLIssuerNames: "cRLIssuerNames"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for DistributionPoint");
		//endregion

		//region Get internal properties from parsed schema
		if("distributionPoint" in asn1.result)
		{
			if(asn1.result.distributionPoint.idBlock.tagNumber === 0) // GENERAL_NAMES variant
				this.distributionPoint = Array.from(asn1.result.distributionPointNames, element => new GeneralName({ schema: element }));

			if(asn1.result.distributionPoint.idBlock.tagNumber === 1) // RDN variant
			{
				this.distributionPoint = new RelativeDistinguishedNames({
					schema: new Sequence({
						value: asn1.result.distributionPoint.valueBlock.value
					})
				});
			}
		}

		if("reasons" in asn1.result)
			this.reasons = new BitString({ valueHex: asn1.result.reasons.valueBlock.valueHex });

		if("cRLIssuer" in asn1.result)
			this.cRLIssuer = Array.from(asn1.result.cRLIssuerNames, element => new GeneralName({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if("distributionPoint" in this)
		{
			let internalValue;
			
			if(this.distributionPoint instanceof Array)
			{
				internalValue = new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: Array.from(this.distributionPoint, element => element.toSchema())
				});
			}
			else
			{
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
		
		if("reasons" in this)
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				valueHex: this.reasons.valueBlock.valueHex
			}));
		}
		
		if("cRLIssuer" in this)
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				value: Array.from(this.cRLIssuer, element => element.toSchema())
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};

		if("distributionPoint" in this)
		{
			if(this.distributionPoint instanceof Array)
				object.distributionPoint = Array.from(this.distributionPoint, element => element.toJSON());
			else
				object.distributionPoint = this.distributionPoint.toJSON();
		}

		if("reasons" in this)
			object.reasons = this.reasons.toJSON();

		if("cRLIssuer" in this)
			object.cRLIssuer = Array.from(this.cRLIssuer, element => element.toJSON());

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class CRLDistributionPoints
{
	//**********************************************************************************
	/**
	 * Constructor for CRLDistributionPoints class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<DistributionPoint>}
		 * @desc distributionPoints
		 */
		this.distributionPoints = getParametersValue(parameters, "distributionPoints", CRLDistributionPoints.defaultValues("distributionPoints"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "distributionPoints":
				return [];
			default:
				throw new Error(`Invalid member name for CRLDistributionPoints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CRLDistributionPoints ::= SEQUENCE SIZE (1..MAX) OF DistributionPoint
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [distributionPoints]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.distributionPoints || ""),
					value: DistributionPoint.schema()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"distributionPoints"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			CRLDistributionPoints.schema({
				names: {
					distributionPoints: "distributionPoints"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CRLDistributionPoints");
		//endregion

		//region Get internal properties from parsed schema
		this.distributionPoints = Array.from(asn1.result.distributionPoints, element => new DistributionPoint({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.distributionPoints, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			distributionPoints: Array.from(this.distributionPoints, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class PolicyQualifierInfo
{
	//**********************************************************************************
	/**
	 * Constructor for PolicyQualifierInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc policyQualifierId
		 */
		this.policyQualifierId = getParametersValue(parameters, "policyQualifierId", PolicyQualifierInfo.defaultValues("policyQualifierId"));
		/**
		 * @type {Object}
		 * @desc qualifier
		 */
		this.qualifier = getParametersValue(parameters, "qualifier", PolicyQualifierInfo.defaultValues("qualifier"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "policyQualifierId":
				return "";
			case "qualifier":
				return new Any();
			default:
				throw new Error(`Invalid member name for PolicyQualifierInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyQualifierInfo ::= SEQUENCE {
	 *    policyQualifierId  PolicyQualifierId,
	 *    qualifier          ANY DEFINED BY policyQualifierId }
	 *
	 * id-qt          OBJECT IDENTIFIER ::=  { id-pkix 2 }
	 * id-qt-cps      OBJECT IDENTIFIER ::=  { id-qt 1 }
	 * id-qt-unotice  OBJECT IDENTIFIER ::=  { id-qt 2 }
	 *
	 * PolicyQualifierId ::= OBJECT IDENTIFIER ( id-qt-cps | id-qt-unotice )
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [policyQualifierId]
		 * @property {string} [qualifier]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.policyQualifierId || "") }),
				new Any({ name: (names.qualifier || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"policyQualifierId",
			"qualifier"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PolicyQualifierInfo.schema({
				names: {
					policyQualifierId: "policyQualifierId",
					qualifier: "qualifier"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PolicyQualifierInfo");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.policyQualifierId }),
				this.qualifier
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			policyQualifierId: this.policyQualifierId,
			qualifier: this.qualifier.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class PolicyInformation
{
	//**********************************************************************************
	/**
	 * Constructor for PolicyInformation class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc policyIdentifier
		 */
		this.policyIdentifier = getParametersValue(parameters, "policyIdentifier", PolicyInformation.defaultValues("policyIdentifier"));

		if("policyQualifiers" in parameters)
			/**
			 * @type {Array.<PolicyQualifierInfo>}
			 * @desc Value of the TIME class
			 */
			this.policyQualifiers = getParametersValue(parameters, "policyQualifiers", PolicyInformation.defaultValues("policyQualifiers"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "policyIdentifier":
				return "";
			case "policyQualifiers":
				return [];
			default:
				throw new Error(`Invalid member name for PolicyInformation class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyInformation ::= SEQUENCE {
	 *    policyIdentifier   CertPolicyId,
	 *    policyQualifiers   SEQUENCE SIZE (1..MAX) OF
	 *    PolicyQualifierInfo OPTIONAL }
	 *
	 * CertPolicyId ::= OBJECT IDENTIFIER
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [policyIdentifier]
		 * @property {string} [policyQualifiers]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.policyIdentifier || "") }),
				new Sequence({
					optional: true,
					value: [
						new Repeated({
							name: (names.policyQualifiers || ""),
							value: PolicyQualifierInfo.schema()
						})
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"policyIdentifier",
			"policyQualifiers"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PolicyInformation.schema({
				names: {
					policyIdentifier: "policyIdentifier",
					policyQualifiers: "policyQualifiers"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PolicyInformation");
		//endregion

		//region Get internal properties from parsed schema
		this.policyIdentifier = asn1.result.policyIdentifier.valueBlock.toString();

		if("policyQualifiers" in asn1.result)
			this.policyQualifiers = Array.from(asn1.result.policyQualifiers, element => new PolicyQualifierInfo({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		outputArray.push(new ObjectIdentifier({ value: this.policyIdentifier }));
		
		if("policyQualifiers" in this)
		{
			outputArray.push(new Sequence({
				value: Array.from(this.policyQualifiers, element => element.toSchema())
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			policyIdentifier: this.policyIdentifier
		};

		if("policyQualifiers" in this)
			object.policyQualifiers = Array.from(this.policyQualifiers, element => element.toJSON());

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class CertificatePolicies
{
	//**********************************************************************************
	/**
	 * Constructor for CertificatePolicies class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<PolicyInformation>}
		 * @desc certificatePolicies
		 */
		this.certificatePolicies = getParametersValue(parameters, "certificatePolicies", CertificatePolicies.defaultValues("certificatePolicies"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "certificatePolicies":
				return [];
			default:
				throw new Error(`Invalid member name for CertificatePolicies class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * certificatePolicies ::= SEQUENCE SIZE (1..MAX) OF PolicyInformation
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [certificatePolicies]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.certificatePolicies || ""),
					value: PolicyInformation.schema()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"certificatePolicies"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			CertificatePolicies.schema({
				names: {
					certificatePolicies: "certificatePolicies"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertificatePolicies");
		//endregion

		//region Get internal properties from parsed schema
		this.certificatePolicies = Array.from(asn1.result.certificatePolicies, element => new PolicyInformation({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.certificatePolicies, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			certificatePolicies: Array.from(this.certificatePolicies, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class PolicyMapping
{
	//**********************************************************************************
	/**
	 * Constructor for PolicyMapping class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc issuerDomainPolicy
		 */
		this.issuerDomainPolicy = getParametersValue(parameters, "issuerDomainPolicy", PolicyMapping.defaultValues("issuerDomainPolicy"));
		/**
		 * @type {string}
		 * @desc subjectDomainPolicy
		 */
		this.subjectDomainPolicy = getParametersValue(parameters, "subjectDomainPolicy", PolicyMapping.defaultValues("subjectDomainPolicy"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "issuerDomainPolicy":
				return "";
			case "subjectDomainPolicy":
				return "";
			default:
				throw new Error(`Invalid member name for PolicyMapping class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyMapping ::= SEQUENCE {
	 *    issuerDomainPolicy      CertPolicyId,
	 *    subjectDomainPolicy     CertPolicyId }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuerDomainPolicy]
		 * @property {string} [subjectDomainPolicy]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.issuerDomainPolicy || "") }),
				new ObjectIdentifier({ name: (names.subjectDomainPolicy || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"issuerDomainPolicy",
			"subjectDomainPolicy"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PolicyMapping.schema({
				names: {
					issuerDomainPolicy: "issuerDomainPolicy",
					subjectDomainPolicy: "subjectDomainPolicy"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PolicyMapping");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.issuerDomainPolicy }),
				new ObjectIdentifier({ value: this.subjectDomainPolicy })
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			issuerDomainPolicy: this.issuerDomainPolicy,
			subjectDomainPolicy: this.subjectDomainPolicy
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class PolicyMappings
{
	//**********************************************************************************
	/**
	 * Constructor for PolicyMappings class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<PolicyMapping>}
		 * @desc mappings
		 */
		this.mappings = getParametersValue(parameters, "mappings", PolicyMappings.defaultValues("mappings"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "mappings":
				return [];
			default:
				throw new Error(`Invalid member name for PolicyMappings class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyMappings ::= SEQUENCE SIZE (1..MAX) OF PolicyMapping
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [utcTimeName] Name for "utcTimeName" choice
		 * @property {string} [generalTimeName] Name for "generalTimeName" choice
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.mappings || ""),
					value: PolicyMapping.schema()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"mappings"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PolicyMappings.schema({
				names: {
					mappings: "mappings"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PolicyMappings");
		//endregion

		//region Get internal properties from parsed schema
		this.mappings = Array.from(asn1.result.mappings, element => new PolicyMapping({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.mappings, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			mappings: Array.from(this.mappings, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class AuthorityKeyIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for AuthorityKeyIdentifier class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("keyIdentifier" in parameters)
			/**
			 * @type {OctetString}
			 * @desc keyIdentifier
			 */
			this.keyIdentifier = getParametersValue(parameters, "keyIdentifier", AuthorityKeyIdentifier.defaultValues("keyIdentifier"));

		if("authorityCertIssuer" in parameters)
			/**
			 * @type {Array.<GeneralName>}
			 * @desc authorityCertIssuer
			 */
			this.authorityCertIssuer = getParametersValue(parameters, "authorityCertIssuer", AuthorityKeyIdentifier.defaultValues("authorityCertIssuer"));

		if("authorityCertSerialNumber" in parameters)
			/**
			 * @type {Integer}
			 * @desc authorityCertIssuer
			 */
			this.authorityCertSerialNumber = getParametersValue(parameters, "authorityCertSerialNumber", AuthorityKeyIdentifier.defaultValues("authorityCertSerialNumber"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "keyIdentifier":
				return new OctetString();
			case "authorityCertIssuer":
				return [];
			case "authorityCertSerialNumber":
				return new Integer();
			default:
				throw new Error(`Invalid member name for AuthorityKeyIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AuthorityKeyIdentifier OID ::= 2.5.29.35
	 *
	 * AuthorityKeyIdentifier ::= SEQUENCE {
	 *    keyIdentifier             [0] KeyIdentifier           OPTIONAL,
	 *    authorityCertIssuer       [1] GeneralNames            OPTIONAL,
	 *    authorityCertSerialNumber [2] CertificateSerialNumber OPTIONAL  }
	 *
	 * KeyIdentifier ::= OCTET STRING
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [keyIdentifier]
		 * @property {string} [authorityCertIssuer]
		 * @property {string} [authorityCertSerialNumber]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Primitive({
					name: (names.keyIdentifier || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					}
				}),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new Repeated({
							name: (names.authorityCertIssuer || ""),
							value: GeneralName.schema()
						})
					]
				}),
				new Primitive({
					name: (names.authorityCertSerialNumber || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					}
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"keyIdentifier",
			"authorityCertIssuer",
			"authorityCertSerialNumber"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AuthorityKeyIdentifier.schema({
				names: {
					keyIdentifier: "keyIdentifier",
					authorityCertIssuer: "authorityCertIssuer",
					authorityCertSerialNumber: "authorityCertSerialNumber"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AuthorityKeyIdentifier");
		//endregion

		//region Get internal properties from parsed schema
		if("keyIdentifier" in asn1.result)
			this.keyIdentifier = new OctetString({ valueHex: asn1.result.keyIdentifier.valueBlock.valueHex });

		if("authorityCertIssuer" in asn1.result)
			this.authorityCertIssuer = Array.from(asn1.result.authorityCertIssuer, element => new GeneralName({ schema: element }));

		if("authorityCertSerialNumber" in asn1.result)
			this.authorityCertSerialNumber = new Integer({ valueHex: asn1.result.authorityCertSerialNumber.valueBlock.valueHex });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if("keyIdentifier" in this)
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				valueHex: this.keyIdentifier.valueBlock.valueHex
			}));
		}
		
		if("authorityCertIssuer" in this)
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: Array.from(this.authorityCertIssuer, element => element.toSchema())
			}));
		}
		
		if("authorityCertSerialNumber" in this)
		{
			outputArray.push(new Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				valueHex: this.authorityCertSerialNumber.valueBlock.valueHex
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};

		if("keyIdentifier" in this)
			object.keyIdentifier = this.keyIdentifier.toJSON();

		if("authorityCertIssuer" in this)
			object.authorityCertIssuer = Array.from(this.authorityCertIssuer, element => element.toJSON());

		if("authorityCertSerialNumber" in this)
			object.authorityCertSerialNumber = this.authorityCertSerialNumber.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class PolicyConstraints
{
	//**********************************************************************************
	/**
	 * Constructor for PolicyConstraints class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("requireExplicitPolicy" in parameters)
			/**
			 * @type {number}
			 * @desc requireExplicitPolicy
			 */
			this.requireExplicitPolicy = getParametersValue(parameters, "requireExplicitPolicy", PolicyConstraints.defaultValues("requireExplicitPolicy"));

		if("inhibitPolicyMapping" in parameters)
			/**
			 * @type {number}
			 * @desc Value of the TIME class
			 */
			this.inhibitPolicyMapping = getParametersValue(parameters, "inhibitPolicyMapping", PolicyConstraints.defaultValues("inhibitPolicyMapping"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "requireExplicitPolicy":
				return 0;
			case "inhibitPolicyMapping":
				return 0;
			default:
				throw new Error(`Invalid member name for PolicyConstraints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyConstraints ::= SEQUENCE {
	 *    requireExplicitPolicy           [0] SkipCerts OPTIONAL,
	 *    inhibitPolicyMapping            [1] SkipCerts OPTIONAL }
	 *
	 * SkipCerts ::= INTEGER (0..MAX)
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [requireExplicitPolicy]
		 * @property {string} [inhibitPolicyMapping]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Primitive({
					name: (names.requireExplicitPolicy || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					}
				}), // IMPLICIT integer value
				new Primitive({
					name: (names.inhibitPolicyMapping || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				}) // IMPLICIT integer value
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"requireExplicitPolicy",
			"inhibitPolicyMapping"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PolicyConstraints.schema({
				names: {
					requireExplicitPolicy: "requireExplicitPolicy",
					inhibitPolicyMapping: "inhibitPolicyMapping"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PolicyConstraints");
		//endregion

		//region Get internal properties from parsed schema
		if("requireExplicitPolicy" in asn1.result)
		{
			const field1 = asn1.result.requireExplicitPolicy;

			field1.idBlock.tagClass = 1; // UNIVERSAL
			field1.idBlock.tagNumber = 2; // INTEGER

			const ber1 = field1.toBER(false);
			const int1 = fromBER(ber1);

			this.requireExplicitPolicy = int1.result.valueBlock.valueDec;
		}

		if("inhibitPolicyMapping" in asn1.result)
		{
			const field2 = asn1.result.inhibitPolicyMapping;

			field2.idBlock.tagClass = 1; // UNIVERSAL
			field2.idBlock.tagNumber = 2; // INTEGER

			const ber2 = field2.toBER(false);
			const int2 = fromBER(ber2);

			this.inhibitPolicyMapping = int2.result.valueBlock.valueDec;
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create correct values for output sequence
		const outputArray = [];
		
		if("requireExplicitPolicy" in this)
		{
			const int1 = new Integer({ value: this.requireExplicitPolicy });
			
			int1.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
			int1.idBlock.tagNumber = 0; // [0]
			
			outputArray.push(int1);
		}
		
		if("inhibitPolicyMapping" in this)
		{
			const int2 = new Integer({ value: this.inhibitPolicyMapping });
			
			int2.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
			int2.idBlock.tagNumber = 1; // [1]
			
			outputArray.push(int2);
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};

		if("requireExplicitPolicy" in this)
			object.requireExplicitPolicy = this.requireExplicitPolicy;

		if("inhibitPolicyMapping" in this)
			object.inhibitPolicyMapping = this.inhibitPolicyMapping;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class ExtKeyUsage
{
	//**********************************************************************************
	/**
	 * Constructor for ExtKeyUsage class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<string>}
		 * @desc keyPurposes
		 */
		this.keyPurposes = getParametersValue(parameters, "keyPurposes", ExtKeyUsage.defaultValues("keyPurposes"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "keyPurposes":
				return [];
			default:
				throw new Error(`Invalid member name for ExtKeyUsage class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * ExtKeyUsage ::= SEQUENCE SIZE (1..MAX) OF KeyPurposeId
	 *
	 * KeyPurposeId ::= OBJECT IDENTIFIER
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [keyPurposes]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.keyPurposes || ""),
					value: new ObjectIdentifier()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"keyPurposes"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			ExtKeyUsage.schema({
				names: {
					keyPurposes: "keyPurposes"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ExtKeyUsage");
		//endregion

		//region Get internal properties from parsed schema
		this.keyPurposes = Array.from(asn1.result.keyPurposes, element => element.valueBlock.toString());
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.keyPurposes, element => new ObjectIdentifier({ value: element }))
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			keyPurposes: Array.from(this.keyPurposes)
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class AccessDescription
{
	//**********************************************************************************
	/**
	 * Constructor for AccessDescription class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc The type and format of the information are specified by the accessMethod field. This profile defines two accessMethod OIDs: id-ad-caIssuers and id-ad-ocsp
		 */
		this.accessMethod = getParametersValue(parameters, "accessMethod", AccessDescription.defaultValues("accessMethod"));
		/**
		 * @type {GeneralName}
		 * @desc The accessLocation field specifies the location of the information
		 */
		this.accessLocation = getParametersValue(parameters, "accessLocation", AccessDescription.defaultValues("accessLocation"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "accessMethod":
				return "";
			case "accessLocation":
				return new GeneralName();
			default:
				throw new Error(`Invalid member name for AccessDescription class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AccessDescription  ::=  SEQUENCE {
	 *    accessMethod          OBJECT IDENTIFIER,
	 *    accessLocation        GeneralName  }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [accessMethod]
		 * @property {string} [accessLocation]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.accessMethod || "") }),
				GeneralName.schema(names.accessLocation || {})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"accessMethod",
			"accessLocation"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AccessDescription.schema({
				names: {
					accessMethod: "accessMethod",
					accessLocation: {
						names: {
							blockName: "accessLocation"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AccessDescription");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.accessMethod }),
				this.accessLocation.toSchema()
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			accessMethod: this.accessMethod,
			accessLocation: this.accessLocation.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class InfoAccess
{
	//**********************************************************************************
	/**
	 * Constructor for InfoAccess class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<AccessDescription>}
		 * @desc accessDescriptions
		 */
		this.accessDescriptions = getParametersValue(parameters, "accessDescriptions", InfoAccess.defaultValues("accessDescriptions"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "accessDescriptions":
				return [];
			default:
				throw new Error(`Invalid member name for InfoAccess class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AuthorityInfoAccessSyntax  ::=
	 * SEQUENCE SIZE (1..MAX) OF AccessDescription
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [accessDescriptions]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.accessDescriptions || ""),
					value: AccessDescription.schema()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"accessDescriptions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			InfoAccess.schema({
				names: {
					accessDescriptions: "accessDescriptions"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for InfoAccess");
		//endregion

		//region Get internal properties from parsed schema
		this.accessDescriptions = Array.from(asn1.result.accessDescriptions, element => new AccessDescription({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.accessDescriptions, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			accessDescriptions: Array.from(this.accessDescriptions, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

/*
 * Copyright (c) 2016-2018, Peculiar Ventures
 * All rights reserved.
 *
 * Author 2016-2018, Yury Strozhevsky <www.strozhevsky.com>.
 *
 */
//**************************************************************************************
class ByteStream
{
	//**********************************************************************************
	// noinspection FunctionWithMultipleLoopsJS
	/**
	 * Constructor for ByteStream class
	 * @param {{[length]: number, [stub]: number, [view]: Uint8Array, [buffer]: ArrayBuffer, [string]: string, [hexstring]: string}} parameters
	 */
	constructor(parameters = {})
	{
		this.clear();
		
		for(const key of Object.keys(parameters))
		{
			switch(key)
			{
				case "length":
					this.length = parameters.length;
					break;
				case "stub":
					// noinspection NonBlockStatementBodyJS
					for(let i = 0; i < this._view.length; i++)
						this._view[i] = parameters.stub;
					break;
				case "view":
					this.fromUint8Array(parameters.view);
					break;
				case "buffer":
					this.fromArrayBuffer(parameters.buffer);
					break;
				case "string":
					this.fromString(parameters.string);
					break;
				case "hexstring":
					this.fromHexString(parameters.hexstring);
					break;
				default:
			}
		}
	}
	//**********************************************************************************
	/**
	 * Setter for "buffer"
	 * @param {ArrayBuffer} value
	 */
	set buffer(value)
	{
		this._buffer = value.slice(0);
		this._view = new Uint8Array(this._buffer);
	}
	//**********************************************************************************
	/**
	 * Getter for "buffer"
	 * @returns {ArrayBuffer}
	 */
	get buffer()
	{
		return this._buffer;
	}
	//**********************************************************************************
	/**
	 * Setter for "view"
	 * @param {Uint8Array} value
	 */
	set view(value)
	{
		this._buffer = new ArrayBuffer(value.length);
		this._view = new Uint8Array(this._buffer);
		
		this._view.set(value);
	}
	//**********************************************************************************
	/**
	 * Getter for "view"
	 * @returns {Uint8Array}
	 */
	get view()
	{
		return this._view;
	}
	//**********************************************************************************
	/**
	 * Getter for "length"
	 * @returns {number}
	 */
	get length()
	{
		return this._buffer.byteLength;
	}
	//**********************************************************************************
	/**
	 * Setter for "length"
	 * @param {number} value
	 */
	set length(value)
	{
		this._buffer = new ArrayBuffer(value);
		this._view = new Uint8Array(this._buffer);
	}
	//**********************************************************************************
	/**
	 * Clear existing stream
	 */
	clear()
	{
		this._buffer = new ArrayBuffer(0);
		this._view = new Uint8Array(this._buffer);
	}
	//**********************************************************************************
	/**
	 * Initialize "Stream" object from existing "ArrayBuffer"
	 * @param {!ArrayBuffer} array The ArrayBuffer to copy from
	 */
	fromArrayBuffer(array)
	{
		this.buffer = array;
	}
	//**********************************************************************************
	// noinspection FunctionNamingConventionJS
	/**
	 * Initialize "Stream" object from existing "Uint8Array"
	 * @param {!Uint8Array} array The Uint8Array to copy from
	 */
	fromUint8Array(array)
	{
		this._buffer = new ArrayBuffer(array.length);
		this._view = new Uint8Array(this._buffer);
		
		this._view.set(array);
	}
	//**********************************************************************************
	/**
	 * Initialize "Stream" object from existing string
	 * @param {string} string The string to initialize from
	 */
	fromString(string)
	{
		const stringLength = string.length;
		
		this.length = stringLength;
		
		// noinspection NonBlockStatementBodyJS
		for(let i = 0; i < stringLength; i++)
			this.view[i] = string.charCodeAt(i);
	}
	//**********************************************************************************
	/**
	 * Represent "Stream" object content as a string
	 * @param {number} [start] Start position to convert to string
	 * @param {number} [length] Length of array to convert to string
	 * @returns {string}
	 */
	toString(start = 0, length = (this.view.length - start))
	{
		//region Initial variables
		let result = "";
		//endregion
		
		//region Check input parameters
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((start >= this.view.length) || (start < 0))
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((length >= this.view.length) || (length < 0))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.view.length - start;
		}
		//endregion
		
		//region Convert array of bytes to string
		// noinspection NonBlockStatementBodyJS
		for(let i = start; i < (start + length); i++)
			result += String.fromCharCode(this.view[i]);
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionTooLongJS
	/**
	 * Initialize "Stream" object from existing hexdecimal string
	 * @param {string} hexString String to initialize from
	 */
	fromHexString(hexString)
	{
		//region Initial variables
		const stringLength = hexString.length;
		
		this.buffer = new ArrayBuffer(stringLength >> 1);
		this.view = new Uint8Array(this.buffer);
		
		const hexMap = new Map();
		
		// noinspection MagicNumberJS
		hexMap.set("0", 0x00);
		// noinspection MagicNumberJS
		hexMap.set("1", 0x01);
		// noinspection MagicNumberJS
		hexMap.set("2", 0x02);
		// noinspection MagicNumberJS
		hexMap.set("3", 0x03);
		// noinspection MagicNumberJS
		hexMap.set("4", 0x04);
		// noinspection MagicNumberJS
		hexMap.set("5", 0x05);
		// noinspection MagicNumberJS
		hexMap.set("6", 0x06);
		// noinspection MagicNumberJS
		hexMap.set("7", 0x07);
		// noinspection MagicNumberJS
		hexMap.set("8", 0x08);
		// noinspection MagicNumberJS
		hexMap.set("9", 0x09);
		// noinspection MagicNumberJS
		hexMap.set("A", 0x0A);
		// noinspection MagicNumberJS
		hexMap.set("a", 0x0A);
		// noinspection MagicNumberJS
		hexMap.set("B", 0x0B);
		// noinspection MagicNumberJS
		hexMap.set("b", 0x0B);
		// noinspection MagicNumberJS
		hexMap.set("C", 0x0C);
		// noinspection MagicNumberJS
		hexMap.set("c", 0x0C);
		// noinspection MagicNumberJS
		hexMap.set("D", 0x0D);
		// noinspection MagicNumberJS
		hexMap.set("d", 0x0D);
		// noinspection MagicNumberJS
		hexMap.set("E", 0x0E);
		// noinspection MagicNumberJS
		hexMap.set("e", 0x0E);
		// noinspection MagicNumberJS
		hexMap.set("F", 0x0F);
		// noinspection MagicNumberJS
		hexMap.set("f", 0x0F);
		
		let j = 0;
		// noinspection MagicNumberJS
		let temp = 0x00;
		//endregion
		
		//region Convert char-by-char
		for(let i = 0; i < stringLength; i++)
		{
			// noinspection NegatedIfStatementJS
			if(!(i % 2))
			{
				// noinspection NestedFunctionCallJS
				temp = hexMap.get(hexString.charAt(i)) << 4;
			}
			else
			{
				// noinspection NestedFunctionCallJS
				temp |= hexMap.get(hexString.charAt(i));
				
				this.view[j] = temp;
				j++;
			}
		}
		//endregion
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Represent "Stream" object content as a hexdecimal string
	 * @param {number} [start=0] Start position to convert to string
	 * @param {number} [length=(this.view.length - start)] Length of array to convert to string
	 * @returns {string}
	 */
	toHexString(start = 0, length = (this.view.length - start))
	{
		//region Initial variables
		let result = "";
		//endregion
		
		//region Check input parameters
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((start >= this.view.length) || (start < 0))
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((length >= this.view.length) || (length < 0))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.view.length - start;
		}
		//endregion

		for(let i = start; i < (start + length); i++)
		{
			// noinspection ChainedFunctionCallJS
			const str = this.view[i].toString(16).toUpperCase();
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, ConditionalExpressionJS, EqualityComparisonWithCoercionJS
			result = result + ((str.length == 1) ? "0" : "") + str;
		}
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS
	/**
	 * Return copy of existing "Stream"
	 * @param {number} [start=0] Start position of the copy
	 * @param {number} [length=this.view.length] Length of the copy
	 * @returns {ByteStream}
	 */
	copy(start = 0, length = (this._buffer.byteLength - start))
	{
		//region Check input parameters
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if((start === 0) && (this._buffer.byteLength === 0))
			return new ByteStream();
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if((start < 0) || (start > (this._buffer.byteLength - 1)))
			throw new Error(`Wrong start position: ${start}`);
		//endregion
		
		const stream = new ByteStream();
		
		stream._buffer = this._buffer.slice(start, start + length);
		stream._view = new Uint8Array(stream._buffer);
		
		return stream;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Return slice of existing "Stream"
	 * @param {number} [start=0] Start position of the slice
	 * @param {number} [end=this._buffer.byteLength] End position of the slice
	 * @returns {ByteStream}
	 */
	slice(start = 0, end = this._buffer.byteLength)
	{
		//region Check input parameters
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if((start === 0) && (this._buffer.byteLength === 0))
			return new ByteStream();
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if((start < 0) || (start > (this._buffer.byteLength - 1)))
			throw new Error(`Wrong start position: ${start}`);
		//endregion
		
		const stream = new ByteStream();
		
		stream._buffer = this._buffer.slice(start, end);
		stream._view = new Uint8Array(stream._buffer);
		
		return stream;
	}
	//**********************************************************************************
	/**
	 * Change size of existing "Stream"
	 * @param {!number} size Size for new "Stream"
	 */
	realloc(size)
	{
		//region Initial variables
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		//endregion
		
		//region Create a new ArrayBuffer content
		// noinspection NonBlockStatementBodyJS
		if(size > this._view.length)
			view.set(this._view);
		else
		{
			// noinspection NestedFunctionCallJS
			view.set(new Uint8Array(this._buffer, 0, size));
		}
		//endregion
		
		//region Initialize "Stream" with new "ArrayBuffer"
		this._buffer = buffer.slice(0);
		this._view = new Uint8Array(this._buffer);
		//endregion
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Append a new "Stream" content to the current "Stream"
	 * @param {ByteStream} stream A new "stream" to append to current "stream"
	 */
	append(stream)
	{
		//region Initial variables
		const initialSize = this._buffer.byteLength;
		const streamViewLength = stream._buffer.byteLength;
		
		const copyView = stream._view.slice();
		//endregion
		
		//region Re-allocate current internal buffer
		this.realloc(initialSize + streamViewLength);
		//endregion
		
		//region Copy input stream content to a new place
		this._view.set(copyView, initialSize);
		//endregion
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Insert "Stream" content to the current "Stream" at specific position
	 * @param {ByteStream} stream A new "stream" to insert to current "stream"
	 * @param {number} [start=0] Start position to insert to
	 * @param {number} [length]
	 * @returns {boolean}
	 */
	insert(stream, start = 0, length = (this._buffer.byteLength - start))
	{
		//region Initial variables
		// noinspection NonBlockStatementBodyJS
		if(start > (this._buffer.byteLength - 1))
			return false;
		
		if(length > (this._buffer.byteLength - start))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this._buffer.byteLength - start;
		}
		//endregion
		
		//region Check input variables
		if(length > stream._buffer.byteLength)
		{
			// noinspection AssignmentToFunctionParameterJS
			length = stream._buffer.byteLength;
		}
		//endregion
		
		//region Update content of the current stream
		// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(length == stream._buffer.byteLength)
			this._view.set(stream._view, start);
		else
		{
			// noinspection NestedFunctionCallJS
			this._view.set(stream._view.slice(0, length), start);
		}
		//endregion
		
		return true;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS
	/**
	 * Check that two "Stream" objects has equal content
	 * @param {ByteStream} stream Stream to compare with
	 * @returns {boolean}
	 */
	isEqual(stream)
	{
		//region Check length of both buffers
		// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(this._buffer.byteLength != stream._buffer.byteLength)
			return false;
		//endregion
		
		//region Compare each byte of both buffers
		for(let i = 0; i < stream._buffer.byteLength; i++)
		{
			// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
			if(this.view[i] != stream.view[i])
				return false;
		}
		//endregion
		
		return true;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Check that current "Stream" objects has equal content with input "Uint8Array"
	 * @param {Uint8Array} view View to compare with
	 * @returns {boolean}
	 */
	isEqualView(view)
	{
		//region Check length of both buffers
		// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(view.length != this.view.length)
			return false;
		//endregion
		
		//region Compare each byte of both buffers
		for(let i = 0; i < view.length; i++)
		{
			// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
			if(this.view[i] != view[i])
				return false;
		}
		//endregion
		
		return true;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS, OverlyComplexFunctionJS, FunctionTooLongJS
	/**
	 * Find any byte pattern in "Stream"
	 * @param {ByteStream} pattern Stream having pattern value
	 * @param {?number} [start] Start position to search from
	 * @param {?number} [length] Length of byte block to search at
	 * @param {boolean} [backward] Flag to search in backward order
	 * @returns {number}
	 */
	findPattern(pattern, start = null, length = null, backward = false)
	{
		//region Check input variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS, ConditionalExpressionJS
			start = (backward) ? this.buffer.byteLength : 0;
		}
		
		if(start > this.buffer.byteLength)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = this.buffer.byteLength;
		}
		
		if(backward)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
			
			if(length > start)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
		}
		else
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
			
			if(length > (this.buffer.byteLength - start))
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
		}
		//endregion
		
		//region Initial variables
		const patternLength = pattern.buffer.byteLength;
		// noinspection NonBlockStatementBodyJS
		if(patternLength > length)
			return (-1);
		//endregion
		
		//region Make a "pre-read" array for pattern
		const patternArray = [];
		// noinspection NonBlockStatementBodyJS
		for(let i = 0; i < patternLength; i++)
			patternArray.push(pattern.view[i]);
		//endregion
		
		//region Search for pattern
		for(let i = 0; i <= (length - patternLength); i++)
		{
			let equal = true;
			// noinspection ConditionalExpressionJS
			const equalStart = (backward) ? (start - patternLength - i) : (start + i);
			
			for(let j = 0; j < patternLength; j++)
			{
				// noinspection EqualityComparisonWithCoercionJS
				if(this.view[j + equalStart] != patternArray[j])
				{
					equal = false;
					// noinspection BreakStatementJS
					break;
				}
			}
			
			if(equal)
			{
				// noinspection ConditionalExpressionJS
				return (backward) ? (start - patternLength - i) : (start + patternLength + i); // Position after the pattern found
			}
		}
		//endregion
		
		return (-1);
	}
	//**********************************************************************************
	// noinspection OverlyComplexFunctionJS
	/**
	 * Find first position of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @param {?number} [start] Start position to search from
	 * @param {?number} [length] Length of byte block to search at
	 * @param {boolean} [backward=false] Flag to search in backward order
	 * @returns {{id: number, position: number}}
	 */
	findFirstIn(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS, ConditionalExpressionJS
			start = (backward) ? this.buffer.byteLength : 0;
		}
		
		if(start > this.buffer.byteLength)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = this.buffer.byteLength;
		}
		
		if(backward)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
			
			if(length > start)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
		}
		else
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
			
			if(length > (this.buffer.byteLength - start))
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
		}
		
		// noinspection ConditionalExpressionJS
		const result = {
			id: (-1),
			position: (backward) ? 0 : (start + length),
			length: 0
		};
		//endregion
		
		for(let i = 0; i < patterns.length; i++)
		{
			const position = this.findPattern(patterns[i], start, length, backward);
			// noinspection EqualityComparisonWithCoercionJS
			if(position != (-1))
			{
				let valid = false;
				const patternLength = patterns[i].length;

				if(backward)
				{
					// noinspection NonBlockStatementBodyJS
					if((position - patternLength) >= (result.position - result.length))
						valid = true;
				}
				else
				{
					// noinspection NonBlockStatementBodyJS
					if((position - patternLength) <= (result.position - result.length))
						valid = true;
				}
				
				if(valid)
				{
					result.position = position;
					result.id = i;
					result.length = patternLength;
				}
			}
		}
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS
	/**
	 * Find all positions of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @param {?number} [start] Start position to search from
	 * @param {?number} [length] Length of byte block to search at
	 * @returns {Array}
	 */
	findAllIn(patterns, start = 0, length = (this.buffer.byteLength - start))
	{
		//region Initial variables
		const result = [];
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		// noinspection NonBlockStatementBodyJS
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(length == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}

		if(length > (this.buffer.byteLength - start))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		let patternFound = {
			id: (-1),
			position: start
		};
		//endregion
		
		//region Find all accurences of patterns
		do
		{
			const position = patternFound.position;
			
			patternFound = this.findFirstIn(patterns, patternFound.position, length);
			
			// noinspection EqualityComparisonWithCoercionJS
			if(patternFound.id == (-1))
			{
				// noinspection BreakStatementJS
				break;
			}
			
			// noinspection AssignmentToFunctionParameterJS
			length -= (patternFound.position - position);
			
			result.push({
				id: patternFound.id,
				position: patternFound.position
			});
		} while(true); // eslint-disable-line
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS
	/**
	 * Find all positions of a pattern
	 * @param {ByteStream} pattern Stream having pattern value
	 * @param {?number} [start] Start position to search from
	 * @param {?number} [length] Length of byte block to search at
	 * @returns {Array|number} Array with all pattern positions or (-1) if failed
	 */
	findAllPatternIn(pattern, start = 0, length = (this.buffer.byteLength - start))
	{
		//region Check input variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		if(start > this.buffer.byteLength)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = this.buffer.byteLength;
		}
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(length == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		if(length > (this.buffer.byteLength - start))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		//endregion
		
		//region Initial variables
		const result = [];
		
		const patternLength = pattern.buffer.byteLength;
		// noinspection NonBlockStatementBodyJS
		if(patternLength > length)
			return (-1);
		//endregion
		
		//region Make a "pre-read" array for pattern
		const patternArray = Array.from(pattern.view);
		//endregion
		
		//region Search for pattern
		for(let i = 0; i <= (length - patternLength); i++)
		{
			let equal = true;
			const equalStart = start + i;
			
			for(let j = 0; j < patternLength; j++)
			{
				// noinspection EqualityComparisonWithCoercionJS
				if(this.view[j + equalStart] != patternArray[j])
				{
					equal = false;
					// noinspection BreakStatementJS
					break;
				}
			}
			
			if(equal)
			{
				result.push(start + patternLength + i); // Position after the pattern found
				i += (patternLength - 1); // On next step of "for" we will have "i++"
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection OverlyComplexFunctionJS, FunctionTooLongJS
	/**
	 * Find first position of data, not included in patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {?number} [start] Start position to search from
	 * @param {?number} [length] Length of byte block to search at
	 * @param {boolean} [backward=false] Flag to search in backward order
	 * @returns {{left: {id: number, position: *}, right: {id: number, position: number}, value: ByteStream}}
	 */
	findFirstNotIn(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS, ConditionalExpressionJS
			start = (backward) ? this.buffer.byteLength : 0;
		}
		
		if(start > this.buffer.byteLength)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = this.buffer.byteLength;
		}
		
		if(backward)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
			
			if(length > start)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
		}
		else
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
			
			if(length > (this.buffer.byteLength - start))
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
		}
		
		const result = {
			left: {
				id: (-1),
				position: start
			},
			right: {
				id: (-1),
				position: 0
			},
			value: new ByteStream()
		};
		
		let currentLength = length;
		//endregion
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		while(currentLength > 0)
		{
			//region Search for nearest "pattern"
			// noinspection ConditionalExpressionJS
			result.right = this.findFirstIn(patterns,
				(backward) ? (start - length + currentLength) : (start + length - currentLength),
				currentLength,
				backward);
			//endregion
			
			//region No pattern at all
			// noinspection EqualityComparisonWithCoercionJS
			if(result.right.id == (-1))
			{
				// noinspection AssignmentToFunctionParameterJS
				length = currentLength;
				
				if(backward)
				{
					// noinspection AssignmentToFunctionParameterJS
					start -= length;
				}
				else
				{
					// noinspection AssignmentToFunctionParameterJS
					start = result.left.position;
				}
				
				result.value = new ByteStream();
				
				result.value._buffer = this._buffer.slice(start, start + length);
				result.value._view = new Uint8Array(result.value._buffer);
				
				// noinspection BreakStatementJS
				break;
			}
			//endregion
			
			//region Check distance between two patterns
			// noinspection ConditionalExpressionJS, EqualityComparisonWithCoercionJS
			if(result.right.position != ((backward) ? (result.left.position - patterns[result.right.id].buffer.byteLength) : (result.left.position + patterns[result.right.id].buffer.byteLength)))
			{
				if(backward)
				{
					// noinspection AssignmentToFunctionParameterJS
					start = result.right.position + patterns[result.right.id].buffer.byteLength;
					// noinspection AssignmentToFunctionParameterJS
					length = result.left.position - result.right.position - patterns[result.right.id].buffer.byteLength;
				}
				else
				{
					// noinspection AssignmentToFunctionParameterJS
					start = result.left.position;
					// noinspection AssignmentToFunctionParameterJS
					length = result.right.position - result.left.position - patterns[result.right.id].buffer.byteLength;
				}
				
				result.value = new ByteStream();
				
				result.value._buffer = this._buffer.slice(start, start + length);
				result.value._view = new Uint8Array(result.value._buffer);
				
				// noinspection BreakStatementJS
				break;
			}
			//endregion
			
			//region Store information about previous pattern
			result.left = result.right;
			//endregion
			
			//region Change current length
			currentLength -= patterns[result.right.id]._buffer.byteLength;
			//endregion
		}
		
		//region Swap "patterns" in case of backward order
		if(backward)
		{
			const temp = result.right;
			result.right = result.left;
			result.left = temp;
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS
	/**
	 * Find all positions of data, not included in patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {?number} [start] Start position to search from
	 * @param {?number} [length] Length of byte block to search at
	 * @returns {Array}
	 */
	findAllNotIn(patterns, start = null, length = null)
	{
		//region Initial variables
		const result = [];
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		// noinspection NonBlockStatementBodyJS
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(length == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		if(length > (this.buffer.byteLength - start))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		let patternFound = {
			left: {
				id: (-1),
				position: start
			},
			right: {
				id: (-1),
				position: start
			},
			value: new ByteStream()
		};
		//endregion
		
		//region Find all accurences of patterns
		// noinspection EqualityComparisonWithCoercionJS
		do
		{
			const position = patternFound.right.position;
			
			patternFound = this.findFirstNotIn(patterns, patternFound.right.position, length);
			
			// noinspection AssignmentToFunctionParameterJS
			length -= (patternFound.right.position - position);
			
			result.push({
				left: {
					id: patternFound.left.id,
					position: patternFound.left.position
				},
				right: {
					id: patternFound.right.id,
					position: patternFound.right.position
				},
				value: patternFound.value
			});
		} while(patternFound.right.id != (-1));
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS, OverlyComplexFunctionJS
	/**
	 * Find position of a sequence of any patterns from input array
	 * @param {Array.<ByteStream>} patterns Array of pattern to look for
	 * @param {?number} [start] Start position to search from
	 * @param {?number} [length] Length of byte block to search at
	 * @param {boolean} [backward=false] Flag to search in backward order
	 * @returns {*}
	 */
	findFirstSequence(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS, ConditionalExpressionJS
			start = (backward) ? this.buffer.byteLength : 0;
		}
		
		if(start > this.buffer.byteLength)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = this.buffer.byteLength;
		}
		
		if(backward)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
			
			if(length > start)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
		}
		else
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
			
			if(length > (this.buffer.byteLength - start))
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
		}
		//endregion
		
		//region Find first byte from sequence
		const firstIn = this.skipNotPatterns(patterns, start, length, backward);
		// noinspection EqualityComparisonWithCoercionJS
		if(firstIn == (-1))
		{
			return {
				position: (-1),
				value: new ByteStream()
			};
		}
		//endregion
		
		//region Find first byte not in sequence
		// noinspection ConditionalExpressionJS
		const firstNotIn = this.skipPatterns(patterns,
			firstIn,
			length - ((backward) ? (start - firstIn) : (firstIn - start)),
			backward);
		//endregion
		
		//region Make output value
		if(backward)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = firstNotIn;
			// noinspection AssignmentToFunctionParameterJS
			length = (firstIn - firstNotIn);
		}
		else
		{
			// noinspection AssignmentToFunctionParameterJS
			start = firstIn;
			// noinspection AssignmentToFunctionParameterJS
			length = (firstNotIn - firstIn);
		}
		
		const value = new ByteStream();
		
		value._buffer = this._buffer.slice(start, start + length);
		value._view = new Uint8Array(value._buffer);
		//endregion
		
		return {
			position: firstNotIn,
			value
		};
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS
	/**
	 * Find all positions of a sequence of any patterns from input array
	 * @param {Array.<ByteStream>} patterns Array of patterns to search for
	 * @param {?number} [start] Start position to search from
	 * @param {?number} [length] Length of byte block to search at
	 * @returns {Array}
	 */
	findAllSequences(patterns, start = null, length = null)
	{
		//region Initial variables
		const result = [];
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		// noinspection NonBlockStatementBodyJS
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(length == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		if(length > (this.buffer.byteLength - start))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		let patternFound = {
			position: start,
			value: new ByteStream()
		};
		//endregion
		
		//region Find all accurences of patterns
		// noinspection EqualityComparisonWithCoercionJS
		do
		{
			const position = patternFound.position;
			
			patternFound = this.findFirstSequence(patterns, patternFound.position, length);
			
			// noinspection EqualityComparisonWithCoercionJS
			if(patternFound.position != (-1))
			{
				// noinspection AssignmentToFunctionParameterJS
				length -= (patternFound.position - position);
				
				result.push({
					position: patternFound.position,
					value: patternFound.value
				});
			}
			
		} while(patternFound.position != (-1));
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS, OverlyComplexFunctionJS, FunctionTooLongJS
	/**
	 * Find all paired patterns in the stream
	 * @param {ByteStream} leftPattern Left pattern to search for
	 * @param {ByteStream} rightPattern Right pattern to search for
	 * @param {?number} [start=null] Start position to search from
	 * @param {?number} [length=null] Length of byte block to search at
	 * @returns {Array}
	 */
	findPairedPatterns(leftPattern, rightPattern, start = null, length = null)
	{
		//region Initial variables
		const result = [];
		
		// noinspection NonBlockStatementBodyJS
		if(leftPattern.isEqual(rightPattern))
			return result;
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		// noinspection NonBlockStatementBodyJS
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(length == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		if(length > (this.buffer.byteLength - start))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		let currentPositionLeft = 0;
		//endregion
		
		//region Find all "left patterns" as sorted array
		const leftPatterns = this.findAllPatternIn(leftPattern, start, length);
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(leftPatterns.length == 0)
			return result;
		//endregion
		
		//region Find all "right patterns" as sorted array
		const rightPatterns = this.findAllPatternIn(rightPattern, start, length);
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(rightPatterns.length == 0)
			return result;
		//endregion
		
		//region Combine patterns
		while(currentPositionLeft < leftPatterns.length)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, EqualityComparisonWithCoercionJS
			if(rightPatterns.length == 0)
			{
				// noinspection BreakStatementJS
				break;
			}
			
			// noinspection EqualityComparisonWithCoercionJS
			if(leftPatterns[0] == rightPatterns[0])
			{
				// Possible situation when one pattern is a part of another
				// For example "stream" and "endstream"
				// In case when we have only "endstream" in fact "stream" will be also found at the same position
				// (position of the pattern is an index AFTER the pattern)
				
				result.push({
					left: leftPatterns[0],
					right: rightPatterns[0]
				});
				
				leftPatterns.splice(0, 1);
				rightPatterns.splice(0, 1);
				
				// noinspection ContinueStatementJS
				continue;
			}
			
			if(leftPatterns[currentPositionLeft] > rightPatterns[0])
			{
				// noinspection BreakStatementJS
				break;
			}
			
			while(leftPatterns[currentPositionLeft] < rightPatterns[0])
			{
				currentPositionLeft++;
				
				if(currentPositionLeft >= leftPatterns.length)
				{
					// noinspection BreakStatementJS
					break;
				}
			}
			
			result.push({
				left: leftPatterns[currentPositionLeft - 1],
				right: rightPatterns[0]
			});
			
			leftPatterns.splice(currentPositionLeft - 1, 1);
			rightPatterns.splice(0, 1);
			
			currentPositionLeft = 0;
		}
		//endregion
		
		//region Sort result
		result.sort((a, b) => (a.left - b.left));
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS, OverlyComplexFunctionJS, FunctionTooLongJS
	/**
	 * Find all paired patterns in the stream
	 * @param {Array.<ByteStream>} inputLeftPatterns Array of left patterns to search for
	 * @param {Array.<ByteStream>} inputRightPatterns Array of right patterns to search for
	 * @param {?number} [start=null] Start position to search from
	 * @param {?number} [length=null] Length of byte block to search at
	 * @returns {Array}
	 */
	findPairedArrays(inputLeftPatterns, inputRightPatterns, start = null, length = null)
	{
		//region Initial variables
		const result = [];
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		// noinspection NonBlockStatementBodyJS
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(length == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		if(length > (this.buffer.byteLength - start))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		let currentPositionLeft = 0;
		//endregion
		
		//region Find all "left patterns" as sorted array
		const leftPatterns = this.findAllIn(inputLeftPatterns, start, length);
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(leftPatterns.length == 0)
			return result;
		//endregion
		
		//region Find all "right patterns" as sorted array
		const rightPatterns = this.findAllIn(inputRightPatterns, start, length);
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(rightPatterns.length == 0)
			return result;
		//endregion
		
		//region Combine patterns
		while(currentPositionLeft < leftPatterns.length)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, EqualityComparisonWithCoercionJS
			if(rightPatterns.length == 0)
			{
				// noinspection BreakStatementJS
				break;
			}
			
			// noinspection EqualityComparisonWithCoercionJS
			if(leftPatterns[0].position == rightPatterns[0].position)
			{
				// Possible situation when one pattern is a part of another
				// For example "stream" and "endstream"
				// In case when we have only "endstream" in fact "stream" will be also found at the same position
				// (position of the pattern is an index AFTER the pattern)
				
				result.push({
					left: leftPatterns[0],
					right: rightPatterns[0]
				});
				
				leftPatterns.splice(0, 1);
				rightPatterns.splice(0, 1);
				
				// noinspection ContinueStatementJS
				continue;
			}
			
			if(leftPatterns[currentPositionLeft].position > rightPatterns[0].position)
			{
				// noinspection BreakStatementJS
				break;
			}
			
			while(leftPatterns[currentPositionLeft].position < rightPatterns[0].position)
			{
				currentPositionLeft++;
				
				if(currentPositionLeft >= leftPatterns.length)
				{
					// noinspection BreakStatementJS
					break;
				}
			}
			
			result.push({
				left: leftPatterns[currentPositionLeft - 1],
				right: rightPatterns[0]
			});
			
			leftPatterns.splice(currentPositionLeft - 1, 1);
			rightPatterns.splice(0, 1);
			
			currentPositionLeft = 0;
		}
		//endregion
		
		//region Sort result
		result.sort((a, b) => (a.left.position - b.left.position));
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS, FunctionTooLongJS
	/**
	 * Replace one patter with other
	 * @param {ByteStream} searchPattern The pattern to search for
	 * @param {ByteStream} replacePattern The pattern to replace initial pattern
	 * @param {?number} [start=null] Start position to search from
	 * @param {?number} [length=null] Length of byte block to search at
	 * @param {Array|null} [findAllResult=null] Pre-calculated results of "findAllIn"
	 * @returns {*}
	 */
	replacePattern(searchPattern, replacePattern, start = null, length = null, findAllResult = null)
	{
		//region Initial variables
		let result;
		
		let i;
		const output = {
			status: (-1),
			searchPatternPositions: [],
			replacePatternPositions: []
		};
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = 0;
		}
		
		// noinspection NonBlockStatementBodyJS
		if(start > (this.buffer.byteLength - 1))
			return false;
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(length == null)
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		
		if(length > (this.buffer.byteLength - start))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this.buffer.byteLength - start;
		}
		//endregion
		
		//region Find a pattern to search for
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if(findAllResult == null)
		{
			result = this.findAllIn([searchPattern], start, length);
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
			if(result.length == 0)
				return output;
		}
		else
			result = findAllResult;
		
		// noinspection NestedFunctionCallJS
		output.searchPatternPositions.push(...Array.from(result, element => element.position));
		//endregion
		
		//region Variables for new buffer initialization
		const patternDifference = searchPattern.buffer.byteLength - replacePattern.buffer.byteLength;
		
		const changedBuffer = new ArrayBuffer(this.view.length - (result.length * patternDifference));
		const changedView = new Uint8Array(changedBuffer);
		//endregion
		
		//region Copy data from 0 to start
		// noinspection NestedFunctionCallJS
		changedView.set(new Uint8Array(this.buffer, 0, start));
		//endregion
		
		//region Replace pattern
		for(i = 0; i < result.length; i++)
		{
			//region Initial variables
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, ConditionalExpressionJS, EqualityComparisonWithCoercionJS
			const currentPosition = (i == 0) ? start : result[i - 1].position;
			//endregion
			
			//region Copy bytes other then search pattern
			// noinspection NestedFunctionCallJS
			changedView.set(new Uint8Array(this.buffer, currentPosition, result[i].position - searchPattern.buffer.byteLength - currentPosition), currentPosition - i * patternDifference);
			//endregion
			
			//region Put replace pattern in a new buffer
			changedView.set(replacePattern.view, result[i].position - searchPattern.buffer.byteLength - i * patternDifference);
			
			output.replacePatternPositions.push(result[i].position - searchPattern.buffer.byteLength - i * patternDifference);
			//endregion
		}
		//endregion
		
		//region Copy data from the end of old buffer
		i--;
		// noinspection NestedFunctionCallJS
		changedView.set(new Uint8Array(this.buffer, result[i].position, this.buffer.byteLength - result[i].position), result[i].position - searchPattern.buffer.byteLength + replacePattern.buffer.byteLength - i * patternDifference);
		//endregion
		
		//region Re-initialize existing buffer
		this.buffer = changedBuffer;
		this.view = new Uint8Array(this.buffer);
		//endregion
		
		output.status = 1;
		
		return output;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS, OverlyComplexFunctionJS, FunctionTooLongJS
	/**
	 * Skip any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {?number} [start=null] Start position to search from
	 * @param {?number} [length=null] Length of byte block to search at
	 * @param {boolean} [backward=false] Flag to search in backward order
	 * @returns {*}
	 */
	skipPatterns(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS, ConditionalExpressionJS
			start = (backward) ? this.buffer.byteLength : 0;
		}
		
		if(start > this.buffer.byteLength)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = this.buffer.byteLength;
		}
		
		if(backward)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
			
			if(length > start)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
		}
		else
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
			
			if(length > (this.buffer.byteLength - start))
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
		}
		
		let result = start;
		//endregion
		
		//region Search for pattern
		for(let k = 0; k < patterns.length; k++)
		{
			const patternLength = patterns[k].buffer.byteLength;
			// noinspection ConditionalExpressionJS
			const equalStart = (backward) ? (result - patternLength) : (result);
			let equal = true;
			
			for(let j = 0; j < patternLength; j++)
			{
				// noinspection EqualityComparisonWithCoercionJS
				if(this.view[j + equalStart] != patterns[k].view[j])
				{
					equal = false;
					// noinspection BreakStatementJS
					break;
				}
			}
			
			if(equal)
			{
				k = (-1);
				
				if(backward)
				{
					result -= patternLength;
					// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
					if(result <= 0)
						return result;
				}
				else
				{
					result += patternLength;
					// noinspection NonBlockStatementBodyJS
					if(result >= (start + length))
						return result;
				}
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleLoopsJS, OverlyComplexFunctionJS, FunctionTooLongJS
	/**
	 * Skip any pattern not from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should not be ommited
	 * @param start
	 * @param length
	 * @param backward
	 * @returns {number}
	 */
	skipNotPatterns(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if(start == null)
		{
			// noinspection AssignmentToFunctionParameterJS, ConditionalExpressionJS
			start = (backward) ? this.buffer.byteLength : 0;
		}
		
		if(start > this.buffer.byteLength)
		{
			// noinspection AssignmentToFunctionParameterJS
			start = this.buffer.byteLength;
		}
		
		if(backward)
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
			
			if(length > start)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = start;
			}
		}
		else
		{
			// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
			if(length == null)
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
			
			if(length > (this.buffer.byteLength - start))
			{
				// noinspection AssignmentToFunctionParameterJS
				length = this.buffer.byteLength - start;
			}
		}
		
		let result = (-1);
		//endregion
		
		//region Search for pattern
		for(let i = 0; i < length; i++)
		{
			for(let k = 0; k < patterns.length; k++)
			{
				const patternLength = patterns[k].buffer.byteLength;
				// noinspection ConditionalExpressionJS
				const equalStart = (backward) ? (start - i - patternLength) : (start + i);
				let equal = true;
				
				for(let j = 0; j < patternLength; j++)
				{
					// noinspection EqualityComparisonWithCoercionJS
					if(this.view[j + equalStart] != patterns[k].view[j])
					{
						equal = false;
						// noinspection BreakStatementJS
						break;
					}
				}
				
				if(equal)
				{
					// noinspection ConditionalExpressionJS
					result = (backward) ? (start - i) : (start + i); // Exact position of pattern found
					// noinspection BreakStatementJS
					break;
				}
			}
			
			// noinspection EqualityComparisonWithCoercionJS
			if(result != (-1))
			{
				// noinspection BreakStatementJS
				break;
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
class SeqStream 
{
	//**********************************************************************************
	/**
	 * Constructor for "SeqStream" class
	 * @param {{[stream]: ByteStream, [length]: number, [backward]: boolean, [start]: number, [appendBlock]: number}} parameters
	 */
	constructor(parameters = {})
	{
		/**
		 * Major stream
		 * @type {ByteStream}
		 */
		this.stream = new ByteStream();
		/**
		 * Length of the major stream
		 * @type {number}
		 */
		this._length = 0;
		/**
		 * Flag to search in backward direction
		 * @type {boolean}
		 */
		this.backward = false;
		/**
		 * Start position to search
		 * @type {number}
		 */
		this._start = 0;
		/**
		 * Length of a block when append information to major stream
		 * @type {number}
		 */
		this.appendBlock = 0;
		
		this.prevLength = 0;
		this.prevStart = 0;
		
		for(const key of Object.keys(parameters))
		{
			switch(key)
			{
				case "stream":
					this.stream = parameters.stream;
					break;
				case "backward":
					this.backward = parameters.backward;
					// noinspection JSUnusedGlobalSymbols
					this._start = this.stream.buffer.byteLength;
					break;
				case "length":
					// noinspection JSUnusedGlobalSymbols
					this._length = parameters.length;
					break;
				case "start":
					// noinspection JSUnusedGlobalSymbols
					this._start = parameters.start;
					break;
				case "appendBlock":
					this.appendBlock = parameters.appendBlock;
					break;
				case "view":
					this.stream = new ByteStream({ view: parameters.view});
					break;
				case "buffer":
					this.stream = new ByteStream({ buffer: parameters.buffer});
					break;
				case "string":
					this.stream = new ByteStream({ string: parameters.string});
					break;
				case "hexstring":
					this.stream = new ByteStream({ hexstring: parameters.hexstring});
					break;
				default:
			}
		}
	}
	//**********************************************************************************
	/**
	 * Setter for "stream" property
	 * @param {ByteStream} value
	 */
	set stream(value)
	{
		this._stream = value;
		
		this.prevLength = this._length;
		// noinspection JSUnusedGlobalSymbols
		this._length = value._buffer.byteLength;
		
		this.prevStart = this._start;
		// noinspection JSUnusedGlobalSymbols
		this._start = 0;
	}
	//**********************************************************************************
	/**
	 * Getter for "stream" property
	 * @returns {ByteStream}
	 */
	get stream()
	{
		return this._stream;
	}
	//**********************************************************************************
	/**
	 * Setter for "length" property
	 * @param {number} value
	 */
	set length(value)
	{
		this.prevLength = this._length;
		// noinspection JSUnusedGlobalSymbols
		this._length = value;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS
	/**
	 * Getter for "length" property
	 * @returns {number}
	 */
	get length()
	{
		// noinspection NonBlockStatementBodyJS
		if(this.appendBlock)
			return this.start;
		
		return this._length;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS
	/**
	 * Setter for "start" property
	 * @param {number} value
	 */
	set start(value)
	{
		// noinspection NonBlockStatementBodyJS
		if(value > this.stream.buffer.byteLength)
			return;
		
		//region Initialization of "prev" internal variables
		this.prevStart = this._start;
		this.prevLength = this._length;
		//endregion
		
		// noinspection JSUnusedGlobalSymbols, ConditionalExpressionJS
		this._length -= ((this.backward) ? (this._start - value) : (value - this._start));
		// noinspection JSUnusedGlobalSymbols
		this._start = value;
	}
	//**********************************************************************************
	/**
	 * Getter for "start" property
	 * @returns {number}
	 */
	get start()
	{
		return this._start;
	}
	//**********************************************************************************
	/**
	 * Return ArrayBuffer with having value of existing SeqStream length
	 * @return {ArrayBuffer}
	 */
	get buffer()
	{
		return this._stream._buffer.slice(0, this._length);
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Reset current position of the "SeqStream"
	 */
	resetPosition()
	{
		// noinspection JSUnusedGlobalSymbols
		this._start = this.prevStart;
		// noinspection JSUnusedGlobalSymbols
		this._length = this.prevLength;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Find any byte pattern in "ByteStream"
	 * @param {ByteStream} pattern Stream having pattern value
	 * @param {?number} [gap] Maximum gap between start position and position of nearest object
	 * @returns {number}
	 */
	findPattern(pattern, gap = null)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((gap == null) || (gap > this.length))
		{
			// noinspection AssignmentToFunctionParameterJS
			gap = this.length;
		}
		//endregion
		
		//region Find pattern
		const result = this.stream.findPattern(pattern, this.start, this.length, this.backward);
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(result == (-1))
			return result;
		
		if(this.backward)
		{
			// noinspection NonBlockStatementBodyJS
			if(result < (this.start - pattern.buffer.byteLength - gap))
				return (-1);
		}
		else
		{
			// noinspection NonBlockStatementBodyJS
			if(result > (this.start + pattern.buffer.byteLength + gap))
				return (-1);
		}
		//endregion
		
		//region Create new values
		this.start = result;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Find first position of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @param {?number} [gap] Maximum gap between start position and position of nearest object
	 * @returns {{id: number, position: number}}
	 */
	findFirstIn(patterns, gap = null)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((gap == null) || (gap > this.length))
		{
			// noinspection AssignmentToFunctionParameterJS
			gap = this.length;
		}
		//endregion
		
		//region Search for patterns
		const result = this.stream.findFirstIn(patterns, this.start, this.length, this.backward);
		// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(result.id == (-1))
			return result;
		
		if(this.backward)
		{
			if(result.position < (this.start - patterns[result.id].buffer.byteLength - gap))
			{
				// noinspection ConditionalExpressionJS
				return {
					id: (-1),
					position: (this.backward) ? 0 : (this.start + this.length)
				};
			}
		}
		else
		{
			if(result.position > (this.start + patterns[result.id].buffer.byteLength + gap))
			{
				// noinspection ConditionalExpressionJS
				return {
					id: (-1),
					position: (this.backward) ? 0 : (this.start + this.length)
				};
			}
		}
		//endregion
		
		//region Create new values
		this.start = result.position;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Find all positions of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @returns {Array}
	 */
	findAllIn(patterns)
	{
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		// noinspection ConditionalExpressionJS
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		return this.stream.findAllIn(patterns, start, this.length);
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS, OverlyComplexFunctionJS
	/**
	 * Find first position of data, not included in patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {?number} gap Maximum gap between start position and position of nearest object
	 * @returns {*}
	 */
	findFirstNotIn(patterns, gap = null)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((gap == null) || (gap > this._length))
		{
			// noinspection AssignmentToFunctionParameterJS
			gap = this._length;
		}
		//endregion
		
		//region Search for patterns
		const result = this._stream.findFirstNotIn(patterns, this._start, this._length, this.backward);
		// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if((result.left.id == (-1)) && (result.right.id == (-1)))
			return result;
		
		if(this.backward)
		{
			// noinspection EqualityComparisonWithCoercionJS
			if(result.right.id != (-1))
			{
				if(result.right.position < (this._start - patterns[result.right.id]._buffer.byteLength - gap))
				{
					return {
						left: {
							id: (-1),
							position: this._start
						},
						right: {
							id: (-1),
							position: 0
						},
						value: new ByteStream()
					};
				}
			}
		}
		else
		{
			// noinspection EqualityComparisonWithCoercionJS
			if(result.left.id != (-1))
			{
				if(result.left.position > (this._start + patterns[result.left.id]._buffer.byteLength + gap))
				{
					return {
						left: {
							id: (-1),
							position: this._start
						},
						right: {
							id: (-1),
							position: 0
						},
						value: new ByteStream()
					};
				}
			}
		}
		//endregion
		
		//region Create new values
		if(this.backward)
		{
			// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
			if(result.left.id == (-1))
				this.start = 0;
			else
				this.start = result.left.position;
		}
		else
		{
			// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
			if(result.right.id == (-1))
				this.start = (this._start + this._length);
			else
				this.start = result.right.position;
		}
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Find all positions of data, not included in patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @returns {Array}
	 */
	findAllNotIn(patterns)
	{
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		// noinspection ConditionalExpressionJS
		const start = (this.backward) ? (this._start - this._length) : this._start;
		
		return this._stream.findAllNotIn(patterns, start, this._length);
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Find position of a sequence of any patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {?number} [length] Length to search sequence for
	 * @param {?number} [gap] Maximum gap between start position and position of nearest object
	 * @returns {*}
	 */
	findFirstSequence(patterns, length = null, gap = null)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((length == null) || (length > this._length))
		{
			// noinspection AssignmentToFunctionParameterJS
			length = this._length;
		}
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((gap == null) || (gap > length))
		{
			// noinspection AssignmentToFunctionParameterJS
			gap = length;
		}
		//endregion
		
		//region Search for sequence
		const result = this._stream.findFirstSequence(patterns, this._start, length, this.backward);
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(result.value.buffer.byteLength == 0)
			return result;
		
		if(this.backward)
		{
			if(result.position < (this._start - result.value._buffer.byteLength - gap))
			{
				return {
					position: (-1),
					value: new ByteStream()
				};
			}
		}
		else
		{
			if(result.position > (this._start + result.value._buffer.byteLength + gap))
			{
				return {
					position: (-1),
					value: new ByteStream()
				};
			}
		}
		//endregion
		
		//region Create new values
		this.start = result.position;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Find position of a sequence of any patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @returns {Array}
	 */
	findAllSequences(patterns)
	{
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		// noinspection ConditionalExpressionJS
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		return this.stream.findAllSequences(patterns, start, this.length);
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Find all paired patterns in the stream
	 * @param {ByteStream} leftPattern Left pattern to search for
	 * @param {ByteStream} rightPattern Right pattern to search for
	 * @param {?number} [gap] Maximum gap between start position and position of nearest object
	 * @returns {Array}
	 */
	findPairedPatterns(leftPattern, rightPattern, gap = null)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((gap == null) || (gap > this.length))
		{
			// noinspection AssignmentToFunctionParameterJS
			gap = this.length;
		}
		//endregion
		
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		// noinspection ConditionalExpressionJS
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		//region Search for patterns
		const result = this.stream.findPairedPatterns(leftPattern, rightPattern, start, this.length);
		if(result.length)
		{
			if(this.backward)
			{
				// noinspection NonBlockStatementBodyJS
				if(result[0].right < (this.start - rightPattern.buffer.byteLength - gap))
					return [];
			}
			else
			{
				// noinspection NonBlockStatementBodyJS
				if(result[0].left > (this.start + leftPattern.buffer.byteLength + gap))
					return [];
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Find all paired patterns in the stream
	 * @param {Array.<ByteStream>} leftPatterns Array of left patterns to search for
	 * @param {Array.<ByteStream>} rightPatterns Array of right patterns to search for
	 * @param {?number} [gap] Maximum gap between start position and position of nearest object
	 * @returns {Array}
	 */
	findPairedArrays(leftPatterns, rightPatterns, gap = null)
	{
		//region Initial variables
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS
		if((gap == null) || (gap > this.length))
		{
			// noinspection AssignmentToFunctionParameterJS
			gap = this.length;
		}
		//endregion
		
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		// noinspection ConditionalExpressionJS
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		//region Search for patterns
		const result = this.stream.findPairedArrays(leftPatterns, rightPatterns, start, this.length);
		if(result.length)
		{
			if(this.backward)
			{
				// noinspection NonBlockStatementBodyJS
				if(result[0].right.position < (this.start - rightPatterns[result[0].right.id].buffer.byteLength - gap))
					return [];
			}
			else
			{
				// noinspection NonBlockStatementBodyJS
				if(result[0].left.position > (this.start + leftPatterns[result[0].left.id].buffer.byteLength + gap))
					return [];
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Replace one patter with other
	 * @param {ByteStream} searchPattern The pattern to search for
	 * @param {ByteStream} replacePattern The pattern to replace initial pattern
	 * @returns {*}
	 */
	replacePattern(searchPattern, replacePattern)
	{
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		// noinspection ConditionalExpressionJS
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		return this.stream.replacePattern(searchPattern, replacePattern, start, this.length);
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Skip of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @returns {*}
	 */
	skipPatterns(patterns)
	{
		const result = this.stream.skipPatterns(patterns, this.start, this.length, this.backward);
		
		//region Create new values
		this.start = result;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS
	/**
	 * Skip of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @returns {number}
	 */
	skipNotPatterns(patterns)
	{
		const result = this.stream.skipNotPatterns(patterns, this.start, this.length, this.backward);
		// noinspection NonBlockStatementBodyJS, EqualityComparisonWithCoercionJS
		if(result == (-1))
			return (-1);
		
		//region Create new values
		this.start = result;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Append a new "Stream" content to the current "Stream"
	 * @param {ByteStream} stream A new "stream" to append to current "stream"
	 */
	append(stream)
	{
		if((this._start + stream._buffer.byteLength) > this._stream._buffer.byteLength)
		{
			if(stream._buffer.byteLength > this.appendBlock)
			{
				// noinspection MagicNumberJS
				this.appendBlock = (stream._buffer.byteLength + 1000);
			}
			
			this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
		}
		
		this._stream._view.set(stream._view, this._start);
		
		this._length += (stream._buffer.byteLength * 2);
		this.start = (this._start + stream._buffer.byteLength);
		this.prevLength -= (stream._buffer.byteLength * 2);
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Append a "view" content to the current "Stream"
	 * @param {Uint8Array} view A new "view" to append to current "stream"
	 */
	appendView(view)
	{
		if((this._start + view.length) > this._stream._buffer.byteLength)
		{
			if(view.length > this.appendBlock)
			{
				// noinspection MagicNumberJS
				this.appendBlock = (view.length + 1000);
			}
			
			this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
		}
		
		this._stream._view.set(view, this._start);
		
		this._length += (view.length * 2);
		this.start = (this._start + view.length);
		this.prevLength -= (view.length * 2);
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Append a new char to the current "Stream"
	 * @param {number} char A new char to append to current "stream"
	 */
	appendChar(char)
	{
		if((this._start + 1) > this._stream._buffer.byteLength)
		{
			// noinspection ConstantOnLefSideOfComparisonJS
			if(1 > this.appendBlock)
			{
				// noinspection MagicNumberJS
				this.appendBlock = 1000;
			}
			
			this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
		}
		
		this._stream._view[this._start] = char;
		
		this._length += 2;
		this.start = (this._start + 1);
		this.prevLength -= 2;
	}
	//**********************************************************************************
	// noinspection FunctionNamingConventionJS
	/**
	 * Append a new number to the current "Stream"
	 * @param {number} number A new unsigned 16-bit integer to append to current "stream"
	 */
	appendUint16(number)
	{
		if((this._start + 2) > this._stream._buffer.byteLength)
		{
			// noinspection ConstantOnLefSideOfComparisonJS
			if(2 > this.appendBlock)
			{
				// noinspection MagicNumberJS
				this.appendBlock = 1000;
			}
			
			this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
		}
		
		const value = new Uint16Array([number]);
		const view = new Uint8Array(value.buffer);
		
		this._stream._view[this._start] = view[1];
		this._stream._view[this._start + 1] = view[0];
		
		this._length += 4;
		this.start = (this._start + 2);
		this.prevLength -= 4;
	}
	//**********************************************************************************
	// noinspection FunctionNamingConventionJS
	/**
	 * Append a new number to the current "Stream"
	 * @param {number} number A new unsigned 24-bit integer to append to current "stream"
	 */
	appendUint24(number)
	{
		if((this._start + 3) > this._stream._buffer.byteLength)
		{
			// noinspection ConstantOnLefSideOfComparisonJS
			if(3 > this.appendBlock)
			{
				// noinspection MagicNumberJS
				this.appendBlock = 1000;
			}
			
			this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
		}
		
		const value = new Uint32Array([number]);
		const view = new Uint8Array(value.buffer);
		
		this._stream._view[this._start] = view[2];
		this._stream._view[this._start + 1] = view[1];
		this._stream._view[this._start + 2] = view[0];
		
		this._length += 6;
		this.start = (this._start + 3);
		this.prevLength -= 6;
	}
	//**********************************************************************************
	// noinspection FunctionNamingConventionJS
	/**
	 * Append a new number to the current "Stream"
	 * @param {number} number A new unsigned 32-bit integer to append to current "stream"
	 */
	appendUint32(number)
	{
		if((this._start + 4) > this._stream._buffer.byteLength)
		{
			// noinspection ConstantOnLefSideOfComparisonJS
			if(4 > this.appendBlock)
			{
				// noinspection MagicNumberJS
				this.appendBlock = 1000;
			}
			
			this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
		}
		
		const value = new Uint32Array([number]);
		const view = new Uint8Array(value.buffer);
		
		this._stream._view[this._start] = view[3];
		this._stream._view[this._start + 1] = view[2];
		this._stream._view[this._start + 2] = view[1];
		this._stream._view[this._start + 3] = view[0];
		
		this._length += 8;
		this.start = (this._start + 4);
		this.prevLength -= 8;
	}
	//**********************************************************************************
	// noinspection FunctionWithMultipleReturnPointsJS
	/**
	 * Get a block of data
	 * @param {number} size Size of the data block to get
	 * @param {boolean} [changeLength=true] Should we change "length" and "start" value after reading the data block
	 * @returns {Array}
	 */
	getBlock(size, changeLength = true)
	{
		//region Check input parameters
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if(this._length <= 0)
			return [];
		
		if(this._length < size)
		{
			// noinspection AssignmentToFunctionParameterJS
			size = this._length;
		}
		//endregion
		
		//region Initial variables
		let result;
		//endregion
		
		//region Getting result depends on "backward" flag
		if(this.backward)
		{
			const buffer = this._stream._buffer.slice(this._length - size, this._length);
			const view = new Uint8Array(buffer);
			
			result = new Array(size);
			
			// noinspection NonBlockStatementBodyJS
			for(let i = 0; i < size; i++)
				result[size - 1 - i] = view[i];
		}
		else
		{
			const buffer = this._stream._buffer.slice(this._start, this._start + size);
			
			// noinspection NestedFunctionCallJS
			result = Array.from(new Uint8Array(buffer));
		}
		//endregion
		
		//region Change "length" value if needed
		if(changeLength)
		{
			// noinspection ConditionalExpressionJS
			this.start += ((this.backward) ? ((-1) * size) : size);
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS, FunctionNamingConventionJS
	/**
	 * Get 2-byte unsigned integer value
	 * @param {boolean} [changeLength=true] Should we change "length" and "start" value after reading the data block
	 * @returns {number}
	 */
	getUint16(changeLength = true)
	{
		const block = this.getBlock(2, changeLength);
		
		//region Check posibility for convertion
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if(block.length < 2)
			return 0;
		//endregion
		
		//region Convert byte array to "Uint32Array" value
		const value = new Uint16Array(1);
		const view = new Uint8Array(value.buffer);
		
		view[0] = block[1];
		view[1] = block[0];
		//endregion
		
		return value[0];
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS, FunctionNamingConventionJS
	/**
	 * Get 3-byte unsigned integer value
	 * @param {boolean} [changeLength=true] Should we change "length" and "start" value after reading the data block
	 * @returns {number}
	 */
	getUint24(changeLength = true)
	{
		const block = this.getBlock(3, changeLength);
		
		//region Check posibility for convertion
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if(block.length < 3)
			return 0;
		//endregion
		
		//region Convert byte array to "Uint32Array" value
		const value = new Uint32Array(1);
		const view = new Uint8Array(value.buffer);
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		for(let i = 3; i >= 1; i--)
			view[3 - i] = block[i - 1];
		//endregion
		
		return value[0];
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols, FunctionWithMultipleReturnPointsJS, FunctionNamingConventionJS
	/**
	 * Get 4-byte unsigned integer value
	 * @param {boolean} [changeLength=true] Should we change "length" and "start" value after reading the data block
	 * @returns {number}
	 */
	getUint32(changeLength = true)
	{
		const block = this.getBlock(4, changeLength);
		
		//region Check posibility for convertion
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		if(block.length < 4)
			return 0;
		//endregion
		
		//region Convert byte array to "Uint32Array" value
		const value = new Uint32Array(1);
		const view = new Uint8Array(value.buffer);
		
		// noinspection ConstantOnRightSideOfComparisonJS, ConstantOnLeftSideOfComparisonJS, NonBlockStatementBodyJS
		for(let i = 3; i >= 0; i--)
			view[3 - i] = block[i];
		//endregion
		
		return value[0];
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
class SignedCertificateTimestamp
{
	//**********************************************************************************
	/**
	 * Constructor for SignedCertificateTimestamp class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", SignedCertificateTimestamp.defaultValues("version"));
		/**
		 * @type {ArrayBuffer}
		 * @desc logID
		 */
		this.logID = getParametersValue(parameters, "logID", SignedCertificateTimestamp.defaultValues("logID"));
		/**
		 * @type {Date}
		 * @desc timestamp
		 */
		this.timestamp = getParametersValue(parameters, "timestamp", SignedCertificateTimestamp.defaultValues("timestamp"));
		/**
		 * @type {ArrayBuffer}
		 * @desc extensions
		 */
		this.extensions = getParametersValue(parameters, "extensions", SignedCertificateTimestamp.defaultValues("extensions"));
		/**
		 * @type {string}
		 * @desc hashAlgorithm
		 */
		this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", SignedCertificateTimestamp.defaultValues("hashAlgorithm"));
		/**
		 * @type {string}
		 * @desc signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", SignedCertificateTimestamp.defaultValues("signatureAlgorithm"));
		/**
		 * @type {Object}
		 * @desc signature
		 */
		this.signature = getParametersValue(parameters, "signature", SignedCertificateTimestamp.defaultValues("signature"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		
		//region If input argument array contains "stream"
		if("stream" in parameters)
			this.fromStream(parameters.stream);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 0;
			case "logID":
			case "extensions":
				return new ArrayBuffer(0);
			case "timestamp":
				return new Date(0);
			case "hashAlgorithm":
			case "signatureAlgorithm":
				return "";
			case "signature":
				return new Any();
			default:
				throw new Error(`Invalid member name for SignedCertificateTimestamp class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		if((schema instanceof RawData) === false)
			throw new Error("Object's schema was not verified against input data for SignedCertificateTimestamp");
		
		const seqStream = new SeqStream({
			stream: new ByteStream({
				buffer: schema.data
			})
		});
		
		this.fromStream(seqStream);
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data into current class
	 * @param {!SeqStream} stream
	 */
	fromStream(stream)
	{
		const blockLength = stream.getUint16();
		
		this.version = (stream.getBlock(1))[0];
		
		if(this.version === 0)
		{
			this.logID = (new Uint8Array(stream.getBlock(32))).buffer.slice(0);
			this.timestamp = new Date(utilFromBase(new Uint8Array(stream.getBlock(8)), 8));
			
			//region Extensions
			const extensionsLength = stream.getUint16();
			this.extensions = (new Uint8Array(stream.getBlock(extensionsLength))).buffer.slice(0);
			//endregion
			
			//region Hash algorithm
			switch((stream.getBlock(1))[0])
			{
				case 0:
					this.hashAlgorithm = "none";
					break;
				case 1:
					this.hashAlgorithm = "md5";
					break;
				case 2:
					this.hashAlgorithm = "sha1";
					break;
				case 3:
					this.hashAlgorithm = "sha224";
					break;
				case 4:
					this.hashAlgorithm = "sha256";
					break;
				case 5:
					this.hashAlgorithm = "sha384";
					break;
				case 6:
					this.hashAlgorithm = "sha512";
					break;
				default:
					throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
			}
			//endregion
			
			//region Signature algorithm
			switch((stream.getBlock(1))[0])
			{
				case 0:
					this.signatureAlgorithm = "anonymous";
					break;
				case 1:
					this.signatureAlgorithm = "rsa";
					break;
				case 2:
					this.signatureAlgorithm = "dsa";
					break;
				case 3:
					this.signatureAlgorithm = "ecdsa";
					break;
				default:
					throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
			}
			//endregion
			
			//region Signature
			const signatureLength = stream.getUint16();
			const signatureData = (new Uint8Array(stream.getBlock(signatureLength))).buffer.slice(0);
			
			const asn1 = fromBER(signatureData);
			if(asn1.offset === (-1))
				throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
			
			this.signature = asn1.result;
			//endregion
			
			if(blockLength !== (47 + extensionsLength + signatureLength))
				throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
		}
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const stream = this.toStream();
		
		return new RawData({ data: stream.stream.buffer });
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @returns {SeqStream} SeqStream object
	 */
	toStream()
	{
		const stream = new SeqStream();
		
		stream.appendUint16(47 + this.extensions.byteLength + this.signature.valueBeforeDecode.byteLength);
		stream.appendChar(this.version);
		stream.appendView(new Uint8Array(this.logID));
		
		const timeBuffer = new ArrayBuffer(8);
		const timeView = new Uint8Array(timeBuffer);
		
		const baseArray = utilToBase(this.timestamp.valueOf(), 8);
		timeView.set(new Uint8Array(baseArray), 8 - baseArray.byteLength);
		
		stream.appendView(timeView);
		stream.appendUint16(this.extensions.byteLength);
		
		if(this.extensions.byteLength)
			stream.appendView(new Uint8Array(this.extensions));
		
		let _hashAlgorithm;
		
		switch(this.hashAlgorithm.toLowerCase())
		{
			case "none":
				_hashAlgorithm = 0;
				break;
			case "md5":
				_hashAlgorithm = 1;
				break;
			case "sha1":
				_hashAlgorithm = 2;
				break;
			case "sha224":
				_hashAlgorithm = 3;
				break;
			case "sha256":
				_hashAlgorithm = 4;
				break;
			case "sha384":
				_hashAlgorithm = 5;
				break;
			case "sha512":
				_hashAlgorithm = 6;
				break;
			default:
				throw new Error(`Incorrect data for hashAlgorithm: ${this.hashAlgorithm}`);
		}
		
		stream.appendChar(_hashAlgorithm);
		
		let _signatureAlgorithm;
		
		switch(this.signatureAlgorithm.toLowerCase())
		{
			case "anonymous":
				_signatureAlgorithm = 0;
				break;
			case "rsa":
				_signatureAlgorithm = 1;
				break;
			case "dsa":
				_signatureAlgorithm = 2;
				break;
			case "ecdsa":
				_signatureAlgorithm = 3;
				break;
			default:
				throw new Error(`Incorrect data for signatureAlgorithm: ${this.signatureAlgorithm}`);
		}
		
		stream.appendChar(_signatureAlgorithm);
		
		const _signature = this.signature.toBER(false);
		
		stream.appendUint16(_signature.byteLength);
		stream.appendView(new Uint8Array(_signature));
		
		return stream;
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			version: this.version,
			logID: bufferToHexCodes(this.logID),
			timestamp: this.timestamp,
			extensions: bufferToHexCodes(this.extensions),
			hashAlgorithm: this.hashAlgorithm,
			signatureAlgorithm: this.signatureAlgorithm,
			signature: this.signature.toJSON()
		};
	}
	//**********************************************************************************
	/**
	 * Verify SignedCertificateTimestamp for specific input data
	 * @param {Object[]} logs Array of objects with information about each CT Log (like here: https://ct.grahamedgecombe.com/logs.json)
	 * @param {String} logs.log_id Identifier of the CT Log encoded in BASE-64 format
	 * @param {String} logs.key Public key of the CT Log encoded in BASE-64 format
	 * @param {ArrayBuffer} data Data to verify signature against. Could be encoded Certificate or encoded PreCert
	 * @param {Number} [dataType=0] Type = 0 (data is encoded Certificate), type = 1 (data is encoded PreCert)
	 * @return {Promise<void>}
	 */
	async verify(logs, data, dataType = 0)
	{
		//region Initial variables
		let logId = toBase64(arrayBufferToString(this.logID));
		
		let publicKeyBase64 = null;
		let publicKeyInfo;
		
		let stream = new SeqStream();
		//endregion
		
		//region Found and init public key
		for(const log of logs)
		{
			if(log.log_id === logId)
			{
				publicKeyBase64 = log.key;
				break;
			}
		}
		
		if(publicKeyBase64 === null)
			throw new Error(`Public key not found for CT with logId: ${logId}`);
		
		const asn1 = fromBER(stringToArrayBuffer(fromBase64(publicKeyBase64)));
		if(asn1.offset === (-1))
			throw new Error(`Incorrect key value for CT Log with logId: ${logId}`);
		
		publicKeyInfo = new PublicKeyInfo({ schema: asn1.result });
		//endregion
		
		//region Initialize signed data block
		stream.appendChar(0x00); // sct_version
		stream.appendChar(0x00); // signature_type = certificate_timestamp
		
		const timeBuffer = new ArrayBuffer(8);
		const timeView = new Uint8Array(timeBuffer);
		
		const baseArray = utilToBase(this.timestamp.valueOf(), 8);
		timeView.set(new Uint8Array(baseArray), 8 - baseArray.byteLength);
		
		stream.appendView(timeView);
		
		stream.appendUint16(dataType);
		
		if(dataType === 0)
			stream.appendUint24(data.byteLength);
		
		stream.appendView(new Uint8Array(data));
		
		stream.appendUint16(this.extensions.byteLength);
		
		if(this.extensions.byteLength !== 0)
			stream.appendView(new Uint8Array(this.extensions));
		//endregion
		
		//region Perform verification
		return getEngine().subtle.verifyWithPublicKey(
			stream._stream._buffer.slice(0, stream._length),
			{ valueBlock: { valueHex: this.signature.toBER(false) } },
			publicKeyInfo,
			{ algorithmId: "" },
			"SHA-256"
		);
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC6962
 */
class SignedCertificateTimestampList
{
	//**********************************************************************************
	/**
	 * Constructor for SignedCertificateTimestampList class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<SignedCertificateTimestamp>}
		 * @desc timestamps
		 */
		this.timestamps = getParametersValue(parameters, "timestamps", SignedCertificateTimestampList.defaultValues("timestamps"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "timestamps":
				return [];
			default:
				throw new Error(`Invalid member name for SignedCertificateTimestampList class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "timestamps":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for SignedCertificateTimestampList class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * SignedCertificateTimestampList ::= OCTET STRING
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [optional]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		if(("optional" in names) === false)
			names.optional = false;
		
		return (new OctetString({
			name: (names.blockName || "SignedCertificateTimestampList"),
			optional: names.optional
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Check the schema is valid
		if((schema instanceof OctetString) === false)
			throw new Error("Object's schema was not verified against input data for SignedCertificateTimestampList");
		//endregion
		
		//region Get internal properties from parsed schema
		const seqStream = new SeqStream({
			stream: new ByteStream({
				buffer: schema.valueBlock.valueHex
			})
		});
		
		let dataLength = seqStream.getUint16();
		if(dataLength !== seqStream.length)
			throw new Error("Object's schema was not verified against input data for SignedCertificateTimestampList");
		
		while(seqStream.length)
			this.timestamps.push(new SignedCertificateTimestamp({ stream: seqStream }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Initial variables
		const stream = new SeqStream();
		
		let overallLength = 0;
		
		const timestampsData = [];
		//endregion
		
		//region Get overall length
		for(const timestamp of this.timestamps)
		{
			const timestampStream = timestamp.toStream();
			timestampsData.push(timestampStream);
			overallLength += timestampStream.stream.buffer.byteLength;
		}
		//endregion
		
		stream.appendUint16(overallLength);
		
		//region Set data from all timestamps
		for(const timestamp of timestampsData)
			stream.appendView(timestamp.stream.view);
		//endregion
		
		return new OctetString({ valueHex: stream.stream.buffer.slice(0) });
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			timestamps: Array.from(this.timestamps, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**********************************************************************************

//**************************************************************************************
/**
 * Class from "[MS-WCCE]: Windows Client Certificate Enrollment Protocol"
 */
class CertificateTemplate
{
	//**********************************************************************************
	/**
	 * Constructor for CertificateTemplate class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc templateID
		 */
		this.templateID = getParametersValue(parameters, "templateID", CertificateTemplate.defaultValues("templateID"));

		if("templateMajorVersion" in parameters)
			/**
			 * @type {number}
			 * @desc templateMajorVersion
			 */
			this.templateMajorVersion = getParametersValue(parameters, "templateMajorVersion", CertificateTemplate.defaultValues("templateMajorVersion"));

		if("templateMinorVersion" in parameters)
			/**
			 * @type {number}
			 * @desc templateMinorVersion
			 */
			this.templateMinorVersion = getParametersValue(parameters, "templateMinorVersion", CertificateTemplate.defaultValues("templateMinorVersion"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "templateID":
				return "";
			case "templateMajorVersion":
			case "templateMinorVersion":
				return 0;
			default:
				throw new Error(`Invalid member name for CertificateTemplate class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CertificateTemplateOID ::= SEQUENCE {
     *    templateID              OBJECT IDENTIFIER,
     *    templateMajorVersion    INTEGER (0..4294967295) OPTIONAL,
     *    templateMinorVersion    INTEGER (0..4294967295) OPTIONAL
     * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [templateID]
		 * @property {string} [templateMajorVersion]
		 * @property {string} [templateMinorVersion]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.templateID || "") }),
				new Integer({
					name: (names.templateMajorVersion || ""),
					optional: true
				}),
				new Integer({
					name: (names.templateMinorVersion || ""),
					optional: true
				}),
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"templateID",
			"templateMajorVersion",
			"templateMinorVersion"
		]);
		//endregion

		//region Check the schema is valid
		let asn1 = compareSchema(schema,
			schema,
			CertificateTemplate.schema({
				names: {
					templateID: "templateID",
					templateMajorVersion: "templateMajorVersion",
					templateMinorVersion: "templateMinorVersion"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertificateTemplate");
		//endregion

		//region Get internal properties from parsed schema
		this.templateID = asn1.result.templateID.valueBlock.toString();

		if("templateMajorVersion" in asn1.result)
			this.templateMajorVersion = asn1.result.templateMajorVersion.valueBlock.valueDec;

		if("templateMinorVersion" in asn1.result)
			this.templateMinorVersion = asn1.result.templateMinorVersion.valueBlock.valueDec;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];

		outputArray.push(new ObjectIdentifier({ value: this.templateID }));

		if("templateMajorVersion" in this)
			outputArray.push(new Integer({ value: this.templateMajorVersion }));

		if("templateMinorVersion" in this)
			outputArray.push(new Integer({ value: this.templateMinorVersion }));
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			extnID: this.templateID
		};

		if("templateMajorVersion" in this)
			object.templateMajorVersion = this.templateMajorVersion;

		if("templateMinorVersion" in this)
			object.templateMinorVersion = this.templateMinorVersion;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from https://docs.microsoft.com/en-us/windows/desktop/seccrypto/certification-authority-renewal
 */
class CAVersion
{
	//**********************************************************************************
	/**
	 * Constructor for CAVersion class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc certificateIndex
		 */
		this.certificateIndex = getParametersValue(parameters, "certificateIndex", CAVersion.defaultValues("certificateIndex"));

		/**
		 * @type {number}
		 * @desc keyIndex
		 */
		this.keyIndex = getParametersValue(parameters, "keyIndex", CAVersion.defaultValues("keyIndex"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "certificateIndex":
			case "keyIndex":
				return 0;
			default:
				throw new Error(`Invalid member name for CAVersion class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CAVersion ::= INTEGER
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		return (new Integer());
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Check the schema is valid
		if(schema.constructor.blockName() !== Integer.blockName())
			throw new Error("Object's schema was not verified against input data for CAVersion");
		//endregion

		//region Check length of the input value and correct it if needed
		let value = schema.valueBlock.valueHex.slice(0);
		const valueView = new Uint8Array(value);

		switch(true)
		{
			case (value.byteLength < 4):
				{
					const tempValue = new ArrayBuffer(4);
					const tempValueView = new Uint8Array(tempValue);

					tempValueView.set(valueView, 4 - value.byteLength);

					value = tempValue.slice(0);
				}
				break;
			case (value.byteLength > 4):
				{
					const tempValue = new ArrayBuffer(4);
					const tempValueView = new Uint8Array(tempValue);

					tempValueView.set(valueView.slice(0, 4));

					value = tempValue.slice(0);
				}
				break;
			default:
		}
		//endregion

		//region Get internal properties from parsed schema
		const keyIndexBuffer = value.slice(0, 2);
		const keyIndexView8 = new Uint8Array(keyIndexBuffer);
		let temp = keyIndexView8[0];
		keyIndexView8[0] = keyIndexView8[1];
		keyIndexView8[1] = temp;

		const keyIndexView16 = new Uint16Array(keyIndexBuffer);

		this.keyIndex = keyIndexView16[0];

		const certificateIndexBuffer = value.slice(2);
		const certificateIndexView8 = new Uint8Array(certificateIndexBuffer);
		temp = certificateIndexView8[0];
		certificateIndexView8[0] = certificateIndexView8[1];
		certificateIndexView8[1] = temp;

		const certificateIndexView16 = new Uint16Array(certificateIndexBuffer);

		this.certificateIndex = certificateIndexView16[0];
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create raw values
		const certificateIndexBuffer = new ArrayBuffer(2);
		const certificateIndexView = new Uint16Array(certificateIndexBuffer);

		certificateIndexView[0] = this.certificateIndex;

		const certificateIndexView8 = new Uint8Array(certificateIndexBuffer);
		let temp = certificateIndexView8[0];
		certificateIndexView8[0] = certificateIndexView8[1];
		certificateIndexView8[1] = temp;

		const keyIndexBuffer = new ArrayBuffer(2);
		const keyIndexView = new Uint16Array(keyIndexBuffer);

		keyIndexView[0] = this.keyIndex;

		const keyIndexView8 = new Uint8Array(keyIndexBuffer);
		temp = keyIndexView8[0];
		keyIndexView8[0] = keyIndexView8[1];
		keyIndexView8[1] = temp;
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Integer({
			valueHex: utilConcatBuf(keyIndexBuffer, certificateIndexBuffer)
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			certificateIndex: this.certificateIndex,
			keyIndex: this.keyIndex
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class Extension
{
	//**********************************************************************************
	/**
	 * Constructor for Extension class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc extnID
		 */
		this.extnID = getParametersValue(parameters, "extnID", Extension.defaultValues("extnID"));
		/**
		 * @type {boolean}
		 * @desc critical
		 */
		this.critical = getParametersValue(parameters, "critical", Extension.defaultValues("critical"));
		/**
		 * @type {OctetString}
		 * @desc extnValue
		 */
		if("extnValue" in parameters)
			this.extnValue = new OctetString({ valueHex: parameters.extnValue });
		else
			this.extnValue = Extension.defaultValues("extnValue");

		if("parsedValue" in parameters)
			/**
			 * @type {Object}
			 * @desc parsedValue
			 */
			this.parsedValue = getParametersValue(parameters, "parsedValue", Extension.defaultValues("parsedValue"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "extnID":
				return "";
			case "critical":
				return false;
			case "extnValue":
				return new OctetString();
			case "parsedValue":
				return {};
			default:
				throw new Error(`Invalid member name for Extension class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Extension  ::=  SEQUENCE  {
	 *    extnID      OBJECT IDENTIFIER,
	 *    critical    BOOLEAN DEFAULT FALSE,
	 *    extnValue   OCTET STRING
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [extnID]
		 * @property {string} [critical]
		 * @property {string} [extnValue]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.extnID || "") }),
				new Boolean({
					name: (names.critical || ""),
					optional: true
				}),
				new OctetString({ name: (names.extnValue || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"extnID",
			"critical",
			"extnValue"
		]);
		//endregion
		
		//region Check the schema is valid
		let asn1 = compareSchema(schema,
			schema,
			Extension.schema({
				names: {
					extnID: "extnID",
					critical: "critical",
					extnValue: "extnValue"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Extension");
		//endregion

		//region Get internal properties from parsed schema
		this.extnID = asn1.result.extnID.valueBlock.toString();
		if("critical" in asn1.result)
			this.critical = asn1.result.critical.valueBlock.value;
		this.extnValue = asn1.result.extnValue;

		//region Get "parsedValue" for well-known extensions
		asn1 = fromBER(this.extnValue.valueBlock.valueHex);
		if(asn1.offset === (-1))
			return;

		switch(this.extnID)
		{
			case "2.5.29.9": // SubjectDirectoryAttributes
				try
				{
					this.parsedValue = new SubjectDirectoryAttributes({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new SubjectDirectoryAttributes();
					this.parsedValue.parsingError = "Incorrectly formated SubjectDirectoryAttributes";
				}
				break;
			case "2.5.29.14": // SubjectKeyIdentifier
				this.parsedValue = asn1.result; // Should be just a simple OCTETSTRING
				break;
			case "2.5.29.15": // KeyUsage
				this.parsedValue = asn1.result; // Should be just a simple BITSTRING
				break;
			case "2.5.29.16": // PrivateKeyUsagePeriod
				try
				{
					this.parsedValue = new PrivateKeyUsagePeriod({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new PrivateKeyUsagePeriod();
					this.parsedValue.parsingError = "Incorrectly formated PrivateKeyUsagePeriod";
				}
				break;
			case "2.5.29.17": // SubjectAltName
			case "2.5.29.18": // IssuerAltName
				try
				{
					this.parsedValue = new AltName({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new AltName();
					this.parsedValue.parsingError = "Incorrectly formated AltName";
				}
				break;
			case "2.5.29.19": // BasicConstraints
				try
				{
					this.parsedValue = new BasicConstraints({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new BasicConstraints();
					this.parsedValue.parsingError = "Incorrectly formated BasicConstraints";
				}
				break;
			case "2.5.29.20": // CRLNumber
			case "2.5.29.27": // BaseCRLNumber (delta CRL indicator)
				this.parsedValue = asn1.result; // Should be just a simple INTEGER
				break;
			case "2.5.29.21": // CRLReason
				this.parsedValue = asn1.result; // Should be just a simple ENUMERATED
				break;
			case "2.5.29.24": // InvalidityDate
				this.parsedValue = asn1.result; // Should be just a simple GeneralizedTime
				break;
			case "2.5.29.28": // IssuingDistributionPoint
				try
				{
					this.parsedValue = new IssuingDistributionPoint({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new IssuingDistributionPoint();
					this.parsedValue.parsingError = "Incorrectly formated IssuingDistributionPoint";
				}
				break;
			case "2.5.29.29": // CertificateIssuer
				try
				{
					this.parsedValue = new GeneralNames({ schema: asn1.result }); // Should be just a simple
				}
				catch(ex)
				{
					this.parsedValue = new GeneralNames();
					this.parsedValue.parsingError = "Incorrectly formated GeneralNames";
				}
				break;
			case "2.5.29.30": // NameConstraints
				try
				{
					this.parsedValue = new NameConstraints({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new NameConstraints();
					this.parsedValue.parsingError = "Incorrectly formated NameConstraints";
				}
				break;
			case "2.5.29.31": // CRLDistributionPoints
			case "2.5.29.46": // FreshestCRL
				try
				{
					this.parsedValue = new CRLDistributionPoints({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new CRLDistributionPoints();
					this.parsedValue.parsingError = "Incorrectly formated CRLDistributionPoints";
				}
				break;
			case "2.5.29.32": // CertificatePolicies
			case "1.3.6.1.4.1.311.21.10": // szOID_APPLICATION_CERT_POLICIES - Microsoft-specific OID
				try
				{
					this.parsedValue = new CertificatePolicies({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new CertificatePolicies();
					this.parsedValue.parsingError = "Incorrectly formated CertificatePolicies";
				}
				break;
			case "2.5.29.33": // PolicyMappings
				try
				{
					this.parsedValue = new PolicyMappings({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new PolicyMappings();
					this.parsedValue.parsingError = "Incorrectly formated CertificatePolicies";
				}
				break;
			case "2.5.29.35": // AuthorityKeyIdentifier
				try
				{
					this.parsedValue = new AuthorityKeyIdentifier({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new AuthorityKeyIdentifier();
					this.parsedValue.parsingError = "Incorrectly formated AuthorityKeyIdentifier";
				}
				break;
			case "2.5.29.36": // PolicyConstraints
				try
				{
					this.parsedValue = new PolicyConstraints({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new PolicyConstraints();
					this.parsedValue.parsingError = "Incorrectly formated PolicyConstraints";
				}
				break;
			case "2.5.29.37": // ExtKeyUsage
				try
				{
					this.parsedValue = new ExtKeyUsage({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new ExtKeyUsage();
					this.parsedValue.parsingError = "Incorrectly formated ExtKeyUsage";
				}
				break;
			case "2.5.29.54": // InhibitAnyPolicy
				this.parsedValue = asn1.result; // Should be just a simple INTEGER
				break;
			case "1.3.6.1.5.5.7.1.1": // AuthorityInfoAccess
			case "1.3.6.1.5.5.7.1.11": // SubjectInfoAccess
				try
				{
					this.parsedValue = new InfoAccess({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new InfoAccess();
					this.parsedValue.parsingError = "Incorrectly formated InfoAccess";
				}
				break;
			case "1.3.6.1.4.1.11129.2.4.2": // SignedCertificateTimestampList
				try
				{
					this.parsedValue = new SignedCertificateTimestampList({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new SignedCertificateTimestampList();
					this.parsedValue.parsingError = "Incorrectly formated SignedCertificateTimestampList";
				}
				break;
			case "1.3.6.1.4.1.311.20.2": // szOID_ENROLL_CERTTYPE_EXTENSION - Microsoft-specific extension
				this.parsedValue = asn1.result; // Used to be simple Unicode string
				break;
			case "1.3.6.1.4.1.311.21.2": // szOID_CERTSRV_PREVIOUS_CERT_HASH - Microsoft-specific extension
				this.parsedValue = asn1.result; // Used to be simple OctetString
				break;
			case "1.3.6.1.4.1.311.21.7": // szOID_CERTIFICATE_TEMPLATE - Microsoft-specific extension
				try
				{
					this.parsedValue = new CertificateTemplate({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new CertificateTemplate();
					this.parsedValue.parsingError = "Incorrectly formated CertificateTemplate";
				}
				break;
			case "1.3.6.1.4.1.311.21.1": // szOID_CERTSRV_CA_VERSION - Microsoft-specific extension
				try
				{
					this.parsedValue = new CAVersion({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new CAVersion();
					this.parsedValue.parsingError = "Incorrectly formated CAVersion";
				}
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
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];

		outputArray.push(new ObjectIdentifier({ value: this.extnID }));

		if(this.critical !== Extension.defaultValues("critical"))
			outputArray.push(new Boolean({ value: this.critical }));

		outputArray.push(this.extnValue);
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			extnID: this.extnID,
			extnValue: this.extnValue.toJSON()
		};

		if(this.critical !== Extension.defaultValues("critical"))
			object.critical = this.critical;

		if("parsedValue" in this)
		{
			if("toJSON" in this.parsedValue)
				object.parsedValue = this.parsedValue.toJSON();
		}

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class Extensions
{
	//**********************************************************************************
	/**
	 * Constructor for Extensions class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<Extension>}
		 * @desc type
		 */
		this.extensions = getParametersValue(parameters, "extensions", Extensions.defaultValues("extensions"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "extensions":
				return [];
			default:
				throw new Error(`Invalid member name for Extensions class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Extensions  ::=  SEQUENCE SIZE (1..MAX) OF Extension
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @param {boolean} optional Flag that current schema should be optional
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {}, optional = false)
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [extensions]
		 * @property {string} [extension]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			optional,
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.extensions || ""),
					value: Extension.schema(names.extension || {})
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"extensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			Extensions.schema({
				names: {
					extensions: "extensions"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Extensions");
		//endregion

		//region Get internal properties from parsed schema
		this.extensions = Array.from(asn1.result.extensions, element => new Extension({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.extensions, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			extensions: Array.from(this.extensions, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
function tbsCertificate(parameters = {})
{
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
	const names = getParametersValue(parameters, "names", {});
	
	return (new Sequence({
		name: (names.blockName || "tbsCertificate"),
		value: [
			new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new Integer({ name: (names.tbsCertificateVersion || "tbsCertificate.version") }) // EXPLICIT integer value
				]
			}),
			new Integer({ name: (names.tbsCertificateSerialNumber || "tbsCertificate.serialNumber") }),
			AlgorithmIdentifier.schema(names.signature || {
				names: {
					blockName: "tbsCertificate.signature"
				}
			}),
			RelativeDistinguishedNames.schema(names.issuer || {
				names: {
					blockName: "tbsCertificate.issuer"
				}
			}),
			new Sequence({
				name: (names.tbsCertificateValidity || "tbsCertificate.validity"),
				value: [
					Time.schema(names.notBefore || {
						names: {
							utcTimeName: "tbsCertificate.notBefore",
							generalTimeName: "tbsCertificate.notBefore"
						}
					}),
					Time.schema(names.notAfter || {
						names: {
							utcTimeName: "tbsCertificate.notAfter",
							generalTimeName: "tbsCertificate.notAfter"
						}
					})
				]
			}),
			RelativeDistinguishedNames.schema(names.subject || {
				names: {
					blockName: "tbsCertificate.subject"
				}
			}),
			PublicKeyInfo.schema(names.subjectPublicKeyInfo || {
				names: {
					blockName: "tbsCertificate.subjectPublicKeyInfo"
				}
			}),
			new Primitive({
				name: (names.tbsCertificateIssuerUniqueID || "tbsCertificate.issuerUniqueID"),
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				}
			}), // IMPLICIT bistring value
			new Primitive({
				name: (names.tbsCertificateSubjectUniqueID || "tbsCertificate.subjectUniqueID"),
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
	}));
}
//**************************************************************************************
/**
 * Class from RFC5280
 */
class Certificate
{
	//**********************************************************************************
	/**
	 * Constructor for Certificate class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {ArrayBuffer}
		 * @desc ToBeSigned (TBS) part of the certificate
		 */
		this.tbs = getParametersValue(parameters, "tbs", Certificate.defaultValues("tbs"));
		/**
		 * @type {number}
		 * @desc Version number
		 */
		this.version = getParametersValue(parameters, "version", Certificate.defaultValues("version"));
		/**
		 * @type {Integer}
		 * @desc Serial number of the certificate
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", Certificate.defaultValues("serialNumber"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc This field contains the algorithm identifier for the algorithm used by the CA to sign the certificate
		 */
		this.signature = getParametersValue(parameters, "signature", Certificate.defaultValues("signature"));
		/**
		 * @type {RelativeDistinguishedNames}
		 * @desc The issuer field identifies the entity that has signed and issued the certificate
		 */
		this.issuer = getParametersValue(parameters, "issuer", Certificate.defaultValues("issuer"));
		/**
		 * @type {Time}
		 * @desc The date on which the certificate validity period begins
		 */
		this.notBefore = getParametersValue(parameters, "notBefore", Certificate.defaultValues("notBefore"));
		/**
		 * @type {Time}
		 * @desc The date on which the certificate validity period ends
		 */
		this.notAfter = getParametersValue(parameters, "notAfter", Certificate.defaultValues("notAfter"));
		/**
		 * @type {RelativeDistinguishedNames}
		 * @desc The subject field identifies the entity associated with the public key stored in the subject public key field
		 */
		this.subject = getParametersValue(parameters, "subject", Certificate.defaultValues("subject"));
		/**
		 * @type {PublicKeyInfo}
		 * @desc This field is used to carry the public key and identify the algorithm with which the key is used
		 */
		this.subjectPublicKeyInfo = getParametersValue(parameters, "subjectPublicKeyInfo", Certificate.defaultValues("subjectPublicKeyInfo"));
		
		if("issuerUniqueID" in parameters)
			/**
			 * @type {ArrayBuffer}
			 * @desc The subject and issuer unique identifiers are present in the certificate to handle the possibility of reuse of subject and/or issuer names over time
			 */
			this.issuerUniqueID = getParametersValue(parameters, "issuerUniqueID", Certificate.defaultValues("issuerUniqueID"));
		
		if("subjectUniqueID" in parameters)
			/**
			 * @type {ArrayBuffer}
			 * @desc The subject and issuer unique identifiers are present in the certificate to handle the possibility of reuse of subject and/or issuer names over time
			 */
			this.subjectUniqueID = getParametersValue(parameters, "subjectUniqueID", Certificate.defaultValues("subjectUniqueID"));
		
		if("extensions" in parameters)
			/**
			 * @type {Array}
			 * @desc If present, this field is a SEQUENCE of one or more certificate extensions
			 */
			this.extensions = getParametersValue(parameters, "extensions", Certificate.defaultValues("extensions"));
		
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc The signatureAlgorithm field contains the identifier for the cryptographic algorithm used by the CA to sign this certificate
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", Certificate.defaultValues("signatureAlgorithm"));
		/**
		 * @type {BitString}
		 * @desc The signatureValue field contains a digital signature computed upon the ASN.1 DER encoded tbsCertificate
		 */
		this.signatureValue = getParametersValue(parameters, "signatureValue", Certificate.defaultValues("signatureValue"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
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
				throw new Error(`Invalid member name for Certificate class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Certificate  ::=  SEQUENCE  {
	 *    tbsCertificate       TBSCertificate,
	 *    signatureAlgorithm   AlgorithmIdentifier,
	 *    signatureValue       BIT STRING  }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [tbsCertificate]
		 * @property {string} [signatureAlgorithm]
		 * @property {string} [signatureValue]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				tbsCertificate(names.tbsCertificate),
				AlgorithmIdentifier.schema(names.signatureAlgorithm || {
					names: {
						blockName: "signatureAlgorithm"
					}
				}),
				new BitString({ name: (names.signatureValue || "signatureValue") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"tbsCertificate",
			"tbsCertificate.extensions",
			"tbsCertificate.version",
			"tbsCertificate.serialNumber",
			"tbsCertificate.signature",
			"tbsCertificate.issuer",
			"tbsCertificate.notBefore",
			"tbsCertificate.notAfter",
			"tbsCertificate.subject",
			"tbsCertificate.subjectPublicKeyInfo",
			"tbsCertificate.issuerUniqueID",
			"tbsCertificate.subjectUniqueID",
			"signatureAlgorithm",
			"signatureValue"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			Certificate.schema({
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
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Certificate");
		//endregion
		
		//region Get internal properties from parsed schema
		this.tbs = asn1.result.tbsCertificate.valueBeforeDecode;
		
		if("tbsCertificate.version" in asn1.result)
			this.version = asn1.result["tbsCertificate.version"].valueBlock.valueDec;
		this.serialNumber = asn1.result["tbsCertificate.serialNumber"];
		this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertificate.signature"] });
		this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.issuer"] });
		this.notBefore = new Time({ schema: asn1.result["tbsCertificate.notBefore"] });
		this.notAfter = new Time({ schema: asn1.result["tbsCertificate.notAfter"] });
		this.subject = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.subject"] });
		this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result["tbsCertificate.subjectPublicKeyInfo"] });
		if("tbsCertificate.issuerUniqueID" in asn1.result)
			this.issuerUniqueID = asn1.result["tbsCertificate.issuerUniqueID"].valueBlock.valueHex;
		if("tbsCertificate.subjectUniqueID" in asn1.result)
			this.subjectUniqueID = asn1.result["tbsCertificate.subjectUniqueID"].valueBlock.valueHex;
		if("tbsCertificate.extensions" in asn1.result)
			this.extensions = Array.from(asn1.result["tbsCertificate.extensions"], element => new Extension({ schema: element }));
		
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
		this.signatureValue = asn1.result.signatureValue;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Create ASN.1 schema for existing values of TBS part for the certificate
	 */
	encodeTBS()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if(("version" in this) && (this.version !== Certificate.defaultValues("version")))
		{
			outputArray.push(new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new Integer({ value: this.version }) // EXPLICIT integer value
				]
			}));
		}
		
		outputArray.push(this.serialNumber);
		outputArray.push(this.signature.toSchema());
		outputArray.push(this.issuer.toSchema());
		
		outputArray.push(new Sequence({
			value: [
				this.notBefore.toSchema(),
				this.notAfter.toSchema()
			]
		}));
		
		outputArray.push(this.subject.toSchema());
		outputArray.push(this.subjectPublicKeyInfo.toSchema());
		
		if("issuerUniqueID" in this)
		{
			outputArray.push(new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				valueHex: this.issuerUniqueID
			}));
		}
		if("subjectUniqueID" in this)
		{
			outputArray.push(new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				valueHex: this.subjectUniqueID
			}));
		}
		
		if("extensions" in this)
		{
			outputArray.push(new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				value: [new Sequence({
					value: Array.from(this.extensions, element => element.toSchema())
				})]
			}));
		}
		//endregion
		
		//region Create and return output sequence
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema(encodeFlag = false)
	{
		let tbsSchema = {};
		
		//region Decode stored TBS value
		if(encodeFlag === false)
		{
			if(this.tbs.length === 0) // No stored certificate TBS part
				return Certificate.schema().value[0];
			
			tbsSchema = fromBER(this.tbs).result;
		}
		//endregion
		//region Create TBS schema via assembling from TBS parts
		else
			tbsSchema = this.encodeTBS();
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				tbsSchema,
				this.signatureAlgorithm.toSchema(),
				this.signatureValue
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
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
		
		if(("version" in this) && (this.version !== Certificate.defaultValues("version")))
			object.version = this.version;
		
		if("issuerUniqueID" in this)
			object.issuerUniqueID = bufferToHexCodes(this.issuerUniqueID, 0, this.issuerUniqueID.byteLength);
		
		if("subjectUniqueID" in this)
			object.subjectUniqueID = bufferToHexCodes(this.subjectUniqueID, 0, this.subjectUniqueID.byteLength);
		
		if("extensions" in this)
			object.extensions = Array.from(this.extensions, element => element.toJSON());
		
		return object;
	}
	//**********************************************************************************
	/**
	 * Importing public key for current certificate
	 */
	getPublicKey(parameters = null)
	{
		return getEngine().subtle.getPublicKey(this.subjectPublicKeyInfo, this.signatureAlgorithm, parameters);
	}
	//**********************************************************************************
	/**
	 * Get hash value for subject public key (default SHA-1)
	 * @param {String} [hashAlgorithm=SHA-1] Hashing algorithm name
	 */
	getKeyHash(hashAlgorithm = "SHA-1")
	{
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		return crypto.digest({ name: hashAlgorithm }, new Uint8Array(this.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
	}
	//**********************************************************************************
	/**
	 * Make a signature for current value from TBS section
	 * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
	 * @param {string} [hashAlgorithm="SHA-1"] Hashing algorithm
	 */
	sign(privateKey, hashAlgorithm = "SHA-1")
	{
		//region Initial checking
		//region Check private key
		if(typeof privateKey === "undefined")
			return Promise.reject("Need to provide a private key for signing");
		//endregion
		//endregion
		
		//region Initial variables
		let sequence = Promise.resolve();
		let parameters;
		
		const engine = getEngine();
		//endregion
		
		//region Get a "default parameters" for current algorithm and set correct signature algorithm
		sequence = sequence.then(() => engine.subtle.getSignatureParameters(privateKey, hashAlgorithm));
		
		sequence = sequence.then(result =>
		{
			parameters = result.parameters;
			this.signature = result.signatureAlgorithm;
			this.signatureAlgorithm = result.signatureAlgorithm;
		});
		//endregion
		
		//region Create TBS data for signing
		sequence = sequence.then(() =>
		{
			this.tbs = this.encodeTBS().toBER(false);
		});
		//endregion
		
		//region Signing TBS data on provided private key
		sequence = sequence.then(() => engine.subtle.signWithPrivateKey(this.tbs, privateKey, parameters));
		
		sequence = sequence.then(result =>
		{
			this.signatureValue = new BitString({ valueHex: result });
		});
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	verify(issuerCertificate = null)
	{
		//region Global variables
		let subjectPublicKeyInfo = {};
		//endregion
		
		//region Set correct "subjectPublicKeyInfo" value
		if(issuerCertificate !== null)
			subjectPublicKeyInfo = issuerCertificate.subjectPublicKeyInfo;
		else
		{
			if(this.issuer.isEqual(this.subject)) // Self-signed certificate
				subjectPublicKeyInfo = this.subjectPublicKeyInfo;
		}
		
		if((subjectPublicKeyInfo instanceof PublicKeyInfo) === false)
			return Promise.reject("Please provide issuer certificate as a parameter");
		//endregion
		
		return getEngine().subtle.verifyWithPublicKey(this.tbs, this.signatureValue, subjectPublicKeyInfo, this.signatureAlgorithm);
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5755
 */
class AttCertValidityPeriod
{
	//**********************************************************************************
	/**
	 * Constructor for AttCertValidityPeriod class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {GeneralizedTime}
		 * @desc notBeforeTime
		 */
		this.notBeforeTime = getParametersValue(parameters, "notBeforeTime", AttCertValidityPeriod.defaultValues("notBeforeTime"));
		/**
		 * @type {GeneralizedTime}
		 * @desc notAfterTime
		 */
		this.notAfterTime = getParametersValue(parameters, "notAfterTime", AttCertValidityPeriod.defaultValues("notAfterTime"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "notBeforeTime":
			case "notAfterTime":
				return new Date(0, 0, 0);
			default:
				throw new Error(`Invalid member name for AttCertValidityPeriod class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AttCertValidityPeriod  ::= SEQUENCE {
	 *   notBeforeTime  GeneralizedTime,
	 *   notAfterTime   GeneralizedTime
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [notBeforeTime]
		 * @property {string} [notAfterTime]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new GeneralizedTime({ name: (names.notBeforeTime || "") }),
				new GeneralizedTime({ name: (names.notAfterTime || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"notBeforeTime",
			"notAfterTime"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AttCertValidityPeriod.schema({
				names: {
					notBeforeTime: "notBeforeTime",
					notAfterTime: "notAfterTime"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttCertValidityPeriod");
		//endregion
		
		//region Get internal properties from parsed schema
		this.notBeforeTime = asn1.result.notBeforeTime.toDate();
		this.notAfterTime = asn1.result.notAfterTime.toDate();
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new GeneralizedTime({ valueDate: this.notBeforeTime }),
				new GeneralizedTime({ valueDate: this.notAfterTime }),
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			notBeforeTime: this.notBeforeTime,
			notAfterTime: this.notAfterTime
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
class IssuerSerial
{
	//**********************************************************************************
	/**
	 * Constructor for IssuerSerial class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {RelativeDistinguishedNames}
		 * @desc issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", IssuerSerial.defaultValues("issuer"));
		/**
		 * @type {Integer}
		 * @desc serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", IssuerSerial.defaultValues("serialNumber"));
		
		if("issuerUID" in parameters)
			/**
			 * @type {BitString}
			 * @desc issuerUID
			 */
			this.issuerUID = getParametersValue(parameters, "issuerUID", IssuerSerial.defaultValues("issuerUID"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "issuer":
				return new GeneralNames();
			case "serialNumber":
				return new Integer();
			case "issuerUID":
				return new BitString();
			default:
				throw new Error(`Invalid member name for IssuerSerial class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * IssuerSerial  ::=  SEQUENCE {
	 *   	issuer         GeneralNames,
	 * 		serial         CertificateSerialNumber,
	 * 		issuerUID      UniqueIdentifier OPTIONAL
	 * }
	 *
	 * CertificateSerialNumber ::= INTEGER
	 * UniqueIdentifier  ::=  BIT STRING
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuer]
		 * @property {string} [serialNumber]
		 * @property {string} [issuerUID]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				GeneralNames.schema(names.issuer || {}),
				new Integer({ name: (names.serialNumber || "") }),
				new BitString({
					optional: true,
					name: (names.issuerUID || "")
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"issuer",
			"serialNumber",
			"issuerUID"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			IssuerSerial.schema({
				names: {
					issuer: {
						names: {
							blockName: "issuer"
						}
					},
					serialNumber: "serialNumber",
					issuerUID: "issuerUID"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for IssuerSerial");
		//endregion
		
		//region Get internal properties from parsed schema
		this.issuer = new GeneralNames({ schema: asn1.result.issuer });
		this.serialNumber = asn1.result.serialNumber;
		
		if("issuerUID" in asn1.result)
			this.issuerUID = asn1.result.issuerUID;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new Sequence({
			value: [
				this.issuer.toSchema(),
				this.serialNumber
			]
		});
		
		if("issuerUID" in this)
			result.valueBlock.value.push(this.issuerUID);
		
		//region Construct and return new ASN.1 schema for this object
		return result;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {
			issuer: this.issuer.toJSON(),
			serialNumber: this.serialNumber.toJSON()
		};
		
		if("issuerUID" in this)
			result.issuerUID = this.issuerUID.toJSON();
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
class AttributeCertificateInfoV1
{
	//**********************************************************************************
	/**
	 * Constructor for AttributeCertificateInfoV1 class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", AttributeCertificateInfoV1.defaultValues("version"));
		
		if("baseCertificateID" in parameters)
			/**
			 * @type {IssuerSerial}
			 * @desc baseCertificateID
			 */
			this.baseCertificateID = getParametersValue(parameters, "baseCertificateID", AttributeCertificateInfoV1.defaultValues("baseCertificateID"));
		
		if("subjectName" in parameters)
			/**
			 * @type {GeneralNames}
			 * @desc subjectName
			 */
			this.subjectName = getParametersValue(parameters, "subjectName", AttributeCertificateInfoV1.defaultValues("subjectName"));

		/**
		 * @type {GeneralNames}
		 * @desc issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", AttributeCertificateInfoV1.defaultValues("issuer"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc signature
		 */
		this.signature = getParametersValue(parameters, "signature", AttributeCertificateInfoV1.defaultValues("signature"));
		/**
		 * @type {Integer}
		 * @desc serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", AttributeCertificateInfoV1.defaultValues("serialNumber"));
		/**
		 * @type {AttCertValidityPeriod}
		 * @desc attrCertValidityPeriod
		 */
		this.attrCertValidityPeriod = getParametersValue(parameters, "attrCertValidityPeriod", AttributeCertificateInfoV1.defaultValues("attrCertValidityPeriod"));
		/**
		 * @type {Array.<Attribute>}
		 * @desc attributes
		 */
		this.attributes = getParametersValue(parameters, "attributes", AttributeCertificateInfoV1.defaultValues("attributes"));
		
		if("issuerUniqueID" in parameters)
			/**
			 * @type {BitString}
			 * @desc issuerUniqueID
			 */
			this.issuerUniqueID = getParametersValue(parameters, "issuerUniqueID", AttributeCertificateInfoV1.defaultValues("issuerUniqueID"));
			
		if("extensions" in parameters)
			/**
			 * @type {Extensions}
			 * @desc extensions
			 */
			this.extensions = getParametersValue(parameters, "extensions", AttributeCertificateInfoV1.defaultValues("extensions"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 0;
			case "baseCertificateID":
				return new IssuerSerial();
			case "subjectName":
				return new GeneralNames();
			case "issuer":
				return {};
			case "signature":
				return new AlgorithmIdentifier();
			case "serialNumber":
				return new Integer();
			case "attrCertValidityPeriod":
				return new AttCertValidityPeriod();
			case "attributes":
				return [];
			case "issuerUniqueID":
				return new BitString();
			case "extensions":
				return new Extensions();
			default:
				throw new Error(`Invalid member name for AttributeCertificateInfoV1 class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AttributeCertificateInfo ::= SEQUENCE {
	 * 	version Version DEFAULT v1,
	 * 	subject CHOICE {
	 * 		baseCertificateID [0] IssuerSerial, -- associated with a Public Key Certificate
	 * 		subjectName [1] GeneralNames }, -- associated with a name
	 * 	issuer GeneralNames, -- CA issuing the attribute certificate
	 * 	signature AlgorithmIdentifier,
	 * 	serialNumber CertificateSerialNumber,
	 * 	attrCertValidityPeriod AttCertValidityPeriod,
	 * 	attributes SEQUENCE OF Attribute,
	 * 	issuerUniqueID UniqueIdentifier OPTIONAL,
	 * 	extensions Extensions OPTIONAL
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuer]
		 * @property {string} [serialNumber]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				new Choice({
					value: [
						new Constructed({
							name: (names.baseCertificateID || ""),
							idBlock: {
								tagClass: 3,
								tagNumber: 0 // [0]
							},
							value: IssuerSerial.schema().valueBlock.value
						}),
						new Constructed({
							name: (names.subjectName || ""),
							idBlock: {
								tagClass: 3,
								tagNumber: 1 // [2]
							},
							value: GeneralNames.schema().valueBlock.value
						}),
					]
				}),
				GeneralNames.schema({
					names: {
						blockName: (names.issuer || "")
					}
				}),
				AlgorithmIdentifier.schema(names.signature || {}),
				new Integer({ name: (names.serialNumber || "") }),
				AttCertValidityPeriod.schema(names.attrCertValidityPeriod || {}),
				new Sequence({
					name: (names.attributes || ""),
					value: [
						new Repeated({
							value: Attribute.schema()
						})
					]
				}),
				new BitString({
					optional: true,
					name: (names.issuerUniqueID || "")
				}),
				Extensions.schema(names.extensions || {}, true)
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"baseCertificateID",
			"subjectName",
			"issuer",
			"signature",
			"serialNumber",
			"attrCertValidityPeriod",
			"attributes",
			"issuerUniqueID",
			"extensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AttributeCertificateInfoV1.schema({
				names: {
					version: "version",
					baseCertificateID: "baseCertificateID",
					subjectName: "subjectName",
					issuer: "issuer",
					signature: {
						names: {
							blockName: "signature"
						}
					},
					serialNumber: "serialNumber",
					attrCertValidityPeriod: {
						names: {
							blockName: "attrCertValidityPeriod"
						}
					},
					attributes: "attributes",
					issuerUniqueID: "issuerUniqueID",
					extensions: {
						names: {
							blockName: "extensions"
						}
					}
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttributeCertificateInfoV1");
		//endregion
		
		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		
		if("baseCertificateID" in asn1.result)
		{
			this.baseCertificateID = new IssuerSerial({
				schema: new Sequence({
					value: asn1.result.baseCertificateID.valueBlock.value
				})
			});
		}
		
		if("subjectName" in asn1.result)
		{
			this.subjectName = new GeneralNames({
				schema: new Sequence({
					value: asn1.result.subjectName.valueBlock.value
				})
			});
		}
		
		this.issuer = asn1.result.issuer;
		this.signature = new AlgorithmIdentifier({ schema: asn1.result.signature });
		this.serialNumber = asn1.result.serialNumber;
		this.attrCertValidityPeriod = new AttCertValidityPeriod({ schema: asn1.result.attrCertValidityPeriod });
		this.attributes = Array.from(asn1.result.attributes.valueBlock.value, element => new Attribute({ schema: element }));
		
		if("issuerUniqueID" in asn1.result)
			this.issuerUniqueID = asn1.result.issuerUniqueID;
		
		if("extensions" in asn1.result)
			this.extensions = new Extensions({ schema: asn1.result.extensions });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new Sequence({
			value: [new Integer({ value: this.version })]
		});
		
		if("baseCertificateID" in this)
		{
			result.valueBlock.value.push(new Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 0 // [0]
				},
				value: this.baseCertificateID.toSchema().valueBlock.value
			}));
		}
		
		if("subjectName" in this)
		{
			result.valueBlock.value.push(new Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 1 // [1]
				},
				value: this.subjectName.toSchema().valueBlock.value
			}));
		}
		
		result.valueBlock.value.push(this.issuer.toSchema());
		result.valueBlock.value.push(this.signature.toSchema());
		result.valueBlock.value.push(this.serialNumber);
		result.valueBlock.value.push(this.attrCertValidityPeriod.toSchema());
		result.valueBlock.value.push(new Sequence({
			value: Array.from(this.attributes, element => element.toSchema())
		}));
		
		if("issuerUniqueID" in this)
			result.valueBlock.value.push(this.issuerUniqueID);
		
		if("extensions" in this)
			result.valueBlock.value.push(this.extensions.toSchema());
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {
			version: this.version
		};
		
		if("baseCertificateID" in this)
			result.baseCertificateID = this.baseCertificateID.toJSON();
		
		if("subjectName" in this)
			result.subjectName = this.subjectName.toJSON();

		result.issuer = this.issuer.toJSON();
		result.signature = this.signature.toJSON();
		result.serialNumber = this.serialNumber.toJSON();
		result.attrCertValidityPeriod = this.attrCertValidityPeriod.toJSON();
		result.attributes = Array.from(this.attributes, element => element.toJSON());
		
		if("issuerUniqueID" in this)
			result.issuerUniqueID = this.issuerUniqueID.toJSON();
		
		if("extensions" in this)
			result.extensions = this.extensions.toJSON();
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from X.509:1997
 */
class AttributeCertificateV1
{
	//**********************************************************************************
	/**
	 * Constructor for AttributeCertificateV1 class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AttributeCertificateInfoV1}
		 * @desc acinfo
		 */
		this.acinfo = getParametersValue(parameters, "acinfo", AttributeCertificateV1.defaultValues("acinfo"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", AttributeCertificateV1.defaultValues("signatureAlgorithm"));
		/**
		 * @type {BitString}
		 * @desc signatureValue
		 */
		this.signatureValue = getParametersValue(parameters, "signatureValue", AttributeCertificateV1.defaultValues("signatureValue"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "acinfo":
				return new AttributeCertificateInfoV1();
			case "signatureAlgorithm":
				return new AlgorithmIdentifier();
			case "signatureValue":
				return new BitString();
			default:
				throw new Error(`Invalid member name for AttributeCertificateV1 class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AttributeCertificate ::= SEQUENCE {
	 *   acinfo               AttributeCertificateInfoV1,
	 *   signatureAlgorithm   AlgorithmIdentifier,
	 *   signatureValue       BIT STRING
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {Object} [acinfo]
		 * @property {Object} [signatureAlgorithm]
		 * @property {string} [signatureValue]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				AttributeCertificateInfoV1.schema(names.acinfo || {}),
				AlgorithmIdentifier.schema(names.signatureAlgorithm || {}),
				new BitString({ name: (names.signatureValue || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"acinfo",
			"signatureValue",
			"signatureAlgorithm"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AttributeCertificateV1.schema({
				names: {
					acinfo: {
						names: {
							blockName: "acinfo"
						}
					},
					signatureAlgorithm: {
						names: {
							blockName: "signatureAlgorithm"
						}
					},
					signatureValue: "signatureValue"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttributeCertificateV1");
		//endregion
		
		//region Get internal properties from parsed schema
		this.acinfo = new AttributeCertificateInfoV1({ schema: asn1.result.acinfo });
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
		this.signatureValue = asn1.result.signatureValue;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		return (new Sequence({
			value: [
				this.acinfo.toSchema(),
				this.signatureAlgorithm.toSchema(),
				this.signatureValue
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			acinfo: this.acinfo.toJSON(),
			signatureAlgorithm: this.signatureAlgorithm.toJSON(),
			signatureValue: this.signatureValue.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5755
 */
class ObjectDigestInfo
{
	//**********************************************************************************
	/**
	 * Constructor for ObjectDigestInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Enumerated}
		 * @desc digestedObjectType
		 */
		this.digestedObjectType = getParametersValue(parameters, "digestedObjectType", ObjectDigestInfo.defaultValues("digestedObjectType"));
		
		if("otherObjectTypeID" in parameters)
			/**
			 * @type {ObjectIdentifier}
			 * @desc otherObjectTypeID
			 */
			this.otherObjectTypeID = getParametersValue(parameters, "otherObjectTypeID", ObjectDigestInfo.defaultValues("otherObjectTypeID"));
		
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc digestAlgorithm
		 */
		this.digestAlgorithm = getParametersValue(parameters, "digestAlgorithm", ObjectDigestInfo.defaultValues("digestAlgorithm"));
		/**
		 * @type {BitString}
		 * @desc objectDigest
		 */
		this.objectDigest = getParametersValue(parameters, "objectDigest", ObjectDigestInfo.defaultValues("objectDigest"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "digestedObjectType":
				return new Enumerated();
			case "otherObjectTypeID":
				return new ObjectIdentifier();
			case "digestAlgorithm":
				return new AlgorithmIdentifier();
			case "objectDigest":
				return new BitString();
			default:
				throw new Error(`Invalid member name for ObjectDigestInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * ObjectDigestInfo ::= SEQUENCE {
	 *   digestedObjectType  ENUMERATED {
	 *     publicKey            (0),
	 *     publicKeyCert        (1),
	 *     otherObjectTypes     (2) },
	 *   -- otherObjectTypes MUST NOT
	 *   -- be used in this profile
	 *   otherObjectTypeID   OBJECT IDENTIFIER OPTIONAL,
	 *   digestAlgorithm     AlgorithmIdentifier,
	 *   objectDigest        BIT STRING
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [digestedObjectType]
		 * @property {string} [otherObjectTypeID]
		 * @property {string} [digestAlgorithm]
		 * @property {string} [objectDigest]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Enumerated({ name: (names.digestedObjectType || "") }),
				new ObjectIdentifier({
					optional: true,
					name: (names.otherObjectTypeID || "")
				}),
				AlgorithmIdentifier.schema(names.digestAlgorithm || {}),
				new BitString({ name: (names.objectDigest || "") }),
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"digestedObjectType",
			"otherObjectTypeID",
			"digestAlgorithm",
			"objectDigest"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			ObjectDigestInfo.schema({
				names: {
					digestedObjectType: "digestedObjectType",
					otherObjectTypeID: "otherObjectTypeID",
					digestAlgorithm: {
						names: {
							blockName: "digestAlgorithm"
						}
					},
					objectDigest: "objectDigest"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ObjectDigestInfo");
		//endregion
		
		//region Get internal properties from parsed schema
		this.digestedObjectType = asn1.result.digestedObjectType;
		
		if("otherObjectTypeID" in asn1.result)
			this.otherObjectTypeID = asn1.result.otherObjectTypeID;
		
		this.digestAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.digestAlgorithm });
		this.objectDigest = asn1.result.objectDigest;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new Sequence({
			value: [this.digestedObjectType]
		});
		
		if("otherObjectTypeID" in this)
			result.value.push(this.otherObjectTypeID);
		
		result.value.push(this.digestAlgorithm.toSchema());
		result.value.push(this.objectDigest);
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {
			digestedObjectType: this.digestedObjectType.toJSON()
		};
		
		if("otherObjectTypeID" in this)
			result.otherObjectTypeID = this.otherObjectTypeID.toJSON();
		
		result.digestAlgorithm = this.digestAlgorithm.toJSON();
		result.objectDigest = this.objectDigest.toJSON();
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
class V2Form
{
	//**********************************************************************************
	/**
	 * Constructor for V2Form class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("issuerName" in parameters)
			/**
			 * @type {GeneralNames}
			 * @desc issuerName
			 */
			this.issuerName = getParametersValue(parameters, "issuerName", V2Form.defaultValues("issuerName"));
		
		if("baseCertificateID" in parameters)
			/**
			 * @type {IssuerSerial}
			 * @desc baseCertificateID
			 */
			this.baseCertificateID = getParametersValue(parameters, "baseCertificateID", V2Form.defaultValues("baseCertificateID"));
		
		if("objectDigestInfo" in parameters)
			/**
			 * @type {ObjectDigestInfo}
			 * @desc objectDigestInfo
			 */
			this.objectDigestInfo = getParametersValue(parameters, "objectDigestInfo", V2Form.defaultValues("objectDigestInfo"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "issuerName":
				return new GeneralNames();
			case "baseCertificateID":
				return new IssuerSerial();
			case "objectDigestInfo":
				return new ObjectDigestInfo();
			default:
				throw new Error(`Invalid member name for V2Form class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * V2Form ::= SEQUENCE {
	 *   issuerName            GeneralNames  OPTIONAL,
	 *   baseCertificateID     [0] IssuerSerial  OPTIONAL,
	 *   objectDigestInfo      [1] ObjectDigestInfo  OPTIONAL
	 *     -- issuerName MUST be present in this profile
	 *     -- baseCertificateID and objectDigestInfo MUST NOT
	 *     -- be present in this profile
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuerName]
		 * @property {string} [baseCertificateID]
		 * @property {string} [objectDigestInfo]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				GeneralNames.schema({
					names: {
						blockName: names.issuerName
					}
				}, true),
				new Constructed({
					optional: true,
					name: (names.baseCertificateID || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 0 // [0]
					},
					value: IssuerSerial.schema().valueBlock.value
				}),
				new Constructed({
					optional: true,
					name: (names.objectDigestInfo || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 1 // [1]
					},
					value: ObjectDigestInfo.schema().valueBlock.value
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"issuerName",
			"baseCertificateID",
			"objectDigestInfo"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			V2Form.schema({
				names: {
					issuerName: "issuerName",
					baseCertificateID: "baseCertificateID",
					objectDigestInfo: "objectDigestInfo"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for V2Form");
		//endregion
		
		//region Get internal properties from parsed schema
		if("issuerName" in asn1.result)
			this.issuerName = new GeneralNames({ schema: asn1.result.issuerName });
		
		if("baseCertificateID" in asn1.result)
		{
			this.baseCertificateID = new IssuerSerial({
				schema: new Sequence({
					value: asn1.result.baseCertificateID.valueBlock.value
				})
			});
		}
		
		if("objectDigestInfo" in asn1.result)
		{
			this.objectDigestInfo = new ObjectDigestInfo({
				schema: new Sequence({
					value: asn1.result.objectDigestInfo.valueBlock.value
				})
			});
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new Sequence();
		
		if("issuerName" in this)
			result.valueBlock.value.push(this.issuerName.toSchema());
		
		if("baseCertificateID" in this)
		{
			result.valueBlock.value.push(new Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 0 // [0]
				},
				value: this.baseCertificateID.toSchema().valueBlock.value
			}));
		}
		
		if("objectDigestInfo" in this)
		{
			result.valueBlock.value.push(new Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 1 // [1]
				},
				value: this.objectDigestInfo.toSchema().valueBlock.value
			}));
		}
		
		//region Construct and return new ASN.1 schema for this object
		return result;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {};
		
		if("issuerName" in this)
			result.issuerName = this.issuerName.toJSON();
		
		if("baseCertificateID" in this)
			result.baseCertificateID = this.baseCertificateID.toJSON();
		
		if("objectDigestInfo" in this)
			result.objectDigestInfo = this.objectDigestInfo.toJSON();
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
class Holder
{
	//**********************************************************************************
	/**
	 * Constructor for Holder class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("baseCertificateID" in parameters)
			/**
			 * @type {IssuerSerial}
			 * @desc baseCertificateID
			 */
			this.baseCertificateID = getParametersValue(parameters, "baseCertificateID", Holder.defaultValues("baseCertificateID"));
		
		if("entityName" in parameters)
			/**
			 * @type {GeneralNames}
			 * @desc entityName
			 */
			this.entityName = getParametersValue(parameters, "entityName", Holder.defaultValues("entityName"));
		
		if("objectDigestInfo" in parameters)
			/**
			 * @type {ObjectDigestInfo}
			 * @desc objectDigestInfo
			 */
			this.objectDigestInfo = getParametersValue(parameters, "objectDigestInfo", Holder.defaultValues("objectDigestInfo"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "baseCertificateID":
				return new IssuerSerial();
			case "entityName":
				return new GeneralNames();
			case "objectDigestInfo":
				return new ObjectDigestInfo();
			default:
				throw new Error(`Invalid member name for Holder class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Holder ::= SEQUENCE {
	 *   baseCertificateID   [0] IssuerSerial OPTIONAL,
	 *       -- the issuer and serial number of
	 *       -- the holder's Public Key Certificate
	 *   entityName          [1] GeneralNames OPTIONAL,
	 *       -- the name of the claimant or role
	 *   objectDigestInfo    [2] ObjectDigestInfo OPTIONAL
	 *       -- used to directly authenticate the holder,
	 *       -- for example, an executable
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [baseCertificateID]
		 * @property {string} [entityName]
		 * @property {string} [objectDigestInfo]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Constructed({
					optional: true,
					name: (names.baseCertificateID || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 0 // [0]
					},
					value: IssuerSerial.schema().valueBlock.value
				}),
				new Constructed({
					optional: true,
					name: (names.entityName || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 1 // [2]
					},
					value: GeneralNames.schema().valueBlock.value
				}),
				new Constructed({
					optional: true,
					name: (names.objectDigestInfo || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 2 // [2]
					},
					value: ObjectDigestInfo.schema().valueBlock.value
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"baseCertificateID",
			"entityName",
			"objectDigestInfo"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			Holder.schema({
				names: {
					baseCertificateID: "baseCertificateID",
					entityName: "entityName",
					objectDigestInfo: "objectDigestInfo"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Holder");
		//endregion
		
		//region Get internal properties from parsed schema
		if("baseCertificateID" in asn1.result)
		{
			this.baseCertificateID = new IssuerSerial({
				schema: new Sequence({
					value: asn1.result.baseCertificateID.valueBlock.value
				})
			});
		}
		
		if("entityName" in asn1.result)
		{
			this.entityName = new GeneralNames({
				schema: new Sequence({
					value: asn1.result.entityName.valueBlock.value
				})
			});
		}
		
		if("objectDigestInfo" in asn1.result)
		{
			this.objectDigestInfo = new ObjectDigestInfo({
				schema: new Sequence({
					value: asn1.result.objectDigestInfo.valueBlock.value
				})
			});
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new Sequence();
		
		if("baseCertificateID" in this)
		{
			result.valueBlock.value.push(new Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 0 // [0]
				},
				value: this.baseCertificateID.toSchema().valueBlock.value
			}));
		}
		
		if("entityName" in this)
		{
			result.valueBlock.value.push(new Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 1 // [1]
				},
				value: this.entityName.toSchema().valueBlock.value
			}));
		}
		
		if("objectDigestInfo" in this)
		{
			result.valueBlock.value.push(new Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 2 // [2]
				},
				value: this.objectDigestInfo.toSchema().valueBlock.value
			}));
		}
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {};
		
		if("baseCertificateID" in this)
			result.baseCertificateID = this.baseCertificateID.toJSON();
		
		if("entityName" in this)
			result.entityName = this.entityName.toJSON();
		
		if("objectDigestInfo" in this)
			result.objectDigestInfo = this.objectDigestInfo.toJSON();
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
class AttributeCertificateInfoV2
{
	//**********************************************************************************
	/**
	 * Constructor for AttributeCertificateInfoV2 class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", AttributeCertificateInfoV2.defaultValues("version"));
		/**
		 * @type {Holder}
		 * @desc holder
		 */
		this.holder = getParametersValue(parameters, "holder", AttributeCertificateInfoV2.defaultValues("holder"));
		/**
		 * @type {GeneralNames|V2Form}
		 * @desc issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", AttributeCertificateInfoV2.defaultValues("issuer"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc signature
		 */
		this.signature = getParametersValue(parameters, "signature", AttributeCertificateInfoV2.defaultValues("signature"));
		/**
		 * @type {Integer}
		 * @desc serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", AttributeCertificateInfoV2.defaultValues("serialNumber"));
		/**
		 * @type {AttCertValidityPeriod}
		 * @desc attrCertValidityPeriod
		 */
		this.attrCertValidityPeriod = getParametersValue(parameters, "attrCertValidityPeriod", AttributeCertificateInfoV2.defaultValues("attrCertValidityPeriod"));
		/**
		 * @type {Array.<Attribute>}
		 * @desc attributes
		 */
		this.attributes = getParametersValue(parameters, "attributes", AttributeCertificateInfoV2.defaultValues("attributes"));
		
		if("issuerUniqueID" in parameters)
			/**
			 * @type {BitString}
			 * @desc issuerUniqueID
			 */
			this.issuerUniqueID = getParametersValue(parameters, "issuerUniqueID", AttributeCertificateInfoV2.defaultValues("issuerUniqueID"));
		
		if("extensions" in parameters)
			/**
			 * @type {Extensions}
			 * @desc extensions
			 */
			this.extensions = getParametersValue(parameters, "extensions", AttributeCertificateInfoV2.defaultValues("extensions"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 1;
			case "holder":
				return new Holder();
			case "issuer":
				return {};
			case "signature":
				return new AlgorithmIdentifier();
			case "serialNumber":
				return new Integer();
			case "attrCertValidityPeriod":
				return new AttCertValidityPeriod();
			case "attributes":
				return [];
			case "issuerUniqueID":
				return new BitString();
			case "extensions":
				return new Extensions();
			default:
				throw new Error(`Invalid member name for AttributeCertificateInfoV2 class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AttributeCertificateInfoV2 ::= SEQUENCE {
	 *   version                 AttCertVersion, -- version is v2
	 *   holder                  Holder,
	 *   issuer                  AttCertIssuer,
	 *   signature               AlgorithmIdentifier,
	 *   serialNumber            CertificateSerialNumber,
	 *   attrCertValidityPeriod  AttCertValidityPeriod,
	 *   attributes              SEQUENCE OF Attribute,
	 *   issuerUniqueID          UniqueIdentifier OPTIONAL,
	 *   extensions              Extensions OPTIONAL
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuer]
		 * @property {string} [serialNumber]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				Holder.schema(names.holder || {}),
				new Choice({
					value: [
						GeneralNames.schema({
							names: {
								blockName: (names.issuer || "")
							}
						}),
						new Constructed({
							name: (names.issuer || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: V2Form.schema().valueBlock.value
						})
					]
				}),
				AlgorithmIdentifier.schema(names.signature || {}),
				new Integer({ name: (names.serialNumber || "") }),
				AttCertValidityPeriod.schema(names.attrCertValidityPeriod || {}),
				new Sequence({
					name: (names.attributes || ""),
					value: [
						new Repeated({
							value: Attribute.schema()
						})
					]
				}),
				new BitString({
					optional: true,
					name: (names.issuerUniqueID || "")
				}),
				Extensions.schema(names.extensions || {}, true)
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"holder",
			"issuer",
			"signature",
			"serialNumber",
			"attrCertValidityPeriod",
			"attributes",
			"issuerUniqueID",
			"extensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AttributeCertificateInfoV2.schema({
				names: {
					version: "version",
					holder: {
						names: {
							blockName: "holder"
						}
					},
					issuer: "issuer",
					signature: {
						names: {
							blockName: "signature"
						}
					},
					serialNumber: "serialNumber",
					attrCertValidityPeriod: {
						names: {
							blockName: "attrCertValidityPeriod"
						}
					},
					attributes: "attributes",
					issuerUniqueID: "issuerUniqueID",
					extensions: {
						names: {
							blockName: "extensions"
						}
					}
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttributeCertificateInfoV2");
		//endregion
		
		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.holder = new Holder({ schema: asn1.result.holder });
		
		switch(asn1.result.issuer.idBlock.tagClass)
		{
			case 3: // V2Form
				this.issuer = new V2Form({
					schema: new Sequence({
						value: asn1.result.issuer.valueBlock.value
					})
				});
				break;
			case 1: // GeneralNames (should not be used)
			default:
				throw new Error("Incorect value for 'issuer' in AttributeCertificateInfoV2");
		}
		
		this.signature = new AlgorithmIdentifier({ schema: asn1.result.signature });
		this.serialNumber = asn1.result.serialNumber;
		this.attrCertValidityPeriod = new AttCertValidityPeriod({ schema: asn1.result.attrCertValidityPeriod });
		this.attributes = Array.from(asn1.result.attributes.valueBlock.value, element => new Attribute({ schema: element }));
		
		if("issuerUniqueID" in asn1.result)
			this.issuerUniqueID = asn1.result.issuerUniqueID;
		
		if("extensions" in asn1.result)
			this.extensions = new Extensions({ schema: asn1.result.extensions });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new Sequence({
			value: [
				new Integer({ value: this.version }),
				this.holder.toSchema(),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: this.issuer.toSchema().valueBlock.value
				}),
				this.signature.toSchema(),
				this.serialNumber,
				this.attrCertValidityPeriod.toSchema(),
				new Sequence({
					value: Array.from(this.attributes, element => element.toSchema())
				})
			]
		});
		
		if("issuerUniqueID" in this)
			result.valueBlock.value.push(this.issuerUniqueID);
		
		if("extensions" in this)
			result.valueBlock.value.push(this.extensions.toSchema());
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {
			version: this.version,
			holder: this.holder.toJSON(),
			issuer: this.issuer.toJSON(),
			signature: this.signature.toJSON(),
			serialNumber: this.serialNumber.toJSON(),
			attrCertValidityPeriod: this.attrCertValidityPeriod.toJSON(),
			attributes: Array.from(this.attributes, element => element.toJSON())
		};
		
		if("issuerUniqueID" in this)
			result.issuerUniqueID = this.issuerUniqueID.toJSON();
		
		if("extensions" in this)
			result.extensions = this.extensions.toJSON();
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
class AttributeCertificateV2
{
	//**********************************************************************************
	/**
	 * Constructor for AttributeCertificateV2 class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AttributeCertificateInfoV2}
		 * @desc acinfo
		 */
		this.acinfo = getParametersValue(parameters, "acinfo", AttributeCertificateV2.defaultValues("acinfo"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", AttributeCertificateV2.defaultValues("signatureAlgorithm"));
		/**
		 * @type {BitString}
		 * @desc signatureValue
		 */
		this.signatureValue = getParametersValue(parameters, "signatureValue", AttributeCertificateV2.defaultValues("signatureValue"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "acinfo":
				return new AttributeCertificateInfoV2();
			case "signatureAlgorithm":
				return new AlgorithmIdentifier();
			case "signatureValue":
				return new BitString();
			default:
				throw new Error(`Invalid member name for AttributeCertificateV2 class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AttributeCertificate ::= SEQUENCE {
	 *   acinfo               AttributeCertificateInfoV2,
	 *   signatureAlgorithm   AlgorithmIdentifier,
	 *   signatureValue       BIT STRING
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {Object} [acinfo]
		 * @property {Object} [signatureAlgorithm]
		 * @property {string} [signatureValue]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				AttributeCertificateInfoV2.schema(names.acinfo || {}),
				AlgorithmIdentifier.schema(names.signatureAlgorithm || {}),
				new BitString({ name: (names.signatureValue || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"acinfo",
			"signatureAlgorithm",
			"signatureValue"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			AttributeCertificateV2.schema({
				names: {
					acinfo: {
						names: {
							blockName: "acinfo"
						}
					},
					signatureAlgorithm: {
						names: {
							blockName: "signatureAlgorithm"
						}
					},
					signatureValue: "signatureValue"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttributeCertificateV2");
		//endregion
		
		//region Get internal properties from parsed schema
		this.acinfo = new AttributeCertificateInfoV2({ schema: asn1.result.acinfo });
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
		this.signatureValue = asn1.result.signatureValue;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		return (new Sequence({
			value: [
				this.acinfo.toSchema(),
				this.signatureAlgorithm.toSchema(),
				this.signatureValue
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			acinfo: this.acinfo.toJSON(),
			signatureAlgorithm: this.signatureAlgorithm.toJSON(),
			signatureValue: this.signatureValue.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class OtherCertificateFormat
{
	//**********************************************************************************
	/**
	 * Constructor for OtherCertificateFormat class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc otherCertFormat
		 */
		this.otherCertFormat = getParametersValue(parameters, "otherCertFormat", OtherCertificateFormat.defaultValues("otherCertFormat"));
		/**
		 * @type {Any}
		 * @desc otherCert
		 */
		this.otherCert = getParametersValue(parameters, "otherCert", OtherCertificateFormat.defaultValues("otherCert"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "otherCertFormat":
				return "";
			case "otherCert":
				return new Any();
			default:
				throw new Error(`Invalid member name for OtherCertificateFormat class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherCertificateFormat ::= SEQUENCE {
	 *    otherCertFormat OBJECT IDENTIFIER,
	 *    otherCert ANY DEFINED BY otherCertFormat }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [otherCertFormat]
		 * @property {string} [otherCert]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.otherCertFormat || "otherCertFormat") }),
				new Any({ name: (names.otherCert || "otherCert") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"otherCertFormat",
			"otherCert"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			OtherCertificateFormat.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherCertificateFormat");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.otherCertFormat }),
				this.otherCert
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			otherCertFormat: this.otherCertFormat
		};

		if(!(this.otherCert instanceof Any))
			object.otherCert = this.otherCert.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class CertificateSet
{
	//**********************************************************************************
	/**
	 * Constructor for CertificateSet class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array}
		 * @desc certificates
		 */
		this.certificates = getParametersValue(parameters, "certificates", CertificateSet.defaultValues("certificates"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "certificates":
				return [];
			default:
				throw new Error(`Invalid member name for Attribute class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CertificateSet ::= SET OF CertificateChoices
	 *
	 * CertificateChoices ::= CHOICE {
	 *    certificate Certificate,
	 *    extendedCertificate [0] IMPLICIT ExtendedCertificate,  -- Obsolete
	 *    v1AttrCert [1] IMPLICIT AttributeCertificateV1,        -- Obsolete
	 *    v2AttrCert [2] IMPLICIT AttributeCertificateV2,
	 *    other [3] IMPLICIT OtherCertificateFormat }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (
			new Set({
				name: (names.blockName || ""),
				value: [
					new Repeated({
						name: (names.certificates || "certificates"),
						value: new Choice({
							value: [
								Certificate.schema(),
								new Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 0 // [0]
									},
									value: [
										new Any()
									]
								}), // JUST A STUB
								new Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 1 // [1]
									},
									value: AttributeCertificateV1.schema().valueBlock.value
								}),
								new Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 2 // [2]
									},
									value: AttributeCertificateV2.schema().valueBlock.value
								}),
								new Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 3 // [3]
									},
									value: OtherCertificateFormat.schema().valueBlock.value
								})
							]
						})
					})
				]
			})
		);
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"certificates"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			CertificateSet.schema()
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertificateSet");
		//endregion
		
		//region Get internal properties from parsed schema
		this.certificates = Array.from(asn1.result.certificates || [], element =>
		{
			const initialTagNumber = element.idBlock.tagNumber;

			if(element.idBlock.tagClass === 1)
				return new Certificate({ schema: element });
			
			//region Making "Sequence" from "Constructed" value
			const elementSequence = new Sequence({
				value: element.valueBlock.value
			});
			//endregion

			switch(initialTagNumber)
			{
				case 1:
					return new AttributeCertificateV1({ schema: elementSequence });
				case 2:
					return new AttributeCertificateV2({ schema: elementSequence });
				case 3:
					return new OtherCertificateFormat({ schema: elementSequence });
				case 0:
				default:
			}
			
			return element;
		});
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Set({
			value: Array.from(this.certificates, element =>
			{
				switch(true)
				{
					case (element instanceof Certificate):
						return element.toSchema();
					case (element instanceof AttributeCertificateV1):
						return new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 1 // [1]
							},
							value: element.toSchema().valueBlock.value
						});
					case (element instanceof AttributeCertificateV2):
						return new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 2 // [2]
							},
							value: element.toSchema().valueBlock.value
						});
					case (element instanceof OtherCertificateFormat):
						return new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 3 // [3]
							},
							value: element.toSchema().valueBlock.value
						});
					default:
				}
				
				return element;
			})
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			certificates: Array.from(this.certificates, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5280
 */
class RevokedCertificate
{
	//**********************************************************************************
	/**
	 * Constructor for RevokedCertificate class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Integer}
		 * @desc userCertificate
		 */
		this.userCertificate = getParametersValue(parameters, "userCertificate", RevokedCertificate.defaultValues("userCertificate"));
		/**
		 * @type {Time}
		 * @desc revocationDate
		 */
		this.revocationDate = getParametersValue(parameters, "revocationDate", RevokedCertificate.defaultValues("revocationDate"));

		if("crlEntryExtensions" in parameters)
			/**
			 * @type {Extensions}
			 * @desc crlEntryExtensions
			 */
			this.crlEntryExtensions = getParametersValue(parameters, "crlEntryExtensions", RevokedCertificate.defaultValues("crlEntryExtensions"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "userCertificate":
				return new Integer();
			case "revocationDate":
				return new Time();
			case "crlEntryExtensions":
				return new Extensions();
			default:
				throw new Error(`Invalid member name for RevokedCertificate class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * revokedCertificates     SEQUENCE OF SEQUENCE  {
     *        userCertificate         CertificateSerialNumber,
     *        revocationDate          Time,
     *        crlEntryExtensions      Extensions OPTIONAL
     *                                 -- if present, version MUST be v2
     *                             }  OPTIONAL,
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [userCertificate]
		 * @property {string} [revocationDate]
		 * @property {string} [crlEntryExtensions]
		 */
		const names = getParametersValue(parameters, "names", {});

		return new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.userCertificate || "userCertificate") }),
				Time.schema({
					names: {
						utcTimeName: (names.revocationDate || "revocationDate"),
						generalTimeName: (names.revocationDate || "revocationDate")
					}
				}),
				Extensions.schema({
					names: {
						blockName: (names.crlEntryExtensions || "crlEntryExtensions")
					}
				}, true)
			]
		});
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"userCertificate",
			"revocationDate",
			"crlEntryExtensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RevokedCertificate.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RevokedCertificate");
		//endregion

		//region Get internal properties from parsed schema
		this.userCertificate = asn1.result.userCertificate;
		this.revocationDate = new Time({ schema: asn1.result.revocationDate });

		if("crlEntryExtensions" in asn1.result)
			this.crlEntryExtensions = new Extensions({ schema: asn1.result.crlEntryExtensions });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [
			this.userCertificate,
			this.revocationDate.toSchema()
		];

		if("crlEntryExtensions" in this)
			outputArray.push(this.crlEntryExtensions.toSchema());
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			userCertificate: this.userCertificate.toJSON(),
			revocationDate: this.revocationDate.toJSON
		};

		if("crlEntryExtensions" in this)
			object.crlEntryExtensions = this.crlEntryExtensions.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
function tbsCertList(parameters = {})
{
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
	const names = getParametersValue(parameters, "names", {});
	
	return (new Sequence({
		name: (names.blockName || "tbsCertList"),
		value: [
			new Integer({
				optional: true,
				name: (names.tbsCertListVersion || "tbsCertList.version"),
				value: 2
			}), // EXPLICIT integer value (v2)
			AlgorithmIdentifier.schema(names.signature || {
				names: {
					blockName: "tbsCertList.signature"
				}
			}),
			RelativeDistinguishedNames.schema(names.issuer || {
				names: {
					blockName: "tbsCertList.issuer"
				}
			}),
			Time.schema(names.tbsCertListThisUpdate || {
				names: {
					utcTimeName: "tbsCertList.thisUpdate",
					generalTimeName: "tbsCertList.thisUpdate"
				}
			}),
			Time.schema(names.tbsCertListNextUpdate || {
				names: {
					utcTimeName: "tbsCertList.nextUpdate",
					generalTimeName: "tbsCertList.nextUpdate"
				}
			}, true),
			new Sequence({
				optional: true,
				value: [
					new Repeated({
						name: (names.tbsCertListRevokedCertificates || "tbsCertList.revokedCertificates"),
						value: new Sequence({
							value: [
								new Integer(),
								Time.schema(),
								Extensions.schema({}, true)
							]
						})
					})
				]
			}),
			new Constructed({
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
	}));
}
//**************************************************************************************
/**
 * Class from RFC5280
 */
class CertificateRevocationList {
	//**********************************************************************************
	/**
	 * Constructor for Attribute class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {ArrayBuffer}
		 * @desc tbs
		 */
		this.tbs = getParametersValue(parameters, "tbs", CertificateRevocationList.defaultValues("tbs"));
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", CertificateRevocationList.defaultValues("version"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc signature
		 */
		this.signature = getParametersValue(parameters, "signature", CertificateRevocationList.defaultValues("signature"));
		/**
		 * @type {RelativeDistinguishedNames}
		 * @desc issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", CertificateRevocationList.defaultValues("issuer"));
		/**
		 * @type {Time}
		 * @desc thisUpdate
		 */
		this.thisUpdate = getParametersValue(parameters, "thisUpdate", CertificateRevocationList.defaultValues("thisUpdate"));
		
		if("nextUpdate" in parameters)
			/**
			 * @type {Time}
			 * @desc nextUpdate
			 */
			this.nextUpdate = getParametersValue(parameters, "nextUpdate", CertificateRevocationList.defaultValues("nextUpdate"));
		
		if("revokedCertificates" in parameters)
			/**
			 * @type {Array.<RevokedCertificate>}
			 * @desc revokedCertificates
			 */
			this.revokedCertificates = getParametersValue(parameters, "revokedCertificates", CertificateRevocationList.defaultValues("revokedCertificates"));
		
		if("crlExtensions" in parameters)
			/**
			 * @type {Extensions}
			 * @desc crlExtensions
			 */
			this.crlExtensions = getParametersValue(parameters, "crlExtensions", CertificateRevocationList.defaultValues("crlExtensions"));
		
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", CertificateRevocationList.defaultValues("signatureAlgorithm"));
		/**
		 * @type {BitString}
		 * @desc signatureValue
		 */
		this.signatureValue = getParametersValue(parameters, "signatureValue", CertificateRevocationList.defaultValues("signatureValue"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
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
				throw new Error(`Invalid member name for CertificateRevocationList class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CertificateList  ::=  SEQUENCE  {
	 *    tbsCertList          TBSCertList,
	 *    signatureAlgorithm   AlgorithmIdentifier,
	 *    signatureValue       BIT STRING  }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [signatureAlgorithm]
		 * @property {string} [signatureValue]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || "CertificateList"),
			value: [
				tbsCertList(parameters),
				AlgorithmIdentifier.schema(names.signatureAlgorithm || {
					names: {
						blockName: "signatureAlgorithm"
					}
				}),
				new BitString({ name: (names.signatureValue || "signatureValue") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"tbsCertList",
			"tbsCertList.version",
			"tbsCertList.signature",
			"tbsCertList.issuer",
			"tbsCertList.thisUpdate",
			"tbsCertList.nextUpdate",
			"tbsCertList.revokedCertificates",
			"tbsCertList.extensions",
			"signatureAlgorithm",
			"signatureValue"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			CertificateRevocationList.schema()
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertificateRevocationList");
		//endregion
		
		//region Get internal properties from parsed schema
		// noinspection JSUnresolvedVariable
		this.tbs = asn1.result.tbsCertList.valueBeforeDecode;
		
		if("tbsCertList.version" in asn1.result)
			this.version = asn1.result["tbsCertList.version"].valueBlock.valueDec;
		this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertList.signature"] });
		this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertList.issuer"] });
		this.thisUpdate = new Time({ schema: asn1.result["tbsCertList.thisUpdate"] });
		if("tbsCertList.nextUpdate" in asn1.result)
			this.nextUpdate = new Time({ schema: asn1.result["tbsCertList.nextUpdate"] });
		if("tbsCertList.revokedCertificates" in asn1.result)
			this.revokedCertificates = Array.from(asn1.result["tbsCertList.revokedCertificates"], element => new RevokedCertificate({ schema: element }));
		if("tbsCertList.extensions" in asn1.result)
			this.crlExtensions = new Extensions({ schema: asn1.result["tbsCertList.extensions"] });
		
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
		this.signatureValue = asn1.result.signatureValue;
		//endregion
	}
	//**********************************************************************************
	encodeTBS()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if(this.version !== CertificateRevocationList.defaultValues("version"))
			outputArray.push(new Integer({ value: this.version }));
		
		outputArray.push(this.signature.toSchema());
		outputArray.push(this.issuer.toSchema());
		outputArray.push(this.thisUpdate.toSchema());
		
		if("nextUpdate" in this)
			outputArray.push(this.nextUpdate.toSchema());
		
		if("revokedCertificates" in this)
		{
			outputArray.push(new Sequence({
				value: Array.from(this.revokedCertificates, element => element.toSchema())
			}));
		}
		
		if("crlExtensions" in this)
		{
			outputArray.push(new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					this.crlExtensions.toSchema()
				]
			}));
		}
		//endregion
		
		return (new Sequence({
			value: outputArray
		}));
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema(encodeFlag = false)
	{
		//region Decode stored TBS value
		let tbsSchema;
		
		if(encodeFlag === false)
		{
			if(this.tbs.length === 0) // No stored TBS part
				return CertificateRevocationList.schema();
			
			tbsSchema = fromBER(this.tbs).result;
		}
		//endregion
		//region Create TBS schema via assembling from TBS parts
		else
			tbsSchema = this.encodeTBS();
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				tbsSchema,
				this.signatureAlgorithm.toSchema(),
				this.signatureValue
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			tbs: bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
			signature: this.signature.toJSON(),
			issuer: this.issuer.toJSON(),
			thisUpdate: this.thisUpdate.toJSON(),
			signatureAlgorithm: this.signatureAlgorithm.toJSON(),
			signatureValue: this.signatureValue.toJSON()
		};
		
		if(this.version !== CertificateRevocationList.defaultValues("version"))
			object.version = this.version;
		
		if("nextUpdate" in this)
			object.nextUpdate = this.nextUpdate.toJSON();
		
		if("revokedCertificates" in this)
			object.revokedCertificates = Array.from(this.revokedCertificates, element => element.toJSON());
		
		if("crlExtensions" in this)
			object.crlExtensions = this.crlExtensions.toJSON();
		
		return object;
	}
	//**********************************************************************************
	isCertificateRevoked(certificate)
	{
		//region Check that issuer of the input certificate is the same with issuer of this CRL
		if(this.issuer.isEqual(certificate.issuer) === false)
			return false;
		//endregion
		
		//region Check that there are revoked certificates in this CRL
		if(("revokedCertificates" in this) === false)
			return false;
		//endregion
		
		//region Search for input certificate in revoked certificates array
		for(const revokedCertificate of this.revokedCertificates)
		{
			if(revokedCertificate.userCertificate.isEqual(certificate.serialNumber))
				return true;
		}
		//endregion
		
		return false;
	}
	//**********************************************************************************
	/**
	 * Make a signature for existing CRL data
	 * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
	 * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
	 */
	sign(privateKey, hashAlgorithm = "SHA-1")
	{
		//region Initial checking
		//region Get a private key from function parameter
		if(typeof privateKey === "undefined")
			return Promise.reject("Need to provide a private key for signing");
		//endregion
		//endregion
		
		//region Initial variables
		let sequence = Promise.resolve();
		let parameters;
		
		const engine = getEngine();
		//endregion
		
		//region Get a "default parameters" for current algorithm and set correct signature algorithm
		sequence = sequence.then(() => engine.subtle.getSignatureParameters(privateKey, hashAlgorithm));
		
		sequence = sequence.then(result =>
		{
			parameters = result.parameters;
			this.signature = result.signatureAlgorithm;
			this.signatureAlgorithm = result.signatureAlgorithm;
		});
		//endregion
		
		//region Create TBS data for signing
		sequence = sequence.then(() =>
		{
			this.tbs = this.encodeTBS().toBER(false);
		});
		//endregion
		
		//region Signing TBS data on provided private key
		sequence = sequence.then(() => engine.subtle.signWithPrivateKey(this.tbs, privateKey, parameters));
		
		sequence = sequence.then(result =>
		{
			this.signatureValue = new BitString({ valueHex: result });
		});
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Verify existing signature
	 * @param {{[issuerCertificate]: Object, [publicKeyInfo]: Object}} parameters
	 * @returns {*}
	 */
	verify(parameters = {})
	{
		//region Global variables
		let sequence = Promise.resolve();
		
		let subjectPublicKeyInfo = -1;
		
		const engine = getEngine();
		//endregion
		
		//region Get information about CRL issuer certificate
		if("issuerCertificate" in parameters) // "issuerCertificate" must be of type "Certificate"
		{
			subjectPublicKeyInfo = parameters.issuerCertificate.subjectPublicKeyInfo;
			
			// The CRL issuer name and "issuerCertificate" subject name are not equal
			if(this.issuer.isEqual(parameters.issuerCertificate.subject) === false)
				return Promise.resolve(false);
		}
		
		//region In case if there is only public key during verification
		if("publicKeyInfo" in parameters)
			subjectPublicKeyInfo = parameters.publicKeyInfo; // Must be of type "PublicKeyInfo"
		//endregion
		
		if(("subjectPublicKey" in subjectPublicKeyInfo) === false)
			return Promise.reject("Issuer's certificate must be provided as an input parameter");
		//endregion
		
		//region Check the CRL for unknown critical extensions
		if("crlExtensions" in this)
		{
			for(const extension of this.crlExtensions.extensions)
			{
				if(extension.critical)
				{
					// We can not be sure that unknown extension has no value for CRL signature
					if(("parsedValue" in extension) === false)
						return Promise.resolve(false);
				}
			}
		}
		//endregion
		
		sequence = sequence.then(() => engine.subtle.verifyWithPublicKey(this.tbs, this.signatureValue, subjectPublicKeyInfo, this.signatureAlgorithm));
		
		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class OtherRevocationInfoFormat
{
	//**********************************************************************************
	/**
	 * Constructor for OtherRevocationInfoFormat class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc otherRevInfoFormat
		 */
		this.otherRevInfoFormat = getParametersValue(parameters, "otherRevInfoFormat", OtherRevocationInfoFormat.defaultValues("otherRevInfoFormat"));
		/**
		 * @type {Any}
		 * @desc otherRevInfo
		 */
		this.otherRevInfo = getParametersValue(parameters, "otherRevInfo", OtherRevocationInfoFormat.defaultValues("otherRevInfo"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "otherRevInfoFormat":
				return "";
			case "otherRevInfo":
				return new Any();
			default:
				throw new Error(`Invalid member name for OtherRevocationInfoFormat class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherCertificateFormat ::= SEQUENCE {
	 *    otherRevInfoFormat OBJECT IDENTIFIER,
	 *    otherRevInfo ANY DEFINED BY otherCertFormat }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [otherRevInfoFormat]
		 * @property {string} [otherRevInfo]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.otherRevInfoFormat || "otherRevInfoFormat") }),
				new Any({ name: (names.otherRevInfo || "otherRevInfo") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"otherRevInfoFormat",
			"otherRevInfo"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			OtherRevocationInfoFormat.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherRevocationInfoFormat");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.otherRevInfoFormat }),
				this.otherRevInfo
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			otherRevInfoFormat: this.otherRevInfoFormat
		};

		if(!(this.otherRevInfo instanceof Any))
			object.otherRevInfo = this.otherRevInfo.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class RevocationInfoChoices 
{
	//**********************************************************************************
	/**
	 * Constructor for RevocationInfoChoices class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<CertificateRevocationList>}
		 * @desc crls
		 */
		this.crls = getParametersValue(parameters, "crls", RevocationInfoChoices.defaultValues("crls"));
		/**
		 * @type {Array.<OtherRevocationInfoFormat>}
		 * @desc otherRevocationInfos
		 */
		this.otherRevocationInfos = getParametersValue(parameters, "otherRevocationInfos", RevocationInfoChoices.defaultValues("otherRevocationInfos"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "crls":
				return [];
			case "otherRevocationInfos":
				return [];
			default:
				throw new Error(`Invalid member name for RevocationInfoChoices class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RevocationInfoChoices ::= SET OF RevocationInfoChoice
	 *
	 * RevocationInfoChoice ::= CHOICE {
	 *    crl CertificateList,
	 *    other [1] IMPLICIT OtherRevocationInfoFormat }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [crls]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Set({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.crls || ""),
					value: new Choice({
						value: [
							CertificateRevocationList.schema(),
							new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: [
									new ObjectIdentifier(),
									new Any()
								]
							})
						]
					})
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"crls"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RevocationInfoChoices.schema({
				names: {
					crls: "crls"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RevocationInfoChoices");
		//endregion
		
		//region Get internal properties from parsed schema
		for(const element of asn1.result.crls)
		{
			if(element.idBlock.tagClass === 1)
				this.crls.push(new CertificateRevocationList({ schema: element }));
			else
				this.otherRevocationInfos.push(new OtherRevocationInfoFormat({ schema: element }));
		}
		
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output set
		const outputArray = [];
		
		outputArray.push(...Array.from(this.crls, element => element.toSchema()));
		
		outputArray.push(...Array.from(this.otherRevocationInfos, element =>
		{
			const schema = element.toSchema();
			
			schema.idBlock.tagClass = 3;
			schema.idBlock.tagNumber = 1;
			
			return schema;
		}));
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Set({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			crls: Array.from(this.crls, element => element.toJSON()),
			otherRevocationInfos: Array.from(this.otherRevocationInfos, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class OriginatorInfo
{
	//**********************************************************************************
	/**
	 * Constructor for OriginatorInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("certs" in parameters)
			/**
			 * @type {CertificateSet}
			 * @desc certs
			 */
			this.certs = getParametersValue(parameters, "certs", OriginatorInfo.defaultValues("certs"));

		if("crls" in parameters)
			/**
			 * @type {RevocationInfoChoices}
			 * @desc crls
			 */
			this.crls = getParametersValue(parameters, "crls", OriginatorInfo.defaultValues("crls"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "certs":
				return new CertificateSet();
			case "crls":
				return new RevocationInfoChoices();
			default:
				throw new Error(`Invalid member name for OriginatorInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "certs":
				return (memberValue.certificates.length === 0);
			case "crls":
				return ((memberValue.crls.length === 0) && (memberValue.otherRevocationInfos.length === 0));
			default:
				throw new Error(`Invalid member name for OriginatorInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OriginatorInfo ::= SEQUENCE {
	 *    certs [0] IMPLICIT CertificateSet OPTIONAL,
	 *    crls [1] IMPLICIT RevocationInfoChoices OPTIONAL }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [certs]
		 * @property {string} [crls]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Constructed({
					name: (names.certs || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: CertificateSet.schema().valueBlock.value
				}),
				new Constructed({
					name: (names.crls || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: RevocationInfoChoices.schema().valueBlock.value
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"certs",
			"crls"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			OriginatorInfo.schema({
				names: {
					certs: "certs",
					crls: "crls"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OriginatorInfo");
		//endregion

		//region Get internal properties from parsed schema
		if("certs" in asn1.result)
		{
			this.certs = new CertificateSet({
				schema: new Set({
					value: asn1.result.certs.valueBlock.value
				})
			});
		}

		if("crls" in asn1.result)
		{
			this.crls = new RevocationInfoChoices({
				schema: new Set({
					value: asn1.result.crls.valueBlock.value
				})
			});
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const sequenceValue = [];

		if("certs" in this)
		{
			sequenceValue.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: this.certs.toSchema().valueBlock.value
			}));
		}

		if("crls" in this)
		{
			sequenceValue.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: this.crls.toSchema().valueBlock.value
			}));
		}

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: sequenceValue
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};

		if("certs" in this)
			object.certs = this.certs.toJSON();

		if("crls" in this)
			object.crls = this.crls.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class IssuerAndSerialNumber
{
	//**********************************************************************************
	/**
	 * Constructor for IssuerAndSerialNumber class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {RelativeDistinguishedNames}
		 * @desc issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", IssuerAndSerialNumber.defaultValues("issuer"));
		/**
		 * @type {Integer}
		 * @desc serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", IssuerAndSerialNumber.defaultValues("serialNumber"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "issuer":
				return new RelativeDistinguishedNames();
			case "serialNumber":
				return new Integer();
			default:
				throw new Error(`Invalid member name for IssuerAndSerialNumber class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * IssuerAndSerialNumber ::= SEQUENCE {
	 *    issuer Name,
	 *    serialNumber CertificateSerialNumber }
	 *
	 * CertificateSerialNumber ::= INTEGER
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuer]
		 * @property {string} [serialNumber]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				RelativeDistinguishedNames.schema(names.issuer || {}),
				new Integer({ name: (names.serialNumber || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"issuer",
			"serialNumber"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			IssuerAndSerialNumber.schema({
				names: {
					issuer: {
						names: {
							blockName: "issuer"
						}
					},
					serialNumber: "serialNumber"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for IssuerAndSerialNumber");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				this.issuer.toSchema(),
				this.serialNumber
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			issuer: this.issuer.toJSON(),
			serialNumber: this.serialNumber.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class RecipientIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientIdentifier class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc variant
		 */
		this.variant = getParametersValue(parameters, "variant", RecipientIdentifier.defaultValues("variant"));

		if("value" in parameters)
			/**
			 * @type {*}
			 * @desc value
			 */
			this.value = getParametersValue(parameters, "value", RecipientIdentifier.defaultValues("value"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "variant":
				return (-1);
			case "value":
				return {};
			default:
				throw new Error(`Invalid member name for RecipientIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "variant":
				return (memberValue === (-1));
			case "values":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for RecipientIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientIdentifier ::= CHOICE {
	 *    issuerAndSerialNumber IssuerAndSerialNumber,
	 *    subjectKeyIdentifier [0] SubjectKeyIdentifier }
	 *
	 * SubjectKeyIdentifier ::= OCTET STRING
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Choice({
			value: [
				IssuerAndSerialNumber.schema({
					names: {
						blockName: (names.blockName || "")
					}
				}),
				new Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new OctetString()]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"blockName"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RecipientIdentifier.schema({
				names: {
					blockName: "blockName"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientIdentifier");
		//endregion

		//region Get internal properties from parsed schema
		if(asn1.result.blockName.idBlock.tagClass === 1)
		{
			this.variant = 1;
			this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
		}
		else
		{
			this.variant = 2;
			this.value = asn1.result.blockName.valueBlock.value[0];
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		switch(this.variant)
		{
			case 1:
				return this.value.toSchema();
			case 2:
				return new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [this.value]
				});
			default:
				return new Any();
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			variant: this.variant
		};

		if((this.variant === 1) || (this.variant === 2))
			_object.value = this.value.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class KeyTransRecipientInfo
{
	//**********************************************************************************
	/**
	 * Constructor for KeyTransRecipientInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", KeyTransRecipientInfo.defaultValues("version"));
		/**
		 * @type {RecipientIdentifier}
		 * @desc rid
		 */
		this.rid = getParametersValue(parameters, "rid", KeyTransRecipientInfo.defaultValues("rid"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc keyEncryptionAlgorithm
		 */
		this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", KeyTransRecipientInfo.defaultValues("keyEncryptionAlgorithm"));
		/**
		 * @type {OctetString}
		 * @desc encryptedKey
		 */
		this.encryptedKey = getParametersValue(parameters, "encryptedKey", KeyTransRecipientInfo.defaultValues("encryptedKey"));
		/**
		 * @type {Certificate}
		 * @desc recipientCertificate For some reasons we need to store recipient's certificate here
		 */
		this.recipientCertificate = getParametersValue(parameters, "recipientCertificate", KeyTransRecipientInfo.defaultValues("recipientCertificate"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return (-1);
			case "rid":
				return {};
			case "keyEncryptionAlgorithm":
				return new AlgorithmIdentifier();
			case "encryptedKey":
				return new OctetString();
			case "recipientCertificate":
				return new Certificate();
			default:
				throw new Error(`Invalid member name for KeyTransRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "version":
				return (memberValue === KeyTransRecipientInfo.defaultValues("version"));
			case "rid":
				return (Object.keys(memberValue).length === 0);
			case "keyEncryptionAlgorithm":
			case "encryptedKey":
				return memberValue.isEqual(KeyTransRecipientInfo.defaultValues(memberName));
			case "recipientCertificate":
				return false; // For now we do not need to compare any values with the "recipientCertificate"
			default:
				throw new Error(`Invalid member name for KeyTransRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * KeyTransRecipientInfo ::= SEQUENCE {
	 *    version CMSVersion,  -- always set to 0 or 2
	 *    rid RecipientIdentifier,
	 *    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
	 *    encryptedKey EncryptedKey }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [rid]
		 * @property {string} [keyEncryptionAlgorithm]
		 * @property {string} [encryptedKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				RecipientIdentifier.schema(names.rid || {}),
				AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}),
				new OctetString({ name: (names.encryptedKey || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"rid",
			"keyEncryptionAlgorithm",
			"encryptedKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			KeyTransRecipientInfo.schema({
				names: {
					version: "version",
					rid: {
						names: {
							blockName: "rid"
						}
					},
					keyEncryptionAlgorithm: {
						names: {
							blockName: "keyEncryptionAlgorithm"
						}
					},
					encryptedKey: "encryptedKey"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for KeyTransRecipientInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;

		if(asn1.result.rid.idBlock.tagClass === 3)
			this.rid = asn1.result.rid.valueBlock.value[0]; // SubjectKeyIdentifier
		else
			this.rid = new IssuerAndSerialNumber({ schema: asn1.result.rid });

		this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
		this.encryptedKey = asn1.result.encryptedKey;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence 
		const outputArray = [];
		
		if(this.rid instanceof IssuerAndSerialNumber)
		{
			this.version = 0;
			
			outputArray.push(new Integer({ value: this.version }));
			outputArray.push(this.rid.toSchema());
		}
		else
		{
			this.version = 2;
			
			outputArray.push(new Integer({ value: this.version }));
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [this.rid]
			}));
		}
		
		outputArray.push(this.keyEncryptionAlgorithm.toSchema());
		outputArray.push(this.encryptedKey);
		//endregion 
		
		//region Construct and return new ASN.1 schema for this object 
		return (new Sequence({
			value: outputArray
		}));
		//endregion 
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			version: this.version,
			rid: this.rid.toJSON(),
			keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
			encryptedKey: this.encryptedKey.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class OriginatorPublicKey
{
	//**********************************************************************************
	/**
	 * Constructor for OriginatorPublicKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc algorithm
		 */
		this.algorithm = getParametersValue(parameters, "algorithm", OriginatorPublicKey.defaultValues("algorithm"));
		/**
		 * @type {BitString}
		 * @desc publicKey
		 */
		this.publicKey = getParametersValue(parameters, "publicKey", OriginatorPublicKey.defaultValues("publicKey"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "algorithm":
				return new AlgorithmIdentifier();
			case "publicKey":
				return new BitString();
			default:
				throw new Error(`Invalid member name for OriginatorPublicKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "algorithm":
			case "publicKey":
				return (memberValue.isEqual(OriginatorPublicKey.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for OriginatorPublicKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OriginatorPublicKey ::= SEQUENCE {
	 *    algorithm AlgorithmIdentifier,
	 *    publicKey BIT STRING }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [algorithm]
		 * @property {string} [publicKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				AlgorithmIdentifier.schema(names.algorithm || {}),
				new BitString({ name: (names.publicKey || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"algorithm",
			"publicKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			OriginatorPublicKey.schema({
				names: {
					algorithm: {
						names: {
							blockName: "algorithm"
						}
					},
					publicKey: "publicKey"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OriginatorPublicKey");
		//endregion

		//region Get internal properties from parsed schema
		this.algorithm = new AlgorithmIdentifier({ schema: asn1.result.algorithm });
		this.publicKey = asn1.result.publicKey;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				this.algorithm.toSchema(),
				this.publicKey
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			algorithm: this.algorithm.toJSON(),
			publicKey: this.publicKey.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class OriginatorIdentifierOrKey 
{
	//**********************************************************************************
	/**
	 * Constructor for OriginatorIdentifierOrKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc variant
		 */
		this.variant = getParametersValue(parameters, "variant", OriginatorIdentifierOrKey.defaultValues("variant"));

		if("value" in parameters)
			/**
			 * @type {IssuerAndSerialNumber|OctetString|OriginatorPublicKey}
			 * @desc value
			 */
			this.value = getParametersValue(parameters, "value", OriginatorIdentifierOrKey.defaultValues("value"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "variant":
				return (-1);
			case "value":
				return {};
			default:
				throw new Error(`Invalid member name for OriginatorIdentifierOrKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "variant":
				return (memberValue === (-1));
			case "value":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for OriginatorIdentifierOrKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OriginatorIdentifierOrKey ::= CHOICE {
	 *    issuerAndSerialNumber IssuerAndSerialNumber,
	 *    subjectKeyIdentifier [0] SubjectKeyIdentifier,
	 *    originatorKey [1] OriginatorPublicKey }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Choice({
			value: [
				IssuerAndSerialNumber.schema({
					names: {
						blockName: (names.blockName || "")
					}
				}),
				new Primitive({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					name: (names.blockName || "")
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					name: (names.blockName || ""),
					value: OriginatorPublicKey.schema().valueBlock.value
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"blockName"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			OriginatorIdentifierOrKey.schema({
				names: {
					blockName: "blockName"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OriginatorIdentifierOrKey");
		//endregion

		//region Get internal properties from parsed schema
		if(asn1.result.blockName.idBlock.tagClass === 1)
		{
			this.variant = 1;
			this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
		}
		else
		{
			if(asn1.result.blockName.idBlock.tagNumber === 0)
			{
				//region Create "OCTETSTRING" from "ASN1_PRIMITIVE"
				asn1.result.blockName.idBlock.tagClass = 1; // UNIVERSAL
				asn1.result.blockName.idBlock.tagNumber = 4; // OCTETSTRING
				//endregion

				this.variant = 2;
				this.value = asn1.result.blockName;
			}
			else
			{
				this.variant = 3;
				this.value = new OriginatorPublicKey({
					schema: new Sequence({
						value: asn1.result.blockName.valueBlock.value
					})
				});
			}
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		switch(this.variant)
		{
			case 1:
				return this.value.toSchema();
			case 2:
				this.value.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
				this.value.idBlock.tagNumber = 0; // [0]

				return this.value;
			case 3:
				{
					const _schema = this.value.toSchema();

					_schema.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					_schema.idBlock.tagNumber = 1; // [1]

					return _schema;
				}
			default:
				return new Any();
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			variant: this.variant
		};

		if((this.variant === 1) || (this.variant === 2) || (this.variant === 3))
			_object.value = this.value.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class OtherKeyAttribute
{
	//**********************************************************************************
	/**
	 * Constructor for OtherKeyAttribute class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc keyAttrId
		 */
		this.keyAttrId = getParametersValue(parameters, "keyAttrId", OtherKeyAttribute.defaultValues("keyAttrId"));

		if("keyAttr" in parameters)
			/**
			 * @type {*}
			 * @desc keyAttr
			 */
			this.keyAttr = getParametersValue(parameters, "keyAttr", OtherKeyAttribute.defaultValues("keyAttr"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "keyAttrId":
				return "";
			case "keyAttr":
				return {};
			default:
				throw new Error(`Invalid member name for OtherKeyAttribute class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "keyAttrId":
				return (memberValue === "");
			case "keyAttr":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for OtherKeyAttribute class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherKeyAttribute ::= SEQUENCE {
	 *    keyAttrId OBJECT IDENTIFIER,
	 *    keyAttr ANY DEFINED BY keyAttrId OPTIONAL }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [optional]
		 * @property {string} [keyAttrId]
		 * @property {string} [keyAttr]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			optional: (names.optional || true),
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.keyAttrId || "") }),
				new Any({
					optional: true,
					name: (names.keyAttr || "")
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"keyAttrId",
			"keyAttr"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			OtherKeyAttribute.schema({
				names: {
					keyAttrId: "keyAttrId",
					keyAttr: "keyAttr"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherKeyAttribute");
		//endregion

		//region Get internal properties from parsed schema
		this.keyAttrId = asn1.result.keyAttrId.valueBlock.toString();

		if("keyAttr" in asn1.result)
			this.keyAttr = asn1.result.keyAttr;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];

		outputArray.push(new ObjectIdentifier({ value: this.keyAttrId }));

		if("keyAttr" in this)
			outputArray.push(this.keyAttr);
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			keyAttrId: this.keyAttrId
		};

		if("keyAttr" in this)
			_object.keyAttr = this.keyAttr.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class RecipientKeyIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientKeyIdentifier class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {OctetString}
		 * @desc subjectKeyIdentifier
		 */
		this.subjectKeyIdentifier = getParametersValue(parameters, "subjectKeyIdentifier", RecipientKeyIdentifier.defaultValues("subjectKeyIdentifier"));

		if("date" in parameters)
			/**
			 * @type {GeneralizedTime}
			 * @desc date
			 */
			this.date = getParametersValue(parameters, "date", RecipientKeyIdentifier.defaultValues("date"));

		if("other" in parameters)
			/**
			 * @type {OtherKeyAttribute}
			 * @desc other
			 */
			this.other = getParametersValue(parameters, "other", RecipientKeyIdentifier.defaultValues("other"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "subjectKeyIdentifier":
				return new OctetString();
			case "date":
				return new GeneralizedTime();
			case "other":
				return new OtherKeyAttribute();
			default:
				throw new Error(`Invalid member name for RecipientKeyIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "subjectKeyIdentifier":
				return (memberValue.isEqual(RecipientKeyIdentifier.defaultValues("subjectKeyIdentifier")));
			case "date":
				// noinspection OverlyComplexBooleanExpressionJS
				return ((memberValue.year === 0) &&
				(memberValue.month === 0) &&
				(memberValue.day === 0) &&
				(memberValue.hour === 0) &&
				(memberValue.minute === 0) &&
				(memberValue.second === 0) &&
				(memberValue.millisecond === 0));
			case "other":
				return ((memberValue.keyAttrId === "") && (("keyAttr" in memberValue) === false));
			default:
				throw new Error(`Invalid member name for RecipientKeyIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientKeyIdentifier ::= SEQUENCE {
	 *    subjectKeyIdentifier SubjectKeyIdentifier,
	 *    date GeneralizedTime OPTIONAL,
	 *    other OtherKeyAttribute OPTIONAL }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [type]
		 * @property {string} [setName]
		 * @property {string} [values]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new OctetString({ name: (names.subjectKeyIdentifier || "") }),
				new GeneralizedTime({
					optional: true,
					name: (names.date || "")
				}),
				OtherKeyAttribute.schema(names.other || {})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"subjectKeyIdentifier",
			"date",
			"other"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RecipientKeyIdentifier.schema({
				names: {
					subjectKeyIdentifier: "subjectKeyIdentifier",
					date: "date",
					other: {
						names: {
							blockName: "other"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientKeyIdentifier");
		//endregion

		//region Get internal properties from parsed schema
		this.subjectKeyIdentifier = asn1.result.subjectKeyIdentifier;

		if("date" in asn1.result)
			this.date = asn1.result.date;

		if("other" in asn1.result)
			this.other = new OtherKeyAttribute({ schema: asn1.result.other });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];

		outputArray.push(this.subjectKeyIdentifier);

		if("date" in this)
			outputArray.push(this.date);

		if("other" in this)
			outputArray.push(this.other.toSchema());
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			subjectKeyIdentifier: this.subjectKeyIdentifier.toJSON()
		};

		if("date" in this)
			_object.date = this.date;

		if("other" in this)
			_object.other = this.other.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class KeyAgreeRecipientIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for KeyAgreeRecipientIdentifier class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc variant
		 */
		this.variant = getParametersValue(parameters, "variant", KeyAgreeRecipientIdentifier.defaultValues("variant"));
		/**
		 * @type {*}
		 * @desc values
		 */
		this.value = getParametersValue(parameters, "value", KeyAgreeRecipientIdentifier.defaultValues("value"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "variant":
				return (-1);
			case "value":
				return {};
			default:
				throw new Error(`Invalid member name for KeyAgreeRecipientIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "variant":
				return (memberValue === (-1));
			case "value":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for KeyAgreeRecipientIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * KeyAgreeRecipientIdentifier ::= CHOICE {
	 *    issuerAndSerialNumber IssuerAndSerialNumber,
	 *    rKeyId [0] IMPLICIT RecipientKeyIdentifier }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuerAndSerialNumber]
		 * @property {string} [rKeyId]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Choice({
			value: [
				IssuerAndSerialNumber.schema(names.issuerAndSerialNumber || {
					names: {
						blockName: (names.blockName || "")
					}
				}),
				new Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: RecipientKeyIdentifier.schema(names.rKeyId || {
						names: {
							blockName: (names.blockName || "")
						}
					}).valueBlock.value
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"blockName"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			KeyAgreeRecipientIdentifier.schema({
				names: {
					blockName: "blockName"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for KeyAgreeRecipientIdentifier");
		//endregion

		//region Get internal properties from parsed schema
		if(asn1.result.blockName.idBlock.tagClass === 1)
		{
			this.variant = 1;
			this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
		}
		else
		{
			this.variant = 2;

			this.value = new RecipientKeyIdentifier({
				schema: new Sequence({
					value: asn1.result.blockName.valueBlock.value
				})
			});
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		switch(this.variant)
		{
			case 1:
				return this.value.toSchema();
			case 2:
				return new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: this.value.toSchema().valueBlock.value
				});
			default:
				return new Any();
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			variant: this.variant
		};

		if((this.variant === 1) || (this.variant === 2))
			_object.value = this.value.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class RecipientEncryptedKey
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientEncryptedKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {KeyAgreeRecipientIdentifier}
		 * @desc rid
		 */
		this.rid = getParametersValue(parameters, "rid", RecipientEncryptedKey.defaultValues("rid"));
		/**
		 * @type {OctetString}
		 * @desc encryptedKey
		 */
		this.encryptedKey = getParametersValue(parameters, "encryptedKey", RecipientEncryptedKey.defaultValues("encryptedKey"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "rid":
				return new KeyAgreeRecipientIdentifier();
			case "encryptedKey":
				return new OctetString();
			default:
				throw new Error(`Invalid member name for RecipientEncryptedKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "rid":
				return ((memberValue.variant === (-1)) && (("value" in memberValue) === false));
			case "encryptedKey":
				return (memberValue.isEqual(RecipientEncryptedKey.defaultValues("encryptedKey")));
			default:
				throw new Error(`Invalid member name for RecipientEncryptedKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientEncryptedKey ::= SEQUENCE {
	 *    rid KeyAgreeRecipientIdentifier,
	 *    encryptedKey EncryptedKey }
	 *
	 * EncryptedKey ::= OCTET STRING
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [rid]
		 * @property {string} [encryptedKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				KeyAgreeRecipientIdentifier.schema(names.rid || {}),
				new OctetString({ name: (names.encryptedKey || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"rid",
			"encryptedKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RecipientEncryptedKey.schema({
				names: {
					rid: {
						names: {
							blockName: "rid"
						}
					},
					encryptedKey: "encryptedKey"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientEncryptedKey");
		//endregion

		//region Get internal properties from parsed schema
		this.rid = new KeyAgreeRecipientIdentifier({ schema: asn1.result.rid });
		this.encryptedKey = asn1.result.encryptedKey;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				this.rid.toSchema(),
				this.encryptedKey
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			rid: this.rid.toJSON(),
			encryptedKey: this.encryptedKey.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class RecipientEncryptedKeys
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientEncryptedKeys class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<RecipientEncryptedKey>}
		 * @desc encryptedKeys
		 */
		this.encryptedKeys = getParametersValue(parameters, "encryptedKeys", RecipientEncryptedKeys.defaultValues("encryptedKeys"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "encryptedKeys":
				return [];
			default:
				throw new Error(`Invalid member name for RecipientEncryptedKeys class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "encryptedKeys":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for RecipientEncryptedKeys class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientEncryptedKeys ::= SEQUENCE OF RecipientEncryptedKey
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [RecipientEncryptedKeys]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Repeated({
					name: (names.RecipientEncryptedKeys || ""),
					value: RecipientEncryptedKey.schema()
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"RecipientEncryptedKeys"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RecipientEncryptedKeys.schema({
				names: {
					RecipientEncryptedKeys: "RecipientEncryptedKeys"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientEncryptedKeys");
		//endregion

		//region Get internal properties from parsed schema
		this.encryptedKeys = Array.from(asn1.result.RecipientEncryptedKeys, element => new RecipientEncryptedKey({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: Array.from(this.encryptedKeys, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			encryptedKeys: Array.from(this.encryptedKeys, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class KeyAgreeRecipientInfo
{
	//**********************************************************************************
	/**
	 * Constructor for KeyAgreeRecipientInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", KeyAgreeRecipientInfo.defaultValues("version"));
		/**
		 * @type {OriginatorIdentifierOrKey}
		 * @desc originator
		 */
		this.originator = getParametersValue(parameters, "originator", KeyAgreeRecipientInfo.defaultValues("originator"));

		if("ukm" in parameters)
			/**
			 * @type {OctetString}
			 * @desc ukm
			 */
			this.ukm = getParametersValue(parameters, "ukm", KeyAgreeRecipientInfo.defaultValues("ukm"));

		/**
		 * @type {AlgorithmIdentifier}
		 * @desc keyEncryptionAlgorithm
		 */
		this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", KeyAgreeRecipientInfo.defaultValues("keyEncryptionAlgorithm"));
		/**
		 * @type {RecipientEncryptedKeys}
		 * @desc recipientEncryptedKeys
		 */
		this.recipientEncryptedKeys = getParametersValue(parameters, "recipientEncryptedKeys", KeyAgreeRecipientInfo.defaultValues("recipientEncryptedKeys"));
		/**
		 * @type {Certificate}
		 * @desc recipientCertificate For some reasons we need to store recipient's certificate here
		 */
		this.recipientCertificate = getParametersValue(parameters, "recipientCertificate", KeyAgreeRecipientInfo.defaultValues("recipientCertificate"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 0;
			case "originator":
				return new OriginatorIdentifierOrKey();
			case "ukm":
				return new OctetString();
			case "keyEncryptionAlgorithm":
				return new AlgorithmIdentifier();
			case "recipientEncryptedKeys":
				return new RecipientEncryptedKeys();
			case "recipientCertificate":
				return new Certificate();
			default:
				throw new Error(`Invalid member name for KeyAgreeRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "version":
				return (memberValue === 0);
			case "originator":
				return ((memberValue.variant === (-1)) && (("value" in memberValue) === false));
			case "ukm":
				return (memberValue.isEqual(KeyAgreeRecipientInfo.defaultValues("ukm")));
			case "keyEncryptionAlgorithm":
				return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
			case "recipientEncryptedKeys":
				return (memberValue.encryptedKeys.length === 0);
			case "recipientCertificate":
				return false; // For now leave it as is
			default:
				throw new Error(`Invalid member name for KeyAgreeRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * KeyAgreeRecipientInfo ::= SEQUENCE {
	 *    version CMSVersion,  -- always set to 3
	 *    originator [0] EXPLICIT OriginatorIdentifierOrKey,
	 *    ukm [1] EXPLICIT UserKeyingMaterial OPTIONAL,
	 *    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
	 *    recipientEncryptedKeys RecipientEncryptedKeys }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [originator]
		 * @property {string} [ukm]
		 * @property {string} [keyEncryptionAlgorithm]
		 * @property {string} [recipientEncryptedKeys]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: names.blockName || "",
			value: [
				new Integer({ name: names.version || "" }),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						OriginatorIdentifierOrKey.schema(names.originator || {})
					]
				}),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [new OctetString({ name: names.ukm || "" })]
				}),
				AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}),
				RecipientEncryptedKeys.schema(names.recipientEncryptedKeys || {})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"originator",
			"ukm",
			"keyEncryptionAlgorithm",
			"recipientEncryptedKeys"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			KeyAgreeRecipientInfo.schema({
				names: {
					version: "version",
					originator: {
						names: {
							blockName: "originator"
						}
					},
					ukm: "ukm",
					keyEncryptionAlgorithm: {
						names: {
							blockName: "keyEncryptionAlgorithm"
						}
					},
					recipientEncryptedKeys: {
						names: {
							blockName: "recipientEncryptedKeys"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for KeyAgreeRecipientInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.originator = new OriginatorIdentifierOrKey({ schema: asn1.result.originator });

		if("ukm" in asn1.result)
			this.ukm = asn1.result.ukm;

		this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
		this.recipientEncryptedKeys = new RecipientEncryptedKeys({ schema: asn1.result.recipientEncryptedKeys });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for final sequence
		const outputArray = [];

		outputArray.push(new Integer({ value: this.version }));
		outputArray.push(new Constructed({
			idBlock: {
				tagClass: 3, // CONTEXT-SPECIFIC
				tagNumber: 0 // [0]
			},
			value: [this.originator.toSchema()]
		}));

		if("ukm" in this)
		{
			outputArray.push(new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [this.ukm]
			}));
		}

		outputArray.push(this.keyEncryptionAlgorithm.toSchema());
		outputArray.push(this.recipientEncryptedKeys.toSchema());
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			version: this.version,
			originator: this.originator.toJSON()
		};

		if("ukm" in this)
			_object.ukm = this.ukm.toJSON();

		_object.keyEncryptionAlgorithm = this.keyEncryptionAlgorithm.toJSON();
		_object.recipientEncryptedKeys = this.recipientEncryptedKeys.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class KEKIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for KEKIdentifier class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {OctetString}
		 * @desc keyIdentifier
		 */
		this.keyIdentifier = getParametersValue(parameters, "keyIdentifier", KEKIdentifier.defaultValues("keyIdentifier"));

		if("date" in parameters)
			/**
			 * @type {GeneralizedTime}
			 * @desc date
			 */
			this.date = getParametersValue(parameters, "date", KEKIdentifier.defaultValues("date"));
		if("other" in parameters)
			/**
			 * @type {OtherKeyAttribute}
			 * @desc other
			 */
			this.other = getParametersValue(parameters, "other", KEKIdentifier.defaultValues("other"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "keyIdentifier":
				return new OctetString();
			case "date":
				return new GeneralizedTime();
			case "other":
				return new OtherKeyAttribute();
			default:
				throw new Error(`Invalid member name for KEKIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "keyIdentifier":
				return (memberValue.isEqual(KEKIdentifier.defaultValues("keyIdentifier")));
			case "date":
				// noinspection OverlyComplexBooleanExpressionJS
				return ((memberValue.year === 0) &&
						(memberValue.month === 0) &&
						(memberValue.day === 0) &&
						(memberValue.hour === 0) &&
						(memberValue.minute === 0) &&
						(memberValue.second === 0) &&
						(memberValue.millisecond === 0));
			case "other":
				return ((memberValue.compareWithDefault("keyAttrId", memberValue.keyAttrId)) &&
						(("keyAttr" in memberValue) === false));
			default:
				throw new Error(`Invalid member name for KEKIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * KEKIdentifier ::= SEQUENCE {
	 *    keyIdentifier OCTET STRING,
	 *    date GeneralizedTime OPTIONAL,
	 *    other OtherKeyAttribute OPTIONAL }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [keyIdentifier]
		 * @property {string} [date]
		 * @property {string} [other]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new OctetString({ name: (names.keyIdentifier || "") }),
				new GeneralizedTime({
					optional: true,
					name: (names.date || "")
				}),
				OtherKeyAttribute.schema(names.other || {})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"keyIdentifier",
			"date",
			"other"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			KEKIdentifier.schema({
				names: {
					keyIdentifier: "keyIdentifier",
					date: "date",
					other: {
						names: {
							blockName: "other"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for KEKIdentifier");
		//endregion

		//region Get internal properties from parsed schema
		this.keyIdentifier = asn1.result.keyIdentifier;

		if("date" in asn1.result)
			this.date = asn1.result.date;

		if("other" in asn1.result)
			this.other = new OtherKeyAttribute({ schema: asn1.result.other });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];

		outputArray.push(this.keyIdentifier);

		if("date" in this)
			outputArray.push(this.date);

		if("other" in this)
			outputArray.push(this.other.toSchema());
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			keyIdentifier: this.keyIdentifier.toJSON()
		};

		if("date" in this)
			_object.date = this.date;

		if("other" in this)
			_object.other = this.other.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class KEKRecipientInfo
{
	//**********************************************************************************
	/**
	 * Constructor for KEKRecipientInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", KEKRecipientInfo.defaultValues("version"));
		/**
		 * @type {KEKIdentifier}
		 * @desc kekid
		 */
		this.kekid = getParametersValue(parameters, "kekid", KEKRecipientInfo.defaultValues("kekid"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc keyEncryptionAlgorithm
		 */
		this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", KEKRecipientInfo.defaultValues("keyEncryptionAlgorithm"));
		/**
		 * @type {OctetString}
		 * @desc encryptedKey
		 */
		this.encryptedKey = getParametersValue(parameters, "encryptedKey", KEKRecipientInfo.defaultValues("encryptedKey"));
		/**
		 * @type {ArrayBuffer}
		 * @desc preDefinedKEK KEK using to encrypt CEK
		 */
		this.preDefinedKEK = getParametersValue(parameters, "preDefinedKEK", KEKRecipientInfo.defaultValues("preDefinedKEK"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 0;
			case "kekid":
				return new KEKIdentifier();
			case "keyEncryptionAlgorithm":
				return new AlgorithmIdentifier();
			case "encryptedKey":
				return new OctetString();
			case "preDefinedKEK":
				return new ArrayBuffer(0);
			default:
				throw new Error(`Invalid member name for KEKRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "KEKRecipientInfo":
				return (memberValue === KEKRecipientInfo.defaultValues("version"));
			case "kekid":
				return ((memberValue.compareWithDefault("keyIdentifier", memberValue.keyIdentifier)) &&
						(("date" in memberValue) === false) &&
						(("other" in memberValue) === false));
			case "keyEncryptionAlgorithm":
				return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
			case "encryptedKey":
				return (memberValue.isEqual(KEKRecipientInfo.defaultValues("encryptedKey")));
			case "preDefinedKEK":
				return (memberValue.byteLength === 0);
			default:
				throw new Error(`Invalid member name for KEKRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * KEKRecipientInfo ::= SEQUENCE {
	 *    version CMSVersion,  -- always set to 4
	 *    kekid KEKIdentifier,
	 *    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
	 *    encryptedKey EncryptedKey }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [kekid]
		 * @property {string} [keyEncryptionAlgorithm]
		 * @property {string} [encryptedKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				KEKIdentifier.schema(names.kekid || {}),
				AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}),
				new OctetString({ name: (names.encryptedKey || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"kekid",
			"keyEncryptionAlgorithm",
			"encryptedKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			KEKRecipientInfo.schema({
				names: {
					version: "version",
					kekid: {
						names: {
							blockName: "kekid"
						}
					},
					keyEncryptionAlgorithm: {
						names: {
							blockName: "keyEncryptionAlgorithm"
						}
					},
					encryptedKey: "encryptedKey"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for KEKRecipientInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.kekid = new KEKIdentifier({ schema: asn1.result.kekid });
		this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
		this.encryptedKey = asn1.result.encryptedKey;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new Integer({ value: this.version }),
				this.kekid.toSchema(),
				this.keyEncryptionAlgorithm.toSchema(),
				this.encryptedKey
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			version: this.version,
			kekid: this.kekid.toJSON(),
			keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
			encryptedKey: this.encryptedKey.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class PasswordRecipientinfo
{
	//**********************************************************************************
	/**
	 * Constructor for PasswordRecipientinfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", PasswordRecipientinfo.defaultValues("version"));

		if("keyDerivationAlgorithm" in parameters)
			/**
			 * @type {AlgorithmIdentifier}
			 * @desc keyDerivationAlgorithm
			 */
			this.keyDerivationAlgorithm = getParametersValue(parameters, "keyDerivationAlgorithm", PasswordRecipientinfo.defaultValues("keyDerivationAlgorithm"));

		/**
		 * @type {AlgorithmIdentifier}
		 * @desc keyEncryptionAlgorithm
		 */
		this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", PasswordRecipientinfo.defaultValues("keyEncryptionAlgorithm"));
		/**
		 * @type {OctetString}
		 * @desc encryptedKey
		 */
		this.encryptedKey = getParametersValue(parameters, "encryptedKey", PasswordRecipientinfo.defaultValues("encryptedKey"));
		/**
		 * @type {ArrayBuffer}
		 * @desc password Password to derive key from
		 */
		this.password = getParametersValue(parameters, "password", PasswordRecipientinfo.defaultValues("password"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return (-1);
			case "keyDerivationAlgorithm":
				return new AlgorithmIdentifier();
			case "keyEncryptionAlgorithm":
				return new AlgorithmIdentifier();
			case "encryptedKey":
				return new OctetString();
			case "password":
				return new ArrayBuffer(0);
			default:
				throw new Error(`Invalid member name for PasswordRecipientinfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "version":
				return (memberValue === (-1));
			case "keyDerivationAlgorithm":
			case "keyEncryptionAlgorithm":
				return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
			case "encryptedKey":
				return (memberValue.isEqual(PasswordRecipientinfo.defaultValues("encryptedKey")));
			case "password":
				return (memberValue.byteLength === 0);
			default:
				throw new Error(`Invalid member name for PasswordRecipientinfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PasswordRecipientInfo ::= SEQUENCE {
	 *    version CMSVersion,   -- Always set to 0
	 *    keyDerivationAlgorithm [0] KeyDerivationAlgorithmIdentifier OPTIONAL,
	 *    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
	 *    encryptedKey EncryptedKey }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [keyDerivationAlgorithm]
		 * @property {string} [keyEncryptionAlgorithm]
		 * @property {string} [encryptedKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				new Constructed({
					name: (names.keyDerivationAlgorithm || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: AlgorithmIdentifier.schema().valueBlock.value
				}),
				AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}),
				new OctetString({ name: (names.encryptedKey || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"keyDerivationAlgorithm",
			"keyEncryptionAlgorithm",
			"encryptedKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			PasswordRecipientinfo.schema({
				names: {
					version: "version",
					keyDerivationAlgorithm: "keyDerivationAlgorithm",
					keyEncryptionAlgorithm: {
						names: {
							blockName: "keyEncryptionAlgorithm"
						}
					},
					encryptedKey: "encryptedKey"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PasswordRecipientinfo");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;

		if("keyDerivationAlgorithm" in asn1.result)
		{
			this.keyDerivationAlgorithm = new AlgorithmIdentifier({
				schema: new Sequence({
					value: asn1.result.keyDerivationAlgorithm.valueBlock.value
				})
			});
		}

		this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
		this.encryptedKey = asn1.result.encryptedKey;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create output array for sequence
		const outputArray = [];

		outputArray.push(new Integer({ value: this.version }));

		if("keyDerivationAlgorithm" in this)
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: this.keyDerivationAlgorithm.toSchema().valueBlock.value
			}));
		}

		outputArray.push(this.keyEncryptionAlgorithm.toSchema());
		outputArray.push(this.encryptedKey);
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			version: this.version,
			keyDerivationAlgorithm: this.keyDerivationAlgorithm.toJSON(),
			keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
			encryptedKey: this.encryptedKey.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class OtherRecipientInfo
{
	//**********************************************************************************
	/**
	 * Constructor for OtherRecipientInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc oriType
		 */
		this.oriType = getParametersValue(parameters, "oriType", OtherRecipientInfo.defaultValues("oriType"));
		/**
		 * @type {*}
		 * @desc oriValue
		 */
		this.oriValue = getParametersValue(parameters, "oriValue", OtherRecipientInfo.defaultValues("oriValue"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "oriType":
				return "";
			case "oriValue":
				return {};
			default:
				throw new Error(`Invalid member name for OtherRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "oriType":
				return (memberValue === "");
			case "oriValue":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for OtherRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherRecipientInfo ::= SEQUENCE {
	 *    oriType OBJECT IDENTIFIER,
	 *    oriValue ANY DEFINED BY oriType }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [oriType]
		 * @property {string} [oriValue]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new ObjectIdentifier({ name: (names.oriType || "") }),
				new Any({ name: (names.oriValue || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"oriType",
			"oriValue"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			OtherRecipientInfo.schema({
				names: {
					oriType: "oriType",
					oriValue: "oriValue"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherRecipientInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.oriType = asn1.result.oriType.valueBlock.toString();
		this.oriValue = asn1.result.oriValue;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.oriType }),
				this.oriValue
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			oriType: this.oriType
		};

		if(OtherRecipientInfo.compareWithDefault("oriValue", this.oriValue) === false)
			_object.oriValue = this.oriValue.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class RecipientInfo
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc variant
		 */
		this.variant = getParametersValue(parameters, "variant", RecipientInfo.defaultValues("variant"));

		if("value" in parameters)
			/**
			 * @type {*}
			 * @desc value
			 */
			this.value = getParametersValue(parameters, "value", RecipientInfo.defaultValues("value"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "variant":
				return (-1);
			case "value":
				return {};
			default:
				throw new Error(`Invalid member name for RecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "variant":
				return (memberValue === RecipientInfo.defaultValues(memberName));
			case "value":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for RecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientInfo ::= CHOICE {
	 *    ktri KeyTransRecipientInfo,
	 *    kari [1] KeyAgreeRecipientInfo,
	 *    kekri [2] KEKRecipientInfo,
	 *    pwri [3] PasswordRecipientinfo,
	 *    ori [4] OtherRecipientInfo }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [type]
		 * @property {string} [setName]
		 * @property {string} [values]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Choice({
			value: [
				KeyTransRecipientInfo.schema({
					names: {
						blockName: (names.blockName || "")
					}
				}),
				new Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: KeyAgreeRecipientInfo.schema().valueBlock.value
				}),
				new Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: KEKRecipientInfo.schema().valueBlock.value
				}),
				new Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					},
					value: PasswordRecipientinfo.schema().valueBlock.value
				}),
				new Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 4 // [4]
					},
					value: OtherRecipientInfo.schema().valueBlock.value
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"blockName"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RecipientInfo.schema({
				names: {
					blockName: "blockName"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientInfo");
		//endregion

		//region Get internal properties from parsed schema
		if(asn1.result.blockName.idBlock.tagClass === 1)
		{
			this.variant = 1;
			this.value = new KeyTransRecipientInfo({ schema: asn1.result.blockName });
		}
		else
		{
			//region Create "SEQUENCE" from "ASN1_CONSTRUCTED"
			const blockSequence = new Sequence({
				value: asn1.result.blockName.valueBlock.value
			});
			//endregion

			switch(asn1.result.blockName.idBlock.tagNumber)
			{
				case 1:
					this.variant = 2;
					this.value = new KeyAgreeRecipientInfo({ schema: blockSequence });
					break;
				case 2:
					this.variant = 3;
					this.value = new KEKRecipientInfo({ schema: blockSequence });
					break;
				case 3:
					this.variant = 4;
					this.value = new PasswordRecipientinfo({ schema: blockSequence });
					break;
				case 4:
					this.variant = 5;
					this.value = new OtherRecipientInfo({ schema: blockSequence });
					break;
				default:
					throw new Error("Incorrect structure of RecipientInfo block");
			}
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		const _schema = this.value.toSchema();

		switch(this.variant)
		{
			case 1:
				return _schema;
			case 2:
			case 3:
			case 4:
				//region Create "ASN1_CONSTRUCTED" from "SEQUENCE"
				_schema.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
				_schema.idBlock.tagNumber = (this.variant - 1);
				//endregion

				return _schema;
			default:
				return new Any();
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			variant: this.variant
		};

		if((this.variant >= 1) && (this.variant <= 4))
			_object.value = this.value.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC3447
 */
class RSAESOAEPParams
{
	//**********************************************************************************
	/**
	 * Constructor for RSAESOAEPParams class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc hashAlgorithm
		 */
		this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", RSAESOAEPParams.defaultValues("hashAlgorithm"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc maskGenAlgorithm
		 */
		this.maskGenAlgorithm = getParametersValue(parameters, "maskGenAlgorithm", RSAESOAEPParams.defaultValues("maskGenAlgorithm"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc pSourceAlgorithm
		 */
		this.pSourceAlgorithm = getParametersValue(parameters, "pSourceAlgorithm", RSAESOAEPParams.defaultValues("pSourceAlgorithm"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "hashAlgorithm":
				return new AlgorithmIdentifier({
					algorithmId: "1.3.14.3.2.26", // SHA-1
					algorithmParams: new Null()
				});
			case "maskGenAlgorithm":
				return new AlgorithmIdentifier({
					algorithmId: "1.2.840.113549.1.1.8", // MGF1
					algorithmParams: (new AlgorithmIdentifier({
						algorithmId: "1.3.14.3.2.26", // SHA-1
						algorithmParams: new Null()
					})).toSchema()
				});
			case "pSourceAlgorithm":
				return new AlgorithmIdentifier({
					algorithmId: "1.2.840.113549.1.1.9", // id-pSpecified
					algorithmParams: new OctetString({ valueHex: (new Uint8Array([0xda, 0x39, 0xa3, 0xee, 0x5e, 0x6b, 0x4b, 0x0d, 0x32, 0x55, 0xbf, 0xef, 0x95, 0x60, 0x18, 0x90, 0xaf, 0xd8, 0x07, 0x09])).buffer }) // SHA-1 hash of empty string
				});
			default:
				throw new Error(`Invalid member name for RSAESOAEPParams class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RSAES-OAEP-params ::= SEQUENCE {
	 *    hashAlgorithm     [0] HashAlgorithm    DEFAULT sha1,
	 *    maskGenAlgorithm  [1] MaskGenAlgorithm DEFAULT mgf1SHA1,
	 *    pSourceAlgorithm  [2] PSourceAlgorithm DEFAULT pSpecifiedEmpty
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [hashAlgorithm]
		 * @property {string} [maskGenAlgorithm]
		 * @property {string} [pSourceAlgorithm]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					optional: true,
					value: [AlgorithmIdentifier.schema(names.hashAlgorithm || {})]
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					optional: true,
					value: [AlgorithmIdentifier.schema(names.maskGenAlgorithm || {})]
				}),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					optional: true,
					value: [AlgorithmIdentifier.schema(names.pSourceAlgorithm || {})]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"hashAlgorithm",
			"maskGenAlgorithm",
			"pSourceAlgorithm"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			RSAESOAEPParams.schema({
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
					pSourceAlgorithm: {
						names: {
							blockName: "pSourceAlgorithm"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RSAESOAEPParams");
		//endregion

		//region Get internal properties from parsed schema
		if("hashAlgorithm" in asn1.result)
			this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });

		if("maskGenAlgorithm" in asn1.result)
			this.maskGenAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.maskGenAlgorithm });

		if("pSourceAlgorithm" in asn1.result)
			this.pSourceAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.pSourceAlgorithm });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if(!this.hashAlgorithm.isEqual(RSAESOAEPParams.defaultValues("hashAlgorithm")))
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [this.hashAlgorithm.toSchema()]
			}));
		}
		
		if(!this.maskGenAlgorithm.isEqual(RSAESOAEPParams.defaultValues("maskGenAlgorithm")))
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [this.maskGenAlgorithm.toSchema()]
			}));
		}

		if(!this.pSourceAlgorithm.isEqual(RSAESOAEPParams.defaultValues("pSourceAlgorithm")))
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				value: [this.pSourceAlgorithm.toSchema()]
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {};

		if(!this.hashAlgorithm.isEqual(RSAESOAEPParams.defaultValues("hashAlgorithm")))
			object.hashAlgorithm = this.hashAlgorithm.toJSON();

		if(!this.maskGenAlgorithm.isEqual(RSAESOAEPParams.defaultValues("maskGenAlgorithm")))
			object.maskGenAlgorithm = this.maskGenAlgorithm.toJSON();

		if(!this.pSourceAlgorithm.isEqual(RSAESOAEPParams.defaultValues("pSourceAlgorithm")))
			object.pSourceAlgorithm = this.pSourceAlgorithm.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC6318
 */
class ECCCMSSharedInfo
{
	//**********************************************************************************
	/**
	 * Constructor for ECCCMSSharedInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc keyInfo
		 */
		this.keyInfo = getParametersValue(parameters, "keyInfo", ECCCMSSharedInfo.defaultValues("keyInfo"));

		if("entityUInfo" in parameters)
			/**
			 * @type {OctetString}
			 * @desc entityUInfo
			 */
			this.entityUInfo = getParametersValue(parameters, "entityUInfo", ECCCMSSharedInfo.defaultValues("entityUInfo"));

		/**
		 * @type {OctetString}
		 * @desc suppPubInfo
		 */
		this.suppPubInfo = getParametersValue(parameters, "suppPubInfo", ECCCMSSharedInfo.defaultValues("suppPubInfo"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "keyInfo":
				return new AlgorithmIdentifier();
			case "entityUInfo":
				return new OctetString();
			case "suppPubInfo":
				return new OctetString();
			default:
				throw new Error(`Invalid member name for ECCCMSSharedInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "keyInfo":
			case "entityUInfo":
			case "suppPubInfo":
				return (memberValue.isEqual(ECCCMSSharedInfo.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for ECCCMSSharedInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * ECC-CMS-SharedInfo  ::=  SEQUENCE {
	 *    keyInfo      AlgorithmIdentifier,
	 *    entityUInfo  [0] EXPLICIT OCTET STRING OPTIONAL,
	 *    suppPubInfo  [2] EXPLICIT OCTET STRING }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [keyInfo]
		 * @property {string} [entityUInfo]
		 * @property {string} [suppPubInfo]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				AlgorithmIdentifier.schema(names.keyInfo || {}),
				new Constructed({
					name: (names.entityUInfo || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					optional: true,
					value: [new OctetString()]
				}),
				new Constructed({
					name: (names.suppPubInfo || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [new OctetString()]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"keyInfo",
			"entityUInfo",
			"suppPubInfo"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			ECCCMSSharedInfo.schema({
				names: {
					keyInfo: {
						names: {
							blockName: "keyInfo"
						}
					},
					entityUInfo: "entityUInfo",
					suppPubInfo: "suppPubInfo"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ECCCMSSharedInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.keyInfo = new AlgorithmIdentifier({ schema: asn1.result.keyInfo });

		if("entityUInfo" in asn1.result)
			this.entityUInfo = asn1.result.entityUInfo.valueBlock.value[0];

		this.suppPubInfo = asn1.result.suppPubInfo.valueBlock.value[0];
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create output array for sequence 
		const outputArray = [];
		
		outputArray.push(this.keyInfo.toSchema());
		
		if("entityUInfo" in this)
		{
			outputArray.push(new Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [this.entityUInfo]
			}));
		}
		
		outputArray.push(new Constructed({
			idBlock: {
				tagClass: 3, // CONTEXT-SPECIFIC
				tagNumber: 2 // [2]
			},
			value: [this.suppPubInfo]
		}));
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
	toJSON()
	{
		const _object = {
			keyInfo: this.keyInfo.toJSON()
		};

		if("entityUInfo" in this)
			_object.entityUInfo = this.entityUInfo.toJSON();

		_object.suppPubInfo = this.suppPubInfo.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class EnvelopedData 
{
	//**********************************************************************************
	/**
	 * Constructor for EnvelopedData class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", EnvelopedData.defaultValues("version"));
		
		if("originatorInfo" in parameters)
			/**
			 * @type {OriginatorInfo}
			 * @desc originatorInfo
			 */
			this.originatorInfo = getParametersValue(parameters, "originatorInfo", EnvelopedData.defaultValues("originatorInfo"));
		
		/**
		 * @type {Array.<RecipientInfo>}
		 * @desc recipientInfos
		 */
		this.recipientInfos = getParametersValue(parameters, "recipientInfos", EnvelopedData.defaultValues("recipientInfos"));
		/**
		 * @type {EncryptedContentInfo}
		 * @desc encryptedContentInfo
		 */
		this.encryptedContentInfo = getParametersValue(parameters, "encryptedContentInfo", EnvelopedData.defaultValues("encryptedContentInfo"));
		
		if("unprotectedAttrs" in parameters)
			/**
			 * @type {Array.<Attribute>}
			 * @desc unprotectedAttrs
			 */
			this.unprotectedAttrs = getParametersValue(parameters, "unprotectedAttrs", EnvelopedData.defaultValues("unprotectedAttrs"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 0;
			case "originatorInfo":
				return new OriginatorInfo();
			case "recipientInfos":
				return [];
			case "encryptedContentInfo":
				return new EncryptedContentInfo();
			case "unprotectedAttrs":
				return [];
			default:
				throw new Error(`Invalid member name for EnvelopedData class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "version":
				return (memberValue === EnvelopedData.defaultValues(memberName));
			case "originatorInfo":
				return ((memberValue.certs.certificates.length === 0) && (memberValue.crls.crls.length === 0));
			case "recipientInfos":
			case "unprotectedAttrs":
				return (memberValue.length === 0);
			case "encryptedContentInfo":
				return ((EncryptedContentInfo.compareWithDefault("contentType", memberValue.contentType)) &&
				(EncryptedContentInfo.compareWithDefault("contentEncryptionAlgorithm", memberValue.contentEncryptionAlgorithm) &&
				(EncryptedContentInfo.compareWithDefault("encryptedContent", memberValue.encryptedContent))));
			default:
				throw new Error(`Invalid member name for EnvelopedData class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * EnvelopedData ::= SEQUENCE {
	 *    version CMSVersion,
	 *    originatorInfo [0] IMPLICIT OriginatorInfo OPTIONAL,
	 *    recipientInfos RecipientInfos,
	 *    encryptedContentInfo EncryptedContentInfo,
	 *    unprotectedAttrs [1] IMPLICIT UnprotectedAttributes OPTIONAL }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [originatorInfo]
		 * @property {string} [recipientInfos]
		 * @property {string} [encryptedContentInfo]
		 * @property {string} [unprotectedAttrs]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new Sequence({
			name: (names.blockName || ""),
			value: [
				new Integer({ name: (names.version || "") }),
				new Constructed({
					name: (names.originatorInfo || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: OriginatorInfo.schema().valueBlock.value
				}),
				new Set({
					value: [
						new Repeated({
							name: (names.recipientInfos || ""),
							value: RecipientInfo.schema()
						})
					]
				}),
				EncryptedContentInfo.schema(names.encryptedContentInfo || {}),
				new Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new Repeated({
							name: (names.unprotectedAttrs || ""),
							value: Attribute.schema()
						})
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"originatorInfo",
			"recipientInfos",
			"encryptedContentInfo",
			"unprotectedAttrs"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			EnvelopedData.schema({
				names: {
					version: "version",
					originatorInfo: "originatorInfo",
					recipientInfos: "recipientInfos",
					encryptedContentInfo: {
						names: {
							blockName: "encryptedContentInfo"
						}
					},
					unprotectedAttrs: "unprotectedAttrs"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for EnvelopedData");
		//endregion
		
		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		
		if("originatorInfo" in asn1.result)
		{
			this.originatorInfo = new OriginatorInfo({
				schema: new Sequence({
					value: asn1.result.originatorInfo.valueBlock.value
				})
			});
		}
		
		this.recipientInfos = Array.from(asn1.result.recipientInfos, element => new RecipientInfo({ schema: element }));
		this.encryptedContentInfo = new EncryptedContentInfo({ schema: asn1.result.encryptedContentInfo });
		
		if("unprotectedAttrs" in asn1.result)
			this.unprotectedAttrs = Array.from(asn1.result.unprotectedAttrs, element => new Attribute({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		outputArray.push(new Integer({ value: this.version }));
		
		if("originatorInfo" in this)
		{
			outputArray.push(new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: this.originatorInfo.toSchema().valueBlock.value
			}));
		}
		
		outputArray.push(new Set({
			value: Array.from(this.recipientInfos, element => element.toSchema())
		}));
		
		outputArray.push(this.encryptedContentInfo.toSchema());
		
		if("unprotectedAttrs" in this)
		{
			outputArray.push(new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: Array.from(this.unprotectedAttrs, element => element.toSchema())
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			version: this.version
		};
		
		if("originatorInfo" in this)
			_object.originatorInfo = this.originatorInfo.toJSON();
		
		_object.recipientInfos = Array.from(this.recipientInfos, element => element.toJSON());
		_object.encryptedContentInfo = this.encryptedContentInfo.toJSON();
		
		if("unprotectedAttrs" in this)
			_object.unprotectedAttrs = Array.from(this.unprotectedAttrs, element => element.toJSON());
		
		return _object;
	}
	//**********************************************************************************
	/**
	 * Helpers function for filling "RecipientInfo" based on recipient's certificate.
	 * Problem with WebCrypto is that for RSA certificates we have only one option - "key transport" and
	 * for ECC certificates we also have one option - "key agreement". As soon as Google will implement
	 * DH algorithm it would be possible to use "key agreement" also for RSA certificates.
	 * @param {Certificate} [certificate] Recipient's certificate
	 * @param {Object} [parameters] Additional parameters neccessary for "fine tunning" of encryption process
	 * @param {number} [variant] Variant = 1 is for "key transport", variant = 2 is for "key agreement". In fact the "variant" is unneccessary now because Google has no DH algorithm implementation. Thus key encryption scheme would be choosen by certificate type only: "key transport" for RSA and "key agreement" for ECC certificates.
	 */
	addRecipientByCertificate(certificate, parameters, variant)
	{
		//region Initial variables 
		const encryptionParameters = parameters || {};
		//endregion 
		
		//region Check type of certificate
		if(certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1))
			variant = 1; // For the moment it is the only variant for RSA-based certificates
		else
		{
			if(certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.10045") !== (-1))
				variant = 2; // For the moment it is the only variant for ECC-based certificates
			else
				throw new Error(`Unknown type of certificate's public key: ${certificate.subjectPublicKeyInfo.algorithm.algorithmId}`);
		}
		//endregion 
		
		//region Initialize encryption parameters 
		if(("oaepHashAlgorithm" in encryptionParameters) === false)
			encryptionParameters.oaepHashAlgorithm = "SHA-512";
		
		if(("kdfAlgorithm" in encryptionParameters) === false)
			encryptionParameters.kdfAlgorithm = "SHA-512";
		
		if(("kekEncryptionLength" in encryptionParameters) === false)
			encryptionParameters.kekEncryptionLength = 256;
		//endregion 
		
		//region Add new "recipient" depends on "variant" and certificate type 
		switch(variant)
		{
			case 1: // Key transport scheme
				{
					//region keyEncryptionAlgorithm
					const oaepOID = getOIDByAlgorithm({
						name: "RSA-OAEP"
					});
					if(oaepOID === "")
						throw new Error("Can not find OID for OAEP");
					//endregion

					//region RSAES-OAEP-params
					const hashOID = getOIDByAlgorithm({
						name: encryptionParameters.oaepHashAlgorithm
					});
					if(hashOID === "")
						throw new Error(`Unknown OAEP hash algorithm: ${encryptionParameters.oaepHashAlgorithm}`);
				
					const hashAlgorithm = new AlgorithmIdentifier({
						algorithmId: hashOID,
						algorithmParams: new Null()
					});
				
					const rsaOAEPParams = new RSAESOAEPParams({
						hashAlgorithm,
						maskGenAlgorithm: new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.8", // id-mgf1
							algorithmParams: hashAlgorithm.toSchema()
						})
					});
					//endregion

					//region KeyTransRecipientInfo
					const keyInfo = new KeyTransRecipientInfo({
						version: 0,
						rid: new IssuerAndSerialNumber({
							issuer: certificate.issuer,
							serialNumber: certificate.serialNumber
						}),
						keyEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: oaepOID,
							algorithmParams: rsaOAEPParams.toSchema()
						}),
						recipientCertificate: certificate
						// "encryptedKey" will be calculated in "encrypt" function
					});
					//endregion
				
					//region Final values for "CMS_ENVELOPED_DATA"
					this.recipientInfos.push(new RecipientInfo({
						variant: 1,
						value: keyInfo
					}));
					//endregion
				}
				break;
			case 2: // Key agreement scheme
				{
					//region RecipientEncryptedKey
					const encryptedKey = new RecipientEncryptedKey({
						rid: new KeyAgreeRecipientIdentifier({
							variant: 1,
							value: new IssuerAndSerialNumber({
								issuer: certificate.issuer,
								serialNumber: certificate.serialNumber
							})
						})
					// "encryptedKey" will be calculated in "encrypt" function
					});
					//endregion
				
					//region keyEncryptionAlgorithm
					const aesKWoid = getOIDByAlgorithm({
						name: "AES-KW",
						length: encryptionParameters.kekEncryptionLength
					});
					if(aesKWoid === "")
						throw new Error(`Unknown length for key encryption algorithm: ${encryptionParameters.kekEncryptionLength}`);
				
					const aesKW = new AlgorithmIdentifier({
						algorithmId: aesKWoid,
						algorithmParams: new Null()
					});
					//endregion

					//region KeyAgreeRecipientInfo
					const ecdhOID = getOIDByAlgorithm({
						name: "ECDH",
						kdf: encryptionParameters.kdfAlgorithm
					});
					if(ecdhOID === "")
						throw new Error(`Unknown KDF algorithm: ${encryptionParameters.kdfAlgorithm}`);
				
					// In fact there is no need in so long UKM, but RFC2631
					// has requirement that "UserKeyMaterial" must be 512 bits long
					const ukmBuffer = new ArrayBuffer(64);
					const ukmView = new Uint8Array(ukmBuffer);
					getRandomValues(ukmView); // Generate random values in 64 bytes long buffer
				
					const keyInfo = new KeyAgreeRecipientInfo({
						version: 3,
						// "originator" will be calculated in "encrypt" function because ephemeral key would be generated there
						ukm: new OctetString({ valueHex: ukmBuffer }),
						keyEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: ecdhOID,
							algorithmParams: aesKW.toSchema()
						}),
						recipientEncryptedKeys: new RecipientEncryptedKeys({
							encryptedKeys: [encryptedKey]
						}),
						recipientCertificate: certificate
					});
					//endregion

					//region Final values for "CMS_ENVELOPED_DATA"
					this.recipientInfos.push(new RecipientInfo({
						variant: 2,
						value: keyInfo
					}));
					//endregion
				}
				break;
			default:
				throw new Error(`Unknown "variant" value: ${variant}`);
		}
		//endregion 
		
		return true;
	}
	//**********************************************************************************
	/**
	 * Add recipient based on pre-defined data like password or KEK
	 * @param {ArrayBuffer} preDefinedData ArrayBuffer with pre-defined data
	 * @param {Object} parameters Additional parameters neccessary for "fine tunning" of encryption process
	 * @param {number} variant Variant = 1 for pre-defined "key encryption key" (KEK). Variant = 2 for password-based encryption.
	 */
	addRecipientByPreDefinedData(preDefinedData, parameters, variant)
	{
		//region Initial variables
		const encryptionParameters = parameters || {};
		//endregion
		
		//region Check initial parameters
		if((preDefinedData instanceof ArrayBuffer) === false)
			throw new Error("Please pass \"preDefinedData\" in ArrayBuffer type");
		
		if(preDefinedData.byteLength === 0)
			throw new Error("Pre-defined data could have zero length");
		//endregion
		
		//region Initialize encryption parameters
		if(("keyIdentifier" in encryptionParameters) === false)
		{
			const keyIdentifierBuffer = new ArrayBuffer(16);
			const keyIdentifierView = new Uint8Array(keyIdentifierBuffer);
			getRandomValues(keyIdentifierView);
			
			encryptionParameters.keyIdentifier = keyIdentifierBuffer;
		}
		
		if(("hmacHashAlgorithm" in encryptionParameters) === false)
			encryptionParameters.hmacHashAlgorithm = "SHA-512";
		
		if(("iterationCount" in encryptionParameters) === false)
			encryptionParameters.iterationCount = 2048;
		
		if(("keyEncryptionAlgorithm" in encryptionParameters) === false)
		{
			encryptionParameters.keyEncryptionAlgorithm = {
				name: "AES-KW",
				length: 256
			};
		}
		
		if(("keyEncryptionAlgorithmParams" in encryptionParameters) === false)
			encryptionParameters.keyEncryptionAlgorithmParams = new Null();
		//endregion
		
		//region Add new recipient based on passed variant
		switch(variant)
		{
			case 1: // KEKRecipientInfo
				{
					//region keyEncryptionAlgorithm
					const kekOID = getOIDByAlgorithm(encryptionParameters.keyEncryptionAlgorithm);
					if(kekOID === "")
						throw new Error("Incorrect value for \"keyEncryptionAlgorithm\"");
					//endregion

					//region KEKRecipientInfo
					const keyInfo = new KEKRecipientInfo({
						version: 4,
						kekid: new KEKIdentifier({
							keyIdentifier: new OctetString({ valueHex: encryptionParameters.keyIdentifier })
						}),
						keyEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: kekOID,
							/*
							 For AES-KW params are NULL, but for other algorithm could another situation.
							 */
							algorithmParams: encryptionParameters.keyEncryptionAlgorithmParams
						}),
						preDefinedKEK: preDefinedData
					// "encryptedKey" would be set in "ecrypt" function
					});
					//endregion

					//region Final values for "CMS_ENVELOPED_DATA"
					this.recipientInfos.push(new RecipientInfo({
						variant: 3,
						value: keyInfo
					}));
					//endregion
				}
				break;
			case 2: // PasswordRecipientinfo
				{
					//region keyDerivationAlgorithm
					const pbkdf2OID = getOIDByAlgorithm({
						name: "PBKDF2"
					});
					if(pbkdf2OID === "")
						throw new Error("Can not find OID for PBKDF2");
					//endregion

					//region Salt
					const saltBuffer = new ArrayBuffer(64);
					const saltView = new Uint8Array(saltBuffer);
					getRandomValues(saltView);
					//endregion

					//region HMAC-based algorithm
					const hmacOID = getOIDByAlgorithm({
						name: "HMAC",
						hash: {
							name: encryptionParameters.hmacHashAlgorithm
						}
					});
					if(hmacOID === "")
						throw new Error(`Incorrect value for "hmacHashAlgorithm": ${encryptionParameters.hmacHashAlgorithm}`);
					//endregion

					//region PBKDF2-params
					const pbkdf2Params = new PBKDF2Params({
						salt: new OctetString({ valueHex: saltBuffer }),
						iterationCount: encryptionParameters.iterationCount,
						prf: new AlgorithmIdentifier({
							algorithmId: hmacOID,
							algorithmParams: new Null()
						})
					});
					//endregion

					//region keyEncryptionAlgorithm
					const kekOID = getOIDByAlgorithm(encryptionParameters.keyEncryptionAlgorithm);
					if(kekOID === "")
						throw new Error("Incorrect value for \"keyEncryptionAlgorithm\"");
					//endregion

					//region PasswordRecipientinfo
					const keyInfo = new PasswordRecipientinfo({
						version: 0,
						keyDerivationAlgorithm: new AlgorithmIdentifier({
							algorithmId: pbkdf2OID,
							algorithmParams: pbkdf2Params.toSchema()
						}),
						keyEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: kekOID,
							/*
							 For AES-KW params are NULL, but for other algorithm could be another situation.
							 */
							algorithmParams: encryptionParameters.keyEncryptionAlgorithmParams
						}),
						password: preDefinedData
					// "encryptedKey" would be set in "ecrypt" function
					});
					//endregion

					//region Final values for "CMS_ENVELOPED_DATA"
					this.recipientInfos.push(new RecipientInfo({
						variant: 4,
						value: keyInfo
					}));
					//endregion
				}
				break;
			default:
				throw new Error(`Unknown value for "variant": ${variant}`);
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Create a new CMS Enveloped Data content with encrypted data
	 * @param {Object} contentEncryptionAlgorithm WebCrypto algorithm. For the moment here could be only "AES-CBC" or "AES-GCM" algorithms.
	 * @param {ArrayBuffer} contentToEncrypt Content to encrypt
	 * @returns {Promise}
	 */
	encrypt(contentEncryptionAlgorithm, contentToEncrypt)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		const ivBuffer = new ArrayBuffer(16); // For AES we need IV 16 bytes long
		const ivView = new Uint8Array(ivBuffer);
		getRandomValues(ivView);
		
		const contentView = new Uint8Array(contentToEncrypt);
		
		let sessionKey;
		let encryptedContent;
		let exportedSessionKey;
		
		const recipientsPromises = [];
		
		const _this = this;
		//endregion
		
		//region Check for input parameters
		const contentEncryptionOID = getOIDByAlgorithm(contentEncryptionAlgorithm);
		if(contentEncryptionOID === "")
			return Promise.reject("Wrong \"contentEncryptionAlgorithm\" value");
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Generate new content encryption key
		sequence = sequence.then(() =>
			crypto.generateKey(contentEncryptionAlgorithm, true, ["encrypt"]));
		//endregion
		//region Encrypt content
		sequence = sequence.then(result =>
		{
			sessionKey = result;
			
			return crypto.encrypt({
				name: contentEncryptionAlgorithm.name,
				iv: ivView
			},
			sessionKey,
			contentView);
		}, error =>
			Promise.reject(error));
		//endregion
		//region Export raw content of content encryption key
		sequence = sequence.then(result =>
		{
			//region Create output OCTETSTRING with encrypted content
			encryptedContent = result;
			//endregion
				
			return crypto.exportKey("raw", sessionKey);
		}, error =>
			Promise.reject(error)
		).then(result =>
		{
			exportedSessionKey = result;
			
			return true;
		}, error =>
			Promise.reject(error));
		//endregion
		//region Append common information to CMS_ENVELOPED_DATA
		sequence = sequence.then(() =>
		{
			this.version = 2;
			this.encryptedContentInfo = new EncryptedContentInfo({
				contentType: "1.2.840.113549.1.7.1", // "data"
				contentEncryptionAlgorithm: new AlgorithmIdentifier({
					algorithmId: contentEncryptionOID,
					algorithmParams: new OctetString({ valueHex: ivBuffer })
				}),
				encryptedContent: new OctetString({ valueHex: encryptedContent })
			});
		}, error =>
			Promise.reject(error));
		//endregion
		
		//region Special sub-functions to work with each recipient's type
		function SubKeyAgreeRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			
			let ecdhPublicKey;
			let ecdhPrivateKey;
			
			let recipientCurve;
			let recipientCurveLength;
			
			let exportedECDHPublicKey;
			//endregion
			
			//region Get "namedCurve" parameter from recipient's certificate
			currentSequence = currentSequence.then(() =>
			{
				const curveObject = _this.recipientInfos[index].value.recipientCertificate.subjectPublicKeyInfo.algorithm.algorithmParams;
				
				if((curveObject instanceof ObjectIdentifier) === false)
					return Promise.reject(`Incorrect "recipientCertificate" for index ${index}`);
				
				const curveOID = curveObject.valueBlock.toString();
				
				switch(curveOID)
				{
					case "1.2.840.10045.3.1.7":
						recipientCurve = "P-256";
						recipientCurveLength = 256;
						break;
					case "1.3.132.0.34":
						recipientCurve = "P-384";
						recipientCurveLength = 384;
						break;
					case "1.3.132.0.35":
						recipientCurve = "P-521";
						recipientCurveLength = 528;
						break;
					default:
						return Promise.reject(`Incorrect curve OID for index ${index}`);
				}
				
				return recipientCurve;
			}, error =>
				Promise.reject(error));
			//endregion
			
			//region Generate ephemeral ECDH key
			currentSequence = currentSequence.then(result =>
				crypto.generateKey({
					name: "ECDH",
					namedCurve: result
				},
				true,
				["deriveBits"]),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Export public key of ephemeral ECDH key pair
			currentSequence = currentSequence.then(result =>
			{
				ecdhPublicKey = result.publicKey;
				ecdhPrivateKey = result.privateKey;
					
				return crypto.exportKey("spki", ecdhPublicKey);
			},
			error =>
				Promise.reject(error));
			//endregion
			
			//region Import recipient's public key
			currentSequence = currentSequence.then(result =>
			{
				exportedECDHPublicKey = result;
				
				return _this.recipientInfos[index].value.recipientCertificate.getPublicKey({
					algorithm: {
						algorithm: {
							name: "ECDH",
							namedCurve: recipientCurve
						},
						usages: []
					}
				});
			}, error =>
				Promise.reject(error));
			//endregion
			//region Create shared secret
			currentSequence = currentSequence.then(result => crypto.deriveBits({
				name: "ECDH",
				public: result
			},
			ecdhPrivateKey,
			recipientCurveLength),
			error =>
				Promise.reject(error));
			//endregion
			
			//region Apply KDF function to shared secret
			currentSequence = currentSequence.then(
				/**
				 * @param {ArrayBuffer} result
				 */
				result =>
				{
					//region Get length of used AES-KW algorithm
					const aesKWAlgorithm = new AlgorithmIdentifier({ schema: _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams });
					
					const KWalgorithm = getAlgorithmByOID(aesKWAlgorithm.algorithmId);
					if(("name" in KWalgorithm) === false)
						return Promise.reject(`Incorrect OID for key encryption algorithm: ${aesKWAlgorithm.algorithmId}`);
					//endregion
					
					//region Translate AES-KW length to ArrayBuffer
					let kwLength = KWalgorithm.length;
					
					const kwLengthBuffer = new ArrayBuffer(4);
					const kwLengthView = new Uint8Array(kwLengthBuffer);
					
					for(let j = 3; j >= 0; j--)
					{
						kwLengthView[j] = kwLength;
						kwLength >>= 8;
					}
					//endregion
					
					//region Create and encode "ECC-CMS-SharedInfo" structure
					const eccInfo = new ECCCMSSharedInfo({
						keyInfo: new AlgorithmIdentifier({
							algorithmId: aesKWAlgorithm.algorithmId,
							/*
							 Initially RFC5753 says that AES algorithms have absent parameters.
							 But since early implementations all put NULL here. Thus, in order to be
							 "backward compatible", index also put NULL here.
							 */
							algorithmParams: new Null()
						}),
						entityUInfo: _this.recipientInfos[index].value.ukm,
						suppPubInfo: new OctetString({ valueHex: kwLengthBuffer })
					});
					
					const encodedInfo = eccInfo.toSchema().toBER(false);
					//endregion
					
					//region Get SHA algorithm used together with ECDH
					const ecdhAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
					if(("name" in ecdhAlgorithm) === false)
						return Promise.reject(`Incorrect OID for key encryption algorithm: ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
					//endregion
					
					return kdf(ecdhAlgorithm.kdf, result, KWalgorithm.length, encodedInfo);
				},
				error =>
					Promise.reject(error));
			//endregion
			//region Import AES-KW key from result of KDF function
			currentSequence = currentSequence.then(result =>
				crypto.importKey("raw", result, { name: "AES-KW" }, true, ["wrapKey"]),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Finally wrap session key by using AES-KW algorithm
			currentSequence = currentSequence.then(result => crypto.wrapKey("raw", sessionKey, result, { name: "AES-KW" }),
				error =>
					Promise.reject(error)
			);
			//endregion
			//region Append all neccessary data to current CMS_RECIPIENT_INFO object
			currentSequence = currentSequence.then(result =>
			{
				//region OriginatorIdentifierOrKey
				const asn1 = fromBER(exportedECDHPublicKey);
					
				const originator = new OriginatorIdentifierOrKey();
				originator.variant = 3;
				originator.value = new OriginatorPublicKey({ schema: asn1.result });
				// There is option when we can stay with ECParameters, but here index prefer to avoid the params
				if("algorithmParams" in originator.value.algorithm)
					delete originator.value.algorithm.algorithmParams;
					
				_this.recipientInfos[index].value.originator = originator;
				//endregion
					
				//region RecipientEncryptedKey
				/*
				 We will not support using of same ephemeral key for many recipients
				 */
				_this.recipientInfos[index].value.recipientEncryptedKeys.encryptedKeys[0].encryptedKey = new OctetString({ valueHex: result });
				//endregion
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubKeyTransRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			//endregion
			
			//region Get recipient's public key
			currentSequence = currentSequence.then(() =>
			{
				//region Get current used SHA algorithm
				const schema = _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams;
				const rsaOAEPParams = new RSAESOAEPParams({ schema });
				
				const hashAlgorithm = getAlgorithmByOID(rsaOAEPParams.hashAlgorithm.algorithmId);
				if(("name" in hashAlgorithm) === false)
					return Promise.reject(`Incorrect OID for hash algorithm: ${rsaOAEPParams.hashAlgorithm.algorithmId}`);
				//endregion
				
				return _this.recipientInfos[index].value.recipientCertificate.getPublicKey({
					algorithm: {
						algorithm: {
							name: "RSA-OAEP",
							hash: {
								name: hashAlgorithm.name
							}
						},
						usages: ["encrypt", "wrapKey"]
					}
				});
			}, error =>
				Promise.reject(error));
			//endregion
			//region Encrypt early exported session key on recipient's public key
			currentSequence = currentSequence.then(result =>
				crypto.encrypt(result.algorithm, result, exportedSessionKey),
			error =>
				Promise.reject(error)
			);
			//endregion
			
			//region Append all neccessary data to current CMS_RECIPIENT_INFO object
			currentSequence = currentSequence.then(result =>
			{
				//region RecipientEncryptedKey
				_this.recipientInfos[index].value.encryptedKey = new OctetString({ valueHex: result });
				//endregion
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubKEKRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			let kekAlgorithm;
			//endregion
			
			//region Import KEK from pre-defined data
			currentSequence = currentSequence.then(() =>
			{
				//region Get WebCrypto form of "keyEncryptionAlgorithm"
				kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
				if(("name" in kekAlgorithm) === false)
					return Promise.reject(`Incorrect OID for "keyEncryptionAlgorithm": ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
					//endregion
					
				return crypto.importKey("raw",
					new Uint8Array(_this.recipientInfos[index].value.preDefinedKEK),
					kekAlgorithm,
					true,
					["wrapKey"]); // Too specific for AES-KW
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			//region Wrap previously exported session key
			currentSequence = currentSequence.then(result =>
				crypto.wrapKey("raw", sessionKey, result, kekAlgorithm),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Append all neccessary data to current CMS_RECIPIENT_INFO object
			currentSequence = currentSequence.then(result =>
			{
				//region RecipientEncryptedKey
				_this.recipientInfos[index].value.encryptedKey = new OctetString({ valueHex: result });
				//endregion
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubPasswordRecipientinfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			let pbkdf2Params;
			let kekAlgorithm;
			//endregion
			
			//region Check that we have encoded "keyDerivationAlgorithm" plus "PBKDF2_params" in there
			currentSequence = currentSequence.then(() =>
			{
				if(("keyDerivationAlgorithm" in _this.recipientInfos[index].value) === false)
					return Promise.reject("Please append encoded \"keyDerivationAlgorithm\"");
					
				if(("algorithmParams" in _this.recipientInfos[index].value.keyDerivationAlgorithm) === false)
					return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
					
				try
				{
					pbkdf2Params = new PBKDF2Params({ schema: _this.recipientInfos[index].value.keyDerivationAlgorithm.algorithmParams });
				}
				catch(ex)
				{
					return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
				}
					
				return Promise.resolve();
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Derive PBKDF2 key from "password" buffer
			currentSequence = currentSequence.then(() =>
			{
				const passwordView = new Uint8Array(_this.recipientInfos[index].value.password);
					
				return crypto.importKey("raw",
					passwordView,
					"PBKDF2",
					false,
					["deriveKey"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Derive key for "keyEncryptionAlgorithm"
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of "keyEncryptionAlgorithm"
				kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
				if(("name" in kekAlgorithm) === false)
					return Promise.reject(`Incorrect OID for "keyEncryptionAlgorithm": ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
				//endregion
				
				//region Get HMAC hash algorithm
				let hmacHashAlgorithm = "SHA-1";
					
				if("prf" in pbkdf2Params)
				{
					const algorithm = getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
					if(("name" in algorithm) === false)
						return Promise.reject("Incorrect OID for HMAC hash algorithm");
						
					hmacHashAlgorithm = algorithm.hash.name;
				}
				//endregion
				
				//region Get PBKDF2 "salt" value
				const saltView = new Uint8Array(pbkdf2Params.salt.valueBlock.valueHex);
				//endregion
					
				//region Get PBKDF2 iterations count
				const iterations = pbkdf2Params.iterationCount;
				//endregion
					
				return crypto.deriveKey({
					name: "PBKDF2",
					hash: {
						name: hmacHashAlgorithm
					},
					salt: saltView,
					iterations
				},
				result,
				kekAlgorithm,
				true,
				["wrapKey"]); // Usages are too specific for KEK algorithm
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Wrap previously exported session key (Also too specific for KEK algorithm)
			currentSequence = currentSequence.then(result =>
				crypto.wrapKey("raw", sessionKey, result, kekAlgorithm),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Append all neccessary data to current CMS_RECIPIENT_INFO object
			currentSequence = currentSequence.then(result =>
			{
				//region RecipientEncryptedKey
				_this.recipientInfos[index].value.encryptedKey = new OctetString({ valueHex: result });
				//endregion
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		//endregion
		
		//region Create special routines for each "recipient"
		sequence = sequence.then(() =>
		{
			for(let i = 0; i < this.recipientInfos.length; i++)
			{
				//region Initial variables
				let currentSequence = Promise.resolve();
				//endregion
					
				switch(this.recipientInfos[i].variant)
				{
					case 1: // KeyTransRecipientInfo
						currentSequence = SubKeyTransRecipientInfo(i);
						break;
					case 2: // KeyAgreeRecipientInfo
						currentSequence = SubKeyAgreeRecipientInfo(i);
						break;
					case 3: // KEKRecipientInfo
						currentSequence = SubKEKRecipientInfo(i);
						break;
					case 4: // PasswordRecipientinfo
						currentSequence = SubPasswordRecipientinfo(i);
						break;
					default:
						return Promise.reject(`Uknown recipient type in array with index ${i}`);
				}
					
				recipientsPromises.push(currentSequence);
			}
				
			return Promise.all(recipientsPromises);
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Decrypt existing CMS Enveloped Data content
	 * @param {number} recipientIndex Index of recipient
	 * @param {Object} parameters Additional parameters
	 * @returns {Promise}
	 */
	decrypt(recipientIndex, parameters)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		const decryptionParameters = parameters || {};
		
		const _this = this;
		//endregion
		
		//region Check for input parameters
		if((recipientIndex + 1) > this.recipientInfos.length)
			return Promise.reject(`Maximum value for "index" is: ${this.recipientInfos.length - 1}`);
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Special sub-functions to work with each recipient's type
		function SubKeyAgreeRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			
			let recipientCurve;
			let recipientCurveLength;
			
			let curveOID;
			
			let ecdhPrivateKey;
			//endregion
			
			//region Get "namedCurve" parameter from recipient's certificate
			currentSequence = currentSequence.then(() =>
			{
				if(("recipientCertificate" in decryptionParameters) === false)
					return Promise.reject("Parameter \"recipientCertificate\" is mandatory for \"KeyAgreeRecipientInfo\"");
					
				if(("recipientPrivateKey" in decryptionParameters) === false)
					return Promise.reject("Parameter \"recipientPrivateKey\" is mandatory for \"KeyAgreeRecipientInfo\"");
					
				const curveObject = decryptionParameters.recipientCertificate.subjectPublicKeyInfo.algorithm.algorithmParams;
					
				if((curveObject instanceof ObjectIdentifier) === false)
					return Promise.reject(`Incorrect "recipientCertificate" for index ${index}`);
					
				curveOID = curveObject.valueBlock.toString();
					
				switch(curveOID)
				{
					case "1.2.840.10045.3.1.7":
						recipientCurve = "P-256";
						recipientCurveLength = 256;
						break;
					case "1.3.132.0.34":
						recipientCurve = "P-384";
						recipientCurveLength = 384;
						break;
					case "1.3.132.0.35":
						recipientCurve = "P-521";
						recipientCurveLength = 528;
						break;
					default:
						return Promise.reject(`Incorrect curve OID for index ${index}`);
				}
					
				return crypto.importKey("pkcs8",
					decryptionParameters.recipientPrivateKey,
					{
						name: "ECDH",
						namedCurve: recipientCurve
					},
					true,
					["deriveBits"]
				);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Import sender's ephemeral public key
			currentSequence = currentSequence.then(result =>
			{
				ecdhPrivateKey = result;
					
				//region Change "OriginatorPublicKey" if "curve" parameter absent
				if(("algorithmParams" in _this.recipientInfos[index].value.originator.value.algorithm) === false)
					_this.recipientInfos[index].value.originator.value.algorithm.algorithmParams = new ObjectIdentifier({ value: curveOID });
				//endregion
				
				//region Create ArrayBuffer with sender's public key
				const buffer = _this.recipientInfos[index].value.originator.value.toSchema().toBER(false);
				//endregion
					
				return crypto.importKey("spki",
					buffer,
					{
						name: "ECDH",
						namedCurve: recipientCurve
					},
					true,
					[]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Create shared secret
			currentSequence = currentSequence.then(result =>
				crypto.deriveBits({
					name: "ECDH",
					public: result
				},
				ecdhPrivateKey,
				recipientCurveLength),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Apply KDF function to shared secret
			currentSequence = currentSequence.then(
				/**
				 * @param {ArrayBuffer} result
				 */
				result =>
				{
					//region Get length of used AES-KW algorithm
					const aesKWAlgorithm = new AlgorithmIdentifier({ schema: _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams });
					
					const KWalgorithm = getAlgorithmByOID(aesKWAlgorithm.algorithmId);
					if(("name" in KWalgorithm) === false)
						return Promise.reject(`Incorrect OID for key encryption algorithm: ${aesKWAlgorithm.algorithmId}`);
						//endregion
						
						//region Translate AES-KW length to ArrayBuffer
					let kwLength = KWalgorithm.length;
					
					const kwLengthBuffer = new ArrayBuffer(4);
					const kwLengthView = new Uint8Array(kwLengthBuffer);
					
					for(let j = 3; j >= 0; j--)
					{
						kwLengthView[j] = kwLength;
						kwLength >>= 8;
					}
					//endregion
					
					//region Create and encode "ECC-CMS-SharedInfo" structure
					const eccInfo = new ECCCMSSharedInfo({
						keyInfo: new AlgorithmIdentifier({
							algorithmId: aesKWAlgorithm.algorithmId,
							/*
							 Initially RFC5753 says that AES algorithms have absent parameters.
							 But since early implementations all put NULL here. Thus, in order to be
							 "backward compatible", index also put NULL here.
							 */
							algorithmParams: new Null()
						}),
						entityUInfo: _this.recipientInfos[index].value.ukm,
						suppPubInfo: new OctetString({ valueHex: kwLengthBuffer })
					});
					
					const encodedInfo = eccInfo.toSchema().toBER(false);
					//endregion
					
					//region Get SHA algorithm used together with ECDH
					const ecdhAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
					if(("name" in ecdhAlgorithm) === false)
						return Promise.reject(`Incorrect OID for key encryption algorithm: ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
						//endregion
						
					return kdf(ecdhAlgorithm.kdf, result, KWalgorithm.length, encodedInfo);
				},
				error =>
					Promise.reject(error)
			);
			//endregion
			//region Import AES-KW key from result of KDF function
			currentSequence = currentSequence.then(result =>
				crypto.importKey("raw",
					result,
					{ name: "AES-KW" },
					true,
					["unwrapKey"]),
			error => Promise.reject(error)
			);
			//endregion
			//region Finally unwrap session key
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of content encryption algorithm
				const contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
				if(("name" in contentEncryptionAlgorithm) === false)
					return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
					//endregion
					
				return crypto.unwrapKey("raw",
					_this.recipientInfos[index].value.recipientEncryptedKeys.encryptedKeys[0].encryptedKey.valueBlock.valueHex,
					result,
					{ name: "AES-KW" },
					contentEncryptionAlgorithm,
					true,
					["decrypt"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubKeyTransRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			//endregion
			
			//region Import recipient's private key
			currentSequence = currentSequence.then(() =>
			{
				if(("recipientPrivateKey" in decryptionParameters) === false)
					return Promise.reject("Parameter \"recipientPrivateKey\" is mandatory for \"KeyTransRecipientInfo\"");
					
				//region Get current used SHA algorithm
				const schema = _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams;
				const rsaOAEPParams = new RSAESOAEPParams({ schema });
					
				const hashAlgorithm = getAlgorithmByOID(rsaOAEPParams.hashAlgorithm.algorithmId);
				if(("name" in hashAlgorithm) === false)
					return Promise.reject(`Incorrect OID for hash algorithm: ${rsaOAEPParams.hashAlgorithm.algorithmId}`);
				//endregion
					
				return crypto.importKey("pkcs8",
					decryptionParameters.recipientPrivateKey,
					{
						name: "RSA-OAEP",
						hash: {
							name: hashAlgorithm.name
						}
					},
					true,
					["decrypt"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Decrypt encrypted session key
			currentSequence = currentSequence.then(result =>
				crypto.decrypt(result.algorithm,
					result,
					_this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex
				), error =>
				Promise.reject(error)
			);
			//endregion
			//region Import decrypted session key
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of content encryption algorithm
				const contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
				if(("name" in contentEncryptionAlgorithm) === false)
					return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
				//endregion
					
				return crypto.importKey("raw",
					result,
					contentEncryptionAlgorithm,
					true,
					["decrypt"]
				);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubKEKRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			let kekAlgorithm;
			//endregion
			
			//region Import KEK from pre-defined data
			currentSequence = currentSequence.then(() =>
			{
				if(("preDefinedData" in decryptionParameters) === false)
					return Promise.reject("Parameter \"preDefinedData\" is mandatory for \"KEKRecipientInfo\"");
					
				//region Get WebCrypto form of "keyEncryptionAlgorithm"
				kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
				if(("name" in kekAlgorithm) === false)
					return Promise.reject(`Incorrect OID for "keyEncryptionAlgorithm": ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
				//endregion
					
				return crypto.importKey("raw",
					decryptionParameters.preDefinedData,
					kekAlgorithm,
					true,
					["unwrapKey"]); // Too specific for AES-KW
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Unwrap previously exported session key
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of content encryption algorithm
				const contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
				if(("name" in contentEncryptionAlgorithm) === false)
					return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
				//endregion
					
				return crypto.unwrapKey("raw",
					_this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex,
					result,
					kekAlgorithm,
					contentEncryptionAlgorithm,
					true,
					["decrypt"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubPasswordRecipientinfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			let pbkdf2Params;
			let kekAlgorithm;
			//endregion
			
			//region Derive PBKDF2 key from "password" buffer
			currentSequence = currentSequence.then(() =>
			{
				if(("preDefinedData" in decryptionParameters) === false)
					return Promise.reject("Parameter \"preDefinedData\" is mandatory for \"KEKRecipientInfo\"");
					
				if(("keyDerivationAlgorithm" in _this.recipientInfos[index].value) === false)
					return Promise.reject("Please append encoded \"keyDerivationAlgorithm\"");
					
				if(("algorithmParams" in _this.recipientInfos[index].value.keyDerivationAlgorithm) === false)
					return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
					
				try
				{
					pbkdf2Params = new PBKDF2Params({ schema: _this.recipientInfos[index].value.keyDerivationAlgorithm.algorithmParams });
				}
				catch(ex)
				{
					return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
				}
					
				return crypto.importKey("raw",
					decryptionParameters.preDefinedData,
					"PBKDF2",
					false,
					["deriveKey"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Derive key for "keyEncryptionAlgorithm"
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of "keyEncryptionAlgorithm"
				kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
				if(("name" in kekAlgorithm) === false)
					return Promise.reject(`Incorrect OID for "keyEncryptionAlgorithm": ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
				//endregion
				
				//region Get HMAC hash algorithm
				let hmacHashAlgorithm = "SHA-1";
					
				if("prf" in pbkdf2Params)
				{
					const algorithm = getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
					if(("name" in algorithm) === false)
						return Promise.reject("Incorrect OID for HMAC hash algorithm");
						
					hmacHashAlgorithm = algorithm.hash.name;
				}
				//endregion
				
				//region Get PBKDF2 "salt" value
				const saltView = new Uint8Array(pbkdf2Params.salt.valueBlock.valueHex);
				//endregion
					
				//region Get PBKDF2 iterations count
				const iterations = pbkdf2Params.iterationCount;
				//endregion
					
				return crypto.deriveKey({
					name: "PBKDF2",
					hash: {
						name: hmacHashAlgorithm
					},
					salt: saltView,
					iterations
				},
				result,
				kekAlgorithm,
				true,
				["unwrapKey"]); // Usages are too specific for KEK algorithm
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Unwrap previously exported session key
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of content encryption algorithm
				const contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
				if(("name" in contentEncryptionAlgorithm) === false)
					return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
					//endregion
					
				return crypto.unwrapKey("raw",
					_this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex,
					result,
					kekAlgorithm,
					contentEncryptionAlgorithm,
					true,
					["decrypt"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		//endregion
		
		//region Perform steps, specific to each type of session key encryption
		sequence = sequence.then(() =>
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			//endregion
				
			switch(this.recipientInfos[recipientIndex].variant)
			{
				case 1: // KeyTransRecipientInfo
					currentSequence = SubKeyTransRecipientInfo(recipientIndex);
					break;
				case 2: // KeyAgreeRecipientInfo
					currentSequence = SubKeyAgreeRecipientInfo(recipientIndex);
					break;
				case 3: // KEKRecipientInfo
					currentSequence = SubKEKRecipientInfo(recipientIndex);
					break;
				case 4: // PasswordRecipientinfo
					currentSequence = SubPasswordRecipientinfo(recipientIndex);
					break;
				default:
					return Promise.reject(`Uknown recipient type in array with index ${recipientIndex}`);
			}
				
			return currentSequence;
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		//region Finally decrypt data by session key
		sequence = sequence.then(result =>
		{
			//region Get WebCrypto form of content encryption algorithm
			const contentEncryptionAlgorithm = getAlgorithmByOID(this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
			if(("name" in contentEncryptionAlgorithm) === false)
				return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
			//endregion
			
			//region Get "intialization vector" for content encryption algorithm
			const ivBuffer = this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams.valueBlock.valueHex;
			const ivView = new Uint8Array(ivBuffer);
			//endregion
			
			//region Create correct data block for decryption
			let dataBuffer = new ArrayBuffer(0);
				
			if(this.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false)
				dataBuffer = this.encryptedContentInfo.encryptedContent.valueBlock.valueHex;
			else
			{
				for(const content of this.encryptedContentInfo.encryptedContent.valueBlock.value)
					dataBuffer = utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
			}
			//endregion
				
			return crypto.decrypt({
				name: contentEncryptionAlgorithm.name,
				iv: ivView
			},
			result,
			dataBuffer);
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************

//**************************************************************************************
/**
 * Class from RFC5652
 */
class ContentInfo
{
	//**********************************************************************************
	/**
	 * Constructor for ContentInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc contentType
		 */
		this.contentType = getParametersValue(parameters, "contentType", ContentInfo.defaultValues("contentType"));
		/**
		 * @type {Any}
		 * @desc content
		 */
		this.content = getParametersValue(parameters, "content", ContentInfo.defaultValues("content"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "contentType":
				return "";
			case "content":
				return new Any();
			default:
				throw new Error(`Invalid member name for ContentInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "contentType":
				return (memberValue === "");
			case "content":
				return (memberValue instanceof Any);
			default:
				throw new Error(`Invalid member name for ContentInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * ContentInfo ::= SEQUENCE {
	 *    contentType ContentType,
	 *    content [0] EXPLICIT ANY DEFINED BY contentType }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [contentType]
		 * @property {string} [content]
		 */
		const names = getParametersValue(parameters, "names", {});

		if(("optional" in names) === false)
			names.optional = false;

		return (new Sequence({
			name: (names.blockName || "ContentInfo"),
			optional: names.optional,
			value: [
				new ObjectIdentifier({ name: (names.contentType || "contentType") }),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new Any({ name: (names.content || "content") })] // EXPLICIT ANY value
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"contentType",
			"content"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = compareSchema(schema,
			schema,
			ContentInfo.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ContentInfo");
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
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new Sequence({
			value: [
				new ObjectIdentifier({ value: this.contentType }),
				new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [this.content] // EXPLICIT ANY value
				})
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			contentType: this.contentType
		};

		if(!(this.content instanceof Any))
			object.content = this.content.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************

/* eslint-disable no-undef,no-unreachable */
//<nodewebcryptoossl>
//*********************************************************************************
let encryptionVariant = 2;
const encryptionAlgorithm = {
	name: "AES-CBC",
	length: 128
};

let preDefinedDataBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);
let cmsEnvelopedBuffer = new ArrayBuffer(0);
//*********************************************************************************
//region Auxiliary functions
//*********************************************************************************
function formatPEM(pemString)
{
	const stringLength = pemString.length;
	let resultString = "";
	
	for(let i = 0, count = 0; i < stringLength; i++, count++)
	{
		if(count > 63)
		{
			resultString = `${resultString}\r\n`;
			count = 0;
		}
		
		resultString = `${resultString}${pemString[i]}`;
	}
	
	return resultString;
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Encrypt input data
//*********************************************************************************
function envelopedEncryptInternal()
{
	//region Get input pre-defined data
	/*
	 This is an example only and we consider that key encryption algorithm
	 has key length in 256 bits (default value).
	 */
	if(encryptionVariant === 1)
	{
		if(preDefinedDataBuffer.byteLength > 32)
		{
			const newPreDefinedDataBuffer = new ArrayBuffer(32);
			const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
			
			const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
			
			for(let i = 0; i < 32; i++)
				newPreDefinedDataView[i] = preDefinedDataView[i];
			
			preDefinedDataBuffer = newPreDefinedDataBuffer;
		}
		
		if(preDefinedDataBuffer.byteLength < 32)
		{
			const newPreDefinedDataBuffer = new ArrayBuffer(32);
			const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
			
			const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
			
			for(let i = 0; i < preDefinedDataBuffer.byteLength; i++)
				newPreDefinedDataView[i] = preDefinedDataView[i];
			
			preDefinedDataBuffer = newPreDefinedDataBuffer;
		}
	}
	//endregion
	
	const cmsEnveloped = new EnvelopedData();
	
	cmsEnveloped.addRecipientByPreDefinedData(preDefinedDataBuffer, {}, encryptionVariant);
	
	return cmsEnveloped.encrypt(encryptionAlgorithm, valueBuffer).
		then(
			() =>
			{
				const cmsContentSimpl = new ContentInfo();
				cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
				cmsContentSimpl.content = cmsEnveloped.toSchema();
				
				cmsEnvelopedBuffer = cmsContentSimpl.toSchema().toBER(false);
			},
			error => Promise.reject(`ERROR DURING ENCRYPTION PROCESS: ${error}`)
		);
}
//*********************************************************************************
function envelopedEncrypt()
{
	return Promise.resolve().then(() =>
	{
		preDefinedDataBuffer = stringToArrayBuffer(document.getElementById("password").value);
		valueBuffer =  stringToArrayBuffer(document.getElementById("content").value);
	}).then(() => envelopedEncryptInternal()).then(() =>
	{
		let resultString = "-----BEGIN CMS-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(cmsEnvelopedBuffer)))}`;
		resultString = `${resultString}\r\n-----END CMS-----\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("encrypted_content").innerHTML = resultString;
		
		alert("Encryption process finished successfully");
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Decrypt input data
//*********************************************************************************
function envelopedDecryptInternal()
{
	//region Get input pre-defined data
	/*
	 This is an example only and we consider that key encryption algorithm
	 has key length in 256 bits (default value).
	 */
	if(encryptionVariant === 1)
	{
		if(preDefinedDataBuffer.byteLength > 32)
		{
			const newPreDefinedDataBuffer = new ArrayBuffer(32);
			const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
			
			const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
			
			for(let i = 0; i < 32; i++)
				newPreDefinedDataView[i] = preDefinedDataView[i];
			
			preDefinedDataBuffer = newPreDefinedDataBuffer;
		}
		
		if(preDefinedDataBuffer.byteLength < 32)
		{
			const newPreDefinedDataBuffer = new ArrayBuffer(32);
			const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
			
			const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
			
			for(let i = 0; i < preDefinedDataBuffer.byteLength; i++)
				newPreDefinedDataView[i] = preDefinedDataView[i];
			
			preDefinedDataBuffer = newPreDefinedDataBuffer;
		}
	}
	//endregion
	
	//region Decode CMS Enveloped content
	const asn1 = fromBER(cmsEnvelopedBuffer);
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	const cmsEnvelopedSimp = new EnvelopedData({ schema: cmsContentSimpl.content });
	//endregion
	
	return cmsEnvelopedSimp.decrypt(0,
		{
			preDefinedData: preDefinedDataBuffer
		});
}
//*********************************************************************************
function envelopedDecrypt()
{
	return Promise.resolve().then(() =>
	{
		preDefinedDataBuffer = stringToArrayBuffer(document.getElementById("password").value);
		
		// noinspection InnerHTMLJS
		let encodedCMSEnveloped = document.getElementById("encrypted_content").innerHTML;
		let clearEncodedCMSEnveloped = encodedCMSEnveloped.replace(/(-----(BEGIN|END)( NEW)? CMS-----|\n)/g, "");
		cmsEnvelopedBuffer = stringToArrayBuffer(fromBase64(clearEncodedCMSEnveloped));
	}).then(() => envelopedDecryptInternal()).then(result =>
	{
		// noinspection InnerHTMLJS
		document.getElementById("decrypted_content").innerHTML = arrayBufferToString(result);
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
function handleContentEncAlgOnChange()
{
	const encryptionAlgorithmSelect = document.getElementById("content_enc_alg").value;
	switch(encryptionAlgorithmSelect)
	{
		case "alg_CBC":
			encryptionAlgorithm.name = "AES-CBC";
			break;
		case "alg_GCM":
			encryptionAlgorithm.name = "AES-GCM";
			break;
		default:
	}
}
//*********************************************************************************
function handleContentEncLenOnChange()
{
	const encryptionAlgorithmLengthSelect = document.getElementById("content_enc_alg_len").value;
	switch(encryptionAlgorithmLengthSelect)
	{
		case "len_128":
			encryptionAlgorithm.length = 128;
			break;
		case "len_192":
			encryptionAlgorithm.length = 192;
			break;
		case "len_256":
			encryptionAlgorithm.length = 256;
			break;
		default:
	}
}
//*********************************************************************************
function handleContentTypeOnChange()
{
	const encryptionSelect = document.getElementById("content_type").value;
	switch(encryptionSelect)
	{
		case "type_pass":
			encryptionVariant = 2;
			break;
		case "type_kek":
			encryptionVariant = 1;
			break;
		default:
	}
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	envelopedEncrypt();
	envelopedDecrypt();
	handleContentEncAlgOnChange();
	handleContentEncLenOnChange();
	handleContentTypeOnChange();
	setEngine();
});
//*********************************************************************************
context("How To Encrypt CMS via Password", () =>
{
	//region Initial variables
	const encryptionVariants = [1, 2];
	const encAlgs = ["AES-CBC", "AES-GCM"];
	const encLens = [128, 192, 256];
	
	valueBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
	preDefinedDataBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
	//endregion
	
	encAlgs.forEach(_encAlg =>
	{
		encLens.forEach(_encLen =>
		{
			encryptionVariants.forEach(_encryptionVariant =>
			{
				const testName = `${_encAlg} with ${_encLen}, ${(_encryptionVariant === 2) ? "Password-based encryption" : "Pre-defined KEK"}`;
				
				it(testName, () =>
				{
					encryptionAlgorithm.name = _encAlg;
					encryptionAlgorithm.length = _encLen;
					
					encryptionVariant = _encryptionVariant;
					
					return envelopedEncryptInternal().then(() => envelopedDecryptInternal()).then(result =>
					{
						assert.equal(isEqualBuffer(result, valueBuffer), true, "Decrypted value must be equal with initially encrypted value");
					});
				});
			});
		});
	});
});
//*********************************************************************************
