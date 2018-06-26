import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import AlgorithmIdentifier from "./AlgorithmIdentifier.js";
import SignedAndUnsignedAttributes from "./SignedAndUnsignedAttributes.js";
import IssuerAndSerialNumber from "./IssuerAndSerialNumber.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class SignerInfo 
{
	//**********************************************************************************
	/**
	 * Constructor for SignerInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", SignerInfo.defaultValues("version"));
		/**
		 * @type {Object}
		 * @desc sid
		 */
		this.sid = getParametersValue(parameters, "sid", SignerInfo.defaultValues("sid"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc digestAlgorithm
		 */
		this.digestAlgorithm = getParametersValue(parameters, "digestAlgorithm", SignerInfo.defaultValues("digestAlgorithm"));
		
		if("signedAttrs" in parameters)
			/**
			 * @type {SignedAndUnsignedAttributes}
			 * @desc signedAttrs
			 */
			this.signedAttrs = getParametersValue(parameters, "signedAttrs", SignerInfo.defaultValues("signedAttrs"));
		
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc digestAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", SignerInfo.defaultValues("signatureAlgorithm"));
		/**
		 * @type {OctetString}
		 * @desc signature
		 */
		this.signature = getParametersValue(parameters, "signature", SignerInfo.defaultValues("signature"));
		
		if("unsignedAttrs" in parameters)
			/**
			 * @type {SignedAndUnsignedAttributes}
			 * @desc unsignedAttrs
			 */
			this.unsignedAttrs = getParametersValue(parameters, "unsignedAttrs", SignerInfo.defaultValues("unsignedAttrs"));
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
			case "sid":
				return new asn1js.Any();
			case "digestAlgorithm":
				return new AlgorithmIdentifier();
			case "signedAttrs":
				return new SignedAndUnsignedAttributes({ type: 0 });
			case "signatureAlgorithm":
				return new AlgorithmIdentifier();
			case "signature":
				return new asn1js.OctetString();
			case "unsignedAttrs":
				return new SignedAndUnsignedAttributes({ type: 1 });
			default:
				throw new Error(`Invalid member name for SignerInfo class: ${memberName}`);
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
				return (SignerInfo.defaultValues("version") === memberValue);
			case "sid":
				return (memberValue instanceof asn1js.Any);
			case "digestAlgorithm":
				if((memberValue instanceof AlgorithmIdentifier) === false)
					return false;

				return memberValue.isEqual(SignerInfo.defaultValues("digestAlgorithm"));
			case "signedAttrs":
				return ((SignedAndUnsignedAttributes.compareWithDefault("type", memberValue.type))
				&& (SignedAndUnsignedAttributes.compareWithDefault("attributes", memberValue.attributes))
				&& (SignedAndUnsignedAttributes.compareWithDefault("encodedValue", memberValue.encodedValue)));
			case "signatureAlgorithm":
				if((memberValue instanceof AlgorithmIdentifier) === false)
					return false;

				return memberValue.isEqual(SignerInfo.defaultValues("signatureAlgorithm"));
			case "signature":
			case "unsignedAttrs":
				return ((SignedAndUnsignedAttributes.compareWithDefault("type", memberValue.type))
				&& (SignedAndUnsignedAttributes.compareWithDefault("attributes", memberValue.attributes))
				&& (SignedAndUnsignedAttributes.compareWithDefault("encodedValue", memberValue.encodedValue)));
			default:
				throw new Error(`Invalid member name for SignerInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * SignerInfo ::= SEQUENCE {
	 *    version CMSVersion,
	 *    sid SignerIdentifier,
	 *    digestAlgorithm DigestAlgorithmIdentifier,
	 *    signedAttrs [0] IMPLICIT SignedAttributes OPTIONAL,
	 *    signatureAlgorithm SignatureAlgorithmIdentifier,
	 *    signature SignatureValue,
	 *    unsignedAttrs [1] IMPLICIT UnsignedAttributes OPTIONAL }
	 *
	 * SignerIdentifier ::= CHOICE {
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
		 * @property {string} [version]
		 * @property {string} [sid]
		 * @property {string} [digestAlgorithm]
		 * @property {string} [signedAttrs]
		 * @property {string} [signatureAlgorithm]
		 * @property {string} [signature]
		 * @property {string} [unsignedAttrs]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (
			new asn1js.Sequence({
				name: "SignerInfo",
				value: [
					new asn1js.Integer({ name: (names.version || "SignerInfo.version") }),
					new asn1js.Choice({
						value: [
							IssuerAndSerialNumber.schema(names.sid || {
								names: {
									blockName: "SignerInfo.sid"
								}
							}),
							new asn1js.Constructed({
								optional: true,
								name: (names.sid || "SignerInfo.sid"),
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 0 // [0]
								},
								value: [new asn1js.OctetString()]
							})
						]
					}),
					AlgorithmIdentifier.schema(names.digestAlgorithm || {
						names: {
							blockName: "SignerInfo.digestAlgorithm"
						}
					}),
					SignedAndUnsignedAttributes.schema(names.signedAttrs || {
						names: {
							blockName: "SignerInfo.signedAttrs",
							tagNumber: 0
						}
					}),
					AlgorithmIdentifier.schema(names.signatureAlgorithm || {
						names: {
							blockName: "SignerInfo.signatureAlgorithm"
						}
					}),
					new asn1js.OctetString({ name: (names.signature || "SignerInfo.signature") }),
					SignedAndUnsignedAttributes.schema(names.unsignedAttrs || {
						names: {
							blockName: "SignerInfo.unsignedAttrs",
							tagNumber: 1
						}
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
			"SignerInfo.version",
			"SignerInfo.sid",
			"SignerInfo.digestAlgorithm",
			"SignerInfo.signedAttrs",
			"SignerInfo.signatureAlgorithm",
			"SignerInfo.signature",
			"SignerInfo.unsignedAttrs"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			SignerInfo.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SignerInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result["SignerInfo.version"].valueBlock.valueDec;

		const currentSid = asn1.result["SignerInfo.sid"];
		if(currentSid.idBlock.tagClass === 1)
			this.sid = new IssuerAndSerialNumber({ schema: currentSid });
		else
			this.sid = currentSid;

		this.digestAlgorithm = new AlgorithmIdentifier({ schema: asn1.result["SignerInfo.digestAlgorithm"] });
		if("SignerInfo.signedAttrs" in asn1.result)
			this.signedAttrs = new SignedAndUnsignedAttributes({ type: 0, schema: asn1.result["SignerInfo.signedAttrs"] });
		
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result["SignerInfo.signatureAlgorithm"] });
		this.signature = asn1.result["SignerInfo.signature"];
		if("SignerInfo.unsignedAttrs" in asn1.result)
			this.unsignedAttrs = new SignedAndUnsignedAttributes({ type: 1, schema: asn1.result["SignerInfo.unsignedAttrs"] });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		if(SignerInfo.compareWithDefault("sid", this.sid))
			throw new Error("Incorrectly initialized \"SignerInfo\" class");
		
		//region Create array for output sequence 
		const outputArray = [];
		
		outputArray.push(new asn1js.Integer({ value: this.version }));
		
		if(this.sid instanceof IssuerAndSerialNumber)
			outputArray.push(this.sid.toSchema());
		else
			outputArray.push(this.sid);
		
		outputArray.push(this.digestAlgorithm.toSchema());
		
		if("signedAttrs" in this)
		{
			if(SignerInfo.compareWithDefault("signedAttrs", this.signedAttrs) === false)
				outputArray.push(this.signedAttrs.toSchema());
		}
		
		outputArray.push(this.signatureAlgorithm.toSchema());
		outputArray.push(this.signature);
		
		if("unsignedAttrs" in this)
		{
			if(SignerInfo.compareWithDefault("unsignedAttrs", this.unsignedAttrs) === false)
				outputArray.push(this.unsignedAttrs.toSchema());
		}
		//endregion 
		
		//region Construct and return new ASN.1 schema for this object 
		return (new asn1js.Sequence({
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
		if(SignerInfo.compareWithDefault("sid", this.sid))
			throw new Error("Incorrectly initialized \"SignerInfo\" class");
		
		const _object = {
			version: this.version
		};

		if(!(this.sid instanceof asn1js.Any))
			_object.sid = this.sid.toJSON();

		_object.digestAlgorithm = this.digestAlgorithm.toJSON();

		if(SignerInfo.compareWithDefault("signedAttrs", this.signedAttrs) === false)
			_object.signedAttrs = this.signedAttrs.toJSON();

		_object.signatureAlgorithm = this.signatureAlgorithm.toJSON();
		_object.signature = this.signature.toJSON();

		if(SignerInfo.compareWithDefault("unsignedAttrs", this.unsignedAttrs) === false)
			_object.unsignedAttrs = this.unsignedAttrs.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
