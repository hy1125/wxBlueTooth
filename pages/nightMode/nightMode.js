// pages/nightMode/nightMode.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode:'1',
    modeTipsIndex1: '0',
    modeTipsIndex2: '0',
    tips: {
      mode1: ['即将开启UFO焕颜之旅',
        '使用UFO轻轻划过肌肤，将面膜精华均匀涂抹于面部。',
        '温热功能正在为您打开毛孔，舒缓的肌肤已准备享受面部SPA。',
        '请顺着肌肤纹理由里向外、由上至下轻轻推匀精华。',
        'T-sonic打开浸润通道,振动按摩并密集滋养肌肤。'],
      mode2: ['多光谱红光换活精华，修护日间损伤令肌肤弹力紧实。',
        '嘴角、鼻翼、面颊等干燥区可以增加使用时间，淡化细纹。',
        '请抬起下颚，由下至上为颈部进行护理。',
        '焕颜之旅即将结束，UFO正在缓慢减速，请放心使用。']
    },
    isShowModeBtn:false
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
    var rad = Math.PI * 2 / 30, speed = 30,mode = 1, that = this;
    var context = wx.createCanvasContext('sec-canvas1');

    function drawCircle(context,n) {
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
        if (speed == 24) {
          that.setData({
            modeTipsIndex1: '1',
          })
        } else if (speed == 18) {
          that.setData({
            modeTipsIndex1: '2',
          })
        } else if (speed == 12) {
          that.setData({
            modeTipsIndex1: '3',
          })
        } else if (speed == 6) {
          that.setData({
            modeTipsIndex1: '4',
          })
        }
        speed -= 1;
        setTimeout(function () {
          drawFrame();
        }, 1000);
      }
    }());

    function switchMode(mode){
      if(mode == 1){
        that.setData({
          mode:2
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
              isShowModeBtn:true
            });
            return;
          } else {
            //根据倒计时改变提示语
            if (speed == 35) {
              that.setData({
                modeTipsIndex2: '1',
              })
            } else if (speed == 20) {
              that.setData({
                modeTipsIndex2: '2',
              })
            } else if (speed == 5) {
              that.setData({
                modeTipsIndex2: '3',
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
  stopSkinCare : function(){
    wx.redirectTo({
      url: '../end/end'
    });
    var deviceId = wx.getStorageSync('deviceId') || '';
    app.writeBLECharacteristicValue(deviceId, app.globalData.serviceId, app.globalData.characteristicId, 'A580');
  },
  reuseSkinCare: function () {
    wx.redirectTo({
      url: '../chooseMode/chooseMode'
    });
    var deviceId = wx.getStorageSync('deviceId') || '';
    app.writeBLECharacteristicValue(deviceId, app.globalData.serviceId, app.globalData.characteristicId, 'A580');
  },
  onHide: function(){
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
  }

})