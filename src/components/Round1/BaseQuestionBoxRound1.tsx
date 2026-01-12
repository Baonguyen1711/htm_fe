import React, { useState, useEffect, useRef } from 'react'

import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import PlayerAnswerInput from '../ui/Input/PlayerAnswerInput';
import { useSounds } from '../../context/soundContext';
import { useFirebaseListener } from '../../shared/hooks';
import { useAppSelector } from '../../app/store';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';
import { Button } from '../../shared/components/ui';
import useGameApi from '../../shared/hooks/api/useGameApi';
import QuestionTimerBar from '../ui/QuestionTimeBar';


interface Round1Props {
  isHost: boolean,
  isSpectator?: boolean
}

const BaseQuestionBoxRound1: React.FC<Round1Props> = ({ isHost, isSpectator = false }) => {
  const sounds = useSounds();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startTimer } = useTimeStart();
  const { startMedia, stopMedia } = useGameApi()
  const { listenToTimeStart, listenToMedia } = useFirebaseListener();
  const { currentQuestion, currentCorrectAnswer } = useAppSelector(state => state.game);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get("roomId") || ""
  const currentQuestionRef = useRef(currentQuestion);

  useEffect(() => {
    console.log("current question", currentQuestion)
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    const unsubscribe = listenToTimeStart(
      (data) => {
        const audio = sounds['timer_2'];
        if (audio) {
          audio.play();
        }

        startTimer(data.duration !== 0 ? 15 : data.duration)
      }
    )
    return () => {
      unsubscribe();
    };

  }, [])

  useEffect(() => {
    const unsubscribe = listenToMedia(
      (data) => {
        console.log("media data", data)

        if (data.action === "play") {
          setIsPlaying(true);
          console.log("current question", currentQuestionRef.current)
          const extension = currentQuestionRef.current?.imgUrl?.split('.').pop()?.toLowerCase() || ""
          const now = Date.now();
          const diff = data.timeToPlay - now;
          console.log("diff", diff)
          console.log("extension", extension)
          console.log("video ref", videoRef.current)
          if (diff > 0) {
            setTimeout(() => {
              if (["m4a", "mp3", "wav", "ogg"].includes(extension)) {
                audioRef.current?.play();
              }

              if (["mp4", "webm", "ogg"].includes(extension)) {
                videoRef.current?.play();
              }
            }, diff);
          }
        }

        if (data.action === "stop") {
          setIsPlaying(false);
          audioRef.current?.pause();
          videoRef.current?.pause();
        }
      }
    )
    return () => {
      unsubscribe();
    };

  }, [])

  const handleClickPlayMedia = () => {
    if (!isPlaying) {
      startMedia(roomId)
      setIsPlaying(true)
    } else {
      stopMedia(roomId)
      setIsPlaying(false)
    }

  }


  return (
    <div
      className="
      w-full
      bg-slate-900/40 backdrop-blur-md
      border border-blue-400/20
      rounded-xl
      shadow-xl
      px-5 py-4
      flex flex-col gap-4
    "
    >
      {/* Time bar */}
      <QuestionTimerBar isHost={isHost} />

      {/* Question */}
      <QuestionAndAnswer
        currentQuestion={currentQuestion}
        currentCorrectAnswer={currentCorrectAnswer}
      />

      {/* Media preview */}
      <div
        className="
        w-full
        h-[360px]
        flex items-center justify-center
        rounded-lg
        bg-slate-800/40
        border border-blue-400/10
        overflow-hidden
        cursor-pointer
      "
        onClick={() => setIsModalOpen(true)}
      >
        {(() => {
          const url = currentQuestion?.imgUrl
          if (!url) {
            return (
              <span className="text-sm text-blue-200/60">
                Không có media
              </span>
            )
          }

          const extension = url.split('.').pop()?.toLowerCase() || ""

          if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
            return (
              <img
                src={url}
                alt="Question Visual"
                className="w-full h-full object-contain"
              />
            )
          }

          if (["m4a", "mp3", "wav", "ogg"].includes(extension)) {
            return (
              <audio ref={audioRef}>
                <source src={url} type={`audio/${extension}`} />
              </audio>
            )
          }

          if (["mp4", "webm", "ogg"].includes(extension)) {
            return (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
              >
                <source src={url} type={`video/${extension}`} />
              </video>
            )
          }

          return (
            <span className="text-sm text-red-300">
              Unsupported media
            </span>
          )
        })()}
      </div>

      {/* Host controls */}
      {isHost && (
        <div className="flex gap-2">
          <button
            onClick={handleClickPlayMedia}
            className="
            flex-1
            py-2
            rounded-md
            text-sm font-semibold
            text-blue-100
            bg-slate-800/80
            border border-blue-400/30
            hover:bg-blue-600/20
            transition
          "
          >
            {isPlaying ? "Dừng media" : "Chạy media"}
          </button>
        </div>
      )}

      {/* Answer input */}
      {!isSpectator && (
        <div className="pt-2">
          <PlayerAnswerInput isHost={isHost} />
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="
          fixed inset-0 z-50
          bg-black/80
          flex items-center justify-center
        "
          onClick={() => setIsModalOpen(false)}
        >
          {(() => {
            const url = currentQuestion?.imgUrl
            if (!url) return null

            const extension = url.split('.').pop()?.toLowerCase() || ""

            if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
              return (
                <img
                  src={url}
                  className="max-w-[90vw] max-h-[90vh] rounded-xl"
                />
              )
            }

            if (["m4a", "mp3", "wav", "ogg"].includes(extension)) {
              return (
                <audio controls autoPlay>
                  <source src={url} type={`audio/${extension}`} />
                </audio>
              )
            }

            if (["mp4", "webm", "ogg"].includes(extension)) {
              return (
                <video
                  controls
                  autoPlay
                  className="max-w-[90vw] max-h-[90vh] rounded-xl"
                >
                  <source src={url} type={`video/${extension}`} />
                </video>
              )
            }

            return null
          })()}
        </div>
      )}
    </div>
  )

};


// const Round1: React.FC<RoundBase> = ({ isHost }) => {
//     return (
//         <Play
//             questionComponent={<QuestionBox question="Câu hỏi mẫu?" imageUrl="https://a.travel-assets.com/findyours-php/viewfinder/images/res70/474000/474240-Left-Bank-Paris.jpg" isHost={isHost} />}
//             isHost={isHost}
//         />
//     );
// }

export default BaseQuestionBoxRound1