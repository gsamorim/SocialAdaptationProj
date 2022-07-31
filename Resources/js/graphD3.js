import * as d3 from "https://unpkg.com/d3?module";
import { Agent, Link, Behavior, createLink } from "./agent.js";
import { chooseRandom, chooseRandomUnicode } from "./names.js";

var dataset = {
  nodes: [],
  links: [],
};

/* #region ---------- Canvas Region ---------- */

//get canva
const canvas = d3.select(".canva");

//define sizes
const width = 1140;
const height = 500;

//append canva svg
const svg = canvas
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "-20 -20 " + width + " " + height)
  .attr("style", "background: lightgray");

//zoom settings
let zoom = d3
  .zoom()
  .scaleExtent([1, 3])
  .translateExtent([
    [0, 0],
    [width, height],
  ])
  .on("zoom", handleZoom);
const container = svg.append("g");
function handleZoom(e) {
  container.attr("transform", e.transform);
}
function initZoom() {
  svg.call(zoom);
}

//1 - define the simulation
//let sim = d3.forceSimulation(dataset);
let sim = d3.forceSimulation();

//4 - setting forces
sim.force(
  "link",
  d3
    .forceLink()
    .id((d) => d.id)
    .distance((d) => d.value)
);
sim.force("center", d3.forceCenter(width / 2, height / 2));
sim.force("collide", d3.forceCollide(15));
sim.force("charge", d3.forceManyBody());
sim.force("radial", d3.forceRadial(100, width / 2, height / 2));
sim.on("tick", ticked);

//5 - define links
let links = container.append("g").attr("stroke", "black").selectAll("line");

//6 - define nodes
let nodes = container
  .append("g")
  .attr("r", 10)
  .attr("fill", "green")
  .attr("stroke", "black")
  .selectAll("circle");

//7 - Define Scales
var xScale = d3
  .scaleLinear()
  .domain([-50, 50]) //this is what is written on the axis: from 0 to 100
  .range([0, width]); //this is where the axis is placed: from 100px to 800px

var yScale = d3.scaleLinear().domain([50, -50]).range([0, height]);

//8 - Draw the axis
var xAxisG = container
  .append("g")
  .attr("transform", "translate(0," + yScale(0) + ")")
  .call(
    d3.axisBottom(xScale).tickValues([-40, -20, 20, 40]) // define ticks/labels values for axisbar
  )
  .call((g) =>
    g
      .select(".domain")
      .attr("stroke-width", "1,5")
      .attr("opacity", ".5")
      .attr("stroke-dasharray", "1,5")
  ) //remove line to add tick line;
  .call((g) =>
    g
      .selectAll(".tick line")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2,2")
  )
  .call((g) => g.selectAll(".tick text").attr("dy", 10).attr("opacity", 0.7));
var yAxisG = container
  .append("g")
  .attr("transform", "translate(" + xScale(0) + ",0)")
  .call(d3.axisRight(yScale).tickValues([-40, -20, 20, 40]))
  .call((g) =>
    g
      .select(".domain")
      .attr("stroke-width", "1,5")
      .attr("opacity", ".5")
      .attr("stroke-dasharray", "1,5")
  ) //remove line to add tick line;
  .call((g) =>
    g
      .selectAll(".tick line")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2,2")
  )
  .call((g) => g.selectAll(".tick text").attr("opacity", 0.7));

//define function to work at every tick of animation
function ticked() {
  //transform for circles
  //nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  //transform for groups, containing circles and text
  nodes.attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
  links
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);
}

