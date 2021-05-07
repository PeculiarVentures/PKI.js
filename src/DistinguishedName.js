import * as asn1js from "asn1js";
import { getParametersValue, isEqualBuffer, clearProps } from "pvutils";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames";

//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class DistinguishedName 
{
	//**********************************************************************************
	/**
	 * Constructor for DistinguishedName class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {}) 
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<RelativeDistinguishedNames>}
		 * @desc Array of "Relative Distinguished Names" objects
		 */
		this.relativeDistinguishedNames = getParametersValue(parameters, "relativeDistinguishedNames", DistinguishedName.defaultValues("relativeDistinguishedNames"));
		/**
		 * @type {ArrayBuffer}
		 * @desc Value of the DN before decoding from schema
		 */
		this.valueBeforeDecode = getParametersValue(parameters, "valueBeforeDecode", DistinguishedName.defaultValues("valueBeforeDecode"));
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
		switch (memberName) 
		{
			case "relativeDistinguishedNames":
				return [];
			case "valueBeforeDecode":
				return new ArrayBuffer(0);
			default:
				throw new Error(`Invalid member name for DistinguishedName class: ${memberName}`);
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
		switch (memberName) 
		{
			case "relativeDistinguishedNames":
				return (memberValue.length === 0);
			case "valueBeforeDecode":
				return (memberValue.byteLength === 0);
			default:
				throw new Error(`Invalid member name for DistinguishedName class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RDNSequence ::= Sequence OF RelativeDistinguishedName
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {}) 
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName] Name for entire block
		 * @property {string} [repeatedSequence] Name for "repeatedSequence" block
		 * @property {string} [rDNSequences] Name for "rDNSequences" block
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Repeated({
					name: (names.repeatedSequence || ""),
					value: RelativeDistinguishedNames.schema(names.rDNSequence),
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
			"DN",
			"RDNSequence"
		]);
		//endregion

		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			DistinguishedName.schema({
				names: {
					blockName: "DN",
					repeatedSequence: "RDNSequence",
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for DistinguishedNames");
		//endregion

		//region Get internal properties from parsed schema
		if("RDNSequence" in asn1.result) // Could be a case when there is no "types and values"
			this.relativeDistinguishedNames = Array.from(asn1.result.RDNSequence, element => new RelativeDistinguishedNames({ schema: element }));

		// noinspection JSUnresolvedVariable
		this.valueBeforeDecode = asn1.result.DN.valueBeforeDecode;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema() 
	{
		//region Decode stored TBS value
		if(this.valueBeforeDecode.byteLength === 0) // No stored encoded array, create "from scratch"
		{
			return (new asn1js.Sequence({
				value: Array.from(this.relativeDistinguishedNames, element => element.toSchema())
			}));
		}

		const asn1 = asn1js.fromBER(this.valueBeforeDecode);
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return asn1.result;
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
			relativeDistinguishedNames: Array.from(this.relativeDistinguishedNames, element => element.toJSON())
		};
	}
	//**********************************************************************************
	/**
	 * Compare two RDN values, or RDN with ArrayBuffer value
	 * @param {(RelativeDistinguishedNames|ArrayBuffer)} compareTo The value compare to current
	 * @returns {boolean}
	 */
	isEqual(compareTo) 
	{
		if(compareTo instanceof DistinguishedName) 
		{
			if(this.relativeDistinguishedNames.length !== compareTo.relativeDistinguishedNames.length)
				return false;

			for(const [index, relativeDistinguishedName] of this.relativeDistinguishedNames.entries()) 
			{
				if(relativeDistinguishedName.isEqual(compareTo.relativeDistinguishedNames[index]) === false)
					return false;
			}

			return true;
		}

		if(compareTo instanceof ArrayBuffer)
			return isEqualBuffer(this.valueBeforeDecode, compareTo);

		return false;
	}
	//**********************************************************************************
	/**
	 * Convert a Distinguished Name to a human-readable string
	 * based on RFC4514
	 */
	toString() 
	{
		return this.relativeDistinguishedNames.map(rdn => rdn.toString()).join(",");
	}
}
//**************************************************************************************