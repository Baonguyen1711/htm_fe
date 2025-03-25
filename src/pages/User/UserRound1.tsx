import Round1 from '../../layouts/RoundBase/Round1';
import User from '../../layouts/User/User';


function UserRound1() {
    return (
        <User
            QuestionComponent={<Round1/>}
        />
    );
}

export default UserRound1