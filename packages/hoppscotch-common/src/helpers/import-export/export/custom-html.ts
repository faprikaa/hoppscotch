import { HoppCollection, HoppRESTRequest } from "@hoppscotch/data";

/**
 * Class to handle export of a collection to a custom HTML format
 */
export class ExportCustomHTML {
  private collection: HoppCollection | HoppRESTRequest[];
  
  constructor(collection: HoppCollection | HoppRESTRequest[]) {
    this.collection = collection;
  }
  
  /**
   * Generate an HTML file with custom design to display the collection
   * @returns HTML string with embedded CSS and JavaScript
   */
  generateCustomHTML(): string {
    // Get collection name and requests
    const collectionName = this.getCollectionName();
    const requests = this.getAllRequests();
    
    // Create HTML with embedded styling
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${collectionName} - API Documentation</title>
  <style>
    :root {
      --primary-color: #6e62e5;
      --primary-light: #8c82e3;
      --primary-dark: #5046b3;
      --secondary-color: #202124;
      --text-color: #f5f5f5;
      --text-dark: #e0e0e0;
      --success-color: #47b881;
      --warning-color: #ffae42;
      --danger-color: #ec5f59;
      --background-color: #1c1c1c;
      --card-color: #2c2c2c;
      --border-color: #3c3c3c;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
      line-height: 1.5;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40px;
      text-align: center;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: var(--primary-color);
    }
    
    .subtitle {
      font-size: 1.1rem;
      color: var(--text-dark);
      margin-bottom: 20px;
    }
    
    .method {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.8rem;
      margin-right: 10px;
      min-width: 80px;
      text-align: center;
    }
    
    .method.get {
      background-color: var(--primary-color);
      color: white;
    }
    
    .method.post {
      background-color: var(--success-color);
      color: white;
    }
    
    .method.put {
      background-color: var(--warning-color);
      color: black;
    }
    
    .method.delete {
      background-color: var(--danger-color);
      color: white;
    }
    
    .method.patch {
      background-color: #9c27b0;
      color: white;
    }
    
    .endpoint {
      font-family: 'Courier New', Courier, monospace;
      font-size: 1rem;
      margin-bottom: 10px;
      word-break: break-all;
    }
    
    .card {
      background-color: var(--card-color);
      border-radius: 8px;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color);
    }
    
