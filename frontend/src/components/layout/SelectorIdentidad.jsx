import { useState, useEffect } from 'react';

export default function SelectorIdentidad({ onSeleccion }) {
    return (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-slate-500 mb-8 text-center text-sm font-medium">¿Quién está entrando?</p>

            <div className="flex w-full gap-4 max-w-xs">
                <button
                    onClick={() => onSeleccion('Yescas')}
                    className="flex flex-col items-center flex-1 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-teal-400 active:scale-95 transition-all">
                    <div className="w-20 h-20 bg-slate-800 text-4xl flex items-center justify-center rounded-full mb-4 shadow-md">
                        🧔🏻‍♂️
                    </div>
                    <span className="font-bold text-slate-700">Yescas</span>
                </button>
                <button
                    onClick={() => onSeleccion('Chispita')}
                    className="flex flex-col items-center flex-1 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-emerald-400 active:scale-95 transition-all">
                    <div className="w-20 h-20 bg-emerald-50 text-4xl flex items-center justify-center rounded-full mb-4 shadow-sm border border-emerald-100">
                        👱🏻‍♀️
                    </div>
                    <span className="font-bold text-emerald-700">Chispita</span>
                </button>
            </div>
        </div>
    );
}