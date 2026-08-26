import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Smartphone,
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SyncDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncDevicesModal: React.FC<SyncDevicesModalProps> = ({ isOpen, onClose }) => {
  const {
    connectedDevices,
    resetToMockData,
  } = useApp();

  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleResetData = () => {
    resetToMockData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedAppUrl(true);
    setTimeout(() => setCopiedAppUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#EFE8E1]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE8E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] flex items-center justify-center text-xs font-semibold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#6D4C41]">
                Dados & Dispositivos
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                Armazenamento local e aparelhos conectados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-[#FAF8F5] flex items-center justify-center text-[#8C8C8C] hover:text-[#2D2D2D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Local Mock Data Mode Banner */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EFE8E1] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-semibold text-[#6D4C41]">
                  Modo Local & Memória do Navegador
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-white text-[#6D4C41] border border-[#EFE8E1] rounded-full text-[10px]">
                Sem chaves de API
              </span>
            </div>
            <p className="text-[#5C5C5C] leading-relaxed text-[11px]">
              O aplicativo funciona com dados demonstrativos completos e salva qualquer novo registro na memória do navegador (localStorage) para navegação fluida e testes sem necessidade de configuração externa.
            </p>
            <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-full bg-white border border-[#EFE8E1] text-[#6D4C41] hover:border-[#C48B71] text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-[#8C8C8C]" />
                <span>Restaurar Dados Demonstrativos</span>
              </button>
              {resetSuccess && (
                <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Dados recarregados!
                </span>
              )}
            </div>
          </div>

          {/* Active Connected Devices Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#8C8C8C]" />
                <span>Aparelhos Conectados ({connectedDevices.length})</span>
              </h4>
              <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ativo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {connectedDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-2.5 rounded-xl bg-white border border-[#EFE8E1] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#6D4C41] flex items-center justify-center border border-[#EFE8E1]">
                      {dev.platform === 'iPhone' || dev.platform === 'Android' ? (
                        <Smartphone className="w-3.5 h-3.5 text-[#6D4C41]" />
                      ) : (
                        <Laptop className="w-3.5 h-3.5 text-[#6D4C41]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#2D2D2D] leading-tight text-xs">
                        {dev.deviceName}
                      </p>
                      <p className="text-[10px] text-[#8C8C8C]">
                        {dev.staffName} {dev.isCurrentDevice ? '• Este Aparelho' : ''}
                      </p>
                    </div>
                  </div>

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Connect Another Phone via Link */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE8E1] space-y-2">
            <h4 className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#8C8C8C]" />
              <span>Conectar Outro Aparelho</span>
            </h4>
            <p className="text-[#8C8C8C] text-[11px]">
              Abra no navegador de outro dispositivo para acessar:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EFE8E1] text-[#5C5C5C] text-xs select-all font-mono"
              />
              <button
                onClick={handleCopyAppUrl}
                className="px-3 py-1.5 bg-[#6D4C41] hover:bg-[#5D4037] text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedAppUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAppUrl ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* PWA Mobile Tips */}
          <div className="p-3.5 rounded-xl bg-white border border-[#EFE8E1] text-[#8C8C8C] space-y-1.5 text-[11px]">
            <h5 className="font-semibold text-[#6D4C41] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C8C8C]" />
              <span>Instalar como Aplicativo (PWA)</span>
            </h5>
            <p className="leading-relaxed">
              No Safari (iOS), clique em Compartilhar e selecione <em>"Adicionar à Tela de Início"</em>. No Chrome (Android), toque no menu e escolha <em>"Instalar Aplicativo"</em>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#EFE8E1] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-[#6D4C41] text-white hover:bg-[#5D4037] text-xs font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

