const settings = {
  symbol: '$', // default currency symbol is '$'
  format: '%s%v', // controls output: %s = symbol, %v = value (can be object, see docs)
  decimal: '.', // decimal point separator
  thousand: ',', // thousands separator
  precision: 2, // decimal places
  grouping: 3, // digit grouping (not implemented yet)
  stripZeros: false, // strip insignificant zeros from decimal part
  fallback: 0, // value returned on unformat() failure
};

function unformat(
  value,
  decimal = settings.decimal,
  fallback = settings.fallback
) {
  // Recursively unformat arrays:
  if (Array.isArray(value)) {
    return value.map((val) => unformat(val, decimal, fallback));
  }

  // Return the value as-is if it's already a number:
  if (typeof value === 'number') return value;

  // Build regex to strip out everything except digits, decimal point and minus sign:
  const regex = new RegExp('[^0-9-(-)-' + decimal + ']', ['g']);
  const unformattedValueString = ('' + value)
    .replace(regex, '') // strip out any cruft
    .replace(decimal, '.') // make sure decimal point is standard
    .replace(/\(([-]*\d*[^)]?\d+)\)/g, '-$1') // replace bracketed values with negatives
    .replace(/\((.*)\)/, ''); // remove any brackets that do not have numeric value

  /**
   * Handling -ve number and bracket, eg.
   * (-100) = 100, -(100) = 100, --100 = 100
   */
  const negative = (unformattedValueString.match(/-/g) || 2).length % 2,
    absUnformatted = parseFloat(unformattedValueString.replace(/-/g, '')),
    unformatted = absUnformatted * (negative ? -1 : 1);

  // This will fail silently which may cause trouble, let's wait and see:
  return !isNaN(unformatted) ? unformatted : fallback;
}

module.exports = unformat;
