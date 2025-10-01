/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI} from '@google/genai';

// This function contains the core application logic and will be called once the DOM is fully loaded.
function main() {
  const promptForm = document.getElementById('prompt-form');
  const promptInput = document.getElementById('prompt-input');
  const generateButton = document.getElementById('generate-button');
  const responseContainer = document.getElementById('response-container');
  const loader = document.getElementById('loader');

  // A helper function to display errors consistently
  function displayError(message, isHtml = false) {
    if (responseContainer) {
      if (isHtml) {
          responseContainer.innerHTML = message;
      } else {
          responseContainer.textContent = message;
      }
      responseContainer.style.color = '#d93025';
      responseContainer.style.backgroundColor = '#fce8e6';
    }
  }

  // A defensive check to ensure all required elements are found on the page.
  if (!promptForm || !promptInput || !generateButton || !responseContainer || !loader) {
    console.error('Error: One or more required DOM elements could not be found.');
    displayError('Fout: Kan de applicatie niet initialiseren vanwege ontbrekende HTML-elementen.');
    return;
  }
  
  // Per coding guidelines, API key must be read from process.env.API_KEY
  // Safely check for the API key to prevent a crash in browser environments where 'process' is not defined.
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : undefined;


  // Validate that the API key is available.
  if (!apiKey) {
    promptInput.disabled = true;
    generateButton.disabled = true;
    generateButton.textContent = 'Configuratie Fout';
    const errorMessage = `
      <strong>Fout: API Sleutel ontbreekt.</strong>
      <p>De applicatie kan niet werken omdat de Gemini API-sleutel niet is ingesteld in de hostingomgeving.</p>
      <p>Als u de eigenaar van de site bent, raadpleeg dan de documentatie van uw hostingprovider (bijv. GitHub Pages, Vercel, Netlify) over het instellen van "omgevingsvariabelen". De sleutel moet beschikbaar zijn als <code>process.env.API_KEY</code>.</p>
    `;
    displayError(errorMessage, true);
    return;
  }

  const ai = new GoogleGenAI({apiKey});

  promptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = promptInput.value.trim();

    if (!prompt) {
      return;
    }

    // Show loader and disable button
    loader.classList.remove('hidden');
    generateButton.disabled = true;
    // Reset previous response and error styling
    responseContainer.textContent = '';
    responseContainer.style.color = '';
    responseContainer.style.backgroundColor = '';

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
      displayError('Fout: Kon geen antwoord genereren. Zie de console voor details.');
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