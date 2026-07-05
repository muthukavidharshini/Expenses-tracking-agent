import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  Calendar,
  Target,
  Gift,
  AlertCircle,
  Clock,
  Smile
} from 'lucide-react';

function SmartWidgets({ data }) {
  const widgets = useMemo(() => {
    if (!data) return [];

    const items = [];

    // Spending streak
    const spendingStreak = Math.floor(Math.random() * 30) + 1;
    items.push({
      id: 'streak',
      icon: Zap,
      title: 'Spending Streak',
      value: `${spendingStreak} days`,
      detail: 'Consistent daily tracking.',
      color: 'success'
    });

    // Daily limit
    const dailySpend = Math.round(data.totalExpenses / 30);
    const suggestedLimit = Math.round(dailySpend * 1.1);
    items.push({
      id: 'daily-limit',
      icon: Target,
      title: 'Daily Limit',
      value: `₹${suggestedLimit}`,
      detail: 'Recommended based on spending.',
      color: 'primary'
    });

    // Savings goal progress
    const savingsGoalProgress = Math.min(Math.round((Math.max(0, data.totalIncome - data.totalExpenses) / (data.totalIncome * 0.2)) * 100), 100);
    items.push({
      id: 'savings-goal',
      icon: Gift,
      title: 'Savings Goal',
      value: `${savingsGoalProgress}%`,
      detail: 'Progress this month.',
      color: savingsGoalProgress > 75 ? 'success' : 'warning'
    });

    // Upcoming bills
    const upcomingBills = Math.floor(Math.random() * 5) + 1;
    items.push({
      id: 'bills',
      icon: Calendar,
      title: 'Upcoming Bills',
      value: `${upcomingBills}`,
      detail: 'Bills due this week.',
      color: upcomingBills > 3 ? 'warning' : 'success'
    });

    // Budget status
    const budgetsOnTrack = data.budgets ? data.budgets.filter(b => b.spent <= b.limit).length : 0;
    const totalBudgets = data.budgets ? data.budgets.length : 1;
    items.push({
      id: 'budget-status',
      icon: TrendingUp,
      title: 'Budget Status',
      value: `${budgetsOnTrack}/${totalBudgets}`,
      detail: 'Categories on track.',
      color: budgetsOnTrack === totalBudgets ? 'success' : 'warning'
    });

    // Weekly challenge
    items.push({
      id: 'challenge',
      icon: Smile,
      title: 'Weekly Challenge',
      value: '3 days left',
      detail: 'Save 10% challenge',
      color: 'accent'
    });

    return items;
  }, [data]);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
          ⚡ Smart Widgets
        </h3>
      </div>
      <div className="widgets-section">
        {widgets.map((widget, idx) => {
          const Icon = widget.icon;
          const colorMap = {
            success: 'var(--success-glow)',
            warning: 'var(--warning-glow)',
            danger: 'var(--danger-glow)',
            primary: 'var(--primary-glow)',
            accent: 'var(--accent-glow)'
          };
          const textColorMap = {
            success: 'var(--success)',
            warning: 'var(--warning)',
            danger: 'var(--danger)',
            primary: 'var(--primary)',
            accent: 'var(--accent)'
          };

          return (
            <motion.div
              key={widget.id}
              className="glass-card smart-widget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div
                className="widget-icon"
                style={{
                  background: colorMap[widget.color] || colorMap.primary,
                  color: textColorMap[widget.color] || textColorMap.primary
                }}
              >
                <Icon size={28} />
              </div>
              <div className="widget-title">{widget.title}</div>
              <div className="widget-value">{widget.value}</div>
              <div className="widget-detail">{widget.detail}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default SmartWidgets;
