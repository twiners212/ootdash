import { useDashboardStore } from '../store/useDashboardStore';
import { CloudSun, MapPin } from 'lucide-react';

export default function WeatherInfo() {
  const { weather } = useDashboardStore();

  if (!weather) return null;

  return (
    <div className="flex flex-col items-center justify-center bg-surface p-8 rounded-xl pixel-border mb-8 shadow-lg shadow-outline/20">
      <div className="flex items-center space-x-2 text-outline mb-2">
        <MapPin size={24} />
        <h2 className="text-2xl font-bold uppercase tracking-widest">{weather.locationName}</h2>
      </div>
      
      <div className="flex items-center justify-center my-4 sm:my-6 w-full overflow-hidden">
        <CloudSun className="w-12 h-12 sm:w-16 sm:h-16 text-accent drop-shadow-md mr-2 sm:mr-4 flex-shrink-0" />
        <span className="text-6xl sm:text-8xl font-pixel text-primary drop-shadow-[4px_4px_0_rgba(26,43,69,1)]">
          {weather.temperature}°
        </span>
      </div>
      
      <div className="bg-outline text-secondary px-6 py-2 rounded-full font-pixel text-sm uppercase tracking-wider">
        {weather.condition}
      </div>
    </div>
  );
}
