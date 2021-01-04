//index.js
const app = getApp();

Page({
  data: {
    slideButtons: [{
      text: '删除',
      type: 'warn'
    }],
    keywords: [],
    showAddKeywordInput: false,
    newKeyword: ''
  },
  onShow() {
    this.fetchKeywordsList()
  },
  async slideButtonTap(e) {
    wx.showModal({
      title: '提示',
      content: '确认删除？不可恢复',
      success: async res => {
        if (res.confirm) {
          wx.showLoading({
          title: '加载中...'
        });
        const db = wx.cloud.database();
        const { index } = e.detail;
        const id = this.data.keywords[index]._id
        await db.collection('keywords').doc(id).remove();
        this.fetchKeywordsList();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  handleInputKeyword (e) {
    const { value } = e.detail;
    this.setData({
      newKeyword: value
    });
  },
  async fetchKeywordsList () {
    wx.showLoading({
      title: '加载中...'
    });
    const db = wx.cloud.database();
    const res = await wx.cloud.callFunction({
      name: 'getOpenid'
    });
    const userId = res.result.openid;
    const keywords = await db.collection('keywords').where({
      _openid: userId
    }).get();
    this.setData({
      keywords: keywords.data
    })
    wx.hideLoading();
  },
  async addKeywords () {
    wx.showLoading({
      title: '加载中...'
    });
    const newKeyword = this.data.newKeyword;
    const db = wx.cloud.database();
    const res = await wx.cloud.callFunction({
      name: 'getOpenid'
    });
    const userId = res.result.openid;
    const keywords = await db.collection('keywords').where({
      _openid: userId
    }).get();
    const list = keywords.data;
    if (list.find(item => item.name === newKeyword.trim())) {
      wx.showToast({
        title: '重复添加',
        icon: 'none'
      })
      return;
    }
    await db.collection('keywords').add({
      data: {
        name: newKeyword,
        count: 0
      }
    });
    this.setData({
      showAddKeywordInput: false
    })
    this.fetchKeywordsList();
    wx.hideLoading()
  },
  async handleAddKeywords () {
    this.setData({
      showAddKeywordInput: true
    })
  }
})
