import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import GeneralName from "./GeneralName.js";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames.js";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class DistributionPoint
{
	//**********************************************************************************
	/**
	 * Constructor for DistributionPoint class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {Object} [distributionPoint]
	 * @property {Object} [reasons]
	 * @property {Object} [cRLIssuer]
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("distributionPoint" in parameters)
			/**
			 * @type {Array.<GeneralName>}
			 * @desc distributionPoint
			 */
			this.distributionPoint = getParametersValue(parameters, "distributionPoint", DistributionPoint.defaultValues("distributionPoint"));

		if("reasons" in parameters)
			/**
			 * @type {BitString}
			 * @desc values
			 */
			this.reasons = getParametersValue(parameters, "reasons", DistributionPoint.defaultValues("reasons"));

		if("cRLIssuer" in parameters)
			/**
			 * @type {Array.<GeneralName>}
			 * @desc cRLIssuer
			 */
			this.cRLIssuer = getParametersValue(parameters, "cRLIssuer", DistributionPoint.defaultValues("cRLIssuer"));
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
			case "distributionPoint":
				return [];
			case "reasons":
				return new asn1js.BitString();
			case "cRLIssuer":
				return [];
			default:
				throw new Error(`Invalid member name for DistributionPoint class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * DistributionPoint ::= SEQUENCE {
	 *    distributionPoint       [0]     DistributionPointName OPTIONAL,
	 *    reasons                 [1]     ReasonFlags OPTIONAL,
	 *    cRLIssuer               [2]     GeneralNames OPTIONAL }
	 *
	 * DistributionPointName ::= CHOICE {
	 *    fullName                [0]     GeneralNames,
	 *    nameRelativeToCRLIssuer [1]     RelativeDistinguishedName }
	 *
	 * ReasonFlags ::= BIT STRING {
	 *    unused                  (0),
	 *    keyCompromise           (1),
	 *    cACompromise            (2),
	 *    affiliationChanged      (3),
	 *    superseded              (4),
	 *    cessationOfOperation    (5),
	 *    certificateHold         (6),
	 *    privilegeWithdrawn      (7),
	 *    aACompromise            (8) }
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
		 * @property {string} [distributionPoint]
		 * @property {string} [distributionPointNames]
		 * @property {string} [reasons]
		 * @property {string} [cRLIssuer]
		 * @property {string} [cRLIssuerNames]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new asn1js.Choice({
							value: [
								new asn1js.Constructed({
									name: (names.distributionPoint || ""),
									optional: true,
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 0 // [0]
									},
									value: [
										new asn1js.Repeated({
											name: (names.distributionPointNames || ""),
											value: GeneralName.schema()
										})
									]
								}),
								new asn1js.Constructed({
									name: (names.distributionPoint || ""),
									optional: true,
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 1 // [1]
									},
									value: RelativeDistinguishedNames.schema().valueBlock.value
								})
							]
						})
					]
				}),
				new asn1js.Primitive({
					name: (names.reasons || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				}), // IMPLICIT bitstring value
				new asn1js.Constructed({
					name: (names.cRLIssuer || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [
						new asn1js.Repeated({
							name: (names.cRLIssuerNames || ""),
							value: GeneralName.schema()
						})
					]
				}) // IMPLICIT bitstring value
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
			"distributionPoint",
			"distributionPointNames",
			"reasons",
			"cRLIssuer",
			"cRLIssuerNames"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			DistributionPoint.schema({
				names: {
					distributionPoint: "distributionPoint",
					distributionPointNames: "distributionPointNames",
					reasons: "reasons",
					cRLIssuer: "cRLIssuer",
					cRLIssuerNames: "cRLIssuerNames"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for DistributionPoint");
		//endregion

		//region Get internal properties from parsed schema
		if("distributionPoint" in asn1.result)
		{
			if(asn1.result.distributionPoint.idBlock.tagNumber === 0) // GENERAL_NAMES variant
				this.distributionPoint = Array.from(asn1.result.distributionPointNames, element => new GeneralName({ schema: element }));

			if(asn1.result.distributionPoint.idBlock.tagNumber === 1) // RDN variant
			{
				this.distributionPoint = new RelativeDistinguishedNames({
					schema: new asn1js.Sequence({
						value: asn1.result.distributionPoint.valueBlock.value
					})
				});
			}
		}

		if("reasons" in asn1.result)
			this.reasons = new asn1js.BitString({ valueHex: asn1.result.reasons.valueBlock.valueHex });

		if("cRLIssuer" in asn1.result)
			this.cRLIssuer = Array.from(asn1.result.cRLIssuerNames, element => new GeneralName({ schema: element }));
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
		
		if("distributionPoint" in this)
		{
			let internalValue;
			
			if(this.distributionPoint instanceof Array)
			{
				internalValue = new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: Array.from(this.distributionPoint, element => element.toSchema())
				});
			}
			else
			{
				internalValue = new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [this.distributionPoint.toSchema()]
				});
			}
			
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [internalValue]
			}));
		}
		
		if("reasons" in this)
		{
			outputArray.push(new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				valueHex: this.reasons.valueBlock.valueHex
			}));
		}
		
		if("cRLIssuer" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				value: Array.from(this.cRLIssuer, element => element.toSchema())
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
		const object = {};

		if("distributionPoint" in this)
		{
			if(this.distributionPoint instanceof Array)
				object.distributionPoint = Array.from(this.distributionPoint, element => element.toJSON());
			else
				object.distributionPoint = this.distributionPoint.toJSON();
		}

		if("reasons" in this)
			object.reasons = this.reasons.toJSON();

		if("cRLIssuer" in this)
			object.cRLIssuer = Array.from(this.cRLIssuer, element => element.toJSON());

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
