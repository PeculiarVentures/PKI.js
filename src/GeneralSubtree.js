import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import GeneralName from "./GeneralName.js";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class GeneralSubtree
{
	//**********************************************************************************
	/**
	 * Constructor for GeneralSubtree class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {GeneralName}
		 * @desc base
		 */
		this.base = getParametersValue(parameters, "base", GeneralSubtree.defaultValues("base"));

		/**
		 * @type {number|Integer}
		 * @desc base
		 */
		this.minimum = getParametersValue(parameters, "minimum", GeneralSubtree.defaultValues("minimum"));

		if("maximum" in parameters)
			/**
			 * @type {number|Integer}
			 * @desc minimum
			 */
			this.maximum = getParametersValue(parameters, "maximum", GeneralSubtree.defaultValues("maximum"));
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
			case "base":
				return new GeneralName();
			case "minimum":
				return 0;
			case "maximum":
				return 0;
			default:
				throw new Error(`Invalid member name for GeneralSubtree class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * GeneralSubtree ::= SEQUENCE {
	 *    base                    GeneralName,
	 *    minimum         [0]     BaseDistance DEFAULT 0,
	 *    maximum         [1]     BaseDistance OPTIONAL }
	 *
	 * BaseDistance ::= INTEGER (0..MAX)
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
		 * @property {string} [base]
		 * @property {string} [minimum]
		 * @property {string} [maximum]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				GeneralName.schema(names.base || {}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new asn1js.Integer({ name: (names.minimum || "") })]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [new asn1js.Integer({ name: (names.maximum || "") })]
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
			"base",
			"minimum",
			"maximum"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			GeneralSubtree.schema({
				names: {
					base: {
						names: {
							blockName: "base"
						}
					},
					minimum: "minimum",
					maximum: "maximum"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for GeneralSubtree");
		//endregion

		//region Get internal properties from parsed schema
		this.base = new GeneralName({ schema: asn1.result.base });

		if("minimum" in asn1.result)
		{
			if(asn1.result.minimum.valueBlock.isHexOnly)
				this.minimum = asn1.result.minimum;
			else
				this.minimum = asn1.result.minimum.valueBlock.valueDec;
		}

		if("maximum" in asn1.result)
		{
			if(asn1.result.maximum.valueBlock.isHexOnly)
				this.maximum = asn1.result.maximum;
			else
				this.maximum = asn1.result.maximum.valueBlock.valueDec;
		}
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
		
		outputArray.push(this.base.toSchema());
		
		if(this.minimum !== 0)
		{
			let valueMinimum = 0;
			
			if(this.minimum instanceof asn1js.Integer)
				valueMinimum = this.minimum;
			else
				valueMinimum = new asn1js.Integer({ value: this.minimum });
			
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [valueMinimum]
			}));
		}
		
		if("maximum" in this)
		{
			let valueMaximum = 0;
			
			if(this.maximum instanceof asn1js.Integer)
				valueMaximum = this.maximum;
			else
				valueMaximum = new asn1js.Integer({ value: this.maximum });
			
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [valueMaximum]
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
		const object = {
			base: this.base.toJSON()
		};
		
		if(this.minimum !== 0)
		{
			if((typeof this.minimum) === "number")
				object.minimum = this.minimum;
			else
				object.minimum = this.minimum.toJSON();
		}
		
		if("maximum" in this)
		{
			if((typeof this.maximum) === "number")
				object.maximum = this.maximum;
			else
				object.maximum = this.maximum.toJSON();
		}
		
		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
