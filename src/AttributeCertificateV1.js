import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import GeneralNames from "./GeneralNames";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import Attribute from "./Attribute";
import Extensions from "./Extensions";
//**************************************************************************************
/**
 * Class from RFC5755
 */
export class AttCertValidityPeriod
{
	//**********************************************************************************
	/**
	 * Constructor for AttCertValidityPeriod class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {GeneralizedTime}
		 * @description notBeforeTime
		 */
		this.notBeforeTime = getParametersValue(parameters, "notBeforeTime", AttCertValidityPeriod.defaultValues("notBeforeTime"));
		/**
		 * @type {GeneralizedTime}
		 * @description notAfterTime
		 */
		this.notAfterTime = getParametersValue(parameters, "notAfterTime", AttCertValidityPeriod.defaultValues("notAfterTime"));
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
			case "notBeforeTime":
			case "notAfterTime":
				return new Date(0, 0, 0);
			default:
				throw new Error(`Invalid member name for AttCertValidityPeriod class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
        // AttCertValidityPeriod  ::= SEQUENCE {
        //   notBeforeTime  GeneralizedTime,
        //   notAfterTime   GeneralizedTime
        // }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [notBeforeTime]
		 * @property {string} [notAfterTime]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.GeneralizedTime({ name: (names.notBeforeTime || "") }),
				new asn1js.GeneralizedTime({ name: (names.notAfterTime || "") })
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			AttCertValidityPeriod.schema({
				names: {
					notBeforeTime: "notBeforeTime",
					notAfterTime: "notAfterTime"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttCertValidityPeriod");
		//endregion
		
		//region Get internal properties from parsed schema
		this.notBeforeTime = asn1.result.notBeforeTime.toDate();
		this.notAfterTime = asn1.result.notAfterTime.toDate();
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				new asn1js.GeneralizedTime({ valueDate: this.notBeforeTime }),
				new asn1js.GeneralizedTime({ valueDate: this.notAfterTime }),
			]
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
		return {
			notBeforeTime: this.notBeforeTime,
			notAfterTime: this.notAfterTime
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
export class ObjectDigestInfo
{
	//**********************************************************************************
	/**
	 * Constructor for ObjectDigestInfo class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Enumerated}
		 * @description digestedObjectType
		 */
		this.digestedObjectType = getParametersValue(parameters, "digestedObjectType", ObjectDigestInfo.defaultValues("digestedObjectType"));
		
		if("otherObjectTypeID" in parameters)
			/**
			 * @type {ObjectIdentifier}
			 * @description otherObjectTypeID
			 */
			this.otherObjectTypeID = getParametersValue(parameters, "otherObjectTypeID", ObjectDigestInfo.defaultValues("otherObjectTypeID"));
			
		/**
		 * @type {AlgorithmIdentifier}
		 * @description digestAlgorithm
		 */
		this.digestAlgorithm = getParametersValue(parameters, "digestAlgorithm", ObjectDigestInfo.defaultValues("digestAlgorithm"));
		/**
		 * @type {BitString}
		 * @description objectDigest
		 */
		this.objectDigest = getParametersValue(parameters, "objectDigest", ObjectDigestInfo.defaultValues("objectDigest"));
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
			case "digestedObjectType":
				return new asn1js.Enumerated();
			case "otherObjectTypeID":
				return new asn1js.ObjectIdentifier();
			case "digestAlgorithm":
				return new AlgorithmIdentifier();
			case "objectDigest":
				return new asn1js.BitString();
			default:
				throw new Error(`Invalid member name for ObjectDigestInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
        // ObjectDigestInfo ::= SEQUENCE {
        //   digestedObjectType  ENUMERATED {
        //     publicKey            (0),
        //     publicKeyCert        (1),
        //     otherObjectTypes     (2) },
        //   -- otherObjectTypes MUST NOT
        //   -- be used in this profile
        //   otherObjectTypeID   OBJECT IDENTIFIER OPTIONAL,
        //   digestAlgorithm     AlgorithmIdentifier,
        //   objectDigest        BIT STRING
        // }

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [digestedObjectType]
		 * @property {string} [otherObjectTypeID]
		 * @property {string} [digestAlgorithm]
		 * @property {string} [objectDigest]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Enumerated({ name: (names.digestedObjectType || "") }),
				new asn1js.ObjectIdentifier({
					optional: true,
					name: (names.otherObjectTypeID || "")
				}),
				AlgorithmIdentifier.schema(names.digestAlgorithm || {}),
				new asn1js.BitString({ name: (names.objectDigest || "") }),
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			ObjectDigestInfo.schema({
				names: {
					digestedObjectType: "digestedObjectType",
					otherObjectTypeID: "otherObjectTypeID",
					digestAlgorithm: {
						names: {
							blockName: "digestAlgorithm"
						}
					},
					objectDigest: "objectDigest"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ObjectDigestInfo");
		//endregion
		
		//region Get internal properties from parsed schema
		this.digestedObjectType = asn1.result.digestedObjectType;
		
		if("otherObjectTypeID" in asn1.result)
			this.otherObjectTypeID = asn1.result.otherObjectTypeID;
		
		this.digestAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.digestAlgorithm });
		this.objectDigest = asn1.result.objectDigest;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new asn1js.Sequence({
			value: [this.digestedObjectType]
		});
		
		if("otherObjectTypeID" in this)
			result.value.push(this.otherObjectTypeID);
		
		result.value.push(this.digestAlgorithm.toSchema());
		result.value.push(this.objectDigest);
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {
			digestedObjectType: this.digestedObjectType.toJSON()
		};
		
		if("otherObjectTypeID" in this)
			result.otherObjectTypeID = this.otherObjectTypeID.toJSON()

		result.digestAlgorithm = this.digestAlgorithm.toJSON();
		result.objectDigest = this.objectDigest.toJSON();
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
export class IssuerSerial
{
	//**********************************************************************************
	/**
	 * Constructor for IssuerSerial class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {RelativeDistinguishedNames}
		 * @description issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", IssuerSerial.defaultValues("issuer"));
		/**
		 * @type {Integer}
		 * @description serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", IssuerSerial.defaultValues("serialNumber"));
		
		if("issuerUID" in parameters)
			/**
			 * @type {BitString}
			 * @description issuerUID
			 */
			this.issuerUID = getParametersValue(parameters, "issuerUID", IssuerSerial.defaultValues("issuerUID"));
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
			case "issuer":
				return new GeneralNames();
			case "serialNumber":
				return new asn1js.Integer();
			case "issuerUID":
				return new asn1js.BitString();
			default:
				throw new Error(`Invalid member name for IssuerSerial class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		// 	IssuerSerial  ::=  SEQUENCE {
		//   	issuer         GeneralNames,
		// 		serial         CertificateSerialNumber,
		// 		issuerUID      UniqueIdentifier OPTIONAL
		// }
		//
		// CertificateSerialNumber ::= INTEGER
		// UniqueIdentifier  ::=  BIT STRING
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuer]
		 * @property {string} [serialNumber]
		 * @property {string} [issuerUID]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				GeneralNames.schema(names.issuer || {}),
				new asn1js.Integer({ name: (names.serialNumber || "") }),
				new asn1js.BitString({
					optional: true,
					name: (names.issuerUID || "")
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			IssuerSerial.schema({
				names: {
					issuer: {
						names: {
							blockName: "issuer"
						}
					},
					serialNumber: "serialNumber",
					issuerUID: "issuerUID"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for IssuerSerial");
		//endregion
		
		//region Get internal properties from parsed schema
		this.issuer = new GeneralNames({ schema: asn1.result.issuer });
		this.serialNumber = asn1.result.serialNumber;
		
		if("issuerUID" in asn1.result)
			this.issuerUID = asn1.result.issuerUID;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new asn1js.Sequence({
			value: [
				this.issuer.toSchema(),
				this.serialNumber
			]
		})
		
		if("issuerUID" in this)
			result.valueBlock.value.push(this.issuerUID);
		
		//region Construct and return new ASN.1 schema for this object
		return result;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {
			issuer: this.issuer.toJSON(),
			serialNumber: this.serialNumber.toJSON()
		};
		
		if("issuerUID" in this)
			result.issuerUID = this.issuerUID.toJSON()
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
export class V2Form
{
	//**********************************************************************************
	/**
	 * Constructor for V2Form class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("issuerName" in parameters)
			/**
			 * @type {GeneralNames}
			 * @description issuerName
			 */
			this.issuerName = getParametersValue(parameters, "issuerName", V2Form.defaultValues("issuerName"));
		
		if("baseCertificateID" in parameters)
			/**
			 * @type {IssuerSerial}
			 * @description baseCertificateID
			 */
			this.baseCertificateID = getParametersValue(parameters, "baseCertificateID", V2Form.defaultValues("baseCertificateID"));
		
		if("objectDigestInfo" in parameters)
			/**
			 * @type {ObjectDigestInfo}
			 * @description objectDigestInfo
			 */
			this.objectDigestInfo = getParametersValue(parameters, "objectDigestInfo", V2Form.defaultValues("objectDigestInfo"));
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
			case "issuerName":
				return new GeneralNames();
			case "baseCertificateID":
				return new IssuerSerial();
			case "objectDigestInfo":
				return new ObjectDigestInfo();
			default:
				throw new Error(`Invalid member name for V2Form class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
        // V2Form ::= SEQUENCE {
        //   issuerName            GeneralNames  OPTIONAL,
        //   baseCertificateID     [0] IssuerSerial  OPTIONAL,
        //   objectDigestInfo      [1] ObjectDigestInfo  OPTIONAL
        //     -- issuerName MUST be present in this profile
        //     -- baseCertificateID and objectDigestInfo MUST NOT
        //     -- be present in this profile
        // }

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuerName]
		 * @property {string} [baseCertificateID]
		 * @property {string} [objectDigestInfo]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				GeneralNames.schema({
					names: {
						blockName: names.issuerName
					}
				}, true),
				new asn1js.Constructed({
					optional: true,
					name: (names.baseCertificateID || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 0 // [0]
					},
					value: IssuerSerial.schema().valueBlock.value
				}),
				new asn1js.Constructed({
					optional: true,
					name: (names.objectDigestInfo || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 1 // [1]
					},
					value: ObjectDigestInfo.schema().valueBlock.value
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			V2Form.schema({
				names: {
					issuerName: "issuerName",
					baseCertificateID: "baseCertificateID",
					objectDigestInfo: "objectDigestInfo"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for V2Form");
		//endregion
		
		//region Get internal properties from parsed schema
		if("issuerName" in asn1.result)
			this.issuerName = new GeneralNames({ schema: asn1.result.issuerName });
		
		if("baseCertificateID" in asn1.result)
		{
			//region Making "Sequence" from "Constructed" value
			asn1.result.baseCertificateID.idBlock.tagClass = 1;
			asn1.result.baseCertificateID.idBlock.tagNumber = 16;
			//endregion
			
			this.baseCertificateID = new IssuerSerial({ schema: asn1.result.baseCertificateID });
		}
		
		if("objectDigestInfo" in asn1.result)
		{
			//region Making "Sequence" from "Constructed" value
			asn1.result.objectDigestInfo.idBlock.tagClass = 1;
			asn1.result.objectDigestInfo.idBlock.tagNumber = 16;
			//endregion
			
			this.objectDigestInfo = new ObjectDigestInfo({ schema: asn1.result.objectDigestInfo });
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
		const result = new asn1js.Sequence();
		
		if("issuerName" in this)
			result.valueBlock.value.push(this.issuerName.toSchema());
		
		if("baseCertificateID" in this)
		{
			result.valueBlock.value.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 0 // [0]
				},
				value: this.baseCertificateID.toSchema().valueBlock.value
			}));
		}

		if("objectDigestInfo" in this)
		{
			result.valueBlock.value.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 1 // [1]
				},
				value: this.objectDigestInfo.toSchema().valueBlock.value
			}));
		}

		//region Construct and return new ASN.1 schema for this object
		return result;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {};
		
		if("issuerName" in this)
			result.issuerName = this.issuerName.toJSON();
		
		if("baseCertificateID" in this)
			result.baseCertificateID = this.baseCertificateID.toJSON();

		if("objectDigestInfo" in this)
			result.objectDigestInfo = this.objectDigestInfo.toJSON();

		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
export class Holder
{
	//**********************************************************************************
	/**
	 * Constructor for Holder class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("baseCertificateID" in parameters)
			/**
			 * @type {IssuerSerial}
			 * @description baseCertificateID
			 */
			this.baseCertificateID = getParametersValue(parameters, "baseCertificateID", Holder.defaultValues("baseCertificateID"));
			
		if("entityName" in parameters)
			/**
			 * @type {GeneralNames}
			 * @description entityName
			 */
			this.entityName = getParametersValue(parameters, "entityName", Holder.defaultValues("entityName"));
			
		if("objectDigestInfo" in parameters)
			/**
			 * @type {ObjectDigestInfo}
			 * @description objectDigestInfo
			 */
			this.objectDigestInfo = getParametersValue(parameters, "objectDigestInfo", Holder.defaultValues("objectDigestInfo"));
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
			case "baseCertificateID":
				return new IssuerSerial();
			case "entityName":
				return new GeneralNames();
			case "objectDigestInfo":
				return new ObjectDigestInfo();
			default:
				throw new Error(`Invalid member name for Holder class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
        // Holder ::= SEQUENCE {
        //   baseCertificateID   [0] IssuerSerial OPTIONAL,
        //       -- the issuer and serial number of
        //       -- the holder's Public Key Certificate
        //   entityName          [1] GeneralNames OPTIONAL,
        //       -- the name of the claimant or role
        //   objectDigestInfo    [2] ObjectDigestInfo OPTIONAL
        //       -- used to directly authenticate the holder,
        //       -- for example, an executable
        // }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [baseCertificateID]
		 * @property {string} [entityName]
		 * @property {string} [objectDigestInfo]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Constructed({
					optional: true,
					name: (names.baseCertificateID || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 0 // [0]
					},
					value: IssuerSerial.schema().valueBlock.value
				}),
				new asn1js.Constructed({
					optional: true,
					name: (names.entityName || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 1 // [2]
					},
					value: GeneralNames.schema().valueBlock.value
				}),
				new asn1js.Constructed({
					optional: true,
					name: (names.objectDigestInfo || ""),
					idBlock: {
						tagClass: 3,
						tagNumber: 2 // [2]
					},
					value: ObjectDigestInfo.schema().valueBlock.value
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			Holder.schema({
				names: {
					baseCertificateID: "baseCertificateID",
					entityName: "entityName",
					objectDigestInfo: "objectDigestInfo"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Holder");
		//endregion
		
		//region Get internal properties from parsed schema
		if("baseCertificateID" in asn1.result)
		{
			//region Making "Sequence" from "Constructed" value
			asn1.result.baseCertificateID.idBlock.tagClass = 1;
			asn1.result.baseCertificateID.idBlock.tagNumber = 16;
			//endregion
			
			this.baseCertificateID = new IssuerSerial({ schema: asn1.result.baseCertificateID });
		}
		
		if("entityName" in asn1.result)
		{
			//region Making "Sequence" from "Constructed" value
			asn1.result.entityName.idBlock.tagClass = 1;
			asn1.result.entityName.idBlock.tagNumber = 16;
			//endregion
			
			this.entityName = new GeneralNames({ schema: asn1.result.entityName });
		}
		
		if("objectDigestInfo" in asn1.result)
		{
			//region Making "Sequence" from "Constructed" value
			asn1.result.objectDigestInfo.idBlock.tagClass = 1;
			asn1.result.objectDigestInfo.idBlock.tagNumber = 16;
			//endregion
			
			this.objectDigestInfo = new ObjectDigestInfo({ schema: asn1.result.objectDigestInfo });
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
		const result = new asn1js.Sequence();
		
		if("baseCertificateID" in this)
		{
			result.valueBlock.value.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 0 // [0]
				},
				value: this.baseCertificateID.toSchema().valueBlock.value
			}));
		}
		
		if("entityName" in this)
		{
			result.valueBlock.value.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 1 // [1]
				},
				value: this.entityName.toSchema().valueBlock.value
			}));
		}
		
		if("objectDigestInfo" in this)
		{
			result.valueBlock.value.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3,
					tagNumber: 2 // [2]
				},
				value: this.objectDigestInfo.toSchema().valueBlock.value
			}));
		}

		return result;
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {};
		
		if("baseCertificateID" in this)
			result.baseCertificateID = this.baseCertificateID.toJSON();
		
		if("entityName" in this)
			result.entityName = this.entityName.toJSON();

		if("objectDigestInfo" in this)
			result.objectDigestInfo = this.objectDigestInfo.toJSON();

		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
export class AttributeCertificateInfo
{
	//**********************************************************************************
	/**
	 * Constructor for AttributeCertificateInfo class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Number}
		 * @description version
		 */
		this.version = getParametersValue(parameters, "version", AttributeCertificateInfo.defaultValues("version"));
		/**
		 * @type {Holder}
		 * @description holder
		 */
		this.holder = getParametersValue(parameters, "holder", AttributeCertificateInfo.defaultValues("holder"));
		/**
		 * @type {GeneralNames|V2Form}
		 * @description issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", AttributeCertificateInfo.defaultValues("issuer"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @description signature
		 */
		this.signature = getParametersValue(parameters, "signature", AttributeCertificateInfo.defaultValues("signature"));
		/**
		 * @type {Integer}
		 * @description serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", AttributeCertificateInfo.defaultValues("serialNumber"));
		/**
		 * @type {AttCertValidityPeriod}
		 * @description attrCertValidityPeriod
		 */
		this.attrCertValidityPeriod = getParametersValue(parameters, "attrCertValidityPeriod", AttributeCertificateInfo.defaultValues("attrCertValidityPeriod"));
		/**
		 * @type {Array.<Attribute>}
		 * @description attributes
		 */
		this.attributes = getParametersValue(parameters, "attributes", AttributeCertificateInfo.defaultValues("attributes"));
		
		if("issuerUniqueID" in parameters)
			/**
			 * @type {BitString}
			 * @description issuerUniqueID
			 */
			this.issuerUniqueID = getParametersValue(parameters, "issuerUniqueID", AttributeCertificateInfo.defaultValues("issuerUniqueID"));
			
		if("extensions" in parameters)
			/**
			 * @type {Extensions}
			 * @description extensions
			 */
			this.extensions = getParametersValue(parameters, "extensions", AttributeCertificateInfo.defaultValues("extensions"));
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
			case "version":
				return 1;
			case "holder":
				return new Holder();
			case "issuer":
				return {};
			case "signature":
				return new AlgorithmIdentifier();
			case "serialNumber":
				return new asn1js.Integer();
			case "attrCertValidityPeriod":
				return new AttCertValidityPeriod();
			case "attributes":
				return [];
			case "issuerUniqueID":
				return new asn1js.BitString();
			case "extensions":
				return new Extensions();
			default:
				throw new Error(`Invalid member name for AttributeCertificateInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
        // AttributeCertificateInfo ::= SEQUENCE {
        //   version                 AttCertVersion, -- version is v2
        //   holder                  Holder,
        //   issuer                  AttCertIssuer,
        //   signature               AlgorithmIdentifier,
        //   serialNumber            CertificateSerialNumber,
        //   attrCertValidityPeriod  AttCertValidityPeriod,
        //   attributes              SEQUENCE OF Attribute,
        //   issuerUniqueID          UniqueIdentifier OPTIONAL,
        //   extensions              Extensions OPTIONAL
        // }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuer]
		 * @property {string} [serialNumber]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.version || "") }),
				Holder.schema(names.holder || {}),
				new asn1js.Choice({
					value: [
						GeneralNames.schema({
							names: {
								blockName: (names.issuer || "")
							}
						}),
						new asn1js.Constructed({
							name: (names.issuer || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: V2Form.schema().valueBlock.value
						})
					]
				}),
				AlgorithmIdentifier.schema(names.signature || {}),
				new asn1js.Integer({ name: (names.serialNumber || "") }),
				AttCertValidityPeriod.schema(names.attrCertValidityPeriod || {}),
				new asn1js.Sequence({
					name: (names.attributes || ""),
					value: [
						new asn1js.Repeated({
							value: Attribute.schema()
						})
					]
				}),
				new asn1js.BitString({
					optional: true,
					name: (names.issuerUniqueID || "")
				}),
				Extensions.schema(names.extensions || {}, true)
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			AttributeCertificateInfo.schema({
				names: {
					version: "version",
					holder: {
						names: {
							blockName: "holder"
						}
					},
					issuer: "issuer",
					signature: {
						names: {
							blockName: "signature"
						}
					},
					serialNumber: "serialNumber",
					attrCertValidityPeriod: {
						names: {
							blockName: "attrCertValidityPeriod"
						}
					},
					attributes: "attributes",
					issuerUniqueID: "issuerUniqueID",
					extensions: {
						names: {
							blockName: "extensions"
						}
					}
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttributeCertificateInfo");
		//endregion
		
		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.holder = new Holder({ schema: asn1.result.holder });
		
		switch(asn1.result.issuer.idBlock.tagClass)
		{
			case 3: // V2Form
				//region Change type to "Sequence"
				asn1.result.issuer.idBlock.tagClass = 1;
				asn1.result.issuer.idBlock.tagNumber = 16;
				//endregion
				
				this.issuer = new V2Form({ schema: asn1.result.issuer });
				break;
			case 1: // GeneralNames (should not be used)
			default:
				throw new Error("Incorect value for 'issuer' in AttributeCertificateInfo");
		}

		this.signature = new AlgorithmIdentifier({ schema: asn1.result.signature });
		this.serialNumber = asn1.result.serialNumber;
		this.attrCertValidityPeriod = new AttCertValidityPeriod({ schema: asn1.result.attrCertValidityPeriod });
		this.attributes = Array.from(asn1.result.attributes.valueBlock.value, element => new Attribute({ schema: element }));
		
		if("issuerUniqueID" in asn1.result)
			this.issuerUniqueID = asn1.result.issuerUniqueID;
		
		if("extensions" in asn1.result)
			this.extensions = new Extensions({ schema: asn1.result.extensions });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const result = new asn1js.Sequence({
			value: [
				new asn1js.Integer({ value: this.version }),
				this.holder.toSchema(),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: this.issuer.toSchema().valueBlock.value
				}),
				this.signature.toSchema(),
				this.serialNumber,
				this.attrCertValidityPeriod.toSchema(),
				new asn1js.Sequence({
					value: Array.from(this.attributes, element => element.toSchema())
				})
			]
		});
		
		if("issuerUniqueID" in this)
			result.valueBlock.value.push(this.issuerUniqueID);
		
		if("extensions" in this)
			result.valueBlock.value.push(this.extensions.toSchema());
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const result = {
			version: this.version,
			holder: this.holder.toJSON(),
			issuer: this.issuer.toJSON(),
			signature: this.signature.toJSON(),
			serialNumber: this.serialNumber.toJSON(),
			attrCertValidityPeriod: this.attrCertValidityPeriod.toJSON(),
			attributes: Array.from(this.attributes, element => element.toJSON())
		};
		
		if("issuerUniqueID" in this)
			result.issuerUniqueID = this.issuerUniqueID.toJSON();
		
		if("extensions" in this)
			result.extensions = this.extensions.toJSON();
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC5755
 */
export default class AttributeCertificateV1
{
	//**********************************************************************************
	/**
	 * Constructor for AttributeCertificateV1 class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AttributeCertificateInfo}
		 * @description acinfo
		 */
		this.acinfo = getParametersValue(parameters, "acinfo", AttributeCertificateV1.defaultValues("acinfo"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @description signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", AttributeCertificateV1.defaultValues("signatureAlgorithm"));
		/**
		 * @type {BitString}
		 * @description signatureValue
		 */
		this.signatureValue = getParametersValue(parameters, "signatureValue", AttributeCertificateV1.defaultValues("signatureValue"));
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
			case "acinfo":
				return new AttributeCertificateInfo();
			case "signatureAlgorithm":
				return new AlgorithmIdentifier();
			case "signatureValue":
				return new asn1js.BitString();
			default:
				throw new Error(`Invalid member name for AttributeCertificateV1 class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
        // AttributeCertificate ::= SEQUENCE {
        //   acinfo               AttributeCertificateInfo,
        //   signatureAlgorithm   AlgorithmIdentifier,
        //   signatureValue       BIT STRING
        // }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {Object} [acinfo]
		 * @property {Object} [signatureAlgorithm]
		 * @property {string} [signatureValue]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				AttributeCertificateInfo.schema(names.acinfo || {}),
				AlgorithmIdentifier.schema(names.signatureAlgorithm || {}),
				new asn1js.BitString({ name: (names.signatureValue || "") })
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			AttributeCertificateV1.schema({
				names: {
					acinfo: {
						names: {
							blockName: "acinfo"
						}
					},
					signatureAlgorithm: {
						names: {
							blockName: "signatureAlgorithm"
						}
					},
					signatureValue: "signatureValue"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for AttributeCertificateV1");
		//endregion
		
		//region Get internal properties from parsed schema
		this.acinfo = new AttributeCertificateInfo({ schema: asn1.result.acinfo });
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
		this.signatureValue = asn1.result.signatureValue;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		return (new asn1js.Sequence({
			value: [
				this.acinfo.toSchema(),
				this.signatureAlgorithm.toSchema(),
				this.signatureValue
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			acinfo: this.acinfo.toJSON(),
			signatureAlgorithm: this.signatureAlgorithm.toJSON(),
			signatureValue: this.signatureValue.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
