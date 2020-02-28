import * as asn1js from "asn1js";
import { getParametersValue, isEqualBuffer, clearProps } from "pvutils";
import { getCrypto, getAlgorithmByOID } from "./common.js";
import MessageImprint from "./MessageImprint.js";
import Accuracy from "./Accuracy.js";
import GeneralName from "./GeneralName.js";
import Extension from "./Extension.js";
//**************************************************************************************
/**
 * Class from RFC3161
 */
export default class TSTInfo
{
	//**********************************************************************************
	/**
	 * Constructor for TSTInfo class
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
		this.version = getParametersValue(parameters, "version", TSTInfo.defaultValues("version"));
		/**
		 * @type {string}
		 * @desc policy
		 */
		this.policy = getParametersValue(parameters, "policy", TSTInfo.defaultValues("policy"));
		/**
		 * @type {MessageImprint}
		 * @desc messageImprint
		 */
		this.messageImprint = getParametersValue(parameters, "messageImprint", TSTInfo.defaultValues("messageImprint"));
		/**
		 * @type {Integer}
		 * @desc serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", TSTInfo.defaultValues("serialNumber"));
		/**
		 * @type {Date}
		 * @desc genTime
		 */
		this.genTime = getParametersValue(parameters, "genTime", TSTInfo.defaultValues("genTime"));

		if("accuracy" in parameters)
			/**
			 * @type {Accuracy}
			 * @desc accuracy
			 */
			this.accuracy = getParametersValue(parameters, "accuracy", TSTInfo.defaultValues("accuracy"));

		if("ordering" in parameters)
			/**
			 * @type {boolean}
			 * @desc ordering
			 */
			this.ordering = getParametersValue(parameters, "ordering", TSTInfo.defaultValues("ordering"));

		if("nonce" in parameters)
			/**
			 * @type {Integer}
			 * @desc nonce
			 */
			this.nonce = getParametersValue(parameters, "nonce", TSTInfo.defaultValues("nonce"));

		if("tsa" in parameters)
			/**
			 * @type {GeneralName}
			 * @desc tsa
			 */
			this.tsa = getParametersValue(parameters, "tsa", TSTInfo.defaultValues("tsa"));

