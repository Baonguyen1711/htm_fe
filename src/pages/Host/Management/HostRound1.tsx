import React from 'react';
import Host from '../../../layouts/Host/Host';
import BaseQuestionBoxRound1 from '../../../components/Round1/BaseQuestionBoxRound1';

const HostRound1: React.FC = () => {
    return (
        <Host
            QuestionComponent={<BaseQuestionBoxRound1 isHost={true}/>}
        />
    )
};

export default HostRound1;
