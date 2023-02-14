const express = require('express');
const router = express.Router();

const Excel = require('exceljs');

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);



router.post('/', async (req, res) => {
  const { message } = req.body;
  const response = await openai.createCompletion({
    model: "text-chat-davinci-002-20230126",
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
          let lastAnswer = '';
          
          for (let j = 3; j <= colCount; j ++) {
            let prompt = row1.getCell(j).value;
            
            if(prompt !== null && row.getCell('B').value !== null) {
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

              lastAnswer = response.data.choices[0].text.trim();
              row.getCell(j).value = lastAnswer;        
            }
          }
          row.getCell(1).value = lastAnswer;
        }
      } else if(type === 'Fixed') {
        let colCount = worksheet.columnCount;
        let row1 = worksheet.getRow(21);
        
        for(let i = 22; i <= worksheet.rowCount; i ++) {
          let row = worksheet.getRow(i);
          
          for (let j = 3; j <= colCount; j ++) {
            let prompt = row1.getCell(j).value;
            
            if(prompt !== null && row.getCell('B').value !== null) {
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
      } else if(type === 'If, Then') {
        let colCount = worksheet.columnCount;
        let row0 = worksheet.getRow(20);
        let row1 = worksheet.getRow(21);
        
        for(let i = 22; i <= worksheet.rowCount; i ++) {
          let row = worksheet.getRow(i);
          let lastAnswer = row.getCell('B').value;
          let score = -1;

          for(let j = 3; j <= colCount; j ++) {
            let question = row0.getCell(j).value;

            if(question !== null && lastAnswer !== null) {
              if(question === 'Question') {
                let prompt = row1.getCell(j).value;
  
                prompt = replaceCells(worksheet, row, roles, prompt);
                prompt = prompt + '{' + lastAnswer + '}';
  
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
      
                    console.log('Server Error');
                    continue;
                  }
                }
                console.log('done');
                console.log(response.data.choices[0].text.trim());
  
                score = getScore(response.data.choices[0].text.trim());
                row.getCell(j).value = score;
              } else if(question.match('<=')) {
                let cret = +question[question.search(/[1-9]/)];
  
                if(score <= cret) {
                  let prompt = row1.getCell(j).value;
                  prompt = replaceCells(worksheet, row, roles, prompt);
                  prompt = prompt + '{' + lastAnswer + '}';
  
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
        
                      console.log('Server Error');
                      continue;
                    }
                  }
                  console.log('done');
                  console.log(response.data.choices[0].text.trim());
  
                  lastAnswer = response.data.choices[0].text.trim();
                  row.getCell(j).value = lastAnswer;
                }
              } else if(question.match('>')) {
                let cret = +question[question.search(/[1-9]/)];
  
                if(score > cret) {
                  let prompt = row1.getCell(j).value;
                  prompt = replaceCells(worksheet, row, roles, prompt);
                  prompt = prompt + '{' + lastAnswer + '}';
  
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
        
                      console.log('Server Error');
                      continue;
                    }
                  }
                  console.log('done');
                  console.log(response.data.choices[0].text.trim());
  
                  lastAnswer = response.data.choices[0].text.trim();
                  row.getCell(j).value = lastAnswer;
                }
              }
            }
          }
          
          row.getCell('A').value = lastAnswer;
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
            let lastAnswer = '';
            
            for (let j = 3; j <= colCount; j ++) {
              let prompt = row1.getCell(j).value;
              
              if(prompt !== null && row.getCell('B').value !== null) {
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
  
                lastAnswer = response.data.choices[0].text.trim();
                row.getCell(j).value = lastAnswer;        
              }
            }
            row.getCell(1).value = lastAnswer;
          }
        } else if(type === 'Fixed') {
          let colCount = worksheet.columnCount;
          let row1 = worksheet.getRow(21);
          
          for(let i = 22; i <= worksheet.rowCount; i ++) {
            let row = worksheet.getRow(i);
            
            for (let j = 3; j <= colCount; j ++) {
              let prompt = row1.getCell(j).value;
              
              if(prompt !== null && row.getCell('B').value !== null) {
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
        } else if(type === 'If, Then') {
          let colCount = worksheet.columnCount;
          let row0 = worksheet.getRow(20);
          let row1 = worksheet.getRow(21);
          
          for(let i = 22; i <= worksheet.rowCount; i ++) {
            let row = worksheet.getRow(i);
            let lastAnswer = row.getCell('B').value;
            let score = -1;
  
            for(let j = 3; j <= colCount; j ++) {
              let question = row0.getCell(j).value;
  
              if(question !== null && lastAnswer !== null) {
                if(question === 'Question') {
                  let prompt = row1.getCell(j).value;
    
                  prompt = replaceCells(worksheet, row, roles, prompt);
                  prompt = prompt + '{' + lastAnswer + '}';
    
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
        
                      console.log('Server Error');
                      continue;
                    }
                  }
                  console.log('done');
                  console.log(response.data.choices[0].text.trim());
    
                  score = getScore(response.data.choices[0].text.trim());
                  row.getCell(j).value = score;
                } else if(question.match('<=')) {
                  let cret = +question[question.search(/[1-9]/)];
    
                  if(score <= cret) {
                    let prompt = row1.getCell(j).value;
                    prompt = replaceCells(worksheet, row, roles, prompt);
                    prompt = prompt + '{' + lastAnswer + '}';
    
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
          
                        console.log('Server Error');
                        continue;
                      }
                    }
                    console.log('done');
                    console.log(response.data.choices[0].text.trim());
    
                    lastAnswer = response.data.choices[0].text.trim();
                    row.getCell(j).value = lastAnswer;
                  }
                } else if(question.match('>')) {
                  let cret = +question[question.search(/[1-9]/)];
    
                  if(score > cret) {
                    let prompt = row1.getCell(j).value;
                    prompt = replaceCells(worksheet, row, roles, prompt);
                    prompt = prompt + '{' + lastAnswer + '}';
    
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
          
                        console.log('Server Error');
                        continue;
                      }
                    }
                    console.log('done');
                    console.log(response.data.choices[0].text.trim());
    
                    lastAnswer = response.data.choices[0].text.trim();
                    row.getCell(j).value = lastAnswer;
                  }
                }
              }
            }
            
            row.getCell('A').value = lastAnswer;
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