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
    var that = this;
    console.log('写入数据', hexStr)
    var that = this;
    var typedArray = new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }));
    var buffer = typedArray.buffer;

    //写入数据
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,//设备deviceId
      serviceId: that.globalData.serviceId,//设备service_id
      characteristicId: that.globalData.characteristicId,//设备write特征值
      value: buffer,//写入数据
      success: function (res) {
        console.log('发送数据:', res);
        if (hexStr == "A580" && !(wx.getStorageSync('isStarted') || false)){
          wx.closeBLEConnection({
            deviceId: wx.getStorageSync('deviceId') || '',
            success: function (res) {
              console.log("已断开蓝牙", res);
            }
          })
        }
      },
      fail(res){
        console.log('writeBLECharacteristicValue===fail发送数据:', res)
      }
    });

    // 监听蓝牙连接
    // wx.onBLEConnectionStateChange(function (res) {
    //   console.log("监听蓝牙连接", res);
    //   if (!res.connected) {
    //     wx.showModal({
    //       title: '提示',
    //       content: '设备蓝牙连接已断开，请重新连接蓝牙',
    //       showCancel: false,
    //       success: function (res) {
    //         wx.redirectTo({
    //           url: '../pair/pair'
    //         });
    //       }
    //     });
    //     return;
    //   }
    // });
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
        // wx.onBLECharacteristicValueChange(function (res) {
        //   console.log('特征值变化', that.arrayBufferToHexString(res.value));
        // });
      }
    })
  },

  /**读取蓝牙设备广播的值 */
  readBLECharacteristicValue: function (deviceId) {
    wx.readBLECharacteristicValue ({
      deviceId: deviceId,//蓝牙设备id
      serviceId: this.globalData.batteryServiceId,//服务id
      characteristicId: this.globalData.batteryCharacteristicId,//服务特征值indicate
      success: function (res) {
        //监听低功耗蓝牙设备的特征值变化
        wx.onBLECharacteristicValueChange(function (res) {
          var hex = Array.prototype.map.call(new Uint8Array(res.value), x => ('00' + x.toString(16)).slice(-2)).join('');
          if(parseInt(hex,16)<25){
            wx.showModal({
              title: '警告',
              content: '面膜仪电量过底，请尽快充电！！',
              showCancel: false,
              success: function (res) {
                // console.log("点击确认");
                wx.redirectTo({
                  url: '../lowBattery/lowBattery'
                });
              }
            })
          }
            console.log('特征值变化16进制值为====' + hex + '=====10进制值为---》' + parseInt(hex, 16));
        });
      },
      fail(res) {
        console.log('readBLECharacteristicValue===fail读取数据:', res)
      }
    })
  },

  /** 根据deiviceId获取设备的所有服务 */
  getService: function (deviceId, serviceId, callback) {
    var that = this;
    // 监听蓝牙连接
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
    // 获取蓝牙设备service值
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function (res) {
        console.log("获取设备的所有服务==", res);
        var services = res.services;
        for (var i = 0; i < services.length; i++) {
          if (services[i].uuid == serviceId) {
            console.log("获取设备的注服务", services[i].uuid);

            wx.getBLEDeviceCharacteristics({
              deviceId: deviceId,
              serviceId: services[i].uuid,
              success: function (res) {
                console.log("读取服务的特征值===》", res);
                if (callback) callback();
              },
              fail: function (err) {
                console.log("读取服务的特征值", err);
              },
              complete: function () {
                console.log('读取服务的特征值====complete');
              }
            })
          }
        }
      }
    })
  },

  onLaunch: function () {
    this.globalData.sysinfo = wx.getSystemInfoSync();
    wx.removeStorageSync('deviceId');
    wx.removeStorageSync('isConnected');
    wx.removeStorageSync('modeType');
    wx.removeStorageSync('isStarted');
    wx.removeStorageSync('timer');

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
  getModel: function () { //获取手机型号
    return this.globalData.sysinfo["model"]
  },
  getVersion: function () { //获取微信版本号
    return this.globalData.sysinfo["version"]
  },
  getSystem: function () { //获取操作系统版本
    return this.globalData.sysinfo["system"]
  },
  getPlatform: function () { //获取客户端平台
    return this.globalData.sysinfo["platform"]
  },
  getSDKVersion: function () { //获取客户端基础库版本
    return this.globalData.sysinfo["SDKVersion"]
  },
  onHide: function(){
    var that = this;
    console.log("==========================", wx.getStorageSync('deviceId') || '哈哈哈');
    // wx.removeStorageSync('deviceId');
    // wx.removeStorageSync('isConnected');
    wx.removeStorageSync('isStarted');
    wx.removeStorageSync('timer');
  },
  onShow: function(){
    if (this.getPlatform() == 'ios'){
      if (wx.getStorageSync('deviceId')) {
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
      }
    }else{
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
    }
  },
  globalData: {
    userInfo: null,
    isConnected: false,
    sysinfo:{},
    deviceId: '',
    serviceId: '0000FFE0-0000-1000-8000-00805F9B34FB',//"0000FFE0-0000-1000-8000-00805F9B34FB"
    batteryServiceId: '0000180F-0000-1000-8000-00805F9B34FB', //蓝牙标准电量服务uuid
    batteryCharacteristicId: '00002A19-0000-1000-8000-00805F9B34FB', //蓝牙标准电量特征值uuid
    characteristicId: '0000FFE1-0000-1000-8000-00805F9B34FB'
  }
})