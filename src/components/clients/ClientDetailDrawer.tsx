import React, { useState } from 'react';
import { useApp, calculateDaysAgo } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  formatDaysAgoText,
  getPaymentMethodDetails,
} from '../../utils/formatters';
import {
  X,
  User,
  MessageCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Edit3,
} from 'lucide-react';

interface ClientDetailDrawerProps {
  clientId: string | null;
  onClose: () => void;
  onOpenNewProcedureForClient: (clientId: string) => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  clientId,
  onClose,
  onOpenNewProcedureForClient,
}) => {
  const { clients, procedures, deleteClient, sendWhatsAppMessage, updateClient } = useApp();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!clientId) return null;

  const client = clients.find((c) => c.id === clientId);
  if (!client) return null;

  const clientProcedures = procedures
    .filter((p) => p.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const daysAgo = client.lastProcedureDate ? calculateDaysAgo(client.lastProcedureDate) : 999;

  const handleSaveNotes = () => {
    updateClient(client.id, { notes: editedNotes });
    setIsEditingNotes(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white h-full flex flex-col border-l border-[#EFE8E1] overflow-hidden">
        {/* Top Bar Header */}
        <div className="px-6 py-4 border-b border-[#EFE8E1] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] flex items-center justify-center font-semibold text-sm">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#6D4C41]">
                  {client.name}
                </h3>
                {daysAgo >= 30 && (
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#FAF8F5] text-[#8C8C8C] border border-[#EFE8E1]">
                    +{daysAgo}d
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8C8C8C]">
                {clientProcedures.length} procedimentos • {client.phone || 'Sem telefone'}
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

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] text-center">
              <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider block">
                Total Gasto
              </span>
              <p className="text-sm font-semibold text-[#2D2D2D] mt-0.5">
                {formatCurrency(client.totalSpent || 0)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] text-center">
              <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider block">
                Visitas
              </span>
              <p className="text-sm font-semibold text-[#2D2D2D] mt-0.5">
                {client.totalVisits || clientProcedures.length}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] text-center">
              <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider block">
                Última Visita
              </span>
              <p className="text-xs font-semibold text-[#6D4C41] mt-0.5">
                {formatDaysAgoText(daysAgo)}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenNewProcedureForClient(client.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#6D4C41] text-white hover:bg-[#5D4037] rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Procedimento</span>
            </button>

            <button
              onClick={() => {
                sendWhatsAppMessage(
                  client,
                  `Olá ${client.name.split(' ')[0]}! Tudo bem? Gostaria de saber como está a sua pele e se podemos agendar sua próxima sessão?`
                );
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FAF8F5] border border-[#EFE8E1] hover:bg-[#EFE8E1]/40 text-[#2D2D2D] rounded-full text-xs font-medium transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#6D4C41]" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Client Details / Contact Info */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE8E1] space-y-3">
            <h4 className="text-xs font-semibold text-[#6D4C41]">
              Informações Cadastrais
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">WhatsApp</span>
                <span className="font-medium text-[#2D2D2D]">{client.phone || '-'}</span>
              </div>

              <div>
                <span className="text-[#8C8C8C] block text-[11px]">CPF</span>
                <span className="font-medium text-[#2D2D2D]">{client.cpf || '-'}</span>
              </div>

              <div>
                <span className="text-[#8C8C8C] block text-[11px]">Nascimento</span>
                <span className="font-medium text-[#2D2D2D]">
                  {client.birthDate ? formatDate(client.birthDate) : '-'}
                </span>
              </div>

              <div>
                <span className="text-[#8C8C8C] block text-[11px]">Tipo de Pele</span>
                <span className="font-medium text-[#2D2D2D]">{client.skinType || 'Normal'}</span>
              </div>

              {client.allergies && (
                <div className="col-span-2 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-amber-900 text-xs">
                  <span className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Alergias / Restrições:
                  </span>
                  <p className="mt-0.5">{client.allergies}</p>
                </div>
              )}
            </div>
          </div>

          {/* Anamnese & Notes */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE8E1] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#6D4C41]">
                Observações & Anamnese
              </h4>

              {!isEditingNotes && (
                <button
                  onClick={() => {
                    setEditedNotes(client.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-xs text-[#6D4C41] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1 text-xs text-[#8C8C8C] hover:text-[#2D2D2D] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 text-xs bg-[#6D4C41] text-white rounded-lg cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#5C5C5C] bg-[#FAF8F5] p-3 rounded-lg border border-[#EFE8E1] leading-relaxed">
                {client.notes || 'Nenhuma observação cadastrada.'}
              </p>
            )}
          </div>

          {/* Comprehensive Procedure History */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-[#6D4C41]">
              Histórico de Procedimentos ({clientProcedures.length})
            </h4>

            {clientProcedures.length === 0 ? (
              <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] text-center">
                <p className="text-xs text-[#8C8C8C]">Nenhum procedimento registrado ainda.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientProcedures.map((proc) => {
                  const methodDetails = getPaymentMethodDetails(proc.paymentMethod);
                  return (
                    <div
                      key={proc.id}
                      className="p-3 rounded-xl bg-white border border-[#EFE8E1] space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-[#2D2D2D]">
                            {proc.procedureName}
                          </p>
                          <p className="text-[10px] text-[#8C8C8C] mt-0.5">
                            {formatDate(proc.date)} • {proc.professionalName}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-semibold text-[#2D2D2D]">
                            {formatCurrency(proc.price)}
                          </span>
                          <div>
                            <span className="inline-block text-[10px] text-[#8C8C8C]">
                              {methodDetails.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {proc.notes && (
                        <p className="text-[11px] text-[#5C5C5C] bg-[#FAF8F5] p-2 rounded-lg border border-[#EFE8E1]">
                          {proc.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delete Client Section */}
          <div className="pt-3 border-t border-[#EFE8E1]">
            {showConfirmDelete ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs">
                <span className="text-rose-700 font-medium">
                  Confirmar exclusão?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-2.5 py-1 bg-white border border-[#EFE8E1] rounded-md text-xs cursor-pointer"
                  >
                    Não
                  </button>
                  <button
                    onClick={() => {
                      deleteClient(client.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded-md text-xs cursor-pointer font-medium"
                  >
                    Sim, Excluir
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Cadastro</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

