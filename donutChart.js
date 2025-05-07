class DonutChart {
    constructor(parentSelector,options = {}){
        this.validateParams(parentSelector,options);
        this.PERCENTAGE_VALUES = [];
        this.LEGEND_VALUES = [];
        this.SIZE_DATA = [5,10,15];
        this.LEGEND_BOX_STYLE = "width: 400px; display: flex; flex-wrap:wrap;";
        this.LEGEND_STYLE = " margin: 5px 0px; width: 100px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;";
        this.LEGEND_COLOR_STYLE = "width: 20px; height:20px; background-color: aliceblue;";
        this.LEGEND_TITLE_STYLE = "font-family: 'Roboto' , sans-serif; text-align: center; font-size: 12px;";
        this.PERCENTAGE_CONTAINER_STYLE = "width: 280px; height: 280px; border-radius: 1000px; box-shadow: 0px 0px 5px 7px rgba(0,0,0,0.07); position: relative; margin-top: -230px; top: 340px; left: 60px; display: flex; align-items: center; justify-content: center; flex-direction: column; z-index: 100;";
        this.PERCENTAGE_TEXT_STYLE = "font-family: 'Roboto', sans-serif; font-size: 42px; font-weight: bold; color: #666";
        this.PERCENTAGE_LEGEND_STYLE = "font-family: 'Roboto', sans-serif; font-size: 16px;";
        this.RADII_ARRAY = [];
        this.settings = {
            COLOR_DATA : ["#cc1643", "#44cc55", "#ccb414", "#3f5ecc", "#cc6c29", "#a422cc", "#3ccccc", "#cc2ac4", "#9ccc0a", "#cc9b9b", "#00cccc", "#b898cc", "#cc8330", "#ccc8a0", "#cc0000", "#88cc9c", "#cccc00", "#ccad8e", "#991132", "#339940", "#99870f", "#2f4699", "#99511f", "#7b1a99", "#2d9999", "#992093", "#759907", "#997474", "#009999", "#8a7299", "#996224", "#999678", "#990000", "#669975", "#999900", "#99826a", "#660b21", "#22662b", "#665a0a", "#202f66", "#663614", "#521166", "#1e6666", "#661562", "#4e6605", "#664e4e", "#006666", "#5c4c66", "#664218", "#666450", "#660000", "#44664e", "#666600", "#665647", "#330611", "#113315", "#332d05", "#101733", "#331b0a", "#290933", "#0f3333", "#330b31", "#273302", "#332727", "#003333", "#2e2633", "#33210c", "#333228", "#330000", "#223327", "#333300", "#332b23", "#000033"],
            SIZE_VALUE : 0,
            ...options
        }

        this.setPercent = this.setPercent.bind(this);
        this.clearPercent = this.clearPercent.bind(this);

        this.setRadiiArray();
        var scaleFactor = this.setScale(parentSelector);
        var angleData = this.createAngles();
        var pointsData = this.createPoints(angleData);
        var svgEl = this.createDonut(pointsData);
        var legend = this.makeLegend();
        var percentageArea = this.createPercentageArea();

        var parentElement = document.querySelector(parentSelector);

        var localParent = document.createElement("div");
        console.log(scaleFactor);
        localParent.setAttribute("style",`transform-origin: top left;transform: scale(${scaleFactor});`);
        localParent.appendChild(percentageArea);
        localParent.appendChild(svgEl);
        localParent.appendChild(legend);

        parentElement.appendChild(localParent);

    };

    //Check if the parameters are valid
    validateParams(parentSelector,options){

        var re = /[#0-9A,B,C,D,E,F,a,b,c,d,e,f]{7}/g;

        //Check if it is a valid selector.
        if(!document.querySelector(parentSelector)){
            throw new Error("DonutChart: The parentSelector should be a valid queryselector (a non-empty string)");
        }

        //Check if dataDict has been set.
        if(typeof options.dataDict === 'undefined'){
            throw new Error("DonutChart: The dataDict is required to make a donut chart");
        }

        //Check if dataDict is actually a dictionary of numbers
        Object.keys(options.dataDict).map((item)=>{
            if(typeof options.dataDict[item] !== 'number'){
                throw new Error(
                    `DonutChart: The dataDict must be a dictionary with numbers` + `The key ${item} does not have a number as value.`
                );
            }
        });

        //Check if COLOR_DATA is set and if it is set, verify each of the colors provided is a valid hexcode.
        if(options.COLOR_DATA){
            options.COLOR_DATA.map((item)=>{
                if(item[0]!=="#" || item.slice(1).length !== 6 || !item.match(re)){
                    throw new Error(
                        `DonutChart: A valid array of hexcodes for colors should be used.`
                    );
                }
            });
        }

        //Check if the SIZE_DATA is actually in range of the allowed size.
        if(options.SIZE_DATA){
            if(typeof options.SIZE_DATA !== "number" || options.SIZE_DATA>2){
                throw new Error(
                    "DonutChart: The selected size must be a valid number between 0 and 2"
                );
            }
        }
    }

    //Identify and set the scale value for the chart to fit the size of the parent container
    setScale(parentSelector){
        var parentElement = document.querySelector(parentSelector);
        var scaleFactor = parentElement.offsetWidth/400;

        return scaleFactor;
    }

    //Set the Radii of the chart based on the size value
    setRadiiArray(){

        let radiiArray = [];
    
        for(let i=-2;i<3;i++){
            radiiArray.push(150+(i*this.SIZE_DATA[this.settings.SIZE_VALUE]));
        }
        
    
        this.RADII_ARRAY = [].concat(radiiArray,radiiArray.slice(0,2),radiiArray.slice(-2),radiiArray.slice(0,2),radiiArray.slice(-2),radiiArray);
    
    }
    
    //Self Described
    createAngles(){
        let angleData = []
        let total = 0
    
        Object.keys(this.settings.dataDict).map(item=>{
            this.LEGEND_VALUES.push(item);
            angleData.push(this.settings.dataDict[item]);
            total += this.settings.dataDict[item];
        });
    
        for(let i=0;i<angleData.length;i++){
            var percentageVal = (Math.round(10000*angleData[i]/total)/100).toString()+"%";
            this.PERCENTAGE_VALUES.push(percentageVal);
            angleData[i]= ((angleData[i]/total)*(360-(angleData.length*5)));
        }
    
        return angleData;
    }

    //:|
    deg2rad(theta){
        return theta*(Math.PI/180);
    }

    // A product of | cosθ -sinθ | with |x| gives a point rotated around the center. 
    //              | sinθ cosθ  |      |y| 
    //
    // Here the y value is always 0 as the point is set on x axis before it is rotated 
    // origin shifted to the center position of the circle.
    getPoint(r,theta,centerPos){
        return [r*Math.cos(theta)+centerPos[0],r*Math.sin(theta)+centerPos[1]];
    }

    // A set of 18 points are made for each sector of the arc (Please refer PointDrawing).
    createPoints(angleData){
        let pointsData = {};
        let theta = 0;
        let radii = this.RADII_ARRAY;
        for(let i=0;i<angleData.length;i++){
            let angles = [0,0,0,0,0,2.5,0,0,0,angleData[i],0,0,0,2.5,0,0,0,0];
            let pointsDrawn = [];
            for(let j=0;j<angles.length;j++){
                theta+=angles[j];
                pointsDrawn.push(this.getPoint(radii[j],this.deg2rad(theta),[200,200]));
            }
            pointsData[i.toString()] = pointsDrawn;
        }
    
        return pointsData;
    }

    //An SVG shape is generated for a given fill color and 18 points
    createShape(arcData,fill){
        var smPoints = [].concat(arcData.slice(1,4),arcData.slice(6,8),arcData.slice(10,12),arcData.slice(14,17));
        var lgPoints = [].concat(arcData.slice(0,1),arcData.slice(2,3),arcData.slice(4,6),arcData.slice(8,10),arcData.slice(12,14),arcData.slice(15,16),arcData.slice(-1));
    
        let smPath = this.makePath(smPoints,150,this.SIZE_DATA[this.settings.SIZE_VALUE]);
        let lgPath = this.makePath(lgPoints,150,2*this.SIZE_DATA[this.settings.SIZE_VALUE]);
      
        var svgNS = "http://www.w3.org/2000/svg";
        var retEL = document.createElementNS(svgNS,"path");
        var animateEl = document.createElementNS(svgNS,"animate");
        var animateEl2 = document.createElementNS(svgNS,"animate");
        
        retEL.setAttribute("d",smPath);
        retEL.setAttribute("fill",fill);
        retEL.addEventListener('mouseenter', this.setPercent);
        retEL.addEventListener('mouseleave', this.clearPercent);
    
        animateEl.setAttribute("attributeName","d");
        animateEl.setAttribute("to",lgPath);
        animateEl.setAttribute("dur",'0.25s');
        animateEl.setAttribute("begin","mouseover");
        animateEl.setAttribute("fill","freeze");
    
        animateEl2.setAttribute("attributeName","d");
        animateEl2.setAttribute("to",smPath);
        animateEl2.setAttribute("dur",'0.25s');
        animateEl2.setAttribute("begin","mouseout");
        animateEl2.setAttribute("fill","freeze");
    
        retEL.appendChild(animateEl);
        retEL.appendChild(animateEl2);
    
        return retEL;
    
    }

    //Legend is made from the COLOR_DATA and dataDict
    makeLegend(){
        var legendBox = document.createElement("div");
    
        legendBox.setAttribute("style",this.LEGEND_BOX_STYLE);
    
        Object.keys(this.settings.dataDict).map((item,index)=>{
            var legendContainer = document.createElement("div");
            var legendColor = document.createElement("div");
            var legendTitle = document.createElement("div");
    
            legendContainer.setAttribute("style",this.LEGEND_STYLE);
            legendColor.setAttribute("style",this.LEGEND_COLOR_STYLE);
            legendTitle.setAttribute("style",this.LEGEND_TITLE_STYLE);
    
            legendColor.style.backgroundColor = this.settings.COLOR_DATA[index];
    
            legendContainer.appendChild(legendColor);
            legendContainer.appendChild(legendTitle);
            legendTitle.innerHTML = item;
    
            legendBox.appendChild(legendContainer);
        });
    
        return legendBox;
    
    }

    //A div that contians the percentage values is created here
    createPercentageArea(){
        var percentageContainer = document.createElement('div');
        var percentageText = document.createElement('div');
        var percentageLegend = document.createElement('div');
    
        percentageContainer.setAttribute('style',this.PERCENTAGE_CONTAINER_STYLE);
        percentageText.setAttribute('style',this.PERCENTAGE_TEXT_STYLE);
        percentageLegend.setAttribute('style',this.PERCENTAGE_LEGEND_STYLE);
    
        percentageContainer.appendChild(percentageText);
        percentageContainer.appendChild(percentageLegend);
    
        percentageText.classList.add("donut_text_percent");
        percentageLegend.classList.add("donut_legend_percent");
    
        return percentageContainer;
    }

    //Drawing the actual 'd' path 
    makePath(pointData,radius,width){
        var path = "M";
        var minRadius = radius-width;
        var maxRadius = radius+width;
        path += this.getCoordinate(pointData[1])+" C "+this.getCoordinate(pointData[0])+" , "+this.getCoordinate(pointData[0])+" , "+this.getCoordinate(pointData[3])+" A "+minRadius+" "+minRadius+" 0 0 1 "+this.getCoordinate(pointData[5])+" C "+this.getCoordinate(pointData[7])+" , "+this.getCoordinate(pointData[7])+" , "+this.getCoordinate(pointData[8])+" C "+this.getCoordinate(pointData[9])+" , "+this.getCoordinate(pointData[9])+" , "+this.getCoordinate(pointData[6])+" A "+maxRadius+" "+maxRadius+" 0 0 0 "+this.getCoordinate(pointData[4])+" C "+this.getCoordinate(pointData[2])+" , "+this.getCoordinate(pointData[2])+" , "+this.getCoordinate(pointData[1]);
        return path;
    }

    //To make my code less of a mess than it already is
    getCoordinate(point){
        return point[0]+" "+point[1];
    }

    //Combines all the stuff above and generates an svg with the actual donut
    createDonut(pointData){
        var svgNS = "http://www.w3.org/2000/svg";
        var svgElement = document.createElementNS(svgNS,"svg");
        svgElement.setAttribute("xmlns","http://www.w3.org/2000/svg");
        svgElement.setAttribute("width","400");
        svgElement.setAttribute("height","400");
    
        Object.keys(pointData).map((item,index)=>{
            svgElement.appendChild(this.createShape(pointData[item],this.settings.COLOR_DATA[index]));
        });
    
        return svgElement;
    }

    //On Mouse Enter event Handler
    setPercent(event){
        var index = [...event.target.parentElement.getElementsByTagName("path")].indexOf(event.target);

        // If someone reads this, please suggest a less messy solution
        var percentParent = event.target.parentElement.parentElement.children[0];
        percentParent.children[0].innerHTML = this.PERCENTAGE_VALUES[index];
        percentParent.children[1].innerHTML = this.LEGEND_VALUES[index];
    }
    
    //On Mouse Leave event Handler
    clearPercent(event){
        // Messy Solution from above
        var percentParent = event.target.parentElement.parentElement.children[0];
        percentParent.children[0].innerHTML = "";
        percentParent.children[1].innerHTML = "";
    }

}