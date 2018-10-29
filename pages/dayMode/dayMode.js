const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: '1',
    modeTipsIndex1: '0',
    modeTipsIndex2: '0',
    tips: {
      mode1: ['T-sonic打开浸润通道,振动按摩并密集滋养肌肤。',
        'T-sonic打开浸润通道,振动按摩并密集滋养肌肤。2',
        'T-sonic打开浸润通道,振动按摩并密集滋养肌肤。3'],
      mode2: ['焕颜之旅即将结束，UFO正在缓慢减速，请放心使用。4',
        '焕颜之旅即将结束，UFO正在缓慢减速，请放心使用。5',
        '焕颜之旅即将结束，UFO正在缓慢减速，请放心使用。6']
    },
    isShowModeBtn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    var rad = Math.PI * 2 / 30, speed = 30, mode = 1, that = this;
    var context = wx.createCanvasContext('sec-canvas1');

    function drawCircle(context, n) {
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
      context.arc(28, 28, 25, -Math.PI / 2 + n * rad, -Math.PI / 2, true);
      context.stroke();
      context.closePath();
      context.restore();

      context.draw();
    }

    //动画循环
    (function drawFrame() {
      context.clearRect(0, 0, 60, 60);
      drawCircle(context, speed);
      if (speed < 1) {
        switchMode(mode);//TODO
        return;
      } else {
        //根据倒计时改变提示语
        if (speed == 15) {
          that.setData({
            modeTipsIndex1: '1',
          })
        } else if (speed == 2) {
          that.setData({
            modeTipsIndex1: '2',
          })
        }
        speed -= 1;
        setTimeout(function () {
          drawFrame();
        }, 1000);
      }
    }());

    function switchMode(mode) {
      if (mode == 1) {
        that.setData({
          mode: 2
        });
        var context = wx.createCanvasContext('sec-canvas2');
        rad = Math.PI * 2 / 60;
        speed = 60;
        mode = 2;
        //动画循环
        (function drawFrame() {
          context.clearRect(0, 0, 60, 60);
          drawCircle(context, speed);
          if (speed < 1) {
            that.setData({
              isShowModeBtn: true
            });
            return;
          } else {
            //根据倒计时改变提示语
            if (speed == 15) {
              that.setData({
                modeTipsIndex2: '1',
              })
            } else if (speed == 2) {
              that.setData({
                modeTipsIndex2: '2',
              })
            }
            speed -= 1;
            setTimeout(function () {
              drawFrame();
            }, 1000);
          }
        }());
      }
    }

  },
  stopSkinCare: function () {
    wx.redirectTo({
      url: '../end/end'
    });
    app.writeBLECharacteristicValue(app.globalData.deviceId, app.globalData.serviceId, app.globalData.characteristicId, 'A580');
  },
  reuseSkinCare: function () {
    wx.redirectTo({
      url: '../onready/onready?mode=dayMode'
    })
  },
  onHide: function () {
    var deviceId = wx.getStorageSync('deviceId') || '';
    app.writeBLECharacteristicValue(deviceId, app.globalData.serviceId, app.globalData.characteristicId, 'A580');
  }

})