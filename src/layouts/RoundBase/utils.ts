// Tạo từ khóa gợi ý với vị trí và hướng random

interface HintWord {
    word: string;
    x: number;
    y: number;
    direction: "horizontal" | "vertical";
}

interface ObstacleQuestionBoxProps {
    obstacleWord: string;
}

type PlacedWord = {
    word: string;
    x: number;
    y: number;
    direction: "horizontal" | "vertical";
};


export const findCommonLetterIndexes = (word1: string, word2: string) => {
    const result = []
    for (let i=0;i<word1.length;i++) {
        for(let j =0;j<word2.length;j++) {
            if(word1[i] === word2[j]) {
                result.push({
                    [word1] : i,
                    [word2] : j
                })
            }
        }
    }

    return result
}

const canPlaceWord = (word: string, x:number, y:number, grid:string[][], direction:"horizontal"|"vertical") => {
    if(direction == "horizontal") {
        for (let i=0;i<word.length;i++) {
            if (grid[x][y+i] !== "" || grid[x][y+i] == undefined) return false
        }
    }

    if(direction =="vertical") {
        for (let i=0;i<word.length;i++) {
            if (grid[x+i][y] !== "") return false
        }
    }

    return true
}

export const findCommonLetterPairs = (wordList: string[], gridSize: number, grid: string[][]) => {
    const REQUIRE_PAIRS = Math.floor(Math.random()*2) + 1
    console.log("REQUIRE_PAIRS",REQUIRE_PAIRS);
    
    const tempWordList = [...wordList]
    const commonPairs = [
    ]
    const placedWords = new Set()
    const wordsCoordinate: PlacedWord[] = []

    let found = false
    let pairs = 0
    let direction = "horizontal"
    let nextPosition:{x:number, y:number} = {
        x: 0,
        y: 0
    }

    
    if(REQUIRE_PAIRS == 2) {
        while (pairs <REQUIRE_PAIRS && !found) {
        
            for (let i =0;i<tempWordList.length;i++) {
                if(pairs==REQUIRE_PAIRS || found == true) break
    
                const word1 = tempWordList[i]
                if(placedWords.has(word1)) continue
    
                for (let j =0;j<tempWordList.length;j++) {
                    if (tempWordList[j] === word1) continue
    
                    if(placedWords.has(tempWordList[j])) continue
    
                    const result = findCommonLetterIndexes(word1,tempWordList[j])
    
                    if(result.length >0) {
                        console.log("result",result);
                        const index = Math.floor(Math.random() * result.length)
                        console.log("index",index);
                        
                        commonPairs.push(result[index])
                        console.log("pairs",pairs);
                        placedWords.add(word1)
                        placedWords.add(tempWordList[j])
                        pairs = pairs + 1
                        break
                    }
    
                    if(i==tempWordList.length-1 && j==tempWordList.length-1) {
                        found = true
                        break
                    }
    
                }
            }
        }
    }

    if(REQUIRE_PAIRS == 1) {
        const sortedTempWordList = [...tempWordList].sort((a, b) => b.length - a.length);
        let index = -1
        while (!found) {
        
            for (let i =0;i<sortedTempWordList.length;i++) {
                if(found == true) break
    
                const word1 = sortedTempWordList[i]
                if(placedWords.has(word1)) continue
    
                for (let j =0;j<sortedTempWordList.length;j++) {
                    if (sortedTempWordList[j] === word1) continue
    
                    const result = findCommonLetterIndexes(word1,sortedTempWordList[j])
    
                    if(result.length >0) {
                        console.log("result",result);
                        const index = Math.floor(Math.random() * result.length)
                        console.log("index",index);
                        
                        commonPairs.push(result[index])
                        console.log("pairs",pairs);
                        placedWords.add(word1)
                        placedWords.add(sortedTempWordList[j])

                        
                    }

                    if(commonPairs.length ==2) {
                        found = true
                        break
                    }
    
                    if(i==tempWordList.length-1 && j==tempWordList.length-1) {
                        found = true
                        break
                    }
    
                }
            }
        }
    }

    //loop until 2 pairs are found or go through all the array
    

    for (let pairs of commonPairs){
        const keys = Object.keys(pairs);
        const x = Math.floor(Math.random() * gridSize)
        const y = Math.floor(Math.random() * (gridSize-keys[0].length))
        const word1Coordinate: PlacedWord = {
            word: keys[0],
            x: x,
            y: y,
            direction: "horizontal"
        }

        const word2Coordinate: PlacedWord = {
            word: keys[1],
            x: 1,
            y: pairs[keys[0]] + 1,
            direction: "vertical"
        }

        placedWords.add(word1Coordinate)
        placedWords.add(word2Coordinate)

    }

    return commonPairs
    
}



