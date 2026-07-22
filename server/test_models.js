import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(modelName) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Hello, what is 2+2?',
    });
    console.log(`✅ [${modelName}]: Success! Response: ${response.text.substring(0, 50).trim()}`);
  } catch (error) {
    console.error(`❌ [${modelName}]: Failed! Error: ${error.message || error}`);
  }
}

async function run() {
  console.log('Testing models with API Key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-pro');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.5-flash');
  
  // Also checking standard names in case
  await testModel('gemini-2.0-flash-exp');
}

run();
