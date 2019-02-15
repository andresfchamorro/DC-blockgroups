
var map_width = +1000,
    map_height = +800;

var leg_width = +400,
    leg_height = +350;

var map_svg = d3.select("#map_container")
  .append("svg")
  .attr("width", map_width)
  .attr("height", map_height);

// var legend_div = d3.select("#legend_container")
//   .append("div")
//   .attr("width", leg_width)
//   .attr("height", leg_height);

var proj = d3.geoConicConformal()
  .parallels([38 + 18 / 60, 39 + 27 / 60])
  .rotate([77, 0])
  .center([0, 38.93])
  .scale(200000);

// var proj = d3.geoConicConformal()
//     .rotate([77, 0])
//     .center([0, 37.66])
//     .parallels([38.3, 39.45])

var path = d3.geoPath().projection(proj);

var formatLong = d3.format(",");
var formatPer = function(d){
  return d + "%";
}
var formatPerD3 = d3.format(".0%");
var formatK = d3.format(".2s");
//d3.format(".0s")

var x_per = d3.scaleLinear()
    .domain([0, 100])
    .rangeRound([0, 320]);

var x_inc = d3.scaleLinear()
    .domain([0, 240000])
    .rangeRound([0, 320]);

var x_rent = d3.scaleLinear()
    .domain([0, 3100])
    .rangeRound([0, 320]);

var x_val = d3.scaleLinear()
    .domain([200000, 1800000])
    .rangeRound([0, 320]);

var y_change = d3.scaleLinear()
    .domain([-1,1])
    .rangeRound([250, 0]);

var range_per = d3.range(10,100,10);
// var range_inc = d3.range(32000,240000,32000);

var range_inc = d3.range(20000,240000,25000)
//var range_inc = d3.range(20000,240000,20000);

var range_rent = d3.range(400,3100,300);
// var range_rent = d3.range(400,3200,400);

var range_val = d3.range(400000,1800000,160000);
// var range_val = d3.range(400000,1800000,200000);

// var color_per = d3.scaleThreshold()
//     .domain(d3.range(20,90,10))
//     .range(d3.schemeBlues[8]);
//
// var color_per2 = d3.scaleThreshold()
//     .domain(d3.range(20,90,10))
//     .range(d3.schemeReds[8]);
//
// var color_inc = d3.scaleThreshold()
//     .domain(d3.range(32000,240000,32000))
//     .range(d3.schemeGreens[8]);
//
// var color_rent = d3.scaleThreshold()
//     .domain(d3.range(400,3200,400))
//     .range(d3.schemeOranges[8]);
//
// var color_val = d3.scaleThreshold()
//     .domain(d3.range(400000,1800000,200000))
//     .range(d3.schemeBrBG[8]);

// var color_change = d3.scaleThreshold()
//     .domain(d3.range(-1,1.2,0.2))
//     .range(d3.schemeRdYlGn[11]);

// var interpolate_col = d3.scaleLinear()
//   .domain([-1,1])
//   .range([d3.color("#B2771E"), d3.color('#0C6BB2')])
//   .interpolate(d3.interpolateHcl);

// d3.interpolateInferno(t)

var rescaleInferno = d3.scaleLinear()
    .domain([-1,1])
    .range([0.2,1]);

var color_array = [];
//var col_range = d3.range(-1,1.2,0.2);

var col_range = [-1,-0.5,-0.25,0,0.25,0.5,1];

for (each in col_range) {
  // var newcol = interpolate_col(col_range[each]);
  var newcol = d3.interpolateInferno(rescaleInferno(col_range[each]))
  color_array.push(newcol);
}

// d3.schemePuOr[8]
var newscheme = ["#0f354a","#4881a1","#7eb7d6","#c0ecff",
"#f7e1d7","#febc99","#aa6c4f","#410302"]

var color_change = d3.scaleThreshold()
    .domain(col_range)
    .range(newscheme);

