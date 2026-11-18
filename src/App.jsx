import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, ChartNoAxesCombined, Wallet, Settings,
  Search, Plus, Bell, ChevronDown, ChevronLeft, ChevronRight, Menu, X,
  Sun, Moon, Download, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Utensils, House, Car, ShoppingBag, HeartPulse, GraduationCap, BriefcaseBusiness,
  CircleDollarSign, Pencil, Trash2, CalendarDays, Filter, Sparkles, Check,
  TrendingUp, PiggyBank, CreditCard
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell
} from 'recharts'
import { readTransactions, saveTransactions, readBudgets, saveBudgets, readTheme, saveTheme } from './storage'

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
const categories = ['Food', 'Housing', 'Transport', 'Shopping', 'Bills', 'Health', 'Education', 'Entertainment', 'Salary', 'Freelance', 'Other']
const categoryColors = { Food: '#f59e0b', Housing: '#8b5cf6', Transport: '#22a6a1', Shopping: '#f07878', Bills: '#6097e8', Health: '#e879b0', Education: '#64748b', Entertainment: '#a78bfa', Salary: '#20b486', Freelance: '#3989e8', Other: '#94a3b8' }
const categoryIcons = { Food: Utensils, Housing: House, Transport: Car, Shopping: ShoppingBag, Bills: CreditCard, Health: HeartPulse, Education: GraduationCap, Salary: BriefcaseBusiness, Freelance: CircleDollarSign, Entertainment: Sparkles, Other: Wallet }
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const today = new Date()
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

