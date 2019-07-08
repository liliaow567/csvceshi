var bodyWidth = document.body.offsetWidth;
var bodyHeight = window.innerHeight;
var figWidth =  0.63*bodyWidth, figHeight = 0.98* bodyHeight,
    textWidth = 0.36*bodyWidth;

var figZone = d3.select("#figzone").style("width", figWidth+"px");
var textZone = d3.select("#textzone").style("width", textWidth+"px");

var svg = figZone.append("svg").attr("height", figHeight).attr("width",figWidth);
var gLine = svg.append("g").attr("class","lines");
var gCircle = svg.append("g").attr("class","circles");
var gText = svg.append("g").attr("class","texts");

color = d3.scaleOrdinal(d3.schemeSet3);
color1 = [];
for (i in d3.range(10)){
    color1.push(color(i));
}

var jsonUrl = "https://raw.githubusercontent.com/liliaow567/csvceshi/master/firstaudoc.json";

d3.json(jsonUrl).then(function(raw_data){
    console.log(raw_data);
    // Data process
    var nodes = raw_data["nodes"];
    var links = raw_data["links"];
    var refs = raw_data["docs"];
    var adjList = [];
    links.forEach(function(d){
        key1 = d.source + "-" + d.target;
        key2 = d.target + "-" + d.source;
        adjList[key1] = true;
        adjList[key2] = true;
    })
    
    // ForceSimulation
    var simulation = d3.forceSimulation(nodes)
        // .force("charge", d3.forceManyBody().strength(-10))
        .force('center', d3.forceCenter(figWidth/2, figHeight/2))
        .force("link", d3.forceLink().links(links).strength(0).iterations(1))
        .force("collide", d3.forceCollide(25))
        // .force("r", d3.forceRadial(400, figWidth/2, figHeight/2).strength(0.3))
        .on("tick", ticked);

    // Plot
    lines = gLine.selectAll("line").data(links).enter().append("line");
    circles = gCircle.selectAll("circle").data(nodes).enter().append("circle");
    texts = gText.selectAll("text").data(nodes).enter().append("text");

    lines.attr("class", "authorLink")
        .style("stroke-width", weightWidth);

    circles.attr("r", paperRadius)
        .style("fill", groupFill)
        .on("mouseover", focus)
        .on("mouseout", unfocus)
        .on("click", sfocus);

    texts.attr("class","label")
        .text(function(d){return d["Name"];})
        .on("mouseover", focus)
        .on("mouseout", unfocus)
        .on("click", sfocus);
    
    svg.append("text").attr("class","restyle").attr("x",5).attr("y",20).text("RESTYLE").on("click", restyle);

    // Function
    function ticked() {
        circles.attr("cx", function(d){return d.x;})
            .attr("cy", function(d){return d.y;});

        lines.attr("x1", function(d){return d.source.x;})
        .attr("x2", function(d){return d.target.x;})
        .attr("y1", function(d){return d.source.y;})
        .attr("y2", function(d){return d.target.y;});

        texts.attr("x", function(d){return d.x;})
        .attr("y", function(d){return d.y;})
        .attr("dx", -25)
        .attr("dy", 6);
    }

    function ended(){
        testcir.attr("cx", function(d){return d.x;})
                .attr("cy", function(d){return d.y;})
    }

    function paperScale(x){
        // return 25*Math.log(x+5);
        // return Math.log(x+10);
        if (x<5){
            return 5;
        } else if(x<10){
            return 10;
        } else if (x<20){
            return 15;
        } else{
            return 20;
        }
    }

    function lineScale(x){
        return 0.5*Math.log(x+2);
    }
    var click_num = 0;
    function focus(d){
        if (!click_num){
            var aim = d3.select(d3.event.target).datum();
            circles.style("opacity", function(o){
                return neigh(o.index, aim.index) ? 1: 0.1;
            });
            texts.attr("display", function(o){
                return neigh(o.index, aim.index) ? "block": "none";
            });
            lines.style("opacity", function(o){
                return o.source.index == aim.index || o.target.index == aim.index ? 1: 0.1;
            });
            
            textZone.select("h1").remove();
            textZone.selectAll("p").remove();
            textZone.append("h1").attr("class","authornote").text(aim["Name"]);
            textZone.selectAll("p").data(aim["DocId"]).enter().append("p").attr("class","textnote").text(function(t){return refs[t];});
        }
    }

    function sfocus(d){
        var aim = d3.select(d3.event.target).datum();
        circles.style("opacity", function(o){
            return neigh(o.index, aim.index) ? 1: 0.1;
        });
        texts.attr("display", function(o){
            return neigh(o.index, aim.index) ? "block": "none";
        });
        lines.style("opacity", function(o){
            return o.source.index == aim.index || o.target.index == aim.index ? 1: 0.1;
        });
        
        textZone.select("h1").remove();
        textZone.selectAll("p").remove();
        textZone.append("h1").attr("class","authornote").text(aim["Name"]);
        textZone.selectAll("p").data(aim["DocId"]).enter().append("p").attr("class","textnote").text(function(t){return refs[t];});
        click_num = 1;
    }

    function unfocus(){
        if (!click_num){
            circles.style("opacity", 1);
            texts.attr("display", "block");
            lines.style("opacity", 1);
        }
    }

    function restyle(){
        circles.style("opacity", 1);
        texts.attr("display", "block");
        lines.style("opacity", 1);
        click_num = 0;
    }

    function neigh(a, b) {
        return a == b || adjList[a + "-" + b];
    }

    function paperRadius(d){
        return paperScale(d["Frequency"]);
        // return 20;
    }

    function groupFill(d){
        // return color1[0];
        if (d["Frequency"]<5){
            return color1[0];
        } else if(d["Frequency"]<10){
            return color1[1];
        } else if (d["Frequency"]<20){
            return color1[2];
        } else{
            return color1[3];
        }
    }

    function weightWidth(d){
        // return lineScale(d.weight);
        return 0.5;
    }

});

