import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const RESPONSE_TYPE = "responseType";
const RESPONSE = "response";
const CLEAR_PROPS = [
	RESPONSE_TYPE,
	RESPONSE
];

export interface ResponseBytesParameters extends Schema.SchemaConstructor {
	responseType?: string;
	response?: asn1js.OctetString;
}

export type ResponseBytesSchema = Schema.SchemaParameters<{
	responseType?: string;
	response?: string;
}>;

/**
 * Class from RFC6960
 */
export default class ResponseBytes implements Schema.SchemaCompatible {

	public responseType: string;
	public response: asn1js.OctetString;

	/**
	 * Constructor for ResponseBytes class
	 * @param parameters
	 */
	constructor(parameters: ResponseBytesParameters = {}) {
		//#region Internal properties of the object
		this.responseType = pvutils.getParametersValue(parameters, RESPONSE_TYPE, ResponseBytes.defaultValues(RESPONSE_TYPE));
		this.response = pvutils.getParametersValue(parameters, RESPONSE, ResponseBytes.defaultValues(RESPONSE));
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
	public static defaultValues(memberName: typeof RESPONSE_TYPE): string;
	public static defaultValues(memberName: typeof RESPONSE): asn1js.OctetString;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case RESPONSE_TYPE:
				return "";
			case RESPONSE:
				return new asn1js.OctetString();
			default:
				throw new Error(`Invalid member name for ResponseBytes class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault(memberName: string, memberValue: any): boolean {
		switch (memberName) {
			case RESPONSE_TYPE:
				return (memberValue === "");
			case RESPONSE:
				return (memberValue.isEqual(ResponseBytes.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for ResponseBytes class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * ResponseBytes ::=       SEQUENCE {
	 *    responseType   OBJECT IDENTIFIER,
	 *    response       OCTET STRING }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: ResponseBytesSchema = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.responseType || "") }),
				new asn1js.OctetString({ name: (names.response || "") })
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
			ResponseBytes.schema({
				names: {
					responseType: RESPONSE_TYPE,
					response: RESPONSE
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for ResponseBytes");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.responseType = asn1.result.responseType.valueBlock.toString();
		this.response = asn1.result.response;
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): Schema.SchemaType {
		//#region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				new asn1js.ObjectIdentifier({ value: this.responseType }),
				this.response
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
			responseType: this.responseType,
			response: this.response.toJSON()
		};
	}

}
