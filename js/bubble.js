var margin = 100;
var diameter = 600;
if (screen.width < 1300) {
    diameter = screen.width / 2 - 100;
}

var color = d3.scaleOrdinal(d3.schemeCategory10);
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", "0");


window.onload = function() {


    d3.json("symptomData.json", function(error, data) {
        if (error) {
            d3.select(".hello").text("error happended");
            return;
        }
        totalCurrentData = data;
        bubbleVisualization(data, 'symptom')
    });
};

var totalCurrentData = {}
var selectedTab = "symptom"
var element1 = document.getElementById("symptomLink");
var element2 = document.getElementById("diseaseLink");
var element3 = document.getElementById("topicLink");
element1.className = "nav-link active"
element2.className = "nav-link disabled"
element3.className = "nav-link disabled"
element1.onclick = function() {
    element1.className = "nav-link active"
    element2.className = "nav-link disabled"
    element3.className = "nav-link disabled"
    d3.json("symptomData.json", function(error, data) {
        if (error) {
            d3.select(".hello").text("error happended");
            return;
        }
        totalCurrentData = data;
        selectedTab = $("#symptomLink").text();
        $(".symptom-heading").text(selectedTab + " - Symptom Relation");
        $(".disease-heading").text(selectedTab + " - Disease Relation");
        selectedTab = selectedTab.toLowerCase();
        bubbleVisualization(data, 'symptom')
    });

};
element2.onclick = function() {
    element1.className = "nav-link disabled"
    element2.className = "nav-link active"
    element3.className = "nav-link disabled"
    $("#autocomplete").attr("placeholder", "Search Disease").val("").focus().blur();
    d3.json("diseaseData.json", function(error, data) {
        if (error) {
            d3.select(".hello").text("error happended");
            return;
        }
        totalCurrentData = data;
        selectedTab = $("#diseaseLink").text();
        $(".symptom-heading").text(selectedTab + " - Symptom Relation");
        $(".disease-heading").text(selectedTab + " - Disease Relation");
        selectedTab = selectedTab.toLowerCase();
        bubbleVisualization(data, 'disease')
    });
};
element3.onclick = function() {
    element1.className = "nav-link disabled"
    element2.className = "nav-link disabled"
    element3.className = "nav-link active"
    $("#autocomplete").attr("placeholder", "Search Topic").val("").focus().blur();
    d3.json("topicData.json", function(error, data) {
        if (error) {
            d3.select(".hello").text("error happended");
            return;
        }
        totalCurrentData = data;
        selectedTab = $("#topicLink").text();
        $(".symptom-heading").text(selectedTab + " - Symptom Relation");
        $(".disease-heading").text(selectedTab + " - Disease Relation");
        selectedTab = selectedTab.toLowerCase();
        bubbleVisualization(data, 'topic')
    });
};
/*function addingNewGraph(){

    var margin = {top: 20, right: 30, bottom: 20, left: 30},
    width = 450 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
}*/


