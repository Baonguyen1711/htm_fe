import PlayerQuestionBoxRound3 from "../../../components/Round3/PlayerQuestionBoxRound3";
import User from "../../../layouts/User/User";


interface UserRound3Props {
    isSpectator?: boolean;
}

function UserRound3({ isSpectator }: UserRound3Props) {

    return (
        <User
            QuestionComponent={<PlayerQuestionBoxRound3 isHost={false} />}
            isSpectator={isSpectator}
        />
    );
}

export default UserRound3;
