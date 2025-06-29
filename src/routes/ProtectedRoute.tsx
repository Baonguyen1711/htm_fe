import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth.service';
import axios from 'axios';

interface VerifyResponse {

    roomId: string;
    role: 'host' | 'player' | 'spectator';
    userId: string;
    exp: number;

}

const routeRoleMap: { [key: string]: 'host' | 'player' | 'spectator' } = {
    '/host': 'host',
    '/play': 'player',
    '/spectator': 'spectator',
};

const AccessDeniedModal: React.FC<{ onClose: () => void; message: string }> = ({ onClose, message }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="bg-slate-800/90 border border-red-400/50 rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
                <div className="text-4xl mb-4">🚫</div>
                <h3 className="text-2xl font-semibold text-white mb-4">Access Denied</h3>
                <p className="text-red-200/70 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-orange-700 font-medium transition-colors duration-300 shadow-lg hover:shadow-red-600/30"
                >
                    Go Back
                </button>
            </div>
        </div>
    </div>
);

const ProtectedRoute: React.FC<{ element: ReactNode, requireAccessToken?: boolean, requireHost?: boolean }> = ({
    element, requireAccessToken = false, requireHost = false
}) => {
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("You don't have permission to access this route.");
    const [isVerified, setIsVerified] = useState(false);
    const [params] = useSearchParams()
    const location = useLocation();
    const navigate = useNavigate();
    const roomId = params.get("roomId") || ""
    useEffect(() => {
        const verify = async () => {
            if (requireAccessToken) {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setModalMessage('No access token found. Please log in.');
                    setShowModal(true);
                    return;
                }

                try {
                    const response = await axios.post<VerifyResponse>(
                        `http://localhost:8000/api/auth/verify`,
                        {},
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        }
                    );

                    const payload = response.data;
                    if (!payload) {
                        setModalMessage('Invalid token payload.');
                        setShowModal(true);
                        return;
                    }

                    const requiredRole = routeRoleMap[`/${location.pathname.split('/')[1]}`];
                    console.log("payload room Id", payload.roomId);
                    console.log("roomId", roomId);
                    
                    

                    if (!requiredRole || payload.role !== requiredRole ) {
                        setModalMessage("You don't have the right role to access this route.");
                        setShowModal(true);
                        return;
                    }

                    if (payload.roomId !== roomId) {
                        setModalMessage("You don't have the host right to this room Id.");
                        setShowModal(true);
                        return;
                    }

                    const currentTime = Date.now() / 1000;
                    if (payload.exp < currentTime) {
                        setModalMessage('Your session has expired. Please log in again.');
                        setShowModal(true);
                        return;
                    }

                    setIsVerified(true);
                } catch (error) {
                    console.error('Error verifying access token:', error);
                    setModalMessage('Failed to verify access token. Please try again.');
                    setShowModal(true);
                }
            } else if (requireHost) {
                // Example: check Firebase user info (maybe from localStorage or a backend API)
                const response = await authService.isHost({})
                console.log("response.data", response);
                
                if(!response) {
                    setModalMessage("You don't have the right role to access this route.");
                    setShowModal(true);
                    return;
                }

                setIsVerified(true);


            } else {
                // No protection required (optional)
                setIsVerified(true);
            }
        };

        verify();
    }, [location.pathname, requireAccessToken, requireHost]);

    const handleCloseModal = () => {
        setShowModal(false);
        navigate(-1);
    };

    if (showModal) {
        return <AccessDeniedModal onClose={handleCloseModal} message={modalMessage} />;
    }

    if (!isVerified) {
        return null; // or <LoadingSpinner />
    }

    return element;
};


export default ProtectedRoute