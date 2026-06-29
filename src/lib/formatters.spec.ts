import {
  onlyDigits,
  formatCpf,
  formatBirthDate,
  birthDateToIsoDate,
  isValidBirthDate,
} from './formatters'

describe('onlyDigits', () => {
  it('removes all non-digit characters', () => {
    expect(onlyDigits('123.456.789-00')).toBe('12345678900')
  })

  it('returns empty string when no digits', () => {
    expect(onlyDigits('abc-def')).toBe('')
  })

  it('returns same string if already digits only', () => {
    expect(onlyDigits('12345')).toBe('12345')
  })

  it('handles empty string', () => {
    expect(onlyDigits('')).toBe('')
  })

  it('handles mixed content', () => {
    expect(onlyDigits('a1b2c3')).toBe('123')
  })
})

describe('formatCpf', () => {
  it('returns empty string for empty input', () => {
    expect(formatCpf('')).toBe('')
  })

  it('formats 3 digits without dot', () => {
    expect(formatCpf('123')).toBe('123')
  })

  it('formats 4 digits with one dot', () => {
    expect(formatCpf('1234')).toBe('123.4')
  })

  it('formats 6 digits', () => {
    expect(formatCpf('123456')).toBe('123.456')
  })

  it('formats 7 digits with two dots', () => {
    expect(formatCpf('1234567')).toBe('123.456.7')
  })

  it('formats 9 digits', () => {
    expect(formatCpf('123456789')).toBe('123.456.789')
  })

  it('formats 10 digits with dash', () => {
    expect(formatCpf('1234567890')).toBe('123.456.789-0')
  })

  it('formats full 11-digit CPF', () => {
    expect(formatCpf('12345678901')).toBe('123.456.789-01')
  })

  it('truncates at 11 digits', () => {
    expect(formatCpf('123456789012')).toBe('123.456.789-01')
  })

  it('handles already formatted CPF input', () => {
    expect(formatCpf('123.456.789-01')).toBe('123.456.789-01')
  })
})

describe('formatBirthDate', () => {
  it('returns empty string for empty input', () => {
    expect(formatBirthDate('')).toBe('')
  })

  it('formats 2 digits without slash', () => {
    expect(formatBirthDate('01')).toBe('01')
  })

  it('formats 3 digits with slash', () => {
    expect(formatBirthDate('011')).toBe('01/1')
  })

  it('formats 4 digits MM', () => {
    expect(formatBirthDate('0112')).toBe('01/12')
  })

  it('formats 5 digits with second slash', () => {
    expect(formatBirthDate('01121')).toBe('01/12/1')
  })

  it('formats full 8-digit date', () => {
    expect(formatBirthDate('01121990')).toBe('01/12/1990')
  })

  it('truncates at 8 digits', () => {
    expect(formatBirthDate('011219901')).toBe('01/12/1990')
  })

  it('strips non-digits from input', () => {
    expect(formatBirthDate('01/12/1990')).toBe('01/12/1990')
  })
})

describe('birthDateToIsoDate', () => {
  it('converts valid ddmmyyyy to yyyy-mm-dd', () => {
    expect(birthDateToIsoDate('01121990')).toBe('1990-12-01')
  })

  it('returns empty string if not 8 digits', () => {
    expect(birthDateToIsoDate('0112199')).toBe('')
    expect(birthDateToIsoDate('')).toBe('')
  })

  it('handles formatted input by stripping non-digits', () => {
    expect(birthDateToIsoDate('01/12/1990')).toBe('1990-12-01')
  })

  it('converts first day of year', () => {
    expect(birthDateToIsoDate('01012000')).toBe('2000-01-01')
  })

  it('converts last day of year', () => {
    expect(birthDateToIsoDate('31122023')).toBe('2023-12-31')
  })
})

describe('isValidBirthDate', () => {
  it('returns true for a valid past date', () => {
    expect(isValidBirthDate('01011990')).toBe(true)
  })

  it('returns false for an empty/short string', () => {
    expect(isValidBirthDate('')).toBe(false)
    expect(isValidBirthDate('0101')).toBe(false)
  })

  it('returns false for an impossible date (Feb 30)', () => {
    expect(isValidBirthDate('30021990')).toBe(false)
  })

  it('returns false for month 13', () => {
    expect(isValidBirthDate('01131990')).toBe(false)
  })

  it('returns false for a future date', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const day   = String(futureDate.getDate()).padStart(2, '0')
    const month = String(futureDate.getMonth() + 1).padStart(2, '0')
    const year  = String(futureDate.getFullYear())
    expect(isValidBirthDate(`${day}${month}${year}`)).toBe(false)
  })

  it('returns true for today', () => {
    const today = new Date()
    const day   = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year  = String(today.getFullYear())
    expect(isValidBirthDate(`${day}${month}${year}`)).toBe(true)
  })
})
