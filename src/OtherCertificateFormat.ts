import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const OTHER_CERT_FORMAT = "otherCertFormat";
const OTHER_CERT = "otherCert";
const CLEAR_PROPS = [
	OTHER_CERT_FORMAT,
	OTHER_CERT
];

export interface OtherCertificateFormatParameters extends Schema.SchemaType {
	otherCertFormat?: string;
	otherCert?: any;
}

/**
 * Class from RFC5652
 */
export class OtherCertificateFormat {

	public otherCertFormat: string;
	public otherCert: any;

	/**
	 * Constructor for OtherCertificateFormat class
	 * @param parameters
	 */
	constructor(parameters: OtherCertificateFormatParameters = {}) {
		//#region Internal properties of the object
		this.otherCertFormat = pvutils.getParametersValue(parameters, OTHER_CERT_FORMAT, OtherCertificateFormat.defaultValues(OTHER_CERT_FORMAT));
		this.otherCert = pvutils.getParametersValue(parameters, OTHER_CERT, OtherCertificateFormat.defaultValues(OTHER_CERT));
		//#endregion

		//#region If input argument array contains "schema" for this object
		if (parameters.schema) {
			this.fromSchema(parameters.schema);
		}
		//#endregion
	}

	/**
	 * Return default values for all class members
	 * @param memberName String name for a class member
	 */
	public static defaultValues(memberName: typeof OTHER_CERT_FORMAT): string;
	public static defaultValues(memberName: typeof OTHER_CERT): asn1js.Any;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case OTHER_CERT_FORMAT:
				return "";
			case OTHER_CERT:
				return new asn1js.Any();
			default:
				throw new Error(`Invalid member name for OtherCertificateFormat class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherCertificateFormat ::= SEQUENCE {
	 *    otherCertFormat OBJECT IDENTIFIER,
	 *    otherCert ANY DEFINED BY otherCertFormat }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: Schema.SchemaParameters<{
		otherCertFormat?: string;
		otherCert?: string;
	}> = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.otherCertFormat || OTHER_CERT_FORMAT) }),
				new asn1js.Any({ name: (names.otherCert || OTHER_CERT) })
			]
		}));
	}

	/**
	 * Convert parsed asn1js object into current class
	 * @param schema
	 */
	public fromSchema(schema: any): void {
		//#region Clear input data first
		pvutils.clearProps(schema, CLEAR_PROPS);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			OtherCertificateFormat.schema()
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for OtherCertificateFormat");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.otherCertFormat = asn1.result.otherCertFormat.valueBlock.toString();
		this.otherCert = asn1.result.otherCert;
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.Sequence {
		//#region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				new asn1js.ObjectIdentifier({ value: this.otherCertFormat }),
				this.otherCert
			]
		}));
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 * @returns
	 */
	public toJSON(): any {
		const object: any = {
			otherCertFormat: this.otherCertFormat
		};

		if (!(this.otherCert instanceof asn1js.Any)) {
			object.otherCert = this.otherCert.toJSON();
		}

		return object;
	}

}