		if("extensions" in parameters)
			/**
			 * @type {Array.<Extension>}
			 * @desc extensions
			 */
			this.extensions = getParametersValue(parameters, "extensions", TSTInfo.defaultValues("extensions"));
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
			case "policy":
				return "";
			case "messageImprint":
				return new MessageImprint();
			case "serialNumber":
				return new asn1js.Integer();
			case "genTime":
				return new Date(0, 0, 0);
			case "accuracy":
				return new Accuracy();
			case "ordering":
				return false;
			case "nonce":
				return new asn1js.Integer();
			case "tsa":
				return new GeneralName();
			case "extensions":
				return [];
			default:
				throw new Error(`Invalid member name for TSTInfo class: ${memberName}`);
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
			case "policy":
			case "genTime":
			case "ordering":
				return (memberValue === TSTInfo.defaultValues(memberName));
			case "messageImprint":
				return ((MessageImprint.compareWithDefault("hashAlgorithm", memberValue.hashAlgorithm)) &&
						(MessageImprint.compareWithDefault("hashedMessage", memberValue.hashedMessage)));
			case "serialNumber":
			case "nonce":
				return (memberValue.isEqual(TSTInfo.defaultValues(memberName)));
			case "accuracy":
				return ((Accuracy.compareWithDefault("seconds", memberValue.seconds)) &&
						(Accuracy.compareWithDefault("millis", memberValue.millis)) &&
						(Accuracy.compareWithDefault("micros", memberValue.micros)));
			case "tsa":
				return ((GeneralName.compareWithDefault("type", memberValue.type)) &&
						(GeneralName.compareWithDefault("value", memberValue.value)));
			case "extensions":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for TSTInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * TSTInfo ::= SEQUENCE  {
	 *   version                      INTEGER  { v1(1) },
	 *   policy                       TSAPolicyId,
	 *   messageImprint               MessageImprint,
	 *   serialNumber                 INTEGER,
	 *   genTime                      GeneralizedTime,
	 *   accuracy                     Accuracy                 OPTIONAL,
	 *   ordering                     BOOLEAN             DEFAULT FALSE,
	 *   nonce                        INTEGER                  OPTIONAL,
	 *   tsa                          [0] GeneralName          OPTIONAL,
	 *   extensions                   [1] IMPLICIT Extensions  OPTIONAL  }
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
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || "TSTInfo"),
			value: [
				new asn1js.Integer({ name: (names.version || "TSTInfo.version") }),
				new asn1js.ObjectIdentifier({ name: (names.policy || "TSTInfo.policy") }),
				MessageImprint.schema(names.messageImprint || {
					names: {
						blockName: "TSTInfo.messageImprint"
					}
				}),
				new asn1js.Integer({ name: (names.serialNumber || "TSTInfo.serialNumber") }),
				new asn1js.GeneralizedTime({ name: (names.genTime || "TSTInfo.genTime") }),
				Accuracy.schema(names.accuracy || {
					names: {
						blockName: "TSTInfo.accuracy"
					}
				}),
				new asn1js.Boolean({
					name: (names.ordering || "TSTInfo.ordering"),
					optional: true
				}),
				new asn1js.Integer({
					name: (names.nonce || "TSTInfo.nonce"),
					optional: true
				}),
				new asn1js.Constructed({
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
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new asn1js.Repeated({
							name: (names.extensions || "TSTInfo.extensions"),
							value: Extension.schema(names.extension || {})
						})
					]
				}) // IMPLICIT Extensions
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
			"TSTInfo.version",
			"TSTInfo.policy",
			"TSTInfo.messageImprint",
			"TSTInfo.serialNumber",
			"TSTInfo.genTime",
			"TSTInfo.accuracy",
			"TSTInfo.ordering",
			"TSTInfo.nonce",
			"TSTInfo.tsa",
			"TSTInfo.extensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			TSTInfo.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for TSTInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result["TSTInfo.version"].valueBlock.valueDec;
		this.policy = asn1.result["TSTInfo.policy"].valueBlock.toString();
		this.messageImprint = new MessageImprint({ schema: asn1.result["TSTInfo.messageImprint"] });
		this.serialNumber = asn1.result["TSTInfo.serialNumber"];
		this.genTime = asn1.result["TSTInfo.genTime"].toDate();
		if("TSTInfo.accuracy" in asn1.result)
			this.accuracy = new Accuracy({ schema: asn1.result["TSTInfo.accuracy"] });
		if("TSTInfo.ordering" in asn1.result)
			this.ordering = asn1.result["TSTInfo.ordering"].valueBlock.value;
		if("TSTInfo.nonce" in asn1.result)
			this.nonce = asn1.result["TSTInfo.nonce"];
		if("TSTInfo.tsa" in asn1.result)
			this.tsa = new GeneralName({ schema: asn1.result["TSTInfo.tsa"] });
		if("TSTInfo.extensions" in asn1.result)
			this.extensions = Array.from(asn1.result["TSTInfo.extensions"], element => new Extension({ schema: element }));
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

		outputArray.push(new asn1js.Integer({ value: this.version }));
		outputArray.push(new asn1js.ObjectIdentifier({ value: this.policy }));
		outputArray.push(this.messageImprint.toSchema());
		outputArray.push(this.serialNumber);
		outputArray.push(new asn1js.GeneralizedTime({ valueDate: this.genTime }));
		if("accuracy" in this)
			outputArray.push(this.accuracy.toSchema());
		if("ordering" in this)
			outputArray.push(new asn1js.Boolean({ value: this.ordering }));
		if("nonce" in this)
			outputArray.push(this.nonce);
		if("tsa" in this)
		{
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [this.tsa.toSchema()]
			}));
		}

		//region Create array of extensions
		if("extensions" in this)
		{
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: Array.from(this.extensions, element => element.toSchema())
			}));
		}
		//endregion
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
		const _object = {
			version: this.version,
			policy: this.policy,
			messageImprint: this.messageImprint.toJSON(),
			serialNumber: this.serialNumber.toJSON(),
			genTime: this.genTime
		};

		if("accuracy" in this)
			_object.accuracy = this.accuracy.toJSON();

		if("ordering" in this)
			_object.ordering = this.ordering;

		if("nonce" in this)
			_object.nonce = this.nonce.toJSON();

		if("tsa" in this)
			_object.tsa = this.tsa.toJSON();

		if("extensions" in this)
			_object.extensions = Array.from(this.extensions, element => element.toJSON());

		return _object;
	}
	//**********************************************************************************
	/**
	 * Verify current TST Info value
	 * @param {{data: ArrayBuffer, notBefore: Date, notAfter: Date}} parameters Input parameters
	 * @returns {Promise}
	 */
	verify(parameters = {})
	{
		//region Initial variables
		let sequence = Promise.resolve();

		let data;

		let notBefore = null;
		let notAfter = null;
		//endregion

		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion

		//region Get initial parameters
		if("data" in parameters)
			data = parameters.data;
		else
			return Promise.reject("\"data\" is a mandatory attribute for TST_INFO verification");

		if("notBefore" in parameters)
			notBefore = parameters.notBefore;

		if("notAfter" in parameters)
			notAfter = parameters.notAfter;
		//endregion

		//region Check date
		if(notBefore !== null)
		{
			if(this.genTime < notBefore)
				return Promise.reject("Generation time for TSTInfo object is less than notBefore value");
		}
		
		if(notAfter !== null)
		{
			if(this.genTime > notAfter)
				return Promise.reject("Generation time for TSTInfo object is more than notAfter value");
		}
		//endregion
		
		//region Find hashing algorithm
		const shaAlgorithm = getAlgorithmByOID(this.messageImprint.hashAlgorithm.algorithmId);
		if(("name" in shaAlgorithm) === false)
			return Promise.reject(`Unsupported signature algorithm: ${this.messageImprint.hashAlgorithm.algorithmId}`);
		//endregion

		//region Calculate message digest for input "data" buffer
		// noinspection JSCheckFunctionSignatures
		sequence = sequence.then(() =>
			crypto.digest(shaAlgorithm.name, new Uint8Array(data))
		).then(
			result => isEqualBuffer(result, this.messageImprint.hashedMessage.valueBlock.valueHex)
		);
		//endregion

		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************
