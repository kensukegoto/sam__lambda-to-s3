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

const util = require('util');
const getFromS3 = require('./modules/getFromS3');
const makeJson = require('./modules/makeJson');

exports.s32lamda = async (event, context,callback) => {

  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));

  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const dstBucket = srcBucket + "-json";
  const dstKey    = srcKey.split(".")[0] + ".json";


  const origHTML = await getFromS3(srcBucket,srcKey);

  const json = await makeJson(origHTML);


  try {
    const destparams = {
        Bucket: dstBucket,
        Key: dstKey,
        Body: json,
        ContentType: "application/json"
    };

    await await saveInS3(destparams);
      
  } catch (error) {
      console.log(error);
      return;
  } 

  console.log("出来たよ！");

  // return 無し

};
