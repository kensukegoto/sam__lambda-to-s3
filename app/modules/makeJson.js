const cheerio = require('cherio');

module.exports = html => new Promise((resolve,reject)=>{

  const $ = cheerio.load(html.Body.toString('utf-8'));
  const myScript = $(".module--detail script").html();
  let json = (()=>{
    let body = myScript.toString().split('var __DetailProp__ =')[1].trim();
    body = (new Function("return " + body))();
    console.log(body);
    return JSON.stringify(body);
  })();

  resolve(json);

})