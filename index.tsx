/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI} from '@google/genai';

// This function contains the core application logic and will be called once the DOM is fully loaded.
function main() {
  // Per coding guidelines, API key must be read from process.env.API_KEY
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const promptForm = document.getElementById('prompt-form') as HTMLFormElement;
  const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
  const generateButton = document.getElementById('generate-button') as HTMLButtonElement;
  const responseContainer = document.getElementById('response-container');
  const loader = document.getElementById('loader');

  // A defensive check to ensure all required elements are found on the page.
  if (!promptForm || !promptInput || !generateButton || !responseContainer || !loader) {
    console.error('Error: One or more required DOM elements could not be found.');
    if (responseContainer) {
      responseContainer.textContent = 'Error: Could not initialize the application due to missing HTML elements.';
    }
    return;
  }

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
}

// Wait for the DOM to be fully loaded before running the main function.
// This prevents errors from trying to access elements that haven't been created yet.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  // DOM is already loaded, run main function immediately.
  main();
}
