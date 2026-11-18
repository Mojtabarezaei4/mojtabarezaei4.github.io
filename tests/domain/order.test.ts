import { expect, test } from 'vitest'
import { SYSTEM_KEYS } from '../../src/domain/types'

test('systems are ordered 6-6, 5-1, 6-2, 4-2', () => {
  expect(SYSTEM_KEYS).toEqual(['6-6', '5-1', '6-2', '4-2'])
})
