
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort, reddit } from '@devvit/web/server';
import type { OnCommentCreateRequest, TriggerResponse } from '@devvit/web/shared';

const app = new Hono();

const MAX_DICE = 20;
const MAX_SIDES = 100;
const MAX_EXTRA_ROLLS = 100;
const MAX_MODIFIER = 1_000_000;

type RollMode =
  | 'normal'
  | 'modifier'
  | 'keep-highest'
  | 'keep-lowest'
  | 'explode-once'
  | 'explode-chain';

interface RollCommand {
  count: number;
  sides: number;
  mode: RollMode;
  modifier?: number;
  keepCount?: number;
}

interface RollResult {
  rolls: number[];
  total: number;
  kept?: boolean[];
  explosionGroups?: number[][];
  safetyCapReached: boolean;
}

function parseRollCommand(body: string): RollCommand | null {
  // Search for roll commands anywhere in the comment.
  // Continue searching if a command is invalid.
  const rollRegex =
    /(?:^|\s)!roll\s+(\d+)d(\d+)(?:(kh|kl)(\d+)|([+-])(\d+)|(!{1,2}))?(?=\s|$)/gi;

  let match: RegExpExecArray | null;

  while ((match = rollRegex.exec(body)) !== null) {
    const rawCount = Number(match[1]);
    const rawSides = Number(match[2]);

    if (
      !Number.isSafeInteger(rawCount) ||
      !Number.isSafeInteger(rawSides) ||
      rawCount <= 0 ||
      rawSides <= 0
    ) {
      continue;
    }

    const count = Math.min(rawCount, MAX_DICE);
    const sides = Math.min(rawSides, MAX_SIDES);

    if (match[3]) {
      const keepCount = Number(match[4]);

      if (
        !Number.isSafeInteger(keepCount) ||
        keepCount < 1 ||
        keepCount > count
      ) {
        continue;
      }

      return {
        count,
        sides,
        mode: match[3].toLowerCase() === 'kh'
          ? 'keep-highest'
          : 'keep-lowest',
        keepCount,
      };
    }

    if (match[5]) {
      const value = Number(match[6]);

      if (
        !Number.isSafeInteger(value) ||
        value > MAX_MODIFIER
      ) {
        continue;
      }

      return {
        count,
        sides,
        mode: 'modifier',
        modifier: match[5] === '-' ? -value : value,
      };
    }

    if (match[7]) {
      return {
        count,
        sides,
        mode: match[7] === '!' ? 'explode-once' : 'explode-chain',
      };
    }

    return { count, sides, mode: 'normal' };
  }

  return null;
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(command: RollCommand): RollResult {
  const { count, sides, mode } = command;
  const rolls: number[] = [];
  let total = 0;
  let safetyCapReached = false;

  if (mode === 'normal' || mode === 'modifier') {
    for (let i = 0; i < count; i++) {
      rolls.push(rollDie(sides));
    }

    total = rolls.reduce((sum, roll) => sum + roll, 0);

    if (mode === 'modifier') {
      total += command.modifier ?? 0;
    }

    return { rolls, total, safetyCapReached };
  }

  if (mode === 'keep-highest' || mode === 'keep-lowest') {
    for (let i = 0; i < count; i++) {
      rolls.push(rollDie(sides));
    }

    const keepCount = command.keepCount!;

    const rankedIndices = rolls.map((_, index) => index).sort((a, b) => {
      const difference = mode === 'keep-highest'
        ? rolls[b] - rolls[a]
        : rolls[a] - rolls[b];

      return difference || a - b;
    });

    const keptIndices = new Set(rankedIndices.slice(0, keepCount));
    const kept = rolls.map((_, index) => keptIndices.has(index));

    total = rolls.reduce(
      (sum, roll, index) => sum + (kept[index] ? roll : 0),
      0
    );

    return { rolls, total, kept, safetyCapReached };
  }

  const explosionGroups: number[][] = [];
  let extraRollCount = 0;

  for (let i = 0; i < count; i++) {
    const group = [rollDie(sides)];

    if (mode === 'explode-once' && group[0] === sides) {
      if (extraRollCount < MAX_EXTRA_ROLLS) {
        group.push(rollDie(sides));
        extraRollCount++;
      } else {
        safetyCapReached = true;
      }
    } else if (mode === 'explode-chain') {
      while (group[group.length - 1] === sides) {
        if (extraRollCount >= MAX_EXTRA_ROLLS) {
          safetyCapReached = true;
          break;
        }

        group.push(rollDie(sides));
        extraRollCount++;
      }
    }

    explosionGroups.push(group);
    total += group.reduce((sum, roll) => sum + roll, 0);
  }

  return { rolls, total, explosionGroups, safetyCapReached };
}

function formatRollResult(
  username: string,
  command: RollCommand,
  result: RollResult
): string {
  if (command.mode === 'normal') {
    return (
      `🎲 **u/${username} rolled! Here are the results:**\n\n` +
      `[ ${result.rolls.join(', ')} ]\n\n` +
      `**Total: ${result.total}**`
    );
  }

  let details = '';

  if (command.mode === 'modifier') {
    const modifier = command.modifier ?? 0;
    const sign = modifier >= 0 ? '+' : '−';

    details =
      `[ ${result.rolls.join(', ')} ]\n\n` +
      `Modifier: ${sign}${Math.abs(modifier)}`;
  } else if (
    command.mode === 'keep-highest' ||
    command.mode === 'keep-lowest'
  ) {
    const displayedRolls = result.rolls.map((roll, index) =>
      result.kept![index] ? `**${roll}**` : `~~${roll}~~`
    );

    details =
      `[ ${displayedRolls.join(', ')} ]\n\n` +
      `Kept ${command.keepCount} ${command.mode === 'keep-highest' ? 'highest' : 'lowest'} dice.`;
  } else {
    details = result.explosionGroups!.map((group, index) => {
      const chain = group.join(' → ');
      const dieTotal = group.reduce((sum, roll) => sum + roll, 0);
      return `Die ${index + 1}: ${chain} = **${dieTotal}**`;
    }).join('\n\n');

    details = command.mode === 'explode-once'
      ? `Exploding dice (one extra roll):\n\n${details}`
      : `Chaining exploding dice:\n\n${details}`;
  }

  const capNotice = result.safetyCapReached
    ? '\n\n*Safety limit reached: no further bonus rolls were generated.*'
    : '';

  return (
    `🎲 **u/${username} rolled! Here are the results:**\n\n` +
    `${details}\n\n` +
    `**Total: ${result.total}**${capNotice}`
  );
}

app.post('/internal/triggers/on-comment-create', async (c) => {
  try {
    const input = await c.req.json<OnCommentCreateRequest>();
    const comment = input.comment;
    const author = input.author;

    if (!comment || !comment.body) {
      return c.json<TriggerResponse>({ status: 'ok' });
    }

    const command = parseRollCommand(comment.body);

    if (!command) {
      return c.json<TriggerResponse>({ status: 'ok' });
    }

    const result = rollDice(command);
    const username = author?.name || 'An unknown wanderer';
    const replyMessage = formatRollResult(username, command, result);

    console.log(
      `[Dice Daemon] Attempting to reply to comment ${comment.id}...`
    );

    await reddit.submitComment({
      id: comment.id,
      text: replyMessage,
    });

    console.log('[Dice Daemon] Reply successfully posted!');
  } catch (error) {
    console.error('[Dice Daemon] Trigger Error:', error);
  }

  return c.json<TriggerResponse>({ status: 'ok' });
});

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
