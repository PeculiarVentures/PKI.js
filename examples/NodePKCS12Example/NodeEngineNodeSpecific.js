const crypto = require("crypto");
//**************************************************************************************
function getRandomValues(length)
{
	return (new Uint8Array(crypto.randomBytes(length)));
}
//**************************************************************************************
/**
 * encryptUsingPBKDF2Password
 * @param {string} algorithm
 * @param {number} keyLength
 * @param {ArrayBuffer} password
 * @param {ArrayBuffer} salt
 * @param {number} iterationCount
 * @param {string} hashAlgorithm
 * @param {ArayBuffer} iv
 * @param {ArrayBuffer} messageToEncrypt
 */
function encryptUsingPBKDF2Password(algorithm, keyLength, password, salt, iterationCount, hashAlgorithm, iv, messageToEncrypt)
{
	//region Initial variables
	let cipher;
	//endregion
	
	//region Make hash algorithm name to be Node-friendly
	hashAlgorithm = hashAlgorithm.replace("-", "");
	//endregion
	
	//region Derive key using PBKDF2 algorithm
	const key = crypto.pbkdf2Sync(Buffer.from(password), Buffer.from(salt), iterationCount, keyLength, hashAlgorithm);
	//endregion
	
	//region Initialize cipher object
	if(iv.byteLength)
		cipher = crypto.createCipheriv(algorithm, key, Buffer.from(iv));
	else
		cipher = crypto.createCipher(algorithm, key);
	//endregion
	
	return (new Uint8Array(Buffer.concat([cipher.update(Buffer.from(messageToEncrypt)), cipher.final()]))).buffer;
}
//**************************************************************************************
/**
 * decryptUsingPBKDF2Password
 * @param {string} algorithm
 * @param {number} keyLength
 * @param {ArrayBuffer} password
 * @param {ArrayBuffer} salt
 * @param {number} iterationCount
 * @param {string} hashAlgorithm
 * @param {ArayBuffer} iv
 * @param {ArrayBuffer} messageToDecrypt
 */
function decryptUsingPBKDF2Password(algorithm, keyLength, password, salt, iterationCount, hashAlgorithm, iv, messageToDecrypt)
{
	//region Initial variables
	let cipher;
	//endregion
	
	//region Make hash algorithm name to be Node-friendly
	hashAlgorithm = hashAlgorithm.replace("-", "");
	//endregion
	
	//region Derive key using PBKDF2 algorithm
	const key = crypto.pbkdf2Sync(Buffer.from(password), Buffer.from(salt), iterationCount, keyLength, hashAlgorithm);
	//endregion
	
	//region Initialize cipher object
	if(iv.byteLength)
		cipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv));
	else
		cipher = crypto.createDecipher(algorithm, key);
	//endregion

	return (new Uint8Array(Buffer.concat([cipher.update(Buffer.from(messageToDecrypt)), cipher.final()]))).buffer;
}
//**************************************************************************************
function stampDataWithPassword(hashAlgorithm, keyLength, password, salt, iterationCount, stampingData)
{
	//region Make hash algorithm name to be Node-friendly
	hashAlgorithm = hashAlgorithm.replace("-", "");
	//endregion
	
	//region Derive key using PBKDF2 algorithm
	const key = crypto.pbkdf2Sync(Buffer.from(password), Buffer.from(salt), iterationCount, keyLength, hashAlgorithm);
	//endregion
	
	//region Making HMAC value
	const hmac = crypto.createHmac(hashAlgorithm, key);
	hmac.update(Buffer.from(stampingData));
	//endregion
	
	return (new Uint8Array(hmac.digest())).buffer;
}
//**************************************************************************************
function subtle(){
}
//**************************************************************************************
subtle.prototype.importKey = function (format, keyData, algorithm, extractable, keyUsages)
{

}
//**************************************************************************************
subtle.prototype.deriveKey = function (algorithm, baseKey, derivedKeyType, extractable, keyUsages)
{

}
//**************************************************************************************
module.exports.getRandomValues = getRandomValues;
module.exports.encryptUsingPBKDF2Password = encryptUsingPBKDF2Password;
module.exports.decryptUsingPBKDF2Password = decryptUsingPBKDF2Password;
module.exports.stampDataWithPassword = stampDataWithPassword;
module.exports.subtle = new subtle();
//**************************************************************************************
