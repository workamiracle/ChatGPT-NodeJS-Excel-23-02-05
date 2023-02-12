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




router.post('/task', (req, res) => {
  try {
    const {doc, sheet, type} = req.body;

    let workbook = new Excel.Workbook();

    workbook.xlsx.readFile(doc).then(async () => {
      let worksheet = workbook.getWorksheet(sheet);

      let roles = {};
      for (let i = 2; i < 21; i ++) {
        if(worksheet.getCell('A' + i).value) {
          roles[worksheet.getCell('A' + i).value] = worksheet.getCell('B' + i).value;
        }
      }

      if(type === 'Build') {
        let colCount = worksheet.columnCount;
        let row1 = worksheet.getRow(21);
        
        for(let i = 22; i <= worksheet.rowCount; i ++) {
          let row = worksheet.getRow(i);
          
          for (let j = 3; j <= colCount; j ++) {
            let prompt = row1.getCell(j).value;
            prompt = replaceCells(worksheet, row, roles, prompt);

            let response = {
              status: 0,
              data: {
                error: null
              }
            };
          
            while(response.data.error || response.status !== 200) {
              console.log('sending prompt...............');
              console.log(prompt + '\n');

              try {
                response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt,
                  temperature: 0,
                  max_tokens: 3000,
                  top_p: 1,
                  frequency_penalty: 0.5,
                  presence_penalty: 0,
                });
              } catch (err) {
                //workbook.xlsx.writeFile(doc);
                console.log('Server Error');
                continue;
                //return res.status(500).json({error: 'Server Error'});
              }
            }
            console.log('result-----------------------------------------');
            console.log(response.data.choices[0].text.trim() + '\n');

            row.getCell(j).value = response.data.choices[0].text.trim();          
          }
          row.getCell(1).value = row.getCell(row.cellCount).value;
        }
      } 

      else if(type === 'Fixed') {
        let colCount = worksheet.columnCount;
        let row1 = worksheet.getRow(21);
        
        for(let i = 22; i <= worksheet.rowCount; i ++) {
          let row = worksheet.getRow(i);
          
          for (let j = 3; j <= colCount; j ++) {
            let prompt = row1.getCell(j).value;
            prompt = replaceCells(worksheet, row, roles, prompt);

            let response = {
              status: 0
            };
          
            while(response.status !== 200) {
              console.log('sending prompt...............');
              console.log(prompt);

              try {
                response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt,
                  temperature: 0,
                  max_tokens: 256,
                  top_p: 1,
                  frequency_penalty: 0.5,
                  presence_penalty: 0,
                });
              } catch (error) {
                //workbook.xlsx.writeFile(doc);

                console.log('Server Error');
                continue;
                ///return res.status(500).json({error: 'Server Error'});
              }
            }
            console.log('done');
            console.log(response.data.choices[0].text.trim());

            row.getCell(j).value = response.data.choices[0].text.trim();          
          }
        }
      } 
      else if(type === 'If, Then') {
        let colCount = worksheet.columnCount;
        let row1 = worksheet.getRow(21);
        
        for(let i = 22; i <= worksheet.rowCount; i ++) {
          let row = worksheet.getRow(i);

          let prompt = row1.getCell(3).value;
          prompt = replaceCells(worksheet, row, roles, prompt);

          let response = {
            status: 0
          };
          
          while(response.status !== 200) {
            console.log('sending prompt...............');
            console.log(prompt);

            try{
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            } catch (error) {
              //workbook.xlsx.writeFile(doc);

              console.log('Server Error');
              continue;
              //return res.status(500).json({error: 'Server Error'});
            }
          }
          console.log('done');
          console.log(response.data.choices[0].text.trim());

          let score = getScore(response.data.choices[0].text.trim());
          row.getCell(3).value = score;

          if(score < 3) prompt = row1.getCell(4).value;
          else if(score < 8) prompt = row1.getCell(5).value;
          else prompt = row1.getCell(6).value;

          prompt = replaceCells(worksheet, row, roles, prompt);

          response = {
            status: 0
          };

          console.log(prompt);
          
          while(response.status !== 200) {
            console.log('sending prompt...............');

            try{
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            } catch (error) {
              //workbook.xlsx.writeFile(doc);

              console.log('Server Error');
              continue;
              //return res.status(500).json({error: 'Server Error'});
            }
          }
          console.log('done');
          console.log(response.data.choices[0].text.trim());

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

            try{
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            } catch (error) {
              //workbook.xlsx.writeFile(doc);

              console.log('Server Error');
              continue;
              //return res.status(500).json({error: 'Server Error'});
            }
          }
          console.log('done');
          console.log(response.data.choices[0].text.trim());

          score = getScore(response.data.choices[0].text.trim());
          row.getCell(7).value = score;
          prompt = score < 8 ? row1.getCell(8).value : row1.getCell(9).value;
          prompt = prompt.replace('{G}', '{' + res1 + '}');
          response = {
            status: 0
          };

          console.log(prompt);
          
          while(response.status !== 200) {
            console.log('sending prompt...............');

            try {
              response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
              });
            } catch (error) {
              //workbook.xlsx.writeFile(doc);

              console.log('Server Error');
              continue;
              //return res.status(500).json({error: 'Server Error'});
            }
          }
          console.log('done');
          console.log(response.data.choices[0].text.trim());

          if(score < 8) row.getCell(8).value = response.data.choices[0].text.trim();
          else row.getCell(9).value = response.data.choices[0].text.trim();

          row.getCell(1).value = response.data.choices[0].text.trim();
        }
      } 
      workbook.xlsx.writeFile(doc);
      
      return res.status(200).json({res: 'Finished'});
    });
  } catch(err) {
    console.error(err.message);
    res.status(500).send({error: 'Server Error'});
  }
})




