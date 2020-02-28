import PrivateKeyInfo from "./PrivateKeyInfo.js";
//**************************************************************************************
/**
 * Class from RFC5208
 */
export default class KeyBag extends PrivateKeyInfo
{
	//**********************************************************************************
	/**
	 * Constructor for Attribute class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		super(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
