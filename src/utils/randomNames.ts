const randomNames = [
  'harden',
  'margie',
  'zoom',
  'barf',
  'zombie',
  'crane',
  'albert',
  'ains',
  'epic',
  'legend',
  'venz',
  'tulip',
  'marc',
  'rugby',
  'bald',
]

export function pickRandomNames() {
  return randomNames[Math.floor(Math.random() * randomNames.length)]
}
