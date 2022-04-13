import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const DIGEST_ALGORITHM = "digestAlgorithm";
const DIGEST = "digest";
const CLEAR_PROPS = [
	DIGEST_ALGORITHM,
	DIGEST
];

export interface DigestInfoParameters extends Schema.SchemaConstructor {
	digestAlgorithm?: AlgorithmIdentifier;
	digest?: asn1js.OctetString;
}

export type DigestInfoSchema = Schema.SchemaParameters<{
	digestAlgorithm?: AlgorithmIdentifierSchema;
	digest?: string;
}>;

/**
 * Class from RFC3447
 */
export class DigestInfo implements Schema.SchemaCompatible {

	public digestAlgorithm: AlgorithmIdentifier;
	public digest: asn1js.OctetString;

	/**
	 * Constructor for DigestInfo class
	 * @param parameters
	 */
	constructor(parameters: DigestInfoParameters = {}) {
		//#region Internal properties of the object
		this.digestAlgorithm = pvutils.getParametersValue(parameters, DIGEST_ALGORITHM, DigestInfo.defaultValues(DIGEST_ALGORITHM));
		this.digest = pvutils.getParametersValue(parameters, DIGEST, DigestInfo.defaultValues(DIGEST));
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
	public static defaultValues(memberName: typeof DIGEST_ALGORITHM): AlgorithmIdentifier;
	public static defaultValues(memberName: typeof DIGEST): asn1js.OctetString;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case DIGEST_ALGORITHM:
				return new AlgorithmIdentifier();
			case DIGEST:
				return new asn1js.OctetString();
			default:
				throw new Error(`Invalid member name for DigestInfo class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault(memberName: string, memberValue: any): boolean {
		switch (memberName) {
			case DIGEST_ALGORITHM:
				return ((AlgorithmIdentifier.compareWithDefault("algorithmId", memberValue.algorithmId)) &&
					(("algorithmParams" in memberValue) === false));
			case DIGEST:
				return (memberValue.isEqual(DigestInfo.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for DigestInfo class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```
	 * DigestInfo ::= SEQUENCE {
	 *    digestAlgorithm DigestAlgorithmIdentifier,
	 *    digest Digest }
	 *
	 * Digest ::= OCTET STRING
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: DigestInfoSchema = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				AlgorithmIdentifier.schema(names.digestAlgorithm || {
					names: {
						blockName: DIGEST_ALGORITHM
					}
				}),
				new asn1js.OctetString({ name: (names.digest || DIGEST) })
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
			DigestInfo.schema({
				names: {
					digestAlgorithm: {
						names: {
							blockName: DIGEST_ALGORITHM
						}
					},
					digest: DIGEST
				}
			})
		);

		if (!asn1.verified)
			throw new Error("Object's schema was not verified against input data for DigestInfo");
		//#endregion

		//#region Get internal properties from parsed schema
		this.digestAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.digestAlgorithm });
		this.digest = asn1.result.digest;
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
				this.digestAlgorithm.toSchema(),
				this.digest
			]
		}));
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 * @returns
	 */
	public toJSON(): any {
		return {
			digestAlgorithm: this.digestAlgorithm.toJSON(),
			digest: this.digest.toJSON()
		};
	}

}
