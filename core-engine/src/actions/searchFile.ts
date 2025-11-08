import { exec } from 'child_process';
import { promisify } from 'util';
// import { ActionResult } from '@shared/types';
interface ActionResult {
  requestId: string;
  ok: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Search for files on Windows
 * Uses 'dir' command with recursion
 * Params: { query: string, directory?: string, maxResults?: number }
 */
export const searchFile = async (params: any, requestId: string): Promise<ActionResult> => {
  const { query, directory = 'C:\\Users', maxResults = 10 } = params;
  
  if (!query) {
    return {
      requestId,
      ok: false,
      error: 'Missing required parameter: query',
      timestamp: Date.now()
    };
  }
  
  try {
    // Use Windows 'dir' command with /s (subdirectories) and /b (bare format)
    // Search in user directory by default to avoid permission issues
    const searchDir = directory || process.env.USERPROFILE || 'C:\\Users';
    const command = `dir /s /b "${searchDir}\\*${query}*" 2>nul`;
    
    console.log(`[searchFile] Executing: ${command}`);
    
    const { stdout } = await execAsync(command, { 
      timeout: 10000, // 10 second timeout
      maxBuffer: 1024 * 1024 // 1MB buffer
    });
    
    const files = stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(filePath => ({
        path: filePath.trim(),
        name: path.basename(filePath.trim()),
        directory: path.dirname(filePath.trim())
      }))
      .slice(0, maxResults);
    
    if (files.length === 0) {
      return {
        requestId,
        ok: true,
        data: {
          files: [],
          count: 0,
          message: `No files found matching "${query}"`
        },
        timestamp: Date.now()
      };
    }
    
    return {
      requestId,
      ok: true,
      data: { 
        files,
        count: files.length,
        query,
        message: `Found ${files.length} file(s) matching "${query}"`
      },
      timestamp: Date.now()
    };
    
  } catch (err: any) {
    // Even if no files found, dir returns exit code 1
    // Check if it's a "file not found" vs real error
    if (err.message.includes('File Not Found') || err.stdout === '') {
      return {
        requestId,
        ok: true,
        data: {
          files: [],
          count: 0,
          message: `No files found matching "${query}"`
        },
        timestamp: Date.now()
      };
    }
    
    return {
      requestId,
      ok: false,
      error: `Search failed: ${err.message}`,
      timestamp: Date.now()
    };
  }
};