// MIGRATED VERSION: User layout using Redux and new hooks
import React from 'react';
import { useAppSelector } from '../../app/store';
import { GameState } from '../../shared/types';
import Play from '../Play.migrated';
import PlayerScore from '../../components/PlayerScore.migrated';
import PlayerAnswer from '../../components/PlayerAnswer.migrated';

interface UserInterfaceProps {
    QuestionComponent: React.ReactNode;
    isSpectator?: boolean;
}

const User: React.FC<UserInterfaceProps> = ({ QuestionComponent, isSpectator = false }) => {
    // Redux state
    const { loading } = useAppSelector((state) => state.game as GameState);

    // Show loading state if needed
    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading game...</p>
                </div>
            </div>
        );
    }

    return (
        <Play
            questionComponent={QuestionComponent}
            PlayerScore={<PlayerAnswer isSpectator={isSpectator} />}
            SideBar={<PlayerScore />}
            isHost={false}
        />
    );
};

export default User;
