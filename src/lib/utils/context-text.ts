import { ContextLoggingMode } from '@/types/app';

export interface ContextTextResult {
  contextText?: string;
  contextTextHash?: string;
  contextTextMode?: 'truncated' | 'hashed' | 'full';
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function processContextText(
  text: string | undefined,
  mode: ContextLoggingMode
): Promise<ContextTextResult> {
  if (!text || mode === 'none') {
    return {};
  }

  switch (mode) {
    case 'truncated':
      return {
        contextText: text.slice(0, 64),
        contextTextMode: 'truncated',
      };
    case 'hashed':
      return {
        contextTextHash: await sha256(text),
        contextTextMode: 'hashed',
      };
    case 'full':
      return {
        contextText: text,
        contextTextMode: 'full',
      };
    default:
      return {};
  }
}
