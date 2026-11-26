import React from 'react';
import { IngredientId, RecipeId } from '../game/types';

export const DapurWajanLogo: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 360 112"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Dapur Wajan"
  >
    {/* Wok + Flame Emblem */}
    <g transform="translate(8, 14)">
      {/* Flame */}
      <path
        d="M36 74C25 74 18 65 21 55C23 48 30 43 32 35C38 41 41 47 41 53C44 50 46 46 46 42C52 49 54 57 51 64C48 71 43 74 36 74Z"
        fill="#EA580C"
      />
      <path
        d="M36 71C30 71 27 66 29 60C30 56 34 53 35 49C38 53 40 57 39 61C41 59 42 57 42 55C45 59 46 64 43 68C41 70 39 71 36 71Z"
        fill="#FBBF24"
      />
      {/* Wok Bowl */}
      <path
        d="M10 38C10 52 22 61 36 61C50 61 62 52 62 38H10Z"
        fill="#292524"
        stroke="#F5F0E6"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Wok Handles */}
      <path
        d="M4 35L11 38M62 38L72 33"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Spatula */}
      <path
        d="M45 14L34 36"
        stroke="#D6D3D1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M42 9L50 13L47 19L39 15L42 9Z"
        fill="#F59E0B"
      />
    </g>

    {/* Wordmark */}
    <text
      x="94"
      y="56"
      fill="#FAF8F5"
      fontFamily="Fraunces, Georgia, serif"
      fontWeight="700"
      fontSize="40"
      letterSpacing="-0.02em"
    >
      Dapur Wajan
    </text>
    <line
      x1="96"
      y1="70"
      x2="246"
      y2="70"
      stroke="#EA580C"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <text
      x="96"
      y="90"
      fill="#D6D3D1"
      fontFamily="Plus Jakarta Sans, sans-serif"
      fontWeight="500"
      fontSize="13"
      letterSpacing="0.06em"
    >
      WARUNG NUSANTARA
    </text>
  </svg>
);

export const IngredientIcon: React.FC<{
  id: IngredientId;
  className?: string;
}> = ({ id, className = 'w-8 h-8' }) => {
  switch (id) {
    case 'nasi':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M8 24C8 15 13 10 20 10C27 10 32 15 32 24H8Z"
            fill="#FAF8F5"
            stroke="#D6D3D1"
            strokeWidth="1.5"
          />
          <path
            d="M6 24H34C33 30 28 33 20 33C12 33 7 30 6 24Z"
            fill="#44403C"
            stroke="#A8A29E"
            strokeWidth="1.5"
          />
          <circle cx="16" cy="17" r="1.4" fill="#E7E0D3" />
          <circle cx="22" cy="15" r="1.4" fill="#E7E0D3" />
          <circle cx="25" cy="19" r="1.4" fill="#E7E0D3" />
        </svg>
      );
    case 'mie':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M9 22C9 15 14 11 20 11C26 11 31 15 31 22"
            stroke="#FBBF24"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M11 25C13 18 17 15 21 15C25 15 28 19 30 25"
            stroke="#F59E0B"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M13 28C15 22 18 20 21 20C24 20 26 23 28 28"
            stroke="#FDE68A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M7 25H33C32 30 27 33 20 33C13 33 8 30 7 25Z"
            fill="#78350F"
            stroke="#D97706"
            strokeWidth="1.4"
          />
        </svg>
      );
    case 'telur':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M20 7C14.5 7 10 15.5 10 22.5C10 28.8 14.5 33 20 33C25.5 33 30 28.8 30 22.5C30 15.5 25.5 7 20 7Z"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="1.6"
          />
          <circle cx="20" cy="23" r="5" fill="#F59E0B" />
          <circle cx="18.5" cy="21.5" r="1.5" fill="#FDE68A" />
        </svg>
      );
    case 'ayam':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 22C10 17 14 11 20 11C25 11 28 15 27 20C26 23 23 25 20 26L14 31L11 28L15 24C13.5 23.5 12.5 23 12 22Z"
            fill="#FCA5A5"
            stroke="#EA580C"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="11" cy="30" r="2.2" fill="#FAF8F5" />
          <circle cx="14" cy="32" r="2" fill="#FAF8F5" />
          <path d="M18 15L22 19" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'sayur':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M20 31C14 31 11 25 11 18C11 13 15 9 20 9C25 9 29 13 29 18C29 25 26 31 20 31Z"
            fill="#22C55E"
            stroke="#15803D"
            strokeWidth="1.6"
          />
          <path
            d="M20 31V13M20 24L15 19M20 21L25 16"
            stroke="#BBF7D0"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'kecap':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect
            x="14"
            y="14"
            width="12"
            height="19"
            rx="3"
            fill="#292524"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <path d="M17 8H23V14H17V8Z" fill="#78350F" stroke="#D97706" strokeWidth="1.4" />
          <rect x="16" y="19" width="8" height="8" rx="1" fill="#F59E0B" />
          <path d="M18 6H22" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'sambal':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M9 22H31C30 29 25.5 33 20 33C14.5 33 10 29 9 22Z"
            fill="#57534E"
            stroke="#A8A29E"
            strokeWidth="1.4"
          />
          <path
            d="M12 22C13 17 16.5 14 20 14C23.5 14 27 17 28 22H12Z"
            fill="#DC2626"
          />
          <path
            d="M23 14C25 10 28 8 30 9"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="18" cy="19" r="1.2" fill="#FDE047" />
          <circle cx="22" cy="18" r="1" fill="#FDE047" />
        </svg>
      );
  }
};

