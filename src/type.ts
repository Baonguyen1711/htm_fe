export interface RoundBase {
    isHost?: boolean
}

export interface Question {
    questionId?: string,
    question: string;
    answer: string;
    type?: string;
    imgUrl: string;
    difficulty?: string
    [key: string]: any; // Để hỗ trợ các trường bổ sung
  }

export interface User {
    userName: string,
    stt: string,
    avatar: string
    [key: string]: any;
}