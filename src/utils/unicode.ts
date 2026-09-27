const BOLD_MAP: Record<string, string> = {
  a: '𝐚', b: '𝐛', c: '𝐜', d: '𝐝', e: '𝐞', f: '𝐟', g: '𝐠', h: '𝐡', i: '𝐢', j: '𝐣', k: '𝐤', l: '𝐥', m: '𝐦',
  n: '𝐧', o: '𝐨', p: '𝐩', q: '𝐪', r: '𝐫', s: '𝐬', t: '𝐭', u: '𝐮', v: '𝐯', w: '𝐰', x: '𝐱', y: '𝐲', z: '𝐳',
  A: '𝐀', B: '𝐁', C: '𝐂', D: '𝐃', E: '𝐄', F: '𝐅', G: '𝐆', H: '𝐇', I: '𝐈', J: '𝐉', K: '𝐊', L: '𝐋', M: '𝐌',
  N: '𝐍', O: '𝐎', P: '𝐏', Q: '𝐐', R: '𝐑', S: '𝐒', T: '𝐓', U: '𝐔', V: '𝐕', W: '𝐖', X: '𝐗', Y: '𝐘', Z: '𝐙',
  '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
};

const ITALIC_MAP: Record<string, string> = {
  a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨', h: '𝘩', i: '𝘪', j: '𝘫', k: '𝘬', l: '𝘭', m: '𝘮',
  n: '𝘯', o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳', s: '𝘴', t: '𝘵', u: '𝘶', v: '𝘷', w: '𝘸', x: '𝘹', y: '𝘺', z: '𝘻',
  A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎', H: '𝘏', I: '𝘐', J: '𝘑', K: '𝘒', L: '𝘓', M: '𝘔',
  N: '𝘕', O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙', S: '𝘚', T: '𝘛', U: '𝘜', V: '𝘝', W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡'
};

export function toUnicodeBold(text: string): string {
  return text.split('').map(char => BOLD_MAP[char] || char).join('');
}

export function toUnicodeItalic(text: string): string {
  return text.split('').map(char => ITALIC_MAP[char] || char).join('');
}

export function toBulletLines(text: string): string {
  return text.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return line;
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('→ ')) return line;
    return `• ${trimmed}`;
  }).join('\n');
}

export function toQuote(text: string): string {
  return `❝${text}❞`;
}

export function clearUnicodeFormatting(text: string): string {
  // Normalize unicode compatibility decompositions
  let normalized = text.normalize('NFKD');
  // Remove special quotation wraps if present
  normalized = normalized.replace(/^❝|❞$/g, '');
  return normalized;
}

export function calculateReadTime(text: string): { words: number; readSeconds: number; gradeLevel: string } {
  const wordsArray = text.trim() ? text.trim().split(/\s+/) : [];
  const words = wordsArray.length;
  const readSeconds = Math.max(12, Math.ceil(words / 3.4));
  
  // Approximate Flesch-Kincaid grade level
  let gradeLevel = 'Grade 6.8 (Ideal)';
  if (words < 80) gradeLevel = 'Grade 5.4 (Punchy)';
  else if (words > 300) gradeLevel = 'Grade 7.5 (Deep Dive)';
  
  return { words, readSeconds, gradeLevel };
}
