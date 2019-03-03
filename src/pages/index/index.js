var app = getApp();
import regeneratorRuntime from '../../utils/third-party/runtime' // eslint-disable-line
import { api } from '../../config/api'
import { request, login, authorize } from '../../utils/lib/request'
//若定位失败则显示出错
import { showError } from '../../utils/lib/error'
//使用wxrequest
import{wxRequest} from '../../utils/lib/wxApi.js'
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  data: {
  },
  
  onLoad: function () {
    console.log('onLoad');
    var that = this;
    qqmapsdk = new QQMapWX({
      key: 'VV7BZ-MDH3W-WYKRJ-OEW4W-KUV6S-XSFRM'
    });
    that.getAthuorize();
  },
  
  getAthuorize: function () {
    var that = this;
    var isAthuorize;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              console.log('success');
              that.getLocation();
            },
            fail(error) {
              console.log(error);
              wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权,将无法正常显示所在地天气情况,点击确定重新获取授权。',
                success(res) {
                  console.log('确定');
                  console.log(res.confirm);
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        console.log(res);
                        if (res.authSetting['scope.userLocation']) {
                          wx.authorize({
                            scope: 'scope.userLocation',
                            success() {
                              console.log('success');
                              that.getLocation();
                            },
                            fail(error) {
                              console.log(error);
                            }
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          that.getLocation();
        }
      }
    });

  },
  //经纬度
  getLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        var latitude = res.latitude;
        var longtitude = res.longitude;
        console.log('lat：' + latitude + 'long:' + longtitude);
        that.getCity(latitude, longtitude);
      }
    })
  },
    //逆地址解析
    //当前定位城市
  getCity: function (latitude, longtitude) {
    var that = this;
    qqmapsdk.reverseGeocoder({
      location: latitude + "," + longtitude,
      success(res) {
        console.log(res);
        var city = res.result.address_component.city;
        var district = res.result.address_component.district;
        var street = res.result.address_component.street;
        console.log(res.result);
        that.setData({
          city: city,
          district, district,
          street: street,
        })
        var data = that.data;
        that.getCityWeather(longtitude, latitude);

      },
      fail(error) {
        console.log(error);
      }
    })
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
          var daily_forecast=res.data.HeWeather6[0].daily_forecast.slice(1,8);
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
            wx.chooseLocation({
              success(res) {
                that.getCity(res.latitude, res.longitude);
                that.getCityWeather(res.longitude, res.latitude);
              },
              fail() {
                showError('定位失败，请重试')
              }
            })
          }
          }

)
  



