# Donut-Chart
A JS plugin to create a donut chart which auto fits on to a container with svg animations on hover and percentage values displayed on hover. It supports custom color combos or uses a default set. 

This is just a curiosity response to wanting to draw an animated svg. This is how the path is drawn for each sector from 18 points.  
  
![PointDrawing](https://github.com/user-attachments/assets/381fd048-aade-4467-b032-9900bd77a466)

# Usage

Once the script has been linked to your webpage, you can simply call it as below:

```javascript
new DonutChart("#container",{  
  dataDict: {"A": 20, "B": 10, "C": 25, "D": 32},  
  COLOR_DATA: ["#cc1643", "#44cc55", "#ccb414", "#3f5ecc"],  
  SIZE_VALUE: 0  
});  
```

"#container" is the queryselector for the container.

The `COLOR_DATA` & `SIZE_VALUE` are optional.
