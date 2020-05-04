const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const fetch = require("node-fetch");

// event
  // 呼び出し元の情報
// context
  // 呼び出し、関数、および実行環境に関する情報（関数名など）
exports.handler = async (event, context, callback) => {

  const BucketName = process.env.BucketName;

  const url = (()=>{
    if(!event.queryStringParameters && !event.queryStringParameters.url) return null;
    
    return event.queryStringParameters.url;
  })();

  if(!url) callback(new Error());

  try {

    const html = await fetch(url)
      .then(res => res.text())

    const now = new Date();

    const params = {
      Bucket: BucketName,
      Key: `${now.getFullYear()}${("00" + (now.getMonth() + 1)).slice(-2)}${("00" + now.getDate()).slice(-2)}/index.html`,
      Body: html,
      ContentType: "html"
    };

    await savePromiseForS3(params);

    const response = {
      'statusCode': 200,
      'body': JSON.stringify({
        message: 'OK!?',
      })
    }

    // 第一引数(エラー)を忘れない
    callback(null, response);


  } catch (err) {
    callback(err);
  }

};


function savePromiseForS3(params) {
  return new Promise((resolve, reject) => {
    S3.putObject(params, err => {
      if (err) {
        // rejectするとcatchに渡る
        reject(err)
      } else {
        resolve();
      }
    })
  })
} // savePromiseForS3