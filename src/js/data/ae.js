export var ae = {
  "chartBody": {
    "title": "AE幅值图谱",
    "axisInfo": {
      "bgColor": "#141414",
      "unit": "dBuV"
    },
    "series": [
      {
        "name": "最大值",
        "min": -10,
        "max": 75,
        "dataList": [
          { "name": "测量值", "value": 7.5, "color": "jet" }
        ]
      },
      {
        "name": "有效值",
        "min": -10,
        "max": 75,
        "dataList": [
          { "name": "测量值", "value": 10, "color": "jet" }
        ]
      },
      {
        "name": "50Hz分量",
        "min": -10,
        "max": 75,
        "dataList": [
          { "name": "测量值", "value": 0.5, "color": "jet" }
        ]
      },
      {
        "name": "100Hz分量",
        "min": -10,
        "max": 75,
        "dataList": [
          { "name": "测量值", "value": 1.5, "color": "jet" }
        ]
      }
    ]
  }
}
