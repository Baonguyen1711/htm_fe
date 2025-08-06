import BaseQuestionBoxRound1 from '../../../components/Round1/BaseQuestionBoxRound1';
import User from '../../../layouts/User/User';

interface UserRound1Props {
    isSpectator?: boolean;
}

function UserRound1({ isSpectator }: UserRound1Props) {

    return (
        <User
            QuestionComponent={<BaseQuestionBoxRound1 isHost={false} isSpectator={isSpectator} />}
            isSpectator={isSpectator}
        />
    );
}

export default UserRound1;
