
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../shared/hooks/auth/useAuth';
import useRoomApi from '../../shared/hooks/api/useRoomApi';
import useTestApi from '../../shared/hooks/api/useTestApi';
import { Button } from '../../shared/components/ui';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import tokenRefreshService from '../../shared/services/auth/tokenRefresh';

interface Room {
    roomId: string;
    isActive: boolean;
    mode: 'manual' | 'auto' | 'adaptive' | 'multiplayer_manual' | 'multiplayer_auto';
    roomMode: "room" | "multiplayer" | "practice";
    selectedTestName: string;
    randomQuestionCount?: number;
    catergory?: string;
    roundScores: {
        round1: number[];
        round2: number[];
        round3: number;
        round4: number[];
    };
    round4Levels?: {
        easy: boolean;
        medium: boolean;
        hard: boolean;
    };
}

const CreatePracticeRoom = () => {


    const navigate = useNavigate();
    const [roomId, setRoomId] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { signInWithoutPassword, authenticateUserManually } = useAuth();
    const { validateRoom } = useRoomApi();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [roomPassword, setRoomPassword] = useState<string>("");
    const [createdRoomId, setCreatedRoomId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { createRoom } = useRoomApi();
    const { getRandomQuestions } = useTestApi();

    // const handleCreatePracticeRoom = async () => {
    //     let timeoutId: NodeJS.Timeout | null = null;
    //     if (isLoading) return; // Prevent multiple login attempts

    //     setIsLoading(true); // Set loading state to true
    //     const toastId = toast.info('Đang lấy thông tin phòng, vui lòng chờ...', {
    //         position: 'top-right',
    //         autoClose: false, // Keep toast until manually dismissed or updated
    //         hideProgressBar: false,
    //         closeOnClick: false,
    //         pauseOnHover: true,
    //     });

    //     try {
    //         if (!roomId.trim()) {
    //             alert("Vui lòng nhập mã phòng");
    //             return;
    //         }

    //         // Validate room and password first
    //         try {
    //             console.log("roomId", roomId);
    //             const params: any = { room_id: roomId };
    //             if (password) {
    //                 params.password = password;
    //             }

    //             await validateRoom(roomId, password);
    //         } catch (error: any) {
    //             if (error.response?.status === 404) {
    //                 alert("Phòng không tồn tại");
    //                 return;
    //             } else if (error.response?.status === 403) {
    //                 alert("Mật khẩu phòng không đúng");
    //                 return;
    //             } else {
    //                 alert("Lỗi khi kiểm tra phòng");
    //                 return;
    //             }
    //         }

    //         // Sign in anonymously and wait for auth token to be set
    //         await signInWithoutPassword();

    //         await new Promise<void>((resolve) => {
    //             timeoutId = setTimeout(() => {
    //                 resolve();
    //             }, 800);
    //         });

    //         toast.dismiss(toastId); // Dismiss the loading toast
    //         toast.success('Đã lấy thông tin phòng thành công!', {
    //             position: 'top-right',
    //             autoClose: 3000,
    //         });

    //         // Manually authenticate to set cookies
    //         await authenticateUserManually();

    //         // Get access token for the room
    //         try {

    //             const params = new URLSearchParams({ roomid: roomId });
    //             if (password) {
    //                 params.append('password', password);
    //             }
    //             navigate(`/user/info?${params.toString()}`);
    //         } catch (tokenError) {
    //             console.error("Error getting access token:", tokenError);
    //             toast.dismiss(toastId); // Dismiss the loading toast
    //             toast.error('Lỗi khi lấy thông tin phòng', {
    //                 position: 'top-right',
    //                 autoClose: 3000,
    //             });
    //             return;
    //         }
    //     } catch (error) {
    //         console.error("Error during joining room:", error);
    //         alert("Lỗi khi tham gia phòng");
    //     } finally {
    //         // Clear the timeout if it exists to prevent memory leaks
    //         if (timeoutId) {
    //             clearTimeout(timeoutId);
    //         }
    //     }
    // };

    const handleCreatePracticeRoom = async () => {
        let timeoutId: NodeJS.Timeout | null = null;
        await signInWithoutPassword();

        await new Promise<void>((resolve) => {
            timeoutId = setTimeout(() => {
                resolve();
            }, 1000);
        });

        await authenticateUserManually();
        const data = await createRoom({
            expired_time: 2,
            password: roomPassword || undefined,
            max_players: 4,
            roomMode: "practice",
        });
        console.log('data', data);

        const newRoom: Room = {
            roomId: data.roomId,
            isActive: data.isActive,
            mode: 'manual',
            roomMode: "practice",
            selectedTestName: '', // Set default to first test in testList
            roundScores: {
                round1: [15, 10, 10, 10],
                round2: [15, 10, 10, 10],
                round3: 10,
                round4: [10, 20, 30],
            },
            round4Levels: {
                easy: true,
                medium: true,
                hard: true,
            },
        };
        setCreatedRoomId(data.roomId);
        setShowCreateModal(false);
        setRoomPassword('');
        setShowModal(true);
    };

    const handleCreatePrivatePracticeRoom = async () => {
        navigate(`/practice/private`);
    }

    const handleJoinPracticeRoom = async () => {

        let randomTestName = "";
        //get 5 random questions for testing
        const result = await getRandomQuestions(5);
        console.log("random questions", result)
        randomTestName = result.testName;
        const testId = result.testId;
        localStorage.setItem(`testId`, testId);


        const response = await authService.getAccessToken({
            roomId: createdRoomId,
            testName: randomTestName,
            roomMode: "practice",
            playMode: "auto"
        });

        console.log('response', response);

        const accessToken = response.accessToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem(`mode_${createdRoomId}`, "practice");

        tokenRefreshService.startAutoRefresh(accessToken);

        navigate(`/user/info?roomid=${createdRoomId}&testName=${randomTestName}&roomMode=practice&playMode=auto&isRoomOwner=true`);
    };
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Ocean/Starry Night Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
                {/* Stars overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
                {/* Ocean waves effect */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
                {/* Animated waves */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    {/* Welcome Section */}
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 bg-clip-text">
                            Hành Trình Magellan
                        </h1>
                        <p className="text-blue-200/90 text-lg">
                            Chế độ luyện tập
                        </p>
                    </div>

                    {/* Join Room Form */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-2xl p-8">
                        <h2 className="text-2xl font-bold text-white text-center mb-6">
                            Tạo phòng luyện tập
                        </h2>

                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="mb-6">
                                <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="roomId">
                                    Tạo phòng luyện tập mới
                                </label>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                                <Button
                                    type="button"
                                    onClick={handleCreatePracticeRoom}
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    className="font-medium shadow-lg"
                                >
                                    Tạo phòng luyện tập mới
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleCreatePrivatePracticeRoom}
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    className="font-medium shadow-lg"
                                >
                                    Tự luyện tập
                                </Button>

                            </div>


                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-blue-200/70 text-sm">
                                Bạn muốn tham gia phòng luyện tập?{' '}
                                <Link
                                    to="/join"
                                    className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                                >
                                    Tham gia ngay
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-6">
                        <Link
                            to="/"
                            className="text-blue-300/80 hover:text-blue-200 text-sm transition-colors"
                        >
                            ← Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 flex items-start justify-center bg-black/50 backdrop-blur-sm z-50 pt-20">
                    <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-400/50 rounded-xl p-8 shadow-2xl sm:max-w-md w-full mx-4">
                        <div className="text-center">

                            <h3 className="text-2xl font-semibold text-white mb-4">Tạo Phòng luyện tập Mới</h3>
                            <p className="text-blue-200/70 mb-4">Nhập mật khẩu cho phòng (tùy chọn):</p>
                            <input
                                type="password"
                                placeholder="Mật khẩu phòng (để trống nếu không cần)"
                                value={roomPassword}
                                onChange={(e) => setRoomPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm mb-4"
                            />


                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowCreateModal(false)}
                                    variant="secondary"
                                    size="lg"
                                    className="flex-1 font-medium"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleCreatePracticeRoom}
                                    variant="success"
                                    size="lg"
                                    className="flex-1 font-medium shadow-lg"
                                >
                                    Tạo Phòng
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-start justify-center bg-black/50 backdrop-blur-sm z-40 pt-20">
                    <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-400/50 rounded-xl p-8 shadow-2xl sm:max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-4xl mb-4">🎉</div>
                            <h3 className="text-2xl font-semibold text-white mb-4">Tạo Phòng thành công!</h3>
                            <p className="text-blue-200/70 mb-2">Mã phòng của bạn:</p>
                            <p className="text-cyan-400 font-mono text-xl font-bold mb-6 bg-gray-800/50 py-3 px-4 rounded-md">{createdRoomId}</p>
                            {/* <Button
                onClick={handleCloseModal}
                variant="primary"
                size="lg"
                className="font-medium shadow-lg"
              >
                Đóng
              </Button> */}

                            <Button
                                onClick={handleJoinPracticeRoom}
                                variant="primary"
                                size="lg"
                                className="font-medium shadow-lg"
                            >
                                Đi đến phòng luyện tập ngay
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePracticeRoom;
