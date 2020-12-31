//index.js
const app = getApp()

Page({
  data: {},
  onLoad: function() {},
  async handleUoloadFile (e) {
    const res = await wx.chooseImage({});
    const imgUrl = res.tempFilePaths[0];
    const fileManager = wx.getFileSystemManager();
    const arrayBuffer = fileManager.readFileSync(imgUrl);
    console.log(arrayBuffer)
    wx.cloud.callFunction({
      name: 'arrayBuffer2Buffer',
      data: {
        arrayBuffer
      },
      success: function(res) {
        console.log(res) // 3
      },
      fail: console.error
    })
    // wx.cloud.callFunction({
    //   name: 'getImgText',
    //   data: {
    //     imgUrl: ''
    //   },
    //   success: function(res) {
    //     console.log(res) // 3
    //   },
    //   fail: console.error
    // })
  }
})
