import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import AlgorithmIdentifier from "./AlgorithmIdentifier.js";
import EncryptedData from "./EncryptedData.js";
import EncryptedContentInfo from "./EncryptedContentInfo.js";
import PrivateKeyInfo from "./PrivateKeyInfo.js";
//**************************************************************************************
/**
 * Class from RFC7292
 */
export default class PKCS8ShroudedKeyBag 
{
	//**********************************************************************************
	/**
	 * Constructor for PKCS8ShroudedKeyBag class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc encryptionAlgorithm
		 */
		this.encryptionAlgorithm = getParametersValue(parameters, "encryptionAlgorithm", PKCS8ShroudedKeyBag.defaultValues("encryptionAlgorithm"));
		/**
		 * @type {OctetString}
		 * @desc encryptedData
		 */
		this.encryptedData = getParametersValue(parameters, "encryptedData", PKCS8ShroudedKeyBag.defaultValues("encryptedData"));
		
		if("parsedValue" in parameters)
			/**
			 * @type {*}
			 * @desc parsedValue
			 */
			this.parsedValue = getParametersValue(parameters, "parsedValue", PKCS8ShroudedKeyBag.defaultValues("parsedValue"));
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
			case "encryptionAlgorithm":
				return (new AlgorithmIdentifier());
			case "encryptedData":
				return (new asn1js.OctetString());
			case "parsedValue":
				return {};
			default:
				throw new Error(`Invalid member name for PKCS8ShroudedKeyBag class: ${memberName}`);
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
			case "encryptionAlgorithm":
				return ((AlgorithmIdentifier.compareWithDefault("algorithmId", memberValue.algorithmId)) &&
				(("algorithmParams" in memberValue) === false));
			case "encryptedData":
				return (memberValue.isEqual(PKCS8ShroudedKeyBag.defaultValues(memberName)));
			case "parsedValue":
				return ((memberValue instanceof Object) && (Object.keys(memberValue).length === 0));
			default:
				throw new Error(`Invalid member name for PKCS8ShroudedKeyBag class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PKCS8ShroudedKeyBag ::= EncryptedPrivateKeyInfo
	 *
	 * EncryptedPrivateKeyInfo ::= SEQUENCE {
	 *    encryptionAlgorithm AlgorithmIdentifier {{KeyEncryptionAlgorithms}},
	 *    encryptedData EncryptedData
	 * }
	 *
	 * EncryptedData ::= OCTET STRING
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
		 * @property {string} [encryptionAlgorithm]
		 * @property {string} [encryptedData]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				AlgorithmIdentifier.schema(names.encryptionAlgorithm || {
					names: {
						blockName: "encryptionAlgorithm"
					}
				}),
				new asn1js.Choice({
					value: [
						new asn1js.OctetString({ name: (names.encryptedData || "encryptedData") }),
						new asn1js.OctetString({
							idBlock: {
								isConstructed: true
							},
							name: (names.encryptedData || "encryptedData")
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
			"encryptionAlgorithm",
			"encryptedData"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			PKCS8ShroudedKeyBag.schema({
				names: {
					encryptionAlgorithm: {
						names: {
							blockName: "encryptionAlgorithm"
						}
					},
					encryptedData: "encryptedData"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PKCS8ShroudedKeyBag");
		//endregion
		
		//region Get internal properties from parsed schema
		this.encryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.encryptionAlgorithm });
		this.encryptedData = asn1.result.encryptedData;
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
				this.encryptionAlgorithm.toSchema(),
				this.encryptedData
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
			encryptionAlgorithm: this.encryptionAlgorithm.toJSON(),
			encryptedData: this.encryptedData.toJSON()
		};
	}
	//**********************************************************************************
	parseInternalValues(parameters)
	{
		//region Initial variables 
		let sequence = Promise.resolve();
		
		const cmsEncrypted = new EncryptedData({
			encryptedContentInfo: new EncryptedContentInfo({
				contentEncryptionAlgorithm: this.encryptionAlgorithm,
				encryptedContent: this.encryptedData
			})
		});
		//endregion 
		
		//region Decrypt internal data 
		sequence = sequence.then(
			() => cmsEncrypted.decrypt(parameters),
			error => Promise.reject(error)
		);
		//endregion 
		
		//region Initialize "parsedValue" with decrypted PKCS#8 private key 
		sequence = sequence.then(
			/**
			 * @param {ArrayBuffer} result
			 */
			result =>
			{
				const asn1 = asn1js.fromBER(result);
				if(asn1.offset === (-1))
					return Promise.reject("Error during parsing ASN.1 data");
				
				this.parsedValue = new PrivateKeyInfo({ schema: asn1.result });
				
				return Promise.resolve();
			},
			error => Promise.reject(error)
		);
		//endregion 
		
		return sequence;
	}
	//**********************************************************************************
	makeInternalValues(parameters)
	{
		//region Check that we do have "parsedValue" 
		if(("parsedValue" in this) === false)
			return Promise.reject("Please initialize \"parsedValue\" first");
		//endregion 
		
		//region Initial variables 
		let sequence = Promise.resolve();
		
		const cmsEncrypted = new EncryptedData();
		//endregion 
		
		//region Encrypt internal data 
		sequence = sequence.then(
			() =>
			{
				parameters.contentToEncrypt = this.parsedValue.toSchema().toBER(false);
				
				return cmsEncrypted.encrypt(parameters);
			},
			error => Promise.reject(error)
		);
		//endregion 
		
		//region Initialize internal values 
		sequence = sequence.then(
			() =>
			{
				this.encryptionAlgorithm = cmsEncrypted.encryptedContentInfo.contentEncryptionAlgorithm;
				this.encryptedData = cmsEncrypted.encryptedContentInfo.encryptedContent;
			}
		);
		//endregion 
		
		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************
