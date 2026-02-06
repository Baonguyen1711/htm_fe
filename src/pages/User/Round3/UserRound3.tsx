import PlayerQuestionBoxRound3 from "../../../components/Round3/PlayerQuestionBoxRound3";
import User from "../../../layouts/User/User";


interface UserRound3Props {
    isSpectator?: boolean;
    isMC?: boolean;
}

function UserRound3({ isSpectator = false, isMC = false }: UserRound3Props) {

    return (
        <User
            questionComponent={<PlayerQuestionBoxRound3 isHost={false} />}
            isSpectator={isSpectator}
            isMC={isMC}
        />
    );
}

export default UserRound3;
