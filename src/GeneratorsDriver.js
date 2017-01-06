//**************************************************************************************
//region Aux functions
//**************************************************************************************
const isGenerator = generator =>
{
	if(typeof generator === "undefined")
		return false;
	
	return ((typeof generator.next === "function") && (typeof generator.throw === "function"));
};
//**************************************************************************************
const isGeneratorFunction = generator =>
{
	if(typeof generator === "undefined")
		return false;
	
	const constructor = generator.constructor;
	
	if(!constructor)
		return false;
	
	if((constructor.name === "GeneratorFunction") || (constructor.displayName === "GeneratorFunction"))
		return true;
	
	return isGenerator(generator);
};
//**************************************************************************************
//endregion
//**************************************************************************************
/**
 * Simple "generator's driver" inspired by "https://github.com/tj/co".
 * @param {Generator|GeneratorFunction} generatorInstance
 * @returns {Promise}
 */
export default function generatorsDriver(generatorInstance)
{
	//region Check that we do have instance of "Generator" as input
	if(!isGenerator(generatorInstance))
	{
		if(isGeneratorFunction(generatorInstance))
			generatorInstance = generatorInstance();
		else
			throw new Error("Only generator instance of generator function is a valid input");
	}
	//endregion
	
	return new Promise((resolve, reject) =>
	{
		/**
		 * Driver function called on "reject" status in Promises
		 * @param {*} error
		 * @returns {*}
		 */
		const onReject = error =>
		{
			let result;
			
			try
			{
				result = generatorInstance.throw(error);
			}
			catch(ex)
			{
				return reject(ex);
			}
			
			return callback(result);
		};
		
		/**
		 * Main driver function
		 * @param {*} [result]
		 * @returns {*}
		 */
		const callback = result =>
		{
			/**
			 * @type Object
			 * @property {boolean} done
			 * @property {*} value
			 */
			let generatorResult;
			
			try
			{
				generatorResult = generatorInstance.next(result);
			}
			catch(ex)
			{
				return reject(ex);
			}
			
			switch(true)
			{
				case (generatorResult.value instanceof Promise):
					return ((generatorResult.done) ? resolve(generatorResult.value) : generatorResult.value.then(callback, onReject));
				case isGeneratorFunction(generatorResult.value):
				case isGenerator(generatorResult.value):
					return ((generatorResult.done) ? generatorsDriver(generatorResult.value).then(driverResult =>
					{
						resolve(driverResult);
					}, onReject) : generatorsDriver(generatorResult.value).then(callback, onReject));
				case (typeof generatorResult.value === "function"):
					generatorResult.value = generatorResult.value();
				default:
					return (generatorResult.done) ? resolve(generatorResult.value) : callback(generatorResult.value);
			}
		};
		
		callback();
	});
}
//**************************************************************************************
