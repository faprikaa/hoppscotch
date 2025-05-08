import ExportOpenAPI from './openapi';
import { HoppCollection, HoppRESTRequest } from "@hoppscotch/data";

/**
 * Class to handle export of a collection to Swagger UI HTML format
 */
export class ExportSwaggerUI {
  private collection: HoppCollection | HoppRESTRequest[];
  
  constructor(collection: HoppCollection | HoppRESTRequest[]) {
    this.collection = collection;
  }
  
  /**
   * Generate an HTML file with embedded Swagger UI to display the collection
   * @returns HTML string with embedded Swagger UI
   */
  generateSwaggerUIHTML(): string {
    // First generate the OpenAPI spec
    const openAPIExporter = new ExportOpenAPI(this.collection);
    const openAPISpec = openAPIExporter.generateOpenAPIObject();
    
    // Convert the spec to a stringified JSON
    const openAPISpecString = JSON.stringify(openAPISpec, null, 2);
    
    // Create HTML with embedded Swagger UI
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.getCollectionName()} - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css">
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    
    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
    
    body {
      margin: 0;
      background: #fafafa;
    }
    
    .info .title {
      display: flex;
      align-items: center;
    }
    
    .info .title:before {
      content: "";
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjY0IDUyOHEwLTUzLTM3LjUtOTAuNXQtOTAuNS0zNy41aC0xMjc3cS01MyAwLTkwLjUgMzcuNXQtMzcuNSA5MC41cTAgNTMgMzcuNSA5MC41dDkwLjUgMzcuNWgxMjc3cTUzIDAgOTAuNS0zNy41dDM3LjUtOTAuNXptLTExMCA1MDJxMC01My0zNy41LTkwLjV0LTkwLjUtMzcuNWgtMTA1N3EtNTMgMC05MC41IDM3LjV0LTM3LjUgOTAuNXEwIDUzIDM3LjUgOTAuNXQ5MC41IDM3LjVoMTA1N3E1MyAwIDkwLjUtMzcuNXQzNy41LTkwLjV6bS0xMTEgNTAycTAgNTMtMzcuNSA5MC41dC05MC41IDM3LjVoLTg0NnEtNTMgMC05MC41LTM3LjV0LTM3LjUtOTAuNSAzNy41LTkwLjUgOTAuNS0zNy41aDg0NnE1MyAwIDkwLjUgMzcuNXQzNy41IDkwLjV6Ii8+PC9zdmc+');
      margin-right: 10px;
      width: 24px;
      height: 24px;
      background-size: contain;
      background-repeat: no-repeat;
    }
    
    .swagger-ui .topbar {
      background-color: #6e62e5;
    }
    
    .swagger-ui .info {
      margin: 20px 0;
    }
    
    .swagger-ui .info .title small.version-stamp {
      background-color: #6e62e5;
    }
    
    .swagger-ui .info a {
      color: #6e62e5;
    }
    
    .swagger-ui .btn.execute {
      background-color: #6e62e5;
      border-color: #6e62e5;
    }
    
    .swagger-ui .btn.authorize {
      color: #6e62e5;
      border-color: #6e62e5;
    }
    
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: #6e62e5;
    }
    
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: #22AC00;
    }
    
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: #FF9900;
    }
    
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: #FF0000;
    }
    
    .hoppscotch-footer {
      text-align: center;
      margin: 20px 0;
      font-size: 12px;
      color: #888;
    }
    
    .hoppscotch-footer a {
      color: #6e62e5;
      text-decoration: none;
    }
    
    /* Enhanced styling for descriptions */
    .swagger-ui .opblock-description-wrapper p {
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 12px 0;
    }
    
    .swagger-ui .opblock-description-wrapper code {
      background: #f0f0f0;
      padding: 2px 5px;
      border-radius: 3px;
      color: #e83e8c;
      font-family: monospace;
    }
    
    .swagger-ui .opblock-description-wrapper p strong {
      font-weight: 600;
    }
    
    .swagger-ui .markdown p {
      margin: 0 0 10px 0;
    }
    
    /* Enhance tag styling */
    .swagger-ui .opblock-tag {
      border-bottom: 1px solid rgba(59, 65, 81, 0.3);
      padding-bottom: 10px;
    }
    
    .swagger-ui .opblock-tag-section h3 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .swagger-ui .opblock-tag small {
      font-size: 14px;
      padding: 5px 0;
      display: block;
      font-weight: normal;
      color: #666;
      line-height: 1.4;
    }
    
    /* Make descriptions more readable */
    .swagger-ui .renderedMarkdown p,
    .swagger-ui .renderedMarkdown pre {
      margin: 0 0 10px 0;
      line-height: 1.5;
    }
    
    .swagger-ui table tbody tr td:first-of-type {
      padding: 10px;
      min-width: 20%;
      font-weight: bold;
    }
    
    .swagger-ui .response-col_description__inner div.markdown {
      font-size: 14px;
      line-height: 1.5;
    }
    
    /* Style for parameters */
    .swagger-ui .parameters-col_description p {
      margin-bottom: 8px;
    }
    
    .swagger-ui .parameters-col_description {
      font-size: 14px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <div class="hoppscotch-footer">
    Generated by <a href="https://hoppscotch.io/" target="_blank">Hoppscotch</a>
  </div>
  
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${openAPISpecString},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tagsSorter: "alpha",
        operationsSorter: "alpha",
        displayRequestDuration: true,
        docExpansion: "list",
        filter: true,
        syntaxHighlight: {
          activated: true,
          theme: "agate"
        },
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 3,
        showExtensions: true
      });
      
      window.ui = ui;
      
      // Enhance descriptions for better markdown display
      ui.initOAuth({
        clientId: "your-client-id",
        clientSecret: "your-client-secret-if-required",
        realm: "your-realms",
        appName: "Hoppscotch API Documentation",
        scopeSeparator: " ",
        scopes: "openid profile email",
        additionalQueryStringParams: {}
      });
    };
  </script>
</body>
</html>
    `;
    
    return html;
  }
  
  /**
   * Get the name of the collection being exported
   * @returns Collection name
   */
  private getCollectionName(): string {
    if (Array.isArray(this.collection)) {
      return "API Collection";
    } else {
      return this.collection.name;
    }
  }
}

export default ExportSwaggerUI; 