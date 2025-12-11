/**
 * File Handler Utility
 * 
 * Handles file operations for PWA file handling API
 */

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
}

/**
 * Read file as JSON
 */
export async function readFileAsJSON<T = unknown>(file: File): Promise<T> {
  const text = await readFileAsText(file);
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Invalid JSON file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Handle file selection for import
 */
export function handleFileSelect(
  accept: string = '.json,.csv',
  onFileSelected: (file: File) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };
  input.click();
}

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showOpenFilePicker' in window;
}

/**
 * Open file using File System Access API (if supported)
 */
export async function openFileWithFileSystemAccess(
  accept: Array<{ description: string; accept: Record<string, string[]> }> = [
    {
      description: 'JSON Files',
      accept: { 'application/json': ['.json'] },
    },
    {
      description: 'CSV Files',
      accept: { 'text/csv': ['.csv'] },
    },
  ]
): Promise<File | null> {
  if (!isFileSystemAccessSupported()) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileHandle = await (window as any).showOpenFilePicker({
      types: accept,
      multiple: false,
    });

    const file = await fileHandle[0].getFile();
    return file;
  } catch (error) {
    // User cancelled or error occurred
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Error opening file:', error);
    }
    return null;
  }
}
