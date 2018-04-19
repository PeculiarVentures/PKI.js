import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import Attribute from "./Attribute.js";
import PrivateKeyInfo from "./PrivateKeyInfo.js";
import PKCS8ShroudedKeyBag from "./PKCS8ShroudedKeyBag.js";
import CertBag from "./CertBag.js";
import CRLBag from "./CRLBag.js";
import SecretBag from "./SecretBag.js";
import SafeContents from "./SafeContents.js";
//**************************************************************************************
/**
 * Class from RFC7292
 */
export default class SafeBag
{
	//**********************************************************************************
	/**
	 * Constructor for SafeBag class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description bagId
		 */
		this.bagId = getParametersValue(parameters, "bagId", SafeBag.defaultValues("bagId"));
		/**
		 * @type {*}
		 * @description bagValue
		 */
		this.bagValue = getParametersValue(parameters, "bagValue", SafeBag.defaultValues("bagValue"));
		
		if("bagAttributes" in parameters)
			/**
			 * @type {Array.<Attribute>}
			 * @description bagAttributes
			 */
			this.bagAttributes = getParametersValue(parameters, "bagAttributes", SafeBag.defaultValues("bagAttributes"));
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
			case "bagId":
				return "";
			case "bagValue":
				return (new asn1js.Any());
			case "bagAttributes":
				return [];
			default:
				throw new Error(`Invalid member name for SafeBag class: ${memberName}`);
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
			case "bagId":
				return (memberValue === "");
			case "bagValue":
				return (memberValue instanceof asn1js.Any);
			case "bagAttributes":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for SafeBag class: ${memberName}`);
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
		//SafeBag ::= SEQUENCE {
		//    bagId	      	BAG-TYPE.&id ({PKCS12BagSet}),
		//    bagValue      [0] EXPLICIT BAG-TYPE.&Type({PKCS12BagSet}{@bagId}),
		//    bagAttributes SET OF PKCS12Attribute OPTIONAL
		//}
		
		//rsadsi	OBJECT IDENTIFIER ::= {iso(1) member-body(2) us(840) rsadsi(113549)}
		//pkcs    OBJECT IDENTIFIER ::= {rsadsi pkcs(1)}
		//pkcs-12	OBJECT IDENTIFIER ::= {pkcs 12}
		
		//bagtypes			OBJECT IDENTIFIER ::= {pkcs-12 10 1}
		
		//keyBag 	  BAG-TYPE ::=
		//{KeyBag IDENTIFIED BY {bagtypes 1}}
		//pkcs8ShroudedKeyBag BAG-TYPE ::=
		//{PKCS8ShroudedKeyBag IDENTIFIED BY {bagtypes 2}}
		//certBag BAG-TYPE ::=
		//{CertBag IDENTIFIED BY {bagtypes 3}}
		//crlBag BAG-TYPE ::=
		//{CRLBag IDENTIFIED BY {bagtypes 4}}
		//secretBag BAG-TYPE ::=
		//{SecretBag IDENTIFIED BY {bagtypes 5}}
		//safeContentsBag BAG-TYPE ::=
		//{SafeContents IDENTIFIED BY {bagtypes 6}}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [bagId]
		 * @property {string} [bagValue]
		 * @property {string} [bagAttributes]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.bagId || "bagId") }),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new asn1js.Any({ name: (names.bagValue || "bagValue") })] // EXPLICIT ANY value
				}),
				new asn1js.Set({
					optional: true,
					value: [
						new asn1js.Repeated({
							name: (names.bagAttributes || "bagAttributes"),
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			SafeBag.schema({
				names: {
					bagId: "bagId",
					bagValue: "bagValue",
					bagAttributes: "bagAttributes"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SafeBag");
		//endregion
		
		//region Get internal properties from parsed schema
		this.bagId = asn1.result.bagId.valueBlock.toString();
		
		switch(this.bagId)
		{
			case "1.2.840.113549.1.12.10.1.1": // keyBag
				this.bagValue = new PrivateKeyInfo({ schema: asn1.result.bagValue });
				break;
			case "1.2.840.113549.1.12.10.1.2": // pkcs8ShroudedKeyBag
				this.bagValue = new PKCS8ShroudedKeyBag({ schema: asn1.result.bagValue });
				break;
			case "1.2.840.113549.1.12.10.1.3": // certBag
				this.bagValue = new CertBag({ schema: asn1.result.bagValue });
				break;
			case "1.2.840.113549.1.12.10.1.4": // crlBag
				this.bagValue = new CRLBag({ schema: asn1.result.bagValue });
				break;
			case "1.2.840.113549.1.12.10.1.5": // secretBag
				this.bagValue = new SecretBag({ schema: asn1.result.bagValue });
				break;
			case "1.2.840.113549.1.12.10.1.6": // safeContentsBag
				this.bagValue = new SafeContents({ schema: asn1.result.bagValue });
				break;
			default:
				throw new Error(`Invalid "bagId" for SafeBag: ${this.bagId}`);
		}
		
		if("bagAttributes" in asn1.result)
			this.bagAttributes = Array.from(asn1.result.bagAttributes, element => new Attribute({ schema: element }));
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
		const outputArray = [
			new asn1js.ObjectIdentifier({ value: this.bagId }),
			new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [this.bagValue.toSchema()]
			})
		];
		
		if("bagAttributes" in this)
		{
			outputArray.push(new asn1js.Set({
				value: Array.from(this.bagAttributes, element => element.toSchema())
			}));
		}
		
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
		const output = {
			bagId: this.bagId,
			bagValue: this.bagValue.toJSON()
		};
		
		if("bagAttributes" in this)
			output.bagAttributes = Array.from(this.bagAttributes, element => element.toJSON());
		
		return output;
	}
	//**********************************************************************************
}
//**************************************************************************************
