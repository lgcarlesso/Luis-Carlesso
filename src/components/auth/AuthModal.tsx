import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, X, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentStaff, staff, setCurrentStaff } = useApp();
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectStaff = (member: any) => {
    setCurrentStaff(member);
    setSuccessMsg(`Conectado como ${member.name}`);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden flex flex-col border border-[#EFE8E1]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE8E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] flex items-center justify-center text-xs font-semibold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#6D4C41]">
                Perfil de Usuário
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                Alternar profissional ativa
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Staff Switcher */}
          <div className="space-y-2">
            <label className="block text-[11px] text-[#8C8C8C]">
              Selecione o profissional:
            </label>
            <div className="space-y-1.5">
              {staff.map((member) => {
                const isActive = currentStaff.id === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelectStaff(member)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FAF8F5] border-[#6D4C41]'
                        : 'bg-white border-[#EFE8E1] hover:border-[#D4C3B8]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] flex items-center justify-center font-medium text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#2D2D2D] leading-tight">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-[#8C8C8C]">{member.role}</p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6D4C41] text-white">
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

