const BLOCKED_LOCATION_RULES = [
  {
    // Letchworth Garden Square / Rowland Way multi-storey (was SG6 3BF)
    eastingMin: 521900, eastingMax: 522300,
    northingMin: 232800, northingMax: 233200,
    message: 'The livestock location appears to be in a car park.'
  },
  {
    // Letchworth Town Hall Car Park, Broadway (was SG6 3PF)
    eastingMin: 521700, eastingMax: 522100,
    northingMin: 232700, northingMax: 233100,
    message: 'The livestock location appears to be in a car park.'
  },
  {
    // Hillshott Car Park, Letchworth (was SG6 1QH)
    eastingMin: 521500, eastingMax: 521900,
    northingMin: 232300, northingMax: 232700,
    message: 'The livestock location appears to be in a car park.'
  },
  {
    // Buckingham Palace / Palace Square (was SW1A 1AA)
    eastingMin: 528900, eastingMax: 529300,
    northingMin: 179500, northingMax: 179900,
    message: 'The livestock location appears to be in Buckingham Palace.'
  }
]

export function getBlockedLocationMessage(payload, componentName) {
  const easting = Number(payload?.[`${componentName}__easting`])
  const northing = Number(payload?.[`${componentName}__northing`])

  if (!easting || !northing) {
    return undefined
  }

  const matchedRule = BLOCKED_LOCATION_RULES.find(
    (rule) =>
      easting >= rule.eastingMin &&
      easting <= rule.eastingMax &&
      northing >= rule.northingMin &&
      northing <= rule.northingMax
  )

  return matchedRule?.message
}
