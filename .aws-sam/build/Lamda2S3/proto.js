const { getJson,getHTML } = require("./modules/getPages");

(async () => {
  const data = await getJson("https://www3.nhk.or.jp/news/json16/syuyo.json");
  const domain = "https://www3.nhk.or.jp/news/";
  const links = data.channel.item.map(item => item.link);
  const processes = links.map(link => {
    return new Promise(async resolve => {
      const html = await getHTML(domain + link);
      new Promise(resolve2 => {
        resolve2(html);
      })
      .then(txt => {
        resolve(txt);
      })

    })
  })

  Promise.all(processes).then(data => {
    console.log(data);
  })

})();

