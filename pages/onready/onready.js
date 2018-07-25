// pages/ready/onready.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: "",
    isDisabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  startSkinCare: function(){
    var time = 10;
    var that = this;
    that.setData({
      isDisabled: true
    });
    (function countDown() {
      if (time < 1) {
        that.setData({
          count: ""
        });
        wx.navigateTo({
          url: '../nightMode/nightMode'
        });
        return;
      } else {
        that.setData({
          count: time
        });
        time -= 1;
        setTimeout(function () {
          countDown();
        }, 1000);
      }
    }());
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