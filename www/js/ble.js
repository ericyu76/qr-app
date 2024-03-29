/* global  bluetoothle, setTimeout, clearTimeout,window */
'use strict';

var addressKey = "address";

var tiCensorTagDeviceGeneralUuid = "5F603DE9-1526-C526-0EB5-6F9857A6EBC0";

var heartRateServiceUuid = "180d";
var heartRateMeasurementCharacteristicUuid = "2a37";
var clientCharacteristicConfigDescriptorUuid = "2902";
var batteryServiceUuid = "180f";
var batteryLevelCharacteristicUuid = "2a19";

//Ti Sensor Tag Services

var service = {
  serviceUuid: '',
  serviceDesc: '',
  characteristicsUuids: [],
  descriptors: ''
};

var bleServices =[];

var deviceInfoServiceUuid='180a';
var tempServiceUuid='f000aa00-0451-4000-b000-000000000000';
var accelserviceUuid='f000aa10-0451-4000-b000-000000000000';
var humidServiceUuid='f000aa20-0451-4000-b000-000000000000';
var magnServiceUuid='f000aa30-0451-4000-b000-000000000000';
var baromServiceUuid='f000aa40-0451-4000-b000-000000000000';
var gyroServiceUuid='f000aa50-0451-4000-b000-000000000000';
var keyStateServiceUuid='ffe0';
var testServiceUuid='f000aa60-0451-4000-b000-000000000000';
var connServiceUuid='f000ccc0-0451-4000-b000-000000000000';
var imgIdentifyServiceUuid='f000ffc0-0451-4000-b000-000000000000';

var tempServiceNotifyCharcUuid = 'f000aa01-0451-4000-b000-000000000000';
var tempServiceCtrlCharcUuid = 'f000aa02-0451-4000-b000-000000000000';

var scanTimer = null;
var connectTimer = null;
var reconnectTimer = null;

var iOSPlatform = "iOS";
var androidPlatform = "Android";
var myDefered;

function discoverDevices(defered){
  myDefered = defered;
  bluetoothle.isInitialized(isInitializedCallback);
}

function isInitializedCallback(obj){
  var isInitialized = obj.isInitalized;
  if(isInitialized){
    var address = window.localStorage.getItem(addressKey);
    // not to remember address
    address = null;

    if (address === null)
    { 
        console.log("No existed address, start to initial ble.");
        console.log("Bluetooth initialized successfully, starting scan for censor devices.");
        var paramsObj = {"serviceUuids":[]}; //left blank to sscan all
        bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
    }
    else
    {
        console.log("connect to address: "+address);
        connectDevice(address);
    }
  }else{
    var param = {"request":true};
    bluetoothle.initialize(initializeSuccess, initializeError, param);
  }
}


function initializeSuccess(obj)
{
  console.log("initSuccess...");
  if (obj.status == "enabled")
  {
    var address = window.localStorage.getItem(addressKey);
    
    // not to remember address
    address = null;

    if (address === null)
    { 
        console.log("No existed address, start to initial ble.");
        console.log("Bluetooth initialized successfully, starting scan for censor devices.");
        var paramsObj = {"serviceUuids":[]}; //left blank to sscan all
        bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
    }
    else
    {
        console.log("connect to address: "+address);
        connectDevice(address);
    }
  }
  else
  {
    console.log("Unexpected initialize status: " + obj.status);
  }
}

function initializeError(obj)
{
  console.log("Initialize error: " + obj.error + " - " + obj.message);
}

function startScanSuccess(obj)
{
  if (obj.status == "scanResult")
  {
    console.log("scaned device:"+ obj.name +" rssi="+obj.rssi + " address=" +obj.address);
    var devices = 
    [{ id: 0, name: obj.name, address: obj.address, rssi:obj.rssi }];
    myDefered.notify(devices);
    console.log("Stopping scan..");
    bluetoothle.stopScan(stopScanSuccess, stopScanError);
    clearScanTimeout();
    

    // window.localStorage.setItem(addressKey, obj.address);
    connectDevice(obj.address);
  }
  else if (obj.status == "scanStarted")
  {
    console.log("Scan was started successfully, stopping in 10");
    scanTimer = setTimeout(scanTimeout, 10000);
  }
  else
  {
    console.log("Unexpected start scan status: " + obj.status);
  }
}

function startScanError(obj)
{
  console.log("Start scan error: " + obj.error + " - " + obj.message);
}

