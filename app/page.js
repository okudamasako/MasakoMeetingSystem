"use client";

import { useEffect, useMemo, useState } from "react";

const emptyInput = {
  theme: "",
  situation: "",
  problem: "",
  deadline: "",
  availableTime: "",
  desiredOutput: ""
};

const fieldLabels = {
  theme: "会議テーマ",
  situation: "今の状況",
  problem: "困っていること",
  deadline: "期限",
  availableTime: "今日使える時間",
  desiredOutput: "最終的にほしい出力"
};

const opinionCards = [
  {
    key: "manami",
    name: "まなみ",
    role: "感情・発信目線",
    accent: "border-l-[#c98578]"
  },
  {
    key: "librarianMasako",
    name: "司書まさこ",
    role: "情報整理・構造化",
    accent: "border-l-[#74836b]"
  },
  {
    key: "businessMasako",
    name: "事業まさこ",
    role: "案件化・収益化",
    accent: "border-l-[#b48a50]"
  },
  {
    key: "engineerMasako",
    name: "実装まさこ",
    role: "技術実装・MVP化",
    accent: "border-l-[#59738e]"
  },
  {
    key: "chairMasako",
    name: "議長masako",
    role: "結論整理",
    accent: "border-l-[#292521]"
  }
];

function createId() {
  return `meeting_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function resultToText(meeting) {
  if (!meeting?.result) return "";

  const result = meeting.result;
  return [
    `【議題】\n${result.agenda}`,
    `【まなみの意見】\n${result.opinions.manami}`,
    `【司書まさこの意見】\n${result.opinions.librarianMasako}`,
    `【事業まさこの意見】\n${result.opinions.businessMasako}`,
    `【実装まさこの意見】\n${result.opinions.engineerMasako}`,
    `【意見の対立点】\n${result.conflicts}`,
    `【議長masakoの結論】\n${result.decision}`,
    `【今日やること】\n${result.todayTasks.map((item) => `・${item}`).join("\n")}`,
    `【後回しにすること】\n${result.laterTasks.map((item) => `・${item}`).join("\n")}`,
    `【30分単位の作業手順】\n${result.timeline.map((item) => `・${item}`).join("\n")}`,
    `【ポートフォリオ化するなら】\n${result.portfolioPoint}`
  ].join("\n\n");
}

export default function Home() {
  const [input, setInput] = useState(emptyInput);
  const [meetings, setMeetings] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyLabel, setCopyLabel] = useState("コピー");

  const canSubmit = useMemo(() => {
    return input.theme.trim() && input.problem.trim() && !loading;
  }, [input, loading]);

  useEffect(() => {
    const saved = window.localStorage.getItem("masako-meetings");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setMeetings(parsed);
        setActiveMeeting(parsed[0] || null);
      }
    } catch {
      window.localStorage.removeItem("masako-meetings");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("masako-meetings", JSON.stringify(meetings));
  }, [meetings]);

  function updateField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function startMeeting(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setCopyLabel("コピー");

    try {
      const response = await fetch("/api/meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "会議の生成に失敗しました。");
      }

      const meeting = {
        id: createId(),
        title: input.theme,
        createdAt: new Date().toISOString(),
        input,
        result: data.result,
        mode: data.mode
      };

      setMeetings((current) => [meeting, ...current].slice(0, 20));
      setActiveMeeting(meeting);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!activeMeeting) return;

    await navigator.clipboard.writeText(resultToText(activeMeeting));
    setCopyLabel("コピー済み");
    window.setTimeout(() => setCopyLabel("コピー"), 1800);
  }

  function clearForm() {
    setInput(emptyInput);
    setError("");
  }

  function deleteHistory() {
    setMeetings([]);
    setActiveMeeting(null);
    setCopyLabel("コピー");
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-[#d8cfc2] bg-[#fffdf8]/82">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] md:px-8 lg:py-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold text-[#74836b]">複数AI人格による意思決定支援ツール</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-[#292521] md:text-5xl">
              masako会議システム
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f574f]">
              ひとりで悩まないための、AI会議室。感情、情報整理、事業性、実装可能性を分けて検討し、最後に今日の行動へ落とし込みます。
            </p>
          </div>
          <div className="grid gap-3 rounded-lg border border-[#d8cfc2] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-[#292521]">保存済み会議</span>
              <span className="rounded-full bg-[#edf1e8] px-3 py-1 text-sm font-bold text-[#596650]">
                {meetings.length}件
              </span>
            </div>
            <p className="text-sm leading-6 text-[#746b61]">
              履歴はこのブラウザに保存されます。APIキー未設定時はデモ応答で動作します。
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 md:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] md:px-8">
        <aside className="space-y-6">
          <form onSubmit={startMeeting} className="rounded-lg border border-[#d8cfc2] bg-[#fffdf8] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#292521]">会議を始める</h2>
              <button
                type="button"
                onClick={clearForm}
                className="rounded-md border border-[#d8cfc2] px-3 py-2 text-sm font-bold text-[#5f574f] transition hover:bg-[#f0e8dc]"
              >
                クリア
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {Object.entries(fieldLabels).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-sm font-bold text-[#3c3731]">{label}</span>
                  <textarea
                    value={input[key]}
                    onChange={(event) => updateField(key, event.target.value)}
                    rows={key === "theme" || key === "deadline" || key === "availableTime" ? 2 : 3}
                    placeholder={placeholderFor(key)}
                    className="w-full rounded-md border border-[#d8cfc2] bg-white px-3 py-3 text-sm leading-6 text-[#292521] outline-none transition focus:border-[#74836b] focus:ring-2 focus:ring-[#74836b]/20"
                  />
                </label>
              ))}
            </div>

            {error ? (
              <p className="mt-4 rounded-md border border-[#d9a192] bg-[#fff3ee] px-3 py-2 text-sm font-bold text-[#8a3f31]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 w-full rounded-md bg-[#292521] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3b352f] disabled:cursor-not-allowed disabled:bg-[#b8afa5]"
            >
              {loading ? "会議中..." : "会議を開始する"}
            </button>
          </form>

          <section className="rounded-lg border border-[#d8cfc2] bg-[#fffdf8] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#292521]">履歴</h2>
              <button
                type="button"
                onClick={deleteHistory}
                disabled={!meetings.length}
                className="rounded-md border border-[#d8cfc2] px-3 py-2 text-sm font-bold text-[#5f574f] transition hover:bg-[#f0e8dc] disabled:cursor-not-allowed disabled:opacity-40"
              >
                全削除
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {meetings.length ? (
                meetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    type="button"
                    onClick={() => setActiveMeeting(meeting)}
                    className={`w-full rounded-md border px-3 py-3 text-left transition ${
                      activeMeeting?.id === meeting.id
                        ? "border-[#74836b] bg-[#edf1e8]"
                        : "border-[#d8cfc2] bg-white hover:bg-[#f7f2ea]"
                    }`}
                  >
                    <span className="block text-sm font-bold text-[#292521]">{meeting.title}</span>
                    <span className="mt-1 block text-xs text-[#746b61]">{formatDate(meeting.createdAt)}</span>
                  </button>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-[#d8cfc2] px-3 py-4 text-sm leading-6 text-[#746b61]">
                  まだ履歴はありません。
                </p>
              )}
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          {activeMeeting ? (
            <MeetingResult meeting={activeMeeting} copyLabel={copyLabel} onCopy={copyResult} />
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </main>
  );
}

function placeholderFor(key) {
  const placeholders = {
    theme: "例: AIニュースnote半自動投稿システムを作るべきか",
    situation: "例: Codex実績にもしたい。今日中に方針だけ決めたい。",
    problem: "例: Difyで作るか、Next.jsで作るか迷っている。",
    deadline: "例: 今日中 / 今週中 / 5月末まで",
    availableTime: "例: 2時間 / 午前中だけ / 30分",
    desiredOutput: "例: 実装計画書 / 今日の作業順 / note構成案"
  };

  return placeholders[key];
}

function MeetingResult({ meeting, copyLabel, onCopy }) {
  const result = meeting.result;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[#d8cfc2] bg-[#fffdf8] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#74836b]">今日の結論</p>
            <h2 className="mt-2 text-2xl font-bold leading-snug text-[#292521]">{result.decision}</h2>
            <p className="mt-3 text-sm text-[#746b61]">
              {formatDate(meeting.createdAt)}
              {meeting.mode === "demo" ? " / デモ応答" : " / AI生成"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-md bg-[#292521] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3b352f]"
          >
            {copyLabel}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#d8cfc2] bg-[#fffdf8] p-5 shadow-sm">
        <p className="text-sm font-bold text-[#74836b]">議題</p>
        <h3 className="mt-2 text-2xl font-bold text-[#292521]">{result.agenda}</h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {opinionCards.map((card) => (
          <article
            key={card.key}
            className={`rounded-lg border border-[#d8cfc2] border-l-4 ${card.accent} bg-white p-5 shadow-sm`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-[#292521]">{card.name}</h3>
              <span className="text-xs font-bold text-[#746b61]">{card.role}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[#3c3731]">{result.opinions[card.key]}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TextPanel title="意見の対立点" text={result.conflicts} />
        <TextPanel title="ポートフォリオ化するなら" text={result.portfolioPoint} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListPanel title="今日やること" items={result.todayTasks} />
        <ListPanel title="後回しにすること" items={result.laterTasks} />
        <ListPanel title="30分単位の作業手順" items={result.timeline} />
      </div>
    </div>
  );
}

function TextPanel({ title, text }) {
  return (
    <article className="rounded-lg border border-[#d8cfc2] bg-[#fffdf8] p-5 shadow-sm">
      <h3 className="text-lg font-bold text-[#292521]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#3c3731]">{text}</p>
    </article>
  );
}

function ListPanel({ title, items }) {
  return (
    <article className="rounded-lg border border-[#d8cfc2] bg-[#fffdf8] p-5 shadow-sm">
      <h3 className="text-lg font-bold text-[#292521]">{title}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-white px-3 py-3 text-sm leading-6 text-[#3c3731]">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-[#d8cfc2] bg-[#fffdf8]/78 p-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-bold text-[#74836b]">会議結果</p>
        <h2 className="mt-2 text-2xl font-bold text-[#292521]">入力すると、ここにAI会議の結論が表示されます。</h2>
        <p className="mt-3 text-sm leading-7 text-[#746b61]">
          最初はテーマと困っていることだけでも始められます。足りない情報は会議の中で整理します。
        </p>
      </div>
    </div>
  );
}
