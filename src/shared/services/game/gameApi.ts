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
  SetPlayerColorRequest,
  SetPlayerColorResponse,
  Question,
  Score,
  ScoreRule
} from '../../types';


export const gameApi = {
  /**
   * Get questions for a specific round
   */
  async getQuestions(params: GetQuestionsRequest): Promise<Question> {
    const response = await api.get<Question>(API_ENDPOINTS.GAME.QUESTION, {
      params: {
        room_id: params.roomId,
        test_name: params.testName,
        round: params.round,
        question_number: params.questionNumber,
        packet_name: params?.packetName,
        difficulty: params?.difficulty,
      },
    });
    return response.data;
  },

  /**
   * Get questions by round
   */
  async getQuestionsByRound(params: GetQuestionsRequest): Promise<Question[]> {
    const response = await api.get<Question[]>(API_ENDPOINTS.GAME.QUESTION_BY_ROUND, {
      params: {
        test_name: params.testName,
        round: params.round,
        packet_name: params?.packetName,
        difficulty: params?.difficulty,
      },
    });
    return response.data
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
    return response.data;
  },

  /**
   * Send grid to players
   */
  async sendCorrectAnswer(params: { roomId: string }): Promise<void> {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.CORRECT_ANSWER}?room_id=${params.roomId}`
    );

    return response.data;
  },

  /**
   * Get packet names
   */
  async getPacketNames(testName: string, roomId: string): Promise<string[]> {
    const response = await api.get<string[]>(API_ENDPOINTS.GAME.PACKETS, {
      params: { test_name: testName, room_id: roomId },
    });
    return response.data;
  },

  /**
   * Send grid to players
   */
  async sendGrid(roomId: string, grid: string[][]): Promise<boolean> {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.GRID}?room_id=${roomId}`,
      { grid: grid }
    );
    return response.data;
  },

  /**
   * Open obstacle
   */
  async openObstacle(roomId: string, grid: string[][], obstacle: string) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.OPEN_OBSTACLE}?room_id=${roomId}`,
      { 
        grid: grid,
        obstacle: obstacle
      }
    );
    return response.data;
  },

  /**
   * Send selected cell
   */
  async sendSelectedCell(roomId: string, rowIndex: string, colIndex: string): Promise<boolean> {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.SELECTED_CELL}?room_id=${roomId}&row_index=${rowIndex}&col_index=${colIndex}`,
    );
    return response.data;
  },

  /**
   * Send selected cell
   */
  async sendSelectedCellColor(roomId: string, rowIndex: string, colIndex: string, color: string): Promise<boolean> {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.CELL_COLOR}?room_id=${roomId}&row_index=${rowIndex}&col_index=${colIndex}&color=${color}`,
    );
    return response.data;
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
   * Send a row action
   */
  async sendRowAction(params: { roomId: string, rowNumber: string, action: string, wordLength: number, selectedRowIndex: number, selectedColIndex: number, correctAnswer?: string, markedCharactersIndex?: string, isRow?: boolean }): Promise<void> {
    const url = new URL(`${process.env.REACT_APP_BASE_URL}${API_ENDPOINTS.GAME.ROW_ACTION}`);

    url.searchParams.append("room_id", params.roomId);
    url.searchParams.append("row_number", params.rowNumber);
    url.searchParams.append("action", params.action);
    url.searchParams.append("word_length", params.wordLength.toString());
    url.searchParams.append("selected_row_index", params.selectedRowIndex.toString());
    url.searchParams.append("selected_col_index", params.selectedColIndex.toString());
    if (params.correctAnswer) url.searchParams.append("correct_answer", params.correctAnswer);
    if (params.markedCharactersIndex) url.searchParams.append("marked_characters_index", params.markedCharactersIndex);
    if (params.isRow !== undefined) url.searchParams.append("is_row", params.isRow.toString());

    await api.post(
      url.toString(),
      {

      }
    );
  },

  /**
   * Start a new round
   */
  async startTimer(params: { roomId: string }): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.TIME_START}?room_id=${params.roomId}`,
      {}
    );
  },

  /**
   * Submit player answer
   */
  async submitAnswer(data: SubmitAnswerRequest, room_id: string): Promise<SubmitAnswerResponse> {
    const response = await api.post<any>(
      API_ENDPOINTS.GAME.SUBMIT,
      data,
      {
        params: { room_id: room_id },
      }
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
    return response.data;
  },

  /**
   * Update game scoring
   */
  async updateScoring(params: ScoringRequest): Promise<Score[]> {
    const response = await api.post<Score[]>(
      `${API_ENDPOINTS.GAME.SCORING}?room_id=${params.roomId}`,
      params.scores || [],
      {
        params: {
          mode: params.mode,
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
      }
    );
    return response.data;
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
      `${API_ENDPOINTS.GAME.RULES_SHOW}?room_id=${roomId}&round_number=${roundNumber}`
    );
  },

  /**
   * Hide game rules
   */
  async hideRules(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RULES_HIDE}?room_id=${roomId}`
    );
  },

  /**
   * Set selected packet name
   */
  async sendSelectedPacketName(roomId: string, packetName: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.SELECTED_PACKETS}?room_id=${roomId}&packet_name=${packetName}`
    );
  },

  /**
   * Set selected packet name
   */
  async sendUsedPacketName(roomId: string, usedPackets: string[]): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.USED_PACKETS}?room_id=${roomId}`,
      usedPackets
    );
  },

  /**
   * Set should return to packet selection
   */
  async sendShouldReturnToPacketSelection(roomId: string, shouldReturn: boolean): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RETURN_TO_PACKET_SELECTION}?room_id=${roomId}&should_return=${shouldReturn}`
    );
  },

  /**
   * Set game history
   */
  async setGameHistory(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.HISTORY}?room_id=${roomId}`
    );
  },

  /**
   * Set game history
   */
  async setScoreRules(roomId: string, scoreRules: ScoreRule): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RULES}?room_id=${roomId}`,
      scoreRules
    );
  },

  /**
   * send open buzz signal
   */

  async openBuzz(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.BUZZ.OPEN}?room_id=${roomId}`
    );
  },

  /**
   * send close buzz signal
   */
  async closeBuzz(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.BUZZ.CLOSE}?room_id=${roomId}`
    );
  },

  /**
   * reset buzz 
   */

  async resetBuzz(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.BUZZ.RESET}?room_id=${roomId}`
    );
  },

  /**
   * send star signal
   */

  async setStar(roomId: string, playerName: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.STAR.BASE}?room_id=${roomId}`,
      {
        player_name: playerName,
      }
    );
  },

  /**
   * reset star
   */

  async resetStar(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.STAR.RESET}?room_id=${roomId}`
    );
  },

  /**
   * player buzzing first
   */

  async buzzing(roomId: string, playerName: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.BUZZ.BASE}?room_id=${roomId}`,
      {
        player_name: playerName,
      }
    );
  },

  /**
   * send current turn to player
   */

  async sendCurrentTurn(roomId: string, turn: number): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.TURN}?room_id=${roomId}&turn=${turn}`
    );
  },

  /**
   * Set player color for Round 4
   */
  async setPlayerColor(params: { roomId: string; playerStt: string; color: string }) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.PLAYER_COLOR}?room_id=${params.roomId}&player_stt=${params.playerStt}`,
      { color: params.color }
    );
    return response.data;
  },

};

export default gameApi;
