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
    latitude: '',
    longitude: '',
    title:'',
    loading:false,
    disabled:false,
    xiaoQuName:'',
    money:'请选择小区',
    markers: [],
    btnType:'days',
    showVal:'',
    myTimer:null
  },
  onReady: function () {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'I26BZ-CKIK4-PU7UI-XH2BC-HQTXE-5RFNQ' // 必填
    });
    this.getLocation()
    this.startTimer('days')
  },
  startTimer(t){
    var that = this;
    // 时间倒计时
    var timer = setInterval(function () {
      that.leftTimer(t,2019, 5, 1, 9, 30, 0)
    }, 1000);
    that.setData({
      myTimer: timer
    })
  },
  stopTimer(){
    clearInterval(this.data.myTimer);
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
    that.setData({ //设置markers属性，将搜索结果显示在地图中
      title: name
    })
    fangjiatongDB.where({
      'name': db.RegExp({
        regexp: name.replace(/·/g,'').substr(0,3),
        //从搜索栏中获取的value作为规则进行匹配。
        options: 'i',
        //大小写不区分
      })}).get({
      success(res){
        var resMoney = '未找到，请查看周边'
        if(res.data.length > 0){
          resMoney = res.data[0].money + '元/㎡'
        }
        that.setData({ //设置markers属性，将搜索结果显示在地图中
          money: resMoney
        })
      }
    })
  },
  xiaoQuNameInput:function(e){
    this.setData({
      xiaoQuName:e.detail.value
    })
  },
  beginFind:function(e){
    var that = this;
    that.setData({
      disabled:true,
      loading:true
    })
    var name = that.data.xiaoQuName;
    fangjiatongDB.where({
      'name': db.RegExp({
        regexp: name.replace(/·/g, '').substr(0, 3),
        //从搜索栏中获取的value作为规则进行匹配。
        options: 'i',
        //大小写不区分
      })
    }).get({
      success(res) {
        var resMoney = '未找到，请查看周边'
        if (res.data.length > 0) {
          resMoney = res.data[0].money + '元/㎡'
        }
        that.setData({ //设置markers属性，将搜索结果显示在地图中
          money: resMoney,
          title: name,
          disabled: false,
          loading: false
        })
      }
    })
    that.beginFindLatitudeAndLongitude(name)
  },
  beginFindLatitudeAndLongitude(val) {
    var _this = this;
    //调用地址解析接口
    qqmapsdk.geocoder({
      //获取表单传入地址
      address: val, //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
      success: function (res) {//成功后的回调
        console.info(1111111)
        console.log(res);
        var res = res.result;
        var latitude = res.location.lat;
        var longitude = res.location.lng;
        //根据地址解析在地图上标记解析地址位置
        // _this.setData({ // 获取返回结果，放到markers及poi中，并在地图展示
        //   markers: [{
        //     id: 0,
        //     title: res.title,
        //     latitude: latitude,
        //     longitude: longitude,
        //     iconPath: './resources/placeholder.png',//图标路径
        //     width: 20,
        //     height: 20,
        //     callout: { //可根据需求是否展示经纬度
        //       content: latitude + ',' + longitude,
        //       color: '#000',
        //       display: 'ALWAYS'
        //     }
        //   }],
        //   poi: { //根据自己data数据设置相应的地图中心坐标变量名称
        //     latitude: latitude,
        //     longitude: longitude
        //   }
        // });
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },
  leftTimer:function (type,year, month, day, hour, minute, second) {
    var that = this;
    var leftTime = (new Date(year, month - 1, day, hour, minute, second)) - (new Date()); //计算剩余的毫秒数 
    var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
    var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
    var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
    var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 
    switch (type) {
      case 'days':
        that.setData({ showVal: `${days}天${hours}小时${minutes}分${seconds}秒` })
        break;
      case 'hours':
        that.setData({ showVal: `${days*24+hours}小时${minutes}分${seconds}秒` })
        break;
      case 'minutes':
        that.setData({ showVal: `${(days * 24 + hours)*60+minutes}分${seconds}秒` })
        break;
      case 'seconds':
        that.setData({ showVal: `${parseInt(leftTime/1000,10)}秒` })
        break;
      default:
        that.setData({ showVal: `${days}天${hours}小时${minutes}分${seconds}秒` })
        break;
    }
     
  },
  goday: function (e){
    var that = this;
    this.setData({
      btnType: e.currentTarget.dataset.btntype
    })
    that.stopTimer()
    that.startTimer(e.currentTarget.dataset.btntype)
  }
})