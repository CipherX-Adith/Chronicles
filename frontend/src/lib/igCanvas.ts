export interface RenderOptions {
  publicId: string;
  from: {
    primary: string;
    secondary?: string;
  };
  to: {
    primary: string;
    secondary?: string;
  };
  message: string;
}

export function drawInstagramPost(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1080;
  const height = 1350;

  canvas.width = width;
  canvas.height = height;

  // 1. Warm Paper Canvas Background
  ctx.fillStyle = '#ebe7de';
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grain dots
  ctx.fillStyle = 'rgba(17, 23, 25, 0.04)';
  for (let x = 30; x < width; x += 18) {
    for (let y = 30; y < height; y += 18) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // 2. Outer Framed Border
  ctx.strokeStyle = '#cbc6bc';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // 3. Inner White/Elevated Paper Message Card
  const cardX = 70;
  const cardY = 70;
  const cardW = width - 140;
  const cardH = height - 140;

  // Soft card drop shadow
  ctx.shadowColor = 'rgba(17, 23, 25, 0.1)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 12;

  ctx.fillStyle = '#f5f2eb';
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Card Border
  ctx.strokeStyle = '#d5cfc5';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // 4. Header Section: Brand Mark & Title
  const pad = 64;
  let currentY = cardY + pad;

  // Logo Box
  ctx.fillStyle = '#111719';
  ctx.fillRect(cardX + pad, currentY, 44, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', cardX + pad + 22, currentY + 23);

  // Brand Titles
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111719';
  ctx.font = '700 20px "Space Grotesk", sans-serif';
  ctx.fillText('MACE CONFESSIONS', cardX + pad + 58, currentY + 16);

  ctx.fillStyle = '#77736b';
  ctx.font = '500 13px "DM Mono", monospace';
  ctx.fillText('ANONYMOUS CAMPUS NOTES', cardX + pad + 58, currentY + 36);

  // Right Reference Pill
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ef6878';
  ctx.font = '700 16px "DM Mono", monospace';
  ctx.fillText(options.publicId, cardX + cardW - pad, currentY + 24);

  // Divider Line
  currentY += 68;
  ctx.strokeStyle = '#ded9cf';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + pad, currentY);
  ctx.lineTo(cardX + cardW - pad, currentY);
  ctx.stroke();

  // 5. Participants (FROM & TO)
  currentY += 34;
  const colW = (cardW - pad * 2) / 2;

  // FROM Column
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ef6878';
  ctx.font = '500 13px "DM Mono", monospace';
  ctx.fillText('FROM', cardX + pad, currentY);

  ctx.fillStyle = '#111719';
  ctx.font = '700 22px "Space Grotesk", sans-serif';
  ctx.fillText(options.from.primary, cardX + pad, currentY + 28);

  if (options.from.secondary) {
    ctx.fillStyle = '#77736b';
    ctx.font = '500 14px "DM Mono", monospace';
    ctx.fillText(options.from.secondary, cardX + pad, currentY + 50);
  }

  // TO Column
  const toX = cardX + pad + colW;
  ctx.fillStyle = '#ef6878';
  ctx.font = '500 13px "DM Mono", monospace';
  ctx.fillText('TO', toX, currentY);

  ctx.fillStyle = '#111719';
  ctx.font = '700 22px "Space Grotesk", sans-serif';
  ctx.fillText(options.to.primary, toX, currentY + 28);

  if (options.to.secondary) {
    ctx.fillStyle = '#77736b';
    ctx.font = '500 14px "DM Mono", monospace';
    ctx.fillText(options.to.secondary, toX, currentY + 50);
  }

  // Divider Line
  currentY += 76;
  ctx.strokeStyle = '#ded9cf';
  ctx.beginPath();
  ctx.moveTo(cardX + pad, currentY);
  ctx.lineTo(cardX + cardW - pad, currentY);
  ctx.stroke();

  // 6. Confession Body Text
  // Message area bounding box: from currentY to footer threshold (height - 240)
  const messageAreaTop = currentY + 44;
  const messageAreaBottom = cardY + cardH - 140;
  const maxMessageHeight = messageAreaBottom - messageAreaTop;
  const maxMessageWidth = cardW - pad * 2;

  const messageText = options.message.trim();
  const textLength = messageText.length;

  // Determine optimal font size based on text length and test wrapping
  let fontSize = 46;
  if (textLength < 90) fontSize = 54;
  else if (textLength < 180) fontSize = 48;
  else if (textLength < 350) fontSize = 40;
  else if (textLength < 650) fontSize = 34;
  else if (textLength < 1000) fontSize = 28;
  else fontSize = 24;

  let lineHeight = fontSize * 1.42;
  let lines = wrapText(ctx, messageText, maxMessageWidth, fontSize);

  // If computed lines exceed the box, iteratively step down font size safely
  while (lines.length * lineHeight > maxMessageHeight && fontSize > 18) {
    fontSize -= 2;
    lineHeight = fontSize * 1.38;
    lines = wrapText(ctx, messageText, maxMessageWidth, fontSize);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#111719';
  ctx.font = `500 ${fontSize}px "Space Grotesk", sans-serif`;

  let textY = messageAreaTop + fontSize;
  for (const line of lines) {
    if (textY < messageAreaBottom + 10) {
      ctx.fillText(line, cardX + pad, textY);
      textY += lineHeight;
    }
  }

  // 7. Card Footer Section
  const footerY = cardY + cardH - 58;
  ctx.strokeStyle = '#ded9cf';
  ctx.beginPath();
  ctx.moveTo(cardX + pad, footerY - 26);
  ctx.lineTo(cardX + cardW - pad, footerY - 26);
  ctx.stroke();

  ctx.fillStyle = '#77736b';
  ctx.font = '500 13px "DM Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('CONFESSION ' + options.publicId, cardX + pad, footerY);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ef6878';
  ctx.font = '700 13px "DM Mono", monospace';
  ctx.fillText('SAY IT. LEAVE IT HERE.', cardX + cardW - pad, footerY);

  // 8. Physical Accent Coral Tape on top-right
  ctx.save();
  ctx.translate(cardX + cardW - 60, cardY + 2);
  ctx.rotate((5 * Math.PI) / 180);
  ctx.fillStyle = '#ef6878';
  ctx.shadowColor = 'rgba(17, 23, 25, 0.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.fillRect(-60, -12, 120, 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 10px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VERIFIED POST', 0, 0);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  ctx.font = `500 ${fontSize}px "Space Grotesk", sans-serif`;
  const paragraphs = text.split('\n');
  const allLines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      allLines.push('');
      continue;
    }

    const words = paragraph.split(' ');
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        allLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    allLines.push(currentLine);
  }

  return allLines;
}

