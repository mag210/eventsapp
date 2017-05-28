

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
    window.setTimeout(loadEventsJSON,1000);
}

function loadChart()
{
    var loading = '<span class="fa fa-spinner fa-spin fa-5x" style="padding:40px;"></span>' ;
    document.getElementById("content").innerHTML = loading;
    feed = "chart" ;
    window.setTimeout(loadEventsJSON,1000);
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
  var labelArray = new Array() ;
  var attendedArray = new Array();
  var jsonData = JSON.parse(data.responseText);
  var events = jsonData.data.events;
  for (var i = 0; i < events.length; i++)
  {
      labelArray.push(events[i].name) ;
      attendedArray.push(events[i].num) ;
  }
  buildChart(labelArray, attendedArray) ;
}



function buildChart(labelArray, attendedArray)
{
  var ctx = document.getElementById("myChart");
  var data = {

                labels: labelArray,
                datasets:
                [
                    {
                       pointHoverRadius: 12,
                       //fill: false,
                       backgroundColor: "rgba(75,132,175,4)",
                       hoverBackgroundColor: "rgba(75,192,192,1)",
                      label: 'Attended',
                      data: attendedArray,
                  }
                ]
              } ;
          var options = {
             scales: {
             yAxes: [{
                 type: 'linear',
                 ticks: {
                     min: 0,
                     max: 100
                 }
             }],
           },
                  elements:
                  {
                    point:
                    {
                      radius: 8,
                      hitRadius: 20,
                    }
                  },
                  legend:
                  {
                    display: true
                  }
            }
              analyticsChart = new Chart(ctx, {
              type: 'bar',
              data: data,
              options: options

              });
              document.getElementById("content").innerHTML = "";
}
