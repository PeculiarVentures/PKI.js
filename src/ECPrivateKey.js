import * as asn1js from "asn1js";
import { getParametersValue, toBase64, arrayBufferToString, stringToArrayBuffer, fromBase64, clearProps } from "pvutils";
import ECPublicKey from "./ECPublicKey.js";
//**************************************************************************************
/**
 * Class from RFC5915
 */
export default class ECPrivateKey
{
	//**********************************************************************************
	/**
	 * Constructor for ECPrivateKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", ECPrivateKey.defaultValues("version"));
		/**
		 * @type {OctetString}
		 * @desc privateKey
		 */
		this.privateKey = getParametersValue(parameters, "privateKey", ECPrivateKey.defaultValues("privateKey"));

		if("namedCurve" in parameters)
			/**
			 * @type {string}
			 * @desc namedCurve
			 */
			this.namedCurve = getParametersValue(parameters, "namedCurve", ECPrivateKey.defaultValues("namedCurve"));

		if("publicKey" in parameters)
			/**
			 * @type {ECPublicKey}
			 * @desc publicKey
			 */
			this.publicKey = getParametersValue(parameters, "publicKey", ECPrivateKey.defaultValues("publicKey"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "version":
				return 1;
			case "privateKey":
				return new asn1js.OctetString();
			case "namedCurve":
				return "";
			case "publicKey":
				return new ECPublicKey();
			default:
				throw new Error(`Invalid member name for ECCPrivateKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "version":
				return (memberValue === ECPrivateKey.defaultValues(memberName));
			case "privateKey":
				return (memberValue.isEqual(ECPrivateKey.defaultValues(memberName)));
			case "namedCurve":
				return (memberValue === "");
			case "publicKey":
				return ((ECPublicKey.compareWithDefault("namedCurve", memberValue.namedCurve)) &&
						(ECPublicKey.compareWithDefault("x", memberValue.x)) &&
						(ECPublicKey.compareWithDefault("y", memberValue.y)));
			default:
				throw new Error(`Invalid member name for ECCPrivateKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * ECPrivateKey ::= SEQUENCE {
	 * version        INTEGER { ecPrivkeyVer1(1) } (ecPrivkeyVer1),
	 * privateKey     OCTET STRING,
	 * parameters [0] ECParameters {{ NamedCurve }} OPTIONAL,
	 * publicKey  [1] BIT STRING OPTIONAL
	 * }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [privateKey]
		 * @property {string} [namedCurve]
		 * @property {string} [publicKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.version || "") }),
				new asn1js.OctetString({ name: (names.privateKey || "") }),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new asn1js.ObjectIdentifier({ name: (names.namedCurve || "") })
					]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new asn1js.BitString({ name: (names.publicKey || "") })
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"version",
			"privateKey",
			"namedCurve",
			"publicKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			ECPrivateKey.schema({
				names: {
					version: "version",
					privateKey: "privateKey",
					namedCurve: "namedCurve",
					publicKey: "publicKey"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ECPrivateKey");
		//endregion

		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.privateKey = asn1.result.privateKey;

		if("namedCurve" in asn1.result)
			this.namedCurve = asn1.result.namedCurve.valueBlock.toString();

		if("publicKey" in asn1.result)
		{
			const publicKeyData = { schema: asn1.result.publicKey.valueBlock.valueHex };
			if("namedCurve" in this)
				publicKeyData.namedCurve = this.namedCurve;

			this.publicKey = new ECPublicKey(publicKeyData);
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const outputArray = [
			new asn1js.Integer({ value: this.version }),
			this.privateKey
		];

		if("namedCurve" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new asn1js.ObjectIdentifier({ value: this.namedCurve })
				]
			}));
		}

		if("publicKey" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [
					new asn1js.BitString({ valueHex: this.publicKey.toSchema().toBER(false) })
				]
			}));
		}

		return new asn1js.Sequence({
			value: outputArray
		});
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		if((("namedCurve" in this) === false) || (ECPrivateKey.compareWithDefault("namedCurve", this.namedCurve)))
			throw new Error("Not enough information for making JSON: absent \"namedCurve\" value");

		let crvName = "";

		switch(this.namedCurve)
		{
			case "1.2.840.10045.3.1.7": // P-256
				crvName = "P-256";
				break;
			case "1.3.132.0.34": // P-384
				crvName = "P-384";
				break;
			case "1.3.132.0.35": // P-521
				crvName = "P-521";
				break;
			default:
		}

		const privateKeyJSON = {
			crv: crvName,
			d: toBase64(arrayBufferToString(this.privateKey.valueBlock.valueHex), true, true, false)
		};

		if("publicKey" in this)
		{
			const publicKeyJSON = this.publicKey.toJSON();

			privateKeyJSON.x = publicKeyJSON.x;
			privateKeyJSON.y = publicKeyJSON.y;
		}

		return privateKeyJSON;
	}
	//**********************************************************************************
	/**
	 * Convert JSON value into current object
	 * @param {Object} json
	 */
	fromJSON(json)
	{
		let coodinateLength = 0;

		if("crv" in json)
		{
			switch(json.crv.toUpperCase())
			{
				case "P-256":
					this.namedCurve = "1.2.840.10045.3.1.7";
					coodinateLength = 32;
					break;
				case "P-384":
					this.namedCurve = "1.3.132.0.34";
					coodinateLength = 48;
					break;
				case "P-521":
					this.namedCurve = "1.3.132.0.35";
					coodinateLength = 66;
					break;
				default:
			}
		}
		else
			throw new Error("Absent mandatory parameter \"crv\"");

		if("d" in json)
		{
			const convertBuffer = stringToArrayBuffer(fromBase64(json.d, true));
			
			if(convertBuffer.byteLength < coodinateLength)
			{
				const buffer = new ArrayBuffer(coodinateLength);
				const view = new Uint8Array(buffer);
				const convertBufferView = new Uint8Array(convertBuffer);
				view.set(convertBufferView, 1);
				
				this.privateKey = new asn1js.OctetString({ valueHex: buffer });
			}
			else
				this.privateKey = new asn1js.OctetString({ valueHex: convertBuffer.slice(0, coodinateLength) });
		}
		else
			throw new Error("Absent mandatory parameter \"d\"");

		if(("x" in json) && ("y" in json))
			this.publicKey = new ECPublicKey({ json });
	}
	//**********************************************************************************
}
//**************************************************************************************
