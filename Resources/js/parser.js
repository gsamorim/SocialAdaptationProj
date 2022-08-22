// call tokenizer to break string pieces into tokens
// move from token to token
// need to lookup for next tokens
// call the parse tree maker
// call the ast maker
export class Parser {
  _tokenIterator;
  _tokens;

  /**
   * Parser a string into an AST.
   */
  parse(tokens) {
    this._tokens = tokens;
    this._tokenIterator = 0;

    // Parse recursively starting from the main entry point, the Program:
    return this.Program();
  }

  /**
   * Main entry point.
   */
  Program() {
    return {
      type: "Program",
      child: this.andCheck(),
    };
    // while (this._tokenIterator < this._tokens.length) {
    //   let subTree = this.newStm(this.getTypeStarter());
    //   program.body.push(subTree);
    // }
    // let formula = this.newStm(this.getTypeStarter());
    // if (this._tokenIterator < this._tokens.length) {
    //   let last = this._tokens[this._tokenIterator - 1];
    //   throw new SyntaxError(
    //     ` Unexpected token found.\n
    //     Expected end of Formula at position${last.start + last.length}, after
    //     "${last.value}".`
    //   );
    // }
  }

  andCheck() {
    //calculate the first element of the tree
    let subTree = this.newStm(this.getTypeStarter());

    // console.log(
    //   subTree + "+" + this._tokenIterator + "+" + this._tokens.length
    // );

    //return here if no And found
    if (this._tokenIterator === this._tokens.length) return subTree;

    //otherwise start an array of childs for subtrees to AND statement
    let childs = [];
    childs.push(subTree);

    //token pode ser AND ou CPAREN
    while (this._tokenIterator < this._tokens.length) {
      const nextToken = this.getTypeStarter();
      if (nextToken == "CPAREN") break;
      const token = this._eat("AND");
      if (token.type === "AND") {
        let newSubTree = this.newStm(this.getTypeStarter());
        childs.push(newSubTree);
      }
    }
    if (childs.length == 2) {
      return {
        type: "AndStm",
        child: childs,
      };
    } else if (childs.length == 1) {
      return subTree;
    }
  }

  /**
   * OPERATOR -> [NeighborStm, BehaviorStm, KnowsStm]
   * NOT -> NotStm
   * OPAREN -> BlockStm
   * OBRACKET -> AdoptStm
   * OANGLEB -> AdoptAngStm
   */
  newStm(tokenType) {
    const token = this._eat(tokenType);
    switch (token.type) {
      case "OPERATOR":
        return this.OperatorFunc(token);
      case "NOT":
        return {
          type: "NotStm",
          child: this.newStm(this.getTypeStarter()),
        };
      case "OPAREN":
        let block = {
          type: "BlockStm",
          //child: this.newStm(this.getTypeStarter()),
          child: this.andCheck(),
        };
        this._eat("CPAREN", "BlockStm");
        return block;
      case "OBRACKET":
        var sequenceSqr = "AdoptStm";
        this._eat("WORD", sequenceSqr);
        //can be:
        //  [adopt] Phi || [adopt, identifier] Phi
        let behaviorOfAdopt = null;
        let nextTokenType = this.getNextTokenType();
        if (nextTokenType === "COMMA") {
          this._eat("COMMA", sequenceSqr);
          behaviorOfAdopt = this._eatIdentifier(sequenceSqr);
        }
        this._eat("CBRACKET", sequenceSqr);
        return {
          type: sequenceSqr,
          behavior: behaviorOfAdopt,
          child: this.newStm(this.getTypeStarter()),
        };
      case "OANGB":
        var sequenceAng = "AdoptAngStm";
        this._eat("WORD", sequenceAng);
        //can be:
        //  <adopt> Phi || <adopt, identifier> Phi
        let behaviorOfAdoptAng = null;
        let nextTokenTypeAng = this.getNextTokenType();
        if (nextTokenTypeAng === "COMMA") {
          this._eat("COMMA", sequenceSqr);
          behaviorOfAdoptAng = this._eatIdentifier(sequenceAng);
        }
        this._eat("CANGB", sequenceAng);
        return {
          type: sequenceAng,
          behavior: behaviorOfAdoptAng,
          child: this.newStm(this.getTypeStarter()),
        };
    }
    throw new SyntaxError(
      `Statement: Unexpected statement production. "${token.type}" not recognized.`
    );
  }

