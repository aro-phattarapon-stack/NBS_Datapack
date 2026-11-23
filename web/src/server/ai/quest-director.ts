import { GoogleGenAI, Type } from '@google/genai';
import { MC_QUEST_WHITELIST, type QuestWhitelistEntry, type ServerState } from '../../shared/types';

export interface GeneratedQuestResult {
  item: string;
  count: number;
  displayName: string;
  source: 'AI' | 'POOL';
  reason: string;
}

function sanitizeDisplayName(raw: string, fallback: string): string {
  const cleaned = raw.replace(/["\\\r\n{}]/g, '').trim();
  return cleaned.length > 0 ? cleaned.slice(0, 48) : fallback;
}

function clampCount(count: number, entry: QuestWhitelistEntry): number {
  const rounded = Math.round(Number.isFinite(count) ? count : entry.defaultCount);
  return Math.max(entry.minCount, Math.min(entry.maxCount, rounded));
}

export type GameStage = 'early' | 'mid' | 'late';

export function detectGameStage(state: ServerState): GameStage {
  const activeScores = state.teams.filter((t) => t.active).map((t) => t.score);
  const topScore = activeScores.length > 0 ? Math.max(...activeScores) : 0;
  if (topScore >= 900) return 'late';
  if (topScore >= 350 || state.raidDay) return 'mid';
  return 'early';
}

const STAGE_WEIGHTS: Record<GameStage, Record<QuestWhitelistEntry['difficulty'], number>> = {
  early: { early: 6, mid: 2, late: 0 },
  mid: { early: 2, mid: 6, late: 2 },
  late: { early: 1, mid: 3, late: 6 },
};

/**
 * Selects a quest from the balanced whitelist weighted by match stage (early/mid/late).
 */
export function pickWeightedFallback(
  recentItems: string[],
  state?: ServerState,
  rng: () => number = Math.random,
): GeneratedQuestResult {
  const candidates = MC_QUEST_WHITELIST.filter((e) => !recentItems.includes(e.item));
  const pool = candidates.length > 0 ? candidates : MC_QUEST_WHITELIST;
  const stage: GameStage = state ? detectGameStage(state) : 'mid';
  const weights = STAGE_WEIGHTS[stage];

  const weighted = pool.map((entry) => ({
    entry,
    weight: Math.max(0, weights[entry.difficulty] ?? 1),
  }));
  const totalWeight = weighted.reduce((acc, w) => acc + w.weight, 0);

  let chosen = pool[0]!;
  if (totalWeight <= 0) {
    chosen = pool[Math.floor(rng() * pool.length)]!;
  } else {
    let cursor = rng() * totalWeight;
    for (const item of weighted) {
      cursor -= item.weight;
      if (cursor <= 0) {
        chosen = item.entry;
        break;
      }
    }
  }

  return {
    item: chosen.item,
    count: chosen.defaultCount,
    displayName: `${chosen.thaiName} x${chosen.defaultCount}`,
    source: 'POOL',
    reason: `Weighted Pool (${stage} stage — ${chosen.difficulty} tier)`,
  };
}

/**
 * AI Game Director: Analyzes live team standings via Gemini API,
 * enforces strict JSON Schema + Minecraft 26.3 Item Whitelist guardrails,
 * and falls back safely to a stage-weighted pool if API key is missing or invalid.
 */
export async function generateSmartFlashQuest(
  state: ServerState,
  recentItems: string[],
): Promise<GeneratedQuestResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return pickWeightedFallback(recentItems, state);
  }

  const activeTeams = state.teams.filter((t) => t.active);
  const sorted = [...activeTeams].sort((a, b) => b.score - a.score);
  const scoreSummary = sorted.map((t) => `${t.name}: ${t.score} pts (${t.diamonds} diamonds)`).join(', ');
  const allowedIds = MC_QUEST_WHITELIST.map(
    (w) => `${w.item} (${w.minCount}-${w.maxCount}, tier:${w.difficulty})`,
  ).join('; ');

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model,
      contents: [
        `You are the Game Director for a competitive Minecraft 26.3 SMP (25-minute Flash Quest).`,
        `Current standings: ${scoreSummary || 'Early game'}. Raid Day: ${state.raidDay ? 'ON' : 'OFF'}.`,
        `Recently used items to avoid repeating: ${recentItems.join(', ') || 'none'}.`,
        `Pick ONE fair and exciting quest item strictly from this allowed whitelist: ${allowedIds}.`,
        `Return JSON with item (exact minecraft:... id from whitelist), count (within min-max), displayName (short Thai+item label, max 36 chars, no quotes), and reason (short Thai explanation of why this fits the current match).`,
      ].join('\n'),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            count: { type: Type.INTEGER },
            displayName: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ['item', 'count', 'displayName', 'reason'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) return pickWeightedFallback(recentItems, state);

    const parsed = JSON.parse(text) as {
      item?: string;
      count?: number;
      displayName?: string;
      reason?: string;
    };

    const matched = MC_QUEST_WHITELIST.find((w) => w.item === parsed.item);
    if (!matched) {
      return pickWeightedFallback(recentItems, state);
    }

    const safeCount = clampCount(parsed.count ?? matched.defaultCount, matched);
    const fallbackName = `${matched.thaiName} x${safeCount}`;

    return {
      item: matched.item,
      count: safeCount,
      displayName: sanitizeDisplayName(parsed.displayName ?? fallbackName, fallbackName),
      source: 'AI',
      reason: parsed.reason?.trim() || 'AI เลือกให้สมดุลกับคะแนนทีมล่าสุด',
    };
  } catch (err) {
    console.warn('[AI] Gemini unavailable, using weighted pool fallback:', (err as Error).message);
    return pickWeightedFallback(recentItems, state);
  }
}
