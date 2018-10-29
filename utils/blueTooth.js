/**获取本机蓝牙适配器状态 */
getBluetoothAdapterState => {
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
}

/***开始搜索蓝牙设备 */
startBluetoothDevicesDiscovery => {
  var that = this;
  wx.showLoading({
    title: '蓝牙搜索'
  });
  wx.startBluetoothDevicesDiscovery({
    services: [],
    allowDuplicatesKey: false,
    success: function (res) {
      if (!res.isDiscovering) {
        that.getBluetoothAdapterState();
      } else {
        that.onBluetoothDeviceFound();
      }
    },
    fail: function (err) {
      console.log(err);
    }
  });
}

/***获取已配对的蓝牙设备 */
getConnectedBluetoothDevices => {
  var that = this;
  wx.getConnectedBluetoothDevices({
    services: [that.serviceId],
    success: function (res) {
      console.log("获取处于连接状态的设备", res);
      var devices = res['devices'],
        flag = false,
        index = 0,
        conDevList = [];
      devices.forEach(function (value, index, array) {
        if (value['name'].indexOf('UFOO') != -1) {
          // 如果存在包含UFOO字段的设备
          flag = true;
          index += 1;
          conDevList.push(value['deviceId']);
          that.deviceId = value['deviceId'];
          return;
        }
      });
      if (flag) {
        this.connectDeviceIndex = 0;
        that.loopConnect(conDevList);
      } else {
        if (!this.getConnectedTimer) {
          that.getConnectedTimer = setTimeout(function () {
            that.getConnectedBluetoothDevices();
          }, 5000);
        }
      }
    },
    fail: function (err) {
      if (!this.getConnectedTimer) {
        that.getConnectedTimer = setTimeout(function () {
          that.getConnectedBluetoothDevices();
        }, 5000);
      }
    }
  });
}

/**开启蓝牙搜索功能成功后开启发现附近蓝牙设备事件监听 */
onBluetoothDeviceFound => {
  var that = this;
  console.log('onBluetoothDeviceFound');
  wx.onBluetoothDeviceFound(function (res) {
    console.log('new device list has founded')
    console.log(res);
    if (res.devices[0]) {
      var name = res.devices[0]['name'];
      if (name != '') {
        if (name.indexOf('UFOO') != -1) {
          var deviceId = res.devices[0]['deviceId'];
          that.deviceId = deviceId;
          console.log(that.deviceId);
          that.startConnectDevices();
        }
      }
    }
  })
}

/**开始匹配设备 */
const startConnectDevices = (ltype, array) => {
  var that = this;
  clearTimeout(that.getConnectedTimer);
  that.getConnectedTimer = null;
  clearTimeout(that.discoveryDevicesTimer);
  that.stopBluetoothDevicesDiscovery();
  this.isConnectting = true;
  wx.createBLEConnection({
    deviceId: that.deviceId,
    success: function (res) {
      if (res.errCode == 0) {
        setTimeout(function () {
          that.getService(that.deviceId);
        }, 5000)
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
      console.log('complete connect devices');
      this.isConnectting = false;
    }
  });
}

/** 根据deiviceId获取设备的所有服务 */
const getService = deviceId => {
  var that = this;
  // 监听蓝牙连接
  wx.onBLEConnectionStateChange(function (res) {
    console.log(res);
  });
  // 获取蓝牙设备service值
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success: function (res) {
      that.getCharacter(deviceId, res.services);
    }
  })
}

/**读取服务的特征值 */
const getCharacter = (deviceId, services) => {
  var that = this;
  services.forEach(function (value, index, array) {
    if (value == that.serviceId) {
      that.serviceId = array[index];
    }
  });
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: that.serviceId,
    success: function (res) {
      that.writeBLECharacteristicValue(deviceId, that.serviceId, that.characterId_write);
      that.openNotifyService(deviceId, that.serviceId, that.characterId_read);
    },
    fail: function (err) {
      console.log(err);
    },
    complete: function () {
      console.log('complete');
    }
  })
}

/**开启重新获取已配对蓝牙设备，并开启扫描附近蓝牙设备 */
const loopConnect = devicesId => {
  var that = this;
  var listLen = devicesId.length;
  if (devicesId[this.connectDeviceIndex]) {
    this.deviceId = devicesId[this.connectDeviceIndex];
    this.startConnectDevices('loop', devicesId);
  } else {
    console.log('已配对的设备小程序蓝牙连接失败');
    that.startBluetoothDevicesDiscovery();
    that.getConnectedBluetoothDevices();
  }
}

const hexStringToArrayBuffer = str => {
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
}

/**写入数据 */
const writeBLECharacteristicValue = (deviceId, serviceId, characterId_read) => {
  let buffer = that.hexStringToArrayBuffer(ArrayBuffer);
  //写入数据
  wx.writeBLECharacteristicValue({
    deviceId: deviceId,//设备deviceId
    serviceId: serviceId,//设备service_id
    characteristicId: characterId_read,//设备write特征值
    value: buffer,//写入数据
    success: function (res) {
      console.log('发送数据:', res.errMsg)
    }
  });
}

/**开启notify */
const openNotifyService = (deviceId, serviceId, characterId_write) => {
  wx.notifyBLECharacteristicValueChange({
    state: true, // 启用 notify 功能
    deviceId: deviceId,//蓝牙设备id
    serviceId: serviceId,//服务id
    characteristicId: characterId_write,//服务特征值indicate
    success: function (res) {
      console.log('开启notify', res.errMsg)
      //监听低功耗蓝牙设备的特征值变化
      wx.onBLECharacteristicValueChange(function (res) {
        console.log('特征值变化', that.arrayBufferToHexString(res.value));
      })
      //写入数据

    }
  })
}