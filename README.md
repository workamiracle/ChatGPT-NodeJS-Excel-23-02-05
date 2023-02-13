# ChatGPT with Excel sheet
Read prompts from Excel sheet and save the answer from the OpenAI into the sheet.

## Features 
* Node.js for Backend
* React for Frontend
* Exceljs for handling Excel sheets
* Concurrently for run server and client at one command

## Requirements 
* Node JS
* OpenAI API Key
* IDE: Visual Studio Code

## Setup
1. Install global dependencies
``` 
npm install 
```
2. Install client dependencies
``` 
cd client 
npm install 
```
3. Install server dependencies
```
cd server 
npm install 
``` 
4. Replace [your_openai_key] in 'server/.env' file with your OpenAI API key.

## Usage
1. Start the server and client
```
npm run dev
```
2. Start the client alone
``` 
cd client 
npm start 
```
3. Start the server alone
```
cd server
node index.js
```

## Server API
1. Run Task
```
Route: '/run/task
```
2. Run Project
```
Route: '/run/project
```


