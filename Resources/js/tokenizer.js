/**
 * ----Priority List:
 * 0      EOF            13
 * 1      Empty Space    9/32
 * 2      Operator       65~90                      [A-Z]{1,3}
 * 3      Word           97~122 65~90\97~122\47~57  [a-z][A-Z\a-z\0-9]{0,7}
 * 4      Number         47~57                      [0-9]{1,3}
 * 5      Comma          44    ,
 * 6      Not            33    !
 * 7      And            38    &   ampersand
 * 8-9    Parentheses    40/41 ()
 * 10-11  Brackets       91/93 []
 * 12-13  Angle Brackets 60/62 <>
 * let tokenTypes = [
      { id: 2, type: "OPERATOR" },
      { id: 3, type: "WORD" },
      { id: 4, type: "NUMBER" },
      { id: 5, type: "COMMA" },
      { id: 6, type: "NOT" },
      { id: 7, type: "AND" },
      { id: 8, type: "OPAREN" },
      { id: 9, type: "CPAREN" },
      { id: 10, type: "OBRACKET" },
      { id: 11, type: "CBRACKET" },
      { id: 12, type: "OANGB" },
      { id: 13, type: "CANGB" },
    ];
 */

/**
 * This tokenizer model tokenize everything before any parsing
 */
export class Tokenizer {
  _tokenLenght;

  //Method that slice a received string, removing the initial part, up to the paramether
  prune(str) {
    let aux = this._tokenLenght;
    this._tokenLenght = 0;
    return str.slice(aux);
  }

  checkIfEmpty(char) {
    if (char === " " || char === "  ") return true;
    return false;
  }

  checkIfUpperCase(ccode) {
    if (ccode >= 65 && ccode <= 90) return true;
    return false;
  }

  checkIfLowerCase(ccode) {
    if (ccode >= 97 && ccode <= 122) return true;
    return false;
  }

  checkIfNumber(ccode) {
    if (ccode >= 47 && ccode <= 57) return true;
    return false;
  }

  checkIfComma(char) {
    if (char === ",") return true;
    return false;
  }

  checkIfNot(char) {
    if (char === "!") return true;
    return false;
  }

  checkIfAnd(char) {
    if (char === "&") return true;
    return false;
  }

  checkIfOpenParentheses(char) {
    if (char === "(") return true;
    return false;
  }

  checkIfCloseParentheses(char) {
    if (char === ")") return true;
    return false;
  }

  checkIfOpenBracket(char) {
    if (char === "[") return true;
    return false;
  }

  checkIfCloseBracket(char) {
    if (char === "]") return true;
    return false;
  }

  checkIfOpenAngleBracket(char) {
    if (char === "<") return true;
    return false;
  }

  checkIfCloseAngleBracket(char) {
    if (char === ">") return true;
    return false;
  }

  /**
   * Obtains next token.
   */
  getNextToken(str) {
    let cursor = 0;

    //check for Empty Spaces
    if (this.checkIfEmpty(str[cursor])) {
      this._tokenLenght = 1;
      return null;
    }

    //check for Operators
    if (this.checkIfUpperCase(str.charCodeAt(cursor))) {
      let operator = str[cursor++];
      while (this.checkIfUpperCase(str.charCodeAt(cursor)) && cursor <= 2)
        operator += str[cursor++];
      this._tokenLenght = cursor;
      return {
        type: "OPERATOR",
        value: operator,
      };
    }

    //check for Word
    //aways start with lower case
    //maximum word size is 6 for now
    //accept empty spaces
    if (this.checkIfLowerCase(str.charCodeAt(cursor))) {
      let word = str[cursor++];
      while (
        (this.checkIfLowerCase(str.charCodeAt(cursor)) ||
          this.checkIfUpperCase(str.charCodeAt(cursor)) ||
          this.checkIfNumber(str.charCodeAt(cursor)) ||
          this.checkIfEmpty(str[cursor])) &&
        cursor <= 6
      )
        word += str[cursor++];
      this._tokenLenght = cursor;
      return {
        type: "WORD",
        value: word,
      };
    }

    //check for Numbers
    if (this.checkIfNumber(str.charCodeAt(cursor))) {
      let number = str[cursor++];
      while (this.checkIfNumber(str.charCodeAt(cursor)) && cursor <= 2)
        number += str[cursor++];
      this._tokenLenght = cursor;
      return {
        type: "NUMBER",
        value: number,
      };
    }

    //check for comma
    if (this.checkIfComma(str[cursor])) {
      this._tokenLenght = 1;
      return {
        type: "COMMA",
        value: ",",
      };
    }

    //check for not
    if (this.checkIfNot(str[cursor])) {
      this._tokenLenght = 1;
      return {
        type: "NOT",
        value: "!",
      };
    }

    //check for and
    if (this.checkIfAnd(str[cursor]) && this.checkIfAnd(str[cursor + 1])) {
      this._tokenLenght = 2;
      return {
        type: "AND",
        value: "&&",
      };
    }

    //check for Parentheses
    if (this.checkIfOpenParentheses(str[cursor])) {
      this._tokenLenght = 1;
      return {
        type: "OPAREN",
        value: "(",
      };
    }
    if (this.checkIfCloseParentheses(str[cursor])) {
      this._tokenLenght = 1;
      return {
        type: "CPAREN",
        value: ")",
      };
    }

    //check for Brackets
    if (this.checkIfOpenBracket(str[cursor])) {
      this._tokenLenght = 1;
      return {
        type: "OBRACKET",
        value: "[",
      };
    }
    if (this.checkIfCloseBracket(str[cursor])) {
      this._tokenLenght = 1;
      return {
        type: "CBRACKET",
        value: "]",
      };
    }

    //check for Angular Brackets
    if (this.checkIfOpenAngleBracket(str[cursor])) {
      this._tokenLenght = 1;
      return {
        type: "OANGB",
        value: "<",
      };
    }
    if (this.checkIfCloseAngleBracket(str[cursor])) {
      this._tokenLenght = 1;
      return {
        type: "CANGB",
        value: ">",
      };
    }

    //not any of those - ERROR!
    this._tokenLenght = 1;
    return {
      type: "ERROR",
      description: "General Error",
      value: str[cursor],
      position: cursor,
    };
  }

  tokenize(str) {
    let tokens = [];
    let walked = 0;
    while (str.length !== 0) {
      //call for next token
      var token = this.getNextToken(str);
      //add next token if found
      if (token) {
        if (token.type == "ERROR") {
          token.position += walked;
          tokens.push(token);
          break;
        } else {
          token.start = walked;
          token.length = this._tokenLenght;
          tokens.push(token);
        }
      }

      //prune str
      walked += this._tokenLenght;
      str = this.prune(str);
    }
    return tokens;
  }
}
