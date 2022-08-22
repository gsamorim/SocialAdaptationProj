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
  //console.log(treeData.descendants());
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

/* #region ---------- Message Region ---------- */

function showMessage(msg) {
  /**
   * color background type
   * 00529b bde5f8 info       information
   * 4f8a10 dff2bf sucess     checkmark
   * 9f6000 feefb3 warning    alert
   * d8000c ffbaba error      close
   * d63301 ffccba validation close
   */

  //change message
  let myMessage = d3.select("#message");

  //show if hidden
  let showing = myMessage.style("display") === "none";
  if (!showing) myMessage.style("display", "flex");

  //check type
  if (msg.type === "SUCESS") {
    myMessage.select("ion-icon").property("name", "checkmark-circle-outline");
    myMessage.style("color", "#355c0b");
    myMessage.style("background-color", "#ADEB66");
    myMessage.select("span").text("SUCESS!");
  } else if (msg.type === "ERROR") {
    myMessage.select("ion-icon").property("name", "close-circle-outline");
    myMessage.style("color", "#d8000c");
    myMessage.style("background-color", "#ffbaba");
    myMessage.select("span").text(msg.local + " Error:" + msg.description);
  } else if (msg.type === "WARNING") {
    myMessage.select("ion-icon").property("name", "close-circle-outline");
    myMessage.style("color", "#9f6000");
    myMessage.style("background-color", "#feefb3");
    myMessage.select("span").text(msg.local + " Error:" + msg.description);
  }
}

function checkTokenError(tokens) {
  if (!tokens || tokens[tokens.length - 1] === undefined) {
    showMessage({
      type: "ERROR",
      local: "Tokenizer",
      description: "Empty Tokenizer",
    });
    return false;
  }
  if (tokens[tokens.length - 1].type === "ERROR") {
    showMessage({
      type: "ERROR",
      local: "Tokenizer",
      description:
        tokens[tokens.length - 1].description +
        ", value:" +
        tokens[tokens.length - 1].value +
        ", position:" +
        tokens[tokens.length - 1].position,
    });
    return false;
  }
  return true;
}

function commandEvent() {
  let com = txtCommand.value;

  let tokenizer = new Tokenizer();
  let parser = new Parser();
  let simplifier = new Simple();
  let txtWorker = new TxtWorker();
  let returnCheck = false;

  //let text = `[adopt][adopt](B(a,b1))`;
  //let text = `B(a,b1) && B(a,b1)`;
  let text = com;

  //tokenizer
  let tokens = tokenizer.tokenize(text);
  returnCheck = checkTokenError(tokens);
  if (!returnCheck) return;
  //let jsonTokens = JSON.stringify(tokens, null, 2);

  //parser
  try {
    var parseTree = parser.parse(tokens);
    //let jsonTree = JSON.stringify(parseTree, null, 2);
  } catch (err) {
    showMessage({
      type: "ERROR",
      local: "Parser",
      description: err,
    });
    return;
  }

  //simplifier
  try {
    var simplifiedTree = simplifier.startReduction(parseTree);
    simplifiedTree = simplifier.addChildsToArray(simplifiedTree);
    //simplifier.goTru2(simplifiedTree);
    var jsonSimplifiedTree = JSON.stringify(simplifiedTree, null, 2);
  } catch (err) {
    showMessage({
      type: "ERROR",
      local: "Simplifier",
      description: err.message,
    });
    return;
  }

  //text area
  var myTxt = d3.select("#myTextAreaAST");
  myTxt.property("value", jsonSimplifiedTree);
  myTxt.node().focus();

  //canva method to show tree
  //define the new as treeData
  treeData = d3.hierarchy(simplifiedTree, function (d) {
    return d.child;
  });
  update();
  showMessage({
    type: "SUCESS",
  });
}

/* #endregion */
