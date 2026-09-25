export interface ModerationGuideline {
  id: string;
  category: string;
  rule: string;
}

export const MODERATION_GUIDELINES: ModerationGuideline[] = [
  {
    id: 'no-harassment',
    category: 'Respect & Safety',
    rule: 'No targeted harassment, bullying, or intimidation of individuals.',
  },
  {
    id: 'no-doxxing',
    category: 'Privacy',
    rule: 'No personal contact details (phone numbers, private addresses, personal handles).',
  },
  {
    id: 'no-unverified-accusations',
    category: 'Integrity',
    rule: 'No serious criminal or academic accusations presented as fact without proof.',
  },
  {
    id: 'no-hate-speech',
    category: 'Campus Culture',
    rule: 'No discriminatory abuse based on gender, caste, religion, sexuality, or disability.',
  },
  {
    id: 'no-explicit-harm',
    category: 'Safety',
    rule: 'No sexual content involving identifiable students, or self-harm/violence.',
  },
];

// Keywords that might trigger caution flags for the reviewing admin
const SENSITIVE_KEYWORDS = [
  'kill', 'die', 'suicide', 'cheat', 'hack', 'leak', 'phone number',
  'doxx', 'threat', 'nude', 'expose'
];

export function evaluateSubmissionSafety(message: string): {
  flags: string[];
  isCaution: boolean;
} {
  const flags: string[] = [];
  const lower = message.toLowerCase();

  // Check for potential phone numbers (10 digits)
  if (/\b\d{10}\b/.test(message) || /\b(\+91|0)?[6-9]\d{9}\b/.test(message)) {
    flags.push('Potential phone number detected in message');
  }

  // Check for sensitive keywords
  for (const word of SENSITIVE_KEYWORDS) {
    if (lower.includes(word)) {
      flags.push(`Keyword mention: "${word}"`);
    }
  }

  return {
    flags,
    isCaution: flags.length > 0,
  };
}
