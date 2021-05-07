//**************************************************************************************
const defaultValues = new Map([
	["2.5.4.15", "businessCategory"],
	["2.5.4.6", "C"],
	["2.5.4.3", "CN"],
	["0.9.2342.19200300.100.1.25", "DC"],
	["2.5.4.13", "description"],
	["2.5.4.27", "destinationIndicator"],
	["2.5.4.49", "distinguishedName"],
	["2.5.4.46", "dnQualifier"],
	["2.5.4.47", "enhancedSearchGuide"],
	["2.5.4.23", "facsimileTelephoneNumber"],
	["2.5.4.44", "generationQualifier"],
	["2.5.4.42", "givenName"],
	["2.5.4.51", "houseIdentifier"],
	["2.5.4.43", "initials"],
	["2.5.4.25", "internationalISDNNumber"],
	["2.5.4.7", "L"],
	["2.5.4.31", "member"],
	["2.5.4.41", "name"],
	["2.5.4.10", "O"],
	["2.5.4.11", "OU"],
	["2.5.4.32", "owner"],
	["2.5.4.19", "physicalDeliveryOfficeName"],
	["2.5.4.16", "postalAddress"],
	["2.5.4.17", "postalCode"],
	["2.5.4.18", "postOfficeBox"],
	["2.5.4.28", "preferredDeliveryMethod"],
	["2.5.4.26", "registeredAddress"],
	["2.5.4.33", "roleOccupant"],
	["2.5.4.14", "searchGuide"],
	["2.5.4.34", "seeAlso"],
	["2.5.4.5", "serialNumber"],
	["2.5.4.4", "SN"],
	["2.5.4.8", "ST"],
	["2.5.4.9", "street"],
	["2.5.4.20", "telephoneNumber"],
	["2.5.4.22", "teletexTerminalIdentifier"],
	["2.5.4.21", "telexNumber"],
	["2.5.4.12", "title"],
	["0.9.2342.19200300.100.1.1", "UID"],
	["2.5.4.50", "uniqueMember"],
	["2.5.4.35", "userPassword"],
	["2.5.4.24", "x121Address"],
	["2.5.4.45", "x500UniqueIdentifier"],
	["2.5.6.11", "applicationProcess"],
	["2.5.6.2", "country"],
	["1.3.6.1.4.1.1466.344", "dcObject"],
	["2.5.6.14", "device"],
	["2.5.6.9", "groupOfNames"],
	["2.5.6.17", "groupOfUniqueNames"],
	["2.5.6.3", "locality"],
	["2.5.6.4", "organization"],
	["2.5.6.7", "organizationalPerson"],
	["2.5.6.8", "organizationalRole"],
	["2.5.6.5", "organizationalUnit"],
	["2.5.6.6", "person"],
	["2.5.6.10", "residentialPerson"],
	["1.3.6.1.1.3.1", "uidObject"],
]);

/**
 * Map from RFC4519. Extract of AttributeType names with their corresponding OIDs.
 */
export default class AttributeTypeDictionary 
{
	/**
	 * Gets the Attribute Type Name corresponding to an OID
	 * @param {string} oid 
	 * @returns {string} - Returns the Attribute Type name if found, else the OID itself
	 */
	static get(oid) 
	{
		if(!defaultValues.has(oid)) 
		{
			return oid;
		}
		return defaultValues.get(oid);
	}

	/**
	 * Allows to find an Atribute Type OID by its name
	 * @param {string} value - Attribute Type name
	 * @returns {(string|null)} Returns the Attribute Type OID or null if not found
	 */
	static getOID(value) 
	{
		for(const [oid, val] of defaultValues) 
		{
			if(val === value) 
			{
				return oid;
			}
		}
		return null;
	}

	/**
	 * Sets a new Attribute Type OID/Name pair
	 * @param {string} oid - OID to set 
	 * @param {string} value - Name
	 */
	static set(oid, value) 
	{
		defaultValues.set(oid, value);
	}

	/**
	 * 
	 * Register multiple Attribute Type OID/Name entries
	 * @param {Array<Array<string>>} entries - Array of entries that contains the [OID, name] pair
	 */
	static register(entries) 
	{
		for(const [oid, value] of entries) 
		{
			AttributeTypeDictionary.set(oid, value);
		}
	}
}