export const DishIcon: React.FC<{
  id: RecipeId;
  className?: string;
}> = ({ id, className = 'w-11 h-11' }) => {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      {/* Ceramic Plate */}
      <circle cx="28" cy="29" r="22" fill="#FAF8F5" stroke="#D6D3D1" strokeWidth="2" />
      <circle cx="28" cy="29" r="16.5" fill="#F5F0E6" stroke="#E7E0D3" strokeWidth="1.2" />

      {id === 'telur_dadar_sambal' && (
        <g>
          <ellipse cx="27" cy="29" rx="12" ry="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.4" />
          <path d="M21 27C23 25 27 25 30 27" stroke="#FEF3C7" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="34" cy="31" r="4" fill="#DC2626" />
          <circle cx="33" cy="30" r="1" fill="#FDE047" />
        </g>
      )}

      {id === 'nasi_goreng_kampung' && (
        <g>
          <path
            d="M16 32C16 24 21 19 28 19C35 19 40 24 40 32C40 36 35 39 28 39C21 39 16 36 16 32Z"
            fill="#D97706"
          />
          <circle cx="24" cy="26" r="2.2" fill="#FDE68A" />
          <circle cx="31" cy="27" r="2" fill="#EF4444" />
          <circle cx="28" cy="32" r="2.2" fill="#FDE68A" />
          <circle cx="34" cy="33" r="1.8" fill="#16A34A" />
        </g>
      )}

      {id === 'mie_goreng_jawa' && (
        <g>
          <path
            d="M17 30C18 23 23 20 28 20C33 20 38 23 39 30C39 35 34 38 28 38C22 38 17 35 17 30Z"
            fill="#92400E"
          />
          <path d="M20 27C24 24 31 24 35 28" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M19 31C24 29 31 29 36 32" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="24" cy="26" r="2.5" fill="#22C55E" />
          <circle cx="33" cy="31" r="2.2" fill="#22C55E" />
        </g>
      )}

      {id === 'ayam_goreng_lengkuas' && (
        <g>
          <path
            d="M17 30C16 25 20 20 26 20C31 20 35 24 34 29C33 34 28 37 22 36L17 33Z"
            fill="#B45309"
            stroke="#78350F"
            strokeWidth="1.4"
          />
          <circle cx="34" cy="31" r="4.2" fill="#DC2626" />
          <circle cx="24" cy="25" r="2" fill="#FBBF24" />
          <path d="M22 31L29 29" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {id === 'nasi_goreng_spesial' && (
        <g>
          <path
            d="M15 32C15 24 21 19 28 19C35 19 41 24 41 32C41 36 35 39 28 39C21 39 15 36 15 32Z"
            fill="#92400E"
          />
          {/* Sunny-side egg on top */}
          <ellipse cx="28" cy="26" rx="7" ry="5" fill="#FAF8F5" />
          <circle cx="28" cy="26" r="2.8" fill="#F59E0B" />
          {/* Chicken & garnish */}
          <circle cx="21" cy="33" r="2.4" fill="#FCA5A5" />
          <circle cx="35" cy="33" r="2.2" fill="#4ADE80" />
        </g>
      )}
    </svg>
  );
};
