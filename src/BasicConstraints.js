import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class BasicConstraints
{
	//**********************************************************************************
	/**
	 * Constructor for BasicConstraints class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {Object} [cA]
	 * @property {Object} [pathLenConstraint]
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {boolean}
		 * @desc cA
		 */
		this.cA = getParametersValue(parameters, "cA", false);

		if("pathLenConstraint" in parameters)
			/**
			 * @type {number|Integer}
			 * @desc pathLenConstraint
			 */
			this.pathLenConstraint = getParametersValue(parameters, "pathLenConstraint", 0);
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
			case "cA":
				return false;
			default:
				throw new Error(`Invalid member name for BasicConstraints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * BasicConstraints ::= SEQUENCE {
	 *    cA                      BOOLEAN DEFAULT FALSE,
	 *    pathLenConstraint       INTEGER (0..MAX) OPTIONAL }
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
		 * @property {string} [cA]
		 * @property {string} [pathLenConstraint]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Boolean({
					optional: true,
					name: (names.cA || "")
				}),
				new asn1js.Integer({
					optional: true,
					name: (names.pathLenConstraint || "")
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
			"cA",
			"pathLenConstraint"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			BasicConstraints.schema({
				names: {
					cA: "cA",
					pathLenConstraint: "pathLenConstraint"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for BasicConstraints");
		//endregion

		//region Get internal properties from parsed schema
		if("cA" in asn1.result)
			this.cA = asn1.result.cA.valueBlock.value;

		if("pathLenConstraint" in asn1.result)
		{
			if(asn1.result.pathLenConstraint.valueBlock.isHexOnly)
				this.pathLenConstraint = asn1.result.pathLenConstraint;
			else
				this.pathLenConstraint = asn1.result.pathLenConstraint.valueBlock.valueDec;
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
		
		if(this.cA !== BasicConstraints.defaultValues("cA"))
			outputArray.push(new asn1js.Boolean({ value: this.cA }));
		
		if("pathLenConstraint" in this)
		{
			if(this.pathLenConstraint instanceof asn1js.Integer)
				outputArray.push(this.pathLenConstraint);
			else
				outputArray.push(new asn1js.Integer({ value: this.pathLenConstraint }));
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

		if(this.cA !== BasicConstraints.defaultValues("cA"))
			object.cA = this.cA;

		if("pathLenConstraint" in this)
		{
			if(this.pathLenConstraint instanceof asn1js.Integer)
				object.pathLenConstraint = this.pathLenConstraint.toJSON();
			else
				object.pathLenConstraint = this.pathLenConstraint;
		}

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