function bubbleVisualization(data, type) {
    console.log("in bubbleVisualization");
    modifiedData = d3.nest().key(function(d) {
        return d[type];
    }).rollup(function(entry) {
        return {
            data: entry[0].value,
            count: entry[0].value.count > 150 ? 100 + (entry[0].value.count / 10) : entry[0].value.count
        };
    }).entries(data);
    modifiedData = {
        "children": modifiedData
    };
    console.log(modifiedData)
    var bubble = d3.pack(modifiedData)
        .size([diameter, diameter])
        .padding(1);

    d3.selectAll("#bubble-container svg").remove();

    var svg = d3.select("#bubble-container")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "my-bubble")
        .attr("id", "my-winner-bubble")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle");

    var leaves = d3.hierarchy(modifiedData)
        .sum(function(d) {
            if (d.value && parseInt(d.value.data.count) > 10) {
                return parseInt(d.value.count);
            } else {
                return 0;
            }
        })
        .sort(function(a, b) {
            return b.value - a.value;
        });;

    var node = svg.selectAll(".node")
        .data(bubble(leaves).descendants())
        .enter()
        .filter(function(d) {
            return !d.children
        })
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });



    node.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .style("fill", function(d, i) {
            return color(i);
        })
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(500)
                .style("cursor", "pointer")
                .attr("width", 60)
            addNetworkGraphs(d, type);
            tooltip.html("<span>" + d.data.key + " present in " + parseInt(d.data.value.data.count) + " answers " + "</span>")
            tooltip.style("top", (d3.event.pageY - 20) + "px").style("left", (d3.event.pageX + 20) + "px").style("display", "block").style("opacity", "1");
        })
        .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
        })
        .on('click', function(d) {
            console.log("in clicked");
            $(".popup-overlay, .popup-content").addClass("active");
            $('.popup-overlay').fadeIn(300);
            const lineChart = document.querySelector('#lineChart')
            if (lineChart.children.length) {
                lineChart.children[0].remove()
            }
            getbarCharts(d.data.key, d.data.value.data)
            lineData(d.data.key, d.data.value.data)
            $('#close').click(function() {
                $('.popup-overlay').fadeOut(300);
            });
        });


    node.append("text")
        .attr("dy", ".2em")
        .text(function(d) {
            return d.data.key + "\n"
        })
        .attr("font-size", function(d) {
            return d.r / 5;
        })
        .attr("fill", "white");

    node.append("text")
        .attr("dy", "1.3em")
        .text(function(d) {
            return parseInt(d.data.value.data.count);
        })
        .attr("font-size", function(d) {
            return d.r / 5;
        })
        .attr("fill", "white");


    d3.select(self.frameElement)
        .style("height", diameter + "px");

}



function addNetworkGraphs(data, type) {


    var color = d3.scaleOrdinal(d3.schemeCategory20).domain([0, 1]); //(d3.schemePastel1);
    diseaseJsonFormatted = {
        "links": [],
        "nodes": [{
            "frequency": 40,
            "group": 1,
            "name": data.data.key
        }]
    };
    var counter = 0;
    diseasesPresent = data.data.value.data.diseasesPresent;
    for (var i = 1; i < diseasesPresent.length; i++) {
        disease = diseasesPresent[i];
        if (counter == 10) {
            break;
        }
        link = {}
        link["source"] = data.data.key;
        link["target"] = disease["disease"];
        link["value"] = disease["value"];
        diseaseJsonFormatted.links.push(link);
        node = {};
        node["name"] = disease["disease"];
        node["group"] = 2;
        node["frequency"] = disease["value"];
        diseaseJsonFormatted.nodes.push(node);
        counter++;
    }
    diseaseGraph = diseaseJsonFormatted;
    var svg = d3.select(".disease-network")
    networkGraph(diseaseGraph, svg);


    symptomJsonFormatted = {
        "links": [],
        "nodes": [{
            "frequency": 40,
            "group": 1,
            "name": data.data.key
        }]
    };
    var counter = 0;
    symptomsPresent = data.data.value.data.symptomsPresent;
    for (var i = 1; i < symptomsPresent.length; i++) {
        symptom = symptomsPresent[i];
        if (counter == 10) {
            break;
        }
        link = {}
        link["source"] = data.data.key;
        link["target"] = symptom["symptom"];
        link["value"] = symptom["value"];
        symptomJsonFormatted.links.push(link);
        node = {};
        node["name"] = symptom["symptom"];
        node["group"] = 2;
        node["frequency"] = symptom["value"];
        symptomJsonFormatted.nodes.push(node);
        counter++;
    }
    symptomGraph = symptomJsonFormatted;

    var svg = d3.select(".symptom-network")
    networkGraph(symptomGraph, svg);


    //    drugJsonFormatted = {"links" :[], "nodes":[{"frequency": 40, "group" : 1, "name": data.data.key}]};
    //    var counter = 0;
    //    drugsPresent = data.data.value.data.drugsPresent;
    //    for(var i=1;i<drugsPresent.length;i++) {
    //        drug = drugsPresent[i];
    //        if (counter == 10) {
    //            break;
    //        }
    //        link = {}
    //        link["source"] = data.data.key;
    //        link["target"] = drug["drug"];
    //        link["value"] = drug["value"];
    //        drugJsonFormatted.links.push(link);
    //        node = {};
    //        node["name"] = drug["drug"];
    //        node["group"] = 2;
    //        node["frequency"] = drug["value"];
    //        drugJsonFormatted.nodes.push(node);
    //        counter++;
    //    }
    //    drugGraph = drugJsonFormatted;
    //
    //    var svg = d3.select(".drug-network")
    //    networkGraph(drugGraph, svg);
}



