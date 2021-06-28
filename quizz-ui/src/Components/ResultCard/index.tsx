import React, { useState, useEffect } from "react";
import "./resultCard.css";
import { resultScore } from "../../Types/quizQuestionTYpes";

import App from '../../App'
export const ResultCard: React.FC<resultScore> = ({ score, totalQuestion }) => {
  
  const [startQuiz, setStartQuiz] = useState<Boolean>(false)
  if (startQuiz) return <App />
  return (
    <div className="resultCardWrapper">
      <div className="resultContent text-center">
        <div className="p-4">
          <span className=" helloText text-center p-3">
            <h1 className="P-2">**** Your Score **** </h1>
            <h1 className="P-2">{score}/{totalQuestion}</h1>
            <h1 className="P-2">Keep Up The Good Work</h1>
            <button onClick={() => setStartQuiz(true)} className="restartBtn mt-2">Restart Quiz</button>
          </span>
        </div>
      </div>
      {/* <Button>Next</Button> */}
    </div>
  );
};
