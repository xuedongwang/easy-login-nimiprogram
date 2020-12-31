const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.ocr.printedText({
      type: 'photo',
      imgUrl: event.imgUrl
    })
    // img: {
    //   contentType: 'image/png',
    //   value: Buffer
    // }
    return result
  } catch (err) {
    return err
  }
}