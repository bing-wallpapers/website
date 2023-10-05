"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const promises_1 = require("fs/promises");
const fetchBingData = () => __awaiter(void 0, void 0, void 0, function* () {
    const bing = yield (0, node_fetch_1.default)("https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN");
    const bingJson = yield bing.json();
    return bingJson.images[0] || {};
});
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
};
const generateDataObject = (imageData) => {
    const { url, title, copyright } = imageData;
    const date = formatDate(new Date());
    const urlUHD = url.split("1920x1080").join("UHD");
    return {
        date,
        bing4kUrl: `https://cn.bing.com${urlUHD}`,
        bingPreviewUrl: `https://cn.bing.com${url}&w=480&h=270`,
        bing1080Url: `https://cn.bing.com${url}`,
        chineseTitle: title,
        chineseCopyright: copyright,
    };
};
const readJsonFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, promises_1.readFile)(path);
    return JSON.parse(data.toString());
});
const writeJsonFile = (path, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, promises_1.writeFile)(path, JSON.stringify(data));
});
const updateMapFile = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const mapData = yield readJsonFile("./map.json");
    mapData.unshift(data);
    yield writeJsonFile("./map.json", mapData);
});
const writeReadme = (list) => __awaiter(void 0, void 0, void 0, function* () {
    // ... implement the same way as before ...
});
const writeIndex = (b) => __awaiter(void 0, void 0, void 0, function* () {
    // ... implement the same way as before ...
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageData = yield fetchBingData();
        const newData = generateDataObject(imageData);
        yield updateMapFile(newData);
        const list = yield readJsonFile("./map.json");
        yield writeReadme(list);
        yield writeIndex(list);
    }
    catch (e) {
        console.log("err", e);
    }
});
init();
