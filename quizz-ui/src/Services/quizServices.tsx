import { RawQuestions, FilteredQuestions } from '../Types/quizQuestionTYpes';
import axios from 'axios';
const shuffleArray = (array: any[]) =>
    [...array].sort(() => Math.random() - 0.5)
export const getQuestions = async (totalQuestions: number, level: string): Promise<FilteredQuestions[]> => {

    console.log("total Questions ", totalQuestions)
    const res = await fetch("https://opentdb.com/api.php?amount=5&category=10&difficulty=easy&type=multiple")
    let { results } = await res.json()
    const quizArray: FilteredQuestions[] = results.map((x: RawQuestions) => {
        return {
            question: x.question,
            options: shuffleArray(x.incorrect_answers.concat(x.correct_answer)),
            correct_answer: x.correct_answer
        }
    })
    console.log(quizArray)
    return quizArray
}


export const generateQuestions = async (form : FormData , fileName : String) :  Promise<any> => {
    console.log("generating questions")
    try{
        const response =  await axios.post('http://localhost:5000/read-pdf', form);
        
        const data :any =response.data
        const quizArray : FilteredQuestions[] = data.map( (x : any) => {
            return{
                question  : x.question,
                correct_answer : x.answer,
                options: shuffleArray(x.distractors.concat(x.answer))
            }
        })
        
        return quizArray
    } catch(e){
        console.error(e);
    }

}