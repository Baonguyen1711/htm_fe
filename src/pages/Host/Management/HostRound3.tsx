import HostQuestionBoxRound3 from '../../../components/Round3/HostQuestionBoxRound3';
import Host from '../../../layouts/Host/Host';


const HostRound3: React.FC<{ isMC?: boolean }> = ({ isMC }) => {
    return (
        <Host
            QuestionComponent={<HostQuestionBoxRound3 isHost={true}/>}
            isMC={isMC}
        />
    )
};

export default HostRound3;