//function responsable by the insertion/adaptation of nodes into the graph
function update() {
  //preciso ver os nodes, ver os ids e tal, talvez nodes.push para adicionar
  //caso queira q seja um node novo
  //adicionar id nos nodos, pq aparentemente estão sem id
  nodes = nodes
    .data(dataset.nodes, function (d) {
      return d.id;
    })
    .join(
      (enter) => {
        let enterG = enter.append("g");
        //pra voltar 1 nível na seleção
        //.select(function () { return this.parentNode; })
        enterG
          .append("circle")
          .attr("r", 10)
          .attr("fill", "blue")
          .attr("stroke", "black")
          .attr("opacity", 0)
          .call((enter) => enter.transition(750).attr("opacity", 1));
        enterG
          .append("text")
          .attr("font-size", "0.8em")
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .style("fill", "darkOrange")
          .attr("dy", (d) => 20)
          .text((d) => d.symbol);
        enterG
          .on("dblclick", clicked)
          .call(
            d3
              .drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          );
        return enterG;
      },
      (update) =>
        update.call((update) =>
          update
            .select("circle")
            .transition()
            .duration(500)
            .attr("fill", function (d) {
              if (d.id == selectedNode) return "pink";
              else return "orange";
            })
            .attr("opacity", 1)
        ),
      (exit) =>
        exit.call((exit) =>
          exit
            .attr("fill", "red")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove()
        )
    );

  links = links
    .data(dataset.links, function (d) {
      return d.source.id + "_" + d.target.id;
    })
    .join(
      (enter) =>
        enter
          .append("line")
          .attr("stroke-width", 2)
          .style("stroke", "red")
          .call((enter) => enter.transition(500).attr("opacity", 1)),
      (update) =>
        update.call((update) =>
          update
            .transition()
            .duration(500)
            .style("stroke", function (d) {
              if (d.source.id == selectedNode || d.target.id == selectedNode)
                return "green";
              else return "black";
            })
        ),
      (exit) => exit.remove()
    );

  sim.nodes(dataset.nodes);
  //sim.force("link").links(dataset.links);
  sim.alpha(1).restart();
}

//used for links
var lastSelected = null;

function clicked(event, d) {
  if (event.defaultPrevented) return; // dragged
  console.log(d.id); //show id of selected node, can be used to create new links
  if (!lastSelected) {
    var newSelected = d.id; //Fix here lastSelected and newSelected for links *************
  } else {
    lastSelected = d.id;
  }
  d3.select("#lblTeste").text(d.id);
  d3.select(this)
    .select("circle")
    .transition()
    .attr("fill", "black")
    .attr("r", 20)
    .transition()
    .attr("r", 10)
    .attr("fill", d3.schemeCategory10[d.index % 10]);
}

function dragstarted(event, d) {
  if (!event.active) sim.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
  d3.select(this).select("circle").raise().attr("stroke", "pink");
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) sim.alphaTarget(0);
  d.fx = null;
  d.fy = null;
  d3.select(this).select("circle").attr("stroke", "black");
}

initZoom();
update();

/* #endregion */

/* #region ---------- Nodes ---------- */
var selectedNode;

//button onclick additions
const btnAddNode = document.getElementById("btnAddNode");
btnAddNode.addEventListener("click", function () {
  newNode();
});
const btnUpdateNode = document.getElementById("btnUpdateNode");
btnUpdateNode.addEventListener("click", function () {
  updateNode();
});
const btnDeleteNode = document.getElementById("btnDeleteNode");
btnDeleteNode.addEventListener("click", function () {
  deleteNode();
});

function newNode() {
  //find free symbol
  var newSymbol = chooseRandomUnicode(dataset.nodes.map((a) => a.symbol));
  var newAgent = new Agent("a", newSymbol);
  selectedNode = newAgent.id;
  dataset.nodes.push(newAgent);
  update();
  redraw();
}

function updateNode() {
  //console.log(dataset);
  alert("Not Implemented!");
}

function deleteNode() {
  //verify if selected Node exists
  if (selectedNode !== undefined) {
    //delete links containing node source or target id equals to selectedNode
    dataset.links = dataset.links.filter(
      (x) => x.source.id != selectedNode && x.target.id != selectedNode
    );

    //delete method sometimes return [empty] instead of [] and bugs the system
    //that's why filtered it, improvements probably can be made.
    dataset.nodes = dataset.nodes.filter((x) => x.id != selectedNode);
    selectedNode = undefined;

    update();
    redraw();
  } else alert("No node selected for deletion.");
}

/* #region ---------- Data Treatment Region ---------- */

