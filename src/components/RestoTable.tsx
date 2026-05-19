'use client';

import React from 'react';
import { Coffee, UtensilsCrossed, Search } from 'lucide-react';

interface RestoRow {
  id: string;
  name: string;
  genre: string;
  date: string;
  profit: string;
}

interface RestoTableProps {
  searchQuery?: string;
}

export default function RestoTable({ searchQuery = '' }: RestoTableProps) {
  const [localSearch, setLocalSearch] = React.useState('');
  const [restos, setRestos] = React.useState<RestoRow[]>([]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const { fetchRestoProfits } = await import('@/app/actions');
        const res = await fetchRestoProfits();
        if (res.success && res.data) {
          setRestos(res.data);
        }
      } catch (err) {
        console.error('Failed to load resto profits', err);
      }
    }
    loadData();
  }, []);

  const combinedSearch = (searchQuery || localSearch).toLowerCase();

  // Filter based on search query
  const filteredRestos = restos.filter(
    (r) =>
      r.name.toLowerCase().includes(combinedSearch) ||
      r.genre.toLowerCase().includes(combinedSearch) ||
      r.id.toLowerCase().includes(combinedSearch)
  );

  return (
    <div
      className="animate-fade-in"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-outfit)',
              }}
            >
              Profit dari beberapa Resto
            </h3>
          </div>

          {/* Local Search Input + Sliders Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Cari Sesuatu"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-outfit)',
                }}
              />
            </div>
            
            {/* Filter Circle button */}
            <button 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
                {/* Header Checkbox */}
                <th style={{ padding: '14px 16px', width: '40px' }}>
                  <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-purple)' }} />
                </th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'none', color: 'var(--text-muted)' }}>Resto ID</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'none', color: 'var(--text-muted)' }}>Nama Resto</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'none', color: 'var(--text-muted)' }}>Genre</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'none', color: 'var(--text-muted)' }}>Tanggal</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'none', color: 'var(--text-muted)' }}>Profit</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestos.length > 0 ? (
                filteredRestos.map((resto) => (
                  <tr
                    key={resto.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-layout)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Row Checkbox */}
                    <td style={{ padding: '18px 16px' }}>
                      <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-purple)' }} />
                    </td>

                    {/* Resto ID */}
                    <td style={{ padding: '18px 16px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
                      {resto.id}
                    </td>

                    {/* Resto Name */}
                    <td style={{ padding: '18px 16px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', whiteSpace: 'pre-line' }}>
                      {resto.name}
                    </td>

                    {/* Genre */}
                    <td style={{ padding: '18px 16px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600', fontFamily: 'var(--font-outfit)' }}>
                      {resto.genre}
                    </td>

                    {/* Tanggal */}
                    <td style={{ padding: '18px 16px', fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-outfit)' }}>
                      {resto.date}
                    </td>

                    {/* Profit */}
                    <td style={{ padding: '18px 16px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
                      {resto.profit}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada restoran ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}