function networkGraph(graph, svg) {

    console.log(graph)
    var group_color = ["blue", "red", "#17becf"];
    var width = 400;
    var height = 400;
    var strength = -4000;
    if (screen.width < 1300) {
        width = 400;
        height = 280;
        strength = -1500;
    }

    svg.attr("width", width).attr("height", height);

    svg.selectAll("*").remove();
    var scaleForRadius = d3.scaleSqrt().domain([0, 150]).range([0, 50]);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) {
            return d.name;
        }))
        .force('charge', d3.forceManyBody()
            .strength(strength)
            .theta(0.8)
            .distanceMax(500)
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force('anti_collide', d3.forceCollide(function(d) {
            if (d.frequency > 25) {
                return scaleForRadius(45);
            }
            return scaleForRadius(d.frequency) + 20
        }));;



    var link = svg.append("g")
        .style("stroke", "white")
        .style("stroke-width", 1.5)
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    var node = svg.append("g")
        .style("stroke", "white")
        .style("stroke-width", 1.5)
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .attr("stroke", "white")
        .enter().append("circle").attr("stroke", "white")
        .attr("r", function(d) {
            if (d.frequency > 25) {
                return 25;
            }
            return d.frequency;
        })
        .attr("fill", function(d) {
            return group_color[d.group];
        })
        .on("click", function(d) {});



    var label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("stroke", "white")
        .attr("stroke-width", 0.4)
        .text(function(d) {
            console.log(d)
            return d.name + "(" + d.frequency + ")";
        })
    //        .on("click", function (d) {
    //            toolTip.style("visibility", "hidden");
    //            showChart(d.name);
    //            show_time_series(d.name);
    //            barChart(d.name);
    //            add(d.name);
    //            add_details(d.name);
    //        })
    //        .on("mouseover", function (d) {
    //            d3.select(this).style("opacity", 0);
    //            toolTip.text(d.name);
    //            toolTip.style("visibility", "visible");
    //            //d3.select(this).remove();
    //        })
    //        .on("mousemove", function (d) {
    //            d3.select(this).style("opacity", 0);
    //            toolTip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    //        })
    //        .on("mouseout", function (d) {
    //            /*d3.select(this).append("text")
    //                .attr("class", "label")
    //                .text(function (d) {
    //                    return d.name;
    //                }); */
    //            toolTip.style("visibility", "hidden");
    //            d3.select(this).style("opacity", 1);
    //        });


    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        node
            .attr("r", function(d) {
                if (d.frequency > 25) {
                    return 25;
                }
                return d.frequency;
            })
            .attr("fill", function(d) {
                return group_color[d.group];
            })
            .style("stroke", "#424242")
            .style("stroke-width", "1px")
            .attr("cx", function(d) {
                return d.x + 5;
            })
            .attr("cy", function(d) {
                return d.y - 3;
            });

        label
            .attr("x", function(d) {
                return d.x;
            })
            .attr("y", function(d) {
                return d.y;
            })
            .style("text-anchor", "middle")
            .style("font-size", "12px").style("fill", "#333");

    }


    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
    }

    function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
    }

    function dragended(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
        if (!d3.event.active) simulation.alphaTarget(0);
    }


}


$(document).ready(function() {
    $("#autocomplete").on("keyup", function() {

        var value = $(this).val().toLowerCase();
        console.log("in search ", totalCurrentData);
        var newTotalData = []
        if (value != null && value.length != 0) {
            for (var index in totalCurrentData) {
                var iteratedData = totalCurrentData[index];
                if (iteratedData[selectedTab].toLowerCase().startsWith(value)) {
                    /*
                                || iteratedData['disease'].startsWith(value) || itratedData['topic'].startsWith(value) ){
                    */
                    newTotalData.push(iteratedData);
                }
            }
            console.log("data is", newTotalData);
            bubbleVisualization(newTotalData, selectedTab);
        } else {
            bubbleVisualization(totalCurrentData, selectedTab);
        }
    });
});