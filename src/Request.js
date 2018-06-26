import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import CertID from "./CertID.js";
import Extension from "./Extension.js";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class Request
{
	//**********************************************************************************
	/**
	 * Constructor for Request class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {CertID}
		 * @desc reqCert
		 */
		this.reqCert = getParametersValue(parameters, "reqCert", Request.defaultValues("reqCert"));

		if("singleRequestExtensions" in parameters)
			/**
			 * @type {Array.<Extension>}
			 * @desc singleRequestExtensions
			 */
			this.singleRequestExtensions = getParametersValue(parameters, "singleRequestExtensions", Request.defaultValues("singleRequestExtensions"));
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
			case "reqCert":
				return new CertID();
			case "singleRequestExtensions":
				return [];
			default:
				throw new Error(`Invalid member name for Request class: ${memberName}`);
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
			case "reqCert":
				return (memberValue.isEqual(Request.defaultValues(memberName)));
			case "singleRequestExtensions":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for Request class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Request         ::=     SEQUENCE {
	 *    reqCert                     CertID,
	 *    singleRequestExtensions     [0] EXPLICIT Extensions OPTIONAL }
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
		 * @property {string} [reqCert]
		 * @property {string} [extensions]
		 * @property {string} [singleRequestExtensions]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				CertID.schema(names.reqCert || {}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [Extension.schema(names.extensions || {
						names: {
							blockName: (names.singleRequestExtensions || "")
						}
					})]
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
			"reqCert",
			"singleRequestExtensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			Request.schema({
				names: {
					reqCert: {
						names: {
							blockName: "reqCert"
						}
					},
					singleRequestExtensions: {
						names: {
							blockName: "singleRequestExtensions"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Request");
		//endregion

		//region Get internal properties from parsed schema
		this.reqCert = new CertID({ schema: asn1.result.reqCert });

		if("singleRequestExtensions" in asn1.result)
			this.singleRequestExtensions = Array.from(asn1.result.singleRequestExtensions.valueBlock.value, element => new Extension({ schema: element }));
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

		outputArray.push(this.reqCert.toSchema());

		if("singleRequestExtensions" in this)
		{
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new asn1js.Sequence({
						value: Array.from(this.singleRequestExtensions, element => element.toSchema())
					})
				]
			}));
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
		const _object = {
			reqCert: this.reqCert.toJSON()
		};

		if("singleRequestExtensions" in this)
			_object.singleRequestExtensions = Array.from(this.singleRequestExtensions, element => element.toJSON());

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
