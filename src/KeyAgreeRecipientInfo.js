import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import OriginatorIdentifierOrKey from "./OriginatorIdentifierOrKey.js";
import AlgorithmIdentifier from "./AlgorithmIdentifier.js";
import RecipientEncryptedKeys from "./RecipientEncryptedKeys.js";
import Certificate from "./Certificate.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class KeyAgreeRecipientInfo
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
				return new asn1js.OctetString();
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

		return (new asn1js.Sequence({
			name: names.blockName || "",
			value: [
				new asn1js.Integer({ name: names.version || "" }),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						OriginatorIdentifierOrKey.schema(names.originator || {})
					]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [new asn1js.OctetString({ name: names.ukm || "" })]
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
		const asn1 = asn1js.compareSchema(schema,
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

		outputArray.push(new asn1js.Integer({ value: this.version }));
		outputArray.push(new asn1js.Constructed({
			idBlock: {
				tagClass: 3, // CONTEXT-SPECIFIC
				tagNumber: 0 // [0]
			},
			value: [this.originator.toSchema()]
		}));

		if("ukm" in this)
		{
			outputArray.push(new asn1js.Constructed({
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
