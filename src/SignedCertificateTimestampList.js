import * as asn1js from "asn1js";
import { getParametersValue, utilFromBase, utilToBase, bufferToHexCodes, toBase64, fromBase64, arrayBufferToString, stringToArrayBuffer } from "pvutils";
import { ByteStream, SeqStream } from "bytestreamjs";
import { getCrypto, getEngine } from "./common.js";
import PublicKeyInfo from "./PublicKeyInfo.js";
//**************************************************************************************
export class SignedCertificateTimestamp
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
				return new asn1js.Any();
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
			
			const asn1 = asn1js.fromBER(signatureData);
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
		
		const asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(publicKeyBase64)));
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
export default class SignedCertificateTimestampList
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
//**************************************************************************************
/**
 * Verify SignedCertificateTimestamp for specific certificate content
 * @param {Certificate} certificate Certificate for which verification would be performed
 * @param {Certificate} issuerCertificate Certificate of the issuer of target certificate
 * @param {Object[]} logs Array of objects with information about each CT Log (like here: https://ct.grahamedgecombe.com/logs.json)
 * @param {String} logs.log_id Identifier of the CT Log encoded in BASE-64 format
 * @param {String} logs.key Public key of the CT Log encoded in BASE-64 format
 * @param {Number} [index=-1] Index of SignedCertificateTimestamp inside SignedCertificateTimestampList (for -1 would verify all)
 * @return {Array} Array of verification results
 */
export async function verifySCTsForCertificate(certificate, issuerCertificate, logs, index = (-1))
{
	//region Initial variables
	let parsedValue = null;
	let tbs;
	let issuerId;
	
	const stream = new SeqStream();
	
	let preCert;
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("Unable to create WebCrypto object");
	//endregion
	
	//region Remove certificate extension
	for(let i = 0; i < certificate.extensions.length; i++)
	{
		switch(certificate.extensions[i].extnID)
		{
			case "1.3.6.1.4.1.11129.2.4.2":
				{
					parsedValue = certificate.extensions[i].parsedValue;
					
					if(parsedValue.timestamps.length === 0)
						throw new Error("Nothing to verify in the certificate");
					
					certificate.extensions.splice(i, 1);
				}
				break;
			default:
		}
	}
	//endregion
	
	//region Check we do have what to verify
	if(parsedValue === null)
		throw new Error("No SignedCertificateTimestampList extension in the specified certificate");
	//endregion
	
	//region Prepare modifier TBS value
	tbs = certificate.encodeTBS().toBER(false);
	//endregion
	
	//region Initialize "issuer_key_hash" value
	issuerId = await crypto.digest({ name: "SHA-256" }, new Uint8Array(issuerCertificate.subjectPublicKeyInfo.toSchema().toBER(false)));
	//endregion
	
	//region Make final "PreCert" value
	stream.appendView(new Uint8Array(issuerId));
	stream.appendUint24(tbs.byteLength);
	stream.appendView(new Uint8Array(tbs));
	
	preCert = stream._stream._buffer.slice(0, stream._length);
	//endregion
	
	//region Call verification function for specified index
	if(index === (-1))
	{
		const verifyArray = [];
		
		for(const timestamp of parsedValue.timestamps)
		{
			const verifyResult = await timestamp.verify(logs, preCert, 1);
			verifyArray.push(verifyResult);
		}
		
		return verifyArray;
	}
	
	if(index >= parsedValue.timestamps.length)
		index = (parsedValue.timestamps.length - 1);
	
	return [await parsedValue.timestamps[index].verify(logs, preCert, 1)];
	//endregion
}
//**********************************************************************************
