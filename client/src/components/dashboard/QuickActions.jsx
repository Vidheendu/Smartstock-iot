import React from 'react';
import { Link } from 'react-router-dom';
import { PackagePlus, Boxes, RadioTower, TriangleAlert, ArrowUpRight, Zap } from 'lucide-react';

const ACTIONS = [
  {
    id: 'add-product',
    title: 'Add Product',
    description: 'Register and configure new stock catalog item',
    to: '/products',
    icon: PackagePlus,
    accent: 'hover:border-indigo-500/50 hover:bg-indigo-500/5',
    iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  },
  {
    id: 'view-inventory',
    title: 'View Inventory',
    description: 'Inspect current stock quantities and threshold status',
    to: '/inventory',
    icon: Boxes,
    accent: 'hover:border-blue-500/50 hover:bg-blue-500/5',
    iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'monitor-iot',
    title: 'Monitor IoT',
    description: 'Track software-simulated sensor telemetry feeds',
    to: '/iot',
    icon: RadioTower,
    accent: 'hover:border-purple-500/50 hover:bg-purple-500/5',
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  {
    id: 'check-alerts',
    title: 'Check Alerts',
    description: 'Review low, critical, and out-of-stock warning events',
    to: '/alerts',
    icon: TriangleAlert,
    accent: 'hover:border-amber-500/50 hover:bg-amber-500/5',
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  }
];

export const QuickActions = () => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Quick Actions</h2>
          <p className="text-xs text-slate-400">
            Frequently accessed stock management shortcuts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              to={action.to}
              className={`group p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 transition-all duration-200 ${action.accent} flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border ${action.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
