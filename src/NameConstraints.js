import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import GeneralSubtree from "./GeneralSubtree.js";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class NameConstraints
{
	//**********************************************************************************
	/**
	 * Constructor for NameConstraints class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("permittedSubtrees" in parameters)
			/**
			 * @type {Array.<GeneralSubtree>}
			 * @desc permittedSubtrees
			 */
			this.permittedSubtrees = getParametersValue(parameters, "permittedSubtrees", NameConstraints.defaultValues("permittedSubtrees"));

		if("excludedSubtrees" in parameters)
			/**
			 * @type {Array.<GeneralSubtree>}
			 * @desc excludedSubtrees
			 */
			this.excludedSubtrees = getParametersValue(parameters, "excludedSubtrees", NameConstraints.defaultValues("excludedSubtrees"));
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
			case "permittedSubtrees":
				return [];
			case "excludedSubtrees":
				return [];
			default:
				throw new Error(`Invalid member name for NameConstraints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * NameConstraints ::= SEQUENCE {
	 *    permittedSubtrees       [0]     GeneralSubtrees OPTIONAL,
	 *    excludedSubtrees        [1]     GeneralSubtrees OPTIONAL }
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
		 * @property {string} [permittedSubtrees]
		 * @property {string} [excludedSubtrees]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new asn1js.Repeated({
							name: (names.permittedSubtrees || ""),
							value: GeneralSubtree.schema()
						})
					]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new asn1js.Repeated({
							name: (names.excludedSubtrees || ""),
							value: GeneralSubtree.schema()
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
			"permittedSubtrees",
			"excludedSubtrees"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			NameConstraints.schema({
				names: {
					permittedSubtrees: "permittedSubtrees",
					excludedSubtrees: "excludedSubtrees"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for NameConstraints");
		//endregion

		//region Get internal properties from parsed schema
		if("permittedSubtrees" in asn1.result)
			this.permittedSubtrees = Array.from(asn1.result.permittedSubtrees, element => new GeneralSubtree({ schema: element }));

		if("excludedSubtrees" in asn1.result)
			this.excludedSubtrees = Array.from(asn1.result.excludedSubtrees, element => new GeneralSubtree({ schema: element }));
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
		
		if("permittedSubtrees" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: Array.from(this.permittedSubtrees, element => element.toSchema())
			}));
		}
		
		if("excludedSubtrees" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: Array.from(this.excludedSubtrees, element => element.toSchema())
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
		const object = {};
		
		if("permittedSubtrees" in this)
			object.permittedSubtrees = Array.from(this.permittedSubtrees, element => element.toJSON());

		if("excludedSubtrees" in this)
			object.excludedSubtrees = Array.from(this.excludedSubtrees, element => element.toJSON());

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