export const generateHintWords = (words: string[], gridSize: number, obstacleWord: string): HintWord[] => {
    const grid: string[][] = Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill("")); // Mảng kiểm tra vị trí

    const findCommonLetterPairs = (words: string[]): { word1: string; word2: string; commonLetters: string[] }[] => {
        let results: { word1: string; word2: string; commonLetters: string[] }[] = [];
        let usedWords = new Set<string>(); // Lưu lại các từ đã dùng

        let remainingPairs: { word1: string; word2: string; commonLetters: string[] }[] = [];

        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j < words.length; j++) {
                const word1 = words[i];
                const word2 = words[j];

                // Tìm ký tự chung giữa 2 từ
                const commonLetters = [...new Set(word1)].filter((letter) => word2.includes(letter));

                if (commonLetters.length >= 2) {
                    // Tính điểm ưu tiên (chữ gần trung tâm hơn)
                    const scoredLetters = commonLetters.map((letter) => {
                        const index1 = word1.indexOf(letter);
                        const index2 = word2.indexOf(letter);
                        const center1 = word1.length / 2;
                        const center2 = word2.length / 2;
                        const score = Math.abs(index1 - center1) + Math.abs(index2 - center2);
                        return { letter, score };
                    });

                    // Sắp xếp theo điểm ưu tiên
                    scoredLetters.sort((a, b) => a.score - b.score);
                    const prioritizedLetters = scoredLetters.map((item) => item.letter);

                    remainingPairs.push({ word1, word2, commonLetters: prioritizedLetters });
                }
            }
        }

        // Bước 2: Chọn tối đa 2 cặp theo quy tắc
        for (const pair of remainingPairs) {
            if (results.length >= 2) break; // Đủ 2 cặp thì dừng
            if (!usedWords.has(pair.word1) && !usedWords.has(pair.word2)) {
                results.push(pair);
                usedWords.add(pair.word1);
                usedWords.add(pair.word2);
            }
        }

        // Nếu vẫn chưa đủ 2 cặp, chọn tiếp từ các cặp có từ đã dùng
        for (const pair of remainingPairs) {
            if (results.length >= 2) break;
            if (!usedWords.has(pair.word1) || !usedWords.has(pair.word2)) {
                results.push(pair);
                usedWords.add(pair.word1);
                usedWords.add(pair.word2);
            }
        }

        return results;
    };

    // 🛠 Test
    //const testwords = ["BƯUCHÍNH", "5G", "BQP", "TẬPĐOÀN", "HÀNỘI", "RED"];

    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const placeWordsOnGrid = (words: string[], gridSize: number): PlacedWord[] => {
        while (true) {
            let placedWords: PlacedWord[] = [];
            let occupiedPositions = new Set<string>();
            let placedSet = new Set<string>(); // Set để theo dõi từ đã đặt
            let allPlaced = true; // Cờ kiểm tra xem tất cả từ có được đặt hay không

            const getKey = (x: number, y: number) => `${x},${y}`;

            const canPlaceWord = (word: string, x: number, y: number, direction: "horizontal" | "vertical", index: number) => {
                for (let i = 0; i < word.length; i++) {
                    if (i === x + index) continue;
                    let newX = direction === "horizontal" ? x + i : x;
                    let newY = direction === "horizontal" ? y : y + i;
                    if (newX < 0 || newY < 0 || newX >= gridSize || newY >= gridSize || occupiedPositions.has(getKey(newX, newY))) {
                        return false;
                    }
                }
                return true;
            };

            const commonLetterPairs = findCommonLetterPairs(words);
            console.log(commonLetterPairs);

            for (const { word1, word2, commonLetters } of commonLetterPairs) {
                if (placedSet.has(word1) || placedSet.has(word2)) continue; // Kiểm tra nếu đã đặt thì bỏ qua

                const commonLetter = commonLetters[0];
                const index1 = word1.indexOf(commonLetter);
                const index2 = word2.indexOf(commonLetter);

                let placed = false;
                for (let attempt = 0; attempt < 100; attempt++) {
                    let x = Math.floor(Math.random() * (gridSize - word1.length)) + 1;
                    let y = Math.floor(Math.random() * (gridSize - index2) + index2) + 1;

                    if (canPlaceWord(word1, x, y, "horizontal", index1)) {
                        placedWords.push({ word: word1, x, y, direction: "horizontal" });
                        placedSet.add(word1);

                        let intersecrX = x + index1;
                        let intersectY = y;

                        if (canPlaceWord(word2, intersecrX, intersectY - index2, "vertical", index2)) {
                            for (let i = 0; i < word1.length; i++) occupiedPositions.add(getKey(x + i, y));
                            placedWords.push({ word: word2, x: intersecrX, y: intersectY - index2, direction: "vertical" });
                            placedSet.add(word2);

                            for (let i = 0; i < word2.length; i++) occupiedPositions.add(getKey(intersecrX, intersectY - index2 + i));

                            placed = true;
                            break;
                        } else {
                            placedWords.pop();
                        }
                    }
                }

                if (!placed) {
                    console.warn(`Không thể đặt cặp từ: ${word1} - ${word2}`);
                    allPlaced = false;
                    break;
                }
            }



            for (const word of words) {
                if (placedSet.has(word)) continue;

                let placed = false;
                let found = false;

                for (let j = placedWords.length - 1; j >= 0; j--) {
                    for (let attempt = 0; attempt < 10; attempt++) {
                        let direction: "horizontal" | "vertical" = placedWords[j].direction === "horizontal" ? "vertical" : "horizontal";
                        const shift = Math.random() < 0.5 ? 1 : -1;
                        let x = placedWords[j].direction === "horizontal" ? placedWords[j].word.length + placedWords[j].x : placedWords[j].x + 1;
                        let y = placedWords[j].direction === "horizontal" ? placedWords[j].y + 2 : placedWords[j].word.length + placedWords[j].y;

                        if (canPlaceWord(word, x, y, direction, 0)) {
                            placedWords.push({ word, x, y, direction });
                            placedSet.add(word);

                            for (let i = 0; i < word.length; i++) {
                                let newX = direction === "horizontal" ? x + i : x;
                                let newY = direction === "horizontal" ? y : y + i;
                                occupiedPositions.add(getKey(newX, newY));
                            }

                            placed = true;
                            found = true;
                            break;
                        }
                    }

                    if (found) break;
                }

                if (!placed) {
                    console.warn(`Không thể đặt từ: ${word}`);
                    allPlaced = false;
                    break;
                }
            }
            if (!allPlaced) continue; // Nếu có từ không đặt được, restart vòng lặp

            if (allPlaced) return placedWords; // Nếu tất cả từ đều được đặt, thoát khỏi vòng lặp và trả về kết quả
        }
    };

    const placedWords = placeWordsOnGrid(shuffledWords, gridSize);
    console.log(placedWords);

    return placedWords;
};


