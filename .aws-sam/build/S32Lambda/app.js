const { getJson,getHTML } = require("./modules/getPages");
const saveInS3 = require("./modules/saveInS3");

// event
  // 呼び出し元の情報
// context
  // 呼び出し、関数、および実行環境に関する情報（関数名など）
exports.lamda2S3 = async (event, context, callback) => {

  const data = await getJson("https://www3.nhk.or.jp/news/json16/syuyo.json");
  const domain = "https://www3.nhk.or.jp/news/";

  const links = data.channel.item.map(item => item.link);

  const processes = links.map(link => {

    return new Promise(async resolve => {

      const html = await getHTML(domain + link);
      const BucketName = process.env.BucketName;
      const params = {
        Bucket: BucketName,
        Key: link,
        Body: html,
        ContentType: "html"
      };
    
      await saveInS3(params);
      
      resolve();

    })
  })


  await Promise.all(processes).then(data => {
    callback(null,{
      statusCode: 200,
      body: JSON.stringify({message:"OK"})
    })
  })

};

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const util = require('util');
const cheerio = require('cherio')

exports.s32lamda = async (event, context,callback) => {

  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));

  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const dstBucket = srcBucket + "-resized";
  const dstKey    = srcKey.split(".")[0] + ".json";

  try {
    const params = {
        Bucket: srcBucket,
        Key: srcKey
    };
    var origimage = await s3.getObject(params).promise();

  } catch (error) {
      console.log(error);
      return;
  }

  const $ = cheerio.load(origimage.Body.toString('utf-8'));
  const myScript = $(".module--detail script").html();
  let jsonBody = (()=>{
    let body = myScript.toString().split('var __DetailProp__ =')[1].trim();
    body = (new Function("return " + body))();
    console.log(body);
    return JSON.stringify(body);
  })();

  try {
    const destparams = {
        Bucket: dstBucket,
        Key: dstKey,
        Body: jsonBody,
        ContentType: "application/json"
    };

    await s3.putObject(destparams).promise(); 
      
  } catch (error) {
      console.log(error);
      return;
  } 
    
  callback(null,{
    statusCode: 200,
    body: JSON.stringify({
      message: "ok"
    })
  });

};
