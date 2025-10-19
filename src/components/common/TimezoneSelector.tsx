import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { getUserTimezone, getTimezoneDisplayName, getCommonTimezones } from '../../utils/timezone';

interface TimezoneSelectorProps {
  value?: string;
  onChange: (timezone: string) => void;
  className?: string;
}

export default function TimezoneSelector({ value, onChange, className = '' }: TimezoneSelectorProps) {
  const currentTimezone = value || getUserTimezone();
  const commonTimezones = getCommonTimezones();

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4 text-blue-600" />
        Select Timezone
      </label>
      <select
        value={currentTimezone}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Auto-detect ({getTimezoneDisplayName()})</option>
        <optgroup label="Common Timezones">
          {commonTimezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="All Timezones">
          <option value="Africa/Abidjan">Abidjan (UTC+0)</option>
          <option value="Africa/Accra">Accra (UTC+0)</option>
          <option value="Africa/Algiers">Algiers (UTC+1)</option>
          <option value="Africa/Cairo">Cairo (UTC+2)</option>
          <option value="Africa/Casablanca">Casablanca (UTC+1)</option>
          <option value="Africa/Johannesburg">Johannesburg (UTC+2)</option>
          <option value="Africa/Lagos">Lagos (UTC+1)</option>
          <option value="Africa/Nairobi">Nairobi (UTC+3)</option>
          <option value="America/Anchorage">Anchorage (UTC-9)</option>
          <option value="America/Chicago">Chicago (UTC-6/-5)</option>
          <option value="America/Denver">Denver (UTC-7/-6)</option>
          <option value="America/Los_Angeles">Los Angeles (UTC-8/-7)</option>
          <option value="America/New_York">New York (UTC-5/-4)</option>
          <option value="America/Phoenix">Phoenix (UTC-7)</option>
          <option value="America/Toronto">Toronto (UTC-5/-4)</option>
          <option value="Asia/Baghdad">Baghdad (UTC+3)</option>
          <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
          <option value="Asia/Beirut">Beirut (UTC+2)</option>
          <option value="Asia/Dubai">Dubai (UTC+4)</option>
          <option value="Asia/Hong_Kong">Hong Kong (UTC+8)</option>
          <option value="Asia/Jerusalem">Jerusalem (UTC+2)</option>
          <option value="Asia/Karachi">Karachi (UTC+5)</option>
          <option value="Asia/Kolkata">Kolkata (UTC+5:30)</option>
          <option value="Asia/Kuwait">Kuwait (UTC+3)</option>
          <option value="Asia/Riyadh">Riyadh (UTC+3)</option>
          <option value="Asia/Seoul">Seoul (UTC+9)</option>
          <option value="Asia/Shanghai">Shanghai (UTC+8)</option>
          <option value="Asia/Singapore">Singapore (UTC+8)</option>
          <option value="Asia/Tehran">Tehran (UTC+3:30)</option>
          <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
          <option value="Australia/Melbourne">Melbourne (UTC+10/+11)</option>
          <option value="Australia/Sydney">Sydney (UTC+10/+11)</option>
          <option value="Europe/Amsterdam">Amsterdam (UTC+1/+2)</option>
          <option value="Europe/Athens">Athens (UTC+2/+3)</option>
          <option value="Europe/Berlin">Berlin (UTC+1/+2)</option>
          <option value="Europe/Brussels">Brussels (UTC+1/+2)</option>
          <option value="Europe/Istanbul">Istanbul (UTC+3)</option>
          <option value="Europe/London">London (UTC+0/+1)</option>
          <option value="Europe/Madrid">Madrid (UTC+1/+2)</option>
          <option value="Europe/Moscow">Moscow (UTC+3)</option>
          <option value="Europe/Paris">Paris (UTC+1/+2)</option>
          <option value="Europe/Rome">Rome (UTC+1/+2)</option>
          <option value="Pacific/Auckland">Auckland (UTC+12/+13)</option>
          <option value="UTC">UTC (UTC+0)</option>
        </optgroup>
      </select>
      <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
        <Globe className="h-3 w-3" />
        Current: {getTimezoneDisplayName(currentTimezone)}
      </div>
    </div>
  );
}