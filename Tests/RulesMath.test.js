import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateBab, calculateSave } from '../js/rules/RulesMath.js';

describe('RulesMath Module', () => {
  it('calculateBab: good progression scales levels directly', () => {
    assert.equal(calculateBab('good', 1), 1);
    assert.equal(calculateBab('good', 5), 5);
    assert.equal(calculateBab('good', 20), 20);
  });

  it('calculateBab: avg progression scales to 75%', () => {
    assert.equal(calculateBab('avg', 1), 0);
    assert.equal(calculateBab('avg', 2), 1);
    assert.equal(calculateBab('avg', 4), 3);
    assert.equal(calculateBab('avg', 20), 15);
  });

  it('calculateBab: poor progression scales to 50%', () => {
    assert.equal(calculateBab('poor', 1), 0);
    assert.equal(calculateBab('poor', 2), 1);
    assert.equal(calculateBab('poor', 5), 2);
    assert.equal(calculateBab('poor', 20), 10);
  });

  it('calculateSave: good save formulas', () => {
    assert.equal(calculateSave('good', 1), 2); // 2 + 0.5 * 1
    assert.equal(calculateSave('good', 2), 3); // 2 + 0.5 * 2
    assert.equal(calculateSave('good', 5), 4); // 2 + 0.5 * 5 = 4.5 -> 4
    assert.equal(calculateSave('good', 20), 12);
  });

  it('calculateSave: poor save formulas', () => {
    assert.equal(calculateSave('poor', 1), 0);
    assert.equal(calculateSave('poor', 3), 1);
    assert.equal(calculateSave('poor', 6), 2);
    assert.equal(calculateSave('poor', 20), 6);
  });
});
