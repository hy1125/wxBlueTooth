// pages/lowBattery/lowBattery.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var deviceId = wx.getStorageSync('deviceId') || '';
    app.writeBLECharacteristicValue(deviceId, app.globalData.serviceId, app.globalData.characteristicId, 'A583');
    wx.removeStorageSync('isConnected');
  },
  stopSkinCare: function () {
    wx.switchTab({
      url: '../index/index'
    });
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
    wx.onBLEConnectionStateChange(function (res) {
      console.log("监听蓝牙连接", res);
      if (!res.connected) {
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
          }
        })
        
        return;
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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