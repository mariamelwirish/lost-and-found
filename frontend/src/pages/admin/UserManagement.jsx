import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';
import { getUser } from '../../utils/session';

export default function UserManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sortBy, setSortBy] = useState('-date_joined');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_active: true,
    is_staff: false,
  });

  useEffect(() => {
    fetchUsers();
  }, [sortBy]);

  // Open modal if ?add=1 is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === '1') {
      setShowAddModal(true);
      // Clean URL after opening
      const clean = new URLSearchParams(location.search);
      clean.delete('add');
      navigate({ search: clean.toString() ? `?${clean.toString()}` : '' }, { replace: true });
    }
  }, [location.search, navigate]);

  const fetchUsers = async () => {
    try {
      // optional loading flag for subsequent refreshes
      setLoading(true);
      const response = await api.get('/api/admin/users/');
      let data = response.data;
      // Client-side sort
      const key = sortBy.replace('-', '');
      const dir = sortBy.startsWith('-') ? -1 : 1;
      data = [...data].sort((a, b) => {
        const va = a[key] ?? '';
        const vb = b[key] ?? '';
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
      // Pin current user at the top regardless of sorting
      const meId = currentUser?.id;
      if (meId) {
        const me = data.find(u => u.id === meId);
        const others = data.filter(u => u.id !== meId);
        data = me ? [me, ...others] : others;
      }
      setUsers(data);
      // Clear selection after refresh to avoid acting on stale ids
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBlock = async (userId, currentStatus) => {
    try {
      await api.patch(`/api/admin/${userId}/toggle-active/`, {
        is_active: !currentStatus
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/${userId}/`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectedUsers.length) return;
    try {
      await api.post('/api/admin/bulk_user_action/', { userIds: selectedUsers, action });
      fetchUsers();
    } catch (error) {
      console.error('Failed bulk action:', error);
      const data = error.response?.data;
      const msg = typeof data === 'string' ? data : JSON.stringify(data);
      alert(msg || 'Failed to perform action. Please try again.');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/create_user/', newUser);
      setShowAddModal(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: ''
      });
      fetchUsers();
      alert('User added successfully!');
    } catch (error) {
      console.error('Failed to add user:', error);
      const data = error.response?.data;
      const msg = typeof data === 'string' ? data : JSON.stringify(data);
      alert(msg || 'Failed to add user. Please try again.');
    }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      username: u.username || '',
      email: u.email || '',
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      phone: u.phone || '',
      is_active: !!u.is_active,
      is_staff: !!u.is_staff,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.patch(`/api/admin/${editingUser.id}/`, editForm);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Failed to update user:', error);
      const data = error.response?.data;
      const msg = typeof data === 'string' ? data : JSON.stringify(data);
      alert(msg || 'Failed to update user. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-users">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
        <h1>User Management</h1>
        <div className="filters" style={{ marginBottom: 0 }}>
          <select className="input" value={sortBy} onChange={(e)=>{setSortBy(e.target.value);}}>
            <option value="-date_joined">Newest</option>
            <option value="date_joined">Oldest</option>
            <option value="username">Username A–Z</option>
            <option value="-username">Username Z–A</option>
            <option value="email">Email A–Z</option>
            <option value="-email">Email Z–A</option>
            <option value="first_name">First name A–Z</option>
            <option value="-first_name">First name Z–A</option>
            <option value="last_login">Last login old→new</option>
            <option value="-last_login">Last login new→old</option>
          </select>
        </div>
      </div>

      {/* Bulk actions and Add User (right) */}
      <div className="bulk-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="admin-btn neutral"
            disabled={!selectedUsers.length}
            onClick={() => handleBulkAction('block')}
          >
            Block Selected
          </button>
          <button
            className="admin-btn danger"
            disabled={!selectedUsers.length}
            onClick={() => handleBulkAction('delete')}
          >
            Delete Selected
          </button>
        </div>
        <div>
          <button onClick={() => setShowAddModal(true)} className="admin-btn primary">Add User</button>
        </div>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>First Name:</label>
                <input
                  type="text"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Last Name:</label>
                <input
                  type="text"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone:</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn"
                  style={{ 
                    background: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 18px',
                    fontSize: '15px',
                    minWidth: '100px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => e.target.style.background = '#475569'}
                  onMouseLeave={e => e.target.style.background = '#64748b'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ 
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 18px',
                    fontSize: '15px',
                    minWidth: '100px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => e.target.style.background = '#15803d'}
                  onMouseLeave={e => e.target.style.background = '#16a34a'}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    const ids = users.filter(u => u.id !== currentUser?.id).map(u => u.id);
                    setSelectedUsers(ids);
                  } else {
                    setSelectedUsers([]);
                  }
                }}
                checked={users.length > 0 && selectedUsers.length === users.filter(u => u.id !== currentUser?.id).length}
              />
            </th>
            <th>Username</th>
            <th>Email</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Staff</th>
            <th>Joined</th>
            <th>Last login</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const isSelf = currentUser?.id === user.id;
            return (
              <tr 
                key={user.id}
                title={isSelf ? "This is you – pinned at top" : undefined}
                style={{ 
                  background: isSelf ? '#f9fafb' : 'transparent'
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    disabled={isSelf}
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(prev => [...new Set([...prev, user.id])]);
                      } else {
                        setSelectedUsers(prev => prev.filter(id => id !== user.id));
                      }
                    }}
                  />
                </td>
                <td>
                  {user.username}
                  {isSelf && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: '#6b7280',
                      background: '#eef2ff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      padding: '2px 8px'
                    }}>You</span>
                  )}
                </td>
                <td>{user.email}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.phone || '—'}</td>
                <td><span className={`status ${user.is_active ? 'active' : 'blocked'}`}>{user.is_active ? 'Active' : 'Blocked'}</span></td>
                <td>{user.is_staff ? 'Yes' : 'No'}</td>
                <td>{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '—'}</td>
                <td>{user.last_login ? new Date(user.last_login).toLocaleString() : '—'}</td>
                <td className="col-actions">
                  <div className="actions-cell">
                    <button className="admin-btn sm primary" onClick={() => openEdit(user)}>Edit</button>
                    <button className="admin-btn sm neutral" onClick={() => toggleUserBlock(user.id, user.is_active)} disabled={isSelf}>{user.is_active ? 'Block' : 'Unblock'}</button>
                    <button className="admin-btn sm danger" onClick={() => deleteUser(user.id)} disabled={isSelf}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 540 }} onClick={(e)=>e.stopPropagation()}>
            <h2>Edit User</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field"><span>Username</span><input value={editForm.username} onChange={(e)=>setEditForm({...editForm, username:e.target.value})} required /></label>
                <label className="field"><span>Email</span><input type="email" value={editForm.email} onChange={(e)=>setEditForm({...editForm, email:e.target.value})} required /></label>
                <label className="field"><span>First name</span><input value={editForm.first_name} onChange={(e)=>setEditForm({...editForm, first_name:e.target.value})} /></label>
                <label className="field"><span>Last name</span><input value={editForm.last_name} onChange={(e)=>setEditForm({...editForm, last_name:e.target.value})} /></label>
                <label className="field" style={{ gridColumn: '1 / -1' }}><span>Phone</span><input value={editForm.phone} onChange={(e)=>setEditForm({...editForm, phone:e.target.value})} /></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={editForm.is_active} onChange={(e)=>setEditForm({...editForm, is_active:e.target.checked})} /><span>Active</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={editForm.is_staff} onChange={(e)=>setEditForm({...editForm, is_staff:e.target.checked})} /><span>Staff</span></label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" className="admin-btn neutral" onClick={()=>setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}