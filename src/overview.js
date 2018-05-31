// create svg canvas
const canvHeight = 300, canvWidth = 1240;
const svg = d3.select("body").append("svg")
    .attr("width", canvWidth)
    .attr("height", canvHeight)
    .style("border", "1px solid");
const svg2 = d3.select("body").append("svg")
    .attr("width", canvWidth)
    .attr("height", canvHeight)
    .style("border", "1px solid");

// calc the width and height depending on margins.
const margin = {top: 50, right: 80, bottom: 50, left: 80};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;
var barSpace = 5;

// 2. create the legend boxes and the text label
data = new Array();         //data Arrays
var monthData;
dataAll = new Array();
yearDomain = new Array();   //domain Arrays
sumDomain = new Array();
sumDomain2 = new Array();
monthDomain = ["Januar", "Februar", "Maerz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
xScale = new Array();       //scale Arrays
yScale = new Array();
xScale2 = new Array();
yScale2 = new Array();
colorScale = new Array();

// create parent group and add left and top margin
const g = svg.append("g")
    .attr("id", "chart-area")
    .attr("transform", "translate(" +margin.left + "," + margin.top + ")");
const g2 = svg2.append("g")
    .attr("id", "chart-area2")
    .attr("transform", "translate(" +margin.left + "," + margin.top + ")");

var data_bars = g.selectAll("rect");
var data_line = d3.line();
var titel = "Verkehrsunfälle mit Personenschäden in der BRD nach",
    monthTitel = " Monaten",
    yearTitel = " Jahren",
    monthViewText = "";

// chart title
svg.append("text")
    .attr("class", "titel")
    .attr("y", 0)
    .attr("x", margin.left)
    .attr("dy", "1.5em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .style("text-anchor", "left")
    .text(titel + yearTitel);
svg2.append("text")
    .attr("class", "titel2")
    .attr("y", 0)
    .attr("x", margin.left)
    .attr("dy", "1.5em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .style("text-anchor", "left")
    .text(titel + monthTitel + monthViewText);

function createLegend(legendDomain, colorScale) {
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + (canvWidth - margin.right - 63) + "," + margin.top + ")");
    const legend_entry = legend.selectAll("rect")
        .data(legendDomain)
        .enter();
    
    legend.append("rect")
        .attr("id", "legendborder")
        .attr("x", 1)
        .attr("y", 1);

    legend_entry.append("rect")
        .attr("class", "legendentry")
        .attr("x", 10)
        .attr("y", (d,i) => 30 * i + 10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => colorScale(d))
        .attr("stroke", "black")
        .attr("stroke-width", "1");
    legend_entry.append("text")
        .attr("class", "legendentry")
        .attr("x", 40)
        .attr("y", (d,i) => 30 * i + 25)
        .text(d => d);
}

d3.csv("./data/overview.csv", function(error, dataRaw){
    if (error) throw error;

    var selector = d3.select("body").append("div").classed("selector", true);
    //add checkboxes
    dataRaw.forEach(function(d) {
        selector.append("input")
            .attr("type","checkbox")
            .attr("class", "chkbox")
            .attr("name",d.Jahr)
            .attr("value",d.Jahr)
            .attr("id",d.Jahr)
            .attr("checked", true);
        selector.append("text")
            .text("'" + d.Jahr.substr(2,2) + "    ");
        if(d.Jahr.substr(3,1) === '0')
            selector.append('br');
    });
    //add buttons
    selector.append("input")
        .attr("class", "btn btnSelect")
        .attr("type","button")
        .attr("name","uncheck")
        .attr("value","Uncheck all")
        .attr("id","btnUncheck");
    selector.append("input")
        .attr("class", "btn btnSelect")
        .attr("type","button")
        .attr("name","check")
        .attr("value","Check all")
        .attr("id","btnCheck");
    var selectorbuttons = d3.select("body").append("div").classed("selectorbuttons", true);
    selectorbuttons.append("input")
        .attr("class", "btn")
        .attr("type","button")
        .attr("name","update")
        .attr("value","Update")
        .attr("id","btnUpdate");
    selectorbuttons.append("input")
        .attr("class", "btn")
        .attr("type","button")
        .attr("name","help")
        .attr("value","Help")
        .attr("id","btnHelp");

    document.getElementById ("btnUpdate").addEventListener ("click", updateSelection, false);
    document.getElementById ("btnHelp").addEventListener ("click", showHelp, false);
    document.getElementById ("btnHelpClose").addEventListener ("click", hideHelp, false);
    document.getElementById ("btnUncheck").addEventListener ("click", uncheckAll, false);
    document.getElementById ("btnCheck").addEventListener ("click", checkAll, false);

    dataAll = dataRaw;
    updateData();

    // Create tooltip
    var tooltip = d3.select("body").append("div").classed("tooltip", true);
    tooltip.style("visibility", "hidden");

    // add bars
    data_bars           // this is just an empty placeholder
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Jahr))
        .attr("y", d => yScale(d.Insgesamt))
        .attr("width", (width / data.length) - barSpace)
        .attr("height", d => height - yScale(d.Insgesamt))
        .style("fill", d => colorScale(d.Insgesamt))
        .on("mouseover", function(d, i) {
            d3.select(this)
                .style("fill-opacity" , 0.7);
            tooltip
                .html(`<b>${d["Jahr"]}</b><br/>`
                    + `Unfaelle:<br/>`
                    + `${d.Insgesamt}<br/>`)
                .style("visibility", "visible")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d,i) {
            d3.select(this)
                .style("fill-opacity" , 1);
            tooltip.style("visibility", "hidden")
        })
        .on('click', function(d,i) {
            monthData[0].count = +d.Januar;
            monthData[1].count = +d.Februar;
            monthData[2].count = +d.Maerz;
            monthData[3].count = +d.April;
            monthData[4].count = +d.Mai;
            monthData[5].count = +d.Juni;
            monthData[6].count = +d.Juli;
            monthData[7].count = +d.August;
            monthData[8].count = +d.September;
            monthData[9].count = +d.Oktober;
            monthData[10].count = +d.November;
            monthData[11].count = +d.Dezember;
            monthViewText = "im Jahr " + d.Jahr;
            updateScales();
            drawChart();
        });
    g2.append("path")
        .datum(monthData)
        .attr("class", "dataline");

    drawChart();
});

