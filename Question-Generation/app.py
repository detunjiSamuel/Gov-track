


# Common imports
import pandas as pd
from IPython.display import Markdown, display, clear_output


import os
import gensim
from gensim.test.utils import datapath, get_tmpfile
from gensim.models import KeyedVectors

import spacy
from spacy import displacy
nlp = spacy.load('en_core_web_sm')



print("starting application")
# ### Pickling


import _pickle as cPickle
from pathlib import Path

from flask import request, url_for ,request, jsonify
from flask_api import FlaskAPI, status, exceptions

app = FlaskAPI(__name__)

def dumpPickle(fileName, content):
    pickleFile = open(fileName, 'wb')
    cPickle.dump(content, pickleFile, -1)
    pickleFile.close()

def loadPickle(fileName):    
    file = open(fileName, 'rb')
    content = cPickle.load(file)
    file.close()
    
    return content
    
def pickleExists(fileName):
    file = Path(fileName)
    
    if file.is_file():
        return True
    
    return False


# ## *Extract all words from plain text and generate it's features*



#Extract answers and the sentence they are in
def extractAnswers(qas, doc):
    answers = []

    senStart = 0
    senId = 0

    for sentence in doc.sents:
        senLen = len(sentence.text)

        for answer in qas:
            answerStart = answer['answers'][0]['answer_start']

            if (answerStart >= senStart and answerStart < (senStart + senLen)):
                answers.append({'sentenceId': senId, 'text': answer['answers'][0]['text']})

        senStart += senLen
        senId += 1
    
    return answers

#TODO - Clean answers from stopwords?
def tokenIsAnswer(token, sentenceId, answers):
    for i in range(len(answers)):
        if (answers[i]['sentenceId'] == sentenceId):
            if (answers[i]['text'] == token):
                return True
    return False

#Save named entities start points

def getNEStartIndexs(doc):
    neStarts = {}
    for ne in doc.ents:
        neStarts[ne.start] = ne
        
    return neStarts 

def getSentenceStartIndexes(doc):
    senStarts = []
    
    for sentence in doc.sents:
        senStarts.append(sentence[0].i)
    
    return senStarts
    
def getSentenceForWordPosition(wordPos, senStarts):
    for i in range(1, len(senStarts)):
        if (wordPos < senStarts[i]):
            return i - 1
        
def addWordsForParagrapgh(newWords, text):
    doc = nlp(text)

    neStarts = getNEStartIndexs(doc)
    senStarts = getSentenceStartIndexes(doc)
    
    #index of word in spacy doc text
    i = 0
    
    while (i < len(doc)):
        #If the token is a start of a Named Entity, add it and push to index to end of the NE
        if (i in neStarts):
            word = neStarts[i]
            #add word
            currentSentence = getSentenceForWordPosition(word.start, senStarts)
            wordLen = word.end - word.start
            shape = ''
            for wordIndex in range(word.start, word.end):
                shape += (' ' + doc[wordIndex].shape_)

            newWords.append([word.text,
                            0,
                            0,
                            currentSentence,
                            wordLen,
                            word.label_,
                            None,
                            None,
                            None,
                            shape])
            i = neStarts[i].end - 1
        #If not a NE, add the word if it's not a stopword or a non-alpha (not regular letters)
        else:
            if (doc[i].is_stop == False and doc[i].is_alpha == True):
                word = doc[i]

                currentSentence = getSentenceForWordPosition(i, senStarts)
                wordLen = 1

                newWords.append([word.text,
                                0,
                                0,
                                currentSentence,
                                wordLen,
                                None,
                                word.pos_,
                                word.tag_,
                                word.dep_,
                                word.shape_])
        i += 1

def oneHotEncodeColumns(df):
    columnsToEncode = ['NER', 'POS', "TAG", 'DEP']

    for column in columnsToEncode:
        one_hot = pd.get_dummies(df[column])
        one_hot = one_hot.add_prefix(column + '_')

        df = df.drop(column, axis = 1)
        df = df.join(one_hot)
    
    return df


# ## *Predict whether a word is a keyword* 


def generateDf(text):
    words = []
    addWordsForParagrapgh(words, text)

    wordColums = ['text', 'titleId', 'paragrapghId', 'sentenceId','wordCount', 'NER', 'POS', 'TAG', 'DEP','shape']
    df = pd.DataFrame(words, columns=wordColums)
    
    return df



def prepareDf(df):
    #One-hot encoding
    wordsDf = oneHotEncodeColumns(df)


    #Add missing colums 
    predictorFeaturesName = 'data/pickles/nb-predictor-features.pkl'
    featureNames = loadPickle(predictorFeaturesName)

    for feature in featureNames:
        if feature not in wordsDf.columns:
            wordsDf[feature] = 0    
                
    #Drop unused columns
    columnsToDrop = ['text', 'titleId', 'paragrapghId', 'sentenceId', 'shape', 'isAnswer']
    wordsDf = wordsDf.drop(columnsToDrop, axis = 1)


    return wordsDf



def predictWords(wordsDf, df):
    print("here is the error")
    predictorPickleName = 'data/pickles/nb-predictor.pkl'
    predictor = loadPickle(predictorPickleName)
    
    y_pred = predictor.predict_proba(wordsDf)

    labeledAnswers = []
    for i in range(len(y_pred)):
        labeledAnswers.append({'word': df.iloc[i]['text'], 'prob': y_pred[i][0]})
    
    return labeledAnswers


