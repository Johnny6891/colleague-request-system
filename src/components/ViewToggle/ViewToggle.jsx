import { useRequests } from '../../context/RequestContext';
import './ViewToggle.css';

export default function ViewToggle() {
    const { viewMode, setViewMode } = useRequests();

    return (
        <div className="view-toggle glass">
            <button
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
            >
                📋 清單
            </button>
            <button
                className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
            >
                📊 看板
            </button>
        </div>
    );
}
