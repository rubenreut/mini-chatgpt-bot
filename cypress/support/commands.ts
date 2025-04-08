/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to type in the chat input
       * @example cy.typeMessage('Hello, world!')
       */
      typeMessage(message: string): Chainable<void>

      /**
       * Custom command to send a message
       * @example cy.sendMessage('Hello, world!')
       */
      sendMessage(message: string): Chainable<void>
      
      /**
       * Custom command to upload a file
       * @example cy.uploadFile('example.json')
       */
      uploadFile(fixturePath: string): Chainable<void>
    }
  }
}

// Type in the chat input
Cypress.Commands.add('typeMessage', (message: string) => {
  cy.get('.message-input').type(message);
});

// Send a message
Cypress.Commands.add('sendMessage', (message: string) => {
  cy.typeMessage(message);
  cy.get('.send-button').click();
});

// Upload a file
Cypress.Commands.add('uploadFile', (fixturePath: string) => {
  cy.get('.upload-button').click();
  
  cy.fixture(fixturePath, 'base64').then(fileContent => {
    cy.get('input[type=file]').attachFile({
      fileContent,
      fileName: fixturePath,
      mimeType: fixturePath.endsWith('.json') ? 'application/json' : 
               fixturePath.endsWith('.txt') ? 'text/plain' : 
               fixturePath.endsWith('.png') ? 'image/png' : 
               fixturePath.endsWith('.jpg') ? 'image/jpeg' : 
               'application/octet-stream'
    });
  });
});

// Import commands.js using ES2015 syntax:
import '@testing-library/cypress/add-commands';

// Prevent TypeScript from reading file as legacy script
export {};
