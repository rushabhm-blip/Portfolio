import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { exec } from 'child_process'

const FINANCIAL_KNOWLEDGE = [
  {
    topics: ['need', 'want', 'difference', 'necessity', 'luxury', 'essential'],
    headline: "Needs are essentials.\nWants are extras.",
    fullAnswer: "A need is something essential, like groceries or rent. A want adds comfort or enjoyment, like eating out. Plan for your needs first, then make room for wants.",
    presetAudio: "/assets/conversation/sample_answer.mp3"
  },
  {
    topics: ['save', 'saving', 'gullak', 'habit', 'piggy', 'daily', 'coin'],
    headline: "Small daily drops create an ocean of savings.",
    fullAnswer: "Putting aside just 10 or 20 rupees every day in your Gullak builds discipline. It is not about how much you start with, but how consistently you protect your savings habit."
  },
  {
    topics: ['compound', 'compounding', 'interest', 'magic', 'growth', 'exponential'],
    headline: "Compounding is the eighth wonder of the world.",
    fullAnswer: "When your returns start earning returns, your wealth grows exponentially over time. The earlier you begin, the more time does the heavy lifting for you."
  },
  {
    topics: ['emergency', 'contingency', 'crisis', 'hospital', 'job loss', 'cushion'],
    headline: "Protect your peace of mind with 3 to 6 months of expenses.",
    fullAnswer: "Before chasing high investment returns, keep an emergency cushion in an accessible bank account. When unexpected storms arrive, you will stay calm and debt-free."
  },
  {
    topics: ['budget', 'budgeting', '50-30-20', 'rule', 'manage money', 'plan'],
    headline: "Follow the 50-30-20 rule for balanced living.",
    fullAnswer: "Allocate 50% of your income to core needs, 30% to personal wants, and 20% to savings and investments. This simple ratio gives you financial freedom without guilt."
  },
  {
    topics: ['invest', 'investing', 'mutual fund', 'sip', 'stock', 'share market', 'equity'],
    headline: "Invest regularly through SIP for the long journey.",
    fullAnswer: "Do not attempt to time the market. A monthly Systematic Investment Plan in diversified index funds averages out market swings and grows steadily with India's economy."
  },
  {
    topics: ['debt', 'loan', 'credit card', 'emi', 'borrow', 'interest rate'],
    headline: "Treat debt like fire: useful in control, ruinous in excess.",
    fullAnswer: "Always pay credit card bills in full every month to avoid 40% interest traps. Focus on clearing high-cost loans first using the debt avalanche strategy."
  },
  {
    topics: ['fd', 'fixed deposit', 'rd', 'bank', 'safe', 'guaranteed'],
    headline: "Fixed deposits offer peace of mind for short horizons.",
    fullAnswer: "For goals coming up in the next one to two years, fixed deposits and recurring deposits protect your principal money without any market volatility."
  },
  {
    topics: ['gold', 'sovereign', 'sgb', 'jewellery', 'yellow metal'],
    headline: "Gold acts as a timeless shield against inflation.",
    fullAnswer: "Gold preserves your purchasing power over generations. Instead of physical jewelry with making charges, look at Sovereign Gold Bonds or Gold ETFs for smart investing."
  },
  {
    topics: ['retire', 'retirement', 'pension', 'ppf', 'nps', 'old age'],
    headline: "Start your retirement garden while the sun is shining.",
    fullAnswer: "Instruments like Public Provident Fund and National Pension System provide tax exemptions and long-term compounding. What you sow in your youth sustains your dignity in elder years."
  },
  {
    topics: ['inflation', 'price rise', 'expensive', 'cost of living'],
    headline: "Inflation silently erodes money left idle.",
    fullAnswer: "Keeping cash under the mattress loses buying power every year. To beat inflation, your investments must generate returns higher than the rising cost of everyday goods."
  },
  {
    topics: ['insurance', 'term insurance', 'health insurance', 'mediclaim', 'policy'],
    headline: "Insurance is not an investment; it is protection.",
    fullAnswer: "Buy pure term life insurance to secure your family's future, and comprehensive health insurance to safeguard your hard-earned savings from medical bills."
  },
  {
    topics: ['tax', 'taxes', '80c', 'income tax', 'tds', 'itr'],
    headline: "Plan your taxes wisely, but invest for real returns.",
    fullAnswer: "Utilize tax deductions like section 80C and ELSS mutual funds, but never buy an unsuitable financial product solely to save a small amount of income tax."
  },
  {
    topics: ['money', 'wealth', 'rich', 'financial freedom', 'what is money'],
    headline: "Money is stored energy and a vehicle for independence.",
    fullAnswer: "Money is a wonderful servant but a cruel master. When managed with patience and purpose, it gives you the ultimate luxury: control over your own time."
  },
  {
    topics: ['crypto', 'bitcoin', 'get rich quick', 'scheme', 'lottery'],
    headline: "Beware of shortcuts; true wealth takes root slowly.",
    fullAnswer: "Any scheme promising overnight riches usually brings overnight sorrow. Stick to sound, regulated assets with transparent track records and business value."
  }
];

