var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
wx.cloud.init({
  env: 'fangjiatong-e6814a'
})
const db = wx.cloud.database({
  env: 'fangjiatong-e6814a'
})
const fangjiatongDB = db.collection('name_money')

Page({
  data: {
    latitude: 45.76021,
    longitude: 126.66837,
    title:'loading',
    money:'未查到',
    markers: [],
    // polyline: [{
    //   points: [{
    //     longitude: 113.3245211,
    //     latitude: 23.10229
    //   }, {
    //     longitude: 113.324520,
    //     latitude: 23.21229
    //   }],
    //   color: '#FF0000DD',
    //   width: 2,
    //   dottedLine: true
    // }],
    // controls: [{
    //   id: 1,
    //   iconPath: '/resources/location.png',
    //   position: {
    //     left: 0,
    //     top: 300 - 50,
    //     width: 50,
    //     height: 50
    //   },
    //   clickable: true
    // }]
  },
  onReady: function () {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'I26BZ-CKIK4-PU7UI-XH2BC-HQTXE-5RFNQ' // 必填
    });
    this.getLocation()
  },
  regionchange(e) {
    e.type == 'end' ? this.getLngLat() : '';
  },
  getLngLat() {
    let that = this;
    this.mapCtx = wx.createMapContext("map");  //与xml里面的<map id="{{map}}">相对应
    this.mapCtx.getCenterLocation({
      success: function (res) {
         that.getPlaceInfo(res.longitude, res.latitude)
      }
    })
  },
  getLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',//默认为 wgs84 返回 gps 坐标，gcj02 返回可用于wx.openLocation的坐标
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
        that.getPlaceInfo(res.longitude, res.latitude)
        // that.latitude = res.latitude
        // that.longitude = res.longitude
        console.log(res)
      }
    })
  },
  getPlaceInfo: function (longitude, latitude){
    var that = this;
    qqmapsdk.search({
      keyword: '小区',  //搜索关键词
      // get_poi:1,
      auto_extend:1,
      page_size:10,
      location: latitude + ',' + longitude,  //设置周边搜索中心点
      success: function (res) { //搜索成功后的回调
      console.info(res)
        var mks = []
        for (var i = 0; i < res.data.length; i++) {
          mks.push({ // 获取返回结果，放到mks数组中
            title: res.data[i].title,
            id: res.data[i].id,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
            iconPath: "/img/tt.png", //图标路径
            width: 20,
            height: 20,
          
          })
        }
        that.setData({ //设置markers属性，将搜索结果显示在地图中
          markers: mks,
          // title:res.data[0].title
        })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  markertap:function(e){
    var that = this;
    var markerId = e.markerId
    var name = ''
    e.target.dataset.id.map(function(n){
      if(n.id == markerId){
        name = n.title
        return;
      }
    })
    console.info(name)
    fangjiatongDB.where({'name':name}).get({
      success(res){
        console.info(res)
        that.setData({ //设置markers属性，将搜索结果显示在地图中
          money: res.data[0].money,
          // title:res.data[0].title
        })
      }
    })
  }
})