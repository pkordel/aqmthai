var xmlhttpMnReport;
var tableMnReport;
var originalData=new Array(); // Contain original data for compare with update data before save to database
var gloBalPriority;
var gloBalDataReportType;

// -------------------------------------------------------------------
// When change graph type, update showNumRow list box follow graphType
function updateMnNumRows(graphType)
{
  var showNumRowSelected = new Object();
  // Get selected numRow object from select box
  showNumRowSelected = document.getElementById("manualReportForm").showNumRow;
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
// When change station name, update parameter list and timing number in listbox follow selected station id
function paramMnReportChanged()
{
  if (xmlhttpMnReport.readyState==4)
  {
//    document.getElementById("parameterDiv").innerHTML=xmlhttpMnReport.responseText;
    var optionName;
    var optionValue;
    var optionSelected;
    var xmlDoc,latestTablePdata;
    var parameterSelected = new Object();
    var timingNumMin = new Object();
/*
<select id="123">
  <option value="145">hello</option>
  <option value="146" selected="selected">world</option>
</select>
*/
    // Get selected parameter object from select box
    parameterSelected = document.getElementById("manualReportForm").parameterSelected;
    // Clear select box
    removeAllOptions(parameterSelected);

    // Get XML selected parameter list
    xmlDoc = xmlhttpMnReport.responseXML;
    var stationId = document.getElementById("manualReportForm").stationId.value;
    if(gloBalDataReportType == '_r')
    {
      // Show lastest datetimedata on table _p
      latestTablePdata = xmlDoc.getElementsByTagName("latestTablePdata")[0].childNodes[0].nodeValue;
      if(latestTablePdata != undefined)
        document.getElementById("latestTablePdata").innerHTML = "Last data in table process " + stationId + " is: <strong>" + latestTablePdata + "</strong>";
    }
    var totalParameter = xmlDoc.getElementsByTagName('option').length;

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
    timingNumMin = document.getElementById("manualReportForm").timingNumMin;
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

  }
}
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// Process show graph report from selected station
function showGraphMnReport()
{
  if (xmlhttpMnReport.readyState==4)
  {
    var xmlDoc;
//    document.getElementById("graphTableDiv").innerHTML=xmlhttpMnReport.responseText;
    // Clear old div
    document.getElementById("graphMnTableDiv").innerHTML="";
    document.getElementById("table_mn_div").innerHTML="";
    document.getElementById("table_mn_summary_div").innerHTML="";
    var graphMnTableDiv = document.getElementById('graphMnTableDiv');
    var reportType = document.getElementById("manualReportForm").reportType.value;
    graphMnTableDiv.style.height = '400px';
    xmlDoc = xmlhttpMnReport.responseXML;
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
/*
    // Create and  populate the data table.
  var data = new google.visualization.DataTable();
  data.addColumn('date', 'Date');
  data.addColumn('number', 'Cats');
  data.addColumn('number', 'Blanket 1');
  data.addRow([new Date(2008, 1 ,1), 1, 1.459]);
  data.addRow([new Date(2008, 1 ,2), 2, 0]);
  data.addRow([new Date(2008, 1 ,3), 12, null]);
  data.addRow([new Date(2008, 1 ,4), 16, null]);
  data.addRow([new Date(2008, 1 ,5), 18, null]);
  data.addRow([new Date(2008, 1 ,6), 4, 17]);
  data.addRow([new Date(2008, 1 ,7), 8, 1]);
*/
    var data = new google.visualization.DataTable();
    var dataSummary = new google.visualization.DataTable();
    var totalTrNode = xmlDoc.getElementsByTagName('tr').length;
    var totalTdNode,tdValue,j,temp="";
    var graphType = document.getElementById("manualReportForm").graphType.value;

    // Check station have some date between selected period
    if(totalTrNode > 6)
    {
      var arrAddRow=[];
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
              if(graphType == 'AnnotatedTimeLine' || graphType == 'AreaChart')
                data.addColumn('number', 'ZERO');
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
              if(reportType != "Monthly")
                arrDate[1] = arrDate[1]-1;

//              data.setValue(i-1, j, new Date(arrDate[0],arrDate[1],arrDate[2],arrDate[3],arrDate[4],arrDate[5]));
              arrAddRow[j] = new Date(arrDate[0],arrDate[1],arrDate[2],arrDate[3],arrDate[4],arrDate[5]);
              if(graphType == 'AnnotatedTimeLine' || graphType == 'AreaChart')
                arrAddRow[j+1] = 0; // Add zero to show on graph for main graph
              temp = temp + 'data.setValue('+i+'-1'+', '+j+', new Date('+arrDate[0]+','+arrDate[1]+','+arrDate[2]+','+arrDate[3]+','+arrDate[4]+','+arrDate[5]+'))\n';
            }
            else
            {
//              data.setValue(i-1, j, parseFloat(tdValue));
              if(parseFloat(tdValue) == -999 || parseFloat(tdValue) == -9999 || parseFloat(tdValue) == -8888)
              {
  //              data.setValue(i-1, j, '');
                if(graphType == 'AnnotatedTimeLine' || graphType == 'AreaChart')
                  arrAddRow[j+1] = null;
                else
                  arrAddRow[j] = null;
              }
              else
              {
                if(graphType == 'AnnotatedTimeLine' || graphType == 'AreaChart')
                  arrAddRow[j+1] = parseFloat(tdValue);
                else
                  arrAddRow[j] = parseFloat(tdValue);
//                data.setValue(i-1, j, parseFloat(tdValue));
//              temp = temp + 'data.setValue('+i-1+', '+j+', new Date('+parseFloat(tdValue)+'))\n';
//              temp = temp + 'data.setValue('+i+'-1, '+j+', parseFloat('+tdValue+'));\n';
              }
            }
          }
        }

        // Check to add value to data table for plot graph
        if(i<=totalTrNode-6)
        {
//          alert("i=" + i + ", " + arrAddRow[0] + ", " + arrAddRow[1] + "," + arrAddRow[2]);
          if(arrAddRow[1] != undefined)
            data.addRow(arrAddRow);
        }

        // Add total num rows
        if(i == 0)
        {
          var a=totalTrNode-6;
//          data.addRows(a);
          dataSummary.addRows(5);
        }
      }

      // Create new formatter date
