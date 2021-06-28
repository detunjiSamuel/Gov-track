import React, { createRef, useEffect, useState } from "react";
import "./App.css";
import Quiz from "./Components/Quiz/Quiz";
import { FilteredQuestions } from "./Types/quizQuestionTYpes";
import { generateQuestions } from "./Services/quizServices";
import { QuestionCard } from "./Components/QuestionCard/questionCard";
import { ResultCard } from "./Components/ResultCard/index";
import firebase from "./firebase";
import Swal from "sweetalert2";
import axios from "axios";

function App() {
  let [iteration, setIterations] = useState(0);
  let [allQuestions, setAllQuestions] = useState<FilteredQuestions[]>([]);
  const totalQuestions: number = 5;
  let [score, setScore] = useState<number>(0);
  let [showResult, setShowResult] = useState<Boolean>(false);
  const [startQuiz, setStartQuiz] = useState<Boolean>(false);
  const [fileName, setFileName] = useState<String>("");
  const [selectedFile, setSelectedFile] = useState<any>();
  const [toUpload, setToUpload] = useState<Boolean>(false);
  const [questions, setQuestion] = useState<any>([]);
  const startTheQuiz = () => {
    console.log("uploading up and ready");
  };
  const fileSelectedHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("sam is handling files");
    const files = e.target.files;
    if (files?.length) {
      setFileName(files[0].name);
      console.log("just set file name");
      setSelectedFile(files[0]);
      setToUpload(true);
    }
  };
  const fileUploadHandler = async () => {
    console.log("file uploading in progress");
    let dataform: FormData = new FormData();
    dataform.append("file", selectedFile);
    const questions = await generateQuestions(dataform, fileName);
    setQuestion(questions);
  };

  const uploadRender = () => {
    if (!toUpload) {
      return (
        <label className="startBtn rounded-pill">
          <input
            type="file"
            onChange={fileSelectedHandler}
            accept="application/pdf"
          />
          Upload Notes to Begin!
        </label>
      );
    } else {
      return (
        <button className="startBtn rounded-pill" onClick={fileUploadHandler}>
          {" "}
          Upload {fileName}
        </button>
      );
    }
  };
  const decideShow = () => {
    if (questions.length>0) return <Quiz questions={questions} />;
    else
      return (
        <div className="App">
          <div className="mainWrapper">
            <div className="content_main">
              <p className="headerheading">Welcome To Quiz </p>
              {uploadRender()}
            </div>
          </div>
        </div>
      );
  };

  useEffect(() => {
    // Update the document title using the browser API
    console.log(questions);
  });

  return <div>{decideShow()}</div>;
}

export default App;
