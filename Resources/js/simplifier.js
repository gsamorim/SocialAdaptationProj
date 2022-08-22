//remove commands that don't matter for execution

//adds elements for treeview
export class Simple {
  //start removing Program, which aways sit on the top
  //and any BlockStm sitting at the top after Program
  //then start  the main reduction method
  startReduction(parsed) {
    //var parsed = JSON.parse(ast);
    //remove program
    if (parsed.type == "Program") parsed = parsed.child;

    //first can't be a BlockStm
    //clean blocks until the first isn't a block
    while (parsed.type == "BlockStm") parsed = parsed.child;

    this.callNext(parsed);
    return parsed;
  }

  //main method
  callNext(next) {
    //console.log("next type:" + next.type);
    //call next
    if (next && next.type == "AndStm") {
      //AND
      //AND aways have childs
      this.blockCheck(next, next.child[0], 0);
      this.blockCheck(next, next.child[1], 1);
    } else {
      //not AND
      //check if have childs
      if (next && next.child) this.blockCheck(next, next.child, -1);
    }
  }

  //check for BlockStm
  blockCheck(current, next, andID) {
    //console.log("id:" + andID + "_" + current.type + "_" + next.type);
    //console.log("block check type:" + next.type + "_____andID:" + andID);
    //not AND
    if (next.type == "BlockStm") {
      if (andID == -1) current.child = next.child;
      else current.child[andID] = next.child;
      //need to test again in case there are two BlockStm in sequence
      this.callNext(current);
    }
    //call next, just progressing, no changes occurred
    this.callNext(next);
  }

  //test method
  goTru(cur) {
    if (cur === undefined || cur === null) return;
    console.log(cur.type);
    if (cur.type == "AndStm") {
      this.goTru(cur.child[0]);
      this.goTru(cur.child[1]);
    } else {
      this.goTru(cur.child);
    }
  }

  //test method
  goTru2(cur) {
    if (cur === undefined || cur === null) return;
    console.log(cur.type);
    if (cur.type == "AndStm") {
      this.goTru(cur.child[0]);
      this.goTru(cur.child[1]);
    } else {
      this.goTru(cur.child[0]);
    }
  }

  //childs belonging to some commands (NOT, ADOPT, etc) are added out of arrays
  //to plot the graph we need to add them to arrays
  addChildsToArray(cur) {
    if (cur === undefined || cur === null) return;
    if (cur.type == "AndStm") {
      this.addChildsToArray(cur.child[0]);
      this.addChildsToArray(cur.child[1]);
    } else {
      if (cur.child === undefined || cur.child === null) return;
      let array = [];
      array.push(cur.child);
      cur.child = array;
      this.addChildsToArray(cur.child[0]);
    }
    return cur;
  }
}
