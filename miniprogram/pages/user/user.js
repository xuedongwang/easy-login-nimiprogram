//index.js
const app = getApp();

Page({
  data: {
    switchAudioChecked: false
  },
  onShow(){
    this.getSetting()
  },
  async getSetting () {
    wx.showLoading({
      title: '加载中...'
    });
    const db = wx.cloud.database();
    const res = await wx.cloud.callFunction({
      name: 'getOpenid'
    });
    const userId = res.result.openid;
    const setting = await db.collection('setting').where({
      _openid: userId
    }).get();
    if (setting.data.length === 0) {
      this.setData({
        switchAudioChecked: false
      })
    } else {
      const res = await db.collection('setting').doc(setting.data[0]._id).get();
      this.setData({
        switchAudioChecked: res.data.voiceBroadcast
      })
    }
    wx.hideLoading();
  },
  async switchAudioChange (e) {
    const { value } = e.detail;
    const db = wx.cloud.database();
    const res = await wx.cloud.callFunction({
      name: 'getOpenid'
    });
    wx.showLoading({
      title: '加载中...'
    });
    const userId = res.result.openid;
    const setting = await db.collection('setting').where({
      _openid: userId
    }).get();
    if (setting.data.length === 0) {
      await db.collection('setting').add({
        data: {
          voiceBroadcast: value
        }
      })
    } else {
      await db.collection('setting').doc(setting.data[0]._id).update({
        data: {
          voiceBroadcast: value
        }
      });
    }
    this.setData({
      switchAudioChecked: value
    });
    wx.hideLoading();
  }
})
