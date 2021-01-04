//index.js
const app = getApp();
const plugin = requirePlugin('WechatSI');

function AudioContext(content) {
  const innerAudioContext = wx.createInnerAudioContext();
  innerAudioContext.autoplay = true;

  plugin.textToSpeech({
    lang: "zh_CN",
    tts: true,
    content: content,
    success: function(res) {

      innerAudioContext.src = res.filename;

      innerAudioContext.onPlay(() => {

      })

      innerAudioContext.onStop(() => {
        innerAudioContext.stop();
        //播放停止，销毁该实例
        innerAudioContext.destroy();

      })

      innerAudioContext.onEnded(() => {
        //播放结束，销毁该实例
        innerAudioContext.destroy();
      })

      innerAudioContext.onError((res) => {
        innerAudioContext.destroy();
      })

    },
    fail: function(res) {
    }
  })
}

Page({
  data: {
    keywords: [],
    result: '',
    setting: {}
  },
  onShow: function() {
    this.fetchKeywordsList();
    this.fetchSetting();
  },
  async fetchSetting () {
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
      return;
    }
    this.setData({
      setting: setting.data[0]
    });
    wx.hideLoading();
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
  async updateKeywordCount (word) {
    wx.showLoading({
      title: '加载中...'
    });
    const db = wx.cloud.database();
    const res = await wx.cloud.callFunction({
      name: 'getOpenid'
    });
    const userId = res.result.openid;
    const keywords = await db.collection('keywords').where({
      _openid: userId,
      name: word
    }).get();
    await db.collection('keywords').doc(keywords.data[0]._id).update({
      data: {
        count: keywords.data[0].count + 1
      }
    });
    wx.hideLoading();
  },
  async handlePicture (e) {
    const self = this;
    const res = await wx.chooseImage({
      count: 1
    });
    const filePath = res.tempFilePaths[0];
    const manager = wx.getFileSystemManager();
    const imgUrl = manager.readFileSync(filePath);
    wx.showLoading({
      title: '识别中...'
    });
    wx.cloud.callFunction({
      name: 'getImgText',
      data: {
        type: 'buffer',
        buffer: imgUrl
      },
      success: function(res) {
        const {items} = res.result;
        let str = '';
        let targetStr = '';
        items.forEach(item => {
          str += item.text;
        });
        if (self.data.setting.voiceBroadcast) {
          self.data.keywords.forEach(item => {
            if (str.includes(item.name)) {
              console.log(item.name)
              self.updateKeywordCount(item.name);
              targetStr += item.name;
            }
          });
          AudioContext(targetStr);
        }
        wx.hideLoading();
      },
      fail: console.error
    })
  }
})
