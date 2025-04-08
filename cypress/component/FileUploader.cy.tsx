/// <reference types="cypress" />
import React from 'react';
import FileUploader from '../../src/components/FileUploader';

describe('FileUploader Component', () => {
  it('renders correctly', () => {
    cy.mount(<FileUploader onFileUpload={cy.stub()} loading={false} />);
    
    // Check if the uploader is visible
    cy.get('.file-drop-area').should('be.visible');
    cy.contains('Drag and drop files here or click to browse').should('be.visible');
  });

  it('should show disabled state when loading', () => {
    cy.mount(<FileUploader onFileUpload={cy.stub()} loading={true} />);
    
    // Check if the uploader is disabled
    cy.get('.file-drop-area.disabled').should('be.visible');
  });

  it('should accept file uploads', () => {
    const onFileUploadStub = cy.stub().as('fileUploadHandler');
    cy.mount(<FileUploader onFileUpload={onFileUploadStub} loading={false} />);
    
    // Prepare a file to upload
    cy.fixture('example.json', 'base64').then(fileContent => {
      const testFile = {
        fileContent,
        fileName: 'example.json',
        mimeType: 'application/json',
      };
      
      // Upload the file
      cy.get('input[type=file]').attachFile(testFile);
      
      // Check if the callback was called
      cy.get('@fileUploadHandler').should('have.been.called');
      
      // Check if file appeared in the list
      cy.get('.file-item').should('be.visible');
      cy.get('.file-name').should('contain', 'example.json');
    });
  });
});
