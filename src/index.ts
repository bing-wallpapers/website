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

async function fetchAndUpdateBingImages() {
  try {
    const bing = await fetch(
      "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN"
    );
    const bingJson = await bing.json();
    const { images = [] } = bingJson;
    const { url, title, copyright } = images[0] || {};

    const newData = formatBingImageData(url, title, copyright);
    const list = await readAndUpdateImageList(newData);
    await writeToReadme(list);
    await writeToIndexFile(list);
  } catch (e) {
    console.log("err", e);
  }
}

function formatBingImageData(
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

async function readAndUpdateImageList(newData: BingImageData) {
  const data = await readFile("./map.json", "utf-8");
  const list = JSON.parse(data) as BingImageData[];
  list.unshift(newData);
  await writeFile("./map.json", JSON.stringify(list));
  return list;
}

async function writeToReadme(list: BingImageData[]) {
  const content = generateReadmeContent(list);
  const today = list[0];
  const { date, chineseTitle } = today;
  const allContent =
    `# [Bing Wallpapers](https://bing-wallpapers.vercel.app)  \n\n ### ${date} ${chineseTitle}  \n\n ![4k版本](${`https://github.com/bing-wallpapers/wallpaper-china/blob/main/static/${date}-4k.jpg?raw=true`})  \n\n` +
    content;
  await writeFile("README.md", allContent);
}

function generateReadmeContent(list: BingImageData[]) {
  const arr = [];
  arr.push("|     |     |     | \n");
  arr.push("|:---:|:---:|:---:| \n");
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
  if (list.length % 3 !== 1) {
    const lastElement = arr[arr.length - 1];
    if (lastElement.endsWith("|")) {
      arr[arr.length - 1] = lastElement.slice(0, -1) + "\n";
    } else {
      arr.push("|\n");
    }
  }
  return arr.join("");
}

async function writeToIndexFile(list: BingImageData[]) {
  const content = generateIndexContent(list);
  await writeFile("./docs/index.md", content);
}

function generateIndexContent(list: BingImageData[]) {
  const arr: string[] = [];
  list.forEach((item) => {
    arr.push(`## ${item.date} ${item.chineseTitle}  \n\n`);
    arr.push(`${item.chineseCopyright} [4k Edition](${item.bing4kUrl})  \n\n`);
    arr.push(`![](${item.bing1080Url}) \n\n`);
  });
  return arr.join("");
}

fetchAndUpdateBingImages();
