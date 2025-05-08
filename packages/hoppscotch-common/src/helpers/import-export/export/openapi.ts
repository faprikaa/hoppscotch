// @ts-nocheck
import {OpenAPIV3_1} from "openapi-types";
import {HoppCollection, HoppRESTRequest} from "@hoppscotch/data";

function inferType(value) {
  if (typeof value === "string") {
    if (value.includes("@")) return { type: "string", format: "email" };
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { type: "string", format: "date" };
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return { type: "string", format: "date-time" };
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) 
      return { type: "string", format: "uuid" };
    return { type: "string" };
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { type: "integer" };
    return { type: "number" };
  }
  if (typeof value === "boolean") return { type: "boolean" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array", items: {} };
    return { type: "array", items: inferType(value[0]) };
  }
  if (typeof value === "object" && value !== null) return { type: "object" };
  return { type: "string" };
}

function extractExamples(request) {
  const examples = {};
  
  if (request.responses) {
    for (const [responseName, responseData] of Object.entries(request.responses)) {
      if (responseData.body) {
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(responseData.body);
          examples[responseName] = {
            value: parsed
          };
        } catch {
          // If not JSON, add as string
          examples[responseName] = {
            value: responseData.body
          };
        }
      }
    }
  }
  
  return Object.keys(examples).length > 0 ? examples : undefined;
}

/**
 * Safely get a description from an object if it exists
 * @param {object} obj - The object to extract a description from
 * @param {string} fallback - Fallback text if no description exists
 * @returns {string} The description or fallback text
 */
function getDescription(obj, fallback = '') {
  if (!obj) return fallback;
  
  if (typeof obj.description === 'string' && obj.description.trim() !== '') {
    return obj.description.trim();
  }
  
  return fallback;
}

function transformUrl(urlString) {
  try {
  const urlObj = new URL(urlString);

    const matches = [...urlObj.pathname.matchAll(/<<(.+?)>>/g)];
    const urlParams = matches.map(m => m[1]);

  const editedUrl = urlObj.href.replace(/<<(.+?)>>/g, (_, key) => `{${key}}`);
  const editedEndpoint = urlObj.pathname.replace(/<<(.+?)>>/g, (_, key) => `{${key}}`);

    // Include query parameters in the URL parameters list if they exist
    const queryParams = [];
    urlObj.searchParams.forEach((value, key) => {
      queryParams.push(key);
    });

  return {
    editedUrl,
    urlParams,
      queryParams,
      endpoint: editedEndpoint,
      baseUrl: `${urlObj.protocol}//${urlObj.host}`,
      variables: urlParams.length > 0 ? urlParams : undefined
    };
  } catch (e) {
    // Extract URL path parts for non-standard URLs
    const urlMatch = urlString.match(/^(https?:\/\/[^\/]+)(\/.*)?$/i);
    let baseUrl = '';
    let endpoint = urlString;

    if (urlMatch) {
      baseUrl = urlMatch[1];
      endpoint = urlMatch[2] || '/';
    }

    return {
      editedUrl: urlString,
      urlParams: [],
      queryParams: [],
      endpoint: endpoint,
      baseUrl: baseUrl,
      variables: undefined
    };
  }
}

class ExportOpenAPI {
  private collection: HoppCollection | HoppRESTRequest[]
  private OpenAPIObject: OpenAPIV3_1.Document
  private serverUrls: Set<string> = new Set()
  private schemas: Record<string, any> = {}
  private schemaCounter: number = 0
  private globalExamples: Record<string, any> = {}
  private tagDescriptions: Record<string, string> = {}

