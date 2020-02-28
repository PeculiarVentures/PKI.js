import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class PolicyConstraints
{
	//**********************************************************************************
	/**
	 * Constructor for PolicyConstraints class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("requireExplicitPolicy" in parameters)
			/**
			 * @type {number}
			 * @desc requireExplicitPolicy
			 */
			this.requireExplicitPolicy = getParametersValue(parameters, "requireExplicitPolicy", PolicyConstraints.defaultValues("requireExplicitPolicy"));

		if("inhibitPolicyMapping" in parameters)
			/**
			 * @type {number}
			 * @desc Value of the TIME class
			 */
			this.inhibitPolicyMapping = getParametersValue(parameters, "inhibitPolicyMapping", PolicyConstraints.defaultValues("inhibitPolicyMapping"));
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
			case "requireExplicitPolicy":
				return 0;
			case "inhibitPolicyMapping":
				return 0;
			default:
				throw new Error(`Invalid member name for PolicyConstraints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyConstraints ::= SEQUENCE {
	 *    requireExplicitPolicy           [0] SkipCerts OPTIONAL,
	 *    inhibitPolicyMapping            [1] SkipCerts OPTIONAL }
	 *
	 * SkipCerts ::= INTEGER (0..MAX)
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
		 * @property {string} [requireExplicitPolicy]
		 * @property {string} [inhibitPolicyMapping]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Primitive({
					name: (names.requireExplicitPolicy || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					}
				}), // IMPLICIT integer value
				new asn1js.Primitive({
					name: (names.inhibitPolicyMapping || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				}) // IMPLICIT integer value
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
			"requireExplicitPolicy",
			"inhibitPolicyMapping"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			PolicyConstraints.schema({
				names: {
					requireExplicitPolicy: "requireExplicitPolicy",
					inhibitPolicyMapping: "inhibitPolicyMapping"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PolicyConstraints");
		//endregion

		//region Get internal properties from parsed schema
		if("requireExplicitPolicy" in asn1.result)
		{
			const field1 = asn1.result.requireExplicitPolicy;

			field1.idBlock.tagClass = 1; // UNIVERSAL
			field1.idBlock.tagNumber = 2; // INTEGER

			const ber1 = field1.toBER(false);
			const int1 = asn1js.fromBER(ber1);

			this.requireExplicitPolicy = int1.result.valueBlock.valueDec;
		}

		if("inhibitPolicyMapping" in asn1.result)
		{
			const field2 = asn1.result.inhibitPolicyMapping;

			field2.idBlock.tagClass = 1; // UNIVERSAL
			field2.idBlock.tagNumber = 2; // INTEGER

			const ber2 = field2.toBER(false);
			const int2 = asn1js.fromBER(ber2);

			this.inhibitPolicyMapping = int2.result.valueBlock.valueDec;
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
		//region Create correct values for output sequence
		const outputArray = [];
		
		if("requireExplicitPolicy" in this)
		{
			const int1 = new asn1js.Integer({ value: this.requireExplicitPolicy });
			
			int1.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
			int1.idBlock.tagNumber = 0; // [0]
			
			outputArray.push(int1);
		}
		
		if("inhibitPolicyMapping" in this)
		{
			const int2 = new asn1js.Integer({ value: this.inhibitPolicyMapping });
			
			int2.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
			int2.idBlock.tagNumber = 1; // [1]
			
			outputArray.push(int2);
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

		if("requireExplicitPolicy" in this)
			object.requireExplicitPolicy = this.requireExplicitPolicy;

		if("inhibitPolicyMapping" in this)
			object.inhibitPolicyMapping = this.inhibitPolicyMapping;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