# ## *Extract questions*


def blankAnswer(firstTokenIndex, lastTokenIndex, sentStart, sentEnd, doc):
    leftPartStart = doc[sentStart].idx
    leftPartEnd = doc[firstTokenIndex].idx
    rightPartStart = doc[lastTokenIndex].idx + len(doc[lastTokenIndex])
    rightPartEnd = doc[sentEnd - 1].idx + len(doc[sentEnd - 1])
    
    question = doc.text[leftPartStart:leftPartEnd] + '_____' + doc.text[rightPartStart:rightPartEnd]
    
    return question



def addQuestions(answers, text):
    doc = nlp(text)
    currAnswerIndex = 0
    qaPair = []

    #Check wheter each token is the next answer
    for sent in doc.sents:
        for token in sent:
            
            #If all the answers have been found, stop looking
            if currAnswerIndex >= len(answers):
                break
            
            #In the case where the answer is consisted of more than one token, check the following tokens as well.
            answerDoc = nlp(answers[currAnswerIndex]['word'])
            answerIsFound = True
            
            for j in range(len(answerDoc)):
                if token.i + j >= len(doc) or doc[token.i + j].text != answerDoc[j].text:
                    answerIsFound = False
           
            #If the current token is corresponding with the answer, add it 
            if answerIsFound:
                question = blankAnswer(token.i, token.i + len(answerDoc) - 1, sent.start, sent.end, doc)
                
                qaPair.append({'question' : question, 'answer': answers[currAnswerIndex]['word'], 'prob': answers[currAnswerIndex]['prob']})
                
                currAnswerIndex += 1
                
    return qaPair



def sortAnswers(qaPairs):
    orderedQaPairs = sorted(qaPairs, key=lambda qaPair: qaPair['prob'])
    
    return orderedQaPairs    


# ## *Distractors*


print("distractors  is setting up")
glove_file = 'data/embeddings/glove.6B.300d.txt'
tmp_file = 'data/embeddings/word2vec-glove.6B.300d.txt'
model = None

if os.path.isfile(glove_file):

    # from gensim.scripts.glove2word2vec import glove2word2vec
    # glove2word2vec(glove_file, tmp_file)
    print("vector representation is processing")
    model = KeyedVectors.load_word2vec_format(tmp_file)
    print( "vector represention complete")
else:
    print("Glove embeddings not found. Please download and place them in the following path: " + glove_file)



def generate_distractors(answer, count):
    answer = str.lower(answer)
    
    ##Extracting closest words for the answer. 
    try:
        closestWords = model.most_similar(positive=[answer], topn=count)
    except:
        #In case the word is not in the vocabulary, or other problem not loading embeddings
        return []

    #Return count many distractors
    distractors = list(map(lambda x: x[0], closestWords))[0:count]
    
    return distractors



def addDistractors(qaPairs, count):
    if not model:
        print("Glove embeddings not found. Please download and place them in the following path: " + glove_file)
    
    for qaPair in qaPairs:
        distractors = generate_distractors(qaPair['answer'], count)
        qaPair['distractors'] = distractors
    
    return qaPairs

def generateQuestions(text, count):
    
    # Extract words 
    df = generateDf(text)
    wordsDf = prepareDf(df)
    
    # Predict 
    labeledAnswers = predictWords(wordsDf, df)
    
    # Transform questions
    qaPairs = addQuestions(labeledAnswers, text)
    
    # Pick the best questions
    orderedQaPairs = sortAnswers(qaPairs)
    
    # Generate distractors
    questions = addDistractors(orderedQaPairs[:count], 3)

    result = []

    # Print
    for i in range(count):
        holder =  dict()
        # holder[i+1] = [questions[i] , questions[i]['answer'] , ]
        holder['question'] = questions[i]['question']
        holder['answer'] = questions[i]['answer']
        holder['distractors'] = [distractor for distractor in questions[i]['distractors'] ]
        result.append(holder)
    return result



test = "Naruto was serialized in Shueisha's magazine, Weekly Shōnen Jump from 1999 to 2014, and released in tankōbon (book) form in 72 volumes. The manga was adapted into an anime television series produced by Pierrot and Aniplex, which broadcast 220 episodes in Japan from 2002 to 2007; the English dub of the series aired on Cartoon Network and YTV from 2005 to 2009. Naruto: Shippuden, a sequel to the original series, premiered in Japan in 2007, and ended in 2017, after 500 episodes. The English dub was broadcast on Disney XD from 2009 to 2011, airing the first 98 episodes, and then switched over to Adult Swim's Toonami programming block in January 2014, starting over from the first episode. The English dub is still airing weekly on Adult Swim to this day. Besides the anime series, Pierrot has developed eleven movies and twelve original video animations (OVAs). Other Naruto-related merchandise includes light novels, video games, and trading cards developed by several companies."

#generateQuestions(naruto, 4)



@app.route("/", methods=['POST'])
def return_questions():
    """
    Sends question , answer & distrators
    """
    if request.method == 'POST':

        if not request.is_json:
            return "<p>The content isn't of type JSON<\p>"
        
        content = request.get_json()
        text = content.get('text')

        #Too short
        if len(text) < 300:
            return jsonify({"Error" : "too short"})  , 200
        #text = str(request.data.get('text', ''))

        return generateQuestions(text , 10), status.HTTP_201_CREATED





if __name__ == "__main__":
    print("main process active")
    app.run(debug=True, threaded=True, port=5001)
