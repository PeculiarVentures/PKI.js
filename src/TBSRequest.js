import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import GeneralName from "./GeneralName.js";
import Request from "./Request.js";
import Extension from "./Extension.js";
import Extensions from "./Extensions.js";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class TBSRequest
{
	//**********************************************************************************
	/**
	 * Constructor for TBSRequest class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {ArrayBuffer}
		 * @desc tbs
		 */
		this.tbs = getParametersValue(parameters, "tbs", TBSRequest.defaultValues("tbs"));

		if("version" in parameters)
			/**
			 * @type {number}
			 * @desc version
			 */
			this.version = getParametersValue(parameters, "version", TBSRequest.defaultValues("version"));

		if("requestorName" in parameters)
			/**
			 * @type {GeneralName}
			 * @desc requestorName
			 */
			this.requestorName = getParametersValue(parameters, "requestorName", TBSRequest.defaultValues("requestorName"));

		/**
		 * @type {Array.<Request>}
		 * @desc requestList
		 */
		this.requestList = getParametersValue(parameters, "requestList", TBSRequest.defaultValues("requestList"));

		if("requestExtensions" in parameters)
			/**
			 * @type {Array.<Extension>}
			 * @desc requestExtensions
			 */
			this.requestExtensions = getParametersValue(parameters, "requestExtensions", TBSRequest.defaultValues("requestExtensions"));
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
			case "tbs":
				return new ArrayBuffer(0);
			case "version":
				return 0;
			case "requestorName":
				return new GeneralName();
			case "requestList":
			case "requestExtensions":
				return [];
			default:
				throw new Error(`Invalid member name for TBSRequest class: ${memberName}`);
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
			case "tbs":
				return (memberValue.byteLength === 0);
			case "version":
				return (memberValue === TBSRequest.defaultValues(memberName));
			case "requestorName":
				return ((memberValue.type === GeneralName.defaultValues("type")) && (Object.keys(memberValue.value).length === 0));
			case "requestList":
			case "requestExtensions":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for TBSRequest class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * TBSRequest      ::=     SEQUENCE {
	 *    version             [0]     EXPLICIT Version DEFAULT v1,
	 *    requestorName       [1]     EXPLICIT GeneralName OPTIONAL,
	 *    requestList                 SEQUENCE OF Request,
	 *    requestExtensions   [2]     EXPLICIT Extensions OPTIONAL }
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
		 * @property {string} [TBSRequestVersion]
		 * @property {string} [requestorName]
		 * @property {string} [requestList]
		 * @property {string} [requests]
		 * @property {string} [requestNames]
		 * @property {string} [extensions]
		 * @property {string} [requestExtensions]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || "TBSRequest"),
			value: [
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new asn1js.Integer({ name: (names.TBSRequestVersion || "TBSRequest.version") })]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [GeneralName.schema(names.requestorName || {
						names: {
							blockName: "TBSRequest.requestorName"
						}
					})]
				}),
				new asn1js.Sequence({
					name: (names.requestList || "TBSRequest.requestList"),
					value: [
						new asn1js.Repeated({
							name: (names.requests || "TBSRequest.requests"),
							value: Request.schema(names.requestNames || {})
						})
					]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [Extensions.schema(names.extensions || {
						names: {
							blockName: (names.requestExtensions || "TBSRequest.requestExtensions")
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
			"TBSRequest",
			"TBSRequest.version",
			"TBSRequest.requestorName",
			"TBSRequest.requests",
			"TBSRequest.requestExtensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			TBSRequest.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for TBSRequest");
		//endregion

		//region Get internal properties from parsed schema
		this.tbs = asn1.result.TBSRequest.valueBeforeDecode;

		if("TBSRequest.version" in asn1.result)
			this.version = asn1.result["TBSRequest.version"].valueBlock.valueDec;
		if("TBSRequest.requestorName" in asn1.result)
			this.requestorName = new GeneralName({ schema: asn1.result["TBSRequest.requestorName"] });

		this.requestList = Array.from(asn1.result["TBSRequest.requests"], element => new Request({ schema: element }));

		if("TBSRequest.requestExtensions" in asn1.result)
			this.requestExtensions = Array.from(asn1.result["TBSRequest.requestExtensions"].valueBlock.value, element => new Extension({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @param {boolean} encodeFlag If param equal to false then create TBS schema via decoding stored value. In othe case create TBS schema via assembling from TBS parts.
	 * @returns {Object} asn1js object
	 */
	toSchema(encodeFlag = false)
	{
		//region Decode stored TBS value
		let tbsSchema;

		if(encodeFlag === false)
		{
			if(this.tbs.byteLength === 0) // No stored TBS part
				return TBSRequest.schema();

			tbsSchema = asn1js.fromBER(this.tbs).result;
		}
		//endregion
		//region Create TBS schema via assembling from TBS parts
		else
		{
			const outputArray = [];

			if("version" in this)
			{
				outputArray.push(new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new asn1js.Integer({ value: this.version })]
				}));
			}

			if("requestorName" in this)
			{
				outputArray.push(new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [this.requestorName.toSchema()]
				}));
			}

			outputArray.push(new asn1js.Sequence({
				value: Array.from(this.requestList, element => element.toSchema())
			}));

			if("requestExtensions" in this)
			{
				outputArray.push(new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [
						new asn1js.Sequence({
							value: Array.from(this.requestExtensions, element => element.toSchema())
						})
					]
				}));
			}

			tbsSchema = new asn1js.Sequence({
				value: outputArray
			});
		}
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return tbsSchema;
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

		if("version" in this)
			_object.version = this.version;

		if("requestorName" in this)
			_object.requestorName = this.requestorName.toJSON();

		_object.requestList = Array.from(this.requestList, element => element.toJSON());

		if("requestExtensions" in this)
			_object.requestExtensions = Array.from(this.requestExtensions, element => element.toJSON());

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
