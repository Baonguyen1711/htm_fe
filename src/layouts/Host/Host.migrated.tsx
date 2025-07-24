// MIGRATED VERSION: Host layout using Redux and new hooks
import React from 'react';
import { useAppSelector } from '../../app/store';
import { GameState } from '../../shared/types';
import Play from '../Play.migrated';
import HostAnswer from '../../components/HostAnswer.migrated';
import HostManagement from '../../components/HostManagement.migrated';

interface HostInterfaceProps {
    QuestionComponent: React.ReactNode;
}

const Host: React.FC<HostInterfaceProps> = ({ QuestionComponent }) => {
    // Redux state
    const { loading } = useAppSelector((state) => state.game as GameState);

    // Show loading state if needed
    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading host interface...</p>
                </div>
            </div>
        );
    }

    return (
        <Play
            questionComponent={QuestionComponent}
            PlayerScore={<HostAnswer />}
            SideBar={<HostManagement />}
            isHost={true}
        />
    );
};

export default Host;
