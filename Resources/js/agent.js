var counter = 0;

export class Agent {
  id;
  name;
  symbol;
  behaviors;
  constructor(name, symbol) {
    this.id = counter;
    counter++;
    this.name = name;
    this.symbol = symbol;
    this.behaviors = []; //array of type behavior for behaviors
  }

  addBehavior(behavior) {
    this.behavior.push(behavior);
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

export class Behavior {
  id;
  description;
  constructor(id, description) {
    this.id = id;
    this.description = description;
  }
}

export function createLink(dataset, selectedNode, selectedNodeLink) {
  var links = dataset.links;
  var found = false;
  let i = 0;
  for (; i < links.length; i++) {
    if (
      links[i].source.id == selectedNode &&
      links[i].target.id == selectedNodeLink
    ) {
      found = true;
      break;
    } else if (
      links[i].source.id == selectedNodeLink &&
      links[i].target.id == selectedNode
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
