import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

export interface PolicyQualifierInfoParameters extends Schema.SchemaConstructor {
	policyQualifierId?: string;
	qualifier?: Schema.SchemaType;
}

/**
 * Class from RFC5280
 */
export class PolicyQualifierInfo {

	public policyQualifierId: string;
	public qualifier: Schema.SchemaType;

	/**
	 * Constructor for PolicyQualifierInfo class
	 * @param parameters
	 */
	constructor(parameters: PolicyQualifierInfoParameters = {}) {
		//#region Internal properties of the object
		/**
		 * @type {string}
		 * @desc policyQualifierId
		 */
		this.policyQualifierId = pvutils.getParametersValue(parameters, "policyQualifierId", PolicyQualifierInfo.defaultValues("policyQualifierId"));
		/**
		 * @type {Object}
		 * @desc qualifier
		 */
		this.qualifier = pvutils.getParametersValue(parameters, "qualifier", PolicyQualifierInfo.defaultValues("qualifier"));
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
	public static defaultValues(memberName: "policyQualifierId"): "string";
	public static defaultValues(memberName: "qualifier"): asn1js.Any;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case "policyQualifierId":
				return "";
			case "qualifier":
				return new asn1js.Any();
			default:
				throw new Error(`Invalid member name for PolicyQualifierInfo class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyQualifierInfo ::= SEQUENCE {
	 *    policyQualifierId  PolicyQualifierId,
	 *    qualifier          ANY DEFINED BY policyQualifierId }
	 *
	 * id-qt          OBJECT IDENTIFIER ::=  { id-pkix 2 }
	 * id-qt-cps      OBJECT IDENTIFIER ::=  { id-qt 1 }
	 * id-qt-unotice  OBJECT IDENTIFIER ::=  { id-qt 2 }
	 *
	 * PolicyQualifierId ::= OBJECT IDENTIFIER ( id-qt-cps | id-qt-unotice )
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	static schema(parameters: Schema.SchemaParameters<{ policyQualifierId?: string; qualifier?: string; }> = {}) {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.policyQualifierId || "") }),
				new asn1js.Any({ name: (names.qualifier || "") })
			]
		}));
	}

	/**
	 * Convert parsed asn1js object into current class
	 * @param schema
	 */
	public fromSchema(schema: Schema.SchemaType): void {
		//#region Clear input data first
		pvutils.clearProps(schema, [
			"policyQualifierId",
			"qualifier"
		]);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			PolicyQualifierInfo.schema({
				names: {
					policyQualifierId: "policyQualifierId",
					qualifier: "qualifier"
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for PolicyQualifierInfo");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.policyQualifierId = asn1.result.policyQualifierId.valueBlock.toString();
		this.qualifier = asn1.result.qualifier;
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
				new asn1js.ObjectIdentifier({ value: this.policyQualifierId }),
				this.qualifier
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
			policyQualifierId: this.policyQualifierId,
			qualifier: this.qualifier.toJSON()
		};
	}

}
