import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import GeneralName from "./GeneralName.js";
//**************************************************************************************
/**
 * Class from https://www.adobe.com/devnet-docs/etk_deprecated/tools/DigSig/oids.html
 */
export default class AdobeTimestamp
{
	//**********************************************************************************
	/**
	 * Constructor for AdobeTimestamp class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Integer}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", AdobeTimestamp.defaultValues("version"));
		/**
		 * @type {GeneralName}
		 * @desc location
		 */
		this.location = getParametersValue(parameters, "location", AdobeTimestamp.defaultValues("location"));
		/**
		 * @type {Boolean}
		 * @desc requiresAuth
		 */
		if("requiresAuth" in parameters)
			this.requiresAuth = getParametersValue(parameters, "requiresAuth", AdobeTimestamp.defaultValues("requiresAuth"));
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
				return 1;
			case "location":
				return new GeneralName();
			case "requiresAuth":
				return false;
			default:
				throw new Error(`Invalid member name for AdobeTimestamp class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * AdobeTimestamp OID ::= 1.2.840.113583.1.1.9.1
	 *
	 * AdobeTimestamp ::= SEQUENCE {
	 *    version             INTEGER,
	 *    location            GeneralName,
	 *    requiresAuth        BOOLEAN DEFAULT FALSE OPTIONAL }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({
					name: (names.version || ""),
					idBlock: {
						tagClass: 1, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					}
				}),
				new asn1js.Primitive({
					name: (names.location || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 6 // [6]
					}
				}),
				new asn1js.Boolean({
					name: (names.requiresAuth || ""),
					optional: true,
					idBlock: {
						tagClass: 1, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
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
			"version",
			"location",
			"requiresAuth"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			AdobeTimestamp.schema({
				names: {
					version: "version",
					location: "location",
					requiresAuth: "requiresAuth"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AdobeTimestamp");
		//endregion
		
		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.location = new GeneralName({ schema: asn1.result.location });
		
		if("requiresAuth" in asn1.result)
			this.requiresAuth = asn1.result.requiresAuth.valueBlock.value;
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

		outputArray.push(new asn1js.Integer({
			value: this.version,
			idBlock: {
				tagClass: 1, // CONTEXT-SPECIFIC
				tagNumber: 2 // [2]
			}
		}));

		outputArray.push(this.location.toSchema());

		if("requiresAuth" in this)
			outputArray.push(new asn1js.Boolean({
				value: this.requiresAuth,
				idBlock: {
					tagClass: 1, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				}
			}));
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
		const object = {
			version: this.version,
			location: this.location.toJSON(),
		};
		
		if("requiresAuth" in this)
			object.requiresAuth = this.requiresAuth;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
