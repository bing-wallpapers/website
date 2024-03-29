"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const node_fetch_1 = __importDefault(require("node-fetch"));
function fetchAndUpdateBingImages() {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const bing = yield (0, node_fetch_1.default)(
        "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN"
      );
      const bingJson = yield bing.json();
      const { images = [] } = bingJson;
      const { url, title, copyright } = images[0] || {};
      const newData = formatBingImageData(url, title, copyright);
      const list = yield readAndUpdateImageList(newData);
      yield writeToReadme(list);
      yield writeToIndexFile(list);
    } catch (e) {
      console.log("err", e);
    }
  });
}
function formatBingImageData(url, title, copyright) {
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
function readAndUpdateImageList(newData) {
  return __awaiter(this, void 0, void 0, function* () {
    const data = yield (0, promises_1.readFile)("./map.json", "utf-8");
    const list = JSON.parse(data);
    list.unshift(newData);
    yield (0, promises_1.writeFile)("./map.json", JSON.stringify(list));
    return list;
  });
}
function writeToReadme(list) {
  return __awaiter(this, void 0, void 0, function* () {
    const content = generateReadmeContent(list);
    const today = list[0];
    const { date, chineseTitle } = today;
    const allContent =
      `# [Bing Wallpapers](https://bing-wallpapers.vercel.app)  \n\n ### ${date} ${chineseTitle}  \n\n ![4k版本](${`https://github.com/bing-wallpapers/wallpaper-china/blob/main/static/${date}-4k.jpg?raw=true`})  \n\n` +
      content;
    yield (0, promises_1.writeFile)("README.md", allContent);
  });
}
function generateReadmeContent(list) {
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
function writeToIndexFile(list) {
  return __awaiter(this, void 0, void 0, function* () {
    const content = generateIndexContent(list);
    yield (0, promises_1.writeFile)("./docs/index.md", content);
  });
}
function generateIndexContent(list) {
  const arr = [];
  list.forEach((item) => {
    arr.push(`## ${item.date} ${item.chineseTitle}  \n\n`);
    arr.push(`${item.chineseCopyright} [4k Edition](${item.bing4kUrl})  \n\n`);
    arr.push(`![](${item.bing1080Url}) \n\n`);
  });
  return arr.join("");
}
fetchAndUpdateBingImages();
