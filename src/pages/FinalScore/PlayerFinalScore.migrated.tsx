// MIGRATED VERSION: PlayerFinalScore using Redux and new hooks
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { addToast } from '../../app/store/slices/uiSlice';
import FinalScore from '../../components/FinalScore.migrated';
import { listenToSound, deletePath } from '../../services/firebaseServices';

const PlayerFinalScore: React.FC = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const roomId = searchParams.get("roomId") || "";

    useEffect(() => {
        if (!roomId) return;

        const unsubscribeSound = listenToSound(roomId, async (type: string) => {
            try {
                // Create and play audio element
                const audio = new Audio();
                
                // Map sound types to audio files
                const soundMap: { [key: string]: string } = {
                    'correct': '/sounds/correct.mp3',
                    'incorrect': '/sounds/incorrect.mp3',
                    'next': '/sounds/next.mp3',
                    'finish': '/sounds/finish.mp3',
                    'applause': '/sounds/applause.mp3',
                    'countdown': '/sounds/countdown.mp3'
                };

                const soundFile = soundMap[type];
                if (soundFile) {
                    audio.src = soundFile;
                    audio.volume = 0.7; // Set volume to 70%
                    
                    try {
                        await audio.play();
                        console.log(`Playing sound: ${type}`);
                    } catch (playError) {
                        console.warn(`Could not play sound ${type}:`, playError);
                        // Fallback: show toast notification instead
                        dispatch(addToast({
                            type: 'info',
                            title: 'Sound Effect',
                            message: `Sound: ${type}`,
                            duration: 2000
                        }));
                    }
                } else {
                    console.warn(`Unknown sound type: ${type}`);
                }

                // Clean up the sound path in Firebase
                await deletePath(roomId, "sound");
                
            } catch (error) {
                console.error("Error handling sound:", error);
                dispatch(addToast({
                    type: 'error',
                    title: 'Sound Error',
                    message: 'Failed to play sound effect'
                }));
            }
        });

        return () => {
            if (unsubscribeSound) {
                unsubscribeSound();
            }
        };
    }, [roomId, dispatch]);

    return (
        <FinalScore />
    );
};

export default PlayerFinalScore;
