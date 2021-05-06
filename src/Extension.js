import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import SubjectDirectoryAttributes from "./SubjectDirectoryAttributes.js";
import PrivateKeyUsagePeriod from "./PrivateKeyUsagePeriod.js";
import AltName from "./AltName.js";
import BasicConstraints from "./BasicConstraints.js";
import IssuingDistributionPoint from "./IssuingDistributionPoint.js";
import GeneralNames from "./GeneralNames.js";
import NameConstraints from "./NameConstraints.js";
import CRLDistributionPoints from "./CRLDistributionPoints.js";
import CertificatePolicies from "./CertificatePolicies.js";
import PolicyMappings from "./PolicyMappings.js";
import AuthorityKeyIdentifier from "./AuthorityKeyIdentifier.js";
import PolicyConstraints from "./PolicyConstraints.js";
import ExtKeyUsage from "./ExtKeyUsage.js";
import InfoAccess from "./InfoAccess.js";
import SignedCertificateTimestampList from "./SignedCertificateTimestampList.js";
import CertificateTemplate from "./CertificateTemplate.js";
import CAVersion from "./CAVersion.js";
import QCStatements from "./QCStatements.js";
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
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc extnID
		 */
		this.extnID = getParametersValue(parameters, "extnID", Extension.defaultValues("extnID"));
		/**
		 * @type {boolean}
		 * @desc critical
		 */
		this.critical = getParametersValue(parameters, "critical", Extension.defaultValues("critical"));
		/**
		 * @type {OctetString}
		 * @desc extnValue
		 */
		if("extnValue" in parameters)
			this.extnValue = new asn1js.OctetString({ valueHex: parameters.extnValue });
		else
			this.extnValue = Extension.defaultValues("extnValue");

		if("parsedValue" in parameters)
			/**
			 * @type {Object}
			 * @desc parsedValue
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
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Extension  ::=  SEQUENCE  {
	 *    extnID      OBJECT IDENTIFIER,
	 *    critical    BOOLEAN DEFAULT FALSE,
	 *    extnValue   OCTET STRING
	 * }
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
		//region Clear input data first
		clearProps(schema, [
			"extnID",
			"critical",
			"extnValue"
		]);
		//endregion
		
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
			throw new Error("Object's schema was not verified against input data for Extension");
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
				try
				{
					this.parsedValue = new SubjectDirectoryAttributes({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new SubjectDirectoryAttributes();
					this.parsedValue.parsingError = "Incorrectly formated SubjectDirectoryAttributes";
				}
				break;
			case "2.5.29.14": // SubjectKeyIdentifier
				this.parsedValue = asn1.result; // Should be just a simple OCTETSTRING
				break;
			case "2.5.29.15": // KeyUsage
				this.parsedValue = asn1.result; // Should be just a simple BITSTRING
				break;
			case "2.5.29.16": // PrivateKeyUsagePeriod
				try
				{
					this.parsedValue = new PrivateKeyUsagePeriod({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new PrivateKeyUsagePeriod();
					this.parsedValue.parsingError = "Incorrectly formated PrivateKeyUsagePeriod";
				}
				break;
			case "2.5.29.17": // SubjectAltName
			case "2.5.29.18": // IssuerAltName
				try
				{
					this.parsedValue = new AltName({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new AltName();
					this.parsedValue.parsingError = "Incorrectly formated AltName";
				}
				break;
			case "2.5.29.19": // BasicConstraints
				try
				{
					this.parsedValue = new BasicConstraints({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new BasicConstraints();
					this.parsedValue.parsingError = "Incorrectly formated BasicConstraints";
				}
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
				try
				{
					this.parsedValue = new IssuingDistributionPoint({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new IssuingDistributionPoint();
					this.parsedValue.parsingError = "Incorrectly formated IssuingDistributionPoint";
				}
				break;
			case "2.5.29.29": // CertificateIssuer
				try
				{
					this.parsedValue = new GeneralNames({ schema: asn1.result }); // Should be just a simple
				}
				catch(ex)
				{
					this.parsedValue = new GeneralNames();
					this.parsedValue.parsingError = "Incorrectly formated GeneralNames";
				}
				break;
			case "2.5.29.30": // NameConstraints
				try
				{
					this.parsedValue = new NameConstraints({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new NameConstraints();
					this.parsedValue.parsingError = "Incorrectly formated NameConstraints";
				}
				break;
			case "2.5.29.31": // CRLDistributionPoints
			case "2.5.29.46": // FreshestCRL
				try
				{
					this.parsedValue = new CRLDistributionPoints({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new CRLDistributionPoints();
					this.parsedValue.parsingError = "Incorrectly formated CRLDistributionPoints";
				}
				break;
			case "2.5.29.32": // CertificatePolicies
			case "1.3.6.1.4.1.311.21.10": // szOID_APPLICATION_CERT_POLICIES - Microsoft-specific OID
				try
				{
					this.parsedValue = new CertificatePolicies({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new CertificatePolicies();
					this.parsedValue.parsingError = "Incorrectly formated CertificatePolicies";
				}
				break;
			case "2.5.29.33": // PolicyMappings
				try
				{
					this.parsedValue = new PolicyMappings({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new PolicyMappings();
					this.parsedValue.parsingError = "Incorrectly formated CertificatePolicies";
				}
				break;
			case "2.5.29.35": // AuthorityKeyIdentifier
				try
				{
					this.parsedValue = new AuthorityKeyIdentifier({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new AuthorityKeyIdentifier();
					this.parsedValue.parsingError = "Incorrectly formated AuthorityKeyIdentifier";
				}
				break;
			case "2.5.29.36": // PolicyConstraints
				try
				{
					this.parsedValue = new PolicyConstraints({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new PolicyConstraints();
					this.parsedValue.parsingError = "Incorrectly formated PolicyConstraints";
				}
				break;
			case "2.5.29.37": // ExtKeyUsage
				try
				{
					this.parsedValue = new ExtKeyUsage({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new ExtKeyUsage();
					this.parsedValue.parsingError = "Incorrectly formated ExtKeyUsage";
				}
				break;
			case "2.5.29.54": // InhibitAnyPolicy
				this.parsedValue = asn1.result; // Should be just a simple INTEGER
				break;
			case "1.3.6.1.5.5.7.1.1": // AuthorityInfoAccess
			case "1.3.6.1.5.5.7.1.11": // SubjectInfoAccess
				try
				{
					this.parsedValue = new InfoAccess({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new InfoAccess();
					this.parsedValue.parsingError = "Incorrectly formated InfoAccess";
				}
				break;
			case "1.3.6.1.4.1.11129.2.4.2": // SignedCertificateTimestampList
				try
				{
					this.parsedValue = new SignedCertificateTimestampList({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new SignedCertificateTimestampList();
					this.parsedValue.parsingError = "Incorrectly formated SignedCertificateTimestampList";
				}
				break;
			case "1.3.6.1.4.1.311.20.2": // szOID_ENROLL_CERTTYPE_EXTENSION - Microsoft-specific extension
				this.parsedValue = asn1.result; // Used to be simple Unicode string
				break;
			case "1.3.6.1.4.1.311.21.2": // szOID_CERTSRV_PREVIOUS_CERT_HASH - Microsoft-specific extension
				this.parsedValue = asn1.result; // Used to be simple OctetString
				break;
			case "1.3.6.1.4.1.311.21.7": // szOID_CERTIFICATE_TEMPLATE - Microsoft-specific extension
				try
				{
					this.parsedValue = new CertificateTemplate({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new CertificateTemplate();
					this.parsedValue.parsingError = "Incorrectly formated CertificateTemplate";
				}
				break;
			case "1.3.6.1.4.1.311.21.1": // szOID_CERTSRV_CA_VERSION - Microsoft-specific extension
				try
				{
					this.parsedValue = new CAVersion({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new CAVersion();
					this.parsedValue.parsingError = "Incorrectly formated CAVersion";
				}
				break;
			case "1.3.6.1.5.5.7.1.3": // QCStatements
				try
				{
					this.parsedValue = new QCStatements({ schema: asn1.result });
				}
				catch(ex)
				{
					this.parsedValue = new QCStatements();
					this.parsedValue.parsingError = "Incorrectly formated QCStatements";
				}
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
		{
			if("toJSON" in this.parsedValue)
				object.parsedValue = this.parsedValue.toJSON();
		}

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
