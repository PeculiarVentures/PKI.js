import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import AlgorithmIdentifier from "./AlgorithmIdentifier.js";
import Certificate from "./Certificate.js";
import RecipientIdentifier from "./RecipientIdentifier.js";
import IssuerAndSerialNumber from "./IssuerAndSerialNumber.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class KeyTransRecipientInfo
{
	//**********************************************************************************
	/**
	 * Constructor for KeyTransRecipientInfo class
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
		this.version = getParametersValue(parameters, "version", KeyTransRecipientInfo.defaultValues("version"));
		/**
		 * @type {RecipientIdentifier}
		 * @description rid
		 */
		this.rid = getParametersValue(parameters, "rid", KeyTransRecipientInfo.defaultValues("rid"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @description keyEncryptionAlgorithm
		 */
		this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", KeyTransRecipientInfo.defaultValues("keyEncryptionAlgorithm"));
		/**
		 * @type {OctetString}
		 * @description encryptedKey
		 */
		this.encryptedKey = getParametersValue(parameters, "encryptedKey", KeyTransRecipientInfo.defaultValues("encryptedKey"));
		/**
		 * @type {Certificate}
		 * @description recipientCertificate For some reasons we need to store recipient's certificate here
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
				return new asn1js.OctetString();
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
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		//KeyTransRecipientInfo ::= SEQUENCE {
		//    version CMSVersion,  -- always set to 0 or 2
		//    rid RecipientIdentifier,
		//    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
		//    encryptedKey EncryptedKey }

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [rid]
		 * @property {string} [keyEncryptionAlgorithm]
		 * @property {string} [encryptedKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.version || "") }),
				RecipientIdentifier.schema(names.rid || {}),
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
			"rid",
			"keyEncryptionAlgorithm",
			"encryptedKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
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
			
			outputArray.push(new asn1js.Integer({ value: this.version }));
			outputArray.push(this.rid.toSchema());
		}
		else
		{
			this.version = 2;
			
			outputArray.push(new asn1js.Integer({ value: this.version }));
			outputArray.push(new asn1js.Constructed({
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
			rid: this.rid.toJSON(),
			keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
			encryptedKey: this.encryptedKey.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
