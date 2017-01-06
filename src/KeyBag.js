import PrivateKeyInfo from "./PrivateKeyInfo";
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
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		super(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