function updateSelection() {
    updateData();
    drawChart();
}

//check all checkboxes
function checkAll() {
    dataAll.forEach(function(d) {
        document.getElementById(d.Jahr).checked = true;
    });
}
//uncheck all checkboxes
function uncheckAll() {
    dataAll.forEach(function(d) {
        document.getElementById(d.Jahr).checked = false;
    });
}
function showHelp() {
    document.getElementById("help").style.display = "block";
}
function hideHelp() {
    document.getElementById("help").style.display = "none";
}

function updateData(){
    data = new Array();
    yearDomain = new Array();
    monthData = new Array(12);
    for(var i = 0;i < monthData.length; i++) {
        monthData[i] = new Object();
        monthData[i].count = 0;
    }
    monthData[0].month = "Januar";
    monthData[1].month = "Februar";
    monthData[2].month = "Maerz";
    monthData[3].month = "April";
    monthData[4].month = "Mai";
    monthData[5].month = "Juni";
    monthData[6].month = "Juli";
    monthData[7].month = "August";
    monthData[8].month = "September";
    monthData[9].month = "Oktober";
    monthData[10].month = "November";
    monthData[11].month = "Dezember";
    monthViewText = "summiert über gewählte Jahre";

    dataAll.forEach(function(d) {
        if (document.getElementById(d.Jahr).checked == true) {
            data.push(d);
            yearDomain.push(String(d.Jahr));
            monthData[0].count += +d.Januar;
            monthData[1].count += +d.Februar;
            monthData[2].count += +d.Maerz;
            monthData[3].count += +d.April;
            monthData[4].count += +d.Mai;
            monthData[5].count += +d.Juni;
            monthData[6].count += +d.Juli;
            monthData[7].count += +d.August;
            monthData[8].count += +d.September;
            monthData[9].count += +d.Oktober;
            monthData[10].count += +d.November;
            monthData[11].count += +d.Dezember;
        }
    });
    updateScales();
}
function updateScales() {
    sumDomain2 = d3.extent(monthData, d => Number(d.count));
    sumDomain = d3.extent(data, d => Number(d.Insgesamt));
    xScale = d3.scaleBand()
        .range([0, width])
        .domain(yearDomain);
    yScale = d3.scaleLinear()
        .rangeRound([height,0])
        .domain([sumDomain[0]-1000, sumDomain[1]])
        .nice(5);
    xScale2 = d3.scaleBand()
        .range([0, width])
        .domain(monthDomain);
    yScale2 = d3.scaleLinear()
        .rangeRound([height,0])
        .domain(sumDomain2)
        .nice(5);
    colorScale = d3.scaleLinear()
        .domain([d3.min(sumDomain), d3.max(sumDomain)])
        .range(['grey', 'darkred'])
        .interpolate(d3.interpolateHcl);
}

