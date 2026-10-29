const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

export function validatePollInput(
  question: unknown,
  options: unknown
): { valid: true; data: { question: string; options: [string, string, string] } } | { valid: false; error: string } {
  if (typeof question !== 'string' || question.trim().length === 0) {
    return { valid: false, error: '질문을 입력해주세요.' };
  }

  if (!Array.isArray(options) || options.length !== 3) {
    return { valid: false, error: '선택지는 정확히 3개여야 합니다.' };
  }

  const trimmedOptions: string[] = [];
  for (const opt of options) {
    if (typeof opt !== 'string' || opt.trim().length === 0) {
      return { valid: false, error: '선택지 3개를 모두 비어있지 않게 입력해주세요.' };
    }
    trimmedOptions.push(opt.trim());
  }

  return {
    valid: true,
    data: {
      question: question.trim(),
      options: [trimmedOptions[0], trimmedOptions[1], trimmedOptions[2]],
    },
  };
}

export function validateVoteInput(
  optionIndex: unknown
): { valid: true; data: { optionIndex: 0 | 1 | 2 } } | { valid: false; error: string } {
  if (
    typeof optionIndex !== 'number' ||
    !Number.isInteger(optionIndex) ||
    optionIndex < 0 ||
    optionIndex > 2
  ) {
    return { valid: false, error: '유효하지 않은 선택지 번호입니다. (0, 1, 2 중 하나여야 합니다)' };
  }

  return {
    valid: true,
    data: { optionIndex: optionIndex as 0 | 1 | 2 },
  };
}

