import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { CertificateRevocationList } from "./CertificateRevocationList";
import { OtherRevocationInfoFormat } from "./OtherRevocationInfoFormat";
import * as Schema from "./Schema";

const CRLS = "crls";
const OTHER_REVOCATION_INFOS = "otherRevocationInfos";
const CLEAR_PROPS = [
	CRLS
];

export interface RevocationInfoChoicesParameters extends Schema.SchemaConstructor {
	crls?: CertificateRevocationList[];
	otherRevocationInfos?: OtherRevocationInfoFormat[];
}

export type RevocationInfoChoicesSchema = Schema.SchemaParameters<{
	crls?: string;
}>;

/**
 * Class from RFC5652
 */
export class RevocationInfoChoices implements Schema.SchemaCompatible {

	public crls: CertificateRevocationList[];
	public otherRevocationInfos: OtherRevocationInfoFormat[];

	/**
	 * Constructor for RevocationInfoChoices class
	 * @param parameters
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters: RevocationInfoChoicesParameters = {}) {
		//#region Internal properties of the object
		this.crls = pvutils.getParametersValue(parameters, CRLS, RevocationInfoChoices.defaultValues(CRLS));
		this.otherRevocationInfos = pvutils.getParametersValue(parameters, OTHER_REVOCATION_INFOS, RevocationInfoChoices.defaultValues(OTHER_REVOCATION_INFOS));
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
	public static defaultValues(memberName: typeof CRLS): CertificateRevocationList[];
	public static defaultValues(memberName: typeof OTHER_REVOCATION_INFOS): OtherRevocationInfoFormat[];
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case CRLS:
				return [];
			case OTHER_REVOCATION_INFOS:
				return [];
			default:
				throw new Error(`Invalid member name for RevocationInfoChoices class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RevocationInfoChoices ::= SET OF RevocationInfoChoice
	 *
	 * RevocationInfoChoice ::= CHOICE {
	 *    crl CertificateList,
	 *    other [1] IMPLICIT OtherRevocationInfoFormat }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: RevocationInfoChoicesSchema = {}): Schema.SchemaType {
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [crls]
		 */
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Set({
			name: (names.blockName || ""),
			value: [
				new asn1js.Repeated({
					name: (names.crls || ""),
					value: new asn1js.Choice({
						value: [
							CertificateRevocationList.schema(),
							new asn1js.Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: [
									new asn1js.ObjectIdentifier(),
									new asn1js.Any()
								]
							})
						]
					})
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
		pvutils.clearProps(schema, CLEAR_PROPS);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			RevocationInfoChoices.schema({
				names: {
					crls: CRLS
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for RevocationInfoChoices");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		for (const element of asn1.result.crls) {
			if (element.idBlock.tagClass === 1)
				this.crls.push(new CertificateRevocationList({ schema: element }));
			else
				this.otherRevocationInfos.push(new OtherRevocationInfoFormat({ schema: element }));
		}

		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.Sequence {
		//#region Create array for output set
		const outputArray = [];

		outputArray.push(...Array.from(this.crls, element => element.toSchema()));

		outputArray.push(...Array.from(this.otherRevocationInfos, element => {
			const schema = element.toSchema();

			schema.idBlock.tagClass = 3;
			schema.idBlock.tagNumber = 1;

			return schema;
		}));
		//#endregion

		//#region Construct and return new ASN.1 schema for this object
		return (new asn1js.Set({
			value: outputArray
		}));
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 * @returns
	 */
	public toJSON(): any {
		return {
			crls: Array.from(this.crls, element => element.toJSON()),
			otherRevocationInfos: Array.from(this.otherRevocationInfos, element => element.toJSON())
		};
	}

}
