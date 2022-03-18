import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames";
import * as Schema from "./Schema";

export const TYPE = "type";
export const VALUE = "value";

//#region Additional asn1js schema elements existing inside GeneralName schema

/**
 * Schema for "builtInStandardAttributes" of "ORAddress"
 * @param {Object} parameters
 * @property {Object} [names]
 * @param {boolean} optional
 * @returns {Sequence}
 */
function builtInStandardAttributes(parameters: Schema.SchemaParameters<{
	country_name?: string;
	administration_domain_name?: string;
	network_address?: string;
	terminal_identifier?: string;
	private_domain_name?: string;
	organization_name?: string;
	numeric_user_identifier?: string;
	personal_name?: string;
	organizational_unit_names?: string;
}> = {}, optional = false) {
	//builtInStandardAttributes ::= Sequence {
	//    country-name                  CountryName OPTIONAL,
	//    administration-domain-name    AdministrationDomainName OPTIONAL,
	//    network-address           [0] IMPLICIT NetworkAddress OPTIONAL,
	//    terminal-identifier       [1] IMPLICIT TerminalIdentifier OPTIONAL,
	//    private-domain-name       [2] PrivateDomainName OPTIONAL,
	//    organization-name         [3] IMPLICIT OrganizationName OPTIONAL,
	//    numeric-user-identifier   [4] IMPLICIT NumericUserIdentifier OPTIONAL,
	//    personal-name             [5] IMPLICIT PersonalName OPTIONAL,
	//    organizational-unit-names [6] IMPLICIT OrganizationalUnitNames OPTIONAL }
	const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

	return (new asn1js.Sequence({
		optional,
		value: [
			new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 2, // APPLICATION-SPECIFIC
					tagNumber: 1 // [1]
				},
				name: (names.country_name || ""),
				value: [
					new asn1js.Choice({
						value: [
							new asn1js.NumericString(),
							new asn1js.PrintableString()
						]
					})
				]
			}),
			new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 2, // APPLICATION-SPECIFIC
					tagNumber: 2 // [2]
				},
				name: (names.administration_domain_name || ""),
				value: [
					new asn1js.Choice({
						value: [
							new asn1js.NumericString(),
							new asn1js.PrintableString()
						]
					})
				]
			}),
			new asn1js.Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				name: (names.network_address || ""),
				isHexOnly: true
			}),
			new asn1js.Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				name: (names.terminal_identifier || ""),
				isHexOnly: true
			}),
			new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				name: (names.private_domain_name || ""),
				value: [
					new asn1js.Choice({
						value: [
							new asn1js.NumericString(),
							new asn1js.PrintableString()
						]
					})
				]
			}),
			new asn1js.Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				name: (names.organization_name || ""),
				isHexOnly: true
			}),
			new asn1js.Primitive({
				optional: true,
				name: (names.numeric_user_identifier || ""),
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 4 // [4]
				},
				isHexOnly: true
			}),
			new asn1js.Constructed({
				optional: true,
				name: (names.personal_name || ""),
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 5 // [5]
				},
				value: [
					new asn1js.Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						isHexOnly: true
					}),
					new asn1js.Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						isHexOnly: true
					}),
					new asn1js.Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						isHexOnly: true
					}),
					new asn1js.Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						isHexOnly: true
					})
				]
			}),
			new asn1js.Constructed({
				optional: true,
				name: (names.organizational_unit_names || ""),
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 6 // [6]
				},
				value: [
					new asn1js.Repeated({
						value: new asn1js.PrintableString()
					})
				]
			})
		]
	}));
}

/**
 * Schema for "builtInDomainDefinedAttributes" of "ORAddress"
 * @param optional
 */
function builtInDomainDefinedAttributes(optional = false): Schema.SchemaType {
	return (new asn1js.Sequence({
		optional,
		value: [
			new asn1js.PrintableString(),
			new asn1js.PrintableString()
		]
	}));
}

