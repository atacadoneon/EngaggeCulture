"use client";

import { Heart, Star, Calendar, MessageCircle } from "lucide-react";

export default function PaginaCultura() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cultura</h1>
        <p className="text-zinc-400 mt-1">Valores, reconhecimento e rituais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-white font-semibold text-sm">Valores</h3>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <Heart className="h-8 w-8 text-rose-500 mx-auto mb-2" />
          <h3 className="text-white font-semibold text-sm">Reconhecer</h3>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h3 className="text-white font-semibold text-sm">Rituais</h3>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-white font-semibold text-sm">Check-in</h3>
        </div>
      </div>

      {/* Feed de Cultura */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Feed de Cultura</h3>
        <p className="text-zinc-500 text-sm text-center py-8">
          O feed da sua empresa vai aparecer aqui. Comece reconhecendo alguem!
        </p>
      </div>
    </div>
  );
}
