import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import KEKIdentifier from "./KEKIdentifier.js";
import AlgorithmIdentifier from "./AlgorithmIdentifier.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class KEKRecipientInfo
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
				return new asn1js.OctetString();
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

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.version || "") }),
				KEKIdentifier.schema(names.kekid || {}),
				AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}),
				new asn1js.OctetString({ name: (names.encryptedKey || "") })
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
		const asn1 = asn1js.compareSchema(schema,
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
		return (new asn1js.Sequence({
			value: [
				new asn1js.Integer({ value: this.version }),
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