function findAnswer(q) {
  const query = (q || '').toLowerCase();
  let best = null;
  let maxScore = 0;

  for (const item of FINANCIAL_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.topics) {
      if (query.includes(kw)) score += kw.length;
    }
    if (score > maxScore) {
      maxScore = score;
      best = item;
    }
  }

  if (best && maxScore > 0) return best;

  return {
    headline: "Cultivate clear financial priorities and steady habits.",
    fullAnswer: `Namaste! On "${q.trim()}", the timeless advice is simple: secure your essentials first, avoid unneeded debts, and invest consistently for your long-term peace of mind.`
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    port: 5175,
    strictPort: true
  },
  plugins: [
    react(),
    {
      name: 'munshiji-ai-tts-service',
      configureServer(server) {
        // Frame saving endpoint
        server.middlewares.use('/api/save-frame', (req, res) => {
          if (req.method !== 'POST') return res.end();
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { name, data } = JSON.parse(body);
              const base64Data = data.replace(/^data:image\/png;base64,/, '');
              const outDir = path.resolve('public/assets/coin');
              if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
              fs.writeFileSync(path.join(outDir, name), Buffer.from(base64Data, 'base64'));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', name }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });

        // Dynamic Q&A + Indianized TTS service with Prabhat voice
        server.middlewares.use('/api/ask-munshiji', (req, res) => {
          if (req.method !== 'POST') return res.end();
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { question } = JSON.parse(body);
              const answerObj = findAnswer(question || '');

              // If preset audio exists, return immediately
              if (answerObj.presetAudio) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  headline: answerObj.headline,
                  fullAnswer: answerObj.fullAnswer,
                  audioUrl: answerObj.presetAudio
                }));
              }

              // Synthesize dynamic audio via edge-tts with en-IN-PrabhatNeural
              const hash = crypto.createHash('md5').update(answerObj.fullAnswer).digest('hex').slice(0, 10);
              const dynFileName = `dyn_${hash}.mp3`;
              const dynFilePath = path.resolve('public/assets/conversation', dynFileName);
              const dynPublicUrl = `/assets/conversation/${dynFileName}`;

              if (fs.existsSync(dynFilePath)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  headline: answerObj.headline,
                  fullAnswer: answerObj.fullAnswer,
                  audioUrl: dynPublicUrl
                }));
              }

              const safeText = answerObj.fullAnswer.replace(/["\\]/g, ' ');
              const cmd = `py -m edge_tts --voice "en-IN-PrabhatNeural" --text "${safeText}" --write-media "${dynFilePath}"`;

              exec(cmd, (err) => {
                if (err) {
                  console.warn('Dynamic edge-tts fallback:', err.message);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  return res.end(JSON.stringify({
                    headline: answerObj.headline,
                    fullAnswer: answerObj.fullAnswer,
                    audioUrl: null
                  }));
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  headline: answerObj.headline,
                  fullAnswer: answerObj.fullAnswer,
                  audioUrl: dynPublicUrl
                }));
              });
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      }
    }
  ],
})
