// Munshiji Intelligent Financial Advisor & Storyteller Engine

export const FINANCIAL_KNOWLEDGE = [
  {
    id: 'need_want',
    topics: ['need', 'want', 'difference', 'necessity', 'luxury', 'essential', 'buy', 'purchase', 'iphone', 'shopping', 'spend', 'spending'],
    headline: "Needs are essentials.\nWants are extras.",
    fullAnswer: "A need is something essential, like groceries or rent. A want adds comfort or enjoyment, like eating out. Plan for your needs first, then make room for wants.",
    audioUrl: "./assets/conversation/answers/need_want.mp3"
  },
  {
    id: 'savings',
    topics: ['save', 'saving', 'savings', 'gullak', 'habit', 'piggy', 'daily', 'coin', 'accumulate'],
    headline: "Small daily drops create an ocean of savings.",
    fullAnswer: "Putting aside just 10 or 20 rupees every day in your Gullak builds discipline. It is not about how much you start with, but how consistently you protect your daily savings habit.",
    audioUrl: "./assets/conversation/answers/savings.mp3"
  },
  {
    id: 'compounding',
    topics: ['compound', 'compounding', 'interest', 'magic', 'growth', 'exponential', 'time', 'long term', 'future value'],
    headline: "Compounding is the eighth wonder of the world.",
    fullAnswer: "When your returns start earning returns, your wealth grows exponentially over time. The earlier you begin, the more time does the heavy lifting for you.",
    audioUrl: "./assets/conversation/answers/compounding.mp3"
  },
  {
    id: 'emergency',
    topics: ['emergency', 'contingency', 'crisis', 'hospital', 'job loss', 'cushion', 'safety net', 'unexpected'],
    headline: "Protect your peace of mind with 3 to 6 months of expenses.",
    fullAnswer: "Before chasing high investment returns, keep an emergency cushion of 3 to 6 months in an accessible bank account. When unexpected storms arrive, you will stay calm and debt-free.",
    audioUrl: "./assets/conversation/answers/emergency.mp3"
  },
  {
    id: 'budgeting',
    topics: ['budget', 'budgeting', '50-30-20', 'rule', 'manage money', 'plan', 'expenses', 'salary', 'income', 'monthly'],
    headline: "Follow the 50-30-20 rule for balanced living.",
    fullAnswer: "Allocate 50% of your income to core needs, 30% to personal wants, and 20% to savings and investments. This simple ratio gives you financial freedom without guilt.",
    audioUrl: "./assets/conversation/answers/budgeting.mp3"
  },
  {
    id: 'investing',
    topics: ['invest', 'investing', 'mutual fund', 'sip', 'stock', 'share market', 'equity', 'shares', 'nifty', 'sensex'],
    headline: "Invest regularly through SIP for the long journey.",
    fullAnswer: "Do not attempt to time the market. A monthly Systematic Investment Plan in diversified index funds averages out market swings and grows steadily with India's economy.",
    audioUrl: "./assets/conversation/answers/investing.mp3"
  },
  {
    id: 'debt',
    topics: ['debt', 'loan', 'credit card', 'emi', 'borrow', 'interest rate', 'repay', 'personal loan'],
    headline: "Treat debt like fire: useful in control, ruinous in excess.",
    fullAnswer: "Always pay credit card bills in full every month to avoid 40% interest traps. Focus on clearing high-cost loans first using the debt avalanche strategy.",
    audioUrl: "./assets/conversation/answers/debt.mp3"
  },
  {
    id: 'gold_fd',
    topics: ['fd', 'fixed deposit', 'rd', 'bank', 'safe', 'guaranteed', 'gold', 'sovereign', 'sgb', 'jewellery'],
    headline: "Fixed deposits offer peace of mind for short horizons.",
    fullAnswer: "For goals in the next one to two years, fixed deposits protect your principal safely. For long-term purchasing power, Sovereign Gold Bonds offer a timeless hedge against inflation.",
    audioUrl: "./assets/conversation/answers/gold_fd.mp3"
  },
  {
    id: 'retirement',
    topics: ['retire', 'retirement', 'pension', 'ppf', 'nps', 'old age', 'provident fund'],
    headline: "Start your retirement garden while the sun is shining.",
    fullAnswer: "Instruments like Public Provident Fund and National Pension System provide tax exemptions and long-term compounding. What you sow in your youth sustains your dignity in elder years.",
    audioUrl: "./assets/conversation/answers/retirement.mp3"
  },
  {
    id: 'inflation',
    topics: ['inflation', 'price rise', 'expensive', 'cost of living', 'buying power', 'rupee value'],
    headline: "Inflation silently erodes money left idle.",
    fullAnswer: "Keeping cash under the mattress loses buying power every year. To beat inflation, your investments must generate returns higher than the rising cost of everyday goods.",
    audioUrl: "./assets/conversation/answers/inflation.mp3"
  },
  {
    id: 'insurance',
    topics: ['insurance', 'term insurance', 'health insurance', 'mediclaim', 'policy', 'medical bills', 'health cover'],
    headline: "Insurance is not an investment; it is protection.",
    fullAnswer: "Buy pure term life insurance to secure your family's future, and comprehensive health insurance to safeguard your hard-earned savings from medical emergencies.",
    audioUrl: "./assets/conversation/answers/insurance.mp3"
  },
  {
    id: 'money',
    topics: ['money', 'wealth', 'rich', 'financial freedom', 'what is money', 'purpose of money', 'lifestyle'],
    headline: "Money is stored energy and a vehicle for independence.",
    fullAnswer: "Money is a wonderful servant but a cruel master. When managed with patience and purpose, it gives you the ultimate luxury: control over your own time and freedom.",
    audioUrl: "./assets/conversation/answers/money.mp3"
  }
];

