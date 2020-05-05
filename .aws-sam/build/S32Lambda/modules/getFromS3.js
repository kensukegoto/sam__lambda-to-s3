const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const util = require('util');

module.exports = (Bucket,Key) => new Promise(async (resolve,reject)=>{

  try {
    const params = {
        Bucket,Key
    };
    const html= await s3.getObject(params).promise();
    resolve(html);

  } catch (error) {
    reject(error)
  }

})