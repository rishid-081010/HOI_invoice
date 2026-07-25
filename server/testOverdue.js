/**
 * CLI Test Script for Overdue Evaluation Engine
 * Tests boundary cases (-1, 0, 1, 3, 4, 10, 11, 30 days, paid status)
 * 
 * Usage: node server/testOverdue.js
 */

import { evaluateInvoice, parseDDMMYYYY, calculateDaysOverdue } from './overdueEngine.js';

// Reference date for deterministic testing: 2026-07-24
const REF_DATE = new Date('2026-07-24T00:00:00.000Z');

// Test suite boundary cases
const TEST_CASES = [
  {
    name: 'Boundary Case: -1 days overdue (Future invoice)',
    dueDate: '25-07-2026',
    status: 'unpaid',
    expectedDays: -1,
    expectedStage: 0
  },
  {
    name: 'Boundary Case: 0 days overdue (Due today)',
    dueDate: '24-07-2026',
    status: 'unpaid',
    expectedDays: 0,
    expectedStage: 0
  },
  {
    name: 'Boundary Case: 1 day overdue (Stage 1 lower bound)',
    dueDate: '23-07-2026',
    status: 'unpaid',
    expectedDays: 1,
    expectedStage: 1
  },
  {
    name: 'Boundary Case: 3 days overdue (Stage 1 upper bound)',
    dueDate: '21-07-2026',
    status: 'unpaid',
    expectedDays: 3,
    expectedStage: 1
  },
  {
    name: 'Boundary Case: 4 days overdue (Stage 2 lower bound)',
    dueDate: '20-07-2026',
    status: 'unpaid',
    expectedDays: 4,
    expectedStage: 2
  },
  {
    name: 'Boundary Case: 10 days overdue (Stage 2 upper bound)',
    dueDate: '14-07-2026',
    status: 'unpaid',
    expectedDays: 10,
    expectedStage: 2
  },
  {
    name: 'Boundary Case: 11 days overdue (Stage 3 lower bound)',
    dueDate: '13-07-2026',
    status: 'unpaid',
    expectedDays: 11,
    expectedStage: 3
  },
  {
    name: 'Boundary Case: 30 days overdue (Stage 3 severe overdue)',
    dueDate: '24-06-2026',
    status: 'unpaid',
    expectedDays: 30,
    expectedStage: 3
  },
  {
    name: 'Boundary Case: Paid Status (30 days past due, but marked paid)',
    dueDate: '24-06-2026',
    status: 'paid',
    expectedDays: 30,
    expectedStage: 0
  }
];

function runTests() {
  console.log('====================================================');
  console.log('🚀 OVERDUE EVALUATION ENGINE - CLI TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  // Test DD-MM-YYYY parser validity
  const testDateStr = '24-07-2026';
  const parsedDate = parseDDMMYYYY(testDateStr);
  if (parsedDate && parsedDate.getFullYear() === 2026 && parsedDate.getMonth() === 6 && parsedDate.getDate() === 24) {
    console.log(`[PASS] DD-MM-YYYY Parser: '${testDateStr}' correctly parsed to Date object`);
    passedCount++;
  } else {
    console.error(`[FAIL] DD-MM-YYYY Parser failed for '${testDateStr}'`);
    failedCount++;
  }

  TEST_CASES.forEach((tc, idx) => {
    const mockInvoice = {
      invoiceId: `TEST-INV-${1000 + idx}`,
      clientName: 'Test Client Corp',
      clientEmail: 'test@example.com',
      amount: 1500.00,
      dueDate: tc.dueDate,
      status: tc.status,
      paymentLink: `https://pay.example.com/test-${idx}`
    };

    const result = evaluateInvoice(mockInvoice, REF_DATE);

    const daysMatch = result.daysOverdue === tc.expectedDays;
    const stageMatch = result.stage === tc.expectedStage;

    if (daysMatch && stageMatch) {
      console.log(`[PASS] ${tc.name}`);
      console.log(`       DueDate: ${tc.dueDate} | Status: ${tc.status} -> Days: ${result.daysOverdue} (expected ${tc.expectedDays}), Stage: ${result.stage} (expected ${tc.expectedStage})`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${tc.name}`);
      console.error(`       Expected: days=${tc.expectedDays}, stage=${tc.expectedStage}`);
      console.error(`       Received: days=${result.daysOverdue}, stage=${result.stage}`);
      failedCount++;
    }
  });

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

runTests();