export const renderGrid = (wordList: string[], mainKeyword:string, GRID_SIZE:number) => {
    console.log("wordList on render", wordList);
    
    const maxAttempts = 100;

    const generateEmptyGrid = () => {
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(""));
    };

    const getKey = (x: number, y: number) => `${x},${y}`;

    const canPlaceNumber = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false;
        return !occupiedPositions.has(getKey(x, y));
    };

    const hasCommonLetter = (word1: string, word2: string) => {
        return [...new Set(word1)].some((letter) => word2.includes(letter));
    };

    // Try to place words and numbers until a valid configuration is found
    let attempts = 0;
    let randomHintWords: HintWord[] = [];
    let newGrid = generateEmptyGrid();
    let occupiedPositions = new Set<string>();
    let occupiedRows = new Set<number>();
    let occupiedCols = new Set<number>();


    while (attempts < maxAttempts) {
        randomHintWords = generateHintWords(wordList, GRID_SIZE, mainKeyword);
        newGrid = generateEmptyGrid();
        occupiedPositions.clear();
        occupiedRows.clear();
        occupiedCols.clear();

        let canPlaceAll = true;

        // First pass: Place words and mark their positions
        for (const { word, x, y, direction } of randomHintWords) {
            if (direction === "horizontal") {
                occupiedRows.add(y);
                // Check for adjacent rows
                for (const other of randomHintWords) {
                    if (other.word === word || other.direction !== "horizontal") continue; // Fixed comparison
                    if (Math.abs(other.y - y) === 1 && !hasCommonLetter(word, other.word)) {
                        canPlaceAll = false;
                        break;
                    }
                }
            } else {
                occupiedCols.add(x);
                // Check for adjacent columns
                for (const other of randomHintWords) {
                    if (other.word === word || other.direction !== "vertical") continue; // Fixed comparison
                    if (Math.abs(other.x - x) === 1 && !hasCommonLetter(word, other.word)) {
                        canPlaceAll = false;
                        break;
                    }
                }
            }

            if (!canPlaceAll) break;

            for (let i = 0; i < word.length; i++) {
                let newX = direction === "horizontal" ? x + i : x;
                let newY = direction === "horizontal" ? y : y + i;
                newGrid[newY][newX] = word[i];
                occupiedPositions.add(getKey(newX, newY));
            }
        }

        if (!canPlaceAll) {
            attempts++;
            continue;
        }

        // Second pass: Check if numbers can be placed without overlap

        for (const { word, x, y, direction } of randomHintWords) {
            const wordNumber = wordList.includes(word) ? wordList.indexOf(word) + 1 : -1; // Kiểm tra trước khi lấy số

            if (wordNumber === -1) {
                console.error(`Không tìm thấy từ ${word} trong wordList`);
                continue; // Nếu không tìm thấy, tiếp tục vòng lặp
            }

            if (direction === "horizontal" && x > 0) {
                if (!canPlaceNumber(x - 1, y)) {
                    canPlaceAll = false;
                    break;
                }
            } else if (direction === "vertical" && y > 0) {
                if (!canPlaceNumber(x, y - 1)) {
                    canPlaceAll = false;
                    break;
                }
            }
        }


        if (canPlaceAll) {
            // Place numbers if all checks pass
            randomHintWords.forEach(({ word, x, y, direction }) => {
                const wordNumber = wordList.indexOf(word) + 1;
                console.log("wordList",wordList)
                console.log("word",word);
                
                console.log("wordNumber",wordNumber)
                let newY = y; // Tạo biến mới để lưu trữ vị trí x đã điều chỉnh

                // Kiểm tra nếu ô bên trái đã bị chiếm, thì dịch sang phải
                if (newGrid[x][y-1] !== '') {
                    newY = y + 1; // Dịch sang phải 1 đơn vị
                    
                    // Nếu là horizontal, cần kiểm tra toàn bộ các ô của word và dịch chúng
                    if (direction === "horizontal") {
                        // Kiểm tra xem sau khi dịch có đủ không gian không
                        if (newY + word.length > newGrid[0].length) {
                            // Có thể cần xử lý trường hợp vượt quá kích thước grid
                            console.error("Không dịch được sang phải")
                            return;
                        }
                        // Cập nhật các ô của word ở vị trí mới
                        for (let i = 0; i < word.length; i++) {
                            newGrid[x][newY+i] = word[i];
                            occupiedPositions.add(getKey(x, newY+i));
                        }

                        occupiedPositions.delete(getKey(x,y))
                        newGrid[x][y] = ""
                    }
                }
                if (direction === "horizontal" && x > 0) {
                    newGrid[y][x - 1] = `number${wordNumber.toString()}`;
                    occupiedPositions.add(getKey(x - 1, y));
                } else if (direction === "vertical" && y > 0) {
                    newGrid[y - 1][x] = `number${wordNumber.toString()}`;
                    occupiedPositions.add(getKey(x, y - 1));
                }
            });


            break; // Valid configuration found, exit loop
        }

        attempts++;
    }

    if (attempts >= maxAttempts) {
        console.warn("Could not find a valid grid configuration without overlapping numbers or adjacent non-shared words after max attempts.");
    }

    return {randomHintWords, newGrid}
}

