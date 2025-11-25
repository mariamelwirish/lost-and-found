import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';
import { LOCATIONS } from '../../data/locations';

export default function PostManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [receiptActionId, setReceiptActionId] = useState(null);
  // status filter is always synced with URL 'kind' param
  const getKindFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const kind = params.get('kind');
    return (kind === 'lost' || kind === 'found') ? kind : '';
  };
  const [filters, setFilters] = useState({
    status: getKindFromUrl(),
    location: '',
    searchQuery: '',
    date: '',
    ordering: '-creationDate'
  });

  // Whenever URL changes, update status filter
  useEffect(() => {
    const kind = getKindFromUrl();
    setFilters(prev => ({ ...prev, status: kind }));
  }, [location.search]);


  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      // Always use the status filter as 'kind' param
      const params = new URLSearchParams();
      if (filters.status) params.append('kind', filters.status);
      if (filters.location) params.append('location', filters.location);
      if (filters.searchQuery) params.append('q', filters.searchQuery);
  if (filters.date) params.append('date', filters.date);
      if (filters.ordering) params.append('ordering', filters.ordering);

      const response = await api.get(`/api/posts/?${params.toString()}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await api.delete(`/api/posts/${postId}/`);
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const toggleReceiptStatus = async (postId, currentlyReceived) => {
    const message = currentlyReceived
      ? 'Revoke the received status for this post?'
      : 'Mark this post as received?';
    if (!confirm(message)) {
      return;
    }
    try {
      setReceiptActionId(postId);
      const endpoint = currentlyReceived ? 'revoke_received' : 'mark_received';
      await api.post(`/api/posts/${postId}/${endpoint}/`);
      await fetchPosts();
    } catch (error) {
      console.error('Failed to update receipt status:', error);
      alert(error?.response?.data?.detail || 'Failed to update receipt status.');
    } finally {
      setReceiptActionId(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectedPosts.length) return;
    // Confirm destructive actions (match single-row delete confirmation)
    if (action === 'delete') {
      if (!confirm('Are you sure you want to delete the selected posts?')) return;
    }

    try {
      await api.post('/api/admin/posts/bulk/', {
        postIds: selectedPosts,
        action
      });
      fetchPosts();
      setSelectedPosts([]);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-posts">
      <h1>Post Management</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search posts..."
          value={filters.searchQuery}
          onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          className="input"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="input"
        >
          <option value="">All Status</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        <select
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          className="input"
        >
          <option value="">All Locations</option>
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          className="input"
          placeholder="Event date"
          title="Filter by lost/found date"
        />

        <select
          value={filters.ordering}
          onChange={(e) => setFilters(prev => ({ ...prev, ordering: e.target.value }))}
          className="input"
        >
          <option value="-creationDate">Newest first</option>
          <option value="creationDate">Oldest first</option>
          <option value="-date">Event date new→old</option>
          <option value="date">Event date old→new</option>
          <option value="title">Title A–Z</option>
          <option value="-title">Title Z–A</option>
        </select>
      </div>

      <div className="bulk-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button
            onClick={() => handleBulkAction('delete')}
            disabled={!selectedPosts.length}
            className="admin-btn danger"
            style={{ opacity: selectedPosts.length ? 1 : 0.6, cursor: selectedPosts.length ? 'pointer' : 'not-allowed' }}
          >
            Delete Selected
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* If no status filter, show both create buttons */}
          {(!filters.status || filters.status === '') && (
            <>
              <button
                onClick={() => navigate('/my-posts/create', { state: { type: 'lost' } })}
                className="admin-btn primary"
              >
                Create Lost
              </button>
              <button
                onClick={() => navigate('/my-posts/create', { state: { type: 'found' } })}
                className="admin-btn ghost"
              >
                Create Found
              </button>
            </>
          )}
          {/* If a status is selected, show only the matching button */}
          {filters.status === 'lost' && (
            <button
              onClick={() => navigate('/my-posts/create', { state: { type: 'lost' } })}
              className="admin-btn primary"
            >
              Create Lost
            </button>
          )}
          {filters.status === 'found' && (
            <button
              onClick={() => navigate('/my-posts/create', { state: { type: 'found' } })}
              className="admin-btn primary"
            >
              Create Found
            </button>
          )}
        </div>
      </div>

      <table className="posts-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                onChange={(e) => {
                  setSelectedPosts(
                    e.target.checked ? posts.map(post => post.id) : []
                  );
                }}
                checked={selectedPosts.length === posts.length}
              />
            </th>
            <th>Title</th>
            <th>Status</th>
            <th>Location</th>
            <th>Date</th>
            <th>Owner</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td>
                <input 
                  type="checkbox"
                  checked={selectedPosts.includes(post.id)}
                  onChange={(e) => {
                    setSelectedPosts(
                      e.target.checked 
                        ? [...selectedPosts, post.id]
                        : selectedPosts.filter(id => id !== post.id)
                    );
                  }}
                />
              </td>
              <td>{post.title}</td>
              <td>
                <span className={`status ${post.status}`}>
                  {post.status}
                </span>
              </td>
              <td>{post.location}</td>
              <td>{new Date(post.date).toLocaleDateString()}</td>
              <td>{post.owner_name || post.owner_username || '—'}</td>
              <td className="col-actions">
                <div className="actions-cell">
                  <button onClick={() => window.open(`/posts/${post.id}`, '_blank')} className="admin-btn sm ghost">View</button>
                  <button onClick={() => navigate(`/my-posts/edit/${post.id}`)} className="admin-btn sm primary">Edit</button>
                  <button
                    onClick={() => toggleReceiptStatus(post.id, post.received_from_poster)}
                    className={`admin-btn sm ${post.received_from_poster ? 'ghost' : 'neutral'}`}
                    disabled={receiptActionId === post.id}
                  >
                    {receiptActionId === post.id
                      ? (post.received_from_poster ? 'Reverting…' : 'Marking…')
                      : (post.received_from_poster ? 'Revoke received' : 'Mark received')}
                  </button>
                  <button onClick={() => deletePost(post.id)} className="admin-btn sm danger">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}