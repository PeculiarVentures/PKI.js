import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class EncapsulatedContentInfo
{
	//**********************************************************************************
	/**
	 * Constructor for EncapsulatedContentInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc eContentType
		 */
		this.eContentType = getParametersValue(parameters, "eContentType", EncapsulatedContentInfo.defaultValues("eContentType"));

		if("eContent" in parameters)
		{
			/**
			 * @type {OctetString}
			 * @desc eContent
			 */
			this.eContent = getParametersValue(parameters, "eContent", EncapsulatedContentInfo.defaultValues("eContent"));
			if((this.eContent.idBlock.tagClass === 1) &&
				(this.eContent.idBlock.tagNumber === 4))
			{
				//region Divide OCTETSTRING value down to small pieces
				if(this.eContent.idBlock.isConstructed === false)
				{
					const constrString = new asn1js.OctetString({
						idBlock: { isConstructed: true },
						isConstructed: true
					});
					
					let offset = 0;
					let length = this.eContent.valueBlock.valueHex.byteLength;
					
					while(length > 0)
					{
						const pieceView = new Uint8Array(this.eContent.valueBlock.valueHex, offset, ((offset + 65536) > this.eContent.valueBlock.valueHex.byteLength) ? (this.eContent.valueBlock.valueHex.byteLength - offset) : 65536);
						const _array = new ArrayBuffer(pieceView.length);
						const _view = new Uint8Array(_array);
						
						for(let i = 0; i < _view.length; i++)
							_view[i] = pieceView[i];
						
						constrString.valueBlock.value.push(new asn1js.OctetString({ valueHex: _array }));
						
						length -= pieceView.length;
						offset += pieceView.length;
					}
					
					this.eContent = constrString;
				}
				//endregion
			}
		}
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
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
			case "eContentType":
				return "";
			case "eContent":
				return new asn1js.OctetString();
			default:
				throw new Error(`Invalid member name for EncapsulatedContentInfo class: ${memberName}`);
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
			case "eContentType":
				return (memberValue === "");
			case "eContent":
				{
					if((memberValue.idBlock.tagClass === 1) && (memberValue.idBlock.tagNumber === 4))
						return (memberValue.isEqual(EncapsulatedContentInfo.defaultValues("eContent")));
					
					return false;
				}
			default:
				throw new Error(`Invalid member name for EncapsulatedContentInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * EncapsulatedContentInfo ::= SEQUENCE {
	 *    eContentType ContentType,
	 *    eContent [0] EXPLICIT OCTET STRING OPTIONAL } * Changed it to ANY, as in PKCS#7
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
		 * @property {string} [type]
		 * @property {string} [setName]
		 * @property {string} [values]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.eContentType || "") }),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new asn1js.Any({ name: (names.eContent || "") }) // In order to aling this with PKCS#7 and CMS as well
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
			"eContentType",
			"eContent"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			EncapsulatedContentInfo.schema({
				names: {
					eContentType: "eContentType",
					eContent: "eContent"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for EncapsulatedContentInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.eContentType = asn1.result.eContentType.valueBlock.toString();
		if("eContent" in asn1.result)
			this.eContent = asn1.result.eContent;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence 
		const outputArray = [];
		
		outputArray.push(new asn1js.ObjectIdentifier({ value: this.eContentType }));
		if("eContent" in this)
		{
			if(EncapsulatedContentInfo.compareWithDefault("eContent", this.eContent) === false)
			{
				outputArray.push(new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [this.eContent]
				}));
			}
		}
		//endregion 
		
		//region Construct and return new ASN.1 schema for this object 
		return (new asn1js.Sequence({
			value: outputArray
		}));
		//endregion 
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			eContentType: this.eContentType
		};

		if("eContent" in this)
		{
			if(EncapsulatedContentInfo.compareWithDefault("eContent", this.eContent) === false)
				_object.eContent = this.eContent.toJSON();
		}

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
