import React, {useEffect} from 'react';
import FinalScore from '../../components/FinalScore';
import { useSounds } from '../../context/soundContext';
import { listenToSound } from '../../services/firebaseServices';
import { useSearchParams } from 'react-router-dom';
import { deletePath } from '../../services/firebaseServices';
const PlayerFinalScore: React.FC = () => {
    const sounds = useSounds();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "";
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

    return (
        <FinalScore />
    );
};



export default PlayerFinalScore;