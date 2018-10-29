// pages/pair/pair.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log("页面加载");
    var deviceId, serviceId, characteristicId;
    var getConnectedTimer, connectDeviceIndex = 0;
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log("初始化蓝牙适配器成功",res);
        wx.showToast({
          title: '初始化成功',
        });
        that.getBluetoothAdapterState();
      },
      fail: function (res) {
        wx.showToast({
          title: '初始化失败',
        });
        console.log("初始化蓝牙适配器失败",res)
        wx.showModal({
          title: '提示',
          content: '请检查手机蓝牙是否打开',
          showCancel: false,
          success: function (res) {
            console.log("点击确认");
            wx.redirectTo({
              url: '../pair/pair'
            });
          }
        })
      }
    })
    
  },
  showGuide: function () {
    this.setData({ isShow: true});
  },
  closeGuide: function () {
    this.setData({ isShow: false});
  },

  /**获取本机蓝牙适配器状态 */
  getBluetoothAdapterState: function () {
    var that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        var available = res.available,
          discovering = res.discovering;
        if (!available) {
          wx.showToast({
            title: '设备无法开启蓝牙连接',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
        } else {
          if (!discovering) {
            that.startBluetoothDevicesDiscovery();
            that.getConnectedBluetoothDevices();
          }
        }
      }
    })
  },

  /***开始搜索蓝牙设备 */
  startBluetoothDevicesDiscovery: function () {
    var that = this;
    wx.showLoading({
      title: '蓝牙搜索中'
    });
    that.setData({ isShow: true });
    wx.startBluetoothDevicesDiscovery({
      services: [],
      allowDuplicatesKey: false,
      success: function (res) {
        console.log("success开始搜索蓝牙设备", res);
        if (!res.isDiscovering) {
          that.getBluetoothAdapterState();
        } else {
          console.log("========-开始搜索蓝牙设备");
          that.onBluetoothDeviceFound();
        }
      },
      fail: function (err) {
        console.log("fail开始搜索蓝牙设备",err);
      }
    });
  },

  /***停止搜索蓝牙设备 */
  stopBluetoothDevicesDiscovery: function(){
    var that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("停止搜索蓝牙设备",res);
        wx.hideLoading();
        wx.showToast({
          title: '停止搜索蓝牙设备',
        });
      }
    })
  },

  /*** 获取已配对的蓝牙设备 */
  getConnectedBluetoothDevices: function () {
    var that = this;
    console.log("=>获取处于连接状态的设备", app.globalData.serviceId);
    wx.getConnectedBluetoothDevices({
      services: [app.globalData.serviceId],
      success: function (res) {
        console.log("获取处于连接状态的设备", res);
        let deviceId = wx.getStorageSync("deviceId") || "";
        var flag = true, conDevList = [deviceId];
        console.log("conDevList====", conDevList);
        // var devices = res['devices'],
        //   flag = false,
        //   index = 0,
        //   conDevList = [];
        // console.log("??????",devices);
        //   devices.forEach(function (value, index, array) {
        //   if (value['name'].indexOf('UFOO') != -1) {
        //     // 如果存在包含UFOO字段的设备
        //     flag = true;
        //     index += 1;
        //     conDevList.push(value['deviceId']);
        //     that.deviceId = value['deviceId'];
        //     return;
        //   }
        // });
        if (deviceId) {
          that.connectDeviceIndex = 0;
          that.loopConnect(conDevList);
        } else {
          //TODO
          console.log("进来了",that.getConnectedTimer);
          if (!that.getConnectedTimer) {
            console.log("getConnectedTimer进来了", that.getConnectedTimer);
            that.getConnectedTimer = setTimeout(function () {
              that.getConnectedBluetoothDevices();
            }, 5000);
          }
        }
      },
      fail: function (err) {
        if (!that.getConnectedTimer) {
          that.getConnectedTimer = setTimeout(function () {
            that.getConnectedBluetoothDevices();
          }, 5000);
        }
      }
    });
  },

  /**开启蓝牙搜索功能成功后开启发现附近蓝牙设备事件监听 */
  onBluetoothDeviceFound: function () {
    var that = this;
    console.log(".......开启蓝牙搜索");
    wx.onBluetoothDeviceFound(function (res) {
      console.log("onBluetoothDeviceFound->获取设备信息",res);
      if (res.devices[0]) {
        var name = res.devices[0]['name'];
        if (name != '') {
          if (name.indexOf('UFOO') != -1) {
            var deviceId = res.devices[0]['deviceId'];
            that.deviceId = deviceId;
            console.log("设备Id",that.deviceId);
            that.startConnectDevices();
          }
        }
      }
    })
  },

  /**开启重新获取已配对蓝牙设备，并开启扫描附近蓝牙设备 */
  loopConnect: function (devicesId) {
    var that = this;
    var listLen = devicesId.length;
    console.log('已配对的设备小程>>>>>>', devicesId[that.connectDeviceIndex]);
    if (devicesId[that.connectDeviceIndex]) {
      this.deviceId = devicesId[that.connectDeviceIndex];
      this.startConnectDevices('loop', devicesId);
    } else {
      console.log('已配对的设备小程序蓝牙连接失败');
      that.startBluetoothDevicesDiscovery();
      that.getConnectedBluetoothDevices();
    }
  },

  /**开始匹配设备 */
  startConnectDevices: function (ltype, array) {
    var that = this;
    that.setData({ isShow: false });
    clearTimeout(that.getConnectedTimer);
    that.getConnectedTimer = null;
    clearTimeout(that.discoveryDevicesTimer);
    that.stopBluetoothDevicesDiscovery();
    this.isConnectting = true;
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: function (res) {
        if (res.errCode == 0) {
          console.log("匹配设备成功");
          wx.setStorageSync('deviceId', that.deviceId);
          wx.setStorageSync('isConnected', true);

          wx.redirectTo({
            url: '../onready/onready'
          });
          
        }
      },
      fail: function (err) {
        console.log('连接失败：', err);
        if (ltype == 'loop') {
          that.connectDeviceIndex += 1;
          that.loopConnect(array);
        } else {
          that.startBluetoothDevicesDiscovery();
          that.getConnectedBluetoothDevices();
        }
      },
      complete: function () {
        console.log("匹配设备完成");
        this.isConnectting = false;
      }
    });
  },

  /** 根据deiviceId获取设备的所有服务 */
  getService: function (deviceId) {
    var that = this;
    // 监听蓝牙连接
    wx.onBLEConnectionStateChange(function (res) {
      console.log("监听蓝牙连接",res);
    });
    // 获取蓝牙设备service值
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function (res) {
        console.log("获取设备的所有服务==", res);
        // that.getCharacter(deviceId, res.services);
        var services = res.services;
        var arr = [];
        for (var i = 0; i < services.length; i++){
          arr.push(services[i].uuid);
        }
        wx.setStorageSync("serviceIds", arr);
        // services.forEach(function (value, index, array) {
        //   if (value == that.serviceId) {
        //     that.serviceId = array[index];
        //   }
        // });
      }
    })
  },

  /**读取服务的特征值 */
  getCharacter: function (deviceId, services) {
    var that = this;
    var sevice = that.data.s1;
    services.forEach(function (value, index, array) {
      if (value == that.serviceId) {
        that.serviceId = array[index];
      }
    });
    wx.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: sevice,
      success: function (res) {
        console.log("读取服务的特征值===》", res);
        that.writeBLECharacteristicValue(that.data.d1, that.data.s1, that.data.c1);
        that.openNotifyService(that.data.d1, that.data.s1, that.data.c1);
      },
      fail: function (err) {
        console.log("读取服务的特征值",err);
      },
      complete: function () {
        console.log('读取服务的特征值====complete');
      }
    })
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