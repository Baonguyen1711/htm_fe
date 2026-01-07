import BaseQuestionBoxRound1 from '../../../components/Round1/BaseQuestionBoxRound1';
import User from '../../../layouts/User/User';
import GameLayout from '../../../layouts/GameLayout';

interface UserRound1Props {
    isSpectator?: boolean;
}

function UserRound1({ isSpectator }: UserRound1Props) {

    return (
        <User
            questionComponent={<BaseQuestionBoxRound1 isHost={false} isSpectator={isSpectator} />}
            isSpectator={false}
        />
    );
}

export default UserRound1;
