import User from '../../../layouts/User/User';
import useFirebaseListener from "../../../shared/hooks/firebase/useFirebaseListener";
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import PlayerQuestionBoxRound4 from '../../../components/Round4/PlayerQuestionBoxRound4';
import useGameApi from '../../../shared/hooks/api/useGameApi';
import Modal from '../../../components/ui/Modal/Modal';
import { useSounds } from '../../../context/soundContext';
const exampleGrid = [
    ['!', '', '?', '', '!'],
    ['', '?', '!', '', '?'],
    ['?', '', '', '!', '?'],
    ['!', '?', '', '', '!'],
    ['?', '!', '', '?', ''],
];

// Example questions for testing
const exampleQuestions = [
    'Question 1', 'Question 2', 'Question 3', 'Question 4', 'Question 5',
    'Question 6', 'Question 7', 'Question 8', 'Question 9', 'Question 10',
    'Question 11', 'Question 12', 'Question 13', 'Question 14', 'Question 15',
    'Question 16', 'Question 17', 'Question 18', 'Question 19', 'Question 20',
    'Question 21', 'Question 22', 'Question 23', 'Question 24', 'Question 25',
];

interface UserRound4Props {
    isSpectator?: boolean;
}

function UserRound4({ isSpectator }: UserRound4Props) {


    const initialGrid = [
        ['!', '', '?', '', '!'],
        ['', '?', '!', '', '?'],
        ['?', '', '', '!', '?'],
        ['!', '?', '', '', '!'],
        ['?', '!', '', '?', ''],
    ];
    const [loading, setLoading] = useState(true);

    const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
    const [staredPlayer, setStaredPlayer] = useState<string>("");
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const { listenToBuzzedPlayer, listenToStar } = useFirebaseListener();
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
    };

    useEffect(() => {
        if (initialGrid && initialGrid.length > 0) {
            console.log("initialGrid", initialGrid);

            setLoading(false);
        }
    }, [initialGrid]);
    return (
        // <Round4 isHost={false}/>
        <>
            <User
                QuestionComponent={<PlayerQuestionBoxRound4 questions={exampleQuestions} initialGrid={initialGrid} isHost={false} isSpectator={isSpectator} />}
                isSpectator={isSpectator}
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
    );
}

export default UserRound4;