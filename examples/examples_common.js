//**************************************************************************************
//region Auxilliary functions
//**************************************************************************************
/**
 * Format string in order to have each line with length equal to 64
 * @param {string} pemString String to format
 * @returns {string} Formatted string
 */
export function formatPEM(pemString)
{
	const PEM_STRING_LENGTH = pemString.length, LINE_LENGTH = 64;
	const wrapNeeded = PEM_STRING_LENGTH > LINE_LENGTH;

	if(wrapNeeded)
	{
		let formattedString = "", wrapIndex = 0;

		for(let i = LINE_LENGTH; i < PEM_STRING_LENGTH; i += LINE_LENGTH)
		{
			formattedString += pemString.substring(wrapIndex, i) + "\r\n";
			wrapIndex = i;
		}

		formattedString += pemString.substring(wrapIndex, PEM_STRING_LENGTH);
		return formattedString;
	}
	else
	{
		return pemString;
	}
}
//**************************************************************************************
