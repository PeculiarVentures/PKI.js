import PrivateKeyInfo from "./PrivateKeyInfo";

/**
 * Class from RFC5208
 */
// TODO looks odd
export default class KeyBag extends PrivateKeyInfo {

  /**
   * Constructor for Attribute class
   * @param parameters
   */
  constructor(parameters = {}) {
    super(parameters);
  }

}

