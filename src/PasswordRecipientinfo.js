import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class PasswordRecipientinfo
{
	//**********************************************************************************
	/**
	 * Constructor for PasswordRecipientinfo class
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
		this.version = getParametersValue(parameters, "version", PasswordRecipientinfo.defaultValues("version"));

		if("keyDerivationAlgorithm" in parameters)
			/**
			 * @type {AlgorithmIdentifier}
			 * @description keyDerivationAlgorithm
			 */
			this.keyDerivationAlgorithm = getParametersValue(parameters, "keyDerivationAlgorithm", PasswordRecipientinfo.defaultValues("keyDerivationAlgorithm"));

		/**
		 * @type {AlgorithmIdentifier}
		 * @description keyEncryptionAlgorithm
		 */
		this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", PasswordRecipientinfo.defaultValues("keyEncryptionAlgorithm"));
		/**
		 * @type {OctetString}
		 * @description encryptedKey
		 */
		this.encryptedKey = getParametersValue(parameters, "encryptedKey", PasswordRecipientinfo.defaultValues("encryptedKey"));
		/**
		 * @type {ArrayBuffer}
		 * @description password Password to derive key from
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
				return new asn1js.OctetString();
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
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		//PasswordRecipientInfo ::= SEQUENCE {
		//    version CMSVersion,   -- Always set to 0
		//    keyDerivationAlgorithm [0] KeyDerivationAlgorithmIdentifier OPTIONAL,
		//    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
		//    encryptedKey EncryptedKey }

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [keyDerivationAlgorithm]
		 * @property {string} [keyEncryptionAlgorithm]
		 * @property {string} [encryptedKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.version || "") }),
				new asn1js.Constructed({
					name: (names.keyDerivationAlgorithm || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: AlgorithmIdentifier.schema().valueBlock.value
				}),
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
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
			asn1.result.keyDerivationAlgorithm.idBlock.tagClass = 1; // UNIVERSAL
			asn1.result.keyDerivationAlgorithm.idBlock.tagNumber = 16; // SEQUENCE

			this.keyDerivationAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyDerivationAlgorithm });
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

		outputArray.push(new asn1js.Integer({ value: this.version }));

		if("keyDerivationAlgorithm" in this)
		{
			outputArray.push(new asn1js.Constructed({
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
