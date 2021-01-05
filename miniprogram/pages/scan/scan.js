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
    setting: {},
    isShowImg: false,
    imgType: 'png',
    src: ''
  },
  handleReTakePhoto(){
    this.setData({
      isShowImg: false
    });
  },
  async handleScan() {
    const { src,imgType } = this.data;
    const fileInfo = await wx.getFileInfo({filePath:src});
    if (fileInfo.size > 2 * 1024 * 1024) {
      wx.showToast({
        title: '图片过大',
        icon: 'none'
      });
      this.setData({
        isShowImg: false
      });
      return;
    }
    this.scan(src, imgType);
  },
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: res => {
        const path = res.tempImagePath;
        this.setData({
          src: path,
          imgType: path.split('.').slice(-1)[0],
          isShowImg: true
        });
      }
    })
  },
  error(e) {
    console.log(e.detail)
  },
  onShow: function() {
    this.fetchSetting();
    this.fetchKeywordsList();
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
    this.setData({
      setting: setting.data.length > 0 ? setting.data[0] : {}
    });
    wx.hideLoading();
  },
  async scan (filePath, fileType) {
    const self = this;
    const manager = wx.getFileSystemManager();
    const imgUrl = manager.readFileSync(filePath);
    wx.showLoading({
      title: '识别中...'
    });
    wx.cloud.callFunction({
      name: 'getImgText',
      data: {
        type: 'buffer',
        fileType,
        buffer: imgUrl
      },
      success: function(res) {
        wx.hideLoading();
        console.log(res);
        const {items} = res.result;
        if (res.errCode === -1 || !items) {
          wx.showToast({
            title: '识别出错',
            icon: 'none'
          });
          return;
        }
        let str = '';
        let targetStr = '';
        items.forEach(item => {
          str += item.text;
        });
        self.data.keywords.forEach(item => {
          if (str.includes(item.name)) {
            self.updateKeywordCount(item.name);
            targetStr += item.name;
          }
        });
        if (self.data.setting.voiceBroadcast) {
          AudioContext(targetStr);
        }
        wx.navigateBack();
      },
      fail: console.error
    })
  }
})
