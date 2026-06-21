export default function WishlistCard({ idea, icono, onDelete }) {
  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col hover:shadow-md transition-all active:scale-[0.98]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-sm shrink-0">
             {icono}
           </div>
           <div>
              <h3 className="text-lg font-black text-slate-800 leading-tight">{idea.title}</h3>
           </div>
        </div>
        <button onClick={() => onDelete(idea.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 -mr-2 -mt-2 active:scale-90" title="Eliminar">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <p className="text-slate-500 text-sm mt-1">{idea.description}</p>
    </div>
  );
}
