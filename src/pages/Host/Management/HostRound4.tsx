import Round4 from '../../../layouts/RoundBase/Round4';

import React from 'react';
import Host from '../../../layouts/Host/Host';
import HostQuestionBoxRound4 from '../../../layouts/RoundBase/Host/HostQuestionBoxRound4';

import Play from '../../../layouts/Play';// Importing the shared Play component

const exampleGrid = [
    ['!', '', '?', '', '!'],
    ['', '?', '!', '', '?'],
    ['?', '', '', '!', '?'],
    ['!', '?', '', '', '!'],
    ['?', '!', '', '?', ''],
];

// Example questions for testing
const exampleQuestions = [
    'Question 1', 'Question 2', 'Question 3', 'Question 4', 'Question 5',
    'Question 6', 'Question 7', 'Question 8', 'Question 9', 'Question 10',
    'Question 11', 'Question 12', 'Question 13', 'Question 14', 'Question 15',
    'Question 16', 'Question 17', 'Question 18', 'Question 19', 'Question 20',
    'Question 21', 'Question 22', 'Question 23', 'Question 24', 'Question 25',
];


const HostRound4: React.FC = () => {
    return (
        <Host
            QuestionComponent ={<HostQuestionBoxRound4 questions={exampleQuestions} initialGrid={exampleGrid} isHost={true}/>}
        />

    )
};

export default HostRound4;
