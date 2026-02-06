import BaseQuestionBoxRound1 from '../../../components/Round1/BaseQuestionBoxRound1';
import User from '../../../layouts/User/User';
import GameLayout from '../../../layouts/GameLayout';

interface UserRound1Props {
    isSpectator?: boolean;
    isMC?: boolean;
}

function UserRound1({ isSpectator = false, isMC = false }: UserRound1Props) {

    return (
        <User
            questionComponent={<BaseQuestionBoxRound1 isHost={false} isSpectator={isSpectator} />}
            isSpectator={isSpectator}
            isMC={isMC}
        />
    );
}

export default UserRound1;
