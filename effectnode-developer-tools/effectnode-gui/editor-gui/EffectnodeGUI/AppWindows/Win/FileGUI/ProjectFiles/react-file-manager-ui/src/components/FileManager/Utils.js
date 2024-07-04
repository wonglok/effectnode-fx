// Courtesy of Andreas Lundblad (https://programming.guide/worlds-most-copied-so-snippet.html)
export function humanReadableByteCount (bytes) {
  if (!(bytes >= 0)) {
    return '';
  }

  const unit = 1024;
  const absBytes = bytes === -Infinity ? Infinity : Math.abs(bytes);
  if (absBytes < unit) {
    return bytes + " B";
  }

  let exp = Math.round(Math.log(absBytes) / Math.log(unit));
  const th = Math.ceil(Math.pow(unit, exp) * (unit - 0.05));
  if (exp < 6 && absBytes >= th - ((th & 0xFFF) === 0xD00 ? 51 : 0)) {
    exp++;
  }

  const pre = 'kMGTPE'[exp - 1];
  if (exp > 4) {
    bytes /= unit;
    exp -= 1;
  }

  const val = bytes / Math.pow(unit, exp);

  return `${val.toFixed(1)} ${pre}B`;
}

export function stripLeadingDirectories (path) {
  if (!path) {
    return '';
  }

  const lastSlash = path.lastIndexOf('/');
  if (lastSlash !== -1) {
    return path.slice(lastSlash + 1);
  }

  return path;
}
