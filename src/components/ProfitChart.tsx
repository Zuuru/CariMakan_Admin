'use client';

import React from 'react';
import { TrendingUp, ArrowUpRight, ShieldCheck, DollarSign } from 'lucide-react';

export default function ProfitChart() {
  const [activeFilter, setActiveFilter] = React.useState('30h');
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    x: number;
    y: number;
    label: string;
    profit: string;
    expense: string;
    index: number;
  } | null>(null);

  const [profitData, setProfitData] = React.useState<number[]>([]);
  const [expenseData, setExpenseData] = React.useState<number[]>([]);
  const [currentTotal, setCurrentTotal] = React.useState(0);
  const [growth, setGrowth] = React.useState(0);

  const filters = ['1h', '7h', '30h', '3b', '1th'];

  React.useEffect(() => {
    async function loadData() {
      try {
        const { fetchChartData } = await import('@/app/actions');
        const res = await fetchChartData(activeFilter);
        if (res.success && res.data) {
          setProfitData(res.data.profitData);
          setExpenseData(res.data.expenseData);
          setCurrentTotal(res.data.currentTotal);
          setGrowth(res.data.growth);
        }
      } catch (err) {
        console.error('Failed to load chart data', err);
      }
    }
    loadData();
  }, [activeFilter]);

  // Format currency
  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(2).replace(/\.00$/, '')} Juta`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(1).replace(/\.0$/, '')} Rb`;
    return `Rp ${val}`;
  };

  // Generate dynamic chart data based on filter length
  const getXLabels = () => {
    if (activeFilter === '1h') return ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00'];
    if (activeFilter === '7h') return ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    if (activeFilter === '30h') return ['1-3', '4-6', '7-9', '10-12', '13-15', '16-18', '19-21', '22-24', '25-27', '28-30'];
    if (activeFilter === '3b') return ['Awal1', 'Tgh1', 'Akr1', 'Awal2', 'Tgh2', 'Akr2', 'Awal3', 'Tgh3', 'Akr3', 'B1', 'B2', 'B3'];
    return ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  };
  const labels = getXLabels();

  const maxDataVal = Math.max(...profitData) * 1.2 || 1;

  // SVG parameters
  const width = 800;
  const height = 280;
  const paddingX = 40;
  const paddingY = 30;

  // Compute point coordinates
  const pointsGreen = labels.map((label, i) => {
    const pData = profitData[i] || 0;
    const x = paddingX + (i * (width - 2 * paddingX)) / (labels.length - 1);
    const y = height - paddingY - (pData * (height - 2 * paddingY)) / maxDataVal;
    return { x, y, profit: pData, label: label };
  });

  const pointsRed = labels.map((_, i) => {
    const eData = expenseData[i] || 0;
    const x = paddingX + (i * (width - 2 * paddingX)) / (labels.length - 1);
    const y = height - paddingY - (eData * (height - 2 * paddingY)) / maxDataVal;
    return { x, y, expense: eData };
  });

  // Generate SVG path for smooth curves (Bezier)
  const getCurvePath = (points: { x: number; y: number }[]) => {
    if (!points.length) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpX1 = points[i].x + (points[i + 1].x - points[i].x) / 3;
      const cpY1 = points[i].y;
      const cpX2 = points[i].x + (2 * (points[i + 1].x - points[i].x)) / 3;
      const cpY2 = points[i + 1].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
    }
    return path;
  };

  const pathGreen = getCurvePath(pointsGreen);
  const pathRed = getCurvePath(pointsRed);

  // Path for gradient fills under the green curve
  const pathGreenFill = pointsGreen.length > 0 ? `${pathGreen} L ${pointsGreen[pointsGreen.length - 1].x} ${height - paddingY} L ${pointsGreen[0].x} ${height - paddingY} Z` : '';

  return (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: 'transparent',
        borderRadius: '0',
        border: 'none',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        transition: 'all 0.3s',
        position: 'relative',
      }}
    >
      {/* Grid of details + chart */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Left Side: Title stack + Summary metrics */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Title stack inside the column to keep it close to metrics */}
          <div>
            <h3 
              style={{
                fontSize: '22px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-outfit)',
                margin: 0,
              }}
            >
              Profit dari aplikasi kamu
            </h3>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              Liat profit dari app kamu
            </span>
          </div>

          {/* Main Profit Stat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h4 
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-outfit)',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {formatCurrency(currentTotal)}
            </h4>
            
            {/* Green trend badge with circle arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              <div 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  backgroundColor: '#60F0AA', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#FFFFFF' 
                }}
              >
                <ArrowUpRight size={12} />
              </div>
              <span style={{ color: '#00D65A', fontWeight: '700', fontSize: '13px', fontFamily: 'var(--font-outfit)' }}>
                {formatCurrency(growth)}
              </span>
            </div>
          </div>

          {/* Time Filter Pills underneath (Plain bare-style like Figma) */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    padding: isActive ? '4px 10px' : '4px 0',
                    borderRadius: isActive ? '6px' : '0',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '600',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--text-primary)' : 'transparent',
                    color: isActive ? 'var(--bg-card)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-outfit)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Green Growth Capsule Badge */}
          <div 
            style={{
              backgroundColor: 'rgba(96, 240, 170, 0.12)',
              border: '1px solid rgba(96, 240, 170, 0.25)',
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '10px', color: '#1B6A45', fontWeight: '700', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                Kenaikan Bulan Ini
              </span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#11683E', fontFamily: 'var(--font-outfit)', marginTop: '2px', display: 'block' }}>
                + Rp 750.000.000
              </span>
            </div>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#00D65A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
              }}
            >
              <ArrowUpRight size={16} />
            </div>
          </div>

          {/* Dark Mode Encouragement Card */}
          <div
            style={{
              background: '#1A1A1D',
              color: '#FFFFFF',
              padding: '16px',
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(96, 240, 170, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#60F0AA'
                }}
              >
                <ShieldCheck size={14} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#60F0AA', fontFamily: 'var(--font-outfit)' }}>
                Selamat minn profit!
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#A0A0AB', marginTop: '8px', margin: 0, lineHeight: '1.4', fontFamily: 'var(--font-outfit)' }}>
              Jangan lupa audit yakk buat laporan bulanan ke atasan.
            </p>
          </div>
        </div>

        {/* Right Side: Beautiful SVG Chart */}
        <div style={{ position: 'relative', width: '100%' }}>
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            style={{ width: '100%', height: 'auto', overflow: 'visible' }}
          >
            <defs>
              {/* Green gradient fill */}
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-mint)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--color-mint)" stopOpacity="0.00" />
              </linearGradient>
              {/* Drop shadows for lines */}
              <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="var(--color-mint)" floodOpacity="0.25" />
              </filter>
              <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="var(--color-dark-red)" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Grid lines (horizontal) */}
            {[0, 1, 2, 3, 4].map((v) => {
              const y = paddingY + (v * (height - 2 * paddingY)) / 4;
              return (
                <line
                  key={v}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  opacity="0.4"
                />
              );
            })}

            {/* Vertical grid lines for each month */}
            {pointsGreen.map((point, i) => (
              <line
                key={`v-line-${i}`}
                x1={point.x}
                y1={paddingY}
                x2={point.x}
                y2={height - paddingY}
                stroke="var(--border-color)"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.4"
              />
            ))}

            {/* SVG gradients under curve */}
            <path d={pathGreenFill} fill="url(#greenGrad)" />

            {/* Red Line Chart (comparisons) - thin & elegant */}
            <path
              d={pathRed}
              fill="none"
              stroke="var(--color-dark-red)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Green Line Chart (profits) - thin & elegant */}
            <path
              d={pathGreen}
              fill="none"
              stroke="var(--color-mint)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Interactive invisible hover zones for each month */}
            {pointsGreen.map((point, i) => (
              <g key={i}>
                {/* Visual points - small, clean, elegant */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="var(--color-mint)"
                  strokeWidth="2"
                  style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                />

                <circle
                  cx={pointsRed[i].x}
                  cy={pointsRed[i].y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="var(--color-dark-red)"
                  strokeWidth="2"
                />

                {/* Hover trigger zone */}
                <rect
                  x={point.x - 20}
                  y={0}
                  width="40"
                  height={height}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => {
                    setHoveredPoint({
                      x: point.x,
                      y: point.y,
                      label: point.label,
                      profit: formatCurrency(point.profit),
                      expense: formatCurrency(pointsRed[i].expense),
                      index: i,
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}

            {/* X Axis Labels */}
            {pointsGreen.map((point, i) => (
              <text
                key={i}
                x={point.x}
                y={height - 5}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="11"
                fontWeight="500"
                fontFamily="var(--font-outfit)"
              >
                {point.label}
              </text>
            ))}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPoint && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute',
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100 - 45}%`,
                transform: 'translate(-50%, -100%)',
                backgroundColor: 'rgba(26, 26, 29, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 14px',
                boxShadow: 'var(--shadow-lg)',
                color: '#FFF',
                zIndex: 40,
                pointerEvents: 'none',
                minWidth: '150px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-mint)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {hoveredPoint.label}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '12px' }}>
                <span style={{ opacity: 0.8 }}>Pendapatan:</span>
                <span style={{ fontWeight: '700', color: 'var(--color-mint)' }}>{hoveredPoint.profit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '12px', marginTop: '2px' }}>
                <span style={{ opacity: 0.8 }}>Operasional:</span>
                <span style={{ fontWeight: '700', color: 'var(--color-dark-red)' }}>{hoveredPoint.expense}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
