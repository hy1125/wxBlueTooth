//app.js
App({

  /** 将String类型转化为ArrayBuffer */
  stringToArrayBuffer: function (str) {
    if (!str) {
      return new ArrayBuffer(0);
    }
    var buffer = new ArrayBuffer(str.length);
    let dataView = new DataView(buffer)
    let ind = 0;
    for (var i = 0, len = str.length; i < len; i += 2) {
      let code = parseInt(str.substr(i, 2), 16)
      dataView.setUint8(ind, code)
      ind++
    }
    return buffer;
  },

  /** 将16进制字符串转化为ArrayBuffer */
  hexStringToArrayBuffer: function (hexStr) {
    if (!hexStr) {
      return new ArrayBuffer(0);
    }
    var typedArray = new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }));
    var buffer = typedArray.buffer;
    return buffer;
  },

  /**写入数据 */
  writeBLECharacteristicValue: function (deviceId, serviceId, characterId_write, hexStr) {
    console.log('写入数据', hexStr)
    var that = this;
    var typedArray = new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }));
    var buffer = typedArray.buffer;

    // 监听蓝牙连接
    wx.onBLEConnectionStateChange(function (res) {
      console.log("监听蓝牙连接", res);
      if(!res.connected){
        wx.showModal({
          title: '提示',
          content: '设备蓝牙连接已断开，请重新连接蓝牙',
          showCancel: false,
          success: function (res) {
            wx.navigateTo({
              url: '../pair/pair'
            });
          }
        });
        return;
      }
    });

    //写入数据
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,//设备deviceId
      serviceId: serviceId,//设备service_id
      characteristicId: characterId_write,//设备write特征值
      value: buffer,//写入数据
      success: function (res) {
        console.log('发送数据:', res)
      }
    });
  },

  /**开启notify */
  openNotifyService: function (deviceId, serviceId, characterId_notify) {
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: deviceId,//蓝牙设备id
      serviceId: serviceId,//服务id
      characteristicId: characterId_notify,//服务特征值indicate
      success: function (res) {
        console.log('开启notify', res.errMsg)
        //监听低功耗蓝牙设备的特征值变化
        wx.onBLECharacteristicValueChange(function (res) {
          console.log('特征值变化', that.arrayBufferToHexString(res.value));
        });
      }
    })
  },

  /**读取蓝牙设备广播的值 */
  readBLECharacteristicValue: function (deviceId, serviceId, characterId_read) {
    wx.readBLECharacteristicValue ({
      deviceId: deviceId,//蓝牙设备id
      serviceId: serviceId,//服务id
      characteristicId: characterId_read,//服务特征值indicate
      success: function (res) {
        console.log('读取数据', res.errMsg)
        //监听低功耗蓝牙设备的特征值变化
        wx.onBLECharacteristicValueChange(function (res) {
          console.log('特征值变化', that.arrayBufferToHexString(res.value));
        });
      }
    })
  },

  onLaunch: function () {
    wx.removeStorageSync('deviceId');
    wx.removeStorageSync('isConnected');
    wx.removeStorageSync('modeType');

    // 设置屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });

    var that = this;
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter();

      that.globalData.deviceId = wx.getStorageSync('deviceId') || '';
      that.globalData.isConnected = wx.getStorageSync('isConnected') || false;
      
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onHide: function(){
    var that = this;
    wx.closeBLEConnection({
      deviceId: wx.getStorageSync('deviceId') || '',
      success: function (res) {
        console.log("已断开蓝牙",res);
      }
    })
    console.log("==========================", wx.getStorageSync('deviceId') || '哈哈哈');
    // wx.removeStorageSync('deviceId');
    wx.removeStorageSync('isConnected');
  },
  onShow: function(){
    //读取数据
    wx.readBLECharacteristicValue({
      deviceId: wx.getStorageSync('deviceId') || '',//蓝牙设备id
      serviceId: this.globalData.batteryServiceId,//服务id
      characteristicId: this.globalData.batteryCharacteristicId,//服务特征值indicate
      success: function (res) {
        console.log('TODO读取数据>>>>>>>', re)
        
      }
    })

    wx.onBLEConnectionStateChange(function (res) {
      console.log("监听蓝牙连接", res);
      if (!res.connected) {
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
  },
  globalData: {
    userInfo: null,
    isConnected: false,
    deviceId: '',
    serviceId: '0000FFE0-0000-1000-8000-00805F9B34FB',
    batteryServiceId: '0000180F-0000-1000-8000-00805F9B34FB', //蓝牙标准电量服务uuid
    batteryCharacteristicId: '00002A19-0000-1000-8000-00805F9B34FB', //蓝牙标准电量特征值uuid
    characteristicId: '0000FFE1-0000-1000-8000-00805F9B34FB'
  }
})