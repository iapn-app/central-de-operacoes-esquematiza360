import React, { useEffect, useState } from 'react';
import { permissionService, ModulePermissions } from '../services/permissionService';

export function DebugPermissoes() {
  const [permissions, setPermissions] = useState<ModulePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    permissionService.getMyPermissions()
      .then(setPermissions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Carregando...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Erro: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug de Permissões</h1>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px' }}>Module Key</th>
            <th style={{ padding: '8px' }}>View</th>
            <th style={{ padding: '8px' }}>Create</th>
            <th style={{ padding: '8px' }}>Edit</th>
            <th style={{ padding: '8px' }}>Delete</th>
            <th style={{ padding: '8px' }}>Export</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(p => (
            <tr key={p.module_key}>
              <td style={{ padding: '8px' }}>{p.module_key}</td>
              <td style={{ padding: '8px' }}>{p.can_view.toString()}</td>
              <td style={{ padding: '8px' }}>{p.can_create.toString()}</td>
              <td style={{ padding: '8px' }}>{p.can_edit.toString()}</td>
              <td style={{ padding: '8px' }}>{p.can_delete.toString()}</td>
              <td style={{ padding: '8px' }}>{p.can_export.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
