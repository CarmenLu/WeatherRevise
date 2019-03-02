var app = getApp();
import regeneratorRuntime from '../../utils/third-party/runtime' // eslint-disable-line
import { api } from '../../config/api'
import { request, login, authorize } from '../../utils/lib/request'
//若定位失败则显示出错
import { showError } from '../../utils/lib/error'
//使用wxrequest
import{wxRequest} from '../../utils/lib/wxApi.js'
Page({
  data: {
  },
  onLoad: function () {
    console.log('onLoad');
    var that = this;
    that.getLocation();
  },
  //经纬度
  getLocation:function(){
    var that = this;
    wx.getLocation({
        type:'wgs84',
        success(res){
          var latitude=res.latitude;
          var longtitude=res.longitude;
          console.log('lat：'+latitude+'long:'+longtitude);
          that.getCity(latitude,longtitude); 
        }
    })
    },
    //逆地址解析
    //当前定位城市
    async getCity(latitude,longtitude){
      var that = this;
      var url ="https://api.map.baidu.com/geocoder/v2/";
      var params={
        ak:"f1h0Tudq2CnFOCvXR9GnvFmSi5peEC2r",
        output:"json",
        location:latitude+","+longtitude
      };
      let res=await wxRequest({
        url:url,
        data: params
      })
      if(res.data.result!=null){
          var city = res.data.result.addressComponent.city;
          var district=res.data.result.addressComponent.district;
          var street=res.data.result.addressComponent.street;
          console.log(res.data.result);
        that.setData({
          city:city,
          district,district,
          street:street,
        })
        var data=that.data;
        that.getCityWeather(longtitude,latitude);
      
        }
        else {
          showError('查询地址失败，请重试')
        }
      },
    //当前城市天气
    async getCityWeather(long,la){
      var that=this;
      var url ="https://free-api.heweather.net/s6/weather";
      var params={
        location: long+","+la,
        key:"43e2e33eee5b47d7a5b41c9e481e1715",
      };
      let res = await wxRequest({
        url: url,
        data: params
      })
   if(res.data.HeWeather6[0]!=null){

          var nowWeather=res.data.HeWeather6[0].now;
          console.log(nowWeather);
          var daily_forecast=res.data.HeWeather6[0].daily_forecast;
          console.log(daily_forecast);
          that.setData({
            nowtmp:nowWeather.tmp,
            nowwea:{
              cond_code:nowWeather.cond_code,
              cond_txt:nowWeather.cond_txt,
            },
            daily_forecast:daily_forecast
          })
        }
        else{
          showError('查询失败，请重试');
        }
      },
    chooseCity:function(){
      var that=this;
      var isAuthorize;
      wx.getSetting({
        success(res){
var isAuthorize = res.authSetting['scope.userLocation'];
          if(!res.authSetting['scope.userLocation']){
            wx.authorize({
              scope:'scope.userLocation',
              success(){
   var isAuthorize = res.authSetting['scope.userLocation'];

            },
            fail(){
              showError('定位失败请重试');
            }
          })
        }
          if (isAuthorize) {
            wx.chooseLocation({
              success(res) {
                that.getCity(res.latitude, res.longitude);
                that.getCityWeather(res.longitude, res.latitude);
              },
              fail() {
                showError('显示天气失败，请重试')
              }
            })
          }}});
          }

})
  



