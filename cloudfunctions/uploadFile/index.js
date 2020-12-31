// 云函数入口文件
const cloud = require('wx-server-sdk');
const path = require('path');
const OSS = require('ali-oss');

const config = {
  region: 'oss-cn-beijing',
  accessKeyId: 'LTAI4G7p9hYYqDgo1MDshenL',
  accessKeySecret: 'zNvxTK3DDi6pJd3uwuv6wsO8VkEp8N'
}

cloud.init()

const BUCKET_NAEM = 'xuedongwang-blog-oss';

let client = new OSS({
  bucket: BUCKET_NAEM,
  region: config['region'],
  accessKeyId: config['accessKeyId'],
  accessKeySecret: config['accessKeySecret']
});


async function upload (filepath) {
  try {
    await client.put(`67.jpg`, filepath);
  } catch (e) {
    throw e;
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const result = await upload(event.imgUrl)
  return result;
}