interface Word {
    string: string;
    char: string[];
    index: number;
    successfulMatches: Match[];
    totalMatches: number;
    effectiveMatches: number;
    x?: number;
    y?: number;
    dir?: number;
  }
  
  interface Match {
    x: number;
    y: number;
    dir: number;
  }
  
  interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    update: (x: number, y: number) => void;
  }
  
  interface CrosswordResult {
    board: (string | null)[][];
    wordsActive: Word[];
    success: boolean;
    message?: string;
  }
  
  export function generateCrossword(wordList: string[], board: (string | null)[][]): CrosswordResult {
    // Kiểm tra đầu vào
    if (!Array.isArray(wordList) || wordList.length !== 6 || !wordList.every(w => typeof w === 'string')) {
      return { board: [], wordsActive: [], success: false, message: 'wordList must be an array of 6 strings' };
    }
    if (!Array.isArray(board) || board.length === 0 || board[0].length !== 20) {
      board = Array.from({ length: 20 }, () => Array(20).fill(null)) as (string | null)[][];
    }
  
    // Khởi tạo cấu trúc dữ liệu
    const wordsActive: Word[] = [];
    const wordBank: Word[] = wordList.map((word, idx) => ({
      string: word.toUpperCase(),
      char: word.toUpperCase().split(''),
      index: idx,
      successfulMatches: [],
      totalMatches: 0,
      effectiveMatches: 0
    }));
    const bounds: Bounds = {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      update: function(x: number, y: number) {
        this.minX = Math.min(this.minX, x);
        this.maxX = Math.max(this.maxX, x);
        this.minY = Math.min(this.minY, y);
        this.maxY = Math.max(this.maxY, y);
      }
    };
  
    // Hàm kiểm tra xem ô có hợp lệ để đặt ký tự không
    function isValidPosition(x: number, y: number, char: string, board: (string | null)[][], dir: number, word: Word, i: number): boolean {
      if (x < 0 || x >= board.length || y < 0 || y >= board[0].length) return false;
      if (board[x][y] === null) return true;
      if (board[x][y] === char) {
        // Kiểm tra xung đột với từ khác tại giao điểm
        const crossDir = dir === 0 ? 1 : 0;
        const crossVal = [
          crossDir === 0 ? (x > 0 ? board[x-1][y] : null) : (y > 0 ? board[x][y-1] : null),
          board[x][y],
          crossDir === 0 ? (x < board.length-1 ? board[x+1][y] : null) : (y < board[0].length-1 ? board[x][y+1] : null)
        ];
        return crossVal[0] === null && crossVal[2] === null && board[x][y] === char;
      }
      return false;
    }
  
    // Hàm mở rộng bảng nếu cần
    function expandBoard(board: (string | null)[][], x: number, y: number): void {
      while (x >= board.length) {
        board.push(Array(board[0].length).fill(null));
      }
      while (y >= board[0].length) {
        for (let i = 0; i < board.length; i++) {
          board[i].push(null);
        }
      }
    }
  
    // Hàm tìm các vị trí giao nhau hợp lệ cho một từ
    function findMatches(word: Word, board: (string | null)[][], wordsActive: Word[]): void {
      word.successfulMatches = [];
      word.totalMatches = 0;
      word.effectiveMatches = 0;
  
      if (wordsActive.length === 0) {
        // Nếu bảng rỗng, đặt từ đầu tiên ở giữa
        const x = Math.floor(board.length / 2);
        const y = Math.floor(board[0].length / 2);
        const dir = Math.random() < 0.5 ? 0 : 1;
        word.successfulMatches.push({ x, y, dir });
        word.totalMatches = 1;
        word.effectiveMatches = 1;
        return;
      }
  
      for (const placedWord of wordsActive) {
        for (let i = 0; i < word.char.length; i++) {
          for (let k = 0; k < placedWord.char.length; k++) {
            if (word.char[i] === placedWord.char[k]) {
              word.totalMatches++;
              // Thử đặt từ theo hướng ngang (dir=0) và dọc (dir=1)
              for (let dir = 0; dir <= 1; dir++) {
                const x = dir === 0 ? placedWord.x! + k - i : placedWord.x! + k;
                const y = dir === 0 ? placedWord.y! : placedWord.y! - i;
                let isValid = true;
                // Kiểm tra toàn bộ từ có thể đặt được không
                for (let m = 0; m < word.char.length; m++) {
                  const xPos = dir === 0 ? x + m : x;
                  const yPos = dir === 0 ? y : y + m;
                  expandBoard(board, xPos, yPos);
                  if (!isValidPosition(xPos, yPos, word.char[m], board, dir, word, m)) {
                    isValid = false;
                    break;
                  }
                }
                if (isValid) {
                  word.successfulMatches.push({ x, y, dir });
                  word.effectiveMatches++;
                }
              }
            }
          }
        }
      }
    }
  
    // Hàm đặt từ lên bảng
    function placeWord(word: Word, board: (string | null)[][], wordsActive: Word[]): boolean {
      if (word.successfulMatches.length === 0) return false;
  
      // Chọn ngẫu nhiên một vị trí giao nhau hợp lệ
      const matchIndex = Math.floor(Math.random() * word.successfulMatches.length);
      const matchData = word.successfulMatches[matchIndex];
  
      // Cập nhật thông tin từ
      word.x = matchData.x;
      word.y = matchData.y;
      word.dir = matchData.dir;
  
      // Đặt từng ký tự lên bảng
      for (let i = 0; i < word.char.length; i++) {
        const xIndex = matchData.dir === 0 ? matchData.x + i : matchData.x;
        const yIndex = matchData.dir === 0 ? matchData.y : matchData.y + i;
        expandBoard(board, xIndex, yIndex);
        board[xIndex][yIndex] = word.char[i];
        bounds.update(xIndex, yIndex);
      }
  
      wordsActive.push(word);
      return true;
    }
  
    // Hàm chính để đặt tất cả từ
    while (wordBank.length > 0) {
      let minMatchDiff = Infinity;
      let curIndex = -1;
  
      // Tìm từ tốt nhất để đặt
      for (let i = 0; i < wordBank.length; i++) {
        const curWord = wordBank[i];
        findMatches(curWord, board, wordsActive);
        const curMatchDiff = curWord.totalMatches - curWord.effectiveMatches;
        if (curMatchDiff < minMatchDiff && curWord.successfulMatches.length > 0) {
          minMatchDiff = curMatchDiff;
          curIndex = i;
        }
      }
  
      if (curIndex === -1) {
        return { board, wordsActive, success: false, message: 'Failed to place all words' };
      }
  
      // Đặt từ và loại khỏi wordBank
      const wordToPlace = wordBank.splice(curIndex, 1)[0];
      if (!placeWord(wordToPlace, board, wordsActive)) {
        return { board, wordsActive, success: false, message: 'Failed to place word' };
      }
    }
  
    // Cắt bảng theo bounds để trả về kích thước tối thiểu
    const trimmedBoard: (string | null)[][] = [];
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const row = board[x].slice(bounds.minY, bounds.maxY + 1);
      trimmedBoard.push(row);
    }
  
    return { board: trimmedBoard, wordsActive, success: true };
  }
  