/**
 * Schema for "builtInDomainDefinedAttributes" of "ORAddress"
 * @param optional
 */
function extensionAttributes(optional = false): Schema.SchemaType {
	return (new asn1js.Set({
		optional,
		value: [
			new asn1js.Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				isHexOnly: true
			}),
			new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [new asn1js.Any()]
			})
		]
	}));
}

//#endregion

export interface GeneralNameParameters extends Schema.SchemaConstructor {
	/**
	 * value type - from a tagged value (0 for "otherName", 1 for "rfc822Name" etc.)
	 */
	type?: number;
	/**
	 * asn1js object having GeneralName value (type depends on TYPE value)
	 */
	value?: any;
}

export interface GeneralNameSchema {
	names?: {
		blockName?: string;
		directoryName?: object;
		builtInStandardAttributes?: object;
		otherName?: string;
		rfc822Name?: string;
		dNSName?: string;
		x400Address?: string;
		ediPartyName?: string;
		uniformResourceIdentifier?: string;
		iPAddress?: string;
		registeredID?: string;
	};
}

/**
 * Class from RFC5280
 */
export default class GeneralName {

	public type: number;
	public value: any;

	/**
	 * Constructor for GeneralName class
	 * @param {Object} parameters
	 */
	constructor(parameters: GeneralNameParameters = {}) {
		//#region Internal properties of the object
		this.type = pvutils.getParametersValue(parameters, TYPE, GeneralName.defaultValues(TYPE));
		this.value = pvutils.getParametersValue(parameters, VALUE, GeneralName.defaultValues(VALUE));
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
	public static defaultValues(memberName: typeof TYPE): number;
	public static defaultValues(memberName: typeof VALUE): any;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case TYPE:
				return 9;
			case VALUE:
				return {};
			default:
				throw new Error(`Invalid member name for GeneralName class: ${memberName}`);
		}
	}

	/**
	 * Compare values with default values for all class members
	 * @param memberName String name for a class member
	 * @param memberValue Value to compare with default value
	 */
	public static compareWithDefault(memberName: string, memberValue: any): boolean {
		switch (memberName) {
			case TYPE:
				return (memberValue === GeneralName.defaultValues(memberName));
			case VALUE:
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for GeneralName class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * GeneralName ::= Choice {
	 *    otherName                       [0]     OtherName,
	 *    rfc822Name                      [1]     IA5String,
	 *    dNSName                         [2]     IA5String,
	 *    x400Address                     [3]     ORAddress,
	 *    directoryName                   [4]     value,
	 *    ediPartyName                    [5]     EDIPartyName,
	 *    uniformResourceIdentifier       [6]     IA5String,
	 *    iPAddress                       [7]     OCTET STRING,
	 *    registeredID                    [8]     OBJECT IDENTIFIER }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	static schema(parameters: GeneralNameSchema = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Choice({
			value: [
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					name: (names.blockName || ""),
					value: [
						new asn1js.ObjectIdentifier(),
						new asn1js.Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [new asn1js.Any()]
						})
					]
				}),
				new asn1js.Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					}
				}),
				new asn1js.Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					}
				}),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					},
					name: (names.blockName || ""),
					value: [
						builtInStandardAttributes((names.builtInStandardAttributes || {}), false),
						builtInDomainDefinedAttributes(true),
						extensionAttributes(true)
					]
				}),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 4 // [4]
					},
					name: (names.blockName || ""),
					value: [RelativeDistinguishedNames.schema(names.directoryName || {})]
				}),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 5 // [5]
					},
					name: (names.blockName || ""),
					value: [
						new asn1js.Constructed({
							optional: true,
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [
								new asn1js.Choice({
									value: [
										new asn1js.TeletexString(),
										new asn1js.PrintableString(),
										new asn1js.UniversalString(),
										new asn1js.Utf8String(),
										new asn1js.BmpString()
									]
								})
							]
						}),
						new asn1js.Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [
								new asn1js.Choice({
									value: [
										new asn1js.TeletexString(),
										new asn1js.PrintableString(),
										new asn1js.UniversalString(),
										new asn1js.Utf8String(),
										new asn1js.BmpString()
									]
								})
							]
						})
					]
				}),
				new asn1js.Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 6 // [6]
					}
				}),
				new asn1js.Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 7 // [7]
					}
				}),
				new asn1js.Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 8 // [8]
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
		pvutils.clearProps(schema, [
			"blockName",
			"otherName",
			"rfc822Name",
			"dNSName",
			"x400Address",
			"directoryName",
			"ediPartyName",
			"uniformResourceIdentifier",
			"iPAddress",
			"registeredID"
		]);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			GeneralName.schema({
				names: {
					blockName: "blockName",
					otherName: "otherName",
					rfc822Name: "rfc822Name",
					dNSName: "dNSName",
					x400Address: "x400Address",
					directoryName: {
						names: {
							blockName: "directoryName"
						}
					},
					ediPartyName: "ediPartyName",
					uniformResourceIdentifier: "uniformResourceIdentifier",
					iPAddress: "iPAddress",
					registeredID: "registeredID"
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for GeneralName");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.type = asn1.result.blockName.idBlock.tagNumber;

		switch (this.type) {
			case 0: // otherName
				this.value = asn1.result.blockName;
				break;
			case 1: // rfc822Name + dNSName + uniformResourceIdentifier
			case 2:
			case 6:
				{
					const value = asn1.result.blockName;

					value.idBlock.tagClass = 1; // UNIVERSAL
					value.idBlock.tagNumber = 22; // IA5STRING

					const valueBER = value.toBER(false);

					this.value = asn1js.fromBER(valueBER).result.valueBlock.value;
				}
				break;
			case 3: // x400Address
				this.value = asn1.result.blockName;
				break;
			case 4: // directoryName
				this.value = new RelativeDistinguishedNames({ schema: asn1.result.directoryName });
				break;
			case 5: // ediPartyName
				this.value = asn1.result.ediPartyName;
				break;
			case 7: // iPAddress
				this.value = new asn1js.OctetString({ valueHex: asn1.result.blockName.valueBlock.valueHex });
				break;
			case 8: // registeredID
				{
					const value = asn1.result.blockName;

					value.idBlock.tagClass = 1; // UNIVERSAL
					value.idBlock.tagNumber = 6; // ObjectIdentifier

					const valueBER = value.toBER(false);

					this.value = asn1js.fromBER(valueBER).result.valueBlock.toString(); // Getting a string representation of the ObjectIdentifier
				}
				break;
			default:
		}
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): Schema.SchemaType {
		//#region Construct and return new ASN.1 schema for this object
		switch (this.type) {
			case 0:
			case 3:
			case 5:
				return new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: this.type
					},
					value: [
						this.value
					]
				});
			case 1:
			case 2:
			case 6:
				{
					const value = new asn1js.IA5String({ value: this.value });

					value.idBlock.tagClass = 3;
					value.idBlock.tagNumber = this.type;

					return value;
				}
			case 4:
				return new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 4
					},
					value: [this.value.toSchema()]
				});
			case 7:
				{
					const value = this.value;

					value.idBlock.tagClass = 3;
					value.idBlock.tagNumber = this.type;

					return value;
				}
			case 8:
				{
					const value = new asn1js.ObjectIdentifier({ value: this.value });

					value.idBlock.tagClass = 3;
					value.idBlock.tagNumber = this.type;

					return value;
				}
			default:
				return GeneralName.schema();
		}
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 */
	public toJSON(): any {
		const _object = {
			type: this.type,
			value: ""
		};

		if ((typeof this.value) === "string")
			_object.value = this.value;
		else {
			try {
				_object.value = this.value.toJSON();
			}
			catch (ex) {
				// nothing
			}
		}

		return _object;
	}

}
