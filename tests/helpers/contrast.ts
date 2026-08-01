/** Relative luminance per WCAG 2.1, exact sRGB piecewise formula. */
export function relativeLuminance(hex: string): number {
  const n = hex.replace('#', '')
  const channels = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  const linear = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  )
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Normalises a computed CSS colour (`rgb(..)` or `rgba(..)`) to uppercase hex. */
export function rgbToHex(cssColour: string): string {
  const parts = cssColour.match(/[\d.]+/g)
  if (!parts || parts.length < 3) {
    throw new Error(`cannot parse colour: ${cssColour}`)
  }
  return (
    '#' +
    parts
      .slice(0, 3)
      .map((v) => Math.round(Number(v)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}
