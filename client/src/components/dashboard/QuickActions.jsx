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
    accent: 'hover:border-[#1769C2] hover:bg-royalblue-50/60',
    iconColor: 'text-[#1769C2] bg-royalblue-50 border-royalblue-200'
  },
  {
    id: 'view-inventory',
    title: 'View Inventory',
    description: 'Inspect current stock quantities and threshold status',
    to: '/inventory',
    icon: Boxes,
    accent: 'hover:border-[#10B981] hover:bg-emerald-50/60',
    iconColor: 'text-[#10B981] bg-emerald-50 border-emerald-200'
  },
  {
    id: 'monitor-iot',
    title: 'Monitor IoT',
    description: 'Track software-simulated sensor telemetry feeds',
    to: '/iot',
    icon: RadioTower,
    accent: 'hover:border-[#1769C2] hover:bg-royalblue-50/60',
    iconColor: 'text-[#1769C2] bg-royalblue-50 border-royalblue-200'
  },
  {
    id: 'check-alerts',
    title: 'Check Alerts',
    description: 'Review low, critical, and out-of-stock warning events',
    to: '/alerts',
    icon: TriangleAlert,
    accent: 'hover:border-amber-400 hover:bg-amber-50/60',
    iconColor: 'text-amber-600 bg-amber-50 border-amber-200'
  }
];

export const QuickActions = () => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl gradient-brand text-white shadow-xs">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#102A43] tracking-tight">Quick Actions</h2>
          <p className="text-xs text-[#64748B]">
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
              className={`group p-4 rounded-xl border border-[#E2E8F0] bg-[#F4F8FC] transition-all duration-200 ${action.accent} flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border ${action.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#1769C2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-[#102A43] group-hover:text-[#1769C2] transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
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
