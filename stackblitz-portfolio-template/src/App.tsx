import React from 'react'

export default function App() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
                    <span className="text-white text-2xl">✦</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Building your site...</h1>
                <p className="text-slate-400">Please wait while we generate your portfolio.</p>
            </div>
        </div>
    )
}
