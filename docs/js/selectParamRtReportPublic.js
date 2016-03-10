var xmlhttp;
var table;
var counterSecs = 0;  // for MCHALLIS counter script
var stopCounterSecs = 0;  // Check start/stop refresh table and graph
var typeReport;  // graph|table, enable/disable counter for table or graph
var stopIntervalCounterSecs = 0;  // Check start counter
var globalDataReportType;
loadGoogle();

// -------------------------------------------------------------------
// When change graph type, update showNumRow list box follow graphType
function updateRtNumRows(graphType)
{
  var showNumRowSelected = new Object();
  // Get selected numRow object from select box
  showNumRowSelected = document.getElementById("realtimeReportForm").showNumRowRt;
  // Clear select box
  removeAllOptions(showNumRowSelected);

  if(graphType != 'BarChart')
  {
    // Update selected parameter list on select box
    addOption(showNumRowSelected,"100","100","SELECTED");
    addOption(showNumRowSelected,"300","300","");
    addOption(showNumRowSelected,"500","500","");
    addOption(showNumRowSelected,"10","10","");
  }
  else
  {
    // Update selected parameter list on select box
    addOption(showNumRowSelected,"20","20","");
    addOption(showNumRowSelected,"10","10","SELECTED");
  }
}

// -------------------------------------------------------------------
function stationChanged()
{
  if (xmlhttp.readyState==4)
  {
//    document.getElementById("parameterDiv").innerHTML=xmlhttp.responseText;
    var optionName;
    var optionValue;
    var optionSelected;
    var xmlDoc;
    var parameterSelected = new Object();
    var timingNumMin = new Object();
/*
<select id="123">
  <option value="145">hello</option>
  <option value="146" selected="selected">world</option>
</select>
*/
    // Get selected parameter object from select box
    parameterSelected = document.getElementById("realtimeReportForm").parameterSelected;
    // Clear select box
    removeAllOptions(parameterSelected);

    // Get XML selected parameter list
    xmlDoc = xmlhttp.responseXML;

    var selectId = xmlDoc.getElementsByTagName("select")[0].attributes[0].value;
    var totalParameter = xmlDoc.getElementsByTagName('option').length;
//    alert('selectId='+selectId+', totalParameter='+totalParameter);

    // Update selected parameter list on select box
    for(var i = 0; i < totalParameter; i++)
    {
      optionName = xmlDoc.getElementsByTagName("option")[i].childNodes[0].nodeValue;
      optionValue = xmlDoc.getElementsByTagName("option")[i].attributes[0].value;
      optionSelected = xmlDoc.getElementsByTagName("option")[i].attributes[1].value;

      addOption(parameterSelected,optionName,optionValue,optionSelected);
    }

    var ReadTiming = xmlDoc.getElementsByTagName("ReadTiming")[0].childNodes[0].nodeValue;
    // Get selected timing number object from select box
    timingNumMin = document.getElementById("realtimeReportForm").timingNumMin;
    // Clear select box
    removeAllOptions(timingNumMin);
    var numName;
    // Update selected timing number on select box
    for(var i=1;i<61;i++)
    {
      if(i<=9)
        numName = "0"+i;
      else
        numName = i;
      if(ReadTiming == i)
        addOption(timingNumMin,numName,i,"SELECTED");
      else
        addOption(timingNumMin,numName,i,"");
    }

    document.getElementById("imgLoading").style.display = 'none';
    grayOut(false);
  }
  else
  {
    // Loading
    document.getElementById("imgLoading").style.display = '';
    document.getElementById("imgLoading").style.position = "absolute";
    document.getElementById("imgLoading").style.top = '50%';
    document.getElementById("imgLoading").style.left = '50%';
    grayOut(true,{'opacity':'15'});
  }
}
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// Process show graph report from selected station
function showGraphRtReport()
{
  if (xmlhttp.readyState==4 && stopCounterSecs == 0 && typeReport == "showGraphRt")
  {
    var xmlDoc;
//    document.getElementById("graphRtTableDiv").innerHTML=xmlhttp.responseText;
    // Clear old div
    document.getElementById("graphRtTableDiv").innerHTML="";
    document.getElementById("table_rt_div").innerHTML="";
    document.getElementById("table_rt_summary_div").innerHTML="";
    document.getElementById("table_rt_hidden_div").innerHTML="";
    var graphRtTableDiv = document.getElementById('graphRtTableDiv');
    graphRtTableDiv.style.height = '400px';
    xmlDoc = xmlhttp.responseXML;
/*
<table>
  <tr>
    <td>2009-09-130</td>
    <td>01:03:540</td>
    <td>43.118190</td>
    <td>44.60</td>
  </tr>
</table>
*/
    var data = new google.visualization.DataTable();
    var dataSummary = new google.visualization.DataTable();
    var totalTrNode = xmlDoc.getElementsByTagName('tr').length;
    var totalTdNode,tdValue,j,temp="";

    // Check station have some date between selected period
    if(totalTrNode > 6)
    {
      // Loop get information from XML
      for(var i = 0; i < totalTrNode; i++)
      {
        totalTdNode = xmlDoc.getElementsByTagName('tr')[i].childNodes.length;
        // Loop to add value to graph
        for(j = 0; j < totalTdNode; j++)
        {
          // Value for each node
          tdValue = xmlDoc.getElementsByTagName("td")[(i*totalTdNode)+j].childNodes[0].nodeValue;
          var a = i-totalTrNode+5;

          // Check to add column name
          if(i==0)
          {
            // Add name of column to table
            if(tdValue == 'Date Time')
            {
              data.addColumn('date', 'Date');
              dataSummary.addColumn('string', 'Summary');
            }
            else
            {
              data.addColumn('number', tdValue);
              dataSummary.addColumn('number', tdValue);
            }
          }
          // Check to add value of table summary
          else if(i>totalTrNode-6)
          {
            // Check to add row name of table summary
            if(j == 0)
            {
//              temp = temp + 'dataSummary.setValue('+a+', '+j+', '+tdValue+')\n';
              dataSummary.setValue(i-totalTrNode+5, j, tdValue);
            }
            else
            {
//              temp = temp + 'dataSummary.setValue('+a+', '+j+', '+parseFloat(tdValue)+')\n';
              dataSummary.setValue(i-totalTrNode+5, j, parseFloat(tdValue));
            }
          }
          // Check to add value of table
          else
          {
            // Check to add date or number to table
            if(j == 0)
            {
              var arrDate = tdValue.split(",");
              arrDate[1] = arrDate[1]-1;
              data.setValue(i-1, j, new Date(arrDate[0],arrDate[1],arrDate[2],arrDate[3],arrDate[4],arrDate[5]));
//              temp = temp + 'data.setValue('+i-1+', '+j+', new Date('+arrDate[0]+','+arrDate[1]+','+arrDate[2]+','+arrDate[3]+','+arrDate[4]+','+arrDate[5])+'))\n';
            }
            else
            {
              data.setValue(i-1, j, parseFloat(tdValue));
//              temp = temp + 'data.setValue('+i-1+', '+j+', new Date('+parseFloat(tdValue)+'))\n';
            }
          }
        }

        // Add total num rows
        if(i == 0)
        {
          var a=totalTrNode-6;
          data.addRows(a);
          dataSummary.addRows(5);
        }
      }

      // Create new formatter date
//      var formatter = new google.visualization.DateFormat({pattern: "yyyy/M/d H:m:ss"});
      var formatter = new google.visualization.DateFormat({pattern: "yyyy/M/d H:m"});

      // Reformat our data.
      formatter.format(data, 0);
      formatter.format(dataSummary, 0);

      var graphType = document.getElementById("realtimeReportForm").graphType.value;
      if(graphType == 'AnnotatedTimeLine')
        var annotatedtimeline = new google.visualization.AnnotatedTimeLine(document.getElementById('graphRtTableDiv'));
      else if(graphType == 'AreaChart')
        var annotatedtimeline = new google.visualization.AreaChart(document.getElementById('graphRtTableDiv'));
      else if(graphType == 'BarChart')
        var annotatedtimeline = new google.visualization.BarChart(document.getElementById('graphRtTableDiv'));
      else if(graphType == 'ColumnChart')
        var annotatedtimeline = new google.visualization.ColumnChart(document.getElementById('graphRtTableDiv'));

//      annotatedtimeline.draw(data, {'displayAnnotations': true});
      if(graphType == 'AnnotatedTimeLine')
      {
        annotatedtimeline.draw(data, {
//            'allValuesSuffix': '%', // A suffix that is added to all values
            //'colors': ['blue', 'red', '#0000bb'], // The colors to be used
            'dateFormat': 'HH:mm:ss MMMM dd, yyyy',
            'displayAnnotations': true,
            'displayExactValues': true, // Do not truncate values (i.e. using K suffix)
            //'displayRangeSelector': false, // Do not sow the range selector
            //'displayZoomButtons': false, // DO not display the zoom buttons
            'fill': 30, // Fill the area below the lines with 20% opacity
            'legendPosition': 'newRow', // Can be sameRow
            //'max': 100000, // Override the automatic default
            //'min':  100000, // Override the automatic default
            //'scaleColumns': [0, 1], // Have two scales, by the first and second lines
//            'scaleType': 'allfixed', // See docs...
            'thickness': 2 // Make the lines thicker
        });
      }
      else
      {
        data.sort([{column: 0}]);
        annotatedtimeline.draw(data, {});
      }


      table = new google.visualization.Table(document.getElementById('table_rt_summary_div'));
      table.draw(dataSummary, {showRowNumber: true});

      // Clear counter
      counterSecs = 0;
      var element = document.getElementById("ajaxcounter");
      var timingNumMin = document.getElementById("realtimeReportForm").timingNumMin.value;

      if (element && stopCounterSecs == 0 && timingNumMin > 0) {
        setTimeout('processRtReport("showGraphRtRepeat", "'+globalDataReportType+'")',60000*timingNumMin); // Redraw graph on (2000 = 2 seconds)

        if(stopIntervalCounterSecs == 0)
        {
          window.setInterval("ajax_countup()", 1000); // run the counter for seconds since update
          stopIntervalCounterSecs = 1;
        }
      }

      document.getElementById("exportExcelRt").style.visibility = "hidden";
      document.getElementById("printDataRt").style.visibility = "hidden";
    }
    else
      alert("à¸‚à¸­à¸­à¸ à¸±à¸¢à¸„à¹ˆà¸° à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸™à¸Šà¹ˆà¸§à¸‡à¹€à¸§à¸¥à¸²à¸—à¸µà¹ˆà¸„à¸¸à¸“à¹€à¸¥à¸·à¸­à¸à¸„à¹ˆà¸°");

    document.getElementById("imgLoading").style.display = 'none';
    grayOut(false);
  }
  else
  {
    // Loading
    document.getElementById("imgLoading").style.display = '';
    document.getElementById("imgLoading").style.position = "absolute";
    document.getElementById("imgLoading").style.top = '50%';
    document.getElementById("imgLoading").style.left = '50%';
    grayOut(true,{'opacity':'15'});
  }
}
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// Process show table realtime report from selected station
function showTableRtReport()
{
  if (xmlhttp.readyState==4 && stopCounterSecs == 0 && typeReport == "showTableRt")
  {
    var xmlDoc;
//    document.getElementById("graphRtTableDiv").innerHTML=xmlhttp.responseText;
    // Clear old div
    document.getElementById("graphRtTableDiv").innerHTML="";
    document.getElementById("table_rt_div").innerHTML="";
    document.getElementById("table_rt_summary_div").innerHTML="";
    document.getElementById("table_rt_hidden_div").innerHTML="";
    var graphRtTableDiv = document.getElementById('graphRtTableDiv');
    graphRtTableDiv.style.height = '0px';
    xmlDoc = xmlhttp.responseXML;
/*
<table>
  <tr>
    <td>2009-09-130</td>
    <td>01:03:540</td>
    <td>43.118190</td>
    <td>44.60</td>
  </tr>
</table>
*/

    var data = new google.visualization.DataTable();
    var dataSummary = new google.visualization.DataTable();
    var totalTrNode = xmlDoc.getElementsByTagName('tr').length;
    var totalTdNode,tdValue,j,temp="";
    var htmlTable="";

    // Check station have some date between selected period
    if(totalTrNode > 6)
    {
      htmlTable = "<table>";
      // Loop get information from XML
      for(var i = 0; i < totalTrNode; i++)
      {
        // Check to paint table color
        if(i==0)
          htmlTable = htmlTable + "<tr>";
        else if(i%2==0)
          htmlTable = htmlTable + '<tr class="ui-mas-table-tr1">';
        else
          htmlTable = htmlTable + '<tr class="ui-mas-table-tr2">';

        totalTdNode = xmlDoc.getElementsByTagName('tr')[i].childNodes.length;
        // Loop to add value to graph
        for(j = 0; j < totalTdNode; j++)
        {
          // Value for each node
          tdValue = xmlDoc.getElementsByTagName("td")[(i*totalTdNode)+j].childNodes[0].nodeValue;
          var a = i-totalTrNode+5;

          // Check to add column name
          if(i==0)
          {
            // Add name of column to table
            if(tdValue == 'Date Time')
            {
//              htmlTable = htmlTable + '<td bgcolor="#CCCCCC" class="ui-mas-table-th"><div align="center">Date<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></div></td>';
              htmlTable = htmlTable + '<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'">';
              data.addColumn('date', 'Date');
              dataSummary.addColumn('string', 'Summary');
            }
            else
            {
//              htmlTable = htmlTable + '<td bgcolor="#CCCCCC" class="ui-mas-table-th"><div align="center">'+tdValue+'<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></div></td>';
              htmlTable = htmlTable + '<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'">';
              data.addColumn('number', tdValue);
              dataSummary.addColumn('number', tdValue);
            }
          }
          // Check to add value of table summary
          else if(i>totalTrNode-6)
          {
            // Check to add row name of table summary
            if(j == 0)
            {
//              temp = temp + 'dataSummary.setValue('+a+', '+j+', '+tdValue+')\n';
              // Add summary column name such as MAX, MIN, etc.
              dataSummary.setValue(i-totalTrNode+5, j, tdValue);
            }
            else
            {
//              temp = temp + 'dataSummary.setValue('+a+', '+j+', '+parseFloat(tdValue)+')\n';
              // Add value of column.
              dataSummary.setValue(i-totalTrNode+5, j, parseFloat(tdValue));
            }
//            htmlTable = htmlTable + "<td>"+tdValue+"</td>";
          }
          // Check to add value of table
          else
          {
            var a = i-1;

            // Check to add date or number to table
            if(j == 0)
            {
              var arrDate = tdValue.split(",");
              arrDate[1] = arrDate[1]-1;
              data.setValue(i-1, j, new Date(arrDate[0],arrDate[1],arrDate[2],arrDate[3],arrDate[4],arrDate[5]));
              temp = temp + 'data.setValue('+a+', '+j+', new Date('+arrDate[0]+','+arrDate[1]+','+arrDate[2]+','+arrDate[3]+','+arrDate[4]+','+arrDate[5]+'))\n';
//              htmlTable = htmlTable + '<td><INPUT TYPE="text" NAME="'+i+'_'+j+'" id="'+i+'_'+j+'" VALUE="'+arrDate[0]+'-'+arrDate[1]+'-'+arrDate[2]+' '+arrDate[3]+':'+arrDate[4]+':'+arrDate[5]+'"></td>';
//              htmlTable = htmlTable + '<td>'+arrDate[0]+'-'+arrDate[1]+'-'+arrDate[2]+' '+arrDate[3]+':'+arrDate[4]+':'+arrDate[5]+'<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></td>';
              htmlTable = htmlTable + '<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'">';
            }
            else
            {
              data.setValue(i-1, j, parseFloat(tdValue));
              temp = temp + 'data.setValue('+a+', '+j+', '+parseFloat(tdValue)+')\n';
//              htmlTable = htmlTable + "<td>"+tdValue+"</td>";
//              htmlTable = htmlTable + '<td><INPUT TYPE="text" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></td>';
              htmlTable = htmlTable + '<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'">';
            }
          }
        }

        // Add total num rows
        if(i == 0)
        {
          var a=totalTrNode-6;
          data.addRows(a);
          dataSummary.addRows(5);
        }

        htmlTable = htmlTable + "</tr>";
      }

      // Create new formatter date
//      var formatter = new google.visualization.DateFormat({pattern: "yyyy/M/d H:m:ss:SS"});
      var formatter = new google.visualization.DateFormat({pattern: "yyyy/M/d H:m:ss"});
      // Reformat our data.
      formatter.format(data, 0);
      formatter.format(dataSummary, 0);
      table = new google.visualization.Table(document.getElementById('table_rt_div'));
      table.draw(data, {showRowNumber: true});
      table = new google.visualization.Table(document.getElementById('table_rt_summary_div'));
      table.draw(dataSummary, {showRowNumber: true});

      google.visualization.events.addListener(table, 'select', function() {
        var sel = table.getSelection();
      })

//      htmlTable = htmlTable + "</table>";
      htmlTable = htmlTable + '</table><INPUT TYPE="hidden" NAME="totalDataRow" value="'+i+'"><INPUT TYPE="hidden" NAME="totalDataColumn" value="'+j+'">';
//      htmlTable = htmlTable + '<INPUT TYPE="hidden" NAME="totalDataRow" value="'+i+'"><INPUT TYPE="hidden" NAME="totalDataColumn" value="'+j+'">';
//      document.getElementById("table_rt_hidden_div").innerHTML=htmlTable;

      // Clear counter
      counterSecs = 0;
      var element = document.getElementById("ajaxcounter");
      var timingNumMin = document.getElementById("realtimeReportForm").timingNumMin.value;

      if (element && stopCounterSecs == 0 && timingNumMin > 0) {
        setTimeout('processRtReport("showTableRtRepeat", "'+globalDataReportType+'")',60000*timingNumMin); // Redraw graph on (2000 = 2 seconds)

        if(stopIntervalCounterSecs == 0)
        {
          window.setInterval("ajax_countup()", 1000); // run the counter for seconds since update
          stopIntervalCounterSecs = 1;
        }
      }
//      document.getElementById("exportExcelRt").style.visibility = "visible";
      document.getElementById("printDataRt").style.visibility = "hidden";
    }
    else
    {
      // Clear counter
      clearState();
      alert("à¸‚à¸­à¸­à¸ à¸±à¸¢à¸„à¹ˆà¸° à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸™à¸Šà¹ˆà¸§à¸‡à¹€à¸§à¸¥à¸²à¸—à¸µà¹ˆà¸„à¸¸à¸“à¹€à¸¥à¸·à¸­à¸à¸„à¹ˆà¸°");
    }

    document.getElementById("imgLoading").style.display = 'none';
    grayOut(false);
  }
  else
  {
    // Loading
    document.getElementById("imgLoading").style.display = '';
    document.getElementById("imgLoading").style.position = "absolute";
    document.getElementById("imgLoading").style.top = '50%';
    document.getElementById("imgLoading").style.left = '50%';
    grayOut(true,{'opacity':'15'});
  }
}
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// Show list of parameter from selected station
// -------------------------------------------------------------------
function showParamRtReport(stationId)
{
  xmlhttp=GetXmlHttpObject();
  if (xmlhttp==null)
  {
    alert ("Browser does not support HTTP Request");
    return;
  }
  // Clear counter
  clearState();

  var url="includes/getManReport.php";
  var params="stationId="+stationId+"&action=getParamList";
  xmlhttp.onreadystatechange=stationChanged;
  xmlhttp.open("POST",url,true);

  //Send the proper header information along with the request
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.setRequestHeader("Content-length", params.length);
  xmlhttp.setRequestHeader("Connection", "close");
  xmlhttp.send(params);
}

// -------------------------------------------------------------------
// Show table or graph from selected station
// -------------------------------------------------------------------
function processRtReport(action, dataReportType)
{
  globalDataReportType = dataReportType;
  xmlhttp=GetXmlHttpObject();
  if (xmlhttp==null)
  {
    alert ("Browser does not support HTTP Request");
    return;
  }

//  alert("processRtReport -> counterSecs="+counterSecs+", stopCounterSecs="+stopCounterSecs+", action="+action+", typeReport="+typeReport);

  var paramLength = document.getElementById("realtimeReportForm").parameterSelected.length;
  var stationId = document.getElementById("realtimeReportForm").stationId.value;
  var showNumRowRt = document.getElementById("realtimeReportForm").showNumRowRt.value;
  var params="";

  var paramValue='';
  for(var i=0;i<paramLength;i++)
  {
    if(document.getElementById("realtimeReportForm").parameterSelected[i].selected == true)
    {
      paramValue = paramValue + document.getElementById("realtimeReportForm").parameterSelected[i].value;
      if(i < paramLength-1)
        paramValue = paramValue + ",";
    }
  }

//    alert("startTime="+startHour+":"+startMin+":"+startSec+"&endTime="+endHour+":"+endMin+":"+endSec);

  // Check user has select some parameter first
  if(paramValue != '')
  {
    // Check stop repeat show table
    if(action == "showTableRtRepeat")
    {
      action = "showTableRt";
        if(typeReport == "showGraphRt")
          return;
    }

    // Check stop repeat show graph
    if(action == "showGraphRtRepeat")
    {
      action = "showGraphRt";
        if(typeReport == "showTableRt")
          return;
    }

    // Clear counter
    clearState();

    paramValue = paramValue + "%%";

    // Check action is export excel
    if(action == "exportExcel" && document.getElementById("realtimeReportForm").totalDataRow != undefined)
    {
      var totalDataRow = document.getElementById("realtimeReportForm").totalDataRow.value - 6;
      var totalDataColumn = document.getElementById("realtimeReportForm").totalDataColumn.value - 1;
      var data;
      // Check data not empty to update data on database
      if(totalDataRow > 0)
      {
        params = "totalDataRow="+totalDataRow+"&totalDataColumn="+totalDataColumn+"&";
        for(var i=0;i<=totalDataRow;i++)
        {
          for(var j=0;j<=totalDataColumn;j++)
          {
            params = params+"data"+i+"_"+j+"="+document.getElementById("data"+i+"_"+j).value+"&";
            data = document.getElementById("data"+i+"_"+j).value;
            // Ignore column name and date time value
            if(i>0 && j>0)
            {
              if(isFloat(data) == false)
              {
                if(isNumeric(document.getElementById("data"+i+"_"+j)) == false)
                {
                  alert("à¸à¸£à¸¸à¸“à¸²à¹ƒà¸ªà¹ˆà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸›à¹‡à¸™à¸•à¸±à¸§à¹€à¸¥à¸‚à¸„à¹ˆà¸°");
                  return;
                }
//                else
//                  alert("This is number: "+data);
              }
//              else
//                alert("This is float: "+data);
            }
          }
        }
      }
    }

    var url="includes/getManReport.php";
    params = params+"action="+action+"&paramValue="+paramValue+"&stationId="+stationId+"&dataReportType="+dataReportType+"&showNumRow="+showNumRowRt;

//    alert('params='+params);
    // Start counter
    stopCounterSecs = 0;

    // Show real-time graph report
    if(action == "showGraphRt")
    {
      typeReport = "showGraphRt";
      xmlhttp.onreadystatechange=showGraphRtReport;
    }
    // Show real-time table report
    else if(action == "showTableRt")
    {
      typeReport = "showTableRt";
      xmlhttp.onreadystatechange=showTableRtReport;
    }
    // Export data to excel file
    else if(action == "exportExcel")
    {
      temp = new Array();
      temp2 = new Array();
      arr_params = new Array();
      temp = params.split("&");
      var paramsNum = temp.length;

      // Loop for add parameters to array
      for(var i=0;i<paramsNum;i++)
      {
        temp2 = temp[i].split("=");
        arr_params[temp2[0]] = temp2[1];
      }
      if(paramsNum>0 && document.getElementById("realtimeReportForm").totalDataRow != undefined)
        // Send post request for export data to excel file
        post_to_url('./includes/exportExcel.php', arr_params);
      else
        alert("à¸‚à¸­à¸­à¸ à¸±à¸¢à¸„à¹ˆà¸° à¸„à¸¸à¸“à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸ªà¹ˆà¸‡à¸­à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸”à¹‰à¹€à¸™à¸·à¹ˆà¸­à¸‡à¸ˆà¸²à¸à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥");
    }

    if(action != "exportExcel")
    {
      xmlhttp.open("POST",url,true);

      //Send the proper header information along with the request
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttp.setRequestHeader("Content-length", params.length);
      xmlhttp.setRequestHeader("Connection", "close");
      xmlhttp.send(params);
    }
  }
  else
  {
    // Check stop repeat show graph
    if(action != "showGraphRtRepeat" && action != "showTableRtRepeat")
      alert("à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸žà¸²à¸£à¸²à¸¡à¸´à¹€à¸•à¸­à¸£à¹Œà¸”à¹‰à¸²à¸™à¸‹à¹‰à¸²à¸¢à¸à¹ˆà¸­à¸™à¸„à¹ˆà¸°");
  }
}

// -------------------------------------------------------------------
function drawVisualization() {

}

// -------------------------------------------------------------------
function loadGoogle()
{
//  google.load("visualization", "1", {packages:["table", "annotatedtimeline"], callback: drawVisualization});
  google.load("visualization", "1", {packages:["table", "annotatedtimeline", "corechart"], callback: drawVisualization});
}

// -------------------------------------------------------------------
function GetXmlHttpObject()
{
  if (window.XMLHttpRequest)
  {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    return new XMLHttpRequest();
  }
  if (window.ActiveXObject)
  {
    // code for IE6, IE5
    return new ActiveXObject("Microsoft.XMLHTTP");
  }
  return null;
}
// -------------------------------------------------------------------
// removeSelectedOptions(select_object)
//  Remove all selected options from a list
//  (Thanks to Gene Ninestein)
// -------------------------------------------------------------------
function removeSelectedOptions(from) {
	if (!hasOptions(from)) { return; }
	if (from.type=="select-one") {
		from.options[from.selectedIndex] = null;
		}
	else {
		for (var i=(from.options.length-1); i>=0; i--) {
			var o=from.options[i];
			if (o.selected) {
				from.options[i] = null;
				}
			}
		}
	from.selectedIndex = -1;
	}

// -------------------------------------------------------------------
// removeAllOptions(select_object)
//  Remove all options from a list
// -------------------------------------------------------------------
function removeAllOptions(from) {
	if (!hasOptions(from)) { return; }
	for (var i=(from.options.length-1); i>=0; i--) {
		from.options[i] = null;
		}
	from.selectedIndex = -1;
	}

