import React, { useEffect } from 'react';
import FinalScore from '../../components/FinalScore/FinalScore';
import { useSounds } from '../../context/soundContext';
import { useSearchParams } from 'react-router-dom';
import { useFirebaseListener } from '../../shared/hooks';


const PlayerFinalScore: React.FC = () => {
    const sounds = useSounds();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "";
    const { listenToSound, deletePath } = useFirebaseListener();

    useEffect(() => {
        const unsubscribeSound = listenToSound(

            (type) => {
                const audio = sounds[`${type}`];
                if (audio) {
                    audio.play();
                }
                deletePath("sound")
            }
        );

        return () => {
            unsubscribeSound();
        };
    }, []);

    return (
        <FinalScore />
    );
};



export default PlayerFinalScore;