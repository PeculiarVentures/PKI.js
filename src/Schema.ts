export type SchemaType = any;

export type SchemaNames = {
  blockName?: string;
  optional?: boolean;
};

export interface SchemaCompatible {
  /**
   * Converts parsed ASN.1 object into current class
   * @param schema
   */
  fromSchema(schema: SchemaType): void;
  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  toSchema(): SchemaType;
  toJSON(): any;
}

export interface SchemaConstructor {
  schema?: SchemaType;
}

/**
 * Parameters for schema generation
 */
export interface SchemaParameters<N extends Record<string, any> = { /**/ }> {
  names?: SchemaNames & N;
}

export interface AsnBlockJson {
  blockName: string;
  blockLength: number;
  error: string;
  warnings: string[];
  valueBeforeDecode: ArrayBuffer;
}

export interface AsnIntegerJson extends AsnBlockJson {
  valueDec: number;
}
export type AsnEnumeratedJson = AsnIntegerJson;

export interface AsnBitStringJson extends AsnBlockJson {
  unusedBits: number;
  isConstructed: boolean;
  isHexOnly: boolean;
  valueHex: string;
}

export interface AsnOctetStringJson extends AsnBlockJson {
  isConstructed: boolean;
  isHexOnly: boolean;
  valueHex: string;
}

export interface AsnObjectIdentifierJson extends AsnBlockJson {
  value: string;
}
