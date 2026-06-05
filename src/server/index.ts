import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort, reddit } from '@devvit/web/server';
import type { OnCommentCreateRequest, TriggerResponse } from '@devvit/web/shared';

// Initialize the web server
const app = new Hono();

// Route the event directly from the endpoint mapped in devvit.json
app.post('/internal/triggers/on-comment-create', async (c) => {
  try {
    const input = await c.req.json<OnCommentCreateRequest>();
    const comment = input.comment;
    const author = input.author;

    // Exit safely if the payload is empty
    if (!comment || !comment.body) {
      return c.json<TriggerResponse>({ status: 'ok' });
    }

    // Match "!roll XdX" (case-insensitive)
    const rollRegex = /^!roll\s+(\d+)d(\d+)/i;
    const match = comment.body.trim().match(rollRegex);

    if (match) {
      // Cap at 20 dice / 100 sides to prevent spam and heavy loops
      const count = Math.min(parseInt(match[1]), 20);
      const sides = Math.min(parseInt(match[2]), 100);

      if (isNaN(count) || isNaN(sides) || count <= 0 || sides <= 0) {
        return c.json<TriggerResponse>({ status: 'ok' });
      }

      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }

      // Sum up dice rolls
      const total = rolls.reduce((a, b) => a + b, 0);

      // Display the results
      const username = author?.name || "An unknown wanderer";
      const replyMessage = `🎲 **u/${username} rolled! Here are the results:**\n\n` +
                           `[ ${rolls.join(', ')} ]\n\n` +
                           `**Total: ${total}**`;

      console.log(`[Dice Daemon] Attempting to reply to comment ${comment.id}...`);

      // The modern Devvit Web Reddit API singleton
      await reddit.submitComment({
        id: comment.id,
        text: replyMessage,
      });

      console.log("[Dice Daemon] Reply successfully posted!");
    }
  } catch (error) {
    // Log the actual error to the terminal instead of crashing Devvit's gateway
    console.error("[Dice Daemon] Trigger Error:", error);
  }

  // Always return an OK response to tell Reddit the trigger resolved successfully
  return c.json<TriggerResponse>({ status: 'ok' });
});

// Explicitly start the server using Devvit's required bindings
serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});