import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

// Map weather condition text → outfit image
const OUTFIT_MAP = {
  'Cerah': '/layers/outfit_cerah.png',
  'Cerah Berawan': '/layers/outfit_berawan.png',
  'Hujan': '/layers/outfit_hujan.png',
  'Badai': '/layers/outfit_badai.png',
};

// Pixel-art weather emoji/icons for flavor
const WEATHER_DECORATIONS = {
  'Cerah': { emoji: '☀️', particles: 'sun-rays' },
  'Cerah Berawan': { emoji: '⛅', particles: 'clouds' },
  'Hujan': { emoji: '🌧️', particles: 'rain' },
  'Badai': { emoji: '⛈️', particles: 'storm' },
};

export default function Mannequin() {
  const { recommendation, weather } = useDashboardStore();
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!recommendation || !weather) return null;

  const outfitSrc = OUTFIT_MAP[weather.condition] || '/layers/outfit_berawan.png';
  const decoration = WEATHER_DECORATIONS[weather.condition] || WEATHER_DECORATIONS['Cerah Berawan'];

  return (
    <div className="relative w-full flex flex-col items-center">
      
      {/* Weather Decoration */}
      <div className="absolute top-2 right-4 text-4xl animate-bounce z-20 drop-shadow-lg">
        {decoration.emoji}
      </div>

      {/* Mannequin Container */}
      <div className="relative w-[280px] h-[420px] md:w-[320px] md:h-[480px] flex justify-center items-center">
        
        {/* Glow effect behind mannequin */}
        <div 
          className="absolute inset-0 rounded-full opacity-20 blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #00A8F3 0%, transparent 70%)',
            transform: 'scale(0.6) translateY(10%)'
          }}
        />

        {/* Loading skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-[120px] h-[350px] bg-outline/10 rounded-lg animate-pulse" />
            <p className="font-pixel text-xs text-outline/40 mt-2">Loading outfit...</p>
          </div>
        )}

        {/* Outfit Image */}
        <img
          src={outfitSrc}
          alt={`Outfit rekomendasi untuk cuaca ${weather.condition}`}
          className={`
            relative z-10 w-full h-full object-contain pixelated
            transition-all duration-500 ease-out
            ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          onLoad={() => setImgLoaded(true)}
          draggable={false}
        />

        {/* Weather Particles Overlay */}
        {weather.condition === 'Hujan' && <RainParticles />}
        {weather.condition === 'Badai' && <StormParticles />}
      </div>

      {/* Outfit Label */}
      <div className="mt-4 bg-outline text-secondary px-4 py-2 rounded-full font-pixel text-[10px] uppercase tracking-widest shadow-lg">
        🎮 Outfit {weather.condition}
      </div>

      {/* Item Tooltips Row */}
      <div className="flex gap-3 mt-4">
        {recommendation.top && (
          <ItemBubble 
            src={recommendation.top.layerImage} 
            label={recommendation.top.itemName} 
            color="bg-primary"
            category="top"
          />
        )}
        {recommendation.bottom && (
          <ItemBubble 
            src={recommendation.bottom.layerImage} 
            label={recommendation.bottom.itemName} 
            color="bg-outline"
            category="bottom"
          />
        )}
        {recommendation.shoes && (
          <ItemBubble 
            src={recommendation.shoes.layerImage} 
            label={recommendation.shoes.itemName} 
            color="bg-accent"
            category="shoes"
          />
        )}
        {recommendation.accessories && (
          <ItemBubble 
            src={recommendation.accessories.layerImage} 
            label={recommendation.accessories.itemName} 
            color="bg-primary"
            category="accessories"
          />
        )}
      </div>
    </div>
  );
}

const CATEGORY_EMOJI = {
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  accessories: '🎒',
};

/** Small circular item preview bubble */
function ItemBubble({ src, label, color, category }) {
  const [hover, setHover] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`
        w-14 h-14 rounded-xl ${color}/10 border-2 border-transparent 
        hover:border-primary/50 transition-all duration-200 
        flex items-center justify-center cursor-pointer
        hover:scale-110 hover:shadow-lg
      `}>
        <img 
          src={src} 
          alt={label} 
          className="w-10 h-10 object-contain pixelated"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          className="w-10 h-10 items-center justify-center text-lg hidden"
          title={label}
        >
          {CATEGORY_EMOJI[category] || '👕'}
        </div>
      </div>
      
      {/* Tooltip */}
      {hover && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-outline text-white text-[8px] font-pixel px-2 py-1 rounded whitespace-nowrap z-30 shadow-lg">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-outline" />
        </div>
      )}
    </div>
  );
}

/** Rain particle animation overlay */
function RainParticles() {
  const [particles] = useState(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 20}px`,
      height: `${8 + Math.random() * 12}px`,
      animation: `rain-fall ${0.5 + Math.random() * 0.5}s linear infinite`,
      animationDelay: `${Math.random() * 1}s`,
    }))
  );

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-[2px] bg-primary/40 rounded-full"
          style={{
            left: p.left,
            top: p.top,
            height: p.height,
            animation: p.animation,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    </div>
  );
}

/** Storm particle animation overlay */
function StormParticles() {
  const [particles] = useState(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 20}px`,
      height: `${10 + Math.random() * 16}px`,
      animation: `rain-fall ${0.3 + Math.random() * 0.4}s linear infinite`,
      animationDelay: `${Math.random() * 0.8}s`,
      transform: `rotate(${10 + Math.random() * 10}deg)`,
    }))
  );

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-[2px] bg-outline/50 rounded-full"
          style={{
            left: p.left,
            top: p.top,
            height: p.height,
            animation: p.animation,
            animationDelay: p.animationDelay,
            transform: p.transform,
          }}
        />
      ))}
      {/* Lightning flash */}
      <div 
        className="absolute inset-0 bg-white/10" 
        style={{ animation: 'lightning 3s ease-in-out infinite' }}
      />
    </div>
  );
}
