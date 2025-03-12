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

    const shuffledWords = words.sort(() => Math.random() - 0.5);
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