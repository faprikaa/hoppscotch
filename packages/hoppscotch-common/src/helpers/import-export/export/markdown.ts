import * as E from "fp-ts/Either"
import { HoppCollection, HoppRESTRequest, FormDataKeyValue } from "@hoppscotch/data"
import { platform } from "~/platform"

/**
 * Generate an anchor link ID from a string
 * @param text The text to convert to an anchor ID
 * @returns Anchor ID suitable for markdown links
 */
const toAnchorId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Convert a request to Markdown format
 * @param request The request to be converted
 * @returns Markdown string representation of the request
 */
const requestToMarkdown = (request: HoppRESTRequest): string => {
  let markdown = `### ${request.name || "Untitled Request"}\n\n`

  // Add description if available
  if (request.description && request.description.trim() !== "") {
    markdown += `${request.description}\n\n`
  }

  // Add method and endpoint
  markdown += `**Method:** \`${request.method}\`\n\n`
  markdown += `**URL:** \`${request.endpoint}\`\n\n`

  // Add headers
  if (request.headers && request.headers.length > 0) {
    markdown += "#### Headers\n\n"
    markdown += "| Key | Value |\n"
    markdown += "| --- | ----- |\n"
    
    request.headers.forEach((header) => {
      if (header.active) {
        markdown += `| ${header.key} | ${header.value} |\n`
      }
    })
    
    markdown += "\n"
  }

  // Add params
  if (request.params && request.params.length > 0) {
    markdown += "#### Query Parameters\n\n"
    markdown += "| Key | Value |\n"
    markdown += "| --- | ----- |\n"
    
    request.params.forEach((param) => {
      if (param.active) {
        markdown += `| ${param.key} | ${param.value} |\n`
      }
    })
    
    markdown += "\n"
  }

  // Add authentication
  if (request.auth && request.auth.authType !== "none") {
    markdown += "#### Authentication\n\n"
    markdown += `**Type:** \`${request.auth.authType}\`\n\n`
    
    // Add auth details based on type
    switch (request.auth.authType) {
      case "basic":
        markdown += `Username: \`${request.auth.username || ""}\`\n\n`
        markdown += `Password: \`********\`\n\n`
        break
      case "bearer":
        markdown += `Token: \`********\`\n\n`
        break
      case "oauth-2":
        markdown += `Access Token: \`********\`\n\n`
        break
      // Add more auth types as needed
    }
  }

  // Add body data
  if (request.body && request.body.contentType && request.body.contentType !== null) {
    markdown += "#### Body\n\n"
    markdown += `**Content Type:** \`${request.body.contentType}\`\n\n`
    
    switch (request.body.contentType) {
      case "application/json":
      case "application/ld+json":
      case "application/hal+json":
        markdown += "```json\n"
        try {
          // Try to format JSON if possible
          const formatted = JSON.stringify(JSON.parse(request.body.body as string), null, 2)
          markdown += formatted
        } catch {
          // If not valid JSON, just use the raw string
          markdown += request.body.body
        }
        markdown += "\n```\n\n"
        break;
      
      case "application/xml":
      case "text/xml":
        markdown += "```xml\n"
        markdown += request.body.body
        markdown += "\n```\n\n"
        break;
      
      case "text/html":
        markdown += "```html\n"
        markdown += request.body.body
        markdown += "\n```\n\n"
        break;
      
      case "text/plain":
        markdown += "```\n"
        markdown += request.body.body
        markdown += "\n```\n\n"
        break;
      
      case "application/x-www-form-urlencoded":
        markdown += "| Key | Value |\n"
        markdown += "| --- | ----- |\n"
        
        const formData = (request.body.body as string).split("&")
        formData.forEach((item) => {
          const [key, value] = item.split("=")
          if (key && value) {
            markdown += `| ${decodeURIComponent(key)} | ${decodeURIComponent(value)} |\n`
          }
        })
        
        markdown += "\n"
        break;
      
      case "multipart/form-data":
        markdown += "| Key | Type | Value |\n"
        markdown += "| --- | ---- | ----- |\n"
        
        const multipartData = request.body.body as FormDataKeyValue[]
        multipartData.forEach((item) => {
          if (item.active) {
            let displayValue: string = 'file'
            
            if (item.isFile) {
              if (typeof item.value !== 'string') {
                if (Array.isArray(item.value) && item.value[0] instanceof Blob) {
                  // Try to get filename if available
                  if ('name' in item.value[0]) {
                    displayValue = (item.value[0] as unknown as { name: string }).name
                  }
                } else if (item.value instanceof Blob && 'name' in item.value) {
                  displayValue = (item.value as unknown as { name: string }).name
                }
              }
            } else {
              displayValue = item.value as string
            }
            
            markdown += `| ${item.key} | ${item.isFile ? "File" : "Text"} | ${displayValue} |\n`
          }
        })
        
        markdown += "\n"
        break;
      
      default:
        markdown += "```\n"
        markdown += request.body.body
        markdown += "\n```\n\n"
    }
  }

  // Add pre-request script if available
  if (request.preRequestScript && request.preRequestScript.trim() !== "") {
    markdown += "#### Pre-request Script\n\n"
    markdown += "```javascript\n"
    markdown += request.preRequestScript
    markdown += "\n```\n\n"
  }

  // Add test script if available
  if (request.testScript && request.testScript.trim() !== "") {
    markdown += "#### Tests\n\n"
    markdown += "```javascript\n"
    markdown += request.testScript
    markdown += "\n```\n\n"
  }

  return markdown
}

