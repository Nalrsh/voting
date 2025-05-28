/**
 * 语音解析工具函数
 */

// 将中文数字或班级编号转换为阿拉伯数字
export const chineseToNumber = (chinese: string): number | null => {
  // 处理中文数字和单个阿拉伯数字
  const map: { [key: string]: number } = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7
  };
  
  // 如果是直接的数字映射，返回对应值
  if (map[chinese]) {
    return map[chinese];
  }
  
  // 处理类似"2201"这样的班级编号，提取最后一位数字
  if (chinese.match(/^220[1-7]$/)) {
    return parseInt(chinese.charAt(3));
  }
  
  return null;
};

// 解析语音输入
export const parseVoiceInput = (input: string): {
  studentId?: string;
  studentName?: string;
  classId?: number;
  error?: string;
} => {
  try {
    // 学号匹配
    const studentIdMatch = input.match(/学号(\d+)/);
    // 姓名匹配
    const studentNameMatch = input.match(/姓名(\S+)/);
    // 班级匹配 - 支持"一班"、"1班"或"2201班"格式
    const classMatch = input.match(/投给([一二三四五六七1234567]|220[1-7])班/);
    
    if (!studentIdMatch) {
      return { error: '未能识别学号，请重试' };
    }
    
    if (!studentNameMatch) {
      return { error: '未能识别姓名，请重试' };
    }
    
    if (!classMatch) {
      return { error: '未能识别班级，请重试' };
    }
    
    const studentId = studentIdMatch[1];
    const studentName = studentNameMatch[1];
    const classNumber = classMatch[1];
    
    // 将中文数字转换为阿拉伯数字
    const classId = chineseToNumber(classNumber);
    
    if (!classId) {
      return { error: '班级编号无效，请重试' };
    }
    
    return {
      studentId,
      studentName,
      classId
    };
  } catch (err) {
    return { error: '语音解析出错，请重试' };
  }
};

// 格式化投票信息为语音输出
export const formatVoteForSpeech = (
  studentId: string,
  studentName: string,
  classId: number
): string => {
  const classNames = ['2201', '2202', '2203', '2204', '2205', '2206', '2207'];
  const className = classNames[classId - 1] || classId.toString();
  
  return `您的投票信息：学号${studentId}，姓名${studentName}，投给${className}班。请确认。`;
};