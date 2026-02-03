"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/quiz";

export default function Home() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]); // シャッフルされた選択肢の入れ物

  useEffect(() => {
    const fetchQuestions = async () => {

      // supabaseのテーブルからデータを全て取得する
      const { data, error } = await supabase
        .from("questions")
        .select("*");

      if (data && data.length > 0) {
        const q = data[0];
        setQuestion(q);

      // 1つの配列にまとめる
      const choices = [
        q.correct_answer,
        q.choice_2,
        q.choice_3,
        q.choice_4,
      ];

      // 配列をシャッフルする
      const shuffled = choices.sort(() => Math.random());
      setShuffledChoices(shuffled);
      }
    };
    fetchQuestions();
  }, []);

  if (!question) return <p>読み込み中...</p>;

  return (
    <main>
      <h1>タクシークイズ</h1>

      {/* 施設のイラスト */}
      <div>
        <img src="{question.image_url}" alt="施設のイラスト" />
      </div>
      <p>この施設の名前は?</p>
      <div>
        {shuffledChoices.map((choice, index) => ( // map関数は1に中身、2に番号が入る
          <button
            key={index}
            onClick={() => alert(choice === question.correct_answer ? "正解!" : "残念..." )}
          >
            {index + 1}. {choice}
          </button>
        ))}
      </div>
    </main>
  );
}