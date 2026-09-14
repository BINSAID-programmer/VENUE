import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  AlertTriangle,
  PieChart,
  DollarSign,
  TrendingDown,
  ShoppingBag,
  Home,
  Book,
  Wifi,
  Bus,
} from 'lucide-react';
import { FinancialRecord, FinancialTransaction } from '../../types';

interface FinancialPlannerScreenProps {
  financials: FinancialRecord;
  onAddTransaction: (txn: FinancialTransaction) => void;
}

export const FinancialPlannerScreen: React.FC<FinancialPlannerScreenProps> = ({
  financials,
  onAddTransaction,
}) => {
  const [data, setData] = useState<FinancialRecord>(financials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<FinancialTransaction['category']>('Meals');

  const remaining = data.totalStipend - data.spentTotal;
  const spentPct = Math.round((data.spentTotal / data.totalStipend) * 100);

  const getCategoryIcon = (cat: FinancialTransaction['category']) => {
    switch (cat) {
      case 'Meals':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Accommodation':
        return <Home className="w-3.5 h-3.5" />;
      case 'Books & Print':
        return <Book className="w-3.5 h-3.5" />;
      case 'Data Bundles':
        return <Wifi className="w-3.5 h-3.5" />;
      case 'Transport':
        return <Bus className="w-3.5 h-3.5" />;
      default:
        return <Wallet className="w-3.5 h-3.5" />;
    }
  };

  const handleCreateTxn = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!desc.trim() || isNaN(val) || val <= 0) return;

    const newTxn: FinancialTransaction = {
      id: `txn-${Date.now()}`,
      title: desc.trim(),
      amount: val,
      category,
      date: 'Today',
      type: 'expense',
    };

    const updatedSpent = data.spentTotal + val;
    setData({
      ...data,
      spentTotal: updatedSpent,
      transactions: [newTxn, ...data.transactions],
    });

    onAddTransaction(newTxn);
    setDesc('');
    setAmount('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Student Budget</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Semester stipend management (HESLB / Private Support)
          </p>
        </div>
        <button
          id="budget-add-expense-btn"
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/25 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Remaining Semester Balance</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 font-bold">
            {data.currency}
          </span>
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
            {remaining.toLocaleString()} {data.currency}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Total Allocated: {data.totalStipend.toLocaleString()} {data.currency} ({spentPct}% utilized)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPct > 80 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-sky-400'
            }`}
            style={{ width: `${Math.min(spentPct, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400">Total Spent</span>
            <p className="font-bold text-rose-400 mt-0.5">
              -{data.spentTotal.toLocaleString()} {data.currency}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400">Next Disbursement</span>
            <p className="font-bold text-sky-400 mt-0.5">In 42 Days</p>
          </div>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Expenses by Category
        </h3>
        <div className="space-y-2.5">
          {data.categories.map((cat, idx) => {
            const pct = Math.round((cat.spent / data.spentTotal) * 100) || 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                  <span className="text-slate-400">
                    {cat.spent.toLocaleString()} {data.currency} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Outflows</h3>

        <div className="space-y-2">
          {data.transactions.map((txn) => (
            <div
              key={txn.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center shrink-0">
                  {getCategoryIcon(txn.category)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-200">{txn.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {txn.category} • {txn.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-bold text-rose-400">
                  -{txn.amount.toLocaleString()} {data.currency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to add transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Record Expense</h3>

            <form onSubmit={handleCreateTxn} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Photocopying Real Analysis lecture notes"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount ({data.currency})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Meals">Meals / Cafeteria</option>
                  <option value="Accommodation">Accommodation / Hostel</option>
                  <option value="Books & Print">Books & Photocopying</option>
                  <option value="Data Bundles">Data Bundles / Internet</option>
                  <option value="Transport">Transport / Daladala</option>
                  <option value="Personal">Personal Misc</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
