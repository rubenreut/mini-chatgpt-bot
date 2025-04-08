/**
 * TypeScript declaration file for Web Workers
 */

// Allows TypeScript to import .ts files as workers
declare module "*.ts" {
  const content: any;
  export default content;
}

// Allows TypeScript to import .js files as workers
declare module "*.js" {
  const content: any;
  export default content;
}