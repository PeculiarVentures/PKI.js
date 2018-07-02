import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC3161. Accuracy represents the time deviation around the UTC time contained in GeneralizedTime.
 */
export default class Accuracy
{
	//**********************************************************************************
	/**
	 * Constructor for Accuracy class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("seconds" in parameters)
			/**
			 * @type {number}
			 * @desc seconds
			 */
			this.seconds = getParametersValue(parameters, "seconds", Accuracy.defaultValues("seconds"));
		
		if("millis" in parameters)
			/**
			 * @type {number}
			 * @desc millis
			 */
			this.millis = getParametersValue(parameters, "millis", Accuracy.defaultValues("millis"));
		
		if("micros" in parameters)
			/**
			 * @type {number}
			 * @desc micros
			 */
			this.micros = getParametersValue(parameters, "micros", Accuracy.defaultValues("micros"));
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
			case "seconds":
			case "millis":
			case "micros":
				return 0;
			default:
				throw new Error(`Invalid member name for Accuracy class: ${memberName}`);
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
			case "seconds":
			case "millis":
			case "micros":
				return (memberValue === Accuracy.defaultValues(memberName));
			default:
				throw new Error(`Invalid member name for Accuracy class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Accuracy ::= SEQUENCE {
	 *    seconds        INTEGER              OPTIONAL,
	 *    millis     [0] INTEGER  (1..999)    OPTIONAL,
	 *    micros     [1] INTEGER  (1..999)    OPTIONAL  }
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
		 * @property {string} [seconds]
		 * @property {string} [millis]
		 * @property {string} [micros]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			optional: true,
			value: [
				new asn1js.Integer({
					optional: true,
					name: (names.seconds || "")
				}),
				new asn1js.Primitive({
					name: (names.millis || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					}
				}),
				new asn1js.Primitive({
					name: (names.micros || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
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
			"seconds",
			"millis",
			"micros"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			Accuracy.schema({
				names: {
					seconds: "seconds",
					millis: "millis",
					micros: "micros"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Accuracy");
		//endregion

		//region Get internal properties from parsed schema
		if("seconds" in asn1.result)
			this.seconds = asn1.result.seconds.valueBlock.valueDec;

		if("millis" in asn1.result)
		{
			const intMillis = new asn1js.Integer({ valueHex: asn1.result.millis.valueBlock.valueHex });
			this.millis = intMillis.valueBlock.valueDec;
		}

		if("micros" in asn1.result)
		{
			const intMicros = new asn1js.Integer({ valueHex: asn1.result.micros.valueBlock.valueHex });
			this.micros = intMicros.valueBlock.valueDec;
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
		//region Create array of output sequence
		const outputArray = [];

		if("seconds" in this)
			outputArray.push(new asn1js.Integer({ value: this.seconds }));

		if("millis" in this)
		{
			const intMillis = new asn1js.Integer({ value: this.millis });

			outputArray.push(new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				valueHex: intMillis.valueBlock.valueHex
			}));
		}

		if("micros" in this)
		{
			const intMicros = new asn1js.Integer({ value: this.micros });

			outputArray.push(new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				valueHex: intMicros.valueBlock.valueHex
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
		const _object = {};

		if("seconds" in this)
			_object.seconds = this.seconds;

		if("millis" in this)
			_object.millis = this.millis;

		if("micros" in this)
			_object.micros = this.micros;

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