  constructor(collection: HoppCollection | HoppRESTRequest[]) {
    this.collection = collection;
    this.OpenAPIObject = {
      openapi: "3.1.0",
      info: {
        title: Array.isArray(collection) ? "API Collection" : collection.name,
        version: "1.0.0",
        description: Array.isArray(collection) ? "Generated from Hoppscotch" : getDescription(collection, "Generated from Hoppscotch"),
        contact: {
          name: "API Support",
          url: "https://github.com/hoppscotch/hoppscotch"
        }
      },
      servers: [],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {},
        examples: {}
      }
    };
  }

  public generateOpenAPIObject() {
    if (Array.isArray(this.collection)) {
      this.processRequests(this.collection);
    } else {
      this.processCollection(this.collection);
    }
    
    // Add detected servers
    if (this.serverUrls.size > 0) {
      this.OpenAPIObject.servers = Array.from(this.serverUrls).map(url => ({ 
        url,
        description: `Server for ${url}`
      }));
    }
    
    // Add schemas to components
    if (Object.keys(this.schemas).length > 0) {
      this.OpenAPIObject.components.schemas = this.schemas;
    }
    
    // Add examples to components
    if (Object.keys(this.globalExamples).length > 0) {
      this.OpenAPIObject.components.examples = this.globalExamples;
    }
    
    // Add tag descriptions if any were collected
    if (Object.keys(this.tagDescriptions).length > 0) {
      this.OpenAPIObject.tags = Object.entries(this.tagDescriptions).map(([name, description]) => ({
        name,
        description
      }));
    }
    
    return this.OpenAPIObject;
  }

  private processCollection(collection: HoppCollection) {
    // Process requests in the current collection
    if (collection.requests && collection.requests.length > 0) {
      this.processRequests(collection.requests);
    }
    
    // Process requests in nested folders
    if (collection.folders) {
      collection.folders.forEach(folder => {
        // If folder has a description, store it for tag description
        if (folder.name && typeof folder.description === 'string' && folder.description.trim() !== '') {
          this.tagDescriptions[folder.name] = folder.description.trim();
        }
        
        this.processNestedFolder(folder);
      });
    }
  }
  
  private processNestedFolder(folder: any) {
    // Process requests in the current folder
    if (folder.requests && folder.requests.length > 0) {
      this.processRequests(folder.requests, folder.name);
    }
    
    // Process requests in nested folders
    if (folder.folders) {
      folder.folders.forEach(subFolder => {
        // If subfolder has a description, store it for tag description
        if (subFolder.name && typeof subFolder.description === 'string' && subFolder.description.trim() !== '') {
          this.tagDescriptions[subFolder.name] = subFolder.description.trim();
        }
        
        this.processNestedFolder(subFolder);
      });
    }
  }

  private processRequests(requests: HoppRESTRequest[], folderName?: string) {
    requests.forEach(request => this.processRequest(request, folderName));
  }

  private processRequest(request: HoppRESTRequest, folderName?: string) {
    try {
      const {urlParams, queryParams, endpoint, baseUrl, variables} = transformUrl(request.endpoint);
      
      // Add server URL if it doesn't exist
      if (baseUrl) {
        this.serverUrls.add(baseUrl);
      }
      
      const method = request.method.toLowerCase();
      
      // Skip if method is not valid
      if (!['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'].includes(method)) {
        return;
      }
      
      // Initialize path if it doesn't exist
      if (!this.OpenAPIObject.paths[endpoint]) {
        this.OpenAPIObject.paths[endpoint] = {};
      }
      
      // Generate parameters for this operation
      const parameters = this.generateParameters(request.params || [], urlParams, queryParams);
      
      // Add request headers as parameters
      if (request.headers && request.headers.length > 0) {
        const headerParams = request.headers
          .filter(h => h.active)
          .map(h => ({
            name: h.key,
            in: "header",
            required: true,
            description: h.description || `Header: ${h.key}`,
            schema: inferType(h.value)
          }));
        
        parameters.push(...headerParams);
      }
      
      // Extract examples from responses
      const examples = extractExamples(request);
      if (examples) {
        // Add to global examples with a prefix based on the request name
        const safeName = request.name.replace(/[^a-zA-Z0-9]/g, '_');
        for (const [exampleName, example] of Object.entries(examples)) {
          const globalExampleName = `${safeName}_${exampleName}`;
          this.globalExamples[globalExampleName] = example;
        }
      }
      
      // Determine tags - use folder hierarchy for better organization
      let tags = [];
      if (folderName) {
        tags.push(folderName);
      }
      if (baseUrl) {
        const hostname = new URL(baseUrl).hostname;
        if (!tags.includes(hostname)) {
          tags.push(hostname);
        }
      }
      
      // Format the description to be more readable
      let formattedDescription = request.description ? request.description.trim() : request.name;
            
      // Create operation object
      const operation: OpenAPIV3_1.OperationObject = {
        summary: request.name,
        description: formattedDescription,
        tags: tags.length > 0 ? tags : undefined,
        parameters: parameters.length > 0 ? parameters : undefined,
      };
      
      // Handle request body for non-GET requests
      if (method !== 'get' && request.body && request.body.contentType && request.body.body) {
        let contentType = request.body.contentType;
        if (contentType === 'application/json') {
          let schema = {};
          let example = undefined;
          
          try {
            // Try to parse JSON body and infer schema
            const parsedBody = JSON.parse(request.body.body);
            
            // Save example
            example = parsedBody;
            
            // Generate schema with name based on request
            const schemaName = `${request.name.replace(/[^a-zA-Z0-9]/g, '')}_Schema_${this.schemaCounter++}`;
            schema = this.inferJsonSchema(parsedBody, schemaName);
            
            if (schema.$ref) {
              // Already a reference
            } else {
              // Add schema to components
              this.schemas[schemaName] = schema;
              schema = { $ref: `#/components/schemas/${schemaName}` };
            }
          } catch (e) {
            // If parsing fails, use string schema
            schema = { type: "string" };
            example = request.body.body;
          }
          
          operation.requestBody = {
            description: `${request.name} request body`,
            required: true,
            content: {
              [contentType]: {
                schema: schema,
                example: example
              }
            }
          };
        } else {
          // For other content types
          operation.requestBody = {
            description: `${request.name} request body`,
            required: true,
            content: {
              [contentType]: {
                schema: { type: "string" },
                example: request.body.body
              }
            }
          };
        }
      }
      
      // Add responses
      if (request.responses && Object.keys(request.responses).length > 0) {
        operation.responses = {};
        
        // Process each saved response
        for (const [responseName, responseData] of Object.entries(request.responses)) {
          const statusCode = responseData.code || 200;
          const contentType = responseData.headers?.find(h => h.key.toLowerCase() === 'content-type')?.value || 'application/json';
          
          let schema = { type: 'string' };
          let example = undefined;
          
          if (contentType.includes('application/json') && responseData.body) {
            try {
              const parsedBody = JSON.parse(responseData.body);
              example = parsedBody;
              
              // Generate schema with name based on response
              const schemaName = `${request.name.replace(/[^a-zA-Z0-9]/g, '')}_Response_${responseName.replace(/[^a-zA-Z0-9]/g, '')}_${this.schemaCounter++}`;
              schema = this.inferJsonSchema(parsedBody, schemaName);
              
              if (schema.$ref) {
                // Already a reference
              } else {
                // Add schema to components
                this.schemas[schemaName] = schema;
                schema = { $ref: `#/components/schemas/${schemaName}` };
              }
            } catch (e) {
              // Use string schema if JSON parsing fails
              schema = { type: "string" };
              example = responseData.body;
            }
          } else if (responseData.body) {
            example = responseData.body;
          }
          
          // Create header objects from response headers
          const headers = {};
          if (responseData.headers) {
            responseData.headers.forEach(header => {
              headers[header.key] = {
                description: header.description || `Header ${header.key}`,
                schema: inferType(header.value)
              };
            });
          }
          
          // Add response description
          let responseDescription = responseName;
          if (responseData.description && responseData.description.trim() !== '') {
            responseDescription = `${responseName}: ${responseData.description.trim()}`;
          }
          
          operation.responses[statusCode] = {
            description: responseDescription,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
            content: responseData.body ? {
              [contentType]: {
                schema: schema,
                example: example,
                examples: examples ? 
                  {
                    [responseName]: {
                      $ref: `#/components/examples/${request.name.replace(/[^a-zA-Z0-9]/g, '_')}_${responseName}`
                    }
                  } : undefined
              }
            } : undefined
          };
        }
      } else {
        // Default response if none exists
        operation.responses = {
          "200": {
            description: "Successful response"
          }
        };
      }
      
      // Add authorization if present
      if (request.auth && request.auth.authActive && request.auth.authType !== 'none') {
        this.addAuthToOperation(operation, request.auth);
      }
      
      // Add the operation to the path
      this.OpenAPIObject.paths[endpoint][method] = operation;
    } catch (error) {
      console.error('Error processing request:', error);
    }
  }

  private addAuthToOperation(operation, auth) {
    if (!this.OpenAPIObject.components.securitySchemes) {
      this.OpenAPIObject.components.securitySchemes = {};
    }

    switch (auth.authType) {
      case 'basic':
        if (!this.OpenAPIObject.components.securitySchemes.basicAuth) {
          this.OpenAPIObject.components.securitySchemes.basicAuth = {
            type: 'http',
            scheme: 'basic'
          };
        }
        operation.security = [{ basicAuth: [] }];
        break;
        
      case 'bearer':
        if (!this.OpenAPIObject.components.securitySchemes.bearerAuth) {
          this.OpenAPIObject.components.securitySchemes.bearerAuth = {
            type: 'http',
            scheme: 'bearer'
          };
        }
        operation.security = [{ bearerAuth: [] }];
        break;
        
      case 'oauth-2':
        if (!this.OpenAPIObject.components.securitySchemes.oauth2) {
          this.OpenAPIObject.components.securitySchemes.oauth2 = {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: auth.grantTypeInfo?.authUrl || 'https://example.com/oauth/authorize',
                scopes: {}
              }
            }
          };
        }
        operation.security = [{ oauth2: [] }];
        break;
        
      case 'api-key':
        const keyName = 'apiKey';
        if (!this.OpenAPIObject.components.securitySchemes[keyName]) {
          this.OpenAPIObject.components.securitySchemes[keyName] = {
            type: 'apiKey',
            in: 'header',
            name: auth.grantTypeInfo?.key || 'X-API-KEY'
          };
        }
        operation.security = [{ [keyName]: [] }];
        break;
    }
  }

  private generateParameters(parameters: any[], urlParams: string[], queryParams: string[]) {
    const parameterObjects = [];
    
    if (parameters && parameters.length > 0) {
      parameters.forEach((parameter) => {
        if (!parameter.active && parameter.active !== undefined) return;
        
        const isUrlParam = urlParams.includes(parameter.key);
        const parameterObject = {
        name: parameter.key,
        in: isUrlParam ? "path" : "query",
        required: isUrlParam ? true : false,
          description: parameter.description || `${isUrlParam ? 'Path' : 'Query'} parameter: ${parameter.key}`,
          schema: inferType(parameter.value),
          example: parameter.value
        };
        
        parameterObjects.push(parameterObject);
      });
    }
    
    // Add URL path parameters that weren't in request.params
    urlParams.forEach(param => {
      if (!parameters.some(p => p.key === param)) {
        parameterObjects.push({
          name: param,
          in: "path",
          required: true,
          description: `Path parameter: ${param}`,
          schema: { type: "string" }
        });
      }
    });
    
    return parameterObjects;
  }
  
  private inferJsonSchema(json: any, schemaName?: string): any {
    if (typeof json === "object" && json !== null) {
      if (Array.isArray(json)) {
        if (json.length === 0) return { type: "array", items: {} };
        
        // For arrays, use the first item as a template
        const itemSchema = this.inferJsonSchema(json[0]);
        
        return {
          type: "array",
          items: itemSchema
        };
      } else {
        const schema: any = {
          type: "object",
          properties: {}
        };
        
        const requiredProps = [];
        
        for (const key in json) {
          const value = json[key];
          schema.properties[key] = this.inferJsonSchema(value);
          
          // Consider non-null values as required for better documentation
          if (value !== null && value !== undefined) {
            requiredProps.push(key);
          }
        }
        
        if (requiredProps.length > 0) {
          schema.required = requiredProps;
        }
        
        return schema;
      }
    } else {
      return inferType(json);
    }
  }

  public getOpenAPIObject() {
    return this.OpenAPIObject;
  }
}

export default ExportOpenAPI