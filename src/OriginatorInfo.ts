import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import CertificateSet from "./CertificateSet";
import RevocationInfoChoices from "./RevocationInfoChoices";
import * as Schema from "./Schema";

const CERTS = "certs";
const CRLS = "crls";
const CLEAR_PROPS = [
	CERTS,
	CRLS,
];

export interface OriginatorInfoParameters extends Schema.SchemaConstructor {
	certs?: CertificateSet;
	crls?: RevocationInfoChoices;
}
/**
 * Class from RFC5652
 */
export default class OriginatorInfo {

	public certs?: CertificateSet;
	public crls?: RevocationInfoChoices;

	/**
	 * Constructor for OriginatorInfo class
	 * @param parameters
	 */
	constructor(parameters: OriginatorInfoParameters = {}) {
		//#region Internal properties of the object
		if (parameters.certs) {
			this.certs = getParametersValue(parameters, CERTS, OriginatorInfo.defaultValues(CERTS));
		}
		if (parameters.crls) {
			this.crls = getParametersValue(parameters, CRLS, OriginatorInfo.defaultValues(CRLS));
		}
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
	public static defaultValues(memberName: typeof CERTS): CertificateSet;
	public static defaultValues(memberName: typeof CRLS): RevocationInfoChoices;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case CERTS:
				return new CertificateSet();
			case CRLS:
				return new RevocationInfoChoices();
			default:
				throw new Error(`Invalid member name for OriginatorInfo class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault(memberName: string, memberValue: any): boolean {
		switch (memberName) {
			case CERTS:
				return (memberValue.certificates.length === 0);
			case CRLS:
				return ((memberValue.crls.length === 0) && (memberValue.otherRevocationInfos.length === 0));
			default:
				throw new Error(`Invalid member name for OriginatorInfo class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OriginatorInfo ::= SEQUENCE {
	 *    certs [0] IMPLICIT CertificateSet OPTIONAL,
	 *    crls [1] IMPLICIT RevocationInfoChoices OPTIONAL }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: Schema.SchemaParameters<{
		certs?: string;
		crls?: string;
	}> = {}): Schema.SchemaType {
		const names = getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Constructed({
					name: (names.certs || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: CertificateSet.schema().valueBlock.value
				}),
				new asn1js.Constructed({
					name: (names.crls || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: RevocationInfoChoices.schema().valueBlock.value
				})
			]
		}));
	}

	/**
	 * Convert parsed asn1js object into current class
	 * @param schema
	 */
	public fromSchema(schema: Schema.SchemaType): void {
		//#region Clear input data first
		clearProps(schema, CLEAR_PROPS);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			OriginatorInfo.schema({
				names: {
					certs: CERTS,
					crls: CRLS
				}
			})
		);

		if (!asn1.verified)
			throw new Error("Object's schema was not verified against input data for OriginatorInfo");
		//#endregion

		//#region Get internal properties from parsed schema
		if (CERTS in asn1.result) {
			this.certs = new CertificateSet({
				schema: new asn1js.Set({
					value: asn1.result.certs.valueBlock.value
				})
			});
		}

		if (CRLS in asn1.result) {
			this.crls = new RevocationInfoChoices({
				schema: new asn1js.Set({
					value: asn1.result.crls.valueBlock.value
				})
			});
		}
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): Schema.SchemaType {
		const sequenceValue = [];

		if (this.certs) {
			sequenceValue.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: this.certs.toSchema().valueBlock.value
			}));
		}

		if (this.crls) {
			sequenceValue.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: this.crls.toSchema().valueBlock.value
			}));
		}

		//#region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: sequenceValue
		}));
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 * @returns
	 */
	public toJSON(): any {
		const object: any = {};

		if (this.certs) {
			object.certs = this.certs.toJSON();
		}

		if (this.crls) {
			object.crls = this.crls.toJSON();
		}

		return object;
	}

}
