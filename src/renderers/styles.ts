export const styles = `
.vf-figure{margin:0;color:var(--vf-ink,#203d3b);font:14px/1.5 system-ui,sans-serif;min-width:0;overflow-wrap:anywhere}
.vf-figure *{box-sizing:border-box}.vf-figure h2{font-size:19px;line-height:1.35;margin:0 0 5px;font-weight:650;letter-spacing:-.4px}
.vf-subtitle{color:var(--vf-muted,#596762);margin:0 0 20px;font-size:12px}.vf-surface{width:100%;min-width:0}.vf-surface>svg{width:100%;height:auto;display:block;overflow:hidden}
.vf-scroll{max-width:100%;overflow-x:auto;outline-offset:3px}.vf-scroll:focus-visible{outline:2px solid #207466}
.vf-table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap;font-variant-numeric:tabular-nums;text-align:left}
.vf-table th,.vf-table td{position:relative;padding:12px 14px;border-bottom:1px solid #e1e6de;min-width:90px}
.vf-table thead th{font-size:11px;color:#596762;font-weight:600;background:#f5f7f2;white-space:normal;max-width:160px}
.vf-table tbody th{font-weight:500}.vf-table .vf-number{text-align:right}.vf-table tfoot{font-weight:700;border-top:2px solid #9bad9f}
.vf-table [data-focus=false]{color:#596762;background:#fbfcf8}.vf-table [data-focus=true]{box-shadow:inset 3px 0 #b7c9aa}.vf-subtotal{background:#f1f5ef;font-weight:600}.vf-data-bar{position:absolute;bottom:5px;left:0;height:4px;background:#b7d5c7;max-width:100%}
.vf-cell-value{position:relative}.vf-table [data-sign=positive]{color:#206c46}.vf-table [data-sign=negative]{color:#984324}
.vf-annotations{padding:12px 15px;border-left:3px solid #86aa90;background:#f1f5ee;margin:16px 0 12px;font-size:13px}
.vf-annotations p{margin:4px 0}.vf-source{font-size:11px;color:var(--vf-muted,#596762);line-height:1.7;margin:15px 0 0}
.vf-details{margin-top:12px;font-size:11px;color:var(--vf-muted,#596762)}.vf-details summary{cursor:pointer;padding:7px 0;min-height:30px}
.vf-details table{margin-top:10px}.vf-kpi{display:flex;gap:24px;flex-wrap:wrap;align-items:center;padding:8px 0 18px}.vf-kpi strong{display:block;font-size:30px;letter-spacing:-1px}
.vf-kpi small{display:block;font-size:11px;color:#596762}.vf-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:540px){.vf-figure h2{font-size:17px}.vf-subtitle{margin-bottom:12px}.vf-kpi{gap:16px}.vf-kpi strong{font-size:24px}.vf-annotations{font-size:12px}.vf-table th,.vf-table td{padding:10px}}
`;
