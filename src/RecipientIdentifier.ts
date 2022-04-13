import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { IssuerAndSerialNumber } from "./IssuerAndSerialNumber";
import * as Schema from "./Schema";

const VARIANT = "variant";
const VALUE = "value";
const CLEAR_PROPS = [
	"blockName"
];

export interface RecipientIdentifierParameters extends Schema.SchemaConstructor {
	variant?: number;
	value?: any;
}

export type RecipientIdentifierSchema = Schema.SchemaParameters;

/**
 * Class from RFC5652
 */
export class RecipientIdentifier implements Schema.SchemaCompatible {

	public variant: number;
	public value: any;

	/**
	 * Constructor for RecipientIdentifier class
	 * @param parameters
	 */
	constructor(parameters: RecipientIdentifierParameters = {}) {
		//#region Internal properties of the object
		this.variant = pvutils.getParametersValue(parameters, VARIANT, RecipientIdentifier.defaultValues(VARIANT));
		if (parameters.value) {
			this.value = pvutils.getParametersValue(parameters, VALUE, RecipientIdentifier.defaultValues(VALUE));
		}
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
	public static defaultValues(memberName: typeof VARIANT): number;
	public static defaultValues(memberName: typeof VALUE): any;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case VARIANT:
				return (-1);
			case VALUE:
				return {};
			default:
				throw new Error(`Invalid member name for RecipientIdentifier class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault(memberName: string, memberValue: any): boolean {
		switch (memberName) {
			case VARIANT:
				return (memberValue === (-1));
			case "values":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for RecipientIdentifier class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```
	 * RecipientIdentifier ::= CHOICE {
	 *    issuerAndSerialNumber IssuerAndSerialNumber,
	 *    subjectKeyIdentifier [0] SubjectKeyIdentifier }
	 *
	 * SubjectKeyIdentifier ::= OCTET STRING
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: RecipientIdentifierSchema = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Choice({
			value: [
				IssuerAndSerialNumber.schema({
					names: {
						blockName: (names.blockName || "")
					}
				}),
				new asn1js.Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					}
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
			RecipientIdentifier.schema({
				names: {
					blockName: "blockName"
				}
			})
		);

		if (!asn1.verified)
			throw new Error("Object's schema was not verified against input data for RecipientIdentifier");
		//#endregion

		//#region Get internal properties from parsed schema
		if (asn1.result.blockName.idBlock.tagClass === 1) {
			this.variant = 1;
			this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
		}
		else {
			this.variant = 2;
			this.value = new asn1js.OctetString({ valueHex: asn1.result.blockName.valueBlock.valueHex });
		}
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.BaseBlock<any> {
		//#region Construct and return new ASN.1 schema for this object
		switch (this.variant) {
			case 1:
				return this.value.toSchema();
			case 2:
				return new asn1js.Primitive({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					valueHex: this.value.valueBlock.valueHex
				});
			default:
				return new asn1js.Any() as any;
		}
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 * @returns
	 */
	public toJSON(): any {
		const _object: any = {
			variant: this.variant
		};

		if ((this.variant === 1) || (this.variant === 2)) {
			_object.value = this.value.toJSON();
		}

		return _object;
	}

}

