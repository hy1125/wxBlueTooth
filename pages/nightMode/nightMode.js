// pages/nightMode/nightMode.js
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
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('sec-canvas'),
      rad = Math.PI * 2 / 60, speed = 60;

    function drawCircle(n){
      context.save();
      context.beginPath();
      context.setStrokeStyle("#f5129c");
      context.setLineWidth(1);
      context.arc(28, 28, 25, 0, 2 * Math.PI, false);
      context.stroke();
      context.closePath();
      context.restore();

      context.save(); //save和restore可以保证样式属性只运用于该段canvas元素
      context.fillStyle = "#f5129c";
      context.font = "16px Arial";
      //绘制字体，并且指定位置
      context.fillText(n.toFixed(0) < 10 ? "0" + n.toFixed(0) : n.toFixed(0), 19, 25);
      context.fillText("sec", 16, 40);

      context.restore();

      context.save();
      context.beginPath();
      context.setStrokeStyle("#f5129c");
      context.setLineWidth(6);
      context.arc(28, 28, 25, -Math.PI / 2 + n * rad, -Math.PI / 2,  true);
      context.stroke();
      context.closePath();
      context.restore();

      context.draw();
    }

    //动画循环
    (function drawFrame() {
      context.clearRect(0, 0, 60, 60);
      drawCircle(speed);
      if (speed < 1) return;//TODO
      speed -= 1;
      setTimeout(function(){
        drawFrame();
      },1000);
    }());

    
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