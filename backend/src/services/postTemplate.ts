export interface FormattedParticipant {
  primary: string;
  secondary?: string;
  hasInfo: boolean;
}

export function formatParticipant(
  name?: string | null,
  academicClass?: string | null,
  department?: string | null,
  isRecipient: boolean = false
): FormattedParticipant {
  const cleanName = (name || '').trim();
  const cleanClass = (academicClass || '').trim();
  const cleanDept = (department || '').trim();

  const details = [cleanClass, cleanDept].filter(Boolean).join(' · ');

  if (!cleanName && !details) {
    return {
      primary: isRecipient ? 'Everyone' : 'Anonymous',
      secondary: undefined,
      hasInfo: false,
    };
  }

  if (cleanName && details) {
    return {
      primary: cleanName,
      secondary: details,
      hasInfo: true,
    };
  }

  if (cleanName && !details) {
    return {
      primary: cleanName,
      secondary: undefined,
      hasInfo: true,
    };
  }

  // No name, but has details
  return {
    primary: isRecipient ? 'Someone' : 'Anonymous',
    secondary: details,
    hasInfo: true,
  };
}

export interface InstagramPostPayload {
  publicId: string;
  from: FormattedParticipant;
  to: FormattedParticipant;
  message: string;
  dimensions: {
    width: number;
    height: number;
  };
  recommendedFontSize: number;
  captionText: string;
}

export function buildInstagramPostData(submission: {
  publicId: string;
  fromName?: string | null;
  fromClass?: string | null;
  fromDepartment?: string | null;
  toName?: string | null;
  toClass?: string | null;
  toDepartment?: string | null;
  message: string;
}): InstagramPostPayload {
  const from = formatParticipant(
    submission.fromName,
    submission.fromClass,
    submission.fromDepartment,
    false
  );

  const to = formatParticipant(
    submission.toName,
    submission.toClass,
    submission.toDepartment,
    true
  );

  // Dynamic typography calculation for 1080x1350 canvas
  const len = submission.message.length;
  let recommendedFontSize = 48;
  if (len < 120) {
    recommendedFontSize = 58;
  } else if (len < 250) {
    recommendedFontSize = 50;
  } else if (len < 500) {
    recommendedFontSize = 42;
  } else if (len < 800) {
    recommendedFontSize = 36;
  } else {
    recommendedFontSize = 30;
  }

  // Instagram Caption text formatted for easy copy-pasting
  const fromStr = [from.primary, from.secondary].filter(Boolean).join(' · ');
  const toStr = [to.primary, to.secondary].filter(Boolean).join(' · ');

  const captionText = `“${submission.message}”
—
Confession ${submission.publicId}
From: ${fromStr}
To: ${toStr}

Say it. Leave it here.
Link in bio to leave an anonymous note.
#UntoldLetterbox #Confessions #Anonymous #Letters`;

  return {
    publicId: submission.publicId,
    from,
    to,
    message: submission.message,
    dimensions: {
      width: 1080,
      height: 1350,
    },
    recommendedFontSize,
    captionText,
  };
}
