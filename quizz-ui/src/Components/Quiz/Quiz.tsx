import React, { useEffect, useState } from 'react';
import './Quiz.css';
import { FilteredQuestions } from '../../Types/quizQuestionTYpes'
import { getQuestions } from '../../Services/quizServices'
import { QuestionCard } from "../QuestionCard/questionCard"
import { ResultCard } from "../ResultCard/index"
import firebase from "../../firebase"
import Swal from 'sweetalert2'
import axios from "axios"


function Quiz ( props: {questions: FilteredQuestions[]} ) {
  const {  questions  } = props
  let [iteration, setIterations] = useState(0)
  let [allQuestions, setAllQuestions] = useState<FilteredQuestions[]>(questions)
  const totalQuestions: number = questions.length;
  let [score, setScore] = useState<number>(0)
  let [showResult, setShowResult] = useState<Boolean>(false)
  const [startQuiz, setStartQuiz] = useState<Boolean>(false)

  
/*   for (let i in questions) {
    console.log(`${i}: ${questions[i]} ` )
  } */
 
  console.log("here agiain")
  console.log(questions)
  const fetchindData = async () => {
    setAllQuestions(questions)
  }
  useEffect(() => {
    console.log("permision asked")
    askForPermissioToReceiveNotifications()
  }, [])
  const askForPermissioToReceiveNotifications = async () => {
    try {
      const messaging = firebase.messaging();
      await messaging.requestPermission();
      const token = await messaging.getToken();
      console.log("Token===>", token);

      return token;
    } catch (error) {
      console.error(error);
    }
  }
  let body = {
    notification: {
      title: "Quiz Quiz  ",
      body: "Wanna Start Quiz",
      icon: "http://url-to-an-icon/icon.png",
    },
    to:
      "fXkL4tYeslJhuGBFDwx7ZQ:APA91bEOksMRSsdXXNUwCQc4ZU48yzjP_367yZYEVYFGQVeGUecE6TCaliW4YgLxi_YdExSqaOWrGPIXnMQho_uWbbUZqL7ASNLfX3JeuW8MlJWrWA_r6_bhyhzhY0_hDJen1Zgyvgrz",
  };
  const checkNoti = () => {
    axios({
      method: 'post',
      url: 'https://fcm.googleapis.com/fcm/send',
      data: body,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "key=" + "AAAABs5B4KY:APA91bEUO52e84TWQy_F_Va_qN1RLiJPw9IYXRHJJT-gvCXbj7Hi6U2BaQ89aPg2q1Z-Cii-0JQbQ9U2KqLalNGHIBSLGfrfwFMind-18gxH-8Rsnvtorw7rw0dvgBXVoQf6uzhq256r"
      }
    }).then((res) => {
      console.log(res)
    }).catch((e) => {
      console.log(e)
    })
  };
  useEffect(() => {
    fetchindData()
    
  }, [])
  useEffect(() => {
    console.log("hello")
    checkNoti()
    return () => {
      checkNoti()
    }
  }, [])
  const nextQuestion = (userAnswer: string) => {
    console.log("user Input", userAnswer)
    // changeIndex()

    if (userAnswer === "") {
      return (Swal.fire({
        icon: 'warning',
        text: 'Please Select Any of Above Options',
      }))
    }
    const correctAnswer = allQuestions[iteration].correct_answer;
    if (userAnswer === correctAnswer) {
      setScore(++score)
      setIterations(++iteration)
    }
    if (userAnswer !== correctAnswer) {
      setIterations(++iteration)
    }
    if (iteration === allQuestions.length) {
      setShowResult(true)
    }


  }
{{ /* 

   if (!allQuestions.length) {
    return (<div className="center text-center" >
      <h3 className=" text-center">Loading.. </h3>
    </div>)
  }

*/}} 
  if (showResult) {
    return <ResultCard score={score} totalQuestion={totalQuestions} />
  }
  if (startQuiz) {
    return <QuestionCard
      question={allQuestions[iteration].question
      }
      options={allQuestions[iteration].options}
      current_Score={score}
      callBack={nextQuestion}
      currentIteration={iteration}

    />
  }
  const startTheQuiz = () => {
    setStartQuiz(true)
  }




  return (

    <div className="App">
      <div className="mainWrapper">
        <div className="content_main">
          <p className="headerheading">Welcome To Quiz </p>
          <button className="startBtn rounded-pill" onClick={startTheQuiz}> StartQuiz</button>
        </div>
      </div >
    </div >

  )
}

export default Quiz;