    .card-header {
      padding: 15px 20px;
      background-color: rgba(0, 0, 0, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .card-title {
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .card-body {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease, padding 0.4s ease;
    }
    
    .card-body.show {
      padding: 20px;
      max-height: 2000px;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 10px;
      color: var(--primary-light);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 5px;
    }
    
    .param-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .param-table th {
      text-align: left;
      padding: 10px;
      background-color: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid var(--border-color);
    }
    
    .param-table td {
      padding: 10px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .param-table tr:last-child td {
      border-bottom: none;
    }
    
    .param-name {
      font-weight: 600;
      width: 30%;
    }
    
    .param-type {
      color: var(--primary-light);
      width: 20%;
      font-family: 'Courier New', Courier, monospace;
    }
    
    pre {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.9rem;
      color: var(--text-dark);
    }
    
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 4px;
      margin-left: 8px;
      background-color: var(--primary-dark);
      color: white;
    }
    
    .expand-all {
      background-color: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-bottom: 20px;
      transition: background-color 0.2s;
    }
    
    .expand-all:hover {
      background-color: var(--primary-dark);
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
      color: var(--text-dark);
    }
    
    .footer a {
      color: var(--primary-light);
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
      
      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${collectionName}</h1>
      <p class="subtitle">API Documentation generated by Hoppscotch</p>
      <button class="expand-all" onclick="toggleAllEndpoints()">Expand All Endpoints</button>
    </header>
    
    <div class="endpoints">
      ${this.generateRequestsHTML(requests)}
    </div>
    
    <footer class="footer">
      <p>Generated by <a href="https://hoppscotch.io/" target="_blank">Hoppscotch</a></p>
    </footer>
  </div>
  
  <script>
    function toggleEndpoint(id) {
      const cardBody = document.getElementById(id);
      cardBody.classList.toggle('show');
    }
    
    function toggleAllEndpoints() {
      const allCardBodies = document.querySelectorAll('.card-body');
      const expandAllButton = document.querySelector('.expand-all');
      const areAllExpanded = [...allCardBodies].every(body => body.classList.contains('show'));
      
      if (areAllExpanded) {
        allCardBodies.forEach(body => body.classList.remove('show'));
        expandAllButton.textContent = 'Expand All Endpoints';
      } else {
        allCardBodies.forEach(body => body.classList.add('show'));
        expandAllButton.textContent = 'Collapse All Endpoints';
      }
    }
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
  
  /**
   * Get all requests from the collection and its nested folders
   * @returns Array of requests
   */
  private getAllRequests(): HoppRESTRequest[] {
    if (Array.isArray(this.collection)) {
      return this.collection as HoppRESTRequest[];
    }
    
    const requests: HoppRESTRequest[] = [];
    
    // Add requests from current collection
    if (this.collection.requests) {
      requests.push(...this.collection.requests);
    }
    
    // Add requests from nested folders
    if (this.collection.folders) {
      this.collection.folders.forEach(folder => {
        requests.push(...this.getRequestsFromFolder(folder));
      });
    }
    
    return requests;
  }
  
  /**
   * Recursively get all requests from a folder and its nested folders
   * @param folder The folder to extract requests from
   * @returns Array of requests
   */
  private getRequestsFromFolder(folder: any): HoppRESTRequest[] {
    const requests: HoppRESTRequest[] = [];
    
    // Add requests from current folder
    if (folder.requests) {
      requests.push(...folder.requests);
    }
    
    // Add requests from nested folders
    if (folder.folders) {
      folder.folders.forEach((subFolder: any) => {
        requests.push(...this.getRequestsFromFolder(subFolder));
      });
    }
    
    return requests;
  }
  
  /**
   * Generate HTML for each request in the collection
   * @param requests Array of requests
   * @returns HTML string representing all requests
   */
  private generateRequestsHTML(requests: HoppRESTRequest[]): string {
    return requests.map((request, index) => {
      const methodClass = request.method.toLowerCase();
      
      // Generate params table HTML if params exist
      let paramsHTML = '';
      if (request.params && request.params.length > 0) {
        const activeParams = request.params.filter(param => param.active !== false);
        
        if (activeParams.length > 0) {
          paramsHTML = `
          <div class="section">
            <h3 class="section-title">Query Parameters</h3>
            <table class="param-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${activeParams.map(param => `
                <tr>
                  <td class="param-name">${this.escapeHTML(param.key)}</td>
                  <td class="param-type">${this.escapeHTML(param.value)}</td>
                  <td>${param.description ? this.escapeHTML(param.description) : ''}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          `;
        }
      }
      
      // Generate headers table HTML if headers exist
      let headersHTML = '';
      if (request.headers && request.headers.length > 0) {
        const activeHeaders = request.headers.filter(header => header.active !== false);
        
        if (activeHeaders.length > 0) {
          headersHTML = `
          <div class="section">
            <h3 class="section-title">Headers</h3>
            <table class="param-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${activeHeaders.map(header => `
                <tr>
                  <td class="param-name">${this.escapeHTML(header.key)}</td>
                  <td class="param-type">${this.escapeHTML(header.value)}</td>
                  <td>${header.description ? this.escapeHTML(header.description) : ''}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          `;
        }
      }
      
      // Generate request body HTML if body exists
      let bodyHTML = '';
      if (request.body && request.body.contentType && request.body.body) {
        bodyHTML = `
        <div class="section">
          <h3 class="section-title">Request Body <span class="badge">${request.body.contentType}</span></h3>
          <pre>${this.escapeHTML(request.body.body)}</pre>
        </div>
        `;
      }
      
      // Generate response examples if they exist
      let responsesHTML = '';
      if (request.responses && Object.keys(request.responses).length > 0) {
        responsesHTML = `
        <div class="section">
          <h3 class="section-title">Response Examples</h3>
          ${Object.entries(request.responses).map(([name, response]) => `
            <div class="card" style="margin-bottom: 10px;">
              <div class="card-header" onclick="toggleEndpoint('response-${index}-${this.slugify(name)}')">
                <span class="card-title">${this.escapeHTML(name)}</span>
                <span class="badge">${response.code || 200}</span>
              </div>
              <div id="response-${index}-${this.slugify(name)}" class="card-body">
                ${response.body ? `<pre>${this.escapeHTML(response.body)}</pre>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        `;
      }
      
      return `
      <div class="card">
        <div class="card-header" onclick="toggleEndpoint('endpoint-${index}')">
          <div>
            <span class="method ${methodClass}">${request.method.toUpperCase()}</span>
            <span class="card-title">${this.escapeHTML(request.name || 'Untitled Request')}</span>
          </div>
        </div>
        <div id="endpoint-${index}" class="card-body">
          <div class="endpoint">${this.escapeHTML(request.endpoint)}</div>
          
          ${request.description ? `
          <div class="section">
            <h3 class="section-title">Description</h3>
            <p>${this.escapeHTML(request.description)}</p>
          </div>
          ` : ''}
          
          ${paramsHTML}
          ${headersHTML}
          ${bodyHTML}
          ${responsesHTML}
        </div>
      </div>
      `;
    }).join('');
  }
  
  /**
   * Escape HTML special characters to prevent XSS
   * @param str String to escape
   * @returns Escaped string
   */
  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * Convert a string to a slug (URL-friendly version)
   * @param str String to convert
   * @returns Slug
   */
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default ExportCustomHTML; 