// Array to store all answers to the questions
var antwortenArr = new Array(7);
var questionNr = 1;
var nrQuestions = quest.length;

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