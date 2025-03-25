import Round1 from '../../../layouts/RoundBase/Round1';
import React from 'react';
import Host from '../../../layouts/Host/Host';
import QuestionBoxRound1 from '../../../layouts/RoundBase/Round1';

const HostRound1: React.FC = () => {
    return (
        <Host
            QuestionComponent={<QuestionBoxRound1/>}
        />
    )
};

export default HostRound1;
