// pages/ready/onready.js
const app = getApp()
var timer
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: "",
    modeType: "",
    btnType: "启动日间护肤",
    deviceId: '',
    isDisabled: false,
    bleConnect: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      modeType: wx.getStorageSync('modeType') || '',
      deviceId: wx.getStorageSync('deviceId') || ''
    });

    if (that.data.modeType == "nightMode") {
      that.setData({
        btnType: "启动夜间护肤"
      });
    } else {
      that.setData({
        btnType: "启动日间护肤"
      });
    }
  },
  switchMode: function(){
    wx.navigateTo({
      url: '../chooseMode/chooseMode'
    });
  },
  startSkinCare: function(){
    var time = 10;
    var that = this;
    
    wx.onBLEConnectionStateChange(function (res) {
      console.log("监听蓝牙连接", res);
      that.setData({
        bleConnect: res.connected
      });
      if (!res.connected) {
        clearTimeout(timer);
        wx.showModal({
          title: '提示',
          content: '设备蓝牙连接已断开，请重新连接蓝牙',
          showCancel: false,
          success: function (res) {
            wx.redirectTo({
              url: '../pair/pair?mode=BLEConnectionStateChange'
            });
          }
        });
        return;
      }
    });
    that.setData({
      isDisabled: true
    });
    console.log("===isConnected===>", wx.getStorageSync('isConnected') || false);
    if (wx.getStorageSync('isConnected') || false){
      if (that.data.modeType == "nightMode") {
        app.writeBLECharacteristicValue(that.data.deviceId, app.globalData.serviceId, app.globalData.characteristicId, 'A582');
      } else {
        app.writeBLECharacteristicValue(that.data.deviceId, app.globalData.serviceId, app.globalData.characteristicId, 'A581');
      }
      (function countDown() {
        if (time < 1) {
          that.setData({
            count: "0"
          });
          setTimeout(function () {
            if (that.data.modeType == "nightMode") {
              wx.reLaunch({
                url: '../nightMode/nightMode'
              });
            } else {
              wx.reLaunch({
                url: '../dayMode/dayMode'
              });
            }
          }, 2000);
          return;
        } else {
          that.setData({
            count: time
          });
          time -= 1;
          timer = setTimeout(function () {
            countDown();
          }, 1000);
        }
      }());
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    if (that.data.isDisabled){
      console.log("onHide=====onReady");
      var deviceId = wx.getStorageSync('deviceId') || '';
      app.writeBLECharacteristicValue(deviceId, app.globalData.serviceId, app.globalData.characteristicId, 'A580');
      
      app.getService(deviceId, app.globalData.serviceId, function () {
        wx.closeBLEConnection({
          deviceId: wx.getStorageSync('deviceId') || '',
          success: function (res) {
            console.log("已断开蓝牙", res);
          }
        });
      });
      clearTimeout(timer);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})