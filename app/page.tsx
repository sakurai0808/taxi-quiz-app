"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/quiz";

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
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
      <div className="container py-[60px]">      
      <header className="w-full fixed z-[10] bg-white flex justify-between items-center h-[80px] px-[20px] md:px-[150px] border-b border-black/30">
          <h1 className="md:text-2xl">タクシークイズ</h1>
          <button className="md:text-xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ?(<FontAwesomeIcon icon={faXmark} />) : (<FontAwesomeIcon icon={faBars} />)}
          </button>

          {/* メニューが開いたときのナビゲーション */}
          {isOpen && (
            <nav className="min-h-screen w-full absolute top-full left-0 flex flex-col items-center bg-white border-t border-black/30 text-lg space-y-[1em] py-[50px]">
            </nav>
          )}
        </header>
        <section className="px-4 py-4 mx-auto md:max-w-[800px]">
          {/* ページ内タイトル */}
          <h2 className="text-xl">Q.次の画像の中で、赤いエリアが示す施設の名前を答えてください。</h2>
          {/* 施設のイラスト */}
          <div className="my-4">
            <img src={question.image_url} alt="施設のイラスト" />
          </div>
          <div className="py-4">
            {/* 問題エリア */}
            <div className="flex flex-col items-start gap-2 text-lg mt-4 px-4">
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
          </div>
          {/* 判定メッセージの表示 */}
          {isAnswered && (
            <div className="text-center text-2xl mt-[1em]">
              {isCorrect ? "正解!" : "残念..."}
            </div>
          )}
          {/* 次へ進むボタン */}
          {isAnswered && (
            <button
              onClick={loadNextQuestion} // クリックすると関数をよぶ
              className="block text-xl mx-auto mt-[1em]"
            >
              次の問題へ
            </button>
          )}
        </section>      
      </div>
    </main>
  );
}