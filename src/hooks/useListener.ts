// hooks/useGameListeners.ts
import { useEffect, useRef } from 'react';
import { deletePath, listenToBuzzing, listenToStar, listenToSound, listenToAnswers, listenToQuestions, listenToSelectedCell, listenToCellColor, listenToTimeStart } from '../services/firebaseServices'; // adjust import path


export function useGameListeners({
    roomId,
    setBuzzedPlayer,
    setStaredPlayer,
    setShowModal,
    setCorrectAnswer,
    setCurrentQuestion,
    setGridColors,
    setGrid,
    setSelectedCell,
    startTimer,
    setTimeLeft,
    sounds,
    round
}: {
    roomId: string;
    setBuzzedPlayer: (name: string) => void;
    setStaredPlayer: (name: string) => void;
    setShowModal: (value: boolean) => void;
    setCorrectAnswer: (answer: string) => void;
    setCurrentQuestion: (question: string) => void;
    setGridColors: React.Dispatch<React.SetStateAction<string[][]>>
    setGrid: React.Dispatch<React.SetStateAction<string[][]>>
    setSelectedCell: (arg: { row: number; col: number }) => void;
    sounds: Record<string, HTMLAudioElement>;
    round: string,
    startTimer?: (time: number) => void;
    setTimeLeft?: (time: number) => void;
}) {
    const colorMap: Record<string, string> = {
        red: '#FF0000',
        green: '#00FF00',
        blue: '#0000FF',
        yellow: '#FFFF00',
    };

    const isInitialMount = useRef(false)
    useEffect(() => {
        const unsubscribe = listenToTimeStart(roomId, async () => {


            // Skip the timer setting on the first mount, but allow future calls to run
            if (isInitialMount.current) {
                isInitialMount.current = false;
                return;
            }
            startTimer?.(15)
            return () => {
                unsubscribe();

            };
        })

    }, [])
    useEffect(() => {

        let hasMounted = false;
        const unsubscribeBuzzing = listenToBuzzing(roomId, (playerName) => {
            // if (!hasMounted) {
            //     hasMounted = true; // skip initial
            //     return;
            // }
            const audio = sounds['buzz'];
            if (audio) {
                audio.play();
            }
            console.log("playerName on host", playerName);

            console.log("listening on buzzing");

            if (playerName && playerName !== "") {
                setBuzzedPlayer(playerName);
                console.log("playerName", typeof playerName);

                console.log(playerName, "đã bấm chuông")
                setShowModal(true); // Show modal when a player buzzes
            }
        });

        return () => {
            unsubscribeBuzzing();
        };
    }, [roomId]);

    useEffect(() => {

        let hasMounted = false;
        const unsubscribeBuzzing = listenToStar(roomId, (playerName) => {
            // if (!hasMounted) {
            //     hasMounted = true; // skip initial
            //     return;
            // }
            const audio = sounds['nshv'];
            if (audio) {
                audio.play();
            }
            console.log("playerName on host", playerName);

            console.log("listening on buzzing");

            if (playerName && playerName !== "") {
                setStaredPlayer(playerName);
                console.log("playerName", typeof playerName);

                console.log(playerName, "đã chọn ngôi sao hy vọng")
                setShowModal(true); // Show modal when a player buzzes
            }
        });

        return () => {
            unsubscribeBuzzing();
        };
    }, [roomId]);

    useEffect(() => {
        const unsubscribePlayers = listenToSound(roomId, async (type) => {

            const audio = sounds[`${type}`];
            if (audio) {
                audio.play();
            }
            console.log("sound type", type)
            await deletePath(roomId, "sound")
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToAnswers(roomId, (answer) => {
            const audio = sounds['correct'];
            if (audio) {
                audio.play();
            }
            setCorrectAnswer(`Đáp án: ${answer}`)
            const timeOut = setTimeout(() => {
                setCorrectAnswer("")
            }, 4000)
            console.log("answer", answer)
            clearTimeout(timeOut)
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();

        };
    }, []);
    useEffect(() => {

        const unsubscribePlayers = listenToQuestions(roomId, (data) => {
            console.log("questions", data);

            setCurrentQuestion(data.question)
            setCorrectAnswer("")
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToSelectedCell(roomId, (data) => {
            console.log("Selected cell data:", data);
            // Ensure data has the expected properties
            if (data && typeof data.rowIndex === 'string' && typeof data.colIndex === 'string') {
                const row = parseInt(data.rowIndex, 10);
                const col = parseInt(data.colIndex, 10);

                // Check if indices are valid numbers and within 5x5 grid bounds
                if (!isNaN(row) && !isNaN(col) && row >= 0 && row < 5 && col >= 0 && col < 5) {
                    setGridColors((prev) => {
                        const newGrid = prev.map((rowArray) => [...rowArray]);
                        // Reset all cells with light yellow (#FFFF99) to white (#FFFFFF)
                        for (let prevRow = 0; prevRow < 5; prevRow++) {
                            for (let prevCol = 0; prevCol < 5; prevCol++) {
                                if (newGrid[prevRow][prevCol] === '#FFFF99') {
                                    newGrid[prevRow][prevCol] = '#FFFFFF';
                                }
                            }
                        }
                        // Set the current cell to light yellow
                        newGrid[row][col] = '#FFFF99';
                        return newGrid;
                    });
                    // Update the selected cell
                    setSelectedCell({ row, col });
                } else {
                    console.warn(`Invalid cell indices: row=${row}, col=${col}`);
                }
            } else {
                console.warn("Invalid or missing data from listenToSelectedCell:", data);
            }
        })

        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToCellColor(roomId, (data) => {
            console.log("questions", data);
            const row = parseInt(data.rowIndex)
            const col = parseInt(data.colIndex)
            const color = data.color

            if (!isNaN(row) && !isNaN(col) && row >= 0 && row < 5 && col >= 0 && col < 5 && color) {
                setGridColors((prev) => {
                    const newGrid = prev.map((rowArray) => [...rowArray]);
                    newGrid[row][col] = colorMap[color];
                    return newGrid;
                });

                setGrid((prev) => {
                    const newGrid = prev.map((rowArray) => [...rowArray]);
                    newGrid[row][col] = "";
                    return newGrid;
                });
            }
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    
}