//   // Ví dụ sử dụng
//   const wordList: string[] = ['CROSSWORD', 'PUZZLE', 'GRID', 'WORD', 'CLUE', 'GAME'];
//   const board: (string | null)[][] = Array.from({ length: 20 }, () => Array(20).fill(null));
//   const result: CrosswordResult = generateCrossword(wordList, board);
//   console.log('Success:', result.success);
//   console.log('Words Active:', result.wordsActive);
//   console.log('Board:');
//   result.board.forEach(row => console.log(row.map(c => c || '.').join(' ')));


// function AddWordToBoard(){
    
//     var i, len, curIndex, curWord, curChar, curMatch, testWord, testChar,
//         minMatchDiff = 9999, curMatchDiff;

//     if(wordsActive.length < 1){
//       curIndex = 0;
//       for(i = 0, len = wordBank.length; i < len; i++){
//         if (wordBank[i].totalMatches < wordBank[curIndex].totalMatches){
//           curIndex = i;
//         }
//       }
//       wordBank[curIndex].successfulMatches = [{x:12,y:12,dir:0}];
//     }
//     else{
//       curIndex = -1;

//       for(i = 0, len = wordBank.length; i < len; i++){
//         curWord = wordBank[i];
//         curWord.effectiveMatches = 0;
//         curWord.successfulMatches = [];
//         for(var j = 0, lenJ = curWord.char.length; j < lenJ; j++){
//           if(j == 1) continue; // skip pos
//           curChar = curWord.char[j];
//           for (var k = 0, lenK = wordsActive.length; k < lenK; k++){
//             testWord = wordsActive[k];
//             for (var l = 0, lenL = testWord.char.length; l < lenL; l++){
//               if(l == 1) continue; // skip pos
//               testChar = testWord.char[l];
//               if (curChar === testChar){
//                 curWord.effectiveMatches++;

