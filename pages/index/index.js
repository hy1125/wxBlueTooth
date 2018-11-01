//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    // isBluetoothConnection: false,
    isBluetoothConnection: false
  },
  
  onLoad: function (options) {
    var that = this;
    // this.setData({ isBluetoothConnection: wx.getStorageSync('isConnected') || false});
  },
  pair:function(){
    wx.navigateTo({
      url: '../pair/pair'
    })
  },
  ready:function(e){
    var that = this;
    if (that.data.isBluetoothConnection){
      wx.navigateTo({
        url: '../chooseMode/chooseMode'
      });
    }else{
      wx.navigateTo({
        url: '../pair/pair'
      })
    }
  },
  onShow: function(){
    console.log("index==onShow方法", wx.getStorageSync('isConnected') || false);
    this.setData({ isBluetoothConnection: wx.getStorageSync('isConnected') || false });
  }
})
