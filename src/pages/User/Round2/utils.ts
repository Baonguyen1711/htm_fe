export const generateGrid = async (wordArr: string[], cellWidth: number) => {
  let board: string[][] = [[]], wordBank: WordObj[] = [], wordsActive: WordObj[] = [];

  interface MatchPosition {
    x: number;
    y: number;
    dir: number;
  }

  interface Question {
    answer: string;
  }

  let isPos: boolean[][] = [[]];
  let classesOfBoard: number[][][] = [[[]]];

  class WordObj {
    string: string;
    char: string[];
    totalMatches: number = 0;
    effectiveMatches: number = 0;
    successfulMatches: MatchPosition[] = [];
    x: number = 0;
    y: number = 0;
    dir: number = 0;
    index: number;

    constructor(str: string, index: number) {
      this.string = str;
      this.char = str.split('');
      this.index = index;
    }
  }

  const Bounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    Update: function (x: number, y: number) {
      this.top = Math.min(y, this.top);
      this.right = Math.max(x, this.right);
      this.bottom = Math.max(y, this.bottom);
      this.left = Math.min(x, this.left);
    },

    Clean: function () {
      this.top = 999;
      this.right = 0;
      this.bottom = 0;
      this.left = 999;
    }
  };

  Bounds.Clean();

  for (let i = 0; i < 100; i++) {
    board[i] = [];
    isPos[i] = [];
    classesOfBoard[i] = [];
    for (let j = 0; j < 100; j++) {
      board[i][j] = "";
      isPos[i][j] = false;
      classesOfBoard[i][j] = [];
    }
  }

  function CleanVars(): void {
    Bounds.Clean();
    wordBank = [];
    wordsActive = [];
    board = [];
    isPos = [];
    classesOfBoard = [];

    for (let i = 0; i < 100; i++) {
      board.push([]);
      isPos.push([]);
      classesOfBoard.push([]);
      for (let j = 0; j < 100; j++) {
        board[i].push("");
        isPos[i].push(false);
        classesOfBoard[i].push([]);
      }
    }
  }

  function PopulateBoard() {
    PrepareBoard();

    for (var i = 0, isOk = true, len = wordBank.length; i < len && isOk; i++) {
      isOk = AddWordToBoard();
    }
    return isOk;
  }

  function PrepareBoard(): void {
    wordBank = [];

    for (let i = 0; i < wordArr.length; i++) {
      const actualPos = i + 1;
      wordBank.push(new WordObj(' ' + actualPos.toString() + wordArr[i] + ' ', actualPos));
    }

    for (let i = 0; i < wordBank.length; i++) {
      const wA = wordBank[i];
      for (let j = 0; j < wA.char.length; j++) {
        const cA = wA.char[j];
        for (let k = 0; k < wordBank.length; k++) {
          const wB = wordBank[k];
          if (i !== k) {
            for (let l = 0; l < wB.char.length; l++) {
              wA.totalMatches += (cA === wB.char[l]) ? 1 : 0;
            }
          }
        }
      }
    }
  }

  function findWordIdx(givenWord: string): number | undefined {
    givenWord = givenWord.substring(2, givenWord.length - 1);
    for (let i = 0; i < wordArr.length; i++) {
      if (givenWord === wordArr[i]) return i + 1;
    }
    return undefined;
  }

  function AddWordToBoard(): boolean {
    var i, len, curIndex, curWord, curChar, curMatch, testWord, testChar,
      minMatchDiff = 9999, curMatchDiff;

    if (wordsActive.length < 1) {
      curIndex = 0;
      for (i = 0, len = wordBank.length; i < len; i++) {
        if (wordBank[i].totalMatches < wordBank[curIndex].totalMatches) {
          curIndex = i;
        }
      }
      wordBank[curIndex].successfulMatches = [{ x: 12, y: 12, dir: 0 }];
    } else {
      curIndex = -1;

      for (i = 0, len = wordBank.length; i < len; i++) {
        curWord = wordBank[i];
        curWord.effectiveMatches = 0;
        curWord.successfulMatches = [];
        for (var j = 0, lenJ = curWord.char.length; j < lenJ; j++) {
          if (j == 1) continue;
          curChar = curWord.char[j];
          for (var k = 0, lenK = wordsActive.length; k < lenK; k++) {
            testWord = wordsActive[k];
            for (var l = 0, lenL = testWord.char.length; l < lenL; l++) {
              if (l == 1) continue;
              testChar = testWord.char[l];
              if (curChar === testChar) {
                curWord.effectiveMatches++;

                var curCross = { x: testWord.x, y: testWord.y, dir: 0 };
                if (testWord.dir === 0) {
                  curCross.dir = 1;
                  curCross.x += l;
                  curCross.y -= j;
                } else {
                  curCross.dir = 0;
                  curCross.y += l;
                  curCross.x -= j;
                }

                var isMatch = true;

                for (var m = -1, lenM = curWord.char.length + 1; m < lenM; m++) {
                  var crossVal = [];
                  if (m !== j) {
                    if (curCross.dir === 0) {
                      var xIndex = curCross.x + m;

                      if (xIndex < 0 || xIndex > board.length) {
                        isMatch = false;
                        break;
                      }

                      crossVal.push(board[xIndex][curCross.y]);
                      crossVal.push(board[xIndex][curCross.y + 1]);
                      crossVal.push(board[xIndex][curCross.y - 1]);
                    } else {
                      var yIndex = curCross.y + m;

                      if (yIndex < 0 || yIndex > board[curCross.x].length) {
                        isMatch = false;
                        break;
                      }

                      crossVal.push(board[curCross.x][yIndex]);
                      crossVal.push(board[curCross.x + 1][yIndex]);
                      crossVal.push(board[curCross.x - 1][yIndex]);
                    }

                    if (m > -1 && m < lenM - 1) {
                      if (crossVal[0] !== curWord.char[m]) {
                        if (crossVal[0] !== "") {
                          isMatch = false;
                          break;
                        } else if (crossVal[1] !== "") {
                          isMatch = false;
                          break;
                        } else if (crossVal[2] !== "") {
                          isMatch = false;
                          break;
                        }
                      }
                    } else if (crossVal[0] !== "") {
                      isMatch = false;
                      break;
                    }
                  }
                }

                if (isMatch === true) {
                  curWord.successfulMatches.push(curCross);
                }
              }
            }
          }
        }

        curMatchDiff = curWord.totalMatches - curWord.effectiveMatches;

        if (curMatchDiff < minMatchDiff && curWord.successfulMatches.length > 0) {
          curMatchDiff = minMatchDiff;
          curIndex = i;
        } else if (curMatchDiff <= 0) {
          return false;
        }
      }
    }

    if (curIndex === -1) {
      return false;
    }

    var spliced = wordBank.splice(curIndex, 1);
    wordsActive.push(spliced[0]);

    var pushIndex = wordsActive.length - 1,
      rand = Math.random(),
      matchArr = wordsActive[pushIndex].successfulMatches,
      matchIndex = Math.floor(rand * matchArr.length),
      matchData = matchArr[matchIndex];

    wordsActive[pushIndex].x = matchData.x;
    wordsActive[pushIndex].y = matchData.y;
    wordsActive[pushIndex].dir = matchData.dir;

    let actualIndex = findWordIdx(wordsActive[pushIndex].string);
    console.log(wordsActive[pushIndex].string, " ~~~ ", actualIndex);
    for (i = 0, len = wordsActive[pushIndex].char.length; i < len; i++) {
      var xIndex = matchData.x,
        yIndex = matchData.y;

      if (matchData.dir === 0) {
        xIndex += i;
      } else {
        yIndex += i;
      }
      if (i === 1) {
        board[xIndex][yIndex] = `number${wordsActive[pushIndex].index}`;
      } else {
        board[xIndex][yIndex] = wordsActive[pushIndex].char[i];
      }
      isPos[xIndex][yIndex] = (i == 1);
      if (actualIndex != undefined)
        classesOfBoard[xIndex][yIndex].push(actualIndex);
      console.log(xIndex, yIndex, classesOfBoard[xIndex][yIndex]);

      Bounds.Update(xIndex, yIndex);
    }

    return true;
  }

  PopulateBoard()

  function findContentBounds(matrix: string[][]) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  let top = rows, bottom = -1, left = cols, right = -1;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j]) {
        if (i < top) top = i;
        if (i > bottom) bottom = i;
        if (j < left) left = j;
        if (j > right) right = j;
      }
    }
  }

  if (bottom === -1) {
    // No content found
    return null;
  }

  return { top, left, bottom, right };
}

  const top = Bounds.top;
  const bottom = Bounds.right;
  const left = Bounds.left;
  const right = Bounds.bottom;

  console.log("top", top);
  console.log("bottom", bottom);
  console.log("left", left);
  console.log("right", right);

  const wordHeight = bottom - top + 1;
  const wordWidth = right - left + 1;

  let startRow = top;
  let startCol = left;

  if (wordHeight < cellWidth) {
    const padding = Math.floor((cellWidth - wordHeight) / 2);
    startRow = Math.max(0, top - padding);
  }

  if (wordWidth < cellWidth) {
    const padding = Math.floor((cellWidth - wordWidth) / 2);
    console.log("padding",padding);
    
    startCol = Math.max(0, left - padding);
  }

  startRow = Math.min(startRow, 100 - cellWidth);
  startCol = Math.min(startCol, 100 - cellWidth);
  console.log("startRow",startRow);
  console.log("startCol",startCol);
  
  

  let slicedBoard: string[][] = [[]]
  slicedBoard = board.slice(startRow, startRow + cellWidth).map(row =>
      row.slice(startCol, startCol + cellWidth)
    );

  console.log("original board", board);
  const bound = findContentBounds(board)
  console.log("bound", bound);
  
  

  return {
    grid: slicedBoard,
    placementArray: wordsActive
  };
}