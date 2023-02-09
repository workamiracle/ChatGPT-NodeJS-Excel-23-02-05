const express = require('express');
const router = express.Router();

const Excel = require('exceljs');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/', async (req, res) => {
  const { message } = req.body;
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: message,
    max_tokens: 3000,
    temperature: 0.3,
  });
  res.json({ botResponse: response.data.choices[0].text });
});

router.post('/task', async (req, res) => {
  try {
    const {doc, sheet, type} = req.body;

    let workbook = new Excel.Workbook();

    workbook.xlsx.readFile(doc).then(async () => {
      let worksheet = workbook.getWorksheet(sheet);

      if(type === 'Build') {
        let colCount = worksheet.columnCount;
        let row1 = worksheet.getRow(1);
        
        for(let i = 2; i <= worksheet.rowCount; i ++) {
          let row = worksheet.getRow(i);
          
          for (let j = 3; j <= colCount; j ++) {
            let prompt = row1.getCell(j).value + '{' + row.getCell(j -1).value + '}'; 
            console.log(prompt);

            let response = {
              status: 0,
              data: {
                error: null
              }
            };
          
            while(response.data.error || response.status !== 200) {
              console.log('sending prompt...............');
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
              });
            }
            console.log('done');
            console.log(response.data.choices[0].text.trim());

            row.getCell(j).value = response.data.choices[0].text.trim();          
          }
          row.getCell(1).value = row.getCell(row.cellCount).value;
        }
      } 

      else if(type === 'Fixed') {
        let role = worksheet.getRow(2).getCell(2).value;
        let situation = worksheet.getRow(3).getCell(2).value;
        let colCount = worksheet.columnCount;
        let row1 = worksheet.getRow(7);
        
        for(let i = 8; i <= worksheet.rowCount; i ++) {
          let row = worksheet.getRow(i);
          
          for (let j = 3; j <= colCount; j ++) {
            let prompt = row1.getCell(j).value.replace('{Role}', role);
            prompt = prompt.replace('{Situation}', situation);
            prompt = prompt + '{' + row.getCell(2).value + '}'; 
            console.log(prompt);

            let response = {
              status: 0
            };
          
            while(response.status !== 200) {
              console.log('sending prompt...............');
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            }
            console.log('done');
            console.log(response.data.choices[0].text.trim());

            row.getCell(j).value = response.data.choices[0].text.trim();          
          }
        }
      } 
      else if(type === 'If, Then') {
        let colCount = worksheet.columnCount;
        let row1 = worksheet.getRow(2);
        
        for(let i = 3; i <= worksheet.rowCount; i ++) {
          let row = worksheet.getRow(i);

          let prompt = row1.getCell(3).value.replace('{B}', '{' + row.getCell(2).value + '}');
          console.log(prompt);

          let response = {
            status: 0
          };
          
          while(response.status !== 200) {
            console.log('sending prompt...............');
            response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt,
              temperature: 0,
              max_tokens: 256,
              top_p: 1,
              frequency_penalty: 0.5,
              presence_penalty: 0,
            });
          }
          console.log('done');

          let score = +response.data.choices[0].text.trim().slice(28, 30);
          row.getCell(3).value = score;

          if(score < 3) prompt = row1.getCell(4).value;
          else if(score < 8) prompt = row1.getCell(5).value;
          else prompt = row1.getCell(6).value;

          prompt = prompt.replace('{B}', '{' + row.getCell(2).value + '}');
          response = {
            status: 0
          };

          console.log(prompt);
          
          while(response.status !== 200) {
            console.log('sending prompt...............');
            response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt,
              temperature: 0,
              max_tokens: 256,
              top_p: 1,
              frequency_penalty: 0.5,
              presence_penalty: 0,
            });
          }
          console.log('done');

          prompt = response.data.choices[0].text.trim();
          console.log(prompt);
          let res1 = prompt;
          if(score < 3) row.getCell(4).value = res1;
          else if(score < 8) row.getCell(5).value = res1;
          else row.getCell(6).value = res1;

          prompt = row1.getCell(7).value + '{' + prompt + '}';
          response = {
            status: 0
          };
          
          while(response.status !== 200) {
            console.log('sending prompt...............');
            response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt,
              temperature: 0,
              max_tokens: 256,
              top_p: 1,
              frequency_penalty: 0.5,
              presence_penalty: 0,
            });
          }
          console.log('done');

          score = +response.data.choices[0].text.trim().slice(28, 30);
          row.getCell(7).value = score;
          prompt = score < 8 ? row1.getCell(8).value : row1.getCell(9).value;
          prompt = prompt.replace('{G}', '{' + res1 + '}');
          response = {
            status: 0
          };

          console.log(prompt);
          
          while(response.status !== 200) {
            console.log('sending prompt...............');
            response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt,
              temperature: 0,
              max_tokens: 256,
              top_p: 1,
              frequency_penalty: 0.5,
              presence_penalty: 0,
            });
          }
          console.log('done');
          console.log(response.data.choices[0].text.trim());

          if(score < 8) row.getCell(8).value = response.data.choices[0].text.trim();
          else row.getCell(9).value = response.data.choices[0].text.trim();
        }
      } 
      workbook.xlsx.writeFile(doc);
      
      res.status(200).json('Finished');
    });
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