var data, bbox;

var sel_year = "16";
var sel_indicator;

var indicators = {};
//indicator['ind'] = [title,variable name, position of scale, color scale, x scale, format]
indicators['homeownership'] = ["Homeownership Rate","own_sh_",40,range_per,x_per,formatPer];
indicators['college'] = ["Share with college degree","coll_sh_",100,range_per,x_per,formatPer];
indicators['rent'] = ["Median Rent","rent_",160,range_rent,x_rent,formatLong];
indicators['value'] = ["Median House Value","value_",220,range_val,x_val,formatK];
indicators['income'] = ["Median Annual Income","income_",280,range_inc,x_inc,formatK];

// var legend_div = d3.select("#map_container")
//   .append("div")
//   .attr("width", 200)
//   .attr("height", 450)
//   .attr("class","legend");

// var legend_svg = d3.select("#map_container")
//   .append("svg")
//   .attr("width", 200)
//   .attr("height", 450)
//   .attr("class","legend");

var g_legend = map_svg.append("g")
    .attr("transform", "translate(175," + "420" + ")")
    .attr("class","legend");

g_legend.call(d3.axisLeft(y_change)
    .tickSize(18)
    .tickFormat(formatPerD3)
    .tickValues(color_change.domain()))
    .attr("pointer-events","none")
    // .attr("class",indicator_class)
  .select(".domain")
    .remove();

g_legend.selectAll("rect")
  .data(color_change.range().map(function(d) {
      d = color_change.invertExtent(d);
      if (d[0] == null) d[0] = y_change.domain()[0]-0.5;
      if (d[1] == null) d[1] = y_change.domain()[1]+0.5;
      return d;
    }))
  .enter().append("rect")
    .attr("width", 20)
    .attr("x","-10px")
    .attr("y", function(d) { return y_change(d[1]); })
    .attr("height", function(d) { return y_change(d[0]) - y_change(d[1]); })
    .attr("fill", function(d) { return color_change(d[0]); });
    // .attr("class",indicator_class);


