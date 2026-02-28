import React from 'react';
import { Store, MapPin } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { formatDollar } from '@/lib/formatting';

interface MerchantCardProps {
  name: string;
  cashAvailable: bigint;
  distance?: string;
  isVerified: boolean;
  onClick?: () => void;
}

export function MerchantCard({ name, cashAvailable, distance, isVerified, onClick }: MerchantCardProps) {
  return (
    <Card
      className="min-w-[200px] cursor-pointer p-4"
      hover
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
          <Store size={20} className="text-slate-400" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{name}</h4>
          {distance && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin size={10} />
              <span>{distance}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <Badge variant="success">
          Cash: {formatDollar(cashAvailable)}
        </Badge>
        {!isVerified && (
          <Badge variant="warning" className="ml-1">Unverified</Badge>
        )}
      </div>
    </Card>
  );
}
