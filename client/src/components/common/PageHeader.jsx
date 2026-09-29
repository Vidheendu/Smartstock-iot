import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export const PageHeader = ({
  title,
  subtitle,
  badge,
  breadcrumbs = [], // [{ label, to }]
  actions,
  backTo,
  backLabel = 'Back',
  className = ''
}) => {
  return (
    <div className={`space-y-2 pb-2 border-b border-[#D9E2EC] ${className}`}>
      {/* Optional Breadcrumbs or Back Link */}
      {(backTo || breadcrumbs.length > 0) && (
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          {backTo && (
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 font-semibold text-[#64748B] hover:text-[#0F172A] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{backLabel}</span>
            </Link>
          )}

          {backTo && breadcrumbs.length > 0 && <span>•</span>}

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-[#1769C2] transition font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={`font-semibold ${isLast ? 'text-[#0F172A]' : ''}`}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Main Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              {title}
            </h1>
            {badge && (
              <div>{badge}</div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
