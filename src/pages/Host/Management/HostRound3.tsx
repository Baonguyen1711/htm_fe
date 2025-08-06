import HostQuestionBoxRound3 from '../../../components/Round3/HostQuestionBoxRound3';
import Host from '../../../layouts/Host/Host';


const HostRound3: React.FC = () => {
    return (
        <Host
            QuestionComponent={<HostQuestionBoxRound3 isHost={true}/>}
        />
    )
};

export default HostRound3;
