
//Called when the page has loaded


var feed = null ;

function addEventListeners()
{
  try {
    var radioParent = document.getElementById("radioParent")
    radioParent.addEventListener("click", showHideInfo , false);
    }
  catch (e) {
  }

  //Check cache
  loadPreferences();
  getStorageItems();
}



function loadEvents()
{
    var loading = '<span class="fa fa-spinner fa-spin fa-5x" style="padding:40px;"></span>' ;
    document.getElementById("content").innerHTML = loading;
    feed = "events" ;
    window.setTimeout(loadEventsJSON,2000);
}

function loadChart()
{
    var loading = '<span class="fa fa-spinner fa-spin fa-5x" style="padding:40px;"></span>' ;
    document.getElementById("content").innerHTML = loading;
    feed = "chart" ;
    window.setTimeout(loadEventsJSON,2000);
}

function loadEventsJSON() {

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4)  {
      switch(this.status){
        case 200:
        if (feed ==="events")
        {

          renderJSON(this);
        }
        else
        {

          renderChartJSON(this) ;
        }
        break ;
        case 404:
          var error = this.status + " " + this.statusText ;
          showError(error) ;
        break ;
        case 500:
          var error = this.status + " " + this.statusText ;
          showError(error) ;
        break ;
      }
    }
  };
  xhttp.open("GET", "https://as.exeter.ac.uk/codebox/grand_challenges/api/get_events.php?type=json", true);
  xhttp.send();
}



function renderJSON(data)
{
  var jsonData = JSON.parse(data.responseText);
  var output = '<ul class="list">';
  var events = jsonData.data.events;
  for (var i = 0; i < events.length; i++)
  {
      var data ="<h3>"+ events[i].name +"</h3><p>"+
      events[i].type + "</p><p>"+
      events[i].location + "</p><p>"+
      events[i].date + "</p>" ;
      output += "<li>" + data + "</li>" ;
  }
  document.getElementById("content").innerHTML = output;
}


function showError($error)
{
  console.log($error) ;
}



//This function appends the responsive class to topNav on click of the mobile menu. This creates the responsive stacked menu
function showResponsiveMenu()
{
    var topNav = document.getElementById("myTopnav");
    if (topNav.className === "topnav")
    {
        topNav.className += " responsive";
    }
    else
    {
        topNav.className = "topnav";
    }
}


//This function appends the responsive class to topNav on click of the mobile menu. This creates the responsive stacked menu



function changeHeading()
{
  var selectValue = document.getElementById("heading").value;
  document.getElementById('pheader').style.background = selectValue;
}

function changeTopnav()
{
  var selectValue = document.getElementById("nav").value;
  document.getElementById('myTopnav').style.background = selectValue;
}

function showHideInfo(e)
{
    //Only call the event if the item is a child of the parent
    if (e.target !== e.currentTarget)
    {
        var showHideValue = e.target.value;
        document.getElementById('introContainer').style.display= showHideValue ;
    }
    e.stopPropagation();
}


function savePreferences()
{
  var headingColour = document.getElementById("heading").value;
  var topNavColour = document.getElementById("nav").value;
  var infoText = document.getElementById('introContainer').style.display ;
  localStorage.setItem("headingColour", headingColour);
  localStorage.setItem("topNavColour", topNavColour);
  localStorage.setItem("infoTextVis", infoText);
  alert("Preferences saved");
}
function removePreferences()
{
  var del = confirm("Are you sure you want to delete your prefernces?");
  if (del === true)
  {
    localStorage.removeItem("headingColour");
    localStorage.removeItem("topNavColour");
    localStorage.removeItem("infoTextVis");
    location.reload();
  }
  else
  {
    return false ;
  }


}

function loadPreferences()
{
  var heading = localStorage.getItem("headingColour");
  var topNav = localStorage.getItem("topNavColour");
  var infoText = localStorage.getItem("infoTextVis");
  if (heading != null && topNav != null)
  {
    document.getElementById('pheader').style.background = heading ;
    document.getElementById('myTopnav').style.background = topNav ;
    document.getElementById('introContainer').style.display = infoText  ;
    console.log("loading from the cache...") ;
  }
  else
  {
    console.log("nothing in the cache") ;
  }
}


function getStorageItems()
{
  for (var i = 0; i < localStorage.length; i++)
  {
    console.log(localStorage.getItem(localStorage.key(i)));
  }
}



