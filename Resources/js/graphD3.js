import * as d3 from "https://unpkg.com/d3?module";
import {
  Agent,
  Link,
  Behavior,
  createLink,
  Assumption,
  newAssumption,
} from "./agent.js";
import { chooseRandom, chooseRandomUnicode, allSymbols } from "./names.js";
import { chooseRandomBehavior } from "./behaviorsEx.js";
import { TxtWorker } from "./txtWorker.js";

var dataset = {
  nodes: [],
  links: [],
  behaviors: [],
  assumptions: [],
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
function updateCanva() {
  //preciso ver os nodes, ver os ids e tal, talvez nodes.push para adicionar
  //caso queira q seja um node novo
  //adicionar id nos nodos, pq aparentemente estão sem id
  nodes = nodes.data(dataset.nodes).join(
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
    (update) => {
      update
        .select("circle")
        .transition()
        .duration(500)
        .attr("fill", function (d) {
          if (d.id == selectedNode) return "pink";
          else return "orange";
        })
        .attr("opacity", 1);
      update.select("text").text((d) => d.symbol);
      return update;
    },
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

  links = links.data(dataset.links).join(
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
updateCanva();

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
const btnDeleteNode = document.getElementById("btnConfirmDetion");
btnDeleteNode.addEventListener("click", function () {
  deleteNode();
});

function newNode() {
  //find free symbol
  var newSymbol = chooseRandomUnicode(dataset.nodes.map((a) => a.symbol));
  var newAgent = new Agent(newSymbol.name, newSymbol.symbol);
  selectedNode = newAgent.id;
  dataset.nodes.push(newAgent);
  updateCanva();
  redraw();
  showNode();
}

//function that fill input type select for symbols
function fillSymbolsForSelection() {
  var symbols = allSymbols();
  var sel = d3.select("#selNodeSymbol");
  //sel.on("change", onchange);
  //for on change check: http://bl.ocks.org/jfreels/6734823

  var options = sel
    .selectAll("option")
    .data(symbols)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    });
}
fillSymbolsForSelection();

function updateNode() {
  //verify if selected Node exists
  if (selectedNode !== undefined) {
    var id = d3.select("#tbxNodeId").node().value;
    var symbol = d3.select("#selNodeSymbol").node().value;
    var name = d3.select("#tbxNodeName").node().value;
    if (symbol == "" || name == "") {
      alert("Symbol or name field empty warning.");
      return;
    }

    //Find index of specific object using findIndex method.
    var objIndex = dataset.nodes.findIndex((obj) => obj.id == id);

    //Update object properties.
    dataset.nodes[objIndex].name = name;
    dataset.nodes[objIndex].symbol = symbol;

    //update input type text and select
    d3.select("#selNodeSymbol").property("value", symbol);
    d3.select("#tbxNodeName").property("value", name);
    redraw();
    updateCanva();
    alert("Updated with sucess!");
  } else alert("No node selected for update.");
}

function deleteNode() {
  //verify if selected Node exists
  if (selectedNode !== undefined) {
    //delete links containing node source or target id equals to selectedNode
    dataset.links = dataset.links.filter(
      (x) => x.source.id != selectedNode && x.target.id != selectedNode
    );
    //delete assumption containing node id
    dataset.assumptions = dataset.assumptions.filter(
      (x) => x.agent.id != selectedNode
    );

    //delete method sometimes return [empty] instead of [] and bugs the system
    //that's why filtered it, improvements probably can be made.
    dataset.nodes = dataset.nodes.filter((x) => x.id != selectedNode);
    selectedNode = undefined;

    updateCanva();
    redraw();
    cleanNode();
  } else alert("No node selected for deletion.");

  //hide modalDeleteNode
  d3.select("#modalDeleteNode").style("display", "none");
}

/* #region ---------- Data Treatment Region for First Tab ---------- */

//show selected node data
function showNode() {
  if (selectedNode !== undefined) {
    var realNode = dataset.nodes.find((x) => x.id === selectedNode);
    d3.select("#tbxNodeId").property("value", realNode.id);
    d3.select("#selNodeSymbol").property("value", realNode.symbol);
    d3.select("#tbxNodeName").property("value", realNode.name);
  } else alert("No node selected to show data.");
}
function cleanNode() {
  d3.select("#tbxNodeId").attr("value", "");
  d3.select("#selNodeSymbol").property("value", "-----");
  d3.select("#tbxNodeName").attr("value", "");
}

//redraws the entire board function
function redraw() {
  //hide span message
  d3.select("#spanNodeDiv").style("display", "none");
  d3.select("#spanNodeLinkDiv").style("display", "none");

  //draw nodes on the div list area
  var divs = d3.select("#divNodes").selectAll("a").data(dataset.nodes);
  divs.join(
    (enter) =>
      enter
        .append("a")
        .attr("xlink:href", "#")
        .attr("id", (d) => d.id)
        .text((d) => d.symbol)
        .style("background-color", "purple")
        .on("click", nodeSelection),
    (update) => {
      update.call((update) =>
        update
          .transition()
          .duration(500)
          .text((d) => d.symbol)
          .attr("id", (d) => d.id)
          .style("background-color", function (d) {
            if (d.id == selectedNode) return "blue";
            else return null;
          })
      );
      return update;
    },
    (exit) => exit.remove()
  );

  //draw nodes for Selected Node Links
  var divs = d3.select("#divNodeLinks").selectAll("a").data(dataset.nodes);
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
          .text((d) => "⇅" + d.symbol)
          .attr("id", (d) => d.id)
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
  //draw behavior on div list area
  var divsBeh = d3
    .select("#divNodeBehaviors")
    .selectAll("a")
    .data(dataset.behaviors);
  var filtredAssumption = dataset.assumptions.filter(
    (x) => x.agent.id == selectedNode
  );
  divsBeh.join(
    (enter) =>
      enter
        .append("a")
        .attr("xlink:href", "#")
        .attr("id", (d) => d.id)
        .text((d) => d.short)
        .on("click", nodeBehaviorSelection),
    (update) =>
      update.call((update) =>
        update
          .transition()
          .duration(500)
          .text((d) => d.short)
          .attr("id", (d) => d.id)
          .style("background-color", function (d) {
            if (filtredAssumption.find((x) => x.behavior.id == d.id))
              return "green";
            else return null;
          })
      ),
    (exit) => exit.remove()
  );
}

//function that paint the selected node li and remove color of the others ***
//kind useless for now
function nodeSelection() {
  //need to find real id
  selectedNode = Number(this.id);
  console.log("new selectedNode" + this.id);

  updateCanva();
  redraw();
  showNode();
}

//function when clicking link, need to finish********
function nodeLinkClick() {
  var selectedNodeLink = this.id;

  if (!selectedNode) {
    alert("First you need to select a node.");
    return;
  }

  //if element clicked is the same as selected them show alert
  if (selectedNodeLink == selectedNode) {
    alert("self links not supported.");
    return;
  }

  //create newLink or remove if already exists
  createLink(dataset, selectedNode, selectedNodeLink);

  updateCanva();
  redraw();
}

/* #endregion */

/* #region ---------- Behavior Region ---------- */
var selectedBeh;

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
  var newChossenBeh = chooseRandomBehavior(
    dataset.behaviors.map((a) => a.short)
  );
  var newBehavior = new Behavior(newChossenBeh.short, newChossenBeh.desc);
  selectedBeh = newBehavior.id;
  dataset.behaviors.push(newBehavior);
  //updateCanva();
  redraw();
  redrawBehaviors();
  showBehavior();
}

function updateBehavior() {
  //verify if the selected behavior exists
  if (selectedBeh !== undefined) {
    var id = d3.select("#tbxBehaviorId").node().value;
    var short = d3.select("#tbxBehaviorShort").node().value;
    var desc = d3.select("#tbxBehaviorDesc").node().value;
    if (short == "" || desc == "") {
      alert("Short description or description field empty warning.");
    }

    //find index of specific object using findIndex method.
    var objIndex = dataset.behaviors.findIndex((obj) => obj.id == id);

    //update object properties
    dataset.behaviors[objIndex].short = short;
    dataset.behaviors[objIndex].description = desc;

    //update both input type text
    d3.select("#tbxBehaviorShort").property("value", short);
    d3.select("#tbxBehaviorDesc").property("value", desc);
    redraw();
    redrawBehaviors();
    alert("Updated behavior with sucess!");
  } else alert("No behavior selected for update.");
}

function deleteBehavior() {
  //verify if selected node exists
  if (selectedBeh !== undefined) {
    //delete assumptions containing behavior
    dataset.assumptions = dataset.assumptions.filter(
      (x) => x.behavior.id != selectedBeh
    );

    //delete method sometimes return [empty] instead of [] and bugs the system
    //that's why filtered it, improvements probably can be made.
    dataset.behaviors = dataset.behaviors.filter((x) => x.id != selectedBeh);
    selectedBeh = undefined;

    redraw();
    redrawBehaviors();
    cleanBehavior();
  } else alert("No behavior selected for deletion.");

  //hide modalDeleteNode
  d3.select("#modalDeleteBehavior").style("display", "none");
}

function behaviorSelection() {
  //need to find real id
  selectedBeh = Number(this.id);

  redrawBehaviors();
  showBehavior();
}

//function when click at behavior inside behaviors tab, for later update
function showBehavior() {
  if (selectedBeh !== undefined) {
    var realBeh = dataset.behaviors.find((x) => x.id === selectedBeh);
    d3.select("#tbxBehaviorId").property("value", realBeh.id);
    d3.select("#tbxBehaviorShort").property("value", realBeh.short);
    d3.select("#tbxBehaviorDesc").property("value", realBeh.description);
  } else alert("No behavior selected to show data.");
}
function cleanBehavior() {
  d3.select("#tbxBehaviorId").property("value", "");
  d3.select("#tbxBehaviorShort").property("value", "");
  d3.select("#tbxBehaviorDesc").property("value", "");
}

function nodeBehaviorSelection() {
  var selectedNodeBehavior = Number(this.id);

  if (!selectedNode) {
    alert("First you need to select a node.");
    return;
  }

  //create behavior assumption or remove if already exists
  newAssumption(dataset, selectedNode, selectedNodeBehavior);

  updateCanva();
  redraw();
}

/* #endregion */

/* #region ---------- Data Treatment Region for First Tab ---------- */

//redraw behaviors board
function redrawBehaviors() {
  //hide span message
  d3.select("#spanDivBehaviors").style("display", "none");
  d3.select("#spanNodeBehaviorDiv").style("display", "none");

  //draw behavior on div list area
  var divsBeh = d3
    .select("#divBehaviors")
    .selectAll("a")
    .data(dataset.behaviors);
  divsBeh.join(
    (enter) =>
      enter
        .append("a")
        .attr("xlink:href", "#")
        .attr("id", (d) => d.id)
        .text((d) => d.short)
        .style("background-color", "purple")
        .on("click", behaviorSelection),
    (update) =>
      update.call((update) =>
        update
          .transition()
          .duration(500)
          .text((d) => d.short)
          .attr("id", (d) => d.id)
          .style("background-color", function (d) {
            if (d.id == selectedBeh) return "blue";
            else return null;
          })
      ),
    (exit) => exit.remove()
  );
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

/* #region ---------- Database Region ---------- */

const btnDatabase = document.getElementById("btnDatabase");
btnDatabase.addEventListener("click", function () {
  showDatabase();
});
let showingDatabase = false;
let showingDatabaseAdd = true;
const btnRefreshDatabase = document.getElementById("btnRefreshDatabase");
btnRefreshDatabase.addEventListener("click", function () {
  refreshDatabase();
});

function showDatabase() {
  var myTxt = d3.select("#myTextArea");
  if (showingDatabase) {
    myTxt.style("display", "none");
    showingDatabase = false;
  } else {
    myTxt.style("display", "block");
    showingDatabase = true;
    refreshDatabase(myTxt);
  }
  var myIcon = d3.select("#iconDatabase");
  if (showingDatabaseAdd) {
    myIcon.property("name", "remove-circle-outline");
    showingDatabaseAdd = false;
  } else {
    myIcon.property("name", "add-circle-outline");
    showingDatabaseAdd = true;
  }
}

function refreshDatabase(myTxt) {
  if (!myTxt) myTxt = d3.select("#myTextArea");
  var reducedDatabase = {
    nodes: [],
    links: [],
    behaviors: [],
    assumptions: [],
  };
  for (var i = 0; i < dataset.nodes.length; i++) {
    let simplifiedNode = {
      id: dataset.nodes[i].id,
      name: dataset.nodes[i].name,
      symbol: dataset.nodes[i].symbol,
    };
    reducedDatabase.nodes.push(simplifiedNode);
  }
  for (var i = 0; i < dataset.links.length; i++) {
    let simplifiedLink = {
      source: dataset.links[i].source.id,
      target: dataset.links[i].target.id,
    };
    reducedDatabase.links.push(simplifiedLink);
  }
  for (var i = 0; i < dataset.behaviors.length; i++) {
    let simplifiedBehavior = {
      id: dataset.behaviors[i].id,
      short: dataset.behaviors[i].short,
      description: dataset.behaviors[i].description,
    };
    reducedDatabase.behaviors.push(simplifiedBehavior);
  }
  for (var i = 0; i < dataset.assumptions.length; i++) {
    let simplifiedAssumption = {
      agent: dataset.assumptions[i].agent.id,
      behavior: dataset.assumptions[i].behavior.id,
    };
    reducedDatabase.assumptions.push(simplifiedAssumption);
  }
  myTxt.property("value", JSON.stringify(reducedDatabase, null, 2));
}
/* #endregion */

/* #region ---------- Logical Region ---------- */

const txtCommand = document.getElementById("txtCommand");
txtCommand.addEventListener("keypress", function (event) {
  if (event.key === "Enter") commandEvent();
});

const btnSubmitCommand = document.getElementById("btnSubmitCommand");
btnSubmitCommand.addEventListener("click", function () {
  commandEvent();
});

function commandEvent() {
  let com = txtCommand.value;
  alert("Command Event happened!\n" + com + " detected!");
}

/* #endregion */

/* #region ---------- ????? Region ---------- */

//randomDataFill();

/* #endregion */
