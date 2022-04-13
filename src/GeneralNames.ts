import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";
import { GeneralName } from "./GeneralName";

export interface GeneralNamesParameters extends Schema.SchemaConstructor {
	names?: GeneralName[];
}
export type GeneralNamesSchema = Schema.SchemaParameters<{
	generalNames?: string;
}>;

/**
 * Class from RFC5280
 */
export class GeneralNames implements Schema.SchemaCompatible {

	/**
	 * Array of "general names"
	 */
	public names: GeneralName[];
	/**
	 * Constructor for GeneralNames class
	 * @param parameters
	 */
	constructor(parameters: GeneralNamesParameters = {}) {
		//#region Internal properties of the object
		this.names = pvutils.getParametersValue(parameters, "names", GeneralNames.defaultValues("names"));
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
	public static defaultValues(memberName: "names"): GeneralName[];
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case "names":
				return [];
			default:
				throw new Error(`Invalid member name for GeneralNames class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * GeneralNames ::= SEQUENCE SIZE (1..MAX) OF GeneralName
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @param optional Flag would be element optional or not
	 * @returns asn1js schema object
	 */
	public static schema(parameters: GeneralNamesSchema = {}, optional = false): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			optional,
			name: (names.blockName || ""),
			value: [
				new asn1js.Repeated({
					name: (names.generalNames || ""),
					value: GeneralName.schema()
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
			"names",
			"generalNames"
		]);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			GeneralNames.schema({
				names: {
					blockName: "names",
					generalNames: "generalNames"
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for GeneralNames");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.names = Array.from(asn1.result.generalNames, element => new GeneralName({ schema: element }));
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.Sequence {
		//#region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: Array.from(this.names, element => element.toSchema())
		}));
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 * @returns
	 */
	public toJSON(): any {
		return {
			names: Array.from(this.names, element => element.toJSON())
		};
	}

}