//                 var curCross = {x:testWord.x,y:testWord.y,dir:0};
//                 if(testWord.dir === 0){
//                   curCross.dir = 1;
//                   curCross.x += l;
//                   curCross.y -= j;
//                 }
//                 else{
//                   curCross.dir = 0;
//                   curCross.y += l;
//                   curCross.x -= j;
//                 }

//                 var isMatch = true;

//                 for(var m = -1, lenM = curWord.char.length + 1; m < lenM; m++){
//                   var crossVal = [];
//                   if (m !== j){
//                     if (curCross.dir === 0){
//                       var xIndex = curCross.x + m;

//                       if (xIndex < 0 || xIndex > board.length){
//                         isMatch = false;
//                         break;
//                       }

//                       crossVal.push(board[xIndex][curCross.y]);
//                       crossVal.push(board[xIndex][curCross.y + 1]);
//                       crossVal.push(board[xIndex][curCross.y - 1]);
//                     }
//                     else{
//                       var yIndex = curCross.y + m;

//                       if (yIndex < 0 || yIndex > board[curCross.x].length){
//                         isMatch = false;
//                         break;
//                       }

//                       crossVal.push(board[curCross.x][yIndex]);
//                       crossVal.push(board[curCross.x + 1][yIndex]);
//                       crossVal.push(board[curCross.x - 1][yIndex]);
//                     }

