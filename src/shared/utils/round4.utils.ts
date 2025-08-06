export const generateRandomGrid = (levelConfig?: { easy: boolean; medium: boolean; hard: boolean }): ("" | "!" | "?")[][] => {
        const size = 5;
        const totalCells = size * size; // 25

        // Default to all levels if no config provided
        const config = levelConfig || { easy: true, medium: true, hard: true };

        // Determine which symbols to use based on configuration - ONLY include selected levels
        const workingSymbols: ("" | "!" | "?")[] = [];
        if (config.easy) workingSymbols.push("");
        if (config.medium) workingSymbols.push("!");
        if (config.hard) workingSymbols.push("?");

        // If no levels selected, default to all
        if (workingSymbols.length === 0) {
            workingSymbols.push("", "!", "?");
        }

        console.log("Working symbols:", workingSymbols);

        // Distribute cells evenly among working symbols
        const cellsPerSymbol = Math.floor(totalCells / workingSymbols.length);
        const remainder = totalCells % workingSymbols.length;

        let symbolArray: ("" | "!" | "?")[] = [];
        for (let i = 0; i < workingSymbols.length; i++) {
            const count = cellsPerSymbol + (i < remainder ? 1 : 0);
            console.log(`Symbol ${workingSymbols[i]}: ${count} cells`);
            for (let j = 0; j < count; j++) {
                symbolArray.push(workingSymbols[i]);
            }
        }

        console.log("Symbol array:", symbolArray);

        // Shuffle array
        for (let i = symbolArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [symbolArray[i], symbolArray[j]] = [symbolArray[j], symbolArray[i]];
        }

        // Create 5x5 grid, replace undefined/null with ""
        let grid: ("" | "!" | "?")[][] = [];
        let index = 0;
        for (let i = 0; i < size; i++) {
            let row: ("" | "!" | "?")[] = [];
            for (let j = 0; j < size; j++) {
                const value = index < symbolArray.length ? symbolArray[index++] : "";
                row.push(value);
            }
            grid.push(row);
        }

        // Ensure each row has at least one question (non-empty cell) if we have empty cells
        const shouldIncludeEmpty = workingSymbols.includes("");
        if (shouldIncludeEmpty) {
            for (let i = 0; i < size; i++) {
                const hasNonEmpty = grid[i].some(cell => cell === "!" || cell === "?");
                if (!hasNonEmpty) {
                    // Find a row with multiple "!" or "?" to swap
                    let donorRow = -1;
                    let donorCol = -1;
                    for (let r = 0; r < size; r++) {
                        if (r === i) continue;
                        const nonEmptyCount = grid[r].filter(cell => cell === "!" || cell === "?").length;
                        if (nonEmptyCount > 1) {
                            for (let c = 0; c < size; c++) {
                                if (grid[r][c] === "!" || grid[r][c] === "?") {
                                    donorRow = r;
                                    donorCol = c;
                                    break;
                                }
                            }
                            if (donorRow !== -1) break;
                        }
                    }

                    if (donorRow !== -1) {
                        // Swap with an empty cell in the target row
                        for (let c = 0; c < size; c++) {
                            if (grid[i][c] === "") {
                                [grid[i][c], grid[donorRow][donorCol]] = [grid[donorRow][donorCol], grid[i][c]];
                                break;
                            }
                        }
                    } else {
                        // Place "!" in an empty cell and adjust elsewhere
                        for (let c = 0; c < size; c++) {
                            if (grid[i][c] === "") {
                                grid[i][c] = "!";
                                // Replace a "!" elsewhere with ""
                                for (let r = 0; r < size; r++) {
                                    if (r === i) continue;
                                    for (let c2 = 0; c2 < size; c2++) {
                                        if (grid[r][c2] === "!") {
                                            grid[r][c2] = "";
                                            break;
                                        }
                                    }
                                    if (grid[r].some(cell => cell === "")) break;
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Only apply 8-8-9 rule if we have all three symbol types (including empty)
        if (shouldIncludeEmpty && workingSymbols.length === 3) {
            // Verify counts (8, 8, 9)
            const finalCounts: Record<"" | "!" | "?", number> = { "": 0, "!": 0, "?": 0 };
            for (const row of grid) {
                for (const cell of row) {
                    finalCounts[cell]++;
                }
            }
            const countValues = Object.values(finalCounts).sort((a, b) => a - b);
            if (countValues[0] !== 8 || countValues[1] !== 8 || countValues[2] !== 9) {
                // Adjust counts by swapping to achieve 8, 8, 9
                let targetCounts: Record<"" | "!" | "?", number> = { "": 8, "!": 8, "?": 9 };
                // Randomly assign 8, 8, 9 to symbols
                const tempCounts = [8, 8, 9];
                const tempSymbols = [...workingSymbols];
                for (let i = tempCounts.length - 1; i >= 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    targetCounts[tempSymbols[j]] = tempCounts[i];
                    tempSymbols.splice(j, 1);
                }

                // Adjust grid to match target counts
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        if (finalCounts[grid[i][j]] > targetCounts[grid[i][j]]) {
                            // Find a cell to swap with a symbol that needs more
                            for (const sym of workingSymbols) {
                                if (finalCounts[sym] < targetCounts[sym]) {
                                    grid[i][j] = sym;
                                    finalCounts[grid[i][j]]--;
                                    finalCounts[sym]++;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        return grid;
    }

export const getDifficultyRanges = (round4Level: { easy: boolean; medium: boolean; hard: boolean }) => {
  const activeDifficulties: ('easy' | 'medium' | 'hard')[] = Object.entries(round4Level)
    .filter(([, value]) => value)
    .map(([key]) => key as 'easy' | 'medium' | 'hard');
  const numberOfLevel = activeDifficulties.length;
  const perDifficulty = numberOfLevel === 1 ? 60 : numberOfLevel === 2 ? 30 : 20;
  
  return activeDifficulties.reduce((acc: { easy: number; medium: number; hard: number }, key, index) => {
    acc[key] = index * perDifficulty;
    return acc;
  }, { easy: 0, medium: 0, hard: 0 });
}