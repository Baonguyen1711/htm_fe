import Round3 from '../../../layouts/RoundBase/Round3';
import Host from '../../../layouts/Host/Host';


const HostRound3: React.FC = () => {
    return (
        <Host
            QuestionComponent={<Round3 isHost={true}/>}
        />
    )
};

export default HostRound3;
