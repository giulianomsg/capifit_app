import React from 'react';
import { Edit, Eye, MessageSquare, MoreHorizontal, Target } from 'lucide-react';
import Button from '../../../components/ui/Button';

const statusMap = {
  excellent: { label: 'Excelente', classes: 'bg-emerald-100 text-emerald-800' },
  active: { label: 'Ativo', classes: 'bg-blue-100 text-blue-800' },
  needs_attention: { label: 'Precisa atenção', classes: 'bg-amber-100 text-amber-800' },
};

const ActivePlansTable = ({ plans }) => {
  if (!plans?.length) {
    return (
      <div className="p-8 text-center border border-dashed border-gray-300 rounded-xl">
        <p className="text-sm text-gray-600">Nenhum plano alimentar cadastrado até o momento.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta calórica</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Início</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aderência</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {plans.map((plan) => {
            const status = statusMap[plan.status] ?? statusMap.active;
            return (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {plan.clientName
                        ?.split(' ')
                        ?.map((name) => name[0])
                        ?.join('')
                        ?.substring(0, 2)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{plan.clientName}</div>
                      <div className="text-sm text-gray-500">
                        Atualizado {new Date(plan.updatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{plan.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{plan.caloriesGoal ?? '—'} kcal</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {plan.startDate ? new Date(plan.startDate).toLocaleDateString('pt-BR') : '—'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full ${
                          plan.compliance >= 90
                            ? 'bg-emerald-500'
                            : plan.compliance >= 80
                              ? 'bg-blue-500'
                              : plan.compliance >= 70
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${plan.compliance}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{plan.compliance}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.classes}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm" className="p-2">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ActivePlansTable;
