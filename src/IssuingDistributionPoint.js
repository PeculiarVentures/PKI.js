import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import GeneralName from "./GeneralName.js";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames.js";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class IssuingDistributionPoint
{
	//**********************************************************************************
	/**
	 * Constructor for IssuingDistributionPoint class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("distributionPoint" in parameters)
			/**
			 * @type {Array.<GeneralName>|RelativeDistinguishedNames}
			 * @desc distributionPoint
			 */
			this.distributionPoint = getParametersValue(parameters, "distributionPoint", IssuingDistributionPoint.defaultValues("distributionPoint"));

		/**
		 * @type {boolean}
		 * @desc onlyContainsUserCerts
		 */
		this.onlyContainsUserCerts = getParametersValue(parameters, "onlyContainsUserCerts", IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"));

		/**
		 * @type {boolean}
		 * @desc onlyContainsCACerts
		 */
		this.onlyContainsCACerts = getParametersValue(parameters, "onlyContainsCACerts", IssuingDistributionPoint.defaultValues("onlyContainsCACerts"));

		if("onlySomeReasons" in parameters)
			/**
			 * @type {number}
			 * @desc onlySomeReasons
			 */
			this.onlySomeReasons = getParametersValue(parameters, "onlySomeReasons", IssuingDistributionPoint.defaultValues("onlySomeReasons"));

		/**
		 * @type {boolean}
		 * @desc indirectCRL
		 */
		this.indirectCRL = getParametersValue(parameters, "indirectCRL", IssuingDistributionPoint.defaultValues("indirectCRL"));

		/**
		 * @type {boolean}
		 * @desc onlyContainsAttributeCerts
		 */
		this.onlyContainsAttributeCerts = getParametersValue(parameters, "onlyContainsAttributeCerts", IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"));
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
			case "onlyContainsUserCerts":
				return false;
			case "onlyContainsCACerts":
				return false;
			case "onlySomeReasons":
				return 0;
			case "indirectCRL":
				return false;
			case "onlyContainsAttributeCerts":
				return false;
			default:
				throw new Error(`Invalid member name for IssuingDistributionPoint class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * IssuingDistributionPoint ::= SEQUENCE {
	 *    distributionPoint          [0] DistributionPointName OPTIONAL,
	 *    onlyContainsUserCerts      [1] BOOLEAN DEFAULT FALSE,
	 *    onlyContainsCACerts        [2] BOOLEAN DEFAULT FALSE,
	 *    onlySomeReasons            [3] ReasonFlags OPTIONAL,
	 *    indirectCRL                [4] BOOLEAN DEFAULT FALSE,
	 *    onlyContainsAttributeCerts [5] BOOLEAN DEFAULT FALSE }
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
		 * @property {string} [onlyContainsUserCerts]
		 * @property {string} [onlyContainsCACerts]
		 * @property {string} [onlySomeReasons]
		 * @property {string} [indirectCRL]
		 * @property {string} [onlyContainsAttributeCerts]
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
					name: (names.onlyContainsUserCerts || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				}), // IMPLICIT boolean value
				new asn1js.Primitive({
					name: (names.onlyContainsCACerts || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					}
				}), // IMPLICIT boolean value
				new asn1js.Primitive({
					name: (names.onlySomeReasons || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					}
				}), // IMPLICIT bitstring value
				new asn1js.Primitive({
					name: (names.indirectCRL || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 4 // [4]
					}
				}), // IMPLICIT boolean value
				new asn1js.Primitive({
					name: (names.onlyContainsAttributeCerts || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 5 // [5]
					}
				}) // IMPLICIT boolean value
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
			"onlyContainsUserCerts",
			"onlyContainsCACerts",
			"onlySomeReasons",
			"indirectCRL",
			"onlyContainsAttributeCerts"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			IssuingDistributionPoint.schema({
				names: {
					distributionPoint: "distributionPoint",
					distributionPointNames: "distributionPointNames",
					onlyContainsUserCerts: "onlyContainsUserCerts",
					onlyContainsCACerts: "onlyContainsCACerts",
					onlySomeReasons: "onlySomeReasons",
					indirectCRL: "indirectCRL",
					onlyContainsAttributeCerts: "onlyContainsAttributeCerts"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for IssuingDistributionPoint");
		//endregion
		
		//region Get internal properties from parsed schema
		if("distributionPoint" in asn1.result)
		{
			switch(true)
			{
				case (asn1.result.distributionPoint.idBlock.tagNumber === 0): // GENERAL_NAMES variant
					this.distributionPoint = Array.from(asn1.result.distributionPointNames, element => new GeneralName({ schema: element }));
					break;
				case (asn1.result.distributionPoint.idBlock.tagNumber === 1): // RDN variant
					{
						this.distributionPoint = new RelativeDistinguishedNames({
							schema: new asn1js.Sequence({
								value: asn1.result.distributionPoint.valueBlock.value
							})
						});
					}
					break;
				default:
					throw new Error("Unknown tagNumber for distributionPoint: {$asn1.result.distributionPoint.idBlock.tagNumber}");
			}
		}
		
		if("onlyContainsUserCerts" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.onlyContainsUserCerts.valueBlock.valueHex);
			this.onlyContainsUserCerts = (view[0] !== 0x00);
		}
		
		if("onlyContainsCACerts" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.onlyContainsCACerts.valueBlock.valueHex);
			this.onlyContainsCACerts = (view[0] !== 0x00);
		}
		
		if("onlySomeReasons" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.onlySomeReasons.valueBlock.valueHex);
			this.onlySomeReasons = view[0];
		}
		
		if("indirectCRL" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.indirectCRL.valueBlock.valueHex);
			this.indirectCRL = (view[0] !== 0x00);
		}
		
		if("onlyContainsAttributeCerts" in asn1.result)
		{
			const view = new Uint8Array(asn1.result.onlyContainsAttributeCerts.valueBlock.valueHex);
			this.onlyContainsAttributeCerts = (view[0] !== 0x00);
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
		
		if("distributionPoint" in this)
		{
			let value;
			
			if(this.distributionPoint instanceof Array)
			{
				value = new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: Array.from(this.distributionPoint, element => element.toSchema())
				});
			}
			else
			{
				value = this.distributionPoint.toSchema();
				
				value.idBlock.tagClass = 3; // CONTEXT - SPECIFIC
				value.idBlock.tagNumber = 1; // [1]
			}
			
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [value]
			}));
		}
		
		if(this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"))
		{
			outputArray.push(new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				valueHex: (new Uint8Array([0xFF])).buffer
			}));
		}
		
		if(this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts"))
		{
			outputArray.push(new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				valueHex: (new Uint8Array([0xFF])).buffer
			}));
		}
		
		if("onlySomeReasons" in this)
		{
			const buffer = new ArrayBuffer(1);
			const view = new Uint8Array(buffer);
			
			view[0] = this.onlySomeReasons;
			
			outputArray.push(new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				valueHex: buffer
			}));
		}
		
		if(this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL"))
		{
			outputArray.push(new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 4 // [4]
				},
				valueHex: (new Uint8Array([0xFF])).buffer
			}));
		}
		
		if(this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"))
		{
			outputArray.push(new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 5 // [5]
				},
				valueHex: (new Uint8Array([0xFF])).buffer
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
		
		if(this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"))
			object.onlyContainsUserCerts = this.onlyContainsUserCerts;
		
		if(this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts"))
			object.onlyContainsCACerts = this.onlyContainsCACerts;
		
		if("onlySomeReasons" in this)
			object.onlySomeReasons = this.onlySomeReasons;
		
		if(this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL"))
			object.indirectCRL = this.indirectCRL;
		
		if(this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"))
			object.onlyContainsAttributeCerts = this.onlyContainsAttributeCerts;
		
		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
