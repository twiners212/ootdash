import React from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { Shirt, BookOpen } from 'lucide-react';

const CATEGORY_EMOJI = {
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  accessories: '🎒',
};

const CATEGORY_COLORS = {
  top: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  bottom: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30',
  shoes: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  accessories: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
};

export default function RecommendationList() {
  const { recommendation } = useDashboardStore();

  if (!recommendation) return null;

  const items = [
    { key: 'top', label: 'Atasan', data: recommendation.top },
    { key: 'bottom', label: 'Bawahan', data: recommendation.bottom },
    { key: 'shoes', label: 'Sepatu', data: recommendation.shoes },
    { key: 'accessories', label: 'Aksesoris', data: recommendation.accessories },
  ].filter(item => item.data);

  return (
    <div className="bg-surface p-6 rounded-xl pixel-border w-full max-w-md mx-auto shadow-lg shadow-outline/10">
      <h3 className="text-xl font-bold text-outline mb-4 flex items-center border-b-2 border-outline pb-2">
        <Shirt className="mr-2 text-primary" /> Outfit Hari Ini
      </h3>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={item.key} 
            className={`
              flex items-center gap-3 p-3 rounded-lg border
              bg-gradient-to-r ${CATEGORY_COLORS[item.key]}
              hover:scale-[1.02] transition-all duration-200 cursor-default
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Item Image */}
            <div className="w-14 h-14 rounded-lg bg-white/60 flex-shrink-0 flex items-center justify-center overflow-hidden pixel-border">
              <img 
                src={item.data.layerImage}
                alt={item.data.itemName}
                className="w-12 h-12 object-contain pixelated"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-2xl">${CATEGORY_EMOJI[item.key]}</span>`;
                }}
              />
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-pixel text-outline/60 uppercase tracking-wider">{item.label}</span>
                <span className="font-pixel text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Equipped</span>
              </div>
              <span className="font-bold text-outline text-sm block truncate">{item.data.itemName}</span>
              <div className="flex items-start mt-1 text-outline/70 text-xs">
                <BookOpen size={12} className="mr-1.5 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{item.data.note}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
