const TX_KEY = 'expenseflow.transactions.v1'
const BUDGET_KEY = 'expenseflow.budgets.v1'
const THEME_KEY = 'expenseflow.theme.v1'

export const readTransactions = () => {
  try {
    const saved = localStorage.getItem(TX_KEY)
    if (saved) return JSON.parse(saved)
  } catch (error) { console.warn('Could not read saved transactions', error) }
  return [
    { id: 't1', title: 'Monthly salary', amount: 65000, type: 'income', category: 'Salary', date: '2026-11-01', note: 'November salary' },
    { id: 't2', title: 'Rent payment', amount: 12000, type: 'expense', category: 'Housing', date: '2026-11-03', note: '' },
    { id: 't3', title: 'Groceries', amount: 2450, type: 'expense', category: 'Food', date: '2026-11-05', note: 'Weekly shopping' },
    { id: 't4', title: 'Freelance design', amount: 8500, type: 'income', category: 'Freelance', date: '2026-11-08', note: '' },
    { id: 't5', title: 'Electricity bill', amount: 1850, type: 'expense', category: 'Bills', date: '2026-11-10', note: '' },
    { id: 't6', title: 'Weekend dinner', amount: 980, type: 'expense', category: 'Food', date: '2026-11-12', note: '' },
    { id: 't7', title: 'Metro & cab', amount: 720, type: 'expense', category: 'Transport', date: '2026-11-14', note: '' },
    { id: 't8', title: 'Online course', amount: 1499, type: 'expense', category: 'Education', date: '2026-11-16', note: '' }
  ]
}
export const saveTransactions = value => localStorage.setItem(TX_KEY, JSON.stringify(value))
export const readBudgets = () => {
  try { return JSON.parse(localStorage.getItem(BUDGET_KEY)) || { Food: 6000, Housing: 15000, Transport: 2500, Shopping: 4000, Bills: 3000, Education: 3000 } }
  catch { return { Food: 6000, Housing: 15000, Transport: 2500, Shopping: 4000, Bills: 3000, Education: 3000 } }
}
export const saveBudgets = value => localStorage.setItem(BUDGET_KEY, JSON.stringify(value))
export const readTheme = () => localStorage.getItem(THEME_KEY) || 'light'
export const saveTheme = value => localStorage.setItem(THEME_KEY, value)