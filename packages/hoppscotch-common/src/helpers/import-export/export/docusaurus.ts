import { HoppCollection, HoppRESTRequest } from "@hoppscotch/data";
import * as E from "fp-ts/Either";
import { platform } from "~/platform";

/**
 * Class to handle export of a collection to Docusaurus markdown format
 */
export class ExportDocusaurus {
  private collection: HoppCollection | HoppRESTRequest[];
  
  constructor(collection: HoppCollection | HoppRESTRequest[]) {
    this.collection = collection;
  }
  
  /**
   * Generate Docusaurus markdown content for the collection
   * @returns Markdown content as a string
   */
  public generate(): string {
    const collectionName = this.getCollectionName();
    let markdown = `---\nsidebar_position: 1\n---\n\n# ${collectionName} API Reference\n\n`;
    
    if (Array.isArray(this.collection)) {
      markdown += this.generateRequestsMarkdown(this.collection);
    } else {
      markdown += this.generateCollectionMarkdown(this.collection);
    }
    
    return markdown;
  }
  
  /**
   * Download the Docusaurus markdown content
   * @returns Either with success message or error
   */
  public async download(): Promise<E.Either<string, string>> {
    try {
      const markdownContent = this.generate();
      const fileName = `${this.slugify(this.getCollectionName())}-api-reference`;
      
      const result = await platform.kernelIO.saveFileWithDialog({
        data: markdownContent,
        contentType: "text/markdown",
        suggestedFilename: `${fileName}.md`,
        filters: [
          {
            name: "Markdown",
            extensions: ["md"],
          },
        ],
      });
      
      if (result.type === "unknown" || result.type === "saved") {
        return E.right("state.download_started");
      }
      
      return E.left("export.failed");
    } catch (e) {
      console.error(e);
      return E.left("export.failed");
    }
  }
  
  /**
   * Generate markdown for a collection
   * @param collection The collection to generate markdown for
   * @param level The current header level (defaults to 2)
   * @returns Markdown content
   */
  private generateCollectionMarkdown(collection: HoppCollection, level: number = 2): string {
    let markdown = "";
    
    // Add requests in this collection
    if (collection.requests && collection.requests.length > 0) {
      markdown += this.generateRequestsMarkdown(collection.requests, level);
    }
    
    // Process sub-folders
    if (collection.folders && collection.folders.length > 0) {
      collection.folders.forEach((folder) => {
        const headerLevel = "#".repeat(level);
        markdown += `\n${headerLevel} ${folder.name}\n\n`;
        markdown += this.generateCollectionMarkdown(folder, level + 1);
      });
    }
    
    return markdown;
  }
  
  /**
   * Generate markdown for a list of requests
   * @param requests Array of requests
   * @param level The current header level (defaults to 2)
   * @returns Markdown content
   */
  private generateRequestsMarkdown(requests: HoppRESTRequest[], level: number = 2): string {
    let markdown = "";
    const headerPrefix = "#".repeat(level);
    
    requests.forEach((request) => {
      // Request title
      markdown += `\n${headerPrefix} ${request.name}\n\n`;
      
      // Add description if available
      if (request.description && request.description.trim() !== "") {
        markdown += `${request.description}\n\n`;
      }
      
      // Request details
      markdown += "```http\n";
      markdown += `${request.method} ${request.endpoint}\n`;
      
      // Add headers
      if (request.headers && request.headers.length > 0) {
        const activeHeaders = request.headers.filter(h => h.active);
        activeHeaders.forEach(header => {
          markdown += `${header.key}: ${header.value}\n`;
        });
      }
      
      markdown += "```\n\n";
      
      // Parameters section if present
      if (request.params && request.params.length > 0) {
        const activeParams = request.params.filter(p => p.active);
        if (activeParams.length > 0) {
          markdown += "### Query Parameters\n\n";
          markdown += "| Parameter | Value | Description |\n";
          markdown += "|-----------|-------|--------------|\n";
          
          activeParams.forEach(param => {
            markdown += `| \`${param.key}\` | \`${param.value}\` | ${param.description || ''} |\n`;
          });
          
          markdown += "\n";
        }
      }
      
      // Body section if present
      if (request.body && request.body.contentType && request.body.body) {
        markdown += "### Request Body\n\n";
        markdown += "```" + this.getLanguageForContentType(request.body.contentType) + "\n";
        markdown += request.body.body + "\n";
        markdown += "```\n\n";
      }
      
      // Test script if present
      if (request.testScript && request.testScript.trim() !== "") {
        markdown += "### Tests\n\n";
        markdown += "```javascript\n";
        markdown += request.testScript + "\n";
        markdown += "```\n\n";
      }
      
      // Pre-request script if present
      if (request.preRequestScript && request.preRequestScript.trim() !== "") {
        markdown += "### Pre-request Script\n\n";
        markdown += "```javascript\n";
        markdown += request.preRequestScript + "\n";
        markdown += "```\n\n";
      }
      
      // Add a divider between requests
      markdown += "---\n";
    });
    
    return markdown;
  }
  
  /**
   * Get the appropriate language for a content type for syntax highlighting
   * @param contentType The content type
   * @returns Language string for markdown code block
   */
  private getLanguageForContentType(contentType: string | null): string {
    if (!contentType) return "text";
    
    if (contentType.includes("application/json")) {
      return "json";
    } else if (contentType.includes("application/xml") || contentType.includes("text/xml")) {
      return "xml";
    } else if (contentType.includes("text/html")) {
      return "html";
    } else if (contentType.includes("application/javascript") || contentType.includes("text/javascript")) {
      return "javascript";
    } else if (contentType.includes("text/css")) {
      return "css";
    } else {
      return "text";
    }
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