function scanTimeout()
{
  console.log("Scanning time out, stopping");
  bluetoothle.stopScan(stopScanSuccess, stopScanError);
}

function clearScanTimeout()
{ 
    console.log("Clearing scanning timeout");
  if (scanTimer !== null)
  {
    clearTimeout(scanTimer);
  }
}

function stopScanSuccess(obj)
{
  if (obj.status == "scanStopped")
  {
    console.log("Scan was stopped successfully");
  }
  else
  {
    console.log("Unexpected stop scan status: " + obj.status);
  }
}

function stopScanError(obj)
{
  console.log("Stop scan error: " + obj.error + " - " + obj.message);
}

function connectDevice(address)
{
  console.log("Begining connection to: " + address + " with 5 second timeout");
    var paramsObj = {"address":address};
  bluetoothle.connect(connectSuccess, connectError, paramsObj);
  connectTimer = setTimeout(connectTimeout, 5000);
}

function connectSuccess(obj)
{
  if (obj.status == "connected")
  {
    console.log("Connected to : " + obj.name + " - " + obj.address);

    clearConnectTimeout();

    tempDisconnectDevice();
  }
  else if (obj.status == "connecting")
  {
    console.log("Connecting to : " + obj.name + " - " + obj.address);
  }
    else
  {
    console.log("Unexpected connect status: " + obj.status);
    clearConnectTimeout();
  }
}

function connectError(obj)
{
  console.log("Connect error: " + obj.error + " - " + obj.message);
  clearConnectTimeout();
}

function connectTimeout()
{
  console.log("Connection timed out");
}

function clearConnectTimeout()
{ 
    console.log("Clearing connect timeout");
  if (connectTimer !== null)
  {
    clearTimeout(connectTimer);
  }
}

function tempDisconnectDevice()
{
  console.log("Disconnecting from device to test reconnect");
    bluetoothle.disconnect(tempDisconnectSuccess, tempDisconnectError);
}

function tempDisconnectSuccess(obj)
{
    if (obj.status == "disconnected")
    {
        console.log("Temp disconnect device and reconnecting in 1 second. Instantly reconnecting can cause issues");
        setTimeout(reconnect, 1000);
    }
    else if (obj.status == "disconnecting")
    {
        console.log("Temp disconnecting device");
    }
    else
  {
    console.log("Unexpected temp disconnect status: " + obj.status);
  }
}

function tempDisconnectError(obj)
{
  console.log("Temp disconnect error: " + obj.error + " - " + obj.message);
}

function reconnect()
{
  console.log("Reconnecting with 5 second timeout");
  bluetoothle.reconnect(reconnectSuccess, reconnectError);
  reconnectTimer = setTimeout(reconnectTimeout, 5000);
}

function reconnectSuccess(obj)
{
  if (obj.status == "connected")
  {
    console.log("Reconnected to : " + obj.name + " - " + obj.address);

    clearReconnectTimeout();

    if (window.device.platform == iOSPlatform)
    {
      console.log("Discovering services...");
      var paramsObj = {"serviceUuids":[]};
      bluetoothle.services(servicesServicesSuccess, servicesHeartError, paramsObj);
    }
    else if (window.device.platform == androidPlatform)
    {
      console.log("Beginning discovery");
      bluetoothle.discover(discoverSuccess, discoverError);
    }
  }
  else if (obj.status == "connecting")
  {
    console.log("Reconnecting to : " + obj.name + " - " + obj.address);
  }
  else
  {
    console.log("Unexpected reconnect status: " + obj.status);
    disconnectDevice();
  }
}