function App() {
  const [transactions, setTransactions] = useState(readTransactions)
  const [budgets, setBudgets] = useState(readBudgets)
  const [theme, setTheme] = useState(readTheme)
  const [page, setPage] = useState('Overview')
  const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`)
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { saveTransactions(transactions) }, [transactions])
  useEffect(() => { saveBudgets(budgets) }, [budgets])
  useEffect(() => { saveTheme(theme); document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t) }, [toast])

  const monthTx = useMemo(() => transactions.filter(t => t.date?.startsWith(month)), [transactions, month])
  const income = monthTx.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0)
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0)
  const balance = income - expenses
  const savings = income ? Math.max(0, Math.round((balance / income) * 100)) : 0
  const filtered = useMemo(() => [...transactions].sort((a,b) => b.date.localeCompare(a.date)).filter(t => {
    const q = query.toLowerCase()
    return (t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q))
      && (filterType === 'all' || t.type === filterType)
      && (filterCategory === 'all' || t.category === filterCategory)
      && (page !== 'Transactions' || t.date.startsWith(month))
  }), [transactions, query, filterType, filterCategory, page, month])

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Number(month.slice(0,4)), Number(month.slice(5,7))-1, 1)
    d.setMonth(d.getMonth() - 6 + i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const list = transactions.filter(t => t.date.startsWith(key))
    return { month: monthNames[d.getMonth()], income: list.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0), expenses: list.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0) }
  })
  const categoryData = Object.entries(monthTx.filter(t=>t.type==='expense').reduce((acc,t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount); return acc }, {})).map(([name,value]) => ({ name, value, color: categoryColors[name] || '#94a3b8' }))
  const expenseTotal = categoryData.reduce((s,x)=>s+x.value,0)

  const changeMonth = delta => {
    const d = new Date(Number(month.slice(0,4)), Number(month.slice(5,7))-1 + delta, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }
  const openAdd = () => { setEditing(null); setModal(true) }
  const openEdit = t => { setEditing(t); setModal(true) }
  const removeTx = id => { setTransactions(prev => prev.filter(t=>t.id!==id)); setToast('Transaction deleted') }
  const submitTx = data => {
    if (editing) setTransactions(prev => prev.map(t => t.id === editing.id ? { ...data, id: editing.id } : t))
    else setTransactions(prev => [{ ...data, id: crypto.randomUUID?.() || String(Date.now()) }, ...prev])
    setModal(false); setToast(editing ? 'Transaction updated' : 'Transaction added')
  }
  const exportCSV = () => {
    const rows = [['Title','Type','Category','Amount (INR)','Date','Note'], ...filtered.map(t=>[t.title,t.type,t.category,t.amount,t.date,t.note || ''])]
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'expenseflow-transactions.csv'; a.click(); URL.revokeObjectURL(url)
    setToast('CSV exported')
  }
  const updateBudget = (cat, value) => setBudgets(prev => ({ ...prev, [cat]: Math.max(0, Number(value) || 0) }))
  const nav = [{name:'Overview',icon:LayoutDashboard},{name:'Transactions',icon:ArrowLeftRight},{name:'Analytics',icon:ChartNoAxesCombined},{name:'Budgets',icon:Wallet}]
  const recent = [...monthTx].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'mobile-open':''}`}>
      <div className="brand"><div className="brand-mark">e</div><span>expense<span className="brand-light">flow</span></span><button className="mobile-close icon-btn" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">{nav.map(({name,icon:Icon})=><button key={name} className={`nav-item ${page===name?'active':''}`} onClick={()=>{setPage(name);setMobileOpen(false)}}><Icon size={18}/><span>{name}</span>{name==='Transactions'&&<span className="nav-count">{transactions.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><strong>Make your money work smarter.</strong><p>Small steps today, stronger finances tomorrow.</p></div>
        <button className="nav-item" onClick={()=>setToast('Settings are stored locally in this demo')}><Settings size={18}/><span>Settings</span></button>
        <div className="profile-row"><div className="avatar">R</div><div className="profile-copy"><strong>Ranveer</strong><span>Personal account</span></div><MoreHorizontal size={19} className="muted"/></div>
      </div>
    </aside>
    {mobileOpen && <button className="scrim" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button>
        <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div>
        <div className="top-actions">
          <label className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search transactions..." /><kbd>⌘ K</kbd></label>
          <button className="top-add" onClick={openAdd}><Plus size={17}/><span>Add transaction</span></button>
          <button className="icon-btn notification" onClick={()=>setToast('You’re all caught up!')} aria-label="Notifications"><Bell size={19}/><i/></button>
          <div className="top-avatar">R</div>
        </div>
      </header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">YOUR FINANCIAL OVERVIEW</div><h1>{page==='Overview'?'Good morning, Ranveer':page}</h1><p>{page==='Overview'?'Here’s what’s happening with your money.':page==='Transactions'?'Keep track of every rupee coming in and going out.':page==='Analytics'?'Understand your spending habits at a glance.':'Set limits and stay on top of your spending.'}</p></div>
          <div className="heading-actions"><div className="month-control"><button onClick={()=>changeMonth(-1)} aria-label="Previous month"><ChevronLeft size={16}/></button><span>{new Date(Number(month.slice(0,4)),Number(month.slice(5,7))-1,1).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</span><button onClick={()=>changeMonth(1)} aria-label="Next month"><ChevronRight size={16}/></button></div><button className="secondary-btn" onClick={exportCSV}><Download size={16}/> Export</button></div>
        </div>

        {(page==='Overview'||page==='Transactions') && <section className="stats-grid">
          <StatCard label="Total income" value={money(income)} icon={ArrowDownRight} tone="green" foot="Money received this month" tag="INCOME"/>
          <StatCard label="Total expenses" value={money(expenses)} icon={ArrowUpRight} tone="rose" foot="Money spent this month" tag="EXPENSES"/>
          <StatCard label="Available balance" value={money(balance)} icon={Wallet} tone="blue" foot={`${savings}% savings rate`} tag="BALANCE"/>
        </section>}

        {page==='Overview' && <>
          <section className="charts-grid">
            <div className="panel chart-panel"><div className="panel-head"><div><h2>Cash flow</h2><p>Income vs. expenses over time</p></div><span className="chart-legend"><i className="legend-blue"/>Income <i className="legend-orange"/>Expenses</span></div>
              <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:12,right:8,left:-16,bottom:0}}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4389ef" stopOpacity={.16}/><stop offset="95%" stopColor="#4389ef" stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff805f" stopOpacity={.12}/><stop offset="95%" stopColor="#ff805f" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)"/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill:'var(--muted)',fontSize:11}} dy={9}/><YAxis tickLine={false} axisLine={false} tick={{fill:'var(--muted)',fontSize:10}} tickFormatter={v=>v>=1000?`${Math.round(v/1000)}k`:v}/><Tooltip formatter={v=>money(v)} contentStyle={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:12,color:'var(--text)',fontSize:12}}/><Area type="monotone" dataKey="income" stroke="#4389ef" strokeWidth={2.5} fill="url(#incomeFill)" activeDot={{r:5}}/><Area type="monotone" dataKey="expenses" stroke="#ff805f" strokeWidth={2.5} fill="url(#expenseFill)" activeDot={{r:5}}/></AreaChart></ResponsiveContainer></div>
            </div>
            <div className="panel donut-panel"><div className="panel-head"><div><h2>Spending breakdown</h2><p>Where your money goes</p></div><span className="subtle-pill">This month</span></div>
              {categoryData.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="88%" paddingAngle={3} stroke="none"><Cell fill="#4389ef"/>{categoryData.map((d,i)=><Cell key={d.name} fill={d.color}/>)}</Pie><Tooltip formatter={v=>money(v)} contentStyle={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:10,fontSize:12}}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(expenseTotal)}</strong><span>Total spent</span></div></div><div className="category-legend">{categoryData.slice(0,4).map(c=><div key={c.name}><span><i style={{background:c.color}}/>{c.name}</span><strong>{Math.round(c.value/(expenseTotal||1)*100)}%</strong></div>)}</div></> : <EmptyState title="No spending yet" text="Add an expense to see your category breakdown."/>}
            </div>
          </section>
          <section className="panel transactions-panel"><div className="panel-head"><div><h2>Recent transactions</h2><p>Your latest money activity</p></div><button className="text-btn" onClick={()=>setPage('Transactions')}>View all <ChevronRight size={16}/></button></div><TransactionTable items={recent} onEdit={openEdit} onDelete={removeTx}/></section>
          <section className="bottom-grid"><div className="insight-card"><div className="insight-icon"><TrendingUp size={19}/></div><div><strong>{savings}% savings rate this month</strong><p>{balance>=0?'You’re keeping money aside. Keep the momentum going.':'Your expenses are higher than your income this month.'}</p></div><span className="insight-spark">↗</span></div><div className="quick-budget panel"><div><h3>Budget snapshot</h3><p>Keep your spending on track</p></div><button className="text-btn" onClick={()=>setPage('Budgets')}>Manage <ChevronRight size={15}/></button></div></section>
        </>}

        {page==='Transactions' && <section className="panel full-panel"><div className="filter-row"><div><h2>All transactions</h2><p>{filtered.length} records found</p></div><div className="filters"><label className="select-wrap"><Filter size={15}/><select value={filterType} onChange={e=>setFilterType(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select></label><label className="select-wrap"><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}><option value="all">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label></div></div><TransactionTable items={filtered} onEdit={openEdit} onDelete={removeTx} emptyTitle="No transactions match" emptyText="Try changing your search or filters."/></section>}

        {page==='Analytics' && <section className="analytics-page"><div className="panel chart-panel"><div className="panel-head"><div><h2>Income & expenses</h2><p>Six-month financial performance</p></div></div><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)"/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill:'var(--muted)',fontSize:12}}/><YAxis tickLine={false} axisLine={false} tick={{fill:'var(--muted)',fontSize:11}}/><Tooltip formatter={v=>money(v)}/><Area type="monotone" dataKey="income" stroke="#4389ef" fill="#4389ef" fillOpacity={.12}/><Area type="monotone" dataKey="expenses" stroke="#ff805f" fill="#ff805f" fillOpacity={.10}/></AreaChart></ResponsiveContainer></div></div><div className="panel category-panel"><div className="panel-head"><div><h2>Category details</h2><p>Expense distribution for selected month</p></div></div>{categoryData.length?categoryData.map(c=><div className="category-row" key={c.name}><div className="category-row-label"><i style={{background:c.color}}/>{c.name}<strong>{money(c.value)}</strong></div><div className="progress-track"><span style={{width:`${c.value/(expenseTotal||1)*100}%`,background:c.color}}/></div></div>):<EmptyState title="Nothing to analyse yet" text="Add expenses to generate insights."/>}</div></section>}

        {page==='Budgets' && <section className="budget-page"><div className="budget-intro panel"><div className="budget-intro-icon"><PiggyBank size={23}/></div><div><h2>Plan with purpose.</h2><p>Set a monthly limit for each category and keep your spending in check.</p></div><div className="budget-total"><span>Monthly budget</span><strong>{money(Object.values(budgets).reduce((s,v)=>s+Number(v),0))}</strong></div></div><div className="budget-grid">{Object.entries(budgets).map(([cat,limit])=>{const spent=monthTx.filter(t=>t.type==='expense'&&t.category===cat).reduce((s,t)=>s+Number(t.amount),0);const pct=limit?Math.round(spent/limit*100):0;const Icon=categoryIcons[cat]||Wallet;return <div className="panel budget-card" key={cat}><div className="budget-card-top"><div className="cat-icon" style={{color:categoryColors[cat],background:`${categoryColors[cat]}18`}}><Icon size={18}/></div><span className={pct>=100?'over-tag':'safe-tag'}>{pct>=100?'Over budget':`${pct}% used`}</span></div><h3>{cat}</h3><div className="budget-amount"><strong>{money(spent)}</strong><span>of {money(limit)}</span></div><div className="progress-track"><span style={{width:`${Math.min(100,pct)}%`,background:pct>=100?'#ed6b6b':categoryColors[cat]}}/></div><label className="budget-edit">Monthly limit <span>₹ <input type="number" min="0" value={limit} onChange={e=>updateBudget(cat,e.target.value)}/></span></label></div>})}</div></section>}
        <footer className="footer"><span>© 2026 ExpenseFlow</span><span>Made for mindful money management <span className="footer-heart">♥</span></span><span>Frontend demo · LocalStorage</span></footer>
      </div>
    </main>
    {modal && <TransactionModal initial={editing} onClose={()=>setModal(false)} onSubmit={submitTx}/>}
    {toast && <div className="toast"><span><Check size={16}/></span>{toast}</div>}
  </div>
}