router.post('/project', async (req, res) => {
  try {
    const {doc, tasks} = req.body;

    let workbook = new Excel.Workbook();
    workbook.xlsx.readFile(doc).then(async () => {
      tasks.forEach(async (task) => {
        let {sheet, type} = task;
        let worksheet = workbook.getWorksheet(sheet);

        if(type === 'Build') {
          let colCount = worksheet.columnCount;
          let row1 = worksheet.getRow(1);
          
          for(let i = 2; i <= worksheet.rowCount; i ++) {
            let row = worksheet.getRow(i);
            
            for (let j = 3; j <= colCount; j ++) {
              let prompt = row1.getCell(j).value + '{' + row.getCell(j -1).value + '}'; 
              console.log(prompt);
    
              let response = {
                status: 0,
                data: {
                  error: null
                }
              };
            
              while(response.data.error || response.status !== 200) {
                console.log('sending prompt...............');
                response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt,
                  temperature: 0.7,
                  max_tokens: 256,
                  top_p: 1,
                  frequency_penalty: 0,
                  presence_penalty: 0,
                });
              }
              console.log('done');
              console.log(response.data.choices[0].text.trim());
    
              row.getCell(j).value = response.data.choices[0].text.trim();          
            }
            row.getCell(1).value = row.getCell(row.cellCount).value;
          }
        } 
    
        else if(type === 'Fixed') {
          let role = worksheet.getRow(2).getCell(2).value;
          let situation = worksheet.getRow(3).getCell(2).value;
          let colCount = worksheet.columnCount;
          let row1 = worksheet.getRow(7);
          
          for(let i = 8; i <= worksheet.rowCount; i ++) {
            let row = worksheet.getRow(i);
            
            for (let j = 3; j <= colCount; j ++) {
              let prompt = row1.getCell(j).value.replace('{Role}', role);
              prompt = prompt.replace('{Situation}', situation);
              prompt = prompt + '{' + row.getCell(2).value + '}'; 
              console.log(prompt);
    
              let response = {
                status: 0
              };
            
              while(response.status !== 200) {
                console.log('sending prompt...............');
                response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt,
                  temperature: 0,
                  max_tokens: 256,
                  top_p: 1,
                  frequency_penalty: 0.5,
                  presence_penalty: 0,
                });
              }
              console.log('done');
              console.log(response.data.choices[0].text.trim());
    
              row.getCell(j).value = response.data.choices[0].text.trim();          
            }
          }
        } 
        else if(type === 'If, Then') {
          let colCount = worksheet.columnCount;
          let row1 = worksheet.getRow(2);
          
          for(let i = 3; i <= worksheet.rowCount; i ++) {
            let row = worksheet.getRow(i);
    
            let prompt = row1.getCell(3).value.replace('{B}', '{' + row.getCell(2).value + '}');
            console.log(prompt);
    
            let response = {
              status: 0
            };
            
            while(response.status !== 200) {
              console.log('sending prompt...............');
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            }
            console.log('done');
    
            let score = +response.data.choices[0].text.trim().slice(28, 30);
            row.getCell(3).value = score;
    
            if(score < 3) prompt = row1.getCell(4).value;
            else if(score < 8) prompt = row1.getCell(5).value;
            else prompt = row1.getCell(6).value;
    
            prompt = prompt.replace('{B}', '{' + row.getCell(2).value + '}');
            response = {
              status: 0
            };
    
            console.log(prompt);
            
            while(response.status !== 200) {
              console.log('sending prompt...............');
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            }
            console.log('done');
    
            prompt = response.data.choices[0].text.trim();
            console.log(prompt);
            let res1 = prompt;
            if(score < 3) row.getCell(4).value = res1;
            else if(score < 8) row.getCell(5).value = res1;
            else row.getCell(6).value = res1;
    
            prompt = row1.getCell(7).value + '{' + prompt + '}';
            response = {
              status: 0
            };
            
            while(response.status !== 200) {
              console.log('sending prompt...............');
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            }
            console.log('done');
    
            score = +response.data.choices[0].text.trim().slice(28, 30);
            row.getCell(7).value = score;
            prompt = score < 8 ? row1.getCell(8).value : row1.getCell(9).value;
            prompt = prompt.replace('{G}', '{' + res1 + '}');
            response = {
              status: 0
            };
    
            console.log(prompt);
            
            while(response.status !== 200) {
              console.log('sending prompt...............');
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            }
            console.log('done');
            console.log(response.data.choices[0].text.trim());
    
            if(score < 8) row.getCell(8).value = response.data.choices[0].text.trim();
            else row.getCell(9).value = response.data.choices[0].text.trim();
          }
        } 
      });

      workbook.xlsx.writeFile(doc);

      res.status(200).json('Finished');
    });
  } catch(err) {
    console.log(err.message);

    res.status(500).json('Server Error');
  }
})

module.exports = router;