function reconnectError(obj)
{
  console.log("Reconnect error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function reconnectTimeout()
{
  console.log("Reconnection timed out");
}

function clearReconnectTimeout()
{ 
    console.log("Clearing reconnect timeout");
  if (reconnectTimer !== null)
  {
    clearTimeout(reconnectTimer);
  }
}

function servicesServicesSuccess(obj)
{
  if (obj.status == "discoveredServices")
  {
    var serviceUuids = obj.serviceUuids;

    console.log("Finding characteristics");
    // 找到全部的 characteristics
    for(var i=0; i < serviceUuids.length; i++){
      var serviceUuid = serviceUuids[i];
      if(serviceUuid.toUpperCase() == tempServiceUuid.toUpperCase()){
          bleServices.push(service);
          var paramsObj = {"serviceUuid":tempServiceUuid, 
          "characteristicUuids":[]};
          bluetoothle.characteristics(characteristicsSuccess, characteristicsHeartError, paramsObj);
          return;
      }
    }
    
    console.log("Error: heart rate service not found");
  }
    else
  {
    console.log("Unexpected services heart status: " + obj.status);
  }
  //disconnectDevice();
}

function servicesHeartError(obj)
{
  console.log("Services heart error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function characteristicsSuccess(obj)
{
  if (obj.status == "discoveredCharacteristics")
  {
    console.log("in discoveredCharacteristics");
    var characteristicUuids = obj.characteristicUuids;
    var serviceUuid = obj.serviceUuid;
    for (var i = 0; i < characteristicUuids.length; i++)
    {
      console.log("Characteristics found: "+ characteristicUuids[i]);
      var characteristicUuid = characteristicUuids[i];

      if(characteristicUuid == tempServiceNotifyCharcUuid){

          //write 0x01 to turn on the notify
          var writevalue = bluetoothle.bytesToEncodedString([0x01]);
          var writeParamsObj = {"value": writevalue, 
                                   "serviceUuid":serviceUuid, 
                                   "characteristicUuid":tempServiceCtrlCharcUuid};
          bluetoothle.write(writeSuccess, writeError, writeParamsObj);


          console.log("Subscribing to heart rate for 50 seconds");
          var paramsObj = {"serviceUuid":serviceUuid, "characteristicUuid":tempServiceNotifyCharcUuid};
          bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
          setTimeout(unsubscribeDevice, 50000);
          return;
      }
    }
    console.log("Error: Temperature measurement characteristic not found.");
  }
    else
  {
    console.log("Unexpected characteristics heart status: " + obj.status);
  }
  // disconnectDevice();
}

function characteristicsHeartError(obj)
{
  console.log("Characteristics heart error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}


function writeSuccess(obj){
  console.log("Write success. "+ obj.status);
}

function writeError(obj){
  thisDeferred.reject('(01)藍牙寫入失敗');
  console.log("Write error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function descriptorsHeartSuccess(obj)
{
  if (obj.status == "discoveredDescriptors")
  {
    console.log("Discovered heart descriptors, now discovering battery service");
    var paramsObj = {"serviceUuids":[batteryServiceUuid]};
    bluetoothle.services(servicesBatterySuccess, servicesBatteryError, paramsObj);
  }
    else
  {
    console.log("Unexpected descriptors heart status: " + obj.status);
    disconnectDevice();
  }
}

function descriptorsHeartError(obj)
{
  console.log("Descriptors heart error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function servicesBatterySuccess(obj)
{
  if (obj.status == "discoveredServices")
  {
    var serviceUuids = obj.serviceUuids;
    for (var i = 0; i < serviceUuids.length; i++)
    {
      var serviceUuid = serviceUuids[i];

      if (serviceUuid == batteryServiceUuid)
      {
        console.log("Found battery service, now finding characteristic");
        var paramsObj = {"serviceUuid":batteryServiceUuid, "characteristicUuids":[batteryLevelCharacteristicUuid]};
        bluetoothle.characteristics(characteristicsBatterySuccess, characteristicsBatteryError, paramsObj);
        return;
      }
    }
    console.log("Error: battery service not found");
  }
    else
  {
    console.log("Unexpected services battery status: " + obj.status);
  }
  disconnectDevice();
}

function servicesBatteryError(obj)
{
  console.log("Services battery error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function characteristicsBatterySuccess(obj)
{
  if (obj.status == "discoveredCharacteristics")
  {
    var characteristicUuids = obj.characteristicUuids;
    for (var i = 0; i < characteristicUuids.length; i++)
    {
      var characteristicUuid = characteristicUuids[i];

      if (characteristicUuid == batteryLevelCharacteristicUuid)
      {
        readBatteryLevel();
        return;
      }
    }
    console.log("Error: Battery characteristic not found.");
  }
    else
  {
    console.log("Unexpected characteristics battery status: " + obj.status);
  }
  disconnectDevice();
}

function characteristicsBatteryError(obj)
{
  console.log("Characteristics battery error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function discoverSuccess(obj)
{
    if (obj.status == "discovered")
    {
        console.log("Discovery completed");

    readBatteryLevel();
  }
  else
  {
    console.log("Unexpected discover status: " + obj.status);
    disconnectDevice();
  }
}

function discoverError(obj)
{
  console.log("Discover error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function readBatteryLevel()
{
  console.log("Reading battery level");
  var paramsObj = {"serviceUuid":batteryServiceUuid, "characteristicUuid":batteryLevelCharacteristicUuid};
  bluetoothle.read(readSuccess, readError, paramsObj);
}

function readSuccess(obj)
{
    if (obj.status == "read")
    {
        var bytes = bluetoothle.encodedStringToBytes(obj.value);
        console.log("Battery level: " + bytes[0]);

        console.log("Subscribing to heart rate for 5 seconds");
        var paramsObj = {"serviceUuid":heartRateServiceUuid, "characteristicUuid":heartRateMeasurementCharacteristicUuid};
        bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
        setTimeout(unsubscribeDevice, 5000);
    }
    else
  {
    console.log("Unexpected read status: " + obj.status);
    disconnectDevice();
  }
}

function readError(obj)
{
  console.log("Read error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function subscribeSuccess(obj)
{   
    if (obj.status == "subscribedResult")
    {
        console.log("Subscription data received, value="+ obj.value);
        //Parse array of int32 into uint8
        var bytes = bluetoothle.encodedStringToBytes(obj.value);
        console.log(bytes);


        //Check for data
        if (bytes.length === 0)
        {
            console.log("Subscription result had zero length data");
            return;
        }

        //Get the first byte that contains flags
        var flag = bytes[0];

        //Check if u8 or u16 and get heart rate
        var hr;
        if ((flag & 0x01) == 1)
        {
            var u16bytes = bytes.buffer.slice(1, 3);
            var u16 = new Uint16Array(u16bytes)[0];
            hr = u16;
        }
        else
        {
            var u8bytes = bytes.buffer.slice(1, 2);
            var u8 = new Uint8Array(u8bytes)[0];
            hr = u8;
        }
        console.log("Temperature: " + hr);
    }
    else if (obj.status == "subscribed")
    {
        console.log("Subscription started");
    }
    else
  {
    console.log("Unexpected subscribe status: " + obj.status);
    //disconnectDevice();
  }
}

function subscribeError(msg)
{
  console.log("Subscribe error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function unsubscribeDevice()
{
  console.log("Unsubscribing heart service");
  var paramsObj = {"serviceUuid":heartRateServiceUuid, "characteristicUuid":heartRateMeasurementCharacteristicUuid};
  bluetoothle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
  return myDefered.promise;
}

function unsubscribeSuccess(obj)
{
    if (obj.status == "unsubscribed")
    {
        console.log("Unsubscribed device");

        console.log("Reading client configuration descriptor");
        var paramsObj = {"serviceUuid":heartRateServiceUuid, "characteristicUuid":heartRateMeasurementCharacteristicUuid, "descriptorUuid":clientCharacteristicConfigDescriptorUuid};
        bluetoothle.readDescriptor(readDescriptorSuccess, readDescriptorError, paramsObj);
    }
    else
  {
    console.log("Unexpected unsubscribe status: " + obj.status);
    disconnectDevice();
  }
}

function unsubscribeError(obj)
{
  console.log("Unsubscribe error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function readDescriptorSuccess(obj)
{
    if (obj.status == "readDescriptor")
    {
        var bytes = bluetoothle.encodedStringToBytes(obj.value);
        var u16Bytes = new Uint16Array(bytes.buffer);
        console.log("Read descriptor value: " + u16Bytes[0]);
        disconnectDevice();
    }
    else
  {
    console.log("Unexpected read descriptor status: " + obj.status);
    disconnectDevice();
  }
}

function readDescriptorError(obj)
{
  console.log("Read Descriptor error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function disconnectDevice()
{
  bluetoothle.disconnect(disconnectSuccess, disconnectError);
}

function disconnectSuccess(obj)
{
    if (obj.status == "disconnected")
    {
        console.log("Disconnect device");
        closeDevice();
    }
    else if (obj.status == "disconnecting")
    {
        console.log("Disconnecting device");
    }
    else
  {
    console.log("Unexpected disconnect status: " + obj.status);
  }
}

function disconnectError(obj)
{
  console.log("Disconnect error: " + obj.error + " - " + obj.message);
}

function closeDevice()
{
  bluetoothle.close(closeSuccess, closeError);
}

function closeSuccess(obj)
{
    if (obj.status == "closed")
    {
        console.log("Closed device");
    }
    else
  {
    console.log("Unexpected close status: " + obj.status);
  }
}

function closeError(obj)
{
  console.log("Close error: " + obj.error + " - " + obj.message);
}
