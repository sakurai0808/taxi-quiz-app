"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/quiz";

export default function Home() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]); // シャッフルされた選択肢の入れ物
  const [isAnswered, setIsAnswered] = useState(false); // 回答したかどうか
  const [isCorrect, setIsCorrect] = useState(false); // 正解か不正解か

  // 問題をセットアップする関数を独立させる
  const loadNextQuestion = useCallback(async () => {
    // 状態をリセットする
    setIsAnswered(false);
    setIsCorrect(false);   

    // supabaseのテーブルからデータを全て取得する
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .limit(10); // とりあえず上限を10件

    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length); // 0~9の整数をランダムに生成
      const q = data[randomIndex]; // 配列の序数をランダムにして問題をランダムに選ぶ

      setQuestion(q);
      const choices = [
        q.correct_answer,
        q.choice_2,
        q.choice_3,
        q.choice_4,
      ];
      setShuffledChoices(choices.sort(() => Math.random() - 0.5));   
    }
  }, []);

  // 最初の読み込み
  useEffect(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  // 問題に回答したときの処理
  const handleAnswer = (choice: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    if (choice === question?.correct_answer) {
      setIsCorrect(true);
    }
  };

  if (!question) return <p>読み込み中...</p>;

  return (
    <main>
      <header>
        <h1 className="text-center h-[80] text-3xl">タクシークイズ</h1>
      </header>

      {/* 施設のイラスト */}
      <div>
        <img src={question.image_url} alt="施設のイラスト" />
      </div>      

      {/* 問題エリア */}
      <p>この施設の名前は?</p>
      <div>
        {shuffledChoices.map((choice, index) => ( // map関数は1に中身、2に番号が入る
          <button
            key={index}
            onClick={() => handleAnswer(choice)}
            disabled={isAnswered}
          >
            {index + 1}. {choice}
          </button>
        ))}
      </div>

      {/* 判定メッセージの表示 */}
      {isAnswered && (
        <div>
          {isCorrect ? "正解!" : "残念..."}
        </div>
      )}

      {/* 次へ進むボタン */}
      {isAnswered && (
        <button
          onClick={loadNextQuestion} // クリックすると関数をよぶ
        >
          次の問題へ
        </button>
      )}
    </main>
  );
}