//redraws the entire board function
function redraw() {
  //draw nodes
  var divs = d3
    .select("#divNodes")
    .selectAll("a")
    .data(dataset.nodes, function (d) {
      return d.id;
    });
  divs.join(
    (enter) =>
      enter
        .append("a")
        .attr("xlink:href", "#")
        .attr("id", (d) => d.id)
        .text((d) => d.symbol)
        .style("background-color", "purple")
        .on("click", nodeSelection),
    (update) =>
      update.call((update) =>
        update
          .transition()
          .duration(500)
          .style("background-color", function (d) {
            if (d.id == selectedNode) return "blue";
            else return null;
          })
      ),
    (exit) => exit.remove()
  );

  //draw nodes for Selected Node Links
  var divs = d3
    .select("#divNodeLinks")
    .selectAll("a")
    .data(dataset.nodes, function (d) {
      return d.id;
    });
  //filter links containing selectedNode as source or target
  var filtredLinks = dataset.links.filter(
    (x) => x.source.id == selectedNode || x.target.id == selectedNode
  );
  divs.join(
    (enter) =>
      enter
        .append("a")
        .attr("xlink:href", "#")
        .attr("id", (d) => d.id)
        .text((d) => "⇅" + d.symbol)
        .style("background-color", "black")
        .on("click", nodeLinkClick),
    (update) =>
      update.call((update) =>
        update
          .transition()
          .duration(500)
          .style("background-color", function (d) {
            if (d.id == selectedNode) return "black";
            //check filtredLinks for the d.id, if true d.id is linked to selectedNode
            else if (
              filtredLinks.find(
                (x) => x.source.id == d.id || x.target.id == d.id
              )
            )
              return "green";
            else return null;
          })
      ),
    (exit) => exit.call((exit) => exit.remove())
  );

  //draw behaviors for selected node
}

//function that paint the selected node li and remove color of the others
function nodeSelection() {
  selectedNode = this.id;

  update();
  redraw();
}

//in progress function
function nodeLinkClick() {
  var selectedNodeLink = this.id;

  //if element clicked is the same as selected them show alert
  if (selectedNodeLink == selectedNode) {
    alert("self links not supported.");
    return;
  }

  //create newLink or remove if already exists
  createLink(dataset, selectedNode, selectedNodeLink);

  update();
  redraw();
}

/* #endregion */

/* #region ---------- ????? Region ---------- */

//button onclick additions
const btnAddBehavior = document.getElementById("btnAddBehavior");
btnAddBehavior.addEventListener("click", function () {
  newBehavior();
});
const btnUpdateBehavior = document.getElementById("btnUpdateBehavior");
btnUpdateBehavior.addEventListener("click", function () {
  updateBehavior();
});
const btnDeleteBehavior = document.getElementById("btnDeleteBehavior");
btnDeleteBehavior.addEventListener("click", function () {
  deleteBehavior();
});

function newBehavior() {
  //console.log(dataset);
  alert("Not Implemented!");
}

function updateBehavior() {
  //console.log(dataset);
  alert("Not Implemented!");
}

function deleteBehavior() {
  //console.log(dataset);
  alert("Not Implemented!");
}

/* #endregion */

/* #region ---------- Threshold Region ---------- */

const rangeThreshold = document.getElementById("rangeThreshold");
const lblThreshold = document.getElementById("lblThreshold");
rangeThreshold.addEventListener("input", function () {
  lblThreshold.innerHTML = this.value;
});
lblThreshold.innerHTML = rangeThreshold.value;
/* #endregion */

/* #region ---------- Settings Region ---------- */

const btnShowHideAxis = document.getElementById("btnShowHideAxis");
btnShowHideAxis.addEventListener("change", function () {
  if (this.checked) {
    xAxisG.style("opacity", 1);
    yAxisG.style("opacity", 1);
  } else {
    xAxisG.style("opacity", 0);
    yAxisG.style("opacity", 0);
  }
});

/* #endregion */

/* #region ---------- ????? Region ---------- */

//randomDataFill();

/* #endregion */
