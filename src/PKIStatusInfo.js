import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC3161
 */
export default class PKIStatusInfo
{
	//**********************************************************************************
	/**
	 * Constructor for PKIStatusInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc status
		 */
		this.status = getParametersValue(parameters, "status", PKIStatusInfo.defaultValues("status"));

		if("statusStrings" in parameters)
			/**
			 * @type {Array.<Utf8String>}
			 * @desc statusStrings
			 */
			this.statusStrings = getParametersValue(parameters, "statusStrings", PKIStatusInfo.defaultValues("statusStrings"));

		if("failInfo" in parameters)
			/**
			 * @type {BitString}
			 * @desc failInfo
			 */
			this.failInfo = getParametersValue(parameters, "failInfo", PKIStatusInfo.defaultValues("failInfo"));
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
			case "status":
				return 2;
			case "statusStrings":
				return [];
			case "failInfo":
				return new asn1js.BitString();
			default:
				throw new Error(`Invalid member name for PKIStatusInfo class: ${memberName}`);
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
			case "status":
				return (memberValue === PKIStatusInfo.defaultValues(memberName));
			case "statusStrings":
				return (memberValue.length === 0);
			case "failInfo":
				return (memberValue.isEqual(PKIStatusInfo.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for PKIStatusInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PKIStatusInfo ::= SEQUENCE {
	 *    status        PKIStatus,
	 *    statusString  PKIFreeText     OPTIONAL,
	 *    failInfo      PKIFailureInfo  OPTIONAL  }
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
		 * @property {string} [status]
		 * @property {string} [statusStrings]
		 * @property {string} [failInfo]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.status || "") }),
				new asn1js.Sequence({
					optional: true,
					value: [
						new asn1js.Repeated({
							name: (names.statusStrings || ""),
							value: new asn1js.Utf8String()
						})
					]
				}),
				new asn1js.BitString({
					name: (names.failInfo || ""),
					optional: true
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
			"status",
			"statusStrings",
			"failInfo"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			PKIStatusInfo.schema({
				names: {
					status: "status",
					statusStrings: "statusStrings",
					failInfo: "failInfo"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PKIStatusInfo");
		//endregion

		//region Get internal properties from parsed schema
		const _status = asn1.result.status;

		if((_status.valueBlock.isHexOnly === true) ||
			(_status.valueBlock.valueDec < 0) ||
			(_status.valueBlock.valueDec > 5))
			throw new Error("PKIStatusInfo \"status\" has invalid value");

		this.status = _status.valueBlock.valueDec;

		if("statusStrings" in asn1.result)
			this.statusStrings = asn1.result.statusStrings;
		if("failInfo" in asn1.result)
			this.failInfo = asn1.result.failInfo;
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

		outputArray.push(new asn1js.Integer({ value: this.status }));

		if("statusStrings" in this)
		{
			outputArray.push(new asn1js.Sequence({
				optional: true,
				value: this.statusStrings
			}));
		}

		if("failInfo" in this)
			outputArray.push(this.failInfo);
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
			status: this.status
		};

		if("statusStrings" in this)
			_object.statusStrings = Array.from(this.statusStrings, element => element.toJSON());

		if("failInfo" in this)
			_object.failInfo = this.failInfo.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
