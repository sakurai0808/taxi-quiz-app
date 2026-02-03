"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  useEffect(() => {
    const fetchQuestions = async () => {

      // supabaseのテーブルからデータを全て取得する
      const { data, error } = await supabase
        .from("questions")
        .select("*");

      if (error) {
        console.error("エラーが発生しました", error);
      } else {
        console.log("データが取得できました:", data);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <main>
      <h1>タクシークイズ</h1>
      <p>コンソールに表示してみる</p>
    </main>
  );
}