//draw and update the chart
function drawChart() {
    legendDomain = [d3.max(sumDomain), d3.min(sumDomain)];
    createLegend(legendDomain, colorScale);

    const trans = d3.transition()
        .duration(2000)
        .ease(d3.easeLinear);
    const data_bars = svg.selectAll(".bar")
        .data(data)
        .attr("class", "bar");
    const xA = d3.selectAll(".axis").remove();

// create xAxis
    const xAxis = d3.axisBottom(xScale);
    var xAxisText = g.append("g")  // create a group and add axis
        .attr("class", "axis xAxis")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .attr("x",0)
        .transition(trans)
        .call(xAxis.ticks(data.length));
    xAxisText = g.selectAll(".tick text")
        .attr("dy", 4);
    const xAxis2 = d3.axisBottom(xScale2);
    g2.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(xAxis2);

    // create yAxis
    //year diagram
    const yAxis = d3.axisRight(yScale)
        .tickSize(width + 40);
    svg.selectAll("yAxisText")
        .transition(trans)
        .remove();
    var yAxisText = g.append("g")  // create a group and add axis
        .attr("class", "axis yAxis")
        .attr("stroke-dasharray", "2,2")
        .attr("x", -50)
        .transition(trans)
        .call(yAxis);
    yAxisText.selectAll(".tick text")
        .attr("class", "yAxisText")
        .attr("x", -50);

    //month diagram
    const yAxis2 = d3.axisRight(yScale2)
        .tickSize(width + 40);
    var yAxis2Text = g2.append("g")
        .attr("class", "axis yAxis")
        .attr("stroke-dasharray", "2,2")
        .attr("x", -50)
        .transition(trans)
        .call(yAxis2);
    yAxis2Text.selectAll(".tick text")
        .attr("class", "yAxis2Text")
        .attr("x", -50);


    data_line
        .x(function(d) { return xScale2(d.month)+43; }) // set the x values for the line generator
        .y(function(d) { return yScale2(d.count); }); // set the y values for the line generator

    g2.selectAll(".dataline")
        .datum(monthData)
        .transition(trans)
        .attr("d", data_line);
    svg2.selectAll(".titel2")
        .transition(trans)
        .text(titel + monthTitel + " " + monthViewText);

    data_bars.exit()
        .transition(trans)
        .attr("y", height)
        .attr("height", 0)
        .style("fill-opacity", 0);

    // data that needs DOM = enter() (a set/selection, not an event!)
    data_bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Jahr))
        .attr("y", d => yScale(d.Insgesamt))
        .attr("width", (width / data.length) - barSpace)
        .attr("height", d => height - yScale(d.Insgesamt))
        .style("fill", d => colorScale(d.Insgesamt))
        .style("fill-opacity", 1);

    // the "UPDATE" set:
    data_bars
        .attr("class", "bar")
        .transition(trans)
        .attr("x", d => xScale(d.Jahr))
        .attr("y", d => yScale(d.Insgesamt))
        .attr("width", (width / data.length) - barSpace)
        .attr("height", d => height - yScale(d.Insgesamt))
        .style("fill", d => colorScale(d.Insgesamt))
        .style("fill-opacity", 1);
}

// text label for the x axis
g.append("text")
    .attr("y", height + margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Jahr");
g2.append("text")
    .attr("y", height + margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Monat");

// text label for the y axis
g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Anzahl");
g2.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Anzahl");

