import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

interface BingImageData {
  date: string;
  bing4kUrl: string;
  bingPreviewUrl: string;
  bing1080Url: string;
  chineseTitle: string;
  chineseCopyright: string;
}

async function init() {
  try {
    const bing = await fetch(
      "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN"
    );
    const bingJson = await bing.json();
    const { images = [] } = bingJson;
    const { url, title, copyright } = images[0] || {};

    const newData = createNewData(url, title, copyright);
    const list = await readAndUpdateMap(newData);
    await writeReadme(list);
    await writeIndex(list);
  } catch (e) {
    console.log("err", e);
  }
}

function createNewData(
  url: string,
  title: string,
  copyright: string
): BingImageData {
  const time = new Date();
  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const day = time.getDate();
  const date = `${year}-${month}-${day}`;

  url = url.split("1920x1080").join("UHD");

  const bing4kUrl = `https://cn.bing.com${url}`;
  const bingPreviewUrl = `https://cn.bing.com${url}&w=480&h=270`;
  const bing1080Url = `https://cn.bing.com${url}`;

  return {
    date,
    bing4kUrl,
    bingPreviewUrl,
    bing1080Url,
    chineseTitle: title,
    chineseCopyright: copyright,
  };
}

async function readAndUpdateMap(newData: BingImageData) {
  const data = await readFile("./map.json", "utf-8");
  const list = JSON.parse(data) as BingImageData[];
  list.unshift(newData);
  await writeFile("./map.json", JSON.stringify(list));
  return list;
}

async function writeReadme(list: BingImageData[]) {
  const content = buildReadmeContent(list);
  await writeFile("README.md", content);
  const data = await readFile("README.md", "utf-8");
  console.log("异步读取文件数据: " + data);
}

function buildReadmeContent(list: BingImageData[]) {
  const arr = [];
  const today = list[0];
  const { date, chineseTitle } = today;

  arr.push(`# [Bing Wallpapers](https://bing-wallpapers.vercel.app)  \n\n`);
  arr.push(`### ${date} ${chineseTitle}  \n\n`);
  arr.push(
    `![4k版本](${`https://github.com/bing-wallpapers/wallpaper-china/blob/main/static/${date}-4k.jpg?raw=true`})  \n\n`
  );
  arr.push(`|     |     |     | \n`);
  arr.push(`|:---:|:---:|:---:| \n`);

  list.slice(1).forEach((item, index) => {
    const data = `![](${`https://github.com/bing-wallpapers/wallpaper-china/blob/main/static/${item.date}-preview.jpg?raw=true`})<br> ${
      item.date
    } [4K 版本](${`https://github.com/bing-wallpapers/wallpaper-china/blob/main/static/${item.date}-4k.jpg?raw=true`}) <br> ${
      item.chineseTitle
    }`;

    if ((index + 1) % 3 === 0) {
      arr.push(`|${data}|\n`);
    } else {
      arr.push(`|${data}`);
    }
  });

  if (list.length % 3 !== 0) {
    arr.push("|\n");
  }

  return arr.join("");
}

async function writeIndex(list: BingImageData[]) {
  const content = buildIndexContent(list);
  await writeFile("./docs/index.md", content);
  const data = await readFile("./docs/index.md", "utf-8");
  console.log("异步读取文件数据: " + data);
}

function buildIndexContent(list: BingImageData[]) {
  const arr: string[] = [];

  list.forEach((item) => {
    arr.push(`## ${item.date} ${item.chineseTitle}  \n\n`);
    arr.push(`${item.chineseCopyright} [4k Edition](${item.bing4kUrl})  \n\n`);
    arr.push(`![](${item.bing1080Url}) \n\n`);
  });

  return arr.join("");
}

init();
