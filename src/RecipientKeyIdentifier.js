import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import OtherKeyAttribute from "./OtherKeyAttribute.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class RecipientKeyIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientKeyIdentifier class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {OctetString}
		 * @desc subjectKeyIdentifier
		 */
		this.subjectKeyIdentifier = getParametersValue(parameters, "subjectKeyIdentifier", RecipientKeyIdentifier.defaultValues("subjectKeyIdentifier"));

		if("date" in parameters)
			/**
			 * @type {GeneralizedTime}
			 * @desc date
			 */
			this.date = getParametersValue(parameters, "date", RecipientKeyIdentifier.defaultValues("date"));

		if("other" in parameters)
			/**
			 * @type {OtherKeyAttribute}
			 * @desc other
			 */
			this.other = getParametersValue(parameters, "other", RecipientKeyIdentifier.defaultValues("other"));
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
			case "subjectKeyIdentifier":
				return new asn1js.OctetString();
			case "date":
				return new asn1js.GeneralizedTime();
			case "other":
				return new OtherKeyAttribute();
			default:
				throw new Error(`Invalid member name for RecipientKeyIdentifier class: ${memberName}`);
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
			case "subjectKeyIdentifier":
				return (memberValue.isEqual(RecipientKeyIdentifier.defaultValues("subjectKeyIdentifier")));
			case "date":
				// noinspection OverlyComplexBooleanExpressionJS
				return ((memberValue.year === 0) &&
				(memberValue.month === 0) &&
				(memberValue.day === 0) &&
				(memberValue.hour === 0) &&
				(memberValue.minute === 0) &&
				(memberValue.second === 0) &&
				(memberValue.millisecond === 0));
			case "other":
				return ((memberValue.keyAttrId === "") && (("keyAttr" in memberValue) === false));
			default:
				throw new Error(`Invalid member name for RecipientKeyIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientKeyIdentifier ::= SEQUENCE {
	 *    subjectKeyIdentifier SubjectKeyIdentifier,
	 *    date GeneralizedTime OPTIONAL,
	 *    other OtherKeyAttribute OPTIONAL }
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
		 * @property {string} [type]
		 * @property {string} [setName]
		 * @property {string} [values]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.OctetString({ name: (names.subjectKeyIdentifier || "") }),
				new asn1js.GeneralizedTime({
					optional: true,
					name: (names.date || "")
				}),
				OtherKeyAttribute.schema(names.other || {})
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
			"subjectKeyIdentifier",
			"date",
			"other"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			RecipientKeyIdentifier.schema({
				names: {
					subjectKeyIdentifier: "subjectKeyIdentifier",
					date: "date",
					other: {
						names: {
							blockName: "other"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientKeyIdentifier");
		//endregion

		//region Get internal properties from parsed schema
		this.subjectKeyIdentifier = asn1.result.subjectKeyIdentifier;

		if("date" in asn1.result)
			this.date = asn1.result.date;

		if("other" in asn1.result)
			this.other = new OtherKeyAttribute({ schema: asn1.result.other });
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

		outputArray.push(this.subjectKeyIdentifier);

		if("date" in this)
			outputArray.push(this.date);

		if("other" in this)
			outputArray.push(this.other.toSchema());
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
			subjectKeyIdentifier: this.subjectKeyIdentifier.toJSON()
		};

		if("date" in this)
			_object.date = this.date;

		if("other" in this)
			_object.other = this.other.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