// Type guard function to check if an object is a HoppRESTRequest
const isHoppRESTRequest = (obj: any): obj is HoppRESTRequest => {
  return obj && typeof obj === 'object' && 'endpoint' in obj && 'method' in obj
}

/**
 * Collect all requests from a collection into a flat array
 * @param collection The collection to extract requests from
 * @returns Array of all requests in the collection and its subfolders
 */
const collectAllRequests = (collection: HoppCollection): HoppRESTRequest[] => {
  let allRequests: HoppRESTRequest[] = []
  
  // Add direct requests from this collection
  if (collection.requests && collection.requests.length > 0) {
    collection.requests.forEach((request: any) => {
      if (isHoppRESTRequest(request)) {
        allRequests.push(request)
      }
    })
  }
  
  // Add requests from folders
  if (collection.folders && collection.folders.length > 0) {
    collection.folders.forEach((folder) => {
      // Add direct requests from this folder
      if (folder.requests && folder.requests.length > 0) {
        folder.requests.forEach((request: any) => {
          if (isHoppRESTRequest(request)) {
            allRequests.push(request)
          }
        })
      }
      
      // Add requests from subfolders recursively
      if (folder.folders && folder.folders.length > 0) {
        folder.folders.forEach((subFolder: any) => {
          if (subFolder && typeof subFolder === 'object') {
            allRequests = [...allRequests, ...collectAllRequests(subFolder as HoppCollection)]
          }
        })
      }
    })
  }
  
  return allRequests
}

/**
 * Generate a summary table of all requests
 * @param requests Array of requests to include in the summary
 * @returns Markdown string with a summary table
 */
const generateSummaryTable = (requests: HoppRESTRequest[]): string => {
  let markdown = "## Summary\n\n"
  markdown += "| Name | Method | Endpoint | Description |\n"
  markdown += "| ---- | ------ | -------- | ----------- |\n"
  
  requests.forEach((request) => {
    const name = request.name || "Untitled Request"
    const anchorLink = toAnchorId(name)
    const description = request.description ? request.description.substring(0, 50) + (request.description.length > 50 ? "..." : "") : ""
    markdown += `| [${name}](#${anchorLink}) | \`${request.method}\` | \`${request.endpoint}\` | ${description} |\n`
  })
  
  markdown += "\n"
  return markdown
}

/**
 * Safely check if an object has a description property and it's not empty
 * @param obj Object to check for description
 * @returns The description string or empty string
 */
const getDescription = (obj: any): string => {
  return obj && typeof obj === 'object' && 'description' in obj && typeof obj.description === 'string' && obj.description.trim() !== '' 
    ? obj.description 
    : ''
}

/**
 * Convert a collection to Markdown format
 * @param collection The collection to be converted
 * @returns Markdown string representation of the collection
 */
