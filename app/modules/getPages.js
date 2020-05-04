const fetch = require("node-fetch");

exports.getJson = url => new Promise(async (resolve,reject) => {

  const json = await fetch(url)
    .then(res => res.json());

  resolve(json);
  
})


exports.getHTML = url => new Promise(async (resolve,reject) => {

  const html = await fetch(url)
    .then(res => res.text());

  resolve(html);
  
})