import { Devvit } from "@devvit/public-api";

// ==========================================================
// 1. DEVVIT CONFIGURATION
// ==========================================================

Devvit.configure({
  redditAPI: true,
});

// ==========================================================
// 2. DICE ROLL CORE LOGIC
// ==========================================================

//Main trigger to catch roll requests in the sub
Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    const comment = event.comment;
    if (!comment || !comment.body) return;

//Match "!roll XdX" (case-insensitive)

    const rollRegex = /^!roll\s+(\d+)d(\d+)/i;
    const match = comment.body.trim().match(rollRegex);

// Cap at 20 dice / 100 sides to prevent spam and heavy loops
    if (match) {
      const count = Math.min(parseInt(match[1]), 20);
      const sides = Math.min(parseInt(match[2]), 100);

      if (isNaN(count) || isNaN(sides) || count <= 0 || sides <= 0) return;

      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }

//Sum up dice rolls
      const total = rolls.reduce((a, b) => a + b, 0);

//Display the results as comment reply to original comment
      const username = event.author?.name || "An unknown wanderer";

      const replyMessage = `🎲 **u/${username} rolled! Here are the results:**\n\n` +
                           `[ ${rolls.join(', ')} ]\n\n` +
                           `**Total: ${total}**`;

      await context.reddit.submitComment({
        id: comment.id,
        text: replyMessage,
      });
    }
  },
});

export default Devvit;
