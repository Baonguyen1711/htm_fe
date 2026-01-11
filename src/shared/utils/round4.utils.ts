type CellValue = "" | "!" | "?";

export const generateRandomGrid = (
  size: number,
  levelConfig?: { easy: boolean; medium: boolean; hard: boolean }
): CellValue[][] => {
  const totalCells = size * size;

  const config = levelConfig || { easy: true, medium: true, hard: true };

  // ===== SYMBOL SET =====
  const workingSymbols: CellValue[] = [];
  if (config.easy) workingSymbols.push("");
  if (config.medium) workingSymbols.push("!");
  if (config.hard) workingSymbols.push("?");

  if (workingSymbols.length === 0) {
    workingSymbols.push("", "!", "?");
  }

  // ===== DISTRIBUTE SYMBOLS =====
  const cellsPerSymbol = Math.floor(totalCells / workingSymbols.length);
  const remainder = totalCells % workingSymbols.length;

  const symbolArray: CellValue[] = [];
  workingSymbols.forEach((sym, i) => {
    const count = cellsPerSymbol + (i < remainder ? 1 : 0);
    symbolArray.push(...Array(count).fill(sym));
  });

  // ===== SHUFFLE =====
  for (let i = symbolArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [symbolArray[i], symbolArray[j]] = [symbolArray[j], symbolArray[i]];
  }

  // ===== BUILD GRID =====
  const grid: CellValue[][] = [];
  let index = 0;

  for (let r = 0; r < size; r++) {
    const row: CellValue[] = [];
    for (let c = 0; c < size; c++) {
      row.push(symbolArray[index++] ?? "");
    }
    grid.push(row);
  }

  // ===== ENSURE EACH ROW HAS AT LEAST ONE QUESTION =====
  const hasEmpty = workingSymbols.includes("");

  if (hasEmpty) {
    for (let r = 0; r < size; r++) {
      const hasQuestion = grid[r].some(cell => cell === "!" || cell === "?");
      if (!hasQuestion) {
        outer:
        for (let r2 = 0; r2 < size; r2++) {
          if (r2 === r) continue;
          for (let c2 = 0; c2 < size; c2++) {
            if (grid[r2][c2] === "!" || grid[r2][c2] === "?") {
              const emptyCol = grid[r].findIndex(cell => cell === "");
              if (emptyCol !== -1) {
                [grid[r][emptyCol], grid[r2][c2]] = [grid[r2][c2], ""];
                break outer;
              }
            }
          }
        }
      }
    }
  }

  // ===== 8–8–9 RULE (ONLY FOR 5x5) =====
  if (size === 5 && hasEmpty && workingSymbols.length === 3) {
    const counts: Record<CellValue, number> = { "": 0, "!": 0, "?": 0 };
    grid.flat().forEach(cell => counts[cell]++);

    const sorted = Object.values(counts).sort((a, b) => a - b);
    if (!(sorted[0] === 8 && sorted[1] === 8 && sorted[2] === 9)) {
      const target: Record<CellValue, number> = { "": 8, "!": 8, "?": 9 };

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = grid[r][c];
          if (counts[cell] > target[cell]) {
            const need = (Object.keys(target) as CellValue[])
              .find(k => counts[k] < target[k]);
            if (need) {
              grid[r][c] = need;
              counts[cell]--;
              counts[need]++;
            }
          }
        }
      }
    }
  }

  return grid;
};

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