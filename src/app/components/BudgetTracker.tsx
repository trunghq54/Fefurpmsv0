import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const budgetData = [
  { category: 'Personnel', allocated: 30000000, spent: 18000000, remaining: 12000000 },
  { category: 'Equipment', allocated: 25000000, spent: 22000000, remaining: 3000000 },
  { category: 'Research Materials', allocated: 15000000, spent: 8000000, remaining: 7000000 },
  { category: 'Travel', allocated: 10000000, spent: 5000000, remaining: 5000000 },
  { category: 'Publication', allocated: 8000000, spent: 3000000, remaining: 5000000 },
  { category: 'Contingency', allocated: 12000000, spent: 0, remaining: 12000000 },
];

const spendingTrend = [
  { month: 'T1', amount: 8000000 },
  { month: 'T2', amount: 12000000 },
  { month: 'T3', amount: 15000000 },
  { month: 'T4', amount: 11000000 },
  { month: 'T5', amount: 10000000 },
];

const pieData = budgetData.map(item => ({
  name: item.category,
  value: item.spent,
}));

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function BudgetTracker() {
  const totalAllocated = budgetData.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = budgetData.reduce((sum, item) => sum + item.remaining, 0);
  const utilizationRate = ((totalSpent / totalAllocated) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Budget Tracking & Analytics</h2>
        <p className="text-gray-500 mt-1">Monitor project budgets and expenditures</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Budget</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {(totalAllocated / 1000000).toFixed(0)}M
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {(totalSpent / 1000000).toFixed(0)}M
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-xl">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Remaining</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {(totalRemaining / 1000000).toFixed(0)}M
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Utilization</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{utilizationRate}%</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spending Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`budget-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(1)}M VND`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Spending Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(1)}M VND`} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Budget Breakdown by Category</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Allocated</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Spent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usage %</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {budgetData.map((item, idx) => {
                const usagePercent = (item.spent / item.allocated) * 100;
                const isOverBudget = usagePercent > 100;
                const isWarning = usagePercent > 80 && usagePercent <= 100;

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-800">{item.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {(item.allocated / 1000000).toFixed(1)}M VND
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {(item.spent / 1000000).toFixed(1)}M VND
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {(item.remaining / 1000000).toFixed(1)}M VND
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              isOverBudget ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12">
                          {usagePercent.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isOverBudget ? (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          Over Budget
                        </span>
                      ) : isWarning ? (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="w-4 h-4" />
                          Warning
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">On Track</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
