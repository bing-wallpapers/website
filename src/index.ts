import fetch from "node-fetch";
import { readFile, writeFile } from "fs";

async function init() {
  try {
    const bing = await fetch(
      "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN"
    );
    const bingJson = await bing.json();
    const { images = [] } = bingJson;
    let { url, title, copyright } = images[0] || {};

    const chineseCopyright = copyright;
    const chinesePreviewTitle = copyright.split("(")[0].trim();
    const chineseTitle = title;

    const time = new Date();
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const date = `${year}-${month}-${day}`;

    url = url.split("1920x1080").join("UHD");

    const bing4kUrl = `https://cn.bing.com${url}`;
    const bingPreviewUrl = `https://cn.bing.com${url}&w=480&h=270`;
    const bing1080Url = `https://cn.bing.com${url}`;

    const newData = {
      date,
      bing4kUrl,
      bingPreviewUrl,
      bing1080Url,
      chineseTitle,
      chineseCopyright,
      chinesePreviewTitle,
    };

    readFile("./map.json", function (err, data) {
      const a = data.toString();
      const b = JSON.parse(a);
      b.unshift(newData);

      writeFile("./map.json", JSON.stringify(b), function (err) {
        if (err) {
          return console.error(err);
        }
      });
      writeReadme(b);
      writeIndex(b);
    });
  } catch (e) {
    console.log("err", e);
  }
}

const writeReadme = async (list: any) => {
  const today = list[0];
  const { date, chineseTitle } = today;

  const arr: string[] = [];

  arr.push(`# [Bing Wallpapers](https://bing-wallpapers.vercel.app)  \n\n`);
  arr.push(`### ${date} ${chineseTitle}  \n\n`);
  arr.push(
    `![4k版本](${`https://github.com/bing-wallpapers/wallpaper-china/blob/main/static/${date}-4k.jpg?raw=true`})  \n\n`
  );
  arr.push(`|     |     |     | \n`);
  arr.push(`|:---:|:---:|:---:| \n`);

  const newArr: string[] = [];
  list.forEach((item: any, index: any) => {
    if (index !== 0) {
      const data = `![](${`https://github.com/bing-wallpapers/wallpaper-china/blob/main/static/${item.date}-preview.jpg?raw=true`})<br> ${
        item.date
      } [4K 版本](${`https://github.com/bing-wallpapers/wallpaper-china/blob/main/static/${item.date}-4k.jpg?raw=true`}) <br> ${
        item.chineseTitle
      }`;

      if (index % 3 === 0) {
        newArr.push(`|${data}|\n`);
        const result = newArr.join("");
        arr.push(result);
        newArr.length = 0;
      } else {
        newArr.push(`|${data}`);
      }
    }
  });

  let a = newArr.join("");

  arr.push(a);

  readFile("README.md", function (err, data) {
    if (err) {
      return console.error(err);
    }

    writeFile("README.md", arr.join(""), function (err) {
      if (err) {
        return console.error(err);
      }
      readFile("README.md", function (err, data) {
        if (err) {
          return console.error(err);
        }
        console.log("异步读取文件数据: " + data.toString());
      });
    });
  });
};

const writeIndex = async (b: any) => {
  const arr: string[] = [];

  b.forEach((item: any) => {
    arr.push(`## ${item.date} ${item.chineseTitle}  \n\n`);
    arr.push(`${item.chineseCopyright} [4k Edition](${item.bing4kUrl})  \n\n`);
    arr.push(`![](${item.bing1080Url}) \n\n`);
  });
  const newData = arr.join("");

  writeFile("./docs/index.md", newData, function (err) {
    if (err) {
      return console.error(err);
    }
    readFile("./docs/index.md", function (err, data) {
      if (err) {
        return console.error(err);
      }
      console.log("异步读取文件数据: " + data.toString());
    });
  });
};

init();
