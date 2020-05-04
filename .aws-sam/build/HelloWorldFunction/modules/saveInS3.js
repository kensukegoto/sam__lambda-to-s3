const AWS = require("aws-sdk");
const S3 = new AWS.S3();

module.exports = params => new Promise(async (resolve,reject) => {
  S3.putObject(params, err => {
    if (err) {
      // rejectするとcatchに渡る
      reject(err)
    } else {
      resolve();
    }
  })
})