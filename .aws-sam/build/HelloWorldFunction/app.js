const { getJson,getHTML } = require("./modules/getPages");
const saveInS3 = require("./modules/saveInS3");

// event
  // 呼び出し元の情報
// context
  // 呼び出し、関数、および実行環境に関する情報（関数名など）
exports.handler = async (event, context, callback) => {

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

