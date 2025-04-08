/// <reference types="cypress" />

describe('Chat Interface', () => {
  beforeEach(() => {
    // Mock the API key use to prevent needing a real one
    cy.window().then((win) => {
      win.localStorage.setItem('openai_api_key', 'mock-api-key');
    });
    
    // Visit the app
    cy.visit('/');
  });

  it('should display the main chat interface', () => {
    // Check main UI elements
    cy.get('.app-container').should('be.visible');
    cy.get('.message-input').should('be.visible');
    cy.get('.send-button').should('be.visible');
  });

  it('should allow typing a message', () => {
    const testMessage = 'Hello, AI assistant!';
    
    // Type a message in the input
    cy.get('.message-input').type(testMessage);
    
    // Check if the message appears in the input
    cy.get('.message-input').should('have.value', testMessage);
  });

  it('should disable send button when input is empty', () => {
    // Check that send button is disabled initially
    cy.get('.send-button').should('be.disabled');
    
    // Type something and check that it becomes enabled
    cy.get('.message-input').type('Test');
    cy.get('.send-button').should('not.be.disabled');
    
    // Clear input and check that it's disabled again
    cy.get('.message-input').clear();
    cy.get('.send-button').should('be.disabled');
  });

  it('should allow uploading a file', () => {
    // Create a test file
    cy.get('.upload-button').click();
    
    // Check if file uploader appears
    cy.get('.file-drop-area').should('be.visible');
  });

  it('should toggle model selector', () => {
    // Click on the model selector
    cy.get('.model-selector button').click();
    
    // Check if model dropdown appears
    cy.get('.model-dropdown').should('be.visible');
    
    // Select a model
    cy.get('.model-option').contains('GPT-4').click();
    
    // Verify selection
    cy.get('.model-selector-value').should('contain', 'GPT-4');
  });
});