function createLegend(indicator){

  name = indicators[indicator][0];
  var_name = indicators[indicator][1];
  pos = indicators[indicator][2];
  range_scale = indicators[indicator][3];
  x_scale = indicators[indicator][4];
  format = indicators[indicator][5];

  var indicator_class = indicator+"_sel"

  var indicator_div = d3.select("#legend_container")
    .append("div")
    .attr("class",indicator_class+" key")
    .on("click", function(d){
      return updateChoro(indicator);
    });

  var indicator_svg = indicator_div.append("svg")
      .attr("width", 340)
      .attr("height", 55);

  var g = indicator_svg.append("g")
      .attr("transform", "translate(10," + "25" + ")");
      // .attr("class", indicator_class);

  // var indicator_box = g.append("rect")
  //   .attr("class",indicator_class+" key")
  //   .attr("transform", "translate(-10," + -20 + ")")
  //   .attr("width", 280)
  //   .attr("height", 55);

  g.call(d3.axisBottom(x_scale)
      .tickSize(18)
      .tickFormat(format)
      .tickValues(range_scale))
      .attr("pointer-events","none")
      // .attr("class",indicator_class)
    .select(".domain")
      .remove();

  // g.selectAll("rect")
  //   .data(color_scale.range().map(function(d) {
  //       d = color_scale.invertExtent(d);
  //       if (d[0] == null) d[0] = x_scale.domain()[0];
  //       if (d[1] == null) d[1] = x_scale.domain()[1];
  //       return d;
  //     }))
  //   .enter().append("rect")
  //     .attr("height", 14)
  //     .attr("x", function(d) { return x_scale(d[0]); })
  //     .attr("width", function(d) { return x_scale(d[1]) - x_scale(d[0]); })
  //     .attr("fill", function(d) { return color_scale(d[0]); });
      // .attr("class",indicator_class);

  g.append("text")
      .attr("class", "caption")
      .attr("x", x_scale.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .attr("font-size","14px")
      .text(name)
      .attr("class",indicator_class+" key_text")
      .attr("pointer-events","none");

  // d3.selectAll("."+indicator_class).on("click", function(d){
  //   return updateChoro(indicator);
  // });

  d3.selectAll("."+indicator_class).on("mouseover", function(d){
    // d3.selectAll("."+indicator_class+".key")
    //   .attr("background-color", "red")
    //   .attr("border", "double");
    d3.selectAll("."+indicator_class+".key_text")
      .attr("fill", "white");
  });

  d3.selectAll("."+indicator_class).on("mouseout", function(d){
    // d3.selectAll("."+indicator_class+".key")
    //   .attr("background-color", "red");
    d3.selectAll("."+indicator_class+".key_text")
      .attr("fill", "#000");
  });

  tmp = [-100000,-100000];

	defs = indicator_svg.append("defs")

	defs.append("marker")
			.attrs({
				"id":"arrow",
				"viewBox":"0 -5 10 10",
				"refX":5,
				"refY":0,
				"markerWidth":4,
				"markerHeight":4,
				"orient":"auto"
			})
			.append("path")
				.attr("d", "M0,-5L10,0L0,5")
				.attr("class","marker");

	defs.append("marker")
			.attrs({
				"id":"stub",
				"viewBox":"-1 -5 2 10",
				"refX":0,
				"refY":0,
				"markerWidth":4,
				"markerHeight":4,
				"orient":"auto"
			})
			.append("path")
				.attr("d", "M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z")
				.attr("class","marker");

  var valueline = d3.line()
      .x(function(d) { return x_scale(d); })
      .y(7);

  var trend = g.selectAll(".trend")
    .data([tmp])
    .enter()
    .append("path")
    .attr("class", "trend")
    .attr("transform", "translate(0," + 0 + ")")
    .attr("d", valueline)
    .attr("marker-end","url(#arrow)")
    .attr("marker-start","url(#stub)")
    .classed(indicator, true);

}

function updateChoro(indicator){

  d3.selectAll(".key")
    .style("border", "0px")
    .style("border-color", "none")
    .style("box-shadow", "none");

  d3.selectAll("."+indicator+"_sel"+".key")
    .style("border", "1px solid transparent")
    .style("border-color", "#343a40")
    .style("box-shadow", "0 0 0 0.2rem rgba(52,58,64,.5)");

  name = indicators[indicator][0];
  var_name = indicators[indicator][1];
  pos = indicators[indicator][2];
  color_scale = color_change;
  x_scale = indicators[indicator][4];
  format = indicators[indicator][5];
  // year = sel_year;
  sel_indicator = indicator;
  indicator_t2 = var_name+"16";
  indicator_t1 = var_name+"09";
  // if(sel_year="16"){
  //   otheryear = "09";
  // }
  // else {
  //   otheryear = "16";
  // }
  // indicator_otherval = var_name+otheryear;

  bg = map_svg.selectAll(".bg")
    .style("fill",function(d){
      if(+d.properties[indicator_t1]==0 || +d.properties[indicator_t2]==0 ){
        return "#DEDEDE";
      }
      else{
        delta = (d.properties[indicator_t2] - d.properties[indicator_t1]) / d.properties[indicator_t1]
        return color_scale(delta);
      }
    });

}

function updateAllCircles(bg_data){
  for (each in indicators){
    updateCircles(each,bg_data);
  }
}

function updateCircles(indicator,bg_data){

  name = indicators[indicator][0];
  var_name = indicators[indicator][1];
  x_scale = indicators[indicator][4];
  var1 = var_name+"09"
  var2 = var_name+"16"
  line_class =".trend."+indicator
  // circle_class_t1 = "."+indicator+" t1";
  // circle_class_t2 = "."+indicator+" t2";
  t1 = bg_data.properties[var1]
  t2 = bg_data.properties[var2]
  t1_t2 = [t1,t2];
  tmp = [-100000,-100000];

  var valueline = d3.line()
      .x(function(d) { return x_scale(d); })
      .y(7);

  if (t1==0|t2==0) {
    var trend = d3.selectAll(line_class)
        .data([tmp]);
    console.log("problem with a 0");
    trend.exit().remove();
    trend.enter()
        .append("path")
        .merge(trend)
        .attr("class", "trend")
        .classed(indicator, true)
        .attr("transform", "translate(0," + 0 + ")")
        .attr("marker-end","url(#arrow)")
        .attr("d", valueline);
  }
  else {
    var trend = d3.selectAll(line_class)
        .data([t1_t2]);
    trend.exit().remove();
    trend.enter()
        .append("path")
        .merge(trend)
        .attr("class", "trend")
        .classed(indicator, true)
        .attr("transform", "translate(0," + 0 + ")")
        .attr("marker-end","url(#arrow)")
        .transition()
        .duration(500)
        .attr("d", valueline);
  }

}
/*
Ideally here I would select another element (a marker, not circle),
and update it's locatino based on the midpoint (average of t1 and t2)
I would also need to update the direction based on wether t2 - t1 is pos or neg
And make sure all of these transitions are smooth
see: http://bl.ocks.org/tomgp/d59de83f771ca2b6f1d4
http://bl.ocks.org/dustinlarimer/5888271
*/


for (each in indicators){
  createLegend(each);
}

d3.queue()
    .defer(d3.json, "data/bg_09_16_sj.json")
    .defer(d3.json, "data/neighborhoods.geojson")
    .await(ready);

function ready(error, blocks, hoods) {
  // bbox = blocks.bbox;

  if (error) throw error;

  map_svg.append("g")
    .selectAll("path")
    .data(topojson.feature(blocks, blocks.objects.bg_09_16_sj).features)
    .enter().append("path")
      .attr("d", path)
      .attr("class","bg")
      .on("click", function(d){

        d3.selectAll(".selected")
          .classed("selected",false);
        d3.select(this)
          .classed("selected",true);
        d3.selectAll("#neighborhood_name")
          .text(d.properties.NAME+',');
        d3.selectAll("#block_name")
          .text(" "+d.properties.NAMELSAD);
        updateAllCircles(d);
      })
      .on("mouseover", function(d){

        const coordinates = [d3.event.pageX, d3.event.pageY];
        var_name = indicators[sel_indicator][1];
        format = indicators[sel_indicator][5];
        indicator_t2 = var_name+"16";
        indicator_t1 = var_name+"09";

        d3.select("#tooltip")
          .classed("hidden",false)
          .style("left",(coordinates[0]+5) + "px")
          .style("top", (coordinates[1]+5) + "px");
        d3.select("#tooltip_name")
          .text(d.properties.NAME+", BG "+d.properties.BLKGRPCE);
        d3.select("#tooltip_09")
          .text(format(Math.round(+d.properties[indicator_t1])));
        d3.select("#tooltip_16")
          .text(format(Math.round(+d.properties[indicator_t2])));
      })
      .on("mouseout", function(){
        d3.select("#tooltip")
          .classed("hidden", true);
      });


  map_svg.append("svg:image")
    .attrs({
      'xlink:href': 'data/Roads_Pretty-02.png',
      x: 154.18525009240216,
      y: 19.95578578885761,
      width: 572.3,
      opacity: 0.6
    });

  g_labels = map_svg.append("g")

  hoods = g_labels.selectAll(".label_hoods")
    .data(hoods.features)
    .enter()
    .append("text")
    .attr("class", "label_hoods")
    .attr("transform", function(d){
      return "translate(" + path.centroid(d) + ")";
    })
    .text(function(d){
      return d.properties.NAME;
    });

  updateChoro("homeownership");

}
