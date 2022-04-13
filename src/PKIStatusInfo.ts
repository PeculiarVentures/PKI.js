import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const STATUS = "status";
const STATUS_STRINGS = "statusStrings";
const FAIL_INFO = "failInfo";
const CLEAR_PROPS = [
	STATUS,
	STATUS_STRINGS,
	FAIL_INFO
];

export interface PKIStatusInfoParameters extends Schema.SchemaConstructor {
	status?: number;
	statusStrings?: asn1js.Utf8String[];
	failInfo?: asn1js.BitString;
}

export type PKIStatusInfoSchema = Schema.SchemaParameters<{
	status?: string;
	statusStrings?: string;
	failInfo?: string;
}>;

/**
 * Class from RFC3161
 */
export class PKIStatusInfo implements Schema.SchemaCompatible {

	public status: number;
	public statusStrings?: asn1js.Utf8String[];
	public failInfo?: asn1js.BitString;

	/**
	 * Constructor for PKIStatusInfo class
	 * @param parameters
	 */
	constructor(parameters: PKIStatusInfoParameters = {}) {
		//#region Internal properties of the object
		this.status = pvutils.getParametersValue(parameters, STATUS, PKIStatusInfo.defaultValues(STATUS));
		if (parameters.statusStrings) {
			this.statusStrings = pvutils.getParametersValue(parameters, STATUS_STRINGS, PKIStatusInfo.defaultValues(STATUS_STRINGS));
		}
		if (parameters.failInfo) {
			this.failInfo = pvutils.getParametersValue(parameters, FAIL_INFO, PKIStatusInfo.defaultValues(FAIL_INFO));
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
	public static defaultValues(memberName: typeof STATUS): number;
	public static defaultValues(memberName: typeof STATUS_STRINGS): asn1js.Utf8String[];
	public static defaultValues(memberName: typeof FAIL_INFO): asn1js.BitString;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case STATUS:
				return 2;
			case STATUS_STRINGS:
				return [];
			case FAIL_INFO:
				return new asn1js.BitString();
			default:
				throw new Error(`Invalid member name for PKIStatusInfo class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault(memberName: string, memberValue: any): boolean {
		switch (memberName) {
			case STATUS:
				return (memberValue === PKIStatusInfo.defaultValues(memberName));
			case STATUS_STRINGS:
				return (memberValue.length === 0);
			case FAIL_INFO:
				return (memberValue.isEqual(PKIStatusInfo.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for PKIStatusInfo class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```
	 * PKIStatusInfo ::= SEQUENCE {
	 *    status        PKIStatus,
	 *    statusString  PKIFreeText     OPTIONAL,
	 *    failInfo      PKIFailureInfo  OPTIONAL  }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: PKIStatusInfoSchema = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.status || "") }),
				new asn1js.Sequence({
					optional: true,
					value: [
						new asn1js.Repeated({
							name: (names.statusStrings || ""),
							value: new asn1js.Utf8String()
						})
					]
				}),
				new asn1js.BitString({
					name: (names.failInfo || ""),
					optional: true
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
			PKIStatusInfo.schema({
				names: {
					status: STATUS,
					statusStrings: STATUS_STRINGS,
					failInfo: FAIL_INFO
				}
			})
		);

		if (!asn1.verified)
			throw new Error("Object's schema was not verified against input data for PKIStatusInfo");
		//#endregion

		//#region Get internal properties from parsed schema
		const _status = asn1.result.status;

		if ((_status.valueBlock.isHexOnly === true) ||
			(_status.valueBlock.valueDec < 0) ||
			(_status.valueBlock.valueDec > 5))
			throw new Error("PKIStatusInfo \"status\" has invalid value");

		this.status = _status.valueBlock.valueDec;

		if (STATUS_STRINGS in asn1.result)
			this.statusStrings = asn1.result.statusStrings;
		if (FAIL_INFO in asn1.result)
			this.failInfo = asn1.result.failInfo;
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.Sequence {
		//#region Create array of output sequence
		const outputArray = [];

		outputArray.push(new asn1js.Integer({ value: this.status }));

		if (this.statusStrings) {
			outputArray.push(new asn1js.Sequence({
				optional: true,
				value: this.statusStrings
			}));
		}

		if (this.failInfo) {
			outputArray.push(this.failInfo);
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
		const _object: any = {
			status: this.status
		};

		if (this.statusStrings) {
			_object.statusStrings = Array.from(this.statusStrings, element => element.toJSON());
		}
		if (this.failInfo) {
			_object.failInfo = this.failInfo.toJSON();
		}

		return _object;
	}

}
