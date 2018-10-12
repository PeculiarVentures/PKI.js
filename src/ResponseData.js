import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames.js";
import SingleResponse from "./SingleResponse.js";
import Extension from "./Extension.js";
import Extensions from "./Extensions.js";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class ResponseData
{
	//**********************************************************************************
	/**
	 * Constructor for ResponseData class
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
		this.tbs = getParametersValue(parameters, "tbs", ResponseData.defaultValues("tbs"));
		/**
		 * @type {Object}
		 * @desc responderID
		 */
		this.responderID = getParametersValue(parameters, "responderID", ResponseData.defaultValues("responderID"));
		/**
		 * @type {Date}
		 * @desc producedAt
		 */
		this.producedAt = getParametersValue(parameters, "producedAt", ResponseData.defaultValues("producedAt"));
		/**
		 * @type {Array.<SingleResponse>}
		 * @desc responses
		 */
		this.responses = getParametersValue(parameters, "responses", ResponseData.defaultValues("responses"));

		if("responseExtensions" in parameters)
			/**
			 * @type {Array.<Extension>}
			 * @desc responseExtensions
			 */
			this.responseExtensions = getParametersValue(parameters, "responseExtensions", ResponseData.defaultValues("responseExtensions"));
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
			case "responderID":
				return {};
			case "producedAt":
				return new Date(0, 0, 0);
			case "responses":
			case "responseExtensions":
				return [];
			default:
				throw new Error(`Invalid member name for ResponseData class: ${memberName}`);
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
			case "responderID":
				return (Object.keys(memberValue).length === 0);
			case "producedAt":
				return (memberValue === ResponseData.defaultValues(memberName));
			case "responses":
			case "responseExtensions":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for ResponseData class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * ResponseData ::= SEQUENCE {
	 *    version              [0] EXPLICIT Version DEFAULT v1,
	 *    responderID              ResponderID,
	 *    producedAt               GeneralizedTime,
	 *    responses                SEQUENCE OF SingleResponse,
	 *    responseExtensions   [1] EXPLICIT Extensions OPTIONAL }
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
		 * @property {string} [version]
		 * @property {string} [ResponseDataByName]
		 * @property {string} [ResponseDataByKey]
		 * @property {string} [producedAt]
		 * @property {string} [response]
		 * @property {string} [extensions]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || "ResponseData"),
			value: [
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new asn1js.Integer({ name: (names.version || "ResponseData.version") })]
				}),
				new asn1js.Choice({
					value: [
						new asn1js.Constructed({
							name: (names.responderID || "ResponseData.responderID"),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [RelativeDistinguishedNames.schema(names.ResponseDataByName || {
								names: {
									blockName: "ResponseData.byName"
								}
							})]
						}),
						new asn1js.Constructed({
							name: (names.responderID || "ResponseData.responderID"),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 2 // [2]
							},
							value: [new asn1js.OctetString({ name: (names.ResponseDataByKey || "ResponseData.byKey") })]
						})
					]
				}),
				new asn1js.GeneralizedTime({ name: (names.producedAt || "ResponseData.producedAt") }),
				new asn1js.Sequence({
					value: [
						new asn1js.Repeated({
							name: "ResponseData.responses",
							value: SingleResponse.schema(names.response || {})
						})
					]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [Extensions.schema(names.extensions || {
						names: {
							blockName: "ResponseData.responseExtensions"
						}
					})]
				}) // EXPLICIT SEQUENCE value
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
			"ResponseData",
			"ResponseData.version",
			"ResponseData.responderID",
			"ResponseData.producedAt",
			"ResponseData.responses",
			"ResponseData.responseExtensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			ResponseData.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ResponseData");
		//endregion

		//region Get internal properties from parsed schema
		this.tbs = asn1.result.ResponseData.valueBeforeDecode;

		if("ResponseData.version" in asn1.result)
			this.version = asn1.result["ResponseData.version"].valueBlock.valueDec;

		if(asn1.result["ResponseData.responderID"].idBlock.tagNumber === 1)
			this.responderID = new RelativeDistinguishedNames({ schema: asn1.result["ResponseData.responderID"].valueBlock.value[0] });
		else
			this.responderID = asn1.result["ResponseData.responderID"].valueBlock.value[0]; // OCTETSTRING

		this.producedAt = asn1.result["ResponseData.producedAt"].toDate();
		this.responses = Array.from(asn1.result["ResponseData.responses"], element => new SingleResponse({ schema: element }));

		if("ResponseData.responseExtensions" in asn1.result)
			this.responseExtensions = Array.from(asn1.result["ResponseData.responseExtensions"].valueBlock.value, element => new Extension({ schema: element }));
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
			if(this.tbs.length === 0) // No stored certificate TBS part
				return ResponseData.schema();
			
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
			
			if(this.responderID instanceof RelativeDistinguishedNames)
			{
				outputArray.push(new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [this.responderID.toSchema()]
				}));
			}
			else
			{
				outputArray.push(new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [this.responderID]
				}));
			}
			
			outputArray.push(new asn1js.GeneralizedTime({ valueDate: this.producedAt }));

			outputArray.push(new asn1js.Sequence({
				value: Array.from(this.responses, element => element.toSchema())
			}));
			
			if("responseExtensions" in this)
			{
				outputArray.push(new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [new asn1js.Sequence({
						value: Array.from(this.responseExtensions, element => element.toSchema())
					})]
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

		if("responderID" in this)
			_object.responderID = this.responderID;

		if("producedAt" in this)
			_object.producedAt = this.producedAt;

		if("responses" in this)
			_object.responses = Array.from(this.responses, element => element.toJSON());

		if("responseExtensions" in this)
			_object.responseExtensions = Array.from(this.responseExtensions, element => element.toJSON());

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