export const DEFAULT_GENERAL_ANSWER = {
  id: 'general',
  headline: "Cultivate clear priorities and steady financial habits.",
  fullAnswer: "Namaste! In all matters of money, remember the timeless rule: protect your essentials first, avoid unneeded debts, and invest consistently in yourself and your savings.",
  audioUrl: "./assets/conversation/answers/general.mp3"
};

// Fast local keyword & semantic matcher
export function findKnowledgeAnswer(query) {
  const q = (query || '').toLowerCase();
  let best = null;
  let maxScore = 0;

  for (const item of FINANCIAL_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.topics) {
      if (q.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      best = item;
    }
  }

  if (best && maxScore > 0) {
    return best;
  }

  return DEFAULT_GENERAL_ANSWER;
}

// Full AI resolution using Gemini (via Puter AI) with fallback to verified wisdom base
export async function getMunshijiAIAnswer(question) {
  const cleanQ = (question || '').trim();
  const localMatch = findKnowledgeAnswer(cleanQ);

  // If Puter AI is available on window, generate custom intelligent answer with Gemini
  if (typeof window !== 'undefined' && window.puter && window.puter.ai && window.puter.ai.chat) {
    try {
      const prompt = `You are Munshiji, an elderly, warm, wise Indian storyteller and personal finance mentor. 
A user asks you this question: "${cleanQ}".

Provide a wise, direct, practical response in natural Indian English.
Format your response EXACTLY as:
HEADLINE: <A memorable, punchy 1-line wisdom summary, 4 to 8 words>
EXPLANATION: <2 to 3 sentences of warm storytelling guidance. Simple, clear, practical. No asterisks, no bullets, no quotes.>`;

      const aiResponse = await window.puter.ai.chat(prompt, { model: 'gemini-1.5-flash' });
      const text = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.message?.content || '');

      if (text) {
        let headline = '';
        let explanation = '';

        const headlineMatch = text.match(/HEADLINE:\s*(.*)/i);
        const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*)/i);

        if (headlineMatch && headlineMatch[1]) {
          headline = headlineMatch[1].replace(/[*#"`]/g, '').trim();
        }
        if (explanationMatch && explanationMatch[1]) {
          explanation = explanationMatch[1].replace(/[*#"`]/g, '').trim();
        }

        if (headline && explanation) {
          return {
            headline,
            fullAnswer: explanation,
            // Pair with the closest thematic pre-rendered Indian voice audio
            audioUrl: localMatch.audioUrl || DEFAULT_GENERAL_ANSWER.audioUrl
          };
        }
      }
    } catch (err) {
      console.warn('Puter Gemini call note (using wisdom base):', err);
    }
  }

  // Fast offline / verified wisdom answer
  return localMatch;
}
