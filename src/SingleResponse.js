import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import CertID from "./CertID.js";
import Extension from "./Extension.js";
import Extensions from "./Extensions.js";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class SingleResponse
{
	//**********************************************************************************
	/**
	 * Constructor for SingleResponse class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {CertID}
		 * @desc certID
		 */
		this.certID = getParametersValue(parameters, "certID", SingleResponse.defaultValues("certID"));
		/**
		 * @type {Object}
		 * @desc certStatus
		 */
		this.certStatus = getParametersValue(parameters, "certStatus", SingleResponse.defaultValues("certStatus"));
		/**
		 * @type {Date}
		 * @desc thisUpdate
		 */
		this.thisUpdate = getParametersValue(parameters, "thisUpdate", SingleResponse.defaultValues("thisUpdate"));

		if("nextUpdate" in parameters)
			/**
			 * @type {Date}
			 * @desc nextUpdate
			 */
			this.nextUpdate = getParametersValue(parameters, "nextUpdate", SingleResponse.defaultValues("nextUpdate"));

		if("singleExtensions" in parameters)
			/**
			 * @type {Array.<Extension>}
			 * @desc singleExtensions
			 */
			this.singleExtensions = getParametersValue(parameters, "singleExtensions", SingleResponse.defaultValues("singleExtensions"));
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
			case "certID":
				return new CertID();
			case "certStatus":
				return {};
			case "thisUpdate":
			case "nextUpdate":
				return new Date(0, 0, 0);
			case "singleExtensions":
				return [];
			default:
				throw new Error(`Invalid member name for SingleResponse class: ${memberName}`);
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
			case "certID":
				// noinspection OverlyComplexBooleanExpressionJS
				return ((CertID.compareWithDefault("hashAlgorithm", memberValue.hashAlgorithm)) &&
						(CertID.compareWithDefault("issuerNameHash", memberValue.issuerNameHash)) &&
						(CertID.compareWithDefault("issuerKeyHash", memberValue.issuerKeyHash)) &&
						(CertID.compareWithDefault("serialNumber", memberValue.serialNumber)));
			case "certStatus":
				return (Object.keys(memberValue).length === 0);
			case "thisUpdate":
			case "nextUpdate":
				return (memberValue === SingleResponse.defaultValues(memberName));
			default:
				throw new Error(`Invalid member name for SingleResponse class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * SingleResponse ::= SEQUENCE {
	 *    certID                       CertID,
	 *    certStatus                   CertStatus,
	 *    thisUpdate                   GeneralizedTime,
	 *    nextUpdate         [0]       EXPLICIT GeneralizedTime OPTIONAL,
	 *    singleExtensions   [1]       EXPLICIT Extensions OPTIONAL }
	 *
	 * CertStatus ::= CHOICE {
	 *    good        [0]     IMPLICIT NULL,
	 *    revoked     [1]     IMPLICIT RevokedInfo,
	 *    unknown     [2]     IMPLICIT UnknownInfo }
	 *
	 * RevokedInfo ::= SEQUENCE {
	 *    revocationTime              GeneralizedTime,
	 *    revocationReason    [0]     EXPLICIT CRLReason OPTIONAL }
	 *
	 * UnknownInfo ::= NULL
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
		 * @property {string} [certID]
		 * @property {string} [certStatus]
		 * @property {string} [thisUpdate]
		 * @property {string} [nextUpdate]
		 * @property {string} [singleExtensions]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				CertID.schema(names.certID || {}),
				new asn1js.Choice({
					value: [
						new asn1js.Primitive({
							name: (names.certStatus || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							lenBlockLength: 1 // The length contains one byte 0x00
						}), // IMPLICIT NULL (no "valueBlock")
						new asn1js.Constructed({
							name: (names.certStatus || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [
								new asn1js.GeneralizedTime(),
								new asn1js.Constructed({
									optional: true,
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 0 // [0]
									},
									value: [new asn1js.Enumerated()]
								})
							]
						}),
						new asn1js.Primitive({
							name: (names.certStatus || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 2 // [2]
							},
							lenBlock: { length: 1 }
						}) // IMPLICIT NULL (no "valueBlock")
					]
				}),
				new asn1js.GeneralizedTime({ name: (names.thisUpdate || "") }),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new asn1js.GeneralizedTime({ name: (names.nextUpdate || "") })]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [Extensions.schema(names.singleExtensions || {})]
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
			"certID",
			"certStatus",
			"thisUpdate",
			"nextUpdate",
			"singleExtensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			SingleResponse.schema({
				names: {
					certID: {
						names: {
							blockName: "certID"
						}
					},
					certStatus: "certStatus",
					thisUpdate: "thisUpdate",
					nextUpdate: "nextUpdate",
					singleExtensions: {
						names: {
							blockName:
								"singleExtensions"
						}
					}
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SingleResponse");
		//endregion

		//region Get internal properties from parsed schema
		this.certID = new CertID({ schema: asn1.result.certID });
		this.certStatus = asn1.result.certStatus;
		this.thisUpdate = asn1.result.thisUpdate.toDate();
		if("nextUpdate" in asn1.result)
			this.nextUpdate = asn1.result.nextUpdate.toDate();

		if("singleExtensions" in asn1.result)
			this.singleExtensions = Array.from(asn1.result.singleExtensions.valueBlock.value, element => new Extension({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create value array for output sequence
		const outputArray = [];

		outputArray.push(this.certID.toSchema());
		outputArray.push(this.certStatus);
		outputArray.push(new asn1js.GeneralizedTime({ valueDate: this.thisUpdate }));
		if("nextUpdate" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [new asn1js.GeneralizedTime({ valueDate: this.nextUpdate })]
			}));
		}

		if("singleExtensions" in this)
		{
			outputArray.push(new asn1js.Sequence({
				value: Array.from(this.singleExtensions, element => element.toSchema())
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
		const _object = {
			certID: this.certID.toJSON(),
			certStatus: this.certStatus.toJSON(),
			thisUpdate: this.thisUpdate
		};

		if("nextUpdate" in this)
			_object.nextUpdate = this.nextUpdate;

		if("singleExtensions" in this)
			_object.singleExtensions = Array.from(this.singleExtensions, element => element.toJSON());

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
