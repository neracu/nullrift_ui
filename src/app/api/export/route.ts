/**
 * Export API Endpoint
 * 
 * Handles component export requests, generates files in the requested format,
 * and returns them as downloadable content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportComponent } from '@/lib/export';
import type { ExportRequest, ExportResponse } from '@/types/export';

/**
 * POST /api/export
 * 
 * Export a component to the specified format
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as ExportRequest;

    // Validate request
    if (!body.schema) {
      return NextResponse.json(
        { error: 'Component schema is required' },
        { status: 400 }
      );
    }

    if (!body.format) {
      return NextResponse.json(
        { error: 'Export format is required' },
        { status: 400 }
      );
    }

    // Validate format
    const validFormats = ['react-ts', 'react-js', 'vue', 'html'];
    if (!validFormats.includes(body.format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Export component
    const result: ExportResponse = await exportComponent({
      schema: body.schema,
      format: body.format,
      options: body.options,
      tuningState: body.tuningState,
    });

    // Return successful response
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Export error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes('Unsupported export format')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Export failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export
 * 
 * Get information about available export formats
 */
export async function GET() {
  return NextResponse.json({
    formats: [
      {
        id: 'react-ts',
        name: 'React + TypeScript',
        description: 'Modern React component with TypeScript, hooks, and type safety',
        extensions: ['.tsx', '.ts'],
      },
      {
        id: 'react-js',
        name: 'React + JavaScript',
        description: 'React component with JavaScript and PropTypes',
        extensions: ['.jsx', '.js'],
      },
      {
        id: 'vue',
        name: 'Vue 3',
        description: 'Vue 3 Single File Component with Composition API and TypeScript',
        extensions: ['.vue', '.ts'],
      },
      {
        id: 'html',
        name: 'HTML + CSS + JS',
        description: 'Vanilla HTML with Tailwind CSS and vanilla JavaScript',
        extensions: ['.html', '.css', '.js'],
      },
    ],
    options: {
      includeTypes: {
        type: 'boolean',
        default: true,
        description: 'Include TypeScript type definitions',
        applicableTo: ['react-ts', 'vue'],
      },
      includeTests: {
        type: 'boolean',
        default: false,
        description: 'Generate test files',
        applicableTo: ['react-ts', 'react-js', 'vue'],
      },
      includeStorybook: {
        type: 'boolean',
        default: false,
        description: 'Generate Storybook stories',
        applicableTo: ['react-ts', 'react-js', 'vue'],
      },
      bundled: {
        type: 'boolean',
        default: false,
        description: 'Bundle as single file vs multiple files',
        applicableTo: ['html'],
      },
      includePackageJson: {
        type: 'boolean',
        default: true,
        description: 'Include package.json with dependencies',
        applicableTo: ['react-ts', 'react-js', 'vue'],
      },
      includeReadme: {
        type: 'boolean',
        default: true,
        description: 'Include README with usage instructions',
        applicableTo: ['react-ts', 'react-js', 'vue', 'html'],
      },
      includeComments: {
        type: 'boolean',
        default: true,
        description: 'Add code comments and JSDoc',
        applicableTo: ['react-ts', 'react-js', 'vue', 'html'],
      },
    },
  });
}

// Made with Bob