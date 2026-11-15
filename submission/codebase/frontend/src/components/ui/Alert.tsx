import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success';
  title?: string;
}

export function Alert({ className, variant = 'default', title, children, ...props }: AlertProps) {
  const styles = {
    default: 'bg-blue-50 text-blue-900 border-blue-200',
    destructive: 'bg-rose-50 text-rose-900 border-rose-200',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200'
  };

  const icons = {
    default: <Info className="h-4 w-4 text-blue-600 mt-0.5" />,
    destructive: <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 text-sm flex gap-3',
        styles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1 leading-none">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
