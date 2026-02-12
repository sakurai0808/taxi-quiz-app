"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/quiz";

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark,} from '@fortawesome/free-solid-svg-icons';
import { faCircle} from '@fortawesome/free-regular-svg-icons';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false); // ハンバーガーメニューに使用
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
      {/* アプリ共通ヘッダー */}
      <header className="w-full fixed z-[10] bg-white flex justify-between items-center h-[80px] px-[20px] md:px-[150px]      border-b border-black/30">
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
      {/* メインコンテンツ */}
      <div className="container py-[120px] pb-[60px]">
        {!isAnswered ? ( // まだ回答していない状態
        /* クイズ回答画面 */
        <section className="px-4 py-4 mx-auto md:max-w-[800px]">
          {/* ページ内タイトル */}
          <h2 className="text-xl pb-[30px] font-medium">Q.次の画像の中で、赤いエリアが示す施設の名前を答えてください。</h2>
          {/* 問題画像 */}
          <div className="pt-[10px] pb-[40px]">
            <img src={question.image_url} alt="問題画像" />
          </div>
          <div className="pb-[30px]">
            {/* 選択肢エリア */}
            <div className="flex flex-col items-start gap-[1em] px-4">
              {shuffledChoices.map((choice, index) => ( // map関数は1に中身、2に番号が入る
                <button
                  key={index}
                  onClick={() => handleAnswer(choice)}
                  disabled={isAnswered}
                  className="w-full text-left bg-[#f5f5f5] px-[1em] py-[0.75em] rounded-[10px] text-base font-[500]"
                >
                  {index + 1}. {choice}
                </button>
              ))}
            </div>            
          </div>               
        </section>
        ) : ( 
          /* クイズ解説画面 */         
          <section className="px-4 py-4 mx-auto md:max-w-[800px]">
            <div className="text-center py-[30px]">
              <div className={`inline-block text-center text-3xl px-[1em] text-white mx-auto
                ${isCorrect
                  ? "bg-red-500"
                  : "bg-blue-500"
                }`}
              >
                <div className="flex gap-[0.5em] items-center">
                  {isCorrect ? (
                    <FontAwesomeIcon icon={faCircle} />
                  ) : (
                    <FontAwesomeIcon icon={faXmark} />
                  )}

                  {/* テキスト */}
                  <span>{isCorrect ? "正解!!" : "残念..."}</span>
                </div>
              </div>
            </div>
            <h2 className="text-xl pb-[30px] font-medium">A. {question.correct_answer}</h2>
            {/* 解答画像 */}
            <div className="pt-[10px] pb-[40px]">
              <img src={question.explanation_image_url} alt="問題画像" />
            </div>
            {/* 次へ進むボタン */}            
            <div>
              <button
                onClick={loadNextQuestion} // クリックすると関数をよぶ
                className="block text-base mx-auto px-[3em] py-[1em] text-[#fff] bg-[#11ab42] rounded-full font-medium"
              >
                次の問題へすすむ
              </button>
            </div>           
          </section>
          )} 
      </div>
    </main>
  );
}