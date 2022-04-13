import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { PolicyQualifierInfo } from "./PolicyQualifierInfo";
import * as Schema from "./Schema";

export interface PolicyInformationParameters extends Schema.SchemaConstructor {
	policyIdentifier?: string;
	policyQualifiers?: PolicyQualifierInfo[];
}

/**
 * Class from RFC5280
 */
export class PolicyInformation {

	public policyIdentifier: string;
	public policyQualifiers?: PolicyQualifierInfo[];

	/**
	 * Constructor for PolicyInformation class
	 * @param parameters
	 */
	constructor(parameters: PolicyInformationParameters = {}) {
		//#region Internal properties of the object
		this.policyIdentifier = pvutils.getParametersValue(parameters, "policyIdentifier", PolicyInformation.defaultValues("policyIdentifier"));

		if ("policyQualifiers" in parameters)
			/**
			 * @type {Array.<PolicyQualifierInfo>}
			 * @desc Value of the TIME class
			 */
			this.policyQualifiers = pvutils.getParametersValue(parameters, "policyQualifiers", PolicyInformation.defaultValues("policyQualifiers"));
		//#endregion

		//#region If input argument array contains "schema" for this object
		if (parameters.schema)
			this.fromSchema(parameters.schema);
		//#endregion
	}

	/**
	 * Return default values for all class members
	 * @param memberName String name for a class member
	 */
	public static defaultValues(memberName: "policyIdentifier"): string;
	public static defaultValues(memberName: "policyQualifiers"): PolicyQualifierInfo[];
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case "policyIdentifier":
				return "";
			case "policyQualifiers":
				return [];
			default:
				throw new Error(`Invalid member name for PolicyInformation class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyInformation ::= SEQUENCE {
	 *    policyIdentifier   CertPolicyId,
	 *    policyQualifiers   SEQUENCE SIZE (1..MAX) OF
	 *    PolicyQualifierInfo OPTIONAL }
	 *
	 * CertPolicyId ::= OBJECT IDENTIFIER
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: Schema.SchemaParameters<{ policyIdentifier?: string; policyQualifiers?: string; }> = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.policyIdentifier || "") }),
				new asn1js.Sequence({
					optional: true,
					value: [
						new asn1js.Repeated({
							name: (names.policyQualifiers || ""),
							value: PolicyQualifierInfo.schema()
						})
					]
				})
			]
		}));
	}

	/**
	 * Convert parsed asn1js object into current class
	 * @param schema
	 */
	fromSchema(schema: Schema.SchemaType): void {
		//#region Clear input data first
		pvutils.clearProps(schema, [
			"policyIdentifier",
			"policyQualifiers"
		]);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			PolicyInformation.schema({
				names: {
					policyIdentifier: "policyIdentifier",
					policyQualifiers: "policyQualifiers"
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for PolicyInformation");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.policyIdentifier = asn1.result.policyIdentifier.valueBlock.toString();

		if ("policyQualifiers" in asn1.result) {
			this.policyQualifiers = Array.from(asn1.result.policyQualifiers, element => new PolicyQualifierInfo({ schema: element }));
		}
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.Sequence {
		//#region Create array for output sequence
		const outputArray = [];

		outputArray.push(new asn1js.ObjectIdentifier({ value: this.policyIdentifier }));

		if (this.policyQualifiers) {
			outputArray.push(new asn1js.Sequence({
				value: Array.from(this.policyQualifiers, element => element.toSchema())
			}));
		}
		//#endregion

		//#region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: outputArray
		}));
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 * @returns
	 */
	public toJSON(): any {
		const object: any = {
			policyIdentifier: this.policyIdentifier
		};

		if (this.policyQualifiers)
			object.policyQualifiers = Array.from(this.policyQualifiers, element => element.toJSON());

		return object;
	}

}
