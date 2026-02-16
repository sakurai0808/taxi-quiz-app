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
  const [allQuestions, setAllQuestions] = useState<Question[]>([]); // DBから10問を取得して保存する
  const [currentIndex, setCurrentIndex] = useState(0); // 現在 何問目かを示す
  const [score, setScore] = useState(0); // 正解数
  const [isFinished, setIsFinished] = useState(false); // 10問がすべて終了したか

  // 問題の仕組みをつくるための共通の処理
  const setupQuestion = useCallback((q: Question) => {
    setQuestion(q);
    const choices = [
      q.correct_answer,
      q.choice_2,
      q.choice_3,
      q.choice_4,
    ];
    setShuffledChoices(choices.sort(() => Math.random() - 0.5));  // setShuffledChoicesにランダムに混ぜて入れる
  }, []);
  
  // 最初に10問をセットする関数
  const fetchQuiz = useCallback(async () => { // useCallbackで、再レンダリングされても実行されないようにする
    const { data } = await supabase
      .from("questions")
      .select("*")
      .limit(50);

    if (data) {
      // ランダムに並び替えて先頭の10問を抽出する
      const selected = data.sort(() => Math.random() - 0.5).slice(0, 10);
      setAllQuestions(selected);
      setupQuestion(selected[0]);
    }
  }, [setupQuestion]);

  // 最初に読み込む
  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const loadNextQuestion = () => {
    if (currentIndex < 9) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setupQuestion(allQuestions[nextIndex]); // 次の問題をセットする
      setIsAnswered(false);
    } else {
      setIsFinished(true); // 10問終わった場合は終了
    }
  };

  // 問題に回答したときの処理
  const handleAnswer = (choice: string) => {
    const correct = choice === question.correct_answer;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1); // 正解のときスコアが増える
    }
    setIsAnswered(true);
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
        {isFinished ? (
          // 10問終了した場合、結果画面へ
          <section className="px-4 py-4 mx-auto md:max-w-[800px]">
            <h2>クイズ終了！</h2>
            <div>
              <span>{score} / 10</span>
            </div>
            <button 
              onClick={() => window.location.reload()} // 最初からやり直し
            >
              もう一度挑戦する
            </button>
          </section>
          ) : !isAnswered ? (
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