function StatCard({label,value,icon:Icon,tone,foot,tag}) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-foot"><span className="stat-dot" style={{background:tone==='green'?'#22b486':tone==='rose'?'#ef7777':'#4389ef'}}/>{foot}<span className={`stat-tag ${tone}`}>{tag}</span></div></div>
}
function TransactionTable({items,onEdit,onDelete,emptyTitle='No transactions yet',emptyText='Add your first transaction to get started.'}) {
  if (!items.length) return <EmptyState title={emptyTitle} text={emptyText}/>
  return <div className="table-scroll"><table className="tx-table"><thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th>TYPE</th><th/></tr></thead><tbody>{items.map(t=>{const Icon=categoryIcons[t.category]||Wallet;return <tr key={t.id}><td><div className="transaction-name"><span className="tx-icon" style={{color:categoryColors[t.category],background:`${categoryColors[t.category]}18`}}><Icon size={16}/></span><span><strong>{t.title}</strong><small>{t.note||'Personal transaction'}</small></span></div></td><td><span className="category-chip">{t.category}</span></td><td className="date-cell">{new Date(`${t.date}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td><td><strong className={t.type==='income'?'amount-income':'amount-expense'}>{t.type==='income'?'+':'−'}{money(t.amount)}</strong></td><td><span className={`type-pill ${t.type}`}>{t.type}</span></td><td><div className="row-actions"><button title="Edit" onClick={()=>onEdit(t)}><Pencil size={15}/></button><button title="Delete" onClick={()=>onDelete(t.id)}><Trash2 size={15}/></button></div></td></tr>})}</tbody></table></div>
}
function EmptyState({title,text}) { return <div className="empty-state"><div><Wallet size={22}/></div><strong>{title}</strong><p>{text}</p></div> }
function TransactionModal({initial,onClose,onSubmit}) {
  const [form,setForm] = useState(initial||{title:'',amount:'',type:'expense',category:'Food',date:dateKey(today),note:''})
  const [error,setError] = useState('')
  const update = (key,value) => setForm(prev=>({...prev,[key]:value}))
  const submit = e => { e.preventDefault(); if(!form.title.trim()||Number(form.amount)<=0||!form.date){setError('Enter a description, valid amount and date.');return} onSubmit({...form,title:form.title.trim(),amount:Number(form.amount)}) }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><form className="modal" onSubmit={submit}><div className="modal-head"><div><span className="eyebrow">MONEY MOVEMENT</span><h2>{initial?'Edit transaction':'Add transaction'}</h2><p>Keep your finances up to date.</p></div><button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button></div><div className="type-switch"><button type="button" className={form.type==='expense'?'selected expense':''} onClick={()=>{update('type','expense');if(['Salary','Freelance'].includes(form.category))update('category','Food')}}>Expense</button><button type="button" className={form.type==='income'?'selected income':''} onClick={()=>{update('type','income');update('category','Salary')}}>Income</button></div><label className="form-field"><span>Description</span><input autoFocus placeholder="e.g. Grocery shopping" value={form.title} onChange={e=>update('title',e.target.value)}/></label><div className="form-two"><label className="form-field"><span>Amount (₹)</span><input type="number" min="1" step="1" placeholder="0" value={form.amount} onChange={e=>update('amount',e.target.value)}/></label><label className="form-field"><span>Date</span><input type="date" value={form.date} onChange={e=>update('date',e.target.value)}/></label></div><label className="form-field"><span>Category</span><select value={form.category} onChange={e=>update('category',e.target.value)}>{categories.filter(c=>form.type==='income'?['Salary','Freelance','Other'].includes(c):!['Salary','Freelance'].includes(c)).map(c=><option key={c}>{c}</option>)}</select></label><label className="form-field"><span>Note <small>Optional</small></span><textarea rows="2" placeholder="Add a little detail..." value={form.note} onChange={e=>update('note',e.target.value)}/></label>{error&&<p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" type="submit"><Plus size={16}/>{initial?'Save changes':'Add transaction'}</button></div></form></div>
}
export default App;