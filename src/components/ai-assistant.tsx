'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AIAssistant({
  ticketId,
  aiSummary,
  aiSuggestedResponse,
  aiClassification,
}: {
  ticketId: string;
  aiSummary?: string;
  aiSuggestedResponse?: string;
  aiClassification?: any;
}) {
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingSummarize, setLoadingSummarize] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState(aiSuggestedResponse);
  const [summary, setSummary] = useState(aiSummary);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGetSuggestion = async () => {
    setLoadingSuggest(true);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });

      const data = await response.json();
      if (data.suggestedResponse) {
        setSuggestedResponse(data.suggestedResponse);
      }
    } catch (err) {
      console.error('Error getting suggestion:', err);
    } finally {
      setLoadingSuggest(false);
    }
  };

  const handleGetSummary = async () => {
    setLoadingSummarize(true);
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });

      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error getting summary:', err);
    } finally {
      setLoadingSummarize(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Classification Info */}
      {aiClassification && (
        <Card className="border-indigo-500/30 bg-indigo-500/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-indigo-300 text-base flex items-center gap-2">
              ✨ Análisis de IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400 mb-1">Prioridad</p>
                <Badge
                  variant={
                    aiClassification.classification?.priority === 'critical'
                      ? 'danger'
                      : aiClassification.classification?.priority === 'high'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {aiClassification.classification?.priority || 'N/A'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Sentimiento</p>
                <Badge variant="info">
                  {aiClassification.classification?.sentiment || 'N/A'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Nivel de Riesgo</p>
                <Badge
                  variant={
                    aiClassification.riskLevel === 'high' ? 'danger' : 'secondary'
                  }
                >
                  {aiClassification.riskLevel || 'N/A'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Confianza</p>
                <p className="text-sm text-slate-300">
                  {((aiClassification.classification?.confidence || 0) * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {aiClassification.suggestions && aiClassification.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">Sugerencias:</p>
                <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                  {aiClassification.suggestions.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Section */}
      <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Resumen del Ticket</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetSummary}
            isLoading={loadingSummarize}
          >
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {summary ? (
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {summary}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Haz clic en "Actualizar" para generar un resumen con IA
            </p>
          )}
        </CardContent>
      </Card>

      {/* Suggested Response Section */}
      <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Respuesta Sugerida</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetSuggestion}
            isLoading={loadingSuggest}
          >
            Generar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedResponse ? (
            <>
              <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 text-sm text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {suggestedResponse}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => handleCopy(suggestedResponse, 0)}
              >
                {copiedIndex === 0 ? '✓ Copiado' : 'Copiar Respuesta'}
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Haz clic en "Generar" para obtener una respuesta sugerida
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