  /**
   * Operator Selector
   */
  OperatorFunc(token) {
    var sequenceType = "";
    switch (token.value) {
      case "N":
        sequenceType = "NeighborStm";
        this._eat("OPAREN", sequenceType);
        let agent1 = this._eatIdentifier(sequenceType);
        this._eat("COMMA", sequenceType);
        let agent2 = this._eatIdentifier(sequenceType);
        this._eat("CPAREN", sequenceType);
        return {
          type: sequenceType,
          agent1: agent1,
          agent2: agent2,
        };
      case "B":
        sequenceType = "BehaviorStm";
        this._eat("OPAREN", sequenceType);
        let agentOfB = this._eatIdentifier(sequenceType);
        this._eat("COMMA", sequenceType);
        let behavior = this._eatIdentifier(sequenceType);
        this._eat("CPAREN", sequenceType);
        return {
          type: sequenceType,
          agent: agentOfB,
          behavior: behavior,
        };
      case "K":
        //***************** */
        return {
          type: "KnowsStm",
        };
    }
  }

  /**
   * Se encontro um And o anexo em cima da tree
   * Se encontro uma negação ou adopt anexo embaixo da tree
   * Se começar um parentheses não posso anexalo até que ele termine
   * Devo criar uma subtree e depois a anexo embaixo caso não tiver AND
   * ...ou encima, caso depois do parentheses encontrar uma AND.
   * ...por exemplo: !adopt(adoptBd1&&adoptNab)&&Nac
   * Decido onde anexar soh quando o parentheses termina e descubro
   * ... a sequencia dele
   * !adopt(adoptBd1&&adoptNab)(!adoptNac) !Errado:
   * ...não pode ter 2 blocos fechados em sequencia com 2 estados finais
   * ...sem que haja uma AND
   * @returns
   */

  /**
   * Get next token type
   */
  getNextTokenType() {
    return this._tokens[this._tokenIterator].type;
  }

  /**
   * Get a token type to start a new tree
   * Do not change anything,
   * Just return the type of the next token
   * For now it does the same as getNextTokenType
   * checks about what is a starter token
   * can be added in the future
   */
  getTypeStarter() {
    return this._tokens[this._tokenIterator].type;
  }

  /**
   * Expects a token of a given type.
   */
  _eat(tokenType, operatorSeq) {
    //get next token
    let last = this._tokens[this._tokenIterator - 1];
    let token = this._tokens[this._tokenIterator];

    if (token == null) {
      if (operatorSeq) {
        throw new SyntaxError(
          `Unexpected end of input, expected: "${tokenType}", after "${
            last.value
          }", at position ${
            last.start + last.length
          }, operator of type ${operatorSeq} didn't found proper sequence.`
        );
      }
      throw new SyntaxError(
        `Unexpected end of input, expected: "${tokenType}", after "${
          last.value
        }", at position ${last.start + last.length}`
      );
    }
    if (token.type !== tokenType) {
      if (operatorSeq) {
        throw new SyntaxError(
          `Unexpected token: "${
            token.type
          }", expected: "${tokenType}", after "${last.value}", at position ${
            last.start + last.length
          }, operator of type ${operatorSeq} didn't found proper sequence.`
        );
      }
      throw new SyntaxError(
        `Unexpected token: "${token.type}", expected: "${tokenType}", after "${
          last.value
        }", at position ${last.start + last.length}`
      );
    }

    //Move iterator
    this._tokenIterator++;

    return token;
  }

  /**
   * Expects a token of type WORD or Number
   * both can be used to identify agents or behaviors
   */
  _eatIdentifier(operatorSeq) {
    //get next token
    let last = this._tokens[this._tokenIterator - 1];
    let token = this._tokens[this._tokenIterator];

    if (token == null) {
      if (operatorSeq) {
        throw new SyntaxError(
          `Unexpected end of input, expected: WORD or NUMBER, after "${
            last.value
          }", at position ${
            last.start + last.length
          }, operator of type ${operatorSeq} didn't found proper sequence.`
        );
      }
      throw new SyntaxError(
        `Unexpected end of input, expected: WORD or NUMBER, after "${
          last.value
        }", at position ${last.start + last.length}`
      );
    }
    if (token.type !== "WORD" && token.type !== "NUMBER") {
      if (operatorSeq) {
        throw new SyntaxError(
          `Unexpected token: "${
            token.type
          }", expected: WORD or NUMBER, after "${last.value}", at position ${
            last.start + last.length
          }, operator of type ${operatorSeq} didn't found proper sequence.`
        );
      }
      throw new SyntaxError(
        `Unexpected token: "${token.type}", expected: WORD or NUMBER, after "${
          last.value
        }", at position ${last.start + last.length}`
      );
    }

    //Move iterator
    this._tokenIterator++;

    return token;
  }
}
