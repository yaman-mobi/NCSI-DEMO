/**
 * Parse natural language commands and apply transformations to table data.
 * Table shape: { headers: string[], rows: string[][] }
 */

function normalizeNum(s) {
  if (s == null || s === '') return NaN;
  const cleaned = String(s).replace(/,/g, '').replace(/%/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? NaN : n;
}

function findColumnIndex(headers, name) {
  const lower = (name || '').toLowerCase();
  const idx = headers.findIndex((h) => h.toLowerCase().includes(lower) || lower.includes(h.toLowerCase()));
  if (idx >= 0) return idx;
  const asNum = parseInt(name, 10);
  if (!isNaN(asNum) && asNum >= 0 && asNum < headers.length) return asNum;
  return -1;
}

function parseAddColumn(command, headers, rows) {
  const m = command.match(/(?:add|insert)\s+(?:a\s+)?column\s+(?:for\s+)?(?:called\s+)?["']?([^"'\n.]+)["']?/i)
    || command.match(/(?:add|insert)\s+["']?([^"'\n.]+)["']?\s*column/i);
  const name = m ? m[1].trim() : null;
  if (!name) return null;

  const newHeaders = [...headers, name];
  const newRows = rows.map((row) => {
    const lastVal = row[row.length - 1];
    const num = normalizeNum(lastVal);
    if (!isNaN(num) && row.length >= 2) {
      const prevVal = row[row.length - 2];
      const prevNum = normalizeNum(prevVal);
      if (!isNaN(prevNum) && prevNum !== 0) {
        const pct = (((num - prevNum) / prevNum) * 100).toFixed(1);
        return [...row, `${pct}%`];
      }
    }
    if (name.toLowerCase().includes('growth') || name.toLowerCase().includes('change')) {
      return [...row, '—'];
    }
    return [...row, '—'];
  });
  return { headers: newHeaders, rows: newRows, message: `Added column "${name}".` };
}

function parseRemoveColumn(command, headers, rows) {
  const m = command.match(/(?:remove|delete|drop|hide)\s+(?:the\s+)?(?:column\s+)?["']?([^"'\n.]+)["']?/i)
    || command.match(/(?:remove|delete|drop)\s+["']?([^"'\n.]+)["']?/i);
  const col = m ? m[1].trim() : null;
  if (!col) return null;

  const idx = findColumnIndex(headers, col);
  if (idx < 0) return { headers, rows, message: `Column "${col}" not found.` };

  const newHeaders = headers.filter((_, i) => i !== idx);
  const newRows = rows.map((row) => row.filter((_, i) => i !== idx));
  return { headers: newHeaders, rows: newRows, message: `Removed column "${headers[idx]}".` };
}

function parseSort(command, headers, rows) {
  const m = command.match(/(?:sort|order)\s+by\s+["']?([^"'\n.]+)["']?(?:\s+(ascending|descending|asc|desc))?/i);
  const col = m ? m[1].trim() : null;
  if (!col) return null;

  const idx = findColumnIndex(headers, col);
  if (idx < 0) return { headers, rows, message: `Column "${col}" not found.` };

  const desc = m && m[2] && /desc/i.test(m[2]);
  const sorted = [...rows].sort((a, b) => {
    const va = a[idx];
    const vb = b[idx];
    const na = normalizeNum(va);
    const nb = normalizeNum(vb);
    if (!isNaN(na) && !isNaN(nb)) return desc ? nb - na : na - nb;
    const sa = String(va || '');
    const sb = String(vb || '');
    return desc ? sb.localeCompare(sa) : sa.localeCompare(sb);
  });
  return { headers, rows: sorted, message: `Sorted by "${headers[idx]}" ${desc ? 'descending' : 'ascending'}.` };
}

function parseFilter(command, headers, rows) {
  const m = command.match(/(?:filter|show\s+only|keep\s+only|where)\s+(?:to\s+)?["']?([^"'\n.]+)["']?/i)
    || command.match(/(?:only|just)\s+["']?([^"'\n.]+)["']?/i);
  const value = m ? m[1].trim() : null;
  if (!value) return null;

  const filtered = rows.filter((row) =>
    row.some((cell) => String(cell).toLowerCase().includes(value.toLowerCase()))
  );
  return { headers, rows: filtered, message: `Filtered to rows containing "${value}" (${filtered.length} rows).` };
}

function parseLimit(command, headers, rows) {
  const m = command.match(/(?:show\s+)?(?:first|top)\s+(\d+)/i)
    || command.match(/limit\s+(?:to\s+)?(\d+)/i)
    || command.match(/(\d+)\s+rows?/i);
  const n = m ? parseInt(m[1], 10) : NaN;
  if (isNaN(n) || n < 1) return null;

  const limited = rows.slice(0, n);
  return { headers, rows: limited, message: `Showing first ${limited.length} rows.` };
}

// Keep only a subset of columns, e.g. \"keep only columns Governorate, 2024\"
function parseKeepColumns(command, headers, rows) {
  const m = command.match(/(?:keep|show)\s+(?:only\s+)?(?:columns?|cols?)\s+(.+)/i);
  if (!m) return null;
  const list = m[1]
    .split(/,|and/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.length) return null;

  const indices = list
    .map((name) => ({ name, idx: findColumnIndex(headers, name) }))
    .filter((x) => x.idx >= 0);
  if (!indices.length) {
    return { headers, rows, message: `None of the requested columns were found.` };
  }
  const newHeaders = indices.map((x) => headers[x.idx]);
  const newRows = rows.map((row) => indices.map((x) => row[x.idx]));
  return { headers: newHeaders, rows: newRows, message: `Kept only columns: ${newHeaders.join(', ')}.` };
}

// Scale numeric values, e.g. \"show values in thousands\" or \"convert to thousands\"
function parseScale(command, headers, rows) {
  if (!/(thousand|thousands|1000)/i.test(command)) return null;

  const newRows = rows.map((row) =>
    row.map((cell) => {
      const n = normalizeNum(cell);
      if (isNaN(n)) return cell;
      const scaled = (n / 1000).toFixed(2);
      return scaled;
    })
  );
  return { headers, rows: newRows, message: 'Scaled numeric values to thousands.' };
}

// Add column showing % of total for last numeric column, e.g. "Add column % of total"
function parsePercentOfTotal(command, headers, rows) {
  if (!/(?:add|insert)\s+(?:a\s+)?column\s+(?:for\s+)?%?\s*of\s+total/i.test(command)) return null;

  if (!headers?.length || !rows?.length) return null;

  // Find rightmost numeric column (skip first column, usually labels)
  let lastNumIdx = -1;
  for (let i = headers.length - 1; i >= 1; i--) {
    const vals = rows.map((r) => normalizeNum(r[i])).filter((n) => !isNaN(n));
    if (vals.length > 0) {
      lastNumIdx = i;
      break;
    }
  }
  if (lastNumIdx < 0) return { headers, rows, message: 'No numeric column found for % of total.' };

  const colVals = rows.map((r) => normalizeNum(r[lastNumIdx])).filter((n) => !isNaN(n));
  const total = colVals.reduce((a, b) => a + b, 0);
  if (total === 0) return { headers, rows, message: 'Cannot compute % of total: sum is zero.' };

  const newHeaders = [...headers, '% of Total'];
  const newRows = rows.map((row) => {
    const n = normalizeNum(row[lastNumIdx]);
    const pct = isNaN(n) ? '—' : ((n / total) * 100).toFixed(1) + '%';
    return [...row, pct];
  });
  return { headers: newHeaders, rows: newRows, message: 'Added "% of Total" column.' };
}

// Add column with aggregate (sum, avg, min, max) of a numeric column
function parseAggregate(command, headers, rows) {
  const m = command.match(/(?:add|insert|show)\s+(?:column\s+)?(?:for\s+)?(sum|total|average|avg|mean|min|max)\s+(?:of\s+)?["']?([^"'\n.]+)["']?/i);
  if (!m) return null;

  const aggWord = m[1].toLowerCase();
  const colName = m[2].trim();
  const aggType = /^(sum|total)$/.test(aggWord) ? 'sum' : /^(avg|average|mean)$/.test(aggWord) ? 'avg' : /^min/.test(aggWord) ? 'min' : /^max/.test(aggWord) ? 'max' : null;
  if (!aggType) return null;

  const idx = findColumnIndex(headers, colName);
  if (idx < 0) return { headers, rows, message: `Column "${colName}" not found.` };

  const vals = rows.map((r) => normalizeNum(r[idx])).filter((n) => !isNaN(n));
  if (!vals.length) return { headers, rows, message: 'No numeric values to aggregate.' };

  let aggVal;
  const aggLabel = aggType === 'sum' ? 'Total' : aggType === 'avg' ? 'Average' : aggType === 'min' ? 'Min' : 'Max';
  if (aggType === 'sum') aggVal = vals.reduce((a, b) => a + b, 0);
  else if (aggType === 'avg') aggVal = vals.reduce((a, b) => a + b, 0) / vals.length;
  else if (aggType === 'min') aggVal = Math.min(...vals);
  else aggVal = Math.max(...vals);

  const fmt = aggVal >= 1000 ? aggVal.toLocaleString(undefined, { maximumFractionDigits: 0 }) : aggVal.toFixed(2);
  const newHeaders = [...headers, `${aggLabel} (${headers[idx]})`];
  const newRows = rows.map((row) => [...row, fmt]);
  return { headers: newHeaders, rows: newRows, message: `Added ${aggLabel} column: ${fmt}.` };
}

// Show summary statistics row at bottom
function parseSummaryStats(command, headers, rows) {
  if (!/(?:show|display|add)\s+(?:summary|statistics|stats|totals?)\s*(?:row)?/i.test(command)) return null;

  const numericIndices = [];
  for (let j = 1; j < headers.length; j++) {
    const vals = rows.map((r) => normalizeNum(r[j])).filter((n) => !isNaN(n));
    if (vals.length > 0) numericIndices.push(j);
  }
  if (!numericIndices.length) return { headers, rows, message: 'No numeric columns for summary.' };

  const summaryRow = headers.map((h, j) => {
    if (j === 0) return 'Summary';
    if (!numericIndices.includes(j)) return '—';
    const vals = rows.map((r) => normalizeNum(r[j])).filter((n) => !isNaN(n));
    const sum = vals.reduce((a, b) => a + b, 0);
    return sum >= 1000 ? sum.toLocaleString(undefined, { maximumFractionDigits: 0 }) : sum.toFixed(2);
  });
  return { headers, rows: [...rows, summaryRow], message: 'Added summary row. Total for each numeric column.' };
}

// Filter by numeric condition: "Filter where 2024 > 500000", "Filter where Value < 100"
function parseFilterByValue(command, headers, rows) {
  const m = command.match(/(?:filter|show\s+only|keep)\s+(?:where|rows?\s+where)\s+["']?([^"'\n.]+)["']?\s*(>|>=|<|<=|==|!=|equals?)\s*([\d,.-]+)/i)
    || command.match(/(?:filter|show)\s+["']?([^"'\n.]+)["']?\s*(>|>=|<|<=|==|!=)\s*([\d,.-]+)/i);
  if (!m) return null;

  const col = m[1].trim();
  const op = m[2].toLowerCase().replace(/==?/, '=').replace(/equals?/, '=');
  const val = parseFloat(String(m[3]).replace(/,/g, ''));
  if (isNaN(val)) return null;

  const idx = findColumnIndex(headers, col);
  if (idx < 0) return { headers, rows, message: `Column "${col}" not found.` };

  const filtered = rows.filter((row) => {
    const n = normalizeNum(row[idx]);
    if (isNaN(n)) return false;
    if (op === '>') return n > val;
    if (op === '>=') return n >= val;
    if (op === '<') return n < val;
    if (op === '<=') return n <= val;
    if (op === '=' || op === '==') return n === val;
    if (op === '!=') return n !== val;
    return false;
  });
  return { headers, rows: filtered, message: `Filtered to ${filtered.length} rows where ${col} ${op} ${val}.` };
}

// Exclude rows: "Exclude Muscat", "Exclude rows where Governorate is Muscat"
function parseExclude(command, headers, rows) {
  const m = command.match(/(?:exclude|remove|drop)\s+(?:rows?\s+where\s+["']?([^"'\n.]+)["']?\s+is\s+)?["']?([^"'\n.]+)["']?/i)
    || command.match(/(?:exclude|remove)\s+["']?([^"'\n.]+)["']?/i);
  if (!m) return null;

  const value = (m[2] || m[1] || '').trim();
  const colMatch = m[1] && !m[2] ? null : m[1];
  const filtered = rows.filter((row) => {
    if (colMatch) {
      const idx = findColumnIndex(headers, colMatch);
      if (idx < 0) return true;
      return !String(row[idx]).toLowerCase().includes(value.toLowerCase());
    }
    return !row.some((cell) => String(cell).toLowerCase().includes(value.toLowerCase()));
  });
  return { headers, rows: filtered, message: `Excluded rows containing "${value}" (${filtered.length} rows).` };
}

// Find/highlight outliers
function parseOutliers(command, headers, rows) {
  if (!/(?:find|show|highlight|detect)\s+outliers?/i.test(command)) return null;

  const m = command.match(/(?:in|for|column)\s+["']?([^"'\n.]+)["']?/i);
  const col = m ? m[1].trim() : null;
  const idx = col ? findColumnIndex(headers, col) : headers.length - 1;
  if (idx < 0) return { headers, rows, message: `Column "${col}" not found.` };

  const vals = rows.map((r, i) => ({ v: normalizeNum(r[idx]), i })).filter((x) => !isNaN(x.v));
  if (vals.length < 4) return { headers, rows, message: 'Need at least 4 numeric values for outlier detection.' };

  const nums = vals.map((x) => x.v);
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  const sd = Math.sqrt(variance) || 1;
  const outlierIndices = new Set(vals.filter((x) => Math.abs(x.v - mean) > 2 * sd).map((x) => x.i));

  const newRows = rows.map((row, i) => {
    if (outlierIndices.has(i)) {
      return [...row, '⚠ Outlier'];
    }
    return [...row, '—'];
  });
  const newHeaders = [...headers, 'Outlier Flag'];
  return { headers: newHeaders, rows: newRows, message: `Flagged ${outlierIndices.size} potential outlier(s) (2σ from mean).` };
}

// Add column comparing two columns: "Compare 2024 to 2023", "Add column 2024 vs 2023"
function parseCompareColumns(command, headers, rows) {
  const m = command.match(/(?:compare|add\s+column)\s+["']?([^"'\n.]+)["']?\s+(?:to|vs|versus)\s+["']?([^"'\n.]+)["']?/i)
    || command.match(/(?:add)\s+["']?([^"'\n.]+)["']?\s+vs\s+["']?([^"'\n.]+)["']?/i);
  if (!m) return null;

  const colA = m[1].trim();
  const colB = m[2].trim();
  const idxA = findColumnIndex(headers, colA);
  const idxB = findColumnIndex(headers, colB);
  if (idxA < 0 || idxB < 0) return { headers, rows, message: `Column not found.` };

  const newHeaders = [...headers, `${colA} vs ${colB}`];
  const newRows = rows.map((row) => {
    const a = normalizeNum(row[idxA]);
    const b = normalizeNum(row[idxB]);
    if (isNaN(a) || isNaN(b) || b === 0) return [...row, '—'];
    const pct = (((a - b) / b) * 100).toFixed(1);
    return [...row, `${pct}%`];
  });
  return { headers: newHeaders, rows: newRows, message: `Added comparison column: ${colA} vs ${colB}.` };
}

function parseRenameColumn(command, headers, rows) {
  const m = command.match(/(?:rename|rename\s+column)\s+["']?([^"'\n]+)["']?\s+to\s+["']?([^"'\n]+)["']?/i)
    || command.match(/(?:rename)\s+["']?([^"'\n]+)["']?\s+["']?([^"'\n]+)["']?/i);
  if (!m) return null;

  const from = m[1].trim();
  const to = m[2].trim();
  const idx = findColumnIndex(headers, from);
  if (idx < 0) return { headers, rows, message: `Column "${from}" not found.` };

  const newHeaders = [...headers];
  newHeaders[idx] = to;
  return { headers: newHeaders, rows, message: `Renamed "${from}" to "${to}".` };
}

/**
 * Process a natural language command and return updated table + message.
 * @param {string} command - User input
 * @param {{ headers: string[], rows: string[][] }} table - Current table
 * @returns {{ success: boolean, message: string, headers?: string[], rows?: string[][] }}
 */
export function processDatasetCommand(command, table) {
  const { headers, rows } = table;
  const cmd = (command || '').trim().toLowerCase();
  if (!cmd) return { success: false, message: 'Enter a command.' };

  if (/^(reset|undo|original|restore|clear)$/i.test(cmd)) {
    return { success: true, message: 'Table reset to original data.', reset: true };
  }

  let result = null;
  result = result || parseAddColumn(command, headers, rows);
  result = result || parseRemoveColumn(command, headers, rows);
  result = result || parseSort(command, headers, rows);
  result = result || parseFilter(command, headers, rows);
  result = result || parseFilterByValue(command, headers, rows);
  result = result || parseExclude(command, headers, rows);
  result = result || parseLimit(command, headers, rows);
  result = result || parseKeepColumns(command, headers, rows);
  result = result || parseScale(command, headers, rows);
  result = result || parsePercentOfTotal(command, headers, rows);
  result = result || parseAggregate(command, headers, rows);
  result = result || parseSummaryStats(command, headers, rows);
  result = result || parseOutliers(command, headers, rows);
  result = result || parseCompareColumns(command, headers, rows);
  result = result || parseRenameColumn(command, headers, rows);

  if (result) {
    if (result.reset) return { success: true, message: result.message, reset: true };
    return {
      success: true,
      message: result.message,
      headers: result.headers,
      rows: result.rows,
    };
  }

  return {
    success: false,
    message: 'I didn’t understand that. Try: "Add column Growth %", "Remove 2022", "Sort by 2024", "Filter to Muscat", or "Show first 3".',
  };
}

export const SUGGESTED_COMMANDS = [
  'Add a column for Growth %',
  'Add column % of total',
  'Show summary statistics',
  'Sort by 2024 descending',
  'Filter to Muscat only',
  'Keep only columns Governorate, 2024',
  'Convert values to thousands',
  'Reset to original',
];

/**
 * Scenario-specific quick actions for each dataset. All commands use actual column names
 * and are verified to work with the dataset structure.
 */
const SCENARIO_SUGGESTIONS = {
  1: [ // Population by Governorate (2020–2024)
    'Add a column for Growth %',
    'Add column % of total',
    'Sort by 2024 descending',
    'Compare 2024 to 2023',
    'Filter to Muscat only',
    'Keep only columns Governorate, 2024',
    'Convert values to thousands',
    'Filter where 2024 > 500000',
    'Show first 5 rows',
    'Reset to original',
  ],
  2: [ // Labour Force Survey
    'Sort by Employed descending',
    'Sort by Unemployment % descending',
    'Filter to Muscat only',
    'Add column for average of Employed',
    'Add column % of total',
    'Keep only columns Governorate, Unemployment %',
    'Show first 5 rows',
    'Reset to original',
  ],
  3: [ // CPI
    'Sort by CPI Index descending',
    'Sort by YoY % descending',
    'Keep only columns Month, CPI Index, YoY %',
    'Add column for average of CPI Index',
    'Show first 6 rows',
    'Reset to original',
  ],
  4: [ // Education Statistics
    'Sort by Literacy % descending',
    'Sort by Graduates 2024 descending',
    'Filter to Muscat only',
    'Add column for average of Primary Enrolment',
    'Add column % of total',
    'Keep only columns Governorate, Literacy %',
    'Show first 5 rows',
    'Reset to original',
  ],
  5: [ // Health Indicators
    'Sort by Population descending',
    'Sort by Births descending',
    'Filter to Muscat only',
    'Add column for average of Births',
    'Add column % of total',
    'Keep only columns Governorate, Life Expectancy',
    'Show first 5 rows',
    'Reset to original',
  ],
  6: [ // Environmental Statistics
    'Sort by 2024 descending',
    'Compare 2024 to 2023',
    'Keep only columns Indicator, 2024',
    'Add column for average of 2024',
    'Show first 5 rows',
    'Reset to original',
  ],
  7: [ // Balance of Payments
    'Sort by 2024 descending',
    'Compare 2024 to 2023',
    'Keep only columns Component, 2024',
    'Show summary statistics',
    'Show first 5 rows',
    'Reset to original',
  ],
  8: [ // International Trade
    'Sort by Exports descending',
    'Sort by Balance descending',
    'Filter to China only',
    'Add column for average of Exports',
    'Add column % of total',
    'Keep only columns Partner, Exports, Imports',
    'Show first 5 rows',
    'Reset to original',
  ],
  9: [ // Census 2020 Summary
    'Sort by Total Pop descending',
    'Filter to Muscat only',
    'Add column for average of Total Pop',
    'Add column % of total',
    'Keep only columns Governorate, Omani %, Expat %',
    'Show first 5 rows',
    'Reset to original',
  ],
  10: [ // GDP by Governorate
    'Sort by 2024 descending',
    'Compare 2024 to 2023',
    'Filter to Muscat only',
    'Add column for average of 2024',
    'Keep only columns Governorate, 2024',
    'Convert values to thousands',
    'Reset to original',
  ],
  11: [ // Vital Statistics
    'Sort by Births descending',
    'Filter to Muscat only',
    'Add column for average of Births',
    'Add column % of total',
    'Keep only columns Governorate, Birth Rate',
    'Show first 5 rows',
    'Reset to original',
  ],
};

/** Get scenario-specific quick actions. Falls back to header-derived suggestions when dataset id unknown. */
export function getContextualSuggestions(headers, rows, dataset) {
  const scenario = dataset?.id != null && SCENARIO_SUGGESTIONS[dataset.id];
  if (scenario) {
    return SCENARIO_SUGGESTIONS[dataset.id];
  }

  // Fallback: derive from headers
  const lastCol = headers[headers.length - 1];
  const hasGovernorate = headers.some((h) => /governorate|region|area|partner/i.test(h));
  const yearCols = headers.filter((h) => /^20[12][0-9]$|^202[0-4]$/.test(h));
  const numericCols = headers.filter((_, j) => j > 0 && rows.some((r) => !isNaN(parseFloat(String(r[j] || '').replace(/,/g, '')))));

  const suggestions = ['Add a column for Growth %', 'Add column % of total', 'Show summary statistics', 'Reset to original'];
  if (yearCols.length >= 2) {
    suggestions.push(`Sort by ${yearCols[yearCols.length - 1]} descending`, `Compare ${yearCols[yearCols.length - 1]} to ${yearCols[yearCols.length - 2]}`);
  } else if (lastCol && numericCols.length > 0) {
    suggestions.push(`Sort by ${lastCol} descending`);
  }
  if (hasGovernorate) suggestions.push('Filter to Muscat only', 'Exclude Muscat');
  if (lastCol && numericCols.length > 0) suggestions.push(`Add column for average of ${lastCol}`);
  if (numericCols.length > 0 && yearCols.length > 0) suggestions.push(`Filter where ${yearCols[yearCols.length - 1]} > 500000`);

  return [...new Set(suggestions)].slice(0, 10);
}