const collectionToMarkdown = (collection: HoppCollection): string => {
  let markdown = `# ${collection.name}\n\n`
  
  // Add collection description if available
  const collectionDesc = getDescription(collection)
  if (collectionDesc) {
    markdown += `${collectionDesc}\n\n`
  }
  
  // Generate summary table with all requests
  const allRequests = collectAllRequests(collection)
  if (allRequests.length > 0) {
    markdown += generateSummaryTable(allRequests)
  }
  
  markdown += "## Details\n\n"

  if (collection.folders && collection.folders.length > 0) {
    collection.folders.forEach((folder) => {
      markdown += `### ${folder.name}\n\n`
      
      // Add folder description if available
      const folderDesc = getDescription(folder)
      if (folderDesc) {
        markdown += `${folderDesc}\n\n`
      }
      
      if (folder.requests && folder.requests.length > 0) {
        folder.requests.forEach((request: any) => {
          if (isHoppRESTRequest(request)) {
            const requestMd = requestToMarkdown(request)
            markdown += `${requestMd}\n---\n\n`
          }
        })
      }
      
      // Handle nested folders recursively
      if (folder.folders && folder.folders.length > 0) {
        folder.folders.forEach((subFolder: any) => {
          if (subFolder && typeof subFolder === 'object') {
            // Generate markdown for subfolder content
            let subFolderMd = `#### ${subFolder.name}\n\n`
            
            // Add subfolder description if available
            const subFolderDesc = getDescription(subFolder)
            if (subFolderDesc) {
              subFolderMd += `${subFolderDesc}\n\n`
            }
            
            if (subFolder.requests && subFolder.requests.length > 0) {
              subFolder.requests.forEach((request: any) => {
                if (isHoppRESTRequest(request)) {
                  subFolderMd += requestToMarkdown(request)
                  subFolderMd += "---\n\n"
                }
              })
            }
            
            markdown += subFolderMd
          }
        })
      }
    })
  }
  
  if (collection.requests && collection.requests.length > 0) {
    collection.requests.forEach((request: any) => {
      if (isHoppRESTRequest(request)) {
        markdown += requestToMarkdown(request)
        markdown += "---\n\n"
      }
    })
  }
  
  return markdown
}

export class ExportMarkdown {
  collection: HoppCollection

  constructor(collection: HoppCollection) {
    this.collection = collection
  }

  /**
   * Generate Markdown content for a collection
   * @returns Markdown string
   */
  generateMarkdown(): string {
    return collectionToMarkdown(this.collection)
  }

  /**
   * Export the collection as a downloadable Markdown file
   * @returns Either with success/failure message key
   */
  async download(): Promise<E.Either<string, string>> {
    const markdown = this.generateMarkdown()
    const fileName = this.collection.name || "collection"
    
    const result = await platform.kernelIO.saveFileWithDialog({
      data: markdown,
      contentType: "text/markdown",
      suggestedFilename: `${fileName}.md`,
      filters: [
        {
          name: "Markdown file",
          extensions: ["md"],
        },
      ],
    })

    if (result.type === "unknown" || result.type === "saved") {
      return E.right("state.download_started")
    }

    return E.left("export.failed")
  }
}

/**
 * Export a single request as Markdown
 * @param request The request to export
 * @returns Markdown string
 */
export const exportRequestAsMarkdown = (request: HoppRESTRequest): string => {
  const markdown = `# ${request.name || "Untitled Request"}\n\n`
  
  // Add description if available
  const description = request.description && request.description.trim() !== "" 
    ? `${request.description}\n\n` 
    : ""
  
  const table = `## Summary\n\n| Name | Method | Endpoint | Description |\n| ---- | ------ | -------- | ----------- |\n| [${request.name || "Untitled Request"}](#${toAnchorId(request.name || "Untitled Request")}) | \`${request.method}\` | \`${request.endpoint}\` | ${description.trim()} |\n\n## Details\n\n`
  
  return markdown + description + table + requestToMarkdown(request)
}

/**
 * Download a single request as a Markdown file
 * @param request The request to download
 * @returns Promise resolving to Either with success/failure message key
 */
export const downloadRequestAsMarkdown = async (
  request: HoppRESTRequest
): Promise<E.Either<string, string>> => {
  const markdown = exportRequestAsMarkdown(request)
  const fileName = request.name || "request"
  
  const result = await platform.kernelIO.saveFileWithDialog({
    data: markdown,
    contentType: "text/markdown",
    suggestedFilename: `${fileName}.md`,
    filters: [
      {
        name: "Markdown file",
        extensions: ["md"],
      },
    ],
  })

  if (result.type === "unknown" || result.type === "saved") {
    return E.right("state.download_started")
  }

  return E.left("export.failed")
} 