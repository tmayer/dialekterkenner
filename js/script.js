// Array to store all answers to the questions
var antwortenArr = new Array(7);
var questionNr = 1;
var nrQuestions = quest.length;

var voropolygons = [];

$(document).ready(function(){
  $('input').iCheck({
    checkboxClass: 'icheckbox_square-blue',
    radioClass: 'iradio_square-blue'
  });

  $('#voronoi').on('ifChanged', function(event){
  cells.classed("voronoi", this.checked);
});


$("#locations").on("ifChanged", function(event) {
    var locationopacity = this.checked ? 1 : 0;
    var locationpointer = this.checked ? 'all' : 'none';
    //console.log(locationopacity);
  d3.selectAll('.location')
    .style("opacity",locationopacity)
    ;
});
}); 



showQuestion(1);

var data = [];
var polygons;

//Width and height
var w = 400;
var h = 570;

//Define map projection
var projection = d3.geo.mercator()
                       .center([11, 50.6])
                       .scale([52000]);

//Define path generator
var path = d3.geo.path()
                 .projection(projection);

//Create SVG element
var svg = d3.select("#map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            ;
    
var polys = svg.append("svg:g")
    .attr("id","polys")
    ;
    
var circles = svg.append("svg:g")
    .attr("id", "circles")
    .attr("pointer-events",'none')
    ;

var cells = svg.append("svg:g")
    .attr("id", "cells")
    .attr("pointer-events",'none')
    ;
    
var states = svg.append("svg:g")
    .attr("id", "states")
    ;
    


//Load in GeoJSON data
d3.json("data/3_mittel-kreise-hessen.geojson", function(json) {
    
    //Bind data and create one path per GeoJSON feature
    states.selectAll("path")
       .data(json.features)
       .enter()
       .append("path")
       .attr("d", path)
       .style("fill", "none")
       .style("stroke","#606060")
       .style("stroke-width","0.1")
    .attr('pointer-events','none')
       ;
       
        d3.csv("data/points_hessen.csv", function(inputdata) {
            
            // get the positions and polygons for the voronoi
            data = inputdata;
            //console.log(data);
            positions = [];
            data.forEach(function(a){
               positions.push(projection([a.lon,a.lat]));
               //positions.push([a.lon,a.lat]);
            });
            
            circles.selectAll("circle")
                 .data(data)
                 .enter()
                 .append("circle")
                 .attr('class','location')
                 .attr("cx", function(d) {
                     return projection([d.lon, d.lat])[0];
                 })
                 .attr("cy", function(d) {
                     return projection([d.lon, d.lat])[1];
                 })
                 .attr("r", 4)
                 .attr('pointer-events','none')
                 .style("fill", "steelblue")
                 .style("stroke","white")
                 .style("stroke-weight",3)
                 .style("opacity", 0)
                 .style('cursor','pointer')
                 .append("title")
                 .text(function(d){
                            return d.name;
                    })
                  ;
            
            
            polygons = d3.geom.voronoi(positions);
            
            
            var hesse = [];
            hessen.forEach(function(a){
                //parts = a.split(';').reverse()
                parts = a;
                //console.log(parts);
                hesse.push(projection(parts));
                //hesse.push(parts);
            });
            
            //console.log(hesse);
            
            var hesse_poly = d3.geom.polygon(hesse);

            //console.log(polygons);

            // plot the voronoi polygons
            
            var g = cells.selectAll("g")
                .data(data)
              .enter().append("svg:g");
             
            g.append("svg:path")
                  .attr("class", "cell")
                  .attr("d", function(d, i) { return "M" + polygons[i].join("L") + "Z"; })
                  .attr('pointer-events','none')
                  ;
                  
            // make the clipped polygons
                  
            // plot the voronoi polygons 
            polys.selectAll('polygon')
                .data(polygons)
                .enter()
                .append("polygon")
                .attr('class',function(d,i){return 'poly poly_' + i;})
                .attr("points",function(d,i) { 
                    var currHesse = hesse.slice(0);
                    var hesse_poly = d3.geom.polygon(currHesse);
                    var currPoly = d3.geom.polygon(d).clip(hesse_poly);
                    /*console.log(currPoly.map(function(m){
                      return [m[0],m[1]].join(',');
                    }).join(" "));
                    */
                    
                    /*
                    currObj = {};
                    currObj["type"] = "Feature";
                    currObj["properties"] = data[i];
                    currGeom = {};
                    currGeom["type"] = "MultiPolygon";
                    currGeom["coordinates"] = [[currPoly]];
                    currObj["geometry"] = currGeom;
                    
                    //console.log(currPoly.length);
                    voropolygons.push(currObj);
                    */
                    
                    return currPoly.map(function(m){
                    //return d.map(function(m){
                        return [m[0], m[1]].join(',');
                    }).join(" ");
                })
                //.attr("fill",'green')
                .attr("fill",function(d,i){
                    //console.log(data[i].dim1,data[i].dim2);
                    //console.log(dim1scale(data[i].dim1));
                    return "FireBrick";
                })
                .style("cursor","pointer")
                .attr("stroke","black")
                .attr("stroke-width",0.5)
                .style('opacity',0)//function(d,i){return (156-i)/156;})
                .on("mouseover",function(d,i){
                    
                    tooltip.show(data[i].name + " (" + (i+1) + ") [" + 100 + "%]");
                })
                .on("mouseout",function(d,i){
                    tooltip.hide();
                })
                ;

                // make a black border around the Hesse area
            polys.selectAll('polygon2')
                .data([hesse])
                .enter()
                .append("polygon")
                .attr("points",function(d,i) { 
                    //console.log(d);
                    return d.map(function(m){
                        return [m[0],m[1]].join(',');
                    }).join(" ");
                })
                .attr('fill','none')
                .attr("stroke","#999")
                .attr("stroke-width",1)
                ;
                        
        });             
          
});

  
// taken from http://philmap.000space.com/gmap-api/poly-hov.html

var tooltip=function(){
var id = 'tt';
var top = 3;
var left = 3;
var maxw = 300;
var speed = 10;
var timer = 20;
var endalpha = 95;
var alpha = 0;
var tt,t,c,b,h;
var ie = document.all ? true : false;
tt = document.getElementById("tt");
return{
show:function(v,w){
  if(tt == null){
    tt = document.createElement('div');
    tt.setAttribute('id',id);
    t = document.createElement('div');
    t.setAttribute('id',id + 'top');
    c = document.createElement('div');
    c.setAttribute('id',id + 'cont');
    b = document.createElement('div');
    b.setAttribute('id',id + 'bot');
    tt.appendChild(t);
    tt.appendChild(c);
    tt.appendChild(b);
    document.body.appendChild(tt);
    tt.style.opacity = 0;
    tt.style.filter = 'alpha(opacity=0)';
    document.onmousemove = this.pos;
  }
  tt.style.display = 'block';
  c.innerHTML = v;
  tt.style.width = w ? w + 'px' : 'auto';
  if(!w && ie){
    t.style.display = 'none';
    b.style.display = 'none';
    tt.style.width = tt.offsetWidth;
    t.style.display = 'block';
    b.style.display = 'block';
  }
  if(tt.offsetWidth > maxw){tt.style.width = maxw + 'px'}
  h = parseInt(tt.offsetHeight) + top;
  clearInterval(tt.timer);
  tt.timer = setInterval(function(){tooltip.fade(1)},timer);
},
pos:function(e){
  var u = ie ? event.clientY + document.documentElement.scrollTop : e.pageY;
  var l = ie ? event.clientX + document.documentElement.scrollLeft : e.pageX;
  tt.style.top = (u - h) + 'px';
  tt.style.left = (l + left) + 'px';
},
fade:function(d){
  var a = alpha;
  if((a != endalpha && d == 1) || (a != 0 && d == -1)){
    var i = speed;
    if(endalpha - a < speed && d == 1){
      i = endalpha - a;
    }else if(alpha < speed && d == -1){
      i = a;
    }
    alpha = a + (i * d);
    tt.style.opacity = alpha * .01;
    tt.style.filter = 'alpha(opacity=' + alpha + ')';
  }else{
    clearInterval(tt.timer);
    if(d == -1){tt.style.display = 'none'}
  }
},
hide:function(){
  clearInterval(tt.timer);
  tt.timer = setInterval(function(){tooltip.fade(-1)},timer);
}
};
}();   

// show the results in the results box
function showResults(){
    results.innerHTML = '';
  
  for(var i = 1;i< antwortenArr.length+1; i++){
    var textparts = new Array();
    textparts = quest[i-1].split(":");
    var text = textparts[1];
    text = text.replace("<br>","")
    text = text.replace("<b>","")
    text = text.replace("</b>","")
    text = text.replace(".","")
    var ant = "";
    if(antwortenArr[i-1] == 0){
      ant = "Nein";
    }
    if(antwortenArr[i-1] == 1){
      ant = "Ja";
    }
    results.innerHTML += "<tr><td style=\"border-bottom:thin dotted #A0A0A0;\"><span class=\"questlink\" onclick=\"showQuestion(" + i + ");\"><b> Frage "+ i
    + ": </b></span>" + text + ":</td><td width=\"10\"></td><td width=\"30\" valign=\"bottom\" align=\"right\">" + ant
    + "</a></td></tr>";
  }
}

// Show the question in the question box
function showQuestion(thisquestionNr) {

  questionNr = thisquestionNr;

  var question = document.getElementById("question");
  var fragennummer = document.getElementById("fragennummer");
  var formular = document.getElementById("formular");
  
  if(questionNr > 0 && questionNr < nrQuestions + 1){
    question.innerHTML = quest[questionNr-1];
    fragennummer.innerHTML = "" + questionNr;
  }
  
}

// next step after answer has been submitted
function nextStep() {
  
  var alerttext = document.getElementById("alerttext");
  
  if(document.form1.antwort1[0].checked == false &&
     document.form1.antwort1[1].checked == false){
     alerttext.innerHTML = "Bitte eine Antwortmöglichkeit anklicken!";
  }
  else{
    nextQuestion();
  } 
}

// next question in the correct order
function nextQuestion() {
  
  if(document.form1.antwort1[0].checked == true){
    antwortenArr[questionNr-1] = 1;
  }
  else{
    antwortenArr[questionNr-1] = 0;
  }

  var questionNrInt = parseInt(questionNr) + 1;

  if(questionNrInt > nrQuestions){
    questionNr = 1;
  }
  else{
    questionNr = questionNrInt;
  }
  showQuestion(questionNr);
  showResults();
  updateMap();
}

// update the map representation
function updateMap(){
  
  var info = document.getElementById("information");
  

  
  nrAntworten = antwortenArr.filter(function(value) { return value !== undefined }).length;  
  //nrAntworten = nrQuestions-countlength;
  
  var max = 0;
  var min = 1000;
  var minValue = 1000;
  var maxLoc = new Array();
  
  for(var i=0;i < locations.length;i++){
    var currRes = calculateValue(i);
    //console.log(currRes);
    resultVector[i] = currRes;
    currValue = currRes;
    if(currValue > max){
      max = currValue;
    }
    if(currValue == min){
      maxLoc.push("#" + i + "#");
    }
    if(currValue < min){
      min = currValue;
      maxLoc = new Array();
      maxLoc.push("#" + i + "#");
    }
  }
  var maxLocString = maxLoc.join("-");
  //alert(maxLocString);


    polys.selectAll('.poly')
        .data(polygons)
        .on("mouseover",function(d,i){
            var resValue = resultVector[i];
            //console.log(resValue);
            var resValueOrig = resValue/max;
            resValue = resValueOrig * 0.75;
            if(nrAntworten == nrQuestions){
                if(maxLocString.indexOf("#" + i + "#") != -1){
                    minValue = resValueOrig;
                    console.log("if2: ", minValue);
                }
            }
            tooltip.show(data[i].name + " (" + (i+1) + ") [" + Math.round((1-resValueOrig)*10000)/100 + "%]");
        })
        .transition()
        .duration(1000)
        .style("opacity",function(d,i){
            var resValue = resultVector[i];
            //console.log(resValue);
            var resValueOrig = resValue/max;
            resValue = resValueOrig * 0.75;
            if(nrAntworten == nrQuestions){
                if(maxLocString.indexOf("#" + i + "#") != -1){
                    minValue = resValueOrig;
                    console.log("if2: ", minValue);
                }
            }
            return 1-resValue;
        })
        ;


        // display final result if all answers are given
      
      if(nrAntworten == nrQuestions){
        var infotext = document.getElementById("infotext");
        infotext.innerHTML = "Ihre Dialektzugehörigkeit ist mit einer Wahrscheinlichkeit von ";
        console.log(minValue);
        infotext.innerHTML += Math.round((1 - minValue) * 10000)/100;
        if(maxLoc.length == 1){
          infotext.innerHTML += " % dem folgenden Ort zuzuordnen:<br> ";
        }
        else{
          infotext.innerHTML += " % den folgenden Orten zuzuordnen:<br> ";
        }
        for(var m = 0;m<maxLoc.length;m++){
          var currLoc = maxLoc[m];
          currLoc = currLoc.replace("#","");
          currLoc = parseInt(currLoc);
          infotext.innerHTML += locationinfo[currLoc][1] + " (" + (currLoc + 1) + ") ";
        }
        $("#resultbox").css("display","block");
      }

      
}
  
function calculateValue(index){
    
  var resValue = 0;
  for(var i=0;i< antwortenArr.length;i++){
    if(antwortenArr[i] == 0){
      resValue += matrixNorm[index][i];
    }
    else if(antwortenArr[i] == 1){
      resValue += 1 - matrixNorm[index][i];
    }
    else{
      resValue += 0;
    }
  }
  return resValue;
}

// restart everything
function restart(){
    location.href = '';
}