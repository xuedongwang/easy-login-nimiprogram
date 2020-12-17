//index.js
const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function() {
    wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              console.log(res.userInfo)
            }
          })
        }
      }
    })
  },
  async bindGetUserInfo (e) {
    const tempId = Date.now();
    console.log('tempId', tempId)
    const db = wx.cloud.database();
    const COLLENTION_NAME = 'user';
    const { userInfo } = e.detail;
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOpenid',
      });
      const { openid } = result;
      const user = await db.collection(COLLENTION_NAME).where({
        openid
      }).get();
      if (user.data.length === 0) {
        await db.collection(COLLENTION_NAME).add({
          data: {
            ...userInfo,
            openid,
            tempId,
          }
        })
        console.log('not finded', tempId)
      } else {
        await db.collection(COLLENTION_NAME).doc(user.data[0]._id).update({
          data: {
            tempId
          }
        })
        console.log('finded', tempId)
      }
    } catch(err) {
      throw err;
    }
  }
})
