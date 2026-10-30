import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-[#E4EAE5] shadow-sm p-6 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#F0F4F1]">
          <div>
            {title && <h3 className="font-semibold text-lg text-[#17231F]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#75817A] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
