/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI} from '@google/genai';

// Per coding guidelines, API key must be read from process.env.API_KEY
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const promptForm = document.getElementById('prompt-form') as HTMLFormElement;
const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
const generateButton = document.getElementById('generate-button') as HTMLButtonElement;
const responseContainer = document.getElementById('response-container');
const loader = document.getElementById('loader');

promptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const prompt = promptInput.value.trim();

  if (!prompt) {
    return;
  }

  // Show loader and disable button
  loader.classList.remove('hidden');
  generateButton.disabled = true;
  responseContainer.textContent = '';

  try {
    // Per coding guidelines, model must be 'gemini-2.5-flash'
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of response) {
      responseContainer.textContent += chunk.text;
    }
  } catch (error) {
    console.error(error);
    responseContainer.textContent = 'Error: Could not generate response. See console for details.';
  } finally {
    // Hide loader and re-enable button
    loader.classList.add('hidden');
    generateButton.disabled = false;
  }
});
