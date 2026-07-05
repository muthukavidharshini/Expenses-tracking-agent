import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
  Target,
  Calendar,
  PieChart
} from 'lucide-react';

function AIInsights({ data }) {
  const insights = useMemo(() => {
    if (!data) return [];

    const items = [];

    // Savings momentum
    const balanceDelta = data.totalIncome - data.totalExpenses;
    const currentSavings = Math.max(0, balanceDelta);
    items.push({
      id: 'savings',
      icon: CheckCircle,
      title: 'Savings Momentum',
      value: `₹${currentSavings.toLocaleString('en-IN')}`,
      description: `You retained ${currentSavings > 0 ? 'more' : 'less'} this month than usual.`,
      color: 'success',
      trend: currentSavings > 0 ? 'up' : 'down'
    });

    // Top expense category
    if (data.expensesByCategory && data.expensesByCategory.length > 0) {
      const topCategory = data.expensesByCategory[0];
      items.push({
        id: 'top-expense',
        icon: PieChart,
        title: 'Top Expense Category',
        value: topCategory.category,
        description: `₹${topCategory.total.toLocaleString('en-IN')} in ${topCategory.category} this month.`,
        color: 'warning'
      });
    }

    // Budget status
    if (data.budgets && data.budgets.length > 0) {
      const overBudget = data.budgets.filter(b => b.spent > b.limit).length;
      items.push({
        id: 'budget',
        icon: Target,
        title: 'Budget Alert',
        value: `${overBudget} categories`,
        description: `${overBudget} budget(s) exceeded this month. Review spending!`,
        color: overBudget > 0 ? 'danger' : 'success'
      });
    }

    // Growth rate
    items.push({
      id: 'growth',
      icon: data.monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
      title: 'Monthly Growth',
      value: `${data.monthlyGrowth}%`,
      description: `Your income is ${data.monthlyGrowth >= 0 ? 'growing' : 'declining'} compared to last month.`,
      color: data.monthlyGrowth >= 0 ? 'success' : 'danger',
      trend: data.monthlyGrowth >= 0 ? 'up' : 'down'
    });

    // Financial health
    items.push({
      id: 'health',
      icon: Zap,
      title: 'Financial Health',
      value: `${data.financialHealthScore}%`,
      description: data.financialHealthScore > 75 ? 'Excellent score! Keep it up.' : data.financialHealthScore > 50 ? 'Good, but room for improvement.' : 'Focus on budgeting and savings.',
      color: data.financialHealthScore > 75 ? 'success' : data.financialHealthScore > 50 ? 'warning' : 'danger'
    });

    return items;
  }, [data]);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
          🤖 AI Insights
        </h3>
      </div>
      <div className="insights-section">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          const colorMap = {
            success: 'var(--success-glow)',
            warning: 'var(--warning-glow)',
            danger: 'var(--danger-glow)',
            primary: 'var(--primary-glow)'
          };
          const textColorMap = {
            success: 'var(--success)',
            warning: 'var(--warning)',
            danger: 'var(--danger)',
            primary: 'var(--primary)'
          };

          return (
            <motion.div
              key={insight.id}
              className="glass-card insight-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div
                className="insight-icon"
                style={{
                  background: colorMap[insight.color] || colorMap.primary,
                  color: textColorMap[insight.color] || textColorMap.primary
                }}
              >
                <Icon size={24} />
              </div>
              <div className="insight-title">{insight.title}</div>
              <div className="insight-value">{insight.value}</div>
              <div className="insight-description">{insight.description}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default AIInsights;
