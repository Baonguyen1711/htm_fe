import React, { useEffect, useState } from 'react'
import { Question } from '../../shared/types'
import Modal from '../ui/Modal/Modal'
import useConfirmModal from '../../shared/hooks/ui/useConfirmModal'
import { useFirebaseListener } from '../../shared/hooks'
import { useTimeStart } from '../../context/timeListenerContext'
import { useSounds } from '../../context/soundContext'
import QuestionAndAnswer from '../ui/QuestionAndAnswer/QuestionAndAnswer'
import QuestionTimerBar from '../ui/QuestionTimeBar'
import useGameApi from '../../shared/hooks/api/useGameApi'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '../../app/store'
import { setCurrentTurn } from '../../app/store/slices/gameSlice'
import { toast } from "react-toastify"

interface BaseQuestionBoxRound3Props {
    isHost: boolean
    isSpectator?: boolean
    selectedPacketName: string | null
    packetNames: string[]
    shouldReturnToPacketSelection: boolean
    currentQuestion: Question | null
    currentCorrectAnswer: string

    handleTopicSelect: (topic: string) => void
    handleToggleUsedTopic: (packet: string) => void
    handleCorrectClick: () => void
    handleIncorrectClick: () => void
    handleReturnToTopicSelection: () => void
}

const MYSTERY_INDEX = 4

const BaseQuestionBoxRound3: React.FC<BaseQuestionBoxRound3Props> = ({
    isHost,
    selectedPacketName,
    packetNames,
    shouldReturnToPacketSelection,
    currentQuestion,
    currentCorrectAnswer,
    handleTopicSelect,
    handleToggleUsedTopic,
    handleCorrectClick,
    handleIncorrectClick,
    handleReturnToTopicSelection,
}) => {
    const baseBtn =
        'w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-800/60 text-slate-100 \
        hover:bg-slate-700/60 hover:border-white/20 transition-all duration-200 \
        disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium'

    const { modalState, closeModal } = useConfirmModal()
    const [usedPacketNames, setUsedPacketNames] = useState<string[]>([])
    const [packetList, setPacketList] = useState<string[]>([])

    const { listenToUsedPackets, listenToTimeStart } = useFirebaseListener()
    const { startTimer } = useTimeStart()
    const sounds = useSounds()
    const { sendCurrentTurn, sendPacketsName } = useGameApi()
    const dispatch = useAppDispatch()

    const [searchParams] = useSearchParams()
    const roomId = searchParams.get('roomId') || '1'

    const handleConfirmPacket = async () => {
        const packetsToSend = packetList.map((packet, index) =>
            index === MYSTERY_INDEX ? "?" : packet
        )

        await sendPacketsName(roomId, packetsToSend)
        toast.success("Đã xác nhận tên gói")
    }

    /* ================= INIT ================= */

    useEffect(() => {
        if (Array.isArray(packetNames)) {
            setPacketList(packetNames)
        }
    }, [packetNames])

    useEffect(() => {
        const unsubscribe = listenToTimeStart(() => {
            const audio = sounds['timer_3']
            audio?.play()
            startTimer(60)
        })
        return unsubscribe
    }, [])

    useEffect(() => {
        return () => {
            dispatch(setCurrentTurn(0))
            if(isHost) {
                sendCurrentTurn(roomId, 0)
            }
        }
    }, [])

    useEffect(() => {
        const unsubscribe = listenToUsedPackets((usedPacketsName) => {
            setUsedPacketNames(Array.isArray(usedPacketsName) ? usedPacketsName : [])
        })
        return unsubscribe
    }, [])

    /* ================= MYSTERY LOGIC ================= */

    const handleSetMysteryPacket = (packet: string) => {
        if (!isHost) return

        setPacketList(prev => {
            const fromIndex = prev.indexOf(packet)
            if (fromIndex === -1 || fromIndex === MYSTERY_INDEX) return prev

            const newList = [...prev]
            const temp = newList[MYSTERY_INDEX]
            newList[MYSTERY_INDEX] = packet
            newList[fromIndex] = temp

            return newList
        })
    }

    /* ================= RENDER ================= */

    return (
        <div className="w-full bg-slate-900/40 backdrop-blur-md border border-blue-400/20 rounded-xl shadow-xl px-5 py-4 flex flex-col gap-4">
            <QuestionTimerBar isHost={isHost} />

            {shouldReturnToPacketSelection ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-3xl mx-auto">
                    {packetList.slice(0, 9).map((packet, index) => {
                        const isMystery =
                            packetList.length === 9 && index === MYSTERY_INDEX
                        const isUsed =
                            usedPacketNames.includes(packet) ||
                            (packet === "?" && usedPacketNames.length > 0)

                        return (
                            <div key={packet} className="relative">
                                <button
                                    className={`w-full h-24 sm:h-28 rounded-xl border shadow-md
                                    flex flex-col items-center justify-center gap-1 transition-all
                                    ${isUsed
                                            ? 'opacity-60 bg-gray-700/40'
                                            : 'bg-slate-800/40'}
                                    ${isMystery && isHost
                                            ? 'border-yellow-400/60 bg-yellow-500/10'
                                            : 'border-blue-400/20'}
                                    ${!isHost ? 'cursor-not-allowed' : ''}
                                `}
                                    onClick={() => handleTopicSelect(packet)}
                                >
                                    <span className="text-blue-100 text-lg font-semibold">
                                        {packet}
                                        {isMystery && isHost && ' ?'}
                                    </span>

                                    {isMystery && isHost && (
                                        <span className="text-xs text-yellow-300 font-semibold uppercase">
                                            Gói bí ẩn
                                        </span>
                                    )}
                                </button>

                                {/* Used checkbox */}
                                {isHost && (
                                    <div className="absolute top-2 right-2">
                                        <input
                                            type="checkbox"
                                            checked={usedPacketNames.includes(packet)}
                                            onChange={() => handleToggleUsedTopic(packet)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </div>
                                )}

                                {/* Set mystery */}
                                {isHost &&
                                    packetList.length === 9 &&
                                    !isMystery && (
                                        <button
                                            onClick={() => handleSetMysteryPacket(packet)}
                                            className="absolute bottom-2 left-1/2 -translate-x-1/2
                                            text-xs px-2 py-1 rounded-md bg-yellow-500/20
                                            text-yellow-300 hover:bg-yellow-500/30 transition"
                                        >
                                            Chọn làm gói ẩn
                                        </button>
                                    )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center gap-4">
                    <h2 className="text-xl font-bold text-blue-100">
                        {selectedPacketName ?? ''}
                    </h2>

                    <QuestionAndAnswer
                        currentQuestion={currentQuestion}
                        currentCorrectAnswer={currentCorrectAnswer}
                    />

                    {isHost && (
                        <div className="flex gap-4 w-full mt-4">
                            <button className={baseBtn} onClick={handleCorrectClick}>
                                Đúng
                            </button>
                            <button className={baseBtn} onClick={handleIncorrectClick}>
                                Sai
                            </button>
                            <button
                                className={baseBtn}
                                onClick={handleReturnToTopicSelection}
                            >
                                Quay về màn hình chọn gói
                            </button>
                        </div>
                    )}
                </div>
            )}

            {modalState.isOpen && (
                <Modal
                    text={modalState.text}
                    buttons={modalState.buttons}
                    onClose={closeModal}
                />
            )}

            {isHost && (
                <div className="flex gap-2 mt-4 w-full">
                    <button className={baseBtn} onClick={handleConfirmPacket}>
                        Xác nhận gói
                    </button>

                </div>
            )}
        </div>
    )
}

export default BaseQuestionBoxRound3
