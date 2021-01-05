//index.js
const app = getApp();

Page({
  data: {
    setting: {}
  },
  onShow() {},
  handlePicture () {
    wx.navigateTo({
      url: '/pages/scan/scan'
    })
  }
})
