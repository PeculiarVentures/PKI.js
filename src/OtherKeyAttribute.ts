import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const KEY_ATTR_ID = "keyAttrId";
const KEY_ATTR = "keyAttr";
const CLEAR_PROPS = [
	KEY_ATTR_ID,
	KEY_ATTR,
];

export interface OtherKeyAttributeParameters extends Schema.SchemaConstructor {
	keyAttrId?: string;
	keyAttr?: any;
}

export type OtherKeyAttributeSchema = Schema.SchemaType;

/**
 * Class from RFC5652
 */
export class OtherKeyAttribute implements Schema.SchemaCompatible {

	public keyAttrId: string;
	public keyAttr?: any;

	/**
	 * Constructor for OtherKeyAttribute class
	 * @param parameters
	 */
	constructor(parameters: OtherKeyAttributeParameters = {}) {
		//#region Internal properties of the object
		this.keyAttrId = pvutils.getParametersValue(parameters, KEY_ATTR_ID, OtherKeyAttribute.defaultValues(KEY_ATTR_ID));

		if (parameters.keyAttr) {
			this.keyAttr = pvutils.getParametersValue(parameters, KEY_ATTR, OtherKeyAttribute.defaultValues(KEY_ATTR));
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
	public static defaultValues(memberName: typeof KEY_ATTR_ID): string;
	public static defaultValues(memberName: typeof KEY_ATTR): any;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case KEY_ATTR_ID:
				return "";
			case KEY_ATTR:
				return {};
			default:
				throw new Error(`Invalid member name for OtherKeyAttribute class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault<T>(memberName: string, memberValue: T): memberValue is T {
		switch (memberName) {
			case KEY_ATTR_ID:
				return (typeof memberValue === "string" && memberValue === "");
			case KEY_ATTR:
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for OtherKeyAttribute class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherKeyAttribute ::= SEQUENCE {
	 *    keyAttrId OBJECT IDENTIFIER,
	 *    keyAttr ANY DEFINED BY keyAttrId OPTIONAL }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: OtherKeyAttributeSchema = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			optional: (names.optional || true),
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.keyAttrId || "") }),
				new asn1js.Any({
					optional: true,
					name: (names.keyAttr || "")
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
			OtherKeyAttribute.schema({
				names: {
					keyAttrId: KEY_ATTR_ID,
					keyAttr: KEY_ATTR
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for OtherKeyAttribute");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.keyAttrId = asn1.result.keyAttrId.valueBlock.toString();

		if (KEY_ATTR in asn1.result) {
			this.keyAttr = asn1.result.keyAttr;
		}
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): any {
		//#region Create array for output sequence
		const outputArray = [];

		outputArray.push(new asn1js.ObjectIdentifier({ value: this.keyAttrId }));

		if (KEY_ATTR in this) {
			outputArray.push(this.keyAttr);
		}
		//#endregion

		//#region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: outputArray,
		}));
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 */
	toJSON(): any {
		const _object: any = {
			keyAttrId: this.keyAttrId
		};

		if (KEY_ATTR in this) {
			_object.keyAttr = this.keyAttr.toJSON();
		}

		return _object;
	}

}

