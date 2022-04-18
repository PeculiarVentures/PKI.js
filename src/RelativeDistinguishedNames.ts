import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AttributeTypeAndValue } from "./AttributeTypeAndValue";
import { AsnError } from "./errors";
import * as Schema from "./Schema";

export interface RelativeDistinguishedNamesParameters extends Schema.SchemaConstructor {
	/**
	 * Array of "type and value" objects
	 */
	typesAndValues?: AttributeTypeAndValue[];
	/**
	 * Value of the RDN before decoding from schema
	 */
	valueBeforeDecode?: ArrayBuffer;
}

export type RelativeDistinguishedNamesSchema = Schema.SchemaParameters<{
	repeatedSequence?: string;
	repeatedSet?: string;
	typeAndValue?: Schema.SchemaType;
}>;

/**
 * Class from RFC5280
 */
export class RelativeDistinguishedNames {

	/**
	 * Array of "type and value" objects
	 */
	public typesAndValues: AttributeTypeAndValue[];
	/**
	 * Value of the RDN before decoding from schema
	 */
	public valueBeforeDecode: ArrayBuffer;

	/**
	 * Constructor for RelativeDistinguishedNames class
	 * @param parameters
	 */
	constructor(parameters: RelativeDistinguishedNamesParameters = {}) {
		//#region Internal properties of the object
		this.typesAndValues = pvutils.getParametersValue(parameters, "typesAndValues", RelativeDistinguishedNames.defaultValues("typesAndValues"));
		this.valueBeforeDecode = pvutils.getParametersValue(parameters, "valueBeforeDecode", RelativeDistinguishedNames.defaultValues("valueBeforeDecode"));
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
	public static defaultValues(memberName: "typesAndValues"): AttributeTypeAndValue[];
	public static defaultValues(memberName: "valueBeforeDecode"): ArrayBuffer;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case "typesAndValues":
				return [];
			case "valueBeforeDecode":
				return new ArrayBuffer(0);
			default:
				throw new Error(`Invalid member name for RelativeDistinguishedNames class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault(memberName: string, memberValue: any): boolean {
		switch (memberName) {
			case "typesAndValues":
				return (memberValue.length === 0);
			case "valueBeforeDecode":
				return (memberValue.byteLength === 0);
			default:
				throw new Error(`Invalid member name for RelativeDistinguishedNames class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```
	 * RDNSequence ::= Sequence OF RelativeDistinguishedName
	 *
	 * RelativeDistinguishedName ::=
	 * SET SIZE (1..MAX) OF AttributeTypeAndValue
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	static schema(parameters: RelativeDistinguishedNamesSchema = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Repeated({
					name: (names.repeatedSequence || ""),
					value: new asn1js.Set({
						value: [
							new asn1js.Repeated({
								name: (names.repeatedSet || ""),
								value: AttributeTypeAndValue.schema(names.typeAndValue || {})
							})
						]
					} as any)
				} as any)
			]
		} as any));
	}

	/**
	 * Convert parsed asn1js object into current class
	 * @param schema
	 */
	public fromSchema(schema: Schema.SchemaType): void {
		//#region Clear input data first
		pvutils.clearProps(schema, [
			"RDN",
			"typesAndValues"
		]);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			RelativeDistinguishedNames.schema({
				names: {
					blockName: "RDN",
					repeatedSet: "typesAndValues"
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for RelativeDistinguishedNames");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		if ("typesAndValues" in asn1.result) {// Could be a case when there is no "types and values"
			this.typesAndValues = Array.from(asn1.result.typesAndValues, element => new AttributeTypeAndValue({ schema: element }));
		}

		this.valueBeforeDecode = asn1.result.RDN.valueBeforeDecode;
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.Sequence {
		//#region Decode stored TBS value
		if (this.valueBeforeDecode.byteLength === 0) // No stored encoded array, create "from scratch"
		{
			return (new asn1js.Sequence({
				value: [new asn1js.Set({
					value: Array.from(this.typesAndValues, element => element.toSchema())
				} as any)]
			} as any));
		}

		const asn1 = asn1js.fromBER(this.valueBeforeDecode);
		AsnError.assert(asn1, "RelativeDistinguishedNames");
		//#endregion

		//#region Construct and return new ASN.1 schema for this object
		return asn1.result;
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 */
	public toJSON(): any {
		return {
			typesAndValues: Array.from(this.typesAndValues, element => element.toJSON())
		};
	}

	/**
	 * Compare two RDN values, or RDN with ArrayBuffer value
	 * @param compareTo The value compare to current
	 */
	isEqual(compareTo: unknown): boolean {
		if (compareTo instanceof RelativeDistinguishedNames) {
			if (this.typesAndValues.length !== compareTo.typesAndValues.length)
				return false;

			for (const [index, typeAndValue] of this.typesAndValues.entries()) {
				if (typeAndValue.isEqual(compareTo.typesAndValues[index]) === false)
					return false;
			}

			return true;
		}

		if (compareTo instanceof ArrayBuffer) {
			return pvutils.isEqualBuffer(this.valueBeforeDecode, compareTo);
		}

		return false;
	}

}
