import * as d3 from "https://unpkg.com/d3?module";

import { Tokenizer } from "./tokenizer.js";
import { Parser } from "./parser.js";
import { Simple } from "./simplifier.js";
import { TxtWorker } from "./txtWorker.js";

var treeData1 = {
  name: "Top Level",
  value: 10,
  type: "black",
  level: "red",
  child: [
    {
      name: "Level 2: A",
      value: 15,
      type: "grey",
      level: "red",
      child: [
        {
          name: "Son of A",
          value: 5,
          type: "steelblue",
          level: "orange",
        },
        {
          name: "Daughter of A",
          value: 8,
          type: "steelblue",
          level: "red",
        },
      ],
    },
    {
      name: "Level 2: B",
      value: 10,
      type: "grey",
      level: "green",
      child: [
        {
          name: "Level 3: B",
          value: 10,
          type: "grey",
          level: "green",
        },
      ],
    },
  ],
};

var ts = {
  type: "Program",
  child: {
    type: "AdoptStm",
    child: {
      type: "AdoptStm",
      child: {
        type: "BlockStm",
        child: {
          type: "AndStm",
          child: [
            {
              type: "BehaviorStm",
              agent1: {
                type: "WORD",
                value: "a",
                start: 17,
                length: 1,
              },
              agent2: {
                type: "WORD",
                value: "b1",
                start: 19,
                length: 2,
              },
            },
          ],
        },
      },
    },
  },
};

var radius = 10;

// set the dimensions and margins of the diagram
var margin = { top: 40, right: 90, bottom: 50, left: 90 },
  width = 1140 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([width, height]);

//var treeData;
//  assigns the data to a hierarchy using parent-child relationships
var treeData = d3.hierarchy(treeData1, function (d) {
  return d.child;
});

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3
  .select(".canvaAST")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("style", "background: lightgray");
var grou = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .attr("id", "astGroup");

function update() {
  d3.selectAll("#astGroup > *").remove();
  var nodes = grou.selectAll(".node");

  // maps the node data to the tree layout
  treeData = treemap(treeData);
  console.log(treeData.descendants());
  //console.log(nodes.data(treeData.descendants()));

  var links = grou
    .selectAll(".link")
    .data(treeData.descendants().slice(1))
    .join(
      (enter) =>
        enter
          .append("path")
          .attr("class", "link")
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", "1px")
          .attr("d", function (d) {
            return (
              "M" +
              d.x +
              "," +
              d.y +
              "C" +
              d.x +
              "," +
              (d.y + d.parent.y) / 2 +
              " " +
              d.parent.x +
              "," +
              (d.y + d.parent.y) / 2 +
              " " +
              d.parent.x +
              "," +
              d.parent.y
            );
          }),
      (update) => update,
      (exit) => exit.remove()
    );

  nodes = nodes.data(treeData.descendants()).join(
    (enter) => {
      let enterG = enter.append("g");
      enterG.attr("class", function (d) {
        return "node" + (d.child ? " node--internal" : " node--leaf");
      });
      enterG.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
      enterG
        .append("circle")
        .attr("r", radius)
        .attr("fill", "white")
        .attr("stroke", "steelblue")
        .attr("stroke-width", "3px");
      enterG
        .append("text")
        .attr("font", "sans-serif")
        .attr("font-size", "80%")
        .attr("dy", ".35em")
        .attr("y", function (d) {
          return d.child ? -20 : 20;
        })
        .style("text-anchor", "middle")
        .text(function (d) {
          return d.data.type;
        });
      enterG.on("click", nodeClicked);
      return enterG;
    },
    (update) => {
      let updateG = update.select("text").text(function (d) {
        return d.data.type;
      });
      return updateG;
    },
    (exit) => exit.remove()
  );
}

function nodeClicked(event, d) {
  if (event.defaultPrevented) return; // dragged
  // console.log(d);
  // console.log(d.data.name);

  d3.select(this)
    .select("circle")
    .transition()
    .attr("r", radius * 2)
    .transition()
    .attr("r", radius);
}

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

  let tokenizer = new Tokenizer();
  let parser = new Parser();
  let simplifier = new Simple();
  let txtWorker = new TxtWorker();

  //let text = `[adopt][adopt](B(a,b1))`;
  let text = com;
  let tokens = tokenizer.tokenize(text);
  //let jsonTokens = JSON.stringify(tokens, null, 2);
  let parseTree = parser.parse(tokens);
  //let jsonTree = JSON.stringify(parseTree, null, 2);
  let simplifiedTree = simplifier.startReduction(parseTree);
  simplifiedTree = simplifier.addChildsToArray(simplifiedTree);
  //simplifier.goTru2(simplifiedTree);
  let jsonSimplifiedTree = JSON.stringify(simplifiedTree, null, 2);

  var myTxt = d3.select("#myTextAreaAST");
  myTxt.property("value", jsonSimplifiedTree);

  myTxt.node().focus();

  //alert("Command Event happened!\n" + com + " detected!");
  //alert(jsonTree);

  treeData = d3.hierarchy(simplifiedTree, function (d) {
    return d.child;
  });
  update();
}

/* #endregion */
