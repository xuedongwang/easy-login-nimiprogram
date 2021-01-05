const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  try {
    const { type, buffer, imgUrl, imgType } = event;
    if (type === 'url') {
      const result = await cloud.openapi.ocr.printedText({
        type: 'photo',
        imgUrl
      })
      return result
    } else {
      const result = await cloud.openapi.ocr.printedText({
        type: 'photo',
        img: {
          contentType: `image/${imgType}`,
          value: Buffer.from(buffer)
        }
      })
      return result
    }
  } catch (err) {
    return err
  }
}