var counterAgents = 0;
var counterBehaviors = 0;

export class Agent {
  id;
  name;
  symbol;
  constructor(name, symbol) {
    this.id = counterAgents;
    counterAgents++;
    this.name = name;
    this.symbol = symbol;
  }
}

export class Link {
  source;
  target;
  constructor(source, target) {
    this.source = source;
    this.target = target;
  }
}

//method that create/remove link between two nodes
export function createLink(dataset, selectedNode, selectedNodeLink) {
  var links = dataset.links;
  var found = false;
  let i = 0;
  for (; i < links.length; i++) {
    if (
      (links[i].source.id == selectedNode &&
        links[i].target.id == selectedNodeLink) ||
      (links[i].source.id == selectedNodeLink &&
        links[i].target.id == selectedNode)
    ) {
      found = true;
      break;
    }
  }
  if (found) {
    //remove link at position "i"
    dataset.links.splice(i, 1);
  } else {
    //find nodeA and nodeB by their "id"
    var nA = dataset.nodes.find((x) => x.id == selectedNode);
    var nB = dataset.nodes.find((x) => x.id == selectedNodeLink);
    //add link
    dataset.links.push(new Link(nA, nB));
  }
}

export class Behavior {
  id;
  short;
  description;
  constructor(short, description) {
    this.id = counterBehaviors;
    counterBehaviors++;
    this.short = short;
    this.description = description;
  }
}

export class Assumption {
  agent;
  behavior;
  constructor(agent, behavior) {
    this.agent = agent;
    this.behavior = behavior;
  }
}

//method to create/remove assumption
//a different method is needed for logical assumptions
//since there they do not lose assumptions at any time
export function newAssumption(
  dataset,
  selectedNode,
  selectedNodeNewAssumption
) {
  var assumptions = dataset.assumptions;
  var found = false;
  let i = 0;
  for (; i < assumptions.length; i++) {
    if (
      assumptions[i].agent.id == selectedNode &&
      assumptions[i].behavior.id == selectedNodeNewAssumption
    ) {
      found = true;
      break;
    }
  }
  if (found) {
    //remove link at position "i"
    dataset.assumptions.splice(i, 1);
  } else {
    //find ids by their "id"
    var agentID = dataset.nodes.find((x) => x.id == selectedNode);
    var behaviorID = dataset.behaviors.find(
      (x) => x.id == selectedNodeNewAssumption
    );
    //add assumption
    dataset.assumptions.push(new Assumption(agentID, behaviorID));
    console.log(dataset.assumptions);
  }
}
