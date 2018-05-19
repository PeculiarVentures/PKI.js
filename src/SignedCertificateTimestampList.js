import * as asn1js from "asn1js";
import { getParametersValue, utilFromBase, utilToBase } from "pvutils";
import { ByteStream, SeqStream } from "bytestreamjs";
//**************************************************************************************
export class SignedCertificateTimestamp
{
	//**********************************************************************************
	/**
	 * Constructor for SignedCertificateTimestamp class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @description version
		 */
		this.version = getParametersValue(parameters, "version", SignedCertificateTimestamp.defaultValues("version"));
		/**
		 * @type {ArrayBuffer}
		 * @description logID
		 */
		this.logID = getParametersValue(parameters, "logID", SignedCertificateTimestamp.defaultValues("logID"));
		/**
		 * @type {Date}
		 * @description timestamp
		 */
		this.timestamp = getParametersValue(parameters, "timestamp", SignedCertificateTimestamp.defaultValues("timestamp"));
		/**
		 * @type {ArrayBuffer}
		 * @description extensions
		 */
		this.extensions = getParametersValue(parameters, "extensions", SignedCertificateTimestamp.defaultValues("extensions"));
		/**
		 * @type {string}
		 * @description hashAlgorithm
		 */
		this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", SignedCertificateTimestamp.defaultValues("hashAlgorithm"));
		/**
		 * @type {string}
		 * @description signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", SignedCertificateTimestamp.defaultValues("signatureAlgorithm"));
		/**
		 * @type {Object}
		 * @description signature
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
				return {};
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
		if((schema instanceof asn1js.RawData) === false)
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
		
		const asn1 = asn1js.fromBER(signatureData);
		if(asn1.offset === (-1))
			throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
		
		this.signature = asn1.result;
		//endregion
		
		if(blockLength !== (47 + extensionsLength + signatureLength))
			throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const stream = this.toStream();
		
		return new asn1js.RawData({ data: stream.stream.buffer });
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
		timeView.set(baseArray, 8 - baseArray.byteLength);
		
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
}
//**************************************************************************************
/**
 * Class from RFC6962
 */
export default class SignedCertificateTimestampList
{
	//**********************************************************************************
	/**
	 * Constructor for SignedCertificateTimestampList class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<SignedCertificateTimestamp>}
		 * @description timestamps
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
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		//SignedCertificateTimestampList ::= OCTET STRING

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [optional]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		if(("optional" in names) === false)
			names.optional = false;
		
		return (new asn1js.OctetString({
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
		if((schema instanceof asn1js.OctetString) === false)
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
		
		return new asn1js.OctetString({ valueHex: stream.stream.buffer.slice(0) });
	}
	//**********************************************************************************
}
//**************************************************************************************
