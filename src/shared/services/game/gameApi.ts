// Game API service
import { api } from '../api/client';
import { API_ENDPOINTS } from '../../constants';
import { 
  GetQuestionsRequest,
  GetQuestionsResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  ScoringRequest,
  ScoringResponse,
  SendGridRequest,
  SendGridResponse,
  Question,
  Score
} from '../../types';

export const gameApi = {
  /**
   * Get questions for a specific round
   */
  async getQuestions(params: GetQuestionsRequest): Promise<Question[]> {
    const response = await api.get<Question[]>(API_ENDPOINTS.GAME.QUESTIONS, {
      params: {
        test_name: params.testName,
        round: params.round,
        difficulty: params.difficulty,
      },
    });
    return response.data.data;
  },

  /**
   * Get prefetch question
   */
  async getPrefetchQuestion(params: { testName: string; round: number; questionNumber: number }): Promise<Question> {
    const response = await api.get<Question>(API_ENDPOINTS.GAME.PREFETCH, {
      params: {
        test_name: params.testName,
        round: params.round,
        question_number: params.questionNumber,
      },
    });
    return response.data.data;
  },

  /**
   * Get packet names
   */
  async getPacketNames(testName: string): Promise<string[]> {
    const response = await api.get<string[]>(API_ENDPOINTS.GAME.PACKETS, {
      params: { test_name: testName },
    });
    return response.data.data;
  },

  /**
   * Send grid to players
   */
  async sendGrid(params: SendGridRequest): Promise<boolean> {
    const response = await api.post<SendGridResponse['data']>(
      `${API_ENDPOINTS.GAME.GRID}?room_id=${params.roomId}`,
      { grid: params.grid }
    );
    return response.data.data.success;
  },

  /**
   * Start a new round
   */
  async startRound(params: { roomId: string; round: string; grid?: string[][] }): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.ROUND_START}?room_id=${params.roomId}&round=${params.round}`,
      { grid: params.grid }
    );
  },

  /**
   * Submit player answer
   */
  async submitAnswer(params: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const response = await api.post<SubmitAnswerResponse['data']>(
      API_ENDPOINTS.GAME.ANSWER,
      params
    );
    return response.data;
  },

  /**
   * Broadcast player answers
   */
  async broadcastAnswers(roomId: string): Promise<any[]> {
    const response = await api.post<any[]>(
      `${API_ENDPOINTS.GAME.BROADCAST_ANSWER}?room_id=${roomId}`
    );
    return response.data.data;
  },

  /**
   * Update game scoring
   */
  async updateScoring(params: ScoringRequest): Promise<Score[]> {
    const response = await api.post<Score[]>(
      `${API_ENDPOINTS.GAME.SCORING}?room_id=${params.roomId}`,
      {
        mode: params.mode,
        scores: params.scores,
        round: params.round,
        stt: params.stt,
        is_obstacle_correct: params.isObstacleCorrect,
        obstacle_point: params.obstaclePoint,
        is_correct: params.isCorrect,
        round_4_mode: params.round4Mode,
        difficulty: params.difficulty,
        is_take_turn_correct: params.isTakeTurnCorrect,
        stt_take_turn: params.sttTakeTurn,
        stt_taken: params.sttTaken,
      }
    );
    return response.data.data;
  },

  /**
   * Update current turn
   */
  async updateTurn(roomId: string, turn: number): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.TURN}?room_id=${roomId}&turn=${turn}`
    );
  },

  /**
   * Show game rules
   */
  async showRules(roomId: string, roundNumber: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RULES}/show?room_id=${roomId}&round_number=${roundNumber}`
    );
  },

  /**
   * Hide game rules
   */
  async hideRules(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RULES}/hide?room_id=${roomId}`
    );
  },

  /**
   * Set selected packet name
   */
  async setSelectedPacketName(roomId: string, packetName: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.PACKETS}/select?room_id=${roomId}&packet_name=${packetName}`
    );
  },
};

export default gameApi;
