import { HoppCollection, HoppRESTRequest } from "@hoppscotch/data";

/**
 * Class to handle export of a collection to a custom HTML format with sidebar
 */
export class ExportCustomHTMLSidebar {
  private collection: HoppCollection | HoppRESTRequest[];
  
  constructor(collection: HoppCollection | HoppRESTRequest[]) {
    this.collection = collection;
  }
  
  /**
   * Generate an HTML file with custom design (including sidebar) to display the collection
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
      --sidebar-bg: #252525;
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
      display: flex;
      min-height: 100vh;
    }
    
    /* Sidebar Styles */
    .sidebar {
      width: 300px;
      background-color: var(--sidebar-bg);
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 10;
      transition: transform 0.3s ease;
    }
    
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      text-align: center;
    }
    
    .sidebar-logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-color);
      margin-bottom: 10px;
    }
    
    .sidebar-title {
      font-size: 1.2rem;
      color: var(--text-color);
      word-break: break-word;
    }
    
    .sidebar-nav {
      padding: 10px 0;
    }
    
    .nav-section {
      margin-bottom: 10px;
    }
    
    .nav-section-title {
      padding: 10px 20px;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-dark);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .nav-item {
      padding: 8px 20px 8px 30px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.2s;
      text-decoration: none;
      color: var(--text-color);
    }
    
    .nav-item:hover {
      background-color: rgba(110, 98, 229, 0.1);
    }
    
    .nav-item.active {
      background-color: rgba(110, 98, 229, 0.2);
      border-left: 3px solid var(--primary-color);
    }
    
    .nav-item-method {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 0.7rem;
      margin-right: 10px;
      min-width: 50px;
      text-align: center;
    }
    
    .nav-item-method.get {
      background-color: var(--primary-color);
      color: white;
    }
    
    .nav-item-method.post {
      background-color: var(--success-color);
      color: white;
    }
    
    .nav-item-method.put {
      background-color: var(--warning-color);
      color: black;
    }
    
    .nav-item-method.delete {
      background-color: var(--danger-color);
      color: white;
    }
    
    .nav-item-method.patch {
      background-color: #9c27b0;
      color: white;
    }
    
    .nav-item-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Main Content Styles */
    .content {
      flex: 1;
      padding: 0;
      margin-left: 300px;
      width: calc(100% - 300px);
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    header {
      display: flex;
      flex-direction: column;
      margin-bottom: 40px;
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
      background-color: rgba(0, 0, 0, 0.2);
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    .card {
      background-color: var(--card-color);
      border-radius: 8px;
      margin-bottom: 30px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color);
    }
    
    .card-header {
      padding: 15px 20px;
      background-color: rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
    }
    
    .card-title {
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .card-body {
      padding: 20px;
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
    
    .hamburger {
      display: none;
      position: fixed;
      top: 15px;
      left: 15px;
      z-index: 20;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 1.2rem;
    }
    
    @media (max-width: 1000px) {
      .sidebar {
        transform: translateX(-100%);
      }
      
      .sidebar.show {
        transform: translateX(0);
      }
      
      .content {
        margin-left: 0;
        width: 100%;
      }
      
      .hamburger {
        display: block;
      }
      
      .content-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 5;
      }
      
      .content-overlay.show {
        display: block;
      }
    }
  </style>
</head>
<body>
  <!-- Mobile Sidebar Toggle -->
  <button class="hamburger" id="toggleSidebar">☰</button>
  
  <!-- Overlay for mobile -->
  <div class="content-overlay" id="contentOverlay"></div>
  
  <!-- Sidebar -->
  <div class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">Hoppscotch</div>
      <div class="sidebar-title">${this.escapeHTML(collectionName)}</div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">Endpoints</div>
        ${this.generateSidebarNav(requests)}
      </div>
    </nav>
  </div>
  
  <!-- Main Content -->
  <div class="content">
    <div class="container">
      <header>
        <h1>${this.escapeHTML(collectionName)}</h1>
        <p class="subtitle">API Documentation generated by Hoppscotch</p>
      </header>
      
      <div class="endpoints">
        ${this.generateRequestsHTML(requests)}
      </div>
      
      <footer class="footer">
        <p>Generated by <a href="https://hoppscotch.io/" target="_blank">Hoppscotch</a></p>
      </footer>
    </div>
  </div>
  
  <script>
    // Handle smooth scrolling to anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 20,
            behavior: 'smooth'
          });
          
          // Update active state in sidebar
          document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
          });
          
          this.classList.add('active');
          
          // On mobile, close sidebar after clicking
          if (window.innerWidth <= 1000) {
            document.getElementById('sidebar').classList.remove('show');
            document.getElementById('contentOverlay').classList.remove('show');
          }
        }
      });
    });
    
    // Toggle sidebar on mobile
    document.getElementById('toggleSidebar').addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('show');
      document.getElementById('contentOverlay').classList.toggle('show');
    });
    
    // Close sidebar when clicking on overlay
    document.getElementById('contentOverlay').addEventListener('click', function() {
      document.getElementById('sidebar').classList.remove('show');
      this.classList.remove('show');
    });
    
    // Highlight current section on scroll
    window.addEventListener('scroll', function() {
      const scrollPosition = window.scrollY;
      
      document.querySelectorAll('.card').forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.id;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + sectionId) {
              item.classList.add('active');
            }
          });
        }
      });
    });
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
   * Get all requests from the collection
   * @returns Array of requests
   */
  private getAllRequests(): HoppRESTRequest[] {
    if (Array.isArray(this.collection)) {
      return this.collection;
    }
    
    const requests: HoppRESTRequest[] = [];
    
    // Add requests from the root level
    if (this.collection.requests) {
      requests.push(...this.collection.requests);
    }
    
    // Add requests from folders
    if (this.collection.folders) {
      this.collection.folders.forEach(folder => {
        requests.push(...this.getRequestsFromFolder(folder));
      });
    }
    
    return requests;
  }
  
  /**
   * Recursively get all requests from a folder
   * @param folder Folder to get requests from
   * @returns Array of requests
   */
  private getRequestsFromFolder(folder: any): HoppRESTRequest[] {
    const requests: HoppRESTRequest[] = [];
    
    // Add requests from the current folder
    if (folder.requests) {
      requests.push(...folder.requests);
    }
    
    // Add requests from nested folders
    if (folder.folders) {
      folder.folders.forEach(nestedFolder => {
        requests.push(...this.getRequestsFromFolder(nestedFolder));
      });
    }
    
    return requests;
  }
  
  /**
   * Generate HTML for the sidebar navigation
   * @param requests Array of requests
   * @returns HTML string for sidebar navigation
   */
  private generateSidebarNav(requests: HoppRESTRequest[]): string {
    return requests.map((request, index) => {
      const methodClass = request.method.toLowerCase();
      return `
      <a href="#endpoint-${index}" class="nav-item">
        <span class="nav-item-method ${methodClass}">${request.method.toUpperCase()}</span>
        <span class="nav-item-label">${this.escapeHTML(request.name || 'Untitled Request')}</span>
      </a>
      `;
    }).join('');
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
              <div class="card-header">
                <span class="card-title">${this.escapeHTML(name)}</span>
                <span class="badge">${response.code || 200}</span>
              </div>
              <div class="card-body">
                ${response.body ? `<pre>${this.escapeHTML(response.body)}</pre>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        `;
      }
      
      // Authentication section
      let authHTML = '';
      if (request.auth && request.auth.authActive && request.auth.authType !== 'none') {
        const authType = request.auth.authType;
        let authDetailsHTML = '';
        
        switch (authType) {
          case 'basic':
            authDetailsHTML = `<p>Uses Basic Authentication</p>`;
            break;
          case 'bearer':
            authDetailsHTML = `<p>Uses Bearer Token Authentication</p>`;
            break;
          case 'oauth-2':
            authDetailsHTML = `<p>Uses OAuth 2.0 Authentication</p>`;
            break;
          case 'api-key':
            authDetailsHTML = `<p>Uses API Key Authentication</p>`;
            break;
          default:
            authDetailsHTML = `<p>Uses ${this.escapeHTML(authType)} Authentication</p>`;
        }
        
        authHTML = `
        <div class="section">
          <h3 class="section-title">Authentication</h3>
          ${authDetailsHTML}
        </div>
        `;
      }
      
      return `
      <div id="endpoint-${index}" class="card">
        <div class="card-header">
          <span class="method ${methodClass}">${request.method.toUpperCase()}</span>
          <span class="card-title">${this.escapeHTML(request.name || 'Untitled Request')}</span>
        </div>
        <div class="card-body">
          <div class="endpoint">${this.escapeHTML(request.endpoint)}</div>
          
          ${request.description ? `
          <div class="section">
            <h3 class="section-title">Description</h3>
            <p>${this.escapeHTML(request.description)}</p>
          </div>
          ` : ''}
          
          ${authHTML}
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
   * Convert a string to a URL-friendly slug
   * @param str String to slugify
   * @returns Slugified string
   */
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
} 