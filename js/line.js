var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function lineData(topic, data){
    var datesExtracted = data["datesExtracted"]
    var dates = [];
    var  Dcount = [];
    for (var index in months){
        month = months[index]
    console.log("month is ", month, "dates ", datesExtracted[month]);
        dates.push(month);
        if (month in datesExtracted){
            Dcount.push(datesExtracted[month]);
        } else{
            Dcount.push("0");
        }


    }
    drawline(dates,Dcount,datesExtracted,topic);
}

function drawline(dates,Dcount,datesExtracted,topic){
    var margin = {top: 20, bottom: 70, left: 40, right: 20};
    var width = 570;
    var height = 300;

    var xScale = d3.scaleBand()
        .rangeRound([0, width-margin.left])
        .padding(1)
        .domain(dates.map(function (d) {
            return d;
        }))

    // 6. Y scale will use the randomly generate number 
    const yMax = Math.max(...Dcount)

    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, yMax])

    // 7. d3's line generator
    var line = d3.line()
        .x(function(d, i) { 
            console.log(d)
            return xScale(d);
        }) // set the x values for the line generator
        .y(function(d) {
            if (d in datesExtracted){
               return yScale(datesExtracted[d])
            }
            return yScale(0)
            }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    // 1. Add the SVG to the page and employ #2
    var svg = d3.select("#lineChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    // 9. Append the path, bind the data, and call the line generator 
    svg.append("path")
        .datum(dates) // 10. Binds data to the line 
        .attr("class", "line") // Assign a class for styling 
        .attr("d", line); // 11. Calls the line generator 
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margin.top))
        .attr("text-anchor", "middle")
        .attr("fill", "navajowhite")
        .style("font-size", "20px")
        .style("font-family", "serif")
        .style("text-decoration", "underline")
        .text("Frequency of " + topic );
    // 12. Appends a circle for each datapoint
    svg.selectAll(".dot")
        .data(dates)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d) { 
            return xScale(d) 
        })
        .attr("cy", function(d) {
            if (d in datesExtracted){
               return yScale(datesExtracted[d])
            }
            return yScale(0)
         })
        .attr("r", 5)
        .on("mouseover", function(a, b, c) { 
            this.attr('class', 'focus')
            })
        .on("mouseout", function() {  })

}
    