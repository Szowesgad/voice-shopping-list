import type { ShoppingItem } from '../types';

/**
 * Generate plain text format of the shopping list
 * @param items Shopping list items
 * @param title Title of the shopping list
 * @returns Plain text representation
 */
export const generatePlainText = (
  items: ShoppingItem[],
  title: string = 'Shopping List'
): string => {
  const headerSection = `${title}\n${'-'.repeat(title.length)}\n\n`;
  
  const completedItems = items
    .filter(item => item.completed)
    .map(item => `[x] ${item.text}`)
    .join('\n');
  
  const incompleteItems = items
    .filter(item => !item.completed)
    .map(item => `[ ] ${item.text}`)
    .join('\n');
  
  const timestamp = `\n\nCreated: ${new Date().toLocaleString()}`;
  
  return [
    headerSection,
    incompleteItems,
    completedItems ? '\n\nCompleted Items:\n' + completedItems : '',
    timestamp
  ].join('');
};

/**
 * Generate CSV format of the shopping list
 * @param items Shopping list items
 * @returns CSV representation
 */
export const generateCSV = (items: ShoppingItem[]): string => {
  const header = 'Item,Completed,Created\n';
  
  const rows = items.map(item => {
    const text = item.text.includes(',') ? `"${item.text}"` : item.text;
    const completed = item.completed ? 'Yes' : 'No';
    const created = new Date(item.createdAt).toLocaleString();
    return `${text},${completed},${created}`;
  }).join('\n');
  
  return header + rows;
};

/**
 * Generate JSON format of the shopping list
 * @param items Shopping list items
 * @param title Title of the shopping list
 * @returns JSON representation
 */
export const generateJSON = (
  items: ShoppingItem[],
  title: string = 'Shopping List'
): string => {
  const data = {
    title,
    createdAt: new Date().toISOString(),
    items: items.map(item => ({
      id: item.id,
      text: item.text,
      completed: item.completed,
      createdAt: new Date(item.createdAt).toISOString()
    }))
  };
  
  return JSON.stringify(data, null, 2);
};

/**
 * Generate HTML format of the shopping list
 * @param items Shopping list items
 * @param title Title of the shopping list
 * @returns HTML representation
 */
export const generateHTML = (
  items: ShoppingItem[],
  title: string = 'Shopping List'
): string => {
  const completedItems = items.filter(item => item.completed);
  const incompleteItems = items.filter(item => !item.completed);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1 {
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      color: #444;
    }
    h2 {
      color: #555;
      margin-top: 25px;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    .completed {
      text-decoration: line-through;
      color: #999;
    }
    .footer {
      margin-top: 30px;
      font-size: 0.8em;
      color: #777;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  
  <h2>Items to Buy</h2>
  <ul>
    ${incompleteItems.map(item => `
    <li>${item.text}</li>
    `).join('')}
  </ul>
  
  ${completedItems.length > 0 ? `
  <h2>Completed Items</h2>
  <ul>
    ${completedItems.map(item => `
    <li class="completed">${item.text}</li>
    `).join('')}
  </ul>
  ` : ''}
  
  <div class="footer">
    Created: ${new Date().toLocaleString()}
  </div>
</body>
</html>`;
};

/**
 * Download content as a file
 * @param content Content to download
 * @param filename Filename to save as
 * @param contentType Content type (MIME type)
 */
export const downloadFile = (
  content: string,
  filename: string,
  contentType: string
): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Download shopping list in the specified format
 * @param items Shopping list items
 * @param format Format to download as
 * @param title Title of the shopping list
 */
export const downloadShoppingList = (
  items: ShoppingItem[],
  format: 'txt' | 'csv' | 'json' | 'html',
  title: string = 'Shopping List'
): void => {
  let content = '';
  let filename = '';
  let contentType = '';
  
  switch (format) {
    case 'txt':
      content = generatePlainText(items, title);
      filename = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      contentType = 'text/plain';
      break;
    
    case 'csv':
      content = generateCSV(items);
      filename = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
      contentType = 'text/csv';
      break;
    
    case 'json':
      content = generateJSON(items, title);
      filename = `${title.toLowerCase().replace(/\s+/g, '-')}.json`;
      contentType = 'application/json';
      break;
    
    case 'html':
      content = generateHTML(items, title);
      filename = `${title.toLowerCase().replace(/\s+/g, '-')}.html`;
      contentType = 'text/html';
      break;
  }
  
  downloadFile(content, filename, contentType);
};