//                     if(m > -1 && m < lenM-1){
//                       if (crossVal[0] !== curWord.char[m]){
//                         if (crossVal[0] !== null){
//                           isMatch = false;
//                           break;
//                         }
//                         else if (crossVal[1] !== null){
//                           isMatch = false;
//                           break;
//                         }
//                         else if (crossVal[2] !== null){
//                           isMatch = false;
//                           break;
//                         }
//                       }
//                     }
//                     else if (crossVal[0] !== null){
//                       isMatch = false;
//                       break;
//                     }
//                   }
//                 }

//                 if (isMatch === true){
//                   curWord.successfulMatches.push(curCross);
//                 }
//               }
//             }
//           }
//         }

//         curMatchDiff = curWord.totalMatches - curWord.effectiveMatches;

//         if (curMatchDiff<minMatchDiff && curWord.successfulMatches.length>0){
//           curMatchDiff = minMatchDiff;
//           curIndex = i;
//         }
//         else if (curMatchDiff <= 0){
//           return false;
//         }
//       }
//     }

//     if (curIndex === -1){
//       return false;
//     }

//     var spliced = wordBank.splice(curIndex, 1);
//     wordsActive.push(spliced[0]);

//     var pushIndex = wordsActive.length - 1,
//         rand = Math.random(),
//         matchArr = wordsActive[pushIndex].successfulMatches,
//         matchIndex = Math.floor(rand * matchArr.length),
//         matchData = matchArr[matchIndex];

//     wordsActive[pushIndex].x = matchData.x;
//     wordsActive[pushIndex].y = matchData.y;
//     wordsActive[pushIndex].dir = matchData.dir;

//     let actualIndex = findWordIdx(wordsActive[pushIndex].string);
//     console.log(wordsActive[pushIndex].string, " ~~~ ", actualIndex);
//     for(i = 0, len = wordsActive[pushIndex].char.length; i < len; i++){
//       var xIndex = matchData.x,
//           yIndex = matchData.y;

//       if (matchData.dir === 0){
//         xIndex += i;
//       }
//       else{
//         yIndex += i;
//       }
//       board[xIndex][yIndex] = wordsActive[pushIndex].char[i];
//       isPos[xIndex][yIndex] = (i == 1);
//       classesOfBoard[xIndex][yIndex].push(actualIndex);
//       console.log(xIndex, yIndex, classesOfBoard[xIndex][yIndex]);

//       Bounds.Update(xIndex,yIndex);
//     }

//     return true;
//   }

