import React, { useEffect, useState } from 'react';
import Host from '../../../layouts/Host/Host';
import HostQuestionBoxRound4 from '../../../components/Round4/HostQuestionBoxRound4';
import { useFirebaseListener } from '../../../shared/hooks';
import useGameApi from '../../../shared/hooks/api/useGameApi';
import { useSearchParams } from 'react-router-dom';
import Modal from '../../../components/ui/Modal/Modal';
import { useSounds } from '../../../context/soundContext';
const exampleGrid = [
    ['!', '', '?', '', '!'],
    ['', '?', '!', '', '?'],
    ['?', '', '', '!', '?'],
    ['!', '?', '', '', '!'],
    ['?', '!', '', '?', ''],
];

const HostRound4: React.FC = () => {
    const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
    const [staredPlayer, setStaredPlayer] = useState<string>("");
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const { listenToBuzzedPlayer, listenToStar } = useFirebaseListener();
    const { resetBuzz, resetStar } = useGameApi()
    const sounds = useSounds();
    useEffect(() => {
        const unsubscribeBuzzedPlayer = listenToBuzzedPlayer(
            (playerName) => {
                const audio = sounds["buzz"];
                if (audio) {
                    audio.play();
                }
                setShowModal(true)
                setBuzzedPlayer(playerName)
            }
        )

        return () => {
            unsubscribeBuzzedPlayer();
        };
    }, [])

    useEffect(() => {
        const unsubscribeStaredPlayer = listenToStar(
            (playerName) => {
                setShowModal(true)
                setStaredPlayer(playerName)
            }
        )

        return () => {
            unsubscribeStaredPlayer();
        };
    }, [])
    const handleCloseModal = () => {
        setShowModal(false);
        // Optionally clear buzzedPlayer if you want to reset it
        setBuzzedPlayer("");
        setStaredPlayer("");
        resetBuzz(roomId)
        resetStar(roomId)
    };
    return (
        <>
            <Host
                QuestionComponent={<HostQuestionBoxRound4 initialGrid={exampleGrid} isHost={true} />}
            />
            {showModal && buzzedPlayer &&
                <Modal
                    text={`${buzzedPlayer} đã nhấn chuông giành quyền trả lời`}
                    buttons={[
                        { text: "Đóng", onClick: handleCloseModal, variant: "primary" },
                    ]}
                    onClose={handleCloseModal}
                />
            }

            {showModal && staredPlayer &&
                <Modal
                    text={`${staredPlayer} đã chọn ngôi sao hy vọng`}
                    buttons={[
                        { text: "Đóng", onClick: handleCloseModal, variant: "primary" },
                    ]}
                    onClose={handleCloseModal}
                />
            }
        </>

    )
};

export default HostRound4;
