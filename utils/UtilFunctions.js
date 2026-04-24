
exports.convertStringToJSON = (content) => {
  if (typeof (content) !== 'object') {
    try{
      return JSON.parse(content);
    } catch(err){
      console.debug(`convertStringToJSON=${err}`);
      return content
    }
  }
  return content;
};
exports.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.convertJSONToString = (content) => {
  if (typeof (content) === 'object') {
    try{
      return JSON.stringify(content);
    }
    catch(err){
      console.debug(`convertJSONToString=${err}`);
      return content
    }

  }
  return content;
};