// 投票数据类型
export interface Vote {
  studentId: string;
  studentName: string;
  classId: number;
  timestamp: string;
}

// 班级信息类型
export interface ClassInfo {
  id: number;
  name: string;
}

// 投票结果类型
export interface VoteResult {
  classId: number;
  className: string;
  count: number;
}

// 语音识别状态类型
export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}