function renderChartJSON(data)
{
  var chartData = new Array() ;
  var jsonData = JSON.parse(data.responseText);
  var events = jsonData.data.events;
  for (var i = 0; i < events.length; i++)
  {
      chartData.push({
        "event": events[i].name,
        "attended": events[i].num
    });
  }
  buildChart(chartData) ;
}




function buildChart(chartData)
{
  console.log(chartData) ;
  var data = chartData ;
  var div = d3.select("body").append("div").attr("class", "toolTip");

  var margin = {top:10, right:10, bottom:90, left:50};

  var width = 800 - margin.left - margin.right;

  var height = 600 - margin.top - margin.bottom;

  var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .03)

  var yScale = d3.scale.linear()
        .range([height, 0]);


  var xAxis = d3.svg.axis()
  		.scale(xScale)
  		.orient("bottom");


  var yAxis = d3.svg.axis()
  		.scale(yScale)
  		.orient("left");

  var svgContainer = d3.select("#chartID").append("svg")
  		.attr("width", width+margin.left + margin.right)
  		.attr("height",height+margin.top + margin.bottom)
  		.append("g").attr("class", "container")
  		.attr("transform", "translate("+ margin.left +","+ margin.top +")");

  xScale.domain(data.map(function(d) { return d.event; }));
  yScale.domain([0, d3.max(data, function(d) { return d.attended; })]);


  //xAxis. To put on the top, swap "(height)" with "-5" in the translate() statement. Then you'll have to change the margins above and the x,y attributes in the svgContainer.select('.x.axis') statement inside resize() below.
  var xAxis_g = svgContainer.append("g")
  		.attr("class", "x axis")
  		.attr("transform", "translate(0," + (height) + ")")
  		.call(xAxis)
  		.selectAll("text")
      .call(wrap, xScale.rangeBand());

  // Uncomment this block if you want the y axis
  var yAxis_g = svgContainer.append("g")
  		.attr("class", "y axis")
  		.call(yAxis)
  		.append("text")
  		.attr("transform", "rotate(-90)")
  		.attr("y", -50).attr("dy", ".71em")
  		.style("text-anchor", "end").text("Number attended");



  	svgContainer.selectAll(".bar")
    		.data(data)
    		.enter()
    		.append("rect")
    		.attr("class", "bar")
    		.attr("x", function(d) { return xScale(d.event); })
    		.attr("width", xScale.rangeBand())
    		.attr("y", function(d) { return yScale(d.attended); })
    		.attr("height", function(d) { return height - yScale(d.attended); });


    // Controls the text labels at the top of each bar. Partially repeated in the resize() function below for responsiveness.

  	svgContainer.selectAll(".text")
  	  .data(data)
  	  .enter()
  	  .append("text")
  	  .attr("class","label")
  	  .attr("x", (function(d) { return xScale(d.event) + xScale.rangeBand() / 2 ; }  ))
  	  .attr("y", function(d) { return yScale(d.attended) + 1; })
  	  .attr("dy", ".75em")
  	  .text(function(d) { return d.attended; });

      svgContainer.selectAll(".bar").on("mousemove", function(d){
          div.style("left", d3.event.pageX+10+"px");
          div.style("top", d3.event.pageY-25+"px");
          div.style("display", "inline-block");

          div.html((d.event)+"<br>"+(d.attended));
        });

      svgContainer.selectAll(".bar").on("mouseout", function(d){
          div.style("display", "none");
      });



      document.getElementById('content').innerHTML = "" ;


document.addEventListener("DOMContentLoaded", resize);
d3.select(window).on('resize', resize);

function resize() {
	console.log('----resize function----');
  // update width
  width = parseInt(d3.select('#chartID').style('width'), 10);
  width = width - margin.left - margin.right;

  height = parseInt(d3.select("#chartID").style("height"));
  height = height - margin.top - margin.bottom;
	console.log('----resiz width----'+width);
	console.log('----resiz height----'+height);
  // resize the chart

    xScale.range([0, width]);
    xScale.rangeRoundBands([0, width], .03);
    yScale.range([height, 0]);

    yAxis.ticks(Math.max(height/50, 2));
    xAxis.ticks(Math.max(width/50, 2));

    d3.select(svgContainer.node().parentNode)
        .style('width', (width + margin.left + margin.right) + 'px');

    svgContainer.selectAll('.bar')
    	.attr("x", function(d) { return xScale(d.event); })
      .attr("width", xScale.rangeBand());



    svgContainer.select('.x.axis').call(xAxis.orient('bottom')).selectAll("text").attr("y",10).call(wrap, xScale.rangeBand());
}

}


function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
