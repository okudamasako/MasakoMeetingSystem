const model = "gpt-4.1-mini";

function buildPrompt(input) {
  return `あなたは「masako会議システム」です。

ユーザーのテーマに対して、5人のAI人格が会議を行います。

登場人格:
1. 議長masako: 会議進行と結論整理
2. まなみ: 感情・読者目線・発信目線
3. 司書まさこ: 情報整理・構造化・根拠確認
4. 事業まさこ: 収益化・案件化・ポートフォリオ目線
5. 実装まさこ: 技術実装・MVP化・作業手順

必ず次のJSONだけを返してください。Markdownや説明文は不要です。
{
  "agenda": "string",
  "opinions": {
    "manami": "string",
    "librarianMasako": "string",
    "businessMasako": "string",
    "engineerMasako": "string",
    "chairMasako": "string"
  },
  "conflicts": "string",
  "decision": "string",
  "todayTasks": ["string"],
  "laterTasks": ["string"],
  "timeline": ["string"],
  "portfolioPoint": "string"
}

入力:
会議テーマ: ${input.theme}
今の状況: ${input.situation}
困っていること: ${input.problem}
期限: ${input.deadline}
今日使える時間: ${input.availableTime}
最終的にほしい出力: ${input.desiredOutput}`;
}

function demoResult(input) {
  const theme = input.theme || "今日の議題";
  const output = input.desiredOutput || "次の行動";
  return {
    agenda: theme,
    opinions: {
      manami: `まず、今の迷いは自然です。${theme}は気持ちの整理と外に見せる価値の両方があるので、完璧さより「今日の自分が動ける形」に落とすのがよさそうです。`,
      librarianMasako: "入力、判断基準、出力を分けると扱いやすくなります。いま必要なのは追加調査より、前提・制約・欲しい結論を並べて優先順位を決めることです。",
      businessMasako: "成果物として見せるなら、意思決定の過程が見えることが強みです。作ったものをポートフォリオに載せる前提で、画面、判断ログ、実行手順を残しましょう。",
      engineerMasako: "MVPは入力フォーム、AI生成、結果表示、コピー、履歴保存で十分です。APIキーがない場合もデモ応答で画面を先に固められます。",
      chairMasako: `今日は${output}まで進めます。迷いを広げず、最短で試せる一手を決めて、その結果を次の会議材料にします。`
    },
    conflicts: "丁寧に考えたい視点と、今日中に動く形へ絞る視点が少しぶつかっています。今回はMVP優先で、詳細化は履歴に残して後から扱います。",
    decision: `${theme}は今日着手する価値があります。最初の完成形は小さくして、入力から結論表示までの流れを確認する方針です。`,
    todayTasks: [
      "会議テーマと制約を1つに絞る",
      "最終的にほしい出力を明文化する",
      "MVPで必要な画面と保存項目だけを確認する",
      "最初の結果をコピーして使える形に整える"
    ],
    laterTasks: [
      "Notion保存",
      "PDF出力",
      "ログイン機能",
      "人格ごとの細かい口調調整"
    ],
    timeline: [
      "0:00-0:30 入力内容を整理する",
      "0:30-1:00 AI会議の結果を生成する",
      "1:00-1:30 結論と今日やることを確認する",
      "1:30-2:00 履歴に残し、次回の改善点をメモする"
    ],
    portfolioPoint: "複数人格で感情、構造、事業性、実装可能性を分けて判断する点を見せると、情報整理力とAI活用設計の両方が伝わります。"
  };
}

function normalizeResult(parsed, input) {
  return {
    agenda: parsed.agenda || input.theme || "",
    opinions: {
      manami: parsed.opinions?.manami || "",
      librarianMasako: parsed.opinions?.librarianMasako || "",
      businessMasako: parsed.opinions?.businessMasako || "",
      engineerMasako: parsed.opinions?.engineerMasako || "",
      chairMasako: parsed.opinions?.chairMasako || ""
    },
    conflicts: parsed.conflicts || "",
    decision: parsed.decision || "",
    todayTasks: Array.isArray(parsed.todayTasks) ? parsed.todayTasks : [],
    laterTasks: Array.isArray(parsed.laterTasks) ? parsed.laterTasks : [],
    timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
    portfolioPoint: parsed.portfolioPoint || ""
  };
}

export async function POST(request) {
  const input = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ result: demoResult(input), mode: "demo" });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "あなたは実用的で温かい意思決定支援AIです。必ず有効なJSONだけを返します。"
        },
        {
          role: "user",
          content: buildPrompt(input)
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return Response.json({ error: "AI会議の生成に失敗しました。", detail }, { status: 500 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  return Response.json({ result: normalizeResult(parsed, input), mode: "ai" });
}
