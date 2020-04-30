var key = "";
function getbarCharts(sym, data) {

    var symptoms = data["symptomsPresent"];
    var diseases= data["diseasesPresent"];
    var drugs = data["drugsPresent"]
    key = sym;
    console.log("sym", symptoms.symptom)
    if (symptoms.length > 15 ) {
        symptoms = symptoms.slice(0, 15);
    }
    if (diseases.length > 15) {
        diseases = diseases.slice(0, 15);
    }
    if (drugs.length > 15) {
        drugs = drugs.slice(0, 15);
    }
    barGraph(symptoms, '#symptom-barChart', 'symptom');
    barGraph(diseases, '#disease-barChart', 'disease');
    barGraph(drugs, '#drug-barChart', 'drug');

}

function barGraph(data, className, type) {
    var margin = {top: 20, bottom: 70, left: 40, right: 20};
    var width = 630;
    var height = 300;
    var svg = d3.select(className)
        .attr('height', height )
        .attr('width', width )
        //.attr("style", "outline: 1px solid black;")   //This will do the job
        .attr('transform', 'translate(0,20)');
    svg.selectAll("*").remove();

    var xScale = d3.scaleBand()
                .rangeRound([0, width-margin.left])
                .padding(0.1).domain(data.map(function (d) {
                    return d[type];
                }));

    var yScale = d3.scaleLinear()
        .rangeRound([height, margin.bottom+10]).domain([0, d3.max(data, function (d) {
            return Number(d.value*1.3);
        })]);

    var yAxis = d3.axisLeft().scale(yScale).ticks(5);

    svg.append("g")
        .attr("transform", "translate("+ margin.left + "," + (height - margin.bottom) + ")")
        .attr("class","axisRed")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("font-family", "serif")
        .attr("transform", "rotate(-45)translate(-30,-15)");

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ","+ (0 - margin.bottom) +")")
        .attr("class", "axisRed")
        .call(yAxis)
        .append("text")
        .attr("transform", "translate(30,60)")
        .attr("x", -20)
        .attr("y", 2)
        .attr("dy", "15px")
        .attr("line", "black")
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .attr("font-family", "serif")
        .text("Freq");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margin.top))
        .attr("text-anchor", "middle")
        .attr("fill", "navajowhite")
        .style("font-size", "20px")
        .style("font-family", "serif")
        .style("text-decoration", "underline")
        .text(type + "s related to " + key);


    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return (xScale(d[type])+margin.left);
        })
        .attr("y", function (d) {
            return (yScale(Number(d.value))-margin.bottom);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return height - yScale(Number(d.value));
        }).attr("fill","#20B2AA");
}

