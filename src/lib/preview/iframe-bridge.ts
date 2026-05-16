/**
 * Iframe Bridge
 * 
 * Handles safe communication between parent window and preview iframe
 * using the postMessage API with message validation and error handling.
 */

import type { IframeMessage, IframeMessageType } from './types';

/**
 * Message handler callback type
 */
type MessageHandler = (message: IframeMessage) => void;

/**
 * Iframe Bridge Class
 * 
 * Manages bidirectional communication between parent and iframe:
 * - Message sending with queuing
 * - Message receiving with validation
 * - Ready state management
 * - Error handling
 */
export class IframeBridge {
  private iframe: HTMLIFrameElement;
  private ready: boolean = false;
  private messageQueue: IframeMessage[] = [];
  private handlers: Map<IframeMessageType, Set<MessageHandler>>;
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private origin: string;

  constructor(iframe: HTMLIFrameElement, origin: string = '*') {
    this.iframe = iframe;
    this.origin = origin;
    this.handlers = new Map();
    this.setupMessageListener();
  }

  /**
   * Setup message listener for iframe communication
   */
  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent) => {
      // Verify message source
      if (event.source !== this.iframe.contentWindow) {
        return;
      }

      // Validate message structure
      if (!this.isValidMessage(event.data)) {
        console.warn('Invalid message received from iframe:', event.data);
        return;
      }

      const message = event.data as IframeMessage;
      this.handleMessage(message);
    };

    window.addEventListener('message', this.messageListener);
  }

  /**
   * Validate message structure
   */
  private isValidMessage(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.type === 'string' &&
      'payload' in data
    );
  }

  /**
   * Handle incoming message from iframe
   */
  private handleMessage(message: IframeMessage): void {
    // Handle ready message specially
    if (message.type === 'ready') {
      this.ready = true;
      this.flushMessageQueue();
    }

    // Call registered handlers
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in message handler for ${message.type}:`, error);
        }
      });
    }
  }

  /**
   * Send message to iframe
   */
  sendMessage(message: IframeMessage): void {
    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = Date.now();
    }

    // Queue message if iframe not ready
    if (!this.ready) {
      this.messageQueue.push(message);
      return;
    }

    // Send message
    try {
      this.iframe.contentWindow?.postMessage(message, this.origin);
    } catch (error) {
      console.error('Failed to send message to iframe:', error);
      this.handleError(new Error('Failed to send message to iframe'));
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /**
   * Register message handler
   */
  on(type: IframeMessageType, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    const handlers = this.handlers.get(type)!;
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    };
  }

  /**
   * Remove message handler
   */
  off(type: IframeMessageType, handler: MessageHandler): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    }
  }

  /**
   * Remove all handlers for a message type
   */
  offAll(type: IframeMessageType): void {
    this.handlers.delete(type);
  }

  /**
   * Handle error
   */
  private handleError(error: Error): void {
    this.sendMessage({
      type: 'error',
      payload: {
        message: error.message,
        stack: error.stack
      }
    });
  }

  /**
   * Check if iframe is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Wait for iframe to be ready
   */
  waitForReady(timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ready) {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error('Iframe ready timeout'));
      }, timeout);

      const unsubscribe = this.on('ready', () => {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      });
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Remove message listener
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    // Clear handlers
    this.handlers.clear();

    // Clear message queue
    this.messageQueue = [];

    // Reset ready state
    this.ready = false;
  }
}

/**
 * Create iframe bridge instance
 */
export function createIframeBridge(
  iframe: HTMLIFrameElement,
  origin?: string
): IframeBridge {
  return new IframeBridge(iframe, origin);
}

/**
 * Generate iframe HTML content with preview renderer
 */
export function generateIframeContent(options: {
  styles?: string;
  scripts?: string;
  bodyContent?: string;
}): string {
  const { styles = '', scripts = '', bodyContent = '' } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Custom Styles -->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    ${styles}
  </style>
</head>
<body>
  <!-- Preview Content -->
  <div id="preview-root">${bodyContent}</div>
  
  <!-- Communication Script -->
  <script>
    // Notify parent that iframe is ready
    window.parent.postMessage({
      type: 'ready',
      payload: {},
      timestamp: Date.now()
    }, '*');
    
    // Listen for messages from parent
    window.addEventListener('message', (event) => {
      const message = event.data;
      
      if (!message || typeof message !== 'object') {
        return;
      }
      
      // Handle different message types
      switch (message.type) {
        case 'render':
          handleRender(message.payload);
          break;
        case 'update':
          handleUpdate(message.payload);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    });
    
    // Handle render message
    function handleRender(payload) {
      console.log('Render:', payload);
      // Rendering logic will be implemented by the renderer
    }
    
    // Handle update message
    function handleUpdate(payload) {
      console.log('Update:', payload);
      // Update logic will be implemented by the renderer
    }
    
    // Send message to parent
    function sendToParent(type, payload) {
      window.parent.postMessage({
        type,
        payload,
        timestamp: Date.now()
      }, '*');
    }
    
    // Handle form submission
    function handleSubmit(data) {
      sendToParent('submit', data);
    }
    
    // Handle field change
    function handleFieldChange(fieldId, value) {
      sendToParent('fieldChange', { fieldId, value });
    }
    
    // Handle validation error
    function handleValidationError(fieldId, error) {
      sendToParent('validationError', { fieldId, error });
    }
    
    // Expose functions globally
    window.previewBridge = {
      handleSubmit,
      handleFieldChange,
      handleValidationError
    };
    
    ${scripts}
  </script>
</body>
</html>
  `.trim();
}

/**
 * Inject styles into iframe
 */
export function injectStyles(iframe: HTMLIFrameElement, styles: string): void {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      throw new Error('Cannot access iframe document');
    }

    const styleElement = doc.createElement('style');
    styleElement.textContent = styles;
    doc.head.appendChild(styleElement);
  } catch (error) {
    console.error('Failed to inject styles into iframe:', error);
  }
}

/**
 * Execute script in iframe
 */
export function executeScript(iframe: HTMLIFrameElement, script: string): void {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      throw new Error('Cannot access iframe document');
    }

    const scriptElement = doc.createElement('script');
    scriptElement.textContent = script;
    doc.body.appendChild(scriptElement);
  } catch (error) {
    console.error('Failed to execute script in iframe:', error);
  }
}

// Made with Bob