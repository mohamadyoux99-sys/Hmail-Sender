/**
 * Processes Spintax in format {Option A|Option B|Option C}
 * Supports nested Spintax structures recursively
 */
export function parseSpintax(text: string): string {
  if (!text) return '';
  
  const spintaxRegex = /\{([^{}]+)\}/;
  let matches;
  let processed = text;
  
  while ((matches = spintaxRegex.exec(processed)) !== null) {
    const options = matches[1].split('|');
    const chosen = options[Math.floor(Math.random() * options.length)];
    processed = processed.replace(matches[0], chosen);
  }
  
  return processed;
}

/**
 * Replaces dynamic tags like {{name}}, {{company}}, {{email}} with actual recipient data
 */
export function replaceVariables(template: string, variables: Record<string, string>): string {
  if (!template) return '';
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    result = result.replace(regex, value || '');
  }
  
  return result;
}

/**
 * Full template renderer: parses spintax then replaces recipient variables
 */
export function renderEmail(template: string, variables: Record<string, string>): string {
  const withVariables = replaceVariables(template, variables);
  return parseSpintax(withVariables);
}
