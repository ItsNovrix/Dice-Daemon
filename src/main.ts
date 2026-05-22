import { Devvit } from "@devvit/public-api";

// ==========================================================
// 1. DEVVIT CONFIGURATION
// ==========================================================

Devvit.configure({
  redditAPI: true,
});

// ==========================================================
// 2. DICE DAEMON CORE LOGIC
// ==========================================================

//Listen for comments in the subreddit

Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    const comment = event.comment;

//Safety check: stops the bot if the comment data is empty

    if (!comment || !comment.body) return;

//Check if the comment matches the required format

    const rollRegex = /^!roll\s+(\d+)d(\d+)/i;
    const match = comment.body.trim().match(rollRegex);

//Convert text to numbers and apply maximum limits to avoid spam or crashes

    if (match) {
      const count = Math.min(parseInt(match[1]), 20);
      const sides = Math.min(parseInt(match[2]), 100);

//Ensure the numbers are valid and greater than zero before proceeding

      if (isNaN(count) || isNaN(sides) || count <= 0 || sides <= 0) return;

//Roll each die individually and store the results in an array

      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
      
//Sum up all the individual dice rolls to get the final total

      const total = rolls.reduce((a, b) => a + b, 0);

// Build the comment to display the results

      const username = event.author?.name || "An unknown wanderer";

      const replyMessage = `🎲 **u/${username} rolled! Here are the results:**\n\n` +
                           `[ ${rolls.join(', ')} ]\n\n` +
                           `**Total: ${total}**`;



//Publish the reply as a comment to original comment

      await context.reddit.submitComment({
        id: comment.id,
        text: replyMessage,
      });
    }
  },
});

export default Devvit;
