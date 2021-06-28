
export type RawQuestions = {
    category: string
    correct_answer: string
    difficulty: string
    incorrect_answers: string[]
    question: string
    type: string

}


export type FilteredQuestions = {
    question: string
    correct_answer: string
    options: string[]
}
export type propsQuestion = {
    question: string
    options: string[]
    current_Score: number
    callBack: (correct_answer: string) => void;
    currentIteration: number
}
export type resultScore = {
    score: number
    totalQuestion: number
}