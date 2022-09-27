<template>
	<div class="hello" style="height: 100%;">
	  <p class="table-title">传感器列表</p>
	  <table class="table table-striped">
		  <thead>
			  <tr>
				  <th>测点名称</th>
				  <th>数据类型</th>
				  <th>采样时间</th>
				  <th>操作</th>
			  </tr>
		  </thead>
		  <tbody>
			  <tr v-for="(item,index) in dataList" :key="index">
				  <td>{{item.test_location_name}}</td>
				  <td>{{item.data_type}}</td>
				  <td>{{item.acquisition_time}}</td>
				  <td>
					  <div class="click-style" @click="showDetails(item)">详情</div>
				  </td>
			  </tr>
			  
		  </tbody>
	  </table>
	  <div id='chartBox'>
		  <div><span class="left-style">测点名称 : </span><span>{{current.test_location_name}}</span></div>
		  <div><span class="left-style">数据类型 : </span><span>{{current.data_type}}</span></div>
		  <div><span class="left-style">采样时间 : </span><span>{{current.acquisition_time}}</span></div>
		  <div id="prps3d" class="chart-3d"></div>
		  <!-- <div style="position:absolute;margin:auto;left:0;right:0;text-align:center;bottom:70px;" v-if='showTEV'>TEV幅值：{{tevValue}}  dBmV</div> -->
	  </div>
	</div>
  </template>
  
  <script>
  
  import * as pdcharts  from '../js/index.js'
  import {prps} from '../js/data/prps.js'
  import {ae} from '../js/data/ae.js'
  import {tev} from '../js/data/tev.js'
  import $  from 'jquery'
  export default {
	name: 'home',
	data () {
	  return {
		dataList:[],
		current:{},
		showTEV:false,
		  tevValue:'',
	  }
	},
	methods:{
	  getData(){
		  let This = this;
		  $.ajax({
			  type:'GET',
			  async:true,
			  url:'http://127.0.0.1:5000/rest/v1/sensor_list/',
			 // url:'/api',
			  success:function(res){
				  console.log(res,'res')
                  //res.length && res.map(item=>{
                   // if(item.data_type.toUpperCase().indexOf('TEV')>-1){
                    //    item.data_type = 'AE'
                    //}
                    //return item;
                  //})
					This.dataList = res
			  },
			  error:function(){
				   This.dataList = [
				 	  {
				 		  test_location_name:'开关柜UFH测点A',
				 		  data_type:'UHF',
				 		  acquisition_time:'2021-06-06 12:00:00'
				 	  },
				 	  {
				 		  test_location_name:'开关柜UFH测点B',
				 		  data_type:'AE/TEV',
				 		  acquisition_time:'2021-06-06 16:00:00'
				 	  }
				   ]
			  }
		  })
	  },
	  showDetails(item) {
            //if(item.data_type.toUpperCase().indexOf('TEV')>-1){
            //    item.data_type = 'AE'
            //}
			this.current = item;
			console.log(pdcharts.chartType)
			let type, data;
			var chartType = pdcharts.chartType;
			if (item.data_type == 'UHF') {
			  type = chartType.prps3d;
			  data = prps.chartBody
			  var _data = item.params.UHF.prps;
			  var temp = prps.chartBody.series[0].dataList
			  prps.chartBody.axisInfo.zMaxValue = item.params.UHF.ampmax
			  for (var i = 0; i < _data.length; i++) {
				temp[i][2] = _data[i];
			  }
			} else if (item.data_type == "AE/TEV") {
			  type = chartType.ae;
			  data = ae.chartBody;
			  let arr = ['maxvalue', 'rmsvalue', 'harmonic1', 'harmonic2'];
			  for (var i = 0; i < data.series.length; i++) {
				data.series[i].dataList[0].value = item.params.AE[arr[i]];
			  }
			  this.showTEV = true;
			  this.tevValue = item.params.TEV.amp;
			}
			pdcharts.draw(document.getElementById('prps3d'), {
			  width: '40rem',
			  height: '30rem',
			  type: type,
			  data: data,
			  background: "#141414"
			});
			$('#chartBox').css('opacity', '1');
			$('#prps3d').css('opacity', '1');
		  },
	},
	mounted() {
		  this.getData();
		  setInterval(this.getData, 4500);
		  var chartType = pdcharts.chartType;
		  pdcharts.draw(document.getElementById('prps3d'), {
			width: '40rem',
			height: '30rem',
			type: chartType.prps3d,
			data: prps.chartBody,
			background: "#141414"
		  });
		  document.addEventListener('click', (e) => {
  
			if (e.target.className == 'click-style' || e.target.tagName == 'CANVAS') return;
			if (e.target.className != '3d-chart') {
			  $('#prps3d').css('opacity', '0')
			  $('#chartBox').css('opacity', '0');
			}
			console.log(55, e.target)
		  })
  
		}
	  
  }
  </script>
  <style>
	  :root{
	  --my-height:90%;
	  --my-width:45%
	  }
  </style>
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
   table{
			  width: 100%;
		  }
		  tr{
			  background:transparent !important
		  }
		  th{
			  font-weight: bold;border-bottom:0 !important;color:#fff;border-top: 1px solid #252525 !important;text-align: left;
		  }
		  th,td{
			  border-bottom: 1px solid #252525 !important;padding:0 20px !important;
			  height: 40px;line-height: 40px !important;
		  }
		  .table-title{
			  height: 40px;line-height:40px;font-size:18px;padding:10px 20px;
		  }
		  .click-style{
			  cursor: pointer;color:#2566ca;
		  }  
		   #chartBox{padding:20px 0;opacity: 0;
			 position:absolute;top:0;bottom:0;right:0;left:0;margin:auto;
			  width:40rem;height:40rem;background: #141414;color:#fff;
		  } 
		  #chartBox>div:not(:last-child){
			  width:60%;margin:auto;
		  }
		  .left-style{
			  display:inline-block;width:90px;
		  }
		  .close-btn{
			  position:absolute;right:5px;top:5px;width: 16px !important;;height:16px;background: #f00;
			  text-align: center;line-height: 16px;border-radius: 3px;cursor: pointer;
		  }
  </style>

