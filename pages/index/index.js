//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    // isBluetoothConnection: false,
    isBluetoothConnection: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  
  onLoad: function (options) {
    var that = this;
    // this.setData({ isBluetoothConnection: wx.getStorageSync('isConnected') || false});
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  bindDevice: function () {
    wx.navigateTo({
      url: '../pair/pair?mode=bindDevice'
    })
  },
  pair:function(){
    wx.navigateTo({
      url: '../pair/pair'
    })
  },
  ready:function(e){
    var that = this;
    var mode = e.currentTarget.dataset.mode;

    if (mode == "dayMode") {
      wx.setStorageSync('modeType', "dayMode");
    } else if (mode == "nightMode") {
      wx.setStorageSync('modeType', "nightMode");
    }
    if (that.data.isBluetoothConnection){
      wx.navigateTo({
        url: '../onready/onready?mode='+mode
      });
    }else{
      wx.navigateTo({
        url: '../pair/pair?mode=' + mode
      })
    }
  },
  onShow: function(){
    console.log("index==onShow方法", wx.getStorageSync('isConnected') || false);
    this.setData({ isBluetoothConnection: wx.getStorageSync('isConnected') || false });
  }
})