router.post('/project', (req, res) => {
  try {
    const {doc, tasks} = req.body;

    let workbook = new Excel.Workbook();

    workbook.xlsx.readFile(doc).then(async () => {
      for( let j = 0; j < tasks.length; j ++) {
        let {sheet, type} = tasks[j];
        let worksheet = workbook.getWorksheet(sheet);

        let roles = {};
        for (let i = 2; i < 21; i ++) {
          if(worksheet.getCell('A' + i).value) {
            roles[worksheet.getCell('A' + i).value] = worksheet.getCell('B' + i).value;
          }
        }

        if(type === 'Build') {
          let colCount = worksheet.columnCount;
          let row1 = worksheet.getRow(21);
          
          for(let i = 22; i <= worksheet.rowCount; i ++) {
            let row = worksheet.getRow(i);
            
            for (let j = 3; j <= colCount; j ++) {
              let prompt = row1.getCell(j).value;
              prompt = replaceCells(worksheet, row, roles, prompt);              
    
              let response = {
                status: 0,
                data: {
                  error: null
                }
              };
            
              while(response.data.error || response.status !== 200) {
                console.log('sending prompt...............');
                console.log(prompt);

                try {
                  response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt,
                    temperature: 0.7,
                    max_tokens: 256,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                  });
                } catch (error) {
                  //workbook.xlsx.writeFile(doc);
                  console.log(error);
                  continue;
                  //return res.status(500).json({error: 'Server Error'});
                }
              }
              console.log('done');
              console.log(response.data.choices[0].text.trim());
    
              row.getCell(j).value = response.data.choices[0].text.trim();          
            }
            row.getCell(1).value = row.getCell(row.cellCount).value;
          }
        } 
    
        else if(type === 'Fixed') {
          let colCount = worksheet.columnCount;
          let row1 = worksheet.getRow(21);
          
          for(let i = 22; i <= worksheet.rowCount; i ++) {
            let row = worksheet.getRow(i);
            
            for (let j = 3; j <= colCount; j ++) {
              let prompt = row1.getCell(j).value;
              prompt = replaceCells(worksheet, row, roles, prompt);
    
              let response = {
                status: 0
              };
            
              while(response.status !== 200) {
                console.log('sending prompt...............');
                console.log(prompt);
                
                try {
                  response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt,
                    temperature: 0,
                    max_tokens: 256,
                    top_p: 1,
                    frequency_penalty: 0.5,
                    presence_penalty: 0,
                  });
                } catch (error) {
                  //workbook.xlsx.writeFile(doc);

                  console.log(error);
                  continue;
                  //return res.status(500).json({error: 'Server Error'});
                }
              }
              console.log('done');
              console.log(response.data.choices[0].text.trim());
    
              row.getCell(j).value = response.data.choices[0].text.trim();          
            }
          }
        } 
        else if(type === 'If, Then') {
          let colCount = worksheet.columnCount;
          let row1 = worksheet.getRow(21);
          
          for(let i = 22; i <= worksheet.rowCount; i ++) {
            let row = worksheet.getRow(i);
    
            let prompt = row1.getCell(3).value;
            prompt = replaceCells(worksheet, row, roles, prompt);
    
            let response = {
              status: 0
            };
            
            while(response.status !== 200) {
              console.log('sending prompt...............');
              console.log(prompt);
              
              try {
                response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt,
                  temperature: 0,
                  max_tokens: 256,
                  top_p: 1,
                  frequency_penalty: 0.5,
                  presence_penalty: 0,
                });
              } catch (error) {
                //workbook.xlsx.writeFile(doc);
                console.log(error);
                continue;

                //return res.status(500).json({error: 'Server Error'});
              }
            }
            console.log('done');
    
            let score = getScore(response.data.choices[0].text.trim());
            row.getCell(3).value = score;
    
            if(score < 3) prompt = row1.getCell(4).value;
            else if(score < 8) prompt = row1.getCell(5).value;
            else prompt = row1.getCell(6).value;
    
            prompt = replaceCells(worksheet, row, roles, prompt);
            response = {
              status: 0
            };
    
            console.log(prompt);
            
            while(response.status !== 200) {
              console.log('sending prompt...............');
              
              try {
                response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt,
                  temperature: 0,
                  max_tokens: 256,
                  top_p: 1,
                  frequency_penalty: 0.5,
                  presence_penalty: 0,
                });
              } catch (error) {
                //workbook.xlsx.writeFile(doc);
                console.log(error);
                continue;

                //return res.status(500).json({error: 'Server Error'});
              }
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
              
              try {
                response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt,
                  temperature: 0,
                  max_tokens: 256,
                  top_p: 1,
                  frequency_penalty: 0.5,
                  presence_penalty: 0,
                });
              } catch (error) {
                //workbook.xlsx.writeFile(doc);
                console.log(error);
                continue;

                //return res.status(500).json({error: 'Server Error'});
              }
            }
            console.log('done');
    
            score = getScore(response.data.choices[0].text.trim());
            row.getCell(7).value = score;
            prompt = score < 8 ? row1.getCell(8).value : row1.getCell(9).value;
            prompt = replaceCells(worksheet, row, roles, prompt);
            response = {
              status: 0
            };
    
            console.log(prompt);
            
            while(response.status !== 200) {
              console.log('sending prompt...............');
              
              try {
                response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt,
                  temperature: 0,
                  max_tokens: 256,
                  top_p: 1,
                  frequency_penalty: 0.5,
                  presence_penalty: 0,
                });
              } catch (error) {
                //workbook.xlsx.writeFile(doc);
                console.log(error);
                continue;

                //return res.status(500).json({error: 'Server Error'});
              }
            }
            console.log('done');
            console.log(response.data.choices[0].text.trim());
    
            if(score < 8) row.getCell(8).value = response.data.choices[0].text.trim();
            else row.getCell(9).value = response.data.choices[0].text.trim();

            row.getCell(1).value = response.data.choices[0].text.trim();
          }
        } 
      };

      workbook.xlsx.writeFile(doc);

      return res.status(200).json({res: 'Finished'});
    });
  } catch(err) {
    console.log(err.message);

    res.status(500).send({error: 'Server Error'});
  }
})



const replaceCells = (sheet, row, roles, prompt) => {
  let index;

  //  {B}
  while(index = prompt.match(/{[A-Z]}/)) {   
    index = index[0];
    prompt = prompt.replace(index, row.getCell(index.slice(1, -1)).value);
  }

  //  {B22}
  while(index = prompt.match(/{[A-Z][0-9]+}/)) {
    index = index[0];
    prompt = prompt.replace(index, sheet.getCell(index.slice(1, -1)).value);
  }

  //  {Role}
  while(index = prompt.match(/{[A-z]+}/)) {
    index = index[0];
    prompt = prompt.replace(index, roles[index.slice(1, -1)]);
  }

  return prompt;
}




const getScore = (answer) => {
  let first = answer.search(/[1-9]/);

  if(answer[first] === '1' && answer[first+1] === '0') return 10;
  else return +answer[first];
}

module.exports = router;