//      var formatter = new google.visualization.DateFormat({pattern: "yyyy/M/d H:m:ss:SS"});
      var formatter = new google.visualization.DateFormat({pattern: "yyyy/M/d H:m"});

      // Reformat our data.
      formatter.format(data, 0);
      formatter.format(dataSummary, 0);

      var annotatedtimeline = new google.visualization.AnnotatedTimeLine(
          document.getElementById('graphMnTableDiv'));

      if(graphType == 'AnnotatedTimeLine')
        var annotatedtimeline = new google.visualization.AnnotatedTimeLine(document.getElementById('graphMnTableDiv'));
      else if(graphType == 'AreaChart')
        var annotatedtimeline = new google.visualization.AreaChart(document.getElementById('graphMnTableDiv'));
      else if(graphType == 'BarChart')
        var annotatedtimeline = new google.visualization.BarChart(document.getElementById('graphMnTableDiv'));
      else if(graphType == 'ColumnChart')
        var annotatedtimeline = new google.visualization.ColumnChart(document.getElementById('graphMnTableDiv'));

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

      tableMnReport = new google.visualization.Table(document.getElementById('table_mn_summary_div'));
      tableMnReport.draw(dataSummary, {showRowNumber: true});

      document.getElementById("exportExcelMn").style.display = "none";
	  document.getElementById("exportCSVMn").style.display = "none";
	  document.getElementById("exportXMLMn").style.display = "none";
	  document.getElementById("exportPDFMn").style.display = "none";
      document.getElementById("saveDataMn").style.display = "none";
      document.getElementById("printDataMn").style.display = "none";

      pageIndex = xmlDoc.getElementsByTagName("pageIndex")[0].childNodes[0].nodeValue;
      pageTotal = xmlDoc.getElementsByTagName("pageTotal")[0].childNodes[0].nodeValue;

      var selectPageHtml = 'Page No: ' + pageIndex + ' Total Page: ' + pageTotal + ' <input type="button" name="bt_previous_page" value="Previous" onclick="JavaScript:return processMnReport(\'showGraph\', \'' + gloBalDataReportType + '\', \'' + gloBalPriority +'\', -1);"> <input type="button" name="bt_next_page" value="Next" onclick="JavaScript:return processMnReport(\'showGraph\', \'' + gloBalDataReportType + '\', \'' + gloBalPriority + '\', 1);">';
      document.getElementById("selectPage").innerHTML = selectPageHtml;
      document.getElementById("selectPage").style.visibility = "visible";
    }
    else
    {
      document.getElementById("selectPage").style.visibility = "hidden";
      document.getElementById("selectPage").innerHTML = "";
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
// Process show table manual report from selected station
function showTableMnReport()
{
  if (xmlhttpMnReport.readyState==4)
  {
    var xmlDoc;
//    document.getElementById("graphMnTableDiv").innerHTML=xmlhttpMnReport.responseText;
    // Clear old div
    document.getElementById("graphMnTableDiv").innerHTML="";
    document.getElementById("table_mn_div").innerHTML="";
    document.getElementById("table_mn_summary_div").innerHTML="";
    var graphMnTableDiv = document.getElementById('graphMnTableDiv');
    graphMnTableDiv.style.height = '0px';
    xmlDoc = xmlhttpMnReport.responseXML;
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
    var totalTdNode,tdValue,j,temp="",pageIndex,pageTotal;
    var htmlTable="";
    var reportType = document.getElementById("manualReportForm").reportType.value;

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
        originalData[i]=new Array(totalTdNode);

        // Loop to add value to graph
        for(j = 0; j < totalTdNode; j++)
        {
          // Value for each node
          tdValue = xmlDoc.getElementsByTagName("td")[(i*totalTdNode)+j].childNodes[0].nodeValue;
          var a = i-totalTrNode+5;

          // Check to add column name
          if(i==0)
          {
            originalData[i][j] = tdValue;

            // Add name of column to table
            if(tdValue == 'Date Time')
            {
              if(reportType == "Raw")
                htmlTable = htmlTable + '<td bgcolor="#CCCCCC" class="ui-mas-table-th"><div align="center">Date<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></div></td>';
              else
                htmlTable = htmlTable + '<td bgcolor="#CCCCCC" class="ui-mas-table-th3"><div align="center">Date<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></div></td>';
              data.addColumn('date', 'Date');
              dataSummary.addColumn('string', 'Summary');
            }
            else
            {
              htmlTable = htmlTable + '<td bgcolor="#CCCCCC" class="ui-mas-table-th2"><div align="center">'+tdValue+'<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></div></td>';
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
//            var a = i-1;
            originalData[i][j] = tdValue;

            // Check to add date or number to table
            if(j == 0)
            {
              var arrDate = tdValue.split(",");
              // Check type of report
              if(reportType == "Raw" || reportType == "Hour")
              {
                data.setValue(i-1, j, new Date(arrDate[0],arrDate[1],arrDate[2],arrDate[3],arrDate[4],arrDate[5]));
                temp = temp + 'data.setValue('+a+', '+j+', new Date('+arrDate[0]+','+arrDate[1]+','+arrDate[2]+','+arrDate[3]+','+arrDate[4]+','+arrDate[5]+'))\n';
  //              htmlTable = htmlTable + '<td><INPUT TYPE="text" NAME="'+i+'_'+j+'" id="'+i+'_'+j+'" VALUE="'+arrDate[0]+'-'+arrDate[1]+'-'+arrDate[2]+' '+arrDate[3]+':'+arrDate[4]+':'+arrDate[5]+'"></td>';
                htmlTable = htmlTable + '<td>'+arrDate[0]+'-'+arrDate[1]+'-'+arrDate[2]+' '+arrDate[3]+':'+arrDate[4]+':'+arrDate[5]+'<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></td>';
              }
              else if(reportType == "Monthly")
              {
                data.setValue(i-1, j, new Date(arrDate[0],arrDate[1],"","00","00","00"));
                temp = temp + 'data.setValue('+a+', '+j+', new Date('+arrDate[0]+','+arrDate[1]+',"",'+"00"+','+"00"+','+"00"+'))\n';
                htmlTable = htmlTable + '<td>'+arrDate[0]+'-'+arrDate[1]+'<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></td>';
              }
              else
              {
                data.setValue(i-1, j, new Date(arrDate[0],arrDate[1],arrDate[2],"00","00","00"));
                temp = temp + 'data.setValue('+a+', '+j+', new Date('+arrDate[0]+','+arrDate[1]+','+arrDate[2]+','+"00"+','+"00"+','+"00"+'))\n';
                htmlTable = htmlTable + '<td>'+arrDate[0]+'-'+arrDate[1]+'-'+arrDate[2]+'<INPUT TYPE="hidden" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'"></td>';
              }
            }
            else
            {
              data.setValue(i-1, j, parseFloat(tdValue));
              temp = temp + 'data.setValue('+a+', '+j+', '+parseFloat(tdValue)+')\n';
//              htmlTable = htmlTable + "<td>"+tdValue+"</td>";
              // Check type of report
              if(reportType == "Raw")
              {
                htmlTable = htmlTable + '<td><INPUT TYPE="text" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'" size="10" disabled></td>';
              }
              else
              {
                htmlTable = htmlTable + '<td><INPUT TYPE="text" NAME="data'+i+'_'+j+'" id="data'+i+'_'+j+'" VALUE="'+tdValue+'" size="10" disabled></td>';
              }
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
      var formatter = new google.visualization.DateFormat({pattern: "yyyy/M/d H:m:ss:SS"});
      // Reformat our data.
      formatter.format(data, 0);
      formatter.format(dataSummary, 0);
      tableMnReport = new google.visualization.Table(document.getElementById('table_mn_div'));
      tableMnReport.draw(data, {showRowNumber: true});
      tableMnReport = new google.visualization.Table(document.getElementById('table_mn_summary_div'));
      tableMnReport.draw(dataSummary, {showRowNumber: true});

      htmlTable = htmlTable + "</table>";
      htmlTable = htmlTable + '</table><INPUT TYPE="hidden" NAME="totalDataRow" value="'+i+'"><INPUT TYPE="hidden" NAME="totalDataColumn" value="'+j+'">';
      document.getElementById("table_mn_div").innerHTML=htmlTable;

      document.getElementById("exportExcelMn").style.display = "none";
	  document.getElementById("exportCSVMn").style.display = "none";
	  document.getElementById("exportXMLMn").style.display = "none";
	  document.getElementById("exportPDFMn").style.display = "none";
      if(reportType == "Raw" && (gloBalPriority == 1 || gloBalPriority == 2))
        document.getElementById("saveDataMn").style.display = "none";
      else
        document.getElementById("saveDataMn").style.display = "none";
      document.getElementById("printDataMn").style.display = "none";

      pageIndex = xmlDoc.getElementsByTagName("pageIndex")[0].childNodes[0].nodeValue;
      document.getElementById("manualReportForm").pageNo.value = pageIndex;
      pageTotal = xmlDoc.getElementsByTagName("pageTotal")[0].childNodes[0].nodeValue;

      var selectPageHtml = 'Page No: ' + pageIndex + ' Total Page: ' + pageTotal + ' <input type="button" name="bt_previous_page" value="Previous" onclick="JavaScript:return processMnReport(\'showTable\', \'' + gloBalDataReportType + '\', \'' + gloBalPriority +'\', -1);"> <input type="button" name="bt_next_page" value="Next" onclick="JavaScript:return processMnReport(\'showTable\', \'' + gloBalDataReportType + '\', \'' + gloBalPriority + '\', 1);">';
      document.getElementById("selectPage").innerHTML = selectPageHtml;
      document.getElementById("selectPage").style.visibility = "visible";
    }
    else
    {
      document.getElementById("selectPage").style.visibility = "hidden";
      document.getElementById("selectPage").innerHTML = "";
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
// Clear page number to first page
// -------------------------------------------------------------------
function resetPageNumberMn()
{
  // Set pageNo = 1
  document.getElementById("manualReportForm").pageNo.value = 1;
}
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// Show list of parameter from selected station
// -------------------------------------------------------------------
function showParamMnReport(stationId, dataReportType)
{
  gloBalDataReportType = dataReportType;
  // Set pageNo = 1
  document.getElementById("manualReportForm").pageNo.value = 1;
  xmlhttpMnReport=GetXmlHttpObject();
  if (xmlhttpMnReport==null)
  {
    alert ("Browser does not support HTTP Request");
    return;
  }

  var url="includes/getManReport.php";
  var params="stationId="+stationId+"&action=getParamList&dataReportType="+dataReportType;
  xmlhttpMnReport.onreadystatechange=paramMnReportChanged;
  xmlhttpMnReport.open("POST",url,true);

  //Send the proper header information along with the request
  xmlhttpMnReport.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttpMnReport.setRequestHeader("Content-length", params.length);
  xmlhttpMnReport.setRequestHeader("Connection", "close");
  xmlhttpMnReport.send(params);
}


// -------------------------------------------------------------------
// Show hour, minute, second from report type
// -------------------------------------------------------------------
function showMnHourMinSec(reportType)
{
  $("#datepicker_start").datepicker( 'enable' );
  $("#datepicker_end").datepicker( 'enable' );
  // Raw and Hour report
  if(reportType == 'Raw' || reportType == 'Hour')
  {
    document.getElementById("startHour").style.display = "";
    document.getElementById("startMin").style.display = "";
    document.getElementById("startSec").style.display = "";
    document.getElementById("endHour").style.display = "";
    document.getElementById("endMin").style.display = "";
    document.getElementById("endSec").style.display = "";
    document.getElementById("startYearMn").style.display = "none";
    document.getElementById("startMonthMn").style.display = "none";
    document.getElementById("endYearMn").style.display = "none";
    document.getElementById("endMonthMn").style.display = "none";
    document.getElementById("datepicker_start").style.display = "";
    document.getElementById("datepicker_end").style.display = "";
    document.getElementById("datepicker_start").disabled  = true;
    document.getElementById("datepicker_end").disabled  = true;
  }
  else
  {
    document.getElementById("startHour").style.display = "none";
    document.getElementById("startMin").style.display = "none";
    document.getElementById("startSec").style.display = "none";
    document.getElementById("endHour").style.display = "none";
    document.getElementById("endMin").style.display = "none";
    document.getElementById("endSec").style.display = "none";

    // Monthly report
    if(reportType == 'Monthly')
    {
      document.getElementById("startYearMn").style.display = "";
      document.getElementById("startMonthMn").style.display = "";
      document.getElementById("endYearMn").style.display = "";
      document.getElementById("endMonthMn").style.display = "";
      document.getElementById("datepicker_start").style.display = "none";
      document.getElementById("datepicker_end").style.display = "none";
      $("#datepicker_start").datepicker( 'disable' );
      $("#datepicker_end").datepicker( 'disable' );
    }
    // Daily report
    else
    {
      document.getElementById("startYearMn").style.display = "none";
      document.getElementById("startMonthMn").style.display = "none";
      document.getElementById("endYearMn").style.display = "none";
      document.getElementById("endMonthMn").style.display = "none";
      document.getElementById("datepicker_start").style.display = "";
      document.getElementById("datepicker_end").style.display = "";
      document.getElementById("datepicker_start").disabled  = true;
      document.getElementById("datepicker_end").disabled  = true;
    }
  }
}

// -------------------------------------------------------------------
// Show table or graph from selected station
// -------------------------------------------------------------------
function processMnReport(action, dataReportType, priority, selectPage)
{
  // Loading
  document.getElementById("imgLoading").style.display = '';
  document.getElementById("imgLoading").style.position = "absolute";
  document.getElementById("imgLoading").style.top = '50%';
  document.getElementById("imgLoading").style.left = '50%';
  grayOut(true,{'opacity':'15'});
  gloBalPriority = priority;
  gloBalDataReportType = dataReportType;

  xmlhttpMnReport=GetXmlHttpObject();
  if (xmlhttpMnReport==null)
  {
    alert ("Browser does not support HTTP Request");
    return;
  }

//  alert("processManRtReport -> counterSecs="+counterSecs+", stopCounterSecs="+stopCounterSecs+", action="+action);

  var paramLength = document.getElementById("manualReportForm").parameterSelected.length;
  var endDate = document.getElementById("manualReportForm").endDate.value;
  var startDate = document.getElementById("manualReportForm").startDate.value;
  var startHour = document.getElementById("manualReportForm").startHour.value;
  var startMin = document.getElementById("manualReportForm").startMin.value;
  var startSec = document.getElementById("manualReportForm").startSec.value;
  var endHour = document.getElementById("manualReportForm").endHour.value;
  var endMin = document.getElementById("manualReportForm").endMin.value;
  var endSec = document.getElementById("manualReportForm").endSec.value;
  var stationId = document.getElementById("manualReportForm").stationId.length;
  var reportType = document.getElementById("manualReportForm").reportType.value;
  var startYearMn = document.getElementById("manualReportForm").startYearMn.value;
  var startMonthMn = document.getElementById("manualReportForm").startMonthMn.value;
  var endYearMn = document.getElementById("manualReportForm").endYearMn.value;
  var endMonthMn= document.getElementById("manualReportForm").endMonthMn.value;
  var showNumRow = document.getElementById("manualReportForm").showNumRow.value;
  var pageNo = document.getElementById("manualReportForm").pageNo.value;
  var params="";

  if(selectPage == 1)
  {
    pageNo = parseInt(pageNo) + 1;
    document.getElementById("manualReportForm").pageNo.value = pageNo;
  }
  else if(selectPage == -1 && pageNo > 1)
  {
    pageNo = parseInt(pageNo) - 1;
    document.getElementById("manualReportForm").pageNo.value = pageNo;
  }

  var paramValue='';
  for(var i=0;i<paramLength;i++)
  {
    if(document.getElementById("manualReportForm").parameterSelected[i].selected == true)
    {
      paramValue = paramValue + document.getElementById("manualReportForm").parameterSelected[i].value;
      if(i < paramLength-1)
        paramValue = paramValue + ",";
    }
  }

  var stationIdValue = '';
  for(var i=0;i<stationId;i++) {
    if(document.getElementById("manualReportForm").stationId[i].selected == true) {
      stationIdValue = stationIdValue + document.getElementById("manualReportForm").stationId[i].value;
      if(i < stationId-1)
        stationIdValue = stationIdValue + ",";
    }
  }

//    alert("paramValue="+paramValue+", startTime="+startHour+":"+startMin+":"+startSec+"&endTime="+endHour+":"+endMin+":"+endSec);
  // Check user has select some parameter first
  if(paramValue != '')
  {
    paramValue = paramValue + "%%";
	stationIdValue = stationIdValue + "%%";

    // Check action is saveData
    if((action == "saveData" || action == "exportExcel") && document.getElementById("manualReportForm").totalDataRow != undefined && document.getElementById("data0_0") != null)
    {
      var totalDataRow = document.getElementById("manualReportForm").totalDataRow.value - 6;
      var totalDataColumn = document.getElementById("manualReportForm").totalDataColumn.value - 1;
      var startDateTimeCurrPage, endDateTimeCurrPage;
      var data;
      params = "";
      // Check data not empty to update data on database
      if(totalDataRow > 0)
      {
        endDateTimeCurrPage = document.getElementById("data1_0").value;
        startDateTimeCurrPage = document.getElementById("data"+totalDataRow+"_0").value;
        var iIndex=0,flag;
        for(var i=0;i<=totalDataRow;i++)
        {
          flag = 0;
          var tempParams = "";
          for(var j=0;j<=totalDataColumn;j++)
          {
            if(i==0) // Column name
            {
              params = params+"data"+iIndex+"_"+j+"="+document.getElementById("data"+i+"_"+j).value+"&";
              flag = 1;
            }
            else
            {
              // Send only update data on that row to save to database
              if(document.getElementById("data"+i+"_"+j).value != originalData[i][j] || action == "exportExcel" || dataReportType == "_r")
              {
                params = params+"data"+iIndex+"_"+j+"="+document.getElementById("data"+i+"_"+j).value+"&";
                flag = 1;
              }
              // Send other data on the same row that have update data
              else
                tempParams = tempParams+"data"+iIndex+"_"+j+"="+document.getElementById("data"+i+"_"+j).value+"&";
            }

//            alert("params="+params+", tempParams="+tempParams);

            data = document.getElementById("data"+i+"_"+j).value;
            // Ignore column name and date time value
            if(i>0 && j>0)
            {
              if(isFloat(data) == false)
              {
                if(isNumeric(document.getElementById("data"+i+"_"+j)) == false && action != "exportExcel")
                {
                  alert("à¸à¸£à¸¸à¸“à¸²à¹ƒà¸ªà¹ˆà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸›à¹‡à¸™à¸•à¸±à¸§à¹€à¸¥à¸‚à¸„à¹ˆà¸°");
                  document.getElementById("imgLoading").style.display = 'none';
                  grayOut(false);
                  return;
                }
//                else
//                  alert("This is number: "+data);
              }
//              else
//                alert("This is float: "+data);
            }
          }

          if(flag == 1)
          {
            iIndex++;
            // Send other data on the same row that have update data
            params = params+tempParams;
          }
          else if(action == "exportExcel")
          {
            // Send all data for export to excel
            params = params+tempParams;
          }
        }

        if(action == "saveData")
        {
          iIndex = iIndex-1;
          params = params+"totalDataRow="+iIndex+"&totalDataColumn="+totalDataColumn+"&";
        }
        else
          params = params+"totalDataRow="+totalDataRow+"&totalDataColumn="+totalDataColumn+"&";
      }
    }
    var url="includes/getMultiManReport.php";
    params = params+"action="+action+"&paramValue="+paramValue+"&endDate="+endDate+"&startDate="+startDate+"&stationId="+
        stationIdValue+"&reportType="+reportType+"&startYearMn="+startYearMn+"&startMonthMn="+startMonthMn+"&endYearMn="+endYearMn+"&endMonthMn="+endMonthMn+
      "&startTime="+startHour+":"+startMin+":"+startSec+"&endTime="+endHour+":"+endMin+":"+endSec+"&dataReportType="+dataReportType+"&showNumRow="+showNumRow+"&pageNo="+pageNo;
    params = params+"&startDateTimeCurrPage="+startDateTimeCurrPage+"&endDateTimeCurrPage="+endDateTimeCurrPage;
//  alert("params -> "+params);

    if(action == "showGraph")
    {
      xmlhttpMnReport.onreadystatechange=showGraphMnReport;
    }
    else if(action == "showTable" || action == "saveData")
    {
      xmlhttpMnReport.onreadystatechange=showTableMnReport;
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
      if(paramsNum>0 && document.getElementById("manualReportForm").totalDataRow != undefined && document.getElementById("data0_0") != null)
        // Send post request for export data to excel file
        post_to_url('./includes/exportExcel.php', arr_params);
      else
        alert("à¸‚à¸­à¸­à¸ à¸±à¸¢à¸„à¹ˆà¸° à¸„à¸¸à¸“à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸ªà¹ˆà¸‡à¸­à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸”à¹‰à¹€à¸™à¸·à¹ˆà¸­à¸‡à¸ˆà¸²à¸à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥");
    }

    if(action != "exportExcel")
    {
      xmlhttpMnReport.open("POST",url,true);

      //Send the proper header information along with the request
      xmlhttpMnReport.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttpMnReport.setRequestHeader("Content-length", params.length);
      xmlhttpMnReport.setRequestHeader("Connection", "close");
      xmlhttpMnReport.send(params);

      if(action == "saveData")
      {
        if(document.getElementById("data1_0").value != undefined && document.getElementById("data" + totalDataRow + "_0").value != undefined)
        {
          var startDateData,endtDateData,temp = new Array();
          temp = document.getElementById("data1_0").value.split(",");
          startDateData = temp[0] + "-" + temp[1] + "-" + temp[2] + " " + temp[3] + ":" + temp[4] + ":" + temp[5];
          temp = document.getElementById("data" + totalDataRow + "_0").value.split(",");
          endtDateData = temp[0] + "-" + temp[1] + "-" + temp[2] + " " + temp[3] + ":" + temp[4] + ":" + temp[5];
          if(dataReportType == "_h")
            alert("à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸–à¸²à¸™à¸µ " + document.getElementById("manualReportForm").stationId.value + " à¹€à¸§à¸¥à¸² " + startDateData + " à¸–à¸¶à¸‡ " + endtDateData + " à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢\nà¸à¸£à¸¸à¸“à¸²à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸”à¹‰à¹ƒà¸™à¸«à¸™à¹‰à¸² à¸ˆà¸±à¸”à¸à¸²à¸£à¸œà¸¥à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸§à¸±à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸›à¸£à¸°à¸¡à¸§à¸¥à¸œà¸¥à¸£à¸²à¸¢à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡");
          else
            alert("à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸–à¸²à¸™à¸µ " + document.getElementById("manualReportForm").stationId.value + " à¹€à¸§à¸¥à¸² " + startDateData + " à¸–à¸¶à¸‡ " + endtDateData + " à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢\nà¸à¸£à¸¸à¸“à¸²à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸”à¹‰à¹ƒà¸™à¸«à¸™à¹‰à¸² à¸ˆà¸±à¸”à¸à¸²à¸£à¸œà¸¥à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸§à¸±à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸›à¸£à¸°à¸¡à¸§à¸¥à¸œà¸¥");
        }
        else
          alert("à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢\nà¸à¸£à¸¸à¸“à¸²à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸”à¹‰à¹ƒà¸™à¸«à¸™à¹‰à¸² à¸ˆà¸±à¸”à¸à¸²à¸£à¸œà¸¥à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸§à¸±à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸›à¸£à¸°à¸¡à¸§à¸¥à¸œà¸¥");
      }
    }
  }
  else
    alert("à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸žà¸²à¸£à¸²à¸¡à¸´à¹€à¸•à¸­à¸£à¹Œà¸”à¹‰à¸²à¸™à¸‹à¹‰à¸²à¸¢à¸à¹ˆà¸­à¸™à¸„à¹ˆà¸°");

  document.getElementById("imgLoading").style.display = 'none';
  grayOut(false);
}

function post_to_url(url, params) {
    var form = document.createElement('form');
    form.action = url;
    form.method = 'POST';

    for (var i in params) {
        if (params.hasOwnProperty(i)) {
//          alert(i+'='+params[i]);
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = i;
            input.value = params[i];
            form.appendChild(input);
        }
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
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