export function exportCanvasAsPNG(canvas: HTMLCanvasElement, filename: string): void {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}

export async function openInstagramPosting(
  canvas: HTMLCanvasElement,
  publicId: string,
  captionText: string
): Promise<{ method: 'share' | 'redirect' }> {
  // Always copy caption to clipboard for effortless pasting in IG
  try {
    await navigator.clipboard.writeText(captionText);
  } catch (e) {
    console.warn('Clipboard write failed:', e);
  }

  // 1. Try Web Share API with File (Native Instagram app share on mobile)
  if (navigator.canShare) {
    try {
      const blob = await getCanvasBlob(canvas);
      const file = new File([blob], `mace-confession-${publicId.toLowerCase()}.png`, {
        type: 'image/png',
      });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `MACE Confession ${publicId}`,
          text: captionText,
          files: [file],
        });
        return { method: 'share' };
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share failed, falling back:', err);
      }
    }
  }

  // 2. Fallback: Save image to device downloads / photos
  exportCanvasAsPNG(canvas, `mace-confession-${publicId.toLowerCase()}.png`);

  // 3. Direct device redirect to Instagram
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    // Attempt Instagram deep link on mobile, fallback to web create
    window.location.href = 'instagram://app';
    setTimeout(() => {
      window.open('https://www.instagram.com/create/select/', '_blank');
    }, 1200);
  } else {
    // Desktop: open Instagram create flow
    window.open('https://www.instagram.com/create/select/', '_blank');
  }

  return { method: 'redirect' };
}

