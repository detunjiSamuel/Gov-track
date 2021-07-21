const express = require('express');
const readPDF = require('../../utils').readPDF;

const multer  = require('multer');
const axios = require("axios");
const upload = multer({});

const router = express.Router();

const getQuestions  =  async (ptext) =>{
	console.log("generating questions")
    try{
		console.log(ptext)
        const {data } =  await axios.post('http://localhost:5001', {text :ptext});
		return data
    } catch(e){
        console.error(e);
    }
}

router.post('/read-pdf', upload.any(), (req, res) => {
	
    (async function readPdfIIFE(req, res) {
		let buffer;
		let text;
		let allPDFinput = [];
		for (let i = 0; i < req.files.length; i++ ) {
			buffer = req.files[i].buffer;
			text = await readPDF(buffer);
			allPDFinput.push(text)
		}
		result = await getQuestions(text)
		console.log(result)
		res.status(200).json(result);
	})(req, res)
	
});

module.exports = router;