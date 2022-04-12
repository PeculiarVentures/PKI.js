import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const VERSION = "version";
const KEY_DERIVATION_ALGORITHM = "keyDerivationAlgorithm";
const KEY_ENCRYPTION_ALGORITHM = "keyEncryptionAlgorithm";
const ENCRYPTED_KEY = "encryptedKey";
const PASSWORD = "password";
const CLEAR_PROPS = [
	VERSION,
	KEY_DERIVATION_ALGORITHM,
	KEY_ENCRYPTION_ALGORITHM,
	ENCRYPTED_KEY
];

export interface PasswordRecipientinfoParameters extends Schema.SchemaConstructor {
	version?: number;
	keyDerivationAlgorithm?: AlgorithmIdentifier;
	keyEncryptionAlgorithm?: AlgorithmIdentifier;
	encryptedKey?: asn1js.OctetString;
	password?: ArrayBuffer;
}

/**
 * Class from RFC5652
 */
// TODO rename to PasswordRecipientInfo
export default class PasswordRecipientinfo implements Schema.SchemaCompatible {

	public version: number;
	public keyDerivationAlgorithm?: AlgorithmIdentifier;
	public keyEncryptionAlgorithm: AlgorithmIdentifier;
	public encryptedKey: asn1js.OctetString;
	public password: ArrayBuffer;

	/**
	 * Constructor for PasswordRecipientinfo class
	 * @param parameters
	 */
	constructor(parameters: PasswordRecipientinfoParameters = {}) {
		//#region Internal properties of the object
		this.version = pvutils.getParametersValue(parameters, VERSION, PasswordRecipientinfo.defaultValues(VERSION));
		if (parameters.keyDerivationAlgorithm) {
			this.keyDerivationAlgorithm = pvutils.getParametersValue(parameters, KEY_DERIVATION_ALGORITHM, PasswordRecipientinfo.defaultValues(KEY_DERIVATION_ALGORITHM));
		}
		this.keyEncryptionAlgorithm = pvutils.getParametersValue(parameters, KEY_ENCRYPTION_ALGORITHM, PasswordRecipientinfo.defaultValues(KEY_ENCRYPTION_ALGORITHM));
		this.encryptedKey = pvutils.getParametersValue(parameters, ENCRYPTED_KEY, PasswordRecipientinfo.defaultValues(ENCRYPTED_KEY));
		this.password = pvutils.getParametersValue(parameters, PASSWORD, PasswordRecipientinfo.defaultValues(PASSWORD));
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
	public static defaultValues(memberName: typeof VERSION): number;
	public static defaultValues(memberName: typeof KEY_DERIVATION_ALGORITHM): AlgorithmIdentifier;
	public static defaultValues(memberName: typeof KEY_ENCRYPTION_ALGORITHM): AlgorithmIdentifier;
	public static defaultValues(memberName: typeof ENCRYPTED_KEY): asn1js.OctetString;
	public static defaultValues(memberName: typeof PASSWORD): ArrayBuffer;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case VERSION:
				return (-1);
			case KEY_DERIVATION_ALGORITHM:
				return new AlgorithmIdentifier();
			case KEY_ENCRYPTION_ALGORITHM:
				return new AlgorithmIdentifier();
			case ENCRYPTED_KEY:
				return new asn1js.OctetString();
			case PASSWORD:
				return new ArrayBuffer(0);
			default:
				throw new Error(`Invalid member name for PasswordRecipientinfo class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault(memberName: string, memberValue: any): boolean {
		switch (memberName) {
			case VERSION:
				return (memberValue === (-1));
			case KEY_DERIVATION_ALGORITHM:
			case KEY_ENCRYPTION_ALGORITHM:
				return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
			case ENCRYPTED_KEY:
				return (memberValue.isEqual(PasswordRecipientinfo.defaultValues(ENCRYPTED_KEY)));
			case PASSWORD:
				return (memberValue.byteLength === 0);
			default:
				throw new Error(`Invalid member name for PasswordRecipientinfo class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PasswordRecipientInfo ::= SEQUENCE {
	 *    version CMSVersion,   -- Always set to 0
	 *    keyDerivationAlgorithm [0] KeyDerivationAlgorithmIdentifier OPTIONAL,
	 *    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
	 *    encryptedKey EncryptedKey }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: Schema.SchemaParameters<{
		version?: string;
		keyDerivationAlgorithm?: string;
		keyEncryptionAlgorithm?: AlgorithmIdentifierSchema;
		encryptedKey?: string;
	}> = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.version || "") }),
				new asn1js.Constructed({
					name: (names.keyDerivationAlgorithm || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: AlgorithmIdentifier.schema().valueBlock.value
				}),
				AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}),
				new asn1js.OctetString({ name: (names.encryptedKey || "") })
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
			PasswordRecipientinfo.schema({
				names: {
					version: VERSION,
					keyDerivationAlgorithm: KEY_DERIVATION_ALGORITHM,
					keyEncryptionAlgorithm: {
						names: {
							blockName: KEY_ENCRYPTION_ALGORITHM
						}
					},
					encryptedKey: ENCRYPTED_KEY
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for PasswordRecipientinfo");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;

		if (KEY_DERIVATION_ALGORITHM in asn1.result) {
			this.keyDerivationAlgorithm = new AlgorithmIdentifier({
				schema: new asn1js.Sequence({
					value: asn1.result.keyDerivationAlgorithm.valueBlock.value
				})
			});
		}

		this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
		this.encryptedKey = asn1.result.encryptedKey;
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.Sequence {
		//#region Create output array for sequence
		const outputArray = [];

		outputArray.push(new asn1js.Integer({ value: this.version }));

		if (this.keyDerivationAlgorithm) {
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: this.keyDerivationAlgorithm.toSchema().valueBlock.value
			}));
		}

		outputArray.push(this.keyEncryptionAlgorithm.toSchema());
		outputArray.push(this.encryptedKey);
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
		const json: any = {
			version: this.version,
			keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
			encryptedKey: this.encryptedKey.toJSON()
		};

		if (this.keyDerivationAlgorithm) {
			json.keyDerivationAlgorithm = this.keyDerivationAlgorithm.toJSON();
		}

		return json;
	}

}