// -------------------------------------------------------------------
// addOption(select_object,display_text,value,selected)
//  Add an option to a list
// -------------------------------------------------------------------
function addOption(obj,text,value,selected) {
	if (obj!=null && obj.options!=null) {
		obj.options[obj.options.length] = new Option(text, value, false, selected);
		}
	}

// -------------------------------------------------------------------
// hasOptions(obj)
//  Utility function to determine if a select object has an options array
// -------------------------------------------------------------------
function hasOptions(obj) {
	if (obj!=null && obj.options!=null) { return true; }
	return false;
	}


// -------------------------------------------------------------------
// -------------------------------------------------------------------
// Mike Challis' counter function (adapted by Ken True)
// -------------------------------------------------------------------
function ajax_countup() {
 element = document.getElementById("ajaxcounter");
 if (element && stopCounterSecs == 0) {
  element.innerHTML = counterSecs;
  counterSecs++;
 }
}

// Clear counter
function clearState() {
  element = document.getElementById("ajaxcounter");
  // Stop counter
  stopCounterSecs = 1;
  counterSecs = 0;
  element.innerHTML = counterSecs;
}

/**
 * Checks if a given string is float or not
 *
 * @author sos
 * @param {String} val The string in question.
 */
function isFloat(val) {
  if(!val || (typeof val != "string" || val.constructor != String)) {
    return(false);
  }
  var isNumber = !isNaN(new Number(val));
  if(isNumber) {
    if(val.indexOf('.') != -1) {
      return(true);
    } else {
      return(false);
    }
  } else {
    return(false);
  }
}

/**
 * Validation - Checking for All Numbers
 */
function isNumeric(elem){
//	var numericExpression = /^[0-9]+$/;
  var numericExpression = /^-{0,1}\d*\.{0,1}\d+$/;

	if(elem.value.match(numericExpression)){
		return true;
	}else{
		elem.focus();
		return false;
	}
}
