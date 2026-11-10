import React from 'react';
import { EntityId } from '../../types';
import { ENTITIES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

interface EntityBadgeProps {
  entity: EntityId;
  size?: 'xs' | 'sm' | 'md';
  showFullName?: boolean;
  className?: string;
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({
  entity,
  size = 'sm',
  showFullName = false,
  className = ''
}) => {
  const context = useApp();
  const map = context?.entitiesMap || ENTITIES;
  const rawInfo = map[entity] || ENTITIES[entity] || {
    id: entity,
    code: entity,
    name: entity,
    shortName: entity,
    color: 'bg-slate-100 text-slate-800 border-slate-300'
  };

  const info = {
    ...rawInfo,
    fullName: rawInfo.name,
    badgeBg: rawInfo.color ? rawInfo.color.split(' ')[0] : 'bg-slate-100',
    badgeText: rawInfo.color ? rawInfo.color.split(' ')[1] : 'text-slate-700',
    badgeBorder: rawInfo.color ? rawInfo.color.split(' ')[2] : 'border-slate-200'
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.2',
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  }[size];

  return (
    <span
      title={info.fullName}
      className={`inline-flex items-center gap-1 rounded font-normal border transition-colors ${info.badgeBg} ${info.badgeText} ${info.badgeBorder} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      <span>{info.name}</span>
      {showFullName && (
        <span className="text-[10px] opacity-75 hidden sm:inline">
          · {info.fullName}
        </span>
      )}
    </span>
  );
};
