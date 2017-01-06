import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import SubjectDirectoryAttributes from "./SubjectDirectoryAttributes";
import PrivateKeyUsagePeriod from "./PrivateKeyUsagePeriod";
import AltName from "./AltName";
import BasicConstraints from "./BasicConstraints";
import IssuingDistributionPoint from "./IssuingDistributionPoint";
import GeneralNames from "./GeneralNames";
import NameConstraints from "./NameConstraints";
import CRLDistributionPoints from "./CRLDistributionPoints";
import CertificatePolicies from "./CertificatePolicies";
import PolicyMappings from "./PolicyMappings";
import AuthorityKeyIdentifier from "./AuthorityKeyIdentifier";
import PolicyConstraints from "./PolicyConstraints";
import ExtKeyUsage from "./ExtKeyUsage";
import InfoAccess from "./InfoAccess";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class Extension
{
	//**********************************************************************************
	/**
	 * Constructor for Extension class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description extnID
		 */
		this.extnID = getParametersValue(parameters, "extnID", Extension.defaultValues("extnID"));
		/**
		 * @type {boolean}
		 * @description critical
		 */
		this.critical = getParametersValue(parameters, "critical", Extension.defaultValues("critical"));
		/**
		 * @type {OctetString}
		 * @description extnValue
		 */
		if("extnValue" in parameters)
			this.extnValue = new asn1js.OctetString({ valueHex: parameters.extnValue });
		else
			this.extnValue = Extension.defaultValues("extnValue");

		if("parsedValue" in parameters)
			/**
			 * @type {Object}
			 * @description parsedValue
			 */
			this.parsedValue = getParametersValue(parameters, "parsedValue", Extension.defaultValues("parsedValue"));
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
			case "extnID":
				return "";
			case "critical":
				return false;
			case "extnValue":
				return new asn1js.OctetString();
			case "parsedValue":
				return {};
			default:
				throw new Error(`Invalid member name for Extension class: ${memberName}`);
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
		//Extension  ::=  SEQUENCE  {
		//    extnID      OBJECT IDENTIFIER,
		//    critical    BOOLEAN DEFAULT FALSE,
		//    extnValue   OCTET STRING
		//}

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [extnID]
		 * @property {string} [critical]
		 * @property {string} [extnValue]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.extnID || "") }),
				new asn1js.Boolean({
					name: (names.critical || ""),
					optional: true
				}),
				new asn1js.OctetString({ name: (names.extnValue || "") })
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
		let asn1 = asn1js.compareSchema(schema,
			schema,
			Extension.schema({
				names: {
					extnID: "extnID",
					critical: "critical",
					extnValue: "extnValue"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for EXTENSION");
		//endregion

		//region Get internal properties from parsed schema
		this.extnID = asn1.result.extnID.valueBlock.toString();
		if("critical" in asn1.result)
			this.critical = asn1.result.critical.valueBlock.value;
		this.extnValue = asn1.result.extnValue;

		//region Get "parsedValue" for well-known extensions
		asn1 = asn1js.fromBER(this.extnValue.valueBlock.valueHex);
		if(asn1.offset === (-1))
			return;

		switch(this.extnID)
		{
			case "2.5.29.9": // SubjectDirectoryAttributes
				this.parsedValue = new SubjectDirectoryAttributes({ schema: asn1.result });
				break;
			case "2.5.29.14": // SubjectKeyIdentifier
				this.parsedValue = asn1.result; // Should be just a simple OCTETSTRING
				break;
			case "2.5.29.15": // KeyUsage
				this.parsedValue = asn1.result; // Should be just a simple BITSTRING
				break;
			case "2.5.29.16": // PrivateKeyUsagePeriod
				this.parsedValue = new PrivateKeyUsagePeriod({ schema: asn1.result });
				break;
			case "2.5.29.17": // SubjectAltName
			case "2.5.29.18": // IssuerAltName
				this.parsedValue = new AltName({ schema: asn1.result });
				break;
			case "2.5.29.19": // BasicConstraints
				this.parsedValue = new BasicConstraints({ schema: asn1.result });
				break;
			case "2.5.29.20": // CRLNumber
			case "2.5.29.27": // BaseCRLNumber (delta CRL indicator)
				this.parsedValue = asn1.result; // Should be just a simple INTEGER
				break;
			case "2.5.29.21": // CRLReason
				this.parsedValue = asn1.result; // Should be just a simple ENUMERATED
				break;
			case "2.5.29.24": // InvalidityDate
				this.parsedValue = asn1.result; // Should be just a simple GeneralizedTime
				break;
			case "2.5.29.28": // IssuingDistributionPoint
				this.parsedValue = new IssuingDistributionPoint({ schema: asn1.result });
				break;
			case "2.5.29.29": // CertificateIssuer
				this.parsedValue = new GeneralNames({ schema: asn1.result }); // Should be just a simple
				break;
			case "2.5.29.30": // NameConstraints
				this.parsedValue = new NameConstraints({ schema: asn1.result });
				break;
			case "2.5.29.31": // CRLDistributionPoints
			case "2.5.29.46": // FreshestCRL
				this.parsedValue = new CRLDistributionPoints({ schema: asn1.result });
				break;
			case "2.5.29.32": // CertificatePolicies
				this.parsedValue = new CertificatePolicies({ schema: asn1.result });
				break;
			case "2.5.29.33": // PolicyMappings
				this.parsedValue = new PolicyMappings({ schema: asn1.result });
				break;
			case "2.5.29.35": // AuthorityKeyIdentifier
				this.parsedValue = new AuthorityKeyIdentifier({ schema: asn1.result });
				break;
			case "2.5.29.36": // PolicyConstraints
				this.parsedValue = new PolicyConstraints({ schema: asn1.result });
				break;
			case "2.5.29.37": // ExtKeyUsage
				this.parsedValue = new ExtKeyUsage({ schema: asn1.result });
				break;
			case "2.5.29.54": // InhibitAnyPolicy
				this.parsedValue = asn1.result; // Should be just a simple INTEGER
				break;
			case "1.3.6.1.5.5.7.1.1": // AuthorityInfoAccess
			case "1.3.6.1.5.5.7.1.11": // SubjectInfoAccess
				this.parsedValue = new InfoAccess({ schema: asn1.result });
				break;
			default:
		}
		//endregion
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

		outputArray.push(new asn1js.ObjectIdentifier({ value: this.extnID }));

		if(this.critical !== Extension.defaultValues("critical"))
			outputArray.push(new asn1js.Boolean({ value: this.critical }));

		outputArray.push(this.extnValue);
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
		const object = {
			extnID: this.extnID,
			extnValue: this.extnValue.toJSON()
		};

		if(this.critical !== Extension.defaultValues("critical"))
			object.critical = this.critical;

		if("parsedValue" in this)
			object.parsedValue = this.